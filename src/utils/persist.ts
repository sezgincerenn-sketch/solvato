// localStorage verisini telefonun kalıcı depolamasına da yazar (uygulama güncellense de kaybolmaz).
import { Capacitor } from "@capacitor/core"
import { Preferences } from "@capacitor/preferences"

// Uygulamanın localStorage anahtarları. iOS/Android zaman zaman WebView
// depolamasını temizleyebildiği için bunları cihazın kalıcı depolamasına
// (UserDefaults / SharedPreferences) da yansıtıyoruz.
const KEYS = ["notausta_stats_v1", "pianote_theme_v1", "pianote_settings_v1"]

export async function initPersistence() {
  if (!Capacitor.isNativePlatform()) return

  // Açılışta: native depodaki değerleri localStorage'a geri yükle
  for (const key of KEYS) {
    try {
      const { value } = await Preferences.get({ key })
      if (value !== null) localStorage.setItem(key, value)
    } catch {
      /* yoksay */
    }
  }

  // Sonra: her yazımı native depoya da kopyala
  const original = Storage.prototype.setItem
  Storage.prototype.setItem = function (key: string, value: string) {
    original.call(this, key, value)
    if (KEYS.includes(key)) Preferences.set({ key, value }).catch(() => {})
  }
}
