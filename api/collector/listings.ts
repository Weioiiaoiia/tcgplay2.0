/**
 * Vercel Serverless Function — /api/collector/listings
 *
 * 通过调用 Collector Crypt 官方 JSON 接口 (api.collectorcrypt.com/marketplace)
 * 实时获取市场数据 (无需无头浏览器),并转换为前端期待的
 * CollectorCard 字段格式。
 *
 * 官方接口特点:
 *   - GET https://api.collectorcrypt.com/marketplace?page=N  每页 100 条
 *   - 总量 ~66,000 条,~664 页,包含 Card / Sealed / Merch 等多种 type
 *   - 不支持 limit / category / type / sort 等过滤参数
 *   - 返回字段: filterNFtCard[] + findTotal / total / totalPages
 *
 * 鉴于 Vercel Hobby 计划 Serverless Function 默认 10s 超时,本函数
 * 仅并行拉取前 N (默认 6) 页(约 600 条最新在售),再按 type === "Card"
 * 过滤,返回给前端,满足"100% 真实实时数据"的需求。
 */

interface RawListing {
  id: string;
  itemName: string;
  category: string;
  year: number;
  serial?: string;
  set?: string;
  grade?: string;
  gradeNum?: number;
  gradingCompany?: string;
  gradingID?: string;
  language?: string | null;
  type?: string;
  authenticated?: boolean;
  vault?: string;
  location?: string[];
  frontImage?: string;
  backImage?: string;
  nftAddress?: string;
  insuredValue?: string | number;
  images?: {
    front?: string;
    frontS?: string;
    frontM?: string;
    back?: string;
    backS?: string;
    backM?: string;
  };
  listing?: {
    price?: number;
    currency?: string;
    sellerId?: string;
    createdAt?: string;
    updatedAt?: string;
    marketplace?: string;
  };
  owner?: { name?: string | null; wallet?: string };
}

interface RawResponse {
  findTotal?: number;
  total?: number;
  totalPages?: number;
  filterNFtCard?: RawListing[];
}

interface CollectorCard {
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
  isNew: boolean;
}

// ─── 字段转换 ────────────────────────────────────────────────────────────────
function extractLanguage(input: string): string {
  const src = input.toLowerCase();
  if (src.includes("simplified chinese")) return "Simplified Chinese";
  if (src.includes("japanese")) return "Japanese";
  if (src.includes("english") || src.includes(" en-")) return "English";
  if (src.includes("french")) return "French";
  if (src.includes(" chinese")) return "Chinese";
  return "Unknown";
}

function normalizeCategory(value: string): string {
  const n = value.trim().toLowerCase();
  if (n.includes("basket")) return "Basketball";
  if (n.includes("pokemon")) return "Pokemon";
  if (n === "tcg") return "Tcg";
  return value || "Unknown";
}

function toCollectorCard(raw: RawListing): CollectorCard | null {
  if (!raw?.id || !raw?.itemName) return null;

  const assetUrl = raw.nftAddress
    ? `https://collectorcrypt.com/assets/solana/${raw.nftAddress}`
    : `https://collectorcrypt.com/assets/${raw.id}`;
  let assetPath = "";
  try {
    assetPath = new URL(assetUrl).pathname;
  } catch {
    /* ignore */
  }

  const front =
    raw.images?.front ||
    raw.images?.frontM ||
    raw.images?.frontS ||
    raw.frontImage ||
    "";
  const back =
    raw.images?.back ||
    raw.images?.backM ||
    raw.images?.backS ||
    raw.backImage ||
    "";
  const detailImages = [front, back].filter(Boolean);

  const listing = raw.listing ?? {};
  const listingPrice =
    typeof listing.price === "number" ? listing.price : 0;
  const insured =
    typeof raw.insuredValue === "string"
      ? parseFloat(raw.insuredValue)
      : typeof raw.insuredValue === "number"
        ? raw.insuredValue
        : 0;

  const listedAt = listing.createdAt || listing.updatedAt || new Date().toISOString();
  const updatedAt = listing.updatedAt || listedAt;

  return {
    id: raw.nftAddress || raw.id,
    itemName: raw.itemName,
    category: normalizeCategory(raw.category || ""),
    year: typeof raw.year === "number" ? raw.year : 0,
    cardNumber: raw.serial ? `#${raw.serial.replace(/^#/, "")}` : "",
    setName: raw.set || "Unknown Set",
    grade: raw.grade || "Unspecified",
    gradeNum: typeof raw.gradeNum === "number" ? raw.gradeNum : 0,
    gradingCompany: raw.gradingCompany || "Unknown",
    gradingId: raw.gradingID || "",
    language: raw.language && raw.language !== null
      ? raw.language
      : extractLanguage(`${raw.itemName} ${raw.set ?? ""}`),
    listingPrice,
    listingCurrency: listing.currency || "USDC",
    fmvPriceUSD: isFinite(insured) ? insured : 0,
    listingMarketplace: listing.marketplace || "Collector",
    listedAt,
    updatedAt,
    frontImageUrl: front,
    backImageUrl: back,
    detailImageUrls: detailImages,
    ownerWallet: raw.owner?.wallet || "",
    ownerName: raw.owner?.name || "",
    vault: raw.vault || "Collector",
    authenticated: !!raw.authenticated,
    location: Array.isArray(raw.location) ? raw.location : [],
    assetPath,
    assetUrl,
    source: "collector-live-api",
    isNew: false,
  };
}

// ─── 拉取 ────────────────────────────────────────────────────────────────────
async function fetchPage(page: number): Promise<RawResponse | null> {
  const url = `https://api.collectorcrypt.com/marketplace?page=${page}`;
  try {
    const res = await fetch(url, {
      headers: {
        accept: "application/json, text/plain, */*",
        "user-agent":
          "Mozilla/5.0 (tcgplay2.0 Vercel Serverless; +https://tcgplay20.vercel.app)",
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as RawResponse;
  } catch {
    return null;
  }
}

// 简单的内存缓存(serverless 实例级,无严格 SLA,仅减压)
let cache: { payload: any; ts: number } | null = null;
const CACHE_TTL_MS = 30_000;

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  const wantRefresh =
    (req.method && req.method.toUpperCase() === "POST") ||
    (typeof req.url === "string" && req.url.includes("refresh"));

  if (!wantRefresh && cache && Date.now() - cache.ts < CACHE_TTL_MS) {
    res.setHeader("Cache-Control", "public, max-age=30, s-maxage=30");
    res.status(200).json(cache.payload);
    return;
  }

  // 并行拉取前 N 页,默认 8 页 ≈ 800 条
  const pagesParam = parseInt(
    (req.query?.pages as string) ||
      new URL(req.url ?? "/", "http://x").searchParams.get("pages") ||
      "8",
    10,
  );
  const pages = isFinite(pagesParam)
    ? Math.min(Math.max(pagesParam, 1), 30)
    : 8;

  try {
    const first = await fetchPage(1);
    if (!first) throw new Error("upstream /marketplace?page=1 failed");

    const totalPages = Math.max(first.totalPages ?? 1, 1);
    const toFetch = Math.min(pages, totalPages) - 1;
    const extra =
      toFetch > 0
        ? await Promise.all(
            Array.from({ length: toFetch }, (_, i) => fetchPage(i + 2)),
          )
        : [];

    const all: RawListing[] = [];
    all.push(...(first.filterNFtCard ?? []));
    for (const p of extra) if (p?.filterNFtCard) all.push(...p.filterNFtCard);

    // 只保留"Card"类型,保持与前端语义一致
    const cards = all
      .filter((r) => (r.type || "Card") === "Card" && r.listing?.price)
      .map(toCollectorCard)
      .filter((c): c is CollectorCard => !!c && !!c.frontImageUrl);

    const payload = {
      cards,
      total: first.findTotal ?? cards.length,
      lastUpdated: Date.now(),
      mode: "live" as const,
      source: "api.collectorcrypt.com/marketplace",
      pagesFetched: pages,
      totalPages,
    };

    cache = { payload, ts: Date.now() };

    res.setHeader("Cache-Control", "public, max-age=30, s-maxage=30");
    res.status(200).json(payload);
  } catch (err) {
    res.status(502).json({
      error: "collectorcrypt upstream failed",
      message: (err as Error)?.message,
      cards: [],
      total: 0,
      lastUpdated: Date.now(),
      mode: "live",
    });
  }
}
