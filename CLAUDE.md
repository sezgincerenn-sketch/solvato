# CLAUDE.md

Bu dosya Claude Code'un bu repoda nasıl çalışacağını anlatır. Kodun yapısı ve kavramları için `README.md`,
ürün kararları ve yol haritası için `docs/URUN.md`.

## Kiminle çalışıyorsun

- Proje sahibi **Ceren**. Kod yazmıyor; ürünü, tasarımı ve yayını o yönetiyor. Kodu ileride bir geliştirici arkadaşı
  devralacak.
- **Her zaman Türkçe yanıt ver.** Teknik terimleri gerektiği kadar kullan, ne değiştiğini ekranda göreceği haliyle anlat
  ("Pratik sayfasındaki Bugün kartı…"), dosya ve fonksiyon adlarını yalnızca gerekirse an.
- Değişiklik bitince kısa bir özet yaz: ne değişti, kullanıcı ne görecek, varsa kararı gereken bir şey.
- Ceren'in bilgisayarında git ya da IDE yok. Commit ve push'u sen yaparsın; o sonucu GitHub'da ve önizlemede görür.
- Küçük, net istekleri doğrudan yap. Geri dönmesi zor ya da birden çok yoruma açık işlerde önce tek soru sor.

## Komutlar

```bash
npm install
npm run dev            # geliştirme sunucusu
npm run check          # tür kontrolü (noUnused açık) + Prettier kontrolü — her değişiklikten sonra çalıştır
npm run format         # biçim hatalarını düzeltir
npm run build:single   # tek dosyalık önizleme: dist-single/index.html (Ceren'e gösterilecek sürüm)
npm run sync           # derle + cap sync (android/ ve ios/ projelerini günceller)
```

## Bir değişikliği bitirmeden önce

1. `npm run check` temiz geçmeli.
2. Arayüz değiştiyse ekranı **koyu ve açık temada** gerçekten aç ve bak (Playwright varsa ekran görüntüsü al,
   390×844 telefon boyutu). Taşan yazı, iki satıra kırılan düğme, okunmayan renk en sık görülen hatalar.
3. Mantık değiştiyse (puanlama, seviye, tarih, seri) küçük bir örnekle çalıştırıp sonucu doğrula.
4. `README.md`'de ilgili bölümü güncelle; yeni bir kavram eklediysen "Önemli kavramlar"a bir madde yaz.
5. `npm run sync` ile native projeleri eşitle (android/ ve ios/ repoda, eski kalmasınlar).
6. Ceren'in denediği önizlemeyi güncelle: `npm run build:single`, sonra `dist-single/index.html`'i önizleme sayfasına
   yayınla (bağlantı `docs/URUN.md`'de; Artifact aracın varsa aynı adrese yeniden yayınla).
7. Commit mesajı Türkçe ve ne değiştiğini söyler ("Ritmi Tut: çıkışta onay sor"). Sonra `main`e push et.

Ekran görüntüsü alırken uygulamayı hazır duruma getirmek için `localStorage` anahtarları:
`pianote_settings_v1` (`{"onboarded":true,"coachDone":true,"level":2}`), `notalik_rotate_hint_v1` = `"99"`,
`pianote_theme_v1` = `"dark"|"light"`. İstatistikler `notausta_stats_v1`; `lastPlayDate` `Date.toDateString()`
biçiminde, günlük anahtarlar `YYYY-MM-DD`. Açılış animasyonu ~3 sn sürer, sonra ekran gelir.

## Kod kuralları

- **Ham renk ve sayı yok**: her şey `src/design/tokens.ts`. Yazı rengi `colors.*`, dolgu `palette.*` / `category.*`.
  Açık tema yalnızca token kullanılırsa çalışır.
- **Tekrar yok**: aynı parça iki yerde gerekiyorsa `src/ui/` (genel) ya da `src/components/` (müziğe özgü) altına
  çıkar. Örnekler: `ExitConfirm`, `PlayChip`, `TopicLink`, `GoalStaff`, `MusicalStaff`.
- Yeni bileşenlerde Tailwind sınıfı değil satır içi stil + token kullan (tasarım sistemi önizlemesi Tailwind'i
  yüklemez). Eski dosyalarda kalan Tailwind sınıfları bilinen borç.
- Dosyanın başına bir-iki satır Türkçe açıklama yaz: ne yapar, nerede kullanılır.
- Depolama anahtarlarını **yeniden adlandırma** (eski adlar bilerek korunuyor). Yeni anahtar `solvato_` önekiyle.
- Bravura sembolleri `src/data/smufl.ts`'de, otomatik üretildi; elle düzenleme.
- Kullanıcıya görünen metin Türkçe. Yazım kuralları:
  - Yüzde önde: **%40** (40% değil). Süre: **0,4 sn** (`fmtSec`).
  - "Seviye" yalnızca Başlangıç / Orta / İleri için; XP basamakları "ünvan".
  - **"Öğretmen"** de, "hoca" deme.
  - Nota adları Do Re Mi Fa Sol La Si; oktavlı yazımda "Fa4".

## Ürün ilkeleri (kısa)

- Uygulama **öğretmenle birlikte** kullanılan bir pratik aracı; dersin yerini almaz.
- Sunucu yok, hesap yok, veri toplanmaz (mağaza gizlilik beyanları buna dayanıyor — bir şey gönderen özellik
  eklenecekse önce Ceren'e sor, gizlilik politikası da değişir).
- Yayında **reklam yok**. Önce büyüme, sonra Solvato Plus ve öğretmen paneli (`docs/URUN.md`).
- Solfie (maskot) az görünür: tanıtım, tur sonucu, kutlama. Her ekrana ekleme.
