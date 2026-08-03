// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// GitHub Pages prefix support: set PUBLIC_BASE_PATH=/<repo> when deploying to project pages.
// For the production custom domain (momoyasystem.com), leave it empty.
const base = process.env.PUBLIC_BASE_PATH || '/';
const site = process.env.PUBLIC_SITE_URL || 'https://momoyasystem.com';

// [[R004 / R007]] DEPLOY_TARGET=vercel のとき @astrojs/vercel adapter を有効化。
// 未指定なら静的ビルド（現状の GitHub Pages 互換）を維持する。
let adapter;
if (process.env.DEPLOY_TARGET === 'vercel') {
  const { default: vercel } = await import('@astrojs/vercel');
  adapter = vercel();
}

export default defineConfig({
  site,
  base,
  trailingSlash: 'never',
  // Astro v5+: 既定で全ページ prerender。/api/contact のみ prerender=false で
  // server route 化（[[R007]]）。GitHub Pages ビルド時は adapter 無しなので
  // 静的のみ生成され api/* はビルドから除外される。
  output: 'static',
  adapter,
  // 旧ページを「私たちについて」に統合したため恒久リダイレクト
  redirects: {
    '/why': '/about',
    '/value': '/about',
  },
  // [[R007]] Vercel プロキシ配下では Astro 既定の Origin チェックが 403 を返す。
  // /api 側で Origin/Referer 許可リスト検証を自前実装している前提で無効化。
  security: { checkOrigin: false },
  vite: { plugins: [tailwindcss()] },
  integrations: [sitemap()],
});
