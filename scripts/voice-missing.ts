/**
 * Sesi olmayan cümleleri listeler: başka bir yerde seslendirilecekse buradan teslim listesi çıkar.
 *
 * Uygulama her cümleyi metninden hesaplanan bir anahtarla arar: `public/voice/<anahtar>.mp3`.
 * Bu araç, uygulamanın okuduğu bütün cümleleri toplar, `public/voice/manifest.json` ile karşılaştırır
 * ve sesi olmayanları iki dosyaya yazar:
 *
 *   store/seslendirme/eksik-tr.tsv   Türkçe cümleler
 *   store/seslendirme/eksik-en.tsv   İngilizce cümleler (English Club)
 *
 * Her satır: <dosya adı><TAB><cümle>. Seslendiren kişi MP3'leri tam o adla üretip
 * `public/voice/` içine koyar; sonra `npm run voice -- --manifest-only --allow-partial`
 * çalıştırılınca uygulama onları kullanmaya başlar.
 *
 * Kullanım: npm run voice:eksik
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { allFeedbackTexts } from '../src/engine/scoring';
import type { Lesson } from '../src/lessons/types';
import { lineKey, normalizeLine } from '../src/voice/hash';
import { LESSON_LINES, STATIC_LINES, TONED_LINES } from '../src/voice/lines';
import { englishLines } from '../src/english/data';

const OUT_DIR = join('store', 'seslendirme');
const VOICE_DIR = join('public', 'voice');

const lessons: Lesson[] = [];
for (const f of readdirSync(join('src', 'lessons', 'data')).filter((f) => f.endsWith('.ts')).sort()) {
  lessons.push((await import(pathToFileURL(join('src', 'lessons', 'data', f)).href)).default);
}

type Satir = { key: string; text: string; lang: 'tr' | 'en' };
const hepsi = new Map<string, Satir>();
const ekle = (text: string, lang: 'tr' | 'en') => {
  const t = normalizeLine(text ?? '');
  if (!t) return;
  const key = lineKey(t);
  if (!hepsi.has(key)) hepsi.set(key, { key, text: t, lang });
};

for (const l of lessons) for (const s of l.steps) ekle(s.say, 'tr');
for (const t of STATIC_LINES) ekle(t, 'tr');
for (const l of lessons) for (const f of LESSON_LINES) ekle(f(l), 'tr');
const parts = [...new Set(lessons.flatMap((l) => l.steps.flatMap((s) => s.shapes.map((sh) => sh.part ?? ''))))].filter(Boolean);
for (const t of allFeedbackTexts(parts)) ekle(t, 'tr');
for (const t of TONED_LINES) ekle(t.text, 'tr');
for (const t of englishLines()) ekle(t, 'en');

// hangi cümlelerin sesi var?
const manifestPath = join(VOICE_DIR, 'manifest.json');
const manifest: { lines?: Record<string, string> } = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};
const kayitli = new Set(Object.keys(manifest.lines ?? {}));
const dosyaVar = new Set(
  existsSync(VOICE_DIR) ? readdirSync(VOICE_DIR).filter((f) => f.endsWith('.mp3')).map((f) => f.slice(0, -4)) : [],
);

const eksik = [...hepsi.values()].filter((s) => !kayitli.has(s.key) && !dosyaVar.has(s.key));
const trEksik = eksik.filter((s) => s.lang === 'tr');
const enEksik = eksik.filter((s) => s.lang === 'en');

mkdirSync(OUT_DIR, { recursive: true });
const yaz = (ad: string, satirlar: Satir[]) => {
  const p = join(OUT_DIR, ad);
  writeFileSync(p, satirlar.map((s) => `${s.key}.mp3\t${s.text}`).join('\n') + (satirlar.length ? '\n' : ''), 'utf8');
  return p;
};
const p1 = yaz('eksik-tr.tsv', trEksik);
const p2 = yaz('eksik-en.tsv', enEksik);

console.log(`Toplam cümle: ${hepsi.size} (sesi olan: ${hepsi.size - eksik.length})`);
console.log(`Eksik: ${eksik.length} — Türkçe ${trEksik.length}, İngilizce ${enEksik.length}`);
console.log(`Yazıldı: ${p1}`);
console.log(`Yazıldı: ${p2}`);
if (eksik.length) {
  console.log('\nMP3 dosyaları public/voice/ içine konduktan sonra:');
  console.log('  npm run voice -- --manifest-only --allow-partial');
}
