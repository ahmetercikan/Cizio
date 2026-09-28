import { describe, expect, it } from 'vitest';
import { samplePath } from '../../engine/pathSampler';
import { scoreStep } from '../../engine/scoring';
import type { StrokeAction } from '../../engine/types';
import { lessons, paths } from '..';
import type { Shape } from '../types';

const trace = (shapes: Shape[], dx = 0): StrokeAction[] =>
  shapes
    .filter((s) => !s.guide)
    .map((s) => ({
      kind: 'stroke',
      tool: 'pencil',
      color: '#000',
      size: 4,
      points: samplePath(s.d, 5).points.map(([x, y], i) => [x + dx + (i % 2 ? 2 : -2), y + dx * 0.8, 0.5] as [number, number, number]),
    }));

describe('ders içeriği', () => {
  it('en az 20 ders var ve her yolda ders bulunuyor', () => {
    expect(lessons.length).toBeGreaterThanOrEqual(20);
    for (const p of paths) expect(lessons.some((l) => l.path === p.id)).toBe(true);
  });

  it('kimlikler ve başlıklar benzersiz', () => {
    expect(new Set(lessons.map((l) => l.id)).size).toBe(lessons.length);
    expect(new Set(lessons.map((l) => l.title)).size).toBe(lessons.length);
  });

  for (const l of lessons) {
    describe(l.id, () => {
      it('biçim kurallarına uyuyor', () => {
        expect(l.steps.length).toBeGreaterThanOrEqual(3);
        for (const st of l.steps) {
          expect(st.say.length).toBeLessThanOrEqual(120);
          expect(st.shapes.length).toBeGreaterThan(0);
          for (const s of st.shapes) {
            const { points } = samplePath(s.d);
            expect(points.length).toBeGreaterThan(1);
            for (const [x, y] of points) {
              expect(x).toBeGreaterThanOrEqual(0);
              expect(x).toBeLessThanOrEqual(400);
              expect(y).toBeGreaterThanOrEqual(0);
              expect(y).toBeLessThanOrEqual(400);
            }
          }
        }
      });

      it('her adımda doğru iz sürme 3 yıldız alır', () => {
        l.steps.forEach((st, i) => {
          const context = l.steps.slice(0, i + 1).flatMap((s) => s.shapes);
          const r = scoreStep(st.shapes, context, trace(st.shapes));
          expect(r.stars, `adım ${i + 1}`).toBe(3);
        });
      });

      it('hiç çizmemek ya da çok kaydırarak (çapraz) çizmek 3 yıldız almaz', () => {
        l.steps.forEach((st, i) => {
          if (st.shapes.every((s) => s.guide)) return;
          const context = l.steps.slice(0, i + 1).flatMap((s) => s.shapes);
          expect(scoreStep(st.shapes, context, []).stars).toBe(0);
          expect(scoreStep(st.shapes, context, trace(st.shapes, 60)).stars, `adım ${i + 1}`).toBeLessThan(3);
        });
      });
    });
  }
});
