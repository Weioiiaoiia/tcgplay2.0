/**
 * Scraper — 真实 RSS 数据抓取（并行版）
 * 所有源并行抓取，5秒内完成
 */
import { getDb } from "../db";
import { scrapeSources, processedMessages } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";
import { ensureSafeFeedUrl, sanitizeOutboundUrl } from "./linkSafety";

export interface RawArticle {
  title: string;
  link: string;
  content: string;
  pubDate: string;
  sourceName: string;
  sourceUrl: string;
  section: "tcg" | "web3" | "collector";
  category: "official" | "community" | "tournament";
  game: "pokemon" | "onepiece" | "yugioh" | "general";
}

const RSSHUB_MIRRORS = [
  "https://rsshub.pseudoyu.com",
  "https://rsshub.rssforever.com",
  "https://rsshub-instance.zeabur.app",
  "https://rsshub.app",
];

function parseRSSXml(xml: string): Array<{ title: string; link: string; content: string; pubDate: string }> {
  const items: Array<{ title: string; link: string; content: string; pubDate: string }> = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const getTag = (tag: string) => {
      const r = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?</${tag}>`, "is");
      const m = block.match(r);
      return m ? m[1].trim() : "";
    };
    items.push({
      title: getTag("title").replace(/<[^>]+>/g, ""),
      link: getTag("link") || getTag("guid"),
      content: getTag("description").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      pubDate: getTag("pubDate"),
    });
  }
  return items;
}

function isXSpaces(title: string, content: string): boolean {
  const combined = (title + " " + content).toLowerCase();
  return combined.includes("x spaces") || combined.includes("twitter spaces") || combined.includes("space started") || combined.includes("is live in");
}

/** Race all mirrors in parallel — first valid response wins */
async function fetchWithMirrorRace(path: string): Promise<string | null> {
  const controller = new AbortController();
  try {
    const result = await Promise.any(
      RSSHUB_MIRRORS.map(async (mirror) => {
        const url = `${mirror}${path}`;
        const resp = await fetch(url, {
          headers: { "User-Agent": "IntelFeed/1.0 RSS Reader" },
          signal: controller.signal,
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const text = await resp.text();
        if (!text.includes("<item>") && !text.includes("<entry>")) throw new Error("Not RSS");
        console.log(`[scraper] ✓ ${url}`);
        return text;
      })
    );
    controller.abort(); // Cancel remaining requests
    return result;
  } catch {
    return null;
  }
}

async function fetchRSS(url: string): Promise<string | null> {
  try {
    const resp = await fetch(url, {
      headers: { "User-Agent": "IntelFeed/1.0 RSS Reader" },
      signal: AbortSignal.timeout(8000),
    });
    if (resp.ok) {
      const text = await resp.text();
      if (text.includes("<item>") || text.includes("<entry>")) return text;
    }
  } catch {}
  return null;
}

function contentHash(text: string): string {
  return createHash("sha256").update(text).digest("hex").slice(0, 32);
}

let pipelineLock = false;

export async function scrapeAllSources(): Promise<{ articles: RawArticle[]; errors: string[]; sourceCount: number }> {
  if (pipelineLock) return { articles: [], errors: [], sourceCount: 0 };
  pipelineLock = true;

  try {
    const db = await getDb();
    if (!db) return { articles: [], errors: ["Database not available"], sourceCount: 0 };

    const sources = await db.select().from(scrapeSources).where(eq(scrapeSources.enabled, true));
    const articles: RawArticle[] = [];
    const errors: string[] = [];

    // Fetch ALL sources in parallel for speed
    const fetchResults = await Promise.allSettled(
      sources.map(async (src) => {
        let xml: string | null = null;
        let urlStr = src.url;
        try {
          urlStr = ensureSafeFeedUrl(src.url);
        } catch (error) {
          throw new Error(`${src.name}: ${(error as Error).message}`);
        }
        if (urlStr.includes("/twitter/") || urlStr.includes("/x/")) {
          const path = new URL(urlStr).pathname;
          xml = await fetchWithMirrorRace(path);
        } else {
          xml = await fetchRSS(urlStr);
        }
        return { src, xml, urlStr };
      })
    );

    for (const result of fetchResults) {
      if (result.status === "rejected") {
        errors.push(result.reason?.message || "Unknown fetch error");
        continue;
      }
      const { src, xml, urlStr } = result.value;
      if (!xml) {
        errors.push(`${src.name}: 无法获取 RSS`);
        continue;
      }

      const items = parseRSSXml(xml);
      let newCount = 0;

      for (const item of items) {
        if (isXSpaces(item.title, item.content)) {
          const spacesTime = item.pubDate ? new Date(item.pubDate).toLocaleString("zh-CN") : "未知时间";
          articles.push({
            title: `[X Spaces] ${item.title || src.name + " 直播"}`,
            link: sanitizeOutboundUrl(item.link, urlStr),
            content: `X Spaces 直播活动，开始时间: ${spacesTime}。仅记录时间信息。`,
            pubDate: item.pubDate || new Date().toISOString(),
            sourceName: src.name,
            sourceUrl: sanitizeOutboundUrl(item.link, urlStr),
            section: src.section,
            category: src.category,
            game: src.game,
          });
          newCount++;
          continue;
        }

        const hash = contentHash(item.title + item.content);
        try {
          const existing = await db.select().from(processedMessages).where(eq(processedMessages.contentHash, hash)).limit(1);
          if (existing.length > 0) continue;
          await db.insert(processedMessages).values({ contentHash: hash, sourceUrl: sanitizeOutboundUrl(item.link, urlStr) });
        } catch {
          continue; // Duplicate — skip
        }

        articles.push({
          title: item.title || `${src.name} 更新`,
          link: sanitizeOutboundUrl(item.link, urlStr),
          content: item.content || item.title,
          pubDate: item.pubDate || new Date().toISOString(),
          sourceName: src.name,
          sourceUrl: sanitizeOutboundUrl(item.link, urlStr),
          section: src.section,
          category: src.category,
          game: src.game,
        });
        newCount++;
      }
      console.log(`[scraper] ${src.name}: ${newCount} new / ${items.length} total`);
    }

    return { articles, errors, sourceCount: sources.length };
  } finally {
    pipelineLock = false;
  }
}

export async function testSourceUrl(url: string): Promise<{ ok: boolean; message: string }> {
  try {
    if (url.includes("/twitter/") || url.includes("/x/")) {
      const path = new URL(url).pathname;
      const xml = await fetchWithMirrorRace(path);
      if (xml) return { ok: true, message: "RSS 源可用（通过镜像）" };
      return { ok: false, message: "所有 RSSHub 镜像均不可用" };
    }
    const resp = await fetch(url, { headers: { "User-Agent": "IntelFeed/1.0" }, signal: AbortSignal.timeout(8000) });
    if (!resp.ok) return { ok: false, message: `HTTP ${resp.status}` };
    const text = await resp.text();
    if (text.includes("<item>") || text.includes("<entry>")) return { ok: true, message: "RSS 源可用" };
    return { ok: false, message: "非有效 RSS 格式" };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}
