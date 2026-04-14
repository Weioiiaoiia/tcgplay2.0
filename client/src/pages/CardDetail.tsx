import { motion } from "framer-motion";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, ExternalLink, Clock, User, ArrowRight, Quote, Shield } from "lucide-react";
import { getLocalizedCards, getLocalizedRarity, getRarityBg, getRarityBorder, getRarityColor } from "@/lib/cardData";

export default function CardDetail() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { t, i18n } = useTranslation();

  const cards = useMemo(
    () => getLocalizedCards(t, i18n.resolvedLanguage || i18n.language),
    [t, i18n.language, i18n.resolvedLanguage],
  );

  const card = cards.find((item) => item.id === Number(params.id));

  if (!card) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6 text-center">
        <div>
          <p className="mb-4 text-[18px] text-white/45">{t("marketCard.notFound")}</p>
          <button
            onClick={() => navigate("/")}
            className="text-[14px] text-sky-400 transition-colors hover:text-sky-300"
          >
            {t("marketCard.backHome")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed top-0 inset-x-0 z-50">
        <div className="absolute inset-0 bg-[oklch(0.07_0.005_260/0.88)] backdrop-blur-2xl" />
        <div
          className="absolute bottom-0 inset-x-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, oklch(1 0 0 / 0.06), transparent)" }}
        />
        <div className="relative container flex items-center justify-between h-14">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-[13px] text-white/50 transition-colors hover:text-white/80"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("marketCard.backToMarket")}
          </button>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-emerald-400/70 font-medium">Renaiss</span>
          </div>
        </div>
      </div>

      <div className="container pt-24 pb-20">
        <div className="grid lg:grid-cols-[400px_1fr] gap-12 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:sticky lg:top-24"
          >
            <div className="relative mx-auto max-w-sm lg:max-w-none">
              <div
                className="absolute -inset-8 rounded-3xl opacity-20 blur-3xl"
                style={{ background: "radial-gradient(ellipse, oklch(0.5 0.12 250), transparent 70%)" }}
              />

              <div
                className={`relative aspect-[2/3] rounded-2xl overflow-hidden border ${getRarityBorder(card.rarity)} shadow-2xl shadow-black/40`}
              >
                <img src={card.img} alt={card.name} className="w-full h-full object-cover" />
                <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/[0.08]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-medium text-white/80">Renaiss</span>
                </div>
                <div className="absolute top-4 right-4 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md">
                  <span className="text-[11px] font-semibold text-white/80">{card.psa}</span>
                </div>
              </div>
            </div>

            <motion.a
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              href="#"
              onClick={(event) => {
                event.preventDefault();
              }}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.04] py-3 text-[13px] text-white/50 transition-all duration-300 hover:bg-white/[0.07] hover:text-white/70"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {t("marketCard.viewOnRenaiss")}
            </motion.a>
          </motion.div>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className={`text-[12px] font-semibold px-2.5 py-1 rounded-lg border ${getRarityBg(card.rarity)} ${getRarityColor(card.rarity)} ${getRarityBorder(card.rarity)}`}
                >
                  {getLocalizedRarity(card.rarity, t)}
                </span>
                <span className="text-[12px] text-white/25">{card.edition}</span>
              </div>
              <h1 className="mb-2 text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-tight text-white">{card.name}</h1>
              <p className="max-w-xl text-[14px] leading-relaxed text-white/30">{card.description}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            >
              <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                <p className="mb-1 text-[10px] uppercase tracking-wider text-white/20">FMV</p>
                <p className="text-[18px] font-bold text-white/80">{card.fmv}</p>
              </div>
              <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                <p className="mb-1 text-[10px] uppercase tracking-wider text-white/20">{t("marketCard.grade")}</p>
                <p className="text-[18px] font-bold text-white/80">{card.psa}</p>
              </div>
              <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                <p className="mb-1 text-[10px] uppercase tracking-wider text-white/20">{t("marketCard.set")}</p>
                <p className="text-[14px] font-semibold text-white/60">{card.set}</p>
              </div>
              <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                <p className="mb-1 text-[10px] uppercase tracking-wider text-white/20">{t("marketCard.artist")}</p>
                <p className="text-[14px] font-semibold text-white/60">{card.artist}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="mb-4 text-[13px] uppercase tracking-[0.1em] text-white/25">{t("marketCard.attributes")}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {card.attributes.map((attr) => (
                  <div key={attr.label} className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-3">
                    <p className="mb-1 text-[11px] text-white/20">{attr.label}</p>
                    <p className="text-[16px] font-semibold text-white/70">{attr.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="mb-4 text-[13px] uppercase tracking-[0.1em] text-white/25">{t("marketCard.history")}</h3>
              <div className="space-y-0">
                {card.history.map((item, index) => (
                  <div key={`${item.date}-${item.owner}`} className="relative flex gap-4 pb-6 last:pb-0 group">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ring-4 ring-[oklch(0.07_0.005_260)] ${
                          item.event === t("cardData.event.minted")
                            ? "bg-emerald-400/80"
                            : item.event === t("cardData.event.celebrityHold")
                              ? "bg-amber-400/80"
                              : "bg-white/25"
                        }`}
                      />
                      {index < card.history.length - 1 && <div className="mt-1.5 w-px flex-1 bg-white/[0.06]" />}
                    </div>
                    <div className="flex-1 rounded-xl border border-white/[0.04] bg-white/[0.015] p-3.5 transition-colors group-hover:bg-white/[0.025]">
                      <div className="mb-1.5 flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-white/15" />
                          <span className="text-[11px] font-mono text-white/25">{item.date}</span>
                        </div>
                        <span className="text-[12px] font-medium text-white/50">{item.event}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3 h-3 text-white/15" />
                          <span className="text-[12px] font-mono text-white/30">{item.owner}</span>
                        </div>
                        {item.price !== "—" && <span className="text-[13px] font-medium text-white/50">{item.price}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {card.history.length >= 2 && (
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-400/[0.08] bg-emerald-400/[0.04] px-4 py-3">
                  <ArrowRight className="w-4 h-4 text-emerald-400/60" />
                  <span className="text-[13px] text-emerald-400/60">
                    {card.history[0].price} → {card.history[card.history.length - 1].price}
                  </span>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6"
            >
              <div className="mb-4 flex items-center gap-2">
                <Quote className="w-4 h-4 text-amber-400/40" />
                <p className="text-[11px] uppercase tracking-[0.12em] text-white/25">{t("marketCard.legacyTitle")}</p>
              </div>
              <p className="text-[15px] italic leading-[1.8] text-white/45">“{t("marketCard.legacyMessage")}”</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400/10">
                  <span className="text-[10px] font-bold text-amber-400/60">C</span>
                </div>
                <div>
                  <p className="text-[12px] font-medium text-white/40">CryptoWhale.eth</p>
                  <p className="text-[10px] text-white/15">{t("marketCard.immutable")}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-start gap-3 rounded-xl border border-white/[0.03] bg-white/[0.01] p-4"
            >
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-white/15" />
              <p className="text-[11px] leading-relaxed text-white/15">{t("marketCard.compliance")}</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
