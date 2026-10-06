import { describe, expect, it } from 'vitest';
import { facingOf, motionOf, partGroup, partMotion } from '../../art/motion';
import { getLesson, lessons } from '../../lessons';
import { makePdf } from '../../lib/pdf';
import { buildStory, STORY_LINES, STORY_VOICE_LINES, THEMES } from '../data';

describe('hikaye kitabım', () => {
  it('her dersin kahraman ve arkadaş cümlesi var', () => {
    const missing = lessons.filter((l) => !STORY_LINES[l.id]).map((l) => l.id);
    expect(missing).toEqual([]);
    expect(Object.keys(STORY_LINES).filter((id) => !getLesson(id))).toEqual([]);
  });

  it('cümleler seslendirmeye uygun: tırnak ve iki nokta yok, kahraman "Bir zamanlar" ile başlar', () => {
    for (const [id, [hero, friend]] of Object.entries(STORY_LINES)) {
      expect(hero, id).toMatch(/^Bir zamanlar /);
      for (const t of [hero, friend]) {
        expect(t, id).not.toMatch(/["“”:]/);
        expect(t.length, id).toBeLessThan(170);
      }
    }
    for (const t of STORY_VOICE_LINES) expect(t).not.toMatch(/["“”:]/);
  });

  it('masal: kapaktan sonra her resim bir sayfa, sonda hepsi birlikte', () => {
    const pages = buildStory([{ lessonId: 'kedi' }, { lessonId: 'kamyon' }, {}], THEMES[1]);
    expect(pages.map((p) => p.art)).toEqual([0, 1, 2, 'all']);
    expect(pages[0].lines[0]).toBe('Bir varmış, bir yokmuş.');
    expect(pages[0].lines).toContain(THEMES[1].setup);
    expect(pages[1].lines[0]).toBe(STORY_LINES.kamyon[1]);
    expect(pages[3].lines[0]).toBe(THEMES[1].ending);
  });
});

describe('canlanan çizim kuralları', () => {
  it('parça grupları ve hareketleri', () => {
    expect(partGroup('sol göz parıltısı')).toBe('sol göz');
    expect(partGroup('sağ kulak içi')).toBe('sağ kulak');
    const kedi = getLesson('kedi')!;
    expect(partMotion('sol göz', kedi)).toBe('blink');
    expect(partMotion('kuyruk', kedi)).toBe('wag');
    expect(partMotion('sol kulak', kedi)).toBe('twitch');
    const kamyon = getLesson('kamyon')!;
    expect(partMotion('ön tekerlek', kamyon)).toBe('spin');
    // Tekerlek yalnızca giden taşıtlarda döner
    expect(partMotion('ön tekerlek', getLesson('vinc')!)).toBeUndefined();
  });

  it('hareket profilleri', () => {
    expect(motionOf(getLesson('balik')).game).toBe('swim');
    expect(motionOf(getLesson('roket')).body).toBe('rocket');
    expect(motionOf(getLesson('kepce')).game).toBe('drive');
    expect(motionOf(getLesson('kedi')).game).toBe('run');
    for (const l of lessons) expect(['run', 'drive', 'fly', 'swim']).toContain(motionOf(l).game);
  });

  it('bakış yönü: araçlarda ön tekerleğe göre', () => {
    for (const id of ['kamyon', 'kepce', 'traktor', 'otobus']) {
      const l = getLesson(id)!;
      expect([1, -1]).toContain(facingOf(l));
    }
  });
});

describe('PDF', () => {
  it('geçerli bir PDF iskeleti üretir', async () => {
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
    const blob = makePdf([{ jpeg, width: 2, height: 2 }, { jpeg, width: 2, height: 2 }]);
    const text = new TextDecoder('latin1').decode(new Uint8Array(await blob.arrayBuffer()));
    expect(text.startsWith('%PDF-1.4')).toBe(true);
    expect(text).toContain('/Count 2');
    expect(text).toContain('/Filter /DCTDecode');
    const xref = Number(text.match(/startxref\n(\d+)/)![1]);
    expect(text.slice(xref, xref + 4)).toBe('xref');
    // her nesnenin kaydedilen konumu gerçekten o nesnenin başlangıcı
    const offs = [...text.slice(xref).matchAll(/(\d{10}) 00000 n/g)].map((m) => Number(m[1]));
    offs.forEach((o, i) => expect(text.slice(o, o + `${i + 1} 0 obj`.length)).toBe(`${i + 1} 0 obj`));
  });
});
