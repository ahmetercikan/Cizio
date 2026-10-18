import { describe, expect, it } from 'vitest';
import { DRUMS, instrument, INSTRUMENTS, MUSIC_LINES, noteHz, SCALE, SONGLETS, tune } from '../instruments';

describe('Müzik Odası', () => {
  it('beş çalgı var, hepsinin adı ve ipucu dolu', () => {
    expect(INSTRUMENTS).toHaveLength(5);
    for (const i of INSTRUMENTS) {
      expect(i.name, i.id).toBeTruthy();
      expect(i.hint, i.id).toBeTruthy();
      expect(instrument(i.id)?.id).toBe(i.id);
    }
  });

  it('dizi sekiz nota ve frekanslar yükselerek gider', () => {
    expect(SCALE).toHaveLength(8);
    expect(DRUMS).toHaveLength(5);
    for (let i = 1; i < 8; i++) expect(noteHz(i)).toBeGreaterThan(noteHz(i - 1));
    expect(Math.round(noteHz(0))).toBe(262);
    expect(Math.round(noteHz(7))).toBe(523);
  });

  it('dizi sınır dışına taşmaz', () => {
    expect(noteHz(-5)).toBe(noteHz(0));
    expect(noteHz(99)).toBe(noteHz(7));
  });

  it('ezgide arka arkaya aynı nota olmaz', () => {
    for (let k = 0; k < 60; k++) {
      const t = tune(8, 5);
      expect(t).toHaveLength(8);
      for (let i = 1; i < t.length; i++) expect(t[i]).not.toBe(t[i - 1]);
      for (const n of t) expect(n).toBeLessThan(5);
    }
  });

  it('hazır ezgilerin notaları dizinin içinde', () => {
    for (const s of SONGLETS) {
      expect(s.notes.length).toBeGreaterThan(3);
      for (const n of s.notes) {
        expect(n).toBeGreaterThanOrEqual(0);
        expect(n).toBeLessThan(SCALE.length);
      }
    }
    expect(new Set(MUSIC_LINES).size).toBe(MUSIC_LINES.length);
  });
});
