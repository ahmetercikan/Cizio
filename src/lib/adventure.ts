/**
 * Çizio'nun maceraları: her ders yolu haritada bir durak. Duraklar sırayla açılır: bir durağın
 * CHAPTER_GOAL dersi (yolda daha az ders varsa hepsi) bitince bir sonraki durak açılır ve Çizio o durağın
 * kıyafetini kazanır (gardıroptan giydirilir). Yolun kalan dersleri yine yapılabilir, sayılır.
 * Dersler başka yerlerden (Dersler, Bugün) de yapılabilir; sayılırlar ama kıyafet ancak durağa ulaşınca açılır.
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

/** Bir durağı tamamlamak için gereken ders sayısı (yollar uzadıkça çocuk bekleyişte kalmasın). */
export const CHAPTER_GOAL = 6;

export interface ChapterState extends Chapter {
  done: number;
  total: number;
  /** Durağı tamamlamak için gereken ders sayısı. */
  goal: number;
  /** Durağa ulaşıldı mı (ilk durak ya da önceki durak tamam). */
  open: boolean;
  /** Durağa ulaşıldı ve bütün dersleri bitti. */
  complete: boolean;
}

export function chapterStates(data: ProfileData): ChapterState[] {
  let prevComplete = true;
  return CHAPTERS.map((c) => {
    const ls = lessonsByPath(c.path);
    const done = ls.filter((l) => data.lessons[l.id]).length;
    const open = prevComplete;
    const goal = Math.min(ls.length, CHAPTER_GOAL);
    const complete = open && ls.length > 0 && done >= goal;
    prevComplete = complete;
    return { ...c, done, total: ls.length, goal, open, complete };
  });
}

/** Açılmış kıyafetler (sırayla ulaşılıp tamamlanan duraklar). */
export const unlockedOutfits = (data: ProfileData) => chapterStates(data).filter((c) => c.complete).map((c) => c.outfit);
