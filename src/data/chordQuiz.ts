// Akor sorularında yardımcılar: karıştırma ve çeldirici akor seçimi
import { samePcs, type Chord } from "./chords"

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Yanlış şıklar: biri aynı kökün başka türü, diğerleri aynı türün başka kökleri
export function distractors(c: Chord, pool: Chord[]): Chord[] {
  const ok = (x: Chord) => x.id !== c.id && !samePcs(x, c)
  const sameRoot = shuffle(pool.filter((x) => ok(x) && x.root === c.root))
  const sameQual = shuffle(pool.filter((x) => ok(x) && x.quality === c.quality))
  const picks: Chord[] = []
  for (const x of [...sameRoot.slice(0, 1), ...sameQual, ...shuffle(pool.filter(ok))]) {
    if (picks.length >= 3) break
    if (!picks.some((p) => p.id === x.id || samePcs(p, x))) picks.push(x)
  }
  return picks
}
