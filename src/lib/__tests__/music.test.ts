import { describe, expect, it } from 'vitest';
import { __songs } from '../music';

const { SONGS, arrange, midi, chord } = __songs;

describe('ada müziği', () => {
  it('notalar ve akorlar doğru okunur', () => {
    expect(midi('C4')).toBe(60);
    expect(midi('F#5')).toBe(78);
    expect(midi('Bb5')).toBe(82);
    expect(chord('F#m')).toEqual({ root: 6, tones: [0, 3, 7] });
    expect(chord('Bb')).toEqual({ root: 10, tones: [0, 4, 7] });
  });
  it('her şarkının her ölçüsü tam (adım sayısı ve akor sayısı uyumlu)', () => {
    for (const s of SONGS) {
      for (const part of [s.A, s.B]) {
        expect(part.mel.length, s.name).toBe(part.chords.length);
        for (const m of part.mel) expect(m.split(/\s+/).length, `${s.name}: ${m}`).toBe(s.per);
        for (const c of part.chords) for (const sym of c.split(' ')) expect(sym, s.name).toMatch(/^[A-G](#|b)?m?7?$/);
      }
      const bars = arrange(s);
      expect(bars.length).toBeGreaterThan(30);
      // melodi notaları makul aralıkta
      for (const b of bars) for (const n of b.notes) expect(n.m).toBeGreaterThanOrEqual(55);
    }
  });
  it('gündüz en az üç, gece bir şarkı var', () => {
    expect(SONGS.filter((s) => !s.night).length).toBeGreaterThanOrEqual(3);
    expect(SONGS.some((s) => s.night)).toBe(true);
  });
});
