import { describe, expect, it } from 'vitest';
import { SEASONS, seasonOf, WEATHER_TEXT, weatherOf } from '../weather';

describe('mevsim ve hava', () => {
  it('ay numarasına göre mevsim', () => {
    expect(seasonOf(new Date('2026-01-15'))).toBe('kis');
    expect(seasonOf(new Date('2026-04-10'))).toBe('ilkbahar');
    expect(seasonOf(new Date('2026-07-20'))).toBe('yaz');
    expect(seasonOf(new Date('2026-10-05'))).toBe('sonbahar');
    expect(seasonOf(new Date('2026-12-24'))).toBe('kis');
  });

  it('her mevsimin yaprak rengi var', () => {
    for (const s of ['ilkbahar', 'yaz', 'sonbahar', 'kis'] as const) {
      expect(SEASONS[s].leaf).toMatch(/^#[0-9a-f]{6}$/i);
      expect(SEASONS[s].name).toBeTruthy();
    }
  });

  it('aynı gün hep aynı hava', () => {
    const a = weatherOf(new Date('2026-06-15T08:00:00'));
    const b = weatherOf(new Date('2026-06-15T21:30:00'));
    expect(a).toBe(b);
  });

  it('kar yalnızca kışın, yağmur kışın değil', () => {
    for (let g = 1; g <= 28; g++) {
      expect(weatherOf(new Date(`2026-07-${String(g).padStart(2, '0')}`))).not.toBe('kar');
      expect(weatherOf(new Date(`2026-01-${String(g).padStart(2, '0')}`))).not.toBe('yagmur');
    }
  });

  it('havaların çoğu açık, ama hepsi değil', () => {
    const yil = Array.from({ length: 365 }, (_, i) => weatherOf(new Date(2026, 0, 1 + i)));
    const acik = yil.filter((w) => w === 'acik').length;
    expect(acik).toBeGreaterThan(200);
    expect(acik).toBeLessThan(365);
    expect(WEATHER_TEXT.kar).toBeTruthy();
  });
});
