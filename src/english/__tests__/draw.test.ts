import { describe, expect, it } from 'vitest';
import { getLesson } from '../../lessons';
import { englishLines } from '../data';
import { DRAW_LINES, EN_DRAW, EN_DRAW_IDS } from '../draw';

describe('Draw in English', () => {
  it('her ders gerçekten var', () => {
    for (const id of EN_DRAW_IDS) expect(getLesson(id), id).toBeTruthy();
  });

  it('adım sayısı dersle birebir aynı', () => {
    for (const id of EN_DRAW_IDS) {
      const l = getLesson(id)!;
      expect(EN_DRAW[id].steps.length, `${id} (${l.title})`).toBe(l.steps.length);
    }
  });

  it('cümleler boş değil ve çocuk için kısa', () => {
    for (const id of EN_DRAW_IDS) {
      expect(EN_DRAW[id].title, id).toBeTruthy();
      for (const s of EN_DRAW[id].steps) {
        expect(s.length, `${id}: ${s}`).toBeGreaterThan(12);
        expect(s.length, `${id}: ${s}`).toBeLessThan(120);
      }
    }
  });

  it('seslendirme listesine giriyor', () => {
    const all = englishLines();
    expect(all).toContain(EN_DRAW.kedi.steps[0]);
    expect(new Set(DRAW_LINES).size).toBe(DRAW_LINES.length);
  });
});
