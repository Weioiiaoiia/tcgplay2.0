/*
 * MarketPulse — 首页市场图鉴预览区
 * 展示实时在售卡牌数据（来自 CardDataContext），点击跳转到 /market
 * 如果数据未加载完成，显示骨架占位
 */
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { ArrowRight } from "lucide-react";
import { useCardData } from "@/contexts/CardDataContext";
import { getGradeColor, getGradeBg } from "@/lib/renaissApi";
import type { RenaissCard } from "@/lib/renaissApi";
import { useTranslation } from "react-i18next";

/* ─── 卡牌项 ─── */
function CardItem({ card, index }: { card: RenaissCard; index: number }) {
  const [, navigate] = useLocation();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.25, 0.1, 0.25, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/card/${card.tokenId}`)}
      className="group relative cursor-pointer"
    >
      <motion.div
        animate={{
          scale: hovered ? 1.05 : 1,
          y: hovered ? -8 : 0,
        }}
        transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative"
      >
        <div
          className={`relative aspect-[2/3] rounded-2xl overflow-hidden bg-[oklch(0.12_0.005_260)] border transition-all duration-500 ${
            hovered
              ? "border-amber-400/20 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]"
              : "border-transparent"
          }`}
        >
          <img
            src={card.frontImageUrl}
            alt={card.name}
            className="w-full h-full object-contain transition-transform duration-700 ease-out"
            loading="lazy"
          />

          {/* Hover info overlay */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 flex flex-col justify-end"
              >
                <div className="bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-16 pb-4 px-3.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-semibold tracking-wide ${getGradeColor(card.grade)}`}>
                      PSA {card.grade.split(" ")[0]}
                    </span>
                    <span className="text-[10px] text-white/50">{card.year}</span>
                  </div>
                  <h3 className="text-[13px] font-semibold text-white mb-1 truncate">
                    {card.pokemonName || card.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-white/60 font-mono">
                      ${card.askPriceUSDT.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-white/30">{card.setName}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Renaiss badge */}
          <div
            className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md border border-white/[0.08] z-10 transition-opacity duration-300"
            style={{ opacity: hovered ? 0 : 1 }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[9px] font-medium text-white/80 tracking-wide">Renaiss</span>
          </div>

          {/* Grade badge */}
          <div
            className={`absolute top-3 right-3 px-2 py-0.5 rounded-md backdrop-blur-md z-10 transition-opacity duration-300 ${getGradeBg(card.grade)}`}
            style={{ opacity: hovered ? 0 : 1 }}
          >
            <span className={`text-[10px] font-semibold ${getGradeColor(card.grade)}`}>
              PSA {card.grade.split(" ")[0]}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="mt-3 px-0.5 transition-opacity duration-300" style={{ opacity: hovered ? 0.4 : 1 }}>
        <h3 className="text-[13px] font-medium text-white/80 truncate">
          {card.pokemonName || card.name}
        </h3>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-[12px] text-white/35 font-mono">
            ${card.askPriceUSDT.toLocaleString()}
          </p>
          <span className="text-[10px] text-white/20">
            FMV ${card.fmvPriceUSD.toLocaleString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── 加载占位骨架 ─── */
function SkeletonCard({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
    >
      <div className="aspect-[2/3] rounded-2xl bg-white/[0.03] animate-pulse" />
      <div className="mt-3 space-y-1.5">
        <div className="h-3 w-3/4 rounded bg-white/[0.04] animate-pulse" />
        <div className="h-2.5 w-1/2 rounded bg-white/[0.03] animate-pulse" />
      </div>
    </motion.div>
  );
}

/* ─── 主组件 ─── */
export default function MarketPulse() {
  const [, navigate] = useLocation();
  const { allCards, loading, initialLoaded, totalCount } = useCardData();
  const { t } = useTranslation();

  // 展示前 6 张卡牌作为预览
  const previewCards = useMemo(() => allCards.slice(0, 6), [allCards]);

  return (
    <section id="market-pulse" className="py-28">
      <div className="container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <p className="text-[13px] tracking-[0.15em] uppercase text-white/25 mb-3">
            {t("market.eyebrow")}
          </p>
          <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-bold tracking-tight text-white leading-tight">
            {t("market.title")}
          </h2>
          <p className="mt-4 text-[16px] text-white/35 max-w-lg">
            {t("market.description")}
          </p>
        </motion.div>

        {/* Results count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-[12px] text-white/20">
            {initialLoaded ? (
              <>
                {totalCount.toLocaleString()} {t("market.resultsCount", { count: totalCount }).replace(String(totalCount), "").trim()}
              </>
            ) : (
              "..."
            )}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 animate-pulse" />
            <span className="text-[11px] text-white/20">{t("market.liveData")}</span>
          </div>
        </div>

        {/* 6-column card grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-5">
          {!initialLoaded && loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} index={i} />)
            : previewCards.map((card, i) => (
                <CardItem key={card.tokenId} card={card} index={i} />
              ))}
        </div>

        {/* View all button */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-12 flex justify-center"
        >
          <button
            onClick={() => navigate("/market")}
            className="group flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-[14px] text-white/60 font-medium hover:bg-white/[0.08] hover:text-white/80 hover:border-white/[0.1] transition-all duration-300"
          >
            {t("market.resultsCount", { count: totalCount > 0 ? totalCount : "" })}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
