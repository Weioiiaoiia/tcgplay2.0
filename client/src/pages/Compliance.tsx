/**
 * Design note — Function-first compliance surface.
 * This page should expose legal and trust information as usable product content,
 * not as decorative footer copy.
 */
import { ArrowLeft, ArrowRight, ExternalLink, FileLock2, Files, ShieldCheck, Scale } from "lucide-react";
import { Link, useLocation } from "wouter";
import Footer from "@/components/Footer";

const legalCards = [
  {
    title: "隐私政策",
    desc: "继续保留完整文本层级、明确说明与可访问入口，说明数据展示、缓存和查询行为。",
    tag: "Privacy",
  },
  {
    title: "服务条款",
    desc: "继续保留使用范围、功能边界与平台说明，而不是缩成页脚一行文字。",
    tag: "Terms",
  },
  {
    title: "IP 说明",
    desc: "继续保留卡牌图像、品牌归属与第三方信息来源相关语义。",
    tag: "IP",
  },
] as const;

export default function Compliance() {
  const [, navigate] = useLocation();

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
            <Link href="/roadmap" className="transition hover:text-black">Roadmap</Link>
            <Link href="/compliance" className="text-black">Compliance</Link>
          </nav>

          <Link
            href="/collection"
            className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black"
          >
            打开 Collection
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main className="container pb-10 pt-8 sm:pt-10">
        <section className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
          <div className="rounded-[2rem] border border-black/8 bg-white/80 p-6 shadow-[0_26px_90px_-44px_rgba(24,24,27,0.32)] backdrop-blur-xl sm:p-8">
            <div className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.3em] text-black/34">
              <ShieldCheck className="h-4 w-4" />
              Trust Layer
            </div>
            <h1 className="mt-4 font-serif text-4xl leading-[0.95] text-neutral-950 sm:text-5xl">Compliance</h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-black/48">
              这里直接放法律与信任相关功能入口，不再把这些内容埋在首页说明文案中。隐私、条款、IP 与联系入口都保留下来。
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <a
                href="mailto:contact@tcgplay.ai"
                className="rounded-[1.4rem] border border-black/8 bg-[#f7f3ed] px-4 py-4 transition hover:bg-white"
              >
                <div className="text-[0.62rem] uppercase tracking-[0.22em] text-black/30">Contact</div>
                <div className="mt-2 text-lg font-semibold text-neutral-950">联系入口</div>
                <div className="mt-1 text-sm leading-7 text-black/46">通过邮件直达联系渠道。</div>
              </a>
              <a
                href="https://www.renaiss.xyz/marketplace"
                target="_blank"
                rel="noreferrer"
                className="rounded-[1.4rem] border border-black/8 bg-[#f7f3ed] px-4 py-4 transition hover:bg-white"
              >
                <div className="text-[0.62rem] uppercase tracking-[0.22em] text-black/30">Data Source</div>
                <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-neutral-950">
                  Renaiss 市场来源
                  <ExternalLink className="h-4 w-4" />
                </div>
                <div className="mt-1 text-sm leading-7 text-black/46">核对市场与外部数据源入口。</div>
              </a>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {legalCards.map((item, index) => {
              const icons = [<FileLock2 className="h-5 w-5" />, <Files className="h-5 w-5" />, <Scale className="h-5 w-5" />] as const;
              return (
                <article
                  key={item.title}
                  className="rounded-[1.6rem] border border-black/8 bg-white/82 p-5 shadow-[0_18px_55px_-38px_rgba(24,24,27,0.28)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-black/8 bg-[#f6f2eb] text-neutral-950">
                      {icons[index]}
                    </div>
                    <span className="rounded-full bg-[#f6f2eb] px-3 py-1 text-xs font-medium text-black/62">{item.tag}</span>
                  </div>
                  <h2 className="mt-5 text-lg font-semibold text-neutral-950">{item.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-black/48">{item.desc}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-black/8 bg-white/82 p-6 shadow-[0_28px_100px_-48px_rgba(24,24,27,0.32)] backdrop-blur-xl sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[0.62rem] uppercase tracking-[0.24em] text-black/30">What remains preserved</div>
              <h2 className="mt-2 text-2xl font-semibold text-neutral-950">合规语义保留清单</h2>
            </div>
            <Link href="/roadmap" className="inline-flex items-center gap-2 text-sm font-medium text-black/60 transition hover:text-black">
              查看功能矩阵
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              "隐私、条款与 IP 入口仍然存在",
              "数据来源与外部核验链接继续保留",
              "法律信息不再只藏在页脚小字里",
              "最终版本仍可通过底部弹窗阅读详细文本",
            ].map((item) => (
              <div key={item} className="rounded-[1.3rem] border border-black/8 bg-[#f7f3ed] px-4 py-4 text-sm leading-7 text-black/52">
                {item}
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
