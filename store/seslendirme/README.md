# Seslendirilecek yeni cümleler

> **Şu an bekleyen iş (27 Ekim 2026):** `eksik-tr.tsv` içinde **28 Türkçe cümle** var: Yarış Kıyısı ve yarış
> dünyaları (Kart Yarışı, Engelli Koşu, Volkan ve Buz Parkuru). İngilizce eksik yok.
>
> **Gemini anahtarı olan ortamda en kısa yol** (uygulamadaki sesle, Sulafat, otomatik):
>
> ```
> git pull
> npm install
> npm run voice -- --provider gemini --allow-partial
> git add public/voice && git commit -m "Ses: Yarış Kıyısı cümleleri seslendirildi" && git push
> ```
>
> `.env.local` içinde `GEMINI_API_KEY` olmalı. Komut yalnızca sesi olmayan cümleleri üretir, MP3'leri 32 kbps
> yazar ve `manifest.json` / `index.json`'u günceller. Sonra Claude'a "git pull yap" demen yeter.
> Başka bir araçla üretilirse aşağıdaki "MP3'ler hazır olunca" adımları geçerli.

Bu klasördeki iki dosya, uygulamada **henüz sesi olmayan** cümleleri içerir. Yeni eklenen bölümlerin
(Harfler ve Sayılar, ABC, Şarkılar, Say It!, Draw in English, Şehir Merkezi görevleri) cümleleridir.

| Dosya | Dil | Ne kadar |
|---|---|---|
| `eksik-tr.tsv` | Türkçe | Çizio'nun Türkçe sesiyle |
| `eksik-en.tsv` | İngilizce | English Club'ın İngilizce sesiyle |

Listeyi her zaman güncel çıkarmak için:

```
npm run voice:eksik
```

## Dosyaların biçimi

Her satırda **önce dosya adı, sonra bir sekme (TAB), sonra okunacak cümle** vardır:

```
507da836.mp3	A. Armut kelimesinin ilk harfi. Hadi A yazalım!
```

Dosya adı cümleden hesaplanır; **değiştirilemez**. Uygulama sesi tam o adla arar.

## Seslendiren kişiye verilecek bilgi

1. Her satır için bir **MP3** üretilecek.
2. Dosyanın adı, satırın başındaki ad olacak (`507da836.mp3` gibi) — uzantı dahil aynen.
3. Ses: çocuklara konuşan, sıcak, canlı bir anlatım. Acele etmeden, net.
4. Türkçe dosyalar Türkçe sesle, İngilizce dosyalar İngilizce (anadil) sesle.
5. Cümlenin başında ya da sonunda uzun sessizlik olmasın.
6. Hepsi aynı ses ve aynı tonla okunsun (uygulamadaki diğer cümlelerle aynı kişi).

## MP3'ler hazır olunca

1. Bütün MP3 dosyalarını `public/voice/` klasörünün içine kopyala (var olanların yanına).
2. Şu komutu çalıştır:

```
npm run voice -- --manifest-only --allow-partial
```

Bu komut yeni dosyaları uygulamaya tanıtır. Sonra `npm run build` ve commit yeterlidir.

> Sesi olmayan cümleler uygulamada yine okunur: telefonun kendi konuşma sesi devreye girer.
> Yani ses dosyaları gelene kadar hiçbir bölüm sessiz kalmaz.
