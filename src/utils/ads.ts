// Reklam yerleşimi (AdMob bağlanana kadar kapalı).
// Kurallar: soru çözerken ASLA reklam yok; banner yalnızca ana ekranın altında,
// geçiş reklamı yalnızca seans bittikten sonra, her 3. seansta ve ilk 2 seansta hiç.
export const ADS_ENABLED = false

export const BANNER_HEIGHT = 50

/** Seans sonucu ekranına geçerken geçiş (interstitial) reklamı gösterilmeli mi? */
export function shouldShowInterstitial(totalSessions: number, celebrating: boolean): boolean {
  if (!ADS_ENABLED) return false
  if (celebrating) return false // kutlama varsa kullanıcıyı bölme
  if (totalSessions <= 2) return false
  return totalSessions % 3 === 0
}
