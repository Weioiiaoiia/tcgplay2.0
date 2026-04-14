/*
 * Card Chronicle — Rich visual storytelling
 * Animated timeline, glowing card preview, legacy message
 */
import { motion } from "framer-motion";
import { Clock, User, ArrowRight, Quote } from "lucide-react";

const STORY_CARD_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663531879544/dPjcx66BtoG3Hds86etH5r/card1_dragon-kW9W2n4kM9cEy5UFkf35kN.webp";

const timeline = [
  { date: "2024.03.12", owner: "0x7a3...f9e2", event: "铸造上链", price: "$800", type: "mint" },
  { date: "2024.07.08", owner: "CryptoWhale.eth", event: "转手交易", price: "$1,200", type: "trade" },
  { date: "2025.01.15", owner: "RickyTCG", event: "名人持有", price: "—", type: "celebrity" },
  { date: "2025.09.22", owner: "0xb4c...12a8", event: "转手交易", price: "$2,450", type: "trade" },
];

function getTypeColor(type: string) {
  switch (type) {
    case "mint": return "bg-emerald-400/80";
    case "celebrity": return "bg-amber-400/80";
    default: return "bg-white/25";
  }
}

function getTypeBadge(type: string) {
  switch (type) {
    case "mint": return { text: "Genesis Mint", color: "text-emerald-400/80 bg-emerald-400/[0.08] border-emerald-400/[0.12]" };
    case "celebrity": return { text: "Celebrity Holder", color: "text-amber-400/80 bg-amber-400/[0.08] border-amber-400/[0.12]" };
    default: return null;
  }
}

export default function CardStory() {
  return (
    <section id="card-story" className="py-28">
      <div className="container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-[13px] tracking-[0.15em] uppercase text-white/25 mb-3">
            Card Chronicle
          </p>
          <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-bold tracking-tight text-white leading-tight">
            卡牌编年史
          </h2>
          <p className="mt-4 text-[16px] text-white/35 max-w-lg">
            每一张卡牌都承载着独特的链上旅程。追溯流转历史，
            发现曾经持有它的传奇收藏家，阅读他们留下的传承寄语。
          </p>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-[340px_1fr] gap-12 lg:gap-16 items-start">
          {/* Card preview with glow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto lg:mx-0 lg:sticky lg:top-24"
          >
            <div className="relative">
              {/* Glow behind card */}
              <div className="absolute -inset-6 rounded-3xl opacity-30 blur-3xl" style={{ background: "radial-gradient(ellipse, oklch(0.5 0.12 30), transparent 70%)" }} />

              <div className="relative w-64 lg:w-full aspect-[2/3] rounded-2xl overflow-hidden bg-[oklch(0.12_0.005_260)] border border-white/[0.08] shadow-2xl shadow-black/40">
                <img src={STORY_CARD_IMG} alt="Infernal Draco" className="w-full h-full object-cover" />
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/[0.08]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-medium text-white/80">Renaiss</span>
                </div>
              </div>
            </div>

            {/* Card info */}
            <div className="mt-5 space-y-2">
              <h3 className="text-[17px] font-semibold text-white/85">Infernal Draco</h3>
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-white/30 px-2 py-0.5 rounded bg-white/[0.04]">PSA 10</span>
                <span className="text-[12px] text-white/30 px-2 py-0.5 rounded bg-white/[0.04]">1st Edition</span>
                <span className="text-[13px] text-white/50 font-medium">$2,450</span>
              </div>
              <p className="text-[12px] text-white/20">Renaiss Genesis · 4 位持有者 · 206% 增值</p>
            </div>
          </motion.div>

          {/* Timeline + Legacy */}
          <div>
            {/* Timeline */}
            <div className="space-y-0">
              {timeline.map((item, i) => {
                const badge = getTypeBadge(item.type);
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="relative flex gap-5 pb-8 last:pb-0 group"
                  >
                    {/* Vertical line + dot */}
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full shrink-0 ${getTypeColor(item.type)} ring-4 ring-[oklch(0.07_0.005_260)]`} />
                      {i < timeline.length - 1 && (
                        <div className="w-px flex-1 bg-gradient-to-b from-white/[0.08] to-white/[0.02] mt-2" />
                      )}
                    </div>

                    {/* Content card */}
                    <div className="flex-1 -mt-1 p-4 rounded-xl bg-white/[0.015] border border-white/[0.04] group-hover:bg-white/[0.025] group-hover:border-white/[0.07] transition-all duration-400">
                      <div className="flex items-center gap-3 mb-2">
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

                      <div className="flex items-center gap-4">
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

            {/* Price journey indicator */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-400/[0.04] border border-emerald-400/[0.08]"
            >
              <ArrowRight className="w-4 h-4 text-emerald-400/60" />
              <span className="text-[13px] text-emerald-400/60">
                $800 → $2,450 · 价值增长 206%
              </span>
            </motion.div>

            {/* Legacy message */}
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
                    传承寄语 · Legacy Message
                  </p>
                </div>
                <p className="text-[15px] text-white/45 italic leading-[1.8]">
                  "This dragon witnessed three market storms and emerged stronger each time.
                  May the next holder carry its fire forward."
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-400/10 flex items-center justify-center">
                    <span className="text-[10px] text-amber-400/60 font-bold">R</span>
                  </div>
                  <div>
                    <p className="text-[12px] text-white/40 font-medium">RickyTCG</p>
                    <p className="text-[10px] text-white/15">2025.01.15 · 铸造于链上</p>
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
