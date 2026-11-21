// Düğme: tüm ekranlarda aynı boy, köşe ve renk kuralları.
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react"
import { brand, colors, font, gradient, palette, radius, shadow, space, touch } from "../design/tokens"

export type ButtonVariant = "primary" | "success" | "secondary" | "ghost"

const VARIANTS: Record<ButtonVariant, CSSProperties> = {
  primary: {
    background: gradient.primaryFlat,
    color: colors.onPrimary,
    border: "none",
    boxShadow: shadow.glow(brand.primary, 0.45),
  },
  success: { background: gradient.success, color: palette.white, border: "none" },
  secondary: { background: colors.fillStrong, color: colors.textSecondary, border: `1px solid ${colors.border}` },
  ghost: { background: "transparent", color: colors.textMuted, border: "none" },
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  /** Sol tarafta ikon */
  icon?: ReactNode
  /** Satırı doldur */
  block?: boolean
  size?: "md" | "lg"
}

export default function Button({
  variant = "primary",
  icon,
  block,
  size = "md",
  style,
  children,
  disabled,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      disabled={disabled}
      style={{
        minHeight: touch.min,
        padding: size === "lg" ? `${space[4]}px ${space[5]}px` : `${space[3]}px ${space[4]}px`,
        borderRadius: size === "lg" ? radius.lg : radius.md,
        fontFamily: font.family.ui,
        fontSize: font.size.md,
        fontWeight: font.weight.bold,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: space[2],
        width: block ? "100%" : undefined,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
        ...VARIANTS[variant],
        ...style,
      }}
    >
      {icon}
      {children}
    </button>
  )
}
