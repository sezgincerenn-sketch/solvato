// İlerleme › Bu hafta: seri ve bugünkü dürtme, 7 günlük şerit, kısa özet ve "Öğretmenine gönder" (utils/weeklyReport.ts).
// Doğruluk burada tekrar edilmez; o AccuracyCard'da. Gönderilen metinde ise hepsi var.
import { todayKey } from "../../utils/level"
import Icon from "../../components/Icons"
import { alpha, colors, font, palette, space } from "../../design/tokens"
import type { AppStats } from "../../types"
import { Button, Card, useToast } from "../../ui"
import { getSettings } from "../../utils/settings"
import { buildWeeklyReport, weeklyReportText } from "../../utils/weeklyReport"
import { shareWithToast } from "../gameShared"

const isToday = (d: Date) => todayKey(d) === todayKey()

/** Haftalık raporu paylaşım menüsüyle gönderir (rapor zorlanılan notaları da içerir). */
function shareWeeklyReport(stats: AppStats, showToast: (m: string) => void) {
  return shareWithToast(weeklyReportText(buildWeeklyReport(stats, getSettings())), showToast)
}

export default function WeeklyReportCard({ stats }: { stats: AppStats }) {
  const toast = useToast()
  const r = buildWeeklyReport(stats, getSettings())
  const today = r.days.find((d) => isToday(d.date))
  const left = Math.max(0, r.dailyGoal - (today?.questions ?? 0))
  const streakNudge =
    left === 0
      ? "Bugünün serisi tamam"
      : r.streak > 0
        ? `Bugün ${left} soru daha, seri ${r.streak + 1} olsun`
        : `Bugün ${left} soru çöz, serin başlasın`
  return (
    <Card as="section" style={{ display: "flex", flexDirection: "column", gap: space[3] }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: space[2] }}>
        <p style={{ fontSize: font.size.md, fontWeight: font.weight.bold, color: colors.text }}>Bu hafta</p>
        <p style={{ fontSize: font.size.sm, color: colors.textMuted }}>{r.range}</p>
      </div>

      {/* Seri ve bugünkü dürtme: kaç soru kalırsa seri bir artar */}
      <div style={{ display: "flex", alignItems: "center", gap: space[3] }}>
        <span
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: alpha(palette.orange500, r.streak > 0 ? 0.16 : 0.08),
          }}
        >
          <Icon name="flame" size={22} fill={r.streak > 0} color={colors.orangeText} />
        </span>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: font.size.lg, fontWeight: font.weight.heavy, color: colors.text, lineHeight: 1.2 }}>
            {r.streak > 0 ? `${r.streak} günlük seri` : "Seri yok"}
          </p>
          <p style={{ fontSize: font.size.sm, color: colors.textMuted }}>{streakNudge}</p>
        </div>
      </div>

      {/* 7 gün: dolu = hedef tamam, yarım = çalıştı, boş = çalışmadı */}
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 6 }}
        aria-label={`Son 7 günde ${r.activeDays} gün çalışıldı, ${r.goalDays} gün hedef tamamlandı`}
      >
        {r.days.map((d) => (
          <div key={d.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: d.goalMet
                  ? palette.green500
                  : d.questions > 0
                    ? alpha(palette.green500, 0.15)
                    : colors.fillStrong,
                border: d.goalMet
                  ? "none"
                  : d.questions > 0
                    ? `2px solid ${palette.green500}`
                    : isToday(d.date)
                      ? `2px dashed ${palette.green500}` // bugün: hedef bekliyor
                      : d.future
                        ? `1px dashed ${colors.border}` // henüz gelmedi
                        : `1px solid ${colors.border}`,
                opacity: d.future ? 0.5 : 1,
                color: palette.white,
              }}
            >
              {d.goalMet && <Icon name="check" size={16} strokeWidth={3} />}
            </span>
            <span
              style={{
                fontSize: font.size.xs,
                color: isToday(d.date) ? colors.text : colors.textSubtle,
                fontWeight: isToday(d.date) ? font.weight.bold : font.weight.regular,
              }}
            >
              {isToday(d.date) ? "Bugün" : d.label}
            </span>
          </div>
        ))}
      </div>

      <p style={{ fontSize: font.size.sm, color: colors.textMuted, lineHeight: 1.5 }}>
        {r.questions === 0
          ? "Bu hafta henüz çalışmadın."
          : `Bu hafta ${r.activeDays} gün çalıştın, ${r.questions} soru çözdün. Hedefi ${r.goalDays} gün tutturdun.`}
      </p>

      <Button variant="secondary" onClick={() => shareWeeklyReport(stats, toast.show)}>
        Öğretmenine haftalık rapor gönder
      </Button>
      {toast.el}
    </Card>
  )
}
