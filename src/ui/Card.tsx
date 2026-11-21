// Kart: hafif dolgulu yüzey. `tone` verilirse o rengin açık tonuyla çerçevelenir.
import type { CSSProperties, HTMLAttributes } from "react"
import { alpha, colors, radius, space } from "../design/tokens"

type Props = HTMLAttributes<HTMLDivElement> & {
  /** Vurgu rengi (palette.*), ör. konu rengi */
  tone?: string
  padding?: number
  as?: "div" | "section"
}

export function cardStyle(tone?: string, padding: number = space[4]): CSSProperties {
  return {
    borderRadius: radius.lg,
    padding,
    background: tone ? alpha(tone, 0.06) : colors.fill,
    border: `1px solid ${tone ? alpha(tone, 0.3) : colors.border}`,
  }
}

export default function Card({ tone, padding, as = "div", style, ...rest }: Props) {
  const Tag = as
  return <Tag {...rest} style={{ ...cardStyle(tone, padding), ...style }} />
}
