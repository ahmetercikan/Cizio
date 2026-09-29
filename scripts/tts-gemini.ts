/**
 * Google Gemini TTS ile tek bir cümleyi MP3'e çevirir (yalnızca geliştirme sırasında kullanılır).
 *
 * API anahtarı .env.local dosyasındaki GEMINI_API_KEY'den (ya da ortam değişkeninden) okunur.
 * Anahtar depoya ya da uygulamaya girmez: .env.local git'te yok sayılır, Vite yalnızca VITE_ önekli
 * değişkenleri istemciye verir.
 */
import { Mp3Encoder } from '@breezystack/lamejs';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

export const GEMINI_VOICES = ['Sulafat', 'Achernar', 'Leda', 'Laomedeia', 'Despina', 'Aoede', 'Autonoe', 'Kore'];

/**
 * Kayıt etiketinde kullanılan üslup kimliği. Yalnızca okuma tarzı gerçekten değişince güncelleyin:
 * değişirse tüm cümleler yeniden üretilir. (Maskotun adı değişti ama okuma tarzı aynı kaldı.)
 */
export const STYLE_ID = 'sicak-ogretmen-v1';

/** Çizio'nun konuşma tarzı: modelin sesi nasıl okuyacağını tarif eder (metnin kendisi okunmaz). */
export const STYLE =
  'Read the following Turkish sentence aloud in natural, fluent Turkish with perfect Turkish pronunciation. ' +
  'You are Çizio, a warm, cheerful and patient art teacher talking to a 7-year-old child: smiling, gentle, ' +
  'lively and encouraging intonation, relaxed medium pace, clear articulation. Say only the sentence, nothing else.';

const API = 'https://generativelanguage.googleapis.com/v1beta';

export function apiKey(): string {
  let key = process.env.GEMINI_API_KEY;
  if (!key && existsSync('.env.local')) {
    const m = readFileSync('.env.local', 'utf8').match(/^\s*GEMINI_API_KEY\s*=\s*"?([^"\r\n]+)"?/m);
    key = m?.[1]?.trim();
  }
  if (!key) throw new Error('GEMINI_API_KEY bulunamadı. Proje kökündeki .env.local dosyasına GEMINI_API_KEY=... yazın.');
  return key;
}

/** Hesapta kullanılabilen TTS modelleri (en yenisi önce). */
export async function ttsModels(key: string): Promise<string[]> {
  const r = await fetch(`${API}/models?pageSize=1000`, { headers: { 'x-goog-api-key': key } });
  if (!r.ok) throw new Error(`Model listesi alınamadı: ${r.status} ${(await r.text()).slice(0, 200)}`);
  const j = (await r.json()) as { models: { name: string; supportedGenerationMethods?: string[] }[] };
  const names = j.models.map((m) => m.name.replace('models/', '')).filter((n) => /tts/i.test(n));
  // Pro < Flash tercih: flash hızlı ve ucuz; "preview" olmayanlar önce.
  const score = (n: string) => (n.includes('flash') ? 0 : 1) + (n.includes('preview') ? 0.5 : 0);
  return names.sort((a, b) => score(a) - score(b) || b.localeCompare(a));
}

/** Günlük kota bitti: beklemek anlamsız (ücretsiz katmanda model başına günde ~10 istek). */
export class DailyQuotaError extends Error {}

export class RateLimitError extends Error {
  constructor(public retryAfterMs: number, msg: string) {
    super(msg);
  }
}

/** 16 bit mono PCM → MP3 (varsayılan 24 kHz, 64 kbps). */
export function pcmToMp3(pcm: Buffer, sampleRate = 24000, kbps = 64): Buffer {
  const samples = new Int16Array(pcm.buffer, pcm.byteOffset, Math.floor(pcm.length / 2));
  const enc = new Mp3Encoder(1, sampleRate, kbps);
  const chunks: Uint8Array[] = [];
  for (let i = 0; i < samples.length; i += 1152) {
    const out = enc.encodeBuffer(samples.subarray(i, i + 1152));
    if (out.length) chunks.push(out);
  }
  const end = enc.flush();
  if (end.length) chunks.push(end);
  return Buffer.concat(chunks.map((c) => Buffer.from(c)));
}

/** Baştaki/sondaki sessizliği kırpar (Gemini bazen uzun boşluk bırakır), 120 ms pay bırakır. */
function trimSilence(pcm: Buffer, sampleRate = 24000): Buffer {
  const s = new Int16Array(pcm.buffer, pcm.byteOffset, Math.floor(pcm.length / 2));
  const thr = 500;
  let a = 0, b = s.length - 1;
  while (a < s.length && Math.abs(s[a]) < thr) a++;
  while (b > a && Math.abs(s[b]) < thr) b--;
  const pad = Math.round(sampleRate * 0.12);
  a = Math.max(0, a - pad);
  b = Math.min(s.length - 1, b + pad);
  return Buffer.from(s.slice(a, b + 1).buffer);
}

/** Ham istek: metni (talimatla birlikte) sese çevirir, 16 bit PCM döner. */
async function requestPcm(prompt: string, opts: { key: string; model: string; voice: string }): Promise<{ pcm: Buffer; rate: number }> {
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: opts.voice } } },
    },
  };
  const r = await fetch(`${API}/models/${opts.model}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': opts.key },
    body: JSON.stringify(body),
  });
  if (r.status === 429) {
    const t = await r.text();
    if (/PerDay/i.test(t)) throw new DailyQuotaError(`${opts.model}: günlük kota doldu`);
    const m = t.match(/"retryDelay":s*"(d+(?:.d+)?)s"/);
    throw new RateLimitError(m ? Number(m[1]) * 1000 + 500 : 30_000, `429 kota: ${t.slice(0, 200)}`);
  }
  if (!r.ok) throw new Error(`Gemini ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const j = (await r.json()) as { candidates?: { content?: { parts?: { inlineData?: { data: string; mimeType: string } }[] } }[] };
  const part = j.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!part?.inlineData) throw new Error('Gemini ses döndürmedi');
  const rate = Number(part.inlineData.mimeType.match(/rate=(d+)/)?.[1] ?? 24000);
  return { pcm: Buffer.from(part.inlineData.data, 'base64'), rate };
}

/**
 * Sesi en uzun n-1 sessizlikten keserek n parçaya böler (toplu üretim için).
 * Parça süreleri metin uzunluklarıyla orantılı değilse null döner.
 */
export function splitBySilence(pcm: Buffer, rate: number, texts: string[]): Buffer[] | null {
  const s = new Int16Array(pcm.buffer, pcm.byteOffset, Math.floor(pcm.length / 2));
  const frame = Math.round(rate * 0.02);
  const quiet: boolean[] = [];
  for (let i = 0; i < s.length; i += frame) {
    let peak = 0;
    for (let k = i; k < Math.min(s.length, i + frame); k++) peak = Math.max(peak, Math.abs(s[k]));
    quiet.push(peak < 700);
  }
  // Konuşmanın başı ve sonu
  let first = quiet.findIndex((q) => !q), last = quiet.length - 1 - [...quiet].reverse().findIndex((q) => !q);
  if (first < 0) return null;
  const runs: { a: number; b: number }[] = [];
  for (let i = first; i <= last; i++) {
    if (!quiet[i]) continue;
    let j = i;
    while (j + 1 <= last && quiet[j + 1]) j++;
    runs.push({ a: i, b: j });
    i = j;
  }
  const n = texts.length;
  const cuts = runs.sort((x, y) => y.b - y.a - (x.b - x.a)).slice(0, n - 1);
  if (cuts.length < n - 1) return null;
  // En kısa kesim, cümle içi duraklamalardan belirgin uzun olmalı (>= 0.7 sn)
  if (n > 1 && Math.min(...cuts.map((c) => c.b - c.a + 1)) * 0.02 < 0.7) return null;
  const bounds = cuts.map((c) => Math.round(((c.a + c.b) / 2) * frame)).sort((a, b) => a - b);
  const pieces: Buffer[] = [];
  let prev = first * frame;
  for (const bnd of [...bounds, (last + 1) * frame]) {
    pieces.push(Buffer.from(s.slice(prev, bnd).buffer));
    prev = bnd;
  }
  // Süre / karakter oranı kontrolü
  const dur = pieces.map((p) => p.length / 2 / rate);
  const perChar = dur.map((d, i) => d / Math.max(4, texts[i].length));
  const avg = perChar.reduce((a, b) => a + b, 0) / perChar.length;
  if (perChar.some((x) => x < avg * 0.4 || x > avg * 2.4)) return null;
  return pieces;
}

export const BATCH_RULES =
  'Read each of the following Turkish sentences in order, exactly as written. After EACH sentence stay completely silent ' +
  'for two full seconds before the next one. Do not read the separators, do not add, skip or repeat anything.';

/** Birden çok cümleyi tek istekte üretir ve dosyalara böler. Bölme tutmazsa false döner. */
export async function geminiTtsBatch(
  items: { text: string; file: string }[],
  opts: { key: string; model: string; voice: string },
): Promise<boolean> {
  const style = STYLE.replace('the following Turkish sentence', 'Turkish sentences').replace('Say only the sentence, nothing else.', '');
  const prompt = `${style}\n${BATCH_RULES}\n\n${items.map((it) => it.text).join('\n\n—\n\n')}`;
  const { pcm, rate } = await requestPcm(prompt, opts);
  const pieces = splitBySilence(pcm, rate, items.map((i) => i.text));
  if (!pieces) return false;
  pieces.forEach((p, i) => writeFileSync(items[i].file, pcmToMp3(trimSilence(p, rate), rate)));
  return true;
}

/**
 * Tek cümle üretir. `tone` verilirse o cümleye özel okuma tarzı eklenir
 * (ör. "düşünceli bir 'hımm' ile başla, yavaş ve meraklı sor").
 */
export async function geminiTts(
  text: string,
  file: string,
  opts: { key: string; model: string; voice: string; tone?: string },
): Promise<void> {
  const prompt = `${STYLE}${opts.tone ? ` For this sentence specifically: ${opts.tone}` : ''}

${text}`;
  const { pcm, rate } = await requestPcm(prompt, opts);
  const trimmed = trimSilence(pcm, rate);
  if (trimmed.length < rate * 0.3) throw new Error('Ses çok kısa (boş yanıt?)');
  writeFileSync(file, pcmToMp3(trimmed, rate));
}
