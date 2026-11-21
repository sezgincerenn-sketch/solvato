// Tema tercihi (sistem / koyu / açık) ve telefonun üst çubuğu
import { Capacitor } from "@capacitor/core"
import { StatusBar, Style } from "@capacitor/status-bar"
import type { Theme } from "../types"

export const THEME_KEY = "pianote_theme_v1"

export type ThemeMode = "system" | "dark" | "light"

export function loadThemeMode(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === "dark" || saved === "light" || saved === "system") return saved
  } catch (_) {
    /* ignore */
  }
  return "system"
}

export function systemTheme(): Theme {
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark"
}

/** Telefonun üst çubuğu (saat, pil): koyu temada açık yazı, açık temada koyu yazı */
export function applyStatusBar(theme: Theme) {
  if (!Capacitor.isNativePlatform()) return
  StatusBar.setStyle({ style: theme === "light" ? Style.Light : Style.Dark }).catch(() => {})
}
