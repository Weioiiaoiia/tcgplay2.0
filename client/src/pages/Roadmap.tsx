/**
 * Design note — Function-first roadmap surface.
 * This page should behave like a real product capability board: concise,
 * operational, and clearly separated into live versus planned modules.
 */
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3 } from "lucide-react";
import { Link, useLocation } from "wouter";

const roadmapItems = [
  {
    id: "01",
    title: "Market Browser",
    desc: "搜索、筛选、排序、Grid / List 双视图与实时市场列表。",
    status: "live",
  },
  {
    id: "02",
    title: "Card Detail",
    desc: "FMV、Ask、属性网格、Owner、PSA 外链与 Renaiss 外链。",
    status: "live",
  },
  {
    id: "03",
    title: "My Collection",
    desc: "地址输入查询、缓存优先展示、后台刷新与结果统计。",
    status: "live",
  },
  {
    id: "04",
    title: "Modal Detail",
    desc: "Collection 卡片点击后继续以内嵌 modal 打开详情。",
    status: "live",
  },
  {
    id: "05",
    title: "Real-time Refresh",
    desc: "顶部状态、最近更新时间与主动刷新能力。",
    status: "live",
  },
  {
    id: "06",
    title: "Compliance Layer",
    desc: "隐私、条款、IP 与联系入口以独立页面与法律层呈现。",
    status: "live",
  },
  {
    id: "07",
    title: "Collection Intelligence",
    desc: "组合估值、等级统计与更强的持仓分析能力。",
    status: "planned",
  },
  {
    id: "08",
    title: "Story Timeline",
    desc: "为卡牌补充更清晰的时间线与资产叙事层。",
    status: "planned",
  },
  {
    id: "09",
    title: "Expanded Trust Center",
    desc: "更完整的数据来源说明、认证语义与合规结构。",
    status: "planned",
  },
] as const;

export default function Roadmap() {
  const [, navigate] = useLocation();
  const liveItems = roadmapItems.filter((item) => item.status === "live");
  const plannedItems = roadmapItems.filter((item) => item.status === "planned");

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8f5ef_0%,#f1ede4_44%,#f8f6f1_100%)] text-neutral-950">
      <header className="sticky top-0 z-40 px-4 pt-4 sm:px-6">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between rounded-full border border-black/8 bg-white/78 px-4 py-3 shadow-[0_18px_60px_-36px_rgba(24,24,27,0.32)] backdrop-blur-xl sm:px-6">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-[#f6f2eb] px-3.5 py-2 text-sm font-medium text-black/68 transition hover:bg-black hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </button>

          <nav className="hidden items-center gap-7 text-sm text-black/56 md:flex">
            <Link href="/market" className="transition hover:text-black">Market</Link>
            <Link href="/collection" className="transition hover:text-black">Collection</Link>
            <Link href="/roadmap" className="text-black">Roadmap</Link>
            <Link href="/compliance" className="transition hover:text-black">Compliance</Link>
          </nav>

          <Link
            href="/market"
            className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black"
          >
            打开 Market
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main className="container pb-14 pt-8 sm:pt-10">
        <section className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
          <div className="rounded-[2rem] border border-black/8 bg-white/80 p-6 shadow-[0_26px_90px_-44px_rgba(24,24,27,0.32)] backdrop-blur-xl sm:p-8">
            <div className="text-[0.68rem] uppercase tracking-[0.3em] text-black/34">Capability Matrix</div>
            <h1 className="mt-4 font-serif text-4xl leading-[0.95] text-neutral-950 sm:text-5xl">Roadmap</h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-black/48">
              这里不再把路线图埋在首页长段说明里，而是直接把当前可用功能与后续规划分开展示，方便你核对真正保留下来的能力。
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.4rem] border border-black/8 bg-[#f7f3ed] px-4 py-4">
                <div className="text-[0.62rem] uppercase tracking-[0.22em] text-black/30">Live Modules</div>
                <div className="mt-2 text-3xl font-semibold text-neutral-950">{liveItems.length}</div>
              </div>
              <div className="rounded-[1.4rem] border border-black/8 bg-[#f7f3ed] px-4 py-4">
                <div className="text-[0.62rem] uppercase tracking-[0.22em] text-black/30">Planned</div>
                <div className="mt-2 text-3xl font-semibold text-neutral-950">{plannedItems.length}</div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[
              { title: "Market", desc: "市场浏览与卡牌详情主链路", href: "/market" },
              { title: "Collection", desc: "地址输入查询与 modal 详情", href: "/collection" },
              { title: "Compliance", desc: "法律信息与联系入口", href: "/compliance" },
            ].map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="rounded-[1.6rem] border border-black/8 bg-white/80 p-5 shadow-[0_18px_55px_-38px_rgba(24,24,27,0.28)] transition duration-300 hover:-translate-y-1"
              >
                <div className="text-[0.62rem] uppercase tracking-[0.22em] text-black/30">Direct Access</div>
                <div className="mt-3 text-xl font-semibold text-neutral-950">{item.title}</div>
                <div className="mt-2 text-sm leading-7 text-black/46">{item.desc}</div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="rounded-[2rem] border border-black/8 bg-white/82 p-6 shadow-[0_28px_100px_-48px_rgba(24,24,27,0.32)] backdrop-blur-xl sm:p-7">
            <div className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.28em] text-black/34">
              <CheckCircle2 className="h-4 w-4" />
              Live Now
            </div>
            <div className="mt-5 grid gap-3">
              {liveItems.map((item) => (
                <article key={item.id} className="rounded-[1.35rem] border border-black/8 bg-[#f7f3ed] px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[0.62rem] uppercase tracking-[0.22em] text-black/30">{item.id}</div>
                      <h3 className="mt-2 text-lg font-semibold text-neutral-950">{item.title}</h3>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">Live</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-black/48">{item.desc}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-black/8 bg-white/82 p-6 shadow-[0_28px_100px_-48px_rgba(24,24,27,0.32)] backdrop-blur-xl sm:p-7">
            <div className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.28em] text-black/34">
              <Clock3 className="h-4 w-4" />
              Planned
            </div>
            <div className="mt-5 grid gap-3">
              {plannedItems.map((item) => (
                <article key={item.id} className="rounded-[1.35rem] border border-black/8 bg-[#f7f3ed] px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[0.62rem] uppercase tracking-[0.22em] text-black/30">{item.id}</div>
                      <h3 className="mt-2 text-lg font-semibold text-neutral-950">{item.title}</h3>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">Planned</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-black/48">{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
