// Konu satırlarının sağındaki küçük oynat düğmesi. Her satırda aynı mor: konunun rengi soldaki ikonda.
import { alpha, colors, palette, radius } from "../design/tokens"

export default function PlayChip() {
  return (
    <div
      aria-hidden="true"
      style={{
        width: 34,
        height: 34,
        borderRadius: radius.sm,
        background: alpha(palette.violet500, 0.12),
        border: `1px solid ${alpha(palette.violet500, 0.25)}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg width={13} height={13} viewBox="0 0 24 24">
        <path d="M5 3l14 9-14 9V3z" fill={colors.violetText} />
      </svg>
    </div>
  )
}
