import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseFMV, getGradeNumber, getPSAUrl, getRenaissUrl, type CardData } from '@/lib/renaissApi';
import { X, ExternalLink } from 'lucide-react';

interface Props {
  card: CardData | null;
  onClose: () => void;
}

export default function CardDetail({ card, onClose }: Props) {
  const imgElRef = useRef<HTMLImageElement>(null);

  // Detect touch device
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Magnifier state
  const [magnifier, setMagnifier] = useState({ show: false, x: 0, y: 0, bgX: 0, bgY: 0 });
  const magnifierSize = 180;
  const zoomLevel = 3;

  // Lock body scroll when detail is open
  useEffect(() => {
    if (card) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [card]);

  // Magnifier handler
  const handleMagnifierMove = useCallback((e: React.MouseEvent) => {
    if (isTouch || !imgElRef.current) return;
    const rect = imgElRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      setMagnifier(prev => ({ ...prev, show: false }));
      return;
    }

    const bgX = (x / rect.width) * 100;
    const bgY = (y / rect.height) * 100;

    setMagnifier({
      show: true,
      x: e.clientX,
      y: e.clientY,
      bgX,
      bgY,
    });
  }, [isTouch]);

  const handleMagnifierLeave = useCallback(() => {
    setMagnifier(prev => ({ ...prev, show: false }));
  }, []);

  if (!card) return null;

  const fmv = parseFMV(card.fmvPriceInUSD);
  const gradeNum = getGradeNumber(card.grade);
  const isPSA10 = gradeNum === 10;
  const shortSet = card.setName.replace('Pokemon Japanese ', '').replace('Pokemon ', '');

  const attributes = [
    { label: 'PSA SERIAL', value: card.serial },
    { label: 'GRADE', value: `${gradeNum} ${card.grade.replace(/^\d+\s*/, '')}` },
    { label: 'YEAR', value: card.year.toString() },
    { label: 'LANGUAGE', value: card.language },
    { label: 'SET', value: shortSet },
    { label: 'CARD NUMBER', value: `#${card.cardNumber}` },
    { label: 'GRADING COMPANY', value: card.gradingCompany },
    { label: 'VAULT LOCATION', value: card.vaultLocation === 'platform' ? 'Platform' : card.vaultLocation },
  ];

  return (
    <AnimatePresence>
      {card && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4"
          style={{ background: 'oklch(0.04 0.005 260 / 0.92)', backdropFilter: 'blur(20px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-5 sm:right-5 z-10 p-2 sm:p-2.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.1] transition-all duration-300"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/[0.06]"
            style={{
              background: 'oklch(0.09 0.005 260 / 0.95)',
              boxShadow: '0 40px 100px -30px rgba(0,0,0,0.7)',
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-[420px_1fr] gap-0">
              {/* Left: Card image — full bleed like image 2 */}
              <div
                className="relative flex items-center justify-center border-b md:border-b-0 md:border-r border-white/[0.06] overflow-hidden"
                style={{
                  background: 'oklch(0.06 0.005 260)',
                  minHeight: '400px',
                }}
              >
                <div
                  className="w-full h-full flex items-center justify-center p-6 sm:p-8 md:p-10"
                >
                  <img
                    ref={imgElRef}
                    src={card.frontImageUrl}
                    alt={card.pokemonName}
                    className={`max-w-full max-h-[65vh] object-contain ${isTouch ? '' : 'cursor-crosshair'}`}
                    draggable={false}
                    onMouseMove={handleMagnifierMove}
                    onMouseLeave={handleMagnifierLeave}
                    style={{
                      filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.4))',
                    }}
                  />
                </div>

                {/* Magnifier lens (follows cursor, fixed position) */}
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
                      backgroundRepeat: 'no-repeat',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.2)',
                      backgroundColor: 'oklch(0.08 0.005 260)',
                    }}
                  />
                )}

                {/* Hint */}
                {!isTouch && (
                  <div className="absolute bottom-3 left-0 right-0 text-center">
                    <span className="text-[10px] text-white/20">
                      悬停图片查看放大细节
                    </span>
                  </div>
                )}
              </div>

              {/* Right: Card info — original layout from image 1 */}
              <div className="p-4 sm:p-6 md:p-8">
                {/* Grade + Year */}
                <div className="flex items-center gap-2 sm:gap-3 mb-3">
                  <span
                    className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded text-[10px] sm:text-[11px] font-bold ${
                      isPSA10
                        ? 'bg-[oklch(0.85_0.15_85/0.15)] text-[oklch(0.85_0.15_85)] border border-[oklch(0.85_0.15_85/0.25)]'
                        : 'bg-emerald-400/15 text-emerald-400 border border-emerald-400/25'
                    }`}
                  >
                    PSA {gradeNum} {card.grade.replace(/^\d+\s*/, '')}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-white/30">
                    {card.year} · {card.language}
                  </span>
                </div>

                {/* Name */}
                <h2 className="text-lg sm:text-xl font-bold text-white/90 mb-1">
                  {card.pokemonName}
                </h2>
                <p className="text-[11px] sm:text-[12px] text-white/30 mb-4 sm:mb-5">
                  {card.setName} · Card #{card.cardNumber}
                </p>

                {/* FMV */}
                <div
                  className="rounded-xl p-3 sm:p-4 mb-4 sm:mb-5 border border-white/[0.06]"
                  style={{ background: 'oklch(0.08 0.005 260 / 0.6)' }}
                >
                  <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/30 mb-1">
                    Fair Market Value
                  </div>
                  <div className="text-xl sm:text-2xl font-bold" style={{ color: 'oklch(0.85 0.15 85)' }}>
                    ${fmv.toFixed(2)}
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-white/20 mt-1">
                    Based on Renaiss Protocol real-time pricing
                  </div>
                </div>

                {/* Attributes */}
                <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/30 mb-2 sm:mb-3 font-medium">
                  Card Attributes
                </div>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                  {attributes.map((attr) => (
                    <div
                      key={attr.label}
                      className="rounded-lg p-2 sm:p-3 border border-white/[0.04]"
                      style={{ background: 'oklch(0.08 0.005 260 / 0.4)' }}
                    >
                      <div className="text-[8px] sm:text-[9px] uppercase tracking-wider text-white/25 mb-0.5 sm:mb-1">
                        {attr.label}
                      </div>
                      <div className="text-[11px] sm:text-[13px] font-medium text-white/80 break-all">
                        {attr.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="space-y-2 sm:space-y-2.5">
                  <a
                    href={getPSAUrl(card.serial)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 sm:py-3 rounded-xl text-[12px] sm:text-[13px] font-semibold transition-all duration-300"
                    style={{
                      background: 'linear-gradient(135deg, oklch(0.85 0.15 85), oklch(0.75 0.13 85))',
                      color: 'oklch(0.1 0.005 260)',
                    }}
                  >
                    <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    查看 PSA 官网真实数据
                  </a>
                  <a
                    href={getRenaissUrl(card.tokenId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 sm:py-3 rounded-xl text-[12px] sm:text-[13px] font-semibold border border-white/[0.1] text-white/70 hover:text-white hover:bg-white/[0.04] transition-all duration-300"
                  >
                    <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    在 Renaiss 官网查看
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
