// İki ayrı ilerleme var, karıştırmamak için adları farklı:
//   Seviye  = soru zorluğu (Başlangıç / Orta / İleri), settings.level; bkz. state/stats.ts recordLevelProgress
//   Ünvan   = toplanan XP'ye göre rütbe (aşağıdaki RANKS); her tur XP kazandırır, eşik geçilince yeni ünvan
// Günlük hedefle günde ~100–250 XP kazanılır (doğru cevap başına 10). Eşikler giderek açılır:
// ilk ünvanlar birkaç günde, son ünvan ~5 ay düzenli çalışmayla gelir.
export const RANKS = [
  { min: 0, label: "Yeni Başlayan" },
  { min: 100, label: "Meraklı" },
  { min: 300, label: "Nota Avcısı" },
  { min: 600, label: "Çırak" },
  { min: 1000, label: "Porte Gezgini" },
  { min: 1500, label: "Ritim Tutan" },
  { min: 2200, label: "Kulağı Açık" },
  { min: 3000, label: "Kendinden Emin" },
  { min: 4000, label: "Hızlı Okuyucu" },
  { min: 5500, label: "Deşifreci" },
  { min: 7500, label: "Solist" },
  { min: 10000, label: "Maestro Adayı" },
  { min: 13000, label: "Maestro" },
  { min: 17000, label: "Virtüöz" },
  { min: 22000, label: "Efsane" },
] as const

export function rankFromXp(xp: number) {
  let i = 0
  for (let k = 0; k < RANKS.length; k++) if (xp >= RANKS[k].min) i = k
  const cur = RANKS[i]
  const next = RANKS[i + 1]
  return {
    /** 1'den başlayan sıra */
    rank: i + 1,
    label: cur.label as string,
    nextLabel: next ? (next.label as string) : null,
    nextAt: next ? next.min : null,
    toNext: next ? next.min - xp : 0,
    pct: next ? Math.round(((xp - cur.min) / (next.min - cur.min)) * 100) : 100,
  }
}

export function todayKey(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}
