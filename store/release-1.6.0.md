# Çizio 1.6.0 (versionCode 10) — Google Play yayın rehberi

Play'deki son sürüm 1.5.0 (versionCode 8, yayında). 1.6.0, 1.5.0'dan sonraki bütün yenilikleri içerir.

## Yüklenecek dosya

| Ne | Dosya |
|---|---|
| Uygulama paketi | `store/release/cizio-1.6.0.aab` (~254 MB) |

Ekran görüntüleri, simge ve mağaza metinleri değişmedi.

## Paket neden iki parça?

Seslendirme 8.727 cümleye çıktı (~232 MB). Play, bir telefonun indirdiği ana paketi en çok 200 MB kabul eder.
Sesler artık `voicepack` adlı **kurulumla gelen ek pakette** (install-time asset pack): telefon onu uygulamayla
birlikte indirir, uygulama dosyaları eskisi gibi `public/voice/...` yolundan okur, kalite düşmez.
Ana paket ~20 MB. `npm run android:aab` bunu kendisi yapar (`scripts/android-voicepack.ts`).
Emülatörde (Pixel 3a, Android 14) denendi: ses listesi ve MP3'ler ek paketten açılıyor.

Not: `npm run android:apk` ile çıkan tek APK'da ek paket yoktur; o APK'da cümleleri telefonun kendi sesi okur.

## Mikrofon izni

English Club → Say It! için `RECORD_AUDIO` eklendi. Kayıt telefonda kalır, hiçbir yere gönderilmez ve dinlendikten
sonra silinir. Bu yüzden **Veri güvenliği formunda değişiklik gerekmez** (yalnızca cihazda işlenen veri "toplanan veri"
sayılmaz).
Mikrofon `required="false"`: yoksa Play, mikrofonsuz 20 cihazı (TV, bazı tabletler) dışarıda bırakıyordu.
Bu yüzden ilk yüklenen paket 9 taslaktan çıkarıldı, yerine 10 yüklendi.

## Yükleme

1. Play Console → Çizio → **Test ve yayınla → Üretim** → **Yeni sürüm oluştur**.
2. **Yükle** → `cizio-1.6.0.aab`. Sürüm adı otomatik gelir: `10 (1.6.0)`.
3. **Sürüm notları** → aşağıdaki metin.
4. **Sonraki** → **Kaydet** → **Sürümü incelemeye gönder**.

### Sürüm notları (tr-TR)

```
Yenilikler:
• 98 yeni çizim dersi; Masal, Uzay ve Meslekler yolları
• Harfler ve Sayılar: parmakla yazmayı öğren
• English Club: ABC, şarkılar, konuşma pratiği, 20 hikâye
• Ada: Şehir Merkezi, AVM, sinema, müze ve koleksiyon
• Evcil Hayvan Parkı, mevsimler ve hava, fotoğraf modu
• 14 mini oyun, hazine sandıkları, günlük hediye
• Haftalık karne ve sertifika
• Ebeveyn: ekran süresi sınırı, boyama sayfaları
• Daha hızlı açılış
```

Müzik Odası ve Matematik Parkı bu sürümde kapalı (`src/lib/flags.ts`), notlarda yok.
