// Öğrenme yolu: konuların sırayla açıldığı aşamalar
import { Fragment } from "react"
import type { FilterCategory, AppStats } from "../../types"
import { getSettings } from "../../utils/settings"
import Icon from "../../components/Icons"

import { alpha, colors, font, gradient, palette, radius } from "../../design/tokens"

// ─── Öğrenme yolu ──────────────────────────────────────────────────────────────
export const PATH_NEED = 15 // aşama için gereken soru

export const PATH_ACC = 0.7 // ve en az doğruluk

export default function PathCard({
  stats,
  onStart,
  onChordQuiz,
}: {
  stats: AppStats
  onStart: (cat: FilterCategory) => void
  onChordQuiz: () => void
}) {
  const acc = stats.categoryAccuracy
  let accTotal = 0
  let accCorrect = 0
  Object.entries(stats.noteStats ?? {}).forEach(([k, v]) => {
    if (k.endsWith(":sharp") || k.endsWith(":flat")) {
      accTotal += v.total
      accCorrect += v.correct
    }
  })
  const stages: { key: string; label: string; short: string; c: { correct: number; total: number }; go: () => void }[] =
    [
      { key: "treble", label: "Sol Anahtarı", short: "Sol", c: acc.treble, go: () => onStart("treble") },
      { key: "bass", label: "Fa Anahtarı", short: "Fa", c: acc.bass, go: () => onStart("bass") },
      // Diyez/bemol yeni başlayana sorulmaz; Orta seviyeden itibaren yolda görünür
      ...(getSettings().level >= 2
        ? [
            {
              key: "acc",
              label: "Diyez & Bemol",
              short: "♯♭",
              c: { correct: accCorrect, total: accTotal },
              go: () => onStart("accidentals"),
            },
          ]
        : []),
      { key: "rhythm", label: "Ritim", short: "Ritim", c: acc.rhythm, go: () => onStart("rhythm") },
      { key: "terms", label: "Terimler", short: "Terim", c: acc.terms, go: () => onStart("terms") },
      { key: "chords", label: "Akorlar", short: "Akor", c: acc.chords ?? { correct: 0, total: 0 }, go: onChordQuiz },
    ]
  const isDone = (c: { correct: number; total: number }) => c.total >= PATH_NEED && c.correct / c.total >= PATH_ACC
  const currentIdx = stages.findIndex((st) => !isDone(st.c))
  const allDone = currentIdx === -1
  const cur = allDone ? stages[stages.length - 1] : stages[currentIdx]
  const pct = Math.min(100, Math.round((cur.c.total / PATH_NEED) * 100))
  const needAcc = cur.c.total >= PATH_NEED && cur.c.correct / cur.c.total < PATH_ACC
  const doneCount = stages.filter((st) => isDone(st.c)).length

  return (
    <div
      className="rounded-2xl"
      style={{
        padding: "14px 16px 16px",
        background: colors.fill,
        border: `1px solid ${colors.border}`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <p style={{ fontSize: font.size.md, fontWeight: font.weight.bold, color: colors.textSoft }}>Öğrenme yolu</p>
        <p style={{ fontSize: font.size.sm, color: colors.textMuted }}>
          {doneCount}/{stages.length} tamam
        </p>
      </div>

      {/* Adım çizgisi */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
        {stages.map((st, i) => {
          const done = isDone(st.c)
          const isCur = i === currentIdx
          return (
            <Fragment key={st.key}>
              <button
                onClick={st.go}
                aria-label={`${st.label}${done ? " (tamam)" : isCur ? " (sıradaki)" : ""}`}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: font.size.sm,
                  fontWeight: font.weight.heavy,
                  fontFamily: font.family.ui,
                  background: done
                    ? `linear-gradient(135deg,${palette.green500},${palette.green600})`
                    : isCur
                      ? gradient.primaryFlat
                      : colors.fillStrong,
                  color: done || isCur ? palette.white : colors.textMuted,
                  border: isCur ? `2px solid ${palette.violet300}` : `1px solid ${colors.borderStrong}`,
                  boxShadow: isCur ? "0 0 14px rgba(139,92,246,0.55)" : "none",
                }}
              >
                {done ? (
                  <Icon name="check" size={15} color={palette.white} strokeWidth={3} />
                ) : st.short.length > 3 ? (
                  st.short.slice(0, 2)
                ) : (
                  st.short
                )}
              </button>
              {i < stages.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 3,
                    borderRadius: radius.xs,
                    background: done ? palette.green500 : colors.fillStronger,
                  }}
                />
              )}
            </Fragment>
          )
        })}
      </div>

      {/* Sıradaki adım */}
      <button
        onClick={cur.go}
        style={{
          width: "100%",
          marginTop: 8,
          padding: "11px 12px",
          borderRadius: radius.md,
          textAlign: "left",
          cursor: "pointer",
          background: alpha(palette.violet500, 0.1),
          border: "1px solid rgba(139,92,246,0.28)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: font.size.sm, fontWeight: font.weight.bold, color: colors.highlightTitle }}>
            {allDone ? "Yolu tamamladın. Bir tur daha: " : "Sıradaki: "}
            {cur.label}
          </p>
          <p style={{ fontSize: font.size.sm, color: colors.highlightBody, marginTop: 2 }}>
            {allDone
              ? "Hızını ve doğruluğunu korumak için tekrar çalış."
              : needAcc
                ? `Doğruluğu %${Math.round(PATH_ACC * 100)} üzerine çıkar (şu an %${Math.round((cur.c.correct / cur.c.total) * 100)})`
                : `${Math.min(cur.c.total, PATH_NEED)}/${PATH_NEED} soru · %${Math.round(PATH_ACC * 100)} doğruluk hedefi`}
          </p>
          {!allDone && !needAcc && (
            <div style={{ height: 4, borderRadius: radius.xs, background: colors.fillStronger, marginTop: 8 }}>
              <div
                style={{ width: `${pct}%`, height: "100%", borderRadius: radius.xs, background: palette.violet400 }}
              />
            </div>
          )}
        </div>
        <svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          stroke={colors.violetTextSoft}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  )
}
