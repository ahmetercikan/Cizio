# Çizio iOS 1.5.0 (build 1): App Store'a gönderme adımları

> **Durum (17 Ekim 2026):** Build 1.5.0 (1) yüklendi ve sürüme bağlandı. Mağaza sayfasının tamamı dolduruldu:
> ad, alt başlık, açıklama, anahtar kelimeler, ekran görüntüleri, kategori (Eğitim + Eğlence), yaş
> derecelendirmesi **4+**, Uygulama Gizliliği (yayında), fiyat **ücretsiz / 175 ülke**, inceleme notu ve
> iletişim bilgileri. **Kalan tek adım: TestFlight'ta denemek ve "İncelemeye Gönder".**
>
> - Apple hesabı: **ABDURRAHMAN KAAN DIKEC (`AQ2Y664A4Z`)** — kullanıcının kendi hesabı ücretsiz *Personal Team*
>   olduğu için App Store'a yükleme yapamıyor.
> - iOS paket kimliği: **`com.ahmetercikan.cizioapp`** (`com.ahmetercikan.cizio` ücretsiz ekibe kayıtlı kaldı;
>   Android tarafı değişmedi). App Store Connect uygulama kimliği: `6823984917`.
> - TestFlight iç test grubu: **Çizio Deneme**, test eden: `ahmet.ercikan@icloud.com`.

`ios/` klasörü hazır: simgeler, açılış ekranı, izin metinleri, sürüm 1.5.0 / build 1, iPhone + iPad, Türkçe.
Bundan sonrası **Mac'te ve Apple hesabında** yapılır. Teknik ayrıntılar: `IOS.md`.

## A) Mac'te bir kez hazırlık

1. **Apple Developer Program** üyeliği: https://developer.apple.com/programs/enroll → Apple ID ile giriş →
   **Birey (Individual)** → yıllık ücreti öde. Onay birkaç saat ile 2 gün sürebilir.
2. **Xcode**'u Mac App Store'dan kur, bir kez aç, "ek bileşenleri yükle" de.
3. **Node.js 22**: Terminal'de `node -v` yaz. 22 değilse https://nodejs.org adresinden "LTS" sürümünü kur.
4. Xcode → **Settings → Accounts → +** → Apple ID ile giriş.

## B) Projeyi Mac'e al ve Xcode'da aç

Terminal'de (ilk kez):

```bash
git clone https://github.com/ahmetercikan/Cizio.git
cd Cizio
npm ci
npm run ios:sync
npx cap open ios
```

Sonraki seferlerde `git pull` → `npm ci` → `npm run ios:sync` → `npx cap open ios`.

Xcode ilk açılışta Capacitor paketlerini indirir (sol altta "Fetching…"); bitmesini bekle.

## C) İmza (tek ayar)

Xcode solda **App** → ortada **TARGETS → App** → **Signing & Capabilities**:
- **Automatically manage signing** işaretli kalsın.
- **Team**: `ABDURRAHMAN KAAN DIKEC` (Personal Team değil — ücretsiz hesapla App Store'a yükleme olmaz).

Diğer her şey (ad, paket kimliği `com.ahmetercikan.cizioapp`, sürüm 1.5.0, build 1) hazır; değiştirme.

## D) Dene

- Üstte cihaz olarak **iPhone 16** seç → ▶ (Run). Sonra bir **iPad** simülatörüyle tekrar dene.
- Kendi iPhone'unda denemek için: kabloyla bağla → üstten seç → ▶. iPhone'da
  **Ayarlar → Gizlilik ve Güvenlik → Geliştirici Modu**'nu aç.
- Kontrol listesi: `IOS.md` bölüm 5.

## E) Yükle

1. Üstte cihaz: **Any iOS Device (arm64)** → menü **Product → Archive**.
2. Açılan pencerede **Distribute App → App Store Connect → Upload** → hep varsayılanla ilerle.
3. 10-30 dakika sonra App Store Connect → **TestFlight**'ta build "Test için hazır" olur.
   iPhone'a **TestFlight** uygulamasını kurup kendin dene.

## F) App Store Connect'te uygulamayı oluştur

https://appstoreconnect.apple.com → **Uygulamalar → + → Yeni Uygulama**

| Alan | Değer |
|---|---|
| Platformlar | iOS |
| Ad | `Çizio: Adım Adım Çizim Öğren` |
| Ana dil | Türkçe |
| Paket kimliği | `com.ahmetercikan.cizioapp` |
| SKU | `cizio-ios` |
| Kullanıcı erişimi | Tam erişim |

### Uygulama Bilgileri
- Alt başlık: `Çiz, oyna, İngilizce öğren`
- Kategori: **Eğitim**
- Gizlilik politikası URL'si: `https://ahmetercikan.github.io/Cizio/gizlilik.html`

### Fiyatlandırma ve Kullanılabilirlik
- Fiyat: **Ücretsiz**. Ülkeler: hepsi (ya da yalnızca Türkiye).
- "Mac" ve "Apple Vision Pro" kullanılabilirliği görünürse **kapat** (projede zaten kapalı).

### Yaş derecelendirmesi
Apple anketi 7 adım. Verilen cevaplar (sonuç: **4+**):
- **Parental Controls: Evet** (ebeveyn bölümü çarpma sorusuyla korunur)
- Age Assurance: Hayır · Unrestricted Web Access: Hayır · User-Generated Content: Hayır · Social Media: Hayır
- **Social Media Disabled for Users Under 13: Hayır** — bu soru "Declared Age Range API'yi çağırıyor musunuz"
  demek; Çizio çağırmıyor. **Evet denirse derece 13+'a fırlıyor.**
- Messaging and Chat: Hayır · Advertising: Hayır
- Diğer altı adımın hepsinde **None / No**.

### Uygulama Gizliliği
"Veri topluyor musunuz?" → **Evet**. Yalnızca şunlar, hepsi **Uygulama İşlevselliği**, **kimliğe bağlı**, **izleme yok**:

- İletişim Bilgileri → **Ad** (çocuğun takma adı)
- Kullanıcı İçeriği → **Fotoğraflar veya Videolar** (oyunlarda çizilen küçük resimler)
- Kullanıcı İçeriği → **Diğer Kullanıcı İçeriği** (oyun sonuçları, tepkiler, adadaki görünüş)
- Tanımlayıcılar → **Kullanıcı Kimliği** (Firebase anonim kimlik)

Başka hiçbir şey işaretlenmez (konum, kişiler, reklam, analiz, tanılama yok).

### 1.5.0 sürüm sayfası
- **Ekran görüntüleri:** `store/promo/ios/` → iPhone `iphone-6-3-*` (1206×2622, zorunlu boyut, 8 resim) ve
  iPad `ipad-13-*` (2064×2752, 8 resim). Sekiz görsel tek geniş şeritten kesildiği için mağazada yan yana
  geçişli görünür.
- **Tanıtım metni:**
  `Kocaman 3B Çizio Adası, okul, hastane, Mars ve 8 mini oyun! Adım adım çiz, karakterini giydir, oynayarak İngilizce öğren.`
- **Anahtar kelimeler:**
  `çizim,boyama,çocuk,resim,ingilizce,eğitim,giydirme,oyun,ada,okul öncesi,ders,kalem`
- **Destek URL'si:** `https://github.com/ahmetercikan/Cizio/issues`
- **Açıklama:** aşağıdaki "Açıklama" bölümünün tamamı.
- **Build:** TestFlight'ta hazır olan **1.5.0 (1)**. "Şifreleme" sorusu gelmez (Info.plist'te cevaplandı).
- **Uygulama İnceleme Bilgileri:** "Oturum açma gerekli" işaretini kaldır. Not:

  > Çocuklar için çizim ve öğrenme uygulaması; hesap/giriş yok. Ebeveyn bölümü bir çarpma sorusuyla korunur
  > (ekrandaki işlemin sonucunu girin). Çevrimiçi arkadaşlar özelliği varsayılan olarak kapalıdır, yalnızca ebeveyn
  > bölümünden açılır, arkadaşlar ebeveynler arasında paylaşılan kodla eklenir; mesajlaşma yoktur. Firebase yalnızca
  > bu özelliğin çalışması için hizmet sağlayıcıdır. Reklam, analiz, izleme ve uygulama içi satın alma yoktur.

Sonra **İncelemeye Gönder**.

### Çocuklar Kategorisi notu
Apple'ın yeni yaş derecelendirme anketinde ayrı bir "Made for Kids / Kids" seçimi yok; kategori listesinde de
"Çocuklar" bulunmuyor. Derece anketten hesaplanıyor (bizde 4+) ve yalnızca **yukarı** çekilebiliyor.

### Açıklamada emoji kullanma
App Store açıklaması emojileri "geçersiz karakter" sayıp kaydetmeyi reddediyor (Google Play kabul ediyor).
`store/listing-tr.md` metnindeki emojiler App Store'a girilirken çıkarılmalı.

## Açıklama (App Store, en çok 4000 karakter)

Çizio, 5-9 yaş çocuklar için sesli anlatımlı ve reklamsız bir öğrenme ve oyun uygulaması. Çocuk dört dünyadan birini seçer: Çizim Atölyesi, Giydirme Stüdyosu, English Club ve Çizio Adası.

✏️ ÇİZİM ATÖLYESİ: ADIM ADIM, KALEMLE GÖSTEREREK
Her derste gerçekçi bir kalem, kâğıda çizimi adım adım çizer. Çocuk izler, sonra aynısını kendi kâğıdına ya da ekrana çizer. Çizio'nun sıcak sesi her adımı anlatır.

🚜 98 DERS, 10 ÇİZİM YOLU
Temeller, Hayvanlar, Sevimli Nesneler, Doğa, Karakterler, Deniz Canlıları, Dinozorlar ve Ejderhalar, Taşıtlar, İş Makineleri ve Özel Günler.

🎨 GERÇEK BİR RESSAM GİBİ
• Kâğıt modu: çizimini bitirince fotoğrafını çek, örnekle karşılaştır.
• Ekran modu: parmakla ya da kalemle çiz; her adımda yıldız ve geri bildirim al.
• Kurşun kalemle gölgelendirme, boyama kitabı, desenli boya kovası, pastel, keçeli kalem, sulu boya ve simli kalem.

🏝️ ÇİZİO ADASI: KOCAMAN 3B DÜNYA
Giydirdiğin karakterle kocaman bir adada gez!
• Lunapark: hız treni, dönme dolap, korsan gemisi, serbest düşüş, çarpışan arabalar
• Şehir: okul, hastane, market, kütüphane, pastane ve itfaiyenin içine gir
• Köy, hayvanat bahçesi, plaj, göl, karlı dağ, dinozor vadisi, şato
• Havalimanında uçağa bin, roketle Mars'a git, uzaylılarla tanış
• Kendi evini kur, içinde gez, eşyalarını yerleştir
• Çiftlik kur, ürün yetiştir, pazarda sat; bloklarla istediğini inşa et
• 8 mini oyun, arabalar, macera kapıları ve her gün yeni görevler

👗 GİYDİRME STÜDYOSU
Kız ve erkek karakterlerden birini seç; saç, kıyafet, desen, şapka, gözlük ve evcil dost ile kendi tarzını yarat. Kendi çizdiğin hayvanlar bile karakterinin dostu olabilir.

🇬🇧 ENGLISH CLUB: OYNAYARAK İNGİLİZCE
Çeviri ve ezber yok; resim, ses ve hareket var.
• Her gün 15 dakikalık "English Time" rutini
• Çizio Says: "Jump!", "Touch your nose!" komutlarını bedeninle yap
• Listen & Find, Color Me, Treasure Hunt ve evde nesne bulma oyunları
• Soru sorarak okunan resimli hikâyeler
• 16 konu, yaklaşık 150 kelime; yaşa göre ayarlanır

🗺️ MACERALAR VE ÖDÜLLER
Macera haritası, günün görevi, haftalık lig, mini meydan okumalar, hazine sandıkları, yıldız dükkanı ve çıkartma albümü.

👨‍👩‍👧 EBEVEYNLER İÇİN
• Reklam yok, uygulama içi satın alma yok
• Çizimler, fotoğraflar ve ilerleme yalnızca cihazda saklanır
• İsteğe bağlı çevrimiçi arkadaşlar: varsayılan olarak kapalıdır, yalnızca ebeveyn bölümünden açılır. Arkadaşlar ebeveynler arasında paylaşılan kodla, iki tarafın onayıyla eklenir; mesajlaşma ve yabancılarla iletişim yoktur. Açıksa takma ad, avatar ve oyun bilgileri paylaşılır; tek dokunuşla kapatılıp silinebilir.
• Birden fazla çocuk profili, ilerleme grafiği ve yedekleme (ebeveyn bölümü korumalıdır)
• Çevrimiçi arkadaşlar dışında internetsiz çalışır

Çizio ile çocuğunuz her gün biraz daha iyi çizer, hayal eder, keşfeder ve öğrenir!
