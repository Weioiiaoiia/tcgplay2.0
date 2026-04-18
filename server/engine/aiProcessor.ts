/**
 * AI Processor — 使用 LLM 生成中文快讯摘要
 * 批量并行处理，5秒内完成
 * 每条摘要带原始发布时间和信息获取时间
 */
import { invokeLLM } from "../_core/llm";
import { applyComplianceGuard, generateImageCode, DISCLAIMER } from "./complianceGuard";
import type { RawArticle } from "./scraper";
import { getDb } from "../db";
import { insights, alerts } from "../../drizzle/schema";
import { nanoid } from "nanoid";

const SYSTEM_PROMPT = `你是 IntelFeed 情报分析引擎。将原始内容转化为简洁中文快讯。
规则：输出纯中文50-120字，提取核心信息，标注关键数据，不复制原文，英文翻译提炼，标题30字内。`;

export interface ProcessedInsight {
  insightId: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  originalTitle: string;
  section: "tcg" | "web3" | "collector";
  category: "official" | "community" | "tournament" | "cross_lang" | "alert";
  game: "pokemon" | "onepiece" | "general";
  imageCode: string;
  publishedAt: Date | null;
  fetchedAt: Date;
}

/** Process a single article with LLM */
async function processSingle(article: RawArticle): Promise<{
  insight: ProcessedInsight | null;
  isAlert: boolean;
  alertKeywords: string;
}> {
  const fetchedAt = new Date();
  const insightId = nanoid(16);
  let title = article.title;
  let summary = article.content;
  let isAlert = false;
  let alertKeywords = "";

  // Parse original publish date
  let publishedAt: Date | null = null;
  if (article.pubDate) {
    try {
      const d = new Date(article.pubDate);
      if (!isNaN(d.getTime())) publishedAt = d;
    } catch {}
  }

  try {
    const resp = await invokeLLM({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `来源: ${article.sourceName}\n原标题: ${article.title}\n原文: ${article.content.slice(0, 1500)}\n\n输出JSON：{"title":"中文标题","summary":"中文摘要","isAlert":false,"alertKeywords":""}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "insight_output",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              summary: { type: "string" },
              isAlert: { type: "boolean" },
              alertKeywords: { type: "string" },
            },
            required: ["title", "summary", "isAlert", "alertKeywords"],
            additionalProperties: false,
          },
        },
      },
    });

    const raw = resp?.choices?.[0]?.message?.content;
    const parsed = typeof raw === "string" ? JSON.parse(raw) : null;
    if (parsed?.title) title = parsed.title;
    if (parsed?.summary) summary = parsed.summary;
    if (parsed?.isAlert) isAlert = true;
    if (parsed?.alertKeywords) alertKeywords = parsed.alertKeywords;
  } catch (llmErr) {
    console.warn(`[aiProcessor] LLM fallback for "${article.title.slice(0, 40)}"`);
    if (article.content.length > 120) {
      summary = article.content.slice(0, 120) + "…";
    }
  }

  const guarded = applyComplianceGuard({ title, summary });
  const imageCode = generateImageCode(insightId);

  return {
    insight: {
      insightId,
      title: guarded.title.slice(0, 512),
      summary: guarded.summary,
      source: article.sourceName,
      sourceUrl: article.sourceUrl,
      originalTitle: article.title.slice(0, 512),
      section: article.section,
      category: article.category,
      game: article.game,
      imageCode,
      publishedAt,
      fetchedAt,
    },
    isAlert,
    alertKeywords,
  };
}

export async function processArticles(articles: RawArticle[]): Promise<{
  insights: ProcessedInsight[];
  alertCount: number;
}> {
  if (articles.length === 0) return { insights: [], alertCount: 0 };

  const db = await getDb();
  const startTime = Date.now();

  // Process ALL articles in parallel for speed (batch of 5 concurrent)
  const BATCH_SIZE = 5;
  const allResults: Awaited<ReturnType<typeof processSingle>>[] = [];

  for (let i = 0; i < articles.length; i += BATCH_SIZE) {
    const batch = articles.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(batch.map(a => processSingle(a)));
    for (const r of batchResults) {
      if (r.status === "fulfilled" && r.value.insight) {
        allResults.push(r.value);
      }
    }
  }

  // Save all to DB in parallel
  let alertCount = 0;
  const savedInsights: ProcessedInsight[] = [];

  if (db) {
    const savePromises = allResults.map(async ({ insight, isAlert, alertKeywords }) => {
      if (!insight) return;
      try {
        await db.insert(insights).values({
          insightId: insight.insightId,
          title: insight.title,
          summary: insight.summary,
          source: insight.source,
          sourceUrl: insight.sourceUrl,
          originalTitle: insight.originalTitle,
          scrapeMethod: "rss",
          section: insight.section,
          category: insight.category,
          game: insight.game,
          disclaimer: DISCLAIMER,
          isNew: 1,
          publishedAt: insight.publishedAt,
          fetchedAt: insight.fetchedAt,
        });
        savedInsights.push(insight);

        if (isAlert) {
          const alertId = nanoid(16);
          await db.insert(alerts).values({
            alertId,
            title: insight.title.slice(0, 512),
            description: insight.summary.slice(0, 2000),
            severity: "medium",
            matchedKeywords: alertKeywords,
            source: insight.source,
            sourceUrl: insight.sourceUrl,
          });
          alertCount++;
        }
      } catch (err) {
        console.error(`[aiProcessor] DB save failed:`, (err as Error).message);
      }
    });

    await Promise.allSettled(savePromises);
  }

  console.log(`[aiProcessor] Processed ${savedInsights.length} insights in ${Date.now() - startTime}ms`);
  return { insights: savedInsights, alertCount };
}
