import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { parseFMV, getGradeNumber, getPSAUrl, getRenaissUrl, type CardData } from "@/lib/renaissApi";

interface Props {
  card: CardData | null;
  onClose: () => void;
}

export default function CardDetail({ card, onClose }: Props) {
  const { t } = useTranslation();
  const imgElRef = useRef<HTMLImageElement>(null);
  const [isTouch, setIsTouch] = useState(false);
  const [magnifier, setMagnifier] = useState({ show: false, x: 0, y: 0, bgX: 0, bgY: 0 });
  const magnifierSize = 180;
  const zoomLevel = 3;

  useEffect(() => {
    setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    if (card) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [card]);

  const handleMagnifierMove = useCallback(
    (event: React.MouseEvent) => {
      if (isTouch || !imgElRef.current) return;
      const rect = imgElRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        setMagnifier((prev) => ({ ...prev, show: false }));
        return;
      }

      setMagnifier({
        show: true,
        x: event.clientX,
        y: event.clientY,
        bgX: (x / rect.width) * 100,
        bgY: (y / rect.height) * 100,
      });
    },
    [isTouch],
  );

  const handleMagnifierLeave = useCallback(() => {
    setMagnifier((prev) => ({ ...prev, show: false }));
  }, []);

  const normalizedGrade = useMemo(() => {
    if (!card) return "";
    return card.grade.replace(/^\d+\s*/, "").trim();
  }, [card]);

  if (!card) return null;

  const fmv = parseFMV(card.fmvPriceInUSD);
  const gradeNum = getGradeNumber(card.grade);
  const isPSA10 = gradeNum === 10;
  const shortSet = card.setName.replace("Pokemon Japanese ", "").replace("Pokemon ", "");

  const attributes = [
    { label: t("collection.detail.labels.psaSerial"), value: card.serial },
    { label: t("collection.detail.labels.grade"), value: normalizedGrade ? `${gradeNum} ${normalizedGrade}` : String(gradeNum) },
    { label: t("collection.detail.labels.year"), value: String(card.year) },
    { label: t("collection.detail.labels.language"), value: card.language },
    { label: t("collection.detail.labels.set"), value: shortSet },
    { label: t("collection.detail.labels.cardNumber"), value: `#${card.cardNumber}` },
    { label: t("collection.detail.labels.gradingCompany"), value: card.gradingCompany },
    {
      label: t("collection.detail.labels.vaultLocation"),
      value: card.vaultLocation === "platform" ? t("collection.detail.labels.platform") : card.vaultLocation,
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4"
        style={{ background: "oklch(0.04 0.005 260 / 0.92)", backdropFilter: "blur(20px)" }}
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full border border-white/[0.08] bg-white/[0.06] p-2 text-white/50 transition-all duration-300 hover:bg-white/[0.1] hover:text-white sm:right-5 sm:top-5 sm:p-2.5"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.96 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-white/[0.06]"
          style={{
            background: "oklch(0.09 0.005 260 / 0.95)",
            boxShadow: "0 40px 100px -30px rgba(0,0,0,0.7)",
          }}
        >
          <div className="grid grid-cols-1 gap-0 md:grid-cols-[420px_1fr]">
            <div
              className="relative flex items-center justify-center overflow-hidden border-b border-white/[0.06] md:border-b-0 md:border-r"
              style={{ background: "oklch(0.06 0.005 260)", minHeight: "400px" }}
            >
              <div className="flex h-full w-full items-center justify-center p-6 sm:p-8 md:p-10">
                <img
                  ref={imgElRef}
                  src={card.frontImageUrl}
                  alt={card.pokemonName}
                  className={`max-h-[65vh] max-w-full object-contain ${isTouch ? "" : "cursor-crosshair"}`}
                  draggable={false}
                  onMouseMove={handleMagnifierMove}
                  onMouseLeave={handleMagnifierLeave}
                  style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.4))" }}
                />
              </div>

              {magnifier.show && !isTouch && (
                <div
                  className="fixed pointer-events-none z-[200] rounded-full border-2 border-white/30"
                  style={{
                    width: magnifierSize,
                    height: magnifierSize,
                    left: magnifier.x - magnifierSize / 2,
                    top: magnifier.y - magnifierSize / 2,
                    backgroundImage: `url(${card.frontImageUrl})`,
                    backgroundSize: `${(imgElRef.current?.getBoundingClientRect().width || 300) * zoomLevel}px ${(imgElRef.current?.getBoundingClientRect().height || 400) * zoomLevel}px`,
                    backgroundPositionX: `${-(magnifier.bgX / 100) * (imgElRef.current?.getBoundingClientRect().width || 300) * zoomLevel + magnifierSize / 2}px`,
                    backgroundPositionY: `${-(magnifier.bgY / 100) * (imgElRef.current?.getBoundingClientRect().height || 400) * zoomLevel + magnifierSize / 2}px`,
                    backgroundRepeat: "no-repeat",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.2)",
                    backgroundColor: "oklch(0.08 0.005 260)",
                  }}
                />
              )}

              {!isTouch && (
                <div className="absolute bottom-3 left-0 right-0 text-center">
                  <span className="text-[10px] text-white/20">{t("collection.detail.hoverHint")}</span>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6 md:p-8">
              <div className="mb-3 flex items-center gap-2 sm:gap-3">
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold sm:px-2.5 sm:py-1 sm:text-[11px] ${
                    isPSA10
                      ? "border border-[oklch(0.85_0.15_85/0.25)] bg-[oklch(0.85_0.15_85/0.15)] text-[oklch(0.85_0.15_85)]"
                      : "border border-emerald-400/25 bg-emerald-400/15 text-emerald-400"
                  }`}
                >
                  PSA {gradeNum} {normalizedGrade}
                </span>
                <span className="text-[10px] text-white/30 sm:text-[11px]">
                  {card.year} · {card.language}
                </span>
              </div>

              <h2 className="mb-1 text-lg font-bold text-white/90 sm:text-xl">{card.pokemonName}</h2>
              <p className="mb-4 text-[11px] text-white/30 sm:mb-5 sm:text-[12px]">
                {card.setName} · Card #{card.cardNumber}
              </p>

              <div
                className="mb-4 rounded-xl border border-white/[0.06] p-3 sm:mb-5 sm:p-4"
                style={{ background: "oklch(0.08 0.005 260 / 0.6)" }}
              >
                <div className="mb-1 text-[9px] uppercase tracking-wider text-white/30 sm:text-[10px]">
                  {t("collection.detail.fairMarketValue")}
                </div>
                <div className="text-xl font-bold sm:text-2xl" style={{ color: "oklch(0.85 0.15 85)" }}>
                  ${fmv.toFixed(2)}
                </div>
                <div className="mt-1 text-[9px] text-white/20 sm:text-[10px]">{t("collection.detail.pricingSource")}</div>
              </div>

              <div className="mb-2 text-[9px] font-medium uppercase tracking-wider text-white/30 sm:mb-3 sm:text-[10px]">
                {t("collection.detail.attributes")}
              </div>
              <div className="mb-4 grid grid-cols-2 gap-1.5 sm:mb-6 sm:gap-2">
                {attributes.map((attr) => (
                  <div
                    key={attr.label}
                    className="rounded-lg border border-white/[0.04] p-2 sm:p-3"
                    style={{ background: "oklch(0.08 0.005 260 / 0.4)" }}
                  >
                    <div className="mb-0.5 text-[8px] uppercase tracking-wider text-white/25 sm:mb-1 sm:text-[9px]">
                      {attr.label}
                    </div>
                    <div className="break-all text-[11px] font-medium text-white/80 sm:text-[13px]">{attr.value}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 sm:space-y-2.5">
                <a
                  href={getPSAUrl(card.serial)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[12px] font-semibold transition-all duration-300 sm:py-3 sm:text-[13px]"
                  style={{
                    background: "linear-gradient(135deg, oklch(0.85 0.15 85), oklch(0.75 0.13 85))",
                    color: "oklch(0.1 0.005 260)",
                  }}
                >
                  <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {t("collection.detail.viewPsa")}
                </a>
                <a
                  href={getRenaissUrl(card.tokenId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.1] py-2.5 text-[12px] font-semibold text-white/70 transition-all duration-300 hover:bg-white/[0.04] hover:text-white sm:py-3 sm:text-[13px]"
                >
                  <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {t("collection.detail.viewRenaiss")}
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
