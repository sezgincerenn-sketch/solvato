// Tablette okunur genişlik: içerik ortada, en fazla `width` px. Telefonda hiçbir şey yapmaz.
// Ayarlar, profil, oyunlar, sonuç gibi tek sütunlu ekranlar için (App.tsx).
import type { ReactNode } from "react"
import { useTablet } from "../utils/orientation"

export default function TabletColumn({ width = 680, children }: { width?: number; children: ReactNode }) {
  const tablet = useTablet()
  if (!tablet) return <>{children}</>
  return <div style={{ maxWidth: width, margin: "0 auto", height: "100%" }}>{children}</div>
}
