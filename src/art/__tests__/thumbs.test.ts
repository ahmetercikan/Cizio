import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { lessons } from '../../lessons';
import { hasThumb } from '../thumbs';

describe('önceden üretilmiş ders eskizleri', () => {
  it('her dersin güncel kalem ve renkli resmi var (yoksa: npx tsx scripts/build-thumbs.ts <id>)', () => {
    const stale = lessons.filter((l) => !hasThumb(l)).map((l) => l.id);
    expect(stale, `yeniden üretin: npx tsx scripts/build-thumbs.ts ${stale.join(' ')}`).toEqual([]);
    for (const l of lessons) {
      for (const mode of ['graphite', 'color']) expect(existsSync(join('public', 'thumbs', `${l.id}-${mode}.webp`)), `${l.id}-${mode}`).toBe(true);
    }
    expect(existsSync(join('public', 'thumbs', 'paper.webp'))).toBe(true);
  });
});
