/**
 * Canlanan çizimin sahneleri ve gövde hareketleri (yalnızca tuval; hepsi kodla çizilir, resim dosyası yok).
 * Sahneler `scroll` ile kayar: oyunda ve sürüşte zemin akar.
 */
import type { Body, Scene } from './motion';

const INK = '#3a2b27';
type Ctx = CanvasRenderingContext2D;

// Sabit "rastgele" sayılar: her karede aynı yerde dursunlar diye
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const wrap = (v: number, m: number) => ((v % m) + m) % m;

function cloud(ctx: Ctx, x: number, y: number, s: number, fill = '#fff') {
  ctx.save();
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, s * 0.5, 0, Math.PI * 2);
  ctx.arc(x + s * 0.55, y + s * 0.1, s * 0.4, 0, Math.PI * 2);
  ctx.arc(x - s * 0.55, y + s * 0.12, s * 0.36, 0, Math.PI * 2);
  ctx.arc(x + s * 0.15, y + s * 0.25, s * 0.42, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function star(ctx: Ctx, x: number, y: number, r: number, fill: string, stroke = true) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = INK;
    ctx.lineWidth = Math.max(1.5, r * 0.14);
    ctx.lineJoin = 'round';
    ctx.stroke();
  }
}
export { star as drawStar, cloud as drawCloud };

function hills(ctx: Ctx, w: number, h: number, top: number, scroll: number, colors: [string, string]) {
  colors.forEach((c, layer) => {
    const sp = layer ? 0.35 : 0.18;
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w + 20; x += 20) {
      const X = x + scroll * sp;
      ctx.lineTo(x, top + layer * h * 0.06 + Math.sin(X / (160 + layer * 60)) * h * 0.04 + Math.sin(X / 73) * h * 0.012);
    }
    ctx.lineTo(w, h);
    ctx.fill();
  });
}

/** Zemin çizgisinin y'si (koşan/sürülen sahnelerde karakter buraya basar). */
export const groundY = (scene: Scene, h: number) => (scene === 'road' ? h * 0.8 : h * 0.82);

export function drawScene(ctx: Ctx, scene: Scene, w: number, h: number, t: number, scroll = 0) {
  const g = (stops: string[]) => {
    const gr = ctx.createLinearGradient(0, 0, 0, h);
    stops.forEach((c, i) => gr.addColorStop(i / (stops.length - 1), c));
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, w, h);
  };
  switch (scene) {
    case 'space': {
      g(['#15123a', '#2b2366', '#43307f']);
      for (let i = 0; i < 70; i++) {
        const x = wrap(rnd(i) * w - scroll * 0.1 * (0.3 + rnd(i + 9)), w), y = rnd(i + 3) * h;
        const tw = 0.5 + 0.5 * Math.sin(t * (1 + rnd(i + 5) * 3) + i);
        ctx.fillStyle = `rgba(255,255,230,${0.35 + tw * 0.6})`;
        ctx.fillRect(x, y, 2 + rnd(i + 7) * 2, 2 + rnd(i + 7) * 2);
      }
      ctx.fillStyle = '#ff8fb1';
      ctx.beginPath();
      ctx.arc(wrap(w * 0.82 - scroll * 0.05, w + 200) - 100, h * 0.22, Math.min(w, h) * 0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffd43b';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(wrap(w * 0.82 - scroll * 0.05, w + 200) - 100, h * 0.22, Math.min(w, h) * 0.13, Math.min(w, h) * 0.03, -0.3, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'sea': {
      g(['#8fe3f5', '#3fb7dd', '#1c86b8']);
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 5; i++) {
        const x = w * (0.1 + i * 0.22) + Math.sin(t * 0.4 + i) * 20;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + w * 0.06, 0);
        ctx.lineTo(x - w * 0.05, h);
        ctx.lineTo(x - w * 0.12, h);
        ctx.fill();
      }
      ctx.restore();
      // kum ve yosunlar
      ctx.fillStyle = '#f3dca2';
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w + 20; x += 20) ctx.lineTo(x, h * 0.9 + Math.sin((x + scroll * 0.5) / 90) * h * 0.02);
      ctx.lineTo(w, h);
      ctx.fill();
      for (let i = 0; i < 9; i++) {
        const x = wrap(rnd(i) * w * 1.3 - scroll * 0.5, w * 1.3) - w * 0.15, hh = h * (0.1 + rnd(i + 2) * 0.12);
        ctx.strokeStyle = i % 2 ? '#2bb673' : '#1f9a5f';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x, h * 0.92);
        ctx.quadraticCurveTo(x + Math.sin(t * 1.5 + i) * 14, h * 0.92 - hh / 2, x + Math.sin(t * 1.5 + i + 1) * 10, h * 0.92 - hh);
        ctx.stroke();
      }
      // kabarcıklar
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 18; i++) {
        const y = h - wrap(t * (30 + rnd(i) * 40) + rnd(i + 1) * h, h + 40);
        const x = wrap(rnd(i + 4) * w - scroll * 0.3, w) + Math.sin(t * 2 + i) * 6;
        ctx.beginPath();
        ctx.arc(x, y, 3 + rnd(i + 6) * 6, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
    }
    case 'snow': {
      g(['#bfe4ff', '#e6f5ff', '#ffffff']);
      hills(ctx, w, h, h * 0.68, scroll, ['#eef7ff', '#ffffff']);
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 50; i++) {
        const y = wrap(t * (25 + rnd(i) * 30) + rnd(i + 1) * h, h);
        const x = wrap(rnd(i + 3) * w + Math.sin(t + i) * 15 - scroll * 0.2, w);
        ctx.beginPath();
        ctx.arc(x, y, 2 + rnd(i + 5) * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'party': {
      g(['#fff4d6', '#ffe6ee', '#ffeede']);
      // bayrak süsü
      const cols = ['#ff6b4a', '#ffc83d', '#14a89a', '#e9487d', '#7c5cff'];
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.06);
      ctx.quadraticCurveTo(w / 2, h * 0.16, w, h * 0.06);
      ctx.stroke();
      for (let i = 0; i < 12; i++) {
        const u = (i + 0.5) / 12, x = u * w, y = h * 0.06 + 4 * u * (1 - u) * h * 0.1 * 0.5 * 2;
        ctx.fillStyle = cols[i % cols.length];
        ctx.beginPath();
        ctx.moveTo(x - w * 0.025, y);
        ctx.lineTo(x + w * 0.025, y);
        ctx.lineTo(x, y + h * 0.06);
        ctx.fill();
      }
      for (let i = 0; i < 40; i++) {
        const y = wrap(t * (40 + rnd(i) * 40) + rnd(i + 1) * h, h);
        const x = wrap(rnd(i + 2) * w - scroll * 0.3, w);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(t * 3 + i);
        ctx.fillStyle = cols[i % cols.length];
        ctx.fillRect(-4, -2, 8, 4);
        ctx.restore();
      }
      ctx.fillStyle = '#ffd9b3';
      ctx.fillRect(0, h * 0.86, w, h * 0.14);
      break;
    }
    case 'road': {
      g(['#a9e4ff', '#dff6ff']);
      for (let i = 0; i < 4; i++) cloud(ctx, wrap(rnd(i) * w * 1.4 - scroll * 0.08 - t * 8, w * 1.4) - w * 0.2, h * (0.12 + rnd(i + 2) * 0.18), Math.min(w, h) * 0.08);
      hills(ctx, w, h, h * 0.52, scroll, ['#9ad77c', '#6cc35a']);
      const top = groundY('road', h);
      ctx.fillStyle = '#8d8f99';
      ctx.fillRect(0, top, w, h - top);
      ctx.fillStyle = '#6f717a';
      ctx.fillRect(0, top, w, 6);
      ctx.fillStyle = '#fff';
      const dash = 70;
      for (let x = -dash * 2 + wrap(-scroll, dash * 2); x < w; x += dash * 2) ctx.fillRect(x, top + (h - top) * 0.5, dash, 6);
      break;
    }
    case 'sky': {
      g(['#8fd6ff', '#c6ecff', '#eef9ff']);
      for (let i = 0; i < 7; i++)
        cloud(ctx, wrap(rnd(i) * w * 1.4 - scroll * (0.2 + rnd(i + 8) * 0.3) - t * 10, w * 1.4) - w * 0.2, h * (0.1 + rnd(i + 2) * 0.75), Math.min(w, h) * (0.06 + rnd(i + 4) * 0.06));
      break;
    }
    default: {
      // meadow / garden
      g(['#a9e4ff', '#e3f7ff']);
      ctx.fillStyle = '#ffd43b';
      ctx.beginPath();
      ctx.arc(w * 0.85, h * 0.16, Math.min(w, h) * 0.07, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 3; i++) cloud(ctx, wrap(rnd(i) * w * 1.4 - scroll * 0.08 - t * 6, w * 1.4) - w * 0.2, h * (0.14 + rnd(i + 2) * 0.14), Math.min(w, h) * 0.07);
      hills(ctx, w, h, h * 0.62, scroll, ['#b7e48f', '#7fcf63']);
      const n = scene === 'garden' ? 22 : 12;
      for (let i = 0; i < n; i++) {
        const x = wrap(rnd(i) * w * 1.2 - scroll * 0.5, w * 1.2) - w * 0.1, y = h * (0.86 + rnd(i + 1) * 0.12);
        ctx.strokeStyle = '#3f9a4a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, y + 12);
        ctx.lineTo(x + Math.sin(t * 2 + i) * 2, y);
        ctx.stroke();
        ctx.fillStyle = ['#ff6b8a', '#ffc83d', '#ffffff', '#b98cff'][i % 4];
        ctx.beginPath();
        ctx.arc(x + Math.sin(t * 2 + i) * 2, y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

/** Ön plan: teknenin önündeki dalgalar. */
export function drawWaves(ctx: Ctx, w: number, h: number, t: number, y: number) {
  ctx.fillStyle = 'rgba(28,134,184,0.92)';
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let x = 0; x <= w + 10; x += 10) ctx.lineTo(x, y + Math.sin(x / 40 + t * 2) * 7 + Math.sin(x / 17 - t * 3) * 3);
  ctx.lineTo(w, h);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = 0; x <= w + 10; x += 10) ctx.lineTo(x, y + Math.sin(x / 40 + t * 2) * 7 + Math.sin(x / 17 - t * 3) * 3);
  ctx.stroke();
}

export interface Pose { x: number; y: number; rot: number; sx: number; sy: number; flip: boolean; spin: number }

/**
 * Gövde hareketi: sahne genişliği w, yüksekliği h, çizimin boyu `size`. `facing` çizimin baktığı yön (+1 sağ).
 */
export function bodyPose(body: Body, t: number, w: number, h: number, size: number, facing: number): Pose {
  const cx = w / 2, cy = h * 0.52;
  const p: Pose = { x: cx, y: cy, rot: 0, sx: 1, sy: 1, flip: false, spin: 1 };
  switch (body) {
    case 'bounce': {
      const u = (t % 1.5) / 1.5;
      p.y = h * 0.8 - size / 2;
      if (u < 0.55) p.y -= Math.sin((Math.PI * u) / 0.55) * size * 0.2;
      else if (u < 0.75) {
        const k = Math.sin((Math.PI * (u - 0.55)) / 0.2);
        p.sy = 1 - 0.1 * k;
        p.sx = 1 + 0.08 * k;
        p.y += size * 0.05 * k;
      }
      break;
    }
    case 'wobble':
      p.y = h * 0.8 - size / 2;
      p.sx = 1 + 0.05 * Math.sin(t * 5);
      p.sy = 1 - 0.05 * Math.sin(t * 5);
      p.rot = 0.05 * Math.sin(t * 2.5);
      break;
    case 'sway':
      p.y = h * 0.8 - size / 2;
      p.rot = 0.07 * Math.sin(t * 1.6);
      p.x += Math.sin(p.rot) * size * 0.5;
      break;
    case 'swim': {
      const vx = Math.cos(t * 0.45);
      p.x = cx + Math.sin(t * 0.45) * w * 0.26;
      p.y = cy + Math.sin(t * 1.8) * size * 0.06;
      p.rot = 0.06 * Math.sin(t * 1.8);
      p.flip = vx * facing < 0;
      break;
    }
    case 'drive':
      p.y = groundY('road', h) - size / 2 + 4 - Math.abs(Math.sin(t * 9)) * 3;
      p.rot = 0.015 * Math.sin(t * 9);
      p.spin = 2;
      break;
    case 'fly': {
      const vx = Math.cos(t * 0.5);
      p.x = cx + Math.sin(t * 0.5) * w * 0.22;
      p.y = cy - h * 0.05 + Math.sin(t * 1.1) * h * 0.08;
      p.flip = vx * facing < 0;
      p.rot = 0.08 * Math.cos(t * 1.1) * (p.flip ? -1 : 1);
      break;
    }
    case 'rocket': {
      const u = ((t + 2) % 5) / 5;
      p.y = h + size * 0.6 - u * (h + size * 1.4);
      p.x = cx + Math.sin(t * 40) * 1.5;
      break;
    }
    case 'float':
      p.y = cy + Math.sin(t * 1.2) * size * 0.07;
      p.x = cx + Math.sin(t * 0.6) * size * 0.06;
      p.rot = 0.04 * Math.sin(t * 0.9);
      break;
    case 'boat':
      p.y = h * 0.6 - size * 0.35 + Math.sin(t * 1.5) * 6;
      p.rot = 0.06 * Math.sin(t * 1.5);
      break;
  }
  return p;
}

/** Roket alevi ve egzoz dumanı gibi küçük efektler. */
export function drawFlame(ctx: Ctx, x: number, y: number, s: number, t: number) {
  for (let i = 0; i < 3; i++) {
    const k = 1 - i * 0.28, f = 0.8 + 0.2 * Math.sin(t * 30 + i);
    ctx.fillStyle = ['#ff6b4a', '#ffc83d', '#fff6d0'][i];
    ctx.beginPath();
    ctx.ellipse(x, y + s * 0.25 * k * f, s * 0.14 * k, s * 0.32 * k * f, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawPuffs(ctx: Ctx, x: number, y: number, s: number, t: number, dir: number) {
  for (let i = 0; i < 4; i++) {
    const u = wrap(t * 1.4 + i / 4, 1);
    ctx.fillStyle = `rgba(255,255,255,${0.8 * (1 - u)})`;
    ctx.beginPath();
    ctx.arc(x - dir * u * s * 0.6, y - u * s * 0.25, s * (0.05 + u * 0.08), 0, Math.PI * 2);
    ctx.fill();
  }
}
