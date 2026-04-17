/**
 * Design reminder for this page:
 * Market should feel direct and operational. Filters live on the left,
 * cards stay dense on the right, and platform switching happens through
 * clear logo-based selectors. Full-width layout, no container max-width cap.
 * Style: warm ivory / zinc — TCGPlay's own design language, not a clone of any reference.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ExternalLink,
  Grid3X3,
  List,
  Loader2,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import CardDetailModal from "@/components/collection/CardDetail";
import { useRenaissData, type SortBy } from "@/hooks/useRenaissData";
import {
  getGradeBg,
  getGradeColor,
  getRenaissCardUrl,
  getRenaissImageUrl,
  type CardData,
  type RenaissCard,
} from "@/lib/renaissApi";

type ViewMode = "grid" | "list";
type PlatformId = "renaiss" | "collector";

const PAGE_STEP = 30;

const sortOptions: { label: string; value: SortBy }[] = [
  { label: "最新上架", value: "newest" },
  { label: "价格 低→高", value: "price-asc" },
  { label: "价格 高→低", value: "price-desc" },
  { label: "等级", value: "grade" },
  { label: "FMV", value: "fmv" },
  { label: "溢价率", value: "premium" },
];

const gradeOptions = ["all", "10", "9", "8", "7"];
const languageOptions = ["all", "Japanese", "English", "Simplified Chinese"];
const graderOptions = ["all", "PSA", "BGS", "CGC", "TAG"];

const platforms: {
  id: PlatformId;
  label: string;
  status: string;
  logo: string;
  live: boolean;
  accent: string;
}[] = [
  {
    id: "renaiss",
    label: "Renaiss",
    status: "Live",
    logo: "/logos/renaiss-logo.png",
    live: true,
    accent: "#e8f4e8",
  },
  {
    id: "collector",
    label: "Collector Market",
    status: "即将上线",
    logo: "/logos/collector-logo.png",
    live: false,
    accent: "#fff3e8",
  },
];

function formatCurrency(value: number) {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function getPremiumPct(ask: number, fmv: number): number | null {
  if (!fmv || fmv <= 0) return null;
  return Math.round(((ask - fmv) / fmv) * 100);
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[1.2rem] border border-[#ece5d8] bg-white/60">
      <div className="aspect-[4/5] bg-gradient-to-b from-[#f3ede4] to-[#ede5d8] animate-[shimmer_1.8s_ease-in-out_infinite]" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-3/4 animate-pulse rounded-full bg-[#ede5d8]" />
        <div className="h-3 w-1/2 animate-pulse rounded-full bg-[#ede5d8]" />
        <div className="flex items-end justify-between pt-1">
          <div className="h-5 w-16 animate-pulse rounded-full bg-[#ede5d8]" />
          <div className="h-3 w-12 animate-pulse rounded-full bg-[#ede5d8]" />
        </div>
      </div>
    </div>
  );
}

function PremiumBadge({ premium }: { premium: number }) {
  const isBelow = premium < 0;
  const isAbove = premium > 0;
  return (
    <span
      className={`absolute left-2.5 top-2.5 rounded-[0.45rem] px-1.5 py-0.5 font-mono text-[9px] font-semibold backdrop-blur-sm ${
        isBelow
          ? "bg-black/55 text-[#6ee7b7]"
          : isAbove
          ? "bg-black/55 text-[#fca5a5]"
          : "bg-black/40 text-white/50"
      }`}
    >
      {isBelow ? "−" : isAbove ? "+" : ""}
      {Math.abs(premium)}%
    </span>
  );
}

function MarketGridCard({ card, onOpen, index }: { card: RenaissCard; onOpen: () => void; index: number }) {
  const premium = getPremiumPct(card.askPriceUSDT, card.fmvPriceUSD);

  return (
    <motion.button
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.022, 0.55), ease: [0.22, 1, 0.36, 1] }}
      onClick={onOpen}
      className="group overflow-hidden rounded-[1.2rem] border border-[#e8e0d0] bg-white/88 text-left shadow-[0_10px_32px_rgba(40,32,20,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#d4c18f]/80 hover:shadow-[0_18px_52px_rgba(160,130,60,0.11)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden border-b border-[#ece5d8] bg-[linear-gradient(180deg,#faf7f2,#f0ebe3)] p-2.5">
        <img
          src={getRenaissImageUrl(card.frontImageUrl, 640)}
          alt={card.name}
          loading="lazy"
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span
          className={`absolute right-2.5 top-2.5 rounded-full border px-2 py-0.5 text-[9px] font-semibold ${getGradeBg(card.grade)} ${getGradeColor(card.grade)}`}
        >
          {card.grade}
        </span>
        {premium !== null && <PremiumBadge premium={premium} />}
      </div>
      <div className="space-y-1.5 p-3">
        <p className="line-clamp-1 text-[0.86rem] font-semibold tracking-[-0.03em] text-[#1a1612]">
          {card.pokemonName || card.name}
        </p>
        <p className="line-clamp-1 text-[10px] leading-5 text-[#8a7f70]">
          {card.setName} · #{card.cardNumber}
        </p>
        <div className="flex items-end justify-between gap-2 pt-0.5">
          <div>
            <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#a89880]">Ask</span>
            <strong className="mt-0.5 block font-mono text-[0.88rem] text-[#1a1612]">
              {formatCurrency(card.askPriceUSDT)}
            </strong>
          </div>
          <div className="text-right">
            <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#a89880]">FMV</span>
            <strong className="mt-0.5 block font-mono text-[10px] text-[#6b6055]">
              {formatCurrency(card.fmvPriceUSD)}
            </strong>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function MarketListCard({ card, onOpen }: { card: RenaissCard; onOpen: () => void }) {
  const premium = getPremiumPct(card.askPriceUSDT, card.fmvPriceUSD);
  const isAbove = premium !== null && premium > 0;
  const isBelow = premium !== null && premium < 0;

  return (
    <button
      onClick={onOpen}
      className="grid grid-cols-[88px_1fr_auto] items-center gap-4 rounded-[1.25rem] border border-[#e8e0d0] bg-white/86 p-3 text-left shadow-[0_12px_38px_rgba(40,32,20,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d4c18f]/80"
    >
      <div className="aspect-[3/4] overflow-hidden rounded-[0.85rem] bg-[linear-gradient(180deg,#faf7f2,#f0ebe3)] p-1.5">
        <img
          src={getRenaissImageUrl(card.frontImageUrl, 480)}
          alt={card.name}
          loading="lazy"
          className="h-full w-full object-contain"
        />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-semibold ${getGradeBg(card.grade)} ${getGradeColor(card.grade)}`}
          >
            {card.grade}
          </span>
          {premium !== null && (
            <span
              className={`inline-flex items-center rounded-[0.4rem] border px-1.5 py-0.5 font-mono text-[9px] font-semibold ${
                isBelow
                  ? "border-[#b8e4c8] bg-[#edf9f2] text-[#2d7a4f]"
                  : isAbove
                  ? "border-[#f0c8c8] bg-[#fef2f2] text-[#b94040]"
                  : "border-[#e0d8cc] bg-[#f6f2eb] text-[#8a7f70]"
              }`}
            >
              {isBelow ? "−" : isAbove ? "+" : ""}
              {Math.abs(premium)}%
            </span>
          )}
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#a89880]">{card.language}</span>
        </div>
        <p className="mt-2 truncate text-[1.05rem] font-semibold tracking-[-0.03em] text-[#1a1612]">
          {card.pokemonName || card.name}
        </p>
        <p className="mt-0.5 truncate text-xs text-[#8a7f70]">
          {card.setName} · #{card.cardNumber} · {card.serial || "—"}
        </p>
      </div>
      <div className="text-right">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#a89880]">Ask</span>
          <strong className="mt-1 block font-mono text-lg text-[#1a1612]">
            {formatCurrency(card.askPriceUSDT)}
          </strong>
        </div>
        <div className="mt-2.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#a89880]">FMV</span>
          <strong className="mt-1 block font-mono text-sm text-[#6b6055]">
            {formatCurrency(card.fmvPriceUSD)}
          </strong>
        </div>
      </div>
    </button>
  );
}

function toCardDetailData(card: RenaissCard): CardData {
  return {
    id: card.id,
    tokenId: card.tokenId,
    name: card.name,
    ownerAddress: card.ownerAddress,
    fmvPriceInUSD: String(card.fmvPriceUSD),
    frontImageUrl: card.frontImageUrl,
    backImageUrl: null,
    serial: card.serial,
    grade: card.grade,
    year: card.year,
    setName: card.setName,
    cardNumber: card.cardNumber,
    pokemonName: card.pokemonName || card.name,
    language: card.language,
    gradingCompany: card.gradingCompany,
    vaultLocation: "platform",
    askPriceInUSDT: String(card.askPriceUSDT),
    type: card.category,
  };
}

/** 筛选标签胶囊 */
function FilterChip({
  label,
  active,
  onClick,
  disabled,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "border-[#1a1612] bg-[#1a1612] text-white shadow-[0_8px_20px_rgba(26,22,18,0.18)]"
          : "border-[#e0d8cc] bg-[#faf7f2] text-[#6b6055] hover:border-[#c8b898] hover:bg-white"
      }`}
    >
      {label}
    </button>
  );
}

export default function MarketLuxe() {
  const [, navigate] = useLocation();
  const {
    cards,
    loading,
    initialLoaded,
    error,
    filters,
    setFilters,
    lastUpdated,
    refreshData,
    totalCount,
  } = useRenaissData();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId>("renaiss");
  const [visibleCount, setVisibleCount] = useState(PAGE_STEP);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [graderFilter, setGraderFilter] = useState("all");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const platformMeta = platforms.find((item) => item.id === selectedPlatform) ?? platforms[0];
  const isComingSoon = selectedPlatform === "collector";

  useEffect(() => {
    setVisibleCount(PAGE_STEP);
  }, [filters, selectedPlatform]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || isComingSoon) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => prev + PAGE_STEP);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [isComingSoon]);

  const visibleCards = useMemo(() => cards.slice(0, visibleCount), [cards, visibleCount]);

  const resetFilters = () => {
    setFilters({
      search: "",
      category: "all",
      gradeFilter: "all",
      graderCompany: "all",
      priceMin: 0,
      priceMax: 100000,
      language: "all",
      yearFrom: "",
      yearTo: "",
      sortBy: "newest",
    });
    setGraderFilter("all");
    setYearFrom("");
    setYearTo("");
  };

  const FilterPanel = () => (
    <div className="space-y-5">
      {/* 平台选择 */}
      <div>
        <div className="mb-3 text-[10px] font-mono uppercase tracking-[0.28em] text-[#a89880]">平台</div>
        <div className="space-y-2">
          {platforms.map((platform) => {
            const active = selectedPlatform === platform.id;
            return (
              <button
                key={platform.id}
                onClick={() => setSelectedPlatform(platform.id)}
                className={`w-full rounded-[1.15rem] border px-3 py-2.5 text-left transition-all duration-250 ${
                  active
                    ? "border-[#1a1612] bg-[#1a1612] text-white shadow-[0_14px_36px_rgba(26,22,18,0.16)]"
                    : "border-[#e0d8cc] bg-[#faf7f2] text-[#1a1612] hover:bg-white hover:border-[#c8b898]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[0.8rem] border ${
                      active ? "border-white/12 bg-white/10" : "border-[#e0d8cc] bg-white"
                    }`}
                  >
                    <img
                      src={platform.logo}
                      alt={platform.label}
                      className="h-7 w-7 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className={`text-[13px] font-semibold ${active ? "text-white" : "text-[#1a1612]"}`}>
                      {platform.label}
                    </div>
                    <div
                      className={`mt-0.5 text-[11px] ${
                        active ? "text-white/55" : platform.live ? "text-[#4a9e6a]" : "text-[#a89880]"
                      }`}
                    >
                      {platform.status}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-[#ece5d8]" />

      {/* 搜索 */}
      <div>
        <div className="mb-2 text-[10px] font-mono uppercase tracking-[0.28em] text-[#a89880]">搜索</div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a89880]" />
          <input
            value={filters.search}
            disabled={isComingSoon}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="名称、系列、序列号…"
            className="h-11 w-full rounded-[0.95rem] border border-[#e0d8cc] bg-[#faf7f2] pl-10 pr-4 text-[13px] text-[#1a1612] placeholder:text-[#b8ad9e] outline-none transition-all focus:border-[#c8a84a] focus:bg-white disabled:cursor-not-allowed disabled:opacity-45"
          />
        </div>
      </div>

      {/* 排序 */}
      <div>
        <div className="mb-2 text-[10px] font-mono uppercase tracking-[0.28em] text-[#a89880]">排序</div>
        <select
          value={filters.sortBy}
          disabled={isComingSoon}
          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as SortBy })}
          className="h-11 w-full rounded-[0.95rem] border border-[#e0d8cc] bg-[#faf7f2] px-4 text-[13px] text-[#1a1612] outline-none transition-all focus:border-[#c8a84a] focus:bg-white disabled:cursor-not-allowed disabled:opacity-45"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="h-px bg-[#ece5d8]" />

      {/* 语言 */}
      <div>
        <div className="mb-2.5 text-[10px] font-mono uppercase tracking-[0.28em] text-[#a89880]">语言</div>
        <div className="flex flex-wrap gap-1.5">
          {languageOptions.map((opt) => (
            <FilterChip
              key={opt}
              label={opt === "all" ? "全部" : opt === "Japanese" ? "日语" : opt === "English" ? "英语" : "中文"}
              active={filters.language === opt}
              onClick={() => setFilters({ ...filters, language: opt })}
              disabled={isComingSoon}
            />
          ))}
        </div>
      </div>

      {/* 评级机构 */}
      <div>
        <div className="mb-2.5 text-[10px] font-mono uppercase tracking-[0.28em] text-[#a89880]">评级机构</div>
        <div className="flex flex-wrap gap-1.5">
          {graderOptions.map((opt) => (
            <FilterChip
              key={opt}
              label={opt === "all" ? "全部" : opt}
              active={graderFilter === opt}
              onClick={() => {
                setGraderFilter(opt);
                setFilters({ ...filters, graderCompany: opt });
              }}
              disabled={isComingSoon}
            />
          ))}
        </div>
      </div>

      {/* 等级 */}
      <div>
        <div className="mb-2.5 text-[10px] font-mono uppercase tracking-[0.28em] text-[#a89880]">等级</div>
        <div className="flex flex-wrap gap-1.5">
          {gradeOptions.map((opt) => (
            <FilterChip
              key={opt}
              label={opt === "all" ? "全部" : `PSA ${opt}`}
              active={filters.gradeFilter === opt}
              onClick={() => setFilters({ ...filters, gradeFilter: opt })}
              disabled={isComingSoon}
            />
          ))}
        </div>
      </div>

      <div className="h-px bg-[#ece5d8]" />

      {/* 价格区间 */}
      <div>
        <div className="mb-2.5 text-[10px] font-mono uppercase tracking-[0.28em] text-[#a89880]">价格区间 (USDT)</div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={filters.priceMin || ""}
            disabled={isComingSoon}
            onChange={(e) => setFilters({ ...filters, priceMin: Number(e.target.value) || 0 })}
            placeholder="最低"
            className="h-10 w-full rounded-[0.85rem] border border-[#e0d8cc] bg-[#faf7f2] px-3 text-[13px] text-[#1a1612] placeholder:text-[#b8ad9e] outline-none transition-all focus:border-[#c8a84a] focus:bg-white disabled:cursor-not-allowed disabled:opacity-45"
          />
          <input
            type="number"
            value={filters.priceMax >= 100000 ? "" : filters.priceMax}
            disabled={isComingSoon}
            onChange={(e) => setFilters({ ...filters, priceMax: Number(e.target.value) || 100000 })}
            placeholder="最高"
            className="h-10 w-full rounded-[0.85rem] border border-[#e0d8cc] bg-[#faf7f2] px-3 text-[13px] text-[#1a1612] placeholder:text-[#b8ad9e] outline-none transition-all focus:border-[#c8a84a] focus:bg-white disabled:cursor-not-allowed disabled:opacity-45"
          />
        </div>
      </div>

      {/* 年份 */}
      <div>
        <div className="mb-2.5 text-[10px] font-mono uppercase tracking-[0.28em] text-[#a89880]">年份</div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={yearFrom}
            disabled={isComingSoon}
            onChange={(e) => {
              setYearFrom(e.target.value);
              setFilters({ ...filters, yearFrom: e.target.value });
            }}
            placeholder="从"
            className="h-10 w-full rounded-[0.85rem] border border-[#e0d8cc] bg-[#faf7f2] px-3 text-[13px] text-[#1a1612] placeholder:text-[#b8ad9e] outline-none transition-all focus:border-[#c8a84a] focus:bg-white disabled:cursor-not-allowed disabled:opacity-45"
          />
          <input
            type="number"
            value={yearTo}
            disabled={isComingSoon}
            onChange={(e) => {
              setYearTo(e.target.value);
              setFilters({ ...filters, yearTo: e.target.value });
            }}
            placeholder="至"
            className="h-10 w-full rounded-[0.85rem] border border-[#e0d8cc] bg-[#faf7f2] px-3 text-[13px] text-[#1a1612] placeholder:text-[#b8ad9e] outline-none transition-all focus:border-[#c8a84a] focus:bg-white disabled:cursor-not-allowed disabled:opacity-45"
          />
        </div>
      </div>

      {/* 重置 */}
      <button
        onClick={resetFilters}
        disabled={isComingSoon}
        className="w-full rounded-full border border-[#e0d8cc] bg-[#faf7f2] py-2.5 text-[13px] font-medium text-[#6b6055] transition-all hover:border-[#1a1612] hover:bg-[#1a1612] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        重置全部筛选
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fbf8f2,#f5f0e8)] text-[#1a1612]">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 border-b border-[#ece5d8] bg-[rgba(251,248,242,0.9)] backdrop-blur-2xl">
        <div className="w-full px-4 py-3 sm:px-5 lg:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e0d8cc] bg-white/75 text-[#6b6055] transition-all duration-300 hover:bg-[#1a1612] hover:text-white hover:border-[#1a1612]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[15px] tracking-tight text-[#1a1612]">TCG Market</span>
              {!isComingSoon && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#b8e4c8] bg-[#edf9f2] px-2 py-0.5 text-[10px] font-medium text-[#2d7a4f]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4a9e6a] animate-pulse" />
                  Live
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {!isComingSoon && (
              <span className="hidden sm:block font-mono text-[11px] text-[#a89880] tabular-nums">
                {totalCount.toLocaleString()} 张在售
              </span>
            )}
            {/* 移动端筛选按钮 */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#e0d8cc] bg-white/75 px-3 py-1.5 text-[12px] font-medium text-[#6b6055] transition-all hover:bg-[#1a1612] hover:text-white hover:border-[#1a1612] xl:hidden"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              筛选
            </button>
            <button
              onClick={() => refreshData()}
              disabled={loading || isComingSoon}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#e0d8cc] bg-white/75 px-3 py-1.5 text-[12px] font-medium text-[#6b6055] transition-all hover:bg-[#1a1612] hover:text-white hover:border-[#1a1612] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading && !isComingSoon ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">刷新</span>
            </button>
          </div>
        </div>
      </header>

      {/* 移动端筛选抽屉 */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] bg-black/30 backdrop-blur-sm xl:hidden"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed inset-y-0 left-0 z-[90] w-[300px] overflow-y-auto border-r border-[#ece5d8] bg-[#fbf8f2] p-5 xl:hidden"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="font-semibold text-[15px] text-[#1a1612]">筛选</span>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#e0d8cc] bg-white text-[#6b6055] transition hover:bg-[#1a1612] hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <FilterPanel />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="w-full px-4 py-5 sm:px-5 lg:px-6">
        <section className="grid gap-4 xl:grid-cols-[268px_minmax(0,1fr)] 2xl:grid-cols-[288px_minmax(0,1fr)]">
          {/* 左侧筛选栏 — 桌面端 */}
          <aside className="hidden xl:block xl:sticky xl:top-[4.5rem] xl:self-start xl:max-h-[calc(100vh-5.5rem)] xl:overflow-y-auto">
            <div className="rounded-[1.5rem] border border-[#e8e0d0] bg-white/78 p-4 shadow-[0_14px_36px_rgba(40,32,20,0.06)]">
              <FilterPanel />
            </div>
          </aside>

          {/* 右侧卡牌区 */}
          <section className="min-w-0">
            {/* 工具栏 */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2 text-[12px] text-[#8a7f70]">
                <span className="rounded-full border border-[#e0d8cc] bg-[#faf7f2] px-3 py-1.5 font-medium text-[#1a1612]">
                  {platformMeta.label}
                </span>
                <span className="rounded-full border border-[#e0d8cc] bg-[#faf7f2] px-3 py-1.5">
                  {isComingSoon ? "即将上线" : `${cards.length.toLocaleString()} 条结果`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {!isComingSoon && (
                  <a
                    href="https://www.renaiss.xyz/ref/77ouo"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#e0d8cc] bg-white px-3.5 py-2 text-[12px] font-medium text-[#6b6055] transition hover:text-[#1a1612] hover:border-[#c8b898]"
                  >
                    官方市场
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                <div className="inline-flex rounded-full border border-[#e0d8cc] bg-[#faf7f2] p-0.5">
                  <button
                    onClick={() => setViewMode("grid")}
                    disabled={isComingSoon}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                      viewMode === "grid"
                        ? "bg-[#1a1612] text-white shadow-[0_8px_20px_rgba(26,22,18,0.18)]"
                        : "text-[#8a7f70] hover:text-[#1a1612]"
                    }`}
                  >
                    <Grid3X3 className="h-3.5 w-3.5" />
                    网格
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    disabled={isComingSoon}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                      viewMode === "list"
                        ? "bg-[#1a1612] text-white shadow-[0_8px_20px_rgba(26,22,18,0.18)]"
                        : "text-[#8a7f70] hover:text-[#1a1612]"
                    }`}
                  >
                    <List className="h-3.5 w-3.5" />
                    列表
                  </button>
                </div>
              </div>
            </div>

            {/* 内容区 */}
            <div>
              {isComingSoon ? (
                <div className="flex min-h-[36rem] items-center justify-center rounded-[1.75rem] border border-dashed border-[#d4c8b4] bg-white/70 p-8">
                  <div className="max-w-md text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.4rem] border border-[#e0d8cc] bg-white shadow-[0_14px_44px_rgba(40,32,20,0.08)]">
                      <img
                        src="/logos/collector-logo.png"
                        alt="Collector Market"
                        className="h-14 w-14 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                    <div className="mt-6 text-[11px] font-mono uppercase tracking-[0.24em] text-[#a89880]">
                      Collector Market
                    </div>
                    <h2 className="mt-3 font-serif text-4xl tracking-[-0.05em] text-[#1a1612]">即将上线</h2>
                    <p className="mt-3 text-sm leading-7 text-[#8a7f70]">
                      这个平台入口已经预留，后续接入后这里直接展示对应市场卡牌。
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {error && initialLoaded && (
                    <div className="mb-4 rounded-[1.4rem] border border-[#f0c8c8] bg-[#fef2f2] p-4 text-sm text-[#b94040]">
                      {error}
                    </div>
                  )}

                  <AnimatePresence mode="wait">
                    {!initialLoaded && loading ? (
                      <motion.div
                        key="skeleton"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6"
                      >
                        {Array.from({ length: 18 }).map((_, i) => (
                          <SkeletonCard key={i} />
                        ))}
                      </motion.div>
                    ) : !cards.length && loading ? (
                      <motion.div
                        key="spinner"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex min-h-[22rem] items-center justify-center rounded-[1.75rem] border border-[#e8e0d0] bg-white/70"
                      >
                        <div className="flex flex-col items-center gap-3 text-[#8a7f70]">
                          <Loader2 className="h-6 w-6 animate-spin" />
                          <p className="text-sm">正在载入市场数据…</p>
                        </div>
                      </motion.div>
                    ) : !!cards.length ? (
                      <motion.div
                        key="cards"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.28 }}
                      >
                        <div
                          className={
                            viewMode === "grid"
                              ? "grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6"
                              : "space-y-3"
                          }
                        >
                          {visibleCards.map((card, i) =>
                            viewMode === "grid" ? (
                              <MarketGridCard
                                key={card.tokenId}
                                card={card}
                                index={i}
                                onOpen={() => setSelectedCard(toCardDetailData(card))}
                              />
                            ) : (
                              <MarketListCard
                                key={card.tokenId}
                                card={card}
                                onOpen={() => setSelectedCard(toCardDetailData(card))}
                              />
                            ),
                          )}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  {!loading && !cards.length && !error && (
                    <div className="rounded-[1.75rem] border border-[#e8e0d0] bg-white/78 p-8 text-center">
                      <p className="font-serif text-3xl tracking-[-0.04em] text-[#1a1612]">没有符合条件的卡牌</p>
                      <p className="mt-3 text-sm leading-7 text-[#8a7f70]">
                        请尝试调整搜索词、价格区间、等级或语言筛选条件。
                      </p>
                    </div>
                  )}

                  <div ref={loadMoreRef} className="mt-6 flex items-center justify-center py-6">
                    {visibleCount < cards.length ? (
                      <div className="rounded-full border border-[#e0d8cc] bg-white/75 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.24em] text-[#a89880]">
                        加载更多 · {visibleCount}/{cards.length}
                      </div>
                    ) : cards.length ? (
                      <div className="rounded-full border border-[#e0d8cc] bg-white/75 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.24em] text-[#a89880]">
                        已加载全部 {cards.length.toLocaleString()} 张
                      </div>
                    ) : null}
                  </div>
                </>
              )}
            </div>
          </section>
        </section>

        <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      </main>
    </div>
  );
}
