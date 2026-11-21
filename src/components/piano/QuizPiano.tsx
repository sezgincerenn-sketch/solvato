// Test ekranındaki piyano: 1–3 oktav, isteğe bağlı oktavlı cevap (yan ekran)
import { blackKeyStyle, keyLabelColor, pianoColors, whiteKeyStyle, type KeyState } from "../../design/piano"
import { playPianoNote } from "../../utils/audio"
import { hapticTap } from "../../utils/haptics"
import { font } from "../../design/tokens"
import type { AnswerState } from "../../types"

// ─── Inline quiz piano keyboard ───────────────────────────────────────────────
// Cevap yalnızca nota adıyla kontrol edildiği için tek oktav yeterli;
// tuşlar iki kat geniş olur ve yanlış basma azalır.
const QUIZ_WHITE_KEYS = [
  { note: "Do", octave: 4 },
  { note: "Re", octave: 4 },
  { note: "Mi", octave: 4 },
  { note: "Fa", octave: 4 },
  { note: "Sol", octave: 4 },
  { note: "La", octave: 4 },
  { note: "Si", octave: 4 },
]

const QUIZ_BLACK_KEYS = [
  { note: "Do#", whiteIdx: 0 },
  { note: "Re#", whiteIdx: 1 },
  { note: "Fa#", whiteIdx: 3 },
  { note: "Sol#", whiteIdx: 4 },
  { note: "La#", whiteIdx: 5 },
]

export function QuizPiano({
  onAnswer,
  correctAnswer,
  answerState,
  selectedNote,
  showLabels,
  hintNote,
  tall,
  octaves = 1,
  startOctave,
  octaveMode = false,
}: {
  startOctave?: number // klavyenin ilk oktavı
  octaveMode?: boolean // cevap oktavıyla birlikte ("Do4"); doğru/seçili tuşlar da oktavlı
  octaves?: number // yan ekranda/geniş ekranda daha çok oktav
  hintNote?: string
  tall?: boolean // yan ekranda tuşlar uzun
  onAnswer: (n: string) => void
  correctAnswer?: string
  answerState: AnswerState
  selectedNote?: string
  showLabels: boolean
}) {
  const disabled = answerState !== "pending"
  const startOct = startOctave ?? (octaves >= 2 ? 3 : 4)
  const whites = Array.from({ length: octaves }, (_, o) =>
    QUIZ_WHITE_KEYS.map((k) => ({ ...k, octave: startOct + o })),
  ).flat()
  const blacks = Array.from({ length: octaves }, (_, o) =>
    QUIZ_BLACK_KEYS.map((k) => ({ ...k, whiteIdx: k.whiteIdx + 7 * o })),
  ).flat()
  const totalW = whites.length
  const wkWidthPct = 100 / totalW

  function keyState(noteName0: string, oct: number): KeyState {
    const noteName = octaveMode ? `${noteName0}${oct}` : noteName0
    if (answerState === "pending") return hintNote && noteName === hintNote ? "hint" : "idle"
    if (noteName === selectedNote) return answerState === "correct" ? "correct" : "wrong"
    if (answerState === "wrong" && noteName === correctAnswer) return "reveal"
    return "idle"
  }

  return (
    <div
      data-no-swipe
      style={{
        position: "relative",
        width: "100%",
        height: tall ? "clamp(120px, 38vh, 190px)" : "clamp(120px, 21vh, 190px)",
        userSelect: "none",
      }}
    >
      {/* White keys */}
      <div style={{ position: "absolute", inset: 0, display: "flex" }}>
        {whites.map((key) => {
          const st = keyState(key.note, key.octave)
          return (
            <button
              key={`w-${key.note}-${key.octave}`}
              disabled={disabled}
              aria-label={octaveMode && key.note === "Do" && key.octave === 4 ? "Orta Do tuşu" : `${key.note} tuşu`}
              onClick={() => {
                playPianoNote(key.note, key.octave)
                if (!disabled) {
                  hapticTap()
                  onAnswer(octaveMode ? `${key.note}${key.octave}` : key.note)
                }
              }}
              style={{
                flex: 1,
                height: "100%",
                borderRadius: "0 0 8px 8px",
                cursor: disabled ? "default" : "pointer",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "center",
                paddingBottom: 8,
                position: "relative",
                transition: "filter 0.06s",
                ...whiteKeyStyle(st),
              }}
            >
              {octaveMode && key.note === "Do" && !showLabels && (
                <span
                  style={{
                    position: "absolute",
                    bottom: 6,
                    left: 0,
                    right: 0,
                    textAlign: "center",
                    fontSize: key.octave === 4 ? 11 : 12,
                    fontWeight: font.weight.heavy,
                    color: pianoColors.ivoryLabel,
                    pointerEvents: "none",
                    lineHeight: 1.1,
                  }}
                >
                  {key.octave === 4 ? (
                    <>
                      Orta
                      <br />
                      Do
                    </>
                  ) : (
                    `Do${key.octave}`
                  )}
                </span>
              )}
              {showLabels && (
                <span
                  style={{
                    fontSize: font.size.sm,
                    fontWeight: font.weight.bold,
                    color: keyLabelColor(st, false),
                    fontFamily: font.family.ui,
                    lineHeight: 1,
                  }}
                >
                  {octaveMode && key.note === "Do" ? (key.octave === 4 ? "Orta Do" : `Do${key.octave}`) : key.note}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Black keys */}
      {blacks.map((bk, bi) => {
        const st = keyState(bk.note, whites[bk.whiteIdx].octave)
        const leftPct = (bk.whiteIdx + 1) * wkWidthPct - wkWidthPct * 0.32
        const isOctaveStart4 = false
        return (
          <button
            key={`b-${bk.note}-${bi}`}
            disabled={disabled}
            aria-label={`${bk.note} tuşu`}
            onClick={() => {
              playPianoNote(bk.note, whites[bk.whiteIdx].octave)
              if (!disabled) {
                hapticTap()
                onAnswer(octaveMode ? `${bk.note}${whites[bk.whiteIdx].octave}` : bk.note)
              }
            }}
            style={{
              position: "absolute",
              top: 0,
              left: `${leftPct}%`,
              width: `${wkWidthPct * 0.62}%`,
              height: "62%",
              borderRadius: "0 0 6px 6px",
              cursor: disabled ? "default" : "pointer",
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              alignItems: "center",
              paddingBottom: 6,
              transition: "filter 0.06s",
              borderLeft: isOctaveStart4 ? "1px solid rgba(124,58,237,0.3)" : undefined,
              ...blackKeyStyle(st),
            }}
          >
            {showLabels && (
              <span
                style={{
                  fontSize: font.size.sm,
                  fontWeight: font.weight.semibold,
                  color: keyLabelColor(st, true),
                  fontFamily: font.family.ui,
                  lineHeight: 1,
                }}
              >
                {bk.note.replace("#", "♯")}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
