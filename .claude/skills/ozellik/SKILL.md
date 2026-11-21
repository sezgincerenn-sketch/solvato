---
name: ozellik
description: Yeni ya da büyük bir özellik isteğini koda geçmeden önce Ceren'le konuşup docs/ozellikler/ altına özellik dokümanı yazar. Birden çok ekranı etkileyen, birden çok yoruma açık ya da ürün kararı içeren isteklerde kullan.
---

# Özellik dokümanı

Amaç: kodu yazmadan önce ne yapılacağı konusunda anlaşmak. Kod yazma; yalnızca doküman.

1. `docs/URUN.md` (alınmış kararlar, kaldırılanlar, açık işler) ve ilgili ekranın kodunu oku. İstek önceki bir kararla
   çelişiyorsa (ör. öğrenme yolu haritası alınmadı, ritim heceleri eklenmeyecek) önce bunu söyle.
2. Ceren'e **çoktan seçmeli** sorular sor (AskUserQuestion, en fazla 4 soru bir seferde, her seçeneğe kısa açıklama,
   önerdiğin seçenek ilk sırada ve "(Önerilen)"). Ceren kod bilmiyor: ekranda göreceği haliyle sor.
   Yeterince netleşene kadar tur tekrarla (genelde 1–3 tur). Kendin cevaplayabileceğin şeyi sorma.
3. `docs/ozellikler/<kisa-ad>.md` yaz:
   - **Amaç** (bir-iki cümle, kimin için)
   - **Kullanıcı ne görür** (ekran ekran, düğme metinleriyle)
   - **Kurallar ve sınır durumları** (boş durum, ses kapalı, çevrimdışı, telefon/tablet, koyu/açık tema, ilk kullanım)
   - **Kabul ölçütleri** — her biri doğrulanabilir ("Ritmi Tut'ta geri düğmesi onay penceresi açar")
   - **Kapsam dışı**
   - **Etkilenen dosyalar** (tahmini) ve **gizlilik etkisi** (veri gönderen bir şey varsa önce Ceren'e sor)
4. Ceren'e özeti ver ve şunu öner: "Onaylarsan yeni bir oturumda `docs/ozellikler/<kisa-ad>.md'yi uygula` yaz."
   Doküman, bitince `inceleyici` ajanının karşılaştıracağı ölçüttür.
