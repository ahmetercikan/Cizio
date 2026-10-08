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
| Uygulama etkinliği | **Diğer kullanıcı tarafından oluşturulan içerik** | Oyun sonuçları, hazır tepkiler, birlikte boyama hamleleri |
| Cihaz veya diğer kimlikler | **Cihaz veya diğer kimlikler** | Firebase anonim hesap kimliği |

Her biri için:
- **Toplanıyor** işaretleyin; **Paylaşılıyor** işaretlemeyin (Firebase "hizmet sağlayıcı" sayılır).
- Geçici olarak mı işleniyor? → **Hayır**
- Zorunlu mu, isteğe bağlı mı? → **Kullanıcılar bu verilerin toplanmasını seçebilir**
- Neden toplanıyor? → yalnızca **Uygulama işlevleri**

Diğer her şey **işaretlenmez**. Sonra **Kaydet**. Gizlilik politikası adresi aynı kalır (sayfa güncellendi).

## 2) Yeni sürümü yükle

1. Play Console → Çizio → **Test ve yayınla → Üretim** → **Yeni sürüm oluştur**.
   (1.4.0 hâlâ incelemedeyse Play, yeni sürümün onun yerine geçeceğini söyler; onaylayın.)
2. **App Bundle'ları yükle** → `cizio-1.5.0.aab`. Sürüm adı otomatik gelir: `7 (1.5.0)`.
3. **Sürüm notları** → `<tr-TR>` ile `</tr-TR>` arasına aşağıdakini yapıştırın.
4. **Sonraki** → **Kaydet** → **Sürümü incelemeye gönder**.

### Sürüm notları (tr-TR)

```
Yenilikler:
• Yeni dünya: Çizio Adası! Giydirdiğin karakterle 3B adada gez, kaydır, sallan, dans et
• Çizimin canlansın: göz kırpar, tekerlek döner, balık yüzer
• Çizdiğinle oyna artık 3 boyutlu: sağa sola kaç, zıpla, yıldız topla
• Hikaye kitabım: çizimlerinden masal yap, Çizio okusun
• Arkadaşlarla oyna: ebeveyn onayıyla meydan okuma, düello, birlikte boyama
```

## Bu sürümde neler var (ayrıntı)

- **Çizio Adası (ücretsiz):** Giydir karakteri yürüyen bir kâğıt kukla (kollar ve bacaklar sallanır; el sallama, zıplama,
  alkış, dans pozları), evcil hayvanı arkasından gelir. Büyük ada ve 18 mekân: ev, sanat galerisi (çocuğun resimleri), oyun
  parkı (kaydırak, salıncak), dans pisti, müzik karoları, trambolin, futbol sahası, dönme dolap, atlıkarınca, çiçek bahçesi,
  dondurma arabası, deniz feneri, sıcak hava balonu, iskele (tekne turu, balık tutma), kumsalda 3 hazine, Çizio. Dolaşan
  kedi, köpek, tavşan, kurbağa, tilki, penguen; kelebekler; denizde yunuslar. Her gün 17 görevden 4'ü (biri yıldız avı),
  hepsi bitince 5 yıldız. Tek kişilik; internete veri göndermez.
- **Çizdiğinle oyna (3B):** 3 şerit, kaydırarak kaçma, zıplama; yıldız, mıknatıs, kalkan, kalp; 3 can, 60 saniye.
- **Canlanan çizim**, **Hikaye kitabım** (PDF), **çevrimiçi arkadaşlar** (meydan okuma, canlı düello, birlikte boyama).
- Ses: 3.521 cümlenin tamamı Çizio'nun sesiyle (yeniler Whisper ile doğrulandı).
- Android'de denendi: ada ve 3B oyun saniyede 60 kare.
- Ücretli bölüm (Çizio Plus) şimdilik kapalı; ileride açmak için: `store/plus-abonelik-adimlari.md`.
