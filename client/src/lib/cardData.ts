import type { TFunction } from "i18next";

export interface CardType {
  id: number;
  name: string;
  psa: string;
  fmv: string;
  price: number;
  rarity: "Common" | "Uncommon" | "Rare" | "Ultra Rare" | "Secret Rare";
  set: string;
  edition: string;
  artist: string;
  description: string;
  attributes: { label: string; value: string }[];
  history: { date: string; owner: string; event: string; price: string }[];
  img: string;
}

type RarityType = CardType["rarity"];
type LocalizedRecord = Record<"zh-CN" | "zh-TW" | "en" | "ja" | "ko", string>;

type CardSeed = Omit<CardType, "name" | "description" | "edition" | "attributes" | "history"> & {
  editionKey: "firstEdition" | "limited";
  rarity: RarityType;
};

const CARD_SEEDS: CardSeed[] = [
  {
    id: 1,
    psa: "PSA 10",
    fmv: "$2,450",
    price: 2450,
    rarity: "Ultra Rare",
    set: "Renaiss Genesis",
    artist: "Kael Stormwind",
    img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663531879544/dPjcx66BtoG3Hds86etH5r/card1_dragon-kW9W2n4kM9cEy5UFkf35kN.webp",
    editionKey: "firstEdition",
  },
  {
    id: 2,
    psa: "PSA 10",
    fmv: "$1,880",
    price: 1880,
    rarity: "Rare",
    set: "Renaiss Genesis",
    artist: "Yuna Ashford",
    img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663531879544/dPjcx66BtoG3Hds86etH5r/card2_warrior-mrf3S3wCLVN9vheXTEa5UB.webp",
    editionKey: "firstEdition",
  },
  {
    id: 3,
    psa: "PSA 9",
    fmv: "$3,200",
    price: 3200,
    rarity: "Secret Rare",
    set: "Renaiss Ascension",
    artist: "Liora Emberveil",
    img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663531879544/dPjcx66BtoG3Hds86etH5r/card3_phoenix-kxpnjKfnASdkZwbVNzi8uw.webp",
    editionKey: "limited",
  },
  {
    id: 4,
    psa: "PSA 10",
    fmv: "$1,650",
    price: 1650,
    rarity: "Rare",
    set: "Renaiss Genesis",
    artist: "Darius Nighthollow",
    img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663531879544/dPjcx66BtoG3Hds86etH5r/card4_mage-HoMEZJV2KL9xh2LkMASn47.webp",
    editionKey: "firstEdition",
  },
  {
    id: 5,
    psa: "PSA 10",
    fmv: "$2,100",
    price: 2100,
    rarity: "Ultra Rare",
    set: "Renaiss Ascension",
    artist: "Fenris Glacierheart",
    img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663531879544/dPjcx66BtoG3Hds86etH5r/card5_beast-kzyNLoH92UQ3sWrcjpRMuB.webp",
    editionKey: "firstEdition",
  },
  {
    id: 6,
    psa: "PSA 10",
    fmv: "$4,500",
    price: 4500,
    rarity: "Secret Rare",
    set: "Renaiss Ascension",
    artist: "Seraphina Dawnweaver",
    img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663531879544/dPjcx66BtoG3Hds86etH5r/card6_spirit-kz6HxkSeFZxbAKXnmsZbvo.webp",
    editionKey: "limited",
  },
];

const CARD_COPY: Record<
  number,
  {
    name: LocalizedRecord;
    description: LocalizedRecord;
    attributes: { labelKey: "element" | "power" | "defense" | "speed"; value: LocalizedRecord | string }[];
    history: { date: string; owner: string; eventKey: "minted" | "traded" | "celebrityHold"; price: string }[];
  }
> = {
  1: {
    name: {
      "zh-CN": "炽焰龙",
      "zh-TW": "熾焰龍",
      en: "Ember Drake",
      ja: "エンバー・ドレイク",
      ko: "엠버 드레이크",
    },
    description: {
      "zh-CN": "一张以高温火焰主题为核心的代表卡牌，画面强调力量感与首发系列的识别度，长期位于收藏者关注列表中。",
      "zh-TW": "一張以高溫火焰主題為核心的代表卡牌，畫面強調力量感與首發系列的辨識度，長期位於收藏者關注名單中。",
      en: "A signature fire-themed card whose artwork emphasizes force and first-set recognition. It remains one of the most closely watched pieces in the collection.",
      ja: "高温の炎を主題にした代表的なカードで、力強い構図と初期シリーズらしい識別性が特徴です。継続的に注目されている一枚です。",
      ko: "고온의 화염 테마를 중심으로 한 대표 카드로, 강한 화면 구성과 초기 세트 특유의 식별성이 돋보입니다. 꾸준히 주목받는 수집 대상입니다.",
    },
    attributes: [
      { labelKey: "element", value: { "zh-CN": "火", "zh-TW": "火", en: "Fire", ja: "火", ko: "불" } },
      { labelKey: "power", value: "9,500" },
      { labelKey: "defense", value: "7,200" },
      { labelKey: "speed", value: "6,800" },
    ],
    history: [
      { date: "2024.03.12", owner: "0x7a3...f9e2", eventKey: "minted", price: "$800" },
      { date: "2024.07.08", owner: "CryptoWhale.eth", eventKey: "traded", price: "$1,200" },
      { date: "2025.01.15", owner: "RickyTCG", eventKey: "celebrityHold", price: "—" },
      { date: "2025.09.22", owner: "0xb4c...12a8", eventKey: "traded", price: "$2,450" },
    ],
  },
  2: {
    name: {
      "zh-CN": "全息武士",
      "zh-TW": "全息武士",
      en: "Holo Samurai",
      ja: "ホロ・サムライ",
      ko: "홀로 사무라이",
    },
    description: {
      "zh-CN": "以未来装甲与传统刀术并置的设计见长，线条克制、辨识度高，是系列中完成度很高的人物卡。",
      "zh-TW": "以未來裝甲與傳統刀術並置的設計見長，線條克制、辨識度高，是系列中完成度很高的人物卡。",
      en: "Known for pairing futuristic armor with classical sword form, this character card is restrained in style and highly recognizable within the set.",
      ja: "未来的な装甲と古典的な剣術表現を並置したデザインが特徴で、抑制されたトーンと高い識別性を備えた人物カードです。",
      ko: "미래형 장갑과 전통 검술 이미지를 함께 배치한 디자인이 특징이며, 절제된 표현과 높은 인지도를 갖춘 캐릭터 카드입니다.",
    },
    attributes: [
      { labelKey: "element", value: { "zh-CN": "钢", "zh-TW": "鋼", en: "Steel", ja: "鋼", ko: "강철" } },
      { labelKey: "power", value: "8,800" },
      { labelKey: "defense", value: "8,500" },
      { labelKey: "speed", value: "9,100" },
    ],
    history: [
      { date: "2024.03.12", owner: "0x91d...c3a7", eventKey: "minted", price: "$600" },
      { date: "2024.11.03", owner: "SamuraiCollector", eventKey: "traded", price: "$1,100" },
      { date: "2025.06.18", owner: "0xf2e...87b1", eventKey: "traded", price: "$1,880" },
    ],
  },
  3: {
    name: {
      "zh-CN": "以太凤凰",
      "zh-TW": "以太鳳凰",
      en: "Aether Phoenix",
      ja: "エーテル・フェニックス",
      ko: "에테르 피닉스",
    },
    description: {
      "zh-CN": "限定系列中的高关注卡，采用高对比羽翼与冷暖色过渡来强化画面层次，是市场检索中经常被收藏者优先查看的品种。",
      "zh-TW": "限定系列中的高關注卡，採用高對比羽翼與冷暖色過渡來強化畫面層次，是市場檢索中經常被收藏者優先查看的品種。",
      en: "A high-attention limited-set card that uses strong feather contrast and warm-cool color transitions to create depth. It is frequently shortlisted by collectors.",
      ja: "限定シリーズの中でも注目度が高く、羽根のコントラストと寒暖色の移行によって画面の奥行きをつくるカードです。コレクターの候補に入りやすい一枚です。",
      ko: "한정 세트에서 특히 주목받는 카드로, 깃털의 강한 대비와 온냉 색 전환으로 깊이를 형성합니다. 수집가들이 우선적으로 살펴보는 편입니다.",
    },
    attributes: [
      { labelKey: "element", value: { "zh-CN": "辉焰", "zh-TW": "輝焰", en: "Radiant Fire", ja: "輝炎", ko: "광휘 화염" } },
      { labelKey: "power", value: "9,900" },
      { labelKey: "defense", value: "6,500" },
      { labelKey: "speed", value: "9,800" },
    ],
    history: [
      { date: "2024.06.01", owner: "0xa1b...d4e5", eventKey: "minted", price: "$1,500" },
      { date: "2024.12.20", owner: "PhoenixRider.eth", eventKey: "traded", price: "$2,400" },
      { date: "2025.08.10", owner: "0xc7f...9a23", eventKey: "traded", price: "$3,200" },
    ],
  },
  4: {
    name: {
      "zh-CN": "奥术档案官",
      "zh-TW": "奧術檔案官",
      en: "Arcane Archivist",
      ja: "アーケイン・アーキビスト",
      ko: "아케인 아키비스트",
    },
    description: {
      "zh-CN": "该卡突出书卷、符文与结构化布局，视觉信息密度高，适合偏好设定型题材的收藏者。",
      "zh-TW": "該卡突出書卷、符文與結構化版面，視覺資訊密度高，適合偏好設定型題材的收藏者。",
      en: "This card focuses on manuscripts, runes, and a structured composition. Its dense visual information appeals to collectors who prefer lore-oriented designs.",
      ja: "書物、ルーン、構造的なレイアウトを前面に出したカードで、設定重視のデザインを好むコレクターに向いています。",
      ko: "문서, 룬, 구조적인 구성을 강조한 카드로, 설정 중심의 디자인을 선호하는 수집가에게 잘 맞습니다.",
    },
    attributes: [
      { labelKey: "element", value: { "zh-CN": "奥术", "zh-TW": "奧術", en: "Arcane", ja: "秘術", ko: "비전" } },
      { labelKey: "power", value: "9,200" },
      { labelKey: "defense", value: "5,800" },
      { labelKey: "speed", value: "7,400" },
    ],
    history: [
      { date: "2024.03.12", owner: "0x3e8...f1c9", eventKey: "minted", price: "$500" },
      { date: "2025.02.28", owner: "MageCollector", eventKey: "traded", price: "$1,200" },
      { date: "2025.10.05", owner: "0x5d2...a8b3", eventKey: "traded", price: "$1,650" },
    ],
  },
  5: {
    name: {
      "zh-CN": "霜脊狼",
      "zh-TW": "霜脊狼",
      en: "Frostcrest Wolf",
      ja: "フロストクレスト・ウルフ",
      ko: "프로스트크레스트 울프",
    },
    description: {
      "zh-CN": "以冷色体积与毛发表现见长，角色轮廓完整，属于在图像展示中非常稳定的一类高完成度生物卡。",
      "zh-TW": "以冷色體積與毛髮表現見長，角色輪廓完整，屬於在圖像展示中非常穩定的一類高完成度生物卡。",
      en: "Distinguished by cool-toned volume and refined fur rendering, this is a well-finished creature card with strong visual consistency in gallery views.",
      ja: "寒色系のボリューム表現と毛並みの描写が印象的で、ギャラリー表示でも安定した完成度を見せるクリーチャーカードです。",
      ko: "차가운 색조의 볼륨감과 털 표현이 돋보이며, 갤러리 화면에서도 완성도가 안정적으로 보이는 크리처 카드입니다.",
    },
    attributes: [
      { labelKey: "element", value: { "zh-CN": "冰", "zh-TW": "冰", en: "Ice", ja: "氷", ko: "얼음" } },
      { labelKey: "power", value: "8,600" },
      { labelKey: "defense", value: "9,000" },
      { labelKey: "speed", value: "8,200" },
    ],
    history: [
      { date: "2024.06.01", owner: "0xd9a...e7f3", eventKey: "minted", price: "$900" },
      { date: "2024.09.14", owner: "IceKingNFT", eventKey: "traded", price: "$1,400" },
      { date: "2025.04.22", owner: "0x8b1...c5d6", eventKey: "traded", price: "$2,100" },
    ],
  },
  6: {
    name: {
      "zh-CN": "星界使者",
      "zh-TW": "星界使者",
      en: "Astral Envoy",
      ja: "アストラル・エンヴォイ",
      ko: "아스트랄 엔보이",
    },
    description: {
      "zh-CN": "该卡以深色背景与高亮星图细节形成对比，整体气质冷静、完成度高，是限定系列中的重点卡之一。",
      "zh-TW": "該卡以深色背景與高亮星圖細節形成對比，整體氣質冷靜、完成度高，是限定系列中的重點卡之一。",
      en: "A limited-set highlight that balances a dark backdrop with precise star-map details. The overall tone is calm, controlled, and highly finished.",
      ja: "暗い背景と精密な星図ディテールの対比が特徴で、落ち着いた空気感と高い完成度を持つ限定シリーズの注目カードです。",
      ko: "어두운 배경과 정교한 성도 디테일의 대비가 특징이며, 차분한 분위기와 높은 완성도를 지닌 한정 세트 핵심 카드입니다.",
    },
    attributes: [
      { labelKey: "element", value: { "zh-CN": "星象", "zh-TW": "星象", en: "Astral", ja: "星象", ko: "성계" } },
      { labelKey: "power", value: "10,000" },
      { labelKey: "defense", value: "8,800" },
      { labelKey: "speed", value: "9,500" },
    ],
    history: [
      { date: "2024.06.01", owner: "0xe4f...b2c1", eventKey: "minted", price: "$2,000" },
      { date: "2025.01.30", owner: "StardustVault.eth", eventKey: "traded", price: "$3,500" },
      { date: "2025.11.12", owner: "0x1a9...d7e4", eventKey: "traded", price: "$4,500" },
    ],
  },
};

function localizeValue(value: LocalizedRecord | string, locale: string) {
  if (typeof value === "string") return value;
  return value[locale as keyof LocalizedRecord] || value.en;
}

export function getLocalizedRarity(rarity: RarityType, t: TFunction) {
  switch (rarity) {
    case "Common":
      return t("cardData.rarity.common");
    case "Uncommon":
      return t("cardData.rarity.uncommon");
    case "Rare":
      return t("cardData.rarity.rare");
    case "Ultra Rare":
      return t("cardData.rarity.ultraRare");
    case "Secret Rare":
      return t("cardData.rarity.secretRare");
    default:
      return rarity;
  }
}

export function getLocalizedCards(t: TFunction, locale: string): CardType[] {
  return CARD_SEEDS.map((seed) => {
    const copy = CARD_COPY[seed.id];
    return {
      ...seed,
      name: localizeValue(copy.name, locale),
      description: localizeValue(copy.description, locale),
      edition: seed.editionKey === "firstEdition" ? t("cardData.edition.firstEdition") : t("cardData.edition.limited"),
      attributes: copy.attributes.map((attr) => ({
        label: t(`cardData.attribute.${attr.labelKey}`),
        value: localizeValue(attr.value, locale),
      })),
      history: copy.history.map((item) => ({
        ...item,
        event:
          item.eventKey === "minted"
            ? t("cardData.event.minted")
            : item.eventKey === "celebrityHold"
              ? t("cardData.event.celebrityHold")
              : t("cardData.event.traded"),
      })),
    };
  });
}

export const RARITY_ORDER: RarityType[] = ["Common", "Uncommon", "Rare", "Ultra Rare", "Secret Rare"];

export function getRarityColor(rarity: string) {
  switch (rarity) {
    case "Common":
      return "text-white/40";
    case "Uncommon":
      return "text-emerald-400/70";
    case "Rare":
      return "text-sky-400/80";
    case "Ultra Rare":
      return "text-amber-400/80";
    case "Secret Rare":
      return "text-fuchsia-400/80";
    default:
      return "text-white/40";
  }
}

export function getRarityBg(rarity: string) {
  switch (rarity) {
    case "Common":
      return "bg-white/[0.04]";
    case "Uncommon":
      return "bg-emerald-400/[0.06]";
    case "Rare":
      return "bg-sky-400/[0.06]";
    case "Ultra Rare":
      return "bg-amber-400/[0.06]";
    case "Secret Rare":
      return "bg-fuchsia-400/[0.06]";
    default:
      return "bg-white/[0.04]";
  }
}

export function getRarityBorder(rarity: string) {
  switch (rarity) {
    case "Common":
      return "border-white/[0.06]";
    case "Uncommon":
      return "border-emerald-400/[0.12]";
    case "Rare":
      return "border-sky-400/[0.12]";
    case "Ultra Rare":
      return "border-amber-400/[0.12]";
    case "Secret Rare":
      return "border-fuchsia-400/[0.12]";
    default:
      return "border-white/[0.06]";
  }
}
