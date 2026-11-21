// Zorlanılan notalar: en az 3 kez sorulmuş ve %70'in altında bilinmiş nota konumları.
// İlerleme ekranı ve haftalık rapor kullanır.
import { ALL_QUESTIONS } from "../data/questions"
import type { AppStats } from "../types"

export type WeakNote = {
  key: string
  note: string
  clef: "treble" | "bass"
  pct: number
  total: number
  /** Portede çizmek için (MusicalStaff): nota konumu, ek çizgiler, diyez/bemol */
  noteY: number
  ledgerLines: number[]
  accidental?: "sharp" | "flat"
}

export function weakNotes(stats: AppStats, limit = 6): WeakNote[] {
  return Object.entries(stats.noteStats ?? {})
    .filter(([, v]) => v.total >= 3 && v.correct / v.total < 0.7)
    .map(([key, v]) => {
      const [clef, y, acc] = key.split(":")
      const sample = ALL_QUESTIONS.find(
        (q) => q.clef === clef && String(q.noteY) === y && (q.accidental ?? "") === (acc ?? ""),
      )
      const oct = sample?.explanation.match(/\(([A-G])[♯♭]?(\d)\)/)
      const name = sample?.correctAnswer ?? "?"
      return {
        key,
        note: oct ? `${name}${oct[2]}` : name,
        clef: clef === "bass" ? ("bass" as const) : ("treble" as const),
        pct: Math.round((v.correct / v.total) * 100),
        total: v.total,
        noteY: Number(y),
        ledgerLines: sample?.ledgerLines ?? [],
        accidental: sample?.accidental,
      }
    })
    .sort((a, b) => a.pct - b.pct)
    .slice(0, limit)
}
