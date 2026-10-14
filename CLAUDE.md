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
  - Android: `npm run android:aab`
  - iOS: `npm run ios:sync`
- **Sürüm:** `package.json` → `version`. Android: `android/app/build.gradle` (versionCode/versionName). iOS: Xcode
  Version/Build. Mağaza notları ve adımlar: `store/`.
- **Güvenlik:** anahtar, keystore, sertifika ve `.env*` dosyaları asla commit edilmez. Firebase web ayarı gizli değildir.
- **Commit:** Türkçe mesaj, `main`'e gönderilir; GitHub Pages'e (https://ahmetercikan.github.io/Cizio/) otomatik yayınlanır.
- **Ada ve dünyalar:**
  - `src/world/island.ts`: motor
  - `zones.ts` / `places.ts`: bölgeler
  - `interiors.ts`: binaların içi
  - `mars.ts`: Mars
  - `home.ts`: Evim
  - `MiniGames.tsx`: mini oyunlar
- **Yatay telefon düzeni:** `src/styles/landscape.css` (yalnızca yatay ve kısa ekranlarda devreye girer).
