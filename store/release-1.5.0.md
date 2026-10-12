# Çizio 1.5.0 (versionCode 7) — Google Play yayın rehberi

Play'deki son sürüm 1.4.0 (versionCode 6, incelemede). 1.5.0, 1.4.0'dan sonraki bütün yenilikleri içerir.
(Daha önce hazırlanan 1.6.0 ve 1.7.0 paketleri hiç yüklenmedi ve silindi.)

## Yüklenecek dosyalar

| Ne | Dosya |
|---|---|
| Uygulama paketi | `store/release/cizio-1.5.0.aab` |
| Telefonda denemek için (Play'e yüklenmez) | `store/release/cizio-1.5.0.apk` |

Ekran görüntüleri, simge ve mağaza metinleri değişmedi.

## Sıra önemli: önce Veri güvenliği formu, sonra sürüm

Çevrimiçi arkadaşlar özelliği (ebeveyn açarsa) internete veri gönderdiği için Play, sürümü incelemeye almadan önce
**Veri güvenliği** formunun güncel olmasını ister.

## 1) Veri güvenliği formunu güncelle

Play Console → Çizio → **Politika ve programlar → Uygulama içeriği → Veri güvenliği → Yönet / Düzenle**.

**Veri toplama ve güvenlik**
- Uygulamanız, gerekli kullanıcı verisi türlerinden herhangi birini topluyor ya da paylaşıyor mu? → **Evet**
- Toplanan tüm kullanıcı verileri aktarım sırasında şifreleniyor mu? → **Evet**
- Kullanıcıların verilerinin silinmesini isteyebilecekleri bir yol sağlıyor musunuz? → **Evet** (uygulama içinden: Ebeveyn bölümü → Çevrimiçi özellikleri kapat)

**Veri türleri** — yalnızca şunları işaretleyin:

| Kategori | Veri türü | Neden |
|---|---|---|
| Kişisel bilgiler | **Ad** | Çocuğun görünen adı (takma ad) arkadaşlarına gösterilir |
| Fotoğraflar ve videolar | **Fotoğraflar** | Arkadaşla oynanan oyunlarda çizilen küçük resim |
| Uygulama etkinliği | **Diğer kullanıcı tarafından oluşturulan içerik** | Oyun sonuçları, hazır tepkiler, birlikte boyama hamleleri, Çizio Adası'nda karakterin görünüşü ve oyun içindeki yeri |
| Cihaz veya diğer kimlikler | **Cihaz veya diğer kimlikler** | Firebase anonim hesap kimliği |

Her biri için:
- **Toplanıyor** işaretleyin; **Paylaşılıyor** işaretlemeyin (Firebase "hizmet sağlayıcı" sayılır).
- Geçici olarak mı işleniyor? → **Hayır**
- Zorunlu mu, isteğe bağlı mı? → **Kullanıcılar bu verilerin toplanmasını seçebilir**
- Neden toplanıyor? → yalnızca **Uygulama işlevleri**

**Konum** işaretlenmez: adadaki yer oyun haritasındaki bir noktadır, cihazın konumu değildir. Diğer her şey **işaretlenmez**. Sonra **Kaydet**. Gizlilik politikası adresi aynı kalır (sayfa güncellendi).

## 2) Yeni sürümü yükle

1. Play Console → Çizio → **Test ve yayınla → Üretim** → **Yeni sürüm oluştur**.
   (1.4.0 hâlâ incelemedeyse Play, yeni sürümün onun yerine geçeceğini söyler; onaylayın.)
2. **App Bundle'ları yükle** → `cizio-1.5.0.aab`. Sürüm adı otomatik gelir: `7 (1.5.0)`.
3. **Sürüm notları** → `<tr-TR>` ile `</tr-TR>` arasına aşağıdakini yapıştırın.
4. **Sonraki** → **Kaydet** → **Sürümü incelemeye gönder**.

### Sürüm notları (tr-TR)

```
Yenilikler:
• Yeni dünya: Çizio Adası! Giydirdiğin karakterle kocaman 3B adada gez: lunapark, göl, plaj, orman kampı, çiftlik, karlı dağ, dinozor vadisi, şato, roket
• Su eğlencesi: jet ski, sörf, şnorkel, kuğu tekne, su kaydırağı
• Adada arkadaşlarınla buluş: ebeveyn onayıyla en çok 10 arkadaş aynı adada
• Çiftliğim: tohum ek, sula, topla; tavuk, inek, koyun ve arı besle; pazarda sat, seviye atla
• Minecraft gibi blokla ev yap, hazır yapılar kur
• Macera kapıları: Labirent, Gökyüzü Parkuru, Şeker Diyarı (arkadaşlarla birlikte)
• Evim: kendi evini kur! 45 eşya, renkler, duvar ve zemin, daha büyük evler; eşyalarla oyna
• Kendi adanı kur: adanın her yerine blokla inşa et, çiftliğini istediğin yere kur
• Arabanı al, adayı gez! Butik'te nadir kıyafetler, Oyun Çadırı'nda mini oyunlar ve hediyeler
• Ekrana dokun, zıpla!
• Çizimin canlansın: göz kırpar, tekerlek döner, balık yüzer
• Çizdiğinle oyna artık 3 boyutlu: sağa sola kaç, zıpla, yıldız topla
• Hikaye kitabım: çizimlerinden masal yap, Çizio okusun
• Arkadaşlarla oyna: ebeveyn onayıyla meydan okuma, düello, birlikte boyama
```

## Bu sürümde neler var (ayrıntı)

- **Çizio Adası (ücretsiz):** Giydir karakteri 3B bir karakter; gerçek insan gibi gittiği yöne döner, yürür, koşar,
  yüzer (el sallama, zıplama, alkış, dans). Önceki adanın ~20 katı büyüklükte 11 bölge: kasaba, lunapark, göl, plaj,
  orman kampı, çiftlik, karlı dağ, dinozor vadisi, şato, deniz feneri, roket üssü. 38 mekân ve etkinlik; su etkinlikleri
  (jet ski, sörf, şnorkelle deniz altı, kuğu tekne, su kaydırağı, balık tutma, yüzme). Köşede küçük harita, büyük haritadan
  bölgeye hızlı gidiş. Her gün 38 görevden 4'ü (biri yıldız avı), hepsi bitince 5 yıldız.
- **Çiftliğim ve Pazar:** 16 tarla, 7 ürün, 4 hayvan, mutfak (5 tarif), pazarda al-sat ve sipariş panosu, seviyeler ve
  çiftçi defteri (20 adım). Ada altını yalnızca oynayarak kazanılır, gerçek parayla satılmaz.
- **İnşa:** 20×20 arsada 35 çeşit blok ve eşya, 4 hazır yapı. Karakter zıplayarak blokların üstüne çıkar.
- **Macera kapıları:** her gün değişen Labirent (aynı adadaki arkadaşlar aynı labirenti görür), Gökyüzü Parkuru
  (kayan platformlar, zıplatan mantarlar, kontrol noktaları), Şeker Diyarı (75 saniyede 20 şeker).
- **Evim:** kasabadaki evin kapısından girilen, bebek evi gibi kesit görünümlü 3B ev. 45 eşya (resimli katalog, renk
  seçimi, döndürme, yeşil/kırmızı yerleştirme önizlemesi, taşıma, satma), oda oda duvar ve zemin renkleri, 3 ev planı
  (Sevimli ev, Bahçeli ev 250, Büyük ev 600 altın; eşyalar odalarıyla taşınır). Eşyaya dokununca karakter yürür ve
  oynar: kanepede oturur, yatakta uyur, yemek yapar, piyano çalar, trambolinde zıplar, salıncakta sallanır, havuzda yüzer.
  Şövale resim çizmeye, gardırop Giydir'e, kitaplık hikaye kitabına, çalışma masası derslere götürür; duvardaki
  tablolarda çocuğun kendi resimleri asılı.
- **Kum havuzu ada:** bloklar adanın her yerine konur (sudan, oyun yerlerinin önünden ve binalardan uzakta). Çiftlik
  baştan hazır gelmez: İnşa et → Yapılar'dan tarla (ilk 4 bedava), tavuk kümesi, inek ahırı, koyun ağılı, arı bahçesi ve
  mutfak istenen yere kurulur; kaldırılabilir. Eski kayıtlarda çiftlik ve yapılar kaybolmaz, eski yerlerine taşınır.
- **Arabalar:** bisiklet, minik araba, jip, karavan, spor araba (altınla, Pazar → Arabalar); "Arabam" düğmesiyle çağrılır,
  korna çalar; arkadaşlar arabayla gezen çocuğu arabasıyla görür.
- **Butik:** nadir kıyafetler ve dostlar ada altınıyla. **Oyun Çadırı:** hafıza kartları ve balon patlatma; bitirince altın,
  günde 3 kez de eve bir eşya ya da yeni bir kıyafet.
- **Özel paketler (şimdilik kapalı):** her kategoride birkaç özel eşya; yalnızca ebeveyn bölümünden. Bkz. `store/ozel-paketler.md`.
- **Dokunma:** boş yere dokununca zıplar; bir eşyaya dokununca o iş yapılır (uzaksa yanına yürür).
- **Adada birlikte oynama:** Çevrimiçi açıksa çocuk, onaylı arkadaşlarının adasına gidebilir ("Yanına git"); bir adada
  sahibi ve en çok 10 arkadaşı. Arkadaşlar birbirinin karakterini, adını, yürüyüşünü ve el sallamasını görür; yazışma yok.
  Firebase Realtime Database (ücretsiz plan) kullanılır; konum paketleri küçük, yalnızca karakter hareket edince gönderilir.
- **Çizdiğinle oyna (3B):** 3 şerit, kaydırarak kaçma, zıplama; yıldız, mıknatıs, kalkan, kalp; 3 can, 60 saniye.
- **Canlanan çizim**, **Hikaye kitabım** (PDF), **çevrimiçi arkadaşlar** (meydan okuma, canlı düello, birlikte boyama).
- Ses: 3.521 cümlenin tamamı Çizio'nun sesiyle (yeniler Whisper ile doğrulandı).
- Android'de denendi: ada ve 3B oyun saniyede 60 kare.
- Ücretli bölüm (Çizio Plus) şimdilik kapalı; ileride açmak için: `store/plus-abonelik-adimlari.md`.
