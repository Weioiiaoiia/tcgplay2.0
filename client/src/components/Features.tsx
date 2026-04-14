/**
 * TCGPlay Features — 9 modules, pure text, no icons
 * Clean bento grid with typography-only design
 */
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

function FeatureCard({ f, i }: { f: { title: string; en: string; desc: string; size: string; route?: string }; i: number }) {
  const isLarge = f.size === "large";
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  const handleClick = () => {
    if (f.route) {
      setLocation(f.route);
    } else {
      toast(f.title, { description: t("navbar.comingSoon") });
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.45, delay: i * 0.04 }}
      onClick={handleClick}
      className={`group relative text-left overflow-hidden rounded-2xl border border-white/[0.05] hover:border-white/[0.1] transition-all duration-500 ${
        isLarge ? "sm:col-span-2 p-8 sm:p-10" : "p-6 sm:p-8"
      }`}
    >
      <div className="absolute inset-0 bg-white/[0.01] group-hover:bg-white/[0.025] transition-colors duration-500" />

      <div className="relative z-10">
        <span className="text-[11px] font-mono text-white/10 tracking-wider mb-4 block">
          {String(i + 1).padStart(2, "0")}
        </span>

        <div className="flex flex-wrap items-baseline gap-3 mb-3">
          <h3 className={`font-semibold text-white/85 group-hover:text-white transition-colors duration-300 ${isLarge ? "text-[20px]" : "text-[16px]"}`}>
            {f.title}
          </h3>
          <span className="text-[11px] text-white/15 tracking-wide">{f.en}</span>
          {f.route && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-400/10 text-emerald-400/60 border border-emerald-400/15 font-medium">
              LIVE
            </span>
          )}
        </div>

        <div className="w-8 h-px bg-white/[0.08] group-hover:w-12 group-hover:bg-white/[0.15] transition-all duration-500 mb-4" />

        <p className={`text-white/30 group-hover:text-white/45 leading-[1.8] transition-colors duration-500 ${isLarge ? "text-[14px] max-w-xl" : "text-[13px]"}`}>
          {f.desc}
        </p>
      </div>
    </motion.button>
  );
}

export default function Features() {
  const { t } = useTranslation();

  const features = useMemo(
    () => [
      {
        title: t("features.cards.collection.title"),
        en: t("features.cards.collection.en"),
        desc: t("features.cards.collection.desc"),
        size: "large",
        route: "/my-collection",
      },
      {
        title: t("features.cards.gallery.title"),
        en: t("features.cards.gallery.en"),
        desc: t("features.cards.gallery.desc"),
        size: "normal",
      },
      {
        title: t("features.cards.chronicle.title"),
        en: t("features.cards.chronicle.en"),
        desc: t("features.cards.chronicle.desc"),
        size: "normal",
      },
      {
        title: t("features.cards.market.title"),
        en: t("features.cards.market.en"),
        desc: t("features.cards.market.desc"),
        size: "large",
      },
      {
        title: t("features.cards.constellation.title"),
        en: t("features.cards.constellation.en"),
        desc: t("features.cards.constellation.desc"),
        size: "normal",
      },
      {
        title: t("features.cards.collector.title"),
        en: t("features.cards.collector.en"),
        desc: t("features.cards.collector.desc"),
        size: "normal",
      },
      {
        title: t("features.cards.album.title"),
        en: t("features.cards.album.en"),
        desc: t("features.cards.album.desc"),
        size: "normal",
      },
      {
        title: t("features.cards.career.title"),
        en: t("features.cards.career.en"),
        desc: t("features.cards.career.desc"),
        size: "normal",
      },
      {
        title: t("features.cards.compliance.title"),
        en: t("features.cards.compliance.en"),
        desc: t("features.cards.compliance.desc"),
        size: "large",
      },
    ],
    [t],
  );

  return (
    <section id="features" className="py-28">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-[13px] tracking-[0.15em] uppercase text-white/25 mb-3">
            {t("features.eyebrow")}
          </p>
          <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-bold tracking-tight text-white leading-tight">
            {t("features.title")}
            <br />
            <span className="text-white/35">{t("features.accent")}</span>
          </h2>
          <p className="mt-5 text-[16px] text-white/30 max-w-xl">
            {t("features.description")}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <FeatureCard key={f.en} f={f} i={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-10 text-center"
        >
          <p className="text-[12px] text-white/15">
            {t("features.legalNote")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
