/**
 * Collection CardGrid — TCGPlay design language
 * Warm ivory surfaces, compact layout, large card images, no wasted space.
 * Unified with MarketLuxe visual system.
 */
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@/contexts/WalletContext";
import { getGradeNumber, getGradeBg, getGradeColor, parseFMV, type CardData } from "@/lib/renaissApi";
import { RefreshCw, Search, X } from "lucide-react";

type SortOption = "fmv-desc" | "fmv-asc" | "grade-desc" | "year-desc";
type FilterOption = "all" | "pokemon" | "psa10" | "psa9";

const filterMeta: { key: FilterOption; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "psa10", label: "PSA 10" },
  { key: "psa9", label: "PSA 9" },
];

function normalizeAskPrice(raw: string): number | null {
  if (!raw || raw === "NO-ASK-PRICE") return null;
  const numeric = Number(raw);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  // Safety check: if still astronomically large, return null
  if (numeric > 1_000_000) return null;
  return numeric;
}

export default function CardGrid({
  onCardClick,
}: {
  onCardClick: (card: CardData) => void;
}) {
  const { cards, refreshCards, loading } = useWallet();
  const [filter, setFilter] = useState<FilterOption>("all");
  const [sort, setSort] = useState<SortOption>("fmv-desc");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCards = useMemo(() => {
    let result = [...cards];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (card) =>
          card.pokemonName.toLowerCase().includes(q) ||
          card.serial.toLowerCase().includes(q) ||
          card.cardNumber.toLowerCase().includes(q) ||
          card.setName.toLowerCase().includes(q) ||
          card.name.toLowerCase().includes(q),
      );
    }

    switch (filter) {
      case "pokemon":
        result = result.filter((card) => card.type === "POKEMON");
        break;
      case "psa10":
        result = result.filter((card) => getGradeNumber(card.grade) === 10);
        break;
      case "psa9":
        result = result.filter((card) => getGradeNumber(card.grade) === 9);
        break;
      default:
        break;
    }

    switch (sort) {
      case "fmv-desc":
        result.sort((a, b) => parseFMV(b.fmvPriceInUSD) - parseFMV(a.fmvPriceInUSD));
        break;
      case "fmv-asc":
        result.sort((a, b) => parseFMV(a.fmvPriceInUSD) - parseFMV(b.fmvPriceInUSD));
        break;
      case "grade-desc":
        result.sort((a, b) => getGradeNumber(b.grade) - getGradeNumber(a.grade));
        break;
      case "year-desc":
        result.sort((a, b) => b.year - a.year);
        break;
      default:
        break;
    }

    return result;
  }, [cards, filter, searchQuery, sort]);

  const totalFMV = cards.reduce((sum, card) => sum + parseFMV(card.fmvPriceInUSD), 0);
  const avgGrade =
    cards.length > 0
      ? cards.reduce((sum, card) => sum + getGradeNumber(card.grade), 0) / cards.length
      : 0;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fbf8f2,#f5f0e8)] text-[#1a1612]">
      {/* 顶部统计区域 — 大数字突出展示 */}
      <div className="border-b border-[#ece5d8] bg-[rgba(251,248,242,0.95)] px-4 pt-4 pb-3 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          {/* 左侧：标题 + 大数字统计 */}
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#a89880] mb-2">我的藏品</div>
            <div className="flex flex-wrap items-end gap-5">
              {/* 总价値 — 最重要 */}
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#a89880]">Portfolio FMV</div>
                <div className="mt-0.5 font-mono text-[2rem] font-bold leading-none tracking-[-0.04em] text-[#1a1612]">
                  ${totalFMV.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
              {/* 分隔线 */}
              <div className="hidden sm:block h-10 w-px bg-[#e0d8cc]" />
              {/* 卡牌数量 */}
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#a89880]">Cards</div>
                <div className="mt-0.5 font-mono text-[1.6rem] font-bold leading-none tracking-[-0.03em] text-[#1a1612]">
                  {cards.length}
                </div>
              </div>
              {/* 分隔线 */}
              {avgGrade > 0 && <div className="hidden sm:block h-10 w-px bg-[#e0d8cc]" />}
              {/* 均分 */}
              {avgGrade > 0 && (
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#a89880]">Avg Grade</div>
                  <div className="mt-0.5 font-mono text-[1.6rem] font-bold leading-none tracking-[-0.03em] text-[#1a1612]">
                    {avgGrade.toFixed(1)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 右侧：刷新按鈕 */}
          <button
            onClick={() => void refreshCards()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#e0d8cc] bg-white/75 px-3 py-1.5 text-[12px] font-medium text-[#6b6055] transition-all hover:bg-[#1a1612] hover:text-white hover:border-[#1a1612] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            刷新
          </button>
        </div>

        {/* 搜索 + 排序 + 筛选 — 同一行 */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {/* 搜索框 */}
          <div className="relative flex-1 min-w-[180px] max-w-[320px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#a89880]" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索名称、序列号…"
              className="h-9 w-full rounded-full border border-[#e0d8cc] bg-[#faf7f2] pl-9 pr-8 text-[12px] text-[#1a1612] placeholder:text-[#b8ad9e] outline-none transition-all focus:border-[#c8a84a] focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a89880] hover:text-[#1a1612]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* 排序 */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="h-9 rounded-full border border-[#e0d8cc] bg-[#faf7f2] px-3 text-[12px] text-[#1a1612] outline-none transition-all focus:border-[#c8a84a] focus:bg-white"
          >
            <option value="fmv-desc">FMV 高→低</option>
            <option value="fmv-asc">FMV 低→高</option>
            <option value="grade-desc">评级优先</option>
            <option value="year-desc">年份最新</option>
          </select>

          {/* 筛选标签 */}
          <div className="flex items-center gap-1.5">
            {filterMeta.map((item) => {
              const active = filter === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setFilter(item.key)}
                  className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all duration-200 ${
                    active
                      ? "border-[#1a1612] bg-[#1a1612] text-white shadow-[0_8px_20px_rgba(26,22,18,0.18)]"
                      : "border-[#e0d8cc] bg-[#faf7f2] text-[#6b6055] hover:border-[#c8b898] hover:bg-white"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <span className="ml-auto font-mono text-[11px] text-[#a89880]">
            {filteredCards.length} 条结果
          </span>
        </div>
      </div>

      {/* 卡片网格 */}
      <div className="px-4 py-4 sm:px-6">
        {filteredCards.length === 0 && !loading ? (
          <div className="rounded-[1.75rem] border border-[#e8e0d0] bg-white/78 p-8 text-center">
            <p className="font-serif text-3xl tracking-[-0.04em] text-[#1a1612]">没有符合条件的卡牌</p>
            <p className="mt-3 text-sm leading-7 text-[#8a7f70]">
              请尝试调整搜索词或筛选条件。
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6">
            {filteredCards.map((card, index) => {
              const fmv = parseFMV(card.fmvPriceInUSD);
              const ask = normalizeAskPrice(card.askPriceInUSDT);

              return (
                <motion.button
                  key={card.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: Math.min(index * 0.022, 0.55), ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => onCardClick(card)}
                  className="group overflow-hidden rounded-[1.2rem] border border-[#2a2620] bg-[#141210] text-left shadow-[0_10px_32px_rgba(10,8,6,0.28)] transition-all duration-300 hover:-translate-y-1 hover:border-[#4a3f28] hover:shadow-[0_18px_52px_rgba(10,8,6,0.38)]"
                >
                  {/* 顶部标签行 */}
                  <div className="flex items-center justify-between px-3 pt-2.5 pb-0">
                    <span className="font-mono text-[10px] font-medium text-[#c8b890]"></span>
                    <span className={`rounded-[0.4rem] border px-1.5 py-0.5 text-[9px] font-semibold ${getGradeBg(card.grade)} ${getGradeColor(card.grade)}`}>
                      {card.grade}
                    </span>
                  </div>

                  {/* 卡牌图片区：深色背景，铺满展示 */}
                  <div className="relative overflow-hidden">
                    <img
                      src={card.frontImageUrl}
                      alt={card.pokemonName}
                      loading="lazy"
                      className="mx-auto block w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  </div>

                  {/* 序列号 */}
                  {card.serial && (
                    <p className="px-3 pb-1.5 text-center font-mono text-[10px] font-medium tracking-[0.18em] text-white/60 select-all">
                      {card.serial}
                    </p>
                  )}

                  {/* 底部信息区：暖象牙色背景 */}
                  <div className="border-t border-[#2a2620] bg-[#faf7f1] px-3 pt-2.5 pb-3">
                    <p className="line-clamp-1 text-[0.84rem] font-semibold tracking-[-0.03em] text-[#1a1612]">
                      {card.pokemonName || card.name}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-[10px] text-[#8a7f70]">
                      {card.setName.replace(/^Pokemon\s*/i, "").trim()} · #{card.cardNumber}
                    </p>
                    {/* 价格区：Ask 和 FMV 同等重要，左右并排清晰展示 */}
                    <div className="mt-2 grid grid-cols-2 gap-1.5">
                      {/* Ask */}
                      <div className="rounded-[0.6rem] bg-[#f0ebe0] px-2.5 py-2">
                        <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#a89880]">Ask</span>
                        <p className="mt-0.5 font-mono text-[0.95rem] font-bold leading-none text-[#1a1612]">
                          {ask !== null
                            ? `$${ask.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                            : <span className="text-[0.7rem] font-normal text-[#b8ad9e]">—</span>}
                        </p>
                      </div>
                      {/* FMV */}
                      <div className="rounded-[0.6rem] bg-[#f0ebe0] px-2.5 py-2">
                        <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#a89880]">FMV</span>
                        <p className="mt-0.5 font-mono text-[0.95rem] font-bold leading-none text-[#1a1612]">
                          ${fmv.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
