// Küçük istatistik kutusu: büyük değer + altında etiket.
import type { ReactNode } from "react"
import { colors, font, radius, space } from "../design/tokens"

export default function StatTile({ value, label, icon }: { value: ReactNode; label: string; icon?: ReactNode }) {
  return (
    <div
      style={{
        flex: 1,
        padding: `${space[3]}px ${space[2]}px`,
        borderRadius: radius.lg,
        textAlign: "center",
        background: colors.fill,
        border: `1px solid ${colors.border}`,
      }}
    >
      {icon && <div style={{ display: "flex", justifyContent: "center", marginBottom: space[1] }}>{icon}</div>}
      <p
        style={{
          fontSize: font.size.lg,
          fontWeight: font.weight.heavy,
          color: colors.text,
          fontFamily: font.family.mono,
        }}
      >
        {value}
      </p>
      <p style={{ fontSize: font.size.xs, color: colors.textSubtle, marginTop: 2 }}>{label}</p>
    </div>
  )
}
