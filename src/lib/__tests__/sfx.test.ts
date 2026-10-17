import { describe, expect, it } from 'vitest';
import { engineRev } from '../sfx';

describe('motor devri', () => {
  it('tek viteste gazla birlikte artar', () => {
    expect(engineRev(1, 0)).toBe(0);
    expect(engineRev(1, 0.5)).toBe(0.5);
    expect(engineRev(1, 1)).toBe(1);
    // aralık dışı değerler kırpılır
    expect(engineRev(1, -2)).toBe(0);
    expect(engineRev(1, 9)).toBe(1);
  });

  it('vitesli araçta her viteste başa döner ama hep rölantinin üstünde kalır', () => {
    const g = 3;
    // vitesin içinde devir yükselir
    expect(engineRev(g, 0.05)).toBeLessThan(engineRev(g, 0.3));
    // vites değişiminde düşer (0,33 → 0,34 sınırı)
    expect(engineRev(g, 0.34)).toBeLessThan(engineRev(g, 0.33));
    for (let l = 0; l <= 1; l += 0.01) {
      const r = engineRev(g, l);
      expect(r).toBeGreaterThanOrEqual(0.34);
      expect(r).toBeLessThanOrEqual(1);
    }
  });
});
