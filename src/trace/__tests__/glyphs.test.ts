import { describe, expect, it } from 'vitest';
import { samplePath } from '../../engine/pathSampler';
import { buyuk, EN_HARFLER, harfCifti, kucuk, kucukHarf, SAYILAR, sayi, TR_HARFLER, type Glyph } from '../glyphs';
import { harfCumlesi, HARF_KELIME, HARF_SES, sayiCumlesi, SAYI_SES, TRACE_VOICE_LINES } from '../lines';

const hepsi = (): Glyph[] => [
  ...TR_HARFLER.flatMap((c) => harfCifti(c)),
  ...EN_HARFLER.flatMap((c) => [buyuk(c), kucuk(c)]),
  ...SAYILAR.map((n) => sayi(n)),
];

describe('harf ve rakam şekilleri', () => {
  it('her harfin ve rakamın kalem hareketi var', () => {
    for (const g of hepsi()) {
      expect(g.strokes.length, g.id).toBeGreaterThan(0);
      expect(g.strokes.length, g.id).toBeLessThanOrEqual(6);
      expect(g.ch.length, g.id).toBeGreaterThan(0);
    }
  });

  it('her kalem hareketi okunabilir ve yazı alanının içinde', () => {
    for (const g of hepsi()) {
      for (const d of g.strokes) {
        const { points, length } = samplePath(d, 4);
        expect(points.length, `${g.id}: ${d}`).toBeGreaterThan(1);
        // çok kısa hareket (nokta dışında) olmaz
        expect(length, `${g.id}: ${d}`).toBeGreaterThan(18);
        for (const [x, y] of points) {
          expect(x, `${g.id} x`).toBeGreaterThan(-5);
          expect(x, `${g.id} x`).toBeLessThan(405);
          expect(y, `${g.id} y`).toBeGreaterThan(-5);
          expect(y, `${g.id} y`).toBeLessThan(405);
        }
      }
    }
  });

  it('harfler yazı çizgilerine oturur', () => {
    const alt = (g: Glyph) => Math.max(...g.strokes.flatMap((d) => samplePath(d, 6).points.map((p) => p[1])));
    for (const ch of TR_HARFLER) {
      // büyük harfin tabanı taban çizgisinde (320) biter; nokta/kuyruk için pay var
      expect(alt(buyuk(ch)), `büyük ${ch}`).toBeGreaterThan(290);
      expect(alt(buyuk(ch)), `büyük ${ch}`).toBeLessThan(366);
    }
  });

  it('Türkçede I küçülünce ı, İ küçülünce i olur', () => {
    expect(kucukHarf('I')).toBe('ı');
    expect(kucukHarf('İ')).toBe('i');
    expect(kucukHarf('A')).toBe('a');
    expect(kucuk('I').ch).toBe('ı');
    expect(kucuk('İ').ch).toBe('i');
  });

  it('şapkalı harfler temel harften bir fazla hareketle kurulur', () => {
    expect(buyuk('Ç').strokes.length).toBe(buyuk('C').strokes.length + 1);
    expect(buyuk('Ö').strokes.length).toBe(buyuk('O').strokes.length + 2);
    expect(kucuk('Ü').strokes.length).toBe(kucuk('U').strokes.length + 2);
  });
});

describe('harf ve rakam cümleleri', () => {
  it('her harfin okunuşu ve örnek kelimesi var', () => {
    for (const ch of [...TR_HARFLER, ...EN_HARFLER]) {
      expect(HARF_SES[ch], ch).toBeTruthy();
      expect(HARF_KELIME[ch], ch).toBeTruthy();
      expect(harfCumlesi(ch).toLocaleLowerCase('tr'), ch).toContain(HARF_KELIME[ch]);
    }
  });

  it('her rakamın okunuşu var', () => {
    for (const n of SAYILAR) {
      expect(SAYI_SES[n], n).toBeTruthy();
      expect(sayiCumlesi(n).toLocaleLowerCase('tr'), n).toContain(SAYI_SES[n]);
    }
  });

  it('seslendirme listesinde çakışan cümle yok', () => {
    expect(new Set(TRACE_VOICE_LINES).size).toBe(TRACE_VOICE_LINES.length);
  });
});
