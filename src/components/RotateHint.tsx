// "Telefonu yan çevir" ipucu: ilk birkaç turda, piyano modunda gösterilir.
import { alpha, colors, font, palette, radius } from "../design/tokens"
// "Telefonu yan çevirebilirsin" ipucu: dönen telefon animasyonu + kısa yazı.
export default function RotateHint({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      aria-label="Telefonu yan çevirirsen klavye büyür. Kapatmak için dokun."
      className="animate-slide-up"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        margin: "0 16px 10px",
        width: "calc(100% - 32px)",
        padding: "10px 14px",
        borderRadius: radius.md,
        background: alpha(palette.violet500, 0.12),
        border: "1px solid rgba(139,92,246,0.3)",
        color: colors.violetTextSoft,
        fontSize: font.size.sm,
        fontWeight: font.weight.semibold,
        fontFamily: font.family.ui,
        textAlign: "left",
        cursor: "pointer",
      }}
    >
      <style>{`
        @keyframes nt-rotate {
          0%, 15% { transform: rotate(0deg); }
          45%, 70% { transform: rotate(-90deg); }
          100% { transform: rotate(0deg); }
        }
        @media (prefers-reduced-motion: reduce) { .nt-phone { animation: none !important; } }
      `}</style>
      <svg width={34} height={34} viewBox="0 0 34 34" aria-hidden style={{ flexShrink: 0 }}>
        <g
          className="nt-phone"
          style={{ transformOrigin: "17px 17px", animation: "nt-rotate 2.4s ease-in-out infinite" }}
        >
          <rect x={10} y={3} width={14} height={28} rx={3} fill="none" stroke={palette.violet400} strokeWidth={2} />
          {/* ekranda küçük klavye */}
          <rect x={12} y={20} width={10} height={7} rx={1} fill={palette.violet400} opacity={0.35} />
          <line x1={14.5} y1={20} x2={14.5} y2={27} stroke={palette.slate900} strokeWidth={0.8} />
          <line x1={17} y1={20} x2={17} y2={27} stroke={palette.slate900} strokeWidth={0.8} />
          <line x1={19.5} y1={20} x2={19.5} y2={27} stroke={palette.slate900} strokeWidth={0.8} />
        </g>
        <path
          d="M27 9 A 12 12 0 0 1 30 17"
          fill="none"
          stroke={palette.amber400}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <path
          d="M30.5 13.5 L 30 17.2 L 26.6 15.8"
          fill="none"
          stroke={palette.amber400}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span style={{ flex: 1 }}>Telefonu yan çevir, klavye büyüsün</span>
      <span aria-hidden style={{ color: colors.textMuted, fontSize: font.size.md }}>
        ✕
      </span>
    </button>
  )
}
