/**
 * Google Play görsellerini üretir:
 *   store/feature-graphic.png (1024x500), store/icon-512.png,
 *   store/screenshots/phone-*.png (1080x1920), store/screenshots/tablet-*.png (1920x1200) — en çok 8'er tane
 * Kullanım: npx vite --port 5287 (ayrı terminal) ; npx tsx scripts/store-assets.ts
 */
import { copyFileSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium, type Page } from 'playwright-core';
import { lessonSketchUrl } from '../src/art/sketch';
import { PRESETS } from '../src/dressup/catalog';
import { addDays, weekKey, weekStart } from '../src/lib/util';
import type { Lesson } from '../src/lessons/types';

const BASE = process.env.BASE_URL ?? 'http://localhost:5287/';
const EXE = process.env.BROWSER ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
// Eski ekran görüntüleri silinir (adlar ve sıra değişebilir).
rmSync('store/screenshots', { recursive: true, force: true });
mkdirSync('store/screenshots', { recursive: true });
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const lessons: Record<string, Lesson> = {};
for (const f of readdirSync('src/lessons/data').filter((f) => f.endsWith('.ts')))
  lessons[f.replace('.ts', '')] = (await import(pathToFileURL(join('src/lessons/data', f)).href)).default;

const browser = await chromium.launch({ executablePath: EXE });

// ---------------------------------------------------------------- öne çıkan görsel
{
  // Fredoka'nın Google sürümünde ş/ğ/İ yok: uygulamadaki yamalı dosyalar kullanılır (scripts/patch-fredoka.py).
  const font = (w: number) => pathToFileURL(resolve(`src/assets/fonts/fredoka-tr-${w}.woff2`)).href;
  const hand = pathToFileURL(resolve('node_modules/@fontsource/caveat/files/caveat-latin-700-normal.woff2')).href;
  const handExt = pathToFileURL(resolve('node_modules/@fontsource/caveat/files/caveat-latin-ext-700-normal.woff2')).href;
  const card = (id: string, r: number, x: number, y: number, s = 190) =>
    `<div class="card" style="left:${x}px;top:${y}px;width:${s}px;height:${s}px;transform:rotate(${r}deg)"><img src="${lessonSketchUrl(lessons[id], { mode: 'color', paper: true, pad: 24 })}"></div>`;
  const html = `<html><head><style>
    @font-face{font-family:M;font-weight:800;src:url(${font(700)})}
    @font-face{font-family:M;font-weight:600;src:url(${font(600)})}
    @font-face{font-family:H;src:url(${hand})}
    @font-face{font-family:H;src:url(${handExt});unicode-range:U+0100-024F}
    body{margin:0;width:1024px;height:500px;overflow:hidden;font-family:M;color:#3a2b27;
      background:radial-gradient(420px 300px at 8% 0%,rgba(255,200,61,.35),transparent 70%),radial-gradient(500px 360px at 100% 100%,rgba(20,168,154,.22),transparent 70%),#cfeee6;position:relative}
    svg.flow{position:absolute;inset:0}
    .icon{position:absolute;left:64px;top:92px;width:130px;height:130px;border-radius:30px;box-shadow:0 14px 30px rgba(222,77,45,.35)}
    h1{position:absolute;left:64px;top:232px;margin:0;font-size:88px;font-weight:800;color:#ff6b4a;text-shadow:0 5px 0 #ffe1d8}
    p{position:absolute;left:68px;top:340px;margin:0;font-size:26px;font-weight:600;color:#5b463f;width:560px;line-height:1.3}
    .note{position:absolute;left:70px;top:420px;font-family:H;font-size:34px;color:#0d8074}
    .card{position:absolute;background:#fff;border-radius:16px;padding:10px;box-shadow:0 16px 34px rgba(122,72,40,.28)}
    .card img{width:100%;height:100%;border-radius:10px;display:block}
  </style></head><body>
    <svg class="flow" viewBox="0 0 1024 500"><path d="M720,40 C780,20 850,60 860,120 C872,190 810,230 750,220 C680,208 640,160 650,100 C656,68 680,50 720,40 Z" fill="rgba(255,107,74,.16)"/></svg>
    <img class="icon" src="${pathToFileURL(resolve('public/icons/icon-512.png')).href}">
    <h1>Çizio</h1>
    <p>Adım adım çiz, karakterini giydir,<br>oynayarak İngilizce öğren!</p>
    <div class="note">Çizio ile her gün yeni bir macera</div>
    ${card('kedi', -8, 560, 150)}${card('kepce', 5, 740, 60, 210)}${card('yunus', -4, 790, 280, 180)}${card('roket', 9, 620, 330, 150)}
  </body></html>`;
  writeFileSync('.render/feature.html', html);
  const p = await browser.newPage({ viewport: { width: 1024, height: 500 } });
  await p.goto(pathToFileURL(resolve('.render/feature.html')).href);
  await sleep(800);
  await p.screenshot({ path: 'store/feature-graphic.png' });
  await p.close();
  copyFileSync('public/icons/icon-512.png', 'store/icon-512.png');
  console.log('öne çıkan görsel hazır');
}

// ---------------------------------------------------------------- ekran görüntüleri
const dk = (d = 0) => {
  const t = new Date(Date.now() - d * 86400000);
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
};
const STATE = {
  state: {
    profiles: [{ id: 'p1', name: 'Alya Zeynep', avatar: 'panda', favoritePath: 'hayvanlar', createdAt: 1 }],
    activeId: 'p1',
    data: {
      p1: {
        // Günün hediyesi bugün alınmış: açılış penceresi ekran görüntülerini kapatmasın.
        gift: { last: dk(), streak: 3 },
        // Geçen haftanın ligi hesaplanmış: açılışta lig sandığı penceresi çıkmasın.
        leagues: { [weekKey(addDays(weekStart(), -1))]: 2 },
        xp: 46,
        wallet: 24,
        doll: PRESETS[0],
        styled: [dk(1)],
        english: {
          age: 'junior',
          words: Object.fromEntries(['colors.red', 'colors.blue', 'colors.yellow', 'animals.cat', 'animals.dog', 'animals.lion'].map((id) => [id, { seen: 3, got: 2 }])),
          sessions: [dk(1), dk(2), dk(3)],
          stories: ['hide'],
          stars: {},
        },
        lessons: {
          kedi: { bestStars: 3, completions: 2, lastAt: Date.now() - 86400000, bestScaffold: 'trace' },
          balik: { bestStars: 3, completions: 1, lastAt: Date.now() - 2 * 86400000 },
          cizgiler: { bestStars: 2, completions: 1, lastAt: Date.now() - 3 * 86400000 },
          ahtapot: { bestStars: 3, completions: 1, lastAt: Date.now() - 86400000 },
        },
        favorites: ['ejderha', 'yunus', 'kedi', 'dogum-gunu', 'panda'],
        stickers: ['first-lesson', 'lesson:kedi', 'lesson:balik', 'lesson:cizgiler', 'lesson:ahtapot', 'streak-3', 'paper-first', 'challenge-first'],
        newStickers: [],
        days: Object.fromEntries([1, 2, 3].map((d) => [dk(d), { lessons: 1, minutes: 8, drawings: 1, stars: 8 }])),
        paperCount: 1,
        freeCount: 0,
      },
    },
    settings: { narration: false, rate: 0.95, sfx: false, palmRejection: true, leftHanded: false, naturalVoice: true, speed: 1, defaultMode: 'paper' },
  },
  version: 2,
};

async function prepare(page: Page) {
  await page.goto(`${BASE}#/hosgeldin`);
  const arts = ['kedi', 'balik', 'ahtapot', 'cizgiler'].map((id) => ({ id, url: lessonSketchUrl(lessons[id], { mode: 'color', paper: true, pad: 20 }) }));
  await page.evaluate(async ({ state, arts }) => {
    localStorage.clear();
    localStorage.setItem('cizio-v1', JSON.stringify(state));
    localStorage.setItem('cizio-db-migrated', '1');
    const toPng = (url: string) =>
      new Promise<Blob>((res) => {
        const img = new Image();
        img.onload = () => {
          const c = document.createElement('canvas');
          c.width = c.height = 600;
          c.getContext('2d')!.drawImage(img, 0, 0, 600, 600);
          c.toBlob((b) => res(b!), 'image/png');
        };
        img.src = url;
      });
    const blobs = await Promise.all(arts.map((a) => toPng(a.url)));
    await new Promise<void>((res) => {
      const r = indexedDB.open('cizio-db');
      r.onupgradeneeded = () => r.result.createObjectStore('art');
      r.onsuccess = () => {
        const tx = r.result.transaction('art', 'readwrite');
        arts.forEach((a, i) => tx.objectStore('art').put({ id: `s${i}`, profileId: 'p1', lessonId: a.id, kind: 'screen', stars: 3, createdAt: Date.now() - i * 3600000, blob: blobs[i] }, `s${i}`));
        tx.oncomplete = () => { r.result.close(); res(); };
      };
    });
  }, { state: STATE, arts });
  await page.goto('about:blank');
}

async function shoot(tag: string, viewport: { width: number; height: number }, scale: number) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: scale });
  // tsx/esbuild, tarayıcıya gönderilen fonksiyonlara __name yardımcısını ekler.
  await ctx.addInitScript({ content: 'window.__name = (f) => f;' });
  const page = await ctx.newPage();
  page.on('console', (m) => m.type() === 'error' && !/React Router Future/.test(m.text()) && console.log(tag, 'CONSOLE', m.text().slice(0, 1500)));
  page.on('pageerror', (e) => console.log(tag, 'PAGEERROR', e.message, (e.stack ?? '').split('\n').slice(0, 4).join(' / ')));
  await prepare(page);
  let n = 0;
  const snap = async (name: string) => page.screenshot({ path: `store/screenshots/${tag}-${String(++n).padStart(2, '0')}-${name}.png` });
  const click = (name: RegExp | string) => page.getByRole('button', { name }).first().click({ force: true });

  // 1) Açılış: üç dünya  2) Çizim Atölyesi ana sayfası
  await page.goto(`${BASE}#/`); await sleep(1800); await snap('dunyalar');
  await page.goto(`${BASE}#/atolye`); await sleep(1800); await snap('bugun');

  // 3) Ders: kalemle çizim ("video") — iş makineleri yolundan
  await page.goto(`${BASE}#/ders/kepce`); await sleep(900);
  if (process.env.DEBUG_SHOT) await page.screenshot({ path: '.render/dbg-lesson.png' });
  await click(/Kâğıtta/); await click(/^Başla/); await sleep(1500);
  // Birkaç adım ilerle: kalem kepçenin kolunu çizerken çekilsin (ilk adım yalnızca palet)
  for (let i = 0; i < 4; i++) {
    await click('Adımı atla').catch(() => {});
    await page.locator('.turn-banner').waitFor({ timeout: 8000 });
    await click(/Çizdim|Bitirdim/); await sleep(300);
  }
  await sleep(2600); await snap('ders-kalem');

  // 4) Serbest çizim + boyama kitabı
  await page.goto(`${BASE}#/atolye`); await sleep(300);
  await page.goto(`${BASE}#/ciz`); await sleep(800);
  if (process.env.DEBUG_SHOT) await page.screenshot({ path: '.render/dbg-ciz.png' });
  await click(/Boyama kitabı/); await sleep(400);
  await page.getByRole('button', { name: 'Tombul Panda' }).click(); await sleep(600);
  const box = (await page.locator('canvas.draw-canvas').boundingBox())!;
  const tap = (x: number, y: number) => page.mouse.click(box.x + (x / 400) * box.width, box.y + (y / 400) * box.height);
  const color = (c: string) => page.getByRole('radio', { name: `Renk ${c}` }).click();
  await color('#c77dff'); await tap(200, 145);
  await color('#ffc2d4'); await tap(200, 290);
  await color('#2f7bff'); await tap(145, 150); await tap(255, 150);
  await page.locator('.capsule__group').nth(2).locator('.capsule__btn').click();
  if (!(await page.locator('.flyout').count())) await page.locator('.capsule__group').nth(2).locator('.capsule__btn').click();
  await page.getByRole('menuitemradio', { name: 'Puantiyeli' }).click();
  await color('#ff7eb6'); await tap(130, 272); await tap(270, 272);
  await sleep(500); await snap('atolye-boyama');

  // 5) İş makineleri yolu  6–7) English Club  8) Giydirme Stüdyosu
  await page.goto(`${BASE}#/yol/ismakineleri`); await sleep(1500); await snap('is-makineleri');
  await page.goto(`${BASE}#/english`); await sleep(1500); await snap('english-club');
  await page.goto(`${BASE}#/english/hikaye/hide`); await sleep(1500);
  await page.getByRole('button', { name: 'Sonraki sayfa' }).click({ force: true }); await sleep(1200);
  await page.locator('.en-scene .en-tap').last().click({ force: true }); await sleep(1600); await snap('english-hikaye');
  await page.goto(`${BASE}#/giydir`); await sleep(1500); await snap('giydir');
  await ctx.close();
  console.log(`${tag} ekran görüntüleri hazır`);
}

await shoot('phone', { width: 360, height: 640 }, 3);
await shoot('tablet', { width: 1280, height: 800 }, 1.5);
await browser.close();
