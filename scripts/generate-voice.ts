/**
 * Kalemo'nun doğal sesini önceden üretir: her sabit anlatım cümlesi için bir MP3.
 *
 * Sağlayıcılar:
 *   --provider gemini  Google Gemini TTS (varsayılan ses: Sulafat). .env.local içinde GEMINI_API_KEY gerekir.
 *   --provider edge    Microsoft Edge nöral sesi (varsayılan: tr-TR-EmelNeural). python -m pip install edge-tts
 *
 * Kullanım: npm run voice -- --provider gemini [--voice Sulafat] [--model <tts modeli>] [--concurrency 2] [--prune] [--force]
 * Sağlayıcı/ses verilmezse mevcut manifest'teki ayarlar kullanılır.
 *
 * Her cümlenin hangi ayarla üretildiği public/voice/state.json'da tutulur: yarıda kesilen üretim
 * kaldığı yerden devam eder, ayar değişince yalnızca eski ayarla üretilmiş dosyalar yenilenir.
 *
 * Toplanan cümleler: tüm ders adımlarının `say` metni + STATIC_LINES + LESSON_LINES (her ders için)
 * + allFeedbackTexts(tüm parça adları). Çıktı: public/voice/<anahtar>.mp3 ve public/voice/manifest.json.
 * Var olan dosyalar atlanır; ses ayarları değişirse ya da --force verilirse hepsi yeniden üretilir.
 * --prune: manifest'te olmayan mp3 dosyalarını siler.
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { allFeedbackTexts } from '../src/engine/scoring';
import type { Lesson } from '../src/lessons/types';
import { lineKey, normalizeLine } from '../src/voice/hash';
import { LESSON_LINES, STATIC_LINES } from '../src/voice/lines';
import { apiKey, DailyQuotaError, geminiTts, RateLimitError, STYLE, ttsModels } from './tts-gemini';

const RATE = '-6%';
const PITCH = '+3Hz';
const RETRIES = 3;
const TIMEOUT_MS = 60_000;
const OUT = join('public', 'voice');
const MANIFEST = join(OUT, 'manifest.json');
const STATE = join(OUT, 'state.json');

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(name);
const opt = (name: string) => {
  const i = args.findIndex((a) => a === name || a.startsWith(`${name}=`));
  if (i < 0) return undefined;
  return args[i].includes('=') ? args[i].slice(args[i].indexOf('=') + 1) : args[i + 1];
};
const oldManifest = existsSync(MANIFEST) ? (JSON.parse(readFileSync(MANIFEST, 'utf8')) as { provider?: string; voice?: string; model?: string }) : {};
const provider = (opt('--provider') ?? oldManifest.provider ?? 'edge') as 'edge' | 'gemini';
const voice = opt('--voice') ?? (provider === oldManifest.provider ? oldManifest.voice : undefined) ?? (provider === 'gemini' ? 'Sulafat' : 'tr-TR-EmelNeural');
const prune = flag('--prune');
const force = flag('--force');
let key = '';
let model = '';
if (provider === 'gemini') {
  key = apiKey();
  model = opt('--model') ?? (provider === oldManifest.provider ? oldManifest.model : undefined) ?? (await ttsModels(key))[0] ?? '';
  if (!model) throw new Error('Hesapta TTS modeli bulunamadı.');
}
const CONCURRENCY = Number(opt('--concurrency') ?? (provider === 'gemini' ? 2 : 4));
/** Bu ayarla üretilmiş dosyayı tanıyan etiket. */
const TAG = provider === 'gemini' ? lineKey(`gemini|${model}|${voice}|${STYLE}`) : lineKey(`edge|${voice}|${RATE}|${PITCH}`);

// --- Cümleleri topla ---------------------------------------------------------------------------
// (src/lessons/index.ts import.meta.glob kullanır, tsx altında çalışmaz; veri dosyaları doğrudan yüklenir.)
const lessons: Lesson[] = [];
for (const f of readdirSync('src/lessons/data').filter((f) => f.endsWith('.ts')).sort()) {
  lessons.push((await import(pathToFileURL(join('src', 'lessons', 'data', f)).href)).default);
}

const raw: string[] = [];
for (const l of lessons) for (const s of l.steps) raw.push(s.say);
raw.push(...STATIC_LINES);
for (const l of lessons) for (const t of LESSON_LINES) raw.push(t(l));
const parts = [...new Set(lessons.flatMap((l) => l.steps.flatMap((s) => s.shapes.map((sh) => sh.part ?? ''))))].filter(Boolean);
raw.push(...allFeedbackTexts(parts));

const lines = new Map<string, string>();
for (const r of raw) {
  const text = normalizeLine(r ?? '');
  if (!text) continue;
  const key = lineKey(text);
  const prev = lines.get(key);
  if (prev !== undefined && prev !== text) throw new Error(`Anahtar çakışması (${key}): "${prev}" / "${text}"`);
  lines.set(key, text);
}
console.log(`${lessons.length} ders, ${parts.length} parça adı -> ${lines.size} benzersiz cümle. Ses: ${provider} / ${voice}${model ? ` (${model})` : ''}`);

// --- Üretim durumu ----------------------------------------------------------------------------
mkdirSync(OUT, { recursive: true });
const state: Record<string, string> = existsSync(STATE) ? JSON.parse(readFileSync(STATE, 'utf8')) : {};
// Eski sürümden kalan (state'i olmayan) Edge dosyaları eski ayarla üretilmiş sayılır.
if (!existsSync(STATE) && oldManifest.voice) {
  const oldTag = lineKey(`edge|${oldManifest.voice}|${RATE}|${PITCH}`);
  for (const [k] of lines) if (existsSync(join(OUT, `${k}.mp3`))) state[k] = oldTag;
}
const saveState = () => writeFileSync(STATE, JSON.stringify(state) + '\n', 'utf8');

// --- Üretim ------------------------------------------------------------------------------------
const mp3 = (key: string) => join(OUT, `${key}.mp3`);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function tts(text: string, file: string): Promise<void> {
  if (provider === 'gemini') return geminiTts(text, file, { key, model, voice });
  return new Promise((resolve, reject) => {
    const p = spawn(
      'python',
      ['-m', 'edge_tts', '--voice', voice, `--rate=${RATE}`, `--pitch=${PITCH}`, `--text=${text}`, '--write-media', file],
      { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true },
    );
    let err = '';
    p.stderr.on('data', (d) => (err += d));
    const timer = setTimeout(() => p.kill(), TIMEOUT_MS);
    p.on('error', (e) => {
      clearTimeout(timer);
      reject(e);
    });
    p.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0 && existsSync(file) && statSync(file).size > 0) resolve();
      else reject(new Error(`edge_tts çıkış kodu ${code}: ${err.trim().split('\n').slice(-1)[0] ?? ''}`));
    });
  });
}

async function generate(key: string, text: string): Promise<void> {
  const tmp = join(OUT, `${key}.part.mp3`);
  for (let attempt = 1, waits = 0; ; attempt++) {
    try {
      await tts(text, tmp);
      renameSync(tmp, mp3(key));
      state[key] = TAG;
      saveState();
      return;
    } catch (e) {
      if (existsSync(tmp)) unlinkSync(tmp);
      if (e instanceof DailyQuotaError) throw e;
      if (e instanceof RateLimitError && waits++ < 30) {
        // Kota: söylenen süre kadar bekle, deneme hakkından düşme.
        console.log(`  kota doldu, ${Math.round(e.retryAfterMs / 1000)} sn bekleniyor...`);
        await sleep(e.retryAfterMs);
        attempt--;
        continue;
      }
      if (attempt >= RETRIES) throw e;
      await sleep(1000 * 2 ** (attempt - 1));
    }
  }
}

const todo = [...lines].filter(([k]) => force || !existsSync(mp3(k)) || state[k] !== TAG);
const skipped = lines.size - todo.length;
const failed: [string, string, string][] = [];
let generated = 0;
let stopped = false;
let done = 0;

async function worker() {
  for (;;) {
    const item = todo.shift();
    if (!item) return;
    const [key, text] = item;
    try {
      await generate(key, text);
      generated++;
    } catch (e) {
      if (e instanceof DailyQuotaError) {
        if (!stopped) console.log(`
${e.message}`);
        stopped = true;
        todo.length = 0;
        return;
      }
      failed.push([key, text, (e as Error).message]);
    }
    done++;
    if (done % 25 === 0) console.log(`  ${done} işlendi...`);
  }
}
if (todo.length) console.log(`${todo.length} dosya üretilecek (${skipped} zaten var)...`);
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
saveState();
if (stopped) {
  // Yarım üretimde manifest'i değiştirme: uygulama eski (tutarlı) sesle çalışmaya devam eder.
  const left = [...lines].filter(([k]) => state[k] !== TAG).length;
  console.log(`Bu çalıştırmada üretilen: ${generated}. Kalan: ${left}. Manifest değiştirilmedi.`);
  process.exit(2);
}

// --- Manifest ----------------------------------------------------------------------------------
const entries = [...lines].filter(([key]) => existsSync(mp3(key))).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
const manifest = {
  provider,
  voice,
  ...(provider === 'gemini' ? { model } : { rate: RATE, pitch: PITCH }),
  // Ses ayarları değişince dosya URL'leri de değişsin (tarayıcı / service worker önbelleği için).
  version: TAG,
  lines: Object.fromEntries(entries) as Record<string, string>,
};
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

// --- Budama ------------------------------------------------------------------------------------
let pruned = 0;
for (const f of readdirSync(OUT)) {
  if (f.endsWith('.part.mp3')) {
    unlinkSync(join(OUT, f));
    continue;
  }
  if (prune && f.endsWith('.mp3') && !(f.slice(0, -4) in manifest.lines)) {
    unlinkSync(join(OUT, f));
    pruned++;
  }
}

// --- Özet --------------------------------------------------------------------------------------
let bytes = 0;
let files = 0;
for (const f of readdirSync(OUT))
  if (f.endsWith('.mp3')) {
    bytes += statSync(join(OUT, f)).size;
    files++;
  }
console.log(
  `\nÜretilen: ${generated}  Atlanan: ${skipped}  Başarısız: ${failed.length}` +
    (prune ? `  Silinen: ${pruned}` : '') +
    `\nManifest: ${entries.length}/${lines.size} cümle  Klasör: ${files} mp3, ${(bytes / 1024 / 1024).toFixed(2)} MB`,
);
for (const [key, text, msg] of failed) console.log(`  x ${key} "${text}" - ${msg}`);
if (failed.length) process.exitCode = 1;
