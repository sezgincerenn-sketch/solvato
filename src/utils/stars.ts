// Tur yıldızları: yalnızca doğruluğa bakar (öğretmen kolayca anlatabilsin, çocuk hızlanmaya zorlanmasın).
//   %90+ → 3 · %70+ → 2 · %50+ → 1 · altı → 0
// Her konunun en iyi yıldızı stats.bestStars'ta tutulur (anahtar: kategori ya da "chords").
export const STAR_STEPS = [0.5, 0.7, 0.9] as const

export function starsFor(correct: number, total: number): 0 | 1 | 2 | 3 {
  if (total <= 0) return 0
  const r = correct / total
  return STAR_STEPS.filter((s) => r >= s - 1e-9).length as 0 | 1 | 2 | 3
}

/** Bir sonraki yıldız için gereken doğruluk; 3 yıldızda null */
export function nextStarHint(stars: number): string | null {
  return stars >= 3 ? null : `${stars + 1}. yıldız için %${Math.round(STAR_STEPS[stars] * 100)} doğru yap`
}
