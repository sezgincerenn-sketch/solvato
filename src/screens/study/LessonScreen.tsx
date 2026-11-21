// Tek bir çalışma dersi: başlık + yalnızca o konunun içeriği
import { colors, font, space } from "../../design/tokens"
import { ScreenHeader } from "../../ui"
import { lessonById } from "./lessons"

export default function LessonScreen({ id, onBack }: { id: string; onBack: () => void }) {
  const lesson = lessonById(id)
  if (!lesson) return null
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: colors.bg,
        fontFamily: font.family.ui,
      }}
    >
      <ScreenHeader title={lesson.title} onBack={onBack} />
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: `${space[2]}px ${space[4]}px ${space[8]}px` }}>
        <p style={{ fontSize: font.size.sm, color: colors.textMuted, margin: `0 2px ${space[4]}px` }}>{lesson.sub}</p>
        {lesson.render()}
      </div>
    </div>
  )
}
