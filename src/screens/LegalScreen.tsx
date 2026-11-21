// Ayarlar › Gizlilik ve Ayarlar › Lisanslar: düz metin sayfaları (internet gerektirmez).
// Metinler data/legal.ts'de.
import { useState } from "react"
import { colors, font, radius, space } from "../design/tokens"
import { Card, ScreenHeader } from "../ui"
import { LICENSES, PRIVACY, type License } from "../data/legal"

const body = { fontSize: font.size.sm, color: colors.textSecondary, lineHeight: 1.55, margin: 0 } as const
const heading = { fontSize: font.size.md, fontWeight: font.weight.bold, color: colors.text, margin: 0 } as const

function LicenseCard({ l }: { l: License }) {
  const [open, setOpen] = useState(false)
  return (
    <Card style={{ display: "flex", flexDirection: "column", gap: space[2] }}>
      <p style={heading}>{l.name}</p>
      <p style={{ ...body, color: colors.textMuted }}>{l.use}</p>
      <p style={body}>{l.notice}</p>
      {l.text && (
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          style={{
            alignSelf: "flex-start",
            padding: `${space[2]}px 0`,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: font.family.ui,
            fontSize: font.size.sm,
            fontWeight: font.weight.semibold,
            color: colors.violetText,
          }}
        >
          {open ? "Lisans metnini gizle" : "Lisans metnini göster"}
        </button>
      )}
      {open && l.text && (
        <pre
          style={{
            margin: 0,
            padding: space[3],
            borderRadius: radius.sm,
            background: colors.fill,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontFamily: font.family.mono,
            fontSize: font.size.xs,
            lineHeight: 1.5,
            color: colors.textMuted,
          }}
        >
          {l.text}
        </pre>
      )}
    </Card>
  )
}

export default function LegalScreen({ page, onBack }: { page: "privacy" | "licenses"; onBack: () => void }) {
  return (
    <div
      style={{
        height: "100%",
        overflowY: "auto",
        background: colors.bg,
        fontFamily: font.family.ui,
        scrollbarWidth: "none",
      }}
    >
      <ScreenHeader title={page === "privacy" ? "Gizlilik" : "Lisanslar"} onBack={onBack} />
      <div
        style={{
          padding: `0 ${space[5]}px ${space[6] * 2}px`,
          display: "flex",
          flexDirection: "column",
          gap: space[4],
        }}
      >
        {page === "privacy" ? (
          PRIVACY.map((s) => (
            <section key={s.title} style={{ display: "flex", flexDirection: "column", gap: space[2] }}>
              <h2 style={heading}>{s.title}</h2>
              {s.body.map((p) => (
                <p key={p} style={body}>
                  {p}
                </p>
              ))}
            </section>
          ))
        ) : (
          <>
            <p style={body}>Solvato aşağıdaki açık kaynaklı yazı tiplerini ve yazılımları kullanır. Teşekkürler!</p>
            {LICENSES.map((l) => (
              <LicenseCard key={l.name} l={l} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
