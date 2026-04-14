import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LANGUAGE_OPTIONS, normalizeLanguage, type AppLanguage } from "@/locales/resources";

interface Props {
  compact?: boolean;
}

export default function LanguageSwitcher({ compact = false }: Props) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const currentLanguage = useMemo(
    () => normalizeLanguage(i18n.resolvedLanguage || i18n.language),
    [i18n.language, i18n.resolvedLanguage],
  );

  const currentOption = LANGUAGE_OPTIONS.find((item) => item.code === currentLanguage) || LANGUAGE_OPTIONS[0];

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleChangeLanguage = async (language: AppLanguage) => {
    await i18n.changeLanguage(language);
    setOpen(false);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] px-1 py-1 backdrop-blur-xl">
        {LANGUAGE_OPTIONS.map((option) => {
          const active = option.code === currentLanguage;
          return (
            <button
              key={option.code}
              type="button"
              aria-label={`${t("navbar.switchLanguage")}: ${option.label}`}
              onClick={() => void handleChangeLanguage(option.code)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-300 ${
                active
                  ? "bg-white text-[oklch(0.1_0.005_260)] shadow-[0_6px_18px_rgba(255,255,255,0.18)]"
                  : "text-white/45 hover:bg-white/[0.06] hover:text-white/85"
              }`}
            >
              {option.short}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={t("navbar.switchLanguage")}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[12px] text-white/70 backdrop-blur-xl transition-all duration-300 hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-white"
      >
        <Languages className="h-3.5 w-3.5" />
        <span className="font-medium">{currentOption.short}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-2xl border border-white/[0.08] bg-[oklch(0.1_0.005_260/0.98)] p-1.5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.72)] backdrop-blur-2xl"
          >
            {LANGUAGE_OPTIONS.map((option) => {
              const active = option.code === currentLanguage;
              return (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => void handleChangeLanguage(option.code)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-all duration-200 ${
                    active ? "bg-white/[0.08] text-white" : "text-white/60 hover:bg-white/[0.05] hover:text-white/90"
                  }`}
                >
                  <div>
                    <div className="text-[12px] font-medium">{option.label}</div>
                    <div className="text-[10px] text-white/30">{option.code}</div>
                  </div>
                  {active && <Check className="h-3.5 w-3.5 text-[oklch(0.85_0.15_85)]" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
