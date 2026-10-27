# Çizio 1.7.0 (versionCode 11) — Google Play yayın rehberi

Play'deki son sürüm 1.6.0 (versionCode 10, yayında). 1.7.0, 1.6.0'dan sonraki bütün yenilikleri içerir.

## Yüklenecek dosya

| Ne | Dosya |
|---|---|
| Uygulama paketi | `store/release/cizio-1.7.0.aab` (~151 MB; seslendirme yine `voicepack` ek paketinde) |

Play ekran görüntüleri, simge ve mağaza metinleri değişmedi. App Store görselleri (`store/promo/ios/`) yenilendi:
telefonlar yamuk duruyor ve bir görüntüden ötekine taşıyor (panorama).

Mac'te derleme: `npm run android:sync`, sonra `android` klasöründe
`JAVA_HOME=$(/usr/libexec/java_home -v 21) sh gradlew bundleRelease`.

## Yükleme

1. Play Console → Çizio → **Test ve yayınla → Üretim** → **Yeni sürüm oluştur**.
2. **Yükle** → `cizio-1.7.0.aab`. Sürüm adı otomatik gelir: `11 (1.7.0)`.
3. **Sürüm notları** → aşağıdaki metin.
4. **Sonraki** → **Kaydet** → **Sürümü incelemeye gönder**.

### Sürüm notları (tr-TR)

```
<tr-TR>
• Çizio Adası büyüdü: yeni Yarış Kıyısı! Kart yarışı, engelli koşu, volkan ve buz parkuru
• Engel parkuru, trambolin parkı ve balon alanı
• Zıplamak artık çok daha kolay
• Ada açılınca ekran kendiliğinden yan döner
• Binaların, tabelaların ve eşyaların içinden geçilmez; tekneler denizde
• Minecraft gibi kolay inşa: seçtiğin blok elinde
• Uygulama daha küçük
</tr-TR>
```
