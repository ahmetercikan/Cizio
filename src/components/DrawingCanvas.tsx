/**
 * Çizim tuvali: parmak, fare ve kalem (basınç destekli) girişi.
 * - Kalem algılandığında avuç içi dokunuşlarını yok sayar (palm rejection).
 * - Birleştirilmiş olaylar (coalesced events) ile akıcı çizgi.
 * - Ekran çözünürlüğünde (DPR) keskin çizim.
 */
import { useEffect, useRef } from 'react';
import { DrawingDoc, paintStroke, RES } from '../engine/drawingDoc';
import type { FillPattern, StrokeAction, StrokeTool, Tool } from '../engine/types';
import { sfx } from '../lib/sfx';

export interface CanvasProps {
  doc: DrawingDoc;
  tool: Tool;
  color: string;
  size: number;
  step?: number;
  disabled?: boolean;
  palmRejection?: boolean;
  /** Boya kovası deseni. */
  pattern?: FillPattern;
  /** Damga aracında basılacak emoji. */
  stamp?: string;
  onStroke?: (a: StrokeAction) => void;
}

export function DrawingCanvas({ doc, tool, color, size, step, disabled, palmRejection = true, pattern = 'solid', stamp = '⭐', onStroke }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const live = useRef<StrokeAction | null>(null);
  const activePointer = useRef<number | null>(null);
  const penSeen = useRef(false);
  const frame = useRef(0);
  const props = useRef({ tool, color, size, step, disabled, palmRejection, pattern, stamp, onStroke });
  props.current = { tool, color, size, step, disabled, palmRejection, pattern, stamp, onStroke };

  const redraw = () => {
    frame.current = 0;
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, c.width, c.height);
    doc.compose(ctx);
    if (live.current) {
      ctx.save();
      ctx.scale(c.width / RES, c.height / RES);
      paintStroke(ctx, live.current);
      ctx.restore();
    }
  };
  const schedule = () => {
    if (!frame.current) frame.current = requestAnimationFrame(redraw);
  };

  // Tuval boyutunu ekran çözünürlüğüne uydur.
  useEffect(() => {
    const c = canvasRef.current!;
    const ro = new ResizeObserver(([e]) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      const px = Math.min(2048, Math.round(e.contentRect.width * dpr));
      if (px > 0 && c.width !== px) {
        c.width = px;
        c.height = px;
        redraw();
      }
    });
    ro.observe(c);
    const off = doc.onChange(schedule);
    return () => {
      ro.disconnect();
      off();
      cancelAnimationFrame(frame.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc]);

  const toLocal = (e: PointerEvent | React.PointerEvent): [number, number, number] => {
    const r = canvasRef.current!.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 400;
    const y = ((e.clientY - r.top) / r.height) * 400;
    const p = e.pointerType === 'pen' ? Math.max(0.05, e.pressure || 0.5) : 0.5;
    return [x, y, p];
  };

  const ignore = (e: React.PointerEvent) => {
    const p = props.current;
    if (p.disabled) return true;
    if (e.pointerType === 'pen') penSeen.current = true;
    if (p.palmRejection && penSeen.current && e.pointerType === 'touch') return true;
    return false;
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (ignore(e) || activePointer.current !== null) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const p = props.current;
    const pt = toLocal(e);
    if (p.tool === 'fill') {
      const before = doc.actions.length;
      doc.commit({ kind: 'fill', color: p.color, at: [pt[0], pt[1]], pattern: p.pattern });
      if (doc.actions.length > before) sfx.pop();
      return;
    }
    if (p.tool === 'stamp') {
      doc.commit({ kind: 'stamp', stamp: p.stamp, at: [pt[0], pt[1]], size: p.size, rot: Math.round((Math.random() - 0.5) * 30) });
      sfx.pop();
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    activePointer.current = e.pointerId;
    live.current = { kind: 'stroke', tool: p.tool as StrokeTool, color: p.color, size: p.size, points: [pt], step: p.step };
    schedule();
  };

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePointer.current !== e.pointerId || !live.current) return;
    const evs = e.nativeEvent.getCoalescedEvents?.() ?? [];
    const list = evs.length ? evs : [e.nativeEvent];
    for (const ev of list) live.current.points.push(toLocal(ev));
    schedule();
  };

  const onUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePointer.current !== e.pointerId) return;
    activePointer.current = null;
    const s = live.current;
    live.current = null;
    if (s) {
      doc.commit(s);
      props.current.onStroke?.(s);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="draw-canvas"
      style={{ cursor: disabled ? 'default' : tool === 'fill' ? 'cell' : 'crosshair' }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
}
