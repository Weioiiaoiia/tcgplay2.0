/*
 * Card Detail Page — Full card information
 * Premium layout: large card image left, info panels right
 * Includes attributes, history timeline, legacy message
 */
import { motion } from "framer-motion";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, ExternalLink, Clock, User, ArrowRight, Quote, Shield } from "lucide-react";
import { CARDS, getRarityColor, getRarityBg, getRarityBorder } from "@/lib/cardData";

export default function CardDetail() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const card = CARDS.find((c) => c.id === Number(params.id));

  if (!card) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-[18px] text-white/40 mb-4">卡牌未找到</p>
          <button onClick={() => navigate("/")} className="text-[14px] text-sky-400 hover:text-sky-300">
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <div className="fixed top-0 inset-x-0 z-50">
        <div className="absolute inset-0 bg-[oklch(0.07_0.005_260/0.88)] backdrop-blur-2xl" />
        <div className="absolute bottom-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, oklch(1 0 0 / 0.06), transparent)" }} />
        <div className="relative container flex items-center justify-between h-14">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-[13px] text-white/50 hover:text-white/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回图鉴
          </button>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-emerald-400/70 font-medium">Renaiss</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container pt-24 pb-20">
        <div className="grid lg:grid-cols-[400px_1fr] gap-12 lg:gap-16 items-start">
          {/* Left: Card image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:sticky lg:top-24"
          >
            <div className="relative mx-auto max-w-sm lg:max-w-none">
              {/* Glow */}
              <div className="absolute -inset-8 rounded-3xl opacity-20 blur-3xl" style={{ background: "radial-gradient(ellipse, oklch(0.5 0.12 250), transparent 70%)" }} />

              <div className={`relative aspect-[2/3] rounded-2xl overflow-hidden border ${getRarityBorder(card.rarity)} shadow-2xl shadow-black/40`}>
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

            {/* View on Renaiss button */}
            <motion.a
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              href="#"
              onClick={(e) => { e.preventDefault(); }}
              className="mt-6 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[13px] text-white/50 hover:bg-white/[0.07] hover:text-white/70 transition-all duration-300"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              前往 Renaiss 官网查看
            </motion.a>
          </motion.div>

          {/* Right: Info panels */}
          <div className="space-y-8">
            {/* Title block */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-lg border ${getRarityBg(card.rarity)} ${getRarityColor(card.rarity)} ${getRarityBorder(card.rarity)}`}>
                  {card.rarity}
                </span>
                <span className="text-[12px] text-white/25">{card.edition}</span>
              </div>
              <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-tight text-white mb-2">
                {card.name}
              </h1>
              <p className="text-[14px] text-white/30 leading-relaxed max-w-xl">
                {card.description}
              </p>
            </motion.div>

            {/* Key info grid */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            >
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <p className="text-[10px] text-white/20 uppercase tracking-wider mb-1">FMV</p>
                <p className="text-[18px] font-bold text-white/80">{card.fmv}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <p className="text-[10px] text-white/20 uppercase tracking-wider mb-1">评级</p>
                <p className="text-[18px] font-bold text-white/80">{card.psa}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <p className="text-[10px] text-white/20 uppercase tracking-wider mb-1">系列</p>
                <p className="text-[14px] font-semibold text-white/60">{card.set}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <p className="text-[10px] text-white/20 uppercase tracking-wider mb-1">画师</p>
                <p className="text-[14px] font-semibold text-white/60">{card.artist}</p>
              </div>
            </motion.div>

            {/* Attributes */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-[13px] text-white/25 uppercase tracking-[0.1em] mb-4">属性</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {card.attributes.map((attr) => (
                  <div key={attr.label} className="p-3 rounded-xl bg-white/[0.015] border border-white/[0.04]">
                    <p className="text-[11px] text-white/20 mb-1">{attr.label}</p>
                    <p className="text-[16px] font-semibold text-white/70">{attr.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Ownership History */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="text-[13px] text-white/25 uppercase tracking-[0.1em] mb-4">链上流转记录</h3>
              <div className="space-y-0">
                {card.history.map((h, i) => (
                  <div key={i} className="relative flex gap-4 pb-6 last:pb-0 group">
                    <div className="flex flex-col items-center">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ring-4 ring-[oklch(0.07_0.005_260)] ${
                        h.event === "Minted" ? "bg-emerald-400/80" :
                        h.event === "Celebrity Hold" ? "bg-amber-400/80" : "bg-white/25"
                      }`} />
                      {i < card.history.length - 1 && (
                        <div className="w-px flex-1 bg-white/[0.06] mt-1.5" />
                      )}
                    </div>
                    <div className="flex-1 -mt-0.5 p-3.5 rounded-xl bg-white/[0.015] border border-white/[0.04] group-hover:bg-white/[0.025] transition-colors">
                      <div className="flex items-center gap-3 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-white/15" />
                          <span className="text-[11px] text-white/25 font-mono">{h.date}</span>
                        </div>
                        <span className="text-[12px] text-white/50 font-medium">{h.event}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3 h-3 text-white/15" />
                          <span className="text-[12px] text-white/30 font-mono">{h.owner}</span>
                        </div>
                        {h.price !== "—" && (
                          <span className="text-[13px] text-white/50 font-medium">{h.price}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price journey */}
              {card.history.length >= 2 && (
                <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-400/[0.04] border border-emerald-400/[0.08]">
                  <ArrowRight className="w-4 h-4 text-emerald-400/60" />
                  <span className="text-[13px] text-emerald-400/60">
                    {card.history[0].price} → {card.history[card.history.length - 1].price}
                  </span>
                </div>
              )}
            </motion.div>

            {/* Legacy message */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]"
            >
              <div className="flex items-center gap-2 mb-4">
                <Quote className="w-4 h-4 text-amber-400/40" />
                <p className="text-[11px] tracking-[0.12em] uppercase text-white/25">
                  传承寄语 · Legacy Message
                </p>
              </div>
              <p className="text-[15px] text-white/45 italic leading-[1.8]">
                "Every great card carries the spirit of those who held it. This one has seen empires rise and fall."
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-400/10 flex items-center justify-center">
                  <span className="text-[10px] text-amber-400/60 font-bold">C</span>
                </div>
                <div>
                  <p className="text-[12px] text-white/40 font-medium">CryptoWhale.eth</p>
                  <p className="text-[10px] text-white/15">铸造于链上 · 不可篡改</p>
                </div>
              </div>
            </motion.div>

            {/* Compliance note */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.01] border border-white/[0.03]"
            >
              <Shield className="w-4 h-4 text-white/15 mt-0.5 shrink-0" />
              <p className="text-[11px] text-white/15 leading-relaxed">
                所有数据均来自 Renaiss 链上公开记录。TCGPlay 不存储任何卡牌图像，
                所有图片通过协议方公开链接实时引用。
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
