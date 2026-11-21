// Akoru porte üstünde çizer (Bravura), değiştirme işaretlerini çakışmasın diye sütunlara dizer.
import { staffY, type Chord } from "../data/chords"
import Glyph, { glyphWidth } from "./Glyph"
import type { GlyphName } from "../data/smufl"

import { colors } from "../design/tokens"
const ACC_GLYPH: Record<number, GlyphName> = {
  [-2]: "accidentalDoubleFlat",
  [-1]: "accidentalFlat",
  1: "accidentalSharp",
  2: "accidentalDoubleSharp",
}
const HW = glyphWidth("noteheadBlack")

// ─── Porte: akorun notaları üst üste ──────────────────────────────────────────
const INK = colors.notation
const LINE = colors.staffLine

export default function ChordStaffSvg({
  chord,
  color = colors.violetText,
  maxWidth = 310,
}: {
  chord: Chord
  color?: string
  maxWidth?: number
}) {
  const col = color
  const nx = 140
  const ys = chord.notes.map(staffY)
  // Yan yana iki komşu nota (ikili aralık) çakışmasın: üsttekini sağa kaydır
  const xs = ys.map((y, i) =>
    i > 0 && ys[i - 1] - y === 5 && !(i > 1 && ys[i - 2] - ys[i - 1] === 5) ? nx + HW - 1 : nx,
  )
  const ledgers = new Set<number>()
  ys.forEach((y) => {
    for (let l = 90; l <= y; l += 10) ledgers.add(l)
    for (let l = 30; l >= y; l -= 10) ledgers.add(l)
  })
  const colLast: number[] = []
  return (
    <svg viewBox="0 0 210 140" style={{ width: "100%", maxWidth }} role="img" aria-label="Portede akor">
      <g transform="translate(0,18)">
        {[40, 50, 60, 70, 80].map((y) => (
          <line key={y} x1={14} y1={y} x2={196} y2={y} stroke={LINE} strokeWidth={1.3} />
        ))}
        <Glyph name="gClef" x={20} y={70} fill={INK} opacity={0.85} />
        {[...ledgers].map((y) => (
          <line
            key={"l" + y}
            x1={nx - HW / 2 - 4}
            y1={y}
            x2={Math.max(...xs) + HW / 2 + 4}
            y2={y}
            stroke={LINE}
            strokeWidth={1.3}
          />
        ))}
        {/* Notaları yukarıdan aşağı işle ki işaretler sıralı kaysın */}
        {chord.notes
          .map((n, i) => ({ n, i }))
          .reverse()
          .map(({ n, i }) => {
            const y = ys[i]
            const acc = n.acc !== 0 ? ACC_GLYPH[n.acc] : null
            // İşaretler üst üste binmesin: her sütunda en az 22 birim dikey boşluk
            let ac = 0
            if (acc) {
              while (colLast[ac] !== undefined && Math.abs(colLast[ac] - y) < 22) ac++
              colLast[ac] = y
            }
            const ax = nx - HW / 2 - 3 - (acc ? glyphWidth(acc) + ac * 11 : 0)
            return (
              <g key={i}>
                {acc && <Glyph name={acc} x={ax} y={y} fill={col} />}
                <Glyph
                  name="noteheadBlack"
                  x={xs[i] - HW / 2}
                  y={y}
                  fill={col}
                  opacity={0.95}
                  style={{ filter: `drop-shadow(0 0 5px ${col}88)`, transition: "fill 0.3s" }}
                />
              </g>
            )
          })}
      </g>
    </svg>
  )
}
