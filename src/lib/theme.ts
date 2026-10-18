/**
 * Haftanın çizim teması.
 *
 * Her hafta bir çizim yolu seçilir (hafta anahtarından hesaplanır, yani aynı haftada herkeste aynıdır ve
 * sıra tutturulur). Çocuk o temadan üç ders bitirirse hafta rozetini ve bir hazine sandığı kazanır.
 * Amaç her hafta geri dönmek için bir sebep yaratmak; ders yapmaya zorlamak değil, hedef göstermek.
 */
import { lessons, paths } from '../lessons';
import type { Lesson } from '../lessons/types';
import type { ProfileData } from '../store/useApp';
import { addDays, hashStr, weekKey, weekStart } from './util';

/** Hafta rozetini kazanmak için gereken ders. */
export const THEME_GOAL = 3;

export interface WeekTheme {
  /** Hafta anahtarı (pazartesi günü). */
  week: string;
  pathId: string;
  title: string;
  emoji: string;
  color: string;
  /** Temadaki dersler. */
  lessons: Lesson[];
}

/** Bu haftanın teması. Temeller yolu tema olmaz (onlar alıştırma). */
export function weekTheme(now = new Date()): WeekTheme {
  const havuz = paths.filter((p) => p.id !== 'temeller');
  const week = weekKey(now);
  const p = havuz[hashStr(`${week}|tema`) % havuz.length];
  return { week, pathId: p.id, title: p.title, emoji: p.emoji, color: p.color, lessons: lessons.filter((l) => l.path === p.id) };
}

/** Bu hafta, bu temadan bitirilen ders sayısı. */
export function themeDone(d: ProfileData, t: WeekTheme, now = new Date()): number {
  const basla = weekStart(now).getTime();
  const bit = addDays(weekStart(now), 7).getTime();
  return t.lessons.filter((l) => {
    const p = d.lessons[l.id];
    return p && p.lastAt >= basla && p.lastAt < bit;
  }).length;
}

/** Rozeti kazandı mı (bu hafta hedefe ulaştı mı)? */
export const themeWon = (d: ProfileData, t: WeekTheme, now = new Date()) => themeDone(d, t, now) >= THEME_GOAL;
/** Ödülü aldı mı (sandık bir kez verilir)? */
export const themeClaimed = (d: ProfileData, t: WeekTheme) => (d.themeWeeks ?? []).includes(t.week);

/** Temadan sıradaki öneriler (önce hiç yapılmamışlar). */
export function themeNext(d: ProfileData, t: WeekTheme, n = 3): Lesson[] {
  const yeni = t.lessons.filter((l) => !d.lessons[l.id]);
  return [...yeni, ...t.lessons.filter((l) => d.lessons[l.id])].slice(0, n);
}
