/**
 * Adanın dokuları: Giydir karakteri ve Çizio maskotu (SVG → tuval) ile galerideki resimler.
 */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Mascot } from '../components/Mascot';
import type { DollState } from '../dressup/catalog';
import { Doll, type DollLayer } from '../dressup/Doll';
import { LessonArt } from '../english/Art';
import { listArtworks } from '../lib/gallery';

async function svgToCanvas(svg: string, w: number, h: number): Promise<HTMLCanvasElement> {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    c.getContext('2d')!.drawImage(img, 0, 0, w, h);
  } finally {
    URL.revokeObjectURL(url);
  }
  return c;
}

/** Kök <svg> etiketine xmlns ve piksel boyutu yazar (varsa eskilerini kaldırarak). */
const withSize = (svg: string, w: number, h: number) =>
  svg.replace(/^<svg([^>]*)>/, (_, attrs: string) => {
    const rest = attrs.replace(/\s(width|height|xmlns)="[^"]*"/g, '');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"${rest}>`;
  });

/** Giydir karakteri (arka plansız), 300x440 oranında. */
export async function dollCanvas(d: DollState): Promise<HTMLCanvasElement> {
  const svg = renderToStaticMarkup(createElement(Doll, { d, bg: false }));
  return svgToCanvas(withSize(svg, 360, 528), 360, 528);
}

/** Kukla parçaları (viewBox 300x440 → 360x528 piksel; ölçek 1.2). */
export interface DollParts {
  base: HTMLCanvasElement;
  armL: HTMLCanvasElement;
  armR: HTMLCanvasElement;
  legL: HTMLCanvasElement;
  legR: HTMLCanvasElement;
  pet: HTMLCanvasElement | null;
  /** Bacakların kesildiği yükseklik (viewBox birimi): eteğin/elbisenin altından. */
  splitY: number;
}

const SKIRTS: Record<string, number> = { etek: 362, uzunetek: 400, tutu: 346 };

/** Giydir karakterini yürüyen bir kâğıt kuklaya ayırır: gövde, iki kol, iki bacak, evcil hayvan. */
export async function dollParts(d: DollState): Promise<DollParts> {
  const W = 360, H = 528, K = 1.2;
  const layer = (l: DollLayer) => svgToCanvas(withSize(renderToStaticMarkup(createElement(Doll, { d, bg: false, layer: l })), W, H), W, H);
  const [base, armL, armR, pet] = await Promise.all([layer('base'), layer('armL'), layer('armR'), d.pet ? layer('pet') : Promise.resolve(null)]);
  const splitY = d.dress ? 372 : SKIRTS[d.bottom] ?? 318;
  // Bacaklar: gövdeden kesilir (sol yarı / sağ yarı, kesim çizgisinin altı)
  const cut = (x0: number, x1: number) => {
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d')!;
    ctx.beginPath();
    ctx.rect(x0 * K, splitY * K, (x1 - x0) * K, H - splitY * K);
    ctx.clip();
    ctx.drawImage(base, 0, 0);
    return c;
  };
  const legL = cut(0, 150), legR = cut(150, 300);
  base.getContext('2d')!.clearRect(0, splitY * K, W, H);
  return { base, armL, armR, legL, legR, pet, splitY };
}

/** Evcil hayvan katmanı (Giydir kuklası tuvali boyutunda; adada kesilip kart yapılır). */
export async function petCanvas(d: DollState): Promise<HTMLCanvasElement> {
  return svgToCanvas(withSize(renderToStaticMarkup(createElement(Doll, { d, bg: false, layer: 'pet' })), 360, 528), 360, 528);
}

/** Ders çiziminin renkli hâli (adada dolaşan hayvanlar için). */
export async function lessonCanvas(id: string, size = 256): Promise<HTMLCanvasElement> {
  const svg = renderToStaticMarkup(createElement(LessonArt, { id }));
  return svgToCanvas(withSize(svg, size, size), size, size);
}

export async function mascotCanvas(): Promise<HTMLCanvasElement> {
  const svg = renderToStaticMarkup(createElement(Mascot, { size: 256, mood: 'happy' }));
  return svgToCanvas(withSize(svg, 256, 256), 256, 256);
}

/** Galerideki son resimler (sanat galerisinin sehpaları için). */
export async function artCanvases(profileId: string, n = 5): Promise<HTMLCanvasElement[]> {
  const arts = (await listArtworks(profileId)).filter((a) => a.kind !== 'style').slice(0, n);
  return Promise.all(
    arts.map(async (a) => {
      const bmp = await createImageBitmap(a.blob);
      const c = document.createElement('canvas');
      c.width = c.height = 256;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, 256, 256);
      const k = Math.min(256 / bmp.width, 256 / bmp.height);
      ctx.drawImage(bmp, (256 - bmp.width * k) / 2, (256 - bmp.height * k) / 2, bmp.width * k, bmp.height * k);
      bmp.close?.();
      return c;
    }),
  );
}
