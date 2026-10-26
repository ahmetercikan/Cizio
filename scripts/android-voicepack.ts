/**
 * `npx cap sync android` web dosyalarını `android/app/src/main/assets/public` içine kopyaladıktan sonra
 * seslendirme klasörünü (`public/voice`) `android/voicepack` ek paketine taşır.
 *
 * Neden: Play, bir telefonun indirdiği ana paketi en çok 200 MB kabul eder. Seslendirme 32 kbps'e inince ~145 MB
 * (önceden ~264 MB); yeni cümleler eklendikçe sınır yine aşılmasın diye sesler ek pakette kalır.
 * `voicepack` kurulumla birlikte gelen bir ek pakettir (install-time asset pack): telefon onu uygulamayla
 * aynı anda indirir ve dosyaları ana paketteki gibi aynı yoldan (`public/voice/...`) okunur.
 * Uygulamada hiçbir şey değişmez, ses kalitesi düşmez.
 */
import { existsSync, mkdirSync, renameSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const ANDROID = join(import.meta.dirname, '../android');
const from = join(ANDROID, 'app/src/main/assets/public/voice');
const to = join(ANDROID, 'voicepack/src/main/assets/public/voice');

if (!existsSync(from)) {
  console.error(`Seslendirme klasörü yok: ${from} (önce npx cap sync android)`);
  process.exit(1);
}
rmSync(to, { recursive: true, force: true });
mkdirSync(join(to, '..'), { recursive: true });
renameSync(from, to);
console.log('Seslendirme ek pakete (android/voicepack) taşındı.');
