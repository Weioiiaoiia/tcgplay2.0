import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// Renaiss tRPC Proxy — 只获取真实在售卡牌 (listedOnly=true)
// ============================================================

interface RawCard {
  id: string;
  tokenId: string;
  itemId: string;
  name: string;
  setName: string;
  cardNumber: string;
  pokemonName?: string;
  characterName?: string;
  ownerAddress: string;
  askPriceInUSDT: string | number;
  fmvPriceInUSD: string | number;
  frontImageUrl: string;
  grade: string;
  gradingCompany: string;
  year: number;
  serial?: string;
  language?: string;
  owner?: { username?: string };
  category?: string;
  attributes?: Array<{ trait: string; value: string }>;
  listedAt?: string;
}

interface ParsedCard {
  id: string;
  tokenId: string;
  itemId: string;
  name: string;
  setName: string;
  cardNumber: string;
  pokemonName: string;
  ownerAddress: string;
  askPriceUSDT: number;
  fmvPriceUSD: number;
  frontImageUrl: string;
  grade: string;
  gradingCompany: string;
  year: number;
  serial: string;
  language: string;
  ownerUsername: string;
  category: string;
  premiumRate: number;
  listedAt: string;
}

const TRPC_BASE = "https://www.renaiss.xyz/api/trpc/collectible.list";
const PAGE_SIZE = 100;
const REFRESH_INTERVAL = 30_000; // 30 seconds

let cachedCards: ParsedCard[] = [];
let lastFetchTime = 0;
let isFetching = false;

function parsePrice(raw: string | number | null | undefined): number {
  if (!raw) return 0;
  const str = String(raw);
  // USDT prices stored as wei (18 decimals)
  if (str.length > 15) {
    return Number(BigInt(str) / BigInt(1e14)) / 10000;
  }
  return parseFloat(str) || 0;
}

function parseFMV(raw: string | number | null | undefined): number {
  if (!raw) return 0;
  const num = parseFloat(String(raw));
  // FMV in cents
  if (num > 1000) return num / 100;
  return num;
}

function parseCard(raw: RawCard): ParsedCard {
  const askPrice = parsePrice(raw.askPriceInUSDT);
  const fmvPrice = parseFMV(raw.fmvPriceInUSD);

  let serial = raw.serial || "";
  let language = raw.language || "Unknown";
  if (raw.attributes) {
    for (const a of raw.attributes) {
      if (a.trait === "Serial") serial = a.value;
      if (a.trait === "Language") language = a.value;
    }
  }

  const premiumRate =
    fmvPrice > 0 ? Math.round(((askPrice - fmvPrice) / fmvPrice) * 1000) / 10 : 0;

  return {
    id: raw.id || "",
    tokenId: String(raw.tokenId || ""),
    itemId: raw.itemId || "",
    name: raw.name || "",
    setName: raw.setName || "",
    cardNumber: raw.cardNumber || "",
    pokemonName: raw.pokemonName || raw.characterName || "",
    ownerAddress: raw.ownerAddress || "",
    askPriceUSDT: Math.round(askPrice * 100) / 100,
    fmvPriceUSD: Math.round(fmvPrice * 100) / 100,
    frontImageUrl: raw.frontImageUrl || "",
    grade: raw.grade || "",
    gradingCompany: raw.gradingCompany || "PSA",
    year: raw.year || 0,
    serial,
    language,
    ownerUsername: raw.owner?.username || "",
    category: raw.category || "pokemon",
    premiumRate,
    listedAt: raw.listedAt || "",
  };
}

async function fetchPage(offset: number, limit: number): Promise<RawCard[]> {
  // 使用 listedOnly: true 确保只获取真实在售卡牌
  const inputData = {
    "0": {
      json: {
        limit,
        offset,
        search: null,
        sortBy: "listDate",
        sortOrder: "desc",
        categoryFilter: null,
        listedOnly: true,
        characterFilter: "",
        languageFilter: "",
        gradingCompanyFilter: "",
        gradeFilter: "",
        yearRange: "",
        priceRangeFilter: "",
      },
      meta: {
        values: {
          search: ["undefined"],
          categoryFilter: ["undefined"],
        },
      },
    },
  };

  const params = new URLSearchParams({
    batch: "1",
    input: JSON.stringify(inputData),
  });

  const url = `${TRPC_BASE}?${params}`;

  const res = await fetch(url, {
    headers: {
      "trpc-accept": "application/jsonl",
      "x-trpc-source": "nextjs-react",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });

  const raw = await res.text();
  const lines = raw
    .trim()
    .split("\n")
    .filter((l) => l.trim());

  for (const line of lines) {
    const data = JSON.parse(line);
    if (data?.json) {
      const found = findCollection(data.json);
      if (found) return found;
    }
  }
  return [];
}

function findCollection(obj: any): RawCard[] | null {
  if (!obj) return null;
  if (typeof obj === "object" && !Array.isArray(obj)) {
    if ("collection" in obj && Array.isArray(obj.collection)) {
      return obj.collection;
    }
    for (const v of Object.values(obj)) {
      const r = findCollection(v);
      if (r) return r;
    }
  }
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const r = findCollection(item);
      if (r) return r;
    }
  }
  return null;
}

async function fetchAllCards(): Promise<ParsedCard[]> {
  const allCards: ParsedCard[] = [];
  const seen = new Set<string>();
  let offset = 0;

  while (true) {
    try {
      const items = await fetchPage(offset, PAGE_SIZE);
      if (!items || items.length === 0) break;

      for (const raw of items) {
        const card = parseCard(raw);
        // 双重保险：listedOnly=true + askPrice > 0
        if (card.tokenId && !seen.has(card.tokenId) && card.askPriceUSDT > 0) {
          seen.add(card.tokenId);
          allCards.push(card);
        }
      }

      if (items.length < PAGE_SIZE) break;
      offset += PAGE_SIZE;
    } catch (err) {
      console.error(`Error fetching page at offset ${offset}:`, err);
      break;
    }
  }

  return allCards;
}

async function refreshCache() {
  if (isFetching) return;
  isFetching = true;
  try {
    console.log(`[${new Date().toISOString()}] Refreshing listed cards...`);
    const cards = await fetchAllCards();
    if (cards.length > 0) {
      cachedCards = cards;
      lastFetchTime = Date.now();
      console.log(
        `[${new Date().toISOString()}] Cached ${cards.length} listed cards`
      );
    }
  } catch (err) {
    console.error("Failed to refresh cache:", err);
  } finally {
    isFetching = false;
  }
}

// ============================================================
// Express Server
// ============================================================

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());

  // API: Get all listed cards
  app.get("/api/cards", (_req, res) => {
    res.json({
      cards: cachedCards,
      total: cachedCards.length,
      lastUpdated: lastFetchTime,
      isFetching,
    });
  });

  // API: Get single card by tokenId
  app.get("/api/cards/:tokenId", (req, res) => {
    const card = cachedCards.find((c) => c.tokenId === req.params.tokenId);
    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }
    res.json({ card });
  });

  // API: Force refresh
  app.post("/api/refresh", async (_req, res) => {
    await refreshCache();
    res.json({ total: cachedCards.length, lastUpdated: lastFetchTime });
  });

  // API: Status
  app.get("/api/status", (_req, res) => {
    res.json({
      total: cachedCards.length,
      lastUpdated: lastFetchTime,
      isFetching,
      uptime: process.uptime(),
    });
  });

  // Serve static files
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // SPA fallback
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3001;

  // Initial data fetch
  console.log("Starting initial data fetch (listedOnly=true)...");
  await refreshCache();

  // Schedule periodic refresh every 30 seconds
  setInterval(refreshCache, REFRESH_INTERVAL);

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    console.log(`API endpoints:`);
    console.log(`  GET  /api/cards       - All listed cards`);
    console.log(`  GET  /api/cards/:id   - Single card`);
    console.log(`  POST /api/refresh     - Force refresh`);
    console.log(`  GET  /api/status      - Server status`);
  });
}

startServer().catch(console.error);
