/**
 * Yazdırılabilir boyama sayfaları.
 *
 * Seçilen derslerin boş konturlarını A4 dikey sayfalara dizip tek bir PDF yapar. Ebeveyn bunu
 * yazdırıp çocuğa verir: ekransız oyun. Her sayfada iki çizim ve altlarında adı vardır.
 */
import { lessonShapes } from '../art/sketch';
import type { Lesson, Shape } from '../lessons/types';
import { canvasToJpeg, makePdf, type PdfPage } from './pdf';

/** Çizim çözünürlüğü (A4 dikeye yakın, ~150 dpi). */
const W = 1240, H = 1754;
/** PDF sayfa ölçüsü: A4 dikey (punto). */
const PAGE_W = 595, PAGE_H = 842;
const INK = '#2b2250';

/** Dersin konturlarını (dolgusuz, kalın çizgili) bir SVG olarak verir. */
function outlineSvg(shapes: Shape[], size: number): string {
  const paths = shapes
    .filter((s) => !s.guide)
    .map((s) => `<path d="${s.d}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="-10 -10 420 420">${paths}</svg>`;
}

/** SVG metnini bir resme çevirip hedef tuvale çizer. */
function draw(ctx: CanvasRenderingContext2D, svg: string, x: number, y: number, size: number): Promise<void> {
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, x, y, size, size);
      res();
    };
    img.onerror = () => res();
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}

/**
 * Seçilen derslerden boyama kitabı PDF'i üretir (sayfa başına iki çizim).
 * @param baslik ilk sayfanın üstünde yazan ad (çocuğun adı)
 */
export async function coloringPdf(lessons: Lesson[], baslik: string): Promise<Blob> {
  const sayfalar: PdfPage[] = [];
  for (let i = 0; i < lessons.length; i += 2) {
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const x = c.getContext('2d')!;
    x.fillStyle = '#ffffff';
    x.fillRect(0, 0, W, H);
    // üst başlık
    x.fillStyle = '#8c766e';
    x.font = '600 34px Nunito, sans-serif';
    x.textAlign = 'center';
    x.fillText(`${baslik} · Çizio boyama sayfası`, W / 2, 72);

    const ikili = lessons.slice(i, i + 2);
    for (let k = 0; k < ikili.length; k++) {
      const size = 900;
      const left = (W - size) / 2;
      const top = 130 + k * 790;
      await draw(x, outlineSvg(lessonShapes(ikili[k]), size), left, top, size);
      x.fillStyle = '#5b463f';
      x.font = '700 40px Fredoka, Nunito, sans-serif';
      x.fillText(ikili[k].title, W / 2, top + size - 40);
    }
    // alt bilgi
    x.fillStyle = '#b8b0a6';
    x.font = '500 26px Nunito, sans-serif';
    x.fillText('cizio', W / 2, H - 50);
    sayfalar.push(await canvasToJpeg(c, 0.9));
  }
  return makePdf(sayfalar, PAGE_W, PAGE_H);
}
