/**
 * Design note — Function-first premium entry.
 * Home should behave like a direct product doorway: quick entry, live status,
 * and real market preview. Roadmap and Compliance stay off the user-facing
 * homepage while legal semantics still remain in the footer.
 */
import { useMemo, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Compass, FolderSearch, RefreshCw } from "lucide-react";
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

function EntryCard({
  icon,
  title,
  desc,
  href,
  strong,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  href: string;
  strong?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group rounded-[1.55rem] border border-black/8 px-5 py-5 shadow-[0_18px_55px_-38px_rgba(24,24,27,0.28)] transition duration-300 hover:-translate-y-1 ${
        strong ? "bg-neutral-950 text-white" : "bg-white/82 text-neutral-950"
      }`}
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-[1rem] border ${
          strong ? "border-white/10 bg-white/8 text-white" : "border-black/8 bg-[#f6f2eb] text-neutral-950"
        }`}
      >
        {icon}
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <h2 className={`text-xl font-semibold ${strong ? "text-white" : "text-neutral-950"}`}>{title}</h2>
        <ArrowRight className={`h-4 w-4 transition group-hover:translate-x-0.5 ${strong ? "text-white/70" : "text-black/42"}`} />
      </div>
      <p className={`mt-2 text-sm leading-7 ${strong ? "text-white/68" : "text-black/48"}`}>{desc}</p>
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

          <nav className="hidden items-center gap-7 text-sm text-black/56 md:flex">
            <Link href="/market" className="transition hover:text-black">
              市场监控
            </Link>
            <Link href="/collection" className="transition hover:text-black">
              Collection
            </Link>
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
            <div className="text-[0.68rem] uppercase tracking-[0.3em] text-black/34">Product Entry</div>
            <h1 className="mt-4 font-serif text-4xl leading-[0.95] text-neutral-950 sm:text-5xl lg:text-6xl">
              TCGPlay 2.0
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-black/48 sm:text-[0.96rem]">
              直接进入市场监控和 Collection，首页只保留必要状态与实时市场数据。
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <EntryCard
                icon={<Compass className="h-5 w-5" />}
                title="市场监控"
                desc="浏览真实在售卡牌，直接进入筛选与详情。"
                href="/market"
                strong
              />
              <EntryCard
                icon={<FolderSearch className="h-5 w-5" />}
                title="Collection"
                desc="地址输入查询、缓存恢复与 modal 详情。"
                href="/collection"
              />
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
