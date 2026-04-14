/*
 * TCGPlay Hero — Clean, minimal, Apple-style
 * No floating cards. Pure typography + whitespace.
 */
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";

function AnimatedStat({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.2 }}
      className="text-center"
    >
      <p className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold text-white tracking-tight">
        {value}
        {suffix && <span className="text-white/40">{suffix}</span>}
      </p>
      <p className="text-[11px] text-white/25 tracking-[0.1em] uppercase mt-1">{label}</p>
    </motion.div>
  );
}

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  const bgX = useTransform(smoothX, [0, 1], [-15, 15]);
  const bgY = useTransform(smoothY, [0, 1], [-10, 10]);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width);
      mouseY.set((e.clientY - rect.top) / rect.height);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [mouseX, mouseY]);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Subtle animated gradient mesh background */}
      <motion.div
        style={{ x: bgX, y: bgY }}
        className="absolute inset-0 pointer-events-none"
      >
        <div
          className="absolute top-[15%] left-[20%] w-[600px] h-[400px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(ellipse, oklch(0.55 0.15 250), transparent 70%)" }}
        />
        <div
          className="absolute bottom-[20%] right-[15%] w-[500px] h-[350px] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(ellipse, oklch(0.5 0.12 320), transparent 70%)" }}
        />
        <div
          className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(ellipse, oklch(0.6 0.08 200), transparent 60%)" }}
        />
      </motion.div>

      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }}
      />

      {/* Main content — clean, no floating cards */}
      <div className="relative z-10 container text-center pt-24 pb-12">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-white/40 tracking-wide">Renaiss Protocol · 已接入</span>
        </motion.div>

        {/* Main headline */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <h1 className="text-[clamp(2.5rem,7vw,5.5rem)] font-bold leading-[1.05] tracking-tight text-white mb-4">
            每一张卡牌
          </h1>
          <h1 className="text-[clamp(2.5rem,7vw,5.5rem)] font-bold leading-[1.05] tracking-tight mb-8">
            <span className="bg-gradient-to-r from-white/40 via-white/25 to-white/40 bg-clip-text text-transparent">
              都值得被铭记
            </span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="max-w-2xl mx-auto text-[clamp(15px,1.8vw,18px)] leading-[1.8] text-white/35 mb-14"
        >
          我们不只是展示卡牌，我们追溯它的旅程、解码它的基因、绘制它的星图。
          <br className="hidden sm:block" />
          TCGPlay 聚合 Renaiss 链上数据，为每一位收藏家构建专属的卡牌宇宙。
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex items-center justify-center gap-4 mb-20"
        >
          <button
            onClick={() => document.getElementById("market-pulse")?.scrollIntoView({ behavior: "smooth" })}
            className="group relative px-8 py-3.5 rounded-full bg-white text-[oklch(0.07_0.005_260)] text-[14px] font-semibold overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]"
          >
            <span className="relative z-10">进入图鉴</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
          <button
            onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            className="px-8 py-3.5 rounded-full border border-white/[0.1] text-[14px] text-white/60 font-medium hover:border-white/[0.2] hover:text-white/80 hover:bg-white/[0.03] transition-all duration-300"
          >
            探索功能
          </button>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex items-center justify-center gap-12 sm:gap-20"
        >
          <AnimatedStat label="链上卡牌" value="12,847" suffix="+" />
          <div className="w-px h-10 bg-white/[0.06]" />
          <AnimatedStat label="活跃收藏家" value="3,291" />
          <div className="w-px h-10 bg-white/[0.06] hidden sm:block" />
          <div className="hidden sm:block">
            <AnimatedStat label="总交易额" value="$4.2" suffix="M" />
          </div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[oklch(0.07_0.005_260)] to-transparent pointer-events-none" />
    </section>
  );
}
