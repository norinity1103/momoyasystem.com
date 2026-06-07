# Vercel 本番デプロイ手順

> [[R004_デプロイ標準]] / [[R007_Astroフレームワーク活用]] / [[R008_メール送信(Resend)]] 準拠。
> 旧 `docs/deploy-cloudflare-pages.md` は deprecated。

## 構成サマリ

- `astro.config.mjs` — `DEPLOY_TARGET=vercel` のときのみ `@astrojs/vercel` adapter を有効化
- `src/pages/api/contact.ts` — Astro endpoint (`prerender = false`)。Origin/Referer 許可リスト検証 + Honeypot + 任意 Turnstile
- `vercel.json` — `buildCommand: "DEPLOY_TARGET=vercel npm run build"`
- 旧 Cloudflare 構成は `functions.deprecated/` `wrangler.toml.deprecated` として残存（参考用、削除可）

## 切替手順

### 1. Vercel プロジェクト作成

1. Vercel ダッシュボード → New Project → `norinity1103/momoyasystem.com` を import
2. Framework Preset: `Astro`（vercel.json で `framework: astro` 指定済み）
3. Build Command / Output: vercel.json が正、上書きしない

### 2. 環境変数（Production / Preview）

| Key | 例 | 用途 |
|---|---|---|
| `RESEND_API_KEY` | `re_xxx...` | Resend 送信キー |
| `CONTACT_TO` | `info@momoyasystem.com` | 受信先 |
| `CONTACT_FROM` | `noreply@momoyasystem.com` | 送信元（**SPF/DKIM 認証済み**） |
| `TURNSTILE_SECRET` | (任意) | Cloudflare Turnstile を併用する場合 |
| `PUBLIC_SITE_URL` | `https://momoyasystem.com` | OGP / canonical |

### 3. Resend ドメイン認証

Resend → Domains → `momoyasystem.com` を追加し、DNS に SPF/DKIM レコードを反映。
未認証だと受信側で迷惑メール扱いされる。

### 4. ドメイン切替

```bash
# Vercel CLI（任意）
npx vercel domains add momoyasystem.com
```

DNS（現状の登録事業者）で:
- A: `76.76.21.21`
- もしくは Vercel が指示する CNAME 設定

旧 GitHub Pages / 旧 Studio.Design は停止。

### 5. GitHub Actions（任意、自動デプロイ）

Vercel の GitHub 連携で自動デプロイされるため、追加の Actions は不要。
CLI からの明示デプロイが必要な場合は [[R007]] の 3 ステップ方式:

```yaml
- run: npm install -g vercel@latest
- run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
- run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
- run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### 6. 切替後の検証

- [ ] `/api/contact` に curl で空 POST → `Forbidden origin` または `Missing field` が返る
- [ ] 実フォームから送信 → CONTACT_TO で受信、迷惑メール判定されない
- [ ] OGP / canonical / sitemap の URL が本番ドメイン
- [ ] Lighthouse 主要 6 ページで Performance ≥ 90
- [ ] `npm run verify` がローカルで通る
- [ ] 旧 Studio.Design / GitHub Pages を停止し 301 を vercel.json rewrites に追加

## 補足: GitHub Pages を残す場合

`.github/workflows/deploy.yml` は `DEPLOY_TARGET=vercel` 付きで `dist/client` を Pages に上げるよう改修済み。Vercel 稼働後は本ファイルを削除してよい。
