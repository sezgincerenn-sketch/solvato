// Tek nota portesi (soru ekranı): anahtar, nota, ek çizgiler, diyez/bemol. Ritim ve terim gösterimleri de burada.
import Glyph, { glyphWidth } from "./Glyph"
import Notation from "./Notation"

import { colors, font, palette } from "../design/tokens"
interface MusicalStaffProps {
  clef: "treble" | "bass"
  noteY: number
  ledgerLines: number[]
  noteName?: string
  showLabel?: boolean
  accidental?: "sharp" | "flat"
  feedback?: "correct" | "wrong" | null // cevap sonrası nota renk ve hareketi
}

// SVG coordinate system: staff lines at y=40,50,60,70,80 (line 5 to line 1)
// Note x position: 145
const NOTE_X = 145
const STAFF_X1 = 14
const STAFF_X2 = 196
const LINE_COLOR = colors.staffLine
const NOTE_COLOR = colors.notation

function NoteHead({ y }: { y: number }) {
  // Bravura nota başı: genişliği ~11.8 birim, ortası NOTE_X
  return <Glyph name="noteheadBlack" x={NOTE_X - 5.9} y={y} />
}

function Stem({ noteY }: { noteY: number }) {
  // Orta çizginin (y=60) altındaki notalarda sap yukarı ve sağda; orta çizgi ve üstünde aşağı ve solda
  const stemUp = noteY > 60
  // Ek çizgideki notalarda sap orta çizgiye kadar uzar
  if (stemUp) {
    const top = Math.min(noteY - 35, 60)
    return <line x1={NOTE_X + 5.3} y1={noteY - 1.5} x2={NOTE_X + 5.3} y2={top} stroke={NOTE_COLOR} strokeWidth={1.3} />
  }
  const bottom = Math.max(noteY + 35, 60)
  return <line x1={NOTE_X - 5.3} y1={noteY + 1.5} x2={NOTE_X - 5.3} y2={bottom} stroke={NOTE_COLOR} strokeWidth={1.3} />
}

function TrebleClef() {
  // Sol anahtarı: çıkış noktası Sol çizgisi (2. çizgi, y=70)
  return <Glyph name="gClef" x={20} y={70} />
}

function BassClef() {
  // Fa anahtarı: çıkış noktası Fa çizgisi (4. çizgi, y=50); iki nokta bu çizginin iki yanında
  return <Glyph name="fClef" x={20} y={50} />
}

// Diyez / bemol işareti, nota başının solunda
function AccidentalSign({ y, kind }: { y: number; kind: "sharp" | "flat" }) {
  const name = kind === "sharp" ? "accidentalSharp" : "accidentalFlat"
  return <Glyph name={name} x={NOTE_X - 5.9 - 4 - glyphWidth(name)} y={y} />
}

export default function MusicalStaff({
  clef,
  noteY,
  ledgerLines,
  showLabel,
  accidental,
  feedback,
  maxHeight,
}: MusicalStaffProps & { maxHeight?: number }) {
  const staffLines = [40, 50, 60, 70, 80]
  // Ek çizgili notalarda porte üstte/altta yer açar
  const top = Math.min(0, noteY - 42)
  const bottom = Math.max(130, noteY + 44)

  return (
    <div className="flex flex-col items-center w-full">
      <svg
        viewBox={`0 ${top} 210 ${bottom - top}`}
        className={maxHeight ? undefined : "w-full max-w-sm"}
        style={{
          ...(maxHeight ? { height: maxHeight, width: "auto", maxWidth: "100%" } : {}),
          filter: "var(--notation-shadow, drop-shadow(0 0 8px rgba(139,92,246,0.15)))",
        }}
        aria-label="Müzik portesi"
      >
        {/* Staff lines */}
        {staffLines.map((y) => (
          <line
            key={y}
            x1={STAFF_X1}
            y1={y}
            x2={STAFF_X2}
            y2={y}
            stroke={LINE_COLOR}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        ))}

        {/* Clef symbol */}
        {clef === "treble" ? <TrebleClef /> : <BassClef />}

        {/* Ledger lines */}
        {ledgerLines.map((ly) => (
          <line
            key={ly}
            x1={NOTE_X - 11}
            y1={ly}
            x2={NOTE_X + 11}
            y2={ly}
            stroke={LINE_COLOR}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        ))}

        {/* Nota (işaret + baş + sap): cevap sonrası renk ve hareket */}
        <g
          className={feedback === "correct" ? "note-bounce" : feedback === "wrong" ? "note-wobble" : undefined}
          style={{
            transformBox: "fill-box",
            transformOrigin: "center",
            ...(feedback === "correct"
              ? ({ "--notation": palette.green400 } as React.CSSProperties)
              : feedback === "wrong"
                ? ({ "--notation": palette.red400 } as React.CSSProperties)
                : {}),
          }}
        >
          {accidental && <AccidentalSign y={noteY} kind={accidental} />}
          <NoteHead y={noteY} />
          <Stem noteY={noteY} />
        </g>

        {/* Clef label (small) */}
        {showLabel && (
          <text
            x="13"
            y="118"
            fontSize="9"
            fill="var(--staff-label, rgba(160,160,200,0.7))"
            style={{ fontFamily: font.family.ui }}
          >
            {clef === "treble" ? "Sol Anahtarı" : "Fa Anahtarı"}
          </text>
        )}
      </svg>
    </div>
  )
}

// ─── Rhythm symbol display ───────────────────────────────────────────────────
// Tek nota / sus soruları Notation (Bravura sembolleri) ile çizilir
const RHYTHM_SCORE: Record<string, string> = {
  whole: "w",
  half: "h",
  quarter: "q",
  eighth: "e",
  sixteenth: "s",
  whole_rest: "wr",
  half_rest: "hr",
  quarter_rest: "qr",
  eighth_rest: "er",
  sixteenth_rest: "sr",
}

export function RhythmDisplay({ rhythmType, displayText }: { rhythmType: string; displayText?: string }) {
  const score = RHYTHM_SCORE[rhythmType] ?? (displayText && /^\d+\/\d+$/.test(displayText) ? `ts:${displayText}` : null)
  if (score)
    return (
      <div className="flex justify-center w-full" style={{ padding: "0 12px" }}>
        <Notation score={score} maxW={220} />
      </div>
    )
  return (
    <div className="flex items-center justify-center w-full" style={{ minHeight: 110 }}>
      <span
        style={{ fontSize: font.size.xl, fontWeight: font.weight.bold, color: NOTE_COLOR, fontFamily: font.family.ui }}
      >
        {displayText}
      </span>
    </div>
  )
}

// ─── Terms display ───────────────────────────────────────────────────────────
export function TermDisplay({ displayText }: { displayText: string }) {
  const isShort = displayText.length <= 4
  return (
    <div className="flex items-center justify-center h-32 w-full">
      <span
        className="text-center select-none"
        style={{
          fontSize: isShort ? "4.5rem" : "2.4rem",
          fontFamily: font.family.serif,
          fontStyle: "italic",
          fontWeight: font.weight.regular,
          color: colors.termSymbol,
          textShadow: "var(--term-shadow, 0 0 24px rgba(139,92,246,0.4))",
          lineHeight: 1.1,
        }}
      >
        {displayText}
      </span>
    </div>
  )
}
