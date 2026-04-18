import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Newspaper, ArrowRight } from "lucide-react";

const NAV = [
  { path: "/", label: "首页" },
  { path: "/intel", label: "TCG 洞察引擎" },
  { path: "/market", label: "市场监控" },
  { path: "/collection", label: "我的藏品" },
  { path: "/features", label: "功能" },
];

export default function TopNav() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between rounded-full border border-black/8 bg-white/78 px-4 py-3 shadow-[0_18px_60px_-36px_rgba(24,24,27,0.32)] backdrop-blur-xl sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-black/8 bg-[#f6f2eb] text-neutral-950 shadow-sm">
            <Newspaper className="h-4 w-4" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-neutral-950">TCGPlay</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = location === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
                  active ? "bg-neutral-950 text-white" : "text-black/60 hover:bg-black/6 hover:text-black"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <a
            href="#news-list"
            className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white px-3.5 py-2 text-sm font-medium text-black/64 transition hover:bg-black hover:text-white"
          >
            查看列表
          </a>
          <a
            href="#hero"
            className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black"
          >
            返回顶部
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/8 bg-white/70 text-black/60 transition hover:bg-black/6 hover:text-black md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "关闭菜单" : "打开菜单"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="mx-auto mt-3 max-w-[1440px] rounded-[1.6rem] border border-black/8 bg-white/84 p-3 shadow-[0_18px_60px_-36px_rgba(24,24,27,0.22)] backdrop-blur-xl md:hidden">
          <div className="space-y-2">
            {NAV.map((item) => {
              const active = location === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    active ? "bg-neutral-950 text-white" : "bg-[#f6f2eb] text-black/68 hover:bg-black/6 hover:text-black"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <a
              href="#news-list"
              onClick={() => setMobileOpen(false)}
              className="block rounded-2xl bg-white px-4 py-3 text-sm font-medium text-black/68 ring-1 ring-black/8"
            >
              查看列表
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
