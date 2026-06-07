// Cloudflare Pages Functions エンドポイント
// POST /api/contact
//
// お問い合わせフォームを受け取り、Resend API 経由でメール送信。
// 必要な環境変数（Cloudflare Pages の Settings → Environment variables）:
//   RESEND_API_KEY   ... re_xxx... (https://resend.com/api-keys)
//   CONTACT_TO       ... 受信メールアドレス（例: info@momoyasystem.com）
//   CONTACT_FROM     ... 送信元（例: noreply@momoyasystem.com / Resendで認証済みのドメイン）
//   TURNSTILE_SECRET ... (任意) Cloudflare Turnstile 連携時のシークレット

interface Env {
  RESEND_API_KEY: string;
  CONTACT_TO: string;
  CONTACT_FROM: string;
  TURNSTILE_SECRET?: string;
}

const REQUIRED = ["company", "name", "email", "message"] as const;

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const { request, env } = ctx;
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  // Honeypot
  if ((form.get("_gotcha") || "").toString().trim() !== "") {
    return Response.redirect(new URL("/contact/thanks", request.url).toString(), 303);
  }

  // Required fields
  const data: Record<string, string> = {};
  for (const k of REQUIRED) {
    const v = (form.get(k) || "").toString().trim();
    if (!v) return new Response(`Missing field: ${k}`, { status: 400 });
    data[k] = v;
  }

  // Optional fields
  for (const k of ["phone", "region", "topic", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    const v = (form.get(k) || "").toString().trim();
    if (v) data[k] = v;
  }

  // Cloudflare Turnstile (optional)
  if (env.TURNSTILE_SECRET) {
    const token = (form.get("cf-turnstile-response") || "").toString();
    if (!token) return new Response("Turnstile required", { status: 400 });
    const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token }),
    }).then((r) => r.json() as Promise<{ success: boolean }>);
    if (!verify.success) return new Response("Turnstile failed", { status: 400 });
  }

  // Compose mail
  const subject = `【HP問い合わせ】${data.company} / ${data.name}`;
  const lines = [
    "モモヤシステム コーポレートサイトからお問い合わせがありました。",
    "",
    "------------------------------",
    `会社名: ${data.company}`,
    `お名前: ${data.name}`,
    `Email : ${data.email}`,
    `電話  : ${data.phone || "-"}`,
    `地域  : ${data.region || "-"}`,
    `内容  : ${data.topic || "-"}`,
    "------------------------------",
    "",
    data.message,
    "",
    "------------------------------",
    `UTM source  : ${data.utm_source || "-"}`,
    `UTM medium  : ${data.utm_medium || "-"}`,
    `UTM campaign: ${data.utm_campaign || "-"}`,
    `UTM content : ${data.utm_content || "-"}`,
    `Referer     : ${request.headers.get("referer") || "-"}`,
    `IP          : ${request.headers.get("cf-connecting-ip") || "-"}`,
    `Country     : ${request.headers.get("cf-ipcountry") || "-"}`,
  ];
  const text = lines.join("\n");
  const html = `<pre style="font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:14px;line-height:1.6;white-space:pre-wrap">${escapeHtml(text)}</pre>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM,
      to: [env.CONTACT_TO],
      reply_to: data.email,
      subject,
      text,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("Resend error", res.status, body);
    return new Response("Mail dispatch failed", { status: 502 });
  }

  return Response.redirect(new URL("/contact/thanks", request.url).toString(), 303);
};

export const onRequestGet: PagesFunction<Env> = () =>
  new Response("Method Not Allowed", { status: 405, headers: { allow: "POST" } });
