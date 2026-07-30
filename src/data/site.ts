// サイト内で再利用するラベルの SSOT（表記ゆれ防止・一括変更用）。
// ラベル文言を変えるときは必ずここを変更し、各ページ/コンポーネントは参照する。
const LABELS = {
  partners: "業務パートナー募集",       // グローバルナビ・フッター・partners ページ見出し
  partnersEntry: "業務パートナーエントリー", // 応募フォームの CTA / topic 値
} as const;

export const site = {
  name: "株式会社モモヤシステム",
  shortName: "モモヤシステム",
  tagline: "電気工事の、打ち合わせ屋。",
  subTagline: "現場の言葉で、プロジェクトを最適化する実務番頭。",
  description:
    "20年の電気工事の現場経験を武器に、ゼネコン・設計・メーカーと施工現場の「あいだ」に立ち、図面・打ち合わせ・工程・コストを翻訳・調整する電気工事ディレクション会社。大阪・東京の二拠点で全国対応。",
  url: "https://momoyasystem.com",
  ogImage: "/ogp.png",
  ga4: "G-SZGQZ8DF9S",
  brand: {
    primary: "#1e2d66",  // 公式ロゴのテキスト色（深いネイビー）
    gold:    "#b8964a",  // Mマークのゴールド
  },
  metrics: [
    { num: "20", unit: "年",   label: "電気工事 現場経験" },
    { num: "50", unit: "社+",  label: "全国パートナー網" },
    { num: "▲ 5–15", unit: "%", label: "手戻り損失の抑制レンジ" },
  ],
  nav: [
    { href: "/why",      label: "なぜ「あいだ」か" },
    { href: "/service",  label: "事業内容" },
    { href: "/value",    label: "介在価値" },
    { href: "/works",    label: "実績" },
    { href: "/partners", label: LABELS.partners },
    { href: "/company",  label: "会社概要" },
    { href: "/contact",  label: "お問い合わせ" },
  ],
  labels: LABELS,
  contact: {
    phone: "06-4392-7136",
    email: "info@momoyasystem.com",
    address: {
      hq:    "〒544-0033 大阪府大阪市生野区勝山北1丁目11番39号",
      tokyo: "東京営業所（詳細はお問い合わせください）",
    },
  },
  legal: {
    representative: "百々 彰彦",
    established: "2007年12月",
    corporateNumber: "1120001127993",
    // TODO: 大阪府知事許可証（PDF）から正式番号を転記
    //   形式：大阪府知事許可（般-XX）第XXXXXX号（電気工事業／管工事業 ほか）
    //   反映後にこの TODO コメントを削除してください。
    license: "大阪府知事許可（電気工事業ほか）",
    industrialWasteLicense: "産業廃棄物収集運搬業 許可第02700196866号（大阪府）",
  },
  business: [
    "電気工事・電気通信工事の設計・施工・管理（ディレクション）",
    "図面作成・施工図チェック（CAD対応）",
    "業者選定・パートナーマッチング",
    "電気・照明・通信機材の調達・販売",
    "建物および建物付属設備のメンテナンス",
    "EV/PHV急速充電器の設計・施工・管理",
  ],
} as const;
