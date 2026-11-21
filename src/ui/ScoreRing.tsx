// Puan halkası: oran kadar dolu. Rengi marka moru; başarıya göre kırmızı/yeşil yapılmaz (tasarım sistemi kuralı).
import { colors, font, palette } from "../design/tokens"

export default function ScoreRing({
  value,
  max,
  size = 140,
  label,
  caption,
  detail,
  color,
}: {
  value: number
  max: number
  size?: number
  /** Ortadaki büyük yazı (varsayılan: "value/max") */
  label?: string
  /** Altındaki küçük yazı */
  caption?: string
  /** En altta, halka renginde ek satır (ör. "7/10 doğru") */
  detail?: string
  color?: string
}) {
  const ratio = max > 0 ? value / max : 0
  const col = color ?? palette.violet500
  const big = size > 120
  const sw = big ? 11 : 9
  const R = size / 2 - 10
  const circ = 2 * Math.PI * R
  const c = size / 2
  // Üç satır varsa yazılar biraz yukarı kayar
  const lift = detail ? 8 : 0
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${value} / ${max}`}>
      <circle cx={c} cy={c} r={R} fill="none" stroke={colors.fillStrong} strokeWidth={sw} />
      <circle
        cx={c}
        cy={c}
        r={R}
        fill="none"
        stroke={col}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray={`${ratio * circ} ${circ}`}
        transform={`rotate(-90 ${c} ${c})`}
        style={{ filter: `drop-shadow(0 0 8px ${col})`, transition: "stroke-dasharray 0.8s ease" }}
      />
      <text
        x={c}
        y={c + (big ? 4 : 2) - lift}
        textAnchor="middle"
        fontSize={big ? font.size.xxl : font.size.xl}
        fontWeight={font.weight.heavy}
        fill={colors.text}
        style={{ fontFamily: font.family.mono }}
      >
        {label ?? `${value}/${max}`}
      </text>
      {caption && (
        <text
          x={c}
          y={c + (big ? 24 : 20) - lift}
          textAnchor="middle"
          fontSize={big ? font.size.xs : 11}
          fill={colors.textSubtle}
          style={{ fontFamily: font.family.ui }}
        >
          {caption}
        </text>
      )}
      {detail && (
        <text
          x={c}
          y={c + (big ? 39 : 33) - lift}
          textAnchor="middle"
          fontSize={10}
          fontWeight={font.weight.bold}
          fill={col}
          style={{ fontFamily: font.family.mono }}
        >
          {detail}
        </text>
      )}
    </svg>
  )
}
