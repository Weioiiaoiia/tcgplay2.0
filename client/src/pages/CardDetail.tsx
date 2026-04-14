/**
 * 卡牌详情页 — 严格一屏显示，零滚动
 * 
 * 布局：左侧卡图 + 右侧信息，全部 h-screen 内展示
 * 右侧使用 flex-col justify-between 自动分配空间
 */
import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, ExternalLink, Copy, Check } from "lucide-react";
import { useLocation, useParams } from "wouter";
import {
  getGradeColor,
  getGradeBg,
  getRenaissCardUrl,
  getPSAUrl,
  getGradeLevel,
} from "@/lib/renaissApi";
import type { RenaissCard } from "@/lib/renaissApi";
import { useCardData } from "@/contexts/CardDataContext";
import CardMagnifier from "@/components/CardMagnifier";

/* ─── 复制按钮 ─── */
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="p-1 rounded-md hover:bg-white/[0.06] transition-colors"
    >
      {copied ? (
        <Check className="w-3 h-3 text-emerald-400" />
      ) : (
        <Copy className="w-3 h-3 text-white/20 hover:text-white/40" />
      )}
    </button>
  );
}

export default function CardDetail() {
  const params = useParams<{ tokenId: string }>();
  const [, navigate] = useLocation();
  const { getCardByTokenId, fetchSingleCard, initialLoaded, loading } = useCardData();

  const cachedCard = useMemo(
    () => getCardByTokenId(params.tokenId),
    [getCardByTokenId, params.tokenId]
  );

  const [apiCard, setApiCard] = useState<RenaissCard | null>(null);
  const [apiFetching, setApiFetching] = useState(false);
  const [apiFailed, setApiFailed] = useState(false);

  useEffect(() => {
    if (cachedCard) return;
    if (!initialLoaded && loading) return;
    if (!cachedCard && initialLoaded && !apiCard && !apiFetching && !apiFailed) {
      setApiFetching(true);
      fetchSingleCard(params.tokenId)
        .then((card) => {
          if (card) setApiCard(card);
          else setApiFailed(true);
        })
        .catch(() => setApiFailed(true))
        .finally(() => setApiFetching(false));
    }
  }, [cachedCard, initialLoaded, loading, apiCard, apiFetching, apiFailed, params.tokenId, fetchSingleCard]);

  const card = cachedCard || apiCard;

  if (!initialLoaded && loading) {
    return (
      <div className="h-screen bg-[#08080d] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
          <p className="text-[12px] text-white/25">加载卡牌数据...</p>
        </div>
      </div>
    );
  }

  if (!card && apiFetching) {
    return (
      <div className="h-screen bg-[#08080d] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
          <p className="text-[12px] text-white/25">获取卡牌详情...</p>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="h-screen bg-[#08080d] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/30 text-[14px] mb-4">该卡牌当前未在市场上架</p>
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2 rounded-xl bg-white/[0.06] text-[12px] text-white/50 hover:text-white/70 hover:bg-white/[0.1] transition-all flex items-center gap-1.5 mx-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            返回市场
          </button>
        </div>
      </div>
    );
  }

  const renaissUrl = getRenaissCardUrl(card.tokenId);
  const psaUrl = getPSAUrl(card.serial);
  const gradeNum = card.grade.split(" ")[0];
  const gradeLabel = getGradeLevel(card.grade);
  const shortName = card.pokemonName || card.name.split("#")[0]?.trim().replace(/^PSA\s+\d+\s+\w+\s+\w+\s+\d+\s+/, "");

  return (
    <div className="h-screen bg-[#08080d] text-white overflow-hidden flex flex-col">
      {/* ── 顶栏 44px ── */}
      <nav className="shrink-0 h-11 bg-[#0b0b10]/95 backdrop-blur-xl border-b border-white/[0.05] z-50 flex items-center">
        <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-8 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-[12px] font-medium">返回市场</span>
          </button>
          <a
            href={renaissUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[12px] text-amber-400 font-medium hover:bg-amber-500/15 transition-all flex items-center gap-1.5"
          >
            购买
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </nav>

      {/* ── 主体：占满剩余高度 ── */}
      <div className="flex-1 min-h-0 flex">
        
        {/* ── 左：卡牌图片 ── */}
        <div className="hidden lg:flex w-[40%] shrink-0 bg-[#0a0a0f] items-center justify-center p-6 xl:p-10">
          <div className="relative w-full max-w-[360px]" style={{ height: "calc(100vh - 5rem)", maxHeight: "680px" }}>
            <div className="w-full h-full rounded-2xl overflow-hidden" style={{ aspectRatio: "auto" }}>
              <CardMagnifier
                src={card.frontImageUrl}
                highResSrc={card.frontImageUrl}
                alt={card.name}
                magnification={2.5}
                lensSize={180}
              />
            </div>
            <p className="absolute -bottom-5 left-0 right-0 text-[9px] text-white/12 text-center">
              悬停放大查看细节
            </p>
          </div>
        </div>

        {/* ── 右：信息面板 — 严格一屏，flex分配 ── */}
        <div className="flex-1 flex items-center justify-center px-5 sm:px-8 xl:px-12">
          <div className="w-full max-w-[540px] h-full max-h-[calc(100vh-3.5rem)] flex flex-col justify-center py-4 gap-[clamp(0.5rem,1.2vh,1rem)]">

            {/* 移动端图片 */}
            <div className="lg:hidden aspect-[3/4] max-h-[200px] rounded-xl overflow-hidden bg-[#0a0a0f] mx-auto w-full max-w-[160px] shrink-0">
              <img src={card.frontImageUrl} alt={card.name} className="w-full h-full object-contain" />
            </div>

            {/* 标题区 */}
            <div className="shrink-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getGradeBg(card.grade)} ${getGradeColor(card.grade)}`}>
                  PSA {gradeNum} {gradeLabel}
                </span>
                <span className="text-[11px] text-white/25">{card.year} · {card.language}</span>
              </div>
              <h1 className="text-[clamp(1.1rem,2.2vw,1.5rem)] font-bold text-white/95 leading-tight tracking-tight">
                {shortName}
              </h1>
              <p className="text-[11px] text-white/25 mt-0.5">
                {card.setName} · Card #{card.cardNumber}
              </p>
            </div>

            {/* FMV */}
            <div className="shrink-0 rounded-xl bg-[#12121a] border border-white/[0.06] px-4 py-3">
              <span className="text-[9px] text-white/20 uppercase tracking-[0.1em] font-medium block mb-0.5">
                Fair Market Value
              </span>
              <span className="text-[clamp(1.4rem,3vh,2rem)] font-bold text-amber-400 font-mono tracking-tight leading-none block">
                ${card.fmvPriceUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <p className="text-[9px] text-white/15 mt-1">Based on Renaiss Protocol real-time pricing</p>
            </div>

            {/* Ask Price */}
            <div className="shrink-0 rounded-xl bg-[#12121a] border border-white/[0.06] px-4 py-3">
              <span className="text-[9px] text-white/20 uppercase tracking-[0.1em] font-medium block mb-0.5">
                Ask Price
              </span>
              <span className="text-[clamp(1.2rem,2.5vh,1.7rem)] font-bold text-white/90 font-mono tracking-tight leading-none block">
                ${card.askPriceUSDT.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Card Attributes — 2x4 紧凑网格 */}
            <div className="shrink-0">
              <span className="text-[9px] text-white/20 uppercase tracking-[0.1em] font-medium block mb-1.5">
                Card Attributes
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: "PSA Serial", value: card.serial },
                  { label: "Grade", value: `${gradeNum} ${gradeLabel}` },
                  { label: "Year", value: String(card.year) },
                  { label: "Language", value: card.language },
                  { label: "Set", value: card.setName },
                  { label: "Card Number", value: `#${card.cardNumber}` },
                  { label: "Grading Company", value: card.gradingCompany },
                  { label: "Vault Location", value: "Platform" },
                ].map((attr) => (
                  <div key={attr.label} className="rounded-lg bg-[#12121a] border border-white/[0.05] px-3 py-[clamp(0.35rem,0.8vh,0.6rem)]">
                    <span className="text-[8px] text-white/20 uppercase tracking-wider block">
                      {attr.label}
                    </span>
                    <span className="text-[12px] text-white/75 font-medium block truncate leading-snug" title={attr.value}>
                      {attr.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Owner */}
            <div className="shrink-0 rounded-lg bg-[#12121a] border border-white/[0.05] px-3 py-2 flex items-center justify-between">
              <div className="min-w-0">
                <span className="text-[8px] text-white/20 uppercase tracking-wider block">Owner</span>
                <span className="text-[11px] text-white/40 font-mono truncate block">
                  {card.ownerUsername || card.ownerAddress.substring(0, 20) + "..."}
                </span>
              </div>
              <CopyBtn text={card.ownerUsername || card.ownerAddress} />
            </div>

            {/* 按钮 */}
            <div className="shrink-0 grid grid-cols-2 gap-2">
              <a
                href={psaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-amber-500/12 border border-amber-500/20 text-[11px] text-amber-400 font-semibold hover:bg-amber-500/18 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                查看 PSA 官网真实数据
              </a>
              <a
                href={renaissUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[11px] text-white/40 font-medium hover:bg-white/[0.07] hover:text-white/60 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                在 Renaiss 官网查看
              </a>
            </div>

            <p className="shrink-0 text-[8px] text-white/8 text-center">
              数据来源 Renaiss Protocol (BNB Chain) · PSA 官方认证 · 实时同步
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
