export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

/** Yerel saatle YYYY-MM-DD. */
export function dayKey(d = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** Bugün (ya da henüz bugün çizmediyse dün) biten ardışık gün sayısı. */
export function streakOf(days: Record<string, unknown>, today = new Date()): number {
  let d = days[dayKey(today)] ? today : addDays(today, -1);
  let n = 0;
  while (days[dayKey(d)]) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

export const TR_DAYS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
}

/** Haftanın pazartesi günü (yerel saat, 00:00). */
export function weekStart(d = new Date()): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}

/** Hafta anahtarı: o haftanın pazartesisinin dayKey'i. */
export const weekKey = (d = new Date()) => dayKey(weekStart(d));

/** FNV-1a (32 bit): tarih/profil gibi anahtarlardan tekrarlanabilir "rastgele" sayı. */
export function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
