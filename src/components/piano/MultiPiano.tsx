// Akor klavyesi: 2 oktav, birden çok tuş seçilebilir
import { blackKeyStyle, keyLabelColor, whiteKeyStyle, type KeyState } from "../../design/piano"
import { playPianoNote } from "../../utils/audio"
import { PC_KEY, type Chord } from "../../data/chords"

import { font, palette } from "../../design/tokens"

// Klavye Do3–Si4 arası: kök 3. oktavda olacak şekilde yerleştir
const KB_LOW = 48 // Do3

export function litKeys(c: Chord): Set<string> {
  return new Set(
    c.semis.map((semi) => {
      const abs = KB_LOW + c.rootPc + semi
      return `${PC_KEY[abs % 12]}${Math.floor(abs / 12) - 1}`
    }),
  )
}

export function fitsKeyboard(c: Chord) {
  return KB_LOW + c.rootPc + Math.max(...c.semis) <= KB_LOW + 23
}

// ─── Multi-select mini piano ──────────────────────────────────────────────────
const W_KEYS = [
  { n: "Do", o: 3 },
  { n: "Re", o: 3 },
  { n: "Mi", o: 3 },
  { n: "Fa", o: 3 },
  { n: "Sol", o: 3 },
  { n: "La", o: 3 },
  { n: "Si", o: 3 },
  { n: "Do", o: 4 },
  { n: "Re", o: 4 },
  { n: "Mi", o: 4 },
  { n: "Fa", o: 4 },
  { n: "Sol", o: 4 },
  { n: "La", o: 4 },
  { n: "Si", o: 4 },
]

const B_KEYS = [
  { n: "Do#", wi: 0 },
  { n: "Re#", wi: 1 },
  { n: "Fa#", wi: 3 },
  { n: "Sol#", wi: 4 },
  { n: "La#", wi: 5 },
  { n: "Do#", wi: 7 },
  { n: "Re#", wi: 8 },
  { n: "Fa#", wi: 10 },
  { n: "Sol#", wi: 11 },
  { n: "La#", wi: 12 },
]

const TW = W_KEYS.length

export function MultiPiano({
  selected,
  onToggle,
  disabled,
  correctKeys,
  showResult,
  lit,
}: {
  selected: Set<string>
  onToggle: (n: string, o: number) => void
  disabled: boolean
  correctKeys: string[]
  showResult: boolean
  lit?: Set<string> // belirli oktavdaki tuşlar, ör. "Do3" (sadece gösterim)
}) {
  function whiteState(noteName: string, oct?: number) {
    const sel = lit ? lit.has(`${noteName}${oct}`) : selected.has(noteName)
    if (showResult) {
      if (correctKeys.includes(noteName)) return "correct"
      if (sel) return "wrong"
    }
    if (sel) return "selected"
    return "idle"
  }

  function blackState(noteName: string, oct?: number) {
    const sel = lit ? lit.has(`${noteName}${oct}`) : selected.has(noteName)
    if (showResult) {
      if (correctKeys.includes(noteName)) return "correct"
      if (sel) return "wrong"
    }
    if (sel) return "selected"
    return "idle"
  }

  return (
    <div data-no-swipe style={{ position: "relative", width: "100%", height: 148, userSelect: "none" }}>
      {/* White keys */}
      <div style={{ position: "absolute", inset: 0, display: "flex" }}>
        {W_KEYS.map((key, i) => {
          const st = whiteState(key.n, key.o)
          return (
            <button
              key={`w${i}`}
              disabled={disabled}
              onClick={() => {
                playPianoNote(key.n, key.o)
                if (!disabled) onToggle(key.n, key.o)
              }}
              style={{
                flex: 1,
                height: "100%",
                borderRadius: "0 0 8px 8px",
                ...whiteKeyStyle(st as KeyState),
                borderColor: st === "idle" ? palette.slate800 : undefined,
                cursor: disabled ? "default" : "pointer",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "center",
                paddingBottom: 6,
                transition: "all 0.1s",
                outline: "none",
                position: "relative",
              }}
            >
              {/* Selection dot */}
              {st === "selected" && (
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: palette.violet500,
                    boxShadow: `0 0 6px ${palette.violet500}`,
                    marginBottom: 2,
                  }}
                />
              )}
              {/* Key label (always for Do at oct boundary) */}
              {key.n === "Do" && (
                <span
                  style={{
                    fontSize: font.size.xs,
                    fontWeight: font.weight.bold,
                    color: keyLabelColor(st as KeyState, false),
                    fontFamily: font.family.ui,
                    position: "absolute",
                    bottom: 4,
                  }}
                >
                  {key.o === 3 ? "Do3" : "Do4"}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Black keys */}
      {B_KEYS.map((bk, bi) => {
        const st = blackState(bk.n, W_KEYS[bk.wi].o)
        return (
          <button
            key={`b${bi}`}
            disabled={disabled}
            onClick={() => {
              playPianoNote(bk.n, W_KEYS[bk.wi].o)
              if (!disabled) onToggle(bk.n, W_KEYS[bk.wi].o)
            }}
            style={{
              position: "absolute",
              top: 0,
              left: `${(bk.wi + 1) * (100 / TW) - (100 / TW) * 0.32}%`,
              width: `${(100 / TW) * 0.62}%`,
              height: "62%",
              borderRadius: "0 0 5px 5px",
              ...blackKeyStyle(st as KeyState),
              zIndex: 2,
              cursor: disabled ? "default" : "pointer",
              transition: "all 0.1s",
            }}
          />
        )
      })}

      {/* Octave markers */}
      <div style={{ position: "absolute", bottom: -16, left: 0, right: 0, display: "flex", pointerEvents: "none" }}>
        <div
          style={{
            flex: 7,
            textAlign: "center",
            fontSize: font.size.xs,
            color: palette.slate700,
            fontFamily: font.family.mono,
          }}
        >
          3. Oktav
        </div>
        <div
          style={{
            flex: 7,
            textAlign: "center",
            fontSize: font.size.xs,
            color: palette.slate700,
            fontFamily: font.family.mono,
          }}
        >
          4. Oktav
        </div>
      </div>
    </div>
  )
}
