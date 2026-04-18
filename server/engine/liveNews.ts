import { createHash } from "crypto";
import { ensureSafeFeedUrl, sanitizeOutboundUrl } from "./linkSafety";

type InsightSection = "tcg" | "web3" | "collector";
type InsightCategory = "official" | "community" | "tournament" | "cross_lang" | "alert";
type SourceCategory = "official" | "community" | "tournament";
type InsightGame = "pokemon" | "onepiece" | "yugioh" | "general";
type SourceType = "rss" | "html";
type HtmlParser = "onepiece_news" | "yugioh_news";

export interface LiveInsightItem {
  id: number;
  insightId: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  originalTitle: string;
  scrapeMethod: string;
  section: InsightSection;
  category: InsightCategory;
  game: InsightGame;
  disclaimer: string;
  isNew: number;
  publishedAt: Date | null;
  fetchedAt: Date;
  createdAt: Date;
}

interface FeedSource {
  name: string;
  url: string;
  sourceType?: SourceType;
  parser?: HtmlParser;
  section: InsightSection;
  category: SourceCategory;
  game: InsightGame;
  maxItems?: number;
  includeKeywords?: string[];
  excludeKeywords?: string[];
}

interface ParsedSourceItem {
  title: string;
  link: string;
  summary: string;
  pubDate: string;
  category?: SourceCategory;
  game?: InsightGame;
}

const DATE_REGEX = /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}/i;

const TCG_KEYWORDS = [
  "pokemon",
  "pokémon",
  "pikachu",
  "scarlet & violet",
  "yu-gi-oh",
  "yugioh",
  "duelist",
  "one piece",
  "opcg",
  "lorcana",
  "magic the gathering",
  "mtg",
  "tcg",
  "trading card",
  "card game",
  "booster",
  "deck",
  "tournament",
  "regionals",
  "championship",
];

const POKEMON_KEYWORDS = [
  "pokemon",
  "pokémon",
  "pikachu",
  "charizard",
  "scarlet & violet",
  "trainer trials",
  "tcg live",
  "ex",
  "booster pack",
];

const ONEPIECE_KEYWORDS = [
  "one piece",
  "opcg",
  "straw hat",
  "pirates party",
  "treasure cup",
  "bandai card",
  "don!!",
  "op-",
  "eb04",
];

const YUGIOH_KEYWORDS = [
  "yu-gi-oh",
  "yugioh",
  "duel",
  "duelist",
  "ycs",
  "regional qualifier",
  "forbidden",
  "limited list",
  "core booster",
  "speed duel",
];

const TOURNAMENT_KEYWORDS = [
  "championship",
  "regional",
  "regionals",
  "treasure cup",
  "pirates party",
  "qualifier",
  "ycs",
  "world championship",
  "dragon duel",
  "store championship",
  "event",
  "tournament",
];

const OFFICIAL_UPDATE_KEYWORDS = [
  "updated",
  "announcement",
  "notice",
  "release",
  "launch",
  "product",
  "booster",
  "deck",
  "rules",
  "rulebook",
  "banned",
  "restricted",
  "forbidden",
  "limited",
  "patch notes",
  "maintenance",
  "version",
];

const TABLETOP_EXCLUDE_KEYWORDS = [
  "board game",
  "boardgame",
  "dungeons & dragons",
  "dnd",
  "warhammer",
  "rpg",
  "roleplaying",
  "miniatures",
  "tabletop rpg",
];

const PUBLIC_FEEDS: FeedSource[] = [
  {
    name: "CoinDesk",
    url: "https://www.coindesk.com/arc/outboundfeeds/rss/",
    section: "web3",
    category: "official",
    game: "general",
    maxItems: 12,
  },
  {
    name: "Cointelegraph",
    url: "https://cointelegraph.com/rss",
    section: "web3",
    category: "official",
    game: "general",
    maxItems: 12,
  },
  {
    name: "Decrypt",
    url: "https://decrypt.co/feed",
    section: "web3",
    category: "official",
    game: "general",
    maxItems: 12,
  },
  {
    name: "Web3 Is Going Great",
    url: "https://web3isgoinggreat.com/feed.xml",
    section: "web3",
    category: "community",
    game: "general",
    maxItems: 10,
  },
  {
    name: "Blockworks",
    url: "https://blockworks.co/feed",
    section: "web3",
    category: "official",
    game: "general",
    maxItems: 12,
  },
  {
    name: "Bitcoin Magazine",
    url: "https://bitcoinmagazine.com/.rss/full/",
    section: "web3",
    category: "community",
    game: "general",
    maxItems: 10,
  },
  {
    name: "The Block",
    url: "https://www.theblock.co/rss.xml",
    section: "web3",
    category: "official",
    game: "general",
    maxItems: 12,
  },
  {
    name: "CoinJournal",
    url: "https://coinjournal.net/news/feed/",
    section: "web3",
    category: "community",
    game: "general",
    maxItems: 10,
  },
  {
    name: "CryptoSlate",
    url: "https://cryptoslate.com/feed/",
    section: "web3",
    category: "official",
    game: "general",
    maxItems: 12,
  },
  {
    name: "The Defiant",
    url: "https://thedefiant.io/feed",
    section: "web3",
    category: "community",
    game: "general",
    maxItems: 10,
  },
  {
    name: "Pokémon Forums",
    url: "https://community.pokemon.com/en-us/categories/tcg-live-news-announcements/feed.rss",
    section: "tcg",
    category: "official",
    game: "pokemon",
    maxItems: 12,
  },
  {
    name: "Pokemon Blog",
    url: "https://pokemonblog.com/feed/",
    section: "tcg",
    category: "community",
    game: "pokemon",
    maxItems: 12,
  },
  {
    name: "ONE PIECE CARD GAME Official",
    url: "https://en.onepiece-cardgame.com/news/",
    sourceType: "html",
    parser: "onepiece_news",
    section: "tcg",
    category: "official",
    game: "onepiece",
    maxItems: 12,
  },
  {
    name: "Yu-Gi-Oh! Official",
    url: "https://www.yugioh-card.com/en/news/",
    sourceType: "html",
    parser: "yugioh_news",
    section: "tcg",
    category: "official",
    game: "yugioh",
    maxItems: 10,
  },
  {
    name: "YGOrganization",
    url: "https://ygorganization.com/feed/",
    section: "tcg",
    category: "community",
    game: "yugioh",
    maxItems: 12,
  },
  {
    name: "Pojo",
    url: "https://www.pojo.com/feed/",
    section: "tcg",
    category: "community",
    game: "general",
    maxItems: 10,
    includeKeywords: TCG_KEYWORDS,
  },
  {
    name: "CardGamer",
    url: "https://cardgamer.com/feed",
    section: "tcg",
    category: "community",
    game: "general",
    maxItems: 10,
    includeKeywords: TCG_KEYWORDS,
  },
  {
    name: "Dicebreaker Cards",
    url: "https://www.dicebreaker.com/feed",
    section: "tcg",
    category: "community",
    game: "general",
    maxItems: 8,
    includeKeywords: TCG_KEYWORDS,
    excludeKeywords: TABLETOP_EXCLUDE_KEYWORDS,
  },
];

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function decodeXml(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

function stripHtml(text: string): string {
  return decodeXml(text)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveUrl(href: string, baseUrl: string): string {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return href;
  }
}

function getBlockTag(block: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = block.match(regex);
  return match ? match[1].trim() : "";
}

function collectBlocks(xml: string, tag: "item" | "entry"): string[] {
  const regex = new RegExp(`<${tag}\\b[\\s\\S]*?<\\/${tag}>`, "gi");
  const blocks: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(xml)) !== null) {
    blocks.push(match[0]);
  }

  return blocks;
}

function parseFeed(xml: string): ParsedSourceItem[] {
  const normalized = decodeXml(xml);
  const entries = collectBlocks(normalized, "item");
  const atomEntries = collectBlocks(normalized, "entry");
  const blocks = entries.length > 0 ? entries : atomEntries;

  return blocks.map((block) => {
    const title = stripHtml(getBlockTag(block, "title"));
    const summary = stripHtml(
      getBlockTag(block, "description") ||
        getBlockTag(block, "content:encoded") ||
        getBlockTag(block, "content") ||
        getBlockTag(block, "summary"),
    );
    const pubDate =
      getBlockTag(block, "pubDate") ||
      getBlockTag(block, "published") ||
      getBlockTag(block, "updated");

    const linkMatch = block.match(/<link[^>]*href=["']([^"']+)["'][^>]*>/i);
    const link = stripHtml(linkMatch?.[1] || getBlockTag(block, "link") || getBlockTag(block, "guid"));

    return {
      title,
      link,
      summary,
      pubDate,
    };
  });
}

function makeInsightId(text: string): string {
  return createHash("sha256").update(text).digest("hex").slice(0, 24);
}

function normalizeDate(input: string): Date | null {
  if (!input) return null;
  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
}

function inferGameFromText(text: string, fallback: InsightGame): InsightGame {
  if (fallback !== "general") return fallback;
  const haystack = text.toLowerCase();
  const hasPokemon = POKEMON_KEYWORDS.some((keyword) => haystack.includes(keyword));
  const hasOnePiece = ONEPIECE_KEYWORDS.some((keyword) => haystack.includes(keyword));
  const hasYugioh = YUGIOH_KEYWORDS.some((keyword) => haystack.includes(keyword));

  if (hasPokemon && !hasOnePiece && !hasYugioh) return "pokemon";
  if (hasOnePiece && !hasPokemon && !hasYugioh) return "onepiece";
  if (hasYugioh && !hasPokemon && !hasOnePiece) return "yugioh";
  return fallback;
}

function inferCategoryFromText(text: string, fallback: SourceCategory): InsightCategory {
  const haystack = text.toLowerCase();
  if (TOURNAMENT_KEYWORDS.some((keyword) => haystack.includes(keyword))) return "tournament";
  if (fallback === "official") return "official";
  if (OFFICIAL_UPDATE_KEYWORDS.some((keyword) => haystack.includes(keyword))) return "official";
  return fallback;
}

function normalizeSummary(summary: string, title: string, sourceName: string): string {
  let result = stripHtml(summary || "");
  if (!result) result = title;

  result = result
    .replace(/^\d{4}[\/-]\d{2}[\/-]\d{2}\s+\d{1,2}:\d{2}\s+/i, "")
    .replace(/^\[[^\]]+\]\s*/g, "")
    .replace(/\b(?:The post|This post) .*? appeared first on .*?\.?$/i, "")
    .replace(/\bfirst appeared on .*?\.?$/i, "")
    .replace(new RegExp(`^${escapeRegExp(sourceName)}\s+`, "i"), "")
    .replace(new RegExp(`^${escapeRegExp(title)}\s*[-—:：]?\s*`, "i"), "")
    .replace(/\s+/g, " ")
    .trim();

  if (!result) result = title;
  return result.slice(0, 360);
}

function matchesSourceFilters(source: FeedSource, item: { title: string; summary: string }) {
  const haystack = `${item.title} ${item.summary}`.toLowerCase();
  if (source.includeKeywords?.length) {
    const hit = source.includeKeywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
    if (!hit) return false;
  }
  if (source.excludeKeywords?.length) {
    const blocked = source.excludeKeywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
    if (blocked) return false;
  }
  return true;
}

function buildOfficialSummary(franchise: string, title: string, category: InsightCategory): string {
  if (category === "tournament") {
    return `${franchise} 赛事侧出现新动态：${title}`.slice(0, 180);
  }
  if (/(banned|restricted|forbidden|limited|rule|maintenance|version|patch)/i.test(title)) {
    return `${franchise} 官方规则或版本节奏有更新：${title}`.slice(0, 180);
  }
  if (/(product|booster|deck|collection|release|expansion|updated)/i.test(title)) {
    return `${franchise} 产品与补货节奏出现新变化：${title}`.slice(0, 180);
  }
  return `${franchise} 官方情报更新：${title}`.slice(0, 180);
}

function parseOnePieceNewsHtml(html: string, baseUrl: string): ParsedSourceItem[] {
  const items: ParsedSourceItem[] = [];
  const seen = new Set<string>();
  const anchorRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = anchorRegex.exec(html)) !== null) {
    const rawHref = match[1];
    const href = resolveUrl(rawHref, baseUrl);
    const text = stripHtml(match[2]);
    const dateMatch = text.match(DATE_REGEX);
    if (!dateMatch) continue;
    if (!/onepiece-cardgame\.com/i.test(href)) continue;

    const title = text
      .replace(dateMatch[0], "")
      .replace(/\b(NEWS|EVENTS|PRODUCTS|RULES|MAGAZINE|STREAM)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    if (title.length < 8 || /^(news|archive)$/i.test(title)) continue;
    if (seen.has(href) || seen.has(title)) continue;
    seen.add(href);

    const category = inferCategoryFromText(`${text} ${title}`, "official");
    items.push({
      title,
      link: href,
      summary: buildOfficialSummary("ONE PIECE", title, category),
      pubDate: dateMatch[0],
      category: category === "tournament" ? "tournament" : "official",
      game: "onepiece",
    });
  }

  return items;
}

function parseYugiohNewsHtml(html: string, baseUrl: string): ParsedSourceItem[] {
  const items: ParsedSourceItem[] = [];
  const seen = new Set<string>();
  const anchorRegex = /<a[^>]*href=["']([^"']*\/en\/news\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = anchorRegex.exec(html)) !== null) {
    const href = resolveUrl(match[1], baseUrl);
    const title = stripHtml(match[2]).replace(/\s+/g, " ").trim();
    if (title.length < 8 || /^(news|latest news)$/i.test(title)) continue;
    if (seen.has(href) || seen.has(title)) continue;

    const surrounding = `${html.slice(Math.max(0, match.index - 120), match.index)} ${html.slice(match.index + match[0].length, match.index + match[0].length + 520)}`;
    const dateMatch = surrounding.match(DATE_REGEX);
    const category = inferCategoryFromText(title, "official");
    seen.add(href);

    items.push({
      title,
      link: href,
      summary: buildOfficialSummary("Yu-Gi-Oh!", title, category),
      pubDate: dateMatch?.[0] || "",
      category: category === "tournament" ? "tournament" : "official",
      game: "yugioh",
    });
  }

  return items;
}

function parseHtmlBySource(source: FeedSource, html: string, baseUrl: string): ParsedSourceItem[] {
  if (source.parser === "onepiece_news") return parseOnePieceNewsHtml(html, baseUrl);
  if (source.parser === "yugioh_news") return parseYugiohNewsHtml(html, baseUrl);
  return [];
}

function toLiveInsight(source: FeedSource, item: ParsedSourceItem, fetchedAt: Date, index: number): LiveInsightItem {
  const publishedAt = normalizeDate(item.pubDate);
  const createdAt = publishedAt ?? fetchedAt;
  const rawText = `${item.title} ${item.summary}`;
  const game = item.game ?? inferGameFromText(rawText, source.game);
  const category = item.category ?? inferCategoryFromText(rawText, source.category);
  const title = item.title.slice(0, 512);
  const summary = normalizeSummary(item.summary || item.title, title, source.name);
  const insightId = makeInsightId(`${source.name}|${item.link}|${title}`);

  return {
    id: fetchedAt.getTime() + index,
    insightId,
    title,
    summary,
    source: source.name,
    sourceUrl: sanitizeOutboundUrl(resolveUrl(item.link, source.url), source.url),
    originalTitle: title,
    scrapeMethod: source.sourceType === "html" ? "live_html" : "live_rss",
    section: source.section,
    category,
    game,
    disclaimer: source.sourceType === "html" ? "Live public HTML news aggregation." : "Live public RSS feed aggregation.",
    isNew: 1,
    publishedAt,
    fetchedAt,
    createdAt,
  };
}

async function fetchFeed(source: FeedSource): Promise<LiveInsightItem[]> {
  const safeFeedUrl = ensureSafeFeedUrl(source.url);
  const response = await fetch(safeFeedUrl, {
    headers: { "User-Agent": "IntelFeed/1.0 Live News" },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    throw new Error(`${source.name}: HTTP ${response.status}`);
  }

  const raw = await response.text();
  const parsedItems = source.sourceType === "html"
    ? parseHtmlBySource(source, raw, safeFeedUrl)
    : parseFeed(raw);

  const items = parsedItems
    .filter((item) => item.title && item.link)
    .filter((item) => matchesSourceFilters(source, item));

  const fetchedAt = new Date();
  return items.slice(0, source.maxItems ?? 12).map((item, index) => toLiveInsight(source, item, fetchedAt, index));
}

export async function getLiveFallbackInsights(input: {
  limit: number;
  section?: InsightSection;
  category?: InsightCategory;
  game?: InsightGame;
  keyword?: string;
  source?: string;
}): Promise<LiveInsightItem[]> {
  const eligibleFeeds = PUBLIC_FEEDS.filter((feed) => {
    if (input.section && feed.section !== input.section) return false;
    if (input.game && feed.game !== input.game && feed.game !== "general") return false;
    if (input.source && feed.name !== input.source) return false;
    return true;
  });

  const results = await Promise.allSettled(eligibleFeeds.map((feed) => fetchFeed(feed)));
  const merged = results
    .filter((result): result is PromiseFulfilledResult<LiveInsightItem[]> => result.status === "fulfilled")
    .flatMap((result) => result.value);

  const deduped = merged.filter((item, index, array) => {
    return array.findIndex((other) => other.sourceUrl === item.sourceUrl || other.title === item.title) === index;
  });

  const keyword = input.keyword?.trim().toLowerCase();
  const filtered = deduped.filter((item) => {
    if (input.section && item.section !== input.section) return false;
    if (input.category && item.category !== input.category) return false;
    if (input.game && item.game !== input.game) return false;
    if (input.source && item.source !== input.source) return false;
    if (keyword) {
      const haystack = `${item.title} ${item.summary} ${item.source}`.toLowerCase();
      if (!haystack.includes(keyword)) return false;
    }
    return true;
  });

  return filtered
    .sort((a, b) => (b.publishedAt?.getTime() ?? b.createdAt.getTime()) - (a.publishedAt?.getTime() ?? a.createdAt.getTime()))
    .slice(0, input.limit);
}

export function getLiveFallbackSourceCount(): number {
  return PUBLIC_FEEDS.length;
}
