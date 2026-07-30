#!/usr/bin/env node
/**
 * smoke.mjs — ビルド成果物の必須ファイル + HTML 基本タグチェック
 * [[R018]] 準拠 / momoyasystem 文脈
 *
 * dist/ に対して:
 *   1) 必須ページの存在
 *   2) HTML 各ページに lang / title / og:title / canonical があること
 *
 * exit 1 で CI を fail させる。
 */
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

// Vercel adapter は dist/client/ に静的成果物を吐く。素のビルドは dist/ 直下。
async function pickDist() {
  for (const cand of ["dist/client", "dist"]) {
    const p = path.resolve(process.cwd(), cand);
    try {
      const st = await stat(path.join(p, "index.html"));
      if (st.isFile()) return p;
    } catch {}
  }
  return path.resolve(process.cwd(), "dist");
}
const DIST = await pickDist();

const REQUIRED_PAGES = [
  "index.html",
  "about/index.html",
  "service/index.html",
  "service/direction/index.html",
  "service/maintenance/index.html",
  "works/index.html",
  "partners/index.html",
  "group/index.html",
  "company/index.html",
  "contact/index.html",
  "legal/index.html",
  "news/index.html",
  "sitemap-index.xml",
];

const HTML_CHECKS = [
  { name: "<html lang>",        test: (h) => /<html[^>]*\slang=/i.test(h) },
  { name: "<title>",             test: (h) => /<title>[^<]+<\/title>/i.test(h) },
  { name: 'meta property="og:title"', test: (h) => /property=["']og:title["']/i.test(h) },
  { name: 'link rel="canonical"', test: (h) => /rel=["']canonical["']/i.test(h) },
];

const errors = [];

async function exists(p) {
  try { await stat(p); return true; } catch { return false; }
}

for (const rel of REQUIRED_PAGES) {
  const p = path.join(DIST, rel);
  if (!(await exists(p))) {
    errors.push(`MISSING: ${rel}`);
    continue;
  }
  if (!rel.endsWith(".html")) continue;
  const html = await readFile(p, "utf8");
  for (const c of HTML_CHECKS) {
    if (!c.test(html)) errors.push(`${rel}: missing ${c.name}`);
  }
}

if (errors.length === 0) {
  console.log(`✓ smoke — ${REQUIRED_PAGES.length} ページすべて OK`);
  process.exit(0);
}

console.error(`✗ smoke — ${errors.length} 件の問題:\n`);
for (const e of errors) console.error("  " + e);
process.exit(1);
