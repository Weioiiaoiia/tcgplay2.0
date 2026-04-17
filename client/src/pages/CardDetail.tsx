/**
 * Design note — Fog-white precision exhibition system.
 * This page should feel like a private viewing room: luminous, editorial,
 * materially precise, and still fully functional for real card-detail review.
 */
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, Copy, ExternalLink } from "lucide-react";
import { useLocation, useParams } from "wouter";
import {
  getGradeLevel,
  getPSAUrl,
  getRenaissCardUrl,
  type RenaissCard,
} from "@/lib/renaissApi";
import { useCardData } from "@/contexts/CardDataContext";
import CardMagnifier from "@/components/CardMagnifier";

function gradeBadgeClass(grade: string) {
  const value = Number(grade.split(" ")[0]);
  if (value >= 10) return "bg-amber-100 text-amber-900 border-amber-200";
  if (value >= 9) return "bg-emerald-100 text-emerald-900 border-emerald-200";
  if (value >= 8) return "bg-sky-100 text-sky-900 border-sky-200";
  return "bg-neutral-200 text-neutral-800 border-neutral-300";
}

function formatMoney(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={(event) => {
        event.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      }}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/8 bg-white text-black/60 transition hover:bg-black hover:text-white"
      aria-label="复制地址"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

export default function CardDetail() {
  const params = useParams<{ tokenId: string }>();
  const [, navigate] = useLocation();
  const { getCardByTokenId, fetchSingleCard, initialLoaded, loading } = useCardData();

  const cachedCard = useMemo(
    () => getCardByTokenId(params.tokenId),
    [getCardByTokenId, params.tokenId],
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

  if ((!initialLoaded && loading) || (!card && apiFetching)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f7f4ee_0%,#efeae1_100%)]">
        <div className="flex flex-col items-center gap-4 rounded-[1.8rem] border border-black/8 bg-white/78 px-10 py-9 shadow-[0_30px_90px_-48px_rgba(24,24,27,0.35)] backdrop-blur-xl">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-t-black/70" />
          <p className="text-sm text-black/50">正在整理卡牌详情数据…</p>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f7f4ee_0%,#efeae1_100%)] px-4">
        <div className="w-full max-w-xl rounded-[2rem] border border-black/8 bg-white/80 p-10 text-center shadow-[0_30px_100px_-50px_rgba(24,24,27,0.34)] backdrop-blur-xl">
          <p className="text-lg font-medium text-neutral-950">该卡牌当前未在市场上架</p>
          <p className="mt-3 text-sm leading-7 text-black/46">
            可能是缓存中不存在该 token，或者上游市场状态已经变化。你仍然可以返回市场继续浏览。
          </p>
          <button
            onClick={() => navigate("/market")}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-black"
          >
            <ArrowLeft className="h-4 w-4" />
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
  const shortName =
    card.pokemonName || card.name.split("#")[0]?.trim().replace(/^PSA\s+\d+\s+\w+\s+\w+\s+\d+\s+/, "");

  const attrList = [
    { label: "PSA Serial", value: card.serial },
    { label: "Grade", value: `${gradeNum} ${gradeLabel}` },
    { label: "Year", value: String(card.year) },
    { label: "Language", value: card.language },
    { label: "Set", value: card.setName },
    { label: "Card Number", value: `#${card.cardNumber}` },
    { label: "Grading Company", value: card.gradingCompany },
    { label: "Vault Location", value: "Platform" },
  ];

  const ownerText = card.ownerUsername || card.ownerAddress;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f4ee_0%,#efeae1_44%,#f8f6f1_100%)] text-neutral-950">
      <div className="absolute inset-x-0 top-0 -z-10 h-[26rem] bg-[radial-gradient(circle_at_top_left,rgba(212,193,151,0.22),transparent_38%),radial-gradient(circle_at_top_right,rgba(119,134,157,0.12),transparent_30%)]" />

      <header className="sticky top-0 z-40 px-4 pt-4 sm:px-6">
        <div className="mx-auto flex max-w-[1360px] items-center justify-between rounded-full border border-black/8 bg-white/78 px-4 py-3 shadow-[0_18px_60px_-36px_rgba(24,24,27,0.32)] backdrop-blur-xl sm:px-6">
          <button
            onClick={() => navigate("/market")}
            className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-[#f6f2eb] px-3.5 py-2 text-sm font-medium text-black/68 transition hover:bg-black hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            返回市场
          </button>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="text-[0.64rem] uppercase tracking-[0.28em] text-black/34">Card Detail</div>
            <div className={`rounded-full border px-3 py-1.5 text-[0.72rem] font-semibold ${gradeBadgeClass(card.grade)}`}>
              PSA {gradeNum} {gradeLabel}
            </div>
          </div>

          <a
            href={renaissUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black"
          >
            前往 Renaiss
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </header>

      <main className="container grid min-h-[calc(100vh-6rem)] gap-6 pb-8 pt-8 xl:grid-cols-[0.95fr_1.05fr] xl:items-stretch">
        {/* 左侧图片区 — 去掉 PRIVATE VIEWING ROOM 标题 */}
        <section className="relative overflow-hidden rounded-[2.2rem] border border-black/8 bg-white/78 p-5 shadow-[0_30px_100px_-48px_rgba(24,24,27,0.34)] backdrop-blur-xl sm:p-7 lg:p-8">
          <div className="mx-auto flex h-full min-h-[24rem] items-center justify-center rounded-[1.8rem] bg-[radial-gradient(circle_at_top,rgba(214,195,155,0.24),transparent_50%),linear-gradient(180deg,#faf7f2,#f1ece4)] p-4 sm:p-8">
            <div className="w-full max-w-[26rem] overflow-hidden rounded-[1.4rem] border border-black/8 bg-white shadow-[0_26px_90px_-48px_rgba(24,24,27,0.35)]">
              <CardMagnifier
                src={card.frontImageUrl}
                highResSrc={card.frontImageUrl}
                alt={card.name}
                magnification={2.4}
                lensSize={180}
              />
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-black/36">桌面端支持悬停放大查看卡面细节</p>
        </section>

        {/* 右侧信息区 */}
        <section className="rounded-[2.2rem] border border-black/8 bg-white/82 p-6 shadow-[0_34px_100px_-46px_rgba(24,24,27,0.34)] backdrop-blur-xl sm:p-8">
          <div className="flex h-full flex-col gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-3 py-1.5 text-[0.72rem] font-semibold ${gradeBadgeClass(card.grade)}`}>
                  PSA {gradeNum} {gradeLabel}
                </span>
                <span className="text-sm text-black/38">{card.year} · {card.language}</span>
              </div>
              <h1 className="mt-4 font-serif text-4xl leading-[0.95] text-neutral-950 sm:text-5xl">
                {shortName}
              </h1>
              <p className="mt-3 text-sm leading-7 text-black/46">
                {card.setName} · Card #{card.cardNumber}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-black/8 bg-[linear-gradient(180deg,#fffdfa,#f3eee5)] p-5">
                <div className="text-[0.62rem] uppercase tracking-[0.24em] text-black/30">Fair Market Value</div>
                <div className="mt-3 text-3xl font-semibold text-neutral-950 sm:text-[2.2rem]">
                  {formatMoney(card.fmvPriceUSD)}
                </div>
                <p className="mt-2 text-xs text-black/38">基于 Renaiss 实时市场定价</p>
              </div>
              <div className="rounded-[1.5rem] border border-black/8 bg-[#f6f2eb] p-5">
                <div className="text-[0.62rem] uppercase tracking-[0.24em] text-black/30">Ask Price</div>
                <div className="mt-3 text-3xl font-semibold text-neutral-950 sm:text-[2.2rem]">
                  {formatMoney(card.askPriceUSDT)}
                </div>
                <p className="mt-2 text-xs text-black/38">当前市场挂牌价格</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {attrList.map((attr) => (
                <div key={attr.label} className="rounded-[1.2rem] border border-black/8 bg-white px-4 py-3.5">
                  <div className="text-[0.58rem] uppercase tracking-[0.22em] text-black/28">{attr.label}</div>
                  <div className="mt-1.5 truncate text-sm font-medium text-black/76" title={attr.value}>
                    {attr.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[1.4rem] border border-black/8 bg-[#f6f2eb] px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[0.58rem] uppercase tracking-[0.22em] text-black/28">Owner</div>
                  <div className="mt-1.5 truncate font-mono text-sm text-black/68">{ownerText}</div>
                </div>
                <CopyBtn text={ownerText} />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <a
                href={psaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-black/8 bg-white px-5 py-3 text-sm font-medium text-black/72 transition hover:bg-black hover:text-white"
              >
                查看 PSA 官方记录
                <ExternalLink className="h-4 w-4" />
              </a>
              <a
                href={renaissUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-black"
              >
                前往 Renaiss 页面
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            {/* 免责声明 */}
            <div className="mt-2 rounded-[1.2rem] border border-black/6 bg-[#f6f2eb]/80 px-4 py-3.5">
              <p className="text-[11px] leading-[1.8] text-black/38">
                本页面数据来源于 Renaiss Protocol 与 PSA 认证信息，仅供参考，不构成任何投资建议。所展示卡牌为第三方平台上架商品，TCGPlay 不对价格准确性及交易结果承担责任。本产品与宝可梦公司（The Pokémon Company）及任何官方 IP 持有方无任何关联或背书。
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
