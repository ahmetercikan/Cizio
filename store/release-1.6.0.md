# Çizio 1.6.0 (versionCode 8) — Google Play yayın rehberi

## Yüklenecek dosyalar

| Ne | Dosya |
|---|---|
| Uygulama paketi | `store/release/cizio-1.6.0.aab` |
| Telefonda denemek için (Play'e yüklenmez) | `store/release/cizio-1.6.0.apk` |

1.5.0'ı henüz yüklemediyseniz yüklemeyin; 1.6.0 onun her şeyini (çevrimiçi arkadaşlar) içerir.

## 1) Veri güvenliği

- 1.5.0 için formu doldurduysanız **değişiklik gerekmez**: yeni özelliklerin hepsi cihazda çalışır, internete bir şey göndermez.
- Doldurmadıysanız önce `store/release-1.5.0.md` içindeki **1) Veri güvenliği formunu güncelle** adımını yapın.

## 2) Yeni sürümü yükle

1. Play Console → Çizio → **Test ve yayınla → Üretim** → **Yeni sürüm oluştur**.
2. **App Bundle'ları yükle** → `cizio-1.6.0.aab`. Sürüm adı otomatik gelir: `8 (1.6.0)`.
3. **Sürüm notları** → `<tr-TR>` ile `</tr-TR>` arasına aşağıdakini yapıştırın.
4. **Sonraki** → **Kaydet** → **Sürümü incelemeye gönder**.

### Sürüm notları (tr-TR)

1.5.0 yayınlandıysa:

```
Yenilikler:
• Çizimin canlansın! Kedin göz kırpıyor, kamyonunun tekerlekleri dönüyor, balığın denizde yüzüyor
• Çizdiğinle oyna: kendi çizdiğin resim oyunun kahramanı olsun, yıldızları topla
• Hikaye kitabım: çizimlerinden masal yap, Çizio sana okusun, kitabını PDF olarak kaydet
• Hata düzeltmeleri
```

1.5.0 yayınlanmadıysa (iki sürümün yenilikleri birlikte):

```
Yenilikler:
• Çizimin canlansın! Kedin göz kırpıyor, kamyonunun tekerlekleri dönüyor, balığın yüzüyor
• Çizdiğinle oyna: kendi resmin oyunun kahramanı olsun, yıldızları topla
• Hikaye kitabım: çizimlerinden masal yap, Çizio okusun, PDF olarak kaydet
• Arkadaşlarla oyna: ebeveyn onayıyla meydan okuma, canlı düello, birlikte boyama
• Çevrimiçi özellikler varsayılan olarak kapalıdır, Ebeveyn bölümünden açılır
```

## Bu sürümde neler var (ayrıntı)

- **Canlanan çizim:** ekranda çizilen ders resimleri parçalarına ayrılır (her kalem darbesi hangi adımda çizildiğini
  bilir): gözler kırpar, tekerlekler döner, kuyruk sallanır, kanatlar çırpar, kollar el sallar, kulaklar oynar. Resim
  konusuna göre sahnesinde hareket eder (balık denizde yüzer, roket uzaya uçar, kamyon yolda gider, çiçek rüzgarda
  sallanır). Kâğıt fotoğraflarında ve eski resimlerde arka plan saydamlaştırılır, resim bütün olarak hareket eder.
  Kutlama ekranında "Canlandır!", galeride her resimde "Canlandır".
- **Çizdiğinle oyna:** 45 saniyelik tur; araç ve hayvanlarla engellerin üstünden zıplama, uçan ve yüzenlerle dokunarak
  yükselme. Çarpınca bir şey kaybedilmez. Toplanan yıldızlara göre tur başına en çok 3, günde en çok 5 ödüllü tur.
- **Hikaye kitabım:** 2-5 resim + 4 masal konusu (Büyük Piknik, Hazine Avı, Uzay Yolculuğu, Doğum Günü Partisi);
  98 dersin her biri için kahraman ve arkadaş cümleleri; Çizio sayfa sayfa sesli okur ve sayfayı kendisi çevirir;
  kitap A4 PDF olarak kaydedilir / paylaşılır. Kitaplar profilde saklanır.
- Ekranda çizilen resimler artık kalem kaydıyla birlikte galeriye kaydedilir (canlandırma için).
- Android'de denendi: canlanan çizim ve oyun saniyede 60 kare.
