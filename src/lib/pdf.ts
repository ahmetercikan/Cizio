/**
 * En küçük PDF yazıcı: her sayfa tam sayfa bir JPEG resimdir (sayfalar önce tuvale çizilir; böylece Türkçe
 * harfler ve uygulamanın yazı tipi sorunsuz görünür, ek kütüphane gerekmez).
 */
export interface PdfPage {
  jpeg: Uint8Array;
  /** Resmin piksel boyutu. */
  width: number;
  height: number;
}

/** Sayfaları A4 yatay (842x595 pt) bir PDF'e dizer. */
export function makePdf(pages: PdfPage[], pageW = 842, pageH = 595): Blob {
  const enc = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [];
  let pos = 0;
  const put = (x: string | Uint8Array) => {
    const b = typeof x === 'string' ? enc.encode(x) : x;
    chunks.push(b);
    pos += b.length;
  };
  const obj = (n: number, body: () => void) => {
    offsets[n] = pos;
    put(`${n} 0 obj\n`);
    body();
    put('\nendobj\n');
  };

  put('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  const n = pages.length;
  // 1: katalog, 2: sayfalar, sonra her sayfa için 3 nesne (sayfa, resim, içerik)
  const pageObj = (i: number) => 3 + i * 3;
  obj(1, () => put('<< /Type /Catalog /Pages 2 0 R >>'));
  obj(2, () => put(`<< /Type /Pages /Count ${n} /Kids [${pages.map((_, i) => `${pageObj(i)} 0 R`).join(' ')}] >>`));
  pages.forEach((p, i) => {
    const po = pageObj(i), io = po + 1, co = po + 2;
    obj(po, () => put(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im${i} ${io} 0 R >> >> /Contents ${co} 0 R >>`));
    obj(io, () => {
      put(`<< /Type /XObject /Subtype /Image /Width ${p.width} /Height ${p.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.jpeg.length} >>\nstream\n`);
      put(p.jpeg);
      put('\nendstream');
    });
    const content = `q ${pageW} 0 0 ${pageH} 0 0 cm /Im${i} Do Q`;
    obj(co, () => put(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`));
  });
  const xref = pos;
  const count = 3 + n * 3;
  put(`xref\n0 ${count}\n0000000000 65535 f \n`);
  for (let i = 1; i < count; i++) put(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  put(`trailer\n<< /Size ${count} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  return new Blob(chunks as BlobPart[], { type: 'application/pdf' });
}

export async function canvasToJpeg(c: HTMLCanvasElement, quality = 0.88): Promise<PdfPage> {
  const blob = await new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('toBlob'))), 'image/jpeg', quality));
  return { jpeg: new Uint8Array(await blob.arrayBuffer()), width: c.width, height: c.height };
}
