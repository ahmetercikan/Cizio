import { describe, expect, it } from 'vitest';
import { lessons } from '../../lessons';
import { THEME_GOAL, themeDone, themeNext, themeWon, weekTheme } from '../theme';
import { addDays, weekStart } from '../util';
import type { ProfileData } from '../../store/useApp';

const bos = (): ProfileData => ({ lessons: {}, favorites: [], stickers: [], newStickers: [], days: {}, paperCount: 0, freeCount: 0 });

describe('haftanın teması', () => {
  it('aynı hafta hep aynı tema, Temeller seçilmez', () => {
    const a = weekTheme(new Date('2026-10-14T10:00:00'));
    const b = weekTheme(new Date('2026-10-17T22:00:00'));
    expect(a.pathId).toBe(b.pathId);
    expect(a.week).toBe(b.week);
    expect(a.pathId).not.toBe('temeller');
    expect(a.lessons.length).toBeGreaterThan(0);
  });

  it('haftalar arasında tema değişir', () => {
    const temalar = new Set(Array.from({ length: 12 }, (_, i) => weekTheme(addDays(new Date('2026-01-05'), i * 7)).pathId));
    expect(temalar.size).toBeGreaterThan(2);
  });

  it('yalnızca bu hafta bitirilen dersleri sayar', () => {
    const now = new Date('2026-10-15T12:00:00');
    const t = weekTheme(now);
    const d = bos();
    const [l1, l2] = t.lessons;
    d.lessons[l1.id] = { bestStars: 3, completions: 1, lastAt: addDays(weekStart(now), 1).getTime() };
    d.lessons[l2.id] = { bestStars: 3, completions: 1, lastAt: addDays(weekStart(now), -4).getTime() };
    expect(themeDone(d, t, now)).toBe(1);
    expect(themeWon(d, t, now)).toBe(false);
  });

  it('hedefe ulaşınca kazanılır', () => {
    const now = new Date('2026-10-15T12:00:00');
    const t = weekTheme(now);
    const d = bos();
    for (const l of t.lessons.slice(0, THEME_GOAL)) d.lessons[l.id] = { bestStars: 2, completions: 1, lastAt: addDays(weekStart(now), 2).getTime() };
    expect(themeWon(d, t, now)).toBe(true);
  });

  it('öneriler önce hiç yapılmamış dersler', () => {
    const t = weekTheme();
    const d = bos();
    d.lessons[t.lessons[0].id] = { bestStars: 3, completions: 1, lastAt: Date.now() };
    const n = themeNext(d, t, 3);
    expect(n.length).toBeLessThanOrEqual(3);
    expect(n[0].id).not.toBe(t.lessons[0].id);
    for (const l of n) expect(lessons.some((x) => x.id === l.id)).toBe(true);
  });
});
