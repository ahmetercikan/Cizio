import { describe, expect, it } from 'vitest';
import { byGroup, caseLine, COLLECTION, COLLECT_LINES, counts, emptyCaseLine, foundLine, GROUPS, item, roll, TOTAL, type CollectGroup } from '../collection';

const gruplar = Object.keys(GROUPS) as CollectGroup[];

describe('koleksiyon', () => {
  it('kimlikler benzersiz, her parçanın adı ve bilgisi var', () => {
    expect(new Set(COLLECTION.map((c) => c.id)).size).toBe(TOTAL);
    for (const c of COLLECTION) {
      expect(c.name, c.id).toBeTruthy();
      expect(c.fact.length, c.id).toBeGreaterThan(12);
      expect(c.color, c.id).toMatch(/^#[0-9a-f]{6}$/i);
      expect(gruplar).toContain(c.group);
    }
  });

  it('her grupta en az dört parça var', () => {
    for (const g of gruplar) expect(byGroup(g).length, g).toBeGreaterThanOrEqual(4);
  });

  it('çekiliş hep o gruptan bir parça verir', () => {
    for (const g of gruplar) {
      for (const r of [0, 0.25, 0.5, 0.75, 0.999]) {
        const c = roll(g, r);
        expect(c.group, `${g} @ ${r}`).toBe(g);
      }
    }
  });

  it('sık parçalar nadirlerden daha çok çıkar', () => {
    const say = new Map<string, number>();
    for (let i = 0; i < 2000; i++) {
      const c = roll('balik', i / 2000);
      say.set(c.id, (say.get(c.id) ?? 0) + 1);
    }
    const sik = byGroup('balik').filter((c) => c.rare === 1).reduce((s, c) => s + (say.get(c.id) ?? 0), 0);
    const nadir = byGroup('balik').filter((c) => c.rare === 3).reduce((s, c) => s + (say.get(c.id) ?? 0), 0);
    expect(sik).toBeGreaterThan(nadir);
  });

  it('sayım bulunanları doğru verir', () => {
    const c = counts([byGroup('fosil')[0].id, byGroup('fosil')[1].id]);
    expect(c.fosil.have).toBe(2);
    expect(c.fosil.all).toBe(byGroup('fosil').length);
    expect(c.balik.have).toBe(0);
  });

  it('bulma cümlesi yeni ve tekrar için farklı', () => {
    const c = COLLECTION[0];
    expect(foundLine(c, true)).toContain(c.fact);
    expect(foundLine(c, false)).not.toContain(c.fact);
    expect(new Set(COLLECT_LINES).size).toBe(COLLECT_LINES.length);
  });

  it('müze camekânı cümleleri hazır', () => {
    const c = COLLECTION[5];
    expect(caseLine(c)).toContain(c.name);
    expect(caseLine(c)).toContain(c.fact);
    for (const g of gruplar) expect(emptyCaseLine(g)).toContain(GROUPS[g].name);
    expect(COLLECT_LINES).toContain(caseLine(c));
  });

  it('item kimlikten parçayı bulur', () => {
    expect(item(COLLECTION[3].id)?.name).toBe(COLLECTION[3].name);
    expect(item('yok-boyle-bir-sey')).toBeUndefined();
  });
});
