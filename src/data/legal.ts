// Ayarlar › Gizlilik ve Lisanslar sayfalarının metinleri.
// Gizlilik metni mağazadaki gizlilik politikasıyla aynı içerikte tutulmalı (App Store 5.1.1: politika uygulama içinden de
// erişilebilir olmalı). Lisans metinleri paketlerin kendi LICENSE dosyalarından derleme sırasında alınır.
import bravuraLicense from "./BRAVURA-LICENSE.txt?raw"
import outfitLicense from "@fontsource/outfit/LICENSE?raw"
import jetbrainsLicense from "@fontsource/jetbrains-mono/LICENSE?raw"

export type LegalSection = { title: string; body: string[] }

export const PRIVACY: LegalSection[] = [
  {
    title: "Özet",
    body: [
      "Solvato hiçbir kişisel veri toplamaz, saklamaz ya da kimseyle paylaşmaz. Uygulamayı kullanmak için hesap açman gerekmez.",
      "İlerlemen yalnızca kendi cihazında tutulur; uygulama çalışmak için internete bağlanmaz ve bize hiçbir bilgi göndermez.",
      "Uygulamada reklam, analitik ya da üçüncü taraf takip aracı yoktur.",
    ],
  },
  {
    title: "Cihazında tutulan bilgiler",
    body: [
      "Ayarlar: seviye, çalışılacak notalar, günlük hedef, tema, ses tercihi, hatırlatıcı saati ve girdiğin öğretmen kodu.",
      "İlerleme: çözdüğün soru sayıları, doğruluk oranları, seri, XP, ünvan, yıldızlar ve oyun sonuçları.",
      "Bu bilgiler cihazından çıkmaz. Uygulamayı sildiğinde ya da Ayarlar › İlerlemeyi sıfırla ile hepsi silinir.",
    ],
  },
  {
    title: "İzinler",
    body: [
      "Bildirimler: yalnızca günlük hatırlatıcıyı açarsan istenir. Hatırlatmayı cihazın kendisi zamanlar, internet kullanılmaz.",
      "Titreşim: doğru ve yanlış cevapta kısa titreşim; izin gerektirmez, Ayarlar'dan kapatılabilir.",
      "Uygulama konum, kamera, mikrofon, rehber ya da fotoğraflarına erişmez.",
    ],
  },
  {
    title: "Paylaşım",
    body: [
      'Öğretmen kodu, haftalık rapor ve meydan okuma için "Gönder" düğmeleri cihazının kendi paylaşım menüsünü açar. Neyi kime göndereceğini sen seçersin; gönderim seçtiğin uygulama (örneğin WhatsApp) üzerinden yapılır. Solvato bu içeriği kendisi hiçbir yere göndermez.',
    ],
  },
  {
    title: "Çocuklar",
    body: [
      "Solvato çocuklar dahil her yaştan müzik öğrencisi için hazırlandı. Hiçbir kullanıcıdan, çocuklardan da, kişisel veri toplanmaz; uygulamada reklam ya da sohbet yoktur.",
    ],
  },
  {
    title: "KVKK",
    body: [
      "Solvato, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında kişisel veri işlemez ve yurt dışına veri aktarmaz.",
    ],
  },
  {
    title: "Değişiklikler",
    body: [
      "Uygulamaya veri toplayan bir özellik eklenirse bu politika önceden güncellenir ve değişiklik uygulama içinde duyurulur. Güncel sürüm ve iletişim bilgisi mağaza sayfasındaki gizlilik politikası bağlantısındadır.",
    ],
  },
]

export type License = { name: string; use: string; notice: string; text?: string }

const MIT = `Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`

export const LICENSES: License[] = [
  {
    name: "Bravura",
    use: "Nota sembolleri",
    notice: "SIL Open Font License 1.1",
    text: bravuraLicense.trim(),
  },
  { name: "Outfit", use: "Yazı tipi", notice: "SIL Open Font License 1.1", text: outfitLicense.trim() },
  { name: "JetBrains Mono", use: "Yazı tipi", notice: "SIL Open Font License 1.1", text: jetbrainsLicense.trim() },
  {
    name: "React, React DOM",
    use: "Arayüz kütüphanesi",
    notice: "MIT License · Copyright (c) Meta Platforms, Inc. and affiliates.",
    text: MIT,
  },
  {
    name: "Capacitor",
    use: "iOS ve Android kabuğu",
    notice: "MIT License · Copyright (c) 2017-present Drifty Co.",
    text: MIT,
  },
  {
    name: "Capacitor eklentileri",
    use: "Bildirim, titreşim, paylaşım, ekran yönü, durum çubuğu, depolama",
    notice: "MIT License · Copyright 2020-present Ionic",
    text: MIT,
  },
]
