/**
 * CardMagnifier — 卡牌放大镜组件
 * 鼠标悬停时显示圆形放大镜，放大查看卡牌细节
 * 使用 img 自然尺寸计算精确放大位置
 */
import { useState, useRef, useCallback, useEffect } from "react";

interface CardMagnifierProps {
  src: string;
  highResSrc?: string;
  alt: string;
  magnification?: number;
  lensSize?: number;
}

export default function CardMagnifier({
  src,
  highResSrc,
  alt,
  magnification = 2.5,
  lensSize = 180,
}: CardMagnifierProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [showLens, setShowLens] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [bgStyle, setBgStyle] = useState<React.CSSProperties>({});
  const [imgRect, setImgRect] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [highResLoaded, setHighResLoaded] = useState(false);

  // Preload high-res image
  useEffect(() => {
    if (highResSrc && highResSrc !== src) {
      const img = new Image();
      img.onload = () => setHighResLoaded(true);
      img.src = highResSrc;
    }
  }, [highResSrc, src]);

  // Calculate the actual rendered image rect within the container (object-contain)
  const updateImgRect = useCallback(() => {
    if (!imgRef.current || !containerRef.current) return;
    const img = imgRef.current;
    const container = containerRef.current;
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const nw = img.naturalWidth || cw;
    const nh = img.naturalHeight || ch;
    const scale = Math.min(cw / nw, ch / nh);
    const rw = nw * scale;
    const rh = nh * scale;
    const rx = (cw - rw) / 2;
    const ry = (ch - rh) / 2;
    setImgRect({ x: rx, y: ry, w: rw, h: rh });
  }, []);

  useEffect(() => {
    updateImgRect();
    window.addEventListener("resize", updateImgRect);
    return () => window.removeEventListener("resize", updateImgRect);
  }, [updateImgRect]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      // Check if cursor is within the actual image area
      const inImage =
        mx >= imgRect.x &&
        mx <= imgRect.x + imgRect.w &&
        my >= imgRect.y &&
        my <= imgRect.y + imgRect.h;

      if (!inImage) {
        setShowLens(false);
        return;
      }

      setShowLens(true);

      // Lens center on cursor
      setLensPos({ x: mx - lensSize / 2, y: my - lensSize / 2 });

      // Relative position within the rendered image (0~1)
      const relX = (mx - imgRect.x) / imgRect.w;
      const relY = (my - imgRect.y) / imgRect.h;

      // Background size = rendered image size * magnification
      const bgW = imgRect.w * magnification;
      const bgH = imgRect.h * magnification;

      // Background offset: place the magnified point at the lens center
      const bgX = -(relX * bgW - lensSize / 2);
      const bgY = -(relY * bgH - lensSize / 2);

      setBgStyle({
        backgroundImage: `url(${highResLoaded && highResSrc ? highResSrc : src})`,
        backgroundSize: `${bgW}px ${bgH}px`,
        backgroundPosition: `${bgX}px ${bgY}px`,
        backgroundRepeat: "no-repeat",
      });
    },
    [imgRect, lensSize, magnification, src, highResSrc, highResLoaded]
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      onMouseLeave={() => setShowLens(false)}
      onMouseMove={handleMouseMove}
      style={{ cursor: showLens ? "none" : "default" }}
    >
      {/* Base image */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="w-full h-full object-contain"
        draggable={false}
        onLoad={updateImgRect}
      />

      {/* Magnifier lens */}
      {showLens && (
        <div
          className="absolute pointer-events-none z-20 rounded-full border-2 border-white/40 shadow-[0_0_0_1px_rgba(0,0,0,0.4),0_4px_24px_rgba(0,0,0,0.6)]"
          style={{
            width: lensSize,
            height: lensSize,
            left: lensPos.x,
            top: lensPos.y,
            ...bgStyle,
          }}
        >
          {/* Crosshair */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-px h-4 bg-white/25 absolute" />
            <div className="h-px w-4 bg-white/25 absolute" />
          </div>
        </div>
      )}
    </div>
  );
}
