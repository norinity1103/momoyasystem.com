#!/usr/bin/env node
/**
 * lint-copy.mjs — NG ワード検出（[[R018]] 準拠 / momoyasystem 文脈）
 *
 * - 旧ポジション逆戻り（「何でも工事」など）
 * - 誇大・断定（業界No1 / 最安 / 必ず削減 など）
 * - マイクロコピー規範違反（抽象動詞・煽り）
 *
 * 文脈で OK なフレーズは ALLOW_PHRASES に列挙。
 * /news の本文や旧訴求を否定的に引用する文脈は IGNORE_PATTERNS で除外。
 *
 * exit 1 で CI を fail させる。
 */
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(process.cwd(), "src");
const TARGET_EXT = new Set([".astro", ".md", ".mdx", ".ts", ".tsx", ".html"]);

const NG = [
  { word: "何でも工事",   reason: "旧訴求（脱却済）。電気工事のディレクションへ" },
  { word: "業界No1",      reason: "根拠提示なき断定" },
  { word: "業界No.1",     reason: "根拠提示なき断定" },
  { word: "業界一",       reason: "根拠提示なき断定" },
  { word: "最安値",       reason: "価格断定。VE提案・コスト抑制レンジで表現する" },
  { word: "最安",         reason: "価格断定" },
  { word: "必ず削減",     reason: "効果保証。'▲5–15% の抑制レンジ' で表現" },
  { word: "100%削減",     reason: "効果保証" },
  { word: "絶対に",       reason: "断定" },
  { word: "今すぐ申込",   reason: "煽り CTA。場面別の行動予告型を使う" },
  { word: "今すぐ問合",   reason: "煽り CTA" },
];

// 文脈で OK の言い回し（NG ワードを含むが許容するフレーズ）
const ALLOW_PHRASES = [
  // 旧訴求を否定的に引用する語り
  "何でも電気工事ができる施工会社",
  // 一般用語としての「施工会社」「施工管理」等は元々NGに含めない
];

// パス前置で完全に除外（NEWS 本文など、過去経緯を語るのは許容）
const IGNORE_PREFIXES = [
  // 例: "src/content/news/internal/",
];

// ファイル内容がコメントブロックや code fence の中にあっても今は素朴に走査する。

async function walk(dir) {
  const out = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (TARGET_EXT.has(path.extname(e.name))) out.push(p);
  }
  return out;
}

function isAllowed(line) {
  return ALLOW_PHRASES.some((phrase) => line.includes(phrase));
}

function rel(p) {
  return path.relative(process.cwd(), p);
}

const files = await walk(ROOT);
const violations = [];

for (const f of files) {
  const r = rel(f);
  if (IGNORE_PREFIXES.some((p) => r.startsWith(p))) continue;
  const text = await readFile(f, "utf8");
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const { word, reason } of NG) {
      if (line.includes(word)) {
        if (isAllowed(line)) continue;
        violations.push({ file: r, line: i + 1, word, reason, excerpt: line.trim().slice(0, 120) });
      }
    }
  }
}

if (violations.length === 0) {
  console.log("✓ lint:copy — NG ワード検出なし");
  process.exit(0);
}

console.error(`✗ lint:copy — ${violations.length} 件の NG ワード検出\n`);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}  "${v.word}"  (${v.reason})`);
  console.error(`    > ${v.excerpt}`);
}
console.error(`\n対処: src/ 内のコピーから NG ワードを除去するか、文脈で OK の場合は scripts/lint-copy.mjs の ALLOW_PHRASES に追加してください。`);
process.exit(1);
