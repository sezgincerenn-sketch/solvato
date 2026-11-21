// Yan ekran: sadece soru ekranlarında izin verilir, diğer ekranlar dikey kilitli.
import { useSyncExternalStore } from "react"
import { Capacitor } from "@capacitor/core"
import { ScreenOrientation } from "@capacitor/screen-orientation"

export async function allowLandscape(on: boolean) {
  if (!Capacitor.isNativePlatform()) return
  // Tablette her ekran her yönde kullanılabilir
  if (isTabletNow()) on = true
  try {
    if (on) await ScreenOrientation.unlock()
    else await ScreenOrientation.lock({ orientation: "portrait" })
  } catch {
    /* eklenti yoksa sessizce geç */
  }
}

// Telefon yan çevrilmiş mi? (yüksekliği kısa yatay ekran)
const QUERY = "(orientation: landscape) and (max-height: 540px)"
function subscribe(cb: () => void) {
  const m = window.matchMedia?.(QUERY)
  m?.addEventListener?.("change", cb)
  return () => m?.removeEventListener?.("change", cb)
}
export function useLandscape() {
  return useSyncExternalStore(
    subscribe,
    () => !!window.matchMedia?.(QUERY).matches,
    () => false,
  )
}

// "Yan çevirebilirsin" ipucu kaç kez gösterildi
const KEY = "notalik_rotate_hint_v1"
export function rotateHintCount(): number {
  try {
    return Number(localStorage.getItem(KEY) ?? 0)
  } catch {
    return 99
  }
}
export function bumpRotateHint(done = false) {
  try {
    localStorage.setItem(KEY, String(done ? 99 : rotateHintCount() + 1))
  } catch {
    /* yoksay */
  }
}

// Genel medya sorgusu kancası
function useMedia(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia?.(query)
      m?.addEventListener?.("change", cb)
      return () => m?.removeEventListener?.("change", cb)
    },
    () => !!window.matchMedia?.(query).matches,
    () => false,
  )
}

// iPad gibi dokunmatik geniş ekran
const TABLET = "(pointer: coarse) and (min-width: 700px)"
export function isTabletNow() {
  return typeof window !== "undefined" && !!window.matchMedia?.(TABLET).matches
}
export function useTablet() {
  return useMedia(TABLET)
}
// Soru ekranında iki sütun: telefon yan çevrilmiş ya da tablet yatay
export function useTwoColumn() {
  const phoneLand = useLandscape()
  const tabletLand = useMedia("(pointer: coarse) and (min-width: 900px) and (orientation: landscape)")
  return phoneLand || tabletLand
}
