/**
 * Çizio'nun doğal sesini önceden üretir: her sabit anlatım cümlesi için bir MP3.
 *
 * Sağlayıcılar:
 *   --provider gemini  Google Gemini TTS (varsayılan ses: Sulafat). .env.local içinde GEMINI_API_KEY gerekir.
 *                      Kota tasarrufu için cümleler toplu üretilir (tek istekte --batch kadar cümle, aralarındaki
 *                      sessizlikten bölünür). Tonlu cümleler (TONED_LINES) tek tek, kendi tarifleriyle üretilir.
 *                      Bir modelin günlük kotası biterse sıradaki TTS modeline geçilir.
 *   --provider edge    Microsoft Edge nöral sesi (varsayılan: tr-TR-EmelNeural). python -m pip install edge-tts
 *
 * Kullanım: npm run voice -- --provider gemini [--voice Sulafat] [--model <model>] [--batch 25] [--concurrency 2] [--prune] [--force]
 *   --manifest-only   hiçbir şey üretme, yalnızca manifest'i yaz
 *   --allow-partial   bazı cümleler henüz yeni sesle üretilmemiş olsa da manifest'i yaz (eski kayıtları kullanır)
 * Sağlayıcı/ses verilmezse mevcut manifest'teki ayarlar kullanılır.
 *
 * Her cümlenin hangi ayarla üretildiği public/voice/state.json'da tutulur: yarıda kalan üretim kaldığı yerden
 * devam eder. Üretim yarıda kalırsa manifest değiştirilmez (uygulama eski, tutarlı sesle çalışmaya devam eder).
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { allFeedbackTexts } from '../src/engine/scoring';
import type { Lesson } from '../src/lessons/types';
import { lineKey, normalizeLine } from '../src/voice/hash';
import { LESSON_LINES, STATIC_LINES, TONED_LINES } from '../src/voice/lines';
import { apiKey, DailyQuotaError, FreeTierError, geminiTts, geminiTtsBatch, RateLimitError, STYLE_ID, ttsModels } from './tts-gemini';

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
interface Manifest {
  provider?: string;
  voice?: string;
  models?: string[];
}
const oldManifest: Manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};
const provider = (opt('--provider') ?? oldManifest.provider ?? 'edge') as 'edge' | 'gemini';
const voice =
  opt('--voice') ?? (provider === oldManifest.provider ? oldManifest.voice : undefined) ?? (provider === 'gemini' ? 'Sulafat' : 'tr-TR-EmelNeural');
const prune = flag('--prune');
const force = flag('--force');
const BATCH = Number(opt('--batch') ?? 25);
const CONCURRENCY = Number(opt('--concurrency') ?? (provider === 'gemini' ? 2 : 4));

let key = '';
let models: string[] = [];
if (provider === 'gemini') {
  key = apiKey();
  const available = await ttsModels(key);
  // Tercih sırası: en yeni "flash" TTS, sonra diğerleri (pro modeller en sonda).
  const pref = (m: string) => (/3\.8-flash-tts$/.test(m) ? 0 : /flash-tts/.test(m) ? 1 : /flash-lite-tts/.test(m) ? 2 : /flash/.test(m) ? 3 : 4);
  models = opt('--model') ? [opt('--model')!] : [...available].sort((a, b) => pref(a) - pref(b));
  if (!models.length) throw new Error('Hesapta TTS modeli bulunamadı.');
}
/** Bu ayarla üretilmiş dosyayı tanıyan etiket (model yedeğe geçse de aynı ses sayılır). */
const BASE_TAG = provider === 'gemini' ? lineKey(`gemini|${voice}|${STYLE_ID}`) : lineKey(`edge|${voice}|${RATE}|${PITCH}`);

// --- Cümleleri topla ---------------------------------------------------------------------------
// (src/lessons/index.ts import.meta.glob kullanır, tsx altında çalışmaz; veri dosyaları doğrudan yüklenir.)
const lessons: Lesson[] = [];
for (const f of readdirSync('src/lessons/data').filter((f) => f.endsWith('.ts')).sort()) {
  lessons.push((await import(pathToFileURL(join('src', 'lessons', 'data', f)).href)).default);
}

const raw: { text: string; tone?: string }[] = [];
for (const l of lessons) for (const s of l.steps) raw.push({ text: s.say });
for (const t of STATIC_LINES) raw.push({ text: t });
for (const l of lessons) for (const t of LESSON_LINES) raw.push({ text: t(l) });
const parts = [...new Set(lessons.flatMap((l) => l.steps.flatMap((s) => s.shapes.map((sh) => sh.part ?? ''))))].filter(Boolean);
for (const t of allFeedbackTexts(parts)) raw.push({ text: t });
for (const t of TONED_LINES) raw.push(t);

const lines = new Map<string, { text: string; tone?: string }>();
for (const r of raw) {
  const text = normalizeLine(r.text ?? '');
  if (!text) continue;
  const k = lineKey(text);
  const prev = lines.get(k);
  if (prev !== undefined && prev.text !== text) throw new Error(`Anahtar çakışması (${k}): "${prev.text}" / "${text}"`);
  lines.set(k, { text, tone: r.tone ?? prev?.tone });
}
const tagOf = (k: string) => {
  const tone = lines.get(k)?.tone;
  return tone && provider === 'gemini' ? lineKey(`${BASE_TAG}|${tone}`) : BASE_TAG;
};
console.log(`${lessons.length} ders, ${parts.length} parça adı -> ${lines.size} benzersiz cümle. Ses: ${provider} / ${voice}${models.length ? ` (${models[0]})` : ''}`);

// --- Üretim durumu ----------------------------------------------------------------------------
mkdirSync(OUT, { recursive: true });
const state: Record<string, string> = existsSync(STATE) ? JSON.parse(readFileSync(STATE, 'utf8')) : {};
const saveState = () => writeFileSync(STATE, JSON.stringify(state) + '\n', 'utf8');
const mp3 = (k: string) => join(OUT, `${k}.mp3`);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const todo = [...lines.keys()].filter((k) => force || !existsSync(mp3(k)) || state[k] !== tagOf(k));
const skipped = lines.size - todo.length;
const failed: [string, string, string][] = [];
let generated = 0;
let stopped = false;
const usedModels = new Set<string>();

// --- Edge --------------------------------------------------------------------------------------
function edgeTts(text: string, file: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const p = spawn('python', ['-m', 'edge_tts', '--voice', voice, `--rate=${RATE}`, `--pitch=${PITCH}`, `--text=${text}`, '--write-media', file], {
      stdio: ['ignore', 'ignore', 'pipe'],
      windowsHide: true,
    });
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

// --- Gemini: model yedeği ve kota yönetimi -------------------------------------------------------
let modelIdx = 0;
/** İsteği mevcut modelle dener; dakikalık kotada bekler, günlük kota biterse sonraki modele geçer. */
async function withModel<T>(fn: (model: string) => Promise<T>): Promise<T> {
  for (let waits = 0; ; ) {
    if (modelIdx >= models.length) throw new DailyQuotaError('Tüm TTS modellerinin günlük kotası doldu.');
    const m = models[modelIdx];
    try {
      const r = await fn(m);
      usedModels.add(m);
      return r;
    } catch (e) {
      // --paid: hesabın ücretli olması bekleniyor; ücretsiz katman hatası gelirse hemen dur (model değiştirme).
      if (e instanceof FreeTierError && flag('--paid')) throw e;
      if (e instanceof DailyQuotaError) {
        if (models[modelIdx] === m) {
          console.log(`  ${m}: günlük kota doldu, sıradaki modele geçiliyor...`);
          modelIdx++;
        }
        continue;
      }
      if (e instanceof RateLimitError && waits++ < 30) {
        console.log(`  kota, ${Math.round(e.retryAfterMs / 1000)} sn bekleniyor...`);
        await sleep(e.retryAfterMs);
        continue;
      }
      throw e;
    }
  }
}

function done(k: string) {
  state[k] = tagOf(k);
  saveState();
  generated++;
  if (generated % 25 === 0) console.log(`  ${generated} üretildi...`);
}

async function single(k: string) {
  const { text, tone } = lines.get(k)!;
  const tmp = join(OUT, `${k}.part.mp3`);
  for (let attempt = 1; ; attempt++) {
    try {
      if (provider === 'gemini') await withModel((model) => geminiTts(text, tmp, { key, model, voice, tone }));
      else await edgeTts(text, tmp);
      renameSync(tmp, mp3(k));
      done(k);
      return;
    } catch (e) {
      if (existsSync(tmp)) unlinkSync(tmp);
      if (e instanceof DailyQuotaError || attempt >= RETRIES) throw e;
      await sleep(1000 * 2 ** (attempt - 1));
    }
  }
}

/** Toplu üretim; bölme tutmazsa grubu ikiye ayırıp yeniden dener. */
async function batch(keys: string[]): Promise<void> {
  if (keys.length <= 2) {
    for (const k of keys) await single(k);
    return;
  }
  const items = keys.map((k) => ({ text: lines.get(k)!.text, file: join(OUT, `${k}.part.mp3`) }));
  let ok = false;
  try {
    ok = await withModel((model) => geminiTtsBatch(items, { key, model, voice }));
  } catch (e) {
    if (e instanceof DailyQuotaError) throw e;
    console.log(`  toplu istek hatası (${(e as Error).message.slice(0, 80)}), bölünüyor...`);
  }
  if (ok) {
    keys.forEach((k, i) => {
      renameSync(items[i].file, mp3(k));
      done(k);
    });
    return;
  }
  for (const it of items) if (existsSync(it.file)) unlinkSync(it.file);
  const mid = Math.ceil(keys.length / 2);
  await batch(keys.slice(0, mid));
  await batch(keys.slice(mid));
}

// --- Çalıştır ----------------------------------------------------------------------------------
const manifestOnly = flag('--manifest-only');
if (manifestOnly) todo.length = 0;
if (todo.length) console.log(`${todo.length} cümle üretilecek (${skipped} zaten güncel)...`);
const jobs: (() => Promise<void>)[] = [];
if (provider === 'gemini') {
  const toned = todo.filter((k) => lines.get(k)!.tone);
  const plain = todo.filter((k) => !lines.get(k)!.tone);
  for (const k of toned) jobs.push(() => single(k));
  for (let i = 0; i < plain.length; i += BATCH) {
    const group = plain.slice(i, i + BATCH);
    jobs.push(() => batch(group));
  }
} else {
  for (const k of todo) jobs.push(() => single(k));
}

async function worker() {
  for (;;) {
    const job = jobs.shift();
    if (!job || stopped) return;
    try {
      await job();
    } catch (e) {
      if (e instanceof DailyQuotaError) {
        if (!stopped) console.log(`\n${e.message} Faturalandırmayı açın ya da yarın yeniden çalıştırın; üretim kaldığı yerden devam eder.`);
        stopped = true;
        return;
      }
      failed.push(['?', '', (e as Error).message]);
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
saveState();
for (const f of readdirSync(OUT)) if (f.endsWith('.part.mp3')) unlinkSync(join(OUT, f));

const left = [...lines.keys()].filter((k) => !existsSync(mp3(k)) || state[k] !== tagOf(k));
const missingFile = [...lines.keys()].filter((k) => !existsSync(mp3(k)));
if ((stopped || left.length) && !(flag('--allow-partial') && missingFile.length === 0)) {
  console.log(`Bu çalıştırmada üretilen: ${generated}. Kalan: ${left.length}. Manifest değiştirilmedi (eski ses kullanılmaya devam ediyor).`);
  for (const [, , msg] of failed.slice(0, 5)) console.log(`  x ${msg}`);
  process.exit(2);
}
if (left.length) console.log(`Uyarı: ${left.length} cümle henüz ${voice} ile üretilmedi; manifest'te eski kayıtları kullanılıyor.`);

// --- Manifest ----------------------------------------------------------------------------------
const entries = [...lines].filter(([k]) => existsSync(mp3(k))).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
const manifest = {
  provider,
  voice,
  ...(provider === 'gemini' ? { models: [...new Set([...(oldManifest.models ?? []), ...usedModels])] } : { rate: RATE, pitch: PITCH }),
  // Ses değişince dosya URL'leri de değişsin (tarayıcı / service worker önbelleği için).
  version: lineKey(`${BASE_TAG}|${entries.map(([k]) => state[k]).join('')}`),
  lines: Object.fromEntries(entries.map(([k, v]) => [k, v.text])) as Record<string, string>,
};
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

// --- Budama ve özet ----------------------------------------------------------------------------
let pruned = 0;
if (prune) {
  for (const f of readdirSync(OUT)) {
    if (f.endsWith('.mp3') && !(f.slice(0, -4) in manifest.lines)) {
      unlinkSync(join(OUT, f));
      delete state[f.slice(0, -4)];
      pruned++;
    }
  }
  saveState();
}
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
    `\nManifest: ${entries.length}/${lines.size} cümle  Klasör: ${files} mp3, ${(bytes / 1024 / 1024).toFixed(2)} MB` +
    (usedModels.size ? `\nKullanılan modeller: ${[...usedModels].join(', ')}` : ''),
);
