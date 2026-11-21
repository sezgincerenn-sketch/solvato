// Haftalık rapor: öğrencinin son 7 günü (bugün dahil). Öğretmene/veliye WhatsApp ile gider.
// Veri: stats.dailyQuestions (gün), dailyAccuracy (doğruluk), dailyTopics (konular), noteStats (zorlanılan notalar).
import { LEVEL_LABELS } from "../data/questions"
import { accuracyFor, currentStreak } from "../state/stats"
import { eachDay, isFuture, periodRange } from "./dates"
import { weakNotes } from "../state/weakNotes"
import type { AppStats, TopicKey } from "../types"
import { todayKey } from "./level"
import type { Settings } from "./settings"

export const TOPIC_LABELS: Record<TopicKey, string> = {
  treble: "Sol anahtarı notaları",
  bass: "Fa anahtarı notaları",
  accidentals: "Diyez ve bemol",
  rhythm: "Ritim",
  terms: "Müzik terimleri",
  writing: "Nota yazımı",
  chords: "Akorlar",
  ear: "Kulak (nota ve akor)",
}
const WEEKDAYS = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"]

export type WeeklyReport = ReturnType<typeof buildWeeklyReport>

const pct = (c: number, t: number) => (t > 0 ? Math.round((c / t) * 100) : null)

export function buildWeeklyReport(stats: AppStats, s: Settings, now = new Date()) {
  // Takvim haftası: Pazartesi–Pazar. Henüz gelmemiş günler `future` (şeritte silik, metinde yok).
  const { from, to } = periodRange("week", 0, now)
  const days = eachDay(from, to).map((d) => {
    const key = todayKey(d)
    const questions = stats.dailyQuestions?.[key] ?? 0
    return {
      key,
      date: d,
      label: WEEKDAYS[d.getDay()],
      questions,
      goalMet: questions >= s.dailyGoal,
      future: isFuture(d, now),
    }
  })
  const week = accuracyFor(stats, "week")
  const prev = accuracyFor(stats, "week", 1)

  const topicMap: Partial<Record<TopicKey, { correct: number; total: number }>> = {}
  for (const d of days)
    for (const [k, v] of Object.entries(stats.dailyTopics?.[d.key] ?? {})) {
      const cur = topicMap[k as TopicKey] ?? { correct: 0, total: 0 }
      topicMap[k as TopicKey] = { correct: cur.correct + v.correct, total: cur.total + v.total }
    }
  const topics = (Object.entries(topicMap) as [TopicKey, { correct: number; total: number }][])
    .map(([key, v]) => ({ key, label: TOPIC_LABELS[key], ...v, pct: pct(v.correct, v.total)! }))
    .sort((a, b) => b.total - a.total)

  const fmt = (d: Date, withMonth: boolean) =>
    d.toLocaleDateString("tr-TR", withMonth ? { day: "numeric", month: "long" } : { day: "numeric" })
  const first = days[0].date
  const last = days[6].date
  const range =
    first.getMonth() === last.getMonth()
      ? `${fmt(first, false)}–${fmt(last, true)}`
      : `${fmt(first, true)} – ${fmt(last, true)}`

  return {
    name: s.name.trim(),
    range,
    days,
    activeDays: days.filter((d) => d.questions > 0).length,
    goalDays: days.filter((d) => d.goalMet).length,
    questions: days.reduce((a, d) => a + d.questions, 0),
    accuracy: pct(week.correct, week.total),
    prevAccuracy: pct(prev.correct, prev.total),
    topics,
    weak: weakNotes(stats, 4),
    streak: currentStreak(stats),
    level: LEVEL_LABELS[s.level],
    dailyGoal: s.dailyGoal,
    teacherCode: s.teacherCode,
  }
}

/** WhatsApp'a uygun düz metin */
export function weeklyReportText(r: WeeklyReport): string {
  const lines = [`🎹 Solvato · Haftalık rapor`, `${r.name ? r.name + " · " : ""}${r.range}`, ""]
  if (r.questions === 0) {
    lines.push("Bu hafta çalışma yapılmadı.")
  } else {
    const past = r.days.filter((d) => !d.future)
    lines.push(`Çalıştığı gün: ${r.activeDays}/${past.length} (hedef tutturulan: ${r.goalDays})`)
    lines.push(past.map((d) => `${d.label} ${d.goalMet ? "✅" : d.questions > 0 ? "🟡" : "⬜"}`).join("  "))
    lines.push("✅ hedef tamam · 🟡 çalıştı · ⬜ çalışmadı")
    let acc = `Çözülen soru: ${r.questions}`
    if (r.accuracy !== null) {
      acc += ` · Doğruluk %${r.accuracy}`
      if (r.prevAccuracy !== null) acc += ` (geçen hafta %${r.prevAccuracy})`
    }
    lines.push(acc)
    if (r.topics.length) {
      lines.push("", "Konular:")
      r.topics.forEach((t) => lines.push(`• ${t.label}: ${t.total} soru, %${t.pct}`))
    }
    if (r.weak.length) {
      lines.push(
        "",
        `Zorlandığı notalar: ${r.weak.map((w) => `${w.note} (${w.clef === "treble" ? "sol" : "fa"})`).join(", ")}`,
      )
    }
  }
  lines.push("", `Seviye: ${r.level} · Günlük hedef: ${r.dailyGoal} soru · Seri: ${r.streak} gün`)
  if (r.teacherCode) lines.push(`Öğretmen kodu: ${r.teacherCode}`)
  return lines.join("\n")
}
