/**
 * TCGPlay 2.0 — Renaiss marketplace client helpers
 * Design reminder: preserve real product logic while moving the UI into a fog-white,
 * precision-exhibition visual system. Data helpers must stay deterministic and stable.
 */

export interface RenaissCard {
  id: string;
  tokenId: string;
  itemId: string;
  name: string;
  setName: string;
  cardNumber: string;
  pokemonName: string;
  ownerAddress: string;
  askPriceUSDT: number;
  fmvPriceUSD: number;
  frontImageUrl: string;
  grade: string;
  gradingCompany: string;
  year: number;
  serial: string;
  language: string;
  ownerUsername: string;
  category: string;
  premiumRate: number;
  listedAt?: string;
}

interface RawCard {
  id: string;
  tokenId: string;
  itemId: string;
  name: string;
  setName: string;
  cardNumber: string;
  pokemonName?: string;
  characterName?: string;
  ownerAddress: string;
  askPriceInUSDT: string | number;
  fmvPriceInUSD: string | number;
  frontImageUrl: string;
  backImageUrl?: string | null;
  grade: string;
  gradingCompany: string;
  year: number;
  serial?: string;
  language?: string;
  owner?: { username?: string };
  category?: string;
  attributes?: Array<{ trait: string; value: string }>;
  listedAt?: string;
  listDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

const TRPC_BASE = "https://www.renaiss.xyz/api/trpc/collectible.list";
const PAGE_SIZE = 100;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const RENAISS_IMAGE_BASE = "https://www.renaiss.xyz/_next/image";

function parsePrice(raw: string | number | null | undefined): number {
  if (!raw) return 0;
  const str = String(raw);
  if (str.length > 15) {
    return Number(BigInt(str) / BigInt(1e14)) / 10000;
  }
  return parseFloat(str) || 0;
}

function parseCard(raw: RawCard): RenaissCard {
  const askPrice = parsePrice(raw.askPriceInUSDT);
  const fmvPrice = parseFMV(raw.fmvPriceInUSD);

  let serial = raw.serial || "";
  let language = raw.language || "Unknown";

  if (raw.attributes) {
    for (const attribute of raw.attributes) {
      if (attribute.trait === "Serial") serial = attribute.value;
      if (attribute.trait === "Language") language = attribute.value;
    }
  }

  const premiumRate =
    fmvPrice > 0 ? Math.round((((askPrice - fmvPrice) / fmvPrice) * 100) * 10) / 10 : 0;

  return {
    id: raw.id || "",
    tokenId: String(raw.tokenId || ""),
    itemId: raw.itemId || "",
    name: raw.name || "",
    setName: raw.setName || "",
    cardNumber: raw.cardNumber || "",
    pokemonName: raw.pokemonName || raw.characterName || "",
    ownerAddress: raw.ownerAddress || "",
    askPriceUSDT: Math.round(askPrice * 100) / 100,
    fmvPriceUSD: Math.round(fmvPrice * 100) / 100,
    frontImageUrl: raw.frontImageUrl || "",
    grade: raw.grade || "",
    gradingCompany: raw.gradingCompany || "PSA",
    year: raw.year || 0,
    serial,
    language,
    ownerUsername: raw.owner?.username || "",
    category: raw.category || "pokemon",
    premiumRate,
    listedAt: raw.listedAt || raw.listDate || raw.createdAt || raw.updatedAt || "",
  };
}

function findCollection(obj: unknown): RawCard[] | null {
  if (!obj) return null;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      const result = findCollection(item);
      if (result) return result;
    }
    return null;
  }

  if (typeof obj === "object") {
    const record = obj as Record<string, unknown>;
    if ("collection" in record && Array.isArray(record.collection)) {
      return record.collection as RawCard[];
    }

    for (const value of Object.values(record)) {
      const result = findCollection(value);
      if (result) return result;
    }
  }

  return null;
}

async function requestCollection(inputData: Record<string, unknown>): Promise<RawCard[]> {
  const params = new URLSearchParams({
    batch: "1",
    input: JSON.stringify(inputData),
  });

  const response = await fetch(`${TRPC_BASE}?${params.toString()}`, {
    headers: {
      "trpc-accept": "application/jsonl",
      "x-trpc-source": "nextjs-react",
      "User-Agent": USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error(`Renaiss request failed: ${response.status}`);
  }

  const raw = await response.text();
  const lines = raw
    .trim()
    .split("\n")
    .filter((line) => line.trim());

  for (const line of lines) {
    const parsed = JSON.parse(line);
    if (parsed?.json) {
      const collection = findCollection(parsed.json);
      if (collection) return collection;
    }
  }

  return [];
}

async function fetchListedPage(offset: number, limit: number): Promise<RawCard[]> {
  return requestCollection({
    "0": {
      json: {
        limit,
        offset,
        search: null,
        sortBy: "listDate",
        sortOrder: "desc",
        categoryFilter: null,
        listedOnly: true,
        characterFilter: "",
        languageFilter: "",
        gradingCompanyFilter: "",
        gradeFilter: "",
        yearRange: "",
        priceRangeFilter: "",
      },
      meta: {
        values: {
          search: ["undefined"],
          categoryFilter: ["undefined"],
        },
      },
    },
  });
}

export function getRenaissImageUrl(
  originalUrl: string,
  _width: number = 640
): string {
  return originalUrl;
}

export function getHighResImageUrl(originalUrl: string): string {
  return originalUrl;
}

export async function fetchRenaissCards(): Promise<{
  cards: RenaissCard[];
  total: number;
  lastUpdated: number;
}> {
  const allCards: RenaissCard[] = [];
  const seen = new Set<string>();
  let offset = 0;

  while (true) {
    const items = await fetchListedPage(offset, PAGE_SIZE);
    if (!items.length) break;

    for (const item of items) {
      const card = parseCard(item);
      if (card.tokenId && card.askPriceUSDT > 0 && !seen.has(card.tokenId)) {
        seen.add(card.tokenId);
        allCards.push(card);
      }
    }

    if (items.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return {
    cards: allCards,
    total: allCards.length,
    lastUpdated: Date.now(),
  };
}

export async function fetchCardDetail(
  tokenId: string
): Promise<RenaissCard | null> {
  const data = await fetchRenaissCards();
  return data.cards.find((card) => card.tokenId === tokenId) || null;
}

export async function forceRefresh(): Promise<{
  total: number;
  lastUpdated: number;
}> {
  const data = await fetchRenaissCards();
  return {
    total: data.total,
    lastUpdated: data.lastUpdated,
  };
}

export async function fetchStatus(): Promise<{
  total: number;
  lastUpdated: number;
  isFetching: boolean;
}> {
  const data = await fetchRenaissCards();
  return {
    total: data.total,
    lastUpdated: data.lastUpdated,
    isFetching: false,
  };
}

// 稀有度等级映射
export function getGradeLevel(grade: string): string {
  if (grade.includes("10")) return "Gem Mint";
  if (grade.includes("9")) return "Mint";
  if (grade.includes("8")) return "NM-MT";
  if (grade.includes("7")) return "NM";
  return grade;
}

export function getGradeColor(grade: string): string {
  if (grade.includes("10")) return "text-amber-500";
  if (grade.includes("9")) return "text-sky-500";
  if (grade.includes("8")) return "text-emerald-500";
  return "text-zinc-600";
}

export function getGradeBg(grade: string): string {
  if (grade.includes("10")) return "bg-amber-500/10 border-amber-500/20";
  if (grade.includes("9")) return "bg-sky-500/10 border-sky-500/20";
  if (grade.includes("8")) return "bg-emerald-500/10 border-emerald-500/20";
  return "bg-white/60 border-black/8";
}

// Renaiss 官网卡牌 URL（含邀请码）
export function getRenaissCardUrl(_tokenId: string): string {
  return `https://www.renaiss.xyz/ref/77ouo`;
}

// PSA 官网 URL
export function getPSAUrl(serial: string): string {
  const certNum = serial.replace("PSA", "");
  return `https://www.psacard.com/cert/${certNum}`;
}

// ============================================================
// Legacy CardData type — used by WalletContext & collection components
// ============================================================

export interface CardData {
  id: string;
  tokenId: string;
  name: string;
  ownerAddress: string;
  fmvPriceInUSD: string;
  frontImageUrl: string;
  backImageUrl: string | null;
  serial: string;
  grade: string;
  year: number;
  setName: string;
  cardNumber: string;
  pokemonName: string;
  language: string;
  gradingCompany: string;
  vaultLocation: string;
  askPriceInUSDT: string;
  type: string;
}

// Parse FMV — API returns value in cents, divide by 100 to get USD
export function parseFMV(raw: string | number | null | undefined): number {
  if (!raw) return 0;
  const num = parseFloat(String(raw));
  if (!Number.isFinite(num) || num <= 0) return 0;
  return num > 1000 ? num / 100 : num;
}

// Extract numeric grade from grade string
export function getGradeNumber(grade: string): number {
  const match = grade.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

// Renaiss card URL (legacy alias)
export function getRenaissUrl(tokenId: string): string {
  return getRenaissCardUrl(tokenId);
}
