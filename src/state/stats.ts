// İstatistikler: XP, seri, günlük hedef, seviye ilerlemesi. Telefonda saklanır.
import { eachDay, periodRange, type Period } from "../utils/dates"
import type { SessionResult, AppStats, RoundRecord, TopicKey } from "../types"
import { DEFAULT_STATS } from "../types"
import { LEVEL_LABELS } from "../data/questions"
import { type CelebrationData } from "../components/Celebration"
import { rankFromXp, todayKey } from "../utils/level"
import { getSettings, updateSettings } from "../utils/settings"

export const STATS_KEY = "notausta_stats_v1"
const HISTORY_MAX = 100

/** Son `days` gündeki (bugün dahil) doğruluk; `days` yoksa tüm zamanlar. `offset`: kaç gün önceden başlasın */
/** Doğruluk: dönem yoksa tüm zamanlar; "week"/"month" takvim dönemi (utils/dates.ts), offset 1 = önceki dönem */
export function accuracyFor(s: AppStats, period?: Period, offset = 0): { correct: number; total: number } {
  if (!period) {
    const ca = s.categoryAccuracy
    const zero = { correct: 0, total: 0 }
    const list = [ca.treble, ca.bass, ca.rhythm, ca.terms, ca.chords, ca.writing ?? zero, ca.ear ?? zero]
    return list.reduce((a, c) => ({ correct: a.correct + c.correct, total: a.total + c.total }), {
      correct: 0,
      total: 0,
    })
  }
  let correct = 0
  let total = 0
  const { from, to } = periodRange(period, offset)
  for (const day of eachDay(from, to)) {
    const d = s.dailyAccuracy?.[todayKey(day)]
    if (d) {
      correct += d.correct
      total += d.total
    }
  }
  return { correct, total }
}

export function loadStats(): AppStats {
  try {
    const raw = localStorage.getItem(STATS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppStats
      return {
        ...DEFAULT_STATS,
        ...parsed,
        categoryAccuracy: {
          ...DEFAULT_STATS.categoryAccuracy,
          ...parsed.categoryAccuracy,
        },
      }
    }
  } catch (_) {
    /* ignore */
  }
  return { ...DEFAULT_STATS }
}

export function saveStats(s: AppStats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(s))
  } catch (_) {
    /* ignore */
  }
}

// ─── App root ──────────────────────────────────────────────────────────────────
// Bugün ya da dün hedef tamamlanmadıysa seri sıfırdır (kayıtlı değer eski kalabilir)
export function currentStreak(s: AppStats): number {
  if (!s.lastPlayDate) return 0
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()
  return s.lastPlayDate === today || s.lastPlayDate === yesterday ? s.streak : 0
}

// Seans sonrası ortak istatistik güncellemesi (seri, XP, seans sayısı, günlük kayıt)
export function applyProgress(
  prev: AppStats,
  pts: number,
  questionCount = 0,
  round?: Omit<RoundRecord, "at">,
): AppStats {
  const next: AppStats = {
    ...prev,
    dailyLog: { ...(prev.dailyLog ?? {}) },
    dailyQuestions: { ...(prev.dailyQuestions ?? {}) },
    noteStats: { ...(prev.noteStats ?? {}) },
    dailyAccuracy: { ...(prev.dailyAccuracy ?? {}) },
  }
  if (round) {
    next.history = [{ ...round, at: Date.now() }, ...(prev.history ?? [])].slice(0, HISTORY_MAX)
    const d = next.dailyAccuracy![todayKey()] ?? { correct: 0, total: 0 }
    next.dailyAccuracy![todayKey()] = { correct: d.correct + round.correct, total: d.total + round.total }
  }
  next.totalPoints += pts
  next.totalSessions += 1
  const k = todayKey()
  next.dailyLog[k] = (next.dailyLog[k] ?? 0) + 1
  next.dailyQuestions[k] = (next.dailyQuestions[k] ?? 0) + questionCount
  // Seri: yalnızca günlük hedef tamamlanınca o gün için +1 (lastPlayDate = seri sayılan son gün)
  const today = new Date().toDateString()
  if (next.dailyQuestions[k] >= getSettings().dailyGoal && next.lastPlayDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    next.streak = next.lastPlayDate === yesterday ? next.streak + 1 : 1
    next.lastPlayDate = today
  }
  return next
}

// Seans öncesi ve sonrası istatistikleri karşılaştırıp kutlanacak olayları bulur
export function detectCelebration(prev: AppStats, next: AppStats): CelebrationData | null {
  const data: CelebrationData = {}
  const before = rankFromXp(prev.totalPoints)
  const after = rankFromXp(next.totalPoints)
  if (after.rank > before.rank) data.rankUp = { rank: after.rank, label: after.label, nextLabel: after.nextLabel }
  const k = todayKey()
  const goal = getSettings().dailyGoal
  if ((prev.dailyQuestions?.[k] ?? 0) < goal && (next.dailyQuestions?.[k] ?? 0) >= goal) data.goalDone = true
  if (next.lastPlayDate !== prev.lastPlayDate) data.streak = next.streak
  return data.rankUp || data.goalDone || data.streak ? data : null
}

// Seviye atlama: mevcut seviyede en az LEVEL_NEED soru çözüp %80 doğru
// yapınca bir üst seviyenin soruları açılır. Açılan seviyenin adını döner.
export const LEVEL_NEED = 50

export const LEVEL_ACC = 0.8

export function recordLevelProgress(results: SessionResult[]): string | null {
  const s = getSettings()
  if (s.level >= 3 || results.length === 0) return null
  const n = s.levelProgress.n + results.length
  const c = s.levelProgress.c + results.filter((r) => r.correct).length
  if (n >= LEVEL_NEED && c / n >= LEVEL_ACC) {
    const level = (s.level + 1) as 2 | 3
    updateSettings({ level, levelProgress: { n: 0, c: 0 } })
    return LEVEL_LABELS[level]
  }
  // Eski denemeler sonsuza dek ağırlık taşımasın: son ~LEVEL_NEED soruya bak
  const k = n > LEVEL_NEED ? LEVEL_NEED / n : 1
  updateSettings({ levelProgress: { n: Math.round(n * k), c: Math.round(c * k) } })
  return null
}

// ─── Konu kaydı (haftalık rapor) ─────────────────────────────────────────────
const TOPIC_DAYS = 60

export function topicOf(r: SessionResult): TopicKey {
  if (r.category === "note_identification") return r.accidental ? "accidentals" : r.clef === "bass" ? "bass" : "treble"
  if (r.category === "musical_terms") return "terms"
  return r.category // rhythm | writing | ear
}

/** Bugünün konu sayılarına ekler; 60 günden eski günleri siler. `s` yerinde değişir. */
export function recordTopics(s: AppStats, items: { topic: TopicKey; correct: number; total: number }[]) {
  const k = todayKey()
  const all = { ...(s.dailyTopics ?? {}) }
  const day = { ...(all[k] ?? {}) }
  for (const it of items) {
    const cur = day[it.topic] ?? { correct: 0, total: 0 }
    day[it.topic] = { correct: cur.correct + it.correct, total: cur.total + it.total }
  }
  all[k] = day
  const cutoff = todayKey(new Date(Date.now() - TOPIC_DAYS * 86400000))
  for (const d of Object.keys(all)) if (d < cutoff) delete all[d]
  s.dailyTopics = all
}

// ─── Yıldızlar ───────────────────────────────────────────────────────────────
/** Konunun en iyi yıldızını günceller; önceki en iyiyi döner. `s` yerinde değişir. */
export function recordStars(s: AppStats, key: string, stars: number): number {
  const had = s.bestStars?.[key]
  // İlk tur 0 yıldız olsa da kaydedilir: ana sayfada boş yıldızlar "oynandı, hedef 3" der
  if (had === undefined || stars > had) s.bestStars = { ...(s.bestStars ?? {}), [key]: stars }
  return had ?? 0
}
