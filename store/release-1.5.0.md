# Çizio 1.5.0 (versionCode 7) — Google Play yayın rehberi

## Yüklenecek dosyalar

| Ne | Dosya |
|---|---|
| Uygulama paketi | `store/release/cizio-1.5.0.aab` |
| Telefonda denemek için (Play'e yüklenmez) | `store/release/cizio-1.5.0.apk` |

Ekran görüntüleri, simge ve mağaza metinleri değişmedi.

## Sıra önemli: önce Veri güvenliği formu, sonra sürüm

Bu sürüm (isteğe bağlı) internete veri gönderdiği için Play, sürümü incelemeye almadan önce **Veri güvenliği** formunun
güncel olmasını ister. Önce 1. adımı, sonra 2. adımı yapın.

## 1) Veri güvenliği formunu güncelle

Play Console → Çizio → **Politika ve programlar → Uygulama içeriği → Veri güvenliği → Yönet / Düzenle**.

**Veri toplama ve güvenlik sayfası**
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

Her biri için açılan sorularda:
- Toplanıyor mu / paylaşılıyor mu? → **Toplanıyor**. Paylaşılıyor işaretlemeyin (Firebase "hizmet sağlayıcı" sayılır, paylaşım değildir).
- Geçici olarak mı işleniyor? → **Hayır**
- Zorunlu mu, isteğe bağlı mı? → **Kullanıcılar bu verilerin toplanmasını seçebilir** (isteğe bağlı)
- Neden toplanıyor? → yalnızca **Uygulama işlevleri**

Diğer her şey (konum, e-posta, telefon, kişiler, finans, sağlık, mesajlar, ses, dosyalar, takvim, uygulama bilgileri ve performans, web tarama) **işaretlenmez**.

Sonra **Kaydet**.

**Gizlilik politikası adresi** aynı kalır (sayfa güncellendi, çevrimiçi özelliği anlatıyor).

## 2) Yeni sürümü yükle

1. Play Console → Çizio → **Test ve yayınla → Üretim**.
2. **Yeni sürüm oluştur** → **App Bundle'ları yükle** → `cizio-1.5.0.aab`.
3. Sürüm adı otomatik gelir: `7 (1.5.0)`.
4. **Sürüm notları** → `<tr-TR>` ile `</tr-TR>` arasına aşağıdaki metni yapıştırın.
5. **Sonraki** → **Kaydet** → **Sürümü incelemeye gönder**.

### Sürüm notları (tr-TR)

```
Yenilikler:
• Arkadaşlarla oyna! Ebeveyn onayıyla eklenen arkadaşlarla sırayla meydan okuma, canlı düello ve birlikte boyama
• Arkadaşlar yalnızca ebeveynler arasında paylaşılan kodla eklenir; mesajlaşma yok, yalnızca hazır tepkiler
• Çevrimiçi özellikler varsayılan olarak kapalıdır, Ebeveyn bölümünden açılır ve istenince tüm veriler silinir
• Hata düzeltmeleri
```

## Bu sürümde neler var (ayrıntı)

- Çevrimiçi arkadaşlar (Firebase: anonim giriş + Firestore; güvenlik kuralları `firestore.rules`).
- Arkadaşlarım sayfası, üst çubukta rozetli arkadaş düğmesi, Atölye'de "Arkadaşlarım" kartı.
- Sırayla meydan okuma (iki çizim yan yana, kazanan, hazır tepkiler), canlı düello (60 sn, bakarak / hafızadan), birlikte boyama (sırayla, her sırada 3 boyama).
- Veri: kapatınca sunucudaki her şey silinir; düellolar 1 gün, diğer oyunlar 30 gün sonra kendiliğinden silinir.
- Gerçek Firebase'de iki cihazla (tarayıcı + Android) uçtan uca denendi.
