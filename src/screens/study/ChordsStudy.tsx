// Çalışma › Akorlar: akor kartları ve seviye filtreleri
import { Segmented } from "../../ui"
import { pianoColors } from "../../design/piano"
import { useState } from "react"
import { playPianoNote } from "../../utils/audio"
import Icon from "../../components/Icons"
import { effectiveChordLevel } from "../../utils/settings"
import ChordStaffSvg from "../../components/ChordStaffSvg"
import { useTablet } from "../../utils/orientation"
import {
  ALL_CHORDS,
  staffY,
  PC_KEY,
  progressionsFor,
  QUALITY_COLOR,
  CHORD_LEVEL_LABELS,
  type Chord,
} from "../../data/chords"

import { alpha, colors, font, palette, radius } from "../../design/tokens"
import { NOTE_COLORS } from "./shared"

// ─── Chord database ───────────────────────────────────────────────────────────
interface ChordDef {
  id: string
  root: string // e.g. 'C'
  rootTR: string // Turkish: 'Do'
  name: string // 'Major'
  nameTR: string // 'Majör'
  fullName: string // 'C Major (Do Majör)'
  formula: string // 'Kök + Majör 3lü + Minör 3lü'
  formulaEN: string // 'Root + Major 3rd + Minor 3rd'
  fingering: string // '1 – 3 – 5'
  notes: string[] // ['Do', 'Mi', 'Sol']
  noteYs: number[] // staff y coords (treble)
  pianoKeys: string[] // which white/black keys glow
  interval: string // semitone formula
  progressions: string[]
  color: string
  octaves: number[] // playback octaves per note
  playKeys: string[] // çalma için tuş adları (Re♭ → Do#)
  level: number
  src: Chord
}

// Kökten yarım ses uzaklığına göre aralığın adı
function intervalName(semi: number, quality: string): string {
  if (semi === 9 && quality === "dim7") return "eksik 7'li"
  const names: Record<number, string> = {
    0: "Kök",
    2: "2'li",
    3: "küçük 3'lü",
    4: "büyük 3'lü",
    5: "4'lü",
    6: "eksik 5'li",
    7: "5'li",
    8: "artık 5'li",
    9: "6'lı",
    10: "küçük 7'li",
    11: "büyük 7'li",
    14: "9'lu",
    21: "13'lü",
  }
  return names[semi] ?? ""
}

const SHORT_FORMULA: Record<string, string> = {
  maj: "Kök + büyük 3'lü + küçük 3'lü",
  min: "Kök + küçük 3'lü + büyük 3'lü",
  maj7: "Majör + büyük 7'li",
  "7": "Majör + küçük 7'li",
  m7: "Minör + küçük 7'li",
  dim: "İki küçük 3'lü",
  aug: "İki büyük 3'lü",
  m7b5: "Eksik + küçük 7'li",
  dim7: "Üç küçük 3'lü",
  sus2: "3'lü yerine 2'li",
  sus4: "3'lü yerine 4'lü",
  "9": "Dominant 7 + 9'lu",
  "13": "Dominant 7 + 13'lü",
}

// Çalışma kartları, sorulardaki akor listesinden üretilir (4 seviye, 94 akor)
function toDef(c: Chord): ChordDef {
  const [rootTR] = c.name.split(" ")
  const quality = c.name.slice(rootTR.length + 1)
  const gaps = c.semis.slice(1).map((s, i) => s - c.semis[i])
  return {
    id: c.id,
    root: c.symbol.replace(/(maj7|m7♭5|dim7|dim|aug|sus2|sus4|m7|m|7|9|13)$/, ""),
    rootTR,
    name: c.symbol,
    nameTR: quality.charAt(0).toLocaleUpperCase("tr") + quality.slice(1),
    fullName: c.label,
    formula: c.formula,
    formulaEN: SHORT_FORMULA[c.quality] ?? c.formula,
    fingering: ["1 – 3 – 5", "1 – 2 – 3 – 5", "1 – 2 – 3 – 4 – 5"][Math.min(c.notes.length - 3, 2)] ?? "",
    interval: gaps.join(" + ") + " yarım ses",
    notes: c.noteNames,
    noteYs: c.notes.map(staffY),
    pianoKeys: c.keys,
    progressions: progressionsFor(c),
    color: QUALITY_COLOR[c.quality] ?? palette.violet500,
    octaves: c.notes.map((n) => n.octave),
    playKeys: c.notes.map((n) => PC_KEY[n.pc]),
    level: c.level,
    src: c,
  }
}

const CHORD_DB: ChordDef[] = ALL_CHORDS.map(toDef)

// Mini piano strip highlighting chord keys
function ChordPianoStrip({
  activeKeys,
  labels,
  color,
}: {
  activeKeys: string[]
  labels?: Record<string, string> // tuş adı → akordaki yazımı (Re# → Mi♭)
  color: string
}) {
  const WHITE = ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"]
  const BLACK: { note: string; afterIdx: number }[] = [
    { note: "Do#", afterIdx: 0 },
    { note: "Re#", afterIdx: 1 },
    { note: "Fa#", afterIdx: 3 },
    { note: "Sol#", afterIdx: 4 },
    { note: "La#", afterIdx: 5 },
  ]
  const wPct = 100 / 7

  return (
    <div style={{ position: "relative", height: 56, width: "100%", maxWidth: 280 }}>
      <div style={{ position: "absolute", inset: 0, display: "flex" }}>
        {WHITE.map((n, i) => {
          const active = activeKeys.includes(n)
          return (
            <div
              key={n}
              style={{
                flex: 1,
                height: "100%",
                borderRadius: "0 0 5px 5px",
                border: `1px solid ${palette.slate800}`,
                background: active
                  ? `linear-gradient(180deg, ${color}44, ${color}22)`
                  : `linear-gradient(180deg, ${palette.slate50}, ${palette.slate200})`,
                boxShadow: active ? `0 0 12px ${color}66` : "inset 0 -3px 0 rgba(0,0,0,0.15)",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                paddingBottom: 4,
                position: "relative",
                borderLeft: i === 0 ? `1px solid ${palette.slate800}` : "none",
                outline: active ? `1.5px solid ${color}` : "none",
              }}
            >
              {active && (
                <span
                  style={{
                    fontSize: font.size.xs,
                    fontWeight: font.weight.heavy,
                    color,
                    fontFamily: font.family.ui,
                  }}
                >
                  {labels?.[n] ?? n}
                </span>
              )}
            </div>
          )
        })}
      </div>
      {BLACK.map((bk, bi) => {
        const active = activeKeys.includes(bk.note)
        return (
          <div
            key={bi}
            style={{
              position: "absolute",
              top: 0,
              left: `${(bk.afterIdx + 1) * wPct - wPct * 0.32}%`,
              width: `${wPct * 0.62}%`,
              height: "60%",
              borderRadius: "0 0 4px 4px",
              background: active ? color : pianoColors.diagramBlack,
              border: `1px solid ${active ? color : palette.slate900}`,
              boxShadow: active ? `0 0 10px ${color}88` : "none",
              zIndex: 2,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              paddingBottom: 2,
            }}
          >
            {active && (
              <span style={{ fontSize: font.size.xs, fontWeight: font.weight.heavy, color: palette.slate900 }}>
                {labels?.[bk.note] ?? bk.note}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Individual flip chord card
function ChordCard({ chord }: { chord: ChordDef }) {
  const [flipped, setFlipped] = useState(false)
  const [playing, setPlaying] = useState(false)

  function playChord(arpeggio: boolean) {
    if (playing) return
    setPlaying(true)
    if (arpeggio) {
      chord.notes.forEach((_n, i) => {
        setTimeout(() => playPianoNote(chord.playKeys[i], chord.octaves[i]), i * 200)
      })
      setTimeout(() => setPlaying(false), chord.notes.length * 200 + 300)
    } else {
      chord.notes.forEach((_n, i) => playPianoNote(chord.playKeys[i], chord.octaves[i]))
      setTimeout(() => setPlaying(false), 600)
    }
  }

  return (
    <div style={{ perspective: 900, height: 470, marginBottom: 4 }} onClick={() => setFlipped((f) => !f)}>
      <div
        style={{
          position: "relative",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.55s cubic-bezier(0.16,1,0.3,1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          cursor: "pointer",
        }}
      >
        {/* ── FRONT ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            background: colors.surface,
            border: `1px solid ${chord.color}33`,
            borderRadius: radius.lg,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            overflow: "hidden",
            boxShadow: `0 0 24px ${chord.color}18`,
          }}
        >
          {/* Card header */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  fontSize: font.size.md,
                  fontWeight: font.weight.heavy,
                  color: colors.text,
                  letterSpacing: "-0.02em",
                }}
              >
                {chord.rootTR} {chord.nameTR}{" "}
                <span style={{ fontSize: font.size.xs, fontWeight: font.weight.semibold, color: colors.textMuted }}>
                  ({chord.name})
                </span>
              </p>
            </div>
            {/* Audio button — stop propagation so it doesn't flip */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                playChord(false)
              }}
              style={{
                flexShrink: 0,
                width: 34,
                height: 34,
                borderRadius: radius.sm,
                background: playing ? `${chord.color}33` : colors.fillStrong,
                border: `1px solid ${playing ? chord.color : colors.fillStronger}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <svg width={13} height={13} viewBox="0 0 24 24">
                <path d="M5 3l14 9-14 9V3z" fill={playing ? chord.color : colors.textFaint} />
              </svg>
            </button>
          </div>

          {/* Staff visualization */}
          <div
            style={{
              background: colors.bg,
              borderRadius: radius.md,
              padding: "8px 8px 2px",
              border: `1px solid ${colors.border}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <ChordStaffSvg chord={chord.src} color={chord.color} maxWidth={280} />
          </div>

          {/* Piano strip */}
          <div
            style={{
              background: colors.bg,
              borderRadius: radius.md,
              padding: "10px 12px",
              border: `1px solid ${colors.border}`,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <p
              style={{
                fontSize: font.size.xs,
                color: colors.textMuted,
                fontWeight: font.weight.bold,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Piyano Tuşları
            </p>
            <ChordPianoStrip
              activeKeys={chord.pianoKeys}
              color={chord.color}
              labels={Object.fromEntries(chord.playKeys.map((k, i) => [k, chord.notes[i]]))}
            />
          </div>

          {/* Formula + fingering row */}
          <div style={{ display: "flex", gap: 8 }}>
            <div
              style={{
                flex: 1,
                borderRadius: radius.md,
                padding: "9px 11px",
                background: `${chord.color}0e`,
                border: `1px solid ${chord.color}22`,
              }}
            >
              <p
                style={{
                  fontSize: font.size.xs,
                  color: colors.textMuted,
                  fontWeight: font.weight.bold,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  marginBottom: 3,
                }}
              >
                Formül
              </p>
              <p
                style={{
                  fontSize: font.size.sm,
                  color: chord.color,
                  fontWeight: font.weight.semibold,
                  lineHeight: 1.4,
                }}
              >
                {chord.interval}
              </p>
            </div>
            <div
              style={{
                flexShrink: 0,
                borderRadius: radius.md,
                padding: "9px 11px",
                background: colors.fill,
                border: `1px solid ${colors.border}`,
                display: "flex",
                flexDirection: "column",
                gap: 3,
                minWidth: 72,
                alignItems: "center",
              }}
            >
              <p
                style={{
                  fontSize: font.size.xs,
                  color: colors.textMuted,
                  fontWeight: font.weight.bold,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                }}
              >
                Parmak
              </p>
              <div style={{ display: "flex", gap: 4 }}>
                {chord.fingering.split("–").map((f, i) => (
                  <div
                    key={i}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: radius.sm,
                      background: `${chord.color}22`,
                      border: `1px solid ${chord.color}44`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: font.size.sm,
                      fontWeight: font.weight.heavy,
                      color: chord.color,
                      fontFamily: font.family.mono,
                    }}
                  >
                    {f.trim()}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Arka yüzde örnek diziler var */}
          <p style={{ fontSize: font.size.xs, color: colors.textMuted, textAlign: "right", marginTop: -4 }}>
            Örnek diziler için çevir →
          </p>
        </div>

        {/* ── BACK ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: colors.surface,
            border: `1px solid ${chord.color}44`,
            borderRadius: radius.lg,
            padding: 18,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            overflow: "hidden",
            boxShadow: `0 0 28px ${chord.color}28`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p style={{ fontSize: font.size.md, fontWeight: font.weight.heavy, color: colors.text }}>
              Akor yapısı ve örnek diziler
            </p>
            <span style={{ fontSize: font.size.sm, color: colors.textMuted }}>← geri</span>
          </div>

          {/* Formula breakdown */}
          <div
            style={{
              background: colors.bg,
              borderRadius: radius.md,
              padding: "12px 14px",
              border: `1px solid ${colors.border}`,
            }}
          >
            <p
              style={{
                fontSize: font.size.xs,
                color: colors.textMuted,
                fontWeight: font.weight.bold,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Akor Yapısı
            </p>
            <div
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                marginBottom: 8,
              }}
            >
              {chord.notes.map((n, i) => (
                <div
                  key={i}
                  style={{
                    padding: "6px 14px",
                    borderRadius: radius.md,
                    background: `${NOTE_COLORS[n] ?? chord.color}18`,
                    border: `1px solid ${NOTE_COLORS[n] ?? chord.color}35`,
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: font.size.md,
                      fontWeight: font.weight.heavy,
                      color: NOTE_COLORS[n] ?? chord.color,
                      fontFamily: font.family.mono,
                      lineHeight: 1,
                    }}
                  >
                    {n}
                  </p>
                  <p style={{ fontSize: font.size.sm, color: colors.textMuted, marginTop: 3 }}>
                    {intervalName(chord.src.semis[i], chord.src.quality)}
                  </p>
                </div>
              ))}
            </div>
            <p style={{ fontSize: font.size.sm, color: colors.textSubtle }}>
              {chord.formula} · {chord.interval}
            </p>
          </div>

          {/* Common progressions */}
          <div
            style={{
              background: colors.bg,
              borderRadius: radius.md,
              padding: "12px 14px",
              border: `1px solid ${colors.border}`,
              flex: 1,
            }}
          >
            <p
              style={{
                fontSize: font.size.xs,
                color: colors.textMuted,
                fontWeight: font.weight.bold,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Sık kullanılan diziler
            </p>
            {chord.progressions.map((prog, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: i < chord.progressions.length - 1 ? 8 : 0,
                }}
              >
                <span
                  style={{
                    fontSize: font.size.sm,
                    fontWeight: font.weight.bold,
                    color: chord.color,
                    background: `${chord.color}18`,
                    border: `1px solid ${chord.color}33`,
                    padding: "2px 6px",
                    borderRadius: radius.xs,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>
                <span
                  style={{
                    fontSize: font.size.sm,
                    fontWeight: font.weight.bold,
                    color: colors.textSecondary,
                    fontFamily: font.family.mono,
                    letterSpacing: "0.05em",
                  }}
                >
                  {prog}
                </span>
              </div>
            ))}
          </div>

          {/* Arpeggio listen button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              playChord(true)
            }}
            style={{
              width: "100%",
              padding: "11px",
              borderRadius: radius.md,
              background: `linear-gradient(135deg, ${chord.color}33, ${chord.color}18)`,
              border: `1px solid ${chord.color}44`,
              color: chord.color,
              fontSize: font.size.sm,
              fontWeight: font.weight.bold,
              cursor: "pointer",
              fontFamily: font.family.ui,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
            }}
          >
            <Icon name="speaker" size={15} style={{ marginRight: 6 }} />
            Arpej Dinle
          </button>
        </div>
      </div>
    </div>
  )
}

// ── ChordsStudy view ──────────────────────────────────────────────────────────
export const LEVEL_HELP: Record<number, string> = {
  1: "Doğal notaların majör ve minör akorları.",
  2: "Ara seslerin (diyez/bemol) majör ve minörleri.",
  3: "7'li akorlar: majör 7, dominant 7, minör 7.",
  4: "dim, aug, m7♭5, dim7, sus2, sus4, 9'lu, 13'lü. İleri armoni ve caz için.",
}

export function ChordsStudy({ search = "", level: fixedLevel }: { search?: string; level?: number }) {
  const tablet = useTablet()
  const [levelState, setLevel] = useState<number>(() => effectiveChordLevel())
  const level = fixedLevel ?? levelState
  const [rootFilter, setRootFilter] = useState<string | null>(null)

  const inLevel = CHORD_DB.filter((c) => c.level === level)
  const roots = [...new Set(inLevel.map((c) => c.root))]
  // Açılışta liste kısa olsun: ilk kökün akorları
  const activeRoot = rootFilter === "*" ? null : (rootFilter ?? roots[0])

  const filtered = inLevel.filter((c) => {
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      c.fullName.toLowerCase().includes(q) ||
      c.rootTR.toLowerCase().includes(q) ||
      c.nameTR.toLowerCase().includes(q) ||
      c.root.toLowerCase().includes(q) ||
      c.notes.some((n) => n.toLowerCase().includes(q))
    const matchRoot = !activeRoot || !!q || c.root === activeRoot
    return matchSearch && matchRoot
  })

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Seviye: öğretmenin önerdiği 4 akor seviyesi (Çalışma'da her seviye ayrı derstir, seçici gizli) */}
      {fixedLevel === undefined && (
        <Segmented
          columns={4}
          size="sm"
          value={level}
          options={([1, 2, 3, 4] as const).map((l) => [l, CHORD_LEVEL_LABELS[l]] as const)}
          onChange={(l) => {
            setLevel(l)
            setRootFilter(null)
          }}
        />
      )}
      {fixedLevel === undefined && (
        <p style={{ fontSize: font.size.sm, color: colors.textMuted, fontFamily: font.family.ui, marginTop: -4 }}>
          {LEVEL_HELP[level]}
        </p>
      )}

      {/* Root note filter pills */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button
          onClick={() => setRootFilter("*")}
          style={{
            padding: "5px 12px",
            borderRadius: radius.pill,
            fontSize: font.size.sm,
            fontWeight: font.weight.bold,
            cursor: "pointer",
            fontFamily: font.family.mono,
            background: !activeRoot ? alpha(palette.violet500, 0.2) : colors.fill,
            color: !activeRoot ? colors.violetText : colors.textMuted,
            border: !activeRoot ? "1px solid rgba(139,92,246,0.4)" : `1px solid ${colors.border}`,
          }}
        >
          Tümü
        </button>
        {roots.map((r) => (
          <button
            key={r}
            onClick={() => setRootFilter(r)}
            style={{
              padding: "5px 11px",
              borderRadius: radius.pill,
              fontSize: font.size.sm,
              fontWeight: font.weight.bold,
              cursor: "pointer",
              fontFamily: font.family.mono,
              background: activeRoot === r ? alpha(palette.violet500, 0.2) : colors.fill,
              color: activeRoot === r ? colors.violetText : colors.textFaint,
              border: activeRoot === r ? "1px solid rgba(139,92,246,0.4)" : `1px solid ${colors.border}`,
            }}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Chord cards */}
      {filtered.length === 0 ? (
        <div
          style={{
            padding: "32px 16px",
            textAlign: "center",
            background: colors.surface,
            borderRadius: radius.lg,
            border: `1px solid ${colors.border}`,
          }}
        >
          <p style={{ fontSize: font.size.sm, color: colors.textMuted }}>Akor bulunamadı</p>
        </div>
      ) : (
        <div style={tablet ? { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } : { display: "contents" }}>
          {filtered.map((chord) => (
            <ChordCard key={chord.id} chord={chord} />
          ))}
        </div>
      )}
    </div>
  )
}
