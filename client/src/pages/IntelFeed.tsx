import Footer from "@/components/Footer";
import TopNav from "@/components/TopNav";
import { trpc } from "@/lib/trpc";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, RefreshCw, ArrowRight, Radio, Newspaper, ExternalLink } from "lucide-react";

const 说明文字 = "本页内容由系统自动聚合整理，仅供信息参考。平台与原始内容发布者及其权利方无隶属关系，相关商标归各自权利人所有，页面不存储或分发受版权保护的原始图片资源。";

type Section = "all" | "tcg" | "web3";
type Category = "all" | "official" | "community" | "tournament" | "cross_lang";

const sections: { id: Section; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "tcg", label: "卡牌" },
  { id: "web3", label: "加密" },
];

const categories: { id: Category; label: string }[] = [
  { id: "all", label: "全部来源" },
  { id: "official", label: "官方" },
  { id: "community", label: "社区" },
  { id: "tournament", label: "赛事" },
  { id: "cross_lang", label: "跨语种" },
];

const DEMO_ITEMS = [
  {
    id: "demo-1",
    title: "以太坊叙事升温，链上活跃与市场讨论同步放量",
    summary: "这是一组用于展示布局的演示卡片。真实数据为空时，页面会先用这些样例帮助你确认视觉效果与信息层次。",
    source: "演示编辑台",
    sourceUrl: "https://www.coindesk.com/arc/outboundfeeds/rss/",
    section: "web3",
    category: "official",
    createdAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    isNew: 1,
  },
  {
    id: "demo-2",
    title: "宝可梦卡牌社区热度回升，讨论焦点转向新卡稀有度与补货节奏",
    summary: "右侧快讯卡片会优先突出短标题与时间，适合快速扫读并进入原始来源。",
    source: "演示编辑台",
    sourceUrl: "https://www.pokebeach.com/feed",
    section: "tcg",
    category: "community",
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    publishedAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    isNew: 1,
  },
  {
    id: "demo-3",
    title: "情报入口收敛为单页之后，浏览链路更清晰，注意力更集中",
    summary: "你现在进入站点后会直接进入情报流，不再被多余入口分散注意力。",
    source: "演示编辑台",
    sourceUrl: "https://decrypt.co/feed",
    section: "web3",
    category: "official",
    createdAt: new Date(Date.now() - 68 * 60 * 1000).toISOString(),
    publishedAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    isNew: 0,
  },
  {
    id: "demo-4",
    title: "卡片信息墙强化快读体验，适合承载高频碎片情报",
    summary: "中段信息区使用统一边框、暖白玻璃感与柔和阴影，让页面节奏更接近你指定仓库的展陈风格。",
    source: "演示编辑台",
    sourceUrl: "https://pokeguardian.com/feed",
    section: "tcg",
    category: "community",
    createdAt: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
    publishedAt: new Date(Date.now() - 102 * 60 * 1000).toISOString(),
    isNew: 1,
  },
  {
    id: "demo-5",
    title: "新版列表把标题、摘要、来源与时间拆成更稳定的阅读层级",
    summary: "信息密度依然高，但更容易扫读，也更接近暖白高端展陈的产品首页质感。",
    source: "演示编辑台",
    sourceUrl: "https://www.mtggoldfish.com/articles.rss",
    section: "tcg",
    category: "tournament",
    createdAt: new Date(Date.now() - 155 * 60 * 1000).toISOString(),
    publishedAt: new Date(Date.now() - 160 * 60 * 1000).toISOString(),
    isNew: 0,
  },
  {
    id: "demo-6",
    title: "真实数据恢复后，演示内容会自动让位给抓取到的真实新闻",
    summary: "因此你现在看到的是可交互的完整页面结构，而不是只有空状态占位。",
    source: "演示编辑台",
    sourceUrl: "https://limitlesstcg.com/blog/feed",
    section: "web3",
    category: "community",
    createdAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    publishedAt: new Date(Date.now() - 190 * 60 * 1000).toISOString(),
    isNew: 0,
  },
] as const;

function formatSectionLabel(section?: string) {
  if (section === "web3") return "加密";
  if (section === "tcg") return "卡牌";
  return "全部";
}

function formatCategoryLabel(category?: string) {
  if (category === "official") return "官方";
  if (category === "community") return "社区";
  if (category === "tournament") return "赛事";
  if (category === "cross_lang") return "跨语种";
  return "全部来源";
}

function timeAgo(d: string | Date) {
  const now = Date.now();
  const t = new Date(d).getTime();
  const diff = Math.floor((now - t) / 1000);
  if (diff < 60) return "刚刚";
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  return `${Math.floor(diff / 86400)} 天前`;
}

function fmtDateTime(d: string | Date | null | undefined) {
  if (!d) return "";
  return new Date(d).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSectionTone(section?: string) {
  switch (section) {
    case "tcg":
      return "bg-rose-50 text-rose-700 border border-rose-200/80";
    case "web3":
      return "bg-violet-50 text-violet-700 border border-violet-200/80";
    default:
      return "bg-slate-50 text-slate-700 border border-slate-200/80";
  }
}

export default function IntelFeed() {
  const [section, setSection] = useState<Section>("all");
  const [category, setCategory] = useState<Category>("all");
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [cursor, setCursor] = useState<number | undefined>(undefined);
  const [allItems, setAllItems] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const queryInput = useMemo(
    () => ({
      limit: 50,
      section: section === "all" ? undefined : section,
      category: category === "all" ? undefined : category,
      keyword: keyword || undefined,
      cursor,
    }),
    [section, category, keyword, cursor],
  );

  const { data, isLoading, isFetching, refetch } = trpc.insights.list.useQuery(queryInput, {
    placeholderData: (prev: any) => prev,
  });

  useEffect(() => {
    if (data?.items) {
      if (!cursor) {
        setAllItems(data.items);
      } else {
        setAllItems((prev) => {
          const existingIds = new Set(prev.map((i: any) => i.id));
          const newItems = data.items.filter((i: any) => !existingIds.has(i.id));
          return [...prev, ...newItems];
        });
      }
      setHasMore(!!data.nextCursor);
    }
  }, [data, cursor]);

  const resetAndFetch = useCallback(() => {
    setAllItems([]);
    setCursor(undefined);
    setHasMore(true);
  }, []);

  useEffect(() => {
    resetAndFetch();
  }, [section, category, keyword, resetAndFetch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(searchInput.trim());
  };

  const loadMore = useCallback(() => {
    if (data?.nextCursor && !isFetching) {
      setCursor(data.nextCursor);
    }
  }, [data, isFetching]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isFetching) {
          loadMore();
        }
      },
      { rootMargin: "320px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isFetching, loadMore]);

  const isDemoMode = !isLoading && allItems.length === 0;
  const displayItems = (isDemoMode ? DEMO_ITEMS : allItems).filter((item: any) => item.section === "tcg" || item.section === "web3");
  const featured = displayItems[0];
  const quickItems = displayItems.slice(1, 4);
  const gridItems = displayItems.slice(4, 10);
  const streamItems = displayItems.slice(10);

  const sourceCount = useMemo(() => new Set(displayItems.map((item: any) => item.source)).size, [displayItems]);
  const latestTime = featured?.createdAt ? timeAgo(featured.createdAt) : "暂无";

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8f5ef_0%,#f1ede4_40%,#f8f6f1_100%)] text-neutral-950">
      <div className="absolute inset-x-0 top-0 -z-10 h-[26rem] bg-[radial-gradient(circle_at_top_left,rgba(214,195,155,0.18),transparent_38%),radial-gradient(circle_at_top_right,rgba(119,134,157,0.1),transparent_32%)]" />
      <TopNav />

      <main className="container pb-14 pt-6 sm:pt-8 lg:px-6">
        <section id="hero" className="grid gap-5 xl:grid-cols-[minmax(0,0.64fr)_minmax(0,0.36fr)]">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[2rem] border border-black/8 bg-white/82 p-6 shadow-[0_26px_90px_-44px_rgba(24,24,27,0.32)] backdrop-blur-xl sm:p-8"
          >
            <div className="text-[0.68rem] uppercase tracking-[0.3em] text-black/34">情报流</div>
            <h1 className="mt-4 font-serif text-4xl leading-[1.05] text-neutral-950 sm:text-5xl lg:text-[3.5rem]">
              实时情报总览
            </h1>

            <div className="mt-7 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-[10px] font-mono uppercase tracking-[0.26em] text-black/28">当前范围</span>
              {sections.slice(1).map((item) => (
                <span
                  key={item.id}
                  className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-[11px] font-medium ${getSectionTone(item.id)}`}
                >
                  {item.label}
                </span>
              ))}
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {isDemoMode ? "演示布局" : "真实抓取"}
              </span>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.62, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
            className="grid gap-4 sm:grid-cols-2"
          >
            {[
              { label: "已加载情报", value: isLoading ? "…" : `${displayItems.length}${hasMore ? "+" : ""}`, desc: "当前可浏览条目" },
              { label: "覆盖来源", value: isLoading ? "…" : `${sourceCount}`, desc: "去重后的情报源数量" },
              { label: "最新动态", value: latestTime, desc: "最近一条抓取时间" },
              { label: "当前状态", value: isFetching ? "更新中" : isDemoMode ? "演示中" : "在线", desc: "数据接口运行状态" },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.6rem] border border-black/8 bg-white/82 p-5 shadow-[0_20px_70px_-42px_rgba(24,24,27,0.28)] backdrop-blur-xl">
                <div className="text-[0.62rem] uppercase tracking-[0.24em] text-black/30">{item.label}</div>
                <div className="mt-3 text-3xl font-semibold text-neutral-950">{item.value}</div>
                <div className="mt-1 text-xs text-black/38">{item.desc}</div>
              </div>
            ))}
          </motion.section>
        </section>

        <section className="mt-6 rounded-[2rem] border border-black/8 bg-white/84 p-5 shadow-[0_28px_100px_-48px_rgba(24,24,27,0.32)] backdrop-blur-xl sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-[0.62rem] uppercase tracking-[0.24em] text-black/30">情报筛选</div>
              <h2 className="mt-2 text-2xl font-semibold text-neutral-950">新闻驾驶台</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  resetAndFetch();
                  refetch();
                }}
                className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white px-3.5 py-2 text-sm font-medium text-black/64 transition hover:bg-black hover:text-white disabled:opacity-50"
                disabled={isFetching}
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                立即刷新
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {sections.map((item) => (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  section === item.id
                    ? "bg-neutral-950 text-white"
                    : "border border-black/8 bg-[#f6f2eb] text-black/64 hover:bg-black/6 hover:text-black"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {categories.map((item) => (
              <button
                key={item.id}
                onClick={() => setCategory(item.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                  category === item.id
                    ? "bg-[#1a1612] text-white"
                    : "border border-black/8 bg-white text-black/52 hover:bg-black/6 hover:text-black"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="mt-5 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/25" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="搜索项目、叙事、卡牌、人物或关键词"
                className="w-full rounded-full border border-black/8 bg-[#fbf8f2] py-3 pl-11 pr-4 text-sm text-neutral-950 outline-none transition focus:border-black/18"
              />
            </div>
            <button className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-black">
              开始搜索
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </section>

        {featured && (
          <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,0.64fr)_minmax(0,0.36fr)]">
            <motion.a
              href={featured.sourceUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="rounded-[2rem] border border-black/8 bg-white/84 p-6 shadow-[0_26px_90px_-44px_rgba(24,24,27,0.32)] backdrop-blur-xl transition hover:-translate-y-0.5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getSectionTone(featured.section)}`}>
                  {formatSectionLabel(featured.section)}
                </span>
                <span className="rounded-full border border-black/8 bg-[#f6f2eb] px-3 py-1 text-xs font-medium text-black/58">
                  {formatCategoryLabel(featured.category)}
                </span>
                <span className="ml-auto text-xs text-black/35">{timeAgo(featured.createdAt)}</span>
              </div>
              <div className="mt-5 text-[0.62rem] uppercase tracking-[0.24em] text-black/30">重点情报</div>
              <h2 className="mt-3 text-3xl font-semibold leading-tight text-neutral-950 sm:text-[2.4rem]">{featured.title}</h2>
              <p className="mt-5 max-w-3xl text-[0.98rem] leading-8 text-black/56">{featured.summary}</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.3rem] border border-black/8 bg-[#fbf8f2] px-4 py-3">
                  <div className="text-[0.58rem] uppercase tracking-[0.22em] text-black/28">来源</div>
                  <div className="mt-2 text-sm font-semibold text-neutral-950">{featured.source}</div>
                </div>
                <div className="rounded-[1.3rem] border border-black/8 bg-[#fbf8f2] px-4 py-3">
                  <div className="text-[0.58rem] uppercase tracking-[0.22em] text-black/28">发布时间</div>
                  <div className="mt-2 text-sm font-semibold text-neutral-950">{fmtDateTime(featured.publishedAt) || "未提供"}</div>
                </div>
                <div className="rounded-[1.3rem] border border-black/8 bg-[#fbf8f2] px-4 py-3">
                  <div className="text-[0.58rem] uppercase tracking-[0.22em] text-black/28">抓取时间</div>
                  <div className="mt-2 text-sm font-semibold text-neutral-950">{fmtDateTime(featured.createdAt)}</div>
                </div>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-black/68">
                <ExternalLink className="h-4 w-4" />
                打开原始链接
              </div>
            </motion.a>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              {quickItems.map((item: any, index: number) => (
                <motion.a
                  key={item.id}
                  href={item.sourceUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.06 }}
                  className="rounded-[1.6rem] border border-black/8 bg-white/82 p-5 shadow-[0_20px_70px_-42px_rgba(24,24,27,0.28)] backdrop-blur-xl transition hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getSectionTone(item.section)}`}>
                      {formatSectionLabel(item.section)}
                    </span>
                    <span className="text-xs text-black/35">{timeAgo(item.createdAt)}</span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold leading-snug text-neutral-950">{item.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-7 text-black/52">{item.summary}</p>
                  <div className="mt-5 flex items-center justify-between text-xs text-black/38">
                    <span className="font-medium text-black/58">{item.source}</span>
                    <span>{formatCategoryLabel(item.category)}</span>
                  </div>
                </motion.a>
              ))}
            </div>
          </section>
        )}

        {gridItems.length > 0 && (
          <section className="mt-6 rounded-[2rem] border border-black/8 bg-white/84 p-5 shadow-[0_28px_100px_-48px_rgba(24,24,27,0.32)] backdrop-blur-xl sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-[0.62rem] uppercase tracking-[0.24em] text-black/30">重点列表</div>
                <h2 className="mt-2 text-2xl font-semibold text-neutral-950">今日情报概览</h2>
              </div>
              <div className="inline-flex items-center gap-2 text-sm text-black/46">
                <Radio className="h-4 w-4 text-emerald-600" />
                {isDemoMode ? "当前为演示布局" : "当前为真实抓取"}
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {gridItems.map((item: any) => (
                <a
                  key={item.id}
                  href={item.sourceUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-[1.5rem] border border-black/8 bg-[#fbf8f2] p-5 transition hover:-translate-y-0.5 hover:bg-white"
                >
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getSectionTone(item.section)}`}>
                      {formatSectionLabel(item.section)}
                    </span>
                    {item.isNew === 1 && (
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                        最新
                      </span>
                    )}
                  </div>
                  <h3 className="mt-4 line-clamp-2 text-lg font-semibold leading-snug text-neutral-950">{item.title}</h3>
                  <p className="mt-3 line-clamp-4 text-sm leading-7 text-black/52">{item.summary}</p>
                  <div className="mt-5 border-t border-black/6 pt-4 text-xs text-black/38">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-black/58">{item.source}</span>
                      <span>{timeAgo(item.createdAt)}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        <section id="news-list" className="mt-6 rounded-[2rem] border border-black/8 bg-white/84 p-5 shadow-[0_28px_100px_-48px_rgba(24,24,27,0.32)] backdrop-blur-xl sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[0.62rem] uppercase tracking-[0.24em] text-black/30">完整情报流</div>
              <h2 className="mt-2 text-2xl font-semibold text-neutral-950">持续更新列表</h2>
            </div>
            <div className="text-sm text-black/42">安全链接已过滤，仅展示可用来源</div>
          </div>

          {isLoading && !displayItems.length ? (
            <div className="mt-6 space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-28 animate-pulse rounded-[1.4rem] border border-black/8 bg-[#f3efe8]" />
              ))}
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {(streamItems.length ? streamItems : displayItems).map((item: any) => (
                <a
                  key={item.id}
                  href={item.sourceUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-4 rounded-[1.5rem] border border-black/8 bg-[#fbf8f2] p-4 transition hover:bg-white sm:flex-row sm:items-start"
                >
                  <div className="sm:w-44 sm:flex-shrink-0">
                    <div className="flex items-center gap-2 sm:flex-col sm:items-start">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getSectionTone(item.section)}`}>
                        {formatSectionLabel(item.section)}
                      </span>
                      <span className="text-xs text-black/32">{timeAgo(item.createdAt)}</span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-black/32">{fmtDateTime(item.publishedAt) || fmtDateTime(item.createdAt)}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold leading-snug text-neutral-950 sm:text-lg">{item.title}</h3>
                      <ExternalLink className="mt-0.5 h-4 w-4 flex-shrink-0 text-black/25 transition group-hover:text-black/55" />
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-7 text-black/55">{item.summary}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-black/35">
                      <span className="font-medium text-black/58">{item.source}</span>
                      <span>·</span>
                      <span>{formatCategoryLabel(item.category)}</span>
                      <span>·</span>
                      <span>抓取于 {fmtDateTime(item.createdAt)}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}

          <div ref={loadMoreRef} className="pt-8 text-center">
            {isFetching ? (
              <p className="text-sm text-black/35">正在继续加载更多新闻...</p>
            ) : hasMore ? (
              <button
                onClick={loadMore}
                className="rounded-full bg-neutral-950 px-7 py-2.5 text-sm font-medium text-white transition hover:bg-black"
              >
                加载更多
              </button>
            ) : (
              <p className="text-xs leading-6 text-black/32">{isDemoMode ? "当前展示的是演示布局样例，真实数据恢复后将自动替换。" : `已经看到全部 ${displayItems.length} 条情报。`}</p>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-black/8 bg-white/84 p-6 shadow-[0_28px_100px_-48px_rgba(24,24,27,0.32)] backdrop-blur-xl">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-[#f6f2eb] px-4 py-2 text-sm font-medium text-black/62">
              <Newspaper className="h-4 w-4" />
              使用真实抓取与安全链接过滤
            </div>
            <p className="mt-4 text-sm leading-7 text-black/48">{说明文字}</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
