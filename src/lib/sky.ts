/**
 * Gökyüzü saati: cihazın gerçek saatine göre gündüz mü gece mi (adanın ışıkları ve müziği bunu izler).
 * Güneşin doğuş ve batış saati mevsime göre değişir (Türkiye için yaklaşık).
 */
export const sm = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export interface SkyState {
  /** 1: tam gündüz, 0: tam gece. */
  day: number;
  /** Gün doğumu / batımı rengi (0-1). */
  dusk: number;
  /** Güneşin (gündüz) ya da ayın (gece) gökteki yolu: 0 doğu ufku, 1 batı ufku. */
  arc: number;
}

/** Bir an için gökyüzü durumu. */
export function skyAt(d: Date): SkyState {
  const h = d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
  const start = new Date(d.getFullYear(), 0, 0);
  const doy = (d.getTime() - start.getTime()) / 864e5;
  const len = 12 + 3 * Math.cos((2 * Math.PI * (doy - 172)) / 365); // gün uzunluğu (saat)
  const noon = 12.9;
  const rise = noon - len / 2, set = noon + len / 2;
  const day = sm(rise - 0.6, rise + 0.6, h) * (1 - sm(set - 0.6, set + 0.6, h));
  const dusk = Math.max(0, 1 - Math.abs(h - rise) / 1.1, 1 - Math.abs(h - set) / 1.1);
  const arc = day > 0.5 || (h > rise && h < set) ? (h - rise) / (set - rise) : (((h - set + 24) % 24) / (24 - len));
  return { day, dusk, arc: Math.min(1, Math.max(0, arc)) };
}
