/**
 * Çizio'nun maceraları: her ders yolu haritada bir durak. Durağın bütün dersleri bitince
 * Çizio o durağın kıyafetini kazanır (gardıroptan giydirilir).
 */
import { lessonsByPath, paths } from '../lessons';
import type { PathId } from '../lessons/types';
import type { ProfileData } from '../store/useApp';

export interface Chapter {
  path: PathId;
  place: string;
  outfit: string;
}

export const CHAPTERS: Chapter[] = [
  { path: 'temeller', place: 'Kalem Köyü', outfit: 'bere' },
  { path: 'hayvanlar', place: 'Pati Ormanı', outfit: 'kulak' },
  { path: 'nesneler', place: 'Şeker Kasabası', outfit: 'papyon' },
  { path: 'doga', place: 'Çiçek Vadisi', outfit: 'cicek' },
  { path: 'karakterler', place: 'Masal Şatosu', outfit: 'sihirbaz' },
  { path: 'deniz', place: 'Mercan Koyu', outfit: 'kaptan' },
  { path: 'dinozor', place: 'Dino Adası', outfit: 'kasif' },
  { path: 'tasitlar', place: 'Hız Pisti', outfit: 'gozluk' },
  { path: 'ozel', place: 'Kutlama Meydanı', outfit: 'tac' },
].filter((c) => paths.some((p) => p.id === c.path)) as Chapter[];

export interface ChapterState extends Chapter {
  done: number;
  total: number;
  complete: boolean;
}

export function chapterStates(data: ProfileData): ChapterState[] {
  return CHAPTERS.map((c) => {
    const ls = lessonsByPath(c.path);
    const done = ls.filter((l) => data.lessons[l.id]).length;
    return { ...c, done, total: ls.length, complete: ls.length > 0 && done === ls.length };
  });
}

/** Açılmış kıyafetler (tamamlanan duraklar). */
export const unlockedOutfits = (data: ProfileData) => chapterStates(data).filter((c) => c.complete).map((c) => c.outfit);
