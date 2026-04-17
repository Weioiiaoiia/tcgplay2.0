/**
 * Design reminder for this page:
 * Market should feel direct and operational. Filters live on the left,
 * cards stay dense on the right, and platform switching happens through
 * clear logo-based selectors instead of explanatory blocks.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  Grid3X3,
  List,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";
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
const categoryOptions = [
  { value: "all", label: "全部类别" },
  { value: "pokemon", label: "Pokémon" },
  { value: "trainer", label: "Trainer" },
  { value: "energy", label: "Energy" },
];

const platforms: {
  id: PlatformId;
  label: string;
  status: string;
  logo: string;
  live: boolean;
}[] = [
  {
    id: "renaiss",
    label: "Renaiss",
    status: "Live",
    logo: "/manus-storage/renaiss-logo_b0942441.png",
    live: true,
  },
  {
    id: "collector",
    label: "Collector Market",
    status: "Coming soon",
    logo: "/manus-storage/collector-logo_5260b737.png",
    live: false,
  },
];

function formatTime(date: Date) {
  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function MarketGridCard({ card, onOpen }: { card: RenaissCard; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="group overflow-hidden rounded-[1.2rem] border border-black/8 bg-white/86 text-left shadow-[0_14px_42px_rgba(30,41,59,0.07)] transition-all duration-300 hover:-translate-y-1 hover:border-sky-200/90 hover:shadow-[0_20px_60px_rgba(59,130,246,0.12)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden border-b border-black/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(236,239,244,0.94))] p-2.5">
        <img
          src={getRenaissImageUrl(card.frontImageUrl, 640)}
          alt={card.name}
          loading="lazy"
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span
          className={`absolute right-3 top-3 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getGradeBg(card.grade)} ${getGradeColor(card.grade)}`}
        >
          {card.grade}
        </span>
      </div>
      <div className="space-y-2.5 p-3">
        <div>
          <p className="line-clamp-1 text-[0.95rem] font-semibold tracking-[-0.03em] text-zinc-900">
            {card.pokemonName || card.name}
          </p>
          <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-zinc-500">
            {card.setName} · #{card.cardNumber}
          </p>
        </div>
        <div className="flex items-end justify-between gap-2">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
              Ask
            </span>
            <strong className="mt-1 block font-mono text-[0.96rem] text-zinc-900">
              {formatCurrency(card.askPriceUSDT)}
            </strong>
          </div>
          <div className="text-right">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
              FMV
            </span>
            <strong className="mt-1 block font-mono text-[11px] text-zinc-600">
              {formatCurrency(card.fmvPriceUSD)}
            </strong>
          </div>
        </div>
      </div>
    </button>
  );
}

function MarketListCard({ card, onOpen }: { card: RenaissCard; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="grid grid-cols-[92px_1fr_auto] items-center gap-4 rounded-[1.3rem] border border-black/8 bg-white/84 p-3 text-left shadow-[0_16px_46px_rgba(30,41,59,0.07)] transition-all duration-300 hover:-translate-y-1 hover:border-sky-200/90"
    >
      <div className="aspect-[3/4] overflow-hidden rounded-[0.9rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(236,239,244,0.94))] p-2">
        <img
          src={getRenaissImageUrl(card.frontImageUrl, 480)}
          alt={card.name}
          loading="lazy"
          className="h-full w-full object-contain"
        />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold ${getGradeBg(card.grade)} ${getGradeColor(card.grade)}`}
          >
            {card.grade}
          </span>
          <span className="text-xs uppercase tracking-[0.2em] text-zinc-400">{card.language}</span>
        </div>
        <p className="mt-3 truncate text-lg font-semibold tracking-[-0.03em] text-zinc-900">
          {card.pokemonName || card.name}
        </p>
        <p className="mt-1 truncate text-sm text-zinc-500">
          {card.setName} · #{card.cardNumber} · {card.serial || "No serial"}
        </p>
      </div>
      <div className="text-right">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-400">Ask</span>
          <strong className="mt-1 block font-mono text-xl text-zinc-900">
            {formatCurrency(card.askPriceUSDT)}
          </strong>
        </div>
        <div className="mt-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-400">FMV</span>
          <strong className="mt-1 block font-mono text-sm text-zinc-600">
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
        const [entry] = entries;
        if (entry?.isIntersecting) {
          setVisibleCount((current) => Math.min(current + PAGE_STEP, cards.length));
        }
      },
      { rootMargin: "240px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [cards.length, isComingSoon]);

  const visibleCards = useMemo(() => cards.slice(0, visibleCount), [cards, visibleCount]);

  const resetFilters = () => {
    setFilters({
      search: "",
      category: "all",
      gradeFilter: "all",
      priceMin: 0,
      priceMax: 100000,
      language: "all",
      sortBy: "newest",
    });
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(252,250,244,1),rgba(246,244,238,1))] text-zinc-900">
      <header className="sticky top-0 z-50 border-b border-black/6 bg-[rgba(251,249,244,0.82)] backdrop-blur-2xl">
        <div className="w-full px-4 py-4 sm:px-5 lg:px-6 xl:flex xl:items-center xl:justify-between xl:gap-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/8 bg-white/75 text-zinc-700 transition-all duration-300 hover:-translate-y-0.5 hover:text-zinc-950"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-400">Market / Listed Cards</p>
              <h1 className="font-serif text-[clamp(1.8rem,3vw,2.6rem)] tracking-[-0.05em] text-zinc-950">
                市场页
              </h1>
            </div>
          </div>

          <div className="mt-4 grid gap-x-5 gap-y-3 sm:grid-cols-2 xl:mt-0 xl:grid-cols-4 xl:items-end">
            <div className="px-1 py-1">
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-400">Platform</span>
              <strong className="mt-2 block font-mono text-xl text-zinc-950">{platformMeta.label}</strong>
            </div>
            <div className="px-1 py-1 xl:border-l xl:border-black/8 xl:pl-5">
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-400">Listed</span>
              <strong className="mt-2 block font-mono text-xl text-zinc-950">
                {isComingSoon ? "Soon" : totalCount.toLocaleString()}
              </strong>
            </div>
            <div className="px-1 py-1 xl:border-l xl:border-black/8 xl:pl-5">
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-400">Updated</span>
              <strong className="mt-2 block font-mono text-xl text-zinc-950">
                {isComingSoon ? "--:--" : formatTime(lastUpdated)}
              </strong>
            </div>
            <button
              onClick={() => refreshData()}
              disabled={loading || isComingSoon}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white/72 px-4 py-3 text-sm font-medium text-zinc-700 shadow-[0_10px_28px_rgba(30,41,59,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-45 xl:justify-self-end"
            >
              <RefreshCw className={`h-4 w-4 ${loading && !isComingSoon ? "animate-spin" : ""}`} />
              手动刷新
            </button>
          </div>
        </div>
      </header>

      <main className="w-full px-4 py-6 sm:px-5 lg:px-6">
        <section className="grid gap-4 xl:grid-cols-[290px_minmax(0,1fr)] 2xl:grid-cols-[310px_minmax(0,1fr)]">
          <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
            <section className="rounded-[1.45rem] bg-white/72 p-4 shadow-[0_16px_38px_rgba(30,41,59,0.05)] ring-1 ring-black/4">
              <div className="text-[11px] uppercase tracking-[0.24em] text-zinc-400">Platforms</div>
              <div className="mt-4 space-y-3">
                {platforms.map((platform) => {
                  const active = selectedPlatform === platform.id;
                  return (
                    <button
                      key={platform.id}
                      onClick={() => setSelectedPlatform(platform.id)}
                      className={`w-full rounded-[1.25rem] border px-3 py-3 text-left transition-all duration-300 ${
                        active
                          ? "border-zinc-900 bg-zinc-900 text-white shadow-[0_16px_42px_rgba(24,24,27,0.18)]"
                          : "border-black/8 bg-[#f8f5ef] text-zinc-900 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-[0.95rem] border ${active ? "border-white/10 bg-white/7" : "border-black/8 bg-white"}`}>
                          <img src={platform.logo} alt={platform.label} className="h-9 w-9 object-contain" />
                        </div>
                        <div className="min-w-0">
                          <div className={`text-sm font-semibold ${active ? "text-white" : "text-zinc-950"}`}>{platform.label}</div>
                          <div className={`mt-1 text-xs ${active ? "text-white/64" : platform.live ? "text-emerald-600" : "text-zinc-500"}`}>
                            {platform.status}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[1.45rem] bg-white/72 p-4 shadow-[0_16px_38px_rgba(30,41,59,0.05)] ring-1 ring-black/4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[11px] uppercase tracking-[0.24em] text-zinc-400">Filters</div>
                <button
                  onClick={resetFilters}
                  disabled={isComingSoon}
                  className="text-xs font-medium text-zinc-500 transition hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  重置
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-zinc-400">搜索</span>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      value={filters.search}
                      disabled={isComingSoon}
                      onChange={(event) => setFilters({ ...filters, search: event.target.value })}
                      placeholder="名称、角色、序列号、系列、卡号"
                      className="h-12 w-full rounded-[1rem] border border-black/8 bg-zinc-50/82 pl-11 pr-4 text-sm outline-none transition-all focus:border-sky-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-45"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-zinc-400">排序</span>
                  <select
                    value={filters.sortBy}
                    disabled={isComingSoon}
                    onChange={(event) => setFilters({ ...filters, sortBy: event.target.value as SortBy })}
                    className="h-12 w-full rounded-[1rem] border border-black/8 bg-zinc-50/82 px-4 text-sm outline-none transition-all focus:border-sky-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                  <label className="block">
                    <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-zinc-400">最低价格</span>
                    <input
                      type="number"
                      value={filters.priceMin || ""}
                      disabled={isComingSoon}
                      onChange={(event) =>
                        setFilters({ ...filters, priceMin: Number(event.target.value) || 0 })
                      }
                      className="h-12 w-full rounded-[1rem] border border-black/8 bg-zinc-50/82 px-4 text-sm outline-none transition-all focus:border-sky-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-45"
                      placeholder="0"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-zinc-400">最高价格</span>
                    <input
                      type="number"
                      value={filters.priceMax >= 100000 ? "" : filters.priceMax}
                      disabled={isComingSoon}
                      onChange={(event) =>
                        setFilters({ ...filters, priceMax: Number(event.target.value) || 100000 })
                      }
                      className="h-12 w-full rounded-[1rem] border border-black/8 bg-zinc-50/82 px-4 text-sm outline-none transition-all focus:border-sky-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-45"
                      placeholder="100000"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-zinc-400">类别</span>
                  <select
                    value={filters.category}
                    disabled={isComingSoon}
                    onChange={(event) => setFilters({ ...filters, category: event.target.value })}
                    className="h-12 w-full rounded-[1rem] border border-black/8 bg-zinc-50/82 px-4 text-sm outline-none transition-all focus:border-sky-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div>
                  <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-zinc-400">等级</span>
                  <div className="flex flex-wrap gap-2">
                    {gradeOptions.map((option) => (
                      <button
                        key={option}
                        disabled={isComingSoon}
                        onClick={() => setFilters({ ...filters, gradeFilter: option })}
                        className={`rounded-full border px-3 py-2 text-sm transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                          filters.gradeFilter === option
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : "border-black/8 bg-zinc-50/82 text-zinc-600 hover:bg-white"
                        }`}
                      >
                        {option === "all" ? "全部" : `PSA ${option}`}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block">
                  <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-zinc-400">语言</span>
                  <select
                    value={filters.language}
                    disabled={isComingSoon}
                    onChange={(event) => setFilters({ ...filters, language: event.target.value })}
                    className="h-12 w-full rounded-[1rem] border border-black/8 bg-zinc-50/82 px-4 text-sm outline-none transition-all focus:border-sky-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {languageOptions.map((option) => (
                      <option key={option} value={option}>
                        {option === "all" ? "全部" : option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </section>
          </aside>

          <section className="min-w-0">
            <div className="px-1 py-1 sm:px-0">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                  <span className="rounded-full bg-[#f6f2eb] px-3 py-1.5">
                    {platformMeta.label}
                  </span>
                  <span className="rounded-full bg-[#f6f2eb] px-3 py-1.5">
                    {isComingSoon ? "Coming soon" : `${cards.length} 条结果`}
                  </span>
                  {!isComingSoon ? (
                    <span className="rounded-full bg-[#f6f2eb] px-3 py-1.5">
                      {viewMode === "grid" ? "网格浏览" : "列表浏览"}
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {!isComingSoon ? (
                    <a
                      href="https://www.renaiss.xyz/marketplace"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-sm font-medium text-zinc-700 shadow-[0_10px_24px_rgba(30,41,59,0.05)] transition hover:text-zinc-950"
                    >
                      打开官方市场
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : null}
                  <div className="inline-flex rounded-full bg-zinc-50/92 p-1 shadow-[inset_0_0_0_1px_rgba(24,24,27,0.06)]">
                    <button
                      onClick={() => setViewMode("grid")}
                      disabled={isComingSoon}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                        viewMode === "grid"
                          ? "bg-zinc-900 text-white shadow-[0_12px_24px_rgba(24,24,27,0.18)]"
                          : "text-zinc-500"
                      }`}
                    >
                      <Grid3X3 className="h-4 w-4" />
                      网格
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      disabled={isComingSoon}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                        viewMode === "list"
                          ? "bg-zinc-900 text-white shadow-[0_12px_24px_rgba(24,24,27,0.18)]"
                          : "text-zinc-500"
                      }`}
                    >
                      <List className="h-4 w-4" />
                      列表
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5">
              {isComingSoon ? (
                <div className="flex min-h-[36rem] items-center justify-center rounded-[1.75rem] border border-dashed border-black/12 bg-white/74 p-8 shadow-[0_18px_55px_rgba(30,41,59,0.07)]">
                  <div className="max-w-md text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.4rem] border border-black/8 bg-white shadow-[0_14px_44px_rgba(30,41,59,0.08)]">
                      <img
                        src="/manus-storage/collector-logo_5260b737.png"
                        alt="Collector Market"
                        className="h-14 w-14 object-contain"
                      />
                    </div>
                    <div className="mt-6 text-[11px] uppercase tracking-[0.24em] text-zinc-400">Collector Market</div>
                    <h2 className="mt-3 font-serif text-4xl tracking-[-0.05em] text-zinc-950">Coming soon</h2>
                    <p className="mt-3 text-sm leading-7 text-zinc-500">
                      这个平台入口已经预留，后续接入后这里直接展示对应市场卡牌。
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {error && initialLoaded ? (
                    <div className="rounded-[1.6rem] border border-red-200 bg-red-50/80 p-5 text-sm text-red-700">
                      {error}
                    </div>
                  ) : null}

                  {!cards.length && loading ? (
                    <div className="flex min-h-[22rem] items-center justify-center rounded-[1.75rem] border border-black/8 bg-white/70 shadow-[0_18px_55px_rgba(30,41,59,0.07)]">
                      <div className="flex flex-col items-center gap-3 text-zinc-500">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <p className="text-sm">正在载入真实市场数据…</p>
                      </div>
                    </div>
                  ) : null}

                  {!!cards.length && (
                    <div
                      className={
                        viewMode === "grid"
                          ? "grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
                          : "space-y-4"
                      }
                    >
                      {visibleCards.map((card) =>
                        viewMode === "grid" ? (
                          <MarketGridCard
                            key={card.tokenId}
                            card={card}
                            onOpen={() => setSelectedCard(toCardDetailData(card))}
                          />
                        ) : (
                          <MarketListCard
                            key={card.tokenId}
                            card={card}
                            onOpen={() => setSelectedCard(toCardDetailData(card))}
                          />
                        )
                      )}
                    </div>
                  )}

                  {!loading && !cards.length && !error ? (
                    <div className="rounded-[1.75rem] border border-black/8 bg-white/78 p-8 text-center shadow-[0_18px_55px_rgba(30,41,59,0.07)]">
                      <p className="font-serif text-3xl tracking-[-0.04em] text-zinc-950">没有符合条件的卡牌</p>
                      <p className="mt-3 text-sm leading-7 text-zinc-500">
                        请尝试调整搜索词、价格区间、等级、类别或语言筛选条件。
                      </p>
                    </div>
                  ) : null}

                  <div ref={loadMoreRef} className="mt-6 flex items-center justify-center py-6">
                    {visibleCount < cards.length ? (
                      <div className="rounded-full border border-black/8 bg-white/75 px-4 py-2 font-mono text-xs uppercase tracking-[0.24em] text-zinc-400">
                        Infinite scrolling · {visibleCount}/{cards.length}
                      </div>
                    ) : cards.length ? (
                      <div className="rounded-full border border-black/8 bg-white/75 px-4 py-2 font-mono text-xs uppercase tracking-[0.24em] text-zinc-400">
                        All loaded
                      </div>
                    ) : null}
                  </div>
                </>
              )}
            </div>
          </section>
        </section>

        <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />

        {!!cards.length && !isComingSoon && cards[0] ? (
          <section className="pb-10 pt-6">
            <a
              href={getRenaissCardUrl(cards[0].tokenId)}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col gap-3 rounded-[1.5rem] border border-black/8 bg-[linear-gradient(135deg,rgba(33,37,41,0.96),rgba(58,65,78,0.92))] px-5 py-5 text-white shadow-[0_18px_55px_rgba(33,37,41,0.18)] lg:flex-row lg:items-center lg:justify-between"
            >
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/50">External verification</span>
                <h2 className="mt-2 font-serif text-[clamp(1.5rem,2.4vw,2.3rem)] tracking-[-0.05em]">
                  前往 Renaiss 官方详情
                </h2>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-medium text-white/88">
                打开当前卡牌
                <ExternalLink className="h-4 w-4" />
              </span>
            </a>
          </section>
        ) : null}
      </main>
    </div>
  );
}
