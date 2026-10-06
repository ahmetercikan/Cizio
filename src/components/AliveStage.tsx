/**
 * "Çizimin canlandı!": çocuğun çizimi kendi sahnesinde hareket eder (gözler kırpar, tekerlekler döner,
 * kuyruk sallanır; balık yüzer, roket uçar, kamyon yolda gider).
 */
import { Gamepad2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ALIVE_LINE } from '../art/lines';
import { facingOf, motionOf } from '../art/motion';
import { drawRig, rigOf, type Rig } from '../art/rig';
import { bodyPose, drawFlame, drawPuffs, drawScene, drawWaves } from '../art/scene';
import type { DrawAction } from '../engine/types';
import { getLesson } from '../lessons';
import { sfx } from '../lib/sfx';
import { speak } from '../lib/speech';
import { useApp } from '../store/useApp';
import { Mascot } from './Mascot';

export function AliveStage({ art, onClose, onPlay }: {
  art: { blob: Blob; actions?: DrawAction[]; lessonId?: string };
  onClose: () => void;
  onPlay?: () => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [rig, setRig] = useState<Rig | null>(null);
  const settings = useApp((s) => s.settings);
  const lesson = art.lessonId ? getLesson(art.lessonId) : undefined;

  // İskelet (ağır iş): bir kare sonra kurulur, böylece önce yükleniyor ekranı görünür
  useEffect(() => {
    let alive = true;
    const id = setTimeout(() => {
      void rigOf(art, lesson).then((r) => {
        if (!alive) return;
        setRig(r);
        sfx.success();
        if (settings.narration) speak(ALIVE_LINE, { rate: settings.rate });
      });
    }, 60);
    return () => {
      alive = false;
      clearTimeout(id);
    };
  }, [art]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!rig) return;
    const cv = ref.current!;
    const ctx = cv.getContext('2d')!;
    const { body, scene } = motionOf(lesson);
    const facing = facingOf(lesson);
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const t0 = performance.now();
    const frame = (now: number) => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = cv.clientWidth, h = cv.clientHeight;
      if (cv.width !== Math.round(w * dpr)) [cv.width, cv.height] = [Math.round(w * dpr), Math.round(h * dpr)];
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const t = reduce ? 0 : (now - t0) / 1000;
      const size = Math.min(w * 0.62, h * 0.5);
      const scroll = body === 'drive' ? t * 160 * facing : body === 'fly' || body === 'swim' ? t * 30 : 0;
      drawScene(ctx, scene, w, h, t, scroll);
      const p = bodyPose(body, t, w, h, size, facing);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(p.sx, p.sy);
      if (body === 'rocket') drawFlame(ctx, 0, size * 0.4, size, t);
      if (body === 'drive') drawPuffs(ctx, -facing * size * 0.5, size * 0.3, size, t, facing);
      drawRig(ctx, rig, t, 0, 0, size, { flip: p.flip, spin: p.spin });
      ctx.restore();
      if (body === 'boat') drawWaves(ctx, w, h, t, h * 0.62);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [rig, lesson]);

  return (
    <div className="alive" role="dialog" aria-label="Canlanan çizim">
      <canvas ref={ref} className="alive__canvas" />
      {!rig && (
        <div className="alive__wait">
          <Mascot size={110} mood="think" />
          <b>Resmin canlanıyor…</b>
        </div>
      )}
      <button className="round-btn round-btn--light alive__close" aria-label="Kapat" onClick={onClose}><X size={26} strokeWidth={2.6} /></button>
      {rig && (
        <div className="alive__bar rise">
          <span className="alive__title">{lesson ? `${lesson.title} canlandı!` : 'Resmin canlandı!'}</span>
          {onPlay && <button className="pill" onClick={onPlay}><Gamepad2 size={22} /> Çizdiğinle oyna</button>}
        </div>
      )}
    </div>
  );
}
