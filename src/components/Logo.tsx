// Solvato logosu: mor kare içinde piyano tuşları; üçüncüsü sarı ve üstünde anahtar deliği
// ("notaların şifresini çöz") + "Solv·ato" yazısı. Geometri Splash.tsx ile aynı (1024 birim).
import { colors, font, palette } from "../design/tokens"

/** Sarı tuştaki anahtar deliği (1024 birimlik logo koordinatlarında) */
export function Keyhole({ className }: { className?: string }) {
  return (
    <g className={className} fill={palette.violet950}>
      <circle cx="613" cy="636" r="32" />
      <path d="M595 652 L631 652 L644 716 L582 716 Z" />
    </g>
  )
}

export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 1024 1024" aria-hidden="true">
      <defs>
        <linearGradient id="pn-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={palette.violet600} />
          <stop offset="1" stopColor={palette.purple950} />
        </linearGradient>
      </defs>
      <rect width="1024" height="1024" rx="230" fill="url(#pn-g)" />
      {/* Dört piyano tuşu: üçüncüsü sarı (çalınan nota) */}
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={166 + i * 182}
          y="250"
          width="166"
          height="524"
          rx="30"
          fill={i === 2 ? palette.amber400 : palette.white}
        />
      ))}
      {[296, 478, 660].map((x) => (
        <rect key={x} x={x} y="250" width="92" height="300" rx="22" fill={palette.violet950} />
      ))}
      <Keyhole />
    </svg>
  )
}

export default function Logo({ size = 34 }: { size?: number }) {
  return (
    <div role="img" aria-label="Solvato" style={{ display: "flex", alignItems: "center", gap: Math.round(size * 0.3) }}>
      <LogoMark size={size} />
      <span
        aria-hidden="true"
        style={{
          fontFamily: font.family.ui,
          fontSize: Math.round(size * 0.82),
          fontWeight: font.weight.heavy,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          color: colors.text,
        }}
      >
        Solv
        <span
          style={{ color: colors.violetText, fontWeight: font.weight.semibold, letterSpacing: "0.03em", marginLeft: 1 }}
        >
          ato
        </span>
      </span>
    </div>
  )
}
