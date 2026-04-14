/**
 * TCGPlay Navbar — Premium, refined, alive
 * Frosted glass, subtle glow, smooth interactions
 */
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Menu, X, Search } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Navbar() {
  const [subOpen, setSubOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  const navItems = useMemo(
    () => [
      { label: t("navbar.marketIndex"), id: "market-pulse" },
      { label: t("navbar.cardChronicle"), id: "card-story" },
      { label: t("navbar.features"), id: "features" },
    ],
    [t],
  );

  const subItems = useMemo(
    () => [
      { label: t("navbar.items.gallery"), en: "Gallery" },
      { label: t("navbar.items.chronicle"), en: "Chronicle" },
      { label: t("navbar.items.constellation"), en: "Constellation" },
      { label: t("navbar.items.collectorDna"), en: "Collector DNA" },
      { label: t("navbar.items.album"), en: "Album" },
    ],
    [t],
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  const soon = (name: string) =>
    toast(name, { description: t("navbar.comingSoon") });

  return (
    <nav className="fixed top-0 inset-x-0 z-50">
      <div
        className="absolute inset-0 transition-all duration-500"
        style={{
          backgroundColor: scrolled ? "oklch(0.07 0.005 260 / 0.88)" : "oklch(0.07 0.005 260 / 0.4)",
          backdropFilter: scrolled ? "blur(24px) saturate(1.2)" : "blur(12px)",
        }}
      />
      <div className={`absolute bottom-0 inset-x-0 h-px transition-opacity duration-500 ${scrolled ? "opacity-100" : "opacity-0"}`} style={{ background: "linear-gradient(90deg, transparent, oklch(1 0 0 / 0.06), transparent)" }} />

      <div className="relative container flex items-center justify-between h-14">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-white/15 to-white/[0.04] border border-white/[0.08] flex items-center justify-center group-hover:from-white/20 transition-all duration-300">
            <span className="text-[11px] font-bold text-white/80">T</span>
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-white/90 group-hover:text-white transition-colors duration-300">
            TCGPlay
          </span>
        </button>

        <div className="hidden md:flex items-center gap-1">
          <button
            onClick={() => setLocation("/my-collection")}
            className="px-3.5 py-2 rounded-lg text-[13px] text-white/50 hover:text-white/80 hover:bg-white/[0.04] transition-all duration-300"
          >
            {t("navbar.myCollection")}
          </button>

          <div
            className="relative"
            onMouseEnter={() => setSubOpen(true)}
            onMouseLeave={() => setSubOpen(false)}
          >
            <button className="flex items-center gap-1 px-3.5 py-2 rounded-lg text-[13px] text-white/50 hover:text-white/80 hover:bg-white/[0.04] transition-all duration-300">
              {t("navbar.library")}
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${subOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {subOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  className="absolute top-full left-0 mt-1.5 w-64 py-2 rounded-xl bg-[oklch(0.11_0.005_260/0.97)] backdrop-blur-2xl border border-white/[0.08] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]"
                >
                  {subItems.map((s) => (
                    <button
                      key={s.en}
                      onClick={() => soon(s.label)}
                      className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-white/[0.04] transition-colors group"
                    >
                      <div>
                        <span className="text-[13px] text-white/60 group-hover:text-white/90 transition-colors font-medium">
                          {s.label}
                        </span>
                        <span className="ml-2 text-[10px] text-white/20">{s.en}</span>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="px-3.5 py-2 rounded-lg text-[13px] text-white/50 hover:text-white/80 hover:bg-white/[0.04] transition-all duration-300"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => scrollTo("market-pulse")}
            className="p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all duration-300"
          >
            <Search className="w-4 h-4" />
          </button>

          <LanguageSwitcher />

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-400/[0.06] border border-emerald-400/[0.1]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-emerald-400/70 font-medium">{t("common.renaiss")}</span>
          </div>

          <button
            onClick={() => setLocation("/my-collection")}
            className="px-4 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-[13px] text-white/70 font-medium hover:bg-white/[0.1] hover:text-white transition-all duration-300"
          >
            {t("navbar.connectWallet")}
          </button>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg text-white/60 hover:bg-white/[0.04]"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden relative overflow-hidden bg-[oklch(0.08_0.005_260/0.98)] backdrop-blur-2xl border-b border-white/[0.06]"
          >
            <div className="container py-6 space-y-1">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[12px] text-emerald-400/60">{t("common.renaiss")} · {t("common.live")}</span>
                </div>
                <LanguageSwitcher compact />
              </div>

              <button onClick={() => { setLocation("/my-collection"); setMobileOpen(false); }} className="block w-full text-left py-3 text-[15px] text-white/60 hover:text-white">{t("navbar.myCollection")}</button>
              <button onClick={() => scrollTo("market-pulse")} className="block w-full text-left py-3 text-[15px] text-white/60 hover:text-white">{t("navbar.library")}</button>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="block w-full text-left py-3 text-[15px] text-white/60 hover:text-white"
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-4 mt-2 border-t border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[12px] text-emerald-400/60">{t("common.renaiss")} {t("hero.badge").includes("·") ? "" : t("common.live")}</span>
                </div>
                <button onClick={() => { setLocation("/my-collection"); setMobileOpen(false); }} className="text-[14px] text-white/60 font-medium">{t("navbar.connectWallet")}</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
