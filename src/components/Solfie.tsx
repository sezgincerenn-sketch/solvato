// Solfie: Solvato'nun maskotu. Sekizlik nota; amber bayrağı saçı gibi, kolları ve ayakları var.
// Pozlar (duruma göre seçin, rastgele değil):
//   idle  : sakin gülümseme, kollar aşağıda (ipucu, bilgi)
//   wave  : el sallar, ağzı açık gülümser (selam)
//   cheer : iki kol havada, gözler mutluluktan kapalı, parıltılar (rekor, kutlama, "Hazırsın")
// Renkler sabit; gövde hep açık renk, iki temada da ince mor çizgiyle ayrılır.
// Hareketler index.css'te (solfie-*); "hareketi azalt" açıksa durur.
import { useId, type ReactNode } from "react"
import { colors, font, palette, radius, space } from "../design/tokens"

export type SolfiePose = "idle" | "wave" | "cheer"

const INK = "#1E1B2E" // göz ve ağız
const LINE = palette.violet300
const BLUSH = "#F9A8D4"

/** Kol: önce mor kenar, üstüne gövde rengi; ucunda yuvarlak el */
function Arm({ d, hand, fill }: { d: string; hand: [number, number]; fill: string }) {
  return (
    <g>
      <path d={d} stroke={LINE} strokeWidth={24} strokeLinecap="round" fill="none" />
      <path d={d} stroke={fill} strokeWidth={15} strokeLinecap="round" fill="none" />
      <circle cx={hand[0]} cy={hand[1]} r={14} fill={fill} stroke={LINE} strokeWidth={4.5} />
    </g>
  )
}

export default function Solfie({
  size = 72,
  pose = "idle",
  animate = true,
}: {
  size?: number
  pose?: SolfiePose
  animate?: boolean
}) {
  const id = useId().replace(/:/g, "")
  const body = `url(#${id}b)`
  const happy = pose !== "idle"
  return (
    <svg
      width={size}
      height={size}
      viewBox="20 20 380 380"
      aria-hidden="true"
      className={animate ? (pose === "cheer" ? "solfie-hop" : "solfie-bob") : undefined}
      style={{ overflow: "visible", flexShrink: 0 }}
    >
      <defs>
        <radialGradient id={`${id}b`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor={palette.white} />
          <stop offset="0.55" stopColor={palette.violet50} />
          <stop offset="1" stopColor={palette.violet200} />
        </radialGradient>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={palette.amber300} />
          <stop offset="1" stopColor={palette.amber500} />
        </linearGradient>
      </defs>

      {pose === "cheer" && (
        <g fill={palette.amber400} className={animate ? "solfie-twinkle" : undefined}>
          <path d="M44 150 l8 -22 l8 22 l22 8 l-22 8 l-8 22 l-8 -22 l-22 -8 Z" />
          <path d="M372 300 l6 -16 l6 16 l16 6 l-16 6 l-6 16 l-6 -16 l-16 -6 Z" />
          <circle cx="96" cy="88" r="7" />
          <circle cx="372" cy="232" r="5" />
        </g>
      )}

      {/* Ayaklar */}
      <g fill={palette.violet100} stroke={LINE} strokeWidth={4.5}>
        <ellipse cx="128" cy="356" rx="30" ry="15" />
        <ellipse cx="214" cy="350" rx="30" ry="15" />
      </g>

      {/* Sol kol (izleyenin solu) */}
      {pose === "cheer" ? (
        <Arm d="M72 268 Q 40 228 52 190" hand={[52, 186]} fill={palette.violet50} />
      ) : (
        <Arm d="M70 290 Q 44 312 52 338" hand={[52, 340]} fill={palette.violet50} />
      )}

      {/* Sap ve bayrak (saç) */}
      <rect x="250" y="56" width="32" height="232" rx="14" fill={body} stroke={LINE} strokeWidth={5} />
      <path
        d="M270 56 C 340 86 382 146 346 232 C 336 176 304 156 270 150 Z"
        fill={`url(#${id}f)`}
        stroke={palette.amber500}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <path
        d="M284 80 C 318 98 340 124 344 156"
        stroke={palette.white}
        strokeOpacity={0.55}
        strokeWidth={7}
        strokeLinecap="round"
        fill="none"
      />

      {/* Baş */}
      <ellipse
        cx="175"
        cy="268"
        rx="118"
        ry="90"
        transform="rotate(-18 175 268)"
        fill={body}
        stroke={LINE}
        strokeWidth={5}
      />

      {/* Sağ kol: sapın önünde */}
      {pose === "wave" ? (
        <g
          className={animate ? "solfie-wave" : undefined}
          style={{ transformBox: "view-box", transformOrigin: "284px 262px" }}
        >
          <Arm d="M284 262 Q 322 232 320 192" hand={[320, 188]} fill={palette.violet50} />
          <path d="M346 170 q 12 12 6 30" stroke={LINE} strokeWidth={5} strokeLinecap="round" fill="none" />
        </g>
      ) : pose === "cheer" ? (
        <Arm d="M284 256 Q 322 220 322 182" hand={[322, 178]} fill={palette.violet50} />
      ) : (
        <Arm d="M282 270 Q 312 292 306 320" hand={[306, 322]} fill={palette.violet50} />
      )}

      {/* Yanaklar */}
      <circle cx="108" cy="300" r="16" fill={BLUSH} opacity={0.75} />
      <circle cx="240" cy="282" r="16" fill={BLUSH} opacity={0.75} />

      {/* Gözler: sevinçte kapalı yay, diğerlerinde parlak bakış */}
      {pose === "cheer" ? (
        <g stroke={INK} strokeWidth={8} strokeLinecap="round" fill="none">
          <path d="M124 272 q 16 -20 32 0" />
          <path d="M190 258 q 16 -20 32 0" />
        </g>
      ) : (
        <g>
          <ellipse cx="140" cy="268" rx="15" ry="21" fill={INK} />
          <ellipse cx="206" cy="254" rx="15" ry="21" fill={INK} />
          <circle cx="146" cy="260" r="6" fill={palette.white} />
          <circle cx="212" cy="246" r="6" fill={palette.white} />
          <circle cx="135" cy="276" r="2.5" fill={palette.white} />
          <circle cx="201" cy="262" r="2.5" fill={palette.white} />
        </g>
      )}

      {/* Ağız */}
      {happy ? (
        <g>
          <path
            d="M150 298 Q 180 338 214 290 Q 182 306 150 298 Z"
            fill={INK}
            stroke={INK}
            strokeWidth={4}
            strokeLinejoin="round"
          />
          <ellipse cx="186" cy="314" rx="11" ry="6" transform="rotate(-14 186 314)" fill="#F472B6" />
        </g>
      ) : (
        <path d="M154 302 Q 180 322 208 298" stroke={INK} strokeWidth={8} strokeLinecap="round" fill="none" />
      )}
    </svg>
  )
}

/** Solfie + konuşma balonu. Balon metni kısa olsun (tek cümle). */
export function SolfieSays({
  children,
  size = 56,
  tone = "default",
  pose = "idle",
}: {
  children: ReactNode
  size?: number
  /** "amber": rekor, kutlama */
  tone?: "default" | "amber"
  pose?: SolfiePose
}) {
  return (
    <div role="status" style={{ display: "flex", alignItems: "flex-end", gap: space[2], maxWidth: "100%" }}>
      <Solfie size={size} pose={pose} />
      <p
        style={{
          margin: 0,
          marginBottom: Math.round(size * 0.35),
          padding: `${space[2]}px 14px`,
          borderRadius: `${radius.lg}px ${radius.lg}px ${radius.lg}px 4px`,
          background: colors.fillStrong,
          border: `1px solid ${tone === "amber" ? palette.amber500 : colors.border}`,
          color: tone === "amber" ? colors.amberText : colors.text,
          fontSize: font.size.sm,
          fontWeight: font.weight.semibold,
          fontFamily: font.family.ui,
          lineHeight: 1.4,
          minWidth: 0,
        }}
      >
        {children}
      </p>
    </div>
  )
}
