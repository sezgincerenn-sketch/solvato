/**
 * Solvato tasarım sistemi: tüm renk, ölçü ve yazı değerleri buradan gelir.
 *
 * Kurallar
 * - Bileşenlerde ham renk kodu (#xxxxxx / rgba(...)) yazmayın; buradaki adları kullanın.
 * - Temaya göre değişen renkler (metin, zemin, kenarlık, vurgu metinleri) CSS değişkenidir
 *   (src/design/tokens.css). Açık tema yalnızca bu değişkenlerin değerini değiştirir.
 * - `palette` temadan bağımsız sabit renklerdir: dolgu, gradyan, gölge, piyano tuşu vb.
 *   Sonuna saydamlık eklenebilir: `${palette.violet500}24`.
 * - Ölçüler (radius, space, font.size) yalnızca buradaki basamaklardan seçilir.
 */

// ─── Sabit palet (temadan bağımsız) ─────────────────────────────────────────
export const palette = {
  white: "#FFFFFF",
  black: "#000000",

  slate50: "#F8FAFC",
  slate100: "#F1F5F9",
  slate200: "#E2E8F0",
  slate300: "#CBD5E1",
  slate400: "#94A3B8",
  slate500: "#64748B",
  slate600: "#475569",
  slate700: "#334155",
  slate800: "#1E293B",
  slate900: "#0F172A",
  slate950: "#080F1E",

  violet50: "#F5F3FF",
  violet100: "#EDE9FE",
  violet200: "#DDD6FE",
  violet300: "#C4B5FD",
  violet400: "#A78BFA",
  violet500: "#8B5CF6",
  violet600: "#7C3AED",
  violet700: "#6D28D9",
  violet800: "#5B21B6",
  violet900: "#4C1D95",
  violet950: "#2E1065",
  purple500: "#A855F7",
  purple950: "#3B0764",

  blue300: "#93C5FD",
  blue400: "#60A5FA",
  blue500: "#3B82F6",
  blue600: "#2563EB",
  blue700: "#1D4ED8",

  lime400: "#4ADE80", // (adı tarihsel: aslında yeşil; nota harf renklerinde)
  lime300: "#BEF264",
  lime500: "#84CC16",
  green300: "#6EE7B7",
  green400: "#34D399",
  green500: "#10B981",
  green600: "#059669",
  green700: "#047857",

  teal400: "#2DD4BF",
  teal500: "#14B8A6",
  teal600: "#0D9488",
  teal700: "#0F766E",

  cyan400: "#22D3EE",
  cyan500: "#06B6D4",

  amber300: "#FCD34D",
  amber400: "#FBBF24",
  amber500: "#F59E0B",
  amber600: "#D97706",
  amber800: "#92400E",

  orange300: "#FDBA74",
  orange400: "#FB923C",
  orange500: "#F97316",

  red300: "#FCA5A5",
  red400: "#F87171",
  red500: "#EF4444",
  red600: "#DC2626",
  red700: "#B91C1C",

  pink400: "#F472B6",
  pink500: "#EC4899",

  indigo400: "#818CF8",
  indigo500: "#6366F1",
} as const

// ─── Anlamsal renkler (temaya göre değişir, CSS değişkeni) ──────────────────
export const colors = {
  // Zeminler
  bg: "var(--c-bg)", // uygulama zemini
  bgDeep: "var(--c-bg-deep)", // en koyu katman (porte paneli, gömülü alan)
  surface: "var(--c-surface)", // dolu kart / sayfa üstü yüzey
  overlay: "var(--c-overlay)", // yarı saydam üst bar, alt menü
  scrim: "var(--c-scrim)", // pencere arkası karartma

  // Hafif dolgular (kart, şık, düğme zemini)
  fill: "var(--c-fill)", // en hafif
  fillStrong: "var(--c-fill-strong)",
  fillStronger: "var(--c-fill-stronger)",

  // Kenarlıklar
  border: "var(--c-border)",
  borderStrong: "var(--c-border-strong)",

  // Metin (koyudan soluğa)
  text: "var(--c-text)", // başlıklar, ana metin
  textSoft: "var(--c-text-soft)", // şık metni, ikincil başlık
  textSecondary: "var(--c-text-secondary)", // ikon, ikincil düğme metni
  textMuted: "var(--c-text-muted)", // açıklama, alt yazı
  textSubtle: "var(--c-text-subtle)", // etiket, bölüm başlığı
  textFaint: "var(--c-text-faint)", // pasif, ipucu
  textDisabled: "var(--c-text-disabled)",
  onPrimary: palette.violet100, // mor düğme üstündeki yazı (iki temada aynı)

  // Vurgu metinleri: koyu temada açık ton, açık temada okunur koyu ton
  violetText: "var(--c-violet-text)",
  violetTextSoft: "var(--c-violet-text-soft)",
  blueText: "var(--c-blue-text)",
  greenText: "var(--c-green-text)",
  tealText: "var(--c-teal-text)",
  cyanText: "var(--c-cyan-text)",
  amberText: "var(--c-amber-text)",
  orangeText: "var(--c-orange-text)",
  limeText: "var(--c-lime-text)",
  redText: "var(--c-red-text)",
  pinkText: "var(--c-pink-text)",
  indigoText: "var(--c-indigo-text)",

  // Mor zeminli vurgu kartı (ör. öğrenme yolunda "Sıradaki")
  highlightTitle: "var(--c-highlight-title)",
  highlightBody: "var(--c-highlight-body)",

  // Nota çizimi
  staffLine: "var(--staff-line)",
  notation: "var(--notation)",
  termSymbol: "var(--term-symbol)",
  paper: "var(--c-paper)", // porte/soru kartı: açık temada nota kağıdı gibi beyaz
  staffPanel: "var(--staff-panel)",
} as const

// ─── Rol renkleri ───────────────────────────────────────────────────────────
export const brand = {
  primary: palette.violet600,
  primaryHover: palette.violet700,
  accent: palette.violet500,
  highlight: palette.amber400, // logodaki sarı tuş
  success: palette.green500,
  danger: palette.red500,
  warning: palette.amber500,
} as const

/**
 * Her konunun tek bir rengi var; ana sayfa kartı, soru etiketi ve ilerleme çubuğu aynı rengi kullanır.
 * base: dolgu/kenar/ikon · light: çubuk gradyanının açık ucu · text: yazı (temaya duyarlı)
 */
export const category = {
  treble: { base: palette.blue500, light: palette.blue400, text: colors.blueText },
  bass: { base: palette.indigo500, light: palette.indigo400, text: colors.indigoText },
  accidentals: { base: palette.pink500, light: palette.pink400, text: colors.pinkText },
  rhythm: { base: palette.cyan500, light: palette.cyan400, text: colors.cyanText },
  writing: { base: palette.teal500, light: palette.teal400, text: colors.tealText },
  terms: { base: palette.amber500, light: palette.amber300, text: colors.amberText },
  chords: { base: palette.violet500, light: palette.violet400, text: colors.violetText },
  games: { base: palette.green500, light: palette.green400, text: colors.greenText },
  // Kulak limon yeşili: turuncu seriye ayrıldı (üst bardaki alev)
  ear: { base: palette.lime500, light: palette.lime300, text: colors.limeText },
} as const
export type CategoryKey = keyof typeof category

/** Konu ilerleme çubuğu dolgusu */
export const categoryBar = (k: CategoryKey) => `linear-gradient(90deg, ${category[k].base}, ${category[k].light})`

// ─── Ölçüler ────────────────────────────────────────────────────────────────
/** Köşe yuvarlaklığı: xs ince çubuklar, sm küçük öğe, md düğme/şık, lg kart, pill hap. */
export const radius = { xs: 4, sm: 8, md: 12, lg: 20, pill: 999 } as const

/** 4'ün katları. Boşluk, iç boşluk ve aralıklar bu basamaklardan seçilir. */
export const space = { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48 } as const

export const font = {
  family: {
    ui: "Outfit, sans-serif",
    mono: "JetBrains Mono, monospace",
    serif: "'Times New Roman', Georgia, serif", // müzik terimleri (italik)
  },
  /** 12 etiket · 14 gövde/alt yazı · 16 ana metin · 20 alt başlık · 24 başlık · 32 büyük sayı */
  size: { xs: 12, sm: 14, md: 16, lg: 20, xl: 24, xxl: 32 },
  weight: { regular: 400, medium: 500, semibold: 600, bold: 700, heavy: 800 },
  tracking: { tight: "-0.03em", label: "0.08em" },
} as const

export const shadow = {
  none: "none",
  card: "0 4px 16px rgba(0,0,0,0.18)",
  raised: "0 8px 28px rgba(0,0,0,0.28)",
  /** Telefon çerçevesi dışında (tablet/masaüstü) uygulama kabuğunun parıltısı */
  shell: "var(--c-shell-glow)",
  /** Renkli parıltı: öne çıkan düğme ve rozetler */
  glow: (hex: string, strength = 0.38) =>
    `0 8px 28px ${hex}${Math.round(strength * 255)
      .toString(16)
      .padStart(2, "0")}`,
} as const

export const gradient = {
  primary: `linear-gradient(135deg, ${palette.violet600}, ${palette.violet800})`,
  primaryFlat: `linear-gradient(135deg, ${palette.violet600}, ${palette.violet700})`,
  success: `linear-gradient(135deg, ${palette.green600}, ${palette.green700})`,
  warning: `linear-gradient(135deg, ${palette.amber500}, ${palette.amber600})`,
  danger: `linear-gradient(135deg, ${palette.red500}, ${palette.red600})`,
} as const

export const motion = {
  fast: "120ms",
  base: "220ms",
  slow: "380ms",
  ease: "cubic-bezier(0.2, 0.8, 0.2, 1)",
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const

/** Dokunma hedefi en az 44px (Apple HIG / WCAG 2.5.5). */
export const touch = { min: 44 } as const

/** Saydam versiyon: alpha(palette.violet500, 0.12) → "#8B5CF61F" */
export function alpha(hex: string, a: number) {
  return `${hex}${Math.round(a * 255)
    .toString(16)
    .padStart(2, "0")
    .toUpperCase()}`
}
