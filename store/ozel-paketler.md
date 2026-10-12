# Çizio Adası özel paketleri: satışa açma adımları

Paketler kodda hazır ama **kapalı** (`src/world/premium.ts` → `PREMIUM_ENABLED = false`). Kapalıyken ebeveyn bölümünde "Yakında"
yazar, oyunda özel eşyalar taçla görünür ve dokununca "Bir büyüğün ebeveyn bölümünden açabilir" bilgisi çıkar.

## Paketler (bir kez alınır, tüketilmez)

| Ürün kimliği (Play Console) | Ad | Önerilen fiyat | İçindekiler |
|---|---|---|---|
| `cizio_paket_araba` | Hayal Arabaları | 79,99 TL | Unicorn arabası, uçan araba, gökkuşağı limuzin |
| `cizio_paket_sato` | Şato Evi | 99,99 TL | Şato evi planı, taht, kale yatak, kristal avize |
| `cizio_paket_sihir` | Sihirli Eşyalar | 59,99 TL | Uzay yatağı, dondurma makinesi, dev akvaryum, gökkuşağı halı |
| `cizio_paket_renk` | Parıltılı Renkler | 39,99 TL | Giydir'de altın, gümüş, inci, neon ve galaksi renkleri |

## Açmak için

1. Play Console → **Ayarlar → Ödeme profili**: satıcı hesabını açın (vergi ve banka bilgileri).
2. Play Console → Çizio → **Para kazanma → Ürünler → Uygulama içi ürünler**: yukarıdaki 4 ürünü aynı kimliklerle ekleyin,
   fiyatı girip **Etkinleştir** deyin.
3. Bana haber verin: `PREMIUM_ENABLED = true` yapıp `npm i cordova-plugin-purchase` ve `npx cap sync android` ile yeni sürüm hazırlarım.
4. Veri güvenliği formuna **Finansal bilgiler → Satın alma geçmişi** eklenir (Google Play işler, Çizio görmez).

## Kurallar (değiştirmeyin)

- Satın alma yalnızca Ebeveyn bölümünde, ebeveyn kilidinin arkasında.
- Oyunda satın alma penceresi, geri sayım, "son fırsat" gibi baskı yok; ada altını gerçek parayla satılmaz.
- Altınla alınan her şey oynayarak kazanılır (çiftlik, pazar, siparişler, macera kapıları, mini oyunlar).
