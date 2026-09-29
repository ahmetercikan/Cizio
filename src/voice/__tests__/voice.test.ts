import { afterEach, describe, expect, it, vi } from 'vitest';
import { allFeedbackTexts, feedbackText, type PartResult, type ScoreResult } from '../../engine/scoring';
import { lessons } from '../../lessons';
import { lineKey, normalizeLine } from '../hash';
import { LESSON_LINES, STATIC_LINES } from '../lines';

describe('lineKey', () => {
  it('sabit ve 8 haneli hex üretir', () => {
    // FNV-1a 32 bit bilinen değerler
    expect(lineKey('')).toBe('811c9dc5');
    expect(lineKey('a')).toBe('e40c292c');
    expect(lineKey('foobar')).toBe('bf9cf968');
    const k = lineKey('Merhaba! Ben Çizio. Birlikte çizim yapalım mı?');
    expect(k).toMatch(/^[0-9a-f]{8}$/);
    expect(lineKey('Merhaba! Ben Çizio. Birlikte çizim yapalım mı?')).toBe(k);
  });

  it('boşlukları normalleştirir', () => {
    expect(normalizeLine('  Önce   çizmeyi\n dene!\t')).toBe('Önce çizmeyi dene!');
    expect(lineKey('  Önce   çizmeyi\n dene!\t')).toBe(lineKey('Önce çizmeyi dene!'));
    // NFC: ayrışık "ç" (c + birleşik çengel) aynı anahtarı verir
    expect(lineKey('çiz')).toBe(lineKey('çiz'));
  });

  it('farklı cümleler farklı anahtar alır', () => {
    expect(lineKey('Harika!')).not.toBe(lineKey('Harika'));
    expect(lineKey('Süpersin!')).not.toBe(lineKey('süpersin!'));
  });

  it('tüm anlatım cümlelerinde çakışma yok', () => {
    const texts = new Set<string>();
    for (const l of lessons) for (const s of l.steps) texts.add(normalizeLine(s.say));
    for (const t of STATIC_LINES) texts.add(normalizeLine(t));
    for (const l of lessons) for (const f of LESSON_LINES) texts.add(normalizeLine(f(l)));
    const parts = lessons.flatMap((l) => l.steps.flatMap((s) => s.shapes.map((sh) => sh.part ?? '')));
    for (const t of allFeedbackTexts(parts)) texts.add(normalizeLine(t));
    const keys = new Set([...texts].map(lineKey));
    expect(keys.size).toBe(texts.size);
  });
});

describe('allFeedbackTexts', () => {
  afterEach(() => vi.restoreAllMocks());

  const partNames = ['kafa', 'sol kulak', 'sağ kulak', 'ıhlamur yaprağı', 'İğne', 'çatı'];
  const all = new Set(allFeedbackTexts(partNames));

  const result = (stars: 0 | 1 | 2 | 3, precision: number, parts: PartResult[]): ScoreResult => ({
    coverage: 0.5, precision, score: 0.5, stars, parts, missed: [],
  });

  const partSets: PartResult[][] = [
    [],
    // zayıf parça yok (hepsi iyi ya da kısa)
    [{ part: 'kafa', coverage: 0.9, length: 200 }, { part: 'sol kulak', coverage: 0.1, length: 10 }],
    // tek zayıf parça
    [{ part: 'kafa', coverage: 0.2, length: 200 }],
    // birden çok zayıf parça: en düşük seçilir
    [{ part: 'sol kulak', coverage: 0.5, length: 80 }, { part: 'sağ kulak', coverage: 0.1, length: 80 }],
    // Türkçe büyük harf (ı → I, i → İ)
    [{ part: 'ıhlamur yaprağı', coverage: 0, length: 50 }],
    [{ part: 'İğne', coverage: 0.3, length: 40 }, { part: 'çatı', coverage: 0.4, length: 120 }],
    // parça adı olmayan şekil
    [{ part: '', coverage: 0, length: 300 }],
  ];

  it('feedbackText her zaman listede olan bir cümle döndürür', () => {
    let checked = 0;
    for (const stars of [0, 1, 2, 3] as const)
      for (const precision of [0, 0.3, 0.59, 0.6, 0.95])
        for (const parts of partSets)
          for (const rnd of [0, 0.19, 0.2, 0.39, 0.4, 0.59, 0.6, 0.79, 0.8, 0.999]) {
            vi.spyOn(Math, 'random').mockReturnValue(rnd);
            const t = feedbackText(result(stars, precision, parts));
            expect(all, t).toContain(t);
            checked++;
          }
    expect(checked).toBeGreaterThan(500);
  });

  it('parça kalıplarını ve Türkçe büyük harfi içerir', () => {
    expect(all).toContain('Çok iyi! Kafa biraz eksik kaldı.');
    expect(all).toContain('Güzel deneme! Sol kulak kısmına bir daha bak.');
    expect(all).toContain('Çok iyi! Ihlamur yaprağı biraz eksik kaldı.');
    expect(all).toContain('Güzel deneme! Çatı kısmına bir daha bak.');
    expect(all).toContain('Harika!');
    expect(all).toContain('Hadi bir daha deneyelim! Turuncu noktaları takip et.');
  });

  it('yinelenen cümle döndürmez', () => {
    const list = allFeedbackTexts(['kafa', 'kafa', '']);
    expect(new Set(list).size).toBe(list.length);
  });
});
