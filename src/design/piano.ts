/**
 * Piyano tuşlarının görünümü: tek kaynak.
 * Test ekranındaki klavye (QuizPiano) ve akor klavyesi (MultiPiano) aynı tuş stillerini kullanır.
 * Tuşlar iki temada da gerçek piyano gibi görünür (fildişi beyaz, koyu siyah); tema değişkeni kullanılmaz.
 */
import type { CSSProperties } from "react"
import { alpha, palette } from "./tokens"

/** Tuşun o anki durumu */
export type KeyState =
  | "idle" // boşta
  | "hint" // ipucu (yalnızca eski sürümlerde; şu an kullanılmıyor)
  | "selected" // seçildi (akor: çoklu seçim)
  | "correct" // basıldı ve doğru
  | "wrong" // basıldı ve yanlış
  | "reveal" // yanlış cevaptan sonra doğru tuş gösteriliyor

/** Fildişi / abanoz tonları: gerçek piyano hissi için palet dışı, yalnızca klavyede */
export const pianoColors = {
  ivoryTop: "#E8E4DC",
  ivoryBottom: "#CEC8BA",
  ivoryEdge: "#9A9080",
  ivoryLabel: "#5A5040",
  ebonyTop: "#1C1814",
  ebonyBottom: "#0E0C0A",
  ebonyEdge: "#0A0808",
  ebonyLabel: "#9A9080",
  /** Çalışma kartlarındaki küçük şema klavyeler */
  diagramWhite: palette.slate50,
  diagramBlack: "#0B0B0F",
} as const

const v = (top: string, bottom: string) => `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)`
const press = "inset 0 -4px 0 rgba(0,0,0,0.15)"

export function whiteKeyStyle(st: KeyState): CSSProperties {
  switch (st) {
    case "hint":
      return {
        background: v("#FEF3C7", palette.amber300),
        boxShadow: `0 0 18px ${alpha(palette.amber500, 0.7)}, ${press}`,
        border: `1px solid ${palette.amber500}`,
      }
    case "selected":
      return {
        background: v(palette.violet300, palette.violet400),
        boxShadow: `0 0 14px ${alpha(palette.violet500, 0.65)}, ${press}`,
        border: `1px solid ${palette.violet500}`,
      }
    case "correct":
      return {
        background: v("#D1FAE5", palette.green300),
        boxShadow: `0 0 16px ${alpha(palette.green500, 0.7)}, ${press}`,
        border: `1px solid ${palette.green500}`,
      }
    case "wrong":
      return {
        background: v("#FEE2E2", palette.red300),
        boxShadow: `0 0 16px ${alpha(palette.red500, 0.65)}, ${press}`,
        border: `1px solid ${palette.red500}`,
      }
    case "reveal":
      return {
        background: v("#D1FAE5", palette.green300),
        boxShadow: `0 0 20px ${alpha(palette.green500, 0.8)}`,
        border: `1px solid ${palette.green500}`,
      }
    default:
      return {
        background: v(pianoColors.ivoryTop, pianoColors.ivoryBottom),
        boxShadow: "inset 0 -5px 0 rgba(0,0,0,0.22)",
        border: `1px solid ${pianoColors.ivoryEdge}`,
      }
  }
}

export function blackKeyStyle(st: KeyState): CSSProperties {
  switch (st) {
    case "hint":
      return {
        background: `linear-gradient(180deg, #B45309, ${palette.amber500})`,
        boxShadow: `0 0 16px ${alpha(palette.amber500, 0.8)}`,
        border: `1px solid ${palette.amber500}`,
      }
    case "selected":
      return {
        background: `linear-gradient(180deg, ${palette.violet600}, ${palette.violet700})`,
        boxShadow: `0 0 14px ${alpha(palette.violet600, 0.75)}`,
        border: "1px solid transparent",
      }
    case "correct":
    case "reveal":
      return {
        background: `linear-gradient(180deg, #065F46, ${palette.green600})`,
        boxShadow: `0 0 ${st === "reveal" ? 18 : 14}px ${alpha(palette.green500, 0.8)}`,
        border: `1px solid ${palette.green500}`,
      }
    case "wrong":
      return {
        background: `linear-gradient(180deg, #7F1D1D, ${palette.red600})`,
        boxShadow: `0 0 14px ${alpha(palette.red500, 0.8)}`,
        border: `1px solid ${palette.red500}`,
      }
    default:
      return {
        background: v(pianoColors.ebonyTop, pianoColors.ebonyBottom),
        boxShadow: "inset -2px -5px 0 rgba(0,0,0,0.5), inset 2px 0 0 rgba(255,255,255,0.06)",
        border: `1px solid ${pianoColors.ebonyEdge}`,
      }
  }
}

/** Tuş üstündeki yazının rengi */
export function keyLabelColor(st: KeyState, isBlack: boolean): string {
  if (st === "correct" || st === "reveal") return isBlack ? palette.white : "#065F46"
  if (st === "wrong") return isBlack ? palette.white : "#7F1D1D"
  if (st === "selected") return isBlack ? palette.white : palette.violet900
  return isBlack ? pianoColors.ebonyLabel : pianoColors.ivoryLabel
}
