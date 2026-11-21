// Küçük nota yazım dili (ör. "ts:4/4 q q h ||") → Bravura sembolleriyle SVG partisyon.
import Glyph, { glyphWidth } from "./Glyph"
import type { GlyphName } from "../data/smufl"

import { colors, alpha, font, palette } from "../design/tokens"
// Küçük nota çizici: soruları yazı yerine porte üzerinde göstermek için.
//
// Bir "score" metni boşlukla ayrılmış parçalardan oluşur:
//   w h q e s        tam, yarım, dörtlük, sekizlik, onaltılık nota
//   wr hr qr er      sus işaretleri
//   ee  ssss  3eee   sapları bağlı sekizlik / onaltılık grubu, triole
//   ess sse e.s ses  karışık bağlı grup: sekizlik (e), onaltılık (s), noktalı (.); onaltılıklar ikinci kirişle
//   sonekler: .  noktalı   !  staccato   >  aksan   -  tenuto   ^  fermata   @n  n adım yukarı
//             d  sap aşağı   x  sap yanlış tarafta (yazım kuralı soruları için)
//   ts:4/4  ts:C  ts:¢   ölçü işareti
//   |  ||               ölçü çizgisi, bitiş çizgisi
//   ~                    süre bağı (önceki ve sonraki notayı bağlar)
//   ( ... )              legato bağı (parantez içindeki notaların üstünden)
//   = + ?                eşittir, artı, soru kutusu
//   t:÷2                 porte içinde düz yazı ( _ boşluk olur)
//   tx:Allegro           portenin üstünde, solda tempo / karakter yazısı
//   end:D.C.             portenin üstünde, sağda yazı
//   dyn:p                portenin altında dinamik işareti
//   hair:< hair:>        portenin altında crescendo / decrescendo çatalı

const INK = colors.notation
const LINE = colors.staffLine
const ACCENT = palette.violet400
const BASE_Y = 65 // nota başının varsayılan yeri (2. ve 3. çizgi arası)
const SERIF = "'Times New Roman', Georgia, serif"

type Item = { x: number; el: React.ReactNode }

// Bravura sembolleri (SMuFL). nx: nota başının ortası
const HEAD_W = glyphWidth("noteheadBlack")
const WHOLE_W = glyphWidth("noteheadWhole")
function head(x: number, y: number, filled: boolean, whole = false) {
  const name = whole ? "noteheadWhole" : filled ? "noteheadBlack" : "noteheadHalf"
  return <Glyph name={name} x={x - (whole ? WHOLE_W : HEAD_W) / 2} y={y} />
}

// Sap: yukarıda sağda, aşağıda solda. wrongSide: sap yanlış tarafta (yazım kuralı soruları)
function stemX(nx: number, down: boolean, wrongSide = false) {
  const right = nx + HEAD_W / 2 - 0.65
  const left = nx - HEAD_W / 2 + 0.65
  return down !== wrongSide ? left : right
}

function flag(sx: number, end: number, n: number, down: boolean) {
  const name = n === 1 ? (down ? "flag8thDown" : "flag8thUp") : down ? "flag16thDown" : "flag16thUp"
  return <Glyph name={name} x={sx - 0.65} y={end} />
}

const REST_GLYPH: Record<string, [GlyphName, number]> = {
  wr: ["restWhole", 50],
  hr: ["restHalf", 60],
  qr: ["restQuarter", 60],
  er: ["rest8th", 60],
  sr: ["rest16th", 60],
}
function rest(kind: string, x: number) {
  const [name, y] = REST_GLYPH[kind] ?? REST_GLYPH.qr
  return <Glyph name={name} x={x - glyphWidth(name) / 2} y={y} />
}

const DYN_GLYPH: Record<string, GlyphName> = {
  p: "dynamicPiano",
  m: "dynamicMezzo",
  f: "dynamicForte",
  s: "dynamicSforzando",
  z: "dynamicZ",
}
function dynamicMark(text: string, x: number, y: number) {
  if (![...text].every((c) => c in DYN_GLYPH)) return null
  let cx = x
  return (
    <g>
      {[...text].map((c, i) => {
        const g = <Glyph key={i} name={DYN_GLYPH[c]} x={cx} y={y} sp={11} />
        cx += glyphWidth(DYN_GLYPH[c], 11) * 0.92
        return g
      })}
    </g>
  )
}

export default function Notation({ score, label, maxW }: { score: string; label?: string; maxW?: number }) {
  const tokens = score.trim().split(/\s+/)
  const items: Item[] = []
  const above: React.ReactNode[] = []
  const below: React.ReactNode[] = []
  let x = 18
  let lastNote: { x: number; y: number } | null = null
  let tiePending = false
  let slurStart: { x: number; y: number } | null = null
  let slurOpen = false
  let firstNoteX: number | null = null
  let lastNoteX = 0
  let tx: string | null = null
  let endText: string | null = null
  let dyn: string | null = null
  let hair: string | null = null

  const noteAt = (nx: number, ny: number) => {
    if (tiePending && lastNote) {
      const x1 = lastNote.x + 4
      const x2 = nx - 4
      const yy = Math.max(lastNote.y, ny) + 8
      items.push({
        x: nx,
        el: (
          <path
            d={`M ${x1} ${yy} Q ${(x1 + x2) / 2} ${yy + 9} ${x2} ${yy}`}
            fill="none"
            stroke={INK}
            strokeWidth={1.8}
          />
        ),
      })
      tiePending = false
    }
    if (slurOpen && !slurStart) slurStart = { x: nx, y: ny }
    lastNote = { x: nx, y: ny }
    firstNoteX ??= nx
    lastNoteX = nx
  }

  // Tek nota (sonekleriyle)
  const single = (tok: string) => {
    const m = tok.match(/^([#b]?)(w|h|q|e|s)(\.?)([!>\-^]*)([dx]*)([#b]?)(?:@(-?\d+))?$/)
    if (!m) return false
    const [, pre, v, dot, arts, flags, post, off] = m
    const y = BASE_Y - Number(off ?? 0) * 5
    const down = flags.includes("d")
    const accG = (c: string): GlyphName => (c === "#" ? "accidentalSharp" : "accidentalFlat")
    const preW = pre ? glyphWidth(accG(pre)) + 4 : 0
    const nx = x + 9 + preW
    const sx = stemX(nx, down, flags.includes("x"))
    const end = down ? y + 35 : y - 35
    const parts: React.ReactNode[] = [<g key="h">{head(nx, y, v !== "w" && v !== "h", v === "w")}</g>]
    // Diyez/bemol: önde (doğru) ya da notadan sonra (yanlış yazım örneği)
    if (pre) parts.push(<Glyph key="pre" name={accG(pre)} x={nx - HEAD_W / 2 - 3 - glyphWidth(accG(pre))} y={y} />)
    if (post) parts.push(<Glyph key="post" name={accG(post)} x={nx + HEAD_W / 2 + (down ? 3 : 6)} y={y} />)
    if (v !== "w")
      parts.push(
        <line key="st" x1={sx} y1={down ? y + 1.5 : y - 1.5} x2={sx} y2={end} stroke={INK} strokeWidth={1.3} />,
      )
    if (v === "e") parts.push(<g key="f">{flag(sx, end, 1, down)}</g>)
    if (v === "s") parts.push(<g key="f">{flag(sx, end, 2, down)}</g>)
    if (dot)
      parts.push(<circle key="d" cx={nx + (v === "w" ? 14 : 11)} cy={y % 10 === 0 ? y - 5 : y} r={2} fill={INK} />)
    // İşaret, sapın karşı tarafında nota başının yanındaki ilk aralığa konur
    let by = down ? (y % 10 === 0 ? y - 15 : y - 10) : y % 10 === 0 ? y + 15 : y + 10
    for (const a of arts) {
      const art: GlyphName | null =
        a === "!"
          ? down
            ? "articStaccatoAbove"
            : "articStaccatoBelow"
          : a === ">"
            ? down
              ? "articAccentAbove"
              : "articAccentBelow"
            : a === "-"
              ? down
                ? "articTenutoAbove"
                : "articTenutoBelow"
              : null
      if (art) parts.push(<Glyph key={a} name={art} x={nx - glyphWidth(art) / 2} y={by} />)
      if (a === "^") parts.push(<Glyph key="fer" name="fermataAbove" x={nx - glyphWidth("fermataAbove") / 2} y={30} />)
      by += down ? -10 : 10
    }
    noteAt(nx, y)
    items.push({ x: nx, el: <g>{parts}</g> })
    x += (v === "w" ? 32 : 28) + (dot ? 8 : 0) + preW + (post ? glyphWidth(accG(post)) + 8 : 0)
    return true
  }

  // Sapları bağlı grup: ee, eee, ssss, 3eee ve karışık gruplar (ess, sse, e.s, ses).
  // Birinci kiriş hepsinin üstünden geçer; onaltılıklar ikinci kirişle birbirine bağlanır,
  // yanında onaltılık olmayan tek onaltılık kısa bir kiriş parçası alır (ilk notada sağa, diğerlerinde sola).
  const group = (tok: string) => {
    const m = tok.match(/^(3?)((?:[es]\.?){2,4})$/)
    if (!m) return false
    const trip = m[1] === "3"
    const notes = [...m[2].matchAll(/([es])(\.?)/g)].map((g) => ({ v: g[1], dot: g[2] === "." }))
    const n = notes.length
    const gap = 20
    const top = BASE_Y - 33
    const xs: number[] = []
    let gx = x + 8
    notes.forEach((nt) => {
      xs.push(gx)
      gx += gap + (nt.dot ? 7 : 0)
    })
    const sx = (i: number) => stemX(xs[i], false)
    const parts: React.ReactNode[] = []
    xs.forEach((nx, i) => {
      parts.push(<g key={i}>{head(nx, BASE_Y, true)}</g>)
      parts.push(<line key={"s" + i} x1={sx(i)} y1={BASE_Y - 1.5} x2={sx(i)} y2={top} stroke={INK} strokeWidth={1.3} />)
      if (notes[i].dot) parts.push(<circle key={"d" + i} cx={nx + 11} cy={BASE_Y} r={2} fill={INK} />)
      noteAt(nx, BASE_Y)
    })
    const beam = (key: string, x1: number, x2: number, row: number) => (
      <rect key={key} x={x1 - 0.65} y={top + row * 7.5} width={x2 - x1 + 1.3} height={5} fill={INK} />
    )
    parts.push(beam("b0", sx(0), sx(n - 1), 0))
    const STUB = 9
    for (let i = 0; i < n; i++) {
      if (notes[i].v !== "s") continue
      const prevS = i > 0 && notes[i - 1].v === "s"
      const nextS = i < n - 1 && notes[i + 1].v === "s"
      if (nextS) parts.push(beam("b1" + i, sx(i), sx(i + 1), 1))
      else if (!prevS)
        parts.push(i === 0 ? beam("k" + i, sx(i), sx(i) + STUB, 1) : beam("k" + i, sx(i) - STUB, sx(i), 1))
    }
    if (trip)
      parts.push(
        <text
          key="t"
          x={(xs[0] + xs[n - 1]) / 2 + 6}
          y={top - 6}
          fontSize="13"
          fontStyle="italic"
          fontWeight="700"
          fill={INK}
          textAnchor="middle"
          style={{ fontFamily: SERIF }}
        >
          3
        </text>,
      )
    items.push({ x, el: <g>{parts}</g> })
    x = gx + 4
    return true
  }

  for (const raw of tokens) {
    let tok = raw
    if (tok.startsWith("(")) {
      slurOpen = true
      slurStart = null
      tok = tok.slice(1)
    }
    let closeSlur = false
    if (tok.endsWith(")") && tok.length > 1) {
      closeSlur = true
      tok = tok.slice(0, -1)
    }
    if (tok === "") continue

    if (tok.startsWith("ts:")) {
      const v = tok.slice(3)
      if (v === "C" || v === "¢") {
        const g: GlyphName = v === "C" ? "timeSigCommon" : "timeSigCutCommon"
        items.push({ x, el: <Glyph name={g} x={x + 2} y={60} /> })
        x += glyphWidth(g) + 14
      } else {
        const [t, b] = v.split("/")
        // Rakamlar Bravura ölçü rakamları; "?" soru kutusu rengiyle yazı
        const digits = (str: string, y: number, color?: string) => {
          if (!/^\d+$/.test(str))
            return (
              <text
                x={x + 10}
                y={y + 8}
                fontSize="24"
                fontWeight="800"
                fill={color ?? ACCENT}
                textAnchor="middle"
                style={{ fontFamily: font.family.ui }}
              >
                {str}
              </text>
            )
          const ws = [...str].map((d) => glyphWidth(`timeSig${d}` as GlyphName))
          const total = ws.reduce((a2, b2) => a2 + b2, 0)
          let cx = x + (W - total) / 2
          return (
            <g>
              {[...str].map((d, i) => {
                const el = <Glyph key={i} name={`timeSig${d}` as GlyphName} x={cx} y={y} />
                cx += ws[i]
                return el
              })}
            </g>
          )
        }
        const wOf = (str: string) =>
          /^\d+$/.test(str) ? [...str].reduce((a2, d) => a2 + glyphWidth(`timeSig${d}` as GlyphName), 0) : 20
        const W = Math.max(wOf(t), wOf(b))
        items.push({
          x,
          el: (
            <g>
              {digits(t, 50)}
              {digits(b, 70)}
            </g>
          ),
        })
        x += W + 14
      }
    } else if (tok === "|" || tok === "||") {
      items.push({
        x,
        el:
          tok === "|" ? (
            <line x1={x + 4} y1={40} x2={x + 4} y2={80} stroke={INK} strokeWidth={1.5} />
          ) : (
            <g>
              <line x1={x + 2} y1={40} x2={x + 2} y2={80} stroke={INK} strokeWidth={1.5} />
              <rect x={x + 6} y={40} width={4.5} height={40} fill={INK} />
            </g>
          ),
      })
      x += tok === "|" ? 14 : 16
    } else if (tok === "~") {
      tiePending = true
    } else if (tok === "=" || tok === "+") {
      items.push({
        x,
        el: (
          <text
            x={x + 9}
            y={BASE_Y + 7}
            fontSize="22"
            fontWeight="700"
            fill={ACCENT}
            textAnchor="middle"
            style={{ fontFamily: font.family.ui }}
          >
            {tok}
          </text>
        ),
      })
      x += 22
    } else if (tok === "?") {
      items.push({
        x,
        el: (
          <g>
            <rect
              x={x + 1}
              y={47}
              width={24}
              height={26}
              rx={7}
              fill={alpha(palette.violet500, 0.18)}
              stroke={ACCENT}
              strokeWidth={1.5}
            />
            <text
              x={x + 13}
              y={66}
              fontSize="18"
              fontWeight="800"
              fill={ACCENT}
              textAnchor="middle"
              style={{ fontFamily: font.family.ui }}
            >
              ?
            </text>
          </g>
        ),
      })
      x += 32
    } else if (tok.startsWith("t:")) {
      const s = tok.slice(2).replace(/_/g, " ")
      items.push({
        x,
        el: (
          <text
            x={x + 2}
            y={BASE_Y + 6}
            fontSize="17"
            fontWeight="700"
            fill={ACCENT}
            style={{ fontFamily: font.family.ui }}
          >
            {s}
          </text>
        ),
      })
      x += s.length * 10 + 8
    } else if (tok.startsWith("tx:")) tx = tok.slice(3).replace(/_/g, " ")
    else if (tok.startsWith("end:")) endText = tok.slice(4).replace(/_/g, " ")
    else if (tok.startsWith("dyn:")) dyn = tok.slice(4)
    else if (tok.startsWith("hair:")) hair = tok.slice(5)
    else if (/^(wr|hr|qr|er|sr)$/.test(tok)) {
      items.push({ x, el: rest(tok, x + 10) })
      x += 26
    } else if (!group(tok)) single(tok)

    if (closeSlur && slurStart && lastNote) {
      const s0 = slurStart as { x: number; y: number }
      const s1 = lastNote as { x: number; y: number }
      const y0 = Math.min(s0.y, s1.y) - 42
      items.push({
        x,
        el: (
          <path
            d={`M ${s0.x + 4} ${s0.y - 38} Q ${(s0.x + s1.x) / 2 + 4} ${y0 - 12} ${s1.x + 6} ${s1.y - 38}`}
            fill="none"
            stroke={INK}
            strokeWidth={1.8}
          />
        ),
      })
      slurOpen = false
      slurStart = null
    }
  }

  const width = Math.max(x + 10, 120)
  if (tx)
    above.push(
      <text key="tx" x={16} y={22} fontSize="17" fontWeight="800" fill={INK} style={{ fontFamily: SERIF }}>
        {tx}
      </text>,
    )
  if (endText)
    above.push(
      <text
        key="end"
        x={width - 12}
        y={28}
        fontSize="16"
        fontStyle="italic"
        fontWeight="800"
        fill={INK}
        textAnchor="end"
        style={{ fontFamily: SERIF }}
      >
        {endText}
      </text>,
    )
  const fx = firstNoteX ?? 20
  if (dyn)
    below.push(
      <g key="dyn">
        {dynamicMark(dyn, fx - 4, 102) ?? (
          <text
            x={fx - 4}
            y={104}
            fontSize="20"
            fontStyle="italic"
            fontWeight="800"
            fill={INK}
            style={{ fontFamily: SERIF }}
          >
            {dyn}
          </text>
        )}
      </g>,
    )
  if (hair) {
    const x1 = dyn ? fx + 6 + dyn.length * 12 : fx - 4
    const x2 = Math.max(lastNoteX + 10, x1 + 40)
    const [open, close] = hair === "<" ? [x1, x2] : [x2, x1]
    below.push(
      <path
        key="hair"
        d={`M ${close} 90 L ${open} 97 L ${close} 104`}
        fill="none"
        stroke={INK}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />,
    )
  }

  return (
    <svg
      viewBox={`0 0 ${width} 112`}
      style={{ width: "100%", maxWidth: maxW ?? Math.min(360, width * 2.4), maxHeight: 220 }}
      role="img"
      aria-label={label ?? "Nota çizimi"}
    >
      {[40, 50, 60, 70, 80].map((y) => (
        <line key={y} x1={8} y1={y} x2={width - 8} y2={y} stroke={LINE} strokeWidth={1.2} strokeLinecap="round" />
      ))}
      {items.map((it, i) => (
        <g key={i}>{it.el}</g>
      ))}
      {above}
      {below}
    </svg>
  )
}

// Terim soruları için partisyondaki görünüşü kurar
const DYNAMICS = new Set(["p", "pp", "ppp", "mp", "mf", "f", "ff", "fff", "sfz", "fp"])
export function termScore(display: string): string | null {
  const d = display.trim()
  if (DYNAMICS.has(d)) return `q q q q dyn:${d}`
  if (d === "cresc.") return "q q q q q hair:<"
  if (d === "dim.") return "q q q q q hair:>"
  if (d === "Fermata") return "q q h^ ||"
  if (d === "Staccato") return "q! q! q! q!"
  if (d === "Legato") return "(q q@1 q@2 q@3)"
  if (d === "Tenuto") return "q- q- q- q-"
  if (/^Da Capo/.test(d)) return "q q q q || end:D.C."
  if (d === "Fine") return "q q h || end:Fine"
  if (d === "Coda") return "q q q q || end:Coda"
  if (d.length > 18 || d.includes("/")) return null
  return `tx:${d.replace(/ /g, "_")} q q q q`
}
