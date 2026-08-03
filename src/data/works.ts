// 事例紹介の事例データ（SSOT）。works.astro と トップの抜粋カルーセルで共有。
// 守秘のため社名・所在地は抽象化。固有名の実名掲載は掲載可否の確認後に差替え。
export interface WorkCase {
  no: string;
  img: string;
  title: string;
  tagline: string;
  category: string;
  tags: string[];
}

export const worksIntro =
  "設計補助・施工管理・パートナー編成から、全国のメンテナンスまで。電気設備に関わるあらゆる課題解決を、ひとつの窓口でお任せいただける体制を整えています。";

export const cases: WorkCase[] = [
  {
    no: "001",
    img: "/img/ev-charger-home-1280.webp",
    title: "EV・PHV 用充電設備",
    tagline: "EVの未来に、確かな電源を。",
    category: "EV・PHV 充電",
    tags: ["EVコンセント", "普通充電器", "急速充電器", "戸建・集合住宅", "飲食・公共施設", "都知事視察実績"],
  },
  {
    no: "002",
    img: "/img/scaffold-1920.webp",
    title: "付帯工事（電気以外の建築工事）",
    tagline: "電気の先まで、ワンストップで。",
    category: "付帯工事",
    tags: ["内装", "重量搬入", "足場", "防水", "塗装", "ドローン外壁診断", "解体"],
  },
  {
    no: "003",
    img: "/img/cityscape-1280.webp",
    title: "行政の視察対象となった案件",
    tagline: "公共の目にも、応える品質を。",
    category: "公共・行政",
    tags: ["東京", "中規模", "上流折衝", "工程管理", "品質管理"],
  },
  {
    no: "004",
    img: "/img/ev-charger-installed-1280.webp",
    title: "電気メーカーからの直接受注",
    tagline: "製造を知る者の、実装力。",
    category: "メーカー直",
    tags: ["中〜大規模", "図面作成", "施工管理", "材料調達"],
  },
  {
    no: "005",
    img: "/img/scaffold-960.webp",
    title: "全国チェーン店舗の設備メンテナンス",
    tagline: "止まらない現場を、全国で。",
    category: "メンテナンス",
    tags: ["全国", "多店舗", "漏電・絶縁調査", "設備診断", "是正提案"],
  },
  {
    no: "006",
    img: "/img/ev-charger-installed-1280.webp",
    title: "電気設備工事（設計・施工）",
    tagline: "物件の規模を問わず、一貫施工。",
    category: "電気設備工事",
    tags: ["高圧受変電（キュービクル）", "照明・LED", "産業用太陽光", "空調設備", "電気設備メンテナンス", "EV充電"],
  },
];
