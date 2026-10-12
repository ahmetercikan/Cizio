import { describe, expect, it } from 'vitest';
import {
  advanceJourney, buyAnimal, placeStruct, removeStruct, buyPack, canFill, collect, craft, feed, fieldStage, fillOrder, fillOrders, harvest, JOURNEY, levelOf,
  makeOrder, newFarm, normalizeFarm, plant, realmReward, sell, START_COINS, water, xpFor, type FarmState,
} from '../economy';

const T0 = 1_000_000;
/** Tarlaları kurulmuş çiftlik (ilk 4 tarla bedava). */
const withFields = (n = 4, base = newFarm()) => {
  let s = base;
  for (let i = 0; i < n; i++) s = placeStruct(s, 'tarla', i * 5, 0).s;
  return s;
};

describe('tarla', () => {
  it('ek, sula, büyü, topla', () => {
    let s = withFields();
    let r = plant(s, 0, 'havuc');
    expect(r.err).toBeUndefined();
    s = r.s;
    expect(s.coins).toBe(START_COINS - 2);
    expect(fieldStage(s.fields[0], T0).stage).toBe('thirsty');
    s = water(s, 0, T0).s;
    expect(fieldStage(s.fields[0], T0 + 10_000).stage).toBe('growing');
    expect(harvest(s, 0, T0 + 10_000).s).toBe(s); // henüz olmadı
    r = harvest(s, 0, T0 + 45_000);
    expect(r.s.inv.havuc).toBe(3);
    expect(r.s.fields[0]).toEqual({});
    expect(r.s.xp).toBeGreaterThan(0);
  });
  it('seviyesi yetmeyen ürün ve parası yetmeyen tohum ekilemez', () => {
    expect(plant(withFields(), 0, 'kabak').err).toMatch(/seviyede/);
    expect(plant({ ...withFields(), coins: 1 }, 0, 'havuc').err).toMatch(/altın/);
    expect(plant(plant(withFields(), 0, 'havuc').s, 0, 'bugday').err).toMatch(/dolu/);
  });
  it('ilk 4 tarla bedava, sonrası giderek pahalanır; ekili tarla kaldırılamaz', () => {
    let s = withFields(4, { ...newFarm(), coins: 1000 });
    expect(s.coins).toBe(1000);
    s = placeStruct(s, 'tarla', 50, 0).s;
    s = placeStruct(s, 'tarla', 55, 0).s;
    expect(s.fields.length).toBe(6);
    expect(1000 - s.coins).toBe(15 + 25);
    s = plant(s, 1, 'havuc').s;
    expect(removeStruct(s, 1).err).toMatch(/ürün/);
    const r = removeStruct(s, 0);
    expect(r.s.fields.length).toBe(5);
    expect(r.s.fields[0].c).toBe('havuc');
  });
  it('ağıl olmadan hayvan alınmaz, aynı yapı iki kez kurulmaz', () => {
    let s = { ...newFarm(), coins: 500, xp: xpFor(3) };
    expect(buyAnimal(s, 'tavuk').err).toMatch(/kümesi/);
    s = placeStruct(s, 'kumes', 10, 10).s;
    expect(placeStruct(s, 'kumes', 30, 10).err).toMatch(/Zaten/);
    expect(buyAnimal(s, 'tavuk').err).toBeUndefined();
    expect(placeStruct(s, 'kovan', 0, 0).err).toMatch(/seviyede/);
  });
});

describe('seviye', () => {
  it('deneyim eşikleri', () => {
    expect(levelOf(0)).toBe(1);
    expect(levelOf(xpFor(2) - 1)).toBe(1);
    expect(levelOf(xpFor(2))).toBe(2);
    expect(levelOf(xpFor(5))).toBe(5);
  });
  it('seviye atlayınca ödül altını gelir', () => {
    const s: FarmState = { ...newFarm(), xp: xpFor(2) - 1, inv: { havuc: 5 } };
    const r = sell(s, 'havuc', 5);
    expect(r.levelUp).toBe(2);
    expect(r.s.coins).toBe(s.coins + 10 + 10);
  });
});

describe('hayvanlar', () => {
  const rich = (xp = xpFor(3)): FarmState => ({ ...newFarm(), coins: 500, xp, places: [{ k: 'kumes', x: 0, z: 0 }, { k: 'ahir', x: 20, z: 0 }, { k: 'agil', x: 40, z: 0 }, { k: 'kovan', x: 60, z: 0 }] });
  it('al, besle, bekle, topla', () => {
    let s = buyAnimal(rich(), 'tavuk').s;
    s = buyAnimal(s, 'tavuk').s;
    expect(s.animals.length).toBe(2);
    expect(feed(s, 'tavuk', T0).err).toMatch(/mısır/);
    s = { ...s, inv: { misir: 1 } };
    let r = feed(s, 'tavuk', T0);
    expect(r.msg).toMatch(/1 tanesini/);
    s = r.s;
    expect(s.inv.misir).toBe(0);
    expect(collect(s, 'tavuk', T0 + 1000).s).toBe(s);
    r = collect(s, 'tavuk', T0 + 60_000);
    expect(r.s.inv.yumurta).toBe(1);
    expect(r.s.animals.every((a) => !a.fed)).toBe(true);
  });
  it('sınır ve seviye', () => {
    expect(buyAnimal(rich(0), 'inek').err).toMatch(/seviyede/);
    let s = rich(xpFor(6));
    for (let i = 0; i < 2; i++) s = buyAnimal(s, 'inek').s;
    expect(buyAnimal(s, 'inek').err).toMatch(/En çok 2/);
  });
});

describe('mutfak ve pazar', () => {
  it('ekmek yapılır, malzeme düşer', () => {
    const s: FarmState = { ...newFarm(), xp: xpFor(3), inv: { bugday: 4 } };
    const r = craft(s, 'ekmek');
    expect(r.s.inv).toMatchObject({ bugday: 1, ekmek: 1 });
    expect(craft(r.s, 'ekmek').err).toBeTruthy();
  });
  it('paket açılır', () => {
    const s = { ...newFarm(), coins: 100 };
    expect(buyPack(s, 'renkli').s.packs).toContain('renkli');
    expect(buyPack(s, 'esya').err).toMatch(/seviyede/);
  });
});

describe('siparişler', () => {
  it('seviyeye uygun ürünler ister, deterministiktir', () => {
    for (let seq = 1; seq < 200; seq++) {
      const o = makeOrder(1, seq);
      expect(Object.keys(o.needs).every((k) => k === 'havuc' || k === 'bugday')).toBe(true);
      expect(o.coins).toBeGreaterThan(0);
    }
    expect(makeOrder(4, 7)).toEqual(makeOrder(4, 7));
  });
  it('tamamlanınca yenisi gelir', () => {
    let s = fillOrders(newFarm());
    expect(s.orders.length).toBe(3);
    const o = s.orders[0];
    s = { ...s, inv: { ...o.needs } };
    expect(canFill(s, o)).toBe(true);
    const r = fillOrder(s, o.id);
    expect(r.s.orders.length).toBe(3);
    expect(r.s.orders.some((x) => x.id === o.id)).toBe(false);
    expect(r.s.coins).toBeGreaterThanOrEqual(s.coins + o.coins);
  });
});

describe('defter ve macera', () => {
  it('biten adımlar sırayla ödüllenir', () => {
    let s = withFields(1);
    s = plant(s, 0, 'havuc').s;
    s = water(s, 0, T0).s;
    const r = advanceJourney(s);
    expect(r.steps).toEqual([JOURNEY[0].text, JOURNEY[1].text]);
    expect(r.s.journey).toBe(2);
    expect(advanceJourney(r.s).steps).toEqual([]);
  });
  it('macera ödülü günde bir kez tam', () => {
    const a = realmReward({ ...newFarm(), xp: xpFor(10) }, 'maze', '2026-10-09');
    const b = realmReward(a.s, 'maze', '2026-10-09');
    expect(a.s.coins - START_COINS).toBe(30);
    expect(b.s.coins - a.s.coins).toBe(8);
    expect(realmReward(b.s, 'maze', '2026-10-10').s.coins - b.s.coins).toBe(30);
  });
  it('eski kayıt tamamlanır', () => {
    const s = normalizeFarm({ coins: 5 } as Partial<FarmState>);
    expect(s.coins).toBe(5);
    expect(s.fields.length).toBe(0);
    expect(s.places).toEqual([]);
    expect(s.stats.blocks).toBe(0);
    // hazır çiftlik zamanından kalma, kullanılmış kayıt: yapılar eski yerlerine kurulur
    const old = normalizeFarm({ fields: [{ c: 'havuc' }, {}, {}, {}], animals: [{ k: 'tavuk' }], stats: { planted: 1 } } as unknown as Partial<FarmState>);
    expect(old.places.filter((p) => p.k === 'tarla').length).toBe(4);
    expect(old.places.some((p) => p.k === 'kumes')).toBe(true);
    // hiç kullanılmamış eski kayıt: boş başlar
    expect(normalizeFarm({ fields: [{}, {}, {}, {}] } as unknown as Partial<FarmState>).fields).toEqual([]);
  });
});

describe('toplu işler', () => {
  it('hepsine ek, hepsini sula, hepsini topla', async () => {
    const { plantAll, waterAll, harvestAll } = await import('../economy');
    let s = withFields(4, { ...newFarm(), coins: 5 });
    let r = plantAll(s, 'havuc');
    expect(r.s.fields.filter((f) => f.c).length).toBe(2); // 5 altın: 2 tohum
    s = waterAll(r.s, T0).s;
    expect(s.fields.filter((f) => f.w).length).toBe(2);
    r = harvestAll(s, T0 + 60_000);
    expect(r.s.inv.havuc).toBe(6);
    expect(r.msg).toMatch(/6 havuç/);
    expect(plantAll(withFields(2, { ...newFarm(), coins: 0 }), 'havuc').err).toMatch(/altın/);
  });
});

describe('arabalar', () => {
  it('altınla alınır, seçilir; özel araba altınla alınmaz', async () => {
    const { buyCar, xpFor: xf } = await import('../economy');
    let s = { ...newFarm(), coins: 1000, xp: xf(3) };
    let r = buyCar(s, 'jip');
    expect(r.s.cars).toEqual(['jip']);
    expect(r.s.car).toBe('jip');
    expect(r.s.coins).toBe(1000 - 320);
    s = r.s;
    expect(buyCar(s, 'spor').err).toMatch(/seviyede/);
    expect(buyCar(s, 'unicorn').err).toMatch(/ebeveyn/);
    r = buyCar(s, 'jip');
    expect(r.s.coins).toBe(s.coins);
  });
});

describe('mini oyun ödülü', () => {
  it('günde 3 eşya, sonra yalnızca altın; eşya evin deposuna gider', async () => {
    const { miniReward } = await import('../economy');
    let s = newFarm();
    const prizes: string[] = [];
    for (let i = 0; i < 5; i++) {
      const r = miniReward(s, '2026-10-12', ['hat:yildiztac'], 0.9);
      prizes.push(r.prize.kind);
      s = r.s;
    }
    expect(prizes).toEqual(['item', 'item', 'item', 'coins', 'coins']);
    expect(s.home?.stored.length).toBe(3);
    expect(s.coins).toBeGreaterThan(START_COINS + 70);
    expect(miniReward(newFarm(), 'g', ['hat:yildiztac'], 0.1).prize).toEqual({ kind: 'cloth', key: 'hat:yildiztac' });
    expect(miniReward(s, '2026-10-13', [], 0.9).prize.kind).toBe('item');
  });
});
