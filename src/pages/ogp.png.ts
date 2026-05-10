import type { APIRoute } from "astro";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { site } from "../data/site";

async function loadFont(family: string, weight: number) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`,
    { headers: { "User-Agent": "Mozilla/5.0" } },
  ).then((r) => r.text());
  const url = css.match(/url\((https:[^)]+\.(?:woff2|otf|ttf))\)/)?.[1];
  if (!url) throw new Error(`Font not found: ${family} ${weight}`);
  return new Uint8Array(await (await fetch(url)).arrayBuffer());
}

export const GET: APIRoute = async () => {
  const [serif900, sans500] = await Promise.all([
    loadFont("Noto Serif JP", 900),
    loadFont("Noto Sans JP", 500),
  ]);

  const node = {
    type: "div",
    props: {
      style: {
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background:
          "linear-gradient(135deg, #0c2545 0%, #1e5a9f 60%, #154371 100%)",
        color: "#fff",
        fontFamily: "Noto Sans JP",
      },
      children: [
        {
          type: "div",
          props: {
            style: { display: "flex", flexDirection: "column", gap: "12px" },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "20px",
                    letterSpacing: "0.3em",
                    color: "#6c97cc",
                  },
                  children: "MOMOYA SYSTEM",
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    fontFamily: "Noto Serif JP",
                    fontWeight: 900,
                    fontSize: "84px",
                    lineHeight: 1.1,
                    letterSpacing: "0.02em",
                  },
                  children: site.tagline,
                },
              },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              borderTop: "1px solid rgba(255,255,255,.2)",
              paddingTop: "24px",
            },
            children: [
              {
                type: "div",
                props: {
                  style: { fontSize: "26px", color: "#e8ecf1" },
                  children: site.subTagline,
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "20px",
                    color: "#cfdff3",
                    fontWeight: 500,
                  },
                  children: site.name,
                },
              },
            ],
          },
        },
      ],
    },
  };

  const svg = await satori(node as any, {
    width: 1200,
    height: 630,
    fonts: [
      { name: "Noto Serif JP", data: serif900, weight: 900, style: "normal" },
      { name: "Noto Sans JP", data: sans500, weight: 500, style: "normal" },
    ],
  });

  const png = new Resvg(svg).render().asPng();
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
