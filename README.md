# Cizio: Çizim Öğren

7-9 yaş çocuklar için Türkçe, sesli anlatımlı, adım adım çizim öğreten bir web uygulaması. Simply Draw'dan esinlenildi, ondan fazlasını yapıyor. Şimdilik PWA olarak tarayıcıda çalışıyor. Aynı kod ileride Capacitor ile iOS ve Android uygulamasına dönüştürülecek.

## Neler var?

- **24 ders, 5 çizim yolu**:
  - Temeller: çizgi, dalga, daire, şekil, spiral, yıldız
  - Hayvanlar
  - Sevimli Nesneler
  - Doğa
  - Karakterler
- **Referans uygulamaya benzer arayüz**: Tasarım bölümüne bakın.
- **İki çizim modu**:
  - **Ekranda**: Parmak, fare ya da kalemle çizilir. Apple Pencil ve S Pen basıncı desteklenir, avuç içi dokunuşları yok sayılır.
  - **Kâğıtta**: Adımlar animasyonla izlenir, çizim kâğıda yapılır, sonra fotoğrafı çekilir. Uygulama fotoğraftaki çizimi bulur ve örneği otomatik olarak üstüne hizalar.
- **Azalan yardım (iskele)**: Önce "İz sür", sonra "Noktalar", en sonda "Kendin çiz". Bir dersten 3 yıldız alınınca bir sonraki seviye önerilir.
- **Gerçek geri bildirim**:
  - Her adım puanlanır (0-3 yıldız).
  - Kaçırılan yerler turuncu noktalarla gösterilir.
  - Geri bildirim eksik parçayı adıyla söyler: "Güzel deneme! Sağ kulak kısmına bir daha bak."
  - Çocuğa sayısal puan gösterilmez.
- **Doğal Türkçe anlatım**: Önceden üretilmiş nöral ses kullanılır, dosyası olmayan cümlelerde cihazın sesine düşer.
- **Boyama**: Boya kovası çocuk çizimlerindeki küçük boşlukları kendisi kapatır. Ayrıca fırça, keçeli kalem, silgi, geri al ve yinele var.
- **Serbest çizim ve boyama kitabı**: Her ders çizimi bir boyama sayfası olarak da açılabilir.
- **Galeri**: Tüm çizimler cihazda saklanır. Aynı ders tekrar yapılınca önceki ve yeni çizim yan yana gösterilir.
- **Ödüller**: Çıkartma albümü, günlük seri ve haftalık takvim.
- **Ebeveyn bölümü**: Basit bir çarpma sorusuyla korunur. İçinde:
  - profiller
  - ses ve hız ayarı
  - solak düzeni
  - son 14 günün ilerleme grafiği
  - yedek alma ve geri yükleme
- **Gizlilik**: Hiçbir veri sunucuya gitmez. Fotoğraflar ve çizimler yalnızca cihazdaki IndexedDB'de durur. Hesap yok, reklam yok, izleme yok.
- **Çevrimdışı çalışır** ve "Ana ekrana ekle" ile uygulama gibi açılır (PWA).

## Tasarım

Simply Draw'un akışı ve görsel dili örnek alındı:

- **Tema:** Derin indigo zemin, ekranlar boyunca akan beyaz kalem çizgisi (`FlowLine`), hap biçimli büyük butonlar.
- **Çizimler:** Tüm ders çizimleri kâğıt üzerinde **grafit kalem eskizi** olarak gösterilir. Kalem izi hafifçe titrer ve grenlidir, hacim gölgesi ve tarama (hatching) vardır. Bunu `src/art/sketch.ts` üretir; boyama örnekleri aynı yöntemle kuru boya görünümünde çıkar.
- **Ders "videosu":** Ahşap masa üzerindeki kâğıda gerçekçi bir kurşun kalem her adımı çizer. Altta ileri/geri sarılabilen zaman çubuğu ve hız ayarı, ortada ⟲ ⏸ ⟳ düğmeleri vardır. Her adımın sonunda "Sıra sende!" denir. Animasyonun zamanlamasını `src/art/timeline.ts` belirler.
- **Karşılama akışı:** yetişkin var mı → ebeveyn izni → avatar → isim → "hangisini daha çok seviyorsun?" (3 tur) → vitrin → "Hadi başlayalım".
- **Kâğıt modu:** Kâğıda çizilen resim canlı kamerayla fotoğraflanır (kâğıt çerçevesi ve deklanşör var) ve örnek çizim fotoğrafın üstüne otomatik hizalanır.

## Doğal ses

Anlatımdaki tüm sabit cümleler (ders adımları, geri bildirimler, arayüz cümleleri; şu an 608 cümle), Microsoft nöral Türkçe sesiyle (`tr-TR-EmelNeural`) önceden MP3'e çevrilip `public/voice/` klasörüne konur.

- Dosyası olmayan cümleler, örneğin çocuğun adını içerenler, tarayıcının konuşma sentezine düşer.
- Ebeveyn bölümünden doğal ses kapatılabilir.

Yeni bir cümle eklediğinizde onu `src/voice/lines.ts` dosyasına da yazın, sonra şunları çalıştırın:

```bash
pip install edge-tts       # bir kez
npm run voice              # eksik MP3'leri üretir (--prune: artık kullanılmayanları siler)
```

> **Not:** `edge-tts`, Edge tarayıcısının "Sesli oku" hizmetini kullanır; bu, resmî bir API değildir. Kişisel kullanım için sorun olmaz. Mağaza sürümünde aynı sesi Azure Speech (resmî ve lisanslı) üzerinden üretin; `scripts/generate-voice.ts` içinde yalnızca üretim komutu değişir.

## Geliştirme

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # birim testleri + 24 dersin puanlama uyumluluk testi
npm run build        # dist/ klasörüne üretim derlemesi
npm run preview      # derlemeyi yerelde dene
```

Tablette denemek için bilgisayar ve tablet aynı ağda olmalı: `npm run dev -- --host` komutunu çalıştırıp ekranda görünen ağ adresini tabletten açın.

Uçtan uca test, bilgisayardaki Edge ya da Chrome ile çalışır (ayrı tarayıcı indirmez):

```bash
npx vite --port 5287
BASE_URL=http://localhost:5287/ npx tsx scripts/e2e.ts   # karşılama, kâğıt ve ekran dersi, tüm sayfalar; ekran görüntüleri .render/e2e/ altına
```

## GitHub Pages'e yayınlama

1. GitHub'da yeni bir depo açın (ör. `cizio`) ve bu klasörü gönderin:
   ```bash
   git add -A
   git commit -m "Cizio ilk sürüm"
   git branch -M main
   git remote add origin https://github.com/<kullanici>/cizio.git
   git push -u origin main
   ```
2. Depoda **Settings → Pages → Build and deployment → Source: GitHub Actions** seçin.
3. `main` dalına yapılan her gönderimde `.github/workflows/deploy.yml` testleri çalıştırır, derler ve yayınlar. Adres `https://<kullanici>.github.io/cizio/` olur.

Uygulama göreli yollarla (`base: './'`) ve hash yönlendirmeyle (`#/ders/kedi`) derlendiği için depo adı ne olursa olsun ayar gerekmez.

## Android uygulaması (Google Play)

Android projesi `android/` klasöründe (Capacitor 8). Paket kimliği: `com.ahmetercikan.cizio`.

```bash
npm run android:sync   # web'i derler ve android/ içine kopyalar
npm run android:aab    # imzalı Play paketi: android/app/build/outputs/bundle/release/app-release.aab
npm run android:apk    # cihaza doğrudan kurulabilen imzalı APK
npx cap open android   # Android Studio'da aç
```

- **JDK 21 gerekir.** Bu makinede `%USERPROFILE%.jdksjdk-21.0.12.1+1` kurulu; `JAVA_HOME` bunu göstermeli.
- **Yükleme anahtarı:** `%USERPROFILE%.cizio-keyscizio-upload.jks`. Şifre ve yol `android/keystore.properties` dosyasında; ikisi de depoya girmez. **Bu anahtarı kaybetmeyin:** güvenli bir yere (ör. şifre yöneticisi ve harici disk) yedekleyin. Play App Signing açık olduğunda kaybolursa Play Console'dan sıfırlatılabilir, ama zahmetlidir.
- **Her yeni sürümde** `android/app/build.gradle` içindeki `versionCode` bir artırılmalı ve `versionName` güncellenmeli.
- **Mağaza materyalleri** `store/` klasöründe: metinler (`listing-tr.md`), öne çıkan görsel, ikon ve telefon/tablet ekran görüntüleri (`npx tsx scripts/store-assets.ts` ile yeniden üretilir).
- **Gizlilik politikası:** https://ahmetercikan.github.io/ciziktir/gizlilik.html (`public/gizlilik.html`).
- **Uygulama ikonu ve açılış ekranı:** `npm run icons`, ardından `npx @capacitor/assets generate --android`.

## Mimari

```
src/
  engine/        Saf mantık (DOM'suz, test edilir)
    pathSampler  SVG path → nokta dizisi (M/L/H/V/Q/T/C/S/A/Z)
    scoring      İz sürme ve serbest çizim puanı, Türkçe geri bildirim
    floodFill    Boşluk kapatan boya kovası
    drawingDoc   Eylem geçmişi, çizgi ve boya katmanları
  lessons/       Ders içeriği (data/*.ts otomatik yüklenir)
  art/           Kalem eskizi üretimi (sketch) ve ders videosu zaman çizelgesi (timeline)
  voice/         Doğal ses cümle kataloğu ve anahtarlama
  components/    AppShell (sol menü), LessonCard, Sketch/LiveSketch, Pencil, CameraCapture, DrawTools, Avatars, FlowLine, DrawingCanvas, GuideLayer
  pages/         Onboarding, Playground, Learn/CoursePage, LessonPage (oynatıcı), FreeDraw, Journal, Parent, Profiles
  store/         Zustand (localStorage): profiller, ilerleme, çıkartmalar, ayarlar
  lib/           Konuşma, ses efektleri, galeri (IndexedDB), öneri
```

## Yeni ders eklemek

`src/lessons/data/` klasörüne bir dosya ekleyin (örnek: `kedi.ts`). Çizimler 400×400 alanda SVG path olarak tanımlanır. Her adımda bir sesli yönerge (`say`) ve o adımda eklenen şekiller bulunur.

```bash
npx tsx scripts/render-lessons.ts <dersId>   # .render/<dersId>.png: adım adım önizleme
npm test                                     # doğru iz sürme her adımda 3 yıldız almalı
```

Kurallar:

- Her şekil çocuğun tek hamlede çizeceği bir çizgi olmalı.
- Önce büyük şekiller, sonra ayrıntılar gelmeli.
- Bir adımda en fazla 5 şekil olmalı.
- `part` alanına Türkçe parça adı yazılmalı. Geri bildirimde bu ad kullanılır.
