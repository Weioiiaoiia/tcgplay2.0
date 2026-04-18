import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users, insights, alerts, metaRecords,
  roiPredictions, scrapeSources, engineLogs,
  type InsertScrapeSource,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { ensureSafeFeedUrl } from "./engine/linkSafety";
import { getLiveFallbackInsights, getLiveFallbackSourceCount } from "./engine/liveNews";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  for (const f of ["name", "email", "loginMethod"] as const) {
    if (user[f] !== undefined) { values[f] = user[f] ?? null; updateSet[f] = user[f] ?? null; }
  }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (!Object.keys(updateSet).length) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

// ---- Insights ----
export async function getRecentInsights(
  limit = 100, game?: string, category?: string, section?: string, keyword?: string, source?: string, cursor?: number,
) {
  const db = await getDb();
  if (!db) return [];
  const conds: any[] = [];
  if (game) conds.push(eq(insights.game, game as any));
  if (category) conds.push(eq(insights.category, category as any));
  if (section) conds.push(eq(insights.section, section as any));
  if (source) conds.push(eq(insights.source, source));
  if (keyword?.trim()) {
    const k = `%${keyword.trim()}%`;
    conds.push(or(like(insights.title, k), like(insights.summary, k)));
  }
  if (cursor) conds.push(sql`${insights.id} < ${cursor}`);
  const q = conds.length ? db.select().from(insights).where(and(...conds)) : db.select().from(insights);
  return q.orderBy(desc(insights.createdAt)).limit(limit);
}

export async function getInsightById(insightId: string) {
  const db = await getDb();
  if (!db) return null;
  const r = await db.select().from(insights).where(eq(insights.insightId, insightId)).limit(1);
  return r[0] ?? null;
}

// ---- Alerts ----
export async function getRecentAlerts(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(alerts).orderBy(desc(alerts.createdAt)).limit(limit);
}

// ---- Meta / ROI ----
export async function getMetaHeatmap(game?: string, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  const q = game
    ? db.select().from(metaRecords).where(eq(metaRecords.game, game as any))
    : db.select().from(metaRecords);
  return q.orderBy(desc(metaRecords.appearances)).limit(limit);
}

export async function getROIPredictions(game?: string, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  const q = game
    ? db.select().from(roiPredictions).where(eq(roiPredictions.game, game as any))
    : db.select().from(roiPredictions);
  return q.orderBy(desc(roiPredictions.confidence)).limit(limit);
}

// ---- Sources ----
export async function getEnabledSources() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(scrapeSources).where(eq(scrapeSources.enabled, true));
}

export async function getAllSources() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(scrapeSources).orderBy(desc(scrapeSources.createdAt));
}

export async function toggleSource(sourceId: number, enabled: boolean) {
  const db = await getDb();
  if (!db) return;
  await db.update(scrapeSources).set({ enabled }).where(eq(scrapeSources.id, sourceId));
}

export async function addSource(input: InsertScrapeSource) {
  const db = await getDb();
  if (!db) return;

  const safeUrl = ensureSafeFeedUrl(input.url);
  const existing = await db.select().from(scrapeSources).where(eq(scrapeSources.url, safeUrl)).limit(1);
  if (existing.length > 0) {
    throw new Error("该数据源链接已存在，无需重复添加");
  }

  await db.insert(scrapeSources).values({ ...input, url: safeUrl });
}

export async function deleteSource(sourceId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(scrapeSources).where(eq(scrapeSources.id, sourceId));
}

// ---- Engine Stats ----
export async function getEngineStats() {
  const db = await getDb();
  if (!db) {
    const liveItems = await getLiveFallbackInsights({ limit: 30 });
    const sectionBreakdown: Record<string, number> = { tcg: 0, web3: 0, collector: 0 };
    for (const item of liveItems) sectionBreakdown[item.section] = Number(sectionBreakdown[item.section] ?? 0) + 1;
    return {
      totalInsights: liveItems.length,
      totalAlerts: 0,
      totalSources: getLiveFallbackSourceCount(),
      totalEnabledSources: getLiveFallbackSourceCount(),
      recentRuns: [],
      sectionBreakdown,
    };
  }

  const [ti] = await db.select({ count: sql<number>`cast(count(${insights.id}) as signed)` }).from(insights);
  const [ta] = await db.select({ count: sql<number>`cast(count(${alerts.id}) as signed)` }).from(alerts);
  const [ts] = await db.select({ count: sql<number>`cast(count(${scrapeSources.id}) as signed)` }).from(scrapeSources);
  const [es] = await db.select({ count: sql<number>`cast(count(${scrapeSources.id}) as signed)` }).from(scrapeSources).where(eq(scrapeSources.enabled, true));

  const sectionRows = await db.select({ section: insights.section, count: sql<number>`cast(count(${insights.id}) as signed)` }).from(insights).groupBy(insights.section);
  const sectionBreakdown: Record<string, number> = { tcg: 0, web3: 0, collector: 0 };
  for (const r of sectionRows) sectionBreakdown[r.section] = Number(r.count ?? 0);

  const recentRuns = await db.select().from(engineLogs).orderBy(desc(engineLogs.startedAt)).limit(5);

  return {
    totalInsights: Number(ti?.count ?? 0),
    totalAlerts: Number(ta?.count ?? 0),
    totalSources: Number(ts?.count ?? 0),
    totalEnabledSources: Number(es?.count ?? 0),
    recentRuns,
    sectionBreakdown,
  };
}
