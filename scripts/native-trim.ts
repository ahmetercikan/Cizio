/**
 * `npx cap sync` web dosyalarını telefon projesine kopyaladıktan sonra uygulamanın hiç okumadığı dosyaları siler:
 * seslendirmenin tam listesi (`voice/manifest.json`) ve üretim kaydı (`voice/state.json`) yalnızca betikler içindir;
 * uygulama ince listeyi (`voice/index.json`) okur. Web sürümünde (GitHub Pages) dururlar.
 *
 * Kullanım: tsx scripts/native-trim.ts android|ios
 */
import { rmSync } from 'node:fs';
import { join } from 'node:path';

const platform = process.argv[2];
const PUBLIC = { android: 'android/app/src/main/assets/public', ios: 'ios/App/App/public' }[platform ?? ''];
if (!PUBLIC) {
  console.error('Kullanım: tsx scripts/native-trim.ts android|ios');
  process.exit(1);
}
for (const f of ['voice/manifest.json', 'voice/state.json']) rmSync(join(import.meta.dirname, '..', PUBLIC, f), { force: true });
console.log(`${platform}: yalnızca betiklerin okuduğu dosyalar pakete girmedi.`);
