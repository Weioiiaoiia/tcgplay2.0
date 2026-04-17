import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BarChart2, BookImage, Compass, FolderSearch } from "lucide-react";
import { Link } from "wouter";

const FEATURES = [
  {
    id: "market",
    icon: <Compass className="h-7 w-7" />,
    title: "市场监控",
    subtitle: "Market Intelligence",
    desc: "实时追踪 Renaiss 平台在售卡牌数据，涵盖挂单价（Ask）、公允市场价（FMV）、评级信息与链上持有人。支持多维度筛选与排序，让你第一时间掌握市场动态。",
    tags: ["Renaiss Live", "实时数据", "链上验证"],
    href: "/market",
    live: true,
    color: "from-emerald-50 to-teal-50",
    border: "border-emerald-200/60",
    iconBg: "bg-emerald-100 text-emerald-700",
    tagBg: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "collection",
    icon: <FolderSearch className="h-7 w-7" />,
    title: "我的藏品",
    subtitle: "Collection Viewer",
    desc: "输入任意钱包地址，即可查看该地址持有的全部链上 TCG 卡牌。展示藏品总价值（Portfolio FMV）、平均评级、角色分布，并支持点击查看每张卡牌的完整详情。",
    tags: ["钱包查询", "PSA 认证", "FMV 估值"],
    href: "/collection",
    live: true,
    color: "from-sky-50 to-indigo-50",
    border: "border-sky-200/60",
    iconBg: "bg-sky-100 text-sky-700",
    tagBg: "bg-sky-100 text-sky-700",
  },
  {
    id: "insight",
    icon: <BarChart2 className="h-7 w-7" />,
    title: "TCG 洞察引擎",
    subtitle: "Insight Engine",
    desc: "深度分析 TCG 链上数据，提供价格趋势图表、稀有度分布、角色热度排行与市场流动性报告。帮助收藏者与投资者做出更有依据的决策。",
    tags: ["价格趋势", "稀有度分析", "市场报告"],
    href: "#",
    live: false,
    color: "from-violet-50 to-purple-50",
    border: "border-violet-200/60",
    iconBg: "bg-violet-100 text-violet-600",
    tagBg: "bg-violet-100 text-violet-600",
  },
  {
    id: "atlas",
    icon: <BookImage className="h-7 w-7" />,
    title: "卡牌图集",
    subtitle: "Card Atlas",
    desc: "收录全系列 TCG 卡牌的完整图鉴数据库，包含卡牌原图、系列信息、发行版本与历史价格记录。是每位收藏者的必备参考工具。",
    tags: ["全系列收录", "高清原图", "历史价格"],
    href: "#",
    live: false,
    color: "from-amber-50 to-orange-50",
    border: "border-amber-200/60",
    iconBg: "bg-amber-100 text-amber-700",
    tagBg: "bg-amber-100 text-amber-700",
  },
];

export default function Features() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8f5ef_0%,#f1ede4_40%,#f8f6f1_100%)] text-neutral-950">
      {/* 背景光晕 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[30rem] bg-[radial-gradient(circle_at_top_left,rgba(214,195,155,0.18),transparent_38%),radial-gradient(circle_at_top_right,rgba(119,134,157,0.1),transparent_32%)]" />

      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
        <div className="mx-auto flex max-w-full items-center justify-between rounded-full border border-black/8 bg-white/78 px-4 py-3 shadow-[0_18px_60px_-36px_rgba(24,24,27,0.32)] backdrop-blur-xl sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 rounded-full border border-black/8 bg-[#f6f2eb] px-3.5 py-2 text-sm font-medium text-black/64 transition hover:bg-neutral-950 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Link>

          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-black/8 bg-[#f6f2eb] text-sm font-semibold text-neutral-950">
              T
            </span>
            <span className="text-lg font-semibold text-neutral-950">TCGPlay</span>
          </div>

          <div className="w-24" />
        </div>
      </header>

      <main className="container max-w-5xl pb-20 pt-12 sm:pt-16 lg:px-6">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 text-center"
        >
          <div className="mb-3 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-black/30">
            Platform Features
          </div>
          <h1 className="font-serif text-4xl leading-tight text-neutral-950 sm:text-5xl">
            全部功能
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-[0.96rem] leading-relaxed text-black/48">
            TCGPlay 提供完整的链上 TCG 卡牌工具套件，从市场监控到深度分析，一站式覆盖。
          </p>
        </motion.div>

        {/* 功能卡片网格 */}
        <div className="grid gap-5 sm:grid-cols-2">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              {f.live ? (
                <Link
                  href={f.href}
                  className={`group flex h-full flex-col rounded-[1.8rem] border bg-gradient-to-br p-6 shadow-[0_20px_60px_-32px_rgba(24,24,27,0.18)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_-28px_rgba(24,24,27,0.24)] ${f.color} ${f.border}`}
                >
                  <FeatureCardContent feature={f} />
                </Link>
              ) : (
                <div
                  className={`flex h-full flex-col rounded-[1.8rem] border bg-gradient-to-br p-6 opacity-70 ${f.color} ${f.border}`}
                >
                  <FeatureCardContent feature={f} comingSoon />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* 底部说明 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-12 text-center font-mono text-[0.7rem] uppercase tracking-[0.2em] text-black/24"
        >
          更多功能持续开发中 · 敬请期待
        </motion.p>
      </main>
    </div>
  );
}

function FeatureCardContent({
  feature,
  comingSoon,
}: {
  feature: (typeof FEATURES)[0];
  comingSoon?: boolean;
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-14 w-14 items-center justify-center rounded-[1.1rem] border border-black/8 shadow-sm ${feature.iconBg}`}>
          {feature.icon}
        </div>
        {comingSoon ? (
          <span className="rounded-full bg-white/80 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-black/36 shadow-sm">
            Coming Soon
          </span>
        ) : (
          <span className="rounded-full bg-white/80 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-emerald-700 shadow-sm">
            ● Live
          </span>
        )}
      </div>

      <div className="mt-5 flex-1">
        <div className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-black/30">
          {feature.subtitle}
        </div>
        <h2 className="mt-1.5 text-[1.35rem] font-semibold text-neutral-950">
          {feature.title}
        </h2>
        <p className="mt-3 text-sm leading-[1.85] text-black/54">
          {feature.desc}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {feature.tags.map((tag) => (
            <span
              key={tag}
              className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${feature.tagBg}`}
            >
              {tag}
            </span>
          ))}
        </div>
        {!comingSoon && (
          <ArrowRight className="h-4 w-4 text-black/30 transition group-hover:translate-x-0.5 group-hover:text-black/60" />
        )}
      </div>
    </>
  );
}
