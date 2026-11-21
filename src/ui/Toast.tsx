// Kısa bilgi balonu: `const toast = useToast()` → `toast.show("Kopyalandı")`, `{toast.el}` ekrana.
import { useRef, useState } from "react"
import { font, palette, radius, shadow, space } from "../design/tokens"

export function useToast(ms = 2200) {
  const [msg, setMsg] = useState<string | null>(null)
  const t = useRef<ReturnType<typeof setTimeout> | null>(null)
  const show = (m: string) => {
    setMsg(m)
    if (t.current) clearTimeout(t.current)
    t.current = setTimeout(() => setMsg(null), ms)
  }
  const el = msg ? (
    <div
      role="status"
      style={{
        position: "absolute",
        left: "50%",
        bottom: space[6],
        transform: "translateX(-50%)",
        padding: `10px ${space[4]}px`,
        borderRadius: radius.md,
        background: palette.violet950,
        color: palette.violet100,
        fontSize: font.size.sm,
        fontWeight: font.weight.semibold,
        zIndex: 90,
        whiteSpace: "nowrap",
        boxShadow: shadow.raised,
      }}
    >
      {msg}
    </div>
  ) : null
  return { show, el }
}
