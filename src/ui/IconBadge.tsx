// Renkli kare zemin üstünde ikon (kart başlıkları, sonuç rozetleri).
import Icon, { type IconName } from "../components/Icons"
import { alpha, radius } from "../design/tokens"

const SIZES = {
  sm: { box: 36, icon: 19, r: radius.md },
  md: { box: 44, icon: 22, r: radius.md },
  lg: { box: 72, icon: 36, r: radius.lg },
}

export default function IconBadge({
  name,
  color,
  size = "md",
  glow,
}: {
  name: IconName
  color: string
  size?: keyof typeof SIZES
  glow?: boolean
}) {
  const s = SIZES[size]
  return (
    <div
      aria-hidden="true"
      style={{
        width: s.box,
        height: s.box,
        borderRadius: s.r,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color,
        background:
          size === "lg" ? `linear-gradient(135deg, ${alpha(color, 0.25)}, ${alpha(color, 0.08)})` : alpha(color, 0.14),
        border: size === "lg" ? `1px solid ${alpha(color, 0.33)}` : undefined,
        boxShadow: glow ? `0 0 28px ${alpha(color, 0.27)}` : undefined,
      }}
    >
      <Icon name={name} size={s.icon} />
    </div>
  )
}
