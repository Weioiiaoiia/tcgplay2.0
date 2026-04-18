/**
 * Design note — Function-first premium entry.
 * Home should behave like a direct product doorway: quick entry, live status,
 * and real market preview. Roadmap and Compliance stay off the user-facing
 * homepage while legal semantics still remain in the footer.
 */
import { useMemo, useState, useRef, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Compass, FolderSearch, RefreshCw, ChevronDown, BarChart2, BookImage, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import Footer from "@/components/Footer";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useCardData } from "@/contexts/CardDataContext";
import { getRenaissImageUrl, type RenaissCard } from "@/lib/renaissApi";

function formatCurrency(value: number) {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// 市场监控平台数据
const MARKET_PLATFORMS = [
  {
    id: "renaiss",
    label: "Renaiss",
    logo: "/renaiss-logo.png",
    live: true,
  },
  {
    id: "collector",
    label: "Collector Market",
    logo: "/collector-logo.png",
    live: false,
  },
];

// 下拉功能菜单
const NAV_ITEMS = [
  { label: "市场监控", href: "/market", icon: "📊", desc: "实时在售卡牌监控", live: true },
  { label: "我的藏品", href: "/collection", icon: "🗂", desc: "链上藏品查询与管理", live: true },
  { label: "TCG 洞察引擎", href: "/intel", icon: "🔍", desc: "深度数据分析与趋势", live: true },
  { label: "卡牌图集", href: "#", icon: "📖", desc: "全系列卡牌图鉴数据库", live: false },
];

function NavMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative hidden md:block">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
          open
            ? "border-neutral-950 bg-neutral-950 text-white"
            : "border-black/8 bg-white/70 text-black/64 hover:bg-neutral-950 hover:text-white hover:border-neutral-950"
        }`}
      >
        功能
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-1/2 top-full mt-2 w-64 -translate-x-1/2 overflow-hidden rounded-[1.4rem] border border-black/8 bg-[#fbf8f2] shadow-[0_24px_60px_-16px_rgba(24,24,27,0.22)] backdrop-blur-xl"
          >
            <div className="p-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`group flex items-center gap-3 rounded-[0.9rem] px-3 py-2.5 transition ${
                    item.live ? "hover:bg-black/5" : "opacity-50 cursor-not-allowed pointer-events-none"
                  }`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.6rem] border border-black/8 bg-white text-base shadow-sm">
                    {item.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-neutral-950">{item.label}</span>
                      {!item.live && (
                        <span className="rounded-full bg-[#f0ebe0] px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wide text-[#a89880]">Soon</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] text-black/40">{item.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EntryCard({
  icon,
  title,
  desc,
  href,
  strong,
  showPlatforms,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  href: string;
  strong?: boolean;
  showPlatforms?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group rounded-[1.55rem] border px-5 py-5 shadow-[0_18px_55px_-38px_rgba(24,24,27,0.28)] transition duration-300 hover:-translate-y-1 ${
        strong ? "border-[#e0d8cc] bg-[#faf7f1] text-[#1a1612]" : "border-black/8 bg-white/82 text-neutral-950"
      }`}
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-[1rem] border ${
          strong ? "border-[#e0d8cc] bg-[#f0ebe0] text-[#1a1612]" : "border-black/8 bg-[#f6f2eb] text-neutral-950"
        }`}
      >
        {icon}
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <h2 className={`text-xl font-semibold ${strong ? "text-[#1a1612]" : "text-neutral-950"}`}>{title}</h2>
        <ArrowRight className={`h-4 w-4 transition group-hover:translate-x-0.5 ${strong ? "text-[#6b6055]" : "text-black/42"}`} />
      </div>
      <p className={`mt-2 text-sm leading-7 ${strong ? "text-[#8a7f70]" : "text-black/48"}`}>{desc}</p>

      {/* 平台标识 — 仅市场监控卡片显示 */}
      {showPlatforms && (
        <div className="mt-4 flex items-center gap-2">
          {MARKET_PLATFORMS.map((p) => (
            <div
              key={p.id}
              className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 ${
                p.live
                  ? "border-[#b8e4c8] bg-[#edf9f2]"
                  : "border-[#e0d8cc] bg-[#f5f0e8] opacity-70"
              }`}
            >
              <div className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#e0d8cc] bg-white shadow-sm">
                <img
                  src={p.logo}
                  alt={p.label}
                  className="h-4 w-4 object-contain"
                />
              </div>
              <span className={`text-[11px] font-medium ${
                p.live ? "text-[#2d7a4f]" : "text-[#8a7f70]"
              }`}>
                {p.label}
              </span>
              {p.live ? (
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4a9e6a] animate-pulse" />
                  <span className="font-mono text-[9px] text-[#4a9e6a]">Live</span>
                </span>
              ) : (
                <span className="font-mono text-[9px] text-[#a89880]">即将上线</span>
              )}
            </div>
          ))}
        </div>
      )}
    </Link>
  );
}

function MarketPreviewCard({ card }: { card: RenaissCard }) {
  return (
    <Link
      href={`/card/${card.tokenId}`}
      className="group overflow-hidden rounded-[1.4rem] border border-black/8 bg-white/84 shadow-[0_18px_55px_-40px_rgba(24,24,27,0.28)] transition duration-300 hover:-translate-y-1"
    >
      <div className="aspect-[4/5] overflow-hidden border-b border-black/6 bg-[linear-gradient(180deg,#fbf8f3,#f0ebe3)] p-3">
        <img
          src={getRenaissImageUrl(card.frontImageUrl, 640)}
          alt={card.name}
          loading="lazy"
          className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="space-y-2.5 p-3.5">
        <div>
          <div className="text-[0.58rem] uppercase tracking-[0.2em] text-black/30">{card.grade}</div>
          <h3 className="mt-1.5 line-clamp-1 text-[1rem] font-semibold text-neutral-950">
            {card.pokemonName || card.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-black/46">
            {card.setName} · #{card.cardNumber}
          </p>
        </div>
        <div className="flex items-end justify-between gap-2">
          <div>
            <div className="text-[0.55rem] uppercase tracking-[0.18em] text-black/28">Ask</div>
            <div className="mt-1 text-base font-semibold text-neutral-950">
              {formatCurrency(card.askPriceUSDT)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[0.55rem] uppercase tracking-[0.18em] text-black/28">FMV</div>
            <div className="mt-1 text-xs font-medium text-black/56">
              {formatCurrency(card.fmvPriceUSD)}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const [, navigate] = useLocation();
  const { allCards, loading, totalCount, lastUpdated, refreshData } = useCardData();

  const featuredCards = useMemo(() => allCards.slice(0, 6), [allCards]);
  const topAsk = useMemo(() => {
    if (!allCards.length) return 0;
    return Math.max(...allCards.slice(0, 120).map((item) => item.askPriceUSDT));
  }, [allCards]);
  const avgFmv = useMemo(() => {
    if (!allCards.length) return 0;
    const sample = allCards.slice(0, 120);
    return sample.reduce((sum, item) => sum + item.fmvPriceUSD, 0) / sample.length;
  }, [allCards]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8f5ef_0%,#f1ede4_40%,#f8f6f1_100%)] text-neutral-950">
      <div className="absolute inset-x-0 top-0 -z-10 h-[26rem] bg-[radial-gradient(circle_at_top_left,rgba(214,195,155,0.18),transparent_38%),radial-gradient(circle_at_top_right,rgba(119,134,157,0.1),transparent_32%)]" />

      <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
        <div className="mx-auto flex max-w-full items-center justify-between rounded-full border border-black/8 bg-white/78 px-4 py-3 shadow-[0_18px_60px_-36px_rgba(24,24,27,0.32)] backdrop-blur-xl sm:px-6">
          <button
            className="flex items-center gap-3"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-black/8 bg-[#f6f2eb] text-sm font-semibold text-neutral-950">
              T
            </span>
            <span className="text-lg font-semibold text-neutral-950">TCGPlay</span>
          </button>

          <nav className="hidden items-center gap-1 text-sm md:flex">
            <Link href="/market" className="rounded-full px-3.5 py-2 font-medium text-black/60 transition hover:bg-black/6 hover:text-black">市场监控</Link>
            <Link href="/collection" className="rounded-full px-3.5 py-2 font-medium text-black/60 transition hover:bg-black/6 hover:text-black">我的藏品</Link>
            <Link href="/intel" className="rounded-full px-3.5 py-2 font-medium text-black/60 transition hover:bg-black/6 hover:text-black">TCG 洞察引擎</Link>
            <span className="rounded-full px-3.5 py-2 font-medium text-black/28 cursor-not-allowed">卡牌图集 <span className="ml-1 rounded-full bg-[#f0ebe0] px-1.5 py-0.5 font-mono text-[8px] text-[#a89880]">Soon</span></span>
            <Link href="/features" className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/80 px-3.5 py-2 font-medium text-black/70 shadow-sm transition hover:bg-neutral-950 hover:text-white hover:border-neutral-950">功能</Link>
          </nav>

          <div className="flex items-center gap-2">
            {/* 语言切换 — 适配暖色主题，覆盖 dark 样式 */}
            <div className="[&_button]:!border-black/8 [&_button]:!bg-white/70 [&_button]:!text-black/60 [&_button:hover]:!bg-black/6 [&_button:hover]:!text-black [&_.absolute]:!bg-[#fbf8f2] [&_.absolute]:!border-black/8 [&_.absolute]:!shadow-[0_16px_48px_-12px_rgba(24,24,27,0.18)] [&_.absolute_button]:!text-black/60 [&_.absolute_button:hover]:!bg-black/5 [&_.absolute_button:hover]:!text-black/90 [&_.absolute_button.bg-white\/\[0\.08\]]:!bg-black/6 [&_.absolute_button.bg-white\/\[0\.08\]]:!text-black">
              <LanguageSwitcher />
            </div>
            <button
              onClick={() => refreshData()}
              disabled={loading}
              className="hidden items-center gap-2 rounded-full border border-black/8 bg-white px-3.5 py-2 text-sm font-medium text-black/64 transition hover:bg-black hover:text-white disabled:opacity-50 sm:inline-flex"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              刷新市场
            </button>
            <button
              onClick={() => navigate("/market")}
              className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black"
            >
              进入市场
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => {}}
              className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/70 px-4 py-2.5 text-sm font-medium text-black/64 transition hover:bg-neutral-950 hover:text-white hover:border-neutral-950"
              title="即将上线"
            >
              <User className="h-4 w-4" />
              Sign In
            </button>
          </div>
        </div>
      </header>

      <main className="container pb-14 pt-8 sm:pt-10 lg:px-6">
        <section className="grid gap-5 xl:grid-cols-[minmax(0,0.64fr)_minmax(0,0.36fr)]">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[2rem] border border-black/8 bg-white/82 p-6 shadow-[0_26px_90px_-44px_rgba(24,24,27,0.32)] backdrop-blur-xl sm:p-8"
          >
            <div className="text-[0.68rem] uppercase tracking-[0.3em] text-black/34">TCGPlay</div>
            <h1 className="mt-4 font-serif text-4xl leading-[1.05] text-neutral-950 sm:text-5xl lg:text-[3.6rem]">
              以前瞻视角
              <br />
              <span className="text-black/50">拆解 TCG 链上基因</span>
            </h1>
            <p className="mt-5 max-w-xl text-[0.96rem] leading-[1.85] text-black/52">
              不仅记录它的旅程，更要唤醒它的生命力。
            </p>
            <p className="mt-2 font-serif text-[1.05rem] italic leading-relaxed text-black/38">
              “别只是拥有它，去见证它。”
            </p>

            {/* 平台标识 — 内嵌在 Hero 区域 */}
            <div className="mt-7 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-black/28 mr-1">监控平台</span>
              {[{ label: "Renaiss", logo: "/renaiss-logo.png", live: true }, { label: "Collector Market", logo: "/collector-logo.png", live: false }].map((p) => (
                <div
                  key={p.label}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 ${
                    p.live ? "border-emerald-500/25 bg-emerald-50" : "border-black/8 bg-white/60 opacity-60"
                  }`}
                >
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full border border-black/8 bg-white shadow-sm">
                    <img src={p.logo} alt={p.label} className="h-4 w-4 object-contain" />
                  </div>
                  <span className={`text-[11px] font-medium ${
                    p.live ? "text-emerald-700" : "text-black/40"
                  }`}>{p.label}</span>
                  {p.live
                    ? <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /><span className="font-mono text-[9px] text-emerald-600">Live</span></span>
                    : <span className="font-mono text-[9px] text-black/28">即将</span>}
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.62, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div className="rounded-[1.6rem] border border-black/8 bg-white/82 p-5 shadow-[0_20px_70px_-42px_rgba(24,24,27,0.28)] backdrop-blur-xl">
              <div className="text-[0.62rem] uppercase tracking-[0.24em] text-black/30">Listed Cards</div>
              <div className="mt-3 text-3xl font-semibold text-neutral-950">{loading ? "…" : totalCount.toLocaleString()}</div>
              <div className="mt-1 text-xs text-black/38">实时在售卡牌</div>
            </div>
            <div className="rounded-[1.6rem] border border-black/8 bg-white/82 p-5 shadow-[0_20px_70px_-42px_rgba(24,24,27,0.28)] backdrop-blur-xl">
              <div className="text-[0.62rem] uppercase tracking-[0.24em] text-black/30">Updated</div>
              <div className="mt-3 text-3xl font-semibold text-neutral-950">{formatTime(lastUpdated)}</div>
              <div className="mt-1 text-xs text-black/38">上次同步时间</div>
            </div>
            <div className="rounded-[1.6rem] border border-black/8 bg-white/82 p-5 shadow-[0_20px_70px_-42px_rgba(24,24,27,0.28)] backdrop-blur-xl">
              <div className="text-[0.62rem] uppercase tracking-[0.24em] text-black/30">Top Ask</div>
              <div className="mt-3 text-3xl font-semibold text-neutral-950">{loading ? "…" : formatCurrency(topAsk)}</div>
              <div className="mt-1 text-xs text-black/38">样本最高挂牌价</div>
            </div>
            <div className="rounded-[1.6rem] border border-black/8 bg-white/82 p-5 shadow-[0_20px_70px_-42px_rgba(24,24,27,0.28)] backdrop-blur-xl">
              <div className="text-[0.62rem] uppercase tracking-[0.24em] text-black/30">Average FMV</div>
              <div className="mt-3 text-3xl font-semibold text-neutral-950">{loading ? "…" : formatCurrency(Math.round(avgFmv))}</div>
              <div className="mt-1 text-xs text-black/38">样本平均 FMV</div>
            </div>
          </motion.section>
        </section>

        <section className="mt-6 rounded-[2rem] border border-black/8 bg-white/84 p-5 shadow-[0_28px_100px_-48px_rgba(24,24,27,0.32)] backdrop-blur-xl sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[0.62rem] uppercase tracking-[0.24em] text-black/30">Live Market Monitor</div>
              <h2 className="mt-2 text-2xl font-semibold text-neutral-950">市场监控</h2>
            </div>
            <Link
              href="/market"
              className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black"
            >
              打开
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            {featuredCards.length ? (
              featuredCards.map((card) => <MarketPreviewCard key={card.tokenId} card={card} />)
            ) : (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-[22rem] animate-pulse rounded-[1.4rem] border border-black/8 bg-[#f3efe8]" />
              ))
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
