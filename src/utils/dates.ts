// Takvim dönemleri: "Bu hafta" Pazartesi–Pazar, "Bu ay" ayın 1'i–son günü (Türkiye'de hafta Pazartesi başlar).
// offset: 0 = bu dönem, 1 = bir önceki dönem.

/** Günün başı (yerel saat) */
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

export type Period = "week" | "month"

/** Dönemin ilk ve son günü (ikisi de dahil) */
export function periodRange(kind: Period, offset = 0, now = new Date()): { from: Date; to: Date } {
  const today = startOfDay(now)
  if (kind === "week") {
    const sinceMonday = (today.getDay() + 6) % 7 // Pzt=0 … Paz=6
    const from = new Date(today.getFullYear(), today.getMonth(), today.getDate() - sinceMonday - 7 * offset)
    const to = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 6)
    return { from, to }
  }
  const from = new Date(today.getFullYear(), today.getMonth() - offset, 1)
  const to = new Date(from.getFullYear(), from.getMonth() + 1, 0)
  return { from, to }
}

/** from–to arasındaki her gün (dahil) */
export function eachDay(from: Date, to: Date): Date[] {
  const out: Date[] = []
  for (let d = startOfDay(from); d <= to; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) out.push(d)
  return out
}

export const isFuture = (d: Date, now = new Date()) => startOfDay(d) > startOfDay(now)
