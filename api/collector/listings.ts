/**
 * Vercel Serverless Function — /api/collector/listings
 *
 * 在 Vercel (Serverless) 环境下代替原 Vite 开发插件提供 Collector 数据。
 * 由于 Vercel Hobby 计划 Serverless Function 难以稳定运行 Playwright/Chromium
 * (包体积 >250MB、执行 <10s),此函数直接返回仓库内置的
 * `client/public/collector-snapshot.json` 快照,确保前端页面可立即渲染,
 * 不再卡在 "Collector 数据加载中..." 的占位界面。
 *
 * 如需实时抓取,可改造为调用外部带浏览器能力的服务 (Browserless、
 * ScrapingBee、或独立的长连接服务器)。
 */
import fs from "node:fs";
import path from "node:path";

type Card = Record<string, unknown>;

interface Snapshot {
  cards: Card[];
  total?: number;
  lastUpdated?: number;
}

let cached: { payload: Snapshot; ts: number } | null = null;

function loadSnapshot(): Snapshot {
  if (cached && Date.now() - cached.ts < 60_000) {
    return cached.payload;
  }

  const candidates = [
    // 构建产物中的公共资源目录
    path.join(process.cwd(), "dist", "public", "collector-snapshot.json"),
    // 仓库源码中的位置
    path.join(process.cwd(), "client", "public", "collector-snapshot.json"),
  ];

  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, "utf-8");
        const parsed = JSON.parse(raw) as Snapshot;
        const payload: Snapshot = {
          cards: Array.isArray(parsed.cards) ? parsed.cards : [],
          total:
            typeof parsed.total === "number"
              ? parsed.total
              : Array.isArray(parsed.cards)
                ? parsed.cards.length
                : 0,
          lastUpdated:
            typeof parsed.lastUpdated === "number"
              ? parsed.lastUpdated
              : Date.now(),
        };
        cached = { payload, ts: Date.now() };
        return payload;
      }
    } catch {
      // 忽略单个候选路径的错误,继续尝试下一个
    }
  }

  const empty: Snapshot = { cards: [], total: 0, lastUpdated: Date.now() };
  cached = { payload: empty, ts: Date.now() };
  return empty;
}

export default function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, max-age=30, s-maxage=30");

  try {
    const snapshot = loadSnapshot();
    res.status(200).json({
      cards: snapshot.cards,
      total: snapshot.total ?? snapshot.cards.length,
      lastUpdated: snapshot.lastUpdated ?? Date.now(),
      mode: "snapshot",
    });
  } catch (err) {
    res.status(500).json({
      error: "Collector snapshot unavailable",
      message: (err as Error)?.message,
    });
  }
}
