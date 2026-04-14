import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { parseFMV, getGradeNumber, type CardData } from '@/lib/renaissApi';

interface Props {
  card: CardData;
  index: number;
  onClick: () => void;
}

export default function CardItem({ card, index, onClick }: Props) {
  const [hovering, setHovering] = useState(false);

  // Detect touch device
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Magnifier state
  const imgRef = useRef<HTMLImageElement>(null);
  const [mag, setMag] = useState({ show: false, x: 0, y: 0, bgX: 0, bgY: 0 });
  const magnifierSize = 120;
  const zoomLevel = 2.5;

  const fmv = parseFMV(card.fmvPriceInUSD);
  const gradeNum = getGradeNumber(card.grade);
  const isPSA10 = gradeNum === 10;

  // Shorten set name
  const shortSet = card.setName.replace('Pokemon Japanese ', '').replace('Pokemon ', '');

  const handleImgMouseMove = useCallback((e: React.MouseEvent) => {
    if (isTouch || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      setMag(prev => ({ ...prev, show: false }));
      return;
    }

    const bgX = (x / rect.width) * 100;
    const bgY = (y / rect.height) * 100;

    setMag({
      show: true,
      x: e.clientX,
      y: e.clientY,
      bgX,
      bgY,
    });
  }, [isTouch]);

  const handleImgMouseLeave = useCallback(() => {
    setMag(prev => ({ ...prev, show: false }));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.5), ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={onClick}
      className="group cursor-pointer"
    >
      <div
        className="rounded-xl border border-white/[0.06] overflow-hidden transition-all duration-300"
        style={{
          background: 'oklch(0.1 0.005 260 / 0.8)',
          transform: hovering ? 'translateY(-4px)' : 'translateY(0)',
          boxShadow: hovering
            ? '0 20px 60px -15px rgba(0,0,0,0.5), 0 0 40px -10px oklch(0.85 0.15 85 / 0.08)'
            : '0 4px 20px -5px rgba(0,0,0,0.3)',
        }}
      >
        {/* Image area */}
        <div className="relative aspect-[3/4] overflow-hidden bg-[oklch(0.08_0.005_260)]">
          {/* Grade badge */}
          <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10">
            <span
              className={`px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold ${
                isPSA10
                  ? 'bg-[oklch(0.85_0.15_85/0.2)] text-[oklch(0.85_0.15_85)] border border-[oklch(0.85_0.15_85/0.3)]'
                  : 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30'
              }`}
            >
              PSA {gradeNum}
            </span>
          </div>

          {/* Card image with magnifier */}
          <img
            ref={imgRef}
            src={card.frontImageUrl}
            alt={card.pokemonName}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
            onMouseMove={handleImgMouseMove}
            onMouseLeave={handleImgMouseLeave}
          />

          {/* Magnifier lens */}
          {mag.show && !isTouch && (
            <div
              className="fixed pointer-events-none z-[200] rounded-full border-2 border-white/40"
              style={{
                width: magnifierSize,
                height: magnifierSize,
                left: mag.x - magnifierSize / 2,
                top: mag.y - magnifierSize / 2,
                backgroundImage: `url(${card.frontImageUrl})`,
                backgroundSize: `${(imgRef.current?.getBoundingClientRect().width || 200) * zoomLevel}px ${(imgRef.current?.getBoundingClientRect().height || 267) * zoomLevel}px`,
                backgroundPositionX: `${-(mag.bgX / 100) * (imgRef.current?.getBoundingClientRect().width || 200) * zoomLevel + magnifierSize / 2}px`,
                backgroundPositionY: `${-(mag.bgY / 100) * (imgRef.current?.getBoundingClientRect().height || 267) * zoomLevel + magnifierSize / 2}px`,
                backgroundRepeat: 'no-repeat',
                boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 0 20px rgba(0,0,0,0.2)',
                backgroundColor: 'oklch(0.08 0.005 260)',
              }}
            />
          )}

          {/* Hover glow overlay */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, oklch(0.85 0.15 85 / 0.04), transparent 60%)',
            }}
          />
        </div>

        {/* Info */}
        <div className="p-2 sm:p-3">
          <div className="text-[11px] sm:text-[13px] font-semibold text-white/85 truncate">
            {card.pokemonName}
          </div>
          <div className="text-[9px] sm:text-[11px] text-white/30 truncate mt-0.5">
            {shortSet} #{card.cardNumber}
          </div>
          <div className="flex items-center justify-between mt-1.5 sm:mt-2">
            <div className="flex items-center gap-1">
              <span className="text-[8px] sm:text-[10px] text-white/25">FMV</span>
              <span
                className="text-[12px] sm:text-[14px] font-bold"
                style={{ color: 'oklch(0.85 0.15 85)' }}
              >
                ${fmv}
              </span>
            </div>
            <span className="text-[8px] sm:text-[10px] text-white/20 font-mono hidden sm:inline">
              {card.serial}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
