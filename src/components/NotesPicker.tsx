// Çalışılacak notaları seçtirir: 7 nota düğmesi + hazır seçimler. En az 3 nota seçili kalır.
// Ayarlar'da ve öğretmen kodu hazırlarken kullanılır.
import { Chip, Segmented } from "../ui"
import { ALL_NOTES } from "../utils/settings"
import { MIN_NOTES } from "../utils/teacherCode"

export const NOTE_PRESETS = [
  { label: "Do Re Mi", notes: ["Do", "Re", "Mi"] },
  { label: "Do – Sol", notes: ["Do", "Re", "Mi", "Fa", "Sol"] },
  { label: "Hepsi", notes: ALL_NOTES },
]

export default function NotesPicker({ value, onChange }: { value: string[]; onChange: (notes: string[]) => void }) {
  return (
    <>
      <div style={{ marginBottom: 10 }}>
        <Segmented
          columns={7}
          size="sm"
          value={value}
          options={ALL_NOTES.map((n) => [n, n] as const)}
          onChange={(n) => {
            const next = value.includes(n) ? value.filter((x) => x !== n) : [...value, n]
            if (next.length < MIN_NOTES) return
            onChange(ALL_NOTES.filter((x) => next.includes(x)))
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {NOTE_PRESETS.map((p) => (
          <Chip key={p.label} selected={value.join() === p.notes.join()} onClick={() => onChange(p.notes)}>
            {p.label}
          </Chip>
        ))}
      </div>
    </>
  )
}

/** Ayarlar'daki açıklama satırı */
export function notesSummary(notes: string[]) {
  return notes.length >= ALL_NOTES.length
    ? "Tüm notalar soruluyor. Bir süre yalnızca birkaç notaya odaklanmak için daralt (en az 3)."
    : `Nota sorularında yalnızca ${notes.join(" ")} çıkar.`
}
