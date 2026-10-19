/**
 * Yazılı çizimler (scripts/bake-art.ts çıktısı) derslerle aynı mı?
 * Bir dersin çizimi değişip `npm run art` çalıştırılmazsa bu test uyarır.
 */
import { describe, expect, it } from 'vitest';
import { getLesson } from '../../lessons';
import { AVATARS } from '../Avatars';
import { AVATAR_SHAPES } from '../AvatarShapes';

describe('yazılı çizimler', () => {
  it('her avatarın çizimi kendi dersiyle aynı', () => {
    for (const a of AVATARS) {
      const lesson = getLesson(a.lesson);
      expect(lesson, `${a.lesson} dersi`).toBeTruthy();
      expect(AVATAR_SHAPES[a.lesson], `${a.id} avatarı`).toEqual(lesson!.steps.flatMap((s) => s.shapes));
    }
  });
});
