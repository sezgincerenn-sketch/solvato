// Ritmi Tut oyunu: 4/4'lük tek ölçülük ritimler ve dokunuşların puanlanması.
// Her ritim Notation dilinde yazılır (components/Notation.tsx); vuruş zamanları aynı metinden çıkar,
// böylece çizilen ile çalınan/ölçülen hep aynıdır.
import type { QuestionLevel } from "./questions"

/** Seviyeye göre ritimler. Toplam süre her zaman 4 vuruş.
 *  Başlangıç: dörtlük, ikilik, dörtlük sus, sekizlik çiftleri
 *  Orta: + onaltılıklar (ssss), sekizlik + iki onaltılık (ess), iki onaltılık + sekizlik (sse), noktalı dörtlük/ikilik
 *  İleri: + noktalı sekizlik + onaltılık (e.s), onaltılık–sekizlik–onaltılık (ses), senkop, sekizlik sus */
export const RHYTHM_PATTERNS: Record<QuestionLevel, string[]> = {
  1: [
    "q q ee q",
    "h ee q",
    "q ee q q",
    "ee ee q q",
    "q qr ee q",
    "q q h",
    "q h q",
    "ee q h",
    "qr q ee q",
    "ee ee ee q",
  ],
  2: [
    "ssss q q q",
    "q ess q q",
    "sse q h",
    "ess sse q q",
    "q. e q q",
    "h. ee",
    "ssss ee q q",
    "q sse ess q",
    "ee ssss q q",
    "q. e ess q",
  ],
  3: [
    "e.s e.s q q",
    "q e.s ssss q",
    "e.s ess sse q",
    "ses q ses q",
    "e q e e.s q",
    "er e ess e.s q",
    "q. e e.s ssss",
    "ssss e.s sse ess",
    "e.s q. e q",
    "sse er e e.s q",
  ],
}

/** Seviyeye göre tempo (dörtlük / dakika) */
// Onaltılıklı seviyeler biraz daha yavaş: notalar sıklaşınca dokunuşlar karışmasın
export const TEMPO: Record<QuestionLevel, number> = { 1: 76, 2: 66, 3: 72 }

/** Bir turdaki ritim sayısı */
export const RHYTHM_ROUND = 6

const BASE: Record<string, number> = { w: 4, h: 2, q: 1, e: 0.5, s: 0.25 }

/** Ritim metnini vuruşlara çevirir: her nota/sus için başlangıç (vuruş cinsinden) ve sus mu */
export function parseRhythm(score: string): { at: number; rest: boolean; dur: number }[] {
  const out: { at: number; rest: boolean; dur: number }[] = []
  let t = 0
  for (const tok of score.trim().split(/\s+/)) {
    // Bağlı gruplar: ee, ssss, ess, sse, e.s, ses (Notation ile aynı yazım)
    if (/^(?:[es]\.?){2,4}$/.test(tok)) {
      for (const g of tok.matchAll(/([es])(\.?)/g)) {
        const dur = BASE[g[1]] * (g[2] ? 1.5 : 1)
        out.push({ at: t, rest: false, dur })
        t += dur
      }
      continue
    }
    const m = tok.match(/^([whqes])(r?)(\.?)$/)
    if (!m) continue
    const dur = BASE[m[1]] * (m[3] ? 1.5 : 1)
    out.push({ at: t, rest: !!m[2], dur })
    t += dur
  }
  return out
}

/** Dokunulması gereken anlar (vuruş cinsinden) */
export const onsets = (score: string) =>
  parseRhythm(score)
    .filter((n) => !n.rest)
    .map((n) => n.at)

export type TapGrade = "perfect" | "good" | "miss"
export interface TapResult {
  /** Her nota için: zamanlama farkı (ms, + geç) ve not */
  notes: { beat: number; deltaMs: number | null; grade: TapGrade }[]
  /** Hiçbir notaya denk gelmeyen dokunuşlar (vuruş cinsinden) */
  extra: number[]
  /** 0–1 */
  score: number
  /** Ortalama sapma (ms, mutlak) */
  meanAbsMs: number
  /** Ortalama işaretli sapma (ms): + geride kalıyor, − acele ediyor */
  biasMs: number
}

/**
 * Dokunuşları notalarla eşleştirir. taps: ölçü başından itibaren saniye.
 * Pencere: tam ±90 ms, yakın ±180 ms (başlangıç seviyesinde biraz geniş).
 */
export function gradeTaps(score: string, tapsSec: number[], bpm: number, level: QuestionLevel): TapResult {
  const beatSec = 60 / bpm
  // Pencereler notalar arasındaki en kısa aralığın yarısını geçmez: bir dokunuş komşu notaya sayılmasın
  const beats = onsets(score)
  const minGap = beats.slice(1).reduce((m, b, i) => Math.min(m, (b - beats[i]) * beatSec), Infinity)
  const good = Math.min(level === 1 ? 0.2 : 0.18, minGap * 0.5)
  const perfect = Math.min(level === 1 ? 0.11 : 0.09, good * 0.6)
  const free = [...tapsSec].sort((a, b) => a - b)
  const used = new Set<number>()
  const notes = onsets(score).map((beat) => {
    const target = beat * beatSec
    let best = -1
    let bestD = Infinity
    free.forEach((t, i) => {
      if (used.has(i)) return
      const d = Math.abs(t - target)
      if (d < bestD) {
        bestD = d
        best = i
      }
    })
    if (best < 0 || bestD > good) return { beat, deltaMs: null, grade: "miss" as TapGrade }
    used.add(best)
    const delta = free[best] - target
    return { beat, deltaMs: Math.round(delta * 1000), grade: (bestD <= perfect ? "perfect" : "good") as TapGrade }
  })
  const extra = free.filter((_, i) => !used.has(i)).map((t) => t / beatSec)
  const hit = notes.filter((n) => n.grade !== "miss")
  const raw =
    notes.reduce((a, n) => a + (n.grade === "perfect" ? 1 : n.grade === "good" ? 0.6 : 0), 0) / notes.length -
    0.2 * extra.length
  const deltas = hit.map((n) => n.deltaMs ?? 0)
  return {
    notes,
    extra,
    score: Math.max(0, Math.min(1, raw)),
    meanAbsMs: deltas.length ? Math.round(deltas.reduce((a, d) => a + Math.abs(d), 0) / deltas.length) : 0,
    biasMs: deltas.length ? Math.round(deltas.reduce((a, d) => a + d, 0) / deltas.length) : 0,
  }
}

/** Bir ritim "geçti" sayılır: puan %70 ve üstü */
export const PASS = 0.7

/** Turdaki ritimler: seviyedeki ritimlerden, alt seviyelerden de birkaç tane */
export function pickPatterns(level: QuestionLevel, rand = Math.random): string[] {
  const own = [...RHYTHM_PATTERNS[level]]
  const lower = level > 1 ? RHYTHM_PATTERNS[(level - 1) as QuestionLevel] : []
  const shuffle = <T>(a: T[]) => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  const nOwn = level === 1 ? RHYTHM_ROUND : RHYTHM_ROUND - 2
  return shuffle([...shuffle(own).slice(0, nOwn), ...shuffle([...lower]).slice(0, RHYTHM_ROUND - nOwn)])
}
