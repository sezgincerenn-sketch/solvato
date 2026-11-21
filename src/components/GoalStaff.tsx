// Günlük hedef portesi (Pratik › Bugün): hedefin her parçası portede bir nota.
// Çözülen kadar nota dolu (mor), kalanlar soluk boş nota başı. Re4'ten yukarı bir dizi (Re–Fa5).
// Hedef 10'dan büyükse 10 nota çizilir, her nota hedef/10 soru sayar.
import Glyph from "./Glyph"
import { colors } from "../design/tokens"

const LINES = [40, 50, 60, 70, 80] // MusicalStaff ile aynı koordinatlar: Mi4 = 80, Fa5 = 40
const W = 330
const FIRST_X = 54
const HEAD_W = 11.8 // noteheadBlack genişliği (sp=10)

export default function GoalStaff({ done, goal }: { done: number; goal: number }) {
  const n = Math.max(1, Math.min(goal, 10))
  const filled = goal > 0 ? Math.min(n, Math.floor((done / goal) * n)) : 0
  const gap = (W - FIRST_X - 22) / n
  return (
    <svg
      viewBox={`0 24 ${W} 72`}
      width="100%"
      role="img"
      aria-label={`Günlük hedef: ${goal} sorudan ${Math.min(done, goal)} tanesi tamam`}
      style={{ display: "block", overflow: "visible" }}
    >
      {LINES.map((y) => (
        <line key={y} x1={2} y1={y} x2={W - 2} y2={y} stroke={colors.staffLine} strokeWidth={1.2} />
      ))}
      <Glyph name="gClef" x={6} y={70} />
      {Array.from({ length: n }, (_, i) => {
        const y = 85 - 5 * i // Re4, Mi4, Fa4 … her nota bir basamak yukarı
        const x = FIRST_X + i * gap
        const on = i < filled
        if (!on) return <Glyph key={i} name="noteheadHalf" x={x} y={y} fill={colors.textDisabled} />
        const up = y > 60 // orta çizginin altı: sap yukarı ve sağda
        return (
          <g key={i} style={{ transition: "opacity 0.3s" }}>
            <Glyph name="noteheadBlack" x={x} y={y} fill={colors.violetText} />
            <line
              x1={up ? x + HEAD_W - 0.7 : x + 0.7}
              y1={up ? y - 1.5 : y + 1.5}
              x2={up ? x + HEAD_W - 0.7 : x + 0.7}
              y2={up ? y - 35 : y + 35}
              stroke={colors.violetText}
              strokeWidth={1.3}
            />
          </g>
        )
      })}
      {/* hedef bitince bitiş çizgisi */}
      <line
        x1={W - 4}
        y1={40}
        x2={W - 4}
        y2={80}
        stroke={filled >= n ? colors.violetText : colors.staffLine}
        strokeWidth={filled >= n ? 3 : 1.2}
      />
    </svg>
  )
}
