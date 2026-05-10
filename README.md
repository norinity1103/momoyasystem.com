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
