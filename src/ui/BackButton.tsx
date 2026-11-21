// Geri düğmesi: tüm ekranlarda aynı. data-back işareti kaydırarak geri hareketi için.
import { colors, radius } from "../design/tokens"
// Tüm ekranlarda aynı geri düğmesi
export default function BackButton({ onClick, label = "Geri" }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      data-back
      style={{
        width: 44,
        height: 44,
        flexShrink: 0,
        borderRadius: radius.md,
        background: colors.fillStrong,
        border: `1px solid ${colors.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
    >
      <svg
        width={18}
        height={18}
        viewBox="0 0 24 24"
        fill="none"
        stroke={colors.textSecondary}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 12H5M12 5l-7 7 7 7" />
      </svg>
    </button>
  )
}
