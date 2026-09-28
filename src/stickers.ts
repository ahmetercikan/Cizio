import { lessons, lessonsByPath } from './lessons';
import type { ProfileData } from './store/useApp';

export interface Sticker {
  id: string;
  emoji: string;
  title: string;
  /** Nasıl kazanılır (kilitliyken gösterilir). */
  hint: string;
}

const MILESTONES: Sticker[] = [
  { id: 'first-lesson', emoji: '🌟', title: 'İlk Adım', hint: 'İlk dersini bitir' },
  { id: 'lessons-5', emoji: '🎨', title: 'Minik Ressam', hint: '5 ders bitir' },
  { id: 'lessons-10', emoji: '🖼️', title: 'Sanatçı', hint: '10 ders bitir' },
  { id: 'lessons-20', emoji: '🏆', title: 'Usta Ressam', hint: '20 ders bitir' },
  { id: 'three-stars-5', emoji: '💫', title: 'Yıldız Avcısı', hint: '5 dersten 3 yıldız al' },
  { id: 'streak-3', emoji: '🔥', title: 'Ateşli Kalem', hint: '3 gün üst üste çiz' },
  { id: 'streak-7', emoji: '🌈', title: 'Gökkuşağı Haftası', hint: '7 gün üst üste çiz' },
  { id: 'paper-first', emoji: '📸', title: 'Kâğıt Sanatçısı', hint: 'Kâğıda çizip fotoğrafını çek' },
  { id: 'free-first', emoji: '🖌️', title: 'Hayal Gücü', hint: 'Serbest çizimde bir resim kaydet' },
  { id: 'free-5', emoji: '🦄', title: 'Hayalperest', hint: 'Serbest çizimde 5 resim kaydet' },
  { id: 'temeller-all', emoji: '✏️', title: 'Kalem Ustası', hint: 'Temeller yolundaki tüm dersleri bitir' },
];

export function allStickers(): Sticker[] {
  return [
    ...MILESTONES,
    ...lessons.map((l) => ({ id: `lesson:${l.id}`, emoji: l.emoji, title: l.title, hint: `"${l.title}" dersini bitir` })),
  ];
}

export const getSticker = (id: string) => allStickers().find((s) => s.id === id);

export function milestoneStickers(d: ProfileData, streak: number): string[] {
  const done = Object.keys(d.lessons).length;
  const three = Object.values(d.lessons).filter((l) => l.bestStars >= 3).length;
  const out: string[] = [];
  if (done >= 1) out.push('first-lesson');
  if (done >= 5) out.push('lessons-5');
  if (done >= 10) out.push('lessons-10');
  if (done >= 20) out.push('lessons-20');
  if (three >= 5) out.push('three-stars-5');
  if (streak >= 3) out.push('streak-3');
  if (streak >= 7) out.push('streak-7');
  if (d.paperCount >= 1) out.push('paper-first');
  if (d.freeCount >= 1) out.push('free-first');
  if (d.freeCount >= 5) out.push('free-5');
  const tem = lessonsByPath('temeller');
  if (tem.length && tem.every((l) => d.lessons[l.id])) out.push('temeller-all');
  return out;
}
