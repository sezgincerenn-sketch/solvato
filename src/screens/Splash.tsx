// Açılış animasyonu (~2 sn, dokununca geçer):
//  1. Mor zemin parlar, logo karesi yaylanarak belirir
//  2. Beyaz tuşlar sırayla aşağıdan yükselir, siyah tuşlar üstten iner
//  3. Üçüncü tuş "çalınır": basılır, sarıya döner ve anahtar deliği belirir (logodaki sarı tuş)
//  4. Çalınan tuştan üç sekizlik nota yükselip söner
//  5. "Solvato" yazısı harf harf gelir, ekran söner
// "Hareketi azalt" açıksa animasyonlar kapanır, son kare görünür (index.css).
import { useEffect, useState } from "react"
import { colors, font, palette } from "../design/tokens"
import { SMUFL } from "../data/smufl"
import { Keyhole } from "../components/Logo"

const DURATION = 2000 // söneceği an (ms)
const FADE = 380

// Logo geometrisi (Logo.tsx ile aynı, 1024 birim)
const WHITE_X = [166, 348, 530, 712]
const BLACK_X = [296, 478, 660]

/** Bravura ile tek sekizlik nota: baş + sap + bayrak (sp: porte aralığı) */
function EighthNote({ x, y, sp = 10, fill }: { x: number; y: number; sp?: number; fill: string }) {
  const s = sp / 250
  const stemX = x + 11.8 * (sp / 10) - 0.65 * (sp / 10)
  const top = y - 3.4 * sp
  return (
    <g fill={fill}>
      <path d={SMUFL.noteheadBlack.d} transform={`translate(${x} ${y}) scale(${s} ${-s})`} />
      <rect x={stemX - 0.6} y={top} width={1.3 * (sp / 10)} height={y - top - 1} />
      <path d={SMUFL.flag8thUp.d} transform={`translate(${stemX - 0.6} ${top}) scale(${s} ${-s})`} />
    </g>
  )
}

const CSS = `
.sp-glow { animation: spGlow 1.4s ease-out both }
.sp-mark { transform-box: fill-box; transform-origin: center; animation: spMark .55s cubic-bezier(.34,1.56,.64,1) both }
.sp-w { transform-box: fill-box; transform-origin: bottom; animation: spRise .42s cubic-bezier(.2,.8,.2,1) both }
.sp-b { transform-box: fill-box; transform-origin: top; animation: spDrop .32s cubic-bezier(.2,.8,.2,1) both }
.sp-play { transform-box: fill-box; transform-origin: top; animation: spPress .34s ease-in-out 1.0s both }
.sp-gold { animation: spGold .3s ease-out 1.02s both }
.sp-lock { transform-box: fill-box; transform-origin: center; animation: spMark .4s cubic-bezier(.34,1.56,.64,1) 1.12s both }
.sp-halo { opacity: 0; transform-box: fill-box; transform-origin: center; animation: spHalo .7s ease-out 1.02s forwards }
.sp-n { opacity: 0; animation: spFloat 1s ease-out both }
.sp-letter { display: inline-block; animation: spLetter .4s cubic-bezier(.2,.8,.2,1) both }
@keyframes spGlow { from { opacity: 0; transform: scale(.6) } to { opacity: 1; transform: scale(1) } }
@keyframes spMark { from { opacity: 0; transform: scale(.55) rotate(-8deg) } to { opacity: 1; transform: none } }
@keyframes spRise { from { opacity: 0; transform: scaleY(.15) } to { opacity: 1; transform: none } }
@keyframes spDrop { from { opacity: 0; transform: scaleY(0) } to { opacity: 1; transform: none } }
@keyframes spPress { 0%,100% { transform: none } 45% { transform: scaleY(.93) } }
@keyframes spGold { from { opacity: 0 } to { opacity: 1 } }
@keyframes spHalo { 0% { opacity: .8; transform: scale(.4) } 100% { opacity: 0; transform: scale(2.2) } }
@keyframes spFloat {
  0% { opacity: 0; transform: translate(0, 60px) scale(.6) }
  20% { opacity: 1 }
  100% { opacity: 0; transform: translate(var(--dx), -380px) scale(1) }
}
@keyframes spLetter { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: none } }
`

export default function Splash({ onDone }: { onDone: () => void }) {
  const [out, setOut] = useState(false)
  useEffect(() => {
    const t1 = setTimeout(() => setOut(true), DURATION)
    const t2 = setTimeout(onDone, DURATION + FADE)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [onDone])

  const skip = () => {
    setOut(true)
    setTimeout(onDone, FADE)
  }

  const word = "Solvato".split("") // "Solv" beyaz, "ato" mor (Logo.tsx ile aynı)
  return (
    <div
      aria-hidden="true"
      onClick={skip}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 200,
        background: colors.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        opacity: out ? 0 : 1,
        transition: `opacity ${FADE}ms ease`,
        pointerEvents: out ? "none" : "auto",
        overflow: "hidden",
        cursor: "pointer",
      }}
    >
      <style>{CSS}</style>
      {/* Arkadaki mor parıltı */}
      <div
        className="sp-glow"
        style={{
          position: "absolute",
          width: 420,
          height: 420,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${palette.violet600}55 0%, transparent 65%)`,
          top: "50%",
          left: "50%",
          marginLeft: -210,
          marginTop: -250,
          pointerEvents: "none",
        }}
      />

      <svg width={180} height={250} viewBox="0 -420 1024 1444" style={{ position: "relative", overflow: "visible" }}>
        <defs>
          <linearGradient id="sp-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={palette.violet600} />
            <stop offset="1" stopColor={palette.purple950} />
          </linearGradient>
        </defs>

        {/* Kare */}
        <rect className="sp-mark" width="1024" height="1024" rx="230" fill="url(#sp-g)" />

        {/* Beyaz tuşlar: sırayla yükselir; üçüncüsü çalınır ve sarıya döner */}
        {WHITE_X.map((x, i) => (
          <g key={x} className={i === 2 ? "sp-play" : undefined}>
            <rect
              className="sp-w"
              style={{ animationDelay: `${0.25 + i * 0.08}s` }}
              x={x}
              y="250"
              width="166"
              height="524"
              rx="30"
              fill={palette.white}
            />
            {i === 2 && (
              <rect className="sp-gold" x={x} y="250" width="166" height="524" rx="30" fill={palette.amber400} />
            )}
          </g>
        ))}
        {/* Siyah tuşlar: üstten iner */}
        {BLACK_X.map((x, i) => (
          <rect
            key={x}
            className="sp-b"
            style={{ animationDelay: `${0.6 + i * 0.07}s` }}
            x={x}
            y="250"
            width="92"
            height="300"
            rx="22"
            fill={palette.violet950}
          />
        ))}

        {/* Sarı tuşun anahtar deliği */}
        <Keyhole className="sp-lock" />

        {/* Çalınan tuşun halkası */}
        <circle
          className="sp-halo"
          cx={613}
          cy={512}
          r={140}
          fill="none"
          stroke={palette.amber400}
          strokeWidth={22}
          opacity={0}
        />

        {/* Tuştan yükselen notalar */}
        {[
          { x: 560, dx: "-260px", d: 1.05, sp: 130 },
          { x: 640, dx: "120px", d: 1.2, sp: 100 },
          { x: 590, dx: "330px", d: 1.35, sp: 115 },
        ].map((n, i) => (
          <g
            key={i}
            className="sp-n"
            style={
              { animationDelay: `${n.d}s`, ["--dx" as string]: n.dx, transformBox: "fill-box" } as React.CSSProperties
            }
          >
            <EighthNote x={n.x} y={160} sp={n.sp} fill={i === 1 ? palette.violet300 : palette.amber400} />
          </g>
        ))}
      </svg>

      {/* İsim: harf harf */}
      <p
        style={{
          position: "relative",
          margin: 0,
          fontFamily: font.family.ui,
          fontSize: 40,
          fontWeight: font.weight.heavy,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          color: colors.text,
        }}
      >
        {word.map((ch, i) => (
          <span
            key={i}
            className="sp-letter"
            style={{
              animationDelay: `${1.15 + i * 0.05}s`,
              ...(i >= 4
                ? { color: colors.violetText, fontWeight: font.weight.semibold, letterSpacing: "0.03em" }
                : {}),
            }}
          >
            {ch}
          </span>
        ))}
      </p>
    </div>
  )
}
