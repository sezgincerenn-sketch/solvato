// 0–3 yıldız gösterimi (tur sonucu, ana sayfa konu kartları, son turlar). Kural: utils/stars.ts
import { colors, palette } from "../design/tokens"

const STAR = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"

export default function Stars({ value, size = 14, animate }: { value: number; size?: number; animate?: boolean }) {
  return (
    <span role="img" aria-label={`3 yıldızdan ${value}`} style={{ display: "inline-flex", gap: size * 0.15 }}>
      {[0, 1, 2].map((i) => {
        const on = i < value
        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            aria-hidden="true"
            style={
              animate ? { animation: `popIn .45s cubic-bezier(.34,1.56,.64,1) ${0.15 + i * 0.18}s both` } : undefined
            }
          >
            <path
              d={STAR}
              fill={on ? palette.amber400 : colors.fillStronger}
              stroke={on ? palette.amber500 : colors.border}
              strokeWidth={1.2}
              strokeLinejoin="round"
            />
          </svg>
        )
      })}
    </span>
  )
}
