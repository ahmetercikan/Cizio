/**
 * Çizim araçları: dikey araç kapsülü + kuru boya kalemi şeklinde renk paleti.
 */
import { Brush, Eraser, Highlighter, PaintBucket, Pencil, Redo2, Trash2, Undo2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { DrawingDoc } from '../engine/drawingDoc';
import type { Tool } from '../engine/types';
import { sfx } from '../lib/sfx';
import { Confirm } from './ui';

export const BASE_COLORS = [
  '#2f2f36', '#ff4d4d', '#ff8a3d', '#ffc531', '#fff27a', '#7ed957', '#22b566', '#3ec6e0',
  '#2f7bff', '#7c3cff', '#c77dff', '#ff7eb6', '#ffc2d4', '#a0522d', '#f6c9a0', '#ffffff',
];

const TOOLS: { id: Tool; label: string; Icon: typeof Pencil }[] = [
  { id: 'pencil', label: 'Kalem', Icon: Pencil },
  { id: 'marker', label: 'Keçeli kalem', Icon: Highlighter },
  { id: 'brush', label: 'Fırça', Icon: Brush },
  { id: 'fill', label: 'Boya kovası', Icon: PaintBucket },
  { id: 'eraser', label: 'Silgi', Icon: Eraser },
];

export const SIZES: Record<Tool, number[]> = {
  pencil: [3, 5, 9],
  marker: [8, 14, 22],
  brush: [10, 20, 34],
  eraser: [14, 26, 44],
  fill: [0, 0, 0],
};

export function useToolState(initial: { tool?: Tool; color?: string; sizeIdx?: number } = {}) {
  const [s, set] = useState({ tool: 'pencil' as Tool, color: '#2f2f36', sizeIdx: 1, ...initial });
  return {
    ...s,
    size: SIZES[s.tool][s.sizeIdx],
    setTool: (tool: Tool) => set((x) => ({ ...x, tool })),
    setColor: (color: string) => set((x) => ({ ...x, color, tool: x.tool === 'eraser' ? 'pencil' : x.tool })),
    setSizeIdx: (sizeIdx: number) => set((x) => ({ ...x, sizeIdx })),
  };
}
export type ToolState = ReturnType<typeof useToolState>;

export function useDocState(doc: DrawingDoc) {
  const [, force] = useState(0);
  useEffect(() => doc.onChange(() => force((n) => n + 1)), [doc]);
  return { canUndo: doc.canUndo, canRedo: doc.canRedo };
}

export function ToolCapsule({ doc, ts, tools = ['pencil', 'marker', 'brush', 'fill', 'eraser'], clear = true }: {
  doc: DrawingDoc; ts: ToolState; tools?: Tool[]; clear?: boolean;
}) {
  const { canUndo, canRedo } = useDocState(doc);
  const [ask, setAsk] = useState(false);
  return (
    <div className="capsule" role="toolbar" aria-label="Çizim araçları">
      {TOOLS.filter((t) => tools.includes(t.id)).map(({ id, label, Icon }) => (
        <button key={id} className={`capsule__btn ${ts.tool === id ? 'on' : ''}`} aria-label={label} aria-pressed={ts.tool === id} title={label}
          onClick={() => { sfx.tap(); ts.setTool(id); }}>
          <Icon size={24} strokeWidth={2.2} />
        </button>
      ))}
      {ts.tool !== 'fill' && (
        <div className="capsule__sizes" role="radiogroup" aria-label="Kalınlık">
          {[0, 1, 2].map((i) => (
            <button key={i} role="radio" aria-checked={ts.sizeIdx === i} aria-label={['İnce', 'Orta', 'Kalın'][i]}
              className={`capsule__size ${ts.sizeIdx === i ? 'on' : ''}`} onClick={() => ts.setSizeIdx(i)}>
              <span style={{ width: 5 + i * 5, height: 5 + i * 5 }} />
            </button>
          ))}
        </div>
      )}
      <span className="capsule__sep" />
      <button className="capsule__btn" aria-label="Geri al" disabled={!canUndo} onClick={() => doc.undo()}><Undo2 size={22} /></button>
      <button className="capsule__btn" aria-label="Yinele" disabled={!canRedo} onClick={() => doc.redo()}><Redo2 size={22} /></button>
      {clear && (
        <button className="capsule__btn" aria-label="Temizle" disabled={!canUndo} onClick={() => setAsk(true)}><Trash2 size={22} /></button>
      )}
      {ask && (
        <Confirm title="Her şeyi silelim mi?" text="Bu sayfadaki tüm çizgiler silinecek." yes="Sil" danger
          onNo={() => setAsk(false)} onYes={() => { setAsk(false); doc.clear(); }} />
      )}
    </div>
  );
}

/** Kuru boya kalemlerinden renk paleti. */
export function PencilPalette({ ts, palette }: { ts: ToolState; palette?: string[] }) {
  const colors = [...new Set([...(palette ?? []), ...BASE_COLORS])];
  return (
    <div className="palette" role="radiogroup" aria-label="Renk">
      {colors.map((c) => (
        <button key={c} role="radio" aria-checked={ts.color === c} aria-label={`Renk ${c}`}
          className={`palette__pencil ${ts.color === c ? 'on' : ''}`}
          onClick={() => { sfx.tap(); ts.setColor(c); }}>
          <svg viewBox="0 0 30 96" aria-hidden="true">
            <path d="M15,2 L25,26 L25,94 L5,94 L5,26 Z" fill={c} />
            <path d="M15,2 L25,26 L5,26 Z" fill="#f2cf9f" />
            <path d="M15,2 L19,11.5 L11,11.5 Z" fill={c} />
            <rect x="5" y="26" width="7" height="68" fill="#fff" opacity="0.25" />
            <rect x="18" y="26" width="7" height="68" fill="#000" opacity="0.12" />
            {c.toLowerCase() === '#ffffff' && <path d="M5,26 L5,94 L25,94 L25,26" fill="none" stroke="#d8d2e8" strokeWidth="1.5" />}
          </svg>
        </button>
      ))}
    </div>
  );
}
