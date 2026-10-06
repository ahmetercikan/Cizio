/** Atölye: serbest çizim ve boyama kitabı. Çizim oturum boyunca korunur. */
import { ArrowLeft, BookOpen, FilePlus2, Save } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DrawingCanvas } from '../components/DrawingCanvas';
import { PencilPalette, ToolCapsule, useDocState, useToolState } from '../components/DrawTools';
import { SketchImg } from '../components/Sketch';
import { Confirm, Modal, useSize, useToast } from '../components/ui';
import { DrawingDoc } from '../engine/drawingDoc';
import { samplePath } from '../engine/pathSampler';
import type { StrokeAction } from '../engine/types';
import { lessons, paths } from '../lessons';
import type { Lesson } from '../lessons/types';
import { saveArtwork } from '../lib/gallery';
import { sfx } from '../lib/sfx';
import { uid } from '../lib/util';
import { getSticker } from '../stickers';
import { useApp, useProfile } from '../store/useApp';

let sessionDoc: DrawingDoc | null = null;

/** Ders çizimini boyama sayfasına çevirir: şekiller koyu kontur olur, boya kovası içlerini doldurur. */
export function coloringPage(lesson: Lesson): StrokeAction[] {
  return lesson.steps
    .flatMap((s) => s.shapes)
    .filter((s) => !s.guide)
    .map((s) => ({
      kind: 'stroke' as const,
      tool: 'marker' as const,
      color: '#2f2f36',
      size: 4,
      points: samplePath(s.d, 2).points.map(([x, y]) => [x, y, 0.5] as [number, number, number]),
    }));
}

export default function FreeDraw() {
  const nav = useNavigate();
  const profile = useProfile()!;
  const settings = useApp((s) => s.settings);
  const recordDrawing = useApp((s) => s.recordDrawing);
  const doc = useMemo(() => (sessionDoc ??= new DrawingDoc()), []);
  useDocState(doc);
  const ts = useToolState({ tool: 'marker', color: '#7c3cff' });
  const [wrapRef, box] = useSize<HTMLDivElement>();
  const [book, setBook] = useState(false);
  const [confirmNew, setConfirmNew] = useState<null | (() => void)>(null);
  const [toast, showToast] = useToast();
  const [saved, setSaved] = useState(false);

  const S = Math.floor(Math.min(box.w, box.h) * 0.94);

  const save = async () => {
    if (doc.isEmpty()) return showToast('Önce bir şeyler çiz!');
    await saveArtwork({ id: uid(), profileId: profile.id, kind: 'free', createdAt: Date.now(), blob: await doc.toBlob() });
    const earned = recordDrawing('free');
    sfx.success();
    setSaved(true);
    const st = earned.map(getSticker).find(Boolean);
    showToast(st ? `Galerine eklendi! Yeni çıkartma: ${st.emoji} ${st.title}` : 'Galerine eklendi!');
  };

  const guardNew = (then: () => void) => (doc.isEmpty() || saved ? then() : setConfirmNew(() => then));

  const startColoring = (l: Lesson) => {
    setBook(false);
    guardNew(() => {
      doc.setActions(coloringPage(l));
      setSaved(false);
      ts.setTool('fill');
      ts.setColor(l.palette?.[0] ?? '#ffc531');
    });
  };

  return (
    <div className={`player desk player--tools player--palette ${settings.leftHanded ? 'player--left' : ''}`}>
      <header className="player__top">
        <button className="round-btn round-btn--light" aria-label="Geri" onClick={() => nav('/atolye')}>
          <ArrowLeft size={26} strokeWidth={2.6} />
        </button>
        <div className="player__title"><b>Atölye</b></div>
        <button className="pill pill--light pill--sm" aria-label="Boyama kitabı" onClick={() => setBook(true)}><BookOpen size={20} /> <span className="hide-sm">Boyama kitabı</span></button>
      </header>

      <div className="player__wrap" ref={wrapRef}>
        {S > 0 && (
          <div className="sheet" style={{ width: S, height: S }}>
            <div className="stage" style={{ width: S * 0.96, height: S * 0.96 }}>
              <DrawingCanvas doc={doc} tool={ts.tool} color={ts.color} size={ts.size} pattern={ts.pattern} stamp={ts.stamp} palmRejection={settings.palmRejection} onStroke={() => setSaved(false)} />
            </div>
          </div>
        )}
      </div>

      <div className="tools-float"><ToolCapsule doc={doc} ts={ts} /></div>
      <div className="palette-float"><PencilPalette ts={ts} /></div>
      <footer className="player__bottom player__bottom--end">
        <button className="round-btn round-btn--light" aria-label="Yeni sayfa" onClick={() => guardNew(() => { doc.clear(); setSaved(false); })}><FilePlus2 size={24} /></button>
        <button className="pill pill--yellow" onClick={save}><Save size={22} /> Kaydet</button>
      </footer>

      {book && (
        <Modal onClose={() => setBook(false)} className="modal--wide">
          <h2 className="title-lg" style={{ marginBottom: 14 }}>Boyama kitabı</h2>
          {paths.map((p) => {
            const ls = lessons.filter((l) => l.path === p.id);
            return ls.length ? (
              <div key={p.id} style={{ marginBottom: 16 }}>
                <p className="book-title">{p.title}</p>
                <div className="book-grid">
                  {ls.map((l) => (
                    <button key={l.id} className="book-item" onClick={() => startColoring(l)} aria-label={l.title}>
                      <SketchImg lesson={l} paper pad={20} />
                    </button>
                  ))}
                </div>
              </div>
            ) : null;
          })}
        </Modal>
      )}
      {confirmNew && (
        <Confirm title="Yeni sayfa açalım mı?" text="Kaydetmediğin çizim silinecek." yes="Yeni sayfa" onNo={() => setConfirmNew(null)}
          onYes={() => { const f = confirmNew; setConfirmNew(null); f(); }} />
      )}
      {toast}
    </div>
  );
}
