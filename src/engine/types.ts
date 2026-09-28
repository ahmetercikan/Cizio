import type { Pt } from './pathSampler';

/** Kalem ve fırça türleri (hepsi darbe olarak çizilir). */
export type StrokeTool = 'pencil' | 'crayon' | 'marker' | 'brush' | 'watercolor' | 'rainbow' | 'glitter' | 'eraser';
export type Tool = StrokeTool | 'fill' | 'stamp';

/** Boya kovası desenleri. */
export type FillPattern = 'solid' | 'dots' | 'stripes' | 'hearts' | 'checks';

/** Kullanıcının bir kalem darbesi. Koordinatlar 400x400 ders alanında; p = basınç (0..1). */
export interface StrokeAction {
  kind: 'stroke';
  tool: StrokeTool;
  color: string;
  size: number;
  points: [number, number, number][];
  /** Darbenin çizildiği ders adımı (puanlama için). */
  step?: number;
}

export interface FillAction {
  kind: 'fill';
  color: string;
  at: Pt;
  pattern?: FillPattern;
}

/** Damga: bir emoji/şekil, dokunulan yere basılır. */
export interface StampAction {
  kind: 'stamp';
  stamp: string;
  at: Pt;
  size: number;
  rot: number;
}

export type DrawAction = StrokeAction | FillAction | StampAction;
