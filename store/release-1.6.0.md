# Çizio 1.6.0 (versionCode 8) — Google Play yayın rehberi

Play'deki son sürüm 1.4.0 (versionCode 6). 1.5.0 hiç yüklenmedi; 1.6.0 onun her şeyini (çevrimiçi arkadaşlar) içerir.

## Yüklenecek dosyalar

| Ne | Dosya |
|---|---|
| Uygulama paketi | `store/release/cizio-1.6.0.aab` |
| Telefonda denemek için (Play'e yüklenmez) | `store/release/cizio-1.6.0.apk` |

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

Diğer her şey (konum, e-posta, telefon, kişiler, finans, sağlık, mesajlar, ses, dosyalar, takvim, uygulama bilgileri ve
performans, web tarama) **işaretlenmez**. Sonra **Kaydet**. Gizlilik politikası adresi aynı kalır (sayfa güncellendi).

## 2) Yeni sürümü yükle

1. Play Console → Çizio → **Test ve yayınla → Üretim** → **Yeni sürüm oluştur**.
   (1.4.0 hâlâ incelemedeyse Play, yeni sürümün onun yerine geçeceğini söyler; onaylayın. Böylece doğrudan 1.6.0 incelenir.)
2. **App Bundle'ları yükle** → `cizio-1.6.0.aab`. Sürüm adı otomatik gelir: `8 (1.6.0)`.
3. **Sürüm notları** → `<tr-TR>` ile `</tr-TR>` arasına aşağıdakini yapıştırın.
4. **Sonraki** → **Kaydet** → **Sürümü incelemeye gönder**.

### Sürüm notları (tr-TR)

```
Yenilikler:
• Çizimin canlansın! Kedin göz kırpıyor, kamyonunun tekerlekleri dönüyor, balığın yüzüyor
• Çizdiğinle oyna: kendi resmin oyunun kahramanı olsun, yıldızları topla
• Hikaye kitabım: çizimlerinden masal yap, Çizio okusun, PDF olarak kaydet
• Arkadaşlarla oyna: ebeveyn onayıyla meydan okuma, canlı düello, birlikte boyama
• Çevrimiçi özellikler varsayılan olarak kapalıdır, Ebeveyn bölümünden açılır
```

## Bu sürümde neler var (ayrıntı)

- **Canlanan çizim:** ekranda çizilen ders resimleri parçalarına ayrılır: gözler kırpar, tekerlekler döner, kuyruk
  sallanır, kanatlar çırpar, kollar el sallar, kulaklar oynar. Resim konusuna göre sahnesinde hareket eder (balık denizde
  yüzer, roket uzaya uçar, kamyon yolda gider, çiçek rüzgarda sallanır). Kâğıt fotoğraflarında ve eski resimlerde resim
  bütün olarak hareket eder.
- **Çizdiğinle oyna:** 45 saniyelik tur; araç ve hayvanlarla engellerin üstünden zıplama, uçan ve yüzenlerle dokunarak
  yükselme. Tur başına en çok 3, günde en çok 5 ödüllü tur.
- **Hikaye kitabım:** 2-5 resim + 4 masal konusu; 98 dersin hepsi için masal cümleleri; Çizio sesli okur; A4 PDF.
- **Çevrimiçi arkadaşlar:** ebeveyn bölümünden açılır; arkadaş kodu + iki tarafın ebeveyn onayı; sırayla meydan okuma,
  canlı düello, birlikte boyama; mesajlaşma yok, yalnızca hazır tepkiler; kapatınca sunucudaki veriler silinir.
- Ses: 3.507 cümlenin tamamı Çizio'nun sesiyle (yeni 231 cümle Whisper ile doğrulandı).
