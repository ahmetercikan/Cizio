# Play Console'a yükleme — adım adım (kopyala-yapıştır cevaplarla)

Dosyalar: `store/` klasörü. Yüklenecek paket: `store/release/cizio-1.2.0.aab`.

## 1) Uygulama oluştur
Play Console → **Uygulama oluştur**
- Uygulama adı: `Çizio: Adım Adım Çizim Öğren`
- Varsayılan dil: **Türkçe (tr-TR)**
- Uygulama / Oyun: **Uygulama**
- Ücretsiz / Ücretli: **Ücretsiz** (sonradan ücretliye çevrilemez; ücretsiz kalsın)
- Beyanları işaretle → Oluştur

## 2) Kontrol paneli → "Uygulamanızı kurun" listesi

### Gizlilik politikası
`https://ahmetercikan.github.io/ciziktir/gizlilik.html`

### Uygulama erişimi
**Tüm işlevler özel erişim olmadan kullanılabilir** (giriş/hesap yok).

### Reklamlar
**Hayır, uygulamam reklam içermiyor.**

### İçerik derecelendirmesi (IARC anketi)
- E-posta: kendi adresiniz
- Kategori: **Yardımcı program, verimlilik, iletişim veya diğer** → ya da "Eğitim" seçeneği varsa onu seçin
- Tüm sorulara **Hayır** (şiddet, cinsellik, küfür, kumar, uyuşturucu, kullanıcı etkileşimi, konum paylaşımı, dijital satın alma yok).
- Sonuç: PEGI 3 / Herkes.

### Hedef kitle ve içerik
- Hedef yaş grupları: **6-8** ve **9-12** (isterseniz 13-15 de eklenebilir; 5 ve altı seçmeyin)
- "Uygulamanız çocuklara hitap ediyor mu?" → **Evet**
- Reklam kimliği / reklam: yok.
- Bu seçim "Aileler için tasarlandı" politikasını devreye sokar; uygulama zaten uyumlu (reklam yok, veri toplama yok, dış bağlantı yok).

### Haber uygulamaları
**Hayır.**

### COVID-19 uygulamaları
**Hayır / geçerli değil.**

### Veri güvenliği
- "Uygulamanız kullanıcı verisi topluyor veya paylaşıyor mu?" → **Hayır**
- Veriler aktarım sırasında şifreleniyor mu? → geçerli değil (veri gönderilmiyor); sorulursa **Evet**
- Kullanıcılar veri silinmesini isteyebilir mi? → **Evet** (uygulama içinden profil silme; kaldırma tüm veriyi siler)
- Kamera izni için açıklama istenirse: "Fotoğraf yalnızca cihazda işlenir, hiçbir yere gönderilmez."

### Devlet uygulamaları
**Hayır.**

### Finansal özellikler
**Uygulamam finansal özellik içermiyor.**

### Sağlık
**Uygulamam sağlık özelliği içermiyor.**

## 3) Mağaza girişi (Ana mağaza girişi)
- Uygulama adı: `Çizio: Adım Adım Çizim Öğren` (30 karakter sınırı; sığmazsa `Çizio: Çizim Öğren`)
- Kısa açıklama (80): `Çizio ile adım adım çizmeyi öğren: kâğıtta ya da ekranda, sesli anlatımla!`
- Tam açıklama: `store/listing-tr.md` içindeki "Tam açıklama" bölümü
- Uygulama simgesi (512×512): `store/icon-512.png`
- Öne çıkan görsel (1024×500): `store/feature-graphic.png`
- Telefon ekran görüntüleri (en az 2): `store/screenshots/phone-*.png`
- 7 inç / 10 inç tablet ekran görüntüleri: `store/screenshots/tablet-*.png` (ikisine de aynıları yüklenebilir)
- Kategori: **Eğitim**
- Etiketler: Çizim, Çocuk eğitimi, Sanat
- İletişim e-postası: kendi adresiniz (mağazada görünür)

## 4) Sürüm yükleme
Test et ve yayınla → **Dahili test** (önerilen ilk adım) ya da **Üretim** → Yeni sürüm oluştur
- Play Uygulama İmzalama: **Google tarafından oluşturulan anahtar** ile devam (varsayılan). Bizim anahtarımız "yükleme anahtarı" olur.
- Uygulama paketi: `store/release/cizio-1.2.0.aab` dosyasını sürükleyin
- Sürüm adı: `1.2.0` (otomatik gelir)
- Sürüm notları (tr-TR):
  ```
  İlk sürüm: 40 adım adım çizim dersi, kâğıtta ve ekranda çizim, sesli anlatım, boyama atölyesi ve günlük görevler.
  ```
- Kaydet → İncele → Yayına başla

## 5) Ülkeler
Sürüm → Ülkeler/bölgeler → **Türkiye** (isterseniz "tüm ülkeler")

## 6) Olası uyarılar ve cevapları
- "Hedef API düzeyi": targetSdk 36, sorun yok.
- "Tehlikeli izin: CAMERA": Kamera bildirimi istenirse: *Kâğıda yapılan çizimin fotoğrafını çekmek için; görüntü cihazda işlenir, yüklenmez.*
- "Aileler politikası — üçüncü taraf SDK": yok (yalnızca Capacitor çekirdeği).
- Yeni kişisel hesaplarda (Kasım 2023 sonrası) üretime çıkmadan önce **kapalı test: en az 12 test kullanıcısı, 14 gün** şartı vardır. Böyle bir uyarı görürseniz "Kapalı test" kanalına yükleyip aile/arkadaş e-postalarını test listesine ekleyin.

## 7) Yayın sonrası
- İnceleme genellikle 1-7 gün sürer (çocuk uygulamalarında biraz daha uzun olabilir).
- Yeni sürüm için: `android/app/build.gradle` içinde `versionCode` +1, `versionName` güncelle → `npm run android:aab` → yeni AAB'yi yükle.
