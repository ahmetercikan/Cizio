/**
 * Adanın dokuları: Giydir karakteri ve Çizio maskotu (SVG → tuval) ile galerideki resimler.
 */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Mascot } from '../components/Mascot';
import type { DollState } from '../dressup/catalog';
import { Doll } from '../dressup/Doll';
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
