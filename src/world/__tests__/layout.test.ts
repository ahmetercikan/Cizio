import { describe, expect, it } from 'vitest';
import { coastAt, COAST_MAX, heightAt, isWater, LAKE, LAND_R, SNOW_PEAK, VOLCANO, zone, ZONES } from '../layout';

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
    // kıyı temel yarıçapın çevresinde dalgalanır; kuzeydoğuda Şehir Merkezi yarımadası için dışarı taşar
    for (let a = 0; a < Math.PI * 2; a += 0.3) {
      expect(coastAt(a)).toBeGreaterThan(LAND_R - 20);
      expect(coastAt(a)).toBeLessThanOrEqual(COAST_MAX);
    }
  });

  it('eski adanın yaklaşık 30 katı alan', () => {
    expect((LAND_R / 60) ** 2).toBeGreaterThan(28);
  });

  it('Şehir Merkezi yarımadanın üstünde, kıyıdan uzakta', () => {
    const d = zone('downtown');
    const r = Math.hypot(d.x, d.z);
    expect(heightAt(d.x, d.z)).toBeGreaterThan(0.9);
    // bölgenin her yanı (60 birim) karada
    for (let a = 0; a < Math.PI * 2; a += 0.4) expect(heightAt(d.x + Math.cos(a) * 60, d.z + Math.sin(a) * 60)).toBeGreaterThan(0.9);
    expect(coastAt(Math.atan2(d.z, d.x)) - r).toBeGreaterThan(70);
  });
});
