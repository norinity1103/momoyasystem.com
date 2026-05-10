# Cloudflare Pages デプロイ手順

## 前提
- Cloudflare アカウント（無料プラン可）
- ドメイン `momoyasystem.com` の DNS を Cloudflare に向けている、または管理委託している
- このリポジトリが GitHub に push 済み（先方共有用と兼用なら `norinity1103/momoyasystem.com`）

## 1. プロジェクト作成（GitHub連携方式）

1. Cloudflare Dashboard → **Workers & Pages → Create → Pages → Connect to Git**
2. リポジトリを選択
3. ビルド設定：
   - **Framework preset**: Astro
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: （空欄でOK）
4. 環境変数（**Production** と **Preview** 両方に設定）：

| 変数名 | 値の例 | 用途 |
|--------|--------|------|
| `PUBLIC_SITE_URL` | `https://momoyasystem.com` | OGP・canonical・sitemap |
| `RESEND_API_KEY` | `re_xxx...` | お問い合わせメール送信 |
| `CONTACT_TO` | `info@momoyasystem.com` | 受信先 |
| `CONTACT_FROM` | `noreply@momoyasystem.com` | 送信元（Resend認証済みドメイン） |
| `TURNSTILE_SECRET` | （任意） | スパム対策を有効化したい場合 |

5. **Save and Deploy** で初回ビルド開始
6. 完了後、`https://<project>.pages.dev` で確認

## 2. カスタムドメイン設定

1. Pages プロジェクト → **Custom domains → Set up a custom domain**
2. `momoyasystem.com` と `www.momoyasystem.com` の2つを追加
3. Cloudflare DNS なら自動でCNAME作成。他社管理なら指示通りCNAME設定
4. 数分で TLS 証明書が発行され公開

## 3. Resend 設定（メール送信のため必須）

1. [resend.com](https://resend.com/) で無料アカウント作成
2. **Domains → Add Domain → momoyasystem.com**
3. 表示される **MX/SPF/DKIM/DMARC** レコードを Cloudflare DNS に登録
4. Verify が通れば、`noreply@momoyasystem.com` などから送信可能
5. **API Keys → Create API Key (Sending)** で `re_xxx...` を発行
6. Cloudflare Pages の `RESEND_API_KEY` に設定

## 4. ローカル開発（Pages Functions の動作確認）

```sh
# Wrangler CLI を使って Pages Functions を含めたローカル起動
npm run build
npx wrangler pages dev dist --port 8788

# 別ターミナルで .dev.vars を作成
cp .dev.vars.example .dev.vars
# .dev.vars の値を埋めて再起動
```

`http://localhost:8788/api/contact` にフォーム POST してメール送信を検証。

## 5. 既存サイト（Studio.Design版 momoyasystem.com）からの切替

1. 新サイトが Cloudflare Pages の `<project>.pages.dev` で動作確認OK
2. ステークホルダーに展開してコピー・実績の最終承認を取る
3. **DNS の A/CNAME を Cloudflare Pages に向ける**（事前に旧サイトのバックアップ取得）
4. Studio.Design 側の独自ドメイン設定を解除
5. TLS 証明書発行（自動）→ 公開

## 6. 切替後の確認チェックリスト

- [ ] トップ・各ページが200 OK
- [ ] OGP プレビュー（Twitter Card Validator / LINE プレビュー）
- [ ] お問い合わせフォームから実際にメールが届く
- [ ] GA4 にリアルタイムでヒットが入る
- [ ] sitemap.xml が Search Console で読める
- [ ] 旧URLからの 301 リダイレクト（必要なら `_redirects` ファイル追加）
