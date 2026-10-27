# Çizio Premium: kurulum ve yayın adımları

Kod hazır ama **kapalı** (`src/lib/flags.ts` → `PREMIUM_YAYINDA = false`). Kapalıyken her şey herkese açık, satın alma
hiçbir yerde görünmez. Aşağıdaki adımlar bitince Claude anahtarları ekler, bayrağı açar ve 1.8.0'ı çıkarır.

## Ne yapıldı (özet)

| | Ücretsiz | Premium |
|---|---|---|
| Çizim dersleri | Her konunun ilk 2 dersi (26 ders) + daha önce bitirilenler | 196 dersin hepsi |
| English Club | English Time ilk 5 gün, ilk 3 kelime konusu, 2 hikaye, 2 şarkı; oyunlar, ABC, Draw in English | Hepsi |
| Çizio Adası | Kapalı (tanıtım ekranı) | Açık |

- Fiyat: **aylık 79,99 TL**, **yıllık 499,99 TL** (aylığa göre ~%48 ucuz), ikisinde de **7 gün ücretsiz deneme**.
- Çocuk kilitli yere dokununca fiyat görmez: "Büyüğüme göster" → ebeveyn sorusu → Premium sayfası (Google Play Aileler ve
  App Store Kids kuralı).
- **Ebeveyn hesabı:** e-posta + şifre (her yerde), iPhone/iPad'de "Apple ile giriş". **Google ile giriş bilerek yok:**
  Google'ın kuralları ağırlıklı olarak çocuklara yönelik uygulamalarda "Google ile giriş"i yasaklıyor.
- Satın alma **RevenueCat** ile doğrulanır ve hesaba bağlanır: başka telefonda aynı hesapla giriş yapınca Premium gelir.
- Hesap silme uygulama içinde ve web'de: https://ahmetercikan.github.io/Cizio/#/hesap?sil=1
- Ebeveyn bölümünde "Çizio'yu beğendiniz mi?" kartı (en az 3 ders bitince) mağazanın puan penceresini açar.

## Sıra

1.7.0'ın Play incelemesi bitmeden yeni paket gönderilmez. Adımlar 2–5 o arada yapılabilir.

### 1) Google Play: ödeme profili (bir kez; varsa atlayın)

Play Console → **Ayarlar → Ödeme profili**. Yoksa oluşturun: ülke Türkiye, ad/adres, IBAN, vergi bilgileri. Onay birkaç gün sürebilir.

### 2) Firebase: giriş yöntemlerini açın — YAPILDI (27 Ekim 2026)

E-posta/Şifre ve Apple açıldı, `firestore.rules` yayınlandı, `HESAP_YAYINDA = true` (web'de açık; telefonda 1.8.0 ile).


Firebase konsolu → proje **cizio-5a08c** → **Authentication → Sign-in method**:
- **E-posta/Şifre** → Etkinleştir → Kaydet (yalnızca ilk anahtar; "E-posta bağlantısı" kapalı kalsın).
- **Apple** → Etkinleştir → Kaydet (iPhone'da yerel giriş için başka alan gerekmez).
- **Templates** sekmesi → dil: **Türkçe** (şifre sıfırlama e-postası Türkçe gitsin).

### 3) RevenueCat hesabı ve proje

1. https://app.revenuecat.com → ücretsiz hesap açın (ayda 2.500 $ gelire kadar ücretsiz).
2. **Create project** → ad: `Çizio`.
3. **Apps → + New → Google Play Store**: paket adı `com.ahmetercikan.cizio`.
   RevenueCat'in "Service credentials" rehberini izleyip Google Cloud'da bir hizmet hesabı açın, JSON anahtarını RevenueCat'e
   yükleyin ve Play Console → **Kullanıcılar ve izinler**'de bu hesaba "Finansal verileri görüntüleme" ve
   "Siparişleri ve abonelikleri yönetme" izni verin. (JSON anahtarı gizlidir: kimseyle paylaşmayın, depoya koymayın.)
4. **Entitlements → + New**: kimlik `premium`, açıklama "Çizio Premium".
5. **API keys**: Google Play uygulamasının **public** anahtarını (`goog_` ile başlar) Claude'a verin. Bu anahtar gizli değildir.

### 4) Google Play: abonelik ürünü

Play Console bu ürünü ancak faturalandırma izni olan bir paket yüklendikten sonra oluşturmaya izin verir. Claude 1.8.0'ı
(anahtar eklenmiş, bayrak açık) **Dahili test**e yükler; sonra:

Play Console → **Para kazan → Ürünler → Abonelikler → Abonelik oluştur**
- Ürün kimliği: `cizio_premium` · Ad: **Çizio Premium**
- **Temel plan ekle** → kimlik `aylik` → Otomatik yenilenen → **1 ay** → Türkiye **79,99 TL** (diğer ülkeler: "Fiyatları dönüştür") → Etkinleştir
- **Temel plan ekle** → kimlik `yillik` → Otomatik yenilenen → **1 yıl** → Türkiye **499,99 TL** → Etkinleştir
- Her temel plana **Teklif ekle** → kimlik `deneme7` → Uygunluk: **Yeni müşteri** → Aşama: **Ücretsiz deneme, 7 gün** → Etkinleştir

RevenueCat → **Products → Import** (iki ürün gelir: `cizio_premium:aylik`, `cizio_premium:yillik`) → ikisini de `premium` yetkisine bağlayın.
**Offerings → default**: paket **Monthly** → `cizio_premium:aylik`, paket **Annual** → `cizio_premium:yillik`.

### 5) Satın almayı deneyin (para çekilmez)

Play Console → **Ayarlar → Lisans testi** → Gmail adresinizi ekleyin. Dahili test uygulamasında Ebeveyn bölümü →
Çizio Premium → Yıllık → "7 gün ücretsiz dene" → Play penceresinde test kartı. Test aboneliği birkaç dakikada yenilenir ve biter.
Kontrol: ada açılıyor mu, dersler açılıyor mu, hesap açıp uygulamayı silip yeniden kurunca Premium geliyor mu.

### 6) Play Console: Uygulama içeriği

- **Veri güvenliği** → güncelleyin:
  - Toplanan veri: **E-posta adresi** (isteğe bağlı; amaç: Hesap yönetimi), **Satın alma geçmişi** (amaç: Uygulama işlevselliği).
  - Aktarımda şifrelenir: Evet. Silme isteği: Evet.
  - **Hesap silme URL'si:** `https://ahmetercikan.github.io/Cizio/#/hesap?sil=1`
- Mağaza girişinde "Uygulama içi satın alma içerir" ibaresi kendiliğinden eklenir.

### 7) Üretime çıkar

Dahili test sürümünü **Üretime yükselt**. Sürüm notu Claude'dan.

## iPhone / iPad (App Store) — Apple'ın 4.3 incelemesi bitince

Apple Developer hesabı başkasında olduğu için bu adımları hesap sahibi yapar:
1. developer.apple.com → **Identifiers** → `com.ahmetercikan.cizioapp` → **Sign In with Apple** işaretle → Kaydet.
   (Proje tarafı hazır: `ios/App/App/App.entitlements`.)
2. App Store Connect → Çizio → **Abonelikler** → grup **Çizio Premium** →
   `cizio_premium_aylik` (1 ay, 79,99 TL) ve `cizio_premium_yillik` (1 yıl, 499,99 TL); ikisine de **Giriş teklifi: 7 gün ücretsiz**.
3. App Store Connect → **Kullanıcılar ve Erişim → Entegrasyonlar → In-App Purchase** anahtarı oluşturup RevenueCat'e
   (Apps → + New → App Store, paket `com.ahmetercikan.cizioapp`) yükleyin; ürünleri içe aktarıp `premium` yetkisine ve
   `default` offering'e (Monthly / Annual) bağlayın. **Public** anahtarı (`appl_` ile başlar) Claude'a verin.
4. Uygulama açıklamasına Kullanım Koşulları bağlantısı: https://ahmetercikan.github.io/Cizio/kosullar.html
