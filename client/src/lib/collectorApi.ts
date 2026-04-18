/**
 * TCGPlay 2.0 — Collector Marketplace client helpers
 *
 * 通过调用服务端 /api/collector/listings 获取实时数据。
 * 服务端使用 Playwright 无头浏览器抓取 collectorcrypt.com，缓存 30 秒。
 */

export interface CollectorCard {
  /** 统一来源标记，用于平台过滤 */
  platform: "collector";
  id: string;
  itemName: string;
  category: string;
  year: number;
  cardNumber: string;
  setName: string;
  grade: string;
  gradeNum: number;
  gradingCompany: string;
  gradingId: string;
  language: string;
  listingPrice: number;
  listingCurrency: string;
  fmvPriceUSD: number;
  listingMarketplace: string;
  listedAt: string;
  updatedAt: string;
  frontImageUrl: string;
  backImageUrl: string;
  detailImageUrls: string[];
  ownerWallet: string;
  ownerName: string;
  vault: string;
  authenticated: boolean;
  location: string[];
  assetPath: string;
  assetUrl: string;
  source: string;
  isNew?: boolean;
}

interface ApiResponse {
  cards: Omit<CollectorCard, "platform">[];
  total: number;
  lastUpdated: number;
  mode: "live" | "snapshot";
}

const COLLECTOR_API_URL = "/api/collector/listings";
const COLLECTOR_MARKET_URL = "https://collectorcrypt.com/marketplace/cards"; // Solana chain, price in SOL
const REFRESH_INTERVAL_MS = 30_000;
const CACHE_KEY = "tcgplay2_collector_cache_v2";
const CACHE_TIME_KEY = "tcgplay2_collector_cache_time_v2";

export interface CollectorFetchResult {
  cards: CollectorCard[];
  lastUpdated: number;
  total: number;
  source: "live" | "snapshot" | "cache";
}

export async function fetchCollectorCards(): Promise<CollectorFetchResult> {
  const res = await fetch(COLLECTOR_API_URL, {
    signal: AbortSignal.timeout(150_000),
  });

  if (!res.ok) {
    throw new Error(`Collector API error: ${res.status}`);
  }

  const data = (await res.json()) as ApiResponse;
  const cards: CollectorCard[] = (data.cards ?? []).map((c) => ({
    ...c,
    platform: "collector" as const,
  }));

  return {
    cards,
    lastUpdated: data.lastUpdated ?? Date.now(),
    total: data.total ?? cards.length,
    source: data.mode === "live" ? "live" : "snapshot",
  };
}

export function getCollectorCardUrl(card: CollectorCard): string {
  return card.assetUrl || COLLECTOR_MARKET_URL;
}

export { COLLECTOR_MARKET_URL, REFRESH_INTERVAL_MS };

// ─── 本地缓存工具 ─────────────────────────────────────────────────────────────

export function saveCollectorCache(cards: CollectorCard[]): void {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(cards));
    window.localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
  } catch {
    // ignore storage errors
  }
}

export function loadCollectorCache(): { cards: CollectorCard[]; time: number } | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    const rawTime = window.localStorage.getItem(CACHE_TIME_KEY);
    if (!raw) return null;
    const cards = JSON.parse(raw) as CollectorCard[];
    if (!Array.isArray(cards) || cards.length === 0) return null;
    return { cards, time: rawTime ? Number(rawTime) : Date.now() };
  } catch {
    return null;
  }
}
