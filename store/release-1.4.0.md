# Çizio 1.4.0 (versionCode 6) — Google Play yayın rehberi

## Yüklenecek dosyalar

| Ne | Dosya |
|---|---|
| Uygulama paketi | `store/release/cizio-1.4.0.aab` |
| Telefonda denemek için (Play'e yüklenmez) | `store/release/cizio-1.4.0.apk` |
| Telefon ekran görüntüleri (8 adet, 1080×1920) | `store/screenshots/phone-01-dunyalar.png` … `phone-08-giydir.png` |
| Tablet ekran görüntüleri (8 adet, 1920×1200) | `store/screenshots/tablet-01-dunyalar.png` … `tablet-08-giydir.png` |
| Öne çıkan görsel (1024×500) | `store/feature-graphic.png` |
| Uygulama simgesi (512×512) | `store/icon-512.png` (değişmedi) |
| Mağaza metinleri | `store/listing-tr.md` |

Ekran görüntülerinin sırası: 1 dünya seçimi, 2 Çizim Atölyesi, 3 kepçe dersi, 4 boyama, 5 İş Makineleri, 6 English Club, 7 İngilizce hikaye, 8 Giydirme Stüdyosu.

## 1) Yeni sürümü yükle

1. Play Console → Çizio → **Test ve yayınla → Üretim** (ya da önce denemek isterseniz **Dahili test**).
2. **Yeni sürüm oluştur** → **App Bundle'ları yükle** → `cizio-1.4.0.aab`.
3. Sürüm adı otomatik gelir: `6 (1.4.0)`.
4. **Sürüm notları** → `<tr-TR>` alanına aşağıdaki metni yapıştırın.
5. **Sonraki** → uyarıları okuyun → **Kaydet** → **Sürümü incelemeye gönder / Kullanıma sunmayı başlat**.

### Sürüm notları (tr-TR, en fazla 500 karakter)

```
Yenilikler:
• Çizio artık 3 dünya: Çizim Atölyesi, Giydirme Stüdyosu ve English Club
• English Club: oyunlar, resimli hikayeler ve her gün 15 dakikalık English Time ile oynayarak İngilizce
• Yeni İş Makineleri yolu: kamyon, çöp kamyonu, kepçe, buldozer, vinç ve daha fazlası (toplam 98 ders)
• Tüm anlatımlar Çizio'nun doğal sesiyle
• Sayfalar çok daha hızlı açılıyor, donmalar giderildi
• Hata düzeltmeleri
```

## 2) Mağaza girişini güncelle

Play Console → **Büyüme → Mağazadaki varlık → Ana mağaza girişi**:

1. **Kısa açıklama** ve **Tam açıklama**: `store/listing-tr.md` içindeki metinleri kopyalayın (yeni metin English Club, Giydirme Stüdyosu ve 98 dersi anlatıyor).
2. **Grafikler → Öne çıkan grafik**: `store/feature-graphic.png`.
3. **Telefon ekran görüntüleri**: eskilerini silin, `phone-01` … `phone-08`'i bu sırayla yükleyin.
4. **7 inç tablet** ve **10 inç tablet ekran görüntüleri**: eskilerini silin, `tablet-01` … `tablet-08`'i yükleyin (ikisine de aynı dosyalar).
5. **Kaydet**. Mağaza girişi değişiklikleri ayrıca incelemeye gider (Yayınlama genel bakışı → Değişiklikleri incelemeye gönder).

## 3) Uygulama içeriği — değişiklik gerekmez

- **Veri güvenliği:** Yeni veri toplanmıyor. Sesli okuma için telefonun kendi metin okuma motoru kullanılıyor; internete veri gönderilmiyor.
- **Hedef kitle ve içerik:** Değişmedi (6-8 ve 9-12 yaş). Reklam ve uygulama içi satın alma yok.
- **İzinler:** Yeni izin eklenmedi.

## Bu sürümde neler var (ayrıntı)

- Açılışta 3 dünya seçimi; her dünyanın kendi menüsü.
- English Club: Çizio Says (hareketle), Listen & Find, Color Me, Treasure Hunt, Home Hunt, 5 hikaye, 16 konu / ~150 kelime, yaşa göre zorluk, ebeveyn ekranında "Evde İngilizce".
- 58 yeni ders (40 → 98), yeni yol: İş Makineleri; macerada "Şantiye" durağı ve baret.
- Ses: 3.276 cümle Gemini "Sulafat" sesiyle, Whisper ile doğrulandı; baştaki "çıt" sesleri temizlendi. Sesi olmayan nadir cümleler telefonun kendi sesiyle okunur (önceden Android'de sessizdi).
- Performans: ders eskizleri hazır resim olarak geliyor (sayfa geçişlerinde donma yok), Atölye sayfası %50+ daha hafif, macera haritası boşta %60 → ~%13 işlemci.
- Düzeltmeler: sesli anlatım kapalıyken çıkartma kazanınca oluşan çökme; dar telefonlarda kesilen başlıklar; İngilizce oyunlarda söylenen ile gösterilen sorunun karışması; Fredoka yazı tipinde eksik ş/ğ/İ harfleri.
