import { lessons, lessonsByPath } from '../lessons';
import type { Lesson } from '../lessons/types';
import type { Profile, ProfileData } from '../store/useApp';

/** Bugünün dersi: önce favori yolda bitmemiş ilk ders, sonra en kolay bitmemiş ders, sonra 3 yıldızı olmayan. */
export function recommendLesson(profile: Profile, data: ProfileData): Lesson {
  const undone = (l: Lesson) => !data.lessons[l.id];
  const fav = lessonsByPath(profile.favoritePath).find(undone);
  if (fav) return fav;
  const any = [...lessons].sort((a, b) => a.level - b.level).find(undone);
  if (any) return any;
  const improve = lessons.find((l) => (data.lessons[l.id]?.bestStars ?? 0) < 3);
  if (improve) return improve;
  return lessons[Math.floor(Math.random() * lessons.length)];
}

export function totalStars(data: ProfileData): number {
  return Object.values(data.lessons).reduce((a, l) => a + l.bestStars, 0);
}
