/**
 * Design note — Fog-white precision exhibition system.
 * This file should feel editorial, quiet, and premium: soft ivory surfaces,
 * restrained contrast, thin graphite typography, disciplined spacing, and
 * motion that reads as calm rather than playful.
 */
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@/contexts/WalletContext";
import { getGradeNumber, parseFMV, type CardData } from "@/lib/renaissApi";
import {
  ExternalLink,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";

type SortOption = "fmv-desc" | "fmv-asc" | "grade-desc" | "year-desc";
type FilterOption = "all" | "pokemon" | "psa10" | "psa9";

const filterMeta: { key: FilterOption; label: string }[] = [
  { key: "all", label: "全部藏品" },
  { key: "psa10", label: "PSA 10" },
  { key: "psa9", label: "PSA 9" },
  { key: "pokemon", label: "Pokémon" },
];

function normalizeAskPrice(raw: string): number | null {
  if (!raw || raw === "NO-ASK-PRICE") return null;
  const numeric = Number(raw);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return numeric > 1_000_000 ? numeric / 1e18 : numeric;
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
        result.sort(
          (a, b) => parseFMV(b.fmvPriceInUSD) - parseFMV(a.fmvPriceInUSD),
        );
        break;
      case "fmv-asc":
        result.sort(
          (a, b) => parseFMV(a.fmvPriceInUSD) - parseFMV(b.fmvPriceInUSD),
        );
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
  const uniqueCards = new Set(cards.map((card) => card.pokemonName)).size;
  const avgGrade =
    cards.length > 0
      ? cards.reduce((sum, card) => sum + getGradeNumber(card.grade), 0) / cards.length
      : 0;

  const statCards = [
    { label: "Collection Size", value: cards.length.toLocaleString(), detail: "已识别持仓卡牌" },
    {
      label: "Portfolio FMV",
      value: `$${totalFMV.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      detail: "按当前 FMV 汇总",
      accent: true,
    },
    { label: "Unique Characters", value: uniqueCards.toLocaleString(), detail: "按角色名称去重" },
    { label: "Average Grade", value: avgGrade ? avgGrade.toFixed(2) : "0.00", detail: "整体评级平均值" },
  ];

  return (
    <div className="relative pb-16 pt-24 sm:pt-28">
      <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top_left,rgba(214,195,155,0.18),transparent_45%),radial-gradient(circle_at_top_right,rgba(120,133,154,0.12),transparent_38%)]" />

      <section className="container space-y-6 sm:space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-4 lg:grid-cols-[1.25fr_0.95fr]"
        >
          <div className="rounded-[2rem] border border-black/8 bg-white/78 p-6 shadow-[0_24px_80px_-36px_rgba(24,24,27,0.32)] backdrop-blur-xl sm:p-8">
            <div className="mb-5 flex items-center gap-3 text-[0.68rem] uppercase tracking-[0.34em] text-black/35">
              <span className="h-px w-10 bg-black/12" />
              Collection / Address Lookup
            </div>
            <div className="max-w-2xl space-y-4">
              <h1 className="font-serif text-4xl leading-[0.95] text-neutral-950 sm:text-5xl lg:text-6xl">
                我的藏品
              </h1>
              <p className="max-w-xl text-sm leading-7 text-black/52 sm:text-[0.95rem]">
                地址查询结果、统计、筛选、排序与卡片详情都直接保留在当前页面。
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {statCards.map((item) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-[1.6rem] border border-black/8 bg-white/72 p-5 shadow-[0_24px_60px_-40px_rgba(24,24,27,0.28)] backdrop-blur-xl"
              >
                <div className="text-[0.64rem] uppercase tracking-[0.28em] text-black/35">
                  {item.label}
                </div>
                <div className={`mt-3 text-2xl font-semibold sm:text-[1.9rem] ${item.accent ? "text-neutral-950" : "text-black/82"}`}>
                  {item.value}
                </div>
                <div className="mt-1 text-xs text-black/45">{item.detail}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.58, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[2rem] border border-black/8 bg-white/78 p-4 shadow-[0_28px_90px_-42px_rgba(24,24,27,0.3)] backdrop-blur-xl sm:p-6"
        >
          <div className="grid gap-4 xl:grid-cols-[1.3fr_0.75fr]">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.28em] text-black/34">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Search / Filter / Sort
              </div>

              <div className="grid gap-3 lg:grid-cols-[1.35fr_0.7fr]">
                <label className="flex items-center gap-3 rounded-[1.2rem] border border-black/8 bg-[#f6f3ee] px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                  <Search className="h-4 w-4 text-black/35" />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="搜索卡牌名称、角色、序列号、系列、卡号"
                    className="w-full bg-transparent text-sm text-black/78 outline-none placeholder:text-black/28"
                  />
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="rounded-full border border-black/8 p-1 text-black/40 transition hover:bg-black/[0.04] hover:text-black/72"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="rounded-[1.2rem] border border-black/8 bg-[#f6f3ee] px-4 py-3">
                    <div className="text-[0.62rem] uppercase tracking-[0.22em] text-black/32">排序</div>
                    <select
                      value={sort}
                      onChange={(event) => setSort(event.target.value as SortOption)}
                      className="mt-1 w-full bg-transparent text-sm text-black/80 outline-none"
                    >
                      <option value="fmv-desc">FMV 从高到低</option>
                      <option value="fmv-asc">FMV 从低到高</option>
                      <option value="grade-desc">评级优先</option>
                      <option value="year-desc">年份最新</option>
                    </select>
                  </label>

                  <div className="flex items-center justify-between rounded-[1.2rem] border border-black/8 bg-[#f6f3ee] px-4 py-3">
                    <div>
                      <div className="text-[0.62rem] uppercase tracking-[0.22em] text-black/32">Result</div>
                      <div className="mt-1 text-lg font-semibold text-neutral-950">
                        {filteredCards.length.toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => void refreshCards()}
                      disabled={loading}
                      className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white px-3 py-2 text-xs font-medium text-black/72 transition hover:bg-black hover:text-white disabled:opacity-45"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                      手动刷新
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {filterMeta.map((item) => {
                  const active = filter === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setFilter(item.key)}
                      className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                        active
                          ? "bg-neutral-950 text-white shadow-[0_10px_30px_-18px_rgba(24,24,27,0.8)]"
                          : "border border-black/8 bg-white/70 text-black/56 hover:bg-black/[0.04] hover:text-black/78"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <aside className="rounded-[1.6rem] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(245,241,235,0.88))] p-5">
              <div className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.24em] text-black/32">
                <Sparkles className="h-3.5 w-3.5" />
                Collection Controls
              </div>
              <h2 className="mt-3 text-2xl font-medium leading-tight text-neutral-950">
                地址查询
              </h2>
              <p className="mt-3 text-sm leading-7 text-black/48">
                缓存恢复、手动刷新和结果浏览保持不变，只把入口放得更直接。
              </p>
              <a
                href="https://www.renaiss.xyz/marketplace"
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-black/70 transition hover:text-black"
              >
                前往 Renaiss 官方市场
                <ExternalLink className="h-4 w-4" />
              </a>
            </aside>
          </div>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredCards.map((card, index) => {
            const grade = getGradeNumber(card.grade);
            const fmv = parseFMV(card.fmvPriceInUSD);
            const ask = normalizeAskPrice(card.askPriceInUSDT);
            const shortSet = card.setName.replace(/^Pokemon\s*/i, "").trim();

            return (
              <motion.button
                key={card.id}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: Math.min(index * 0.02, 0.24), ease: [0.22, 1, 0.36, 1] }}
                onClick={() => onCardClick(card)}
                className="group overflow-hidden rounded-[1.8rem] border border-black/8 bg-white/82 text-left shadow-[0_26px_90px_-46px_rgba(24,24,27,0.36)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_100px_-42px_rgba(24,24,27,0.38)]"
              >
                <div className="relative overflow-hidden border-b border-black/6 bg-[radial-gradient(circle_at_top,rgba(214,195,155,0.22),transparent_55%),linear-gradient(180deg,#faf7f2,#f0ece4)] px-5 py-6">
                  <div className="absolute right-4 top-4 rounded-full border border-black/8 bg-white/80 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-black/52">
                    PSA {grade}
                  </div>
                  <img
                    src={card.frontImageUrl}
                    alt={card.pokemonName}
                    className="mx-auto h-56 w-auto max-w-full object-contain transition duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                </div>

                <div className="space-y-4 p-5">
                  <div>
                    <div className="text-[0.64rem] uppercase tracking-[0.24em] text-black/32">
                      {card.language} · {card.year || "Unknown year"}
                    </div>
                    <h3 className="mt-2 text-xl font-semibold leading-tight text-neutral-950">
                      {card.pokemonName}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-black/46">
                      {shortSet || card.setName} · #{card.cardNumber || "—"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-[1rem] border border-black/6 bg-[#f7f3ed] px-3 py-2.5">
                      <div className="text-[0.58rem] uppercase tracking-[0.2em] text-black/28">FMV</div>
                      <div className="mt-1 text-base font-semibold text-neutral-950">
                        ${fmv.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="rounded-[1rem] border border-black/6 bg-[#f7f3ed] px-3 py-2.5">
                      <div className="text-[0.58rem] uppercase tracking-[0.2em] text-black/28">Ask</div>
                      <div className="mt-1 text-base font-semibold text-neutral-950">
                        {ask === null || Number.isNaN(ask)
                          ? "—"
                          : `$${ask.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-black/42">
                    <span>Serial #{card.serial || "—"}</span>
                    <span>{card.gradingCompany || "PSA"}</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {filteredCards.length === 0 && !loading ? (
          <div className="rounded-[2rem] border border-dashed border-black/12 bg-white/55 px-6 py-16 text-center shadow-[0_18px_60px_-40px_rgba(24,24,27,0.25)]">
            <h3 className="text-2xl font-medium text-neutral-950">没有符合条件的卡牌</h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-black/45">
              请调整搜索词、筛选项或排序方式后重试。
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
