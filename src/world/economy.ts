/**
 * Çiftliğim ve Pazar: tarla, hayvanlar, mutfak, altın, seviye, siparişler ve çiftçi defteri.
 *
 * Saf hesap (three.js ve React yok): her işlem yeni bir durum döner, zaman `now` (ms) ile verilir. Ürünler gerçek
 * zamanla büyür (uygulama kapalıyken de), süreler çocuklar beklemesin diye kısa tutulur.
 * Bloklar ve süs eşyaları da burada tanımlıdır (inşa: src/world/build.ts).
 */
import { hashStr } from '../lib/util';

// ================================================================================================
// Ürünler
// ================================================================================================
export type CropId = 'havuc' | 'bugday' | 'misir' | 'domates' | 'aycicegi' | 'cilek' | 'kabak';
export type AnimalId = 'tavuk' | 'inek' | 'koyun' | 'ari';
export type ProductId = 'yumurta' | 'sut' | 'yun' | 'bal';
export type GoodId = 'ekmek' | 'peynir' | 'recel' | 'kazak' | 'pasta';
export type ItemId = CropId | ProductId | GoodId;

export interface CropDef { id: CropId; name: string; emoji: string; level: number; seed: number; grow: number; yield: number; color: string }
export interface AnimalDef { id: AnimalId; name: string; emoji: string; level: number; cost: number; eats: CropId; eatN: number; time: number; product: ProductId; max: number; verb: string }
export interface RecipeDef { id: GoodId; name: string; emoji: string; level: number; needs: Partial<Record<ItemId, number>> }

/** Tarla ürünleri. grow: saniye (sulandıktan sonra), yield: hasatta kaç tane. */
export const CROPS: CropDef[] = [
  { id: 'havuc', name: 'Havuç', emoji: '🥕', level: 1, seed: 2, grow: 45, yield: 3, color: '#ff8a3d' },
  { id: 'bugday', name: 'Buğday', emoji: '🌾', level: 1, seed: 2, grow: 60, yield: 3, color: '#f2c94c' },
  { id: 'misir', name: 'Mısır', emoji: '🌽', level: 2, seed: 3, grow: 90, yield: 3, color: '#ffd43b' },
  { id: 'domates', name: 'Domates', emoji: '🍅', level: 3, seed: 4, grow: 120, yield: 3, color: '#ef4b4b' },
  { id: 'aycicegi', name: 'Ayçiçeği', emoji: '🌻', level: 4, seed: 5, grow: 150, yield: 2, color: '#ffc83d' },
  { id: 'cilek', name: 'Çilek', emoji: '🍓', level: 5, seed: 6, grow: 180, yield: 3, color: '#ff4d6d' },
  { id: 'kabak', name: 'Bal kabağı', emoji: '🎃', level: 6, seed: 10, grow: 240, yield: 1, color: '#ff8c1a' },
];

/** Hayvanlar: yedikleri ürün, ürünü ne zaman verdikleri (saniye), en çok kaç tane. */
export const ANIMALS: AnimalDef[] = [
  { id: 'tavuk', name: 'Tavuk', emoji: '🐔', level: 2, cost: 25, eats: 'misir', eatN: 1, time: 60, product: 'yumurta', max: 4, verb: 'Yumurtaları topla' },
  { id: 'inek', name: 'İnek', emoji: '🐄', level: 3, cost: 60, eats: 'bugday', eatN: 2, time: 90, product: 'sut', max: 2, verb: 'İneği sağ' },
  { id: 'koyun', name: 'Koyun', emoji: '🐑', level: 4, cost: 70, eats: 'havuc', eatN: 2, time: 120, product: 'yun', max: 2, verb: 'Koyunun yününü kırp' },
  { id: 'ari', name: 'Arı kovanı', emoji: '🐝', level: 5, cost: 90, eats: 'aycicegi', eatN: 1, time: 150, product: 'bal', max: 2, verb: 'Balı topla' },
];

/** Mutfak ve atölye: ürünlerden yapılanlar. */
export const RECIPES: RecipeDef[] = [
  { id: 'ekmek', name: 'Ekmek', emoji: '🍞', level: 3, needs: { bugday: 3 } },
  { id: 'peynir', name: 'Peynir', emoji: '🧀', level: 4, needs: { sut: 2 } },
  { id: 'recel', name: 'Çilek reçeli', emoji: '🍯', level: 5, needs: { cilek: 3 } },
  { id: 'kazak', name: 'Yün kazak', emoji: '🧶', level: 5, needs: { yun: 2 } },
  { id: 'pasta', name: 'Çilekli pasta', emoji: '🎂', level: 6, needs: { yumurta: 2, sut: 1, bugday: 2, cilek: 2 } },
];

/** Pazarda satış fiyatı (altın). */
export const PRICE: Record<ItemId, number> = {
  havuc: 2, bugday: 2, misir: 3, domates: 4, aycicegi: 6, cilek: 5, kabak: 24,
  yumurta: 7, sut: 12, yun: 15, bal: 18,
  ekmek: 9, peynir: 30, recel: 20, kazak: 36, pasta: 60,
};

export const ITEM_NAME: Record<ItemId, string> = {
  ...Object.fromEntries(CROPS.map((c) => [c.id, c.name])),
  yumurta: 'Yumurta', sut: 'Süt', yun: 'Yün', bal: 'Bal',
  ...Object.fromEntries(RECIPES.map((r) => [r.id, r.name])),
} as Record<ItemId, string>;
export const ITEM_EMOJI: Record<ItemId, string> = {
  ...Object.fromEntries(CROPS.map((c) => [c.id, c.emoji])),
  yumurta: '🥚', sut: '🥛', yun: '🧶', bal: '🍯',
  ...Object.fromEntries(RECIPES.map((r) => [r.id, r.emoji])),
} as Record<ItemId, string>;
export const ITEMS = Object.keys(PRICE) as ItemId[];

export const crop = (id: CropId) => CROPS.find((c) => c.id === id)!;
export const animal = (id: AnimalId) => ANIMALS.find((a) => a.id === id)!;
export const recipe = (id: GoodId) => RECIPES.find((r) => r.id === id)!;

// ================================================================================================
// Bloklar ve süs eşyaları (inşa)
// ================================================================================================
export type BlockKind = 'cube' | 'glass' | 'light' | 'model';
export interface BlockDef {
  id: string;
  /** Kayıtta tek harf. */
  ch: string;
  name: string;
  color: string;
  /** Üst yüz rengi (çimen gibi). */
  top?: string;
  kind: BlockKind;
  /** Yürürken içinden geçilemez mi (kapı, çiçek geçilir). */
  solid: boolean;
  /** Kaç blok yüksekliğinde (kapı 2). */
  h?: number;
  pack: string;
}

export const BLOCKS: BlockDef[] = [
  // temel (baştan açık)
  { id: 'cimen', ch: 'a', name: 'Çimen', color: '#9b6b43', top: '#7cc760', kind: 'cube', solid: true, pack: 'temel' },
  { id: 'toprak', ch: 'b', name: 'Toprak', color: '#9b6b43', kind: 'cube', solid: true, pack: 'temel' },
  { id: 'tas', ch: 'c', name: 'Taş', color: '#a3a7b0', kind: 'cube', solid: true, pack: 'temel' },
  { id: 'ahsap', ch: 'd', name: 'Tahta', color: '#d9a066', kind: 'cube', solid: true, pack: 'temel' },
  { id: 'kutuk', ch: 'e', name: 'Kütük', color: '#8a5a35', top: '#e2b77c', kind: 'cube', solid: true, pack: 'temel' },
  { id: 'yaprak', ch: 'f', name: 'Yaprak', color: '#4caf50', kind: 'cube', solid: true, pack: 'temel' },
  { id: 'kum', ch: 'g', name: 'Kum', color: '#f3dca2', kind: 'cube', solid: true, pack: 'temel' },
  { id: 'kapi', ch: 'h', name: 'Kapı', color: '#b9773f', kind: 'model', solid: false, h: 2, pack: 'temel' },
  // renkli
  { id: 'beyaz', ch: 'i', name: 'Beyaz', color: '#f4f1ea', kind: 'cube', solid: true, pack: 'renkli' },
  { id: 'kirmizi', ch: 'j', name: 'Kırmızı', color: '#ef4b4b', kind: 'cube', solid: true, pack: 'renkli' },
  { id: 'turuncu', ch: 'k', name: 'Turuncu', color: '#ff9f43', kind: 'cube', solid: true, pack: 'renkli' },
  { id: 'sari', ch: 'l', name: 'Sarı', color: '#ffd43b', kind: 'cube', solid: true, pack: 'renkli' },
  { id: 'yesil', ch: 'm', name: 'Yeşil', color: '#69db7c', kind: 'cube', solid: true, pack: 'renkli' },
  { id: 'mavi', ch: 'n', name: 'Mavi', color: '#4dabf7', kind: 'cube', solid: true, pack: 'renkli' },
  { id: 'mor', ch: 'o', name: 'Mor', color: '#9775fa', kind: 'cube', solid: true, pack: 'renkli' },
  { id: 'pembe', ch: 'p', name: 'Pembe', color: '#f783ac', kind: 'cube', solid: true, pack: 'renkli' },
  { id: 'siyah', ch: 'q', name: 'Siyah', color: '#3a3f4a', kind: 'cube', solid: true, pack: 'renkli' },
  // ev
  { id: 'tugla', ch: 'r', name: 'Tuğla', color: '#c8553d', kind: 'cube', solid: true, pack: 'ev' },
  { id: 'cati', ch: 's', name: 'Kiremit', color: '#b23a3a', kind: 'cube', solid: true, pack: 'ev' },
  { id: 'cam', ch: 't', name: 'Cam', color: '#bfe9ff', kind: 'glass', solid: true, pack: 'ev' },
  { id: 'tastugla', ch: 'u', name: 'Taş duvar', color: '#8d939e', kind: 'cube', solid: true, pack: 'ev' },
  // bahçe
  { id: 'cicek', ch: 'v', name: 'Çiçek', color: '#ff6b8a', kind: 'model', solid: false, pack: 'bahce' },
  { id: 'fidan', ch: 'w', name: 'Ağaç', color: '#4caf50', kind: 'model', solid: true, h: 2, pack: 'bahce' },
  { id: 'cit', ch: 'x', name: 'Çit', color: '#f4f1ea', kind: 'model', solid: true, pack: 'bahce' },
  { id: 'bank', ch: 'y', name: 'Bank', color: '#d9a066', kind: 'model', solid: true, pack: 'bahce' },
  // ışık
  { id: 'isik', ch: 'z', name: 'Işık bloğu', color: '#fff3b0', kind: 'light', solid: true, pack: 'isik' },
  { id: 'fener', ch: 'A', name: 'Sokak lambası', color: '#5b5f6b', kind: 'model', solid: true, h: 2, pack: 'isik' },
  { id: 'altin', ch: 'B', name: 'Altın', color: '#ffc83d', kind: 'light', solid: true, pack: 'isik' },
  // ev eşyası
  { id: 'masa', ch: 'C', name: 'Masa', color: '#c98a4b', kind: 'model', solid: true, pack: 'esya' },
  { id: 'sandalye', ch: 'D', name: 'Sandalye', color: '#e07b39', kind: 'model', solid: false, pack: 'esya' },
  { id: 'yatak', ch: 'E', name: 'Yatak', color: '#4dabf7', kind: 'model', solid: true, pack: 'esya' },
  { id: 'kitaplik', ch: 'F', name: 'Kitaplık', color: '#8a5a35', kind: 'model', solid: true, h: 2, pack: 'esya' },
  // kış
  { id: 'kar', ch: 'G', name: 'Kar', color: '#f4f9ff', kind: 'cube', solid: true, pack: 'kis' },
  { id: 'buz', ch: 'H', name: 'Buz', color: '#a8e0ff', kind: 'glass', solid: true, pack: 'kis' },
  { id: 'kardanadam', ch: 'I', name: 'Kardan adam', color: '#ffffff', kind: 'model', solid: true, h: 2, pack: 'kis' },
];
export const blockById = (id: string) => BLOCKS.find((b) => b.id === id);
export const blockByCh = (ch: string) => BLOCKS.find((b) => b.ch === ch);

export interface PackDef { id: string; name: string; emoji: string; price: number; level: number }
export const PACKS: PackDef[] = [
  { id: 'temel', name: 'Temel bloklar', emoji: '🧱', price: 0, level: 1 },
  { id: 'renkli', name: 'Renkli bloklar', emoji: '🌈', price: 30, level: 1 },
  { id: 'ev', name: 'Ev blokları (tuğla, cam, kiremit)', emoji: '🏠', price: 40, level: 2 },
  { id: 'bahce', name: 'Bahçe (çiçek, ağaç, çit, bank)', emoji: '🌷', price: 35, level: 2 },
  { id: 'isik', name: 'Işıklar ve altın blok', emoji: '💡', price: 50, level: 3 },
  { id: 'esya', name: 'Ev eşyası (masa, yatak…)', emoji: '🛏️', price: 60, level: 4 },
  { id: 'kis', name: 'Kış (kar, buz, kardan adam)', emoji: '❄️', price: 45, level: 5 },
];

/** Hazır yapılar: altınla bir dokunuşta kurulur (bloklar yerleştirilir, sonra değiştirilebilir). */
export interface Blueprint { id: string; name: string; emoji: string; price: number; level: number }
export const BLUEPRINTS: Blueprint[] = [
  { id: 'ev', name: 'Küçük ev', emoji: '🏡', price: 40, level: 1 },
  { id: 'kule', name: 'Gözetleme kulesi', emoji: '🗼', price: 50, level: 2 },
  { id: 'kopru', name: 'Gökkuşağı köprüsü', emoji: '🌈', price: 60, level: 3 },
  { id: 'havuz', name: 'Bahçe ve havuz', emoji: '⛲', price: 70, level: 4 },
];

// ================================================================================================
// Durum
// ================================================================================================
export interface Field {
  /** Ekili ürün. */
  c?: CropId;
  /** Sulandığı an (ms); yoksa susuz bekliyor. */
  w?: number;
}
export interface AnimalState {
  k: AnimalId;
  /** Yem yediği an (ms); yoksa aç. */
  fed?: number;
}
export interface Order { id: number; needs: Partial<Record<ItemId, number>>; coins: number; xp: number; who: string }

export interface FarmStats { harvested: number; planted: number; watered: number; sold: number; orders: number; blocks: number; fed: number; collected: number; crafted: number; realms: number }

export interface FarmState {
  coins: number;
  xp: number;
  inv: Partial<Record<ItemId, number>>;
  fields: Field[];
  animals: AnimalState[];
  /** Açılmış blok paketleri. */
  packs: string[];
  /** İnşa: bkz. build.ts encode/decode. */
  build: string;
  orders: Order[];
  orderSeq: number;
  /** Çiftçi defterinde sıradaki adım. */
  journey: number;
  stats: FarmStats;
  /** Macera kapılarının günlük ilk bitiş ödülü. */
  realmDay?: { day: string; done: string[] };
}

export const FIELDS_START = 4;
export const FIELDS_MAX = 16;
export const START_COINS = 30;

export function newFarm(): FarmState {
  return {
    coins: START_COINS, xp: 0, inv: {}, fields: Array.from({ length: FIELDS_START }, () => ({})), animals: [], packs: ['temel'], build: '',
    orders: [], orderSeq: 0, journey: 0,
    stats: { harvested: 0, planted: 0, watered: 0, sold: 0, orders: 0, blocks: 0, fed: 0, collected: 0, crafted: 0, realms: 0 },
  };
}

/** Eski ya da eksik kayıtları tamamlar. */
export function normalizeFarm(s: Partial<FarmState> | undefined): FarmState {
  const n = newFarm();
  if (!s) return n;
  return { ...n, ...s, stats: { ...n.stats, ...s.stats }, inv: { ...s.inv }, packs: s.packs?.length ? s.packs : n.packs };
}

// ================================================================================================
// Seviye
// ================================================================================================
/** Bu seviyeye ulaşmak için gereken toplam deneyim. */
export const xpFor = (level: number) => 10 * (level - 1) * level;
export function levelOf(xp: number) {
  let l = 1;
  while (xp >= xpFor(l + 1)) l++;
  return l;
}
/** Seviye çubuğu: [bu seviyede kazanılan, sonraki seviyeye gereken]. */
export function levelProgress(xp: number): [number, number] {
  const l = levelOf(xp);
  return [xp - xpFor(l), xpFor(l + 1) - xpFor(l)];
}

/** Bu seviyede ilk kez açılanlar (seviye atlama mesajı için). */
export function unlocksAt(level: number): string[] {
  return [
    ...CROPS.filter((c) => c.level === level).map((c) => `${c.emoji} ${c.name}`),
    ...ANIMALS.filter((a) => a.level === level).map((a) => `${a.emoji} ${a.name}`),
    ...RECIPES.filter((r) => r.level === level).map((r) => `${r.emoji} ${r.name}`),
    ...PACKS.filter((p) => p.level === level && p.price > 0).map((p) => `${p.emoji} ${p.name}`),
  ];
}

export interface Result {
  s: FarmState;
  /** Kısa mesaj (gösterilir). */
  msg?: string;
  /** Yapılamadı: neden. */
  err?: string;
  /** Seviye atladıysa yeni seviye. */
  levelUp?: number;
}

function gain(s: FarmState, coins: number, xp: number): Result {
  const before = levelOf(s.xp);
  const next = { ...s, coins: s.coins + coins, xp: s.xp + xp };
  const after = levelOf(next.xp);
  return after > before ? { s: { ...next, coins: next.coins + 10 * (after - 1) }, levelUp: after } : { s: next };
}
const merge = (r: Result, msg?: string): Result => ({ ...r, msg: msg ?? r.msg });
const add = (inv: FarmState['inv'], id: ItemId, n: number) => ({ ...inv, [id]: Math.max(0, (inv[id] ?? 0) + n) });
const stat = (s: FarmState, k: keyof FarmStats, n = 1): FarmState => ({ ...s, stats: { ...s.stats, [k]: s.stats[k] + n } });

// ================================================================================================
// Tarla
// ================================================================================================
export type FieldStage = 'empty' | 'thirsty' | 'growing' | 'ready';

export function fieldStage(f: Field, now: number): { stage: FieldStage; u: number; left: number } {
  if (!f.c) return { stage: 'empty', u: 0, left: 0 };
  if (!f.w) return { stage: 'thirsty', u: 0, left: crop(f.c).grow };
  const g = crop(f.c).grow * 1000;
  const u = Math.min(1, Math.max(0, (now - f.w) / g));
  return u >= 1 ? { stage: 'ready', u: 1, left: 0 } : { stage: 'growing', u, left: Math.ceil((g - (now - f.w)) / 1000) };
}

export function plant(s: FarmState, i: number, c: CropId): Result {
  const f = s.fields[i];
  const def = crop(c);
  if (!f || f.c) return { s, err: 'Bu tarla dolu.' };
  if (levelOf(s.xp) < def.level) return { s, err: `${def.name} ${def.level}. seviyede açılır.` };
  if (s.coins < def.seed) return { s, err: `Tohum için ${def.seed} altın gerekiyor.` };
  const fields = s.fields.map((x, j) => (j === i ? { c } : x));
  return { s: stat({ ...s, coins: s.coins - def.seed, fields }, 'planted'), msg: `${def.name} ektin! Şimdi sula.` };
}

export function water(s: FarmState, i: number, now: number): Result {
  const f = s.fields[i];
  if (!f?.c || f.w) return { s };
  const fields = s.fields.map((x, j) => (j === i ? { ...x, w: now } : x));
  return { s: stat({ ...s, fields }, 'watered'), msg: 'Suladın, büyümeye başladı!' };
}

export function harvest(s: FarmState, i: number, now: number): Result {
  const f = s.fields[i];
  if (!f?.c || fieldStage(f, now).stage !== 'ready') return { s };
  const def = crop(f.c);
  const fields = s.fields.map((x, j) => (j === i ? {} : x));
  const r = gain(stat({ ...s, fields, inv: add(s.inv, def.id, def.yield) }, 'harvested', def.yield), 0, 2 * def.yield);
  return merge(r, `${def.yield} ${def.name} topladın!`);
}

/** Bütün susuz tarlaları sular. */
export function waterAll(s: FarmState, now: number): Result {
  let cur = s, n = 0;
  s.fields.forEach((f, i) => {
    if (f.c && !f.w) {
      cur = water(cur, i, now).s;
      n++;
    }
  });
  return n ? { s: cur, msg: n > 1 ? `${n} tarlayı suladın, büyümeye başladılar!` : 'Suladın, büyümeye başladı!' } : { s };
}

/** Bütün olgun ürünleri toplar. */
export function harvestAll(s: FarmState, now: number): Result {
  let cur: Result = { s };
  const got: Partial<Record<CropId, number>> = {};
  s.fields.forEach((f, i) => {
    if (f.c && fieldStage(f, now).stage === 'ready') {
      const r = harvest(cur.s, i, now);
      got[f.c] = (got[f.c] ?? 0) + crop(f.c).yield;
      cur = { s: r.s, levelUp: r.levelUp ?? cur.levelUp };
    }
  });
  const parts = Object.entries(got).map(([k, n]) => `${n} ${crop(k as CropId).name.toLocaleLowerCase('tr')}`);
  return parts.length ? { ...cur, msg: `${parts.join(', ')} topladın!` } : cur;
}

/** Boş tarlaların hepsine aynı tohumu eker (altın yettiği kadar). */
export function plantAll(s: FarmState, c: CropId): Result {
  let cur = s, n = 0, err: string | undefined;
  s.fields.forEach((f, i) => {
    if (f.c || err) return;
    const r = plant(cur, i, c);
    if (r.err) err = n ? undefined : r.err;
    else {
      cur = r.s;
      n++;
    }
  });
  if (!n) return { s, err: err ?? 'Boş tarla yok.' };
  return { s: cur, msg: `${n} tarlaya ${crop(c).name.toLocaleLowerCase('tr')} ektin! Şimdi sula.` };
}

export const fieldPrice = (s: FarmState) => 15 + 10 * (s.fields.length - FIELDS_START);

export function buyField(s: FarmState): Result {
  if (s.fields.length >= FIELDS_MAX) return { s, err: 'Bütün tarlalar açık.' };
  const p = fieldPrice(s);
  if (s.coins < p) return { s, err: `Yeni tarla için ${p} altın gerekiyor.` };
  return { s: { ...s, coins: s.coins - p, fields: [...s.fields, {}] }, msg: 'Yeni tarlan hazır!' };
}

// ================================================================================================
// Hayvanlar
// ================================================================================================
export type AnimalStage = 'hungry' | 'busy' | 'ready';

export function animalStage(a: AnimalState, now: number): { stage: AnimalStage; u: number; left: number } {
  if (!a.fed) return { stage: 'hungry', u: 0, left: 0 };
  const t = animal(a.k).time * 1000;
  const u = Math.min(1, (now - a.fed) / t);
  return u >= 1 ? { stage: 'ready', u: 1, left: 0 } : { stage: 'busy', u, left: Math.ceil((t - (now - a.fed)) / 1000) };
}

export const countAnimals = (s: FarmState, k: AnimalId) => s.animals.filter((a) => a.k === k).length;

export function buyAnimal(s: FarmState, k: AnimalId): Result {
  const def = animal(k);
  if (levelOf(s.xp) < def.level) return { s, err: `${def.name} ${def.level}. seviyede açılır.` };
  if (countAnimals(s, k) >= def.max) return { s, err: `En çok ${def.max} ${def.name.toLocaleLowerCase('tr')} olabilir.` };
  if (s.coins < def.cost) return { s, err: `${def.name} için ${def.cost} altın gerekiyor.` };
  return { s: { ...s, coins: s.coins - def.cost, animals: [...s.animals, { k }] }, msg: `${def.name} çiftliğine geldi!` };
}

/** Aç olan bütün `k` hayvanlarını besler (yetecek kadar yem varsa). */
export function feed(s: FarmState, k: AnimalId, now: number): Result {
  const def = animal(k);
  const hungry = s.animals.map((a, i) => [a, i] as const).filter(([a]) => a.k === k && !a.fed);
  if (!hungry.length) return { s, msg: 'Hepsi tok!' };
  const have = s.inv[def.eats] ?? 0;
  const n = Math.min(hungry.length, Math.floor(have / def.eatN));
  if (!n) return { s, err: `${def.name} ${def.eatN} ${ITEM_NAME[def.eats].toLocaleLowerCase('tr')} yer. Önce tarlada yetiştir ya da pazardan al.` };
  const feedIdx = new Set(hungry.slice(0, n).map(([, i]) => i));
  const animals = s.animals.map((a, i) => (feedIdx.has(i) ? { ...a, fed: now } : a));
  const next = stat({ ...s, animals, inv: add(s.inv, def.eats, -n * def.eatN) }, 'fed', n);
  return { s: next, msg: n === hungry.length ? 'Afiyet olsun!' : `${n} tanesini besledin, yemin bitti.` };
}

/** Hazır olan bütün `k` hayvanlarının ürününü toplar. */
export function collect(s: FarmState, k: AnimalId, now: number): Result {
  const def = animal(k);
  const ready = new Set(s.animals.map((a, i) => [a, i] as const).filter(([a]) => a.k === k && animalStage(a, now).stage === 'ready').map(([, i]) => i));
  if (!ready.size) return { s };
  const animals = s.animals.map((a, i) => (ready.has(i) ? { k: a.k } : a));
  const r = gain(stat({ ...s, animals, inv: add(s.inv, def.product, ready.size) }, 'collected', ready.size), 0, 4 * ready.size);
  return merge(r, `${ready.size} ${ITEM_NAME[def.product].toLocaleLowerCase('tr')} topladın!`);
}

/** Bir hayvan türünün durumu (istasyondaki düğme için): öncelik hazır > aç > bekliyor. */
export function stationStage(s: FarmState, k: AnimalId, now: number): { stage: AnimalStage | 'none'; left: number } {
  const own = s.animals.filter((a) => a.k === k);
  if (!own.length) return { stage: 'none', left: 0 };
  const st = own.map((a) => animalStage(a, now));
  if (st.some((x) => x.stage === 'ready')) return { stage: 'ready', left: 0 };
  if (st.some((x) => x.stage === 'hungry')) return { stage: 'hungry', left: 0 };
  return { stage: 'busy', left: Math.min(...st.map((x) => x.left)) };
}

// ================================================================================================
// Mutfak
// ================================================================================================
export function canCraft(s: FarmState, g: GoodId) {
  const r = recipe(g);
  return levelOf(s.xp) >= r.level && Object.entries(r.needs).every(([k, n]) => (s.inv[k as ItemId] ?? 0) >= n!);
}

export function craft(s: FarmState, g: GoodId): Result {
  const r = recipe(g);
  if (levelOf(s.xp) < r.level) return { s, err: `${r.name} ${r.level}. seviyede açılır.` };
  if (!canCraft(s, g)) return { s, err: 'Malzemeler eksik.' };
  let inv = { ...s.inv };
  for (const [k, n] of Object.entries(r.needs)) inv = add(inv, k as ItemId, -n!);
  inv = add(inv, g, 1);
  return merge(gain(stat({ ...s, inv }, 'crafted'), 0, 8), `${r.name} hazır!`);
}

// ================================================================================================
// Pazar
// ================================================================================================
export function sell(s: FarmState, id: ItemId, n = 1): Result {
  const have = s.inv[id] ?? 0;
  const k = Math.min(n, have);
  if (!k) return { s };
  const coins = PRICE[id] * k;
  return merge(gain(stat({ ...s, inv: add(s.inv, id, -k) }, 'sold', k), coins, Math.ceil(coins / 2)), `+${coins} altın`);
}

/** Pazardan ürün (yem) almak: satış fiyatının iki katı. */
export const buyPrice = (id: ItemId) => PRICE[id] * 2;
export function buyItem(s: FarmState, id: ItemId, n = 1): Result {
  const p = buyPrice(id) * n;
  if (s.coins < p) return { s, err: `${p} altın gerekiyor.` };
  return { s: { ...s, coins: s.coins - p, inv: add(s.inv, id, n) }, msg: `${n} ${ITEM_NAME[id]} aldın.` };
}

export function buyPack(s: FarmState, id: string): Result {
  const p = PACKS.find((x) => x.id === id);
  if (!p || s.packs.includes(id)) return { s };
  if (levelOf(s.xp) < p.level) return { s, err: `${p.level}. seviyede açılır.` };
  if (s.coins < p.price) return { s, err: `${p.price} altın gerekiyor.` };
  return { s: { ...s, coins: s.coins - p.price, packs: [...s.packs, id] }, msg: `${p.name} açıldı! İnşa ederken kullanabilirsin.` };
}

/** Sahip olunan ve satılabilecek ürünler. */
export const sellable = (s: FarmState) => ITEMS.filter((id) => (s.inv[id] ?? 0) > 0);
/** Seviyeye göre pazardan alınabilecek yemler (tarla ürünleri). */
export const buyable = (s: FarmState) => CROPS.filter((c) => c.level <= levelOf(s.xp)).map((c) => c.id);

// ================================================================================================
// Siparişler (pazardaki sipariş panosu)
// ================================================================================================
const WHO = ['Ayı Amca', 'Tavşan Teyze', 'Kedi Mırmır', 'Baykuş Hoca', 'Tilki Fıstık', 'Penguen Paytak', 'Kurbağa Vırak', 'Fil Pamuk'];
export const ORDER_SLOTS = 3;

/** Seviyeye uygun, yapılabilir bir sipariş (deterministik: seq ve seviye ile). */
export function makeOrder(level: number, seq: number): Order {
  let h = hashStr(`siparis|${seq}`) >>> 0;
  const next = () => (h = (Math.imul(h ^ (h >>> 15), 2246822507) + seq) >>> 0);
  const pool: ItemId[] = [
    ...CROPS.filter((c) => c.level <= level).map((c) => c.id),
    ...ANIMALS.filter((a) => a.level <= level).map((a) => a.product),
    ...RECIPES.filter((r) => r.level <= level).map((r) => r.id),
  ];
  const kinds = Math.min(pool.length, 1 + (next() % Math.min(3, 1 + Math.floor(level / 2))));
  const needs: Partial<Record<ItemId, number>> = {};
  while (Object.keys(needs).length < kinds) {
    const id = pool[next() % pool.length];
    if (needs[id]) continue;
    const cheap = PRICE[id] <= 5;
    needs[id] = cheap ? 2 + (next() % 4) : 1 + (next() % 2);
  }
  const value = Object.entries(needs).reduce((a, [k, n]) => a + PRICE[k as ItemId] * n!, 0);
  return { id: seq, needs, coins: Math.round(value * 1.6) + 5, xp: Math.round(value * 0.8) + 5, who: WHO[next() % WHO.length] };
}

/** Panoyu doldurur (eksik siparişler eklenir). */
export function fillOrders(s: FarmState): FarmState {
  if (s.orders.length >= ORDER_SLOTS) return s;
  const orders = [...s.orders];
  let seq = s.orderSeq;
  while (orders.length < ORDER_SLOTS) orders.push(makeOrder(levelOf(s.xp), ++seq));
  return { ...s, orders, orderSeq: seq };
}

export const canFill = (s: FarmState, o: Order) => Object.entries(o.needs).every(([k, n]) => (s.inv[k as ItemId] ?? 0) >= n!);

export function fillOrder(s: FarmState, id: number): Result {
  const o = s.orders.find((x) => x.id === id);
  if (!o) return { s };
  if (!canFill(s, o)) return { s, err: 'Siparişteki ürünler henüz yok.' };
  let inv = { ...s.inv };
  for (const [k, n] of Object.entries(o.needs)) inv = add(inv, k as ItemId, -n!);
  const r = gain(stat({ ...s, inv, orders: s.orders.filter((x) => x.id !== id) }, 'orders'), o.coins, o.xp);
  return { ...r, s: fillOrders(r.s), msg: `${o.who} çok sevindi! +${o.coins} altın` };
}

/** Siparişi değiştir (beğenmezse): yenisi gelir. */
export function skipOrder(s: FarmState, id: number): FarmState {
  return fillOrders({ ...s, orders: s.orders.filter((x) => x.id !== id) });
}

// ================================================================================================
// İnşa ve macera ödülleri
// ================================================================================================
export function placedBlocks(s: FarmState, build: string, delta: number): Result {
  const next = { ...s, build, stats: { ...s.stats, blocks: s.stats.blocks + Math.max(0, delta) } };
  // her 10 yeni blokta biraz deneyim
  const xp = Math.floor(next.stats.blocks / 10) - Math.floor(s.stats.blocks / 10);
  return xp > 0 ? gain(next, 0, xp * 3) : { s: next };
}

export function buyBlueprint(s: FarmState, id: string): Result {
  const b = BLUEPRINTS.find((x) => x.id === id);
  if (!b) return { s };
  if (levelOf(s.xp) < b.level) return { s, err: `${b.level}. seviyede açılır.` };
  if (s.coins < b.price) return { s, err: `${b.price} altın gerekiyor.` };
  return { s: { ...s, coins: s.coins - b.price }, msg: `${b.name} kuruldu!` };
}

/** Macera kapısından çıkış ödülü: günün ilk bitişi tam, sonrakiler küçük. */
export function realmReward(s: FarmState, realm: string, day: string): Result {
  const rd = s.realmDay?.day === day ? s.realmDay : { day, done: [] };
  const first = !rd.done.includes(realm);
  const next = stat({ ...s, realmDay: { day, done: first ? [...rd.done, realm] : rd.done } }, 'realms');
  const [coins, xp] = first ? [30, 20] : [8, 5];
  return merge(gain(next, coins, xp), `+${coins} altın`);
}

// ================================================================================================
// Çiftçi defteri: sırayla küçük hedefler (oyuna düzen verir)
// ================================================================================================
export interface Step { text: string; done: (s: FarmState) => boolean; coins: number }
export const JOURNEY: Step[] = [
  { text: 'Tarlana bir tohum ek', done: (s) => s.stats.planted >= 1, coins: 5 },
  { text: 'Tohumu sula', done: (s) => s.stats.watered >= 1, coins: 5 },
  { text: 'Ürünü topla', done: (s) => s.stats.harvested >= 1, coins: 10 },
  { text: 'Kasabadaki Pazar\'da bir ürün sat', done: (s) => s.stats.sold >= 1, coins: 10 },
  { text: 'Arsana 10 blok koy', done: (s) => s.stats.blocks >= 10, coins: 15 },
  { text: 'Pazardaki panodan bir sipariş tamamla', done: (s) => s.stats.orders >= 1, coins: 15 },
  { text: '2. seviyeye ulaş', done: (s) => levelOf(s.xp) >= 2, coins: 10 },
  { text: 'Pazardan bir tavuk al', done: (s) => s.animals.some((a) => a.k === 'tavuk'), coins: 10 },
  { text: 'Tavuğunu mısırla besle', done: (s) => s.stats.fed >= 1, coins: 10 },
  { text: 'Yumurtaları topla', done: (s) => s.stats.collected >= 1, coins: 15 },
  { text: 'Macera Kapıları\'ndan birini bitir', done: (s) => s.stats.realms >= 1, coins: 20 },
  { text: 'Yeni bir tarla aç', done: (s) => s.fields.length > FIELDS_START, coins: 15 },
  { text: '3. seviyeye ulaş', done: (s) => levelOf(s.xp) >= 3, coins: 15 },
  { text: 'Bir inek al ve onu sağ', done: (s) => s.animals.some((a) => a.k === 'inek') && s.stats.collected >= 2, coins: 20 },
  { text: 'Mutfakta ekmek yap', done: (s) => s.stats.crafted >= 1, coins: 20 },
  { text: 'Arsana 60 blok koy: kendi evini yap!', done: (s) => s.stats.blocks >= 60, coins: 25 },
  { text: '5 sipariş tamamla', done: (s) => s.stats.orders >= 5, coins: 25 },
  { text: '5. seviyeye ulaş', done: (s) => levelOf(s.xp) >= 5, coins: 30 },
  { text: 'Arı kovanı kur ve bal topla', done: (s) => s.animals.some((a) => a.k === 'ari') && (s.inv.bal ?? 0) + s.stats.sold > 0 && s.stats.collected >= 4, coins: 30 },
  { text: 'Çilekli pasta yap', done: (s) => (s.inv.pasta ?? 0) > 0 || s.stats.crafted >= 4, coins: 40 },
];

/** Defterdeki biten adımları ödüllendirir; biten adımların metinleri döner. */
export function advanceJourney(s: FarmState): Result & { steps: string[] } {
  let cur: Result = { s };
  const steps: string[] = [];
  while (cur.s.journey < JOURNEY.length && JOURNEY[cur.s.journey].done(cur.s)) {
    const st = JOURNEY[cur.s.journey];
    steps.push(st.text);
    const r = gain({ ...cur.s, journey: cur.s.journey + 1 }, st.coins, 5);
    cur = { s: r.s, levelUp: r.levelUp ?? cur.levelUp };
  }
  return { ...cur, steps };
}

/** Süre yazısı: 75 → "1:15". */
export const clock = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
