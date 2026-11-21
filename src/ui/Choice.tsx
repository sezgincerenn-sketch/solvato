// Seçim bileşenleri — uygulamadaki TÜM "birini/birkaçını seç" düğmeleri bunlardan gelir.
// Tek kural: seçili = mor dolgu + beyaz yazı; seçili değil = açık zemin + ince çerçeve.
//
//   <Chip>        hap biçimi, tek satır (filtreler, saat, hazır ayar)
//   <Segmented>   eşit genişlikte düğme sırası (hedef, seviye, tema, ♯/♭)
//   <ChoiceCard>  başlık + açıklama satırı olan büyük seçenek (onboarding)
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react"
import { alpha, colors, font, palette, radius, space } from "../design/tokens"

/** Seçili / seçili değil görünümü. Kendi seçim düğmenizi yazmak yerine bunu kullanın. */
export function choiceStyle(selected: boolean | undefined): CSSProperties {
  return {
    background: selected ? palette.violet600 : colors.fillStrong,
    color: selected ? palette.white : colors.textMuted,
    border: `1px solid ${selected ? palette.violet500 : colors.border}`,
    cursor: "pointer",
    fontFamily: font.family.ui,
    transition: "background .15s ease, border-color .15s ease, color .15s ease",
  }
}

// ─── Segmented ───────────────────────────────────────────────────────────────
export function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  columns,
  size = "md",
  isSelected,
}: {
  value: T | T[]
  options: readonly (readonly [T, ReactNode])[]
  onChange: (v: T) => void
  /** Izgara sütun sayısı; verilmezse tek sıra, eşit genişlik */
  columns?: number
  size?: "sm" | "md"
  /** Çoklu seçim için (ör. nota listesi) */
  isSelected?: (v: T) => boolean
}) {
  const sel = (v: T) => (isSelected ? isSelected(v) : Array.isArray(value) ? value.includes(v) : value === v)
  return (
    <div
      style={
        columns
          ? { display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: 6 }
          : { display: "flex", gap: space[2] }
      }
    >
      {options.map(([v, label]) => (
        <button
          key={String(v)}
          aria-pressed={sel(v)}
          onClick={() => onChange(v)}
          style={{
            ...choiceStyle(sel(v)),
            flex: columns ? undefined : 1,
            minWidth: 0,
            minHeight: 44,
            padding: size === "sm" ? "8px 2px" : "10px 6px",
            borderRadius: radius.md,
            fontSize: size === "sm" ? font.size.sm : font.size.md,
            fontWeight: font.weight.bold,
          }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

// ─── ChoiceCard ──────────────────────────────────────────────────────────────
type CardProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "title"> & {
  selected?: boolean
  title: ReactNode
  sub?: ReactNode
  /** Soldaki simge; currentColor ile boyanır, seçilince beyaza döner */
  leading?: ReactNode
}

export function ChoiceCard({ selected, title, sub, leading, style, ...rest }: CardProps) {
  return (
    <button
      {...rest}
      aria-pressed={selected}
      style={{
        ...choiceStyle(selected),
        display: "flex",
        alignItems: "center",
        gap: 14,
        width: "100%",
        textAlign: "left",
        padding: "14px 18px",
        borderRadius: radius.lg,
        ...style,
      }}
    >
      {leading && (
        <span
          aria-hidden
          style={{ flexShrink: 0, display: "inline-flex", color: selected ? palette.white : colors.violetText }}
        >
          {leading}
        </span>
      )}
      <span style={{ minWidth: 0 }}>
        <span
          style={{
            display: "block",
            fontSize: font.size.md,
            fontWeight: font.weight.bold,
            color: selected ? palette.white : colors.text,
          }}
        >
          {title}
        </span>
        {sub && (
          <span
            style={{
              display: "block",
              fontSize: font.size.sm,
              marginTop: 2,
              color: selected ? alpha(palette.white, 0.82) : colors.textMuted,
            }}
          >
            {sub}
          </span>
        )}
      </span>
    </button>
  )
}
