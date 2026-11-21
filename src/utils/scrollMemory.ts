// Kaydırma hafızası: bir ekrandan ileri gidip geri dönünce ekran kalınan yerden açılır.
// App, ileri giderken o anki ekranın kaydırma konumlarını kaydeder (save), geri dönünce
// yeniden uygular (restore). Ekranların kendisinin bir şey yapmasına gerek yoktur.
import type { View } from "../types"

const memory = new Map<View, number[]>()

/** Kök içindeki kaydırılabilir alanlar, DOM sırasıyla */
function scrollers(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>("*")).filter((el) => {
    const oy = getComputedStyle(el).overflowY
    return oy === "auto" || oy === "scroll"
  })
}

export function saveScroll(root: HTMLElement | null, view: View) {
  if (!root) return
  memory.set(
    view,
    scrollers(root).map((el) => el.scrollTop),
  )
}

/** Kaydedilen konumu uygular. İçerik bir karede tam çizilmemiş olabilir, birkaç kare dener. */
export function restoreScroll(root: HTMLElement | null, view: View) {
  const saved = memory.get(view)
  if (!root || !saved?.some((y) => y > 0)) return
  let tries = 0
  const apply = () => {
    const els = scrollers(root)
    saved.forEach((y, i) => {
      if (els[i]) els[i].scrollTop = y
    })
    const done = saved.every((y, i) => !els[i] || Math.abs(els[i].scrollTop - y) < 2)
    if (!done && ++tries < 6) requestAnimationFrame(apply)
  }
  apply()
}

export const forgetScroll = (view?: View) => (view ? memory.delete(view) : memory.clear())
