/**
 * Çizio Adası'nın haritası: bölgeler, yerleri ve arazinin yüksekliği.
 * Saf veri ve hesap (three.js yok): hem 3B sahne hem harita ekranı hem de testler kullanır.
 */

/** Kara yarıçapı (kıyı çizgisi bu değer etrafında dalgalanır). Eski adanın ~20 katı alan. */
export const LAND_R = 262;
/** Yürünebilir / yüzülebilir sınır. */
export const WORLD_R = 330;

export interface Zone {
  id: string;
  name: string;
  x: number;
  z: number;
  /** Harita ekranında simge rengi. */
  color: string;
  /** Hızlı gidiş noktası (bölgenin girişinde). */
  spawn: [number, number];
}

export const ZONES: Zone[] = [
  { id: 'town', name: 'Kasaba', x: 0, z: 0, color: '#ffc83d', spawn: [0, 12] },
  { id: 'fun', name: 'Lunapark', x: 128, z: -72, color: '#e9487d', spawn: [104, -52] },
  { id: 'lake', name: 'Göl', x: -112, z: 62, color: '#3fb7dd', spawn: [-66, 52] },
  { id: 'beach', name: 'Plaj', x: 0, z: 236, color: '#f3c76a', spawn: [0, 214] },
  { id: 'forest', name: 'Orman Kampı', x: -150, z: -118, color: '#3fa45a', spawn: [-124, -96] },
  { id: 'farm', name: 'Çiftlik', x: 52, z: 142, color: '#c98a4b', spawn: [36, 120] },
  { id: 'snow', name: 'Karlı Dağ', x: 186, z: 112, color: '#bfe9ff', spawn: [140, 92] },
  { id: 'dino', name: 'Dinozor Vadisi', x: -46, z: -196, color: '#e07b39', spawn: [-36, -168] },
  { id: 'castle', name: 'Şato', x: -222, z: 12, color: '#9b6bff', spawn: [-190, 12] },
  { id: 'lighthouse', name: 'Deniz Feneri', x: 64, z: -246, color: '#ef4b4b', spawn: [56, -222] },
  { id: 'rocket', name: 'Roket Üssü', x: 168, z: -168, color: '#5b8def', spawn: [150, -150] },
  { id: 'home', name: 'Çiftliğim', x: 124, z: 44, color: '#7cc760', spawn: [88, 44] },
  { id: 'market', name: 'Pazar', x: -20, z: 18, color: '#ff9f43', spawn: [-12, 13] },
  { id: 'portal', name: 'Macera Kapıları', x: -74, z: -36, color: '#c86bff', spawn: [-52, -26] },
];
/** Çiftliğim: arsanın düzlüğü daha geniş (tarla, ahır ve inşa alanı). */
export const HOME = zone_('home');
function zone_(id: string) {
  return ZONES.find((z) => z.id === id)!;
}
export const zone = (id: string) => ZONES.find((z) => z.id === id)!;

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Kıyı çizgisinin yarıçapı (açıya göre girintili çıkıntılı). */
export function coastAt(ang: number) {
  return LAND_R + 9 * Math.sin(ang * 3 + 0.4) + 6 * Math.sin(ang * 7 + 1.3) + 3 * Math.sin(ang * 13);
}

/** Bölgelerin düzlüğü: yapıların olduğu yerlerde tepe dalgası yok. */
function flatMask(x: number, z: number) {
  let m = 0;
  for (const zn of ZONES) {
    if (zn.id === 'snow' || zn.id === 'dino') continue;
    const [a, b] = zn.id === 'home' ? [50, 72] : [34, 58];
    m = Math.max(m, 1 - smooth(a, b, Math.hypot(x - zn.x, z - zn.z)));
  }
  return m;
}

export const LAKE = { x: -112, z: 62, r: 46 };
export const SNOW_PEAK = { x: 196, z: 120, h: 34, r: 58 };
export const VOLCANO = { x: -82, z: -224, r: 16, h: 18 };

/**
 * Arazinin yüksekliği (su seviyesi 0). Kara ~1.2; kıyıda kumsal eğimiyle denize iner; göl çukur; karlı dağ yükselir.
 */
export function heightAt(x: number, z: number): number {
  const r = Math.hypot(x, z);
  const coast = coastAt(Math.atan2(z, x));
  let h = 1.2;
  // yumuşak tepeler (bölgelerde düz)
  const hills = 2.2 * Math.sin(x * 0.021 + 1) * Math.cos(z * 0.018) + 1.1 * Math.sin(x * 0.047 - z * 0.033);
  h += Math.max(0, hills) * (1 - flatMask(x, z)) * (1 - smooth(coast - 40, coast - 14, r));
  // karlı dağ
  const dm = Math.hypot(x - SNOW_PEAK.x, z - SNOW_PEAK.z);
  h += SNOW_PEAK.h * Math.exp(-(dm * dm) / (2 * (SNOW_PEAK.r * 0.42) ** 2));
  // kumsal ve deniz
  h = h + (-3.2 - h) * smooth(coast - 14, coast + 10, r);
  // göl
  const dl = Math.hypot(x - LAKE.x, z - LAKE.z);
  if (dl < LAKE.r + 8) h = Math.min(h, -2.6 + (h + 2.6) * smooth(LAKE.r - 14, LAKE.r + 6, dl));
  return h;
}

/** Bu nokta su mu (göl ya da deniz)? */
export const isWater = (x: number, z: number) => heightAt(x, z) < -0.25;

/** Arazi türü: renk ve yürüme sesleri için. */
export function groundKind(x: number, z: number): 'sand' | 'snow' | 'grass' | 'dirt' {
  const h = heightAt(x, z);
  if (h > 15) return 'snow';
  if (h < 1.0) return 'sand';
  if (Math.hypot(x - zone('dino').x, z - zone('dino').z) < 52) return 'dirt';
  return 'grass';
}
