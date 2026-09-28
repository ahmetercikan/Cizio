import { describe, expect, it } from 'vitest';
import { lessons } from '../../lessons';
import { STATIC_LINES } from '../../voice/lines';
import { flattenPath } from '../../engine/pathSampler';
import { hatchPath, pointInPolys } from '../hatch';
import { DARK_SAY, SOFT_SAY, withShading } from '../shading';

describe('gölgelendirme adımları', () => {
  it('anlatım cümlelerinin ses kaydı kataloğda var', () => {
    expect(STATIC_LINES).toContain(SOFT_SAY);
    expect(STATIC_LINES).toContain(DARK_SAY);
  });

  it('her derse en az bir gölgelendirme adımı eklenir, çizgi adımları değişmez', () => {
    for (const l of lessons) {
      const s = withShading(l);
      expect(s.steps.slice(0, l.steps.length)).toEqual(l.steps);
      const extra = s.steps.slice(l.steps.length);
      expect(extra.length, l.id).toBeGreaterThan(0);
      for (const st of extra) {
        expect(st.shapes).toHaveLength(0);
        expect(st.hatch!.length).toBeGreaterThan(0);
        for (const h of st.hatch!) expect(h.d.length).toBeGreaterThan(10);
      }
    }
  });

  it('parlak nokta (delik) taranmaz', () => {
    const eye = { d: 'M100,200 A60,60 0 1,0 220,200 A60,60 0 1,0 100,200 Z', fill: '#2d2d2d' };
    const glint = { d: 'M170,180 A15,15 0 1,0 200,180 A15,15 0 1,0 170,180 Z', fill: '#ffffff' };
    const d = hatchPath(eye, { spacing: 3, holes: [glint] });
    const glintPoly = flattenPath(glint.d);
    // Tarama segmentlerinin uç noktaları parlaklığın içine düşmemeli.
    const pts = [...d.matchAll(/[ML]([\d.]+),([\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])] as [number, number]);
    expect(pts.length).toBeGreaterThan(20);
    const inside = pts.filter((p) => pointInPolys(glintPoly, p));
    expect(inside).toHaveLength(0);
  });
});
