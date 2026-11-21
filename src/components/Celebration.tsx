// Kutlama penceresi: seri, yeni ünvan, yeni seviye, günlük hedef (konfeti ile).
import { useEffect, useMemo } from "react"
import { getSettings } from "../utils/settings"
import { playGoalDone, playLevelUp, playStreakUp } from "../utils/audio"
import Icon, { type IconName } from "./Icons"
import Solfie from "./Solfie"

import { alpha, colors, font, gradient, palette, radius } from "../design/tokens"
export interface CelebrationData {
  rankUp?: { rank: number; label: string; nextLabel: string | null } // XP ile yeni ünvan
  goalDone?: boolean
  streak?: number // artış olduysa yeni seri
  unlocked?: string // yeni açılan soru seviyesi, ör. "Orta"
}

const COLORS = [
  palette.violet500,
  palette.violet400,
  palette.amber300,
  palette.green400,
  palette.pink400,
  palette.blue400,
]

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 46 }, (_, i) => ({
        left: Math.random() * 100,
        dx: (Math.random() - 0.5) * 160,
        rot: 360 + Math.random() * 720,
        dur: 2.2 + Math.random() * 1.6,
        delay: Math.random() * 0.5,
        size: 6 + Math.random() * 7,
        color: COLORS[i % COLORS.length],
        round: i % 3 === 0,
      })),
    [],
  )
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={
            {
              left: `${p.left}%`,
              width: p.size,
              height: p.round ? p.size : p.size * 1.6,
              borderRadius: p.round ? "50%" : 2,
              background: p.color,
              "--dx": `${p.dx}px`,
              "--rot": `${p.rot}deg`,
              "--dur": `${p.dur}s`,
              "--delay": `${p.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}

export default function Celebration({ data, onClose }: { data: CelebrationData; onClose: () => void }) {
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false

  useEffect(() => {
    getSettings().haptics && navigator.vibrate?.(30)
    if (data.rankUp || data.unlocked) playLevelUp()
    else if (data.goalDone) playGoalDone()
    else if (data.streak) playStreakUp()
    const t = setTimeout(onClose, 6500)
    return () => clearTimeout(t)
  }, [])

  const rows: { icon: IconName; title: string; sub: string; color: string }[] = []
  if (data.rankUp)
    rows.push({
      icon: "star",
      title: `Yeni ünvan: ${data.rankUp.label}`,
      sub: data.rankUp.nextLabel
        ? `${data.rankUp.rank}. ünvan · sırada ${data.rankUp.nextLabel}`
        : "En üst ünvana ulaştın",
      color: colors.amberText,
    })
  if (data.unlocked)
    rows.push({
      icon: "sparkles",
      title: `Yeni seviye: ${data.unlocked}`,
      sub: "Turlarda artık yeni sorular da var",
      color: colors.violetText,
    })
  if (data.goalDone)
    rows.push({
      icon: "target",
      title: "Günlük hedef tamam",
      sub: "Bugünkü çalışmanı bitirdin",
      color: colors.greenText,
    })
  if (data.streak)
    rows.push({
      icon: "flame",
      title: `${data.streak} günlük seri`,
      sub: data.streak === 1 ? "Yeni bir seri başladı" : "Devam, bozma!",
      color: colors.orangeText,
    })

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Kutlama"
      onClick={onClose}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 60,
        background: alpha(palette.slate950, 0.72),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      {!reduce && <Confetti />}
      <div
        className="celebrate-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 340,
          background: colors.surface,
          border: "1px solid rgba(139,92,246,0.35)",
          borderRadius: radius.lg,
          padding: "26px 20px 20px",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ marginBottom: 8, display: "flex", justifyContent: "center" }}>
          <Solfie size={88} pose="cheer" />
        </div>
        <p style={{ fontSize: font.size.lg, fontWeight: font.weight.heavy, color: colors.text, marginBottom: 14 }}>
          Harika iş!
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
          {rows.map((r) => (
            <div
              key={r.title}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                textAlign: "left",
                padding: "10px 14px",
                borderRadius: radius.md,
                background: colors.fill,
                border: `1px solid ${r.color}44`,
              }}
            >
              <span style={{ color: r.color, display: "flex" }}>
                <Icon name={r.icon} size={28} fill={r.icon !== "target"} />
              </span>
              <div>
                <p style={{ fontSize: font.size.md, fontWeight: font.weight.bold, color: r.color }}>{r.title}</p>
                <p style={{ fontSize: font.size.sm, color: colors.textMuted }}>{r.sub}</p>
              </div>
            </div>
          ))}
        </div>
        <button
          data-back
          onClick={onClose}
          style={{
            width: "100%",
            padding: "13px",
            borderRadius: radius.md,
            border: "none",
            cursor: "pointer",
            fontSize: font.size.md,
            fontWeight: font.weight.bold,
            color: colors.onPrimary,
            background: gradient.primaryFlat,
          }}
        >
          Devam
        </button>
      </div>
    </div>
  )
}
