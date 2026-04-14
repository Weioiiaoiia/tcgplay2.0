import { Home } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container flex min-h-screen items-center justify-center py-16">
        <div className="w-full max-w-xl rounded-3xl border border-white/[0.06] bg-white/[0.02] p-10 text-center shadow-[0_30px_120px_-40px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]">
            <span className="text-[18px] font-semibold text-white/70">404</span>
          </div>

          <p className="mb-3 text-[12px] uppercase tracking-[0.22em] text-white/20">TCGPlay</p>
          <h1 className="mb-3 text-[clamp(1.8rem,4vw,2.6rem)] font-bold tracking-tight text-white">
            {t("notFound.title")}
          </h1>
          <p className="mx-auto mb-8 max-w-md text-[15px] leading-[1.8] text-white/35">{t("notFound.description")}</p>

          <button
            onClick={() => setLocation("/")}
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white px-5 py-3 text-[13px] font-medium text-[oklch(0.08_0.005_260)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_16px_40px_-18px_rgba(255,255,255,0.6)]"
          >
            <Home className="h-4 w-4" />
            {t("notFound.action")}
          </button>
        </div>
      </div>
    </div>
  );
}
