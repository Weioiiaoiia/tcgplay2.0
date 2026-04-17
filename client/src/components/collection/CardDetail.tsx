/**
 * Design reminder for this component:
 * Detail modal should feel like a private viewing room in warm ivory tones,
 * with a soft exhibition panel on the left and a refined data sheet on the right.
 * Keep the interaction light, dismissible, and visually consistent with Home.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, ExternalLink, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { parseFMV, getGradeNumber, getPSAUrl, getRenaissUrl, type CardData } from "@/lib/renaissApi";

interface Props {
  card: CardData | null;
  onClose: () => void;
}

function formatMoney(value: number) {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function CardDetail({ card, onClose }: Props) {
  const { t } = useTranslation();
  const imgElRef = useRef<HTMLImageElement>(null);
  const [isTouch, setIsTouch] = useState(false);
  const [copied, setCopied] = useState(false);
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
      setCopied(false);
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

  const handleCopyOwner = useCallback(async () => {
    if (!card?.ownerAddress) return;
    try {
      await navigator.clipboard.writeText(card.ownerAddress);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }, [card]);

  const normalizedGrade = useMemo(() => {
    if (!card) return "";
    return card.grade.replace(/^\d+\s*/, "").trim();
  }, [card]);

  if (!card) return null;

  const fmv = parseFMV(card.fmvPriceInUSD);
  const ask = parseFloat(card.askPriceInUSDT || "0") || 0;
  const gradeNum = getGradeNumber(card.grade);
  const shortSet = card.setName.replace("Pokemon Japanese ", "").replace("Pokemon ", "");
  const ownerDisplay = card.ownerAddress
    ? `${card.ownerAddress.slice(0, 8)}...${card.ownerAddress.slice(-6)}`
    : "ByronSONE";

  const attributes = [
    { label: t("collection.detail.labels.psaSerial"), value: card.serial || "—" },
    { label: t("collection.detail.labels.grade"), value: normalizedGrade ? `${gradeNum} ${normalizedGrade}` : String(gradeNum) },
    { label: t("collection.detail.labels.year"), value: String(card.year || "—") },
    { label: t("collection.detail.labels.language"), value: card.language || "—" },
    { label: t("collection.detail.labels.set"), value: shortSet || card.setName || "—" },
    { label: t("collection.detail.labels.cardNumber"), value: card.cardNumber ? `#${card.cardNumber}` : "—" },
    { label: t("collection.detail.labels.gradingCompany"), value: card.gradingCompany || "PSA" },
    {
      label: t("collection.detail.labels.vaultLocation"),
      value: card.vaultLocation === "platform" ? t("collection.detail.labels.platform") : card.vaultLocation || t("collection.detail.labels.platform"),
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4"
        style={{ background: "rgba(224, 217, 204, 0.42)", backdropFilter: "blur(14px)" }}
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full border border-black/8 bg-white/78 p-2 text-black/40 shadow-[0_12px_30px_rgba(20,20,20,0.08)] transition-all duration-300 hover:bg-white hover:text-black/70 sm:right-6 sm:top-6"
        >
          <X className="h-4 w-4" />
        </button>

        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.985 }}
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          className="max-h-[88vh] w-full max-w-[1100px] overflow-y-auto rounded-[1.65rem] border border-[#e6dfd2] bg-[#fbf8f1] shadow-[0_30px_90px_-36px_rgba(30,24,14,0.24)]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="border-b border-[#ece5d8] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.9),rgba(245,239,227,0.94)_55%,rgba(241,234,220,0.98))] px-4 py-5 sm:px-6 sm:py-6 lg:min-h-[660px] lg:border-b-0 lg:border-r">
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.32em] text-black/28">
                Private Viewing Room
              </p>
              <div className="flex min-h-[470px] items-center justify-center rounded-[1.5rem] border border-[#ece5d8] bg-[linear-gradient(180deg,rgba(255,255,255,0.7),rgba(245,239,227,0.88))] px-4 py-6 sm:px-6">
                <div className="relative flex w-full max-w-[360px] items-center justify-center rounded-[1.35rem] bg-[#161616] px-6 py-7 shadow-[0_24px_56px_rgba(22,22,22,0.16)]">
                  <img
                    ref={imgElRef}
                    src={card.frontImageUrl}
                    alt={card.pokemonName}
                    className={`max-h-[52vh] max-w-full object-contain ${isTouch ? "" : "cursor-crosshair"}`}
                    draggable={false}
                    onMouseMove={handleMagnifierMove}
                    onMouseLeave={handleMagnifierLeave}
                    style={{ filter: "drop-shadow(0 18px 40px rgba(0,0,0,0.35))" }}
                  />
                </div>
              </div>
              {!isTouch && (
                <p className="mt-4 text-center text-[10px] tracking-[0.06em] text-black/24">
                  悬停图片可查看局部放大
                </p>
              )}

              {magnifier.show && !isTouch && (
                <div
                  className="fixed z-[200] pointer-events-none rounded-full border-2 border-white/80 shadow-[0_18px_48px_rgba(24,24,24,0.22)]"
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
                    backgroundColor: "#f7f3eb",
                  }}
                />
              )}
            </div>

            <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-6 lg:py-7">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-[#ecd98f] bg-[#f4dc8c]/55 px-2.5 py-0.5 text-[10px] font-semibold text-[#6e5718] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                  PSA {gradeNum} {normalizedGrade}
                </span>
                <span className="text-[12px] text-black/34">
                  {card.year} · {card.language}
                </span>
              </div>

              <h2 className="mt-3 text-[1.9rem] font-semibold tracking-[-0.055em] text-[#171411] sm:text-[2.45rem]">
                {card.pokemonName}
              </h2>
              <p className="mt-2 text-[13px] text-black/36">
                {card.setName} · Card #{card.cardNumber}
              </p>

              <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-[1.3rem] border border-[#e7dece] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(245,239,227,0.9))] p-4 shadow-[0_8px_22px_rgba(40,32,20,0.04)]">
                  <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-black/24">
                    Fair Market Value
                  </div>
                  <div className="mt-2 text-[1.8rem] font-semibold tracking-[-0.04em] text-[#171411]">
                    {formatMoney(fmv)}
                  </div>
                  <div className="mt-1.5 text-[11px] text-black/34">基于 Renaiss 实时市场定价</div>
                </div>
                <div className="rounded-[1.3rem] border border-[#e7dece] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(245,239,227,0.9))] p-4 shadow-[0_8px_22px_rgba(40,32,20,0.04)]">
                  <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-black/24">
                    Ask Price
                  </div>
                  <div className="mt-2 text-[1.8rem] font-semibold tracking-[-0.04em] text-[#171411]">
                    {formatMoney(ask)}
                  </div>
                  <div className="mt-1.5 text-[11px] text-black/34">当前市场挂售价格</div>
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-3 text-[10px] font-mono uppercase tracking-[0.24em] text-black/24">
                  Card Attributes
                </div>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {attributes.map((attr) => (
                    <div
                      key={attr.label}
                      className="rounded-[1.05rem] border border-[#ece3d4] bg-white/62 px-3.5 py-3 shadow-[0_6px_16px_rgba(40,32,20,0.03)]"
                    >
                      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-black/24">
                        {attr.label}
                      </div>
                      <div className="mt-2 break-all text-[13px] font-medium text-[#171411]">{attr.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-[1.15rem] border border-[#e8dfd0] bg-[linear-gradient(180deg,rgba(246,241,231,0.75),rgba(243,237,226,0.95))] px-3.5 py-3.5 shadow-[0_8px_20px_rgba(40,32,20,0.04)]">
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-black/24">Owner</div>
                <div className="mt-2.5 flex items-center justify-between gap-3">
                  <div className="text-[13px] font-medium text-[#171411]">{copied ? "已复制地址" : ownerDisplay}</div>
                  <button
                    type="button"
                    onClick={handleCopyOwner}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/8 bg-white/78 text-black/42 transition hover:bg-white hover:text-black/68"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <a
                  href={getPSAUrl(card.serial)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#e5dbc8] bg-white text-[13px] font-semibold text-[#171411] transition hover:bg-[#f8f3ea]"
                >
                  <ExternalLink className="h-4 w-4" />
                  查看 PSA 官方记录
                </a>
                <a
                  href={getRenaissUrl(card.tokenId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#141414] text-[13px] font-semibold text-white transition hover:bg-[#232323]"
                >
                  <ExternalLink className="h-4 w-4" />
                  前往 Renaiss 页面
                </a>
              </div>

              <p className="mt-6 text-[11px] leading-5 text-black/26">
                数据来源于 Renaiss Protocol 与 PSA 认证信息。当前弹窗保持轻量查看体验，关闭后会回到你刚刚浏览的市场位置。
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
