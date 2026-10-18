import { describe, expect, it } from 'vitest';
import { lessons } from '../../lessons';
import { englishLines } from '../data';
import { READ_LINES, SENTENCES, sentenceText, SIGHT_WORDS } from '../reading';

const ids = new Set([...lessons.map((l) => l.id), 'mascot']);

describe('Read With Me', () => {
  it('cümlelerin kimliği benzersiz, resmi var olan derse bakıyor', () => {
    expect(new Set(SENTENCES.map((s) => s.id)).size).toBe(SENTENCES.length);
    for (const s of SENTENCES) {
      if (s.art.k === 'lesson') expect(ids.has(s.art.id), `${s.id}: ${s.art.id}`).toBe(true);
      expect(s.tr, s.id).toBeTruthy();
    }
  });

  it('her seviyede yeterince cümle var', () => {
    for (const lv of [1, 2, 3]) expect(SENTENCES.filter((s) => s.level <= lv).length, `seviye ${lv}`).toBeGreaterThanOrEqual(4);
  });

  it('cümleler kısa ve kelimelerden kuruluyor', () => {
    for (const s of SENTENCES) {
      expect(s.words.length, s.id).toBeGreaterThanOrEqual(3);
      expect(s.words.length, s.id).toBeLessThanOrEqual(7);
      for (const w of s.words) expect(w, s.id).not.toMatch(/\s/);
      expect(sentenceText(s)).toBe(`${s.words.join(' ')}.`);
    }
  });

  it('sık kelimeler cümlelerde gerçekten geçiyor', () => {
    const kullanilan = new Set(SENTENCES.flatMap((s) => s.words.map((w) => w.toLowerCase())));
    const gecen = SIGHT_WORDS.filter((w) => kullanilan.has(w.toLowerCase()));
    expect(gecen.length).toBeGreaterThanOrEqual(10);
  });

  it('seslendirme listesine giriyor', () => {
    const all = englishLines();
    expect(all).toContain(sentenceText(SENTENCES[0]));
    expect(new Set(READ_LINES).size).toBe(READ_LINES.length);
  });
});
