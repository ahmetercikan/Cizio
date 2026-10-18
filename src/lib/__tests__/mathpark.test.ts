import { describe, expect, it } from 'vitest';
import { clockText, MATH_GAMES, MATH_LINES, mathGame, question, saatDogru, type MathGame } from '../mathpark';

const oyunlar: MathGame[] = ['say', 'topla', 'cikar', 'saat'];

describe('Matematik Parkı', () => {
  it('dört oyun var ve hepsi tanımlı', () => {
    expect(MATH_GAMES).toHaveLength(4);
    for (const g of oyunlar) expect(mathGame(g)?.name, g).toBeTruthy();
  });

  it('her soruda doğru cevap seçenekler içinde ve üç seçenek var', () => {
    for (const g of oyunlar) for (const lv of [1, 2, 3] as const) {
      for (let i = 0; i < 80; i++) {
        const q = question(g, lv);
        expect(q.options, `${g}/${lv}`).toHaveLength(3);
        expect(q.options, `${g}/${lv}`).toContain(q.answer);
        expect(new Set(q.options).size, `${g}/${lv} tekrar eden seçenek`).toBe(3);
        expect(q.text, g).toBeTruthy();
        expect(q.say, g).toBeTruthy();
      }
    }
  });

  it('çıkarmada sonuç hiç eksiye düşmez', () => {
    for (const lv of [1, 2, 3] as const) for (let i = 0; i < 150; i++) {
      const q = question('cikar', lv);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      for (const o of q.options) expect(o).toBeGreaterThanOrEqual(0);
    }
  });

  it('kolay seviyede sayılar küçük kalır', () => {
    for (let i = 0; i < 100; i++) {
      expect(question('say', 1).answer).toBeLessThanOrEqual(5);
      expect(question('topla', 1).answer).toBeLessThanOrEqual(8);
    }
  });

  it('saat oyunu tam ve buçuk saat verir', () => {
    for (let i = 0; i < 100; i++) {
      const q = question('saat', 3);
      expect(q.clock).toBeDefined();
      const [h, m] = q.clock!;
      expect(h).toBeGreaterThanOrEqual(1);
      expect(h).toBeLessThanOrEqual(12);
      expect([0, 30]).toContain(m);
      expect(q.answer).toBe(h);
    }
  });

  it('oyunun sesli okuduğu her soru ve saat cevabı seslendirme listesinde', () => {
    const liste = new Set(MATH_LINES);
    for (const g of oyunlar) for (const lv of [1, 2, 3] as const) {
      for (let i = 0; i < 400; i++) {
        const q = question(g, lv);
        expect(liste.has(q.say), `${g}/${lv}: ${q.say}`).toBe(true);
        if (q.clock) expect(liste.has(saatDogru(q.clock[0], q.clock[1])), `${g}/${lv}: saat cevabı`).toBe(true);
      }
    }
  });

  it('saat okunuşu Türkçe ve tekrarsız', () => {
    expect(clockText(3, 0)).toBe('saat üç');
    expect(clockText(3, 30)).toBe('üç buçuk');
    expect(clockText(12, 0)).toBe('saat on iki');
    expect(new Set(MATH_LINES).size).toBe(MATH_LINES.length);
  });
});
