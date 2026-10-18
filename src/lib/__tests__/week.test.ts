import { describe, expect, it } from 'vitest';
import { weekPraise, weekReport, weekRows } from '../week';
import { addDays, dayKey, weekStart } from '../util';
import type { ProfileData } from '../../store/useApp';

const bos = (): ProfileData => ({ lessons: {}, favorites: [], stickers: [], newStickers: [], days: {}, paperCount: 0, freeCount: 0 });

describe('haftalık karne', () => {
  it('boş haftada her şey sıfır', () => {
    const r = weekReport(bos());
    expect(r.activeDays).toBe(0);
    expect(r.lessons).toBe(0);
    expect(weekRows(r)).toHaveLength(0);
    expect(r.days).toHaveLength(7);
  });

  it('yalnızca bu haftanın günlerini sayar', () => {
    const d = bos();
    const buHafta = dayKey(addDays(weekStart(), 1));
    const gecenHafta = dayKey(addDays(weekStart(), -3));
    d.days[buHafta] = { lessons: 2, minutes: 15, drawings: 3, stars: 6 };
    d.days[gecenHafta] = { lessons: 9, minutes: 99, drawings: 9, stars: 99 };
    const r = weekReport(d);
    expect(r.activeDays).toBe(1);
    expect(r.lessons).toBe(2);
    expect(r.minutes).toBe(15);
    expect(r.stars).toBe(6);
    expect(r.drawings).toBe(3);
  });

  it('yazılan harfleri sayar', () => {
    const d = bos();
    d.trace = { A: 3, 'k-A': 2, B: 0 };
    expect(weekReport(d).letters).toBe(2);
  });

  it('karne satırları yalnızca dolu olanları gösterir', () => {
    const d = bos();
    d.days[dayKey()] = { lessons: 1, minutes: 0, drawings: 0 };
    const rows = weekRows(weekReport(d));
    expect(rows.map((r) => r.label)).toEqual(['Bitirilen çizim dersi']);
  });

  it('övgü cümlesi çocuğun adını içerir', () => {
    const d = bos();
    d.days[dayKey()] = { lessons: 6, minutes: 30, drawings: 2 };
    expect(weekPraise(weekReport(d), 'Ada')).toContain('Ada');
  });
});
