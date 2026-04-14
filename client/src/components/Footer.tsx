import { ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type LegalDialogKey = "privacy" | "terms" | "ip" | null;

export default function Footer() {
  const { t } = useTranslation();
  const [activeDialog, setActiveDialog] = useState<LegalDialogKey>(null);

  const dialogContent = useMemo(() => {
    if (!activeDialog) return null;

    return {
      privacy: {
        title: t("footer.privacyDialog.title"),
        paragraphs: [
          t("footer.privacyDialog.p1"),
          t("footer.privacyDialog.p2"),
          t("footer.privacyDialog.p3"),
          t("footer.privacyDialog.p4"),
          t("footer.privacyDialog.p5"),
        ],
      },
      terms: {
        title: t("footer.termsDialog.title"),
        paragraphs: [
          t("footer.termsDialog.p1"),
          t("footer.termsDialog.p2"),
          t("footer.termsDialog.p3"),
          t("footer.termsDialog.p4"),
          t("footer.termsDialog.p5"),
        ],
      },
      ip: {
        title: t("footer.ipDialog.title"),
        paragraphs: [
          t("footer.ipDialog.p1"),
          t("footer.ipDialog.p2"),
          t("footer.ipDialog.p3"),
          t("footer.ipDialog.p4"),
          t("footer.ipDialog.p5"),
        ],
      },
    }[activeDialog];
  }, [activeDialog, t]);

  return (
    <>
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
              <button
                type="button"
                onClick={() => setActiveDialog("privacy")}
                className="text-[12px] text-white/15 hover:text-white/30 transition-colors cursor-pointer"
              >
                {t("footer.privacy")}
              </button>
              <button
                type="button"
                onClick={() => setActiveDialog("terms")}
                className="text-[12px] text-white/15 hover:text-white/30 transition-colors cursor-pointer"
              >
                {t("footer.terms")}
              </button>
              <button
                type="button"
                onClick={() => setActiveDialog("ip")}
                className="text-[12px] text-white/15 hover:text-white/30 transition-colors cursor-pointer"
              >
                {t("footer.ip")}
              </button>
              <a
                href="https://x.com/chen1904o"
                target="_blank"
                rel="noreferrer"
                className="text-[12px] text-white/15 hover:text-white/30 transition-colors cursor-pointer"
              >
                {t("footer.contact")}
              </a>
            </div>
          </div>
        </div>
      </footer>

      <Dialog open={activeDialog !== null} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent
          className="max-w-2xl border-white/[0.08] bg-[#050505] text-white shadow-2xl shadow-black/50"
          showCloseButton
        >
          <DialogHeader>
            <DialogTitle className="text-[18px] font-medium tracking-[0.04em] text-white/90">
              {dialogContent?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {dialogContent?.paragraphs.map((paragraph, index) => (
              <p key={index} className="text-[13px] leading-7 text-white/65">
                {paragraph}
              </p>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
