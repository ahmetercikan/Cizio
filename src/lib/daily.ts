/**
 * Günlük sürprizler: özel günler (bayramlar, mevsimler), günün görevi ve mini meydan okumalar.
 * Her şey tarih + profil kimliğinden belirleyici olarak seçilir: aynı gün aynı çocuk aynı görevi görür.
 */
import type { Lesson } from '../lessons/types';
import type { Profile, ProfileData } from '../store/useApp';
import { dayKey } from './util';

// ------------------------------------------------------------------------------------------------
// Özel günler
// ------------------------------------------------------------------------------------------------
export interface SpecialDay {
  id: string;
  title: string;
  message: string;
  lessonId: string;
  emoji: string;
}

/** Mayıs ayının ikinci pazarı (Anneler Günü). */
function mothersDay(year: number): Date {
  const d = new Date(year, 4, 1);
  const firstSunday = 1 + ((7 - d.getDay()) % 7);
  return new Date(year, 4, firstSunday + 7);
}

const inRange = (d: Date, m1: number, d1: number, m2: number, d2: number) => {
  const v = (d.getMonth() + 1) * 100 + d.getDate();
  const a = m1 * 100 + d1, b = m2 * 100 + d2;
  return a <= b ? v >= a && v <= b : v >= a || v <= b;
};

export function specialDay(now = new Date()): SpecialDay | null {
  if (inRange(now, 10, 25, 10, 30))
    return { id: 'cumhuriyet', title: '29 Ekim Cumhuriyet Bayramı', message: 'Cumhuriyet Bayramımız kutlu olsun! Hadi bayrağımızı çizelim.', lessonId: 'turk-bayragi', emoji: '🎉' };
  if (inRange(now, 4, 19, 4, 24))
    return { id: '23nisan', title: '23 Nisan Çocuk Bayramı', message: 'Ulusal Egemenlik ve Çocuk Bayramın kutlu olsun!', lessonId: 'turk-bayragi', emoji: '🎉' };
  if (inRange(now, 5, 16, 5, 20))
    return { id: '19mayis', title: '19 Mayıs', message: 'Atatürk’ü Anma, Gençlik ve Spor Bayramı kutlu olsun!', lessonId: 'turk-bayragi', emoji: '🎉' };
  if (inRange(now, 8, 27, 8, 31))
    return { id: '30agustos', title: '30 Ağustos Zafer Bayramı', message: 'Zafer Bayramımız kutlu olsun!', lessonId: 'turk-bayragi', emoji: '🎉' };
  const md = mothersDay(now.getFullYear());
  const diff = (md.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) / 86400000;
  if (diff >= 0 && diff <= 6)
    return { id: 'anneler', title: 'Anneler Günü yaklaşıyor', message: 'Annene sürpriz bir kart çizmeye ne dersin?', lessonId: 'anneler-gunu', emoji: '💐' };
  if (inRange(now, 12, 24, 1, 3))
    return { id: 'yilbasi', title: 'Yeni yıl geliyor', message: 'Yeni yılı bir kardan adamla karşılayalım!', lessonId: 'kardan-adam', emoji: '⛄' };
  if (inRange(now, 12, 1, 2, 28))
    return { id: 'kis', title: 'Kış geldi', message: 'Dışarıda kar var mı? Hadi bir kardan adam çizelim!', lessonId: 'kardan-adam', emoji: '❄️' };
  return null;
}

// ------------------------------------------------------------------------------------------------
// Mini meydan okumalar
// ------------------------------------------------------------------------------------------------
export type ChallengeKind = 'speed' | 'memory' | 'oneline';

export const CHALLENGES: { id: ChallengeKind; title: string; desc: string; emoji: string; intro: string }[] = [
  { id: 'speed', title: 'Hızlı çizim', desc: '60 saniyede çiz!', emoji: '⏱️', intro: 'Hızlı çizim! Altmış saniyen var, hadi başla!' },
  { id: 'memory', title: 'Hafızadan çiz', desc: 'Bak, sakla, hatırla!', emoji: '🧠', intro: 'Hafıza oyunu! Resme iyice bak, birazdan saklanacak.' },
  { id: 'oneline', title: 'Tek çizgi', desc: 'Kalemi hiç kaldırma!', emoji: '〰️', intro: 'Tek çizgi meydan okuması! Kalemini hiç kaldırmadan çiz.' },
];

export const CHALLENGE_LINES = {
  memoryDraw: 'Şimdi hatırladığın gibi çiz!',
  lifted: 'Kalemini kaldırdın! Hadi baştan deneyelim.',
  timeUp: 'Süre doldu! Bakalım nasıl olmuş.',
  questDone: 'Günün görevini tamamladın!',
};

// ------------------------------------------------------------------------------------------------
// Günün görevi
// ------------------------------------------------------------------------------------------------
export type Quest =
  | { kind: 'lesson'; lessonId: string; text: string }
  | { kind: 'challenge'; challenge: ChallengeKind; lessonId: string; text: string };

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Bugünün görevi: ders ya da meydan okuma. Özel gün varsa o günün dersi. */
export function todayQuest(profile: Profile, data: ProfileData, lessons: Lesson[], now = new Date()): Quest {
  const sp = specialDay(now);
  const byId = (id: string) => lessons.find((l) => l.id === id);
  if (sp && byId(sp.lessonId)) return { kind: 'lesson', lessonId: sp.lessonId, text: `${byId(sp.lessonId)!.title} dersini bitir` };
  const h = hash(`${dayKey(now)}|${profile.id}`);
  const easy = lessons.filter((l) => l.level <= 2);
  if (h % 2 === 0) {
    const undone = lessons.filter((l) => !data.lessons[l.id]);
    const pool = undone.length ? undone : lessons;
    const l = pool[h % pool.length];
    return { kind: 'lesson', lessonId: l.id, text: `${l.title} dersini bitir` };
  }
  const c = CHALLENGES[(h >>> 3) % CHALLENGES.length];
  const l = easy[(h >>> 5) % easy.length];
  return { kind: 'challenge', challenge: c.id, lessonId: l.id, text: `${c.title}: ${l.title}` };
}

/** Görev bugün tamamlandı mı? */
export function questDone(q: Quest, data: ProfileData, now = new Date()): boolean {
  const k = dayKey(now);
  if (q.kind === 'lesson') {
    const p = data.lessons[q.lessonId];
    return !!p && dayKey(new Date(p.lastAt)) === k;
  }
  return (data.challenges?.[k] ?? []).includes(`${q.challenge}:${q.lessonId}`);
}
