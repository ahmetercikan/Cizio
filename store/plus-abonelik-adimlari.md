# Çizio Plus (ileride): abonelik açma adımları

> Şimdilik kullanılmıyor: Çizio Adası ücretsiz (src/world/plus.ts PLUS_ENABLED = false). Ücretli yapmak istendiğinde: PLUS_ENABLED = true, `npm i cordova-plugin-purchase`, `npx cap sync android`, sonra aşağıdaki adımlar.

## (Eski başlık) Çizio 1.7.0 — Çizio Plus ve 3B oyun

## Bu sürümde neler var

- **Çizdiğinle oyna 3 boyutlu:** çocuğun çizimi 3B bir yolda koşar/sürer/uçar/yüzer. Sağa sola kaydırarak 3 şerit
  arasında engellerden kaçılır, dokununca zıplanır. Yıldız, mıknatıs (yıldızları çeker), kalkan (bir çarpmayı önler),
  kalp (can). 3 can, 60 saniye. Küçükler için ekranda büyük ok ve Zıpla düğmeleri.
- **Çizio Adası (Çizio Plus, ücretli):** Giydir karakteriyle gezilen 3B ada. Kaydırak, salıncak, dans pisti, tekne turu,
  kendi resimlerinin sergilendiği sanat galerisi, ev (kıyafet değiştirme), Çizio'dan günlük 3 görev + yıldız avı
  (bitince 5 yıldız). Joystick, dokunarak yürüme, kamerayı döndürme, el sallama / zıplama / alkış.
- Açılışta dördüncü dünya kartı. Satın alma ebeveyn kilidinin arkasında; Ebeveyn bölümünde "Çizio Plus" kutusu
  (satın al, geri yükle, aboneliği yönet). Gizlilik politikası güncellendi.

## Dosyalar

| Ne | Dosya |
|---|---|
| Uygulama paketi | `store/release/cizio-1.7.0.aab` |
| Telefonda denemek için | `store/release/cizio-1.7.0.apk` |

## Sıra önemli

Abonelik ürünü Play Console'da oluşturulmadan Çizio Adası satın alınamaz. Bu yüzden 1.7.0 önce **dahili teste**
yüklenir, ürün oluşturulup denenir, sonra üretime çıkar.

### 1) Ödeme profili (satıcı hesabı) — bir kez

Play Console → sol menü **Para kazanma kurulumu** (ya da **Ayarlar → Ödeme profili**) → **Ödeme profili oluştur**.
- Ülke: Türkiye; hesap türü: Bireysel (şirketiniz varsa Kuruluş).
- Ad, adres, telefon; banka bilgisi (IBAN) — Google ödemeleri buraya yapar.
- Vergi bilgileri istenirse doldurun. KDV'yi Türkiye'deki satışlarda Google tahsil edip öder.
- Onay birkaç gün sürebilir; hesap doğrulanınca abonelik oluşturulabilir.

### 2) 1.7.0'ı dahili teste yükle

Play Console → **Test ve yayınla → Test → Dahili test** → **Yeni sürüm oluştur** → `cizio-1.7.0.aab` → kaydet ve kullanıma sun.
Test kullanıcıları listesine kendi Gmail adresinizi ekleyin (Testçiler sekmesi) ve verilen bağlantıdan uygulamayı yükleyin.
(Play, abonelik ürününü ancak faturalandırma izni olan bir paket yüklendikten sonra oluşturmaya izin verir.)

### 3) Abonelik ürününü oluştur

Play Console → **Para kazan → Ürünler → Abonelikler** → **Abonelik oluştur**
- **Ürün kimliği:** `cizio_plus_yearly` (aynen böyle; uygulama bu kimliği arar)
- **Ad:** Çizio Plus
- **Temel plan ekle** → kimlik: `yillik` → tür: **Otomatik yenilenen** → faturalandırma dönemi: **1 yıl**
  → fiyat: Türkiye için **499,99 TL** (diğer ülkeler için "fiyatları dönüştür" yeterli) → **Etkinleştir**.
- Ücretsiz deneme / teklif eklemeyin (siz deneme istemediniz).

### 4) Satın almayı test et (ücret kesilmez)

Play Console → **Ayarlar → Lisans testi** → Gmail adresinizi ekleyin. Dahili test uygulamasında Çizio Adası →
"Yıllık 499,99 TL" → ebeveyn sorusu → Google Play penceresi "Test kartı, her zaman onaylar" ile satın alın.
Test aboneliği birkaç dakikada yenilenir ve kendiliğinden biter; gerçek para çekilmez.

### 5) Üretime çıkar

Dahili test sürümünü **Üretime yükselt** (ya da Üretim → Yeni sürüm → aynı AAB). Sürüm notları (tr-TR):

```
Yenilikler:
• Çizdiğinle oyna artık 3 boyutlu! Sağa sola kaç, zıpla; mıknatıs, kalkan ve yıldızları topla
• Yeni: Çizio Adası! Giydirdiğin karakterle 3B adada gez; kaydırak, salıncak, dans ve tekne turu
• Her gün Çizio'dan yeni görevler (Çizio Adası, Çizio Plus ile)
• Hata düzeltmeleri
```

### 6) Uygulama içeriği

- **Veri güvenliği:** değişiklik gerekmez (satın almayı Google Play yürütür; uygulama ödeme verisi toplamaz).
- Mağaza girişinde "Uygulama içi satın alma içerir" ibaresi Play tarafından kendiliğinden eklenir.
- Aileler politikası: satın alma ebeveyn kilidinin arkasında olduğu için uygundur.
