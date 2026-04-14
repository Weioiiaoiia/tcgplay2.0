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

export const CARDS: CardType[] = [
  {
    id: 1,
    name: "Infernal Draco",
    psa: "PSA 10",
    fmv: "$2,450",
    price: 2450,
    rarity: "Ultra Rare",
    set: "Renaiss Genesis",
    edition: "1st Edition",
    artist: "Kael Stormwind",
    description:
      "Forged in the heart of a dying star, Infernal Draco commands the primordial flames that shaped the first age. Legends speak of its roar splitting continents and its gaze turning mountains to ash.",
    attributes: [
      { label: "Element", value: "Fire" },
      { label: "Power", value: "9,500" },
      { label: "Defense", value: "7,200" },
      { label: "Speed", value: "6,800" },
    ],
    history: [
      { date: "2024.03.12", owner: "0x7a3...f9e2", event: "Minted", price: "$800" },
      { date: "2024.07.08", owner: "CryptoWhale.eth", event: "Traded", price: "$1,200" },
      { date: "2025.01.15", owner: "RickyTCG", event: "Celebrity Hold", price: "—" },
      { date: "2025.09.22", owner: "0xb4c...12a8", event: "Traded", price: "$2,450" },
    ],
    img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663531879544/dPjcx66BtoG3Hds86etH5r/card1_dragon-kW9W2n4kM9cEy5UFkf35kN.webp",
  },
  {
    id: 2,
    name: "Holo Samurai",
    psa: "PSA 10",
    fmv: "$1,880",
    price: 1880,
    rarity: "Rare",
    set: "Renaiss Genesis",
    edition: "1st Edition",
    artist: "Yuna Ashford",
    description:
      "A wandering blade master who transcended mortal limits through centuries of solitary training. His holographic armor reflects not light, but the memories of every duel he has won.",
    attributes: [
      { label: "Element", value: "Steel" },
      { label: "Power", value: "8,800" },
      { label: "Defense", value: "8,500" },
      { label: "Speed", value: "9,100" },
    ],
    history: [
      { date: "2024.03.12", owner: "0x91d...c3a7", event: "Minted", price: "$600" },
      { date: "2024.11.03", owner: "SamuraiCollector", event: "Traded", price: "$1,100" },
      { date: "2025.06.18", owner: "0xf2e...87b1", event: "Traded", price: "$1,880" },
    ],
    img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663531879544/dPjcx66BtoG3Hds86etH5r/card2_warrior-mrf3S3wCLVN9vheXTEa5UB.webp",
  },
  {
    id: 3,
    name: "Aethel Phoenix",
    psa: "PSA 9",
    fmv: "$3,200",
    price: 3200,
    rarity: "Secret Rare",
    set: "Renaiss Ascension",
    edition: "Limited",
    artist: "Liora Emberveil",
    description:
      "Born from the convergence of seven celestial fires, Aethel Phoenix is the guardian of rebirth. Each feather contains a fragment of a forgotten universe, and its song can rewrite destiny itself.",
    attributes: [
      { label: "Element", value: "Cosmic Fire" },
      { label: "Power", value: "9,900" },
      { label: "Defense", value: "6,500" },
      { label: "Speed", value: "9,800" },
    ],
    history: [
      { date: "2024.06.01", owner: "0xa1b...d4e5", event: "Minted", price: "$1,500" },
      { date: "2024.12.20", owner: "PhoenixRider.eth", event: "Traded", price: "$2,400" },
      { date: "2025.08.10", owner: "0xc7f...9a23", event: "Traded", price: "$3,200" },
    ],
    img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663531879544/dPjcx66BtoG3Hds86etH5r/card3_phoenix-kxpnjKfnASdkZwbVNzi8uw.webp",
  },
  {
    id: 4,
    name: "Arcane Master",
    psa: "PSA 10",
    fmv: "$1,650",
    price: 1650,
    rarity: "Rare",
    set: "Renaiss Genesis",
    edition: "1st Edition",
    artist: "Darius Nighthollow",
    description:
      "The last surviving scholar of the Obsidian Academy, Arcane Master channels forbidden knowledge through crystallized spell matrices. His grimoire contains equations that can unravel reality.",
    attributes: [
      { label: "Element", value: "Arcane" },
      { label: "Power", value: "9,200" },
      { label: "Defense", value: "5,800" },
      { label: "Speed", value: "7,400" },
    ],
    history: [
      { date: "2024.03.12", owner: "0x3e8...f1c9", event: "Minted", price: "$500" },
      { date: "2025.02.28", owner: "MageCollector", event: "Traded", price: "$1,200" },
      { date: "2025.10.05", owner: "0x5d2...a8b3", event: "Traded", price: "$1,650" },
    ],
    img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663531879544/dPjcx66BtoG3Hds86etH5r/card4_mage-HoMEZJV2KL9xh2LkMASn47.webp",
  },
  {
    id: 5,
    name: "Frostbane Wolf",
    psa: "PSA 10",
    fmv: "$2,100",
    price: 2100,
    rarity: "Ultra Rare",
    set: "Renaiss Ascension",
    edition: "1st Edition",
    artist: "Fenris Glacierheart",
    description:
      "Alpha of the Crystalpeak pack, Frostbane Wolf commands blizzards that can freeze time itself. Its crystalline fur refracts moonlight into devastating beams of pure cold energy.",
    attributes: [
      { label: "Element", value: "Ice" },
      { label: "Power", value: "8,600" },
      { label: "Defense", value: "9,000" },
      { label: "Speed", value: "8,200" },
    ],
    history: [
      { date: "2024.06.01", owner: "0xd9a...e7f3", event: "Minted", price: "$900" },
      { date: "2024.09.14", owner: "IceKingNFT", event: "Traded", price: "$1,400" },
      { date: "2025.04.22", owner: "0x8b1...c5d6", event: "Traded", price: "$2,100" },
    ],
    img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663531879544/dPjcx66BtoG3Hds86etH5r/card5_beast-kzyNLoH92UQ3sWrcjpRMuB.webp",
  },
  {
    id: 6,
    name: "Celestial Goddess",
    psa: "PSA 10",
    fmv: "$4,500",
    price: 4500,
    rarity: "Secret Rare",
    set: "Renaiss Ascension",
    edition: "Limited",
    artist: "Seraphina Dawnweaver",
    description:
      "Queen of the Nebula Throne, the Celestial Goddess weaves constellations into existence with her breath. Her tears become new stars, and her laughter bends the fabric of spacetime.",
    attributes: [
      { label: "Element", value: "Celestial" },
      { label: "Power", value: "10,000" },
      { label: "Defense", value: "8,800" },
      { label: "Speed", value: "9,500" },
    ],
    history: [
      { date: "2024.06.01", owner: "0xe4f...b2c1", event: "Minted", price: "$2,000" },
      { date: "2025.01.30", owner: "StardustVault.eth", event: "Traded", price: "$3,500" },
      { date: "2025.11.12", owner: "0x1a9...d7e4", event: "Traded", price: "$4,500" },
    ],
    img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663531879544/dPjcx66BtoG3Hds86etH5r/card6_spirit-kz6HxkSeFZxbAKXnmsZbvo.webp",
  },
];

export const RARITY_ORDER = ["Common", "Uncommon", "Rare", "Ultra Rare", "Secret Rare"];

export function getRarityColor(rarity: string) {
  switch (rarity) {
    case "Common": return "text-white/40";
    case "Uncommon": return "text-emerald-400/70";
    case "Rare": return "text-sky-400/80";
    case "Ultra Rare": return "text-amber-400/80";
    case "Secret Rare": return "text-fuchsia-400/80";
    default: return "text-white/40";
  }
}

export function getRarityBg(rarity: string) {
  switch (rarity) {
    case "Common": return "bg-white/[0.04]";
    case "Uncommon": return "bg-emerald-400/[0.06]";
    case "Rare": return "bg-sky-400/[0.06]";
    case "Ultra Rare": return "bg-amber-400/[0.06]";
    case "Secret Rare": return "bg-fuchsia-400/[0.06]";
    default: return "bg-white/[0.04]";
  }
}

export function getRarityBorder(rarity: string) {
  switch (rarity) {
    case "Common": return "border-white/[0.06]";
    case "Uncommon": return "border-emerald-400/[0.12]";
    case "Rare": return "border-sky-400/[0.12]";
    case "Ultra Rare": return "border-amber-400/[0.12]";
    case "Secret Rare": return "border-fuchsia-400/[0.12]";
    default: return "border-white/[0.06]";
  }
}
