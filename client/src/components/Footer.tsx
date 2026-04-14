/**
 * TCGPlay Footer — Rich, premium, alive
 * Legal disclaimer + Brand bar
 */
import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-white/[0.05]">
      <div className="container pb-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2.5 mb-5">
            <ShieldCheck className="w-4 h-4 text-white/20" />
            <p className="text-[11px] tracking-[0.15em] uppercase text-white/20">
              {t("footer.disclaimerTitle")}
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white/[0.015] border border-white/[0.04]">
            <p className="text-[12px] text-white/25 leading-[1.9] text-center">
              {t("footer.disclaimerBody")}
            </p>
          </div>
          <p className="text-[10px] text-white/12 text-center mt-3">
            {t("footer.disclaimerNote")}
          </p>
        </div>
      </div>

      <div className="border-t border-white/[0.04]">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-white/15 to-white/[0.04] border border-white/[0.08] flex items-center justify-center">
              <span className="text-[8px] font-bold text-white/70">T</span>
            </div>
            <p className="text-[12px] text-white/20">{t("footer.copyright")}</p>
          </div>
          <div className="flex items-center gap-6 flex-wrap justify-center">
            <span className="text-[12px] text-white/15 hover:text-white/30 transition-colors cursor-pointer">{t("footer.privacy")}</span>
            <span className="text-[12px] text-white/15 hover:text-white/30 transition-colors cursor-pointer">{t("footer.terms")}</span>
            <span className="text-[12px] text-white/15 hover:text-white/30 transition-colors cursor-pointer">{t("footer.ip")}</span>
            <span className="text-[12px] text-white/15 hover:text-white/30 transition-colors cursor-pointer">{t("footer.contact")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
