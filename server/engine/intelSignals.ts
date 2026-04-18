type InsightSection = "tcg" | "web3" | "collector";
type InsightCategory = "official" | "community" | "tournament" | "cross_lang" | "alert";
type InsightGame = "pokemon" | "onepiece" | "yugioh" | "general";
type SignalSeverity = "high" | "medium" | "low";

interface BaseInsightLike {
  title?: string | null;
  summary?: string | null;
  source?: string | null;
  section?: InsightSection | null;
  category?: InsightCategory | null;
  game?: InsightGame | null;
  isNew?: number | boolean | null;
}

const GAME_KEYWORDS: Record<Exclude<InsightGame, "general">, string[]> = {
  pokemon: ["pokemon", "pokémon", "pikachu", "charizard", "scarlet & violet", "tcg live", "trainer"],
  onepiece: ["one piece", "opcg", "don!!", "straw hat", "pirates party", "treasure cup", "bandai card"],
  yugioh: ["yu-gi-oh", "yugioh", "duelist", "ycs", "forbidden", "limited list", "regional qualifier", "speed duel"],
};

const CATEGORY_HINTS = {
  tournament: ["championship", "regional", "regionals", "qualifier", "treasure cup", "pirates party", "ycs", "event", "tournament", "store championship"],
  official: ["official", "announcement", "notice", "updated", "update", "release", "launch", "maintenance", "rule", "rulebook", "banned", "restricted", "forbidden", "limited"],
  cross_lang: ["translation", "translated", "japan", "japanese", "cn", "china", "asia", "global version"],
};

const SIGNAL_RULES: Array<{ label: string; keywords: string[]; baseScore: number }> = [
  { label: "禁限/规则", keywords: ["banned", "restricted", "forbidden", "limited", "rules", "rulebook", "policy", "statement"], baseScore: 90 },
  { label: "赛事升级", keywords: ["championship", "regional", "qualifier", "ycs", "world championship", "store championship", "tournament"], baseScore: 84 },
  { label: "新品/补货", keywords: ["booster", "deck", "collection", "release", "launch", "updated", "restock", "preorder", "product"], baseScore: 78 },
  { label: "热度/价格", keywords: ["price", "market", "spike", "surge", "shortage", "scarcity", "demand", "sell out"], baseScore: 72 },
  { label: "联动/IP", keywords: ["collaboration", "crossover", "netflix", "anniversary", "special set", "promo"], baseScore: 68 },
  { label: "安全/风险", keywords: ["hack", "exploit", "security", "scam", "vulnerability", "breach"], baseScore: 92 },
];

function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function countChineseChars(text: string): number {
  const matches = text.match(/[\u4e00-\u9fff]/g);
  return matches?.length ?? 0;
}

function cleanSummary(summary: string, title: string, source: string): string {
  let result = normalizeText(summary || "");
  if (!result) return title;

  const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedSource = source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  result = result
    .replace(/^\[[^\]]+\]\s*/g, "")
    .replace(/\b(?:The post|This post) .*? appeared first on .*?\.?$/i, "")
    .replace(/\bfirst appeared on .*?\.?$/i, "")
    .replace(new RegExp(`^${escapedTitle}[-—:：\s]*`, "i"), "")
    .replace(new RegExp(`^${escapedSource}[-—:：\s]*`, "i"), "")
    .replace(/\s+/g, " ")
    .trim();

  return result || title;
}

function detectGame(text: string, fallback: InsightGame = "general"): InsightGame {
  if (fallback !== "general") return fallback;
  const haystack = text.toLowerCase();
  const scores = Object.entries(GAME_KEYWORDS).map(([game, keywords]) => ({
    game: game as Exclude<InsightGame, "general">,
    score: keywords.reduce((acc, keyword) => acc + (haystack.includes(keyword) ? 1 : 0), 0),
  }));
  scores.sort((a, b) => b.score - a.score);
  return scores[0]?.score ? scores[0].game : fallback;
}

function detectCategory(text: string, fallback: InsightCategory = "community"): InsightCategory {
  const haystack = text.toLowerCase();
  if (CATEGORY_HINTS.tournament.some((keyword) => haystack.includes(keyword))) return "tournament";
  if (CATEGORY_HINTS.cross_lang.some((keyword) => haystack.includes(keyword))) return "cross_lang";
  if (fallback === "official") return "official";
  if (CATEGORY_HINTS.official.some((keyword) => haystack.includes(keyword))) return "official";
  return fallback;
}

function extractMatchedKeywords(text: string): string[] {
  const haystack = text.toLowerCase();
  const matched = new Set<string>();

  Object.values(GAME_KEYWORDS).flat().forEach((keyword) => {
    if (haystack.includes(keyword)) matched.add(keyword);
  });

  SIGNAL_RULES.forEach((rule) => {
    rule.keywords.forEach((keyword) => {
      if (haystack.includes(keyword)) matched.add(keyword);
    });
  });

  return Array.from(matched).slice(0, 8);
}

function scoreSignal(text: string, category: InsightCategory, isNew: boolean): { signalScore: number; signalSeverity: SignalSeverity; signalLabel: string } {
  const haystack = text.toLowerCase();
  let signalScore = isNew ? 42 : 28;
  let signalLabel = "常规动态";

  for (const rule of SIGNAL_RULES) {
    if (rule.keywords.some((keyword) => haystack.includes(keyword))) {
      signalScore = Math.max(signalScore, rule.baseScore);
      signalLabel = rule.label;
    }
  }

  if (category === "official") signalScore += 8;
  if (category === "tournament") signalScore += 6;
  if (/today|now|breaking|just announced|has been announced|updated/i.test(text)) signalScore += 4;

  signalScore = Math.min(signalScore, 98);
  const signalSeverity: SignalSeverity = signalScore >= 82 ? "high" : signalScore >= 64 ? "medium" : "low";
  return { signalScore, signalSeverity, signalLabel };
}

function formatGameLabel(game: InsightGame): string {
  if (game === "pokemon") return "Pokémon";
  if (game === "onepiece") return "One Piece";
  if (game === "yugioh") return "Yu-Gi-Oh";
  return "综合";
}

function buildChineseSummary(title: string, cleanedSummary: string, game: InsightGame, signalLabel: string): string {
  const gameLabel = formatGameLabel(game);
  const summarySource = cleanedSummary || title;

  if (countChineseChars(summarySource) >= 16) {
    return summarySource.slice(0, 118);
  }

  if (signalLabel === "禁限/规则") {
    return `${gameLabel} 规则侧出现值得优先关注的调整，核心主题是“${title}”。建议重点查看适用时间、影响范围与后续执行节奏。`.slice(0, 118);
  }
  if (signalLabel === "赛事升级") {
    return `${gameLabel} 赛事面有新变化，当前情报聚焦“${title}”。可优先关注赛程节点、参与门槛与对热度的带动效果。`.slice(0, 118);
  }
  if (signalLabel === "新品/补货") {
    return `${gameLabel} 产品与供给节奏出现更新，当前线索指向“${title}”。建议继续跟踪发售时间、补货节奏与二级市场反应。`.slice(0, 118);
  }
  if (signalLabel === "热度/价格") {
    return `${gameLabel} 热度与价格相关信号正在抬升，本条围绕“${title}”。更适合继续观察供需变化和讨论度是否持续放大。`.slice(0, 118);
  }
  if (signalLabel === "联动/IP") {
    return `${gameLabel} 出现新的联动或话题扩散线索，核心信息是“${title}”。建议关注传播面、受众圈层与产品承接能力。`.slice(0, 118);
  }
  if (signalLabel === "安全/风险") {
    return `${gameLabel} 相关内容包含风险信号，当前重点是“${title}”。需要尽快确认影响对象、处置方式与后续披露节奏。`.slice(0, 118);
  }

  return `${gameLabel} 情报流新增一条值得关注的动态，核心主题是“${title}”。可结合来源权重、发布时间与后续讨论热度继续跟踪。`.slice(0, 118);
}

export function enrichInsightPresentation<T extends BaseInsightLike>(item: T) {
  const title = normalizeText(item.title || "");
  const source = normalizeText(item.source || "未知来源");
  const cleanedSummary = cleanSummary(item.summary || "", title, source);
  const compositeText = `${title} ${cleanedSummary} ${source}`;
  const game = item.section === "tcg" ? detectGame(compositeText, item.game || "general") : "general";
  const category = detectCategory(compositeText, item.category || "community");
  const matchedKeywords = extractMatchedKeywords(compositeText);
  const { signalScore, signalSeverity, signalLabel } = scoreSignal(compositeText, category, Boolean(item.isNew));
  const summary = buildChineseSummary(title, cleanedSummary, game, signalLabel);

  return {
    ...item,
    game,
    category,
    summary,
    matchedKeywords,
    signalScore,
    signalSeverity,
    signalLabel,
  };
}

export function deriveAlertMetadata(item: BaseInsightLike) {
  const enriched = enrichInsightPresentation(item);
  return {
    isAlert: enriched.signalSeverity === "high" && ["禁限/规则", "赛事升级", "新品/补货", "安全/风险"].includes(enriched.signalLabel),
    alertKeywords: enriched.matchedKeywords.join(", "),
    severity: enriched.signalSeverity,
    signalLabel: enriched.signalLabel,
    signalScore: enriched.signalScore,
    summary: enriched.summary,
    game: enriched.game,
    category: enriched.category,
  };
}
