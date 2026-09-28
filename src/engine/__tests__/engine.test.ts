import { describe, expect, it } from 'vitest';
import { flattenPath, samplePath } from '../pathSampler';
import { feedbackText, scoreFreehand, scoreStep } from '../scoring';
import type { StrokeAction } from '../types';
import type { Shape } from '../../lessons/types';

const circle = 'M100,200 A100,100 0 1,0 300,200 A100,100 0 1,0 100,200 Z';

function strokeFrom(d: string, offset = 0, jitter = 0): StrokeAction {
  const pts = samplePath(d, 5).points.map(([x, y], i) => [x + offset + (i % 2 ? jitter : -jitter), y, 0.5] as [number, number, number]);
  return { kind: 'stroke', tool: 'pencil', color: '#000', size: 4, points: pts };
}

describe('pathSampler', () => {
  it('çemberin uzunluğunu doğru hesaplar', () => {
    const { length } = samplePath(circle);
    expect(length).toBeGreaterThan(2 * Math.PI * 100 - 3);
    expect(length).toBeLessThan(2 * Math.PI * 100 + 3);
  });

  it('göreli komutları ve örtük lineto\'yu çözer', () => {
    const [poly] = flattenPath('m10,10 20,0 0,20 z');
    expect(poly[0]).toEqual([10, 10]);
    expect(poly[1]).toEqual([30, 10]);
    expect(poly[2]).toEqual([30, 30]);
    expect(poly[3]).toEqual([10, 10]);
  });

  it('H/V ve kübik eğrileri işler', () => {
    const { points } = samplePath('M0,0 H100 V100 C100,150 0,150 0,100');
    const last = points[points.length - 1];
    expect(last[0]).toBeCloseTo(0, 5);
    expect(last[1]).toBeCloseTo(100, 5);
  });
});

describe('scoring', () => {
  const target: Shape[] = [{ d: circle, part: 'kafa' }];

  it('birebir iz sürmeye 3 yıldız verir', () => {
    const r = scoreStep(target, target, [strokeFrom(circle, 0, 3)]);
    expect(r.stars).toBe(3);
    expect(r.coverage).toBeGreaterThan(0.95);
  });

  it('boş çizime 0 yıldız verir', () => {
    expect(scoreStep(target, target, []).stars).toBe(0);
  });

  it('yarım çizimde eksik parçayı söyler', () => {
    const half = strokeFrom('M100,200 A100,100 0 0,0 300,200');
    const r = scoreStep(target, target, [half]);
    expect(r.stars).toBeLessThan(3);
    expect(feedbackText(r)).toMatch(/Kafa/);
    expect(r.missed.length).toBeGreaterThan(5);
  });

  it('çok uzağa çizilen şekle yıldız vermez', () => {
    const r = scoreStep(target, target, [strokeFrom(circle, 150)]);
    expect(r.stars).toBeLessThanOrEqual(1);
  });

  it('serbest çizimde konum ve boyutu önemsemez', () => {
    const small = 'M160,200 A40,40 0 1,0 240,200 A40,40 0 1,0 160,200 Z';
    const r = scoreFreehand(target, [strokeFrom(small, 60)]);
    expect(r.stars).toBe(3);
  });

  it('serbest çizimde alakasız şekle düşük puan verir', () => {
    const line = strokeFrom('M50,50 L350,350');
    const r = scoreFreehand(target, [line]);
    expect(r.stars).toBe(1);
  });
});
