// Çalışma bölümünün ortak parçaları: anahtar seçici, arama, mini piyano, nota renkleri
import { pianoColors } from "../../design/piano"
import { playPianoNote } from "../../utils/audio"
import { accKey, blackKeyLabel, type Accidental } from "../../data/accidentals"

import { colors, font, palette, radius } from "../../design/tokens"

// ─── Color map for note names ──────────────────────────────────────────────────
export const NOTE_COLORS: Record<string, string> = {
  Do: palette.red400,
  Re: palette.orange400,
  Mi: palette.amber400,
  Fa: palette.lime400,
  Sol: palette.green400,
  La: palette.blue400,
  Si: palette.violet400,
}

// ─── Octave maps for audio playback ───────────────────────────────────────────
export const TREBLE_OCTAVES = [4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5]

export const BASS_OCTAVES = [2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 4]

// ─── Seçili notayı gösteren mini piyano (2 oktav) ─────────────────────────────
export const PIANO_ORDER = ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"]

export const BLACK_AFTER = [0, 1, 3, 4, 5]

export function MiniPiano({
  name,
  octave,
  acc,
  color,
  startOctave,
  whites = 14,
  available,
  onPick,
  hint,
  dimBlack = true,
}: {
  name: string
  octave: number
  acc: Accidental | null
  color: string
  /** Klavyenin ilk Do'sunun oktavı. Klavye sabittir; seçim değişince kaymaz. */
  startOctave: number
  /** Beyaz tuş sayısı (Fa anahtarında Orta Do'ya kadar 15) */
  whites?: number
  /** Bu tuşa basınca bir notaya geçilebilir mi? Geçilemeyen tuşlar soluk görünür, yalnızca ses çalar. */
  available?: (name: string, octave: number, sharp: boolean) => boolean
  /** Bir tuşa basılınca o notaya geç (siyah tuş: diyez) */
  onPick?: (name: string, octave: number, sharp: boolean) => void
  /** Klavyenin altındaki kısa açıklama */
  hint?: string
  /** Geçilemeyen siyah tuşlar soluk görünsün mü */
  dimBlack?: boolean
}) {
  const kw = 100 / whites
  const base = acc === null ? name : accKey(name, acc).replace("#", "")
  const isHi = (n: string, o: number, black: boolean) => n === base && o === octave && black === (acc !== null)
  const keyNames = acc ? blackKeyLabel(accKey(name, acc)) : name
  const can = (n: string, o: number, sharp: boolean) => (available ? available(n, o, sharp) : true)
  const press = (n: string, o: number, sharp: boolean) => {
    playPianoNote(sharp ? n + "#" : n, o)
    if (can(n, o, sharp)) onPick?.(n, o, sharp)
  }
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ color: colors.textMuted, fontSize: font.size.sm, fontFamily: font.family.ui }}>Piyanoda:</span>
        <span
          style={{
            padding: "3px 10px",
            borderRadius: radius.sm,
            background: `${color}22`,
            border: `1px solid ${color}55`,
            color,
            fontSize: font.size.sm,
            fontWeight: font.weight.bold,
            fontFamily: font.family.ui,
          }}
        >
          {keyNames}
        </span>
      </div>
      <div
        style={{ position: "relative", height: 96, borderRadius: radius.sm, overflow: "hidden", background: colors.bg }}
      >
        {Array.from({ length: whites }, (_, i) => {
          const n = PIANO_ORDER[i % 7]
          const o = startOctave + Math.floor(i / 7)
          const hi = isHi(n, o, false)
          const ok = can(n, o, false)
          return (
            <button
              key={i}
              aria-label={`${n}${o}`}
              onClick={() => press(n, o, false)}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: `${i * kw}%`,
                width: `${kw}%`,
                border: `1px solid ${palette.slate400}`,
                borderTop: "none",
                padding: 0,
                cursor: "pointer",
                background: hi ? color : ok ? palette.slate50 : palette.slate300,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                paddingBottom: 4,
                fontSize: font.size.xs,
                fontWeight: font.weight.bold,
                fontFamily: font.family.ui,
                color: hi ? palette.white : ok ? palette.slate600 : palette.slate500,
                boxSizing: "border-box",
              }}
            >
              {n === "Do" ? `${n}${o}` : n}
            </button>
          )
        })}
        {Array.from({ length: whites - 1 }, (_, i) => i)
          .filter((i) => BLACK_AFTER.includes(i % 7))
          .map((i) => {
            const n = PIANO_ORDER[i % 7]
            const o = startOctave + Math.floor(i / 7)
            const hi = isHi(n, o, true)
            const ok = can(n, o, true)
            return (
              <button
                key={`b${i}`}
                aria-label={`${n}#${o}`}
                onClick={() => press(n, o, true)}
                style={{
                  position: "absolute",
                  top: 0,
                  height: "60%",
                  left: `${(i + 1) * kw - kw * 0.3}%`,
                  width: `${kw * 0.6}%`,
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  borderRadius: "0 0 4px 4px",
                  background: hi ? color : pianoColors.diagramBlack,
                  opacity: hi || ok || !dimBlack ? 1 : 0.55,
                  boxShadow: hi ? `0 0 10px ${color}` : "none",
                  outline: hi ? `2px solid ${palette.white}` : "none",
                }}
              />
            )
          })}
      </div>
      {hint && (
        <p
          style={{
            marginTop: 6,
            fontSize: font.size.xs,
            color: colors.textFaint,
            fontFamily: font.family.ui,
            lineHeight: 1.5,
          }}
        >
          {hint}
        </p>
      )}
    </div>
  )
}
