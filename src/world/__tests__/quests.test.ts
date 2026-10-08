import { describe, expect, it } from 'vitest';
import { QUESTS, todayQuests } from '../quests';

describe('Çizio Adası görevleri', () => {
  it('her gün 3 farklı görev, biri hep yıldız toplama', () => {
    for (const pid of ['p1', 'abc', 'kz8f3']) {
      for (let d = 1; d <= 60; d++) {
        const q = todayQuests(pid, `2026-10-${String(d).padStart(2, '0')}`);
        expect(q).toHaveLength(3);
        expect(new Set(q).size).toBe(3);
        expect(q[0]).toBe('stars');
        q.forEach((x) => expect(QUESTS[x]).toBeTruthy());
      }
    }
  });

  it('günler arasında görevler değişir', () => {
    const days = new Set(Array.from({ length: 20 }, (_, i) => todayQuests('p1', `2026-11-${String(i + 1).padStart(2, '0')}`).join(',')));
    expect(days.size).toBeGreaterThan(3);
  });
});
