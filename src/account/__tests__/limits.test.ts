import { describe, expect, it } from 'vitest';
import { LESSON_META } from '../../lessons/meta';
import { englishTimeFree, FREE_LESSON_COUNT, lessonFree, songFree, storyFree, topicFree } from '../limits';

describe('Premium sınırları', () => {
  it('her konunun ilk 2 dersi ücretsiz', () => {
    const paths = new Set(LESSON_META.map((m) => m.path));
    expect(FREE_LESSON_COUNT).toBe(paths.size * 2);
    for (const p of paths) {
      const list = LESSON_META.filter((m) => m.path === p).sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
      expect(lessonFree(list[0].id)).toBe(true);
      expect(lessonFree(list[1].id)).toBe(true);
      if (list[2]) expect(lessonFree(list[2].id)).toBe(false);
    }
  });

  it('bitirilmiş ders açık kalır', () => {
    const locked = LESSON_META.find((m) => !lessonFree(m.id))!;
    expect(lessonFree(locked.id, true)).toBe(true);
  });

  it('English Time ilk 5 gün ücretsiz, bugün başlanmışsa açık', () => {
    const days = ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'];
    expect(englishTimeFree(days, '2026-10-05')).toBe(true);
    expect(englishTimeFree([...days, '2026-10-05'], '2026-10-06')).toBe(false);
    expect(englishTimeFree([...days, '2026-10-05'], '2026-10-05')).toBe(true);
  });

  it('İngilizce: 3 konu, 2 hikaye, 2 şarkı', () => {
    expect([0, 1, 2, 3].map(topicFree)).toEqual([true, true, true, false]);
    expect([0, 1, 2].map((i) => storyFree(i))).toEqual([true, true, false]);
    expect(storyFree(5, true)).toBe(true);
    expect([0, 1, 2].map(songFree)).toEqual([true, true, false]);
  });
});
