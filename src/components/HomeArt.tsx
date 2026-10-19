/**
 * Ana sayfadaki "Çizio Atölyesi" kartının arkasındaki iki çizim: kedi ve güneş-bulut dersleri.
 *
 * Bu dosya elle değiştirilmez — `npm run art` üretir (bkz. scripts/bake-art.ts).
 */
import { memo } from 'react';
import { INK } from '../dressup/ink';
import type { Shape } from '../lessons/types';

const sw = { stroke: INK, strokeWidth: 7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

const KEDI_BOX = '63.1 58.3 273.7 273.7';
const KEDI: Shape[] = [
  { d: 'M80,220 A120,100 0 1,0 320,220 A120,100 0 1,0 80,220 Z', part: 'kafa', fill: '#f6a74b' },
  { d: 'M105,159 L120,70 L175,122', part: 'sol kulak', fill: '#f6a74b' },
  { d: 'M225,122 L280,70 L295,159', part: 'sağ kulak', fill: '#f6a74b' },
  { d: 'M125,145 L132,98 L160,125', part: 'sol kulak içi', fill: '#ffb3c1' },
  { d: 'M240,125 L268,98 L275,145', part: 'sağ kulak içi', fill: '#ffb3c1' },
  { d: 'M137,205 A18,18 0 1,0 173,205 A18,18 0 1,0 137,205 Z', part: 'sol göz', fill: '#2d2d2d' },
  { d: 'M227,205 A18,18 0 1,0 263,205 A18,18 0 1,0 227,205 Z', part: 'sağ göz', fill: '#2d2d2d' },
  { d: 'M188,238 L212,238 L200,252 Z', part: 'burun', fill: '#ff7f9c' },
  { d: 'M176,264 Q188,280 200,254 Q212,280 224,264', part: 'ağız' },
  { d: 'M150,242 L82,232', part: 'bıyıklar' },
  { d: 'M150,256 L82,262', part: 'bıyıklar' },
  { d: 'M250,242 L318,232', part: 'bıyıklar' },
  { d: 'M250,256 L318,262', part: 'bıyıklar' },
];

const GUNES_BOX = '22.0 6.0 352.9 352.9';
const GUNES: Shape[] = [
  { d: 'M78,138 A64,64 0 1,0 206,138 A64,64 0 1,0 78,138 Z', part: 'güneş', fill: '#ffd23f' },
  { d: 'M142,60 L142,30', part: 'üst ışın' },
  { d: 'M220,138 L250,138', part: 'sağ ışın' },
  { d: 'M142,216 L142,246', part: 'alt ışın' },
  { d: 'M64,138 L34,138', part: 'sol ışın' },
  { d: 'M86.8,82.8 L65.6,61.6', part: 'çapraz ışın' },
  { d: 'M197.2,82.8 L218.4,61.6', part: 'çapraz ışın' },
  { d: 'M86.8,193.2 L65.6,214.4', part: 'çapraz ışın' },
  { d: 'M197.2,193.2 L218.4,214.4', part: 'çapraz ışın' },
  { d: 'M200,335 A32,32 0 0,1 196,272 A44,44 0 0,1 276,244 A40,40 0 0,1 342,280 A28,28 0 0,1 338,335 Z', part: 'bulut', fill: '#d9eeff' },
  { d: 'M109,128 A12,12 0 1,0 133,128 A12,12 0 1,0 109,128 Z', part: 'sol göz', fill: '#2d2d2d' },
  { d: 'M151,128 A12,12 0 1,0 175,128 A12,12 0 1,0 151,128 Z', part: 'sağ göz', fill: '#2d2d2d' },
  { d: 'M112,123 A5,5 0 1,0 122,123 A5,5 0 1,0 112,123 Z', part: 'sol parıltı', fill: '#ffffff' },
  { d: 'M154,123 A5,5 0 1,0 164,123 A5,5 0 1,0 154,123 Z', part: 'sağ parıltı', fill: '#ffffff' },
  { d: 'M122,154 Q142,172 162,154', part: 'güneşin ağzı' },
  { d: 'M94,152 A10,7 0 1,0 114,152 A10,7 0 1,0 94,152 Z', part: 'güneşin yanağı', fill: '#ff9eb5' },
  { d: 'M170,152 A10,7 0 1,0 190,152 A10,7 0 1,0 170,152 Z', part: 'güneşin yanağı', fill: '#ff9eb5' },
  { d: 'M240,292 Q252,278 264,292', part: 'bulutun gözü' },
  { d: 'M288,292 Q300,278 312,292', part: 'bulutun gözü' },
  { d: 'M262,306 Q276,320 290,306', part: 'bulutun ağzı' },
];

const Art = ({ box, shapes }: { box: string; shapes: Shape[] }) => (
  <svg viewBox={box} aria-hidden="true">
    {shapes.map((s, i) => (
      <path key={i} d={s.d} fill={s.fill ?? 'none'} {...sw} />
    ))}
  </svg>
);

export const KediArt = memo(() => <Art box={KEDI_BOX} shapes={KEDI} />);
export const GunesArt = memo(() => <Art box={GUNES_BOX} shapes={GUNES} />);
