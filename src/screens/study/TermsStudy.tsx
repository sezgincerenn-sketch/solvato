// Çalışma › Terimler
import { useState } from "react"

import { colors, font, palette, radius } from "../../design/tokens"

const TERMS_REF = [
  {
    group: "Dinamikler",
    color: palette.red500,
    items: [
      { symbol: "ppp", name: "pianississimo", meaning: "Neredeyse duyulmaz" },
      { symbol: "pp", name: "pianissimo", meaning: "Çok hafif" },
      { symbol: "p", name: "piano", meaning: "Hafif" },
      { symbol: "mp", name: "mezzo piano", meaning: "Orta hafif" },
      { symbol: "mf", name: "mezzo forte", meaning: "Orta güçlü" },
      { symbol: "f", name: "forte", meaning: "Güçlü" },
      { symbol: "ff", name: "fortissimo", meaning: "Çok güçlü" },
      { symbol: "fff", name: "forte fortissimo", meaning: "En güçlü" },
      { symbol: "sfz", name: "sforzando", meaning: "Ani kuvvetli vurgu" },
    ],
  },
  {
    group: "Tempo",
    color: palette.blue500,
    items: [
      { symbol: "Largo", name: "largo", meaning: "Çok yavaş ve geniş (♩≈50)" },
      { symbol: "Lento", name: "lento", meaning: "Yavaş (♩≈55)" },
      { symbol: "Adagio", name: "adagio", meaning: "Yavaş ve ifadeli (♩≈70)" },
      { symbol: "Andante", name: "andante", meaning: "Yürüyüş hızında (♩≈90)" },
      { symbol: "Moderato", name: "moderato", meaning: "Orta hızda (♩≈115)" },
      {
        symbol: "Allegretto",
        name: "allegretto",
        meaning: "Biraz hızlı (♩≈115)",
      },
      { symbol: "Allegro", name: "allegro", meaning: "Hızlı ve canlı (♩≈140)" },
      {
        symbol: "Vivace",
        name: "vivace",
        meaning: "Canlı ve hareketli (♩≈165)",
      },
      { symbol: "Presto", name: "presto", meaning: "Çok hızlı (♩≈185)" },
    ],
  },
  {
    group: "Değişim işaretleri",
    color: palette.cyan500,
    items: [
      { symbol: "cresc.", name: "crescendo", meaning: "Giderek kuvvetlen" },
      { symbol: "dim.", name: "diminuendo", meaning: "Giderek hafifle" },
      { symbol: "rit.", name: "ritardando", meaning: "Giderek yavaşla" },
      { symbol: "accel.", name: "accelerando", meaning: "Giderek hızlan" },
      { symbol: "a tempo", name: "a tempo", meaning: "Önceki tempoya dön" },
    ],
  },
  {
    group: "Artikülasyon",
    color: palette.green500,
    items: [
      { symbol: "legato", name: "legato", meaning: "Düzgün ve bağlı" },
      { symbol: "staccato", name: "staccato", meaning: "Kısa ve kesik" },
      { symbol: "tenuto", name: "tenuto", meaning: "Tam değerinde tut" },
      { symbol: "marcato", name: "marcato", meaning: "Belirgin ve vurgulu" },
    ],
  },
  {
    group: "İfade",
    color: palette.amber500,
    items: [
      { symbol: "cantabile", name: "cantabile", meaning: "Şarkı söyler gibi" },
      { symbol: "dolce", name: "dolce", meaning: "Tatlı ve nazik" },
      { symbol: "espressivo", name: "espressivo", meaning: "İfadeli" },
    ],
  },
  {
    group: "Yapısal İşaretler",
    color: palette.violet400,
    items: [
      { symbol: "D.C.", name: "Da Capo", meaning: "Başa dön" },
      { symbol: "Fine", name: "Fine", meaning: "Son/bitiş" },
      { symbol: "Coda", name: "Coda", meaning: "Bitiş bölümü" },
      { symbol: "Fermata", name: "Fermata", meaning: "İstediğin kadar uzat" },
      {
        symbol: ":‖",
        name: "Tekrar İşareti",
        meaning: "Belirtilen bölümü tekrarla",
      },
    ],
  },
]

// ─── Tab 3: Terms Study ───────────────────────────────────────────────────────
/** Terim grupları (Çalışma listesi bunlardan birer ders üretir) */
export const TERM_GROUPS = TERMS_REF.map((g) => ({
  group: g.group,
  color: g.color,
  sample:
    g.items
      .slice(0, 3)
      .map((i) => i.name.toLowerCase())
      .join(", ") + "…",
}))

export function TermsStudy({ search = "", group: only }: { search?: string; group?: string }) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(["Dinamikler"]))

  function toggleGroup(g: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev)
      if (next.has(g)) next.delete(g)
      else next.add(g)
      return next
    })
  }

  const filtered = TERMS_REF.filter((g) => !only || g.group === only)
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          search === "" ||
          item.symbol.toLowerCase().includes(search.toLowerCase()) ||
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.meaning.toLowerCase().includes(search.toLowerCase()),
      ),
    }))
    .filter((g) => g.items.length > 0)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {filtered.map((group) => {
        const isOpen = !!only || openGroups.has(group.group) || search !== ""
        return (
          <div
            key={group.group}
            style={{
              background: colors.surface,
              borderRadius: radius.md,
              overflow: "hidden",
              border: `1px solid ${colors.border}`,
            }}
          >
            {/* Group header (tek grup gösterilirken yok) */}
            {!only && (
              <button
                onClick={() => toggleGroup(group.group)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: group.color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      color: colors.textSoft,
                      fontWeight: font.weight.bold,
                      fontSize: font.size.md,
                      fontFamily: font.family.ui,
                    }}
                  >
                    {group.group}
                  </span>
                  <span
                    style={{
                      background: `${group.color}22`,
                      color: group.color,
                      borderRadius: radius.lg,
                      padding: "1px 8px",
                      fontSize: font.size.sm,
                      fontFamily: font.family.ui,
                      fontWeight: font.weight.semibold,
                    }}
                  >
                    {group.items.length}
                  </span>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={colors.textMuted}
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{
                    transition: "transform 0.2s",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            )}

            {/* Items */}
            {isOpen && (
              <div
                style={{
                  borderTop: only ? "none" : `1px solid ${colors.border}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                {group.items.map((item) => (
                  <div
                    key={item.symbol}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "10px 16px",
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    <span
                      style={{
                        minWidth: 52,
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        fontStyle: "italic",
                        fontWeight: font.weight.bold,
                        fontSize: font.size.md,
                        color: group.color,
                        letterSpacing: "0.01em",
                      }}
                    >
                      {item.symbol}
                    </span>
                    <div>
                      <div
                        style={{
                          color: colors.textSecondary,
                          fontSize: font.size.sm,
                          fontFamily: font.family.ui,
                          fontWeight: font.weight.semibold,
                        }}
                      >
                        {item.name.toLowerCase() === item.symbol.toLowerCase() ? "" : item.name}
                      </div>
                      <div
                        style={{
                          color: colors.textMuted,
                          fontSize: font.size.sm,
                          fontFamily: font.family.ui,
                          marginTop: 2,
                        }}
                      >
                        {item.meaning}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
      {filtered.length === 0 && (
        <div
          style={{
            textAlign: "center",
            color: colors.textMuted,
            fontSize: font.size.sm,
            fontFamily: font.family.ui,
            padding: 32,
          }}
        >
          Arama sonucu bulunamadı
        </div>
      )}
    </div>
  )
}
