import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const insights = mysqlTable("insights", {
  id: int("id").autoincrement().primaryKey(),
  insightId: varchar("insightId", { length: 64 }).notNull().unique(),
  title: varchar("title", { length: 512 }).notNull(),
  summary: text("summary").notNull(),
  source: varchar("source", { length: 128 }).notNull(),
  sourceUrl: varchar("sourceUrl", { length: 1024 }),
  originalTitle: varchar("originalTitle", { length: 512 }),
  scrapeMethod: varchar("scrapeMethod", { length: 32 }).default("rss"),
  section: mysqlEnum("section", ["tcg", "web3", "collector"]).notNull(),
  category: mysqlEnum("category", ["official", "community", "tournament", "cross_lang", "alert"]).default("community").notNull(),
  game: mysqlEnum("game", ["pokemon", "onepiece", "yugioh", "general"]).default("general").notNull(),
  disclaimer: text("disclaimer"),
  isNew: int("isNew").default(1),
  publishedAt: timestamp("publishedAt"),
  fetchedAt: timestamp("fetchedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Insight = typeof insights.$inferSelect;
export type InsertInsight = typeof insights.$inferInsert;

export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  alertId: varchar("alertId", { length: 64 }).notNull().unique(),
  title: varchar("title", { length: 512 }).notNull(),
  description: text("description"),
  severity: mysqlEnum("severity", ["high", "medium", "low"]).default("medium").notNull(),
  matchedKeywords: text("matchedKeywords"),
  source: varchar("source", { length: 128 }),
  sourceUrl: varchar("sourceUrl", { length: 1024 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Alert = typeof alerts.$inferSelect;

export const metaRecords = mysqlTable("meta_records", {
  id: int("id").autoincrement().primaryKey(),
  game: mysqlEnum("game", ["pokemon", "onepiece"]).notNull(),
  cardName: varchar("cardName", { length: 128 }).notNull(),
  appearances: int("appearances").default(0).notNull(),
  winRate: int("winRate").default(0).notNull(),
  trend: mysqlEnum("trend", ["up", "down", "stable"]).default("stable").notNull(),
  notes: varchar("notes", { length: 200 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const roiPredictions = mysqlTable("roi_predictions", {
  id: int("id").autoincrement().primaryKey(),
  game: mysqlEnum("game", ["pokemon", "onepiece"]).notNull(),
  cardName: varchar("cardName", { length: 128 }).notNull(),
  rating: mysqlEnum("rating", ["S", "A", "B", "C"]).notNull(),
  confidence: int("confidence").default(50).notNull(),
  rationale: varchar("rationale", { length: 280 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const processedMessages = mysqlTable("processed_messages", {
  id: int("id").autoincrement().primaryKey(),
  contentHash: varchar("contentHash", { length: 64 }).notNull().unique(),
  sourceUrl: varchar("sourceUrl", { length: 1024 }),
  processedAt: timestamp("processedAt").defaultNow().notNull(),
});

export const scrapeSources = mysqlTable("scrape_sources", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  url: varchar("url", { length: 1024 }).notNull(),
  sourceType: mysqlEnum("sourceType", ["rss", "html"]).default("rss").notNull(),
  section: mysqlEnum("section", ["tcg", "web3", "collector"]).notNull(),
  category: mysqlEnum("category", ["official", "community", "tournament"]).default("community").notNull(),
  game: mysqlEnum("game", ["pokemon", "onepiece", "yugioh", "general"]).default("general").notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type InsertScrapeSource = typeof scrapeSources.$inferInsert;

export const engineLogs = mysqlTable("engine_logs", {
  id: int("id").autoincrement().primaryKey(),
  status: mysqlEnum("status", ["running", "success", "error"]).default("running").notNull(),
  sourcesProcessed: int("sourcesProcessed").default(0),
  insightsCreated: int("insightsCreated").default(0),
  alertsCreated: int("alertsCreated").default(0),
  errorMessage: text("errorMessage"),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  finishedAt: timestamp("finishedAt"),
});
