/**
 * Mağaza tanıtım kartları: ham ekran görüntülerini başlıklı, renkli "pazarlama" görsellerine çevirir.
 *   npx tsx scripts/store-promo.mts
 * Girdi: store/screenshots/ (ham görüntüler). Çıktı: store/promo/ ve store/promo/ios/
 *   - phone-01…08.png (1080×1920, Google Play telefon)
 *   - tablet-01…08.png (1920×1200, Google Play tablet)
 *   - feature-graphic.png (1024×500, Google Play öne çıkan görsel)
 *   - ios/<boyut>-01…08.png (App Store; boyutlar IOS_SIZES içinde)
 * Tarayıcı: CHROME_PATH ya da işletim sistemine göre Chrome/Edge.
 */
import { chromium } from 'playwright-core';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve('.');
const OUT = resolve('store/promo');
mkdirSync(OUT, { recursive: true });
const font = (f: string) => `data:font/woff2;base64,${readFileSync(resolve('node_modules/@fontsource', f)).toString('base64')}`;
const img = (p: string) => `data:image/png;base64,${readFileSync(resolve('store/screenshots', p)).toString('base64')}`;

interface Slide { title: string; sub: string; bg: [string, string]; ink: string; shot: string; tablet: string; badge?: string }
const SLIDES: Slide[] = [
  { title: 'Adım adım<br>çizmeyi öğren!', sub: '98 sesli ders · kalem nasıl çizdiğini gösterir', bg: ['#ffd8c2', '#ff9e7a'], ink: '#5a2414', shot: 'phone-03-ders-kalem.png', tablet: 'tablet-03-ders-kalem.png', badge: 'Reklamsız' },
  { title: 'Kocaman 3B<br>Çizio Adası', sub: 'Lunapark, hız treni, plaj, köy ve daha fazlası', bg: ['#c9f0ff', '#62c4f2'], ink: '#0d3a57', shot: 'yeni/phone-01-lunapark.png', tablet: 'yeni/tablet-01-lunapark.png' },
  { title: 'Çiz, boya,<br>renklendir!', sub: 'Boya kovası, pastel, simli kalem', bg: ['#fff3c4', '#ffd166'], ink: '#5a3d00', shot: 'phone-04-atolye-boyama.png', tablet: 'tablet-04-atolye-boyama.png' },
  { title: 'Okula, hastaneye,<br>markete gir', sub: 'Binaların içinde gez, oyna, keşfet', bg: ['#e2f7d4', '#8fd36b'], ink: '#1f4a10', shot: 'yeni/phone-03-okul.png', tablet: 'yeni/tablet-03-okul.png' },
  { title: 'Roketle<br>Mars’a uç!', sub: 'Uzaylılarla tanış, kristal topla', bg: ['#ffd9c9', '#e8774a'], ink: '#4a1a08', shot: 'yeni/phone-04-mars.png', tablet: 'yeni/tablet-04-mars.png' },
  { title: 'Karakterini<br>giydir', sub: 'Yüzlerce kıyafet, saç ve evcil dost', bg: ['#ece2ff', '#b59cff'], ink: '#33206e', shot: 'phone-08-giydir.png', tablet: 'tablet-08-giydir.png' },
  { title: 'Oynayarak<br>İngilizce', sub: 'Her gün 15 dakika: dinle, hareket et, oyna', bg: ['#d8ecff', '#7fb2ff'], ink: '#132f66', shot: 'phone-06-english-club.png', tablet: 'tablet-06-english-club.png' },
  { title: '8 mini oyun,<br>kendi evin', sub: 'Reklam yok · ebeveyn kontrollü · güvenli', bg: ['#ffe0ec', '#ff8fb8'], ink: '#5c1233', shot: 'yeni/phone-08-oyunlar.png', tablet: 'yeni/tablet-08-oyunlar.png', badge: 'Güvenli' },
];

const css = `
@font-face { font-family: F; font-weight: 700; src: url(${font('fredoka/files/fredoka-latin-ext-700-normal.woff2')}); unicode-range: U+0100-024F; }
@font-face { font-family: F; font-weight: 700; src: url(${font('fredoka/files/fredoka-latin-700-normal.woff2')}); }
@font-face { font-family: N; font-weight: 800; src: url(${font('nunito/files/nunito-latin-ext-800-normal.woff2')}); unicode-range: U+0100-024F; }
@font-face { font-family: N; font-weight: 800; src: url(${font('nunito/files/nunito-latin-800-normal.woff2')}); }
* { margin: 0; box-sizing: border-box; }
body { width: var(--w); height: var(--h); overflow: hidden; }
.card { position: relative; width: 100%; height: 100%; overflow: hidden; background: linear-gradient(160deg, var(--a), var(--b)); color: var(--ink); }
.dots { position: absolute; inset: 0; background-image: radial-gradient(rgba(255,255,255,.45) 2px, transparent 2.5px); background-size: 34px 34px; opacity: .55; }
.blob { position: absolute; border-radius: 50%; background: rgba(255,255,255,.28); }
h1 { font-family: F; font-weight: 700; line-height: 1.02; letter-spacing: -0.5px; text-shadow: 0 3px 0 rgba(255,255,255,.55); }
p { font-family: N; font-weight: 800; opacity: .82; }
.dev { position: absolute; border-radius: 46px; background: #1d1b26; padding: 14px; box-shadow: 0 30px 60px rgba(0,0,0,.28), 0 0 0 3px rgba(255,255,255,.35); }
.dev img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: top; border-radius: 34px; }
.txt { position: absolute; display: flex; flex-direction: column; gap: 22px; align-items: flex-start; }
.txt .badge { position: static; }
.badge { position: absolute; font-family: F; font-weight: 700; background: #fff; color: var(--ink); border-radius: 999px; box-shadow: 0 8px 20px rgba(0,0,0,.15); transform: rotate(-6deg); }
.badge::before { content: '★ '; color: #ffb703; }
`;

function phone(s: Slide, i: number) {
  return `<div class="card" style="--a:${s.bg[0]};--b:${s.bg[1]};--ink:${s.ink}">
    <div class="dots"></div><div class="blob" style="width:700px;height:700px;right:-260px;top:-300px"></div><div class="blob" style="width:420px;height:420px;left:-180px;bottom:180px"></div>
    <div class="txt" style="left:70px;right:60px;top:110px"><h1 style="font-size:104px">${s.title}</h1><p style="font-size:40px;margin-left:4px">${s.sub}</p></div>
    <div class="dev" style="left:150px;top:520px;width:780px;height:1500px;transform:rotate(${i % 2 ? 3 : -3}deg)"><img src="${img(s.shot)}"></div>
    ${s.badge ? `<div class="badge" style="right:56px;top:470px;font-size:40px;padding:14px 30px">${s.badge}</div>` : ''}
  </div>`;
}
function tablet(s: Slide, i: number) {
  return `<div class="card" style="--a:${s.bg[0]};--b:${s.bg[1]};--ink:${s.ink}">
    <div class="dots"></div><div class="blob" style="width:760px;height:760px;left:-300px;top:-320px"></div><div class="blob" style="width:500px;height:500px;right:-160px;bottom:-200px"></div>
    <div class="txt" style="left:96px;width:640px;top:50%;transform:translateY(-50%)"><h1 style="font-size:88px">${s.title}</h1><p style="font-size:36px;margin-left:4px">${s.sub}</p>${s.badge ? `<div class="badge" style="font-size:36px;padding:12px 28px">${s.badge}</div>` : ''}</div>
    <div class="dev" style="left:790px;top:220px;width:1060px;height:690px;border-radius:40px;transform:rotate(${i % 2 ? 2 : -2}deg)"><img src="${img(s.tablet)}" style="border-radius:28px"></div>
  </div>`;
}
function feature() {
  const shots = ['yeni/phone-01-lunapark.png', 'phone-03-ders-kalem.png', 'yeni/phone-04-mars.png'];
  return `<div class="card" style="--a:#bfeaff;--b:#ffd1b8;--ink:#3a1d12">
    <div class="dots"></div><div class="blob" style="width:520px;height:520px;left:-200px;top:-260px"></div>
    <img src="${img('../icon-512.png')}" style="position:absolute;left:56px;top:52px;width:120px;height:120px;border-radius:28px;box-shadow:0 10px 24px rgba(0,0,0,.18)">
    <h1 style="position:absolute;left:56px;top:190px;font-size:76px;color:#ef5a3c">Çizio</h1>
    <p style="position:absolute;left:58px;top:282px;width:430px;font-size:27px;line-height:1.25">Adım adım çizmeyi öğren, 3B Çizio Adası'nda keşfe çık!</p>
    <p style="position:absolute;left:58px;top:392px;font-size:20px;opacity:.7">Reklamsız · Sesli dersler · İngilizce</p>
    ${shots.map((sh, k) => `<div class="dev" style="left:${520 + k * 168}px;top:${k === 1 ? 46 : 84}px;width:200px;height:400px;border-radius:26px;padding:7px;transform:rotate(${[-7, 0, 7][k]}deg);z-index:${k === 1 ? 2 : 1}"><img src="${img(sh)}" style="border-radius:20px"></div>`).join('')}
  </div>`;
}

const CANDIDATES = [process.env.CHROME_PATH, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].filter(Boolean) as string[];
const exe = CANDIDATES.find((p) => existsSync(p));
if (!exe) throw new Error('Chrome/Edge bulunamadı: CHROME_PATH verin.');
const b = await chromium.launch({ executablePath: exe });
const render = async (html: string, w: number, h: number, out: string) => {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })).newPage();
  await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body style="--w:${w}px;--h:${h}px">${html}</body></html>`);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  await p.screenshot({ path: out });
  await p.close();
};
// App Store kartları: Play kartlarıyla aynı tasarım, Apple'ın istediği piksel boyutlarında.
// Dar olanlar (en/boy < 0,6) telefon görüntüsünü dikey çerçevede, geniş olanlar tablet
// görüntüsünü yatay çerçevede gösterir. Boyutlar: App Store Connect "screenshot specifications".
interface IosSize { id: string; w: number; h: number }
const IOS_SIZES: IosSize[] = [
  { id: 'iphone-6-3', w: 1206, h: 2622 }, // Dynamic Island (medium) — zorunlu
  { id: 'iphone-6-9', w: 1290, h: 2796 }, // Dynamic Island (large)
  { id: 'ipad-13', w: 2064, h: 2752 }, // 13" iPad — iPad'de çalışan uygulamalar için zorunlu
];

function iosPhoneCard(s: Slide, i: number, W: number, H: number) {
  const u = W / 1080; // tasarım genişliği 1080'e göre ölçek
  const dw = 780 * u, dh = dw * (1500 / 780);
  return `<div class="card" style="--a:${s.bg[0]};--b:${s.bg[1]};--ink:${s.ink}">
    <div class="dots"></div><div class="blob" style="width:${700 * u}px;height:${700 * u}px;right:${-260 * u}px;top:${-300 * u}px"></div><div class="blob" style="width:${420 * u}px;height:${420 * u}px;left:${-180 * u}px;bottom:${0.09 * H}px"></div>
    <div class="txt" style="left:${70 * u}px;right:${60 * u}px;top:${0.057 * H}px;gap:${22 * u}px"><h1 style="font-size:${104 * u}px">${s.title}</h1><p style="font-size:${40 * u}px;margin-left:${4 * u}px">${s.sub}</p></div>
    <div class="dev" style="left:${(W - dw) / 2}px;top:${0.27 * H}px;width:${dw}px;height:${dh}px;border-radius:${46 * u}px;padding:${14 * u}px;transform:rotate(${i % 2 ? 3 : -3}deg)"><img src="${img(s.shot)}" style="border-radius:${34 * u}px"></div>
    ${s.badge ? `<div class="badge" style="right:${56 * u}px;top:${0.235 * H}px;font-size:${40 * u}px;padding:${14 * u}px ${30 * u}px">${s.badge}</div>` : ''}
  </div>`;
}

function iosTabletCard(s: Slide, i: number, W: number, H: number) {
  const u = W / 2064;
  const dw = 0.88 * W, dh = dw * (690 / 1060);
  return `<div class="card" style="--a:${s.bg[0]};--b:${s.bg[1]};--ink:${s.ink}">
    <div class="dots"></div><div class="blob" style="width:${900 * u}px;height:${900 * u}px;left:${-340 * u}px;top:${-380 * u}px"></div><div class="blob" style="width:${560 * u}px;height:${560 * u}px;right:${-200 * u}px;bottom:${-220 * u}px"></div>
    <div class="txt" style="left:${120 * u}px;right:${120 * u}px;top:${0.085 * H}px;gap:${28 * u}px;align-items:center;text-align:center"><h1 style="font-size:${148 * u}px">${s.title}</h1><p style="font-size:${56 * u}px">${s.sub}</p>${s.badge ? `<div class="badge" style="font-size:${52 * u}px;padding:${16 * u}px ${38 * u}px">${s.badge}</div>` : ''}</div>
    <div class="dev" style="left:${(W - dw) / 2}px;top:${0.4 * H}px;width:${dw}px;height:${dh}px;border-radius:${54 * u}px;padding:${18 * u}px;transform:rotate(${i % 2 ? 2 : -2}deg)"><img src="${img(s.tablet)}" style="border-radius:${38 * u}px"></div>
  </div>`;
}

for (const [i, s] of SLIDES.entries()) {
  const n = String(i + 1).padStart(2, '0');
  await render(phone(s, i), 1080, 1920, `${OUT}/phone-${n}.png`);
  await render(tablet(s, i), 1920, 1200, `${OUT}/tablet-${n}.png`);
}
await render(feature(), 1024, 500, `${OUT}/feature-graphic.png`);

const IOS_OUT = resolve('store/promo/ios');
mkdirSync(IOS_OUT, { recursive: true });
for (const size of IOS_SIZES) {
  const dar = size.w / size.h < 0.6;
  for (const [i, s] of SLIDES.entries()) {
    const n = String(i + 1).padStart(2, '0');
    const html = dar ? iosPhoneCard(s, i, size.w, size.h) : iosTabletCard(s, i, size.w, size.h);
    await render(html, size.w, size.h, `${IOS_OUT}/${size.id}-${n}.png`);
  }
}
await b.close();
console.log('hazır:', OUT, 've', IOS_OUT);
