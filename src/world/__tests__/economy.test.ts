import { describe, expect, it } from 'vitest';
import {
  advanceJourney, buyAnimal, buyField, buyPack, canFill, collect, craft, feed, fieldStage, fillOrder, fillOrders, harvest, JOURNEY, levelOf,
  makeOrder, newFarm, normalizeFarm, plant, realmReward, sell, START_COINS, water, xpFor, type FarmState,
} from '../economy';

const T0 = 1_000_000;

describe('tarla', () => {
  it('ek, sula, büyü, topla', () => {
    let s = newFarm();
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
    expect(plant(newFarm(), 0, 'kabak').err).toMatch(/seviyede/);
    expect(plant({ ...newFarm(), coins: 1 }, 0, 'havuc').err).toMatch(/altın/);
    expect(plant(plant(newFarm(), 0, 'havuc').s, 0, 'bugday').err).toMatch(/dolu/);
  });
  it('yeni tarla açmak giderek pahalanır', () => {
    let s = { ...newFarm(), coins: 1000 };
    const c0 = s.coins;
    s = buyField(s).s;
    s = buyField(s).s;
    expect(s.fields.length).toBe(6);
    expect(c0 - s.coins).toBe(15 + 25);
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
  const rich = (xp = xpFor(3)): FarmState => ({ ...newFarm(), coins: 500, xp });
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
    let s = newFarm();
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
    expect(s.fields.length).toBe(4);
    expect(s.stats.blocks).toBe(0);
  });
});

describe('toplu işler', () => {
  it('hepsine ek, hepsini sula, hepsini topla', async () => {
    const { plantAll, waterAll, harvestAll } = await import('../economy');
    let s = { ...newFarm(), coins: 5 };
    let r = plantAll(s, 'havuc');
    expect(r.s.fields.filter((f) => f.c).length).toBe(2); // 5 altın: 2 tohum
    s = waterAll(r.s, T0).s;
    expect(s.fields.filter((f) => f.w).length).toBe(2);
    r = harvestAll(s, T0 + 60_000);
    expect(r.s.inv.havuc).toBe(6);
    expect(r.msg).toMatch(/6 havuç/);
    expect(plantAll({ ...newFarm(), coins: 0 }, 'havuc').err).toMatch(/altın/);
  });
});
