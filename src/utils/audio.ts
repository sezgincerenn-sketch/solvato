// Sesler: piyano notası, doğru/yanlış sesi, tur sonu. Web Audio ile üretilir.
import { getSettings } from "./settings"

// Piano note frequencies (C4 = middle C = 261.63 Hz)
const NOTE_FREQ_C4: Record<string, number> = {
  Do: 261.63,
  Re: 293.66,
  Mi: 329.63,
  Fa: 349.23,
  Sol: 392.0,
  La: 440.0,
  Si: 493.88,
  "Do#": 277.18,
  "Re#": 311.13,
  "Fa#": 369.99,
  "Sol#": 415.3,
  "La#": 466.16,
}

let sharedCtx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!sharedCtx || sharedCtx.state === "closed") {
    sharedCtx = new AudioContext()
  }
  if (sharedCtx.state === "suspended") {
    sharedCtx.resume()
  }
  return sharedCtx
}

/** `delay` (sn) kadar sonra çalar; kulak sorularında sırayla/aynı anda çalmak için. Akorda `volume` düşürülür. */
export function playPianoNote(noteName: string, octave: number, delay = 0, volume = 0.45) {
  if (!getSettings().soundKeys) return
  try {
    const ctx = getCtx()
    const baseFreq = NOTE_FREQ_C4[noteName]
    if (!baseFreq) return

    // Shift frequency to correct octave (C4 = octave 4)
    const freq = baseFreq * Math.pow(2, octave - 4)
    const now = ctx.currentTime + delay
    const decay = 1.8

    const masterGain = ctx.createGain()
    masterGain.connect(ctx.destination)
    // Piano envelope: quick attack, exponential decay
    masterGain.gain.setValueAtTime(0, now)
    masterGain.gain.linearRampToValueAtTime(volume, now + 0.008)
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + decay)

    // Fundamental + harmonics for a piano-like timbre
    const partials: { ratio: number; level: number }[] = [
      { ratio: 1, level: 1.0 },
      { ratio: 2, level: 0.35 },
      { ratio: 3, level: 0.12 },
      { ratio: 4, level: 0.06 },
      { ratio: 5, level: 0.03 },
    ]

    partials.forEach(({ ratio, level }) => {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = "sine"
      osc.frequency.value = freq * ratio
      g.gain.value = level
      osc.connect(g)
      g.connect(masterGain)
      osc.start(now)
      osc.stop(now + decay + 0.05)
    })
  } catch (_) {
    // AudioContext not available — silently skip
  }
}

// ── Efekt sesleri ─────────────────────────────────────────────────────────────
// Çan benzeri tek ses: temel ton + ince üst ses (harmonik), yumuşak sönüm.
function bell(ctx: AudioContext, freq: number, start: number, dur = 0.5, vol = 0.16) {
  const t = ctx.currentTime + start
  ;[
    { f: freq, v: vol, type: "sine" as OscillatorType },
    { f: freq * 2, v: vol * 0.28, type: "sine" as OscillatorType },
    { f: freq * 3.01, v: vol * 0.08, type: "triangle" as OscillatorType },
  ].forEach((p) => {
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = p.type
    osc.frequency.value = p.f
    osc.connect(g)
    g.connect(ctx.destination)
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(p.v, t + 0.012)
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur)
    osc.start(t)
    osc.stop(t + dur + 0.02)
  })
}

// Doğru cevap: kısa, parlak "ting-ting" (Sol5 → Do6)
export function playCorrectChime() {
  if (!getSettings().soundKeys) return
  try {
    const ctx = getCtx()
    bell(ctx, 783.99, 0, 0.35, 0.15)
    bell(ctx, 1046.5, 0.09, 0.55, 0.16)
  } catch (_) {}
}

// Yanlış cevap: yumuşak, alçalan iki "dum" (tırmalayıcı değil)
export function playWrongBuzz() {
  if (!getSettings().soundKeys) return
  try {
    const ctx = getCtx()
    ;[
      { f: 261.63, s: 0 },
      { f: 220.0, s: 0.13 },
    ].forEach(({ f, s }) => {
      const t = ctx.currentTime + s
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = "triangle"
      osc.frequency.setValueAtTime(f, t)
      osc.frequency.exponentialRampToValueAtTime(f * 0.94, t + 0.25)
      osc.connect(g)
      g.connect(ctx.destination)
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(0.14, t + 0.02)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.28)
      osc.start(t)
      osc.stop(t + 0.3)
    })
  } catch (_) {}
}

// Seans bitti: üç notalık küçük melodi
export function playSessionDone() {
  if (!getSettings().soundKeys) return
  try {
    const ctx = getCtx()
    ;[523.25, 659.25, 783.99].forEach((f, i) => bell(ctx, f, i * 0.12, 0.5, 0.14))
  } catch (_) {}
}

// Günlük hedef tamam: yükselen arpej ve son akor
export function playGoalDone() {
  if (!getSettings().soundKeys) return
  try {
    const ctx = getCtx()
    ;[392.0, 523.25, 659.25, 783.99].forEach((f, i) => bell(ctx, f, i * 0.1, 0.45, 0.14))
    ;[523.25, 659.25, 783.99, 1046.5].forEach((f) => bell(ctx, f, 0.5, 0.9, 0.09))
  } catch (_) {}
}

// Seviye atlama: iki oktavlık parlak arpej
export function playLevelUp() {
  if (!getSettings().soundKeys) return
  try {
    const ctx = getCtx()
    ;[523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => bell(ctx, f, i * 0.09, 0.6, 0.13))
    ;[1046.5, 1318.5, 1568.0].forEach((f) => bell(ctx, f, 0.55, 1.1, 0.08))
  } catch (_) {}
}

// Seri artışı: sıcak iki nota ve parıltı
export function playStreakUp() {
  if (!getSettings().soundKeys) return
  try {
    const ctx = getCtx()
    bell(ctx, 587.33, 0, 0.4, 0.14)
    bell(ctx, 880.0, 0.11, 0.5, 0.14)
    bell(ctx, 1760.0, 0.26, 0.4, 0.06)
  } catch (_) {}
}

// ── Ritim oyunu (Ritmi Tut) ───────────────────────────────────────────────────
// Sesler AudioContext saatine göre önceden zamanlanır; dokunuşlar da aynı saatle ölçülür.

/** Ses saati (sn). Ritim oyununda zamanlama ve dokunuş ölçümü için tek kaynak. */
export function audioNow(): number {
  try {
    return getCtx().currentTime
  } catch (_) {
    return performance.now() / 1000
  }
}

/** Zamanlanan sesin kulağa ulaşma gecikmesi (sn); dokunuşu bununla düzeltiriz. Bilinmiyorsa 0. */
export function audioLatency(): number {
  try {
    const c = getCtx() as AudioContext & { outputLatency?: number }
    return (c.outputLatency ?? 0) + (c.baseLatency ?? 0)
  } catch (_) {
    return 0
  }
}

/** Metronom tıkı, ses saatinde `at` anında. Ölçü başı (strong) daha tiz. */
export function scheduleClick(at: number, strong = false) {
  if (!getSettings().soundKeys) return
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = "square"
    osc.frequency.value = strong ? 1760 : 1320
    osc.connect(g)
    g.connect(ctx.destination)
    g.gain.setValueAtTime(0, at)
    g.gain.linearRampToValueAtTime(strong ? 0.09 : 0.06, at + 0.002)
    g.gain.exponentialRampToValueAtTime(0.0005, at + 0.05)
    osc.start(at)
    osc.stop(at + 0.06)
  } catch (_) {}
}

/** Ritim notası (dinleme modu): kısa, tok bir tahta vuruşu, `at` anında */
export function scheduleBeat(at: number) {
  if (!getSettings().soundKeys) return
  try {
    const ctx = getCtx()
    bell(ctx, 523.25, at - ctx.currentTime, 0.22, 0.2)
  } catch (_) {}
}
