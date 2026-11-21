// Bir tur için soru seçimi: kategoriye, seviyeye ve ayarlara göre karışık 10 soru
import { allTopics } from "../utils/teacherCode"
import type { FilterCategory, Question } from "../types"
import { ALL_QUESTIONS, questionLevel } from "./questions"
import { buildEarQuestions } from "./ear"
import { ALL_NOTES, getSettings } from "../utils/settings"

export const SESSION_LENGTH = 10

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Nota sorularında şıklar nota sırasıyla durur; diğer sorularda doğru cevap
// hep aynı yerde çıkmasın diye şıklar karıştırılır.
function shuffleOptions(q: Question): Question {
  if (q.category === "note_identification" || !q.options || q.optionScores) return q
  return { ...q, options: shuffleArray(q.options) }
}

// Orta/İleri seviyede soruların yarısı kendi seviyesinden gelsin
// (yoksa kolay sorular çok olduğu için zor sorular az çıkar)
function sampleWeighted(pool: Question[], n: number, lv: number) {
  if (lv <= 1) return shuffleArray(pool).slice(0, n)
  const cur = shuffleArray(pool.filter((q) => questionLevel(q) === lv))
  const half = Math.min(cur.length, Math.ceil(n / 2))
  const picked = cur.slice(0, half)
  const ids = new Set(picked.map((q) => q.id))
  const rest = shuffleArray(pool.filter((q) => !ids.has(q.id))).slice(0, n - picked.length)
  return shuffleArray([...picked, ...rest])
}

export function getQuestions(category: FilterCategory) {
  if (category === "ear") return buildEarQuestions() // her tur yeniden üretilir, şıklar zaten karışık
  return pickQuestions(category).map(shuffleOptions)
}

export function pickQuestions(category: FilterCategory) {
  const settings = getSettings()

  // Seviye: kullanıcının seviyesinin üstündeki sorular gelmez.
  // Anahtar: karışık turlarda sadece seçili anahtar(lar)ın notaları gelir.
  const lv = settings.level
  const clefOk = (q: Question) => category !== "all" || !q.clef || settings.clef === "both" || q.clef === settings.clef
  const levelOk = (q: Question) => questionLevel(q) <= lv
  const naturals = ALL_QUESTIONS.filter((q) => !q.accidental && levelOk(q) && clefOk(q))
  // Diyez & Bemol kategorisini kullanıcı kendisi seçtiyse seviyeden bağımsız gelir
  const accidentals = ALL_QUESTIONS.filter((q) => q.accidental && clefOk(q))

  // Çalışılacak notalar (Ayarlar): nota sorularını süz, şıkları da bu notalardan kur
  const enabled = settings.notes?.length ? settings.notes : ALL_NOTES
  const noteSet = new Set(enabled)
  const limited = enabled.length < ALL_NOTES.length
  const limitNotes = (qs: Question[]) =>
    !limited
      ? qs
      : qs
          .filter((q) => q.category !== "note_identification" || noteSet.has(q.noteName ?? q.correctAnswer))
          .map((q) => {
            if (q.category !== "note_identification") return q
            const others = shuffleArray(enabled.filter((n) => n !== q.correctAnswer)).slice(0, 3)
            const options = [q.correctAnswer, ...others].sort((a, b) => ALL_NOTES.indexOf(a) - ALL_NOTES.indexOf(b))
            return { ...q, options }
          })
  // Diyez/bemolde temel nota seçili notalardan biri olsun (çok az kalırsa kısıtlama yok)
  const limitAccidentals = (qs: Question[]) => {
    if (!limited) return qs
    const f = qs.filter((q) => noteSet.has(q.noteName ?? ""))
    return f.length >= 6 ? f : qs
  }

  if (category === "accidentals") return shuffleArray(limitAccidentals(accidentals)).slice(0, SESSION_LENGTH)

  let pool = naturals
  if (category === "treble") pool = naturals.filter((q) => q.category === "note_identification" && q.clef === "treble")
  else if (category === "bass") pool = naturals.filter((q) => q.category === "note_identification" && q.clef === "bass")
  else if (category === "rhythm") pool = naturals.filter((q) => q.category === "rhythm")
  else if (category === "terms") pool = naturals.filter((q) => q.category === "musical_terms")
  else if (category === "writing") pool = ALL_QUESTIONS.filter((q) => q.category === "writing" && levelOk(q))
  pool = limitNotes(pool)

  // Öğretmen konu seçtiyse karışık tur yalnızca o konulardan gelir (kulak/akor karışık turda yok)
  const topics = settings.topics ?? []
  if (category === "all" && !allTopics(topics)) {
    const topicOfQ = (q: Question) =>
      q.category === "note_identification" ? q.clef : q.category === "musical_terms" ? "terms" : q.category
    const picked = pool.filter((q) => topics.includes(topicOfQ(q) ?? ""))
    if (picked.length >= 5) pool = picked
  }

  // Karışık turda Orta seviyeden itibaren birkaç diyez/bemol sorusu da gelir
  if (category === "all" && lv >= 2 && !limited) {
    const accPool = limitAccidentals(accidentals)
    const take = 3
    const picked = shuffleArray(accPool).slice(0, take)
    const rest = sampleWeighted(pool, SESSION_LENGTH - picked.length, lv)
    return shuffleArray([...picked, ...rest])
  }
  return sampleWeighted(pool, SESSION_LENGTH, lv)
}

export function getWeakQuestions(keys: string[]) {
  const set = new Set(keys)
  const pool = ALL_QUESTIONS.filter(
    (q) =>
      q.category === "note_identification" && set.has(`${q.clef}:${q.noteY}${q.accidental ? ":" + q.accidental : ""}`),
  )
  return shuffleArray(pool).slice(0, SESSION_LENGTH)
}

/** Kısa kategori adları (Son turlar listesi, kartlar) */
export const ROUND_LABELS: Record<FilterCategory, string> = {
  all: "Karışık",
  treble: "Sol Anahtarı",
  bass: "Fa Anahtarı",
  accidentals: "Diyez & Bemol",
  rhythm: "Ritim",
  writing: "Nota Yazımı",
  terms: "Müzik Terimleri",
  ear: "Kulak",
}
