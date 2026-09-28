import { describe, expect, it } from 'vitest';
import { lessons } from '../../lessons';
import { emptyData, type Profile } from '../../store/useApp';
import { specialDay, todayQuest } from '../daily';

describe('günün görevi', () => {
  it('bir yıl boyunca, farklı profillerle her gün geçerli bir görev üretir', () => {
    const ids = new Set(lessons.map((l) => l.id));
    for (const pid of ['a', 'p1', 'x9', 'profil-123', 'kz8f3']) {
      const profile: Profile = { id: pid, name: 'T', avatar: 'kedi', favoritePath: 'hayvanlar', createdAt: 0 };
      for (let d = 0; d < 366; d++) {
        const day = new Date(2026, 0, 1 + d, 12);
        const q = todayQuest(profile, emptyData(), lessons, day);
        expect(ids.has(q.lessonId), `${pid} ${day.toDateString()}`).toBe(true);
        expect(q.text.length).toBeGreaterThan(3);
      }
    }
  });

  it('özel günler doğru tarihlerde ve var olan derslerle gelir', () => {
    const at = (m: number, d: number) => specialDay(new Date(2026, m - 1, d, 12));
    expect(at(10, 29)?.id).toBe('cumhuriyet');
    expect(at(4, 23)?.id).toBe('23nisan');
    expect(at(5, 19)?.id).toBe('19mayis');
    expect(at(8, 30)?.id).toBe('30agustos');
    expect(at(5, 10)?.id).toBe('anneler'); // 2026'da Anneler Günü 10 Mayıs
    expect(at(1, 1)?.id).toBe('yilbasi');
    expect(at(2, 10)?.id).toBe('kis');
    expect(at(9, 28)).toBeNull();
    for (let d = 0; d < 366; d++) {
      const sp = specialDay(new Date(2026, 0, 1 + d, 12));
      if (sp) expect(lessons.some((l) => l.id === sp.lessonId), sp.id).toBe(true);
    }
  });
});
