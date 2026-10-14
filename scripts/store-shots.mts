/**
 * Mağaza ekran görüntüleri (Çizio Adası): geliştirme sunucusu açıkken (npx vite --port 5288) çalıştırılır.
 *   npx tsx scripts/store-shots.mts phone|tablet|iphone|ipad
 * phone/tablet: Google Play (1080×1920, 1920×1200); iphone: App Store 6,9" (1290×2796); ipad: App Store 13" (2064×2752).
 * Tarayıcı: CHROME_PATH ortam değişkeni ya da işletim sistemine göre Chrome/Edge.
 * Çıktı: store/screenshots/<tür>/
 */
import { chromium } from 'playwright-core';
import { mkdirSync, existsSync } from 'node:fs';
const kind = process.argv[2] ?? 'phone';
const SIZES: Record<string, [number, number, number]> = { phone: [360, 640, 3], tablet: [960, 600, 2], iphone: [430, 932, 3], ipad: [1032, 1376, 2] };
const [VW, VH, DSF] = SIZES[kind];
const mobile = kind === 'phone' || kind === 'iphone';
const OUT = `store/screenshots/${kind === 'phone' || kind === 'tablet' ? 'yeni' : kind}`;
mkdirSync(OUT, { recursive: true });
const CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
].filter(Boolean) as string[];
const exe = CANDIDATES.find((p) => existsSync(p));
if (!exe) throw new Error('Chrome/Edge bulunamadı: CHROME_PATH verin.');
const b = await chromium.launch({ executablePath: exe, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await (await b.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: DSF, isMobile: mobile, hasTouch: true })).newPage();
await p.addInitScript(() => { (window as any).__name = (f: unknown) => f; });
const doll = { gender: 'kiz', name: 'Alya', skin: '#f6c9a0', hair: 'atkuyrugu', hairColor: '#5a3420', face: 'mutlu', freckles: true, glasses: '', top: 'yildizli', topColor: '#ff8fb1', bottom: 'etek', bottomColor: '#5b8def', dress: '', dressColor: '#ff8fb1', shoes: 'spor', shoesColor: '#ffffff', hat: 'fiyonk', hatColor: '#ff6b4a', hand: '', bg: 'park', pet: 'kopek' };
const farm = { coins: 240, xp: 120 };
const state = { state: { profiles: [{ id: 'p1', name: 'Alya', avatar: 'panda', favoritePath: 'hayvanlar', createdAt: 1 }], activeId: 'p1', data: { p1: { lessons: {}, favorites: [], stickers: [], newStickers: [], days: {}, paperCount: 0, freeCount: 0, gift: { last: new Date().toISOString().slice(0, 10), streak: 1 }, doll, farm } }, settings: { narration: false, sfx: false } }, version: 2 };
await p.goto('http://localhost:5288/#/hosgeldin');
await p.evaluate((s) => { localStorage.clear(); localStorage.setItem('cizio-db-migrated', '1'); localStorage.setItem('cizio-ada-not', '0'); localStorage.setItem('cizio-v1', JSON.stringify(s)); }, state);
await p.goto('about:blank');
await p.goto('http://localhost:5288/#/ada', { timeout: 180000 });
await p.waitForSelector('.joystick', { timeout: 180000 });
await p.waitForTimeout(3000);
const W = (c: string) => p.evaluate((c) => (0, eval)(`(w) => ${c}`)((window as any).__island), c);
const shot = async (n: string) => { await p.evaluate(() => document.querySelectorAll('.island__toast').forEach((e) => ((e as HTMLElement).style.display = 'none'))); await p.screenshot({ path: `${OUT}/${kind}-${n}.png`, timeout: 180000 }); };
const look = (yaw: number, pitch = 0.15) => W(`(w.camYawGoal = w.camYaw = ${yaw}, w.camPitchGoal = w.camPitch = ${pitch})`);
const sp = async (id: string, dx = 0, dz = 0) => { const s = await W(`w.spotList.find((s) => s.id === '${id}')`); await W(`w.teleport(${s.x + dx}, ${s.z + dz})`); await p.waitForTimeout(1200); return s; };
const act = async (id: string, frac: number, wait = 3500) => { await W(`w.activity('${id}')`); await W(`w.act && (w.act.t = w.act.def.dur * ${frac})`); await p.waitForTimeout(wait); };
const end = async () => { await W('w.act && (w.act.t = w.act.def.dur - 0.01)'); await p.waitForTimeout(1500); };
// 1) lunapark: yolun ortasından parka doğru (arkada giriş kapısı, önde atlıkarınca ve dönme dolap)
{
  const F = [160, -92], f = [-160 / Math.hypot(160, 92), 92 / Math.hypot(160, 92)];
  const hx = F[0] + f[0] * 24, hz = F[1] + f[1] * 24;
  await W(`w.teleport(${hx}, ${hz})`); await p.waitForTimeout(800);
  await W(`(w.act = { def: { cam: [15, 8], pose: 'wave', step() {}, dur: 1e9 }, spot: { x: ${hx}, z: ${hz} }, t: 0 }, w.heading = ${Math.atan2(-f[0], -f[1])}, w.camYawGoal = w.camYaw = ${Math.atan2(f[0], f[1])}, w.camPitchGoal = w.camPitch = 0.12, 0)`);
  await p.waitForTimeout(4500); await shot('01-lunapark'); await W('(w.act = null, 0)');
}
// 2) hız treni
await sp('coaster'); await act('coaster', 0.32); await shot('02-hiz-treni'); await end();
// 3) okulun içi
await W(`w.enterRealm('okul', { x: 0, z: 12, h: 0 })`); await p.waitForTimeout(3500); await shot('03-okul'); await W('w.leaveRealm()'); await p.waitForTimeout(800);
// 4) Mars, uçan daire
await W(`w.enterRealm('mars', { x: 0, z: 12, h: 0 })`); await p.waitForTimeout(2500);
await W('(w.pos.set(-26, w.pos.y, 10), 0)'); await act('mars-ufo', 0.45, 4000); await shot('04-mars'); await end(); await W('w.leaveRealm()'); await p.waitForTimeout(800);
// 5) hayvanat bahçesi: panda (kamera kahramanın arkasında, panda önde)
await sp('zoo-panda'); await W(`w.activity('zoo-panda')`); await W('(w.act.t = w.act.def.dur * 0.62, 0)'); await p.waitForTimeout(200);
await W('(w.camYawGoal = w.camYaw = w.heading + Math.PI, w.camPitchGoal = w.camPitch = 0.1, w.act.def = { ...w.act.def, cam: [9, 5] }, 0)'); await p.waitForTimeout(3500); await shot('05-hayvanat'); await end();
// 6) uçak turu
await sp('plane'); await act('plane', 0.4, 4500); await shot('06-ucak'); await end();
// 7) evim
await sp('home'); await p.locator('.island__act').click(); await p.waitForSelector('.home-top', { timeout: 60000 });
await p.waitForTimeout(1500); await p.evaluate(() => (window as any).__home.setJoystick(0, 1)); await p.waitForTimeout(3500); await p.evaluate(() => (window as any).__home.setJoystick(0, 0)); await p.waitForTimeout(1500);
await p.evaluate(() => document.querySelectorAll('.island__toast, .home-hint').forEach((e) => ((e as HTMLElement).style.display = 'none')));
await p.screenshot({ path: `${OUT}/${kind}-07-evim.png`, timeout: 180000 });
await p.locator('.home-top button.pill').first().click(); await p.waitForTimeout(1500);
// 8) Oyun Çadırı
await sp('games'); await W(`w.activity('games')`); await p.waitForSelector('.mini-pick'); await p.waitForTimeout(1500); await shot('08-oyunlar');
await b.close();
console.log('bitti');
