type Props = { code: string; compact?: boolean };

export default function ImageCode({ code, compact = false }: Props) {
  const safe = (code || "000000000000").toUpperCase().padEnd(12, "0").slice(0, 12);
  const bars = Array.from(safe).map((ch, i) => {
    const raw = ch.charCodeAt(0) + i * 3;
    return { h: 6 + (raw % 12), w: (raw % 3) + 1 };
  });
  return (
    <span className="image-code" title={`Compliance ImageCode · ${safe}`}>
      <span className="image-code-bars" aria-hidden="true">
        {bars.map((b, i) => (
          <span key={i} style={{ height: `${b.h}px`, width: `${b.w}px` }} />
        ))}
      </span>
      {!compact && <span>{safe}</span>}
    </span>
  );
}
