# Çizio — iOS (App Store) yayın rehberi

> **Bu dosya, MacBook'taki Claude Code oturumu için yazıldı.** Kullanıcı bu depoyu Mac'e indirip sana "IOS.md'yi
> oku ve iOS sürümünü hazırla" diyecek. Aşağıdaki adımları sırayla uygula; kullanıcının yapması gereken (hesap, ödeme,
> onay) adımlarda dur ve ona ne yapacağını sade Türkçeyle anlat.

> **Durum (14 Ekim 2026):** Bölüm 2, 3 ve 4 tamamlandı ve `ios/` depoya eklendi (simgeler, açılış ekranı,
> Info.plist izinleri, sürüm 1.5.0 / build 1, iPhone + iPad, Mac/Vision kapalı, bölge `tr`). Mac'te yalnızca
> `npm ci` → `npm run ios:sync` → `npx cap open ios`, ardından Xcode'da **Team** seçimi (bölüm 4) ve bölüm 5'ten
> devam et. Kullanıcı için sade adımlar ve App Store metinleri: `store/app-store-1.5.0.md`.

## 0. Bağlam ve çalışma kuralları

- **Uygulama:** Çizio — 5-9 yaş çocuklar için Türkçe çizim dersleri, Giydirme Stüdyosu, English Club ve 3B "Çizio
  Adası". React 18 + TypeScript + Vite 5 web uygulaması; Capacitor 8 ile yerel uygulamaya sarılır.
- **Android zaten Google Play'de** (paket `com.ahmetercikan.cizio`, sürüm 1.5.0). iOS aynı kodla, **aynı paket
  kimliğiyle** (`com.ahmetercikan.cizio`) yayınlanacak. İlk iOS sürümü: **1.5.0, build 1**.
- **Kullanıcıyla iletişim:** Kullanıcı teknik değil. **Her zaman Türkçe ve sade** yaz; teknik terim gerekirse kısaca açıkla.
  Apple hesabı, ödeme, App Store Connect'te tıklanacak yerler gibi onun yapacağı işleri adım adım, ekranda göreceği
  adlarla anlat. Ekran görüntüsü isteyebilirsin.
- **Güvenlik:**
  - İmza sertifikaları, `.p8`/`.p12` dosyaları, şifreler ve `.env*` dosyaları **asla** depoya girmez.
  - `.env.local` iOS derlemesi için gerekmez (Firebase web ayarları `src/online/config.ts` içinde ve gizli değil).
- **Değiştirme:** Uygulamanın davranışını iOS için değiştirmen gerekmedikçe ortak koda dokunma. Android aynı kodu
  kullanıyor. Değişiklik gerekirse `Capacitor.getPlatform() === 'ios'` ile sınırla ve Android'i bozmadığını
  `npm test` ile doğrula.
- **Bitirince:** `ios/` klasörünü ve yaptığın değişiklikleri commit edip `main`'e gönder (git push). Kullanıcı Windows'ta
  da çalışıyor; kod iki yerde aynı kalmalı. Commit mesajları Türkçe.

## 1. Ön koşullar (kullanıcıyla birlikte)

| Gerekli | Nasıl |
|---|---|
| **Apple Developer Program** üyeliği (yıllık ~99 $) | Kullanıcı yapar: https://developer.apple.com/programs/enroll → Apple ID ile giriş → **Birey (Individual)** olarak kayıt. Onay birkaç saat ile 2 gün sürebilir. Üyelik onaylanmadan App Store'a yükleme olmaz (ama simülatörde deneme olur). |
| **Xcode** (en son sürüm) | Mac App Store'dan. Kurulunca bir kez aç, ek bileşenleri kur. Sonra `xcode-select -p` ile kontrol et. |
| **Node.js 22** | `node -v`; yoksa `brew install node@22` (Homebrew yoksa https://brew.sh). |
| **Git** | Xcode ile gelir. |
| Xcode'a Apple ID | Xcode → Settings → Accounts → **+** → Apple ID. Üyelik onaylanınca "Team" görünür. |

CocoaPods genelde gerekmez (Capacitor 8 Swift Package Manager kullanır). `npx cap add ios` CocoaPods isterse
`brew install cocoapods` ile kur.

## 2. Projeyi hazırla

```bash
git clone https://github.com/ahmetercikan/Cizio.git
cd Cizio
npm ci
npm i @capacitor/ios@^8.5.2      # @capacitor/core ile aynı ana sürüm olmalı (package.json'a bak)
npm run build                     # tsc + vite build → dist/
npx cap add ios                   # ios/ klasörünü oluşturur
npx @capacitor/assets generate --ios   # assets/ klasöründeki simge ve açılış resimlerinden iOS simgeleri
npx cap sync ios
npm test                          # 417 test geçmeli
```

`package.json`'da kısayol var: `npm run ios:sync` (build + sync).

Kullanılan Capacitor eklentileri ve iOS durumu:
- `@capacitor/filesystem` ve `@capacitor/share`: çizimi kaydetme ve paylaşma, iOS'ta çalışır.
- `@capacitor-community/text-to-speech`: sesi olmayan cümleler için cihaz sesi, iOS'ta çalışır.

Satın alma (`src/world/plus.ts`, `src/world/premium.ts`) şimdilik **kapalı** ve yalnızca Android'de açılır.
iOS'ta satın alma yok; dokunma.

## 3. Info.plist (ios/App/App/Info.plist)

Şu anahtarları ekle (Türkçe açıklamalar, Apple incelemesi bunları okur):

```xml
<key>CFBundleDisplayName</key>
<string>Çizio</string>
<key>NSCameraUsageDescription</key>
<string>Kâğıda yaptığın çizimin fotoğrafını çekip örnekle karşılaştırmak için kamera kullanılır.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Kâğıda yaptığın çizimin fotoğrafını galeriden seçmek için kullanılır.</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>Çizimini fotoğraflarına kaydetmek için kullanılır.</string>
<key>ITSAppUsesNonExemptEncryption</key>
<false/>
```

- **Yönler:** iPhone'da dikey + yatay (sol/sağ), iPad'de dört yönün hepsi açık kalsın. Uygulama yatayı destekliyor
  (`src/styles/landscape.css`).
- **Dil:** `CFBundleDevelopmentRegion` → `tr`.

## 4. Xcode ayarları

`npx cap open ios` ile aç → sol tarafta **App** projesi → **App** hedefi:

- **General**
  - Display Name: `Çizio`
  - Bundle Identifier: `com.ahmetercikan.cizio`
  - Version: `1.5.0`
  - Build: `1`
  - Minimum Deployments: Capacitor'ın ayarladığını bırak.
  - Supported Destinations: iPhone ve iPad (Mac/Vision kapalı).
- **Signing & Capabilities:** "Automatically manage signing" açık, **Team** = kullanıcının geliştirici hesabı.
  Bundle ID, Apple Developer portalında yoksa Xcode kendisi kaydeder.
- Ek yetenek (Push, iCloud vb.) **ekleme**; gerekmiyor.

## 5. Dene (simülatör ve gerçek cihaz)

Önce simülatör: Xcode üstte cihaz olarak **iPhone 16** (ve ayrıca bir **iPad**) seç → ▶ Run.
Sonra mümkünse kullanıcının gerçek iPhone/iPad'inde: cihazı kabloyla bağla → Xcode'da seç → Run.
Cihazda **Ayarlar → Gizlilik ve Güvenlik → Geliştirici Modu** açılmalı.

Kontrol listesi:

- [ ] İlk açılış: karşılama → avatar ve isim → dünya seçimi.
- [ ] Çizim Atölyesi: ders kartları hızlı yükleniyor, derste kalem animasyonu ve sesli anlatım (Çizio'nun sesi `public/voice/*.mp3`).
- [ ] **Ses:** iPhone'un yanındaki sessiz düğmesi açıkken Web Audio efektleri susar (iOS davranışı). Ses düğmesi açıkken efektler, ada müziği ve korna duyuluyor mu?
- [ ] Ekran modu: parmakla çizim, boya kovası, kaydet. Kâğıt modu: kamera izni soruluyor, fotoğraf çekiliyor, galeriden seçiliyor.
- [ ] Galeri ve paylaş: çizim kaydediliyor, paylaşım penceresi açılıyor.
- [ ] Giydirme Stüdyosu, English Club (sesler çalıyor).
- [ ] **Çizio Adası (3B, WebGL):** akıcı mı (eski iPad'lerde de), joystick, zıplama, binalara giriş, Mars, ev, mini oyunlar.
- [ ] Telefon yan çevrilince ekranlar üst üste binmiyor; çentik ve alt çubuk düğmeleri kapatmıyor.
- [ ] Ebeveyn bölümü: çarpma sorusu, ayarlar, yedekleme.
- [ ] Çevrimiçi arkadaşlar (ebeveyn bölümünden açılır; Firebase anonim giriş): iki cihazda arkadaş kodu, adada buluşma. WKWebView'da Firebase Auth/IndexedDB sorun çıkarırsa bildir.

Hata görürsen önce Safari → Geliştir menüsünden web konsoluna bak. Bunun için geçici olarak `capacitor.config.ts` → `ios.webContentsDebuggingEnabled: true` yap, sonra geri kapat.

## 6. App Store Connect (kullanıcıyla birlikte)

https://appstoreconnect.apple.com → **Uygulamalar → + → Yeni Uygulama**:

| Alan | Değer |
|---|---|
| Platform | iOS |
| Ad (en çok 30 karakter) | `Çizio: Adım Adım Çizim Öğren` |
| Ana dil | Türkçe |
| Paket kimliği | `com.ahmetercikan.cizio` |
| SKU | `cizio-ios` |
| Kullanıcı erişimi | Tam erişim |

**Uygulama Bilgileri:**
- Alt başlık (30 karakter): `Çiz, oyna, İngilizce öğren`
- Kategori: **Eğitim**; ikinci kategori: **Çocuklar için** (aşağıdaki karara bağlı)
- Gizlilik politikası URL'si: `https://ahmetercikan.github.io/Cizio/gizlilik.html`
- Destek URL'si: `https://github.com/ahmetercikan/Cizio/issues` (ya da kullanıcının istediği bir sayfa)

**Çocuklar Kategorisi kararı (kullanıcıya sor):** "Kids" kategorisi (6-8 yaş) mağazada çocuklara görünürlük sağlar.
Ama Apple'ın 1.3 ve 5.1.4 kurallarına sıkı uyum ister:
- reklam ve üçüncü taraf analiz yok,
- dış bağlantı ve satın almadan önce ebeveyn kapısı,
- kişisel veri gönderilmemesi.

Çizio'da reklam ve analiz yok, ebeveyn kapısı var. Tek istisna, ebeveynin açtığı **çevrimiçi arkadaşlar**: takma ad
ve oyun verisi Firebase'e gidiyor. Kids kategorisi seçilirse inceleme bunu sorgulayabilir.

Öneri: önce Kids kategorisiyle gönder. İnceleme notunda çevrimiçi özelliğin varsayılan kapalı olduğunu, yalnızca
ebeveyn kapısından açıldığını, Firebase'in yalnızca uygulama işlevi için hizmet sağlayıcı olduğunu ve
reklam/analiz/izleme olmadığını anlat. Reddedilirse Kids kategorisini kaldırıp yaş sınırı 4+ ile tekrar gönder.

**Yaş derecelendirmesi anketi:** her soruya "Yok/Hayır" (şiddet, korku vb. yok). Sınırsız web erişimi **yok**.
"Kullanıcıların iletişim kurması / kullanıcı içeriği": çocuklar mesajlaşmaz. Yalnızca ebeveyn onaylı arkadaşlarla hazır tepkiler ve oyun resimleri paylaşılır; "Evet ama denetimli" seçeneği varsa onu seç.

**Uygulama Gizliliği (App Privacy):** Google Play "Veri güvenliği" formunun karşılığı. Veri toplanıyor → **Evet**.
Yalnızca şunlar:

| Apple veri türü | Neden | Kimliğe bağlı mı? | İzleme? |
|---|---|---|---|
| İletişim bilgisi → **Ad** (çocuğun takma adı) | Uygulama İşlevselliği | Evet (anonim hesaba) | Hayır |
| Kullanıcı İçeriği → **Fotoğraflar veya Videolar** (oyunlarda çizilen küçük resimler) | Uygulama İşlevselliği | Evet | Hayır |
| Kullanıcı İçeriği → **Diğer Kullanıcı İçeriği** (oyun sonuçları, tepkiler, adadaki görünüş ve yer) | Uygulama İşlevselliği | Evet | Hayır |
| Tanımlayıcılar → **Kullanıcı Kimliği** (Firebase anonim kimlik) | Uygulama İşlevselliği | Evet | Hayır |

Konum, kişiler, reklam kimliği, analiz, tanılama: **toplanmıyor**. İzleme (tracking): **Hayır**.
Ayrıntılar `public/gizlilik.html` ve `store/release-1.5.0.md` (Veri güvenliği bölümü) ile tutarlı olmalı.

**Açıklama metinleri:** `store/listing-tr.md` → "Tam açıklama" (en çok 4000 karakter). "Google Play" geçen yer varsa
çıkar. Anahtar kelimeler (100 karakter, virgülle):
`çizim,boyama,çocuk,resim,ingilizce,eğitim,giydirme,oyun,ada,okul öncesi,ders,kalem`

**Tanıtım metni (170):** `Kocaman 3B Çizio Adası, okul, hastane, Mars ve 8 mini oyun! Adım adım çiz, karakterini giydir, oynayarak İngilizce öğren.`

**Ekran görüntüleri:** zorunlu boyutlar 6,9" iPhone (1290×2796) ve 13" iPad (2064×2752). Hazır olanlar:
`store/screenshots/iphone/` ve `store/screenshots/ipad/` (Çizio Adası). Atölye, Giydir ve English Club ekranları da
eklenebilir. Yeniden üretmek için:
```bash
npx vite --port 5288 &           # geliştirme sunucusu
npx tsx scripts/store-shots.mts iphone
npx tsx scripts/store-shots.mts ipad
```
(Chrome ya da Edge gerekir; yoksa `CHROME_PATH` ile yolunu ver.)

## 7. Derle ve yükle

1. `npm run ios:sync`
2. Xcode → üstte cihaz: **Any iOS Device (arm64)** → menü **Product → Archive**.
3. Organizer açılır → **Distribute App** → **App Store Connect** → **Upload** → varsayılanlarla ilerle.
4. 10-30 dakika içinde App Store Connect → **TestFlight**'ta build "İşleniyor"dan "Test için hazır"a geçer.
   Kullanıcıya TestFlight uygulamasıyla kendi iPhone'unda denemesini öner.
5. App Store sekmesi → **1.5.0** → **Build** bölümünden bu build'i seç.
6. **İnceleme bilgileri:** giriş gerekmez ("Oturum açma gerekli değil"). Not örneği:
   > Çocuklar için çizim ve öğrenme uygulaması; hesap/giriş yok. Ebeveyn bölümü bir çarpma sorusuyla korunur
   > (ekrandaki işlemin sonucunu girin). Çevrimiçi arkadaşlar özelliği varsayılan olarak kapalıdır, yalnızca ebeveyn
   > bölümünden açılır, arkadaşlar ebeveynler arasında paylaşılan kodla eklenir; mesajlaşma yoktur. Reklam, analiz,
   > izleme ve uygulama içi satın alma yoktur.
7. **İncelemeye Gönder.** Fiyat: Ücretsiz. Tüm ülkeler (ya da kullanıcı isterse yalnızca Türkiye).

## 8. Sonraki güncellemeler

- Ortak kodda değişiklik → `npm run ios:sync` → Xcode'da **Build** numarasını artır (2, 3…), sürüm (Version) yeni
  sürümse onu da değiştir → Archive → Upload.
- Android tarafındaki sürüm adı ile aynı tutun (ör. ikisi de 1.5.0, 1.6.0).
- Her seferinde `ios/` değişikliklerini commit edip gönder.

## 9. Bilinen konular ve ipuçları

- **Uygulama boyutu:** `public/voice` (~107 MB ses) pakete girer. Toplam ~120-130 MB, App Store için sorun değil.
- **WebGL performansı:** Ada kare hızına göre çözünürlüğü kendisi düşürür (`src/world/island.ts`). Eski iPad'lerde takılma varsa bildir.
- **Ses ilk dokunuşla açılır** (iOS kuralı): `src/lib/speech.ts` → `unlockAudio`. Açılışta ses yoksa ilk dokunuştan sonra gelmeli.
- **Güvenli alan (çentik):** CSS `env(safe-area-inset-*)` kullanıyor, `index.html`'de `viewport-fit=cover` var. `capacitor.config.ts` → `ios.contentInset: 'never'`.
- **Reddedilme olursa:** Apple'ın e-postasındaki madde numarasını (ör. 5.1.4, 1.3) kullanıcıdan iste. Düzeltip yeni build ile tekrar gönder.
