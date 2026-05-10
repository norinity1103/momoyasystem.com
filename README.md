# momoyasystem.com

株式会社モモヤシステム コーポレートサイト（リニューアル版）

20期目（2026年〜）の経営方針転換 ―「施工」から「管理・調整・ディレクション」へ ― に合わせ、
営業ツール兼会社案内として再構築されたコーポレートサイトです。

---

## スタック

- **フレームワーク：** Astro 5（静的ビルド）
- **CSS：** Tailwind CSS v4
- **TypeScript：** strict
- **OGP画像：** Satori + @resvg/resvg-js（`/ogp.png` を動的生成）
- **デプロイ：** GitHub Pages（プレビュー用）／ Cloudflare Pages（本番用想定）

## 主要ディレクトリ

```
src/
  data/site.ts         サイト全体の設定（社名・連絡先・ナビ・メトリクス）
  layouts/             共通レイアウト（HTMLヘッド・GA4・OGP・JSON-LD）
  components/          共通UI（Header / Footer / Hero / Section / インフォグラフィック）
  pages/               各ページ（Astro ルーティング）
  styles/global.css    デザイントークン＋Tailwind 拡張
docs/
  A3-infographic-prompt.md   A3一枚版インフォグラフィックの GPT 指示書
public/
  robots.txt           sitemap への参照
.github/workflows/
  deploy.yml           GitHub Pages デプロイ workflow
```

## ローカル起動

```sh
npm install
npm run dev   # http://localhost:4321
npm run build # 静的ビルド (dist/)
```

## ページ一覧（MVP）

| パス      | 役割 |
|-----------|------|
| `/`       | トップ（動画ヒーロー＋3軸サービス＋導線） |
| `/why`    | なぜ「あいだ」が必要か（業界課題3つと答え） |
| `/service`| サービス4領域（ディレクション／業者選定／材料／メンテ） |
| `/value`  | 介在価値の図解（管理不在 vs モモヤ介在 ／ 1億円案件モデル） |
| `/works`  | 実績（EV/PHV、都知事視察、メーカー直） |
| `/company`| 会社概要（プロフィール・スローガン・ビジョン・HD構想） |
| `/contact`| お問い合わせ（フォーム＋直連絡） |
| `/legal`  | 特定商取引法に基づく表記 |

その他：
- `/ogp.png`             OGP画像（動的生成）
- `/sitemap-index.xml`   サイトマップ（Astro自動生成）
- `/robots.txt`          検索エンジン向け

## デプロイ

### GitHub Pages（プレビュー用）

リポジトリ Settings → Pages → Source = "GitHub Actions" を選択。
`main` ブランチへ push すると、`.github/workflows/deploy.yml` が走り、自動公開。

プロジェクトページ（`https://<user>.github.io/<repo>/`）でアクセスする場合は、GitHub Actions のワークフローが
`PUBLIC_SITE_URL` を渡すので、そのまま動作します。

### Cloudflare Pages（本番用）

1. Cloudflare Pages で GitHub リポジトリ連携
2. ビルド設定：
   - Build command: `npm run build`
   - Output directory: `dist`
3. 環境変数：
   - `PUBLIC_SITE_URL = https://momoyasystem.com`
4. カスタムドメイン `momoyasystem.com` を割り当て

## 商談用プレゼンテーションモード

タブレットで商談中に紙の会社案内代わりに使える資料モードを実装済み。

```
https://momoyasystem.com/?present=1
https://momoyasystem.com/value?present=1
```

- ヘッダー・フッター非表示
- 各 `<section>` が1画面ずつスクリーンスナップ
- キーボード操作：← → ↑ ↓ Space PageUp/Down Home End Esc
- スワイプ操作対応
- 上部に進行プログレスバー
- ESC で通常モードに復帰
- GA4 に `present_view` イベントを送出（商談での閲覧を計測可能）

## 計測・分析

- **GA4：** `G-SZGQZ8DF9S`（既存ID踏襲）
- **UTM 自動捕捉：** URLに `utm_source` 等が付いて来訪した場合、sessionStorage に保存し、お問い合わせフォーム送信時に hidden で添付。Score X／メール営業からの流入を CRM 側で紐付け可能。
- **カスタムイベント：**
  - `cta_click` — `data-track="cta_click:label"` 属性を持つ要素のクリック
  - `view_value_page` — `/value` 到達（営業の質指標）
  - `present_view` — プレゼンモード閲覧

## お問い合わせフォーム送信先

**既定：自前の Cloudflare Pages Functions** (`functions/api/contact.ts`)
本サイトを Cloudflare Pages にデプロイすると、`/api/contact` エンドポイントが自動で稼働します。
内部で [Resend](https://resend.com/) API を呼び出してメール送信、`/contact/thanks` にリダイレクト。

### Cloudflare Pages の環境変数（必須）

| 変数名             | 内容 |
|--------------------|------|
| `RESEND_API_KEY`   | Resend の API キー (`re_xxx...`) |
| `CONTACT_TO`       | 受信メールアドレス（例：`info@momoyasystem.com`） |
| `CONTACT_FROM`     | 送信元（Resendで認証済みドメインの任意アドレス、例：`noreply@momoyasystem.com`） |
| `TURNSTILE_SECRET` | （任意）Cloudflare Turnstile を有効にする場合のシークレット |

### Resend のセットアップ

1. [resend.com](https://resend.com/) で無料アカウント作成（100通/日まで無料）
2. **Domains → Add Domain** で `momoyasystem.com` を追加
3. 表示される SPF / DKIM の DNS レコードをドメイン側に登録
4. **API Keys → Create API Key** で Sending 権限のキーを発行
5. Cloudflare Pages の環境変数に上記4つをセットして再デプロイ

### 外部サービス（Formspree 等）に切り替えたい場合

`PUBLIC_FORM_ENDPOINT` 環境変数を上書きすればフォームの POST 先がそのURLに変わります。
例：`PUBLIC_FORM_ENDPOINT=https://formspree.io/f/xxxxxxx`

## ニュース機能（Markdown ベース CMS）

`src/content/news/` に Markdown ファイルを置くだけで `/news/<slug>` にページが生成されます。

### 記事の作成方法

```sh
src/content/news/2026-05-20-example.md
```

```markdown
---
title: お知らせのタイトル
date: 2026-05-20
category: お知らせ   # お知らせ / メディア掲載 / 実績 / リリース
summary: 一覧やSNS共有時に使われる短い説明文。
draft: false         # true にすると公開されない
---

本文を Markdown で記述。

## 見出し

リンクや**太字**などもそのまま使えます。
```

ビルド時に：
- `/news` 一覧に新着順で表示
- `/news/<slug>` で詳細ページが生成
- トップページにも最新3件を自動表示
- `NewsArticle` の構造化データを自動付与

## 構造化データ（JSON-LD）

各ページに以下を埋め込み済み：

- `Organization`（全ページ・社名・住所・代表・設立・電話）
- `BreadcrumbList`（パンくず構造）
- `Service` × 4（`/service` ページの各サービス）
- `FAQPage`（`/why` の3問FAQ）

## 本番投入前のチェック

- [ ] `src/data/site.ts` の住所・電話・東京営業所詳細を確定
- [ ] 大阪府知事建設業許可番号を `legal.license` に正式表記で反映
- [ ] 指定動画（東京の街並み）を `public/` に配置し、`Hero.astro` の擬似グラデを置換
- [ ] 各ページのコピー社内レビュー
- [ ] 既存 GA4 (`G-SZGQZ8DF9S`) のイベント送信確認
- [ ] お問い合わせフォームの送信先設定（Netlify Forms / Formspree / Cloudflare Workers いずれか）
- [ ] OGP画像のSNSプレビュー確認（Twitter Card Validator 等）
- [ ] Lighthouse スコア確認（Performance / SEO / A11y）

## 関連ドキュメント

- `docs/A3-infographic-prompt.md` — 商談用A3一枚物インフォグラフィックの GPT 指示書
- `~/.claude/plans/users-kawanishi-nori-downloads-hp-20-1-merry-sifakis.md` — リニューアル戦略・要件定義
