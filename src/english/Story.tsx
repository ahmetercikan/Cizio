/**
 * Hikaye okuyucu: sahneler ders çizimlerinden kurulur. Sayfalar tekrarlı kalıplarla ilerler ve bazı sayfalarda
 * çocuğa soru sorulur (soru sorarak okuma): "Where is the owl?" → dokun, "Who is hiding?" → aç, "How many?"
 * → say, "What color is the sun?" → boya. Yanlış cevapta "Let's try again!" — puan yok.
 */
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Mascot } from '../components/Mascot';
import { sfx } from '../lib/sfx';
import { lessonCut, WordArt } from './Art';
import { COLORS, show, showText, TRY_AGAIN, type Age, type SceneItem, type Story, type StoryPage } from './data';
import { say } from './voice';

const BG: Record<StoryPage['bg'], { sky: string; ground: string }> = {
  day: { sky: '#dff3ff', ground: '#bfe7a8' },
  sky: { sky: '#cfe9ff', ground: '#cfe9ff' },
  sea: { sky: '#bfe3ff', ground: '#f3dfa8' },
  night: { sky: '#26325e', ground: '#3d4f7a' },
};

function Item({ it, painted, revealed, onTap, wobble }: { it: SceneItem; painted?: boolean; revealed?: boolean; onTap?: () => void; wobble?: boolean }) {
  const half = it.s / 2;
  const dx = it.hidden && revealed ? (it.x < 560 ? 300 : -300) : 0;
  const style = { ['--dx' as string]: `${-dx}px` } as React.CSSProperties;
  if (it.lesson === 'mascot') {
    return (
      <g transform={`translate(${it.x - half} ${it.y - half * 1.2})`} className={onTap ? 'en-tap' : undefined} onClick={onTap}>
        <Mascot size={it.s} mood="cheer" outfit="none" />
      </g>
    );
  }
  const { shapes, box } = lessonCut(it.lesson, it.parts);
  const bare = it.bare && !painted;
  return (
    <g transform={`translate(${it.x - half + dx} ${it.y - half})`}>
      <g className={`${revealed ? 'en-peek' : ''} ${wobble ? 'is-wobble' : ''} ${onTap ? 'en-tap' : ''} ${it.asleep ? 'en-asleep' : ''}`} style={style} onClick={onTap}>
        <svg width={it.s} height={it.s} viewBox={box} overflow="visible">
          {shapes.map((s, k) => (
            <path key={k} d={s.d} fill={s.fill ? (bare ? '#fff' : s.fill) : 'none'} stroke="#3a2b27" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
          ))}
        </svg>
        {it.asleep && (
          <g fontFamily="Fredoka, sans-serif" fontWeight="700" fill="#cfe0ff">
            <text x={it.s * 0.78} y={it.s * 0.12} fontSize={it.s * 0.16} className="en-z">z</text>
            <text x={it.s * 0.92} y={-it.s * 0.02} fontSize={it.s * 0.12} className="en-z en-z--2">z</text>
          </g>
        )}
      </g>
    </g>
  );
}

/** Sahne (kapak resmi ve sayfalar için). */
export function Scene({ bg, items, state, onTap, wobble }: {
  bg: StoryPage['bg']; items: SceneItem[]; state?: { painted: boolean; revealed: boolean }; onTap?: (it: SceneItem) => void; wobble?: string | null;
}) {
  const c = BG[bg];
  // Açılan saklı öğe en üstte çizilir.
  const ordered = state?.revealed ? [...items.filter((x) => !x.hidden), ...items.filter((x) => x.hidden)] : items;
  return (
    <svg className="en-scene" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet">
      <rect width="1000" height="600" fill={c.sky} />
      {bg === 'night' && [80, 260, 470, 690, 900, 380, 600].map((x, i) => <circle key={i} cx={x} cy={40 + ((i * 53) % 150)} r={i % 2 ? 3 : 5} fill="#fff6c7" />)}
      {bg === 'night' && <path d="M880,110 a52,52 0 1,1 -48,-72 a40,40 0 1,0 48,72 Z" fill="#fff1a8" stroke="#3a2b27" strokeWidth="5" />}
      {bg !== 'sky' && <path d={`M0,${bg === 'sea' ? 470 : 450} Q250,${bg === 'sea' ? 440 : 420} 500,450 T1000,440 V600 H0 Z`} fill={c.ground} />}
      {bg === 'sea' && <path d="M0,410 q40,-18 80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0" fill="none" stroke="#7fb8f0" strokeWidth="8" strokeLinecap="round" />}
      {ordered.map((it, k) => (
        <Item key={`${it.lesson}-${it.id ?? k}`} it={it} painted={state?.painted} revealed={state?.revealed && it.hidden} wobble={!!wobble && wobble === it.id}
          onTap={onTap && (it.id || it.lesson === 'mascot') ? () => onTap(it) : undefined} />
      ))}
    </svg>
  );
}

export function StoryReader({ story, age, onDone, onStep }: { story: Story; age: Age; onDone: () => void; onStep?: (i: number, n: number) => void }) {
  const [p, setP] = useState(0);
  const page = story.pages[p];
  const [solved, setSolved] = useState(false);
  const [state, setState] = useState({ painted: false, revealed: false });
  const [wobble, setWobble] = useState<string | null>(null);
  const act = page.act;
  const lines = useMemo(() => [...page.say, ...(act ? [act.ask] : [])], [page, act]);

  useEffect(() => {
    onStep?.(p, story.pages.length);
    setSolved(!act);
    setState({ painted: false, revealed: false });
    say(lines);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p]);

  const win = (extra?: Partial<typeof state>) => {
    setSolved(true);
    if (extra) setState((s) => ({ ...s, ...extra }));
    sfx.success();
    say(act!.yes);
  };
  const miss = (id?: string) => {
    sfx.soft();
    if (id) {
      setWobble(id);
      window.setTimeout(() => setWobble(null), 600);
    }
    say([TRY_AGAIN, act!.ask]);
  };

  const tapItem = (it: SceneItem) => {
    if (!act || solved) return;
    if (act.kind === 'tap') return it.id === act.target ? win() : miss(it.id);
    if (act.kind === 'reveal') return it.id === act.cover ? win({ revealed: true }) : miss(it.id);
  };

  const last = p === story.pages.length - 1;
  return (
    <div className="en-story">
      <div className="en-story__stage">
        <Scene bg={page.bg} items={page.items} state={state} onTap={tapItem} wobble={wobble} />
        {act?.kind === 'choose' && (
          <div className="en-story__choices">
            {act.options.map((n) => (
              <button key={n} className={`en-num ${solved && n === act.answer ? 'is-right' : ''}`} disabled={solved}
                onClick={() => (n === act.answer ? win() : miss())}>
                <WordArt art={{ k: 'num', n }} />
                <b>{n}</b>
              </button>
            ))}
          </div>
        )}
        {act?.kind === 'paint' && (
          <div className="en-story__choices">
            {act.options.map((c) => (
              <button key={c} className={`en-paint-pot ${solved && c === act.answer ? 'is-right' : ''}`} disabled={solved} style={{ ['--c' as string]: COLORS[c] }}
                onClick={() => { say(c.charAt(0).toUpperCase() + c.slice(1) + '.'); if (c === act.answer) win({ painted: true }); else window.setTimeout(() => miss(), 900); }}>
                <i />
                {showText(age) && <span>{c}</span>}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="en-story__text" onClick={() => say(lines)}>
        {showText(age) ? (
          <>
            {page.say.map((t, k) => <p key={k}>{show(t)}</p>)}
            {act && <p className="en-story__ask">{show(solved ? act.yes : act.ask)}</p>}
          </>
        ) : <p className="en-story__listen">Dinle ve dokun</p>}
      </div>
      <div className="en-story__nav">
        <button className="round-btn round-btn--light" aria-label="Önceki sayfa" disabled={p === 0} onClick={() => setP(p - 1)}><ChevronLeft size={30} /></button>
        <button className={`round-btn en-next ${solved ? 'is-ready' : ''}`} aria-label={last ? 'Hikayeyi bitir' : 'Sonraki sayfa'} disabled={!solved}
          onClick={() => (last ? onDone() : setP(p + 1))}>
          <ChevronRight size={34} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
