import { describe, expect, it } from 'vitest';
import { lessons } from '../../lessons';
import { buyuk, kucuk } from '../../trace/glyphs';
import { ABC, ABC_LINES, abcDoneLine, abcLine, abcSoundLine } from '../abc';
import { englishLines } from '../data';

describe('ABC (harf sesleri)', () => {
  it('26 harfin hepsi var ve sırayla', () => {
    expect(ABC).toHaveLength(26);
    expect(ABC.map((a) => a.ch).join('')).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  });

  it('her harfin sesi, kelimesi ve resmi var', () => {
    for (const a of ABC) {
      expect(a.sound, a.ch).toBeTruthy();
      expect(a.word, a.ch).toBeTruthy();
      expect(a.wordTr, a.ch).toBeTruthy();
      // kelime harfle başlar (ks sesi veren X dışında)
      if (a.ch !== 'X') expect(a.word.charAt(0).toUpperCase(), a.ch).toBe(a.ch);
    }
  });

  it('resimler var olan derslere bakar', () => {
    const ids = new Set(lessons.map((l) => l.id));
    for (const a of ABC) {
      if (a.art.k === 'lesson') expect(ids.has(a.art.id), `${a.ch}: ${a.art.id}`).toBe(true);
    }
  });

  it('her harfin büyük ve küçük yazma şekli var', () => {
    for (const a of ABC) {
      expect(buyuk(a.ch).strokes.length, a.ch).toBeGreaterThan(0);
      expect(kucuk(a.ch).strokes.length, a.ch).toBeGreaterThan(0);
    }
  });

  it('cümleler seslendirme listesine giriyor', () => {
    const all = englishLines();
    for (const a of ABC.slice(0, 5)) {
      expect(all).toContain(abcLine(a));
      expect(all).toContain(abcSoundLine(a));
      expect(all).toContain(abcDoneLine(a));
    }
    expect(new Set(ABC_LINES).size).toBe(ABC_LINES.length);
  });
});
