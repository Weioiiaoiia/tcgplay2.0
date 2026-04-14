/**
 * 市场图鉴 / Market Index — 主列表页
 * 只显示 Renaiss 市场上真实在售的卡牌
 * 使用分页加载避免DOM过多导致卡顿
 */
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  RefreshCw,
  X,
  ExternalLink,
  ChevronUp,
} from "lucide-react";
import {
  useRenaissData,
  type SortBy,
  type Filters,
} from "@/hooks/useRenaissData";
import type { RenaissCard } from "@/lib/renaissApi";
import { getGradeColor, getGradeBg } from "@/lib/renaissApi";
import { useLocation } from "wouter";

const PAGE_SIZE = 60;

/* ─── 顶部导航栏 ─── */
function Navbar({
  onRefresh,
  lastUpdated,
  totalCount,
  loading,
}: {
  onRefresh: () => void;
  lastUpdated: Date;
  totalCount: number;
  loading: boolean;
}) {
  const [, navigate] = useLocation();
  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-[#0b0b10]/90 backdrop-blur-xl border-b border-white/[0.05]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="text-[14px] font-semibold tracking-tight text-white/80 hover:text-white transition-colors"
          >
            Market Index
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/[0.06] border border-emerald-500/[0.1]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-400/70 font-medium tabular-nums">
              {totalCount.toLocaleString()} 张在售
            </span>
          </div>
          <span className="hidden md:block text-[10px] text-white/15 font-mono tabular-nums">
            {lastUpdated.toLocaleTimeString("zh-CN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 rounded-md text-white/20 hover:text-white/50 hover:bg-white/[0.04] transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <a
            href="https://www.renaiss.xyz/marketplace"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-white/[0.05] text-[11px] text-white/50 font-medium hover:bg-white/[0.08] hover:text-white/70 transition-all flex items-center gap-1"
          >
            Renaiss
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </nav>
  );
}

/* ─── 筛选面板 ─── */
function FilterPanel({
  filters,
  setFilters,
  onClose,
  isMobile,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
  onClose?: () => void;
  isMobile?: boolean;
}) {
  const gradeOptions = [
    { value: "all", label: "全部" },
    { value: "10", label: "PSA 10" },
    { value: "9", label: "PSA 9" },
    { value: "8", label: "PSA 8" },
    { value: "7", label: "PSA 7 及以下" },
  ];

  const languageOptions = [
    { value: "all", label: "全部" },
    { value: "Japanese", label: "日语" },
    { value: "English", label: "英语" },
    { value: "Simplified Chinese", label: "简中" },
  ];

  const sortOptions: { value: SortBy; label: string }[] = [
    { value: "newest", label: "最新上架" },
    { value: "price-asc", label: "价格 低→高" },
    { value: "price-desc", label: "价格 高→低" },
    { value: "grade", label: "等级" },
    { value: "fmv", label: "FMV" },
  ];

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div>
      <span className="text-[10px] text-white/20 uppercase tracking-widest font-medium mb-1.5 block">
        {title}
      </span>
      {children}
    </div>
  );

  const Pill = ({
    active,
    onClick,
    children,
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className={`px-2.5 py-1.5 rounded-md text-[11px] transition-all ${
        active
          ? "bg-white/[0.1] text-white/80"
          : "text-white/30 hover:text-white/50 hover:bg-white/[0.03]"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className={`${isMobile ? "p-4" : ""} space-y-5`}>
      {isMobile && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-[13px] font-medium text-white/70">筛选</span>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/[0.06]">
            <X className="w-4 h-4 text-white/30" />
          </button>
        </div>
      )}

      <Section title="等级">
        <div className="flex flex-wrap gap-1">
          {gradeOptions.map((o) => (
            <Pill
              key={o.value}
              active={filters.gradeFilter === o.value}
              onClick={() => setFilters({ ...filters, gradeFilter: o.value })}
            >
              {o.label}
            </Pill>
          ))}
        </div>
      </Section>

      <Section title="价格 (USDT)">
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="最低"
            value={filters.priceMin || ""}
            onChange={(e) =>
              setFilters({ ...filters, priceMin: Number(e.target.value) || 0 })
            }
            className="w-full px-2.5 py-1.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-[11px] text-white/60 placeholder:text-white/15 focus:border-white/[0.12] focus:outline-none"
          />
          <span className="text-white/10 text-[10px]">—</span>
          <input
            type="number"
            placeholder="最高"
            value={filters.priceMax >= 100000 ? "" : filters.priceMax}
            onChange={(e) =>
              setFilters({ ...filters, priceMax: Number(e.target.value) || 100000 })
            }
            className="w-full px-2.5 py-1.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-[11px] text-white/60 placeholder:text-white/15 focus:border-white/[0.12] focus:outline-none"
          />
        </div>
      </Section>

      <Section title="语言">
        <div className="flex flex-wrap gap-1">
          {languageOptions.map((o) => (
            <Pill
              key={o.value}
              active={filters.language === o.value}
              onClick={() => setFilters({ ...filters, language: o.value })}
            >
              {o.label}
            </Pill>
          ))}
        </div>
      </Section>

      <Section title="排序">
        <div className="flex flex-wrap gap-1">
          {sortOptions.map((o) => (
            <Pill
              key={o.value}
              active={filters.sortBy === o.value}
              onClick={() => setFilters({ ...filters, sortBy: o.value })}
            >
              {o.label}
            </Pill>
          ))}
        </div>
      </Section>

      <button
        onClick={() =>
          setFilters({
            search: "",
            category: "all",
            gradeFilter: "all",
            priceMin: 0,
            priceMax: 100000,
            language: "all",
            sortBy: "newest",
          })
        }
        className="w-full py-1.5 rounded-md text-[11px] text-white/20 hover:text-white/40 transition-colors"
      >
        重置
      </button>
    </div>
  );
}

/* ─── 卡牌网格项 ─── */
const CardGridItem = ({ card }: { card: RenaissCard }) => {
  const [, navigate] = useLocation();

  return (
    <div
      className="group rounded-xl overflow-hidden cursor-pointer bg-[#111117] border border-white/[0.05] hover:border-white/[0.1] transition-all duration-300"
      onClick={() => navigate(`/card/${card.tokenId}`)}
    >
      <div className="relative aspect-[3/4] bg-[#0a0a0f] overflow-hidden">
        <img
          src={card.frontImageUrl}
          alt={card.name}
          className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-500"
          loading="lazy"
          decoding="async"
        />
        <div
          className={`absolute top-2 right-2 px-1.5 py-0.5 rounded border backdrop-blur-sm text-[9px] font-bold ${getGradeBg(card.grade)} ${getGradeColor(card.grade)}`}
        >
          PSA {card.grade.split(" ")[0]}
        </div>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-[11px] text-white/40 truncate leading-snug mb-1.5">
          {card.name}
        </p>
        <div className="flex items-baseline justify-between">
          <span className="text-[16px] font-bold text-white/90 font-mono tracking-tight">
            ${card.askPriceUSDT.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-white/20 font-mono">
            FMV ${card.fmvPriceUSD.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>
    </div>
  );
};

/* ─── 卡牌列表项 ─── */
const CardListItem = ({ card }: { card: RenaissCard }) => {
  const [, navigate] = useLocation();

  return (
    <div
      onClick={() => navigate(`/card/${card.tokenId}`)}
      className="group flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#111117] border border-white/[0.05] cursor-pointer hover:border-white/[0.1] transition-all"
    >
      <div className="w-11 h-14 rounded-md overflow-hidden bg-[#0a0a0f] shrink-0">
        <img
          src={card.frontImageUrl}
          alt={card.name}
          className="w-full h-full object-contain"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-white/50 truncate">{card.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className={`text-[9px] px-1 py-0.5 rounded border ${getGradeBg(card.grade)} ${getGradeColor(card.grade)}`}
          >
            PSA {card.grade.split(" ")[0]}
          </span>
          <span className="text-[10px] text-white/20">{card.year}</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <span className="text-[14px] font-bold text-white/80 font-mono">
          ${card.askPriceUSDT.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
        </span>
        <p className="text-[9px] text-white/15 font-mono">
          FMV ${card.fmvPriceUSD.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </p>
      </div>
    </div>
  );
};

/* ─── 主页面 ─── */
export default function MarketIndex() {
  const {
    cards,
    loading,
    initialLoaded,
    filters,
    setFilters,
    lastUpdated,
    refreshData,
    totalCount,
  } = useRenaissData();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, cards.length));
        }
      },
      { rootMargin: "400px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [cards.length]);

  // Scroll to top button
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = useCallback(() => window.scrollTo({ top: 0, behavior: "smooth" }), []);

  const visibleCards = useMemo(
    () => cards.slice(0, visibleCount),
    [cards, visibleCount]
  );

  return (
    <div className="min-h-screen bg-[#08080d] text-white">
      <Navbar
        onRefresh={refreshData}
        lastUpdated={lastUpdated}
        totalCount={totalCount}
        loading={loading}
      />

      <main className="pt-14">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          {/* 搜索 + 工具栏 */}
          <div className="sticky top-14 z-30 bg-[#08080d]/95 backdrop-blur-md py-3 -mx-4 sm:-mx-6 px-4 sm:px-6 border-b border-white/[0.03]">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/15" />
                <input
                  type="text"
                  placeholder="搜索名称、序列号、系列..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[12px] text-white/70 placeholder:text-white/15 focus:border-white/[0.12] focus:outline-none transition-colors"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg border transition-all ${
                  showFilters
                    ? "bg-white/[0.08] border-white/[0.1] text-white/60"
                    : "bg-white/[0.03] border-white/[0.05] text-white/25 hover:text-white/40"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
              <div className="hidden sm:flex rounded-lg border border-white/[0.05] overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "bg-white/[0.08] text-white/60" : "text-white/20 hover:text-white/40"}`}
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-white/[0.08] text-white/60" : "text-white/20 hover:text-white/40"}`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-white/15 tabular-nums">
                {cards.length.toLocaleString()} 结果
              </span>
            </div>
          </div>

          {/* 内容区 */}
          <div className="flex gap-6 mt-4 pb-8">
            {/* 桌面端筛选侧栏 */}
            <AnimatePresence>
              {showFilters && (
                <motion.aside
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 220, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="hidden md:block shrink-0 overflow-hidden"
                >
                  <div className="w-[220px] sticky top-[7.5rem]">
                    <FilterPanel filters={filters} setFilters={setFilters} />
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>

            {/* 移动端筛选弹窗 */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                  onClick={() => setShowFilters(false)}
                >
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="absolute bottom-0 inset-x-0 bg-[#111117] border-t border-white/[0.08] rounded-t-2xl max-h-[70vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FilterPanel
                      filters={filters}
                      setFilters={setFilters}
                      onClose={() => setShowFilters(false)}
                      isMobile
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 卡牌列表 */}
            <div className="flex-1 min-w-0">
              {!initialLoaded && loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-2">
                  <RefreshCw className="w-5 h-5 text-white/10 animate-spin" />
                  <p className="text-[11px] text-white/15">加载中...</p>
                </div>
              ) : cards.length === 0 ? (
                <div className="text-center py-32">
                  <p className="text-white/25 text-[13px]">无匹配结果</p>
                  <button
                    onClick={() =>
                      setFilters({
                        search: "",
                        category: "all",
                        gradeFilter: "all",
                        priceMin: 0,
                        priceMax: 100000,
                        language: "all",
                        sortBy: "newest",
                      })
                    }
                    className="mt-2 text-[11px] text-white/30 hover:text-white/50 underline"
                  >
                    重置筛选
                  </button>
                </div>
              ) : viewMode === "grid" ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
                    {visibleCards.map((card) => (
                      <CardGridItem key={card.tokenId} card={card} />
                    ))}
                  </div>
                  {visibleCount < cards.length && (
                    <div ref={sentinelRef} className="flex justify-center py-8">
                      <div className="w-5 h-5 border-2 border-white/10 border-t-white/30 rounded-full animate-spin" />
                    </div>
                  )}
                  {visibleCount >= cards.length && cards.length > PAGE_SIZE && (
                    <p className="text-center text-[10px] text-white/10 py-6">
                      已显示全部 {cards.length.toLocaleString()} 张卡牌
                    </p>
                  )}
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    {visibleCards.map((card) => (
                      <CardListItem key={card.tokenId} card={card} />
                    ))}
                  </div>
                  {visibleCount < cards.length && (
                    <div ref={sentinelRef} className="flex justify-center py-8">
                      <div className="w-5 h-5 border-2 border-white/10 border-t-white/30 rounded-full animate-spin" />
                    </div>
                  )}
                  {visibleCount >= cards.length && cards.length > PAGE_SIZE && (
                    <p className="text-center text-[10px] text-white/10 py-6">
                      已显示全部 {cards.length.toLocaleString()} 张卡牌
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Scroll to top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full bg-white/[0.08] border border-white/[0.1] flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.12] transition-all shadow-lg"
          >
            <ChevronUp className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      <footer className="border-t border-white/[0.03] py-5">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[10px] text-white/10">
            数据来源 Renaiss Protocol · BNB Chain · PSA · 仅显示在售卡牌 · 每 30 秒自动刷新
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://www.renaiss.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-white/15 hover:text-white/40 transition-colors"
            >
              Renaiss
            </a>
            <a
              href="https://www.psacard.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-white/15 hover:text-white/40 transition-colors"
            >
              PSA
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
