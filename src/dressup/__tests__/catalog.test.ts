import { describe, expect, it } from 'vitest';
import {
  BGS, BOTTOMS, DRESSES, FACES, GLASSES, HAIRS, HANDS, HATS, PRESETS, SHOES, THEME_GOAL, THEMES, TOPS,
  randomOutfit, themeMatches, type DollState, type Item,
} from '../catalog';

const has = (list: Item[], id: string) => list.some((i) => i.id === id);

describe('giydirme kataloğu', () => {
  it('hazır karakterler geçerli parçalar kullanır; 6 kız, 6 erkek', () => {
    expect(PRESETS.filter((p) => p.gender === 'kiz')).toHaveLength(6);
    expect(PRESETS.filter((p) => p.gender === 'erkek')).toHaveLength(6);
    for (const p of PRESETS) {
      expect(has(HAIRS, p.hair)).toBe(true);
      expect(has(FACES, p.face)).toBe(true);
      expect(has(TOPS, p.top)).toBe(true);
      expect(has(BOTTOMS, p.bottom)).toBe(true);
      expect(has(SHOES, p.shoes)).toBe(true);
      expect(has(HATS, p.hat)).toBe(true);
      expect(has(GLASSES, p.glasses)).toBe(true);
      expect(has(BGS, p.bg)).toBe(true);
    }
  });

  it('hazır karakterler farklı ten ve saç tiplerinde', () => {
    expect(new Set(PRESETS.map((p) => p.skin)).size).toBeGreaterThanOrEqual(7);
    expect(new Set(PRESETS.map((p) => p.hair)).size).toBe(PRESETS.length);
  });

  it('her stil görevi tamamlanabilir', () => {
    for (const t of THEMES) {
      const tagged = (list: Item[]) => list.find((i) => i.id && i.tags?.includes(t.tag))?.id ?? '';
      const d: DollState = {
        ...PRESETS[0],
        top: tagged(TOPS) || PRESETS[0].top,
        bottom: tagged(BOTTOMS) || PRESETS[0].bottom,
        dress: '',
        glasses: tagged(GLASSES),
        shoes: tagged(SHOES) || PRESETS[0].shoes,
        hat: tagged(HATS),
        hand: tagged(HANDS),
        bg: t.bg,
      };
      expect(themeMatches(d, t).length, t.id).toBeGreaterThanOrEqual(THEME_GOAL);
    }
  });

  it('hazır karakter olduğu gibi görevi tamamlamaz', () => {
    for (const t of THEMES) for (const p of PRESETS) expect(themeMatches(p, t).length).toBeLessThan(THEME_GOAL);
  });

  it('elbise giyilince üst ve alt sayılmaz', () => {
    const t = THEMES.find((x) => x.id === 'parti')!;
    const d: DollState = { ...PRESETS[0], dress: 'prenses', top: 'yildizli', bottom: 'etek', glasses: '', hat: '', hand: '', shoes: 'spor', bg: 'oda' };
    expect(themeMatches(d, t)).toEqual(['Balo elbisesi']);
    expect(has(DRESSES, 'prenses')).toBe(true);
  });

  it('şaşırt beni görünümü (ten, saç) korur', () => {
    const p = PRESETS[3];
    for (let i = 0; i < 20; i++) {
      const r = randomOutfit(p);
      expect(r.skin).toBe(p.skin);
      expect(r.hair).toBe(p.hair);
      expect(r.hairColor).toBe(p.hairColor);
    }
  });
});
