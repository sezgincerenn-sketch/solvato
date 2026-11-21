// Kulak soruları: her turda yeniden üretilir (sabit soru bankası yok).
//   "note"  → önce referans Do4, sonra soru notası çalınır; "Hangi nota?" (4 şık)
//   "chord" → bir akor çalınır; "Akorun türü ne?" (4 şık: Majör, Minör, Eksik, Artık)
// Seviye: Başlangıç = Do–Sol arası notalar, akorda yalnız majör/minör çalınır (eksik/artık şık olarak durur)
//         Orta/İleri = 7 nota, dört akor türü de çalınır; İleri'de nota şıkları komşu notalardan.
// Öğretmenin "çalışılacak notalar" ayarı burada da geçerli.
import type { Pitch, Question } from "../types"
import { ALL_NOTES, getSettings } from "../utils/settings"

const ROUND = 10
const ID_BASE = 900000

const shuffle = <T>(a: T[]) => {
  const r = [...a]
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[r[i], r[j]] = [r[j], r[i]]
  }
  return r
}

// Kromatik dizi: Do4'ten yarım ses sayarak perde bulmak için
const CHROMATIC = ["Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si"]
const semi = (name: string) => CHROMATIC.indexOf(name)
const pitchAt = (s: number): Pitch => ({ name: CHROMATIC[s % 12], octave: 4 + Math.floor(s / 12) })

// Akor türleri: kökten yarım ses aralıkları ve nasıl duyulduğu (açıklamada)
const CHORD_TYPES = ["Majör", "Minör", "Eksik", "Artık"] as const
type ChordType = (typeof CHORD_TYPES)[number]
const CHORD_STEPS: Record<ChordType, [number, number]> = {
  Majör: [4, 7],
  Minör: [3, 7],
  Eksik: [3, 6],
  Artık: [4, 8],
}
const CHORD_FEEL: Record<ChordType, string> = {
  Majör: "Majör parlak ve neşeli duyulur.",
  Minör: "Minör daha hüzünlü, karanlık duyulur.",
  Eksik: "Eksik akor gergin duyulur, sanki bir yere çözülmek ister.",
  Artık: "Artık akor belirsiz, havada asılı gibi duyulur.",
}
// Akorların doğru yazılışı (açıklamada gösterilir): kök → [majör, minör, eksik, artık]
const CHORD_SPELLING: Record<string, [string, string, string, string]> = {
  Do: ["Do–Mi–Sol", "Do–Mi♭–Sol", "Do–Mi♭–Sol♭", "Do–Mi–Sol♯"],
  Re: ["Re–Fa♯–La", "Re–Fa–La", "Re–Fa–La♭", "Re–Fa♯–La♯"],
  Mi: ["Mi–Sol♯–Si", "Mi–Sol–Si", "Mi–Sol–Si♭", "Mi–Sol♯–Si♯"],
  Fa: ["Fa–La–Do", "Fa–La♭–Do", "Fa–La♭–Do♭", "Fa–La–Do♯"],
  Sol: ["Sol–Si–Re", "Sol–Si♭–Re", "Sol–Si♭–Re♭", "Sol–Si–Re♯"],
  La: ["La–Do♯–Mi", "La–Do–Mi", "La–Do–Mi♭", "La–Do♯–Mi♯"],
}

function noteQuestion(id: number, target: string, pool: string[], level: number): Question {
  const n = 4
  // Havuz 4'ten azsa (öğretmen 3 nota seçtiyse) eksik şıklar diğer notalardan tamamlanır
  let distractors = pool.filter((x) => x !== target)
  if (distractors.length < n - 1)
    distractors = [...distractors, ...shuffle(ALL_NOTES.filter((x) => x !== target && !pool.includes(x)))].slice(
      0,
      Math.max(n - 1, distractors.length),
    )
  if (level >= 3) {
    // İleri: şıklar hedefin komşularından (Mi için Re, Fa, Sol gibi) — ayırt etmek zor
    const i = ALL_NOTES.indexOf(target)
    distractors.sort((a, b) => Math.abs(ALL_NOTES.indexOf(a) - i) - Math.abs(ALL_NOTES.indexOf(b) - i))
  } else distractors = shuffle(distractors)
  const options = shuffle([target, ...distractors.slice(0, n - 1)])
  const step = ALL_NOTES.indexOf(target)
  return {
    id,
    category: "ear",
    questionText: "Önce Do çalınıyor, sonra bir nota. İkinci nota hangisi?",
    options,
    correctAnswer: target,
    explanation:
      step === 0
        ? "İki kez aynı nota çalındı: Do."
        : `İkinci nota ${target} idi: Do'dan ${step} basamak yukarıda (${ALL_NOTES.slice(0, step + 1).join("–")}).`,
    ear: { kind: "note", ref: { name: "Do", octave: 4 }, target: { name: target, octave: 4 } },
  }
}

function chordQuestion(id: number, root: string, type: ChordType): Question {
  const r = semi(root)
  const [third, fifth] = CHORD_STEPS[type]
  const notes = [r, r + third, r + fifth].map(pitchAt)
  return {
    id,
    category: "ear",
    questionText: "Bu akorun türü ne?",
    options: [...CHORD_TYPES], // sıra sabit: Majör, Minör, Eksik, Artık
    correctAnswer: type,
    explanation: `${root} ${type.toLowerCase()} çalındı (${CHORD_SPELLING[root][CHORD_TYPES.indexOf(type)]}). ${CHORD_FEEL[type]}`,
    ear: { kind: "chord", notes },
  }
}

export function buildEarQuestions(): Question[] {
  const s = getSettings()
  const level = s.level
  // Başlangıçta Do–Sol; öğretmenin seçtiği notalarla kesişir, en az 3 nota kalır
  const base = level <= 1 ? ALL_NOTES.slice(0, 5) : ALL_NOTES
  let pool = base.filter((n) => s.notes.includes(n))
  if (pool.length < 3) pool = s.notes.length >= 3 ? s.notes : base
  const noteCount = level <= 1 ? 6 : 5

  const qs: Question[] = []
  let last = ""
  for (let i = 0; i < noteCount; i++) {
    const choices = pool.filter((n) => n !== last)
    const t = choices[Math.floor(Math.random() * choices.length)]
    last = t
    qs.push(noteQuestion(ID_BASE + i, t, pool, level))
  }
  const roots = Object.keys(CHORD_SPELLING)
  for (let i = noteCount; i < ROUND; i++) {
    // Başlangıç: yalnız majör/minör çalınır. Orta/İleri: dört tür, majör/minör biraz daha sık
    const types: ChordType[] = level <= 1 ? ["Majör", "Minör"] : ["Majör", "Majör", "Minör", "Minör", "Eksik", "Artık"]
    const type = types[Math.floor(Math.random() * types.length)]
    qs.push(chordQuestion(ID_BASE + i, roots[Math.floor(Math.random() * roots.length)], type))
  }
  return shuffle(qs)
}
