/**
 * Mevcut ses dosyalarındaki sondaki gürültü patlamalarını (Gemini TTS bozulması) temizler; kota harcamaz.
 * Dosyalar Edge ile çözülür, gürültü scripts/tts-gemini.ts#cutTailArtifact ile bulunur; MP3 yeniden kodlanmaz,
 * çerçeve sınırından kısaltılır (kalan ses bit bit aynı kalır, kalite kaybı olmaz).
 *
 * Kullanım: npx vite --port 5287 (ayrı terminal) ; npx tsx scripts/voice-fix-tails.ts [--dry]
 * Değişen dosya olursa manifest sürümü de değişir (tarayıcı/service worker önbelleği yenilensin diye).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright-core';
import { lineKey } from '../src/voice/hash';
import { cutTailArtifact } from './tts-gemini';

/**
 * MP3'ü ilk `samples` örneği (çözücü çıktısındaki konumla) kapsayacak kadar çerçeveyle kısaltır.
 * Çözücü çıktısı bir çerçeve geriden geldiği (MDCT örtüşmesi) için bir çerçeve fazla tutulur.
 */
function truncateMp3(buf: Buffer, samples: number): Buffer {
  const BR2 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
  const BR1 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
  const SR: Record<number, number[]> = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] };
  let pos = 0;
  if (buf.subarray(0, 3).toString('latin1') === 'ID3') pos = 10 + ((buf[6] << 21) | (buf[7] << 14) | (buf[8] << 7) | buf[9]);
  let decoded = 0;
  let extra = 1;
  while (pos + 4 <= buf.length) {
    if (buf[pos] !== 0xff || (buf[pos + 1] & 0xe0) !== 0xe0) throw new Error(`MP3 çerçevesi bekleniyordu (bayt ${pos})`);
    const ver = (buf[pos + 1] >> 3) & 3;
    const br = (ver === 3 ? BR1 : BR2)[buf[pos + 2] >> 4] * 1000;
    const sr = SR[ver][(buf[pos + 2] >> 2) & 3];
    const pad = (buf[pos + 2] >> 1) & 1;
    const spf = ver === 3 ? 1152 : 576;
    const size = Math.floor(((ver === 3 ? 144 : 72) * br) / sr) + pad;
    pos += size;
    decoded += spf;
    if (decoded >= samples && extra-- <= 0) break;
  }
  return buf.subarray(0, Math.min(pos, buf.length));
}

const BASE = process.env.BASE_URL ?? 'http://localhost:5287/';
const OUT = join('public', 'voice');
const dry = process.argv.includes('--dry');
const manifest = JSON.parse(readFileSync(join(OUT, 'manifest.json'), 'utf8'));
const keys = Object.keys(manifest.lines);

const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
const page = await browser.newPage();
await page.goto(BASE);
const fixed: [string, number][] = [];
for (let i = 0; i < keys.length; i += 40) {
  const group = keys.slice(i, i + 40);
  const pcms: Record<string, string> = await page.evaluate(async (ks: string[]) => {
    const ctx = new OfflineAudioContext(1, 24000, 24000);
    const out: Record<string, string> = {};
    for (const k of ks) {
      const a = await ctx.decodeAudioData(await (await fetch(`voice/${k}.mp3`, { cache: 'no-store' })).arrayBuffer());
      const d = a.getChannelData(0);
      const s = new Int16Array(d.length);
      for (let j = 0; j < d.length; j++) s[j] = Math.max(-32768, Math.min(32767, Math.round(d[j] * 32767)));
      const b = new Uint8Array(s.buffer);
      let bin = '';
      for (let j = 0; j < b.length; j += 0x8000) bin += String.fromCharCode(...b.subarray(j, j + 0x8000));
      out[k] = btoa(bin);
    }
    return out;
  }, group);
  for (const k of group) {
    const { pcm, cutMs } = cutTailArtifact(Buffer.from(pcms[k], 'base64'), 24000);
    if (!cutMs) continue;
    fixed.push([k, cutMs]);
    console.log(`  ${k} -${cutMs} ms  ${manifest.lines[k].slice(0, 70)}`);
    // Sessizliğin 60 ms'sini bırak (boşluk en az 80 ms), sonra MP3'ü o örneği kapsayan çerçevede kes.
    const file = join(OUT, `${k}.mp3`);
    if (!dry) writeFileSync(file, truncateMp3(readFileSync(file), pcm.length / 2 + Math.round(24000 * 0.06)));
  }
}
await browser.close();
console.log(`${keys.length} dosya tarandı, ${fixed.length} dosyada sondaki gürültü ${dry ? 'bulundu (--dry: yazılmadı)' : 'kesildi'}.`);
if (fixed.length && !dry) {
  manifest.version = lineKey(`${manifest.version}|tails|${fixed.map(([k]) => k).join(',')}`);
  writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(`manifest sürümü: ${manifest.version}`);
}
