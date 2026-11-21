// Ünvan kartı: XP ile kazanılan ünvan ve bir sonrakine ilerleme.
// Seviye (Başlangıç/Orta/İleri) ayrı bir şeydir, o LevelCard'da. Bkz. utils/level.ts.
// Profil'de (basamaklarla) ve tur sonucunda (kısa) kullanılır.
import { Fragment } from "react"
import { alpha, colors, font, palette, radius, space } from "../../design/tokens"
import { RANKS, rankFromXp } from "../../utils/level"

/** Profildeki liste: bir önceki, şimdiki, sonraki üç ünvan; son ünvan hep görünür (hedef) */
function visibleRanks(rank: number): number[] {
  const cur = rank - 1
  const from = Math.max(0, cur - 1)
  const to = Math.min(RANKS.length - 1, cur + 3)
  const list = Array.from({ length: to - from + 1 }, (_, k) => from + k)
  if (to < RANKS.length - 1) list.push(RANKS.length - 1)
  return list
}

export default function RankCard({ xp, detailed, gained }: { xp: number; detailed?: boolean; gained?: number }) {
  const r = rankFromXp(xp)
  return (
    <div
      style={{
        padding: space[4],
        borderRadius: radius.lg,
        background: alpha(palette.amber500, 0.07),
        border: `1px solid ${alpha(palette.amber500, 0.25)}`,
        fontFamily: font.family.ui,
        textAlign: "left",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: space[3] }}>
        <span
          aria-hidden
          style={{
            width: 40,
            height: 40,
            flexShrink: 0,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: palette.amber400,
            color: palette.black,
            fontSize: font.size.lg,
            fontWeight: font.weight.heavy,
          }}
        >
          {r.rank /* Pratik ekranındaki XP rozetiyle aynı */}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: font.size.xs,
              fontWeight: font.weight.bold,
              color: colors.textSubtle,
              letterSpacing: font.tracking.label,
              textTransform: "uppercase",
            }}
          >
            Ünvan · {r.rank}/{RANKS.length}
          </p>
          <p style={{ fontSize: font.size.lg, fontWeight: font.weight.heavy, color: colors.text }}>{r.label}</p>
        </div>
        <span
          style={{
            fontSize: font.size.sm,
            fontWeight: font.weight.bold,
            color: colors.amberText,
            fontFamily: font.family.mono,
            whiteSpace: "nowrap",
          }}
        >
          {xp} XP
        </span>
      </div>

      <div
        style={{
          height: 6,
          borderRadius: radius.pill,
          background: colors.fillStrong,
          marginTop: space[3],
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${r.pct}%`,
            height: "100%",
            borderRadius: radius.pill,
            background: `linear-gradient(90deg, ${palette.amber500}, ${palette.amber300})`,
            transition: "width 0.6s ease",
          }}
        />
      </div>
      <p style={{ fontSize: font.size.sm, color: colors.textMuted, marginTop: space[2], lineHeight: 1.4 }}>
        {gained ? `Bu turda +${gained} XP. ` : ""}
        {r.nextLabel ? `${r.nextLabel} ünvanına ${r.toNext} XP kaldı.` : "En üst ünvandasın."}
      </p>

      {detailed && (
        <ol
          aria-label={`${RANKS.length} ünvandan ${r.rank}.`}
          style={{ listStyle: "none", margin: `${space[3]}px 0 0`, padding: 0, display: "grid", gap: 6 }}
        >
          {visibleRanks(r.rank).map((i, k, arr) => {
            const x = RANKS[i]
            const gap = k > 0 && i - arr[k - 1] > 1 // araya giren ünvanlar gizli
            const done = i + 1 < r.rank
            const cur = i + 1 === r.rank
            return (
              <Fragment key={x.label}>
                {gap && (
                  <li aria-hidden style={{ paddingLeft: 5, color: colors.textFaint, lineHeight: 0.8 }}>
                    ⋮
                  </li>
                )}
                <li
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: space[2],
                    fontSize: font.size.sm,
                    color: cur ? colors.text : done ? colors.textMuted : colors.textFaint,
                    fontWeight: cur ? font.weight.bold : font.weight.medium,
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      flexShrink: 0,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: font.weight.bold,
                      background: cur ? palette.amber400 : done ? alpha(palette.amber500, 0.25) : colors.fillStrong,
                      color: cur ? palette.black : colors.amberText,
                    }}
                  >
                    {done ? "✓" : i + 1}
                  </span>
                  <span style={{ flex: 1 }}>{x.label}</span>
                  <span style={{ fontFamily: font.family.mono, fontSize: font.size.xs, color: colors.textFaint }}>
                    {x.min.toLocaleString("tr-TR")} XP
                  </span>
                </li>
              </Fragment>
            )
          })}
        </ol>
      )}
    </div>
  )
}
