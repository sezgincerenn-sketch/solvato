// Diyez (♯) ve bemol (♭) için ortak bilgiler.
export type Accidental = "sharp" | "flat"

export const SYMBOL: Record<Accidental, string> = { sharp: "♯", flat: "♭" }

// Hangi doğal notalara diyez / bemol eklenebilir (Mi♯, Fa♭, Si♯, Do♭ kullanılmıyor)
export const SHARP_NAMES = ["Do", "Re", "Fa", "Sol", "La"]
export const FLAT_NAMES = ["Re", "Mi", "Sol", "La", "Si"]

// Piyanodaki siyah tuş adı (çalma ve cevap kontrolü için)
export const SHARP_KEY: Record<string, string> = { Do: "Do#", Re: "Re#", Fa: "Fa#", Sol: "Sol#", La: "La#" }
export const FLAT_KEY: Record<string, string> = { Re: "Do#", Mi: "Re#", Sol: "Fa#", La: "Sol#", Si: "La#" }

export const LETTER: Record<string, string> = { Do: "C", Re: "D", Mi: "E", Fa: "F", Sol: "G", La: "A", Si: "B" }

export function accKey(name: string, acc: Accidental) {
  return (acc === "sharp" ? SHARP_KEY : FLAT_KEY)[name]
}

export function accLabel(name: string, acc: Accidental) {
  return `${name}${SYMBOL[acc]}`
}

// 'Do#' -> 'Do♯ / Re♭'
export function blackKeyLabel(key: string) {
  const sharp = key.replace("#", "♯")
  const flatName = Object.entries(FLAT_KEY).find(([, k]) => k === key)?.[0]
  return flatName ? `${sharp} / ${flatName}♭` : sharp
}
