// Günlük hatırlatma bildirimi.
import { Capacitor } from "@capacitor/core"
import { LocalNotifications } from "@capacitor/local-notifications"

const ID = 1001

// Her gün seçilen saatte yerel bildirim planlar. Web'de hiçbir şey yapmaz.
export async function enableReminder(hour: number): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false
  try {
    const perm = await LocalNotifications.requestPermissions()
    if (perm.display !== "granted") return false
    await LocalNotifications.cancel({ notifications: [{ id: ID }] })
    await LocalNotifications.schedule({
      notifications: [
        {
          id: ID,
          title: "Piyano zamanı 🎹",
          body: "Serini kaybetme: bugün 5 dakika nota çalış.",
          schedule: { on: { hour, minute: 0 }, allowWhileIdle: true },
        },
      ],
    })
    return true
  } catch {
    return false
  }
}

export async function disableReminder() {
  if (!Capacitor.isNativePlatform()) return
  try {
    await LocalNotifications.cancel({ notifications: [{ id: ID }] })
  } catch {
    /* yoksay */
  }
}
