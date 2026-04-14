/**
 * TCGPlay Hero — Clean, minimal, Apple-style
 * No floating cards. Pure typography + whitespace.
 */
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  const bgX = useTransform(smoothX, [0, 1], [-15, 15]);
  const bgY = useTransform(smoothY, [0, 1], [-10, 10]);
  const { t } = useTranslation();

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

      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }}
      />

      <div className="relative z-10 container text-center pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-white/40 tracking-wide">{t("hero.badge")}</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <h1 className="text-[clamp(2.5rem,7vw,5.5rem)] font-bold leading-[1.05] tracking-tight text-white mb-4">
            {t("hero.titleLine1")}
          </h1>
          <h1 className="text-[clamp(2.5rem,7vw,5.5rem)] font-bold leading-[1.05] tracking-tight mb-8">
            <span className="bg-gradient-to-r from-white/40 via-white/25 to-white/40 bg-clip-text text-transparent">
              {t("hero.titleLine2")}
            </span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="max-w-2xl mx-auto text-[clamp(15px,1.8vw,18px)] leading-[1.8] text-white/35 mb-14"
        >
          {t("hero.subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <button
            onClick={() => document.getElementById("market-pulse")?.scrollIntoView({ behavior: "smooth" })}
            className="group relative px-8 py-3.5 rounded-full bg-white text-[oklch(0.07_0.005_260)] text-[14px] font-semibold overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]"
          >
            <span className="relative z-10">{t("hero.primaryCta")}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
          <button
            onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            className="px-8 py-3.5 rounded-full border border-white/[0.1] text-[14px] text-white/60 font-medium hover:border-white/[0.2] hover:text-white/80 hover:bg-white/[0.03] transition-all duration-300"
          >
            {t("hero.secondaryCta")}
          </button>
        </motion.div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[oklch(0.07_0.005_260)] to-transparent pointer-events-none" />
    </section>
  );
}
