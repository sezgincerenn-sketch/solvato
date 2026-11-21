// Seçilebilir hap (filtre, kategori, saat). Görünüm kuralı Choice.tsx'teki choiceStyle'dan gelir.
import type { ButtonHTMLAttributes } from "react"
import { font, radius, space } from "../design/tokens"
import { choiceStyle } from "./Choice"

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }

export default function Chip({ selected, style, ...rest }: Props) {
  return (
    <button
      {...rest}
      aria-pressed={selected}
      style={{
        ...choiceStyle(selected),
        minHeight: 36,
        padding: `${space[2]}px ${space[3]}px`,
        borderRadius: radius.pill,
        fontSize: font.size.sm,
        fontWeight: font.weight.semibold,
        ...style,
      }}
    />
  )
}
