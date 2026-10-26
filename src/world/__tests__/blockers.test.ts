import { describe, expect, it } from 'vitest';
import { BlockGrid, blockerDist, rectBlocker } from '../terrain';

describe('ada engelleri', () => {
  it('dikdörtgen binanın köşesinden de içeri girilmez', () => {
    const g = new BlockGrid();
    g.add(rectBlocker(0, 0, 10, 6));
    // köşeye çapraz yürüyen kahraman (eskiden daire sırasının boşluğundan içeri giriyordu)
    for (const [x, z] of [[4.9, 2.9], [-4.9, -2.9], [0, 0], [4.5, 0], [0, 2.8]]) {
      const p = { x, z };
      g.push(p, 0.6);
      expect(blockerDist(rectBlocker(0, 0, 10, 6), p.x, p.z)).toBeGreaterThan(0.59);
    }
  });

  it('döndürülmüş dikdörtgen kendi ekseninde ölçülür', () => {
    const b = rectBlocker(10, 10, 8, 2, Math.PI / 2);
    // 90° dönünce uzun kenar z boyunca uzanır
    expect(blockerDist(b, 10, 13.5)).toBe(0);
    expect(blockerDist(b, 13.5, 10)).toBeCloseTo(2.5);
    const g = new BlockGrid();
    g.add(b);
    expect(g.free(10, 13.5, 0.3)).toBe(false);
    expect(g.free(13.5, 10, 0.3)).toBe(true);
  });

  it('daire engeller eskisi gibi iter', () => {
    const g = new BlockGrid();
    g.add({ x: 0, z: 0, r: 2 });
    const p = { x: 1, z: 0 };
    g.push(p, 0.5);
    expect(p.x).toBeCloseTo(2.5);
  });
});
