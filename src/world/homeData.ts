/**
 * Evim: ev planları, eşya kataloğu, yerleştirme kuralları ve yol bulma (saf hesap, three.js yok).
 *
 * Ev bir ızgaradır (1 karo = 1 birim). Odalar dikdörtgendir; iki farklı oda (ya da dışarısı) arasındaki karo kenarında
 * duvar vardır, kapılar duvarda boşluktur. Evin çevresi bahçedir (arsa). Eşyalar karolara oturur, 90°'lik adımlarla döner;
 * duvar eşyaları (tablo, saat…) bir duvar kenarına asılır. Altın çiftlikle ortaktır (economy.ts FarmState.coins).
 */

// ================================================================================================
// Planlar
// ================================================================================================
export interface Room { id: string; name: string; x: number; z: number; w: number; d: number }
/** Kapı: (x,z) karosunun `side` kenarında. */
export interface Door { x: number; z: number; side: Side }
export type Side = 'n' | 'e' | 's' | 'w';
export interface Plan { id: string; name: string; price: number; w: number; d: number; rooms: Room[]; doors: Door[]; front: Door; /** Özel paket (premium.ts). */ premium?: string }

/** Bahçe payı: evin çevresinde kaç karo. */
export const YARD = 4;

export const PLANS: Plan[] = [
  {
    id: 'a', name: 'Sevimli ev', price: 0, w: 8, d: 6,
    rooms: [
      { id: 'mutfak', name: 'Mutfak', x: 0, z: 0, w: 3, d: 2 },
      { id: 'yatak', name: 'Yatak odası', x: 3, z: 0, w: 5, d: 3 },
      { id: 'salon', name: 'Oturma odası', x: 0, z: 2, w: 3, d: 4 },
      { id: 'hol', name: 'Oturma odası', x: 3, z: 3, w: 2, d: 3 },
      { id: 'banyo', name: 'Banyo', x: 5, z: 3, w: 3, d: 3 },
    ],
    doors: [{ x: 1, z: 1, side: 's' }, { x: 3, z: 3, side: 'n' }, { x: 4, z: 4, side: 'e' }],
    front: { x: 1, z: 5, side: 's' },
  },
  {
    id: 'b', name: 'Bahçeli ev', price: 250, w: 10, d: 7,
    rooms: [
      { id: 'mutfak', name: 'Mutfak', x: 0, z: 0, w: 4, d: 3 },
      { id: 'yatak', name: 'Yatak odası', x: 4, z: 0, w: 3, d: 4 },
      { id: 'cocuk', name: 'Oyun odası', x: 7, z: 0, w: 3, d: 4 },
      { id: 'salon', name: 'Oturma odası', x: 0, z: 3, w: 4, d: 4 },
      { id: 'hol', name: 'Oturma odası', x: 4, z: 4, w: 3, d: 3 },
      { id: 'banyo', name: 'Banyo', x: 7, z: 4, w: 3, d: 3 },
    ],
    doors: [{ x: 1, z: 2, side: 's' }, { x: 5, z: 3, side: 's' }, { x: 8, z: 3, side: 's' }, { x: 7, z: 1, side: 'w' }, { x: 6, z: 5, side: 'e' }],
    front: { x: 2, z: 6, side: 's' },
  },
  {
    id: 'c', name: 'Büyük ev', price: 600, w: 12, d: 9,
    rooms: [
      { id: 'mutfak', name: 'Mutfak', x: 0, z: 0, w: 5, d: 3 },
      { id: 'yatak', name: 'Yatak odası', x: 5, z: 0, w: 4, d: 3 },
      { id: 'cocuk', name: 'Oyun odası', x: 9, z: 0, w: 3, d: 5 },
      { id: 'atolye', name: 'Resim atölyesi', x: 0, z: 3, w: 3, d: 3 },
      { id: 'salon', name: 'Oturma odası', x: 3, z: 3, w: 6, d: 6 },
      { id: 'hol', name: 'Oturma odası', x: 0, z: 6, w: 3, d: 3 },
      { id: 'banyo', name: 'Banyo', x: 9, z: 5, w: 3, d: 4 },
    ],
    doors: [{ x: 2, z: 2, side: 's' }, { x: 6, z: 3, side: 'n' }, { x: 3, z: 4, side: 'w' }, { x: 2, z: 7, side: 'e' }, { x: 8, z: 7, side: 'e' }, { x: 8, z: 3, side: 'e' }],
    front: { x: 5, z: 8, side: 's' },
  },
  {
    id: 'sato', name: 'Şato evi', price: 0, premium: 'sato', w: 12, d: 10,
    rooms: [
      { id: 'mutfak', name: 'Mutfak', x: 0, z: 0, w: 4, d: 3 },
      { id: 'yatak', name: 'Yatak odası', x: 4, z: 0, w: 4, d: 4 },
      { id: 'cocuk', name: 'Oyun odası', x: 8, z: 0, w: 4, d: 4 },
      { id: 'atolye', name: 'Kütüphane', x: 0, z: 3, w: 4, d: 3 },
      { id: 'salon', name: 'Taht salonu', x: 4, z: 4, w: 8, d: 6 },
      { id: 'banyo', name: 'Banyo', x: 0, z: 6, w: 4, d: 4 },
    ],
    doors: [{ x: 1, z: 2, side: 's' }, { x: 3, z: 4, side: 'e' }, { x: 5, z: 3, side: 's' }, { x: 9, z: 3, side: 's' }, { x: 3, z: 7, side: 'e' }],
    front: { x: 7, z: 9, side: 's' },
  },
];
export const plan = (id: string) => PLANS.find((p) => p.id === id) ?? PLANS[0];

/** Arsa (bahçe dahil) boyutu ve evin arsadaki yeri. */
export const lot = (p: Plan) => ({ w: p.w + YARD * 2, d: p.d + YARD * 2, hx: YARD, hz: YARD });

/** Arsa karosunun odası ('' = bahçe, null = arsa dışı). Koordinatlar arsaya göre. */
export function roomAt(p: Plan, x: number, z: number): string | null {
  const L = lot(p);
  if (x < 0 || z < 0 || x >= L.w || z >= L.d) return null;
  const hx = x - L.hx, hz = z - L.hz;
  for (const r of p.rooms) if (hx >= r.x && hx < r.x + r.w && hz >= r.z && hz < r.z + r.d) return r.id;
  return '';
}

const step: Record<Side, [number, number]> = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
const opp: Record<Side, Side> = { n: 's', s: 'n', e: 'w', w: 'e' };

function isDoor(p: Plan, x: number, z: number, side: Side) {
  const L = lot(p);
  return [...p.doors, p.front].some((d) => {
    const ax = d.x + L.hx, az = d.z + L.hz;
    const [ex, ez] = step[d.side];
    // kapı bu kenarda: ya kapının kendi karosundan ya da karşı karodan bakılıyor
    return (ax === x && az === z && d.side === side) || (ax + ex === x && az + ez === z && opp[d.side] === side);
  });
}

/** (x,z) karosunun `side` kenarında duvar var mı (kapılar boşluktur). */
export function wallAt(p: Plan, x: number, z: number, side: Side): boolean {
  const a = roomAt(p, x, z);
  const [dx, dz] = step[side];
  const b = roomAt(p, x + dx, z + dz);
  if (a === null || b === null) return false;
  const inside = (r: string) => r !== '';
  if (!inside(a) && !inside(b)) return false;
  // aynı odanın parçaları ("salon" ve "hol" gibi aynı adlı odalar) arasında duvar yok
  const name = (r: string) => p.rooms.find((x) => x.id === r)?.name;
  if (inside(a) && inside(b) && (a === b || name(a) === name(b))) return false;
  return !isDoor(p, x, z, side);
}

/** Bütün duvar kenarları (çizim için): her kenar bir kez. */
export function walls(p: Plan): { x: number; z: number; side: 'n' | 'w'; outer: boolean; door: boolean; room: string }[] {
  const L = lot(p);
  const out: { x: number; z: number; side: 'n' | 'w'; outer: boolean; door: boolean; room: string }[] = [];
  for (let x = 0; x <= L.w; x++) for (let z = 0; z <= L.d; z++) {
    for (const side of ['n', 'w'] as const) {
      const [dx, dz] = step[side];
      const a = roomAt(p, x, z) ?? '', b = roomAt(p, x + dx, z + dz) ?? '';
      if (a === '' && b === '') continue;
      const name = (r: string) => p.rooms.find((y) => y.id === r)?.name;
      if (a !== '' && b !== '' && (a === b || name(a) === name(b))) continue;
      const door = isDoor(p, x, z, side);
      out.push({ x, z, side, outer: a === '' || b === '', door, room: a || b });
    }
  }
  return out;
}

// ================================================================================================
// Eşyalar
// ================================================================================================
export type Cat = 'oturma' | 'yatak' | 'mutfak' | 'banyo' | 'oyun' | 'sus' | 'duvar' | 'bahce';
export const CATS: { id: Cat; name: string; icon: string }[] = [
  { id: 'oturma', name: 'Oturma', icon: 'kanepe' },
  { id: 'yatak', name: 'Yatak odası', icon: 'yatak' },
  { id: 'mutfak', name: 'Mutfak', icon: 'tava' },
  { id: 'banyo', name: 'Banyo', icon: 'kuvet' },
  { id: 'oyun', name: 'Oyun ve sanat', icon: 'palet' },
  { id: 'sus', name: 'Süsler', icon: 'saksi' },
  { id: 'duvar', name: 'Duvara', icon: 'cerceve' },
  { id: 'bahce', name: 'Bahçe', icon: 'agac' },
];

/** Eşyayla oynama: poz, süre, kısa mesaj ya da bir sayfaya gitme. */
export type Use =
  | { kind: 'sit' | 'sleep' | 'cook' | 'snack' | 'wash' | 'bath' | 'watch' | 'piano' | 'play' | 'bounce' | 'swing' | 'slide' | 'swim' | 'dig' | 'water' | 'look' | 'grill' | 'pet' | 'dance'; msg: string }
  | { kind: 'page'; page: 'giydir' | 'ciz' | 'hikaye' | 'ogren'; msg: string };

export interface Item {
  id: string;
  name: string;
  cat: Cat;
  price: number;
  w: number;
  d: number;
  colors: string[];
  /** Dışarıda (bahçede) mı konur? */
  out?: boolean;
  /** Duvara asılır. */
  wall?: boolean;
  /** Üstünden yürünür (halı). */
  flat?: boolean;
  use?: Use;
  /** Yalnızca özel paketle (premium.ts); açılınca bedava konur. */
  premium?: string;
}

export const ITEMS: Item[] = [
  // oturma
  { id: 'kanepe', name: 'Kanepe', cat: 'oturma', price: 60, w: 2, d: 1, colors: ['#b8b4e6', '#f2b8a2', '#a8d8c8', '#f6d68e'], use: { kind: 'sit', msg: 'Ne rahat bir kanepe!' } },
  { id: 'koltuk', name: 'Koltuk', cat: 'oturma', price: 30, w: 1, d: 1, colors: ['#f2b8a2', '#b8b4e6', '#a8d8c8', '#e8a0b8'], use: { kind: 'sit', msg: 'Biraz dinlenelim.' } },
  { id: 'puf', name: 'Armut koltuk', cat: 'oturma', price: 18, w: 1, d: 1, colors: ['#ffcf6b', '#9ad0f5', '#f5a3c7', '#b7e3a0'], use: { kind: 'sit', msg: 'Puf! Yumuşacık.' } },
  { id: 'sehpa', name: 'Sehpa', cat: 'oturma', price: 15, w: 1, d: 1, colors: ['#d9b48a', '#ffffff', '#9c7a5b'] },
  { id: 'tv', name: 'Televizyon', cat: 'oturma', price: 50, w: 2, d: 1, colors: ['#e9e4dc', '#9c7a5b', '#b8b4e6'], use: { kind: 'watch', msg: 'Çizgi film başladı!' } },
  { id: 'kitaplik', name: 'Kitaplık', cat: 'oturma', price: 40, w: 2, d: 1, colors: ['#d9b48a', '#ffffff', '#b8b4e6'], use: { kind: 'page', page: 'hikaye', msg: 'Hikaye kitaplarına bakalım!' } },
  { id: 'hali', name: 'Halı', cat: 'oturma', price: 20, w: 2, d: 2, flat: true, colors: ['#e8c9e8', '#c9e2f2', '#f6e3b4', '#d4ecd0'] },
  { id: 'lamba', name: 'Lamba', cat: 'oturma', price: 12, w: 1, d: 1, colors: ['#ffe9a8', '#ffd1dc', '#cfe8ff'] },
  { id: 'masa', name: 'Yemek masası', cat: 'mutfak', price: 35, w: 2, d: 1, colors: ['#d9b48a', '#ffffff', '#9c7a5b'] },
  { id: 'sandalye', name: 'Sandalye', cat: 'mutfak', price: 10, w: 1, d: 1, colors: ['#d9b48a', '#f2b8a2', '#b8b4e6', '#a8d8c8'], use: { kind: 'sit', msg: 'Afiyet olsun!' } },
  // yatak odası
  { id: 'yatak', name: 'Yatak', cat: 'yatak', price: 45, w: 1, d: 2, colors: ['#b8b4e6', '#f5a3c7', '#9ad0f5', '#b7e3a0'], use: { kind: 'sleep', msg: 'Zzz… Tatlı rüyalar!' } },
  { id: 'komodin', name: 'Komodin', cat: 'yatak', price: 12, w: 1, d: 1, colors: ['#d9b48a', '#ffffff', '#b8b4e6'] },
  { id: 'gardirop', name: 'Gardırop', cat: 'yatak', price: 40, w: 2, d: 1, colors: ['#ffffff', '#d9b48a', '#f2b8a2'], use: { kind: 'page', page: 'giydir', msg: 'Hadi kıyafetini değiştirelim!' } },
  { id: 'calisma', name: 'Çalışma masası', cat: 'yatak', price: 35, w: 2, d: 1, colors: ['#ffffff', '#d9b48a', '#a8d8c8'], use: { kind: 'page', page: 'ogren', msg: 'Bugün ne çizmeyi öğrenelim?' } },
  { id: 'evcil', name: 'Evcil hayvan yatağı', cat: 'yatak', price: 14, w: 1, d: 1, colors: ['#f2b8a2', '#9ad0f5', '#f5a3c7'], use: { kind: 'pet', msg: 'Dostum burada uyusun.' } },
  // mutfak
  { id: 'buzdolabi', name: 'Buzdolabı', cat: 'mutfak', price: 40, w: 1, d: 1, colors: ['#e9f2f7', '#f5d0d6', '#d6f0e0'], use: { kind: 'snack', msg: 'Çıtır bir elma!' } },
  { id: 'ocak', name: 'Ocak', cat: 'mutfak', price: 35, w: 1, d: 1, colors: ['#ffffff', '#f6d68e', '#b8b4e6'], use: { kind: 'cook', msg: 'Mmm, mis gibi çorba!' } },
  { id: 'tezgah', name: 'Tezgâh', cat: 'mutfak', price: 15, w: 1, d: 1, colors: ['#ffffff', '#d9b48a', '#a8d8c8'] },
  { id: 'evye', name: 'Evye', cat: 'mutfak', price: 20, w: 1, d: 1, colors: ['#ffffff', '#d9b48a', '#b8b4e6'], use: { kind: 'wash', msg: 'Bulaşıklar pırıl pırıl!' } },
  // banyo
  { id: 'kuvet', name: 'Küvet', cat: 'banyo', price: 45, w: 2, d: 1, colors: ['#ffffff', '#cfe8ff', '#ffd1dc'], use: { kind: 'bath', msg: 'Köpük köpük banyo!' } },
  { id: 'lavabo', name: 'Lavabo', cat: 'banyo', price: 20, w: 1, d: 1, colors: ['#ffffff', '#cfe8ff', '#ffd1dc'], use: { kind: 'wash', msg: 'Ellerimi yıkadım!' } },
  // oyun ve sanat
  { id: 'sovale', name: 'Şövale', cat: 'oyun', price: 25, w: 1, d: 1, colors: ['#d9b48a', '#ffffff'], use: { kind: 'page', page: 'ciz', msg: 'Hadi bir resim çizelim!' } },
  { id: 'piyano', name: 'Piyano', cat: 'oyun', price: 80, w: 2, d: 1, colors: ['#3a3f4a', '#ffffff', '#b8b4e6'], use: { kind: 'piano', msg: 'Ne güzel bir şarkı!' } },
  { id: 'oyuncak', name: 'Oyuncak sandığı', cat: 'oyun', price: 18, w: 1, d: 1, colors: ['#f2b8a2', '#9ad0f5', '#b7e3a0'], use: { kind: 'play', msg: 'Oyuncaklarla oynadın!' } },
  { id: 'akvaryum', name: 'Akvaryum', cat: 'oyun', price: 45, w: 1, d: 1, colors: ['#ffffff', '#d9b48a'], use: { kind: 'look', msg: 'Balıklar sana el salladı!' } },
  { id: 'dansmat', name: 'Dans halısı', cat: 'oyun', price: 30, w: 2, d: 2, flat: true, colors: ['#f5a3c7', '#9ad0f5', '#ffcf6b'], use: { kind: 'dance', msg: 'Harika dans ettin!' } },
  // süsler
  { id: 'saksi', name: 'Saksı çiçeği', cat: 'sus', price: 8, w: 1, d: 1, colors: ['#ff8fb1', '#ffd43b', '#9775fa', '#ffffff'], use: { kind: 'water', msg: 'Çiçeğini suladın!' } },
  { id: 'bitki', name: 'Büyük bitki', cat: 'sus', price: 14, w: 1, d: 1, colors: ['#e9e4dc', '#f2b8a2', '#b8b4e6'], use: { kind: 'water', msg: 'Bitkin büyüyor!' } },
  { id: 'ayicik', name: 'Oyuncak ayı', cat: 'sus', price: 12, w: 1, d: 1, colors: ['#c98a4b', '#f5a3c7', '#ffffff'], use: { kind: 'play', msg: 'Ayıcığa sarıldın!' } },
  { id: 'yerlamba', name: 'Yıldız lamba', cat: 'sus', price: 16, w: 1, d: 1, colors: ['#ffe9a8', '#cfe8ff', '#ffd1dc'] },
  // duvara
  { id: 'tablo', name: 'Resmim', cat: 'duvar', price: 10, w: 1, d: 1, wall: true, colors: ['#d9b48a', '#ffffff', '#b8b4e6', '#3a3f4a'], use: { kind: 'look', msg: 'Ne güzel bir resim, sen mi çizdin?' } },
  { id: 'raf', name: 'Raf', cat: 'duvar', price: 8, w: 1, d: 1, wall: true, colors: ['#d9b48a', '#ffffff'] },
  { id: 'saat', name: 'Saat', cat: 'duvar', price: 12, w: 1, d: 1, wall: true, colors: ['#ffffff', '#f6d68e', '#b8b4e6'] },
  { id: 'ayna', name: 'Ayna', cat: 'duvar', price: 15, w: 1, d: 1, wall: true, colors: ['#d9b48a', '#ffffff', '#f2b8a2'], use: { kind: 'look', msg: 'Bugün çok şıksın!' } },
  // özel paketler
  { id: 'uzayyatak', name: 'Uzay yatağı', cat: 'yatak', price: 0, premium: 'sihir', w: 1, d: 2, colors: ['#5b4bb7', '#2d1b69'], use: { kind: 'sleep', msg: 'Yıldızların arasında uyudun!' } },
  { id: 'dondurma', name: 'Dondurma makinesi', cat: 'mutfak', price: 0, premium: 'sihir', w: 1, d: 1, colors: ['#ffd1e8', '#cfe8ff'], use: { kind: 'snack', msg: 'Çilekli dondurma, mmm!' } },
  { id: 'devakvaryum', name: 'Dev akvaryum', cat: 'oyun', price: 0, premium: 'sihir', w: 2, d: 1, colors: ['#ffffff', '#d9b48a'], use: { kind: 'look', msg: 'Ahtapot sana el salladı!' } },
  { id: 'gokkusagihali', name: 'Gökkuşağı halı', cat: 'oturma', price: 0, premium: 'sihir', w: 2, d: 2, flat: true, colors: ['#ffffff'], use: { kind: 'dance', msg: 'Gökkuşağında dans ettin!' } },
  { id: 'taht', name: 'Taht', cat: 'oturma', price: 0, premium: 'sato', w: 1, d: 1, colors: ['#e9487d', '#7c5cff', '#2bb673'], use: { kind: 'sit', msg: 'Tahtına kuruldun, majesteleri!' } },
  { id: 'kaleyatak', name: 'Kale yatak', cat: 'yatak', price: 0, premium: 'sato', w: 2, d: 2, colors: ['#f5a3c7', '#9ad0f5'], use: { kind: 'sleep', msg: 'Kale yatağında prens gibi uyudun!' } },
  { id: 'avize', name: 'Kristal avize', cat: 'duvar', price: 0, premium: 'sato', w: 1, d: 1, wall: true, colors: ['#cfeaff', '#ffe9a8'], use: { kind: 'look', msg: 'Pırıl pırıl!' } },
  // bahçe
  { id: 'agac', name: 'Ağaç', cat: 'bahce', price: 20, w: 1, d: 1, out: true, colors: ['#9c8fd8', '#7cc790', '#f5a3c7'] },
  { id: 'cicek', name: 'Çiçek tarhı', cat: 'bahce', price: 12, w: 2, d: 1, out: true, colors: ['#ff8fb1', '#ffd43b', '#9775fa'], use: { kind: 'water', msg: 'Çiçekler sana gülümsedi!' } },
  { id: 'salincak', name: 'Salıncak', cat: 'bahce', price: 40, w: 2, d: 1, out: true, colors: ['#f2b8a2', '#9ad0f5', '#b7e3a0'], use: { kind: 'swing', msg: 'Uçuyorum!' } },
  { id: 'kaydirak', name: 'Kaydırak', cat: 'bahce', price: 50, w: 1, d: 3, out: true, colors: ['#ffcf6b', '#f5a3c7', '#9ad0f5'], use: { kind: 'slide', msg: 'Vııın!' } },
  { id: 'trambolin', name: 'Trambolin', cat: 'bahce', price: 45, w: 2, d: 2, out: true, colors: ['#9ad0f5', '#f5a3c7', '#b7e3a0'], use: { kind: 'bounce', msg: 'Hop hop hop!' } },
  { id: 'havuz', name: 'Havuz', cat: 'bahce', price: 90, w: 3, d: 2, out: true, colors: ['#8fd3f4', '#a8e6cf'], use: { kind: 'swim', msg: 'Şap şap şap, yüzüyorum!' } },
  { id: 'kum', name: 'Kum havuzu', cat: 'bahce', price: 25, w: 2, d: 2, out: true, colors: ['#f6e3b4'], use: { kind: 'dig', msg: 'Kumdan bir kale yaptın!' } },
  { id: 'mangal', name: 'Mangal', cat: 'bahce', price: 25, w: 1, d: 1, out: true, colors: ['#3a3f4a', '#ef6b6b'], use: { kind: 'grill', msg: 'Mısırlar közlendi!' } },
  { id: 'piknik', name: 'Piknik masası', cat: 'bahce', price: 30, w: 2, d: 2, out: true, colors: ['#d9b48a', '#f2b8a2'], use: { kind: 'sit', msg: 'Ne güzel bir piknik!' } },
  { id: 'bank', name: 'Bahçe bankı', cat: 'bahce', price: 15, w: 2, d: 1, out: true, colors: ['#d9b48a', '#ffffff', '#9ad0f5'], use: { kind: 'sit', msg: 'Kuşları izliyorum.' } },
  { id: 'kulube', name: 'Köpek kulübesi', cat: 'bahce', price: 25, w: 1, d: 1, out: true, colors: ['#f2b8a2', '#9ad0f5', '#d9b48a'], use: { kind: 'pet', msg: 'Dostun kulübesine girdi.' } },
  { id: 'fiskiye', name: 'Fıskiye', cat: 'bahce', price: 40, w: 1, d: 1, out: true, colors: ['#e9e4dc', '#cfe8ff'], use: { kind: 'look', msg: 'Şırıl şırıl!' } },
];
export const item = (id: string) => ITEMS.find((i) => i.id === id);

/** Zemin ve duvar seçenekleri (oda başına). */
export const FLOORS = [
  { id: 'tahta', name: 'Tahta', color: '#e3c9a5' },
  { id: 'koyu', name: 'Ceviz', color: '#b98a64' },
  { id: 'karo', name: 'Karo', color: '#eef0f2' },
  { id: 'pembe', name: 'Pembe halı', color: '#f4d3df' },
  { id: 'mavi', name: 'Mavi halı', color: '#cfe3f2' },
  { id: 'yesil', name: 'Yeşil halı', color: '#d7ecd2' },
] as const;
export const WALLS = ['#f7f3ec', '#f6e1d6', '#e3e0f5', '#dcefe6', '#fbecc4', '#d9ebf7', '#f5d7e3'];

// ================================================================================================
// Durum
// ================================================================================================
export interface Placed { id: string; x: number; z: number; r: number; c: number }
export interface HomeState {
  plan: string;
  plans: string[];
  items: Placed[];
  /** Oda → zemin numarası / duvar rengi numarası. */
  floor: Record<string, number>;
  wall: Record<string, number>;
  /** Plan değişince sığmayan eşyalar (bedava yeniden konur). */
  stored: string[];
}

/** Başlangıç evi: boş değil, sıcak bir yuva (arsa koordinatları). */
export function newHome(): HomeState {
  const Y = YARD;
  return {
    plan: 'a', plans: ['a'],
    items: [
      { id: 'kanepe', x: Y + 0, z: Y + 4, r: 3, c: 0 },
      { id: 'hali', x: Y + 1, z: Y + 3, r: 0, c: 0 },
      { id: 'tv', x: Y + 2, z: Y + 4, r: 1, c: 0 },
      { id: 'saksi', x: Y + 0, z: Y + 2, r: 0, c: 0 },
      { id: 'buzdolabi', x: Y + 0, z: Y + 0, r: 0, c: 0 },
      { id: 'ocak', x: Y + 1, z: Y + 0, r: 0, c: 0 },
      { id: 'masa', x: Y + 2, z: Y + 0, r: 1, c: 0 },
      { id: 'yatak', x: Y + 6, z: Y + 0, r: 0, c: 0 },
      { id: 'komodin', x: Y + 7, z: Y + 0, r: 0, c: 0 },
      { id: 'gardirop', x: Y + 3, z: Y + 0, r: 0, c: 0 },
      { id: 'sovale', x: Y + 4, z: Y + 2, r: 0, c: 0 },
      { id: 'kuvet', x: Y + 6, z: Y + 5, r: 2, c: 0 },
      { id: 'lavabo', x: Y + 7, z: Y + 3, r: 3, c: 0 },
      { id: 'tablo', x: Y + 0, z: Y + 3, r: 0, c: 0 },
      { id: 'agac', x: 1, z: 2, r: 0, c: 0 },
      { id: 'agac', x: Y + 9, z: 3, r: 0, c: 1 },
      { id: 'cicek', x: Y + 3, z: Y + 7, r: 0, c: 0 },
      { id: 'salincak', x: 2, z: Y + 6, r: 0, c: 0 },
    ],
    floor: { mutfak: 2, yatak: 3, salon: 0, hol: 0, banyo: 2 },
    wall: { mutfak: 4, yatak: 2, salon: 0, hol: 0, banyo: 5 },
    stored: [],
  };
}

export function normalizeHome(h: Partial<HomeState> | undefined): HomeState {
  const n = newHome();
  if (!h?.items) return n;
  return { ...n, ...h, plans: h.plans?.length ? h.plans : ['a'], floor: { ...n.floor, ...h.floor }, wall: { ...n.wall, ...h.wall }, stored: h.stored ?? [] };
}

/** Döndürülmüş ayak izi (karolar). */
export function footprint(p: Placed): [number, number][] {
  const it = item(p.id);
  if (!it) return [];
  const [w, d] = p.r % 2 ? [it.d, it.w] : [it.w, it.d];
  const out: [number, number][] = [];
  for (let i = 0; i < w; i++) for (let j = 0; j < d; j++) out.push([p.x + i, p.z + j]);
  return out;
}

/** Eşyanın baktığı yön (r=0: güney/+z, 1: batı, 2: kuzey, 3: doğu) birim vektör. */
export const facing = (r: number): [number, number] => [[0, 1], [-1, 0], [0, -1], [1, 0]][((r % 4) + 4) % 4] as [number, number];

/** Duvar eşyası hangi kenara asılır: karonun duvarlı kenarı (öncelik: kuzey, batı, doğu, güney). */
export function wallSide(p: Plan, x: number, z: number, prefer?: Side): Side | null {
  const order: Side[] = prefer ? [prefer, 'n', 'w', 'e', 's'] : ['n', 'w', 'e', 's'];
  for (const s of order) if (wallAt(p, x, z, s)) return s;
  return null;
}

/** Bu karolar kapı önü mü (oraya eşya konmaz ki yol kapanmasın). */
function doorTiles(p: Plan): Set<string> {
  const L = lot(p);
  const set = new Set<string>();
  for (const d of [...p.doors, p.front]) {
    const ax = d.x + L.hx, az = d.z + L.hz;
    const [dx, dz] = step[d.side];
    set.add(`${ax},${az}`);
    set.add(`${ax + dx},${az + dz}`);
  }
  return set;
}

/** Yerleştirme olur mu? Olmazsa neden. `ignore`: taşınan eşyanın kendisi. */
export function canPlace(h: HomeState, p: Placed, ignore = -1): string | null {
  const it = item(p.id);
  if (!it) return 'Bilinmeyen eşya.';
  const P = plan(h.plan);
  const tiles = footprint(p);
  const doors = doorTiles(P);
  if (it.wall) {
    const [x, z] = tiles[0];
    const r = roomAt(P, x, z);
    if (!r) return 'Resimler evin içindeki duvarlara asılır.';
    if (!wallSide(P, x, z)) return 'Buraya duvar yok. Duvarın dibindeki bir yere dokun.';
    const clash = h.items.some((o, i) => i !== ignore && item(o.id)?.wall && o.x === x && o.z === z);
    return clash ? 'Bu duvarda zaten bir şey asılı.' : null;
  }
  for (const [x, z] of tiles) {
    const r = roomAt(P, x, z);
    if (r === null) return 'Arsanın dışına konamaz.';
    if (it.out && r !== '') return 'Bu bahçe eşyası; dışarıya koyalım.';
    if (!it.out && r === '') return 'Bu ev eşyası; içeriye koyalım.';
    if (!it.flat && doors.has(`${x},${z}`)) return 'Kapının önünü kapatmayalım.';
  }
  // aynı odada mı (duvar içinden geçmesin)
  for (let k = 1; k < tiles.length; k++) {
    const [x, z] = tiles[k];
    for (const [ox, oz] of tiles.slice(0, k)) {
      const dx = x - ox, dz = z - oz;
      if (Math.abs(dx) + Math.abs(dz) !== 1) continue;
      const side: Side = dx === 1 ? 'e' : dx === -1 ? 'w' : dz === 1 ? 's' : 'n';
      if (wallAt(P, ox, oz, side)) return 'Duvarın içinden geçemez.';
    }
  }
  const occ = occupied(h, ignore);
  for (const [x, z] of tiles) {
    const o = occ.get(`${x},${z}`);
    if (o && !(it.flat || o.flat)) return 'Orası dolu. Boş bir yer seç.';
    if (o && it.flat && o.flat) return 'Orada zaten bir halı var.';
  }
  return null;
}

/** Dolu karolar (yerdeki eşyalar). */
export function occupied(h: HomeState, ignore = -1) {
  const m = new Map<string, { i: number; flat: boolean }>();
  h.items.forEach((p, i) => {
    if (i === ignore) return;
    const it = item(p.id);
    if (!it || it.wall) return;
    for (const [x, z] of footprint(p)) {
      const k = `${x},${z}`;
      const cur = m.get(k);
      if (!cur || cur.flat) m.set(k, { i, flat: !!it.flat });
    }
  });
  return m;
}

// ================================================================================================
// Yürüme: karo ızgarasında en kısa yol (duvarlar ve eşyalar engel)
// ================================================================================================
export function path(h: HomeState, from: [number, number], to: [number, number]): [number, number][] | null {
  const P = plan(h.plan);
  const L = lot(P);
  const occ = occupied(h);
  const blocked = (x: number, z: number) => {
    const o = occ.get(`${x},${z}`);
    return !!o && !o.flat;
  };
  const key = (x: number, z: number) => z * L.w + x;
  const prev = new Map<number, number>();
  const q: [number, number][] = [from];
  prev.set(key(...from), -1);
  while (q.length) {
    const [x, z] = q.shift()!;
    if (x === to[0] && z === to[1]) {
      const out: [number, number][] = [];
      let k = key(x, z);
      while (k !== -1) {
        out.unshift([k % L.w, Math.floor(k / L.w)]);
        k = prev.get(k)!;
      }
      return out;
    }
    for (const side of ['n', 'e', 's', 'w'] as Side[]) {
      const [dx, dz] = step[side];
      const nx = x + dx, nz = z + dz;
      if (nx < 0 || nz < 0 || nx >= L.w || nz >= L.d) continue;
      if (prev.has(key(nx, nz))) continue;
      if (wallAt(P, x, z, side)) continue;
      if (blocked(nx, nz) && !(nx === to[0] && nz === to[1])) continue;
      prev.set(key(nx, nz), key(x, z));
      q.push([nx, nz]);
    }
  }
  return null;
}

/** Eşyayı kullanmak için durulacak karo: önündeki boş karolardan biri. */
export function useTile(h: HomeState, i: number, from: [number, number]): [number, number] | null {
  const p = h.items[i];
  const it = item(p.id);
  if (!it) return null;
  const P = plan(h.plan);
  const occ = occupied(h, i);
  const tiles = footprint(p);
  const [fx, fz] = facing(p.r);
  const cands: [number, number][] = [];
  if (it.wall) cands.push([p.x, p.z]);
  else if (it.flat) cands.push(...tiles);
  else {
    for (const [x, z] of tiles) cands.push([x + fx, z + fz]);
    // yanlar ve arka (yedek)
    for (const [x, z] of tiles) for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) cands.push([x + dx, z + dz]);
  }
  const ok = cands.filter(([x, z]) => {
    if (roomAt(P, x, z) === null) return false;
    const o = occ.get(`${x},${z}`);
    if (o && !o.flat) return false;
    return !tiles.some(([tx, tz]) => tx === x && tz === z) || it.flat || it.wall;
  });
  let best: [number, number] | null = null, bl = Infinity;
  for (const c of ok) {
    const pth = path(h, from, c);
    if (pth && pth.length < bl) [best, bl] = [c, pth.length];
  }
  return best;
}

// ================================================================================================
// Altın: alma, satma, plan
// ================================================================================================
export const SELL_BACK = 0.8;
export const sellPrice = (id: string) => Math.floor((item(id)?.price ?? 0) * SELL_BACK);

/**
 * Plan değişince eşyalar odalarıyla taşınır: banyodaki küvet yeni evin banyosuna, bahçedekiler evin aynı yanına.
 * Sığmayanlar depoya gider (bedava yeniden konur).
 */
export function changePlan(h: HomeState, id: string): HomeState {
  const A = plan(h.plan), B = plan(id);
  const LA = lot(A), LB = lot(B);
  const next: HomeState = { ...h, plan: id, plans: h.plans.includes(id) ? h.plans : [...h.plans, id], items: [], stored: [...h.stored] };
  const roomOf = (P: Plan, rid: string) => P.rooms.find((r) => r.id === rid) ?? P.rooms.find((r) => r.name === A.rooms.find((x) => x.id === rid)?.name);
  // önce büyük eşyalar (yer bulsunlar), duvar eşyaları en son
  const order = h.items.map((p, i) => [p, i] as const).sort(([a], [b]) => {
    const ia = item(a.id), ib = item(b.id);
    return (ia?.wall ? 1 : 0) - (ib?.wall ? 1 : 0) || (ib ? ib.w * ib.d : 0) - (ia ? ia.w * ia.d : 0);
  });
  for (const [p] of order) {
    const it = item(p.id);
    if (!it) continue;
    const rid = roomAt(A, p.x, p.z);
    const cands: Placed[] = [];
    if (rid) {
      const ra = A.rooms.find((r) => r.id === rid)!;
      const rb = roomOf(B, rid);
      if (rb) {
        const dx = p.x - LA.hx - ra.x, dz = p.z - LA.hz - ra.z;
        const fw = p.r % 2 ? it.d : it.w, fd = p.r % 2 ? it.w : it.d;
        const bx = LB.hx + rb.x, bz = LB.hz + rb.z;
        const x0 = bx + Math.min(dx, Math.max(0, rb.w - fw)), z0 = bz + Math.min(dz, Math.max(0, rb.d - fd));
        cands.push({ ...p, x: x0, z: z0 });
        // odanın içinde yakından uzağa diğer yerler ve yönler
        const more: [number, Placed][] = [];
        for (let x = bx; x < bx + rb.w; x++) for (let z = bz; z < bz + rb.d; z++) for (const r of [p.r, (p.r + 1) % 4, (p.r + 2) % 4, (p.r + 3) % 4]) more.push([Math.abs(x - x0) + Math.abs(z - z0) + (r === p.r ? 0 : 0.5), { ...p, x, z, r }]);
        more.sort((a, b) => a[0] - b[0]);
        cands.push(...more.map((m) => m[1]));
      }
    } else {
      // bahçe: evin hangi yanındaysa orada kalır
      const x = p.x < LA.hx ? p.x : p.x >= LA.hx + A.w ? p.x - LA.w + LB.w : LB.hx + Math.round(((p.x - LA.hx) / A.w) * B.w);
      const z = p.z < LA.hz ? p.z : p.z >= LA.hz + A.d ? p.z - LA.d + LB.d : LB.hz + Math.round(((p.z - LA.hz) / A.d) * B.d);
      cands.push({ ...p, x, z });
      for (let k = 1; k < 4; k++) for (const [ox, oz] of [[k, 0], [-k, 0], [0, k], [0, -k]]) cands.push({ ...p, x: x + ox, z: z + oz });
    }
    const ok = cands.find((c) => canPlace(next, c) === null);
    if (ok) next.items.push(ok);
    else next.stored.push(p.id);
  }
  return next;
}
