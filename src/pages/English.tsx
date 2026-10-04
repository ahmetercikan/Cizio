/** English Club sayfaları. */
import { BookOpen, Check, ChevronLeft, ChevronRight, Ear, Footprints, Gamepad2, Home, Palette, Search, Volume2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { Mascot } from '../components/Mascot';
import { Modal } from '../components/ui';
import { WordArt } from '../english/Art';
import {
  AGES, ALL_WORDS, getStory, getTopic, HOME_PHRASES, isLine, known, pickByDay, seen, show, showText, STORIES, TOPICS, UI, wordLine,
  type Age, type Word,
} from '../english/data';
import { ChizioSays } from '../english/games/ChizioSays';
import { ColorMe } from '../english/games/ColorMe';
import { HomeHunt } from '../english/games/HomeHunt';
import { ListenFind } from '../english/games/ListenFind';
import { TreasureHunt } from '../english/games/TreasureHunt';
import { EndCard, PlayFrame, shuffle, useEnglish, type Result } from '../english/kit';
import { EnglishSession, sessionPlan, STEP_INFO } from '../english/Session';
import { Scene, StoryReader } from '../english/Story';
import { say } from '../english/voice';
import { sfx } from '../lib/sfx';
import { addDays, dayKey, TR_DAYS, weekStart } from '../lib/util';
import { useApp, useProfile } from '../store/useApp';

// ------------------------------------------------------------------------------------------------
// Yaş seçimi
// ------------------------------------------------------------------------------------------------
function AgePicker({ value, onPick }: { value?: Age; onPick: (a: Age) => void }) {
  return (
    <div className="en-ages">
      {AGES.map((a, i) => (
        <button key={a.id} className={`en-age ${value === a.id ? 'on' : ''}`} onClick={() => onPick(a.id)}>
          <span className="en-age__badge">{['A', 'AB', 'ABC'][i]}</span>
          <b>{a.label}</b>
          <span className="en-age__years">{a.years}</span>
          <small>{a.note}</small>
        </button>
      ))}
    </div>
  );
}

function AgeGate() {
  const setAge = useApp((s) => s.setEnglishAge);
  useEffect(() => say(UI.welcome), []);
  return (
    <section className="en-gate rise">
      <Mascot size={130} mood="cheer" className="en-wave" />
      <div>
        <h1 className="title-xl">Welcome to the English Club!</h1>
        <p className="sub">İngilizceyi oynayarak, dinleyerek ve hareket ederek öğreneceğiz. Önce yaşını seç:</p>
        <AgePicker onPick={(a) => { sfx.pop(); setAge(a); }} />
      </div>
    </section>
  );
}

// ------------------------------------------------------------------------------------------------
// Ana sayfa: English Time
// ------------------------------------------------------------------------------------------------
export default function EnglishHome() {
  const profile = useProfile()!;
  const e = useEnglish();
  const nav = useNavigate();
  const setAge = useApp((s) => s.setEnglishAge);
  const [ageOpen, setAgeOpen] = useState(false);
  const plan = useMemo(() => sessionPlan(e), [e.words, e.stories]); // eslint-disable-line react-hooks/exhaustive-deps
  const today = dayKey();
  const doneToday = e.sessions.includes(today);
  const phrase = pickByDay(HOME_PHRASES, today, 11);
  const learned = ALL_WORDS.filter((w) => known(e, w.id)).length;
  const week = Array.from({ length: 7 }, (_, i) => dayKey(addDays(weekStart(), i)));

  if (!e.ageSet) return <AppShell><AgeGate /></AppShell>;

  return (
    <AppShell>
      <header className="page-head rise">
        <div>
          <p className="sub">English Club</p>
          <h1 className="title-xl">Hello, {profile.name}!</h1>
        </div>
        <button className="en-agechip" onClick={() => setAgeOpen(true)}>{AGES.find((a) => a.id === e.age)?.label} · {AGES.find((a) => a.id === e.age)?.years}</button>
      </header>

      <section className={`en-today rise ${doneToday ? 'is-done' : ''}`}>
        <div className="en-today__head">
          <Mascot size={110} mood={doneToday ? 'cheer' : 'happy'} className="float" />
          <div>
            <h2 className="title-lg">English Time</h2>
            <p className="sub">{doneToday ? 'Bugünkü İngilizce saatini tamamladın! Yarın yeni kelimeler var.' : 'Her gün 15 dakika: dinle, hareket et, oyna.'}</p>
          </div>
        </div>
        <div className="en-today__plan">
          {plan.steps.map((s) => {
            const { Icon, title } = STEP_INFO[s];
            return <span key={s} className="en-today__step" title={show(title)}><Icon size={20} strokeWidth={2.4} /><small>{show(title)}</small></span>;
          })}
        </div>
        <div className="en-today__words">
          <span className="en-today__topic" style={{ background: plan.topic.color }}>{plan.topic.en}</span>
          {plan.fresh.map((w) => <span key={w.id} className="en-today__word"><WordArt art={w.art} /></span>)}
        </div>
        <button className="pill pill--big en-today__go" onClick={() => { sfx.pop(); nav('/english/zaman'); }}>
          {doneToday ? 'Bir kez daha' : "Let's go!"} <ChevronRight size={26} strokeWidth={3} />
        </button>
      </section>

      <section className="en-stats rise">
        <div className="en-week" aria-label="Bu haftanın English Time günleri">
          {week.map((d, i) => (
            <span key={d} className={`en-week__day ${e.sessions.includes(d) ? 'done' : ''} ${d === today ? 'today' : ''}`}>
              <i>{e.sessions.includes(d) ? <Check size={16} strokeWidth={3.4} /> : null}</i>
              <small>{TR_DAYS[(i + 1) % 7]}</small>
            </span>
          ))}
        </div>
        <Link to="/english/kelimeler" className="en-stat"><b>{learned}</b><small>öğrendiğin kelime</small></Link>
        <Link to="/english/hikayeler" className="en-stat"><b>{e.stories.length}/{STORIES.length}</b><small>okunan hikaye</small></Link>
      </section>

      <section className="en-phrase rise">
        <div>
          <p className="en-phrase__label">Evde birlikte söyleyin · {phrase.when}</p>
          <p className="en-phrase__en">{phrase.en}</p>
          <p className="en-phrase__tr">{phrase.tr}</p>
        </div>
        <button className="round-btn round-btn--light" aria-label="Dinle" onClick={() => say(phrase.en)}><Volume2 size={26} /></button>
      </section>

      <section className="row-section">
        <h2 className="row-section__title"><Gamepad2 size={24} /> Oyunlar</h2>
        <GameCards />
      </section>

      {ageOpen && (
        <Modal onClose={() => setAgeOpen(false)}>
          <h2 className="title-lg">Kaç yaşındasın?</h2>
          <p className="sub">Oyunlar ve hikayeler yaşına göre ayarlanır.</p>
          <AgePicker value={e.age} onPick={(a) => { setAge(a); setAgeOpen(false); }} />
        </Modal>
      )}
    </AppShell>
  );
}

export function EnglishTime() {
  const e = useEnglish();
  const nav = useNavigate();
  return <EnglishSession e={e} onClose={() => nav('/english')} />;
}

// ------------------------------------------------------------------------------------------------
// Oyunlar
// ------------------------------------------------------------------------------------------------
const GAMES = [
  { id: 'says', title: 'Çizio Says', sub: 'Söyleneni bedeninle yap!', Icon: Footprints, art: { k: 'act', a: 'jump' } as const, tone: '#d4f3ee' },
  { id: 'find', title: 'Listen & Find', sub: 'Dinle, resmi bul', Icon: Ear, art: { k: 'lesson', id: 'kedi' } as const, tone: '#fff1c7' },
  { id: 'color', title: 'Color Me', sub: 'Söylenen renge boya', Icon: Palette, art: { k: 'color', c: '#9b6bff' } as const, tone: '#efe6ff' },
  { id: 'hunt', title: 'Treasure Hunt', sub: 'Renkli şekilleri yakala', Icon: Search, art: { k: 'shape', s: 'star', c: '#ffc83d' } as const, tone: '#ffe1d8' },
  { id: 'home', title: 'Home Hunt', sub: 'Evde bul, Çizio’ya göster', Icon: Home, art: { k: 'lesson', id: 'ayi' } as const, tone: '#dff3ff' },
];

function GameCards() {
  return (
    <div className="en-games">
      {GAMES.map((g) => (
        <Link key={g.id} to={`/english/oyna/${g.id}`} className="en-game" style={{ ['--tone' as string]: g.tone }} onClick={() => sfx.tap()}>
          <span className="en-game__art"><WordArt art={g.art} /></span>
          <b>{g.title}</b>
          <small>{g.sub}</small>
        </Link>
      ))}
    </div>
  );
}

export function EnglishGames() {
  return (
    <AppShell>
      <header className="page-head rise">
        <div>
          <p className="sub">English Club</p>
          <h1 className="title-xl">Games</h1>
        </div>
      </header>
      <GameCards />
    </AppShell>
  );
}

export function EnglishPlay() {
  const { game = 'find' } = useParams();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const e = useEnglish();
  const record = useApp((s) => s.recordEnglish);
  const [round, setRound] = useState(0);
  const [stars, setStars] = useState<number | null>(null);
  const [sub, setSub] = useState<[number, number]>([0, 0]);
  const info = GAMES.find((g) => g.id === game) ?? GAMES[1];
  const topic = getTopic(params.get('konu') ?? '');

  // Listen & Find: seçilen konu ya da görülmüş kelimeler (yoksa bugünün konusu)
  const findSet = useMemo(() => {
    const base = topic?.words ?? (ALL_WORDS.filter((w) => seen(e, w.id)).length >= 6 ? ALL_WORDS.filter((w) => seen(e, w.id)) : sessionPlan(e).topic.words);
    const targets = shuffle(base).slice(0, 5);
    return { targets, pool: base.length >= 6 ? base : [...base, ...ALL_WORDS.filter((w) => w.id.startsWith('colors.'))] };
  }, [round, topic?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const done = (r: Result) => {
    setStars(record({ ...r, game: true }));
    sfx.fanfare();
  };
  const again = () => { setStars(null); setRound(round + 1); };
  const close = () => nav(-1);
  const onStep = (i: number, n: number) => setSub([i, n]);

  let body: React.ReactNode;
  if (stars !== null) {
    body = (
      <EndCard title="Great job!" stars={stars}>
        <button className="pill pill--light" onClick={close}>Oyunlara dön</button>
        <button className="pill pill--teal pill--big" onClick={again}>Bir daha oyna</button>
      </EndCard>
    );
  } else {
    const k = `${game}-${round}`;
    switch (game) {
      case 'says': body = <ChizioSays key={k} age={e.age} count={6} onDone={done} onStep={onStep} />; break;
      case 'color': body = <ColorMe key={k} age={e.age} onDone={done} onStep={onStep} />; break;
      case 'hunt': body = <TreasureHunt key={k} age={e.age} onDone={done} onStep={onStep} />; break;
      case 'home': body = <HomeHunt key={k} age={e.age} onDone={done} />; break;
      default: body = <ListenFind key={k} targets={findSet.targets} pool={findSet.pool} age={e.age} onDone={done} onStep={onStep} />;
    }
  }
  return (
    <PlayFrame title={show(info.title)} step={stars === null ? sub[0] : undefined} total={stars === null ? sub[1] : undefined} onClose={close}>
      {body}
    </PlayFrame>
  );
}

// ------------------------------------------------------------------------------------------------
// Kelimeler
// ------------------------------------------------------------------------------------------------
export function EnglishWords() {
  const e = useEnglish();
  return (
    <AppShell>
      <header className="page-head rise">
        <div>
          <p className="sub">English Club</p>
          <h1 className="title-xl">Words</h1>
        </div>
      </header>
      <div className="en-topics">
        {TOPICS.map((t) => {
          const k = t.words.filter((w) => known(e, w.id)).length;
          return (
            <Link key={t.id} to={`/english/kelimeler/${t.id}`} className="en-topic" style={{ ['--tone' as string]: t.color }} onClick={() => sfx.tap()}>
              <span className="en-topic__art"><WordArt art={t.words[0].art} /></span>
              <b>{t.en}</b>
              <small>{t.tr}</small>
              <span className="en-topic__bar"><i style={{ width: `${(k / t.words.length) * 100}%` }} /></span>
              <small className="en-topic__count">{k} / {t.words.length}</small>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}

function WordModal({ words, start, age, onClose }: { words: Word[]; start: number; age: Age; onClose: () => void }) {
  const [i, setI] = useState(start);
  const record = useApp((s) => s.recordEnglish);
  const w = words[i];
  useEffect(() => {
    say([wordLine(w), isLine(w)]);
    record({ seen: [w.id] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);
  return (
    <Modal onClose={onClose} className="en-wordmodal">
      <button key={w.id} className="en-flash__card rise" onClick={() => say([wordLine(w), isLine(w)])} aria-label="Tekrar dinle">
        <WordArt art={w.art} />
        {showText(age) && <b>{w.en}</b>}
      </button>
      <div className="en-wordmodal__nav">
        <button className="round-btn round-btn--light" aria-label="Önceki" disabled={i === 0} onClick={() => setI(i - 1)}><ChevronLeft size={30} /></button>
        <button className="pill pill--light" onClick={onClose}>Kapat</button>
        <button className="round-btn round-btn--light" aria-label="Sonraki" disabled={i === words.length - 1} onClick={() => setI(i + 1)}><ChevronRight size={30} /></button>
      </div>
    </Modal>
  );
}

export function EnglishTopic() {
  const { id = '' } = useParams();
  const t = getTopic(id);
  const e = useEnglish();
  const [open, setOpen] = useState<number | null>(null);
  if (!t) return <AppShell><Link to="/english/kelimeler">Kelimeler</Link></AppShell>;
  return (
    <AppShell>
      <header className="page-head rise">
        <div>
          <p className="sub"><Link to="/english/kelimeler">Words</Link> · {t.tr}</p>
          <h1 className="title-xl">{t.en}</h1>
        </div>
        <Link to={`/english/oyna/find?konu=${t.id}`} className="pill pill--teal"><Ear size={22} /> Listen & Find</Link>
      </header>
      <div className="en-wordgrid">
        {t.words.map((w, i) => (
          <button key={w.id} className={`en-card ${known(e, w.id) ? 'is-known' : ''}`} onClick={() => { sfx.tap(); setOpen(i); }}>
            <WordArt art={w.art} />
            {showText(e.age) && <span className="en-card__word">{w.en}</span>}
            {known(e, w.id) && <span className="en-card__badge" aria-label="Biliyorsun"><Check size={16} strokeWidth={3.4} /></span>}
          </button>
        ))}
      </div>
      {open !== null && <WordModal words={t.words} start={open} age={e.age} onClose={() => setOpen(null)} />}
    </AppShell>
  );
}

// ------------------------------------------------------------------------------------------------
// Hikayeler
// ------------------------------------------------------------------------------------------------
export function EnglishStories() {
  const e = useEnglish();
  return (
    <AppShell>
      <header className="page-head rise">
        <div>
          <p className="sub">English Club</p>
          <h1 className="title-xl">Stories</h1>
        </div>
      </header>
      <div className="en-stories">
        {STORIES.map((s) => (
          <Link key={s.id} to={`/english/hikaye/${s.id}`} className="en-storycard" onClick={() => sfx.tap()}>
            <span className="en-storycard__cover"><Scene bg={s.bg} items={s.cover} /></span>
            <span className="en-storycard__text">
              <b>{show(s.title)}</b>
              <small>{s.tr}</small>
            </span>
            {e.stories.includes(s.id) && <span className="en-storycard__read"><BookOpen size={16} /> Okundu</span>}
          </Link>
        ))}
      </div>
    </AppShell>
  );
}

export function EnglishStoryPage() {
  const { id = '' } = useParams();
  const story = getStory(id);
  const nav = useNavigate();
  const e = useEnglish();
  const record = useApp((s) => s.recordEnglish);
  const [stars, setStars] = useState<number | null>(null);
  const [sub, setSub] = useState<[number, number]>([0, 0]);
  const [round, setRound] = useState(0);
  if (!story) return null;
  return (
    <PlayFrame title={show(story.title)} step={stars === null ? sub[0] : undefined} total={stars === null ? sub[1] : undefined}
      onClose={() => nav('/english/hikayeler')} tone={story.bg === 'night' ? 'night' : 'sky'}>
      {stars === null ? (
        <StoryReader key={round} story={story} age={e.age} onStep={(i, n) => setSub([i, n])}
          onDone={() => { setStars(record({ story: story.id, game: true })); sfx.fanfare(); say('The end.'); }} />
      ) : (
        <EndCard title="The end!" stars={stars}>
          <button className="pill pill--light" onClick={() => { setStars(null); setRound(round + 1); }}>Bir daha oku</button>
          <button className="pill pill--teal pill--big" onClick={() => nav('/english/hikayeler')}>Diğer hikayeler</button>
        </EndCard>
      )}
    </PlayFrame>
  );
}
