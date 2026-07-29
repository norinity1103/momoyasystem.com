import type { APIRoute } from "astro";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { site } from "../data/site";

// satori は ArrayBuffer / Buffer を受け取るため、Uint8Array に包まず素の ArrayBuffer を返す
async function loadFont(family: string, weight: number): Promise<ArrayBuffer | null> {
  try {
    // Modern Chrome UA forces woff2 hosts on fonts.gstatic.com
    const ua =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";
    const res = await fetch(
      `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`,
      { headers: { "User-Agent": ua } },
    );
    if (!res.ok) return null;
    const css = await res.text();
    const url = css.match(/url\((https:[^)\s]+?\.(?:woff2|otf|ttf))\)/)?.[1];
    if (!url) return null;
    return await (await fetch(url)).arrayBuffer();
  } catch (e) {
    console.warn(`OGP loadFont failed for ${family} ${weight}:`, e);
    return null;
  }
}

// Minimal placeholder PNG (1x1, brand color) when font/render fails — keeps the build succeeding.
const PLACEHOLDER_PNG = Uint8Array.from(
  atob(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII=",
  ),
  (c) => c.charCodeAt(0),
);

export const GET: APIRoute = async () => {
  const [serif900, sans500] = await Promise.all([
    loadFont("Noto Serif JP", 900),
    loadFont("Noto Sans JP", 500),
  ]);

  if (!serif900 || !sans500) {
    console.warn("OGP: font fetch failed, returning placeholder PNG");
    return new Response(PLACEHOLDER_PNG, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=300",
      },
    });
  }

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
          "linear-gradient(135deg, #060c24 0%, #1e2d66 60%, #131e47 100%)",
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
                    color: "#d9c188",
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
                    color: "#cdd2e6",
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

  try {
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
  } catch (e) {
    console.warn("OGP: render failed, returning placeholder PNG:", e);
    return new Response(PLACEHOLDER_PNG, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=300",
      },
    });
  }
};
