import { describe, expect, it } from 'vitest';
import { lessonsByPath } from '../../lessons';
import { milestoneStickers } from '../../stickers';
import { emptyData, type Profile, type ProfileData } from '../../store/useApp';
import { chapterStates, CHAPTERS, unlockedOutfits } from '../adventure';
import { daysLeft, lastWeekResult, RIVALS, standings, weekStars } from '../league';
import { addDays, dayKey, weekKey, weekStart } from '../util';

const profile: Profile = { id: 'p1', name: 'Deniz', avatar: 'kedi', favoritePath: 'hayvanlar', createdAt: 0 };

function withStars(days: Record<string, number>): ProfileData {
  const d = emptyData();
  for (const [k, stars] of Object.entries(days)) d.days[k] = { lessons: 1, minutes: 5, drawings: 1, stars };
  return d;
}

describe('hafta', () => {
  it('pazartesiden başlar', () => {
    expect(weekKey(new Date(2026, 8, 30))).toBe('2026-09-28'); // çarşamba → pazartesi
    expect(weekKey(new Date(2026, 9, 4))).toBe('2026-09-28'); // pazar → aynı hafta
    expect(weekKey(new Date(2026, 9, 5))).toBe('2026-10-05'); // yeni hafta
    expect(daysLeft(new Date(2026, 8, 28, 10))).toBe(7);
    expect(daysLeft(new Date(2026, 9, 4, 20))).toBe(1);
  });
});

describe('haftalık lig', () => {
  const now = new Date(2026, 8, 30, 15); // çarşamba
  const wk = weekKey(now);

  it('bu haftanın yıldızlarını toplar, geçen haftayı saymaz', () => {
    const d = withStars({ [wk]: 3, [dayKey(addDays(weekStart(now), 2))]: 4, [dayKey(addDays(weekStart(now), -1))]: 9 });
    expect(weekStars(d, wk)).toBe(7);
  });

  it('çocuk ve 4 rakip sıralanır, sonuç her seferinde aynıdır', () => {
    const d = withStars({ [wk]: 5 });
    const a = standings(profile, d, now);
    const b = standings(profile, d, now);
    expect(a).toHaveLength(RIVALS.length + 1);
    expect(a.filter((r) => r.you)).toHaveLength(1);
    expect(a).toEqual(b);
    for (let i = 1; i < a.length; i++) expect(a[i - 1].stars).toBeGreaterThanOrEqual(a[i].stars);
  });

  it('botlar hafta ilerledikçe yıldız toplar ve hedefe ulaşır', () => {
    const d = emptyData();
    const monday = standings(profile, d, weekStart(now), wk).filter((r) => !r.you);
    const sunday = standings(profile, d, addDays(weekStart(now), 7), wk).filter((r) => !r.you);
    expect(monday.every((r) => r.stars === 0)).toBe(true);
    // Taban en az 10 yıldız: en hızlı bot (1.4) haftayı 14 yıldızla bitirir
    expect(Math.max(...sunday.map((r) => r.stars))).toBe(14);
  });

  it('eşitlikte çocuk öne geçer', () => {
    const d = emptyData();
    const rows = standings(profile, d, weekStart(now), wk);
    expect(rows[0].you).toBe(true);
  });

  it('geçen haftanın kesin sırası', () => {
    const lastMonday = addDays(weekStart(now), -7);
    const d = withStars({ [dayKey(lastMonday)]: 30 });
    const r = lastWeekResult(profile, d, now);
    expect(r.wk).toBe(dayKey(lastMonday));
    expect(r.played).toBe(true);
    expect(r.rank).toBe(1);
  });

  it('bot avatarı çocuğunkiyle çakışmaz', () => {
    const p = { ...profile, avatar: 'robot' };
    const rows = standings(p, emptyData(), now);
    expect(rows.filter((r) => r.avatar === 'robot')).toHaveLength(1);
  });
});

describe('maceralar', () => {
  it('her durak bir ders yolu ve farklı bir kıyafet', () => {
    expect(new Set(CHAPTERS.map((c) => c.outfit)).size).toBe(CHAPTERS.length);
    for (const c of CHAPTERS) expect(lessonsByPath(c.path).length).toBeGreaterThan(0);
  });

  it('yolun bütün dersleri bitince durak tamamlanır ve kıyafet açılır', () => {
    const d = emptyData();
    const tem = lessonsByPath('temeller');
    for (const l of tem.slice(0, -1)) d.lessons[l.id] = { bestStars: 2, completions: 1, lastAt: 0 };
    expect(chapterStates(d).find((c) => c.path === 'temeller')!.complete).toBe(false);
    expect(unlockedOutfits(d)).toEqual([]);
    d.lessons[tem[tem.length - 1].id] = { bestStars: 1, completions: 1, lastAt: 0 };
    expect(chapterStates(d).find((c) => c.path === 'temeller')!.complete).toBe(true);
    expect(unlockedOutfits(d)).toEqual(['bere']);
  });
});

describe('yeni çıkartmalar', () => {
  it('düello, lig ve macera çıkartmaları', () => {
    const d: ProfileData = { ...emptyData(), duels: 1, duelWins: 5, leagues: { '2026-09-21': 2 } };
    const s = milestoneStickers(d, 0);
    expect(s).toContain('duel-first');
    expect(s).toContain('duel-wins-5');
    expect(s).toContain('league-podium');
    expect(s).not.toContain('league-champion');
    expect(s).not.toContain('adventure-3');
  });
});
