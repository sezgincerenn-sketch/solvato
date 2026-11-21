// Alt menü: Pratik · İlerleme · Çalışma

import { colors, font, space } from "../design/tokens"
import type { NavTab } from "../types"

// ─── Bottom navbar ─────────────────────────────────────────────────────────────
function NavIcon({ tab, active }: { tab: NavTab; active: boolean }) {
  const col = active ? colors.violetText : colors.textMuted
  const sw = active ? 2 : 1.5

  if (tab === "home")
    return (
      <svg
        width={22}
        height={22}
        viewBox="0 0 24 24"
        fill="none"
        stroke={col}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Piyano klavyesi */}
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <line x1="9" y1="12" x2="9" y2="19" />
        <line x1="15" y1="12" x2="15" y2="19" />
        <rect x="7.5" y="5" width="3" height="7" rx="0.8" fill={col} strokeWidth={1} />
        <rect x="13.5" y="5" width="3" height="7" rx="0.8" fill={col} strokeWidth={1} />
      </svg>
    )
  if (tab === "dashboard")
    return (
      <svg
        width={22}
        height={22}
        viewBox="0 0 24 24"
        fill="none"
        stroke={col}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="12" width="4" height="9" rx="1" />
        <rect x="10" y="7" width="4" height="14" rx="1" />
        <rect x="17" y="3" width="4" height="18" rx="1" />
      </svg>
    )
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke={col}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19V6a2 2 0 012-2h12a2 2 0 012 2v13" />
      <path d="M4 19a2 2 0 002 2h12a2 2 0 002-2" />
      <line x1="9" y1="9" x2="15" y2="9" />
      <line x1="9" y1="13" x2="13" y2="13" />
    </svg>
  )
}

export default function NavBar({ active, onChange }: { active: NavTab; onChange: (t: NavTab) => void }) {
  const tabs: { key: NavTab; label: string; activeColor: string }[] = [
    { key: "home", label: "Pratik", activeColor: colors.violetText },
    { key: "dashboard", label: "İlerleme", activeColor: colors.violetText },
    { key: "study", label: "Çalışma", activeColor: colors.violetText },
  ]

  return (
    <nav
      data-coach="nav"
      style={{
        flexShrink: 0,
        display: "flex",
        alignItems: "stretch",
        position: "relative",
        background: colors.overlay,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: `1px solid ${colors.border}`,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {tabs.map((t) => {
        const isActive = active === t.key
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            aria-current={isActive ? "page" : undefined}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: space[1],
              padding: `${space[4]}px 0`,
              background: "none",
              border: "none",
              cursor: "pointer",
              transition: "all 150ms",
            }}
          >
            <NavIcon tab={t.key} active={isActive} />
            <span
              style={{
                fontSize: font.size.xs,
                fontWeight: font.weight.semibold,
                color: isActive ? t.activeColor : colors.textMuted,
                fontFamily: font.family.ui,
              }}
            >
              {t.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
