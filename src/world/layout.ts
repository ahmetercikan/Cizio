/**
 * Çizio Adası'nın haritası: bölgeler, yerleri ve arazinin yüksekliği.
 * Saf veri ve hesap (three.js yok): hem 3B sahne hem harita ekranı hem de testler kullanır.
 */

/** Kara yarıçapı (kıyı çizgisi bu değer etrafında dalgalanır). Eski adanın ~30 katı alan. */
export const LAND_R = 328;
/**
 * Kuzeydoğudaki yeni kara: Şehir Merkezi'nin (gökdelenler) kurulduğu büyük yarımada.
 * Ada yalnızca bu yönde büyüdü; plaj, deniz feneri ve öbür kıyı yerleri yerinde kaldı.
 */
const CAPE = { ang: 0.9, half: 0.85, size: 150 };
/** Kıyının ulaşabildiği en uzak yarıçap (arazi ağı ve bitkiler bunu kullanır). */
export const COAST_MAX = LAND_R + CAPE.size + 18;
/** Yürünebilir / yüzülebilir sınır. */
export const WORLD_R = 505;

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
  { id: 'fun', name: 'Lunapark', x: 160, z: -92, color: '#e9487d', spawn: [112, -64] },
  { id: 'lake', name: 'Göl', x: -140, z: 78, color: '#3fb7dd', spawn: [-86, 66] },
  { id: 'beach', name: 'Plaj', x: 0, z: 295, color: '#f3c76a', spawn: [0, 268] },
  { id: 'forest', name: 'Orman Kampı', x: -188, z: -148, color: '#3fa45a', spawn: [-155, -120] },
  { id: 'farm', name: 'Çiftlik', x: 65, z: 178, color: '#c98a4b', spawn: [45, 150] },
  { id: 'snow', name: 'Karlı Dağ', x: 232, z: 140, color: '#bfe9ff', spawn: [175, 115] },
  { id: 'dino', name: 'Dinozor Vadisi', x: -58, z: -245, color: '#e07b39', spawn: [-45, -210] },
  { id: 'castle', name: 'Şato', x: -278, z: 15, color: '#9b6bff', spawn: [-238, 15] },
  { id: 'lighthouse', name: 'Deniz Feneri', x: 80, z: -306, color: '#ef4b4b', spawn: [70, -278] },
  { id: 'rocket', name: 'Roket Üssü', x: 210, z: -210, color: '#5b8def', spawn: [188, -188] },
  { id: 'home', name: 'Çiftliğim', x: 124, z: 44, color: '#7cc760', spawn: [88, 44] },
  { id: 'market', name: 'Pazar', x: -20, z: 18, color: '#ff9f43', spawn: [-12, 13] },
  { id: 'portal', name: 'Macera Kapıları', x: -74, z: -36, color: '#c86bff', spawn: [-52, -26] },
  { id: 'city', name: 'Şehir', x: -22, z: -140, color: '#5b8def', spawn: [-17, -106] },
  { id: 'village', name: 'Köy', x: -120, z: 205, color: '#d9a066', spawn: [-103, 176] },
  { id: 'zoo', name: 'Hayvanat Bahçesi', x: 80, z: -178, color: '#f08c3a', spawn: [66, -147] },
  { id: 'airport', name: 'Havalimanı', x: 272, z: -30, color: '#8d99ae', spawn: [238, -26] },
  { id: 'picnic', name: 'Piknik Tepesi', x: -238, z: -80, color: '#ff8fb1', spawn: [-206, -69] },
  { id: 'downtown', name: 'Şehir Merkezi', x: 228, z: 288, color: '#6c7bff', spawn: [191, 241] },
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

/**
 * Kasabadan bölgelere giden yollar (kırık çizgiler; uçları bölge girişleri). Ağaçlar yolların üstüne gelmez.
 * Şehrin ana caddesi bölgenin içinden geçer (şehir girişinden güney çıkışına), sonra Dinozor Vadisi'ne gider.
 */
export const ROADS: [number, number][][] = [
  [[0, 0], [112, -64]],
  [[0, 0], [-17, -106]],
  [[-27, -174], [-45, -210]],
  [[0, 0], [60, -110], [188, -188]],
  [[60, -110], [66, -147]],
  [[60, -110], [20, -215], [70, -278]],
  [[0, 0], [-52, -26], [-155, -120]],
  [[-52, -26], [-206, -69]],
  [[0, 0], [-238, 15]],
  [[0, 0], [-86, 66]],
  [[0, 0], [-103, 176]],
  [[0, 0], [0, 268]],
  [[0, 0], [45, 150], [175, 115]],
  [[0, 0], [88, 44]],
  [[0, 0], [238, -26]],
  [[175, 115], [198, 180], [191, 241]],
];
/** Kasaba meydanının içinde yol çizilmez. */
export const ROAD_START = 26;

/** Noktanın en yakın yola uzaklığı. */
export function roadDist(x: number, z: number) {
  let best = Infinity;
  for (const r of ROADS) {
    for (let i = 1; i < r.length; i++) {
      const [ax, az] = r[i - 1], [bx, bz] = r[i];
      const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2));
      best = Math.min(best, Math.hypot(x - ax - dx * t, z - az - dz * t));
    }
  }
  return Math.hypot(x, z) < ROAD_START ? Infinity : best;
}

/** Kıyı çizgisinin yarıçapı (açıya göre girintili çıkıntılı). */
export function coastAt(ang: number) {
  let d = Math.abs(((ang - CAPE.ang + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI);
  const cape = d < CAPE.half ? CAPE.size * (0.5 + 0.5 * Math.cos((Math.PI * d) / CAPE.half)) : 0;
  return LAND_R + cape + 9 * Math.sin(ang * 3 + 0.4) + 6 * Math.sin(ang * 7 + 1.3) + 3 * Math.sin(ang * 13);
}

/** Bölgelerin dışında kalan ama düz olması gereken yerler (futbol ve basket sahaları). */
const FLAT_SPOTS = [{ x: 52, z: 70, a: 22, b: 34 }, { x: 52, z: 102, a: 15, b: 26 }];

/** Bölgelerin düzlüğü: yapıların olduğu yerlerde tepe dalgası yok. */
function flatMask(x: number, z: number) {
  let m = 0;
  for (const f of FLAT_SPOTS) m = Math.max(m, 1 - smooth(f.a, f.b, Math.hypot(x - f.x, z - f.z)));
  for (const zn of ZONES) {
    if (zn.id === 'snow' || zn.id === 'dino') continue;
    const [a, b] = zn.id === 'home' ? [50, 72] : zn.id === 'downtown' ? [58, 84] : zn.id === 'airport' ? [44, 66] : [34, 58];
    m = Math.max(m, 1 - smooth(a, b, Math.hypot(x - zn.x, z - zn.z)));
  }
  return m;
}

export const LAKE = { x: -140, z: 78, r: 50 };
export const SNOW_PEAK = { x: 245, z: 150, h: 34, r: 58 };
export const VOLCANO = { x: -102, z: -280, r: 16, h: 18 };

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
  // kıyı boyunca geniş kumsal (şemsiyeler ve havlular çimene değil kuma kurulsun) ve göl kenarı
  if (h < 1.0 || Math.hypot(x, z) > coastAt(Math.atan2(z, x)) - 22) return 'sand';
  if (Math.hypot(x - zone('dino').x, z - zone('dino').z) < 52) return 'dirt';
  return 'grass';
}
