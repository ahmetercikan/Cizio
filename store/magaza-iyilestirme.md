# Mağaza sayfası iyileştirme (dönüşüm oranı)

Hazır dosyalar `store/promo/`:
- `phone-01…08.png` (1080×1920): telefon ekran görüntüleri, başlıklı tanıtım kartları
- `tablet-01…08.png` (1920×1200): 7 ve 10 inç tablet
- `feature-graphic.png` (1024×500): öne çıkan görsel

Yeniden üretmek için: `npx tsx scripts/store-promo.mts`. Ham ekranlar `store/screenshots/` klasöründen alınır.

Metinler: `store/listing-tr.md` (kısa ve tam açıklama, "çizim öğren", "boyama", "çocuk" gibi aranan kelimelerle).

## Önerilen yol: A/B testi (Mağaza girişi denemeleri)
Play Console → Kullanıcı sayısını artırın → Play Store'daki varlığı → **Mağaza girişi denemeleri** → Deneme oluştur:
- Tür: Varsayılan grafikler; dil: Türkçe (tr-TR)
- Hedef metrik: Elde tutulan ilk yüklemeler
- Varyant: yeni ekran görüntüleri + yeni öne çıkan görsel (ve isterseniz yeni kısa açıklama)
- Kitlenin %50'si
- 1-2 hafta sonra Play hangi sürümün daha çok yükleme getirdiğini gösterir; kazananı "Uygula" ile kalıcı yaparsınız.

## Tanıtım videosu (isteğe bağlı, etkisi büyük)
- Play yalnızca YouTube bağlantısı kabul eder (herkese açık ya da liste dışı; reklamlar kapalı olmalı).
- Telefonda ekran kaydıyla 30-45 saniye, yatay çekin. Sıra:
  1. ders: kalem çiziyor
  2. çocuk çiziyor
  3. boyama
  4. Çizio Adası'nda lunapark ve hız treni
  5. okul içi
  6. roketle Mars
  7. giydirme
  8. kapanış
- Sesli anlatım açık kalsın (Çizio'nun sesi). Müzik eklenecekse telifsiz olsun.
