// Kulak sorusunun üst alanı: soruyu çalar, "Tekrar dinle" düğmesi gösterir.
//   note  → referans Do, kısa ara, soru notası
//   chord → notalar tek tek, sonra birlikte
// Ses ayarı kapalıysa soru dinlenemez; aynı yerde "Sesi aç" düğmesi çıkar.
import { useCallback, useEffect, useState } from "react"
import { alpha, category, colors, font, palette, radius } from "../design/tokens"
import type { AnswerState, EarPrompt as Prompt } from "../types"
import { playPianoNote } from "../utils/audio"
import { updateSettings, useSettings } from "../utils/settings"
import Icon from "./Icons"

const NOTE_GAP = 0.9 // referans Do ile soru notası arası (sn)
const ARP_GAP = 0.38 // akor notaları arası (sn)

/** Soruyu çalar; çalma süresini (ms) döner */
export function playEar(p: Prompt): number {
  if (p.kind === "note") {
    playPianoNote(p.ref.name, p.ref.octave)
    playPianoNote(p.target.name, p.target.octave, NOTE_GAP)
    return (NOTE_GAP + 1) * 1000
  }
  p.notes.forEach((n, i) => playPianoNote(n.name, n.octave, i * ARP_GAP, 0.32))
  const together = p.notes.length * ARP_GAP + 0.25
  p.notes.forEach((n) => playPianoNote(n.name, n.octave, together, 0.24))
  return (together + 1.2) * 1000
}

export default function EarPrompt({ prompt, answerState }: { prompt: Prompt; answerState: AnswerState }) {
  const sound = useSettings().soundKeys
  const [playing, setPlaying] = useState(false)
  const color = category.ear.base
  // Cevaptan sonra açıklama kutusuna yer açmak için küçülür
  const size = answerState === "pending" ? 104 : 64

  const play = useCallback(() => {
    const ms = playEar(prompt)
    setPlaying(true)
    setTimeout(() => setPlaying(false), ms)
  }, [prompt])

  // Soru açılınca kendiliğinden bir kez çal
  useEffect(() => {
    if (!sound) return
    const t = setTimeout(play, 350)
    return () => clearTimeout(t)
  }, [play, sound])

  if (!sound)
    return (
      <div style={{ textAlign: "center", padding: 20, fontFamily: font.family.ui }}>
        <p style={{ fontSize: font.size.md, fontWeight: font.weight.bold, color: colors.text }}>Ses kapalı</p>
        <p style={{ fontSize: font.size.sm, color: colors.textMuted, margin: "4px 0 14px" }}>
          Kulak soruları için sesi açman gerek.
        </p>
        <button
          onClick={() => updateSettings({ soundKeys: true })}
          style={{
            minHeight: 44,
            padding: "0 20px",
            borderRadius: radius.pill,
            border: "none",
            cursor: "pointer",
            background: palette.violet600,
            color: palette.white,
            fontWeight: font.weight.bold,
            fontFamily: font.family.ui,
          }}
        >
          Sesi aç
        </button>
      </div>
    )

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: answerState === "pending" ? 14 : 8,
        padding: answerState === "pending" ? 16 : "10px 16px",
        fontFamily: font.family.ui,
      }}
    >
      <button
        onClick={play}
        aria-label="Tekrar dinle"
        style={{
          position: "relative",
          width: size,
          height: size,
          borderRadius: "50%",
          border: `2px solid ${alpha(color, 0.5)}`,
          background: alpha(color, playing ? 0.22 : 0.12),
          color: category.ear.text,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "background .2s, width .2s, height .2s",
        }}
      >
        {playing && (
          <span
            aria-hidden
            style={{
              position: "absolute",
              inset: -8,
              borderRadius: "50%",
              border: `2px solid ${alpha(color, 0.45)}`,
              animation: "earPulse 1s ease-out infinite",
            }}
          />
        )}
        <Icon name="speaker" size={Math.round(size * 0.42)} />
      </button>
      <p style={{ fontSize: font.size.sm, color: colors.textMuted, textAlign: "center" }}>
        {answerState !== "pending"
          ? "Bir daha dinlemek için dokun"
          : prompt.kind === "note"
            ? "Tekrar dinlemek için dokun"
            : "Notalar tek tek, sonra birlikte çalınır · tekrar dinlemek için dokun"}
      </p>
      <style>
        {
          "@keyframes earPulse { from { opacity: .9; transform: scale(.92) } to { opacity: 0; transform: scale(1.25) } }"
        }
      </style>
    </div>
  )
}
