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

interface Slide {
  title: string; sub: string; bg: [string, string]; ink: string; shot: string; tablet: string; badge?: string;
  /** App Store panoraması: üstte küçük renkli etiket ve <em> vurgulu başlık (İsim Şehir'deki gibi). */
  kicker: string; pano: string; accent: string;
}
const SLIDES: Slide[] = [
  { title: 'Adım adım<br>çizmeyi öğren!', sub: '196 sesli ders · kalem nasıl çizdiğini gösterir', bg: ['#ffd8c2', '#ff9e7a'], ink: '#5a2414', shot: 'phone-03-ders-kalem.png', tablet: 'tablet-03-ders-kalem.png', badge: 'Reklamsız', kicker: 'Sesli çizim dersleri', pano: 'Adım adım <em>çizmeyi öğren!</em>', accent: '#f0553c' },
  { title: 'Kocaman 3B<br>Çizio Adası', sub: 'Lunapark, hız treni, plaj, köy ve daha fazlası', bg: ['#c9f0ff', '#62c4f2'], ink: '#0d3a57', shot: 'yeni/phone-01-lunapark.png', tablet: 'yeni/tablet-01-lunapark.png', kicker: 'Çizio Adası', pano: 'Kocaman <em>3B ada</em>', accent: '#1593c9' },
  { title: 'Çiz, boya,<br>renklendir!', sub: 'Boya kovası, pastel, simli kalem', bg: ['#fff3c4', '#ffd166'], ink: '#5a3d00', shot: 'phone-04-atolye-boyama.png', tablet: 'tablet-04-atolye-boyama.png', kicker: 'Atölye', pano: 'Çiz, boya, <em>renklendir!</em>', accent: '#e39a00' },
  { title: 'Okula, hastaneye,<br>markete gir', sub: 'Binaların içinde gez, oyna, keşfet', bg: ['#e2f7d4', '#8fd36b'], ink: '#1f4a10', shot: 'yeni/phone-03-okul.png', tablet: 'yeni/tablet-03-okul.png', kicker: 'Binaların içi', pano: 'Okula, markete <em>gir, keşfet!</em>', accent: '#2a9a3c' },
  { title: 'Roketle<br>Mars’a uç!', sub: 'Uzaylılarla tanış, kristal topla', bg: ['#ffd9c9', '#e8774a'], ink: '#4a1a08', shot: 'yeni/phone-04-mars.png', tablet: 'yeni/tablet-04-mars.png', kicker: 'Portallar', pano: 'Roketle <em>Mars’a uç!</em>', accent: '#e0612f' },
  { title: 'Karakterini<br>giydir', sub: 'Yüzlerce kıyafet, saç ve evcil dost', bg: ['#ece2ff', '#b59cff'], ink: '#33206e', shot: 'phone-08-giydir.png', tablet: 'tablet-08-giydir.png', kicker: 'Giydirme Stüdyosu', pano: 'Karakterini <em>giydir</em>', accent: '#6a4fe0' },
  { title: 'Oynayarak<br>İngilizce', sub: 'Her gün 15 dakika: dinle, hareket et, oyna', bg: ['#d8ecff', '#7fb2ff'], ink: '#132f66', shot: 'phone-06-english-club.png', tablet: 'tablet-06-english-club.png', kicker: 'English Club', pano: 'Oynayarak <em>İngilizce</em>', accent: '#3a6fd8' },
  { title: '8 mini oyun,<br>kendi evin', sub: 'Reklam yok · ebeveyn kontrollü · güvenli', bg: ['#ffe0ec', '#ff8fb8'], ink: '#5c1233', shot: 'yeni/phone-08-oyunlar.png', tablet: 'yeni/tablet-08-oyunlar.png', badge: 'Güvenli', kicker: 'Reklamsız · güvenli', pano: 'Mini oyunlar, <em>kendi evin</em>', accent: '#e33d62' },
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
// App Store kartları: 8 görüntü tek bir geniş şeritten kesilir, böylece arka plan, lekeler ve
// kesik çizgi bir görüntüden diğerine akar (mağazada yan yana "geçişli" görünür).
// Boyutlar: App Store Connect "screenshot specifications".
interface IosSize { id: string; w: number; h: number }
const IOS_SIZES: IosSize[] = [
  { id: 'iphone-6-3', w: 1206, h: 2622 }, // Dynamic Island (medium) — zorunlu
  { id: 'iphone-6-9', w: 1290, h: 2796 }, // Dynamic Island (large)
  { id: 'ipad-13', w: 2064, h: 2752 }, // 13" iPad — iPad'de çalışıyorsa zorunlu
];

/**
 * Şeridin tamamı (İsim Şehir'in panorama düzeni): genişlik = slayt sayısı × tek görüntü genişliği. Her görüntünün
 * kendi açık tonu sınırlarda yumuşakça birbirine geçer; kesik çizgili yol ve harf kutucukları görüntüden görüntüye taşar;
 * cihazlar perspektifle yamuk durur ve köşeleri yandaki görüntüye uzanır.
 */
function serit(W: number, H: number) {
  const dar = W / H < 0.6; // telefon mu tablet mi
  const N = SLIDES.length;
  const TW = W * N;
  const u = W / (dar ? 1080 : 2064);
  const stops = SLIDES.map((sl, i) => `${sl.bg[0]} ${(((i + 0.5) / N) * 100).toFixed(2)}%`).join(', ');
  // kesik çizgili dalgalı yol: bütün şeridi boydan boya geçer
  const yBase = (dar ? 0.8 : 0.86) * H;
  const amp = (dar ? 0.085 : 0.05) * H;
  let yol = `M -100 ${yBase}`;
  for (let i = 0; i < N * 2 + 1; i++) {
    const x0 = (i * W) / 2;
    yol += ` C ${x0 + W / 6} ${yBase + (i % 2 ? amp : -amp)}, ${x0 + W / 3} ${yBase + (i % 2 ? amp : -amp)}, ${x0 + W / 2} ${yBase}`;
  }
  // harf kutucukları: çoğu iki görüntünün sınırında (geçişi taşırlar)
  const HARF = 'ÇİZABCDEFGHİKLMNOPRS';
  const RENK = ['#ff6b4a', '#14a89a', '#e8a200', '#e9487d', '#7c5cff', '#3ea6f0', '#2bb673', '#ff9f1c'];
  const kutular = Array.from({ length: N * 2 - 1 }, (_, i) => {
    const sinir = i % 2 === 1;
    const sz = (sinir ? 128 : 92) * u;
    const x = sinir ? ((i + 1) / 2) * W - sz / 2 : (i / 2) * W + W * 0.06;
    const y = dar ? (sinir ? (0.2 + ((i * 37) % 9) / 100) * H : 0.92 * H) : sinir ? (0.27 + ((i * 29) % 7) / 100) * H : 0.93 * H;
    return `<div class="tile" style="left:${x}px;top:${y}px;width:${sz}px;height:${sz}px;font-size:${sz * 0.58}px;background:${RENK[i % RENK.length]};transform:rotate(${[-12, 9, -6, 14][i % 4]}deg)">${HARF[i % HARF.length]}</div>`;
  }).join('');
  const lekeler = SLIDES.map((_, i) => `<div class="blob" style="left:${i * W + (i % 2 ? W * 0.55 : -W * 0.2)}px;top:${i % 2 ? H * 0.55 : -H * 0.12}px;width:${W * 0.7}px;height:${W * 0.6}px"></div>`).join('');
  const kartlar = SLIDES.map((sl, i) => {
    const x = i * W;
    const tilt = i % 2 ? 6 : -6;
    const yaw = i % 2 ? 14 : -14;
    const yazi = dar
      ? `left:${x + 84 * u}px;top:${0.06 * H}px;width:${W - 168 * u}px;gap:${20 * u}px`
      : `left:${x + 140 * u}px;top:${0.07 * H}px;width:${W - 280 * u}px;gap:${24 * u}px`;
    const cihaz = dar
      ? `<div class="dev" style="left:${x + (W - 0.74 * W) / 2 + (i % 2 ? 0.13 : -0.13) * W}px;top:${0.31 * H}px;width:${0.74 * W}px;transform:perspective(${2600 * u}px) rotateY(${yaw}deg) rotateZ(${tilt}deg)">
           <div class="frame" style="padding:${24 * u}px;border-radius:${110 * u}px"><img src="${img(sl.shot)}" style="border-radius:${88 * u}px"><div class="island" style="top:${46 * u}px;width:${170 * u}px;height:${48 * u}px;margin-left:${-85 * u}px"></div></div></div>`
      : `<div class="dev" style="left:${x + 0.04 * W + (i % 2 ? 0.08 : -0.02) * W}px;top:${0.33 * H}px;width:${1.04 * W}px;transform:perspective(${3000 * u}px) rotateY(${yaw * 0.8}deg) rotateZ(${tilt * 0.7}deg)">
           <div class="frame" style="padding:${30 * u}px;border-radius:${70 * u}px"><img src="${img(sl.tablet)}" style="border-radius:${44 * u}px"></div></div>`;
    return `<div class="txt" style="${yazi}">
      <div class="kicker" style="color:${sl.accent};font-size:${(dar ? 44 : 50) * u}px">${sl.kicker}</div>
      <h1 style="--em:${sl.accent};font-size:${(dar ? 108 : 124) * u}px">${sl.pano}</h1>
      <p style="font-size:${(dar ? 40 : 46) * u}px">${sl.sub}</p>
      ${sl.badge ? `<div class="badge" style="font-size:${(dar ? 38 : 44) * u}px;padding:${14 * u}px ${32 * u}px;--ink:${sl.ink}">${sl.badge}</div>` : ''}
    </div>${cihaz}`;
  }).join('');
  return `<div class="serit" style="width:${TW}px;height:${H}px;background:linear-gradient(90deg, ${stops})">
    <div class="dots"></div>${lekeler}
    <svg width="${TW}" height="${H}" style="position:absolute;inset:0"><path d="${yol}" fill="none" stroke="#ff6b4a" stroke-opacity=".45" stroke-width="${14 * u}" stroke-linecap="round" stroke-dasharray="${36 * u} ${30 * u}"/></svg>
    ${kutular}
    ${kartlar}
  </div>`;
}

const IOS_OUT = resolve('store/promo/ios');
mkdirSync(IOS_OUT, { recursive: true });
for (const boyut of IOS_SIZES) {
  const { w: W, h: H } = boyut;
  const sayfa = await (await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })).newPage();
  await sayfa.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${css}
    body { width: ${W}px; height: ${H}px; overflow: hidden; }
    .pencere { position: absolute; inset: 0; overflow: hidden; }
    .serit { position: absolute; left: 0; top: 0; }
    .txt { position: absolute; display: flex; flex-direction: column; align-items: flex-start; color: var(--ink); }
    .txt { z-index: 4; }
    .txt h1 { color: #3a2b27; line-height: 1.02; letter-spacing: -1px; text-shadow: none; }
    .txt h1 em { font-style: normal; color: var(--em); }
    .txt p { color: #6b5850; opacity: 1; line-height: 1.3; }
    .kicker { font-family: N; font-weight: 800; letter-spacing: .5px; }
    .serit .dots { opacity: .6; background-image: radial-gradient(rgba(255,255,255,.55) 3px, transparent 3.5px); background-size: 46px 46px; }
    .serit .blob { background: rgba(255,255,255,.5); }
    .tile { position: absolute; display: grid; place-items: center; border-radius: 26%; font-family: F; font-weight: 700; color: #fff; z-index: 3;
      box-shadow: 0 8px 0 rgba(0,0,0,.14), 0 18px 30px rgba(80,50,30,.18); }
    .serit .dev { position: absolute; z-index: 2; transform-origin: 50% 40%; background: none; padding: 0; box-shadow: none; border-radius: 0; }
    .frame { position: relative; background: linear-gradient(145deg, #2c2a36, #111016); box-shadow: 0 0 0 7px #e4e1ea, 0 0 0 11px #a19cab, 40px 60px 90px rgba(80,40,20,.35); }
    .frame img { display: block; width: 100%; height: auto; object-fit: initial; }
    .island { position: absolute; left: 50%; background: #07070a; border-radius: 26px; }
  </style></head><body><div class="pencere">${serit(W, H)}</div></body></html>`);
  await sayfa.evaluate(() => document.fonts.ready);
  await sayfa.waitForTimeout(600);
  for (let i = 0; i < SLIDES.length; i++) {
    await sayfa.evaluate((dx) => { (document.querySelector('.serit') as HTMLElement).style.transform = `translateX(${dx}px)`; }, -i * W);
    await sayfa.waitForTimeout(150);
    await sayfa.screenshot({ path: `${IOS_OUT}/${boyut.id}-${String(i + 1).padStart(2, '0')}.png` });
  }
  await sayfa.close();
}
await b.close();
console.log('hazır:', OUT, 've', IOS_OUT);
