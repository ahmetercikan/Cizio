/**
 * Kalemo'nun doğal sesini önceden üretir: her sabit anlatım cümlesi için Microsoft Edge nöral sesiyle bir MP3.
 *
 * Kullanım: npx tsx scripts/generate-voice.ts [--prune] [--voice tr-TR-EmelNeural] [--force]
 *   (ya da: npm run voice -- --prune)
 * Gereksinim: python -m pip install edge-tts
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

const RATE = '-6%';
const PITCH = '+3Hz';
const CONCURRENCY = 4;
const RETRIES = 3;
const TIMEOUT_MS = 60_000;
const OUT = join('public', 'voice');
const MANIFEST = join(OUT, 'manifest.json');

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(name);
const opt = (name: string) => {
  const i = args.findIndex((a) => a === name || a.startsWith(`${name}=`));
  if (i < 0) return undefined;
  return args[i].includes('=') ? args[i].slice(args[i].indexOf('=') + 1) : args[i + 1];
};
const voice = opt('--voice') ?? 'tr-TR-EmelNeural';
const prune = flag('--prune');
let force = flag('--force');

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
console.log(`${lessons.length} ders, ${parts.length} parça adı -> ${lines.size} benzersiz cümle. Ses: ${voice}`);

// --- Önceki manifest ---------------------------------------------------------------------------
mkdirSync(OUT, { recursive: true });
if (existsSync(MANIFEST)) {
  try {
    const old = JSON.parse(readFileSync(MANIFEST, 'utf8')) as { voice?: string; rate?: string; pitch?: string };
    if (old.voice !== voice || (old.rate ?? RATE) !== RATE || (old.pitch ?? PITCH) !== PITCH) {
      console.log(`Ses ayarları değişti (${old.voice} -> ${voice}); tüm dosyalar yeniden üretilecek.`);
      force = true;
    }
  } catch {
    /* bozuk manifest: yok say */
  }
}

// --- Üretim ------------------------------------------------------------------------------------
const mp3 = (key: string) => join(OUT, `${key}.mp3`);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function tts(text: string, file: string): Promise<void> {
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
  for (let attempt = 1; ; attempt++) {
    try {
      await tts(text, tmp);
      renameSync(tmp, mp3(key));
      return;
    } catch (e) {
      if (existsSync(tmp)) unlinkSync(tmp);
      if (attempt >= RETRIES) throw e;
      await sleep(1000 * 2 ** (attempt - 1));
    }
  }
}

const todo = [...lines].filter(([key]) => force || !existsSync(mp3(key)));
const skipped = lines.size - todo.length;
const failed: [string, string, string][] = [];
let generated = 0;
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
      failed.push([key, text, (e as Error).message]);
    }
    done++;
    if (done % 25 === 0) console.log(`  ${done} işlendi...`);
  }
}
if (todo.length) console.log(`${todo.length} dosya üretilecek (${skipped} zaten var)...`);
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

// --- Manifest ----------------------------------------------------------------------------------
const entries = [...lines].filter(([key]) => existsSync(mp3(key))).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
const manifest = {
  voice,
  rate: RATE,
  pitch: PITCH,
  // Ses ayarları değişince dosya URL'leri de değişsin (tarayıcı / service worker önbelleği için).
  version: lineKey(`${voice}|${RATE}|${PITCH}`),
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
