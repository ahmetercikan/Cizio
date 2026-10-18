import { describe, expect, it } from 'vitest';
import { STORY_VOICE_LINES, THEMES } from '../data';
import { FILM_MAX, FILM_MIN, filmLength, filmScenes, filmTheme, sceneAt } from '../film';

const arts = (n: number) => Array.from({ length: n }, (_, i) => ({ lessonId: ['kedi', 'roket', 'yunus', 'ejderha', 'kelebek'][i] }));

describe('sinemadaki film', () => {
  it('sahneler boşluksuz sıralanır ve resimler sırayla gelir', () => {
    const s = filmScenes(arts(3), THEMES[0]);
    expect(s.length).toBeGreaterThan(5);
    let at = 0;
    for (const sc of s) {
      expect(sc.at).toBeCloseTo(at, 5);
      expect(sc.dur).toBeGreaterThanOrEqual(3.2);
      expect(sc.dur).toBeLessThanOrEqual(13);
      at += sc.dur;
    }
    expect(filmLength(s)).toBeCloseTo(at, 5);
    expect(s[0].art).toBe(0);
    expect(s[s.length - 1].art).toBe('all');
  });

  it('en çok FILM_MAX çizim oynar', () => {
    const s = filmScenes(arts(5), THEMES[1]);
    for (const sc of s) if (sc.art !== 'all') expect(sc.art).toBeLessThan(FILM_MAX);
  });

  it('en az iki çizimle anlamlı bir film olur', () => {
    expect(FILM_MIN).toBe(2);
    expect(filmScenes(arts(2), THEMES[2]).length).toBeGreaterThan(3);
  });

  it('sceneAt doğru sahneyi bulur, film bitince -1 verir', () => {
    const s = filmScenes(arts(2), THEMES[3]);
    expect(sceneAt(s, 0)).toBe(0);
    expect(sceneAt(s, s[1].at + 0.01)).toBe(1);
    expect(sceneAt(s, s[2].at + s[2].dur - 0.01)).toBe(2);
    expect(sceneAt(s, filmLength(s))).toBe(-1);
    expect(sceneAt([], 0)).toBe(-1);
  });

  it('filmin bütün cümleleri zaten seslendirilen cümleler (yeni ses dosyası gerekmez)', () => {
    const voiced = new Set(STORY_VOICE_LINES);
    for (const theme of THEMES) for (const sc of filmScenes(arts(FILM_MAX), theme)) expect(voiced.has(sc.text), sc.text).toBe(true);
  });

  it('günün masalı her gün değişir ama gün içinde aynı kalır', () => {
    const a = filmTheme(new Date(2026, 9, 18));
    expect(filmTheme(new Date(2026, 9, 18))).toBe(a);
    expect(filmTheme(new Date(2026, 9, 19))).not.toBe(a);
  });
});
