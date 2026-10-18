import { describe, expect, it } from 'vitest';
import { englishLines } from '../data';
import { noteHz, timeline } from '../songPlay';
import { line, lineText, SONG_LINES, SONGS } from '../songs';

describe('şarkılar', () => {
  it('her şarkının kimliği benzersiz, sözü ve hareketi var', () => {
    expect(new Set(SONGS.map((s) => s.id)).size).toBe(SONGS.length);
    for (const s of SONGS) {
      expect(s.title, s.id).toBeTruthy();
      expect(s.titleTr, s.id).toBeTruthy();
      expect(s.move, s.id).toBeTruthy();
      expect(s.lines.length, s.id).toBeGreaterThan(1);
      expect(s.bpm, s.id).toBeGreaterThan(60);
      expect(s.bpm, s.id).toBeLessThan(180);
    }
  });

  it('her hecenin notası var ve nota adı okunabilir', () => {
    for (const s of SONGS) {
      for (const l of s.lines) {
        expect(l.syls.length, `${s.id}: ${lineText(l)}`).toBeGreaterThan(0);
        for (const syl of l.syls) {
          if (!syl.note) continue;
          expect(syl.note, `${s.id}: ${syl.s}`).toMatch(/^[A-G](#|b)?\d$/);
          const hz = noteHz(syl.note);
          expect(hz, `${s.id}: ${syl.note}`).toBeGreaterThan(80);
          expect(hz, `${s.id}: ${syl.note}`).toBeLessThan(2200);
        }
      }
    }
  });

  it('kelimeler tireden arınmış, heceler kelimeye bağlı', () => {
    const l = line('Twin-kle twin-kle lit-tle star', 'C4 C4 G4 G4 A4 A4 G4*2');
    expect(l.words).toEqual(['Twinkle', 'twinkle', 'little', 'star']);
    expect(l.syls.map((s) => s.s)).toEqual(['Twin', 'kle', 'twin', 'kle', 'lit', 'tle', 'star']);
    expect(l.syls.map((s) => s.w)).toEqual([0, 0, 1, 1, 2, 2, 3]);
    expect(l.syls[6].beats).toBe(2);
    expect(l.beats).toBe(8);
  });

  it('zaman çizgisi sırayla ilerler', () => {
    for (const s of SONGS) {
      const { beats, total } = timeline(s);
      expect(beats.length, s.id).toBeGreaterThan(5);
      expect(total, s.id).toBeGreaterThan(5);
      for (let i = 1; i < beats.length; i++) expect(beats[i].at, s.id).toBeGreaterThan(beats[i - 1].at);
    }
  });

  it('sözler seslendirme listesine giriyor', () => {
    const all = englishLines();
    expect(all).toContain(SONGS[0].title);
    expect(all).toContain(lineText(SONGS[0].lines[0]));
    expect(new Set(SONG_LINES).size).toBe(SONG_LINES.length);
  });
});
