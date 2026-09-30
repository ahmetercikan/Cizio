import { describe, expect, it } from 'vitest';
import { BACKS, BGS, DRESSES, HATS, PETS, SHOES, randomOutfit, PRESETS } from '../../dressup/catalog';
import { lessonsByPath } from '../../lessons';
import { emptyData, type ProfileData } from '../../store/useApp';
import { chestsEarned, giftStatus, levelNeed, levelOf, pickReward, RARE, rareKey, xpOf } from '../rewards';
import { addDays, dayKey } from '../util';

const withStars = (n: number): ProfileData => ({ ...emptyData(), days: { '2026-09-01': { lessons: 1, minutes: 1, drawings: 1, stars: n } } });

describe('seviyeler', () => {
  it('eşikler 0, 8, 24, 48, 80', () => {
    expect([1, 2, 3, 4, 5].map(levelNeed)).toEqual([0, 8, 24, 48, 80]);
    expect(levelOf(0).n).toBe(1);
    expect(levelOf(7).n).toBe(1);
    expect(levelOf(8).n).toBe(2);
    expect(levelOf(79).n).toBe(4);
    expect(levelOf(80).name).toBe('Renk Sihirbazı');
    expect(levelOf(10000).name).toMatch(/^Efsane Ressam/);
  });

  it('XP: kazanılan yıldızlar, eski kayıtlarda en iyi ders yıldızları', () => {
    expect(xpOf(withStars(12))).toBe(12);
    const old = emptyData();
    old.lessons.kedi = { bestStars: 3, completions: 1, lastAt: 0 };
    expect(xpOf(old)).toBe(3);
  });
});

describe('sandıklar', () => {
  it('seviye atlama, görev ve stil görevi sandık kazandırır', () => {
    const prev = withStars(7);
    const next: ProfileData = { ...withStars(9), quests: ['2026-09-01'], styled: ['2026-09-01'] };
    expect(chestsEarned(prev, next).sort()).toEqual(['level', 'quest', 'style']);
  });

  it('macera durağı ve lig kürsüsü sandık kazandırır', () => {
    const prev = emptyData();
    const next = emptyData();
    for (const l of lessonsByPath('temeller')) next.lessons[l.id] = { bestStars: 1, completions: 1, lastAt: 0 };
    next.leagues = { '2026-09-21': 2 };
    const won = chestsEarned(prev, next);
    expect(won).toContain('adventure');
    expect(won).toContain('league');
  });

  it('değişiklik yoksa sandık yok', () => {
    const d = withStars(30);
    expect(chestsEarned(d, { ...d })).toEqual([]);
  });

  it('sandıktan sahip olunmayan nadir eşya, hepsi varsa yıldız çıkar', () => {
    const d = emptyData();
    d.owned = RARE.slice(1).map(rareKey);
    const r = pickReward(d, () => 0.99);
    expect(r).toEqual({ kind: 'item', item: RARE[0] });
    d.owned = RARE.map(rareKey);
    expect(pickReward(d).kind).toBe('stars');
  });

  it('her nadir eşya katalogda nadir olarak işaretli', () => {
    const lists: Record<string, { id: string; rare?: boolean }[]> = { back: BACKS, dress: DRESSES, hat: HATS, pet: PETS, bg: BGS, shoes: SHOES };
    for (const r of RARE) expect(lists[r.slot].find((i) => i.id === r.id)?.rare, rareKey(r)).toBe(true);
  });

  it('şaşırt beni nadir eşya seçmez', () => {
    const rare = new Set(RARE.map(rareKey));
    for (let i = 0; i < 60; i++) {
      const o = randomOutfit(PRESETS[0]);
      for (const slot of ['back', 'dress', 'hat', 'pet', 'bg', 'shoes'] as const) {
        expect(rare.has(`${slot}:${o[slot] ?? ''}`), slot).toBe(false);
      }
    }
  });
});

describe('günün hediyesi', () => {
  const now = new Date(2026, 8, 30, 12);
  it('ilk gün 1, ertesi gün seri devam eder, gün atlanırsa başa döner', () => {
    expect(giftStatus(undefined, now)).toEqual({ available: true, streak: 1 });
    expect(giftStatus({ last: dayKey(addDays(now, -1)), streak: 3 }, now)).toEqual({ available: true, streak: 4 });
    expect(giftStatus({ last: dayKey(addDays(now, -2)), streak: 3 }, now)).toEqual({ available: true, streak: 1 });
    expect(giftStatus({ last: dayKey(now), streak: 3 }, now).available).toBe(false);
    expect(giftStatus({ last: dayKey(addDays(now, -1)), streak: 7 }, now).streak).toBe(1);
  });
});
