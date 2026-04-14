/**
 * Apple-style Market Index (市场图鉴)
 * Renamed from Market Pulse. Shows all Renaiss listed cards.
 * Features: search bar, filter toolbar, enhanced hover, click to detail
 */
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Search, SlidersHorizontal, ChevronDown, ArrowUpDown, X } from "lucide-react";
import { getLocalizedCards, getLocalizedRarity, getRarityBg, getRarityBorder, getRarityColor } from "@/lib/cardData";
import type { CardType } from "@/lib/cardData";
import { useTranslation } from "react-i18next";

type SortKey = "price-asc" | "price-desc" | "name" | "rarity";
type RarityFilter = "All" | "Rare" | "Ultra Rare" | "Secret Rare";

function CardItem({ card, index }: { card: CardType; index: number }) {
  const [, navigate] = useLocation();
  const [hovered, setHovered] = useState(false);
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.25, 0.1, 0.25, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/card/${card.id}`)}
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
              ? `${getRarityBorder(card.rarity)} shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]`
              : "border-transparent"
          }`}
        >
          <img
            src={card.img}
            alt={card.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out"
            loading="lazy"
          />

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
                    <span className={`text-[10px] font-semibold tracking-wide ${getRarityColor(card.rarity)}`}>
                      {getLocalizedRarity(card.rarity, t)}
                    </span>
                    <span className="text-[10px] text-white/50">{card.psa}</span>
                  </div>
                  <h3 className="text-[13px] font-semibold text-white mb-1 truncate">
                    {card.name}
                  </h3>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] text-white/60">FMV {card.fmv}</span>
                    <span className="text-[10px] text-white/30 truncate">{card.set}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/[0.08] flex items-center gap-2 flex-wrap">
                    {card.attributes.slice(0, 2).map((attr) => (
                      <span key={attr.label} className="text-[9px] text-white/35 px-1.5 py-0.5 rounded bg-white/[0.06]">
                        {attr.label} {attr.value}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md border border-white/[0.08] z-10 transition-opacity duration-300" style={{ opacity: hovered ? 0 : 1 }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[9px] font-medium text-white/80 tracking-wide">Renaiss</span>
          </div>

          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-md z-10 transition-opacity duration-300" style={{ opacity: hovered ? 0 : 1 }}>
            <span className="text-[10px] font-semibold text-white/70">{card.psa}</span>
          </div>
        </div>
      </motion.div>

      <div className="mt-3 px-0.5 transition-opacity duration-300" style={{ opacity: hovered ? 0.4 : 1 }}>
        <h3 className="text-[13px] font-medium text-white/80 truncate">{card.name}</h3>
        <div className="flex items-center justify-between mt-0.5 gap-2">
          <p className="text-[12px] text-white/35">FMV {card.fmv}</p>
          <span className={`text-[10px] ${getRarityColor(card.rarity)}`}>{getLocalizedRarity(card.rarity, t)}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function MarketPulse() {
  const [search, setSearch] = useState("");
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>("All");
  const [sortKey, setSortKey] = useState<SortKey>("price-desc");
  const [showFilters, setShowFilters] = useState(false);
  const { t, i18n } = useTranslation();

  const cards = useMemo(() => getLocalizedCards(t, i18n.resolvedLanguage || i18n.language), [t, i18n.language, i18n.resolvedLanguage]);

  const filtered = useMemo(() => {
    let result = [...cards];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.set.toLowerCase().includes(q) ||
          getLocalizedRarity(c.rarity, t).toLowerCase().includes(q) ||
          c.artist.toLowerCase().includes(q),
      );
    }

    if (rarityFilter !== "All") {
      result = result.filter((c) => c.rarity === rarityFilter);
    }

    switch (sortKey) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "rarity": {
        const order = { Common: 0, Uncommon: 1, Rare: 2, "Ultra Rare": 3, "Secret Rare": 4 };
        result.sort((a, b) => order[b.rarity] - order[a.rarity]);
        break;
      }
    }
    return result;
  }, [cards, search, rarityFilter, sortKey, t]);

  const rarityPills: RarityFilter[] = ["All", "Rare", "Ultra Rare", "Secret Rare"];

  return (
    <section id="market-pulse" className="py-28">
      <div className="container">
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

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-6"
        >
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("market.searchPlaceholder")}
              className="w-full pl-11 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[13px] text-white/80 placeholder:text-white/20 outline-none focus:border-white/[0.12] focus:bg-white/[0.05] transition-all duration-300"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-white/[0.08] transition-colors"
              >
                <X className="w-3.5 h-3.5 text-white/30" />
              </button>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium transition-all duration-300 ${
                showFilters
                  ? "bg-white/[0.08] text-white border border-white/[0.1]"
                  : "bg-white/[0.03] text-white/50 border border-white/[0.05] hover:bg-white/[0.05]"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {t("market.filter")}
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showFilters ? "rotate-180" : ""}`} />
            </button>

            <div className="flex items-center gap-1.5 flex-wrap">
              {rarityPills.map((r) => {
                const label = r === "All" ? t("market.all") : getLocalizedRarity(r, t);
                return (
                  <button
                    key={r}
                    onClick={() => setRarityFilter(r)}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-300 ${
                      rarityFilter === r
                        ? r === "All"
                          ? "bg-white/[0.1] text-white"
                          : `${getRarityBg(r)} ${getRarityColor(r)}`
                        : "text-white/30 hover:text-white/50 hover:bg-white/[0.03]"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="ml-auto flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-white/25" />
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="bg-transparent text-[12px] text-white/40 focus:text-white/60 outline-none cursor-pointer"
              >
                <option value="price-desc">{t("market.sortPriceDesc")}</option>
                <option value="price-asc">{t("market.sortPriceAsc")}</option>
                <option value="rarity">{t("market.sortRarity")}</option>
                <option value="name">{t("market.sortName")}</option>
              </select>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-4 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] grid sm:grid-cols-3 gap-6">
                  <div>
                    <p className="text-[11px] text-white/25 uppercase tracking-wider mb-2">{t("market.grade")}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {["PSA 10", "PSA 9", "PSA 8"].map((g) => (
                        <span key={g} className="px-2.5 py-1 rounded-lg text-[11px] text-white/35 bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] cursor-pointer transition-colors">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] text-white/25 uppercase tracking-wider mb-2">{t("market.priceRange")}</p>
                    <div className="flex items-center gap-2">
                      <input type="text" placeholder="$0" className="w-20 px-2.5 py-1.5 rounded-lg text-[12px] text-white/60 bg-white/[0.03] border border-white/[0.05] outline-none placeholder:text-white/15" />
                      <span className="text-white/15">—</span>
                      <input type="text" placeholder="$10,000" className="w-20 px-2.5 py-1.5 rounded-lg text-[12px] text-white/60 bg-white/[0.03] border border-white/[0.05] outline-none placeholder:text-white/15" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] text-white/25 uppercase tracking-wider mb-2">{t("market.series")}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {["Genesis", "Ascension"].map((s) => (
                        <span key={s} className="px-2.5 py-1 rounded-lg text-[11px] text-white/35 bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] cursor-pointer transition-colors">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-[12px] text-white/20">
            {t("market.resultsCount", { count: filtered.length })}
            {search && <span className="ml-2 text-white/15">· {t("market.searchKeyword", { query: search })}</span>}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60" />
            <span className="text-[11px] text-white/20">{t("market.liveData")}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-5">
          {filtered.map((card, i) => (
            <CardItem key={card.id} card={card} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-[15px] text-white/30 mb-2">{t("market.emptyTitle")}</p>
            <p className="text-[13px] text-white/15">{t("market.emptyDesc")}</p>
          </div>
        )}
      </div>
    </section>
  );
}
