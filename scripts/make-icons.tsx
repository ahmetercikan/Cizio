/**
 * Uygulama ikonları: indigo zemin, beyaz akan kalem çizgisi ve gerçekçi sarı kurşun kalem.
 *   npm run icons
 * Çıktılar:
 *   public/icons/icon-192.png, icon-512.png     yuvarlatılmış kare (PWA / masaüstü)
 *   public/icons/icon-maskable-512.png          tam dolu, güvenli alanda küçültülmüş (Android)
 *   public/icons/apple-touch-icon.png (180)     tam dolu (iOS kendisi yuvarlatır)
 *   public/favicon.svg
 *   .render/icon-preview.png                    farklı boyutlarda önizleme
 */
import sharp from 'sharp';
import { samplePath } from '../src/engine/pathSampler';
import { mkdirSync, writeFileSync } from 'node:fs';

const S = 1024;

interface Variant {
  d: string;
  tip: [number, number];
  ang: number;
  len: number;
}

export const VARIANTS: Variant[] = [
  // 0: büyük kalp, kalem son hamlede (alt uca yaklaşırken)
  {
    d: 'M 380 858 C 290 790, 165 700, 170 585 C 175 480, 318 440, 380 540 C 442 440, 585 480, 590 585 C 594 675, 510 755, 452 800',
    tip: [452, 800], ang: -52, len: 520,
  },
  // 1: aynı kalp, kalem daha dik
  {
    d: 'M 380 858 C 290 790, 165 700, 170 585 C 175 480, 318 440, 380 540 C 442 440, 585 480, 590 585 C 594 675, 510 755, 452 800',
    tip: [452, 800], ang: -62, len: 500,
  },
  // 2: kalp biraz sola ve yukarı, kalem uzun
  {
    d: 'M 340 820 C 250 752, 125 662, 130 547 C 135 442, 278 402, 340 502 C 402 402, 545 442, 550 547 C 554 637, 470 717, 412 762',
    tip: [412, 762], ang: -48, len: 560,
  },
];

/**
 * Kaligrafik şerit: merkez çizgi boyunca kalınlık başta incelir (fırça gibi), sonda dolgun kalır.
 * Dış hat Catmull-Rom ile pürüzsüzleştirilir.
 */
function ribbonPath(d: string, width: number): string {
  const pts = samplePath(d, 6).points;
  const n = pts.length;
  const left: [number, number][] = [], right: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1];
    const len = Math.hypot(tx, ty) || 1;
    tx /= len;
    ty /= len;
    const t = i / (n - 1);
    const ease = Math.min(1, t / 0.35);
    const w = (width / 2) * (0.12 + 0.88 * (1 - (1 - ease) ** 2.2));
    left.push([pts[i][0] - ty * w, pts[i][1] + tx * w]);
    right.push([pts[i][0] + ty * w, pts[i][1] - tx * w]);
  }
  const ring = [...left, ...right.reverse()];
  const P = (i: number) => ring[(i + ring.length) % ring.length];
  let p = `M${ring[0][0].toFixed(1)},${ring[0][1].toFixed(1)}`;
  for (let i = 0; i < ring.length; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    p += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return p + ' Z';
}

let variant = Number(process.env.ICON_LINE ?? 2);
const LINES = VARIANTS.map((v) => v.d);

/** İkonun iç çizimi (1024'lük alanda). */
function art(): string {
  // Kalem: uç (0,0), gövde +x yönünde; sağ üste doğru 42° döndürülür.
  const V = VARIANTS[variant];
  const L = V.len; // toplam uzunluk
  const hw = 56; // yarım genişlik
  const [tipX, tipY] = V.tip;
  const ang = V.ang;
  const wood = 150; // ahşap koninin bittiği yer
  const ferr = L - 118, eras = L - 58;
  const pencil = `
    <g transform="translate(${tipX} ${tipY}) rotate(${ang})">
      <!-- gölge -->
      <g transform="translate(26 30)" opacity="0.35" filter="url(#blur18)">
        <path d="M0,0 L${wood},${-hw} L${L - 20},${-hw} Q${L},${-hw} ${L},${-hw + 20} L${L},${hw - 20} Q${L},${hw} ${L - 20},${hw} L${wood},${hw} Z" fill="#12063f"/>
      </g>
      <!-- ahşap koni -->
      <path d="M0,0 L${wood + 4},${-hw} L${wood + 4},${hw} Z" fill="url(#wood)"/>
      <path d="M0,0 L${wood + 4},${-hw} L${wood + 4},${-hw / 3} Z" fill="#fbe2bd" opacity="0.8"/>
      <!-- grafit uç -->
      <path d="M0,0 L50,-19 Q44,0 50,19 Z" fill="url(#lead)"/>
      <!-- gövde: üç yüz -->
      <path d="M${wood},${-hw} L${ferr},${-hw} L${ferr},${-hw / 3} L${wood},${-hw / 3} Q${wood - 12},${-hw * 0.66} ${wood},${-hw} Z" fill="url(#faceTop)"/>
      <path d="M${wood},${-hw / 3} L${ferr},${-hw / 3} L${ferr},${hw / 3} L${wood},${hw / 3} Q${wood - 12},0 ${wood},${-hw / 3} Z" fill="url(#faceMid)"/>
      <path d="M${wood},${hw / 3} L${ferr},${hw / 3} L${ferr},${hw} L${wood},${hw} Q${wood - 12},${hw * 0.66} ${wood},${hw / 3} Z" fill="url(#faceBot)"/>
      <path d="M${wood + 6},${-hw / 3} H${ferr} M${wood + 6},${hw / 3} H${ferr}" stroke="#c9770a" stroke-width="2.5" opacity="0.55"/>
      <path d="M${wood + 10},${-hw + 9} H${ferr - 10}" stroke="#fff6d6" stroke-width="5" stroke-linecap="round" opacity="0.7"/>
      <!-- metal bilezik -->
      <rect x="${ferr}" y="${-hw - 3}" width="${eras - ferr}" height="${2 * hw + 6}" rx="6" fill="url(#metal)"/>
      <path d="M${ferr + 15},${-hw - 3} V${hw + 3} M${ferr + 30},${-hw - 3} V${hw + 3} M${ferr + 45},${-hw - 3} V${hw + 3}" stroke="#8d93a3" stroke-width="3.5" opacity="0.8"/>
      <!-- silgi -->
      <path d="M${eras},${-hw} H${L - 24} Q${L},${-hw} ${L},${-hw + 24} V${hw - 24} Q${L},${hw} ${L - 24},${hw} H${eras} Z" fill="url(#eraser)"/>
      <path d="M${eras + 8},${-hw + 12} H${L - 22}" stroke="#ffd9de" stroke-width="7" stroke-linecap="round" opacity="0.8"/>
    </g>`;

  // Kalemin çizdiği döngülü beyaz çizgi (uç kalemin ucunda biter).
  const ribbon = ribbonPath(LINES[variant], 60);
  const end = samplePath(LINES[variant], 6).points.at(-1)!;
  return `
    <path d="${ribbon}" fill="#1b0b6b" fill-opacity="0.35" transform="translate(10 18)" filter="url(#blur12)"/>
    <path d="${ribbon}" fill="url(#chalk)"/>
    <circle cx="${end[0]}" cy="${end[1]}" r="30" fill="url(#chalk)"/>
    ${pencil}
    <!-- parıltılar -->
    <path d="M770 610 q10 34 44 44 q-34 10 -44 44 q-10 -34 -44 -44 q34 -10 44 -44 Z" fill="#ffd43b"/>
    <path d="M225 330 q7 24 31 31 q-24 7 -31 31 q-7 -24 -31 -31 q24 -7 31 -31 Z" fill="#ffffff" opacity="0.9"/>
    <circle cx="690" cy="760" r="11" fill="#ffffff" opacity="0.75"/>`;
}

function defs(): string {
  return `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#7a5cff"/>
      <stop offset="0.55" stop-color="#5132ea"/>
      <stop offset="1" stop-color="#3517b8"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.28" cy="0.2" r="0.75">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.28"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vignette" cx="0.5" cy="0.45" r="0.75">
      <stop offset="0.6" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#10053f" stop-opacity="0.35"/>
    </radialGradient>
    <linearGradient id="chalk" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#ece6ff"/>
    </linearGradient>
    <linearGradient id="faceTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe083"/><stop offset="1" stop-color="#ffc93b"/></linearGradient>
    <linearGradient id="faceMid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffbd2a"/><stop offset="1" stop-color="#f6a311"/></linearGradient>
    <linearGradient id="faceBot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8920c"/><stop offset="1" stop-color="#c97506"/></linearGradient>
    <linearGradient id="wood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e2ad72"/><stop offset="1" stop-color="#f3cf9e"/></linearGradient>
    <linearGradient id="lead" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#23232b"/><stop offset="1" stop-color="#4a4a57"/></linearGradient>
    <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f4f5f8"/><stop offset="0.35" stop-color="#cfd3dc"/><stop offset="0.7" stop-color="#a9afbd"/><stop offset="1" stop-color="#8d93a3"/>
    </linearGradient>
    <linearGradient id="eraser" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb3bd"/><stop offset="1" stop-color="#ee7f8f"/></linearGradient>
    <filter id="blur18" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="18"/></filter>
    <filter id="blur12" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="12"/></filter>
    <clipPath id="round"><rect width="${S}" height="${S}" rx="${S * 0.225}"/></clipPath>
  </defs>`;
}

/**
 * @param kind rounded: yuvarlatılmış kare, şeffaf köşeler; full: tam dolu kare; maskable: tam dolu, içerik %76
 */
function iconSvg(kind: 'rounded' | 'full' | 'maskable'): string {
  const bg = `<rect width="${S}" height="${S}" fill="url(#bg)"/><rect width="${S}" height="${S}" fill="url(#glow)"/><rect width="${S}" height="${S}" fill="url(#vignette)"/>`;
  const scale = kind === 'maskable' ? 0.76 : 0.94;
  const off = (S * (1 - scale)) / 2;
  const content = `<g transform="translate(${off} ${off}) scale(${scale}) translate(48 -58)">${art()}</g>`;
  const body = kind === 'rounded' ? `<g clip-path="url(#round)">${bg}${content}</g>` : `${bg}${content}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">${defs()}${body}</svg>`;
}

if (process.env.ICON_COMPARE) {
  const tiles = [];
  for (let v = 0; v < VARIANTS.length; v++) {
    variant = v;
    tiles.push(await sharp(Buffer.from(iconSvg('rounded'))).resize(360).png().toBuffer());
  }
  await sharp({ create: { width: 20 + tiles.length * 380, height: 400, channels: 4, background: '#f2f2f7' } })
    .composite(tiles.map((t, i) => ({ input: t, left: 20 + i * 380, top: 20 })))
    .png()
    .toFile('.render/icon-variants.png');
  console.log('varyantlar: .render/icon-variants.png');
  process.exit(0);
}

mkdirSync('public/icons', { recursive: true });
mkdirSync('.render', { recursive: true });
const rounded = Buffer.from(iconSvg('rounded'));
const full = Buffer.from(iconSvg('full'));
await sharp(rounded).resize(512).png().toFile('public/icons/icon-512.png');
await sharp(rounded).resize(192).png().toFile('public/icons/icon-192.png');
await sharp(Buffer.from(iconSvg('maskable'))).resize(512).png().toFile('public/icons/icon-maskable-512.png');
await sharp(full).resize(180).png().toFile('public/icons/apple-touch-icon.png');
writeFileSync('public/favicon.svg', iconSvg('rounded'));

// --- Android / iOS yerel uygulama kaynakları (npx @capacitor/assets generate) ---
mkdirSync('assets', { recursive: true });
const bgOnly = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">${defs()}<rect width="${S}" height="${S}" fill="url(#bg)"/><rect width="${S}" height="${S}" fill="url(#glow)"/><rect width="${S}" height="${S}" fill="url(#vignette)"/></svg>`;
// Uyarlanabilir ikonun ön planı: şeffaf, içerik güvenli alanda (%64)
const fg = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">${defs()}<g transform="translate(${S * 0.18} ${S * 0.18}) scale(0.64) translate(48 -58)">${art()}</g></svg>`;
await sharp(full).resize(1024).png().toFile('assets/icon-only.png');
await sharp(Buffer.from(fg)).png().toFile('assets/icon-foreground.png');
await sharp(Buffer.from(bgOnly)).png().toFile('assets/icon-background.png');
// Açılış ekranı: indigo zemin ortasında ikon
const SP = 2732;
const splash = `<svg xmlns="http://www.w3.org/2000/svg" width="${SP}" height="${SP}">${defs().replace(/rx="[^"]+"/, 'rx="0"')}
  <rect width="${SP}" height="${SP}" fill="#4629d6"/>
  <g transform="translate(${(SP - 760) / 2} ${(SP - 760) / 2}) scale(${760 / S})"><g clip-path="url(#round)"><rect width="${S}" height="${S}" fill="url(#bg)"/><rect width="${S}" height="${S}" fill="url(#glow)"/><g transform="translate(${S * 0.03} ${S * 0.03}) scale(0.94) translate(48 -58)">${art()}</g></g></g></svg>`;
await sharp(Buffer.from(splash)).png().toFile('assets/splash.png');
await sharp(Buffer.from(splash)).png().toFile('assets/splash-dark.png');

// Önizleme: gerçek kullanım boyutlarında
const sizes = [512, 180, 120, 64, 32];
const tiles = await Promise.all(sizes.map((s) => sharp(rounded).resize(s).png().toBuffer()));
let x = 20;
const comps = tiles.map((t, i) => {
  const c = { input: t, left: x, top: 20 + (512 - sizes[i]) / 2 };
  x += sizes[i] + 30;
  return c;
});
await sharp({ create: { width: x, height: 552, channels: 4, background: '#f2f2f7' } }).composite(comps).png().toFile('.render/icon-preview.png');
console.log('ikonlar üretildi');
