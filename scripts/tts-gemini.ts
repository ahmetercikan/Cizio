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

/** Kalemo'nun konuşma tarzı: modelin sesi nasıl okuyacağını tarif eder (metnin kendisi okunmaz). */
export const STYLE =
  'Read the following Turkish sentence aloud in natural, fluent Turkish with perfect Turkish pronunciation. ' +
  'You are Kalemo, a warm, cheerful and patient art teacher talking to a 7-year-old child: smiling, gentle, ' +
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

export async function geminiTts(text: string, file: string, opts: { key: string; model: string; voice: string }): Promise<void> {
  const body = {
    contents: [{ parts: [{ text: `${STYLE}\n\n${text}` }] }],
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
    if (/PerDay/i.test(t))
      throw new DailyQuotaError(
        'Gemini günlük kotası doldu (ücretsiz katman model başına günde ~10 istek). ' +
          'aistudio.google.com üzerinden faturalandırmayı açın ya da yarın yeniden çalıştırın; üretim kaldığı yerden devam eder.',
      );
    const m = t.match(/"retryDelay":\s*"(\d+(?:\.\d+)?)s"/);
    throw new RateLimitError(m ? Number(m[1]) * 1000 + 500 : 30_000, `429 kota: ${t.slice(0, 300)}`);
  }
  if (!r.ok) throw new Error(`Gemini ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const j = (await r.json()) as {
    candidates?: { content?: { parts?: { inlineData?: { data: string; mimeType: string } }[] } }[];
  };
  const part = j.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!part?.inlineData) throw new Error('Gemini ses döndürmedi');
  const rate = Number(part.inlineData.mimeType.match(/rate=(\d+)/)?.[1] ?? 24000);
  const pcm = trimSilence(Buffer.from(part.inlineData.data, 'base64'), rate);
  if (pcm.length < rate * 0.3) throw new Error('Ses çok kısa (boş yanıt?)');
  writeFileSync(file, pcmToMp3(pcm, rate));
}
