import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { getCollectorCards, warmup } from "./collectorScraper.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());

  // ─── Collector 实时数据 API ──────────────────────────────────────────────

  /** GET /api/collector/listings — 返回全量卡牌列表（服务端缓存 30s） */
  app.get("/api/collector/listings", async (_req, res) => {
    try {
      const data = await getCollectorCards();
      res.json({
        cards: data.cards,
        total: data.total,
        lastUpdated: data.lastUpdated,
        mode: data.mode,
      });
    } catch (err) {
      console.error("[Collector API] Error:", err);
      res.status(500).json({ error: "Failed to fetch Collector data" });
    }
  });

  /** POST /api/collector/refresh — 强制重新抓取 */
  app.post("/api/collector/refresh", async (_req, res) => {
    try {
      const data = await getCollectorCards(true);
      res.json({
        success: true,
        total: data.total,
        lastUpdated: data.lastUpdated,
        mode: data.mode,
      });
    } catch (err) {
      console.error("[Collector API] Refresh error:", err);
      res.status(500).json({ error: "Refresh failed" });
    }
  });

  // ─── 静态文件 & SPA 路由 ─────────────────────────────────────────────────

  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    // 启动后立即预热 Collector 数据
    warmup();
  });
}

startServer().catch(console.error);
