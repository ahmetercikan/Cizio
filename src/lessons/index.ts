import type { Lesson, PathId } from './types';
// Yollar ayrı dosyada: ders verisine ihtiyacı olmayan ekranlar (Macera, çıkartmalar) onu indirmesin.
export { getPath, paths } from './paths';

// Tüm ders dosyaları otomatik olarak yüklenir (src/lessons/data/*.ts).
const modules = import.meta.glob<{ default: Lesson }>('./data/*.ts', { eager: true });

export const lessons: Lesson[] = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || a.level - b.level || a.title.localeCompare(b.title, 'tr'));

export const lessonsByPath = (path: PathId) => lessons.filter((l) => l.path === path);
export const getLesson = (id: string) => lessons.find((l) => l.id === id);
