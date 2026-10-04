import { beforeEach, describe, expect, it } from 'vitest';
import { getLesson } from '../../lessons';
import { useApp } from '../../store/useApp';
import {
  ALL_WORDS, COMMANDS, DAILY_GAME_CAP, emptyEnglish, englishLines, GAME_STARS, HOME_HUNTS, newWordsOfDay, PAINT_PAGES, SESSION_STARS, STORIES,
  topicOfDay, TOPICS, type Art,
} from '../data';

const lessonParts = (id: string) => new Set(getLesson(id)!.steps.flatMap((s) => s.shapes.filter((x) => !x.guide).map((x) => x.part ?? '')));

function checkArt(art: Art, where: string) {
  if (art.k !== 'lesson') return;
  expect(getLesson(art.id), `${where}: ders yok (${art.id})`).toBeTruthy();
  if (art.parts) {
    const parts = lessonParts(art.id);
    for (const p of art.parts) expect(parts.has(p), `${where}: ${art.id} dersinde "${p}" parçası yok`).toBe(true);
  }
}

describe('English Club içeriği', () => {
  it('kelime kimlikleri benzersiz, her konuda en az 6 kelime', () => {
    expect(new Set(ALL_WORDS.map((w) => w.id)).size).toBe(ALL_WORDS.length);
    for (const t of TOPICS) expect(t.words.length, t.id).toBeGreaterThanOrEqual(6);
  });

  it('kullanılan her ders çizimi ve parça adı var', () => {
    for (const w of ALL_WORDS) checkArt(w.art, w.id);
    for (const c of COMMANDS) checkArt(c.art, c.id);
    for (const h of HOME_HUNTS) checkArt(h.art, h.en);
  });

  it('boyama sayfalarının her hedefi derste boyanabilir bir parça', () => {
    for (const p of PAINT_PAGES) {
      const shapes = getLesson(p.lesson)!.steps.flatMap((s) => s.shapes);
      for (const t of p.targets) {
        expect(shapes.some((s) => s.fill && t.parts.includes(s.part ?? '')), `${p.lesson}: ${t.en}`).toBe(true);
      }
    }
  });

  it('hikâye sahneleri ve soruları tutarlı', () => {
    for (const s of STORIES) {
      expect(s.pages.length).toBeGreaterThanOrEqual(5);
      for (const [i, p] of s.pages.entries()) {
        const where = `${s.id} sayfa ${i + 1}`;
        for (const it of [...p.items, ...s.cover]) {
          if (it.lesson !== 'mascot') checkArt({ k: 'lesson', id: it.lesson, parts: it.parts }, where);
        }
        const ids = new Set(p.items.map((it) => it.id).filter(Boolean));
        const a = p.act;
        if (!a) continue;
        if (a.kind === 'tap') expect(ids.has(a.target), where).toBe(true);
        if (a.kind === 'reveal') {
          expect(ids.has(a.cover), where).toBe(true);
          expect(p.items.find((it) => it.id === a.hidden)?.hidden, where).toBe(true);
        }
        if (a.kind === 'choose') expect(a.options).toContain(a.answer);
        if (a.kind === 'paint') {
          expect(a.options).toContain(a.answer);
          expect(p.items.find((it) => it.id === a.target)?.bare, where).toBe(true);
        }
      }
    }
  });

  it('seslendirilecek cümleler İngilizce sesin okuyabileceği biçimde', () => {
    const lines = englishLines();
    expect(lines.length).toBeGreaterThan(300);
    for (const l of lines) {
      expect(l, l).not.toMatch(/[çğışöüÇĞİŞÖÜ]/);
      expect(l.length, l).toBeLessThanOrEqual(120);
    }
  });
});

describe('English Time planı', () => {
  it('ilk gün renklerden başlar; görülen kelimeler yerine yenileri gelir (i+1)', () => {
    const e = emptyEnglish();
    expect(topicOfDay(e).id).toBe('colors');
    const first = newWordsOfDay(e);
    expect(first).toHaveLength(3);
    for (const w of first) e.words[w.id] = { seen: 1, got: 0 };
    const second = newWordsOfDay(e);
    expect(second.some((w) => first.includes(w))).toBe(false);
  });

  it('bir konunun tüm kelimeleri görülünce sıradaki konuya geçilir', () => {
    const e = emptyEnglish();
    for (const w of TOPICS[0].words) e.words[w.id] = { seen: 1, got: 0 };
    expect(topicOfDay(e).id).toBe(TOPICS[1].id);
  });
});

describe('English Club yıldızları', () => {
  beforeEach(() => {
    useApp.setState({ profiles: [], data: {}, activeId: undefined });
    useApp.getState().addProfile({ name: 'Deniz', avatar: 'kedi', favoritePath: 'hayvanlar' });
  });
  const d = () => useApp.getState().data[useApp.getState().activeId!];

  it('English Time günde bir kez yıldız verir', () => {
    expect(useApp.getState().recordEnglish({ session: true, seen: ['colors.red'] })).toBe(SESSION_STARS);
    expect(useApp.getState().recordEnglish({ session: true })).toBe(0);
    expect(d().english!.words['colors.red'].seen).toBe(1);
    expect(d().wallet).toBe(SESSION_STARS);
  });

  it('oyun yıldızlarının günlük üst sınırı var', () => {
    let total = 0;
    for (let i = 0; i < 10; i++) total += useApp.getState().recordEnglish({ game: true });
    expect(total).toBe(DAILY_GAME_CAP);
    expect(GAME_STARS).toBeLessThan(DAILY_GAME_CAP);
  });

  it('ilk denemede bilinen kelime sayılır, iki kez bilinince öğrenilmiş olur', () => {
    useApp.getState().recordEnglish({ seen: ['animals.cat'], got: ['animals.cat'] });
    useApp.getState().recordEnglish({ got: ['animals.cat'] });
    expect(d().english!.words['animals.cat']).toEqual({ seen: 1, got: 2 });
  });
});
