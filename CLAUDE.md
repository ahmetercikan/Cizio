# Çizio — Claude için proje notları

- **Ne:** 5-9 yaş çocuklar için Türkçe çizim dersleri, Giydirme Stüdyosu, English Club ve 3B Çizio Adası.
  React 18 + TypeScript + Vite 5 (HashRouter), zustand (`src/store/useApp.ts`), three.js (`src/world/`),
  Capacitor 8 (Android yayında; iOS adımları **IOS.md**).
- **Kullanıcı** teknik değil: her zaman **Türkçe ve sade** yaz. İşi kendin yap, onun yapacağı adımları (mağaza konsolları,
  hesaplar) ekranda göreceği adlarla, sırayla anlat.
- **Komutlar:**
  - geliştirme: `npx vite --port 5288` (5173/5199 portlarını kullanma)
  - test: `npm test`
  - tip kontrolü ve derleme: `npm run build`
  - ders eklenince/çizimi değişince: `npm run art` (aşağıya bak)
  - Android: `npm run android:aab` (Gradle Java 21 ister: `JAVA_HOME` → `~/.jdks/ms-21.0.9`; Android Studio'nunki 17).
    Seslendirme Play'in 200 MB ana paket sınırını aştığı için `android/voicepack` ek paketine taşınır
    (`scripts/android-voicepack.ts`, `android:sync` içinde kendiliğinden).
  - iOS: `npm run ios:sync`
- **Sürüm:** `package.json` → `version`. Android: `android/app/build.gradle` (versionCode/versionName). iOS: Xcode
  Version/Build. Mağaza notları ve adımlar: `store/`.
- **Seslendirme:** sesi olmayan cümleleri çıkarmak için `npm run voice:eksik` → `store/seslendirme/`
  (dosya adı cümleden hesaplanır, değiştirilemez). MP3'ler `public/voice/` içine konup
  `npm run voice -- --manifest-only --allow-partial` çalıştırılınca devreye girer. Dosyası olmayan cümleyi
  telefonun kendi sesi okur, yani hiçbir bölüm sessiz kalmaz.
  Komut iki dosya yazar: `manifest.json` (anahtar → cümle; yalnızca betikler okur) ve `index.json`
  (uygulamanın indirdiği ince liste, ~40 KB). İkisi de her seferinde birlikte güncellenir.
- **Sesler:** `public/sfx/*.mp3` ElevenLabs ses efekti kütüphanesinden indirilmiş gerçek kayıtlardır
  (ücretli planda telifsiz, ticari kullanıma açık, atıf gerekmez). Dosya yüklenemezse `src/lib/sfx.ts`
  aynı sesi sentezleyerek çalar; yani ses hiçbir zaman kesilmez.
- **Güvenlik:** anahtar, keystore, sertifika ve `.env*` dosyaları asla commit edilmez. Firebase web ayarı gizli değildir.
- **Commit:** Türkçe mesaj, `main`'e gönderilir; GitHub Pages'e (https://ahmetercikan.github.io/Cizio/) otomatik yayınlanır.
- **Ada ve dünyalar:**
  - `src/world/island.ts`: motor
  - `layout.ts`: haritanın verisi (kıyı, bölgeler, yollar). Ada iki yarımadayla büyüdü (`CAPES`, `COAST_MAX`):
    kuzeydoğuda Şehir Merkezi, batı-güneybatıda Yarış Kıyısı; plaj, deniz feneri gibi eski kıyı yerleri yerinde kaldı.
  - `raceCoast.ts`: Yarış Kıyısı (4 yarış kapısı, süreli Engel Parkuru, Trambolin Parkı, Balon Alanı).
    `races.ts`: kapıların ardı: Kart Yarışı, Engelli Koşu, Volkan ve Buz Parkuru (rakipli; rakipler çocuğa göre
    hızlanıp yavaşlar).
  - Zıplama motoru (`jumpAssist.ts` + `island.ts` → `aimJump`): dünya `surfaces()` verirse (ya da adada
    `b.surfaces`) çocuk platforma doğru zıplayınca üstüne iner, havada bir kez daha zıplar, düşünce son bastığı
    yere döner; trambolin/mantar `hero.launch` ile fırlatır. **Yeni platform oyunları bunu kullanmalı.**
  - `zones.ts` / `places.ts`: bölgeler. Plajda denize konan şeyler (tekne, jet ski, sörf) kendi açısındaki kıyıya
    göre yerleşir (`sea(...)`); tek bir kıyı yarıçapı kullanılınca tekne karada kalıyordu.
  - Engeller (`terrain.ts` → `BlockGrid`): daire ya da dikdörtgen. Modelde (ya da içindeki parçada)
    `userData.foot = { w, d }` / `{ r }` varsa `b.place` engeli kendisi koyar (tabela, bank, sütun, direk).
    Yüksek basamaklar `Deck.tall`: üstünde durulur, yandan geçilmez. Binalar `blkRect` / `b.blockRect` ile
    dikdörtgen engellenir (daire sırası köşelerden içeri sokuyordu). Duran araçlar da içinden geçilmez
    (`island.ts` → `vehicleBlocker`, ölçü modelden çıkar).
  - İnşa: Minecraft gibi hızlı çubuk + Çanta (`FarmPanels.tsx` → `BuildBar`); seçili blok elde durur
    (`build.ts` → `handTool`).
  - `weather.ts`: mevsim (yaprak rengi, tarihten) ve günün havası (yağmur / kar; aynı gün hep aynı)
  - `water.ts`: dalgalanan havuz suyu ve kavis çizen fıskiye (kasaba çeşmesi, köy çeşmesi, AVM havuzu, ev havuzu)
  - `city.ts`: Şehir Merkezi (gökdelenler, dönel kavşak, AVM, sinema, otel, taksi) ve ortak `tower()` modeli
  - `interiors.ts`: binaların içi (okul, hastane, market, kütüphane, pastane, itfaiye, müze + Şehir Merkezi'nin
    AVM, sinema, otel, ofis ve apartman daireleri). Müze camekânları çocuğun koleksiyonuna göre dolar
    (`makeRealm(..., { museum })`). Kapılar `places.ts` ve `city.ts`'te `door(...)` ile kurulur.
  - `mars.ts`: Mars
  - `home.ts`: Evim (Ev planı sekmesinden evine ad verilir; ad ada tabelasında yazar)
  - `collection.ts`: koleksiyon (balık, fosil, kabuk, böcek); Müze'nin içi `interiors.ts` → `muze`
  - `petpark.ts`: Evcil Hayvan Parkı (besle, yıka, topla oyna, böcek ara)
  - `MiniGames.tsx` / `ArcadeGames.tsx`: Oyun Çadırı'nın 14 mini oyunu (lobi: `Shops.tsx` GamesPanel)
  - `Rewards.tsx`: hazine sandıkları, günlük hediye serisi, koleksiyon rozetleri (hesap: `economy.ts`)
  - `carsData.ts` / `vehicles.ts`: araçlar (seviyeyle açılır, altınla alınır)
- **Şimdilik kapalı** (`src/lib/flags.ts` → `MUZIK_MATEMATIK_ACIK = false`): Müzik Odası (`/muzik`,
  `src/lib/instruments.ts`) ve Matematik Parkı (`/matematik`, `src/lib/mathpark.ts`). Kod duruyor; ana sayfada
  kart yok, adresleri ana sayfaya döner, cümleleri seslendirme listesine girmez. Açmak için bayrağı `true` yap.
  Ana sayfa bu yüzden dört kartla açılır.
- **Açılış yükü:** ders verisi (`src/lessons/data/*`, ~0,5 MB) artık ana sayfada inmiyor; yalnızca Öğren/Atölye
  açılınca yükleniyor (uygulama boştayken arka planda hazırlanıyor). Ana sayfanın, profil avatarlarının ve
  günün görevinin ihtiyaç duyduğu küçük parçalar `npm run art` ile üretiliyor:
  `src/lessons/meta.ts` (ders künyeleri), `src/components/HomeArt.tsx` (ana sayfadaki iki çizim),
  `src/components/AvatarShapes.ts` (avatar çizimleri). **Ders eklenince, çıkarılınca ya da bir dersin adı/çizimi
  değişince `npm run art` çalıştırılır**; unutulursa `npm test` uyarır. Üretici: `scripts/bake-art.ts`.
- **Yatay telefon düzeni:** `src/styles/landscape.css` (yalnızca yatay ve kısa ekranlarda devreye girer).
  Ada açılınca ekran yan döner, çıkınca serbest kalır (`src/lib/orientation.ts`, `@capacitor/screen-orientation`;
  iPad'de kilit için `Info.plist` → `UIRequiresFullScreen`).
- **Seslendirme boyutu:** MP3'ler 24 kHz mono; eskiler 32 kbps, yeni üretilenler 40 kbps (`scripts/tts-gemini.ts` →
  `pcmToMp3`). lamejs 24 kHz'de 40 kbps'in altında hata vermeden **sessiz** dosya yazar; düşürme. Yalnızca betiklerin
  okuduğu `voice/manifest.json` ve `state.json` telefon paketine girmez (`scripts/native-trim.ts`).
