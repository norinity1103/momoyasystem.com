/**
 * POST /api/contact — Astro endpoint (Vercel Edge 想定)
 *
 * R007 / R008 準拠:
 *   - Origin/Referer 許可リスト検証（checkOrigin: false 環境での自前防壁）
 *   - Honeypot (_gotcha) + 任意の Cloudflare Turnstile
 *   - Resend で送信
 *
 * 環境変数（Vercel Project Settings → Environment Variables）:
 *   RESEND_API_KEY    re_xxx... (https://resend.com/api-keys)
 *   CONTACT_TO        受信メール
 *   CONTACT_FROM      送信元（Resend SPF/DKIM 認証済みドメイン）
 *   TURNSTILE_SECRET  任意 / Cloudflare Turnstile を併用する場合
 *   PUBLIC_SITE_URL   本番 URL（Origin チェック用）
 */
import type { APIRoute } from "astro";

export const prerender = false;

const REQUIRED = ["company", "name", "email", "message"] as const;

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}

function allowedOrigins(): string[] {
  const fromEnv = (import.meta.env.PUBLIC_SITE_URL as string | undefined) || "https://momoyasystem.com";
  return [
    fromEnv.replace(/\/$/, ""),
    "https://momoyasystem.com",
    "https://www.momoyasystem.com",
    "http://localhost:4321",
    "http://127.0.0.1:4321",
  ];
}

function isOriginAllowed(req: Request): boolean {
  const allow = allowedOrigins();
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const matches = (url: string | null) => {
    if (!url) return false;
    try {
      const u = new URL(url);
      const base = `${u.protocol}//${u.host}`;
      return allow.includes(base) || /\.vercel\.app$/i.test(u.host);
    } catch {
      return false;
    }
  };
  return matches(origin) || matches(referer);
}

export const POST: APIRoute = async ({ request }) => {
  if (!isOriginAllowed(request)) {
    return new Response("Forbidden origin", { status: 403 });
  }

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

  const data: Record<string, string> = {};
  for (const k of REQUIRED) {
    const v = (form.get(k) || "").toString().trim();
    if (!v) return new Response(`Missing field: ${k}`, { status: 400 });
    data[k] = v;
  }

  for (const k of ["phone", "region", "topic", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    const v = (form.get(k) || "").toString().trim();
    if (v) data[k] = v;
  }

  const env = (globalThis as any).process?.env || {};
  const TURNSTILE_SECRET = env.TURNSTILE_SECRET as string | undefined;
  if (TURNSTILE_SECRET) {
    const token = (form.get("cf-turnstile-response") || "").toString();
    if (!token) return new Response("Turnstile required", { status: 400 });
    const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: TURNSTILE_SECRET, response: token }),
    }).then((r) => r.json() as Promise<{ success: boolean }>);
    if (!verify.success) return new Response("Turnstile failed", { status: 400 });
  }

  const RESEND_API_KEY = env.RESEND_API_KEY as string | undefined;
  const CONTACT_TO = env.CONTACT_TO as string | undefined;
  const CONTACT_FROM = env.CONTACT_FROM as string | undefined;

  // env 未設定でも本体は壊さず内容ログのみ（段階導入対応 / R007）
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
  ];
  const text = lines.join("\n");
  const html = `<pre style="font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:14px;line-height:1.6;white-space:pre-wrap">${escapeHtml(text)}</pre>`;

  if (!RESEND_API_KEY || !CONTACT_TO || !CONTACT_FROM) {
    console.warn("[contact] Resend env not set — logging only");
    console.warn(text);
    return Response.redirect(new URL("/contact/thanks", request.url).toString(), 303);
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: CONTACT_FROM,
      to: [CONTACT_TO],
      reply_to: data.email,
      subject,
      text,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[contact] Resend error", res.status, body);
    return new Response("Mail dispatch failed", { status: 502 });
  }

  return Response.redirect(new URL("/contact/thanks", request.url).toString(), 303);
};

export const GET: APIRoute = () =>
  new Response("Method Not Allowed", { status: 405, headers: { allow: "POST" } });
