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
import { useCollectorData } from "@/contexts/CollectorDataContext";
import type { CollectorCard } from "@/lib/collectorApi";

type ViewMode = "grid" | "list";
type PlatformId = "renaiss" | "collector";

// ─── 统一卡牌类型（用于组合显示）────────────────────────────────────────────
type UnifiedCard =
  | ({ _source: "renaiss" } & RenaissCard)
  | ({ _source: "collector" } & CollectorCard);

const PAGE_STEP = 30;

const PREMIUM_TEST_CODE = "TCG77ouo";
const PREMIUM_LS_KEY = "tcgplay2_premium_unlocked";

const sortOptions: { label: string; value: SortBy }[] = [
  { label: "最新上架", value: "newest" },
  { label: "价格 低→高", value: "price-asc" },
  { label: "价格 高→低", value: "price-desc" },
  { label: "等级", value: "grade" },
  { label: "FMV", value: "fmv" },
  { label: "溢价率", value: "premium" },
];

/** 溢价率测试码弹窗 */
function PremiumUnlockModal({
  open,
  onClose,
  onUnlock,
}: {
  open: boolean;
  onClose: () => void;
  onUnlock: () => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  if (!open) return null;

  const handleSubmit = () => {
    if (code.trim() === PREMIUM_TEST_CODE) {
      try { localStorage.setItem(PREMIUM_LS_KEY, "1"); } catch {}
      onUnlock();
    } else {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-[rgba(12,10,8,0.6)] p-4 backdrop-blur-md"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className={`relative w-full max-w-[420px] overflow-hidden rounded-[1.6rem] border border-[#e7dece] bg-[#fbf8f1] shadow-[0_30px_90px_-20px_rgba(30,24,14,0.5)] ${
          shaking ? "animate-[headShake_0.5s_ease-in-out]" : ""
        }`}
      >
        {/* 顶部装饰条 */}
        <div className="h-1 w-full bg-gradient-to-r from-[#c8a84a] via-[#e8d48a] to-[#c8a84a]" />

        <div className="px-6 pt-6 pb-7">
          {/* 标题区 */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[0.8rem] bg-gradient-to-br from-[#f0e6cc] to-[#e8d8b0] shadow-inner">
              <svg className="h-5 w-5 text-[#8b6b2a]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-[1.15rem] font-semibold tracking-[-0.03em] text-[#1a1612]">
                溢价率功能测试
              </h3>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="rounded-full border border-[#e0d090] bg-[#fdf6e3] px-2 py-0.5 text-[10px] font-semibold tracking-[0.08em] text-[#8b6b2a]">Beta</span>
                <span className="text-[11px] text-[#a89880]">限量内测</span>
              </div>
            </div>
          </div>

          {/* 输入区 */}
          <div className="mt-6">
            <label className="mb-2 block text-[12px] font-medium text-[#6b6055]">请输入测试码</label>
            <input
              type="text"
              value={code}
              onChange={(e) => { setCode(e.target.value); setError(false); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
              placeholder="输入测试码…"
              className={`h-12 w-full rounded-[0.95rem] border bg-white px-4 text-[14px] text-[#1a1612] placeholder:text-[#c0b8a8] outline-none transition-all focus:border-[#c8a84a] focus:ring-2 focus:ring-[#c8a84a]/20 ${
                error ? "border-[#e05050] ring-2 ring-[#e05050]/20" : "border-[#e0d8cc]"
              }`}
              autoFocus
            />
            {error && (
              <p className="mt-2 text-[12px] font-medium text-[#d04040]">测试码不正确，请重新输入</p>
            )}
          </div>

          {/* 底部提示 */}
          <p className="mt-4 text-[11px] leading-5 text-[#a89880]">
            需要测试码请{" "}
            <a
              href="https://x.com/chen1904o"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#6b8cce] underline decoration-[#6b8cce]/30 underline-offset-2 transition hover:text-[#4a6eb8]"
            >
              前往官网获取邀请码
            </a>
          </p>

          {/* 按钮组 */}
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-full border border-[#e0d8cc] bg-[#faf7f2] py-3 text-[13px] font-medium text-[#6b6055] transition-all hover:border-[#1a1612] hover:bg-[#1a1612] hover:text-white"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 rounded-full bg-gradient-to-r from-[#1a1612] to-[#2a2420] py-3 text-[13px] font-semibold text-white shadow-[0_8px_24px_rgba(26,22,18,0.3)] transition-all hover:shadow-[0_12px_32px_rgba(26,22,18,0.4)]"
            >
              确认解锁
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const gradeOptions = ["all", "10", "9", "8", "7", "≤6"];
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
    status: "Live",
    logo: "/logos/collector-logo.png",
    live: true,
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

function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
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
      className="group flex flex-col overflow-hidden rounded-[1.2rem] border border-[#2a2620] bg-[#141210] text-left shadow-[0_10px_32px_rgba(10,8,6,0.28)] transition-all duration-300 hover:-translate-y-1 hover:border-[#4a3f28] hover:shadow-[0_18px_52px_rgba(10,8,6,0.38)]"
    >
      {/* 卡牌图片区：固定 3/4 比例，不裁切，标签覆盖在图片上 */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#141210]">
        <img
          src={getRenaissImageUrl(card.frontImageUrl, 800)}
          alt={card.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full scale-[1.45] object-contain [object-position:center_55%] transition-transform duration-500 group-hover:scale-[1.5]"
        />
        {/* 上架时间 — 左上角，不遮挡 PSA 标签 */}
        <span className="absolute top-2 left-2 rounded bg-black/50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-white/80 backdrop-blur-sm pointer-events-none">
          {timeAgo(card.listedAt ?? "")}
        </span>
        {/* 溢价 + 等级标签 — 移到底部，不遮挡 PSA 序列号 */}
        <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between pointer-events-none">
          {premium !== null ? (
            <span className={`rounded border px-1.5 py-0.5 font-mono text-[9px] font-medium tracking-wide backdrop-blur-sm ${
              premium < 0
                ? "border-[#2d6b52] bg-[#0d2e22]/80 text-[#5cd4a0]"
                : premium > 0
                ? "border-[#6b2d2d] bg-[#2e0d0d]/80 text-[#d47a5c]"
                : "border-white/10 bg-black/40 text-white/30"
            }`}>
              {premium > 0 ? "+" : ""}{premium}%
            </span>
          ) : <span />}
          <span className={`rounded-[0.4rem] border px-1.5 py-0.5 text-[9px] font-semibold backdrop-blur-sm ${getGradeBg(card.grade)} ${getGradeColor(card.grade)}`}>
            {card.grade}
          </span>
        </div>
      </div>
      {/* 底部信息区：白色背景 */}
      <div className="flex flex-1 flex-col bg-[#faf7f1] px-3 pt-2.5 pb-3">
        <p className="line-clamp-1 text-[0.84rem] font-semibold tracking-[-0.03em] text-[#1a1612]">
          {card.pokemonName || card.name}
        </p>
        <p className="mt-0.5 line-clamp-1 text-[10px] text-[#8a7f70]">
          {card.setName} · {card.gradingCompany}
        </p>
        {/* 价格行：大字价格 + 货币单位，右侧 FMV */}
        <div className="mt-2 flex items-baseline justify-between gap-1">
          <span className="font-mono text-[1rem] font-bold tracking-[-0.02em] text-[#1a1612]">
            {formatCurrency(card.askPriceUSDT)}
            <span className="ml-1 text-[0.65rem] font-semibold text-[#a89880]">USDT</span>
          </span>
          {card.fmvPriceUSD > 0 && (
            <span className="font-mono text-[0.72rem] text-[#a89880] line-through">
              ~{formatCurrency(card.fmvPriceUSD)}
            </span>
          )}
        </div>
        {/* 平台标识行 */}
        <div className="mt-1.5 flex items-center gap-1">
          <img src="/logos/renaiss-badge.png" alt="Renaiss" className="h-3.5 w-3.5 rounded-[0.2rem] object-contain opacity-80" />
          <span className="font-mono text-[9px] text-[#b0a090]">Renaiss</span>
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

// ─── Collector 卡牌渲染组件 ──────────────────────────────────────────────────

function getCollectorGradeBg(grade: string): string {
  if (grade.includes("10")) return "bg-amber-500/10 border-amber-500/20";
  if (grade.includes("9")) return "bg-sky-500/10 border-sky-500/20";
  if (grade.includes("8")) return "bg-emerald-500/10 border-emerald-500/20";
  return "bg-white/60 border-black/8";
}

function getCollectorGradeColor(grade: string): string {
  if (grade.includes("10")) return "text-amber-500";
  if (grade.includes("9")) return "text-sky-500";
  if (grade.includes("8")) return "text-emerald-500";
  return "text-zinc-600";
}

function CollectorGridCard({
  card,
  onOpen,
  index,
}: {
  card: CollectorCard;
  onOpen: () => void;
  index: number;
}) {
  // 计算溢价%：(listingPrice - fmvPriceUSD) / fmvPriceUSD * 100
  const collPremium: number | null =
    card.fmvPriceUSD > 0 && card.listingPrice > 0
      ? Math.round(((card.listingPrice - card.fmvPriceUSD) / card.fmvPriceUSD) * 100)
      : null;
  return (
    <motion.button
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.022, 0.55), ease: [0.22, 1, 0.36, 1] }}
      onClick={onOpen}
      className="group flex flex-col overflow-hidden rounded-[1.2rem] border border-[#2a2620] bg-[#141210] text-left shadow-[0_10px_32px_rgba(10,8,6,0.28)] transition-all duration-300 hover:-translate-y-1 hover:border-[#4a3f28] hover:shadow-[0_18px_52px_rgba(10,8,6,0.38)]"
    >
      {/* 图片区：固定 3/4 比例，不裁切，标签覆盖在图片上 */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#141210]">
        <img
          src={card.frontImageUrl}
          alt={card.itemName}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {/* 上架时间 — 左上角 */}
        <span className="absolute top-2 left-2 rounded bg-black/50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-white/80 backdrop-blur-sm pointer-events-none">
          {timeAgo(card.listedAt)}
        </span>
        {/* 溢价% + 等级标签 — 底部，不遮挡 PSA 标签 */}
        <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between pointer-events-none">
          {collPremium !== null ? (
            <span className={`rounded border px-1.5 py-0.5 font-mono text-[9px] font-medium tracking-wide backdrop-blur-sm ${
              collPremium < 0
                ? "border-[#2d6b52] bg-[#0d2e22]/80 text-[#5cd4a0]"
                : collPremium > 0
                ? "border-[#6b2d2d] bg-[#2e0d0d]/80 text-[#d47a5c]"
                : "border-white/10 bg-black/40 text-white/30"
            }`}>
              {collPremium > 0 ? "+" : ""}{collPremium}%
            </span>
          ) : <span />}
          <span className={`rounded-[0.4rem] border px-1.5 py-0.5 text-[9px] font-semibold backdrop-blur-sm ${getCollectorGradeBg(card.grade)} ${getCollectorGradeColor(card.grade)}`}>
            {card.grade}
          </span>
        </div>
      </div>
      {/* 底部信息区：白色背景 */}
      <div className="flex flex-1 flex-col bg-[#faf7f1] px-3 pt-2.5 pb-3">
        <p className="line-clamp-1 text-[0.84rem] font-semibold tracking-[-0.03em] text-[#1a1612]">
          {card.itemName}
        </p>
        <p className="mt-0.5 line-clamp-1 text-[10px] text-[#8a7f70]">
          {card.setName} · {card.gradingCompany}
        </p>
        {/* 价格行：大字价格 + 货币单位 */}
        <div className="mt-2 flex items-baseline justify-between gap-1">
          <span className="font-mono text-[1rem] font-bold tracking-[-0.02em] text-[#1a1612]">
            {card.listingCurrency === 'SOL' ? '◎ ' : '$'}{card.listingPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            <span className="ml-1 text-[0.65rem] font-semibold text-[#a89880]">{card.listingCurrency}</span>
          </span>
        </div>
        {/* 平台标识行 */}
        <div className="mt-1.5 flex items-center gap-1">
          <img src="/logos/collector-badge.png" alt="Collector" className="h-3.5 w-3.5 rounded-[0.2rem] object-contain opacity-80" />
          <span className="font-mono text-[9px] text-[#b0a090]">Collector</span>
        </div>
      </div>
    </motion.button>
  );
}

function CollectorListCard({
  card,
  onOpen,
}: {
  card: CollectorCard;
  onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
      className="grid grid-cols-[88px_1fr_auto] items-center gap-4 rounded-[1.25rem] border border-[#e8e0d0] bg-white/86 p-3 text-left shadow-[0_12px_38px_rgba(40,32,20,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d4c18f]/80"
    >
      <div className="aspect-[3/4] overflow-hidden rounded-[0.85rem] bg-[linear-gradient(180deg,#faf7f2,#f0ebe3)] p-1.5">
        <img
          src={card.frontImageUrl}
          alt={card.itemName}
          loading="lazy"
          className="h-full w-full object-contain"
        />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-semibold ${getCollectorGradeBg(card.grade)} ${getCollectorGradeColor(card.grade)}`}
          >
            {card.grade}
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#a89880]">
            {card.language || "Unknown"}
          </span>
        </div>
        <p className="mt-2 truncate text-[1.05rem] font-semibold tracking-[-0.03em] text-[#1a1612]">
          {card.itemName}
        </p>
        <p className="mt-0.5 truncate text-xs text-[#8a7f70]">
          {card.setName} · {card.gradingCompany} · {card.gradingId || "—"}
        </p>
      </div>
      <div className="text-right">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#a89880]">Price</span>
          <strong className="mt-1 block font-mono text-lg text-[#1a1612]">
            {formatCurrency(card.listingPrice)}
          </strong>
        </div>
        <div className="mt-2.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#a89880]">
            {card.listingCurrency}
          </span>
        </div>
      </div>
    </button>
  );
}

// ─── Collector 详情弹窗 ──────────────────────────────────────────────────────

function CollectorDetailModal({
  card,
  onClose,
}: {
  card: CollectorCard | null;
  onClose: () => void;
}) {
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    if (!card) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [card, onClose]);

  useEffect(() => {
    setShowBack(false);
  }, [card]);

  if (!card) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(12,10,8,0.72)] p-4 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/40 p-2 text-white/70 transition hover:bg-black/60 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="relative grid max-h-[88vh] w-full max-w-[1080px] overflow-hidden rounded-[1.6rem] border border-[#e7dece] bg-[#fbf8f1] shadow-[0_30px_90px_-36px_rgba(30,24,14,0.42)] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden bg-[#141210] p-4 lg:p-6">
          <img
            src={showBack && card.backImageUrl ? card.backImageUrl : card.frontImageUrl}
            alt={card.itemName}
            className="max-h-[72vh] max-w-full object-contain transition-transform duration-500 hover:scale-[1.45]"
          />
          <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-2">
            <button
              onClick={() => setShowBack(false)}
              className={`rounded-full px-3 py-1 text-[11px] ${!showBack ? "bg-white text-black" : "bg-white/10 text-white/70"}`}
            >
              正面
            </button>
            {card.backImageUrl ? (
              <button
                onClick={() => setShowBack(true)}
                className={`rounded-full px-3 py-1 text-[11px] ${showBack ? "bg-white text-black" : "bg-white/10 text-white/70"}`}
              >
                背面
              </button>
            ) : null}
          </div>
        </div>

        <div className="overflow-y-auto px-5 py-5 sm:px-6 lg:px-7">
          {/* 平台标识 */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full border border-[#f0e0c8] bg-[#fff8f0] px-2.5 py-1">
              <img src="/logos/collector-badge.png" alt="Collector" className="h-4 w-4 object-contain" />
              <span className="text-[11px] font-semibold text-[#c05a10]">Collector</span>
            </div>
            <span
              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getCollectorGradeBg(card.grade)} ${getCollectorGradeColor(card.grade)}`}
            >
              {card.grade}
            </span>
            <span className="text-[12px] text-black/38">
              {card.gradingCompany} · {card.language || "Unknown"} · {card.year || "—"}
            </span>
            {card.isNew ? (
              <span className="rounded-full border border-[#4a9e6a] bg-[#ebfff1] px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-[#267046]">
                NEW
              </span>
            ) : null}
          </div>

          <h2 className="mt-3 text-[1.8rem] font-semibold tracking-[-0.045em] text-[#171411]">
            {card.itemName}
          </h2>
          <p className="mt-1 text-[13px] text-black/40">
            {card.category} · {card.setName}{card.cardNumber ? ` · #${card.cardNumber}` : ""}
          </p>

          {/* 价格区 */}
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-[1.15rem] border border-[#e7dece] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(245,239,227,0.9))] px-4 py-3 shadow-[0_8px_22px_rgba(40,32,20,0.04)]">
              <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-black/24">Listing Price</div>
              <div className="mt-1 text-[1.5rem] font-semibold tracking-[-0.04em] text-[#171411]">
                {card.listingCurrency === "SOL" ? "◎" : "$"}{card.listingPrice}
              </div>
              <div className="mt-0.5 font-mono text-[11px] text-black/36">{card.listingCurrency === "SOL" ? "SOL · Solana" : card.listingCurrency}</div>
            </div>
            <div className="rounded-[1.15rem] border border-[#e7dece] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(245,239,227,0.9))] px-4 py-3 shadow-[0_8px_22px_rgba(40,32,20,0.04)]">
              <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-black/24">Market</div>
              <div className="mt-1 flex items-center gap-2">
                <img src="/logos/collector-badge.png" alt="Collector" className="h-5 w-5 object-contain" />
                <span className="text-[1.1rem] font-semibold tracking-[-0.03em] text-[#171411]">
                  {card.vault || card.listingMarketplace || "Collector"}
                </span>
              </div>
            </div>
          </div>

          {/* 卡牌属性 */}
          <div className="mt-4">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-black/28">Card Attributes</div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {[
                ["PSA 序列号", card.gradingId || "—"],
                ["评级", card.grade || "—"],
                ["年份", card.year ? String(card.year) : "—"],
                ["语言", card.language || "Unknown"],
                ["系列", card.setName || "—"],
                ["卡牌编号", card.cardNumber ? `#${card.cardNumber}` : "—"],
                ["评级机构", card.gradingCompany || "—"],
                ["平台", "Collector"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[1rem] border border-[#ece3d4] bg-[#f8f4ed] px-4 py-3">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-black/28">{label}</div>
                  <div className="mt-1.5 break-all text-[14px] font-medium text-[#171411]">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 上架时间 */}
          {card.listedAt && (
            <div className="mt-2.5 rounded-[1rem] border border-[#ece3d4] bg-[#f8f4ed] px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-black/28">最近上架</div>
              <div className="mt-1.5 text-[14px] font-medium text-[#171411]">{new Date(card.listedAt).toLocaleString()}</div>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={card.assetUrl || "https://collectorcrypt.com/marketplace/cards"}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-black"
            >
              前往 Collector 页面
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <p className="mt-4 text-[11px] leading-relaxed text-black/28">
            数据来源于 Collector Crypt 市场，仅供参考，不构成投资建议。
          </p>
        </div>
      </div>
    </div>
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

// ─── 对 Collector 卡牌应用筛选逻辑 ──────────────────────────────────────────

interface FilterState {
  search: string;
  category: string;
  gradeFilter: string;
  graderCompany: string;
  priceMin: number;
  priceMax: number;
  language: string;
  yearFrom: string;
  yearTo: string;
  sortBy: SortBy;
}

function filterCollectorCards(cards: CollectorCard[], filters: FilterState): CollectorCard[] {
  let result = [...cards];

  if (filters.search.trim()) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (c) =>
        c.itemName.toLowerCase().includes(q) ||
        c.setName.toLowerCase().includes(q) ||
        c.cardNumber.toLowerCase().includes(q) ||
        c.gradingId.toLowerCase().includes(q) ||
        c.ownerWallet.toLowerCase().includes(q),
    );
  }

  if (filters.category !== "all") {
    result = result.filter(
      (c) => c.category.toLowerCase() === filters.category.toLowerCase(),
    );
  }

  if (filters.gradeFilter !== "all") {
    if (filters.gradeFilter === "≤6") {
      result = result.filter((c) => c.gradeNum > 0 && c.gradeNum <= 6);
    } else {
      result = result.filter((c) => c.grade.includes(filters.gradeFilter));
    }
  }

  if (filters.graderCompany !== "all") {
    result = result.filter(
      (c) => c.gradingCompany.toUpperCase() === filters.graderCompany.toUpperCase(),
    );
  }

  result = result.filter(
    (c) => c.listingPrice >= filters.priceMin && c.listingPrice <= filters.priceMax,
  );

  if (filters.language !== "all") {
    result = result.filter((c) => c.language === filters.language);
  }

  if (filters.yearFrom) {
    const from = parseInt(filters.yearFrom, 10);
    if (!isNaN(from)) result = result.filter((c) => c.year >= from);
  }
  if (filters.yearTo) {
    const to = parseInt(filters.yearTo, 10);
    if (!isNaN(to)) result = result.filter((c) => c.year <= to);
  }

  switch (filters.sortBy) {
    case "price-asc":
      result.sort((a, b) => a.listingPrice - b.listingPrice);
      break;
    case "price-desc":
      result.sort((a, b) => b.listingPrice - a.listingPrice);
      break;
    case "grade":
      result.sort((a, b) => b.gradeNum - a.gradeNum);
      break;
    case "newest":
    default:
      result.sort((a, b) => {
        if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;
        return new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime();
      });
      break;
  }

  return result;
}

export default function MarketLuxe() {
  const [, navigate] = useLocation();
  const {
    cards: renaissCards,
    loading: renaissLoading,
    initialLoaded: renaissInitialLoaded,
    error: renaissError,
    filters,
    setFilters,
    lastUpdated,
    refreshData: refreshRenaiss,
    totalCount: renaissTotalCount,
  } = useRenaissData();

  const {
    allCards: collectorAllCards,
    loading: collectorLoading,
    initialLoaded: collectorInitialLoaded,
    error: collectorError,
    refreshData: refreshCollector,
  } = useCollectorData();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<PlatformId>>(new Set<PlatformId>(["renaiss"]));
  const [visibleCount, setVisibleCount] = useState(PAGE_STEP);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [selectedCollectorCard, setSelectedCollectorCard] = useState<CollectorCard | null>(null);
  const [graderFilter, setGraderFilter] = useState("all");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [premiumUnlocked, setPremiumUnlocked] = useState(() => {
    try { return localStorage.getItem(PREMIUM_LS_KEY) === "1"; } catch { return false; }
  });
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // 多选平台逻辑：至少保留一个选中
  const togglePlatform = (id: PlatformId) => {
    setSelectedPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const showRenaiss = selectedPlatforms.has("renaiss");
  const showCollector = selectedPlatforms.has("collector");

  // 对 Collector 卡牌应用同样的筛选条件
  const filteredCollectorCards = useMemo(() => {
    if (!showCollector) return [];
    return filterCollectorCards(collectorAllCards, {
      search: filters.search,
      category: filters.category,
      gradeFilter: filters.gradeFilter,
      graderCompany: filters.graderCompany,
      priceMin: filters.priceMin,
      priceMax: filters.priceMax,
      language: filters.language,
      yearFrom: filters.yearFrom,
      yearTo: filters.yearTo,
      sortBy: filters.sortBy,
    });
  }, [collectorAllCards, filters, showCollector]);

  // 组合卡牌列表
  const combinedCards = useMemo<UnifiedCard[]>(() => {
    // 单平台模式：直接返回对应平台数据
    if (showRenaiss && !showCollector) {
      return renaissCards.map((c) => ({ _source: "renaiss" as const, ...c }));
    }
    if (showCollector && !showRenaiss) {
      return filteredCollectorCards.map((c) => ({ _source: "collector" as const, ...c }));
    }
    // 双平台模式：交替插入，确保两个市场卡牌都在首屏可见
    // Renaiss 和 Collector 各自已排好序，交叉合并
    if (showRenaiss && showCollector) {
      const rList = renaissCards.map((c) => ({ _source: "renaiss" as const, ...c }));
      const cList = filteredCollectorCards.map((c) => ({ _source: "collector" as const, ...c }));
      const merged: UnifiedCard[] = [];
      const maxLen = Math.max(rList.length, cList.length);
      for (let i = 0; i < maxLen; i++) {
        if (i < rList.length) merged.push(rList[i]!);
        if (i < cList.length) merged.push(cList[i]!);
      }
      return merged;
    }
    return [];
  }, [renaissCards, filteredCollectorCards, showRenaiss, showCollector]);

  const totalCount = combinedCards.length;
  // loading：只有当前选中的平台正在加载且还没有任何数据时才显示全局 loading
  const renaissHasData = renaissCards.length > 0;
  const collectorHasData = collectorAllCards.length > 0;
  const loading =
    (showRenaiss && renaissLoading && !renaissHasData) ||
    (showCollector && collectorLoading && !collectorHasData);
  // initialLoaded：只要当前选中的平台有数据或已完成加载，就认为可以渲染
  const initialLoaded =
    (!showRenaiss || renaissInitialLoaded || renaissHasData) &&
    (!showCollector || collectorInitialLoaded || collectorHasData);
  const error = renaissError || collectorError;

  // 兼容旧变量名（用于工具栏标签显示）
  const onlyCollectorSelected = showCollector && !showRenaiss;
  const selectedPlatform = showRenaiss ? "renaiss" : "collector";
  const platformMeta = platforms.find((item) => item.id === selectedPlatform) ?? platforms[0];

  useEffect(() => {
    setVisibleCount(PAGE_STEP);
  }, [filters, selectedPlatforms]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;
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
  }, []);

  const visibleCards = useMemo(
    () => combinedCards.slice(0, visibleCount),
    [combinedCards, visibleCount],
  );

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

  const handleRefresh = async () => {
    if (showRenaiss) await refreshRenaiss();
    if (showCollector) await refreshCollector();
  };

  const FilterPanel = () => (
    <div className="space-y-5">
      {/* 平台选择 */}
      <div>
        <div className="mb-3 text-[10px] font-mono uppercase tracking-[0.28em] text-[#a89880]">平台</div>
        <div className="flex flex-wrap gap-2">
          {platforms.map((platform) => {
            const active = selectedPlatforms.has(platform.id);
            return (
              <button
                key={platform.id}
                onClick={() => togglePlatform(platform.id)}
                title={`${platform.label} · ${platform.status}`}
                className={`relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[0.8rem] border-2 transition-all duration-200 ${
                  active
                    ? platform.live
                      ? "border-[#4a9e6a] bg-white shadow-[0_2px_14px_rgba(74,158,106,0.28)]"
                      : "border-[#1a1612] bg-white shadow-[0_2px_14px_rgba(26,22,18,0.2)]"
                    : "border-[#e0d8cc] bg-white/60 opacity-45 hover:opacity-75"
                }`}
              >
                <img
                  src={platform.logo}
                  alt={platform.label}
                  className="h-7 w-7 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                {platform.live && (
                  <span className="absolute bottom-0.5 right-0.5 h-2 w-2 rounded-full bg-[#4a9e6a] ring-1 ring-white animate-pulse" />
                )}
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
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="名称、系列、序列号…"
            className="h-11 w-full rounded-[0.95rem] border border-[#e0d8cc] bg-[#faf7f2] pl-10 pr-4 text-[13px] text-[#1a1612] placeholder:text-[#b8ad9e] outline-none transition-all focus:border-[#c8a84a] focus:bg-white"
          />
        </div>
      </div>

      {/* 排序 */}
      <div>
        <div className="mb-2 text-[10px] font-mono uppercase tracking-[0.28em] text-[#a89880]">排序</div>
        <select
          value={filters.sortBy}
          onChange={(e) => {
            const val = e.target.value as SortBy;
            if (val === "premium" && !premiumUnlocked) {
              setPremiumModalOpen(true);
              // 重置回之前的值
              e.target.value = filters.sortBy;
              return;
            }
            setFilters({ ...filters, sortBy: val });
          }}
          className="h-11 w-full rounded-[0.95rem] border border-[#e0d8cc] bg-[#faf7f2] px-4 text-[13px] text-[#1a1612] outline-none transition-all focus:border-[#c8a84a] focus:bg-white"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.value === "premium" && !premiumUnlocked ? `${opt.label}（测试中）` : opt.label}
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
            onChange={(e) => setFilters({ ...filters, priceMin: Number(e.target.value) || 0 })}
            placeholder="最低"
            className="h-10 w-full rounded-[0.85rem] border border-[#e0d8cc] bg-[#faf7f2] px-3 text-[13px] text-[#1a1612] placeholder:text-[#b8ad9e] outline-none transition-all focus:border-[#c8a84a] focus:bg-white"
          />
          <input
            type="number"
            value={filters.priceMax >= 100000 ? "" : filters.priceMax}
            onChange={(e) =>
              setFilters({ ...filters, priceMax: Number(e.target.value) || 100000 })
            }
            placeholder="最高"
            className="h-10 w-full rounded-[0.85rem] border border-[#e0d8cc] bg-[#faf7f2] px-3 text-[13px] text-[#1a1612] placeholder:text-[#b8ad9e] outline-none transition-all focus:border-[#c8a84a] focus:bg-white"
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
            onChange={(e) => {
              setYearFrom(e.target.value);
              setFilters({ ...filters, yearFrom: e.target.value });
            }}
            placeholder="从"
            className="h-10 w-full rounded-[0.85rem] border border-[#e0d8cc] bg-[#faf7f2] px-3 text-[13px] text-[#1a1612] placeholder:text-[#b8ad9e] outline-none transition-all focus:border-[#c8a84a] focus:bg-white"
          />
          <input
            type="number"
            value={yearTo}
            onChange={(e) => {
              setYearTo(e.target.value);
              setFilters({ ...filters, yearTo: e.target.value });
            }}
            placeholder="至"
            className="h-10 w-full rounded-[0.85rem] border border-[#e0d8cc] bg-[#faf7f2] px-3 text-[13px] text-[#1a1612] placeholder:text-[#b8ad9e] outline-none transition-all focus:border-[#c8a84a] focus:bg-white"
          />
        </div>
      </div>

      {/* 重置 */}
      <button
        onClick={resetFilters}
        className="w-full rounded-full border border-[#e0d8cc] bg-[#faf7f2] py-2.5 text-[13px] font-medium text-[#6b6055] transition-all hover:border-[#1a1612] hover:bg-[#1a1612] hover:text-white"
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
              {!loading && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#b8e4c8] bg-[#edf9f2] px-2 py-0.5 text-[10px] font-medium text-[#2d7a4f]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4a9e6a] animate-pulse" />
                  Live
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden sm:block font-mono text-[11px] text-[#a89880] tabular-nums">
              {totalCount.toLocaleString()} 张在售
            </span>
            {/* 移动端筛选按钮 */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#e0d8cc] bg-white/75 px-3 py-1.5 text-[12px] font-medium text-[#6b6055] transition-all hover:bg-[#1a1612] hover:text-white hover:border-[#1a1612] xl:hidden"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              筛选
            </button>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#e0d8cc] bg-white/75 px-3 py-1.5 text-[12px] font-medium text-[#6b6055] transition-all hover:bg-[#1a1612] hover:text-white hover:border-[#1a1612] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
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

      {/* 平台监控标识区域 — 纯 logo 小图标，紧凑可扩展 */}
      <div className="border-b border-[#ece5d8] bg-[#faf7f2] px-4 py-3 sm:px-5 lg:px-6">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#a89880] shrink-0">监控平台</span>
          <div className="flex items-center gap-2">
            {platforms.map((platform) => {
              const active = selectedPlatforms.has(platform.id);
              return (
                <button
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  title={`${platform.label} · ${platform.status}`}
                  className={`relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[0.7rem] border-2 transition-all duration-200 ${
                    active
                      ? platform.live
                        ? "border-[#4a9e6a] bg-white shadow-[0_2px_12px_rgba(74,158,106,0.25)]"
                        : "border-[#1a1612] bg-white shadow-[0_2px_12px_rgba(26,22,18,0.18)]"
                      : "border-[#e0d8cc] bg-white/60 opacity-40 hover:opacity-70"
                  }`}
                >
                  <img
                    src={platform.logo}
                    alt={platform.label}
                    className="h-6 w-6 object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  {/* Live 绿点 */}
                  {platform.live && (
                    <span className="absolute bottom-0.5 right-0.5 h-2 w-2 rounded-full bg-[#4a9e6a] ring-1 ring-white animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

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
                  {showRenaiss && showCollector
                    ? "Renaiss + Collector"
                    : showCollector
                    ? "Collector Market"
                    : "Renaiss"}
                </span>
                {/* 组合模式下 Collector 仍在加载时显示小提示 */}
                {showCollector && collectorLoading && !collectorHasData && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e0d8cc] bg-[#faf7f2] px-3 py-1.5 text-[#a89880]">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Collector 加载中…
                  </span>
                )}
                <span className="rounded-full border border-[#e0d8cc] bg-[#faf7f2] px-3 py-1.5">
                  {`${totalCount.toLocaleString()} 条结果`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {showRenaiss && !showCollector && (
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
                {showCollector && !showRenaiss && (
                  <a
                    href="https://collectorcrypt.com/marketplace/cards"
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
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] transition-all ${
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
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] transition-all ${
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
                      className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
                    >
                      {Array.from({ length: 18 }).map((_, i) => (
                        <SkeletonCard key={i} />
                      ))}
                    </motion.div>
                  ) : !combinedCards.length && loading ? (
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
                  ) : !!combinedCards.length ? (
                    <motion.div
                      key="cards"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.28 }}
                    >
                      <div
                        className={
                          viewMode === "grid"
                            ? "grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
                            : "space-y-3"
                        }
                      >
                        {visibleCards.map((card, i) => {
                          if (card._source === "renaiss") {
                            const rc = card as { _source: "renaiss" } & RenaissCard;
                            return viewMode === "grid" ? (
                              <MarketGridCard
                                key={`renaiss-${rc.tokenId}`}
                                card={rc}
                                index={i}
                                onOpen={() => setSelectedCard(toCardDetailData(rc))}
                              />
                            ) : (
                              <MarketListCard
                                key={`renaiss-${rc.tokenId}`}
                                card={rc}
                                onOpen={() => setSelectedCard(toCardDetailData(rc))}
                              />
                            );
                          } else {
                            const cc = card as { _source: "collector" } & CollectorCard;
                            return viewMode === "grid" ? (
                              <CollectorGridCard
                                key={`collector-${cc.id}`}
                                card={cc}
                                index={i}
                                onOpen={() => setSelectedCollectorCard(cc)}
                              />
                            ) : (
                              <CollectorListCard
                                key={`collector-${cc.id}`}
                                card={cc}
                                onOpen={() => setSelectedCollectorCard(cc)}
                              />
                            );
                          }
                        })}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                {!loading && !combinedCards.length && !error && (
                  <div className="rounded-[1.75rem] border border-[#e8e0d0] bg-white/78 p-8 text-center">
                    <p className="font-serif text-3xl tracking-[-0.04em] text-[#1a1612]">没有符合条件的卡牌</p>
                    <p className="mt-3 text-sm leading-7 text-[#8a7f70]">
                      请尝试调整搜索词、价格区间、等级或语言筛选条件。
                    </p>
                  </div>
                )}

                <div ref={loadMoreRef} className="mt-6 flex items-center justify-center py-6">
                  {visibleCount < combinedCards.length ? (
                    <div className="rounded-full border border-[#e0d8cc] bg-white/75 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.24em] text-[#a89880]">
                      加载更多 · {visibleCount}/{combinedCards.length}
                    </div>
                  ) : combinedCards.length ? (
                    <div className="rounded-full border border-[#e0d8cc] bg-white/75 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.24em] text-[#a89880]">
                      已加载全部 {combinedCards.length.toLocaleString()} 张
                    </div>
                  ) : null}
                </div>
              </>
            </div>
          </section>
        </section>

        <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
        <CollectorDetailModal card={selectedCollectorCard} onClose={() => setSelectedCollectorCard(null)} />
        <PremiumUnlockModal
          open={premiumModalOpen}
          onClose={() => setPremiumModalOpen(false)}
          onUnlock={() => {
            setPremiumUnlocked(true);
            setPremiumModalOpen(false);
            setFilters({ ...filters, sortBy: "premium" });
          }}
        />
      </main>
    </div>
  );
}
