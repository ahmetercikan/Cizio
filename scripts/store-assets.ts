/**
 * Google Play görsellerini üretir:
 *   store/feature-graphic.png (1024x500), store/icon-512.png,
 *   store/screenshots/phone-*.png (1080x1920), store/screenshots/tablet-*.png (1920x1200)
 * Kullanım: npx vite --port 5287 (ayrı terminal) ; npx tsx scripts/store-assets.ts
 */
import { copyFileSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium, type Page } from 'playwright-core';
import { lessonSketchUrl } from '../src/art/sketch';
import type { Lesson } from '../src/lessons/types';

const BASE = process.env.BASE_URL ?? 'http://localhost:5287/';
const EXE = process.env.BROWSER ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
mkdirSync('store/screenshots', { recursive: true });
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const lessons: Record<string, Lesson> = {};
for (const f of readdirSync('src/lessons/data').filter((f) => f.endsWith('.ts')))
  lessons[f.replace('.ts', '')] = (await import(pathToFileURL(join('src/lessons/data', f)).href)).default;

const browser = await chromium.launch({ executablePath: EXE });

// ---------------------------------------------------------------- öne çıkan görsel
{
  const font = (w: number, sub: string) => pathToFileURL(resolve(`node_modules/@fontsource/montserrat/files/montserrat-${sub}-${w}-normal.woff2`)).href;
  const hand = pathToFileURL(resolve('node_modules/@fontsource/caveat/files/caveat-latin-700-normal.woff2')).href;
  const handExt = pathToFileURL(resolve('node_modules/@fontsource/caveat/files/caveat-latin-ext-700-normal.woff2')).href;
  const card = (id: string, r: number, x: number, y: number, s = 190) =>
    `<div class="card" style="left:${x}px;top:${y}px;width:${s}px;height:${s}px;transform:rotate(${r}deg)"><img src="${lessonSketchUrl(lessons[id], { mode: 'color', paper: true, pad: 24 })}"></div>`;
  const html = `<html><head><style>
    @font-face{font-family:M;font-weight:800;src:url(${font(800, 'latin')})}
    @font-face{font-family:M;font-weight:800;src:url(${font(800, 'latin-ext')});unicode-range:U+0100-024F}
    @font-face{font-family:M;font-weight:600;src:url(${font(600, 'latin')})}
    @font-face{font-family:M;font-weight:600;src:url(${font(600, 'latin-ext')});unicode-range:U+0100-024F}
    @font-face{font-family:H;src:url(${hand})}
    @font-face{font-family:H;src:url(${handExt});unicode-range:U+0100-024F}
    body{margin:0;width:1024px;height:500px;overflow:hidden;font-family:M;color:#fff;
      background:radial-gradient(700px 400px at 90% 110%,rgba(124,60,255,.55),transparent 60%),linear-gradient(160deg,#5436ea,#4629d6 50%,#3620b3);position:relative}
    svg.flow{position:absolute;inset:0}
    .icon{position:absolute;left:64px;top:92px;width:130px;height:130px;border-radius:30px;box-shadow:0 16px 40px rgba(10,4,40,.4)}
    h1{position:absolute;left:64px;top:236px;margin:0;font-size:84px;font-weight:800;letter-spacing:-1px}
    p{position:absolute;left:68px;top:340px;margin:0;font-size:26px;font-weight:600;opacity:.92;width:430px;line-height:1.3}
    .note{position:absolute;left:70px;top:420px;font-family:H;font-size:34px;color:#ffd43b}
    .card{position:absolute;background:#fff;border-radius:16px;padding:10px;box-shadow:0 18px 40px rgba(10,4,40,.45)}
    .card img{width:100%;height:100%;border-radius:10px;display:block}
  </style></head><body>
    <svg class="flow" viewBox="0 0 1024 500" preserveAspectRatio="none"><path d="M 560 -10 C 520 120 640 190 760 170 C 880 150 960 200 1034 260" fill="none" stroke="#fff" stroke-width="3" opacity=".9"/></svg>
    <img class="icon" src="${pathToFileURL(resolve('public/icons/icon-512.png')).href}">
    <h1>Cizio</h1>
    <p>Adım adım çizmeyi öğren. Kâğıtta ya da ekranda!</p>
    <div class="note">Kalemo ile her gün yeni bir çizim ✏️</div>
    ${card('kedi', -8, 560, 150)}${card('ejderha', 5, 740, 60, 210)}${card('yunus', -4, 790, 280, 180)}${card('roket', 9, 620, 330, 150)}
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
const STATE = {
  state: {
    profiles: [{ id: 'p1', name: 'Elif', avatar: 'panda', favoritePath: 'hayvanlar', createdAt: 1 }],
    activeId: 'p1',
    data: {
      p1: {
        lessons: {
          kedi: { bestStars: 3, completions: 2, lastAt: Date.now() - 86400000, bestScaffold: 'trace' },
          balik: { bestStars: 3, completions: 1, lastAt: Date.now() - 2 * 86400000 },
          cizgiler: { bestStars: 2, completions: 1, lastAt: Date.now() - 3 * 86400000 },
          ahtapot: { bestStars: 3, completions: 1, lastAt: Date.now() - 86400000 },
        },
        favorites: ['ejderha', 'yunus', 'kedi', 'dogum-gunu', 'panda'],
        stickers: ['first-lesson', 'lesson:kedi', 'lesson:balik', 'lesson:cizgiler', 'lesson:ahtapot', 'streak-3', 'paper-first', 'challenge-first'],
        newStickers: [],
        days: Object.fromEntries([1, 2, 3].map((d) => {
          const t = new Date(Date.now() - d * 86400000);
          return [`${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`, { lessons: 1, minutes: 8, drawings: 1 }];
        })),
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
  page.on('pageerror', (e) => console.log(tag, 'PAGEERROR', e.message, (e.stack ?? '').split('\n').slice(0, 4).join(' / ')));
  await prepare(page);
  let n = 0;
  const snap = async (name: string) => page.screenshot({ path: `store/screenshots/${tag}-${String(++n).padStart(2, '0')}-${name}.png` });
  const click = (name: RegExp | string) => page.getByRole('button', { name }).first().click({ force: true });

  await page.goto(`${BASE}#/`); await sleep(1800); await snap('oyun-alani');

  // Ders: kalemle çizim ("video")
  await page.goto(`${BASE}#/ders/panda`); await sleep(900);
  if (process.env.DEBUG_SHOT) await page.screenshot({ path: '.render/dbg-lesson.png' });
  await click(/Kâğıtta/); await click(/^Başla/); await sleep(3200); await snap('ders-kalem');
  // Gölgelendirmeye kadar ilerle
  for (let i = 0; i < 12; i++) {
    await click('Adımı atla').catch(() => {});
    await page.locator('.turn-banner').waitFor({ timeout: 8000 });
    if (await page.getByText('Kalemle gölgelendir').count()) break;
    await click(/Çizdim|Bitirdim/); await sleep(300);
  }
  await click(/Çizdim|Bitirdim/); await sleep(5200); await snap('ders-golge');

  // Serbest çizim + boyama kitabı
  await page.goto(`${BASE}#/`); await sleep(300);
  await page.goto(`${BASE}#/ciz`); await sleep(800);
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
  await sleep(500); await snap('boyama');

  await page.goto(`${BASE}#/ogren`); await sleep(1500); await snap('ogrenmek');
  await page.goto(`${BASE}#/meydan/memory/ejderha`); await sleep(1200); await snap('meydan-okuma');
  await page.goto(`${BASE}#/dergi`); await sleep(1500); await snap('dergi');
  await ctx.close();
  console.log(`${tag} ekran görüntüleri hazır`);
}

await shoot('phone', { width: 360, height: 640 }, 3);
await shoot('tablet', { width: 1280, height: 800 }, 1.5);
await browser.close();
