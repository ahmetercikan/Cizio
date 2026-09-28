/**
 * Uçtan uca duman testi: karşılama akışı → kâğıt modunda ders (izle, sıra sende, fotoğraf, kutlama)
 * → ekran modunda ders (çizim, puan, boyama) → oyun alanı / öğrenmek / dergi / serbest / ebeveyn.
 * Yerel Edge/Chrome kullanır (tarayıcı indirmez).
 *   npx vite --port 5287          (ayrı terminalde)
 *   BASE_URL=http://localhost:5287/ npx tsx scripts/e2e.ts [--headed]
 * Ekran görüntüleri: .render/e2e/
 */
import { mkdirSync, rmSync } from 'node:fs';
import { chromium, type Page } from 'playwright-core';
import kedi from '../src/lessons/data/kedi';
import { samplePath } from '../src/engine/pathSampler';

const BASE = process.env.BASE_URL ?? 'http://localhost:5287/';
const OUT = '.render/e2e';
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const executablePath = process.env.BROWSER ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const errors: string[] = [];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let n = 0;
const shot = (page: Page, name: string) => page.screenshot({ path: `${OUT}/${String(++n).padStart(2, '0')}-${name}.png` });

async function drawPath(page: Page, d: string, jitter = 3) {
  const box = (await page.locator('canvas.draw-canvas').boundingBox())!;
  const pts = samplePath(d, 6).points;
  const map = ([x, y]: number[]) => [box.x + (x / 400) * box.width + (Math.random() - 0.5) * jitter, box.y + (y / 400) * box.height + (Math.random() - 0.5) * jitter];
  const [sx, sy] = map(pts[0]);
  await page.mouse.move(sx, sy);
  await page.mouse.down();
  for (const p of pts.slice(1)) {
    const [x, y] = map(p);
    await page.mouse.move(x, y, { steps: 2 });
  }
  await page.mouse.up();
}

async function tapCanvas(page: Page, x: number, y: number) {
  const box = (await page.locator('canvas.draw-canvas').boundingBox())!;
  await page.mouse.click(box.x + (x / 400) * box.width, box.y + (y / 400) * box.height);
}

async function fakePaperPhoto(): Promise<string> {
  const sharp = (await import('sharp')).default;
  const paths = kedi.steps.flatMap((s) => s.shapes).map((s) => `<path d="${s.d}" fill="none" stroke="#3a3a48" stroke-width="5" stroke-linecap="round"/>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200"><rect width="1200" height="1200" fill="#efece6"/><g transform="translate(250,260) scale(1.7) rotate(3)">${paths}</g></svg>`;
  const file = `${OUT}/paper-photo.jpg`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 85 }).toFile(file);
  return file;
}

async function run(viewport: { width: number; height: number }, tag: string, full: boolean) {
  const browser = await chromium.launch({ executablePath, headless: !process.argv.includes('--headed') });
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('console', (m) => m.type() === 'error' && errors.push(`[${tag}] ${m.text()}`));
  page.on('pageerror', (e) => errors.push(`[${tag}] ${e.message}`));
  const click = (name: RegExp | string) => page.getByRole('button', { name }).first().click({ force: true });

  // --- karşılama ---
  await page.goto(BASE);
  await page.getByRole('button', { name: /Başla/ }).waitFor();
  await sleep(1600);
  await shot(page, `${tag}-splash`);
  await click(/Başla/);
  await sleep(1300);
  await click('Hayır');
  await shot(page, `${tag}-adult`);
  await click(/Devam/);
  await sleep(600);
  await shot(page, `${tag}-adult-tip`);
  await click(/Devam/);
  await sleep(500);
  await shot(page, `${tag}-permission`);
  await click(/Evet/);
  await sleep(500);
  await click('Panda');
  await shot(page, `${tag}-avatar`);
  await click(/Devam/);
  await page.getByPlaceholder('Adını yaz').fill('Deniz');
  await shot(page, `${tag}-name`);
  await click(/Devam/);
  await sleep(700);
  await shot(page, `${tag}-pref`);
  for (let i = 0; i < 3; i++) {
    await page.locator('.pref-card').first().click({ force: true });
    await sleep(900);
  }
  await sleep(600);
  await shot(page, `${tag}-showcase`);
  await click(/Devam/);
  await sleep(1200);
  await shot(page, `${tag}-start`);
  await click('Hadi başlayalım');
  await sleep(800);
  await shot(page, `${tag}-lesson-intro`);

  if (full) {
    // --- kâğıt modunda kedi dersi ---
    await page.goto(`${BASE}#/ders/kedi`);
    await sleep(600);
    await click(/Kâğıtta/);
    await click(/^Başla/);
    await sleep(2200);
    await shot(page, `${tag}-paper-watch`);
    await page.locator('.turn-banner').waitFor({ timeout: 15000 });
    await shot(page, `${tag}-paper-turn`);
    // Çizgi adımları + otomatik gölgelendirme adımları: kamera açılana kadar ilerle.
    for (let i = 0; i < 20 && !(await page.locator('.camera').count()); i++) {
      await click('Adımı atla').catch(() => {});
      await page.locator('.turn-banner').waitFor({ timeout: 15000 });
      if (i === 3) await shot(page, `${tag}-paper-step4`);
      if (i === kedi.steps.length) await shot(page, `${tag}-paper-shading`);
      await click(/Çizdim|Bitirdim/);
      await sleep(400);
    }
    await sleep(1200);
    await shot(page, `${tag}-camera`);
    await page.locator('.camera input[type=file]').setInputFiles(await fakePaperPhoto());
    await sleep(1500);
    await click(/İyi oldu/);
    await shot(page, `${tag}-review`);
    await click(/Kaydet/);
    await sleep(1800);
    await shot(page, `${tag}-celebrate`);

    // --- ekran modunda ---
    await page.goto(`${BASE}#/`);
    await sleep(300);
    await page.goto(`${BASE}#/ders/kedi`);
    await sleep(600);
    await click(/Ekranda/);
    await click(/^Başla/);
    await sleep(1500);
    await shot(page, `${tag}-screen-watch`);
    for (let i = 0; i < kedi.steps.length; i++) {
      await click('Adımı atla').catch(() => {});
      await page.locator('.turn-banner').waitFor({ timeout: 15000 });
      if (i === 0) await shot(page, `${tag}-screen-turn`);
      const shapes = i === 1 ? kedi.steps[i].shapes.slice(0, 1) : kedi.steps[i].shapes;
      for (const s of shapes) await drawPath(page, s.d);
      await click(/^Bitti/);
      await sleep(500);
      if (i === 1) {
        await shot(page, `${tag}-screen-feedback-partial`);
        console.log(`[${tag}] kısmi geri bildirim: ${await page.locator('.feedback-card__body p').innerText()}`);
        await click(/Tekrar/);
        for (const s of kedi.steps[i].shapes) await drawPath(page, s.d);
        await click(/^Bitti/);
        await sleep(400);
      }
      if (i === 2) await shot(page, `${tag}-screen-feedback-good`);
      await click(/^Devam/);
      await sleep(300);
    }
    await sleep(800);
    await tapCanvas(page, 200, 300);
    await sleep(300);
    await shot(page, `${tag}-coloring`);
    await click(/Resmim hazır/);
    await sleep(1600);
    await shot(page, `${tag}-screen-celebrate`);

    // --- diğer ekranlar ---
    for (const [route, name] of [['', 'playground'], ['ogren', 'learn'], ['yol/hayvanlar', 'course'], ['dergi', 'journal'], ['ciz', 'freedraw'], ['ebeveyn', 'gate']] as const) {
      await page.goto(`${BASE}#/${route}`);
      await sleep(1400);
      await shot(page, `${tag}-${name}`);
    }
    await page.goto(`${BASE}#/`);
    await sleep(800);
    await page.screenshot({ path: `${OUT}/${tag}-playground-full.png`, fullPage: true });
  }
  await browser.close();
}

await run({ width: 1180, height: 820 }, 'tablet', true);
await run({ width: 390, height: 844 }, 'phone', false);
console.log(errors.length ? `HATALAR:\n${errors.join('\n')}` : 'Konsol hatası yok');
