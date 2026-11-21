// Ritim şeridi (Ritmi Tut): tek ölçü 4 vuruş, soldan sağa zaman.
// Mor/turkuaz çizgiler dokunulması gereken anlar; sonuçta noktalar dokunuşlar
// (yeşil tam, sarı yakın), kesikli kırmızı halka kaçan nota, × fazla dokunuş. progress: oynatma çizgisi.
import { onsets, type TapResult } from "../data/rhythmTap"
import { alpha, category, colors, font, palette, radius, space } from "../design/tokens"

const ACCENT = category.rhythm.base
const GRADE_COLOR = { perfect: palette.green500, good: palette.amber500, miss: palette.red500 } as const

/** Ölçüyü gösteren şerit: vuruş çizgileri, olması gereken anlar ve (sonuçta) dokunuşlar */
export default function RhythmTimeline({
  score,
  result,
  bpm,
  progress,
}: {
  score: string
  result: TapResult | null
  bpm: number
  /** 0–1 çalma sırasında oynatma çizgisi; yoksa gizli */
  progress: number | null
}) {
  const beats = onsets(score)
  const pos = (b: number) => `${(Math.max(-0.25, Math.min(4.25, b)) / 4) * 100}%`
  const beatMs = 60000 / bpm
  return (
    <div
      aria-hidden="true"
      style={{
        position: "relative",
        height: 56,
        margin: `0 ${space[3]}px`,
        borderRadius: radius.md,
        background: colors.fill,
        border: `1px solid ${colors.border}`,
      }}
    >
      {[1, 2, 3].map((b) => (
        <span
          key={b}
          style={{ position: "absolute", left: pos(b), top: 8, bottom: 8, width: 1, background: colors.borderStrong }}
        />
      ))}
      {/* Olması gereken anlar */}
      {beats.map((b) => (
        <span
          key={b}
          style={{
            position: "absolute",
            left: pos(b),
            top: 6,
            width: 4,
            height: 18,
            marginLeft: -2,
            borderRadius: 2,
            background: alpha(ACCENT, 0.9),
          }}
        />
      ))}
      {/* Dokunuşlar */}
      {result?.notes.map(
        (n) =>
          n.deltaMs !== null && (
            <span
              key={n.beat}
              style={{
                position: "absolute",
                left: pos(n.beat + n.deltaMs / beatMs),
                bottom: 8,
                width: 14,
                height: 14,
                marginLeft: -7,
                borderRadius: "50%",
                background: GRADE_COLOR[n.grade],
              }}
            />
          ),
      )}
      {result?.notes
        .filter((n) => n.grade === "miss")
        .map((n) => (
          <span
            key={`m${n.beat}`}
            style={{
              position: "absolute",
              left: pos(n.beat),
              bottom: 8,
              width: 14,
              height: 14,
              marginLeft: -7,
              borderRadius: "50%",
              border: `2px dashed ${palette.red500}`,
            }}
          />
        ))}
      {result?.extra.map((b, i) => (
        <span
          key={`x${i}`}
          style={{
            position: "absolute",
            left: pos(b),
            bottom: 6,
            marginLeft: -7,
            color: palette.red500,
            fontSize: 16,
            fontWeight: font.weight.heavy,
            lineHeight: 1,
          }}
        >
          ×
        </span>
      ))}
      {progress !== null && (
        <span
          style={{
            position: "absolute",
            left: pos(progress * 4),
            top: 0,
            bottom: 0,
            width: 2,
            marginLeft: -1,
            background: colors.text,
          }}
        />
      )}
    </div>
  )
}
