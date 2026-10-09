import { describe, expect, it } from 'vitest';
import { coastAt, heightAt, isWater, LAKE, LAND_R, SNOW_PEAK, VOLCANO, ZONES } from '../layout';

describe('Çizio Adası haritası', () => {
  it('bölgeler ve giriş noktaları karada', () => {
    for (const z of ZONES) {
      if (z.id !== 'lake') expect(heightAt(z.x, z.z), z.id).toBeGreaterThan(0.5);
      expect(heightAt(...z.spawn), `${z.id} giriş`).toBeGreaterThan(0.5);
    }
  });

  it('göl ve açık deniz su, merkez kara', () => {
    expect(isWater(LAKE.x, LAKE.z)).toBe(true);
    expect(isWater(0, LAND_R + 40)).toBe(true);
    expect(isWater(0, 0)).toBe(false);
  });

  it('karlı dağın tepesi yüksek, kıyı çizgisi kara yarıçapı civarında', () => {
    expect(heightAt(SNOW_PEAK.x, SNOW_PEAK.z)).toBeGreaterThan(25);
    // yanardağ karada
    for (let a = 0; a < Math.PI * 2; a += 0.5) expect(heightAt(VOLCANO.x + Math.cos(a) * VOLCANO.r, VOLCANO.z + Math.sin(a) * VOLCANO.r)).toBeGreaterThan(0.3);
    for (let a = 0; a < Math.PI * 2; a += 0.3) expect(Math.abs(coastAt(a) - LAND_R)).toBeLessThan(20);
  });

  it('eski adanın yaklaşık 20 katı alan', () => {
    expect((LAND_R / 60) ** 2).toBeGreaterThan(17);
  });
});
