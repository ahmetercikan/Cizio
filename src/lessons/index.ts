import type { LearningPath, Lesson, PathId } from './types';

// Tüm ders dosyaları otomatik olarak yüklenir (src/lessons/data/*.ts).
const modules = import.meta.glob<{ default: Lesson }>('./data/*.ts', { eager: true });

export const paths: LearningPath[] = [
  { id: 'temeller', title: 'Temeller', emoji: '✏️', color: '#7c5cff', description: 'Çizgiler, şekiller ve kalem kontrolü' },
  { id: 'hayvanlar', title: 'Hayvanlar', emoji: '🐾', color: '#ff8a3d', description: 'Kediler, balıklar ve daha fazlası' },
  { id: 'nesneler', title: 'Sevimli Nesneler', emoji: '🧁', color: '#ff5fa2', description: 'Tatlılar, oyuncaklar ve eşyalar' },
  { id: 'doga', title: 'Doğa', emoji: '🌻', color: '#2fbf71', description: 'Çiçekler, ağaçlar ve gökyüzü' },
  { id: 'karakterler', title: 'Karakterler', emoji: '🤖', color: '#2f9bff', description: 'Robotlar, canavarlar ve kahramanlar' },
];

export const lessons: Lesson[] = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || a.level - b.level || a.title.localeCompare(b.title, 'tr'));

export const lessonsByPath = (path: PathId) => lessons.filter((l) => l.path === path);
export const getLesson = (id: string) => lessons.find((l) => l.id === id);
export const getPath = (id: string) => paths.find((p) => p.id === id);
