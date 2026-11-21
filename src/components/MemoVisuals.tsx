// Ezberle kartlarındaki görseller: nota ağacı, suslar, noktalı notalar, akor formülleri.
import { pianoColors } from "../design/piano"
// Çalışma > Ezberle için görsel kartlar: ritim (nota ağacı, pizza, sus, noktalı nota,
// ölçü örnekleri) ve akor (klavyede aralıklar).
import Notation from "./Notation"
import { playPianoNote } from "../utils/audio"
import { effectiveChordLevel } from "../utils/settings"
import { PC_KEY } from "../data/chords"

import { colors, font, palette, radius } from "../design/tokens"
const FONT = font.family.ui
const card = {
  background: colors.surface,
  borderRadius: radius.lg,
  padding: "14px 14px 16px",
  border: `1px solid ${colors.border}`,
} as const
const title = { color: colors.text, fontSize: font.size.md, fontWeight: font.weight.bold, fontFamily: FONT } as const
const sub = { color: colors.textMuted, fontSize: font.size.sm, fontFamily: FONT, lineHeight: 1.5 } as const

// ─── Ritim ────────────────────────────────────────────────────────────────────
const VALUES = [
  { kind: "whole", n: 1, name: "Birlik", beats: "4", rest: "wr", note: "w", color: palette.violet500 },
  { kind: "half", n: 2, name: "İkilik", beats: "2", rest: "hr", note: "h", color: palette.blue500 },
  { kind: "quarter", n: 4, name: "Dörtlük", beats: "1", rest: "qr", note: "q", color: palette.cyan500 },
  { kind: "eighth", n: 8, name: "Sekizlik", beats: "½", rest: "er", note: "e", color: palette.amber500 },
  { kind: "sixteenth", n: 16, name: "Onaltılık", beats: "¼", rest: "sr", note: "s", color: palette.pink500 },
]

function NoteGlyph({ kind, color, w = 22 }: { kind: string; color: string; w?: number }) {
  const hollow = kind === "whole" || kind === "half"
  const stem = kind !== "whole"
  const flags = kind === "eighth" ? 1 : kind === "sixteenth" ? 2 : 0
  return (
    <svg width={w} height={w * 1.18} viewBox="0 0 34 40" aria-hidden>
      <ellipse
        cx={13}
        cy={31}
        rx={8}
        ry={5.5}
        transform="rotate(-20 13 31)"
        fill={hollow ? "none" : color}
        stroke={color}
        strokeWidth={2.6}
      />
      {stem && <line x1={20.5} y1={29} x2={20.5} y2={4} stroke={color} strokeWidth={2.4} />}
      {Array.from({ length: flags }, (_, i) => (
        <path
          key={i}
          d={`M20.5 ${4 + i * 7} C 27 ${10 + i * 7}, 29 ${16 + i * 7}, 26 ${22 + i * 7}`}
          fill="none"
          stroke={color}
          strokeWidth={2.4}
        />
      ))}
    </svg>
  )
}

// Nota ağacı: her satır bir öncekinin iki katı nota, toplam süre aynı
export function NoteTree() {
  return (
    <div style={card}>
      <p style={title}>Nota ağacı</p>
      <p style={{ ...sub, marginBottom: 10 }}>
        Her satırın toplam süresi aynı: 4 vuruş. Aşağı indikçe nota sayısı ikiye katlanır.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {VALUES.map((v) => (
          <div key={v.kind} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 74,
                flexShrink: 0,
                color: v.color,
                fontSize: font.size.sm,
                fontWeight: font.weight.bold,
                fontFamily: FONT,
              }}
            >
              {v.n} {v.name.toLocaleLowerCase("tr")}
            </span>
            <div style={{ flex: 1, minWidth: 0, display: "flex", gap: v.n >= 16 ? 1 : 2 }}>
              {Array.from({ length: v.n }, (_, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    height: 34,
                    borderRadius: radius.xs,
                    background: `${v.color}1f`,
                    border: `1px solid ${v.color}55`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  <NoteGlyph kind={v.kind} color={v.color} w={v.n >= 16 ? 11 : v.n >= 8 ? 16 : 22} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function RestsCard() {
  return (
    <div style={card}>
      <p style={title}>Sus işaretleri</p>
      <p style={{ ...sub, marginBottom: 6 }}>Her notanın aynı süren bir susu var.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4, textAlign: "center" }}>
        {VALUES.map((v) => (
          <div key={v.kind}>
            <Notation score={v.rest} maxW={64} />
            <p style={{ color: v.color, fontSize: font.size.xs, fontWeight: font.weight.bold, fontFamily: FONT }}>
              {v.name}
            </p>
            <p style={{ color: colors.textMuted, fontSize: font.size.xs, fontFamily: FONT }}>{v.beats} vuruş</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DottedCard() {
  return (
    <div style={card}>
      <p style={title}>Noktalı nota</p>
      <p style={sub}>Nokta, notaya kendi yarısı kadar süre ekler.</p>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Notation score="h. = h + q" maxW={200} />
      </div>
      <p style={{ ...sub, textAlign: "center", marginTop: -6 }}>
        Noktalı ikilik = 2 + 1 = <b style={{ color: colors.violetText }}>3 vuruş</b> · Noktalı dörtlük ={" "}
        <b style={{ color: colors.violetText }}>1½ vuruş</b>
      </p>
    </div>
  )
}

// ─── Akor: klavyede aralıklar ─────────────────────────────────────────────────
const WHITE_OF_PC: Record<number, number> = { 0: 0, 2: 1, 4: 2, 5: 3, 7: 4, 9: 5, 11: 6 }
const BLACK_PCS = [1, 3, 6, 8, 10]
const BLACK_AFTER: Record<number, number> = { 1: 0, 3: 1, 6: 3, 8: 4, 10: 5 }
const TR_PC = ["Do", "Do#", "Re", "Mi♭", "Mi", "Fa", "Fa#", "Sol", "La♭", "La", "Si♭", "Si"]

// semis: Do'dan uzaklık (0–23). gaps: aradaki yarım ses sayılarını göster
export function KeyIntervals({
  semis,
  color,
  names,
  gaps = true,
  skip = [],
  octaves: octIn,
}: {
  semis: number[]
  color: string
  names?: string[]
  gaps?: boolean
  skip?: number[]
  octaves?: 1 | 2
}) {
  const octaves = octIn ?? (Math.max(...semis) >= 12 ? 2 : 1)
  const nW = 7 * octaves
  const W = 320
  const kw = W / nW
  const top = gaps ? 30 : 6
  const H = 74
  const xOf = (semi: number) => {
    const o = Math.floor(semi / 12)
    const pc = semi % 12
    return pc in WHITE_OF_PC ? (o * 7 + WHITE_OF_PC[pc] + 0.5) * kw : (o * 7 + BLACK_AFTER[pc] + 1) * kw
  }
  const lit = new Set(semis)
  const play = () =>
    semis.forEach((s, i) => setTimeout(() => playPianoNote(PC_KEY[s % 12], 4 + Math.floor(s / 12)), i * 200))
  return (
    <button
      onClick={play}
      aria-label="Akoru dinle"
      style={{ display: "block", width: "100%", padding: 0, background: "none", border: "none", cursor: "pointer" }}
    >
      <svg viewBox={`0 0 ${W} ${top + H + 2}`} style={{ width: "100%", display: "block" }}>
        {Array.from({ length: nW }, (_, i) => {
          const pc = [0, 2, 4, 5, 7, 9, 11][i % 7]
          const semi = Math.floor(i / 7) * 12 + pc
          const on = lit.has(semi)
          const idx = semis.indexOf(semi)
          return (
            <g key={i}>
              <rect
                x={i * kw + 0.5}
                y={top}
                width={kw - 1}
                height={H}
                rx={3}
                fill={on ? color : palette.slate50}
                stroke={palette.slate400}
                strokeWidth={0.8}
              />
              {on && (
                <text
                  x={(i + 0.5) * kw}
                  y={top + H - 7}
                  textAnchor="middle"
                  fontSize={octaves === 1 ? 13 : 11}
                  fontWeight="800"
                  fill={palette.slate900}
                  style={{ fontFamily: FONT }}
                >
                  {names?.[idx] ?? TR_PC[pc]}
                </text>
              )}
              {skip.includes(semi) && (
                <text
                  x={(i + 0.5) * kw}
                  y={top + H - 7}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="700"
                  fill={palette.slate400}
                  style={{ fontFamily: FONT }}
                >
                  atla
                </text>
              )}
            </g>
          )
        })}
        {Array.from({ length: octaves }, (_, o) =>
          BLACK_PCS.map((pc) => {
            const semi = o * 12 + pc
            const on = lit.has(semi)
            const x = (o * 7 + BLACK_AFTER[pc] + 1) * kw
            const idx = semis.indexOf(semi)
            return (
              <g key={`${o}-${pc}`}>
                <rect
                  x={x - kw * 0.3}
                  y={top}
                  width={kw * 0.6}
                  height={H * 0.6}
                  rx={2}
                  fill={on ? color : pianoColors.diagramBlack}
                  stroke={on ? palette.white : "none"}
                  strokeWidth={1}
                />
                {on && (
                  <text
                    x={x}
                    y={top + H * 0.6 - 5}
                    textAnchor="middle"
                    fontSize={octaves === 1 ? 11 : 9}
                    fontWeight="800"
                    fill={palette.white}
                    style={{ fontFamily: FONT }}
                  >
                    {(names?.[idx] ?? TR_PC[pc]).replace(/[#♭]$/, (m) => m)}
                  </text>
                )}
              </g>
            )
          }),
        )}
        {gaps &&
          semis.slice(1).map((s, i) => {
            const x1 = xOf(semis[i])
            const x2 = xOf(s)
            const mid = (x1 + x2) / 2
            return (
              <g key={"g" + i}>
                <path
                  d={`M ${x1} ${top - 2} Q ${mid} ${top - 26} ${x2} ${top - 2}`}
                  fill="none"
                  stroke={color}
                  strokeWidth={1.8}
                />
                <rect
                  x={mid - 9}
                  y={top - 25}
                  width={18}
                  height={15}
                  rx={7}
                  fill={palette.slate900}
                  stroke={color}
                  strokeWidth={1}
                />
                <text
                  x={mid}
                  y={top - 13.5}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="800"
                  fill={color}
                  style={{ fontFamily: FONT }}
                >
                  {s - semis[i]}
                </text>
              </g>
            )
          })}
      </svg>
    </button>
  )
}

function ChordRow({
  name,
  sym,
  semis,
  names,
  color,
  note,
}: {
  name: string
  sym: string
  semis: number[]
  names: string[]
  color: string
  note?: string
}) {
  return (
    <div style={{ marginTop: 10 }}>
      <div
        style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginBottom: 2 }}
      >
        <span style={{ color, fontSize: font.size.md, fontWeight: font.weight.heavy, fontFamily: FONT }}>
          {name} <span style={{ fontSize: font.size.xs, fontFamily: font.family.mono, opacity: 0.8 }}>{sym}</span>
        </span>
        {note && <span style={{ color: colors.textMuted, fontSize: font.size.xs, fontFamily: FONT }}>{note}</span>}
      </div>
      <KeyIntervals semis={semis} color={color} names={names} />
    </div>
  )
}

// Formül satırı: ad, sembol, yarım ses aralıkları ve Do'dan örnek
function FormulaRow({
  name,
  sym,
  gaps,
  notes,
  color,
}: {
  name: string
  sym: string
  gaps: string
  notes: string
  color: string
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: "2px 8px",
        padding: "10px 0",
        borderTop: `1px solid ${colors.border}`,
      }}
    >
      <span style={{ color, fontSize: font.size.md, fontWeight: font.weight.bold, fontFamily: FONT }}>
        {name} <span style={{ fontSize: font.size.xs, fontFamily: font.family.mono, opacity: 0.8 }}>{sym}</span>
      </span>
      <span
        style={{
          color: colors.textSoft,
          fontSize: font.size.sm,
          fontWeight: font.weight.bold,
          fontFamily: font.family.mono,
          textAlign: "right",
        }}
      >
        {gaps}
      </span>
      <span style={{ gridColumn: "1 / -1", color: colors.textMuted, fontSize: font.size.sm, fontFamily: FONT }}>
        {notes}
      </span>
    </div>
  )
}

export function ChordMemoVisual() {
  const lv = effectiveChordLevel()
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={card}>
        <p style={title}>Majör ve minör</p>
        <p style={sub}>Kökten başla, birer tuş atlayarak üç nota bas. Kemerdeki sayı iki nota arasındaki yarım ses.</p>
        <ChordRow
          name="Do majör"
          sym="C"
          semis={[0, 4, 7]}
          names={["Do", "Mi", "Sol"]}
          color={palette.violet500}
          note="4 + 3 · parlak"
        />
        <ChordRow
          name="Do minör"
          sym="Cm"
          semis={[0, 3, 7]}
          names={["Do", "Mi♭", "Sol"]}
          color={palette.red400}
          note="3 + 4 · hüzünlü"
        />
      </div>

      <div style={card}>
        <p style={title}>Formüller</p>
        <p style={{ ...sub, marginBottom: 4 }}>Her kökte aynı sayıları say. Örnekler Do'dan.</p>
        <FormulaRow name="Majör" sym="C" gaps="4 + 3" notes="Do – Mi – Sol" color={palette.violet500} />
        <FormulaRow name="Minör" sym="Cm" gaps="3 + 4" notes="Do – Mi♭ – Sol" color={palette.red400} />
        {lv >= 3 && (
          <>
            <FormulaRow
              name="Majör 7"
              sym="Cmaj7"
              gaps="4 + 3 + 4"
              notes="Do – Mi – Sol – Si"
              color={palette.blue400}
            />
            <FormulaRow
              name="Dominant 7"
              sym="C7"
              gaps="4 + 3 + 3"
              notes="Do – Mi – Sol – Si♭"
              color={palette.amber500}
            />
            <FormulaRow
              name="Minör 7"
              sym="Cm7"
              gaps="3 + 4 + 3"
              notes="Do – Mi♭ – Sol – Si♭"
              color={palette.green400}
            />
          </>
        )}
        {lv >= 4 && (
          <>
            <FormulaRow name="Eksik" sym="Cdim" gaps="3 + 3" notes="Do – Mi♭ – Sol♭" color={palette.orange400} />
            <FormulaRow name="Artık" sym="Caug" gaps="4 + 4" notes="Do – Mi – Sol#" color={palette.pink500} />
            <FormulaRow
              name="Yarı eksik"
              sym="Cm7♭5"
              gaps="3 + 3 + 4"
              notes="Do – Mi♭ – Sol♭ – Si♭"
              color={palette.violet400}
            />
            <FormulaRow
              name="Eksik 7"
              sym="Cdim7"
              gaps="3 + 3 + 3"
              notes="Do – Mi♭ – Sol♭ – Si♭♭"
              color={palette.orange500}
            />
            <FormulaRow
              name="sus2 / sus4"
              sym="Csus2 · Csus4"
              gaps="2 + 5 · 5 + 2"
              notes="Do – Re – Sol · Do – Fa – Sol"
              color={palette.cyan400}
            />
            <FormulaRow
              name="9'lu / 13'lü"
              sym="C9 · C13"
              gaps="dom. 7 + 9 · + 13"
              notes="Do – Mi – Sol – Si♭ – Re · Do – Mi – Si♭ – La"
              color={palette.amber400}
            />
          </>
        )}
        {lv >= 2 && (
          <p style={{ ...sub, marginTop: 8 }}>Kök siyah tuş olsa da aynı: Re♭ majör = Re♭ – Fa – La♭ (4 + 3).</p>
        )}
      </div>

      <div style={card}>
        <p style={title}>Yarım ses</p>
        <p style={sub}>
          Yan yana iki tuş arası 1 yarım ses. Mi–Fa ve Si–Do arasında siyah tuş yok, aralarında da 1 yarım ses var.
        </p>
      </div>
    </div>
  )
}
