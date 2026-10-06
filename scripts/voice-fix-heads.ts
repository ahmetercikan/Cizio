/**
 * Mevcut ses dosyalarının başındaki "çıt"ı kayıpsız temizler; kota harcamaz.
 *
 * Gemini bazı isteklerde sesi sessizlik yerine ani bir sıçramayla başlatıyordu; MP3'te ~45 ms'de tek bir tık
 * olarak duyulur, ardından 200+ ms sessizlik ve konuşma gelir (yeni üretimlerde scripts/tts-gemini.ts
 * skipHeadClick bunu atar). Bu betik tıkı bulur (python .render/headclicks.py → .render/head-clicks.json) ve MP3'ün
 * baştaki çerçevelerini atar: kalan ses bit bit aynıdır, yeniden kodlama yok. Atılan süre tıkın gerisinde,
 * konuşmanın en az 80 ms önünde kalır.
 *
 * Kullanım:  python .render/headclicks.py  ;  npx tsx scripts/voice-fix-heads.ts [--dry]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { lineKey } from '../src/voice/hash';

const OUT = join('public', 'voice');
const dry = process.argv.includes('--dry');
const clicks: Record<string, { click_ms: number; speech_ms: number | null; text: string }> = JSON.parse(readFileSync('.render/head-clicks.json', 'utf8'));
const manifest = JSON.parse(readFileSync(join(OUT, 'manifest.json'), 'utf8'));

const BR2 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
const BR1 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
const SR: Record<number, number[]> = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] };

/** MP3'ün baştaki çerçevelerini, toplam süreleri `dropMs`'yi geçene kadar atar. */
function dropHead(buf: Buffer, dropMs: number): { out: Buffer; ms: number } {
  let pos = 0;
  if (buf.subarray(0, 3).toString('latin1') === 'ID3') pos = 10 + ((buf[6] << 21) | (buf[7] << 14) | (buf[8] << 7) | buf[9]);
  const head = buf.subarray(0, pos);
  let ms = 0;
  while (pos + 4 <= buf.length && ms < dropMs) {
    if (buf[pos] !== 0xff || (buf[pos + 1] & 0xe0) !== 0xe0) throw new Error(`MP3 çerçevesi bekleniyordu (bayt ${pos})`);
    const ver = (buf[pos + 1] >> 3) & 3;
    const br = (ver === 3 ? BR1 : BR2)[buf[pos + 2] >> 4] * 1000;
    const sr = SR[ver][(buf[pos + 2] >> 2) & 3];
    const pad = (buf[pos + 2] >> 1) & 1;
    const spf = ver === 3 ? 1152 : 576;
    pos += Math.floor(((ver === 3 ? 144 : 72) * br) / sr) + pad;
    ms += (spf / sr) * 1000;
  }
  return { out: Buffer.concat([head, buf.subarray(pos)]), ms };
}

const fixed: string[] = [];
for (const [k, c] of Object.entries(clicks)) {
  const file = join(OUT, `${k}.mp3`);
  // Gemini tıkı hep sesin ilk örneğindedir (MP3'te ~45 ms, kodlayıcı gecikmesi). Daha geç bir sıçrama genelde
  // kelimenin kendi patlamalı ünsüzüdür (K, T: "Kalbin", "Tap") — dokunulmaz.
  if (c.click_ms > 60) {
    console.log(`  atlandı (ünsüz patlaması, tık değil): ${k} ${c.text}`);
    continue;
  }
  // Tıkın 40 ms ötesine kadar at (MDCT örtüşmesi); konuşmanın en az 60 ms önünde kal.
  const want = c.click_ms + 40;
  if (c.speech_ms !== null && c.speech_ms - want < 60) {
    console.log(`  atlandı (konuşmaya çok yakın): ${k} ${c.text}`);
    continue;
  }
  const { out, ms } = dropHead(readFileSync(file), want);
  if (!dry) writeFileSync(file, out);
  fixed.push(k);
  console.log(`  ${k} -${Math.round(ms)} ms  ${c.text}`);
}
console.log(`${fixed.length} dosyanın başındaki çıt ${dry ? 'bulundu (--dry: yazılmadı)' : 'temizlendi'}.`);
if (fixed.length && !dry) {
  manifest.version = lineKey(`${manifest.version}|heads|${fixed.join(',')}`);
  writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(`manifest sürümü: ${manifest.version}`);
}
