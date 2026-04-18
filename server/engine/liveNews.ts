import { createHash } from "crypto";
import { ensureSafeFeedUrl, sanitizeOutboundUrl } from "./linkSafety";

export interface LiveInsightItem {
  id: number;
  insightId: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  originalTitle: string;
  scrapeMethod: string;
  section: "tcg" | "web3" | "collector";
  category: "official" | "community" | "tournament" | "cross_lang" | "alert";
  game: "pokemon" | "onepiece" | "general";
  disclaimer: string;
  isNew: number;
  publishedAt: Date | null;
  fetchedAt: Date;
  createdAt: Date;
}

interface FeedSource {
  name: string;
  url: string;
  section: "tcg" | "web3" | "collector";
  category: "official" | "community" | "tournament";
  game: "pokemon" | "onepiece" | "general";
  maxItems?: number;
  includeKeywords?: string[];
  excludeKeywords?: string[];
}

const TCG_KEYWORDS = [
  "pokemon",
  "pokémon",
  "pikachu",
  "yu-gi-oh",
  "yugioh",
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
    name: "YGOrganization",
    url: "https://ygorganization.com/feed/",
    section: "tcg",
    category: "community",
    game: "general",
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

function decodeXml(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'");
}

function stripHtml(text: string): string {
  return decodeXml(text)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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

function parseFeed(xml: string): Array<{ title: string; link: string; summary: string; pubDate: string }> {
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

async function fetchFeed(source: FeedSource): Promise<LiveInsightItem[]> {
  const safeFeedUrl = ensureSafeFeedUrl(source.url);
  const response = await fetch(safeFeedUrl, {
    headers: { "User-Agent": "IntelFeed/1.0 Live News" },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    throw new Error(`${source.name}: HTTP ${response.status}`);
  }

  const xml = await response.text();
  const items = parseFeed(xml)
    .filter((item) => item.title && item.link)
    .filter((item) => matchesSourceFilters(source, item));
  const fetchedAt = new Date();

  return items.slice(0, source.maxItems ?? 12).map((item, index) => {
    const publishedAt = normalizeDate(item.pubDate);
    const createdAt = publishedAt ?? fetchedAt;
    const summary = item.summary || item.title;
    const insightId = makeInsightId(`${source.name}|${item.link}|${item.title}`);

    return {
      id: fetchedAt.getTime() + index,
      insightId,
      title: item.title.slice(0, 512),
      summary: summary.slice(0, 1200),
      source: source.name,
      sourceUrl: sanitizeOutboundUrl(item.link, safeFeedUrl),
      originalTitle: item.title.slice(0, 512),
      scrapeMethod: "live_rss",
      section: source.section,
      category: source.category,
      game: source.game,
      disclaimer: "Live public RSS feed aggregation.",
      isNew: 1,
      publishedAt,
      fetchedAt,
      createdAt,
    };
  });
}

export async function getLiveFallbackInsights(input: {
  limit: number;
  section?: "tcg" | "web3" | "collector";
  category?: "official" | "community" | "tournament" | "cross_lang" | "alert";
  game?: "pokemon" | "onepiece" | "general";
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
