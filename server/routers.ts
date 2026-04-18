import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getRecentInsights, getInsightById, getRecentAlerts,
  getMetaHeatmap, getROIPredictions,
  getEnabledSources, getAllSources, toggleSource, addSource, deleteSource,
  getEngineStats,
} from "./db";
import {
  applyComplianceGuard, DISCLAIMER, generateImageCode,
  runEnginePipeline, getSchedulerStatus, startScheduler, stopScheduler,
  generateMetaHeatmap, generateROIPredictions,
  testSourceUrl,
} from "./engine";
import { ensureSafeFeedUrl } from "./engine/linkSafety";
import { getLiveFallbackInsights } from "./engine/liveNews";

function toTimestamp(value: unknown) {
  if (!value) return 0;
  const date = value instanceof Date ? value : new Date(value as string);
  const time = date.getTime();
  return Number.isNaN(time) ? 0 : time;
}

function mergeInsightRows(rows: any[], liveRows: any[], limit: number) {
  const merged = [...rows, ...liveRows];
  const deduped = merged.filter((item, index, array) => {
    return array.findIndex((other) => {
      if (item.insightId && other.insightId) return other.insightId === item.insightId;
      if (item.sourceUrl && other.sourceUrl) return other.sourceUrl === item.sourceUrl;
      return other.title === item.title;
    }) === index;
  });

  return deduped
    .sort((a, b) => {
      const bTime = Math.max(toTimestamp(b.publishedAt), toTimestamp(b.createdAt), toTimestamp(b.fetchedAt));
      const aTime = Math.max(toTimestamp(a.publishedAt), toTimestamp(a.createdAt), toTimestamp(a.fetchedAt));
      return bTime - aTime;
    })
    .slice(0, limit);
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ---- IntelFeed Insights ----
  insights: router({
    list: publicProcedure
      .input(z.object({
        limit: z.number().min(1).max(500).default(100),
        cursor: z.number().optional(),
        section: z.enum(["tcg", "web3", "collector"]).optional(),
        category: z.enum(["official", "community", "tournament", "cross_lang", "alert"]).optional(),
        game: z.enum(["pokemon", "onepiece", "general"]).optional(),
        keyword: z.string().optional(),
        source: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const [rows, liveRows] = await Promise.all([
          getRecentInsights(input.limit, input.game, input.category, input.section, input.keyword, input.source, input.cursor),
          getLiveFallbackInsights({
            limit: Math.max(input.limit, 80),
            game: input.game,
            category: input.category,
            section: input.section,
            keyword: input.keyword,
            source: input.source,
          }),
        ]);

        const sourceRows = mergeInsightRows(rows, liveRows, input.limit);
        const items = sourceRows.map((r) => {
          const g = applyComplianceGuard({ title: r.title, summary: r.summary });
          return { ...r, title: g.title, summary: g.summary, disclaimer: g.disclaimer, imageCode: generateImageCode(r.insightId) };
        });
        const nextCursor = rows.length > 0 && rows.length === input.limit ? rows[rows.length - 1]?.id : undefined;
        return { items, nextCursor };
      }),
    bySource: publicProcedure
      .input(z.object({ sourceName: z.string(), limit: z.number().min(1).max(500).default(100) }))
      .query(async ({ input }) => {
        const [rows, liveRows] = await Promise.all([
          getRecentInsights(input.limit, undefined, undefined, undefined, undefined, input.sourceName),
          getLiveFallbackInsights({ limit: Math.max(input.limit, 80), source: input.sourceName }),
        ]);

        const sourceRows = mergeInsightRows(rows, liveRows, input.limit);
        return sourceRows.map((r) => {
          const g = applyComplianceGuard({ title: r.title, summary: r.summary });
          return { ...r, title: g.title, summary: g.summary, disclaimer: g.disclaimer, imageCode: generateImageCode(r.insightId) };
        });
      }),
  }),

  // ---- Alerts ----
  alerts: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(40) }))
      .query(async ({ input }) => {
        const rows = await getRecentAlerts(input.limit);
        return rows.map((r) => {
          const g = applyComplianceGuard({ title: r.title, summary: r.description ?? "" });
          return { ...r, title: g.title, description: g.summary, imageCode: generateImageCode(r.alertId) };
        });
      }),
  }),

  // ---- Meta Heatmap ----
  meta: router({
    heatmap: publicProcedure
      .input(z.object({ game: z.enum(["pokemon", "onepiece"]).optional(), limit: z.number().min(1).max(50).default(20) }))
      .query(async ({ input }) => {
        const rows = await getMetaHeatmap(input.game, input.limit);
        return rows.map((r) => {
          const g = applyComplianceGuard({ title: r.cardName, summary: r.notes ?? "" });
          return { ...r, cardName: g.title, notes: g.summary };
        });
      }),
    generate: publicProcedure
      .input(z.object({ game: z.enum(["pokemon", "onepiece"]) }))
      .mutation(async ({ input }) => ({ generated: await generateMetaHeatmap(input.game) })),
  }),

  // ---- ROI Predictions ----
  roi: router({
    list: publicProcedure
      .input(z.object({ game: z.enum(["pokemon", "onepiece"]).optional(), limit: z.number().min(1).max(50).default(20) }))
      .query(async ({ input }) => {
        const rows = await getROIPredictions(input.game, input.limit);
        return rows.map((r) => {
          const g = applyComplianceGuard({ title: r.cardName, summary: r.rationale ?? "" });
          return { ...r, cardName: g.title, rationale: g.summary };
        });
      }),
    generate: publicProcedure
      .input(z.object({ game: z.enum(["pokemon", "onepiece"]) }))
      .mutation(async ({ input }) => ({ generated: await generateROIPredictions(input.game) })),
  }),

  // ---- Compliance ----
  compliance: router({
    getInsightProvenance: publicProcedure
      .input(z.object({ insightId: z.string() }))
      .query(async ({ input }) => {
        const insight = await getInsightById(input.insightId);
        if (!insight) return null;
        return {
          insightId: insight.insightId,
          source: insight.source,
          sourceUrl: insight.sourceUrl,
          scrapeMethod: insight.scrapeMethod,
          originalTitle: insight.originalTitle,
          disclaimer: insight.disclaimer,
          fetchedAt: insight.fetchedAt,
          createdAt: insight.createdAt,
          pipeline: ["数据抓取", "增量去重", "AI 改写", "术语转换", "合规审查"],
          complianceNotes: [
            "本平台不存储任何官方版权图片",
            "所有内容均为 AI 独立生成的分析摘要",
            "卡牌图片请通过官方渠道查看",
          ],
        };
      }),
    getDisclaimer: publicProcedure.query(() => ({ disclaimer: DISCLAIMER })),
  }),

  // ---- Engine ----
  engine: router({
    stats: publicProcedure.query(async () => {
      const stats = await getEngineStats();
      const scheduler = getSchedulerStatus();
      return { ...stats, scheduler };
    }),
    sources: publicProcedure.query(() => getEnabledSources()),
    allSources: publicProcedure.query(() => getAllSources()),
    toggleSource: publicProcedure
      .input(z.object({ sourceId: z.number(), enabled: z.boolean() }))
      .mutation(async ({ input }) => { await toggleSource(input.sourceId, input.enabled); return { success: true }; }),
    addSource: publicProcedure
      .input(z.object({
        name: z.string().min(1).max(128),
        url: z.string().url(),
        sourceType: z.enum(["rss", "html"]).default("rss"),
        section: z.enum(["tcg", "web3", "collector"]),
        category: z.enum(["official", "community", "tournament"]).default("community"),
        game: z.enum(["pokemon", "onepiece", "general"]).default("general"),
      }))
      .mutation(async ({ input }) => {
        const safeUrl = ensureSafeFeedUrl(input.url);
        const health = await testSourceUrl(safeUrl);
        if (!health.ok) {
          throw new Error(`链接不健康，已拒绝保存：${health.message}`);
        }
        await addSource({ ...input, url: safeUrl });
        return { success: true, health };
      }),
    deleteSource: publicProcedure
      .input(z.object({ sourceId: z.number() }))
      .mutation(async ({ input }) => { await deleteSource(input.sourceId); return { success: true }; }),
    testUrl: publicProcedure
      .input(z.object({ url: z.string().url() }))
      .mutation(async ({ input }) => testSourceUrl(input.url)),
    triggerScrape: publicProcedure.mutation(() => runEnginePipeline()),
    triggerAll: publicProcedure.mutation(async () => {
      const scrape = await runEnginePipeline();
      const metaP = await generateMetaHeatmap("pokemon");
      const metaO = await generateMetaHeatmap("onepiece");
      const roiP = await generateROIPredictions("pokemon");
      const roiO = await generateROIPredictions("onepiece");
      return { scrape, meta: { pokemon: metaP, onepiece: metaO }, roi: { pokemon: roiP, onepiece: roiO } };
    }),
    schedulerStatus: publicProcedure.query(() => getSchedulerStatus()),
    startScheduler: publicProcedure.mutation(() => { startScheduler(); return { success: true, status: getSchedulerStatus() }; }),
    stopScheduler: publicProcedure.mutation(() => { stopScheduler(); return { success: true, status: getSchedulerStatus() }; }),
  }),
});

export type AppRouter = typeof appRouter;
