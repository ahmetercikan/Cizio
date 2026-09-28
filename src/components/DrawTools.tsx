/**
 * Çizim araçları: dikey araç kapsülü (gruplar + açılır seçenekler) ve kuru boya kalemi şeklinde renk paleti.
 *   Kalemler: kurşun kalem, pastel boya, keçeli kalem
 *   Fırçalar: fırça, sulu boya, gökkuşağı, simli
 *   Boya kovası: düz ya da desenli (puantiye, çizgili, kalpli, kareli)
 *   Damgalar, silgi, geri al / yinele / temizle
 */
import {
  Brush, Droplets, Eraser, Highlighter, PaintBucket, Pencil, PencilLine, Rainbow, Redo2, Sparkles, Stamp, Trash2, Undo2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { STAMPS } from '../engine/brushes';
import type { DrawingDoc } from '../engine/drawingDoc';
import type { FillPattern, Tool } from '../engine/types';
import { sfx } from '../lib/sfx';
import { Confirm } from './ui';

export const BASE_COLORS = [
  '#2f2f36', '#ff4d4d', '#ff8a3d', '#ffc531', '#fff27a', '#7ed957', '#22b566', '#3ec6e0',
  '#2f7bff', '#7c3cff', '#c77dff', '#ff7eb6', '#ffc2d4', '#a0522d', '#f6c9a0', '#ffffff',
];

type Icon = typeof Pencil;
const TOOL_INFO: Record<Tool, { label: string; Icon: Icon }> = {
  pencil: { label: 'Kurşun kalem', Icon: Pencil },
  crayon: { label: 'Pastel boya', Icon: PencilLine },
  marker: { label: 'Keçeli kalem', Icon: Highlighter },
  brush: { label: 'Fırça', Icon: Brush },
  watercolor: { label: 'Sulu boya', Icon: Droplets },
  rainbow: { label: 'Gökkuşağı', Icon: Rainbow },
  glitter: { label: 'Simli kalem', Icon: Sparkles },
  fill: { label: 'Boya kovası', Icon: PaintBucket },
  stamp: { label: 'Damga', Icon: Stamp },
  eraser: { label: 'Silgi', Icon: Eraser },
};

const GROUPS: { id: string; label: string; tools: Tool[] }[] = [
  { id: 'pens', label: 'Kalemler', tools: ['pencil', 'crayon', 'marker'] },
  { id: 'brushes', label: 'Fırçalar', tools: ['brush', 'watercolor', 'rainbow', 'glitter'] },
  { id: 'fill', label: 'Boya kovası', tools: ['fill'] },
  { id: 'stamp', label: 'Damgalar', tools: ['stamp'] },
  { id: 'eraser', label: 'Silgi', tools: ['eraser'] },
];

export const PATTERNS: { id: FillPattern; label: string; css: string }[] = [
  { id: 'solid', label: 'Düz', css: 'var(--c)' },
  { id: 'dots', label: 'Puantiyeli', css: 'radial-gradient(circle, var(--c) 28%, var(--l) 30%) 0 0 / 12px 12px' },
  { id: 'stripes', label: 'Çizgili', css: 'repeating-linear-gradient(45deg, var(--c) 0 4px, var(--l) 4px 9px)' },
  { id: 'hearts', label: 'Kalpli', css: 'var(--l)' },
  { id: 'checks', label: 'Kareli', css: 'conic-gradient(var(--c) 25%, var(--l) 0 50%, var(--c) 0 75%, var(--l) 0) 0 0 / 14px 14px' },
];

/** Araç başına kalınlık seçenekleri (400'lük ders alanı biriminde; damgada boyut). */
export const SIZES: Record<Tool, number[]> = {
  pencil: [3, 5, 9],
  crayon: [5, 9, 15],
  marker: [8, 14, 22],
  brush: [10, 20, 34],
  watercolor: [14, 24, 38],
  rainbow: [6, 12, 20],
  glitter: [6, 10, 16],
  eraser: [14, 26, 44],
  fill: [0, 0, 0],
  stamp: [30, 48, 72],
};

export function useToolState(initial: { tool?: Tool; color?: string; sizeIdx?: number } = {}) {
  const [s, set] = useState({ tool: 'pencil' as Tool, color: '#2f2f36', sizeIdx: 1, pattern: 'solid' as FillPattern, stamp: STAMPS[0], ...initial });
  return {
    ...s,
    size: SIZES[s.tool][s.sizeIdx],
    setTool: (tool: Tool) => set((x) => ({ ...x, tool })),
    setColor: (color: string) => set((x) => ({ ...x, color, tool: x.tool === 'eraser' || x.tool === 'stamp' ? 'pencil' : x.tool })),
    setSizeIdx: (sizeIdx: number) => set((x) => ({ ...x, sizeIdx })),
    setPattern: (pattern: FillPattern) => set((x) => ({ ...x, pattern, tool: 'fill' })),
    setStamp: (stamp: string) => set((x) => ({ ...x, stamp, tool: 'stamp' })),
  };
}
export type ToolState = ReturnType<typeof useToolState>;

export function useDocState(doc: DrawingDoc) {
  const [, force] = useState(0);
  useEffect(() => doc.onChange(() => force((n) => n + 1)), [doc]);
  return { canUndo: doc.canUndo, canRedo: doc.canRedo };
}

const light = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (255 - v) * 0.72));
  return `rgb(${c.join(',')})`;
};

export function ToolCapsule({ doc, ts, tools = ['pencil', 'crayon', 'marker', 'brush', 'watercolor', 'rainbow', 'glitter', 'fill', 'stamp', 'eraser'], clear = true }: {
  doc: DrawingDoc; ts: ToolState; tools?: Tool[]; clear?: boolean;
}) {
  const { canUndo, canRedo } = useDocState(doc);
  const [ask, setAsk] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const groups = GROUPS.map((g) => ({ ...g, tools: g.tools.filter((t) => tools.includes(t)) })).filter((g) => g.tools.length);
  // Her grup en son seçilen aracını hatırlar.
  const [lastInGroup, setLastInGroup] = useState<Record<string, Tool>>({});

  const pick = (g: (typeof groups)[number]) => {
    sfx.tap();
    const active = g.tools.includes(ts.tool);
    const hasOptions = g.tools.length > 1 || g.id === 'fill' || g.id === 'stamp';
    if (active && hasOptions) return setOpen(open === g.id ? null : g.id);
    ts.setTool(lastInGroup[g.id] ?? g.tools[0]);
    setOpen(null);
  };

  return (
    <div className="capsule" role="toolbar" aria-label="Çizim araçları">
      {groups.map((g) => {
        const current = g.tools.includes(ts.tool) ? ts.tool : lastInGroup[g.id] ?? g.tools[0];
        const { Icon } = TOOL_INFO[current];
        const active = g.tools.includes(ts.tool);
        return (
          <div key={g.id} className="capsule__group">
            <button className={`capsule__btn ${active ? 'on' : ''}`} aria-label={active ? `${TOOL_INFO[current].label} (seçenekler)` : TOOL_INFO[current].label}
              aria-pressed={active} title={TOOL_INFO[current].label} onClick={() => pick(g)}>
              {g.id === 'stamp' && active ? <span className="capsule__emoji">{ts.stamp}</span> : <Icon size={24} strokeWidth={2.2} />}
              {(g.tools.length > 1 || g.id === 'fill' || g.id === 'stamp') && <span className="capsule__more" />}
            </button>
            {open === g.id && (
              <div className="flyout rise" role="menu" aria-label={g.label}>
                {g.tools.length > 1 &&
                  g.tools.map((t) => {
                    const { Icon: I, label } = TOOL_INFO[t];
                    return (
                      <button key={t} role="menuitemradio" aria-checked={ts.tool === t} className={`flyout__item ${ts.tool === t ? 'on' : ''}`}
                        onClick={() => { sfx.tap(); ts.setTool(t); setLastInGroup((m) => ({ ...m, [g.id]: t })); setOpen(null); }}>
                        <I size={22} />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                {g.id === 'fill' &&
                  PATTERNS.map((p) => (
                    <button key={p.id} role="menuitemradio" aria-checked={ts.pattern === p.id} className={`flyout__item ${ts.pattern === p.id ? 'on' : ''}`}
                      onClick={() => { sfx.tap(); ts.setPattern(p.id); setOpen(null); }}>
                      <span className="flyout__swatch" style={{ ['--c' as string]: ts.color, ['--l' as string]: light(ts.color), background: p.css }}>
                        {p.id === 'hearts' && <span style={{ color: ts.color }}>♥</span>}
                      </span>
                      <span>{p.label}</span>
                    </button>
                  ))}
                {g.id === 'stamp' && (
                  <div className="flyout__stamps">
                    {STAMPS.map((st) => (
                      <button key={st} className={`flyout__stamp ${ts.stamp === st ? 'on' : ''}`} aria-label={`Damga ${st}`}
                        onClick={() => { sfx.tap(); ts.setStamp(st); setOpen(null); }}>
                        {st}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
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
