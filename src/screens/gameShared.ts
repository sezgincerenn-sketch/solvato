// Oyun ekranlarının ortak tipleri ve paylaşım metinleri
import { GAME_LENGTH, catLabel, fmtSec, shareText, type Challenge, type GameCat } from "../utils/games"

export type GameCtx =
  | { mode: "daily"; date: string; cat: GameCat; seed: number; no: number }
  | { mode: "challenge"; cat: GameCat; level: number; seed: number; opp?: Challenge }

export function dailyShareText(no: number, cat: GameCat, r: { correct: number; sec: number; marks: string }) {
  return `🎹 Solvato · Günün meydan okuması #${no}\n${catLabel(cat)} · ${r.correct}/${GAME_LENGTH} · ${fmtSec(r.sec)}\n${r.marks}`
}

/** Paylaş menüsünü açar; olmazsa panoya kopyalar ve kullanıcıya söyler. */
export async function shareWithToast(text: string, toast: (m: string) => void) {
  const r = await shareText(text)
  if (r === "copied") toast("Kopyalandı, mesaja yapıştırabilirsin")
  else if (r === "failed") toast("Paylaşılamadı")
}
