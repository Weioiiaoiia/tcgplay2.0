/**
 * Design note — Fog-white precision exhibition system.
 * Compliance content should feel explicit and trustworthy, not hidden or punitive:
 * soft ivory panels, measured hierarchy, and readable legal copy.
 */
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
      <footer className="border-t border-black/8 bg-[linear-gradient(180deg,rgba(248,246,241,0.96),rgba(241,236,226,0.92))]">
        <div className="container pb-10 pt-12 sm:pb-12">
          <div className="mx-auto max-w-4xl rounded-[2rem] border border-black/8 bg-white/74 p-6 shadow-[0_30px_90px_-48px_rgba(24,24,27,0.3)] backdrop-blur-xl sm:p-8">
            <div className="mb-5 flex items-center justify-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-black/42" />
              <p className="text-[0.68rem] uppercase tracking-[0.28em] text-black/36">
                {t("footer.disclaimerTitle")}
              </p>
            </div>
            <p className="text-center text-[0.92rem] leading-8 text-black/52">
              {t("footer.disclaimerBody")}
            </p>
            <p className="mt-4 text-center text-xs leading-6 text-black/34">
              {t("footer.disclaimerNote")}
            </p>
          </div>
        </div>

        <div className="border-t border-black/8">
          <div className="container flex flex-col items-center justify-between gap-4 py-5 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-black/8 bg-white text-[0.7rem] font-semibold text-neutral-950">
                T
              </div>
              <p className="text-sm text-black/46">{t("footer.copyright")}</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-5">
              <button
                type="button"
                onClick={() => setActiveDialog("privacy")}
                className="text-sm text-black/42 transition hover:text-black"
              >
                {t("footer.privacy")}
              </button>
              <button
                type="button"
                onClick={() => setActiveDialog("terms")}
                className="text-sm text-black/42 transition hover:text-black"
              >
                {t("footer.terms")}
              </button>
              <button
                type="button"
                onClick={() => setActiveDialog("ip")}
                className="text-sm text-black/42 transition hover:text-black"
              >
                {t("footer.ip")}
              </button>
              <a
                href="https://x.com/chen1904o"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-black/42 transition hover:text-black"
              >
                {t("footer.contact")}
              </a>
            </div>
          </div>
        </div>
      </footer>

      <Dialog open={activeDialog !== null} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent
          className="max-w-3xl rounded-[2rem] border border-black/8 bg-[#f7f4ee] text-neutral-950 shadow-[0_40px_120px_-44px_rgba(24,24,27,0.42)]"
          showCloseButton
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-[0.01em] text-neutral-950 sm:text-2xl">
              {dialogContent?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-2">
            {dialogContent?.paragraphs.map((paragraph, index) => (
              <p key={index} className="text-sm leading-8 text-black/58">
                {paragraph}
              </p>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
