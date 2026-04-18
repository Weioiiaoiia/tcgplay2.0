/**
 * Collector Marketplace — Server-side live scraper
 *
 * 使用 Playwright 无头浏览器抓取 collectorcrypt.com/marketplace/cards，
 * 解析所有在售卡牌，缓存 30 秒，通过 /api/collector/listings 提供给前端。
 */
import { chromium } from "playwright-core";

const COLLECTOR_MARKET_URL = "https://collectorcrypt.com/marketplace/cards";
const REFRESH_INTERVAL_MS = 30_000;
const MAX_SCROLL_ROUNDS = 40;
const STABLE_SCROLL_ROUNDS = 2;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export interface CollectorCard {
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

interface CacheEntry {
  cards: CollectorCard[];
  total: number;
  lastUpdated: number;
  mode: "live" | "snapshot";
}

let cache: CacheEntry | null = null;
let refreshPromise: Promise<CacheEntry> | null = null;

// ─── 解析工具 ────────────────────────────────────────────────────────────────

function parseNumericPrice(value: string): number {
  const parsed = parseFloat(value.replace(/,/g, "").replace(/[^0-9.\-]/g, ""));
  return isFinite(parsed) ? parsed : 0;
}

function getGradeNumber(grade: string): number {
  const match = grade.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1] ?? "0") : 0;
}

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

function parseListingText(rawText: string) {
  const cleaned = rawText
    .replace(/\s+/g, " ")
    .replace(/&amp;/g, "&")
    .trim()
    .replace(/^ME\s+LISTED\s+/i, "")
    .replace(/^LISTED\s+/i, "")
    .trim();

  // 提取 PSA 序列号：8-9 位纯数字（在价格 token 之前）
  const psaSerialMatch = cleaned.match(/\b(\d{8,9})\b/);
  const gradingId = psaSerialMatch ? psaSerialMatch[1] : "";

  const tokens = cleaned.split(" ").filter(Boolean);
  const priceToken = tokens.pop() ?? "0";
  const listingPrice = parseNumericPrice(priceToken);

  let category = "Unknown";
  const maybeCategory = tokens[tokens.length - 1] ?? "";
  if (["Pokemon", "Basketball", "Tcg"].includes(maybeCategory)) {
    category = normalizeCategory(tokens.pop() ?? "Unknown");
    if ((tokens[tokens.length - 1] ?? "") === maybeCategory) tokens.pop();
  }

  let year = 0;
  if (/^\d{4}$/.test(tokens[0] ?? "")) {
    year = parseInt(tokens.shift() ?? "0", 10);
  }

  let cardNumber = "";
  if ((tokens[0] ?? "").startsWith("#")) {
    cardNumber = tokens.shift() ?? "";
  }

  const graderIndex = tokens.findIndex((t) =>
    ["PSA", "BGS", "CGC", "SGC"].includes(t.toUpperCase()),
  );

  let itemName = tokens.join(" ").trim() || "Untitled Card";
  let gradingCompany = "Unknown";
  let grade = "Unspecified";
  let setName = "Unknown Set";

  if (graderIndex >= 0) {
    itemName = tokens.slice(0, graderIndex).join(" ").trim() || "Untitled Card";
    gradingCompany = tokens[graderIndex]?.toUpperCase() ?? "Unknown";
    const gradeParts: string[] = [];
    const baseGrade = tokens[graderIndex + 1];
    if (baseGrade) gradeParts.push(baseGrade);
    let tailIndex = graderIndex + 2;
    if (tokens[tailIndex] === "Pristine") {
      gradeParts.push("Pristine");
      tailIndex += 1;
    }
    grade = gradeParts.join(" ").trim() || "Unspecified";
    setName = tokens.slice(tailIndex).join(" ").trim() || "Unknown Set";
  }

  return {
    itemName,
    category,
    year,
    cardNumber,
    setName,
    grade,
    gradeNum: getGradeNumber(grade),
    gradingCompany,
    gradingId,
    language: extractLanguage(`${itemName} ${setName}`),
    listingPrice,
  };
}

function buildCard(
  listing: { href: string; text: string; images: string[]; currency?: string; estValue?: number },
  index: number,
  scrapedAt: number,
): CollectorCard {
  const parsed = parseListingText(listing.text);
  const assetUrl = listing.href.startsWith("http")
    ? listing.href
    : `https://collectorcrypt.com${listing.href}`;
  let assetPath = "";
  try {
    assetPath = new URL(assetUrl).pathname;
  } catch {}
  const images = listing.images.filter(Boolean);
  const listedAt = new Date(scrapedAt - index * 1000).toISOString();

  return {
    id: assetUrl,
    itemName: parsed.itemName,
    category: parsed.category,
    year: parsed.year,
    cardNumber: parsed.cardNumber,
    setName: parsed.setName,
    grade: parsed.grade,
    gradeNum: parsed.gradeNum,
    gradingCompany: parsed.gradingCompany,
    gradingId: parsed.gradingId,
    language: parsed.language,
    listingPrice: parsed.listingPrice,
    listingCurrency: listing.currency ?? "USDC",
    fmvPriceUSD: listing.estValue ?? 0,
    listingMarketplace: "Collector",
    listedAt,
    updatedAt: listedAt,
    frontImageUrl: images[0] ?? "",
    backImageUrl: images[1] ?? "",
    detailImageUrls: images,
    ownerWallet: "",
    ownerName: "",
    vault: "Collector",
    authenticated: true,
    location: [],
    assetPath,
    assetUrl,
    source: "collector-live",
    isNew: false,
  };
}

// ─── 抓取逻辑 ────────────────────────────────────────────────────────────────

async function scrape(): Promise<CacheEntry> {
  console.log("[Collector] Starting live scrape...");
  const browser = await chromium.launch({
    executablePath: "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
  });

  try {
    const page = await browser.newPage({
      userAgent: USER_AGENT,
      viewport: { width: 1440, height: 2200 },
    });

    await page.goto(COLLECTOR_MARKET_URL, {
      waitUntil: "networkidle",
      timeout: 120_000,
    });
    await page.waitForTimeout(4000);

    let stableRounds = 0;
    let previousCount = 0;

    for (let round = 0; round < MAX_SCROLL_ROUNDS; round++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1200);

      const currentCount = await page.evaluate(() => {
        const anchors = Array.from(
          document.querySelectorAll('a[href*="/assets/solana/"]'),
        ) as HTMLAnchorElement[];
        return new Set(anchors.map((a) => a.href)).size;
      });

      if (currentCount === previousCount) {
        stableRounds++;
      } else {
        stableRounds = 0;
        previousCount = currentCount;
      }
      if (stableRounds >= STABLE_SCROLL_ROUNDS) break;
    }

    const scraped = await page.evaluate(() => {
      const anchors = Array.from(
        document.querySelectorAll('a[href*="/assets/solana/"]'),
      ) as HTMLAnchorElement[];

      const unique: { href: string; text: string; images: string[]; currency: string; estValue: number }[] = [];
      const seen = new Set<string>();

      for (const a of anchors) {
        if (!a.href || seen.has(a.href)) continue;
        seen.add(a.href);
        // 识别货币：SOL 的 SVG 有黑色圆形背景 style，USDC 的 SVG 有 fill="#3875C9"
        const insuranceEl = a.querySelector('.card__details__insurance-value__insurance');
        let currency = 'USDC';
        let estValue = 0;
        if (insuranceEl) {
          const svgEl = insuranceEl.querySelector('svg');
          if (svgEl) {
            const svgStyle = svgEl.getAttribute('style') || '';
            const svgHtml = svgEl.innerHTML || '';
            if (svgStyle.includes('background: rgb(0, 0, 0)') || svgHtml.includes('SolonsLogo')) {
              currency = 'SOL';
            } else if (svgHtml.includes('#3875C9')) {
              currency = 'USDC';
            }
          }
          // 抓取 Est. 估值数字（文本中最后一个数字）
          const estText = (insuranceEl as HTMLElement).innerText || '';
          const estMatch = estText.match(/([\d,]+(?:\.\d+)?)/);
          if (estMatch) estValue = parseFloat(estMatch[1].replace(/,/g, ''));
        }
        unique.push({
          href: a.href,
          text: a.innerText.replace(/\s+/g, " ").trim(),
          images: Array.from(a.querySelectorAll("img"))
            .map((img) => (img as HTMLImageElement).currentSrc || (img as HTMLImageElement).src)
            .filter(Boolean),
          currency,
          estValue,
        });
      }

      return {
        totalText:
          document.body.innerText.match(/Total cards:\s*([\d,]+)/i)?.[1] || "",
        cards: unique,
      };
    });

    const scrapedAt = Date.now();
    const cards = scraped.cards
      .map((listing, i) => buildCard(listing, i, scrapedAt))
      .filter((c) => c.id && c.frontImageUrl);

    const totalText = parseInt(scraped.totalText.replace(/,/g, ""), 10);
    const total = isNaN(totalText) ? cards.length : Math.max(cards.length, totalText);

    console.log(`[Collector] Scraped ${cards.length} cards (total reported: ${total})`);

    return { cards, total, lastUpdated: Date.now(), mode: "live" };
  } finally {
    await browser.close();
  }
}

// ─── 缓存管理 ────────────────────────────────────────────────────────────────

export async function getCollectorCards(forceRefresh = false): Promise<CacheEntry> {
  const isFresh =
    cache &&
    Date.now() - cache.lastUpdated < REFRESH_INTERVAL_MS &&
    cache.cards.length > 0;

  if (!forceRefresh && isFresh && cache) return cache;

  if (!refreshPromise) {
    refreshPromise = scrape()
      .then((entry) => {
        // 只有新结果有数据时才更新缓存，防止空结果覆盖有效缓存
        if (entry.cards.length > 0) {
          cache = entry;
        } else if (cache && cache.cards.length > 0) {
          console.log(`[Collector] Scrape returned 0 cards, keeping previous cache of ${cache.cards.length} cards`);
          // 更新时间戳但保留旧数据
          cache = { ...cache, lastUpdated: Date.now() };
        } else {
          cache = entry;
        }
        return cache!;
      })
      .catch((err) => {
        console.error("[Collector] Scrape failed:", err);
        // 失败时保留旧缓存，不清空
        if (cache && cache.cards.length > 0) {
          console.log(`[Collector] Scrape error, keeping previous cache of ${cache.cards.length} cards`);
          return cache;
        }
        const empty: CacheEntry = {
          cards: [],
          total: 0,
          lastUpdated: Date.now(),
          mode: "live",
        };
        cache = empty;
        return empty;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

// 预热：服务器启动后立即开始抓取
export function warmup() {
  getCollectorCards().catch(() => {});
}
