// Profil görseli: seçilen renkte daire, içinde ismin baş harfi (isim yoksa nota ikonu)
import Icon from "../components/Icons"
import { font, palette } from "../design/tokens"

/** Seçilebilir profil renkleri (palet adı → [üst, alt] gradyan) */
export const AVATAR_COLORS: Record<string, [string, string]> = {
  violet: [palette.violet500, palette.violet800],
  blue: [palette.blue500, palette.blue700],
  green: [palette.green500, palette.green700],
  amber: [palette.amber400, palette.amber600],
  pink: [palette.pink400, palette.pink500],
  cyan: [palette.cyan400, palette.teal700],
}

export default function Avatar({ name, color = "violet", size = 44 }: { name: string; color?: string; size?: number }) {
  const [a, b] = AVATAR_COLORS[color] ?? AVATAR_COLORS.violet
  const initial = name.trim().charAt(0).toLocaleUpperCase("tr")
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        background: `linear-gradient(135deg, ${a}, ${b})`,
        color: palette.white,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: font.family.ui,
        fontSize: Math.round(size * 0.44),
        fontWeight: font.weight.heavy,
      }}
    >
      {initial || <Icon name="note" size={Math.round(size * 0.46)} />}
    </div>
  )
}
