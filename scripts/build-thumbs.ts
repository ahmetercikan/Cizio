/**
 * Ders eskizlerini önceden resme çevirir (performans).
 *
 * Kartlardaki kalem eskizleri ağır SVG filtreleriyle (titreşim, grafit tanesi, tarama, maskeler) çiziliyordu.
 * Tarayıcı bunları her açılışta ana iş parçacığında resme dönüştürdüğü için düşük donanımlı telefonlarda sayfa
 * geçişleri saniyelerce donuyordu. Bu betik her ders için iki şeffaf WebP üretir (kalem ve renkli; kâğıtsız,
 * kenar boşluğusuz) ve bir kez kâğıt dokusunu. Uygulama (src/components/Sketch.tsx) bunları kâğıt ve kenar
 * boşluğuyla bir tuvalde birleştirir — filtre yok, kilitlenme yok.
 *
 * Kullanım: npx tsx scripts/build-thumbs.ts [dersId...]     (ders değişince yeniden çalıştırın; test hatırlatır)
 * Çıktı: public/thumbs/<id>-graphite.webp, <id>-color.webp, paper.webp ve src/art/thumbs.json (ders özetleri)
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';
import { lessonShapes, sketchSvg } from '../src/art/sketch';
import { lessonThumbHash, THUMB_SIZE } from '../src/art/thumbs';
import type { Lesson } from '../src/lessons/types';

const OUT = join('public', 'thumbs');
const INDEX = join('src', 'art', 'thumbs.json');
mkdirSync(OUT, { recursive: true });

const lessons: Lesson[] = [];
for (const f of readdirSync('src/lessons/data').filter((f) => f.endsWith('.ts')).sort()) {
  lessons.push((await import(pathToFileURL(join('src', 'lessons', 'data', f)).href)).default);
}
const only = new Set(process.argv.slice(2));
const index: Record<string, string> = existsSync(INDEX) ? JSON.parse(readFileSync(INDEX, 'utf8')) : {};

const browser = await chromium.launch({ executablePath: process.env.BROWSER ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
const page = await browser.newPage();
await page.setContent('<html><body></body></html>');

/** SVG metnini tarayıcıda S×S tuvale çizip WebP olarak döner. */
async function rasterize(svg: string, quality = 0.72, size = THUMB_SIZE): Promise<Buffer> {
  const b64 = await page.evaluate(
    async ({ svg, size, quality }) => {
      const img = new Image();
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      await img.decode();
      const c = document.createElement('canvas');
      c.width = c.height = size;
      c.getContext('2d')!.drawImage(img, 0, 0, size, size);
      const blob: Blob = await new Promise((r) => c.toBlob((b) => r(b!), 'image/webp', quality));
      const buf = new Uint8Array(await blob.arrayBuffer());
      let s = '';
      for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
      return btoa(s);
    },
    { svg, size, quality },
  );
  return Buffer.from(b64, 'base64');
}

// Kâğıt dokusu (bir kez)
if (!only.size || !existsSync(join(OUT, 'paper.webp'))) {
  writeFileSync(join(OUT, 'paper.webp'), await rasterize(sketchSvg([], { paper: true }), 0.8));
}

let made = 0;
let bytes = 0;
for (const l of lessons) {
  if (only.size && !only.has(l.id)) continue;
  for (const mode of ['graphite', 'color'] as const) {
    // Renkli dolgulardaki kuru boya tanesi zor sıkışır; renkli sürüm daha az ve küçük yerde kullanılır.
    const buf = await rasterize(sketchSvg(lessonShapes(l), { mode, paper: false, pad: 0, seed: 7 }), mode === 'color' ? 0.62 : 0.72, mode === 'color' ? 400 : THUMB_SIZE);
    writeFileSync(join(OUT, `${l.id}-${mode}.webp`), buf);
    bytes += buf.length;
    made++;
  }
  index[l.id] = lessonThumbHash(l);
}
// Silinmiş dersleri dizinden çıkar
for (const id of Object.keys(index)) if (!lessons.some((l) => l.id === id)) delete index[id];
writeFileSync(INDEX, JSON.stringify(Object.fromEntries(Object.entries(index).sort()), null, 1) + '\n');
await browser.close();
console.log(`${made} resim üretildi (${(bytes / 1024 / 1024).toFixed(2)} MB), dizin: ${INDEX}`);
