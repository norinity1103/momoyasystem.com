#!/usr/bin/env node
/**
 * optimize-images.mjs — public/img/*.{jpg,jpeg,png} を WebP 化（[[R003]] 準拠）
 *
 * - 非破壊（隣に .webp を生成、原本は保持）
 * - 長辺上限なし（既に 1280/1920 系で整っているため）
 * - 既に同名 .webp が存在し、原本より新しければスキップ
 * - public/img/legacy/ と public/img/hero/ はスキップ（前者は既に webp、後者は未使用 procedural）
 *
 * Usage:
 *   node scripts/optimize-images.mjs                # 非破壊（生成のみ）
 *   node scripts/optimize-images.mjs --delete-originals   # 生成後、原本削除（要明示）
 */
import { readdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(process.cwd(), "public/img");
const SKIP_DIRS = new Set(["legacy", "hero"]);
const TARGET_EXT = new Set([".jpg", ".jpeg", ".png"]);
const QUALITY = 82;
const DELETE = process.argv.includes("--delete-originals");

async function walk(dir) {
  const out = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      out.push(...(await walk(path.join(dir, e.name))));
    } else if (TARGET_EXT.has(path.extname(e.name).toLowerCase())) {
      out.push(path.join(dir, e.name));
    }
  }
  return out;
}

function fmt(n) { return (n / 1024).toFixed(1) + "KB"; }

const files = await walk(ROOT);
let totalBefore = 0, totalAfter = 0, converted = 0, skipped = 0;

for (const src of files) {
  const dst = src.replace(/\.(jpe?g|png)$/i, ".webp");
  const srcStat = await stat(src);
  let dstStat;
  try { dstStat = await stat(dst); } catch { dstStat = null; }

  if (dstStat && dstStat.mtimeMs >= srcStat.mtimeMs) {
    skipped++;
    totalBefore += srcStat.size;
    totalAfter += dstStat.size;
    continue;
  }

  await sharp(src).webp({ quality: QUALITY }).toFile(dst);
  const newStat = await stat(dst);
  converted++;
  totalBefore += srcStat.size;
  totalAfter += newStat.size;
  console.log(`✓ ${path.relative(process.cwd(), src)}  ${fmt(srcStat.size)} → ${fmt(newStat.size)}  (-${Math.round((1 - newStat.size / srcStat.size) * 100)}%)`);

  if (DELETE) {
    await unlink(src);
    console.log(`  removed original: ${path.relative(process.cwd(), src)}`);
  }
}

const pct = totalBefore ? Math.round((1 - totalAfter / totalBefore) * 100) : 0;
console.log(`\n${converted} converted, ${skipped} up-to-date. Total: ${fmt(totalBefore)} → ${fmt(totalAfter)} (-${pct}%)`);
if (!DELETE) console.log(`Originals preserved. Re-run with --delete-originals once references are switched.`);
