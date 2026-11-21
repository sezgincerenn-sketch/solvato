// İlk kullanımda kısa tanıtım: ekrandaki öğeleri sırayla aydınlatıp altında/üstünde açıklama gösterir.
// Hedef öğeler `data-coach="<ad>"` ile işaretlenir.
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { colors, font, palette, radius, shadow, space } from "../design/tokens"
import Button from "./Button"

export type CoachStep = { target: string; title: string; text: string }

export default function Coachmark({ steps, onDone: done }: { steps: CoachStep[]; onDone: () => void }) {
  const [i, setI] = useState(0)
  const [rect, setRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const box = useRef<HTMLDivElement>(null)
  const step = steps[i]
  // Bitince ekranı başa kaydır (tanıtım sırasında aşağı kaymış olabilir)
  const onDone = () => {
    const first = box.current?.parentElement?.querySelector<HTMLElement>(`[data-coach="${steps[0].target}"]`)
    let el: HTMLElement | null = first ?? null
    while (el && el.scrollHeight <= el.clientHeight + 1) el = el.parentElement
    el?.scrollTo({ top: 0, behavior: "smooth" })
    done()
  }

  useLayoutEffect(() => {
    const root = box.current?.parentElement
    const el = root?.querySelector<HTMLElement>(`[data-coach="${step.target}"]`)
    if (!root || !el) {
      setRect(null)
      return
    }
    el.scrollIntoView({ block: "center", behavior: "auto" })
    const measure = () => {
      const r = el.getBoundingClientRect()
      const p = root.getBoundingClientRect()
      setRect({ x: r.left - p.left, y: r.top - p.top, w: r.width, h: r.height })
    }
    measure()
    const t = setTimeout(measure, 120)
    return () => clearTimeout(t)
  }, [step.target])

  useEffect(() => {
    const onResize = () => setI((v) => v) // yeniden ölç
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  const last = i === steps.length - 1
  const pad = 6
  const H = box.current?.parentElement?.clientHeight ?? 800
  const below = !rect || rect.y + rect.h / 2 < H / 2

  return (
    <div
      ref={box}
      role="dialog"
      aria-modal="true"
      aria-label="Kısa tanıtım"
      style={{ position: "absolute", inset: 0, zIndex: 95 }}
    >
      {/* Aydınlatılan alan: çevresi karartılır */}
      {rect ? (
        <div
          style={{
            position: "absolute",
            left: rect.x - pad,
            top: rect.y - pad,
            width: rect.w + pad * 2,
            height: rect.h + pad * 2,
            borderRadius: radius.lg,
            boxShadow: `0 0 0 9999px rgba(2,6,23,0.72), 0 0 0 2px ${palette.violet400}`,
            transition: "all 220ms cubic-bezier(0.2,0.8,0.2,1)",
            pointerEvents: "none",
          }}
        />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: "rgba(2,6,23,0.72)" }} />
      )}
      {/* Açıklama balonu */}
      <div
        className="animate-pop-in"
        key={i}
        style={{
          position: "absolute",
          left: space[4],
          right: space[4],
          ...(rect
            ? below
              ? { top: rect.y + rect.h + pad + 12 }
              : { bottom: H - rect.y + pad + 12 }
            : { top: "40%" }),
          maxWidth: 420,
          margin: "0 auto",
          padding: space[4],
          borderRadius: radius.lg,
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          boxShadow: shadow.raised,
          fontFamily: font.family.ui,
        }}
      >
        <p
          style={{
            fontSize: font.size.xs,
            fontWeight: font.weight.bold,
            color: colors.textSubtle,
            letterSpacing: font.tracking.label,
          }}
        >
          {i + 1}/{steps.length}
        </p>
        <p style={{ fontSize: font.size.md, fontWeight: font.weight.bold, color: colors.text, marginTop: 2 }}>
          {step.title}
        </p>
        <p style={{ fontSize: font.size.sm, color: colors.textMuted, marginTop: 4, lineHeight: 1.5 }}>{step.text}</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: space[3] }}>
          <Button variant="ghost" onClick={onDone} style={{ minHeight: 40 }}>
            Atla
          </Button>
          <Button onClick={() => (last ? onDone() : setI(i + 1))} style={{ minHeight: 40 }}>
            {last ? "Anladım" : "Sıradaki"}
          </Button>
        </div>
      </div>
    </div>
  )
}
