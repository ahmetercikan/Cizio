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
