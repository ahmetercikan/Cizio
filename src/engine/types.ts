import type { Pt } from './pathSampler';

export type Tool = 'pencil' | 'marker' | 'brush' | 'eraser' | 'fill';

/** Kullanıcının bir kalem darbesi. Koordinatlar 400x400 ders alanında; p = basınç (0..1). */
export interface StrokeAction {
  kind: 'stroke';
  tool: Exclude<Tool, 'fill'>;
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
}

export type DrawAction = StrokeAction | FillAction;
