// Bravura (SMuFL) müzik sembolünü SVG yolu olarak çizer.
import { colors } from "../design/tokens"
import { SMUFL, type GlyphName } from "../data/smufl"

// SMuFL sembolünü SVG içinde çizer. (x, y) sembolün çıkış noktası:
// anahtarlarda referans çizgisi, notalarda nota başının ortası, suslarda orta çizgi.
// sp: porte aralığı (piksel). Varsayılan 10.
export default function Glyph({
  name,
  x,
  y,
  sp = 10,
  fill = colors.notation,
  opacity,
  style,
}: {
  name: GlyphName
  x: number
  y: number
  sp?: number
  fill?: string
  opacity?: number
  style?: React.CSSProperties
}) {
  const s = sp / 250
  return (
    <path
      d={SMUFL[name].d}
      transform={`translate(${x} ${y}) scale(${s} ${-s})`}
      fill={fill}
      opacity={opacity}
      style={style}
    />
  )
}

// Sembolün genişliği (piksel)
export function glyphWidth(name: GlyphName, sp = 10) {
  return SMUFL[name].w * sp
}

// Arayüz için küçük anahtar ikonu (metin içinde kullanılır)
export function ClefIcon({
  clef,
  size = 20,
  color = "currentColor",
}: {
  clef: "treble" | "bass"
  size?: number
  color?: string
}) {
  const name: GlyphName = clef === "treble" ? "gClef" : "fClef"
  const g = SMUFL[name]
  const sw = g.sw as readonly number[]
  const ne = g.ne as readonly number[]
  const hSp = ne[1] - sw[1]
  const wSp = ne[0] - sw[0]
  // treble daha uzun; ikisi aynı kutuya sığsın
  const sp = clef === "treble" ? size / hSp : (size * 0.62) / hSp
  const w = wSp * sp
  const h = clef === "treble" ? size : size
  const yOrigin = clef === "treble" ? ne[1] * sp : (size - hSp * sp) / 2 + ne[1] * sp
  return (
    <svg
      width={w + 2}
      height={h}
      viewBox={`${sw[0] * sp - 1} 0 ${w + 2} ${h}`}
      aria-hidden
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <Glyph name={name} x={0} y={yOrigin} sp={sp} fill={color} />
    </svg>
  )
}
