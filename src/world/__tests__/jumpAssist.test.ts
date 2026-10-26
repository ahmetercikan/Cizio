import { describe, expect, it } from 'vitest';
import { planJump, type Surface } from '../jumpAssist';

const G = 32, LIM = { vy: 12.5, maxVy: 12.5 * 1.35, maxH: 18 };
/** Planı yerçekimiyle adım adım uçurur, iniş noktasını verir. */
function fly(from: { x: number; y: number; z: number }, p: NonNullable<ReturnType<typeof planJump>>) {
  let { x, y, z } = from, vy = p.vy;
  const dt = 1 / 120;
  for (let t = 0; t < 5; t += dt) {
    vy -= G * dt;
    x += p.vx * dt;
    z += p.vz * dt;
    y += vy * dt;
    if (vy < 0 && y <= p.ty) return { x, y: p.ty, z };
  }
  return { x, y, z };
}

describe('zıplama yardımı', () => {
  const from = { x: 0, y: 10, z: 0 };
  const plats: Surface[] = [
    { x: 0, y: 10, z: 0, w: 10, d: 10 },
    { x: 1.5, y: 11, z: -9, w: 3, d: 3 },
    { x: 9, y: 10, z: 0, w: 3, d: 3 },
  ];

  it('bakılan yöndeki platformun üstüne indirir', () => {
    const p = planJump(from, { x: 0, z: -1 }, plats, G, LIM)!;
    expect(p).toBeTruthy();
    const end = fly(from, p);
    expect(Math.abs(end.x - 1.5)).toBeLessThan(1.5);
    expect(Math.abs(end.z + 9)).toBeLessThan(1.5);
  });

  it('yön biraz kayık olsa da aynı platformu bulur', () => {
    const p = planJump(from, { x: 0.45, z: -1 }, plats, G, LIM)!;
    expect(p.tz).toBeLessThan(-6);
  });

  it('arkadaki ya da ulaşılamayacak kadar yüksekteki platforma atmaz', () => {
    expect(planJump(from, { x: 0, z: 1 }, plats, G, LIM)).toBeNull();
    expect(planJump(from, { x: 0, z: -1 }, [{ x: 0, y: 25, z: -8, w: 3, d: 3 }], G, LIM)).toBeNull();
  });

  it('kayan platformun ineceği ana göre nişan alır', () => {
    const moving: Surface = { x: 0, y: 10, z: -10, w: 3, d: 3, at: (t) => ({ x: 4 * t, y: 10, z: -10 }) };
    const p = planJump(from, { x: 0, z: -1 }, [moving], G, LIM)!;
    expect(Math.abs(p.tx - 4 * p.t)).toBeLessThanOrEqual(1.5); // o anki platformun üstünde
  });
});
