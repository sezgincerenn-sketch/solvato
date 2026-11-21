// Ekran görüntüsü aracı: derlenmiş uygulamayı (dist/) açar, adımları izler, koyu ve açık temada görüntü alır.
// Kullanım (önce `npm run build`):
//   node scripts/ekran.mjs --ad ayarlar --adim Profil --adim Ayarlar --kaydir
//   node scripts/ekran.mjs --ad ana --se            # iPhone SE (375×667) de çek
//   node scripts/ekran.mjs --ad ana --tablet --olcek 2   # iPad (1024×1366), 2x çözünürlük
// --adim: önce aria-label, yoksa tam metinle eşleşen öğeye dokunur (sırayla). --kaydir: kaydırılabilir alanları sona kaydırır.
// Çıktı: ekran/<ad>-<boyut>-<tema>.png. Ayrıca yatay taşma, dış ağ isteği ve konsol hatası raporlar; sorun varsa çıkış kodu 1.
import { createRequire } from "node:module"
import { mkdirSync } from "node:fs"
import { preview } from "vite"

const require = createRequire(import.meta.url)
const { chromium } = require("playwright")

const args = process.argv.slice(2)
const opt = { ad: "ekran", adimlar: [], se: false, tablet: false, kaydir: false, olcek: 1, bekle: 400 }
for (let i = 0; i < args.length; i++) {
  const a = args[i]
  if (a === "--ad") opt.ad = args[++i]
  else if (a === "--adim") opt.adimlar.push(args[++i])
  else if (a === "--se") opt.se = true
  else if (a === "--tablet") opt.tablet = true
  else if (a === "--kaydir") opt.kaydir = true
  else if (a === "--olcek") opt.olcek = Number(args[++i])
  else if (a === "--bekle") opt.bekle = Number(args[++i])
  else throw new Error(`Bilinmeyen seçenek: ${a}`)
}

const boyutlar = [["telefon", 390, 844]]
if (opt.se) boyutlar.push(["se", 375, 667])
if (opt.tablet) boyutlar.push(["tablet", 1024, 1366])

mkdirSync("ekran", { recursive: true })
const server = await preview({ preview: { port: 4179, strictPort: false }, logLevel: "silent" })
const base = server.resolvedUrls.local[0]
const browser = await chromium.launch()
let sorun = false

for (const [boyut, width, height] of boyutlar) {
  for (const tema of ["dark", "light"]) {
    const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: opt.olcek, hasTouch: true })
    // Uygulamayı tanıtımı geçmiş, Orta seviyede hazır duruma getir (anahtarlar CLAUDE.md'de)
    await ctx.addInitScript((t) => {
      if (sessionStorage.getItem("ekran_hazir")) return
      sessionStorage.setItem("ekran_hazir", "1")
      localStorage.setItem("pianote_settings_v1", JSON.stringify({ onboarded: true, coachDone: true, level: 2 }))
      localStorage.setItem("notalik_rotate_hint_v1", "99")
      localStorage.setItem("pianote_theme_v1", t)
    }, tema)
    const page = await ctx.newPage()
    const disIstek = new Set()
    const hatalar = []
    page.on("request", (r) => {
      const u = new URL(r.url())
      if (!["localhost", "127.0.0.1"].includes(u.hostname) && u.protocol.startsWith("http")) disIstek.add(r.url())
    })
    page.on("pageerror", (e) => hatalar.push(e.message))
    page.on("console", (m) => m.type() === "error" && hatalar.push(m.text()))

    await page.goto(base)
    await page.waitForTimeout(3800) // açılış animasyonu
    for (const adim of opt.adimlar) {
      const etiket = page.locator(`[aria-label="${adim}"]`)
      const hedef = (await etiket.count()) > 0 ? etiket.first() : page.getByText(adim, { exact: true }).first()
      await hedef.click({ timeout: 5000 })
      await page.waitForTimeout(opt.bekle)
    }
    if (opt.kaydir) {
      await page.evaluate(() =>
        document.querySelectorAll("*").forEach((d) => {
          const s = getComputedStyle(d).overflowY
          if ((s === "auto" || s === "scroll") && d.scrollHeight > d.clientHeight) d.scrollTop = d.scrollHeight
        }),
      )
      await page.waitForTimeout(300)
    }
    const dosya = `ekran/${opt.ad}-${boyut}-${tema === "dark" ? "koyu" : "acik"}.png`
    await page.screenshot({ path: dosya })
    const tasma = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
    const notlar = []
    if (tasma) notlar.push("YATAY TAŞMA")
    if (disIstek.size) notlar.push(`DIŞ İSTEK: ${[...disIstek].join(", ")}`)
    if (hatalar.length) notlar.push(`HATA: ${hatalar.join(" | ")}`)
    if (notlar.length) sorun = true
    console.log(`${dosya}${notlar.length ? "  ⚠ " + notlar.join(" · ") : "  ✓"}`)
    await ctx.close()
  }
}

await browser.close()
await server.close()
process.exit(sorun ? 1 : 0)
