/**
 * Card Chronicle — Rich visual storytelling
 * Animated timeline, glowing card preview, legacy message
 */
import { motion } from "framer-motion";
import { Clock, User, ArrowRight, Quote } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const STORY_CARD_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663531879544/dPjcx66BtoG3Hds86etH5r/card1_dragon-kW9W2n4kM9cEy5UFkf35kN.webp";

function getTypeColor(type: string) {
  switch (type) {
    case "mint":
      return "bg-emerald-400/80";
    case "celebrity":
      return "bg-amber-400/80";
    default:
      return "bg-white/25";
  }
}

export default function CardStory() {
  const { t } = useTranslation();

  const timeline = useMemo(
    () => [
      { date: "2024.03.12", owner: "0x7a3...f9e2", event: t("story.events.minted"), price: "$800", type: "mint" },
      { date: "2024.07.08", owner: "CryptoWhale.eth", event: t("story.events.traded"), price: "$1,200", type: "trade" },
      { date: "2025.01.15", owner: "RickyTCG", event: t("story.events.celebrity"), price: "—", type: "celebrity" },
      { date: "2025.09.22", owner: "0xb4c...12a8", event: t("story.events.traded"), price: "$2,450", type: "trade" },
    ],
    [t],
  );

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "mint":
        return { text: t("story.badges.mint"), color: "text-emerald-400/80 bg-emerald-400/[0.08] border-emerald-400/[0.12]" };
      case "celebrity":
        return { text: t("story.badges.celebrity"), color: "text-amber-400/80 bg-amber-400/[0.08] border-amber-400/[0.12]" };
      default:
        return null;
    }
  };

  return (
    <section id="card-story" className="py-28">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-[13px] tracking-[0.15em] uppercase text-white/25 mb-3">
            {t("story.eyebrow")}
          </p>
          <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-bold tracking-tight text-white leading-tight">
            {t("story.title")}
          </h2>
          <p className="mt-4 text-[16px] text-white/35 max-w-lg">
            {t("story.description")}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[340px_1fr] gap-12 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto lg:mx-0 lg:sticky lg:top-24"
          >
            <div className="relative">
              <div className="absolute -inset-6 rounded-3xl opacity-30 blur-3xl" style={{ background: "radial-gradient(ellipse, oklch(0.5 0.12 30), transparent 70%)" }} />

              <div className="relative w-64 lg:w-full aspect-[2/3] rounded-2xl overflow-hidden bg-[oklch(0.12_0.005_260)] border border-white/[0.08] shadow-2xl shadow-black/40">
                <img src={STORY_CARD_IMG} alt="Infernal Draco" className="w-full h-full object-cover" />
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/[0.08]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-medium text-white/80">Renaiss</span>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <h3 className="text-[17px] font-semibold text-white/85">Infernal Draco</h3>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[12px] text-white/30 px-2 py-0.5 rounded bg-white/[0.04]">PSA 10</span>
                <span className="text-[12px] text-white/30 px-2 py-0.5 rounded bg-white/[0.04]">1st Edition</span>
                <span className="text-[13px] text-white/50 font-medium">$2,450</span>
              </div>
              <p className="text-[12px] text-white/20">{t("story.meta")}</p>
            </div>
          </motion.div>

          <div>
            <div className="space-y-0">
              {timeline.map((item, i) => {
                const badge = getTypeBadge(item.type);
                return (
                  <motion.div
                    key={`${item.date}-${item.owner}`}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="relative flex gap-5 pb-8 last:pb-0 group"
                  >
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full shrink-0 ${getTypeColor(item.type)} ring-4 ring-[oklch(0.07_0.005_260)]`} />
                      {i < timeline.length - 1 && (
                        <div className="w-px flex-1 bg-gradient-to-b from-white/[0.08] to-white/[0.02] mt-2" />
                      )}
                    </div>

                    <div className="flex-1 -mt-1 p-4 rounded-xl bg-white/[0.015] border border-white/[0.04] group-hover:bg-white/[0.025] group-hover:border-white/[0.07] transition-all duration-400">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-white/20" />
                          <span className="text-[12px] text-white/30 font-mono">{item.date}</span>
                        </div>
                        {badge && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${badge.color}`}>
                            {badge.text}
                          </span>
                        )}
                      </div>

                      <p className="text-[14px] text-white/70 font-medium mb-1">{item.event}</p>

                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3 h-3 text-white/15" />
                          <span className="text-[12px] text-white/30 font-mono">{item.owner}</span>
                        </div>
                        {item.price !== "—" && (
                          <span className="text-[13px] text-white/50 font-medium">{item.price}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-400/[0.04] border border-emerald-400/[0.08]"
            >
              <ArrowRight className="w-4 h-4 text-emerald-400/60" />
              <span className="text-[13px] text-emerald-400/60">
                {t("story.priceJourney")}
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-8 relative"
            >
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center gap-2 mb-4">
                  <Quote className="w-4 h-4 text-amber-400/40" />
                  <p className="text-[11px] tracking-[0.12em] uppercase text-white/25">
                    {t("story.legacyTitle")}
                  </p>
                </div>
                <p className="text-[15px] text-white/45 italic leading-[1.8]">
                  “{t("story.legacyMessage")}”
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-400/10 flex items-center justify-center">
                    <span className="text-[10px] text-amber-400/60 font-bold">R</span>
                  </div>
                  <div>
                    <p className="text-[12px] text-white/40 font-medium">RickyTCG</p>
                    <p className="text-[10px] text-white/15">{t("story.mintedOnChain")}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
