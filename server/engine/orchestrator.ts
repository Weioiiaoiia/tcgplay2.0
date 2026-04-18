/**
 * Orchestrator — 引擎编排器
 * 协调 scraper → aiProcessor → complianceGuard 流水线
 * 支持定时调度器，防止并发运行
 */
import { getDb } from "../db";
import { engineLogs } from "../../drizzle/schema";
import { eq as eqFn } from "drizzle-orm";
import { scrapeAllSources } from "./scraper";
import { processArticles } from "./aiProcessor";

let schedulerInterval: ReturnType<typeof setInterval> | null = null;
let schedulerRunning = false;
let lastRunTime: Date | null = null;
let lastRunResult: { sourcesProcessed: number; insightsCreated: number; alertsCreated: number; errors: string[] } | null = null;
let pipelineRunning = false;

export function getSchedulerStatus() {
  return {
    running: schedulerRunning,
    intervalMinutes: 60,
    lastRunTime: lastRunTime?.toISOString() ?? null,
    lastResult: lastRunResult,
  };
}

export function startScheduler() {
  if (schedulerRunning) return;
  schedulerRunning = true;
  // Run immediately on start
  runEnginePipeline().catch(console.error);
  schedulerInterval = setInterval(() => {
    runEnginePipeline().catch(console.error);
  }, 30 * 60 * 1000); // 30min interval
  console.log("[orchestrator] Scheduler started — running immediately + 30min interval");
}

export function stopScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
  schedulerRunning = false;
  console.log("[orchestrator] Scheduler stopped");
}

export async function runEnginePipeline(): Promise<{
  sourcesProcessed: number;
  insightsCreated: number;
  alertsCreated: number;
  errors: string[];
}> {
  // Prevent concurrent pipeline runs
  if (pipelineRunning) {
    console.log("[orchestrator] Pipeline already running, skipping");
    return { sourcesProcessed: 0, insightsCreated: 0, alertsCreated: 0, errors: ["Pipeline already running"] };
  }
  pipelineRunning = true;

  const db = await getDb();
  let logId: number | null = null;

  // Create engine log entry
  if (db) {
    try {
      const [result] = await db.insert(engineLogs).values({ status: "running" }).$returningId();
      logId = result?.id ?? null;
    } catch (e) {
      console.warn("[orchestrator] Failed to create log entry:", (e as Error).message);
    }
  }

  const startTime = Date.now();
  console.log("[orchestrator] Pipeline started at", new Date().toISOString());

  try {
    // Step 1: Scrape all enabled sources
    const { articles, errors } = await scrapeAllSources();
    console.log(`[orchestrator] Scraped ${articles.length} articles, ${errors.length} errors`);

    // Step 2: Process through AI + compliance
    let processed = { insights: [] as any[], alertCount: 0 };
    if (articles.length > 0) {
      console.log(`[orchestrator] Starting AI processing for ${articles.length} articles...`);
      processed = await processArticles(articles);
      console.log(`[orchestrator] AI processed ${processed.insights.length} insights, ${processed.alertCount} alerts`);
    } else {
      console.log("[orchestrator] No new articles to process");
    }

    const result = {
      sourcesProcessed: articles.length,
      insightsCreated: processed.insights.length,
      alertsCreated: processed.alertCount,
      errors,
    };

    // Update log
    if (db && logId) {
      await db
        .update(engineLogs)
        .set({
          status: "success",
          sourcesProcessed: result.sourcesProcessed,
          insightsCreated: result.insightsCreated,
          alertsCreated: result.alertsCreated,
          finishedAt: new Date(),
        })
        .where(eqFn(engineLogs.id, logId));
    }

    lastRunTime = new Date();
    lastRunResult = result;
    console.log(`[orchestrator] Pipeline completed in ${Date.now() - startTime}ms`);
    return result;
  } catch (err) {
    const errorMsg = (err as Error).message;
    console.error("[orchestrator] Pipeline error:", errorMsg);

    if (db && logId) {
      await db
        .update(engineLogs)
        .set({
          status: "error",
          errorMessage: errorMsg,
          finishedAt: new Date(),
        })
        .where(eqFn(engineLogs.id, logId));
    }

    lastRunTime = new Date();
    lastRunResult = { sourcesProcessed: 0, insightsCreated: 0, alertsCreated: 0, errors: [errorMsg] };
    return lastRunResult;
  } finally {
    pipelineRunning = false;
  }
}
