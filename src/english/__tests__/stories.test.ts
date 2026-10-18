import { describe, expect, it } from 'vitest';
import { lessons } from '../../lessons';
import { englishLines, STORIES } from '../data';
import { MORE_STORIES } from '../stories';

const ids = new Set([...lessons.map((l) => l.id), 'mascot']);

describe('İngilizce hikâyeler', () => {
  it('yirmi hikâye var ve kimlikleri benzersiz', () => {
    expect(STORIES.length).toBeGreaterThanOrEqual(20);
    expect(new Set(STORIES.map((s) => s.id)).size).toBe(STORIES.length);
  });

  it('bütün resimler var olan derslere bakar', () => {
    for (const s of STORIES) {
      for (const it of s.cover) expect(ids.has(it.lesson), `${s.id} kapak: ${it.lesson}`).toBe(true);
      for (const p of s.pages) for (const it of p.items) expect(ids.has(it.lesson), `${s.id}: ${it.lesson}`).toBe(true);
    }
  });

  it('etkileşimlerin hedefi sayfada var', () => {
    for (const s of STORIES) {
      for (const p of s.pages) {
        const a = p.act;
        if (!a) continue;
        const pageIds = new Set(p.items.map((i) => i.id).filter(Boolean));
        if (a.kind === 'tap' || a.kind === 'paint') expect(pageIds.has(a.target), `${s.id}: ${a.target}`).toBe(true);
        if (a.kind === 'reveal') {
          expect(pageIds.has(a.cover), `${s.id}: ${a.cover}`).toBe(true);
          expect(pageIds.has(a.hidden), `${s.id}: ${a.hidden}`).toBe(true);
          expect(p.items.find((i) => i.id === a.hidden)?.hidden, `${s.id}: ${a.hidden} gizli olmalı`).toBe(true);
        }
        if (a.kind === 'choose') expect(a.options).toContain(a.answer);
        if (a.kind === 'paint') {
          expect(a.options).toContain(a.answer);
          expect(p.items.find((i) => i.id === a.target)?.bare, `${s.id}: ${a.target} boyanmamış olmalı`).toBe(true);
        }
      }
    }
  });

  it('her hikâyenin sayfaları ve sözleri var', () => {
    for (const s of MORE_STORIES) {
      expect(s.pages.length, s.id).toBeGreaterThanOrEqual(5);
      expect(s.title, s.id).toBeTruthy();
      expect(s.tr, s.id).toBeTruthy();
      for (const p of s.pages) expect(p.say.length, s.id).toBeGreaterThan(0);
    }
  });

  it('sözler seslendirme listesine giriyor', () => {
    const all = englishLines();
    expect(all).toContain(MORE_STORIES[0].title);
    expect(all).toContain(MORE_STORIES[0].pages[0].say[0]);
  });
});
