/**
 * English Time: her gün aynı sırayla ilerleyen kısa rutin (çalışmalardaki "mikro rutin"):
 * merhaba + "How are you?" → 3 yeni kelime → hareket (Çizio Says) → dinle-bul (yeni + tekrar) →
 * hikaye ya da boyama (gün aşırı) → evde görev → hoşça kal. Toplam ~15 dakika.
 */
import { BookOpen, ChevronRight, Ear, Footprints, Hand, Home, Palette, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Mascot } from '../components/Mascot';
import { sfx } from '../lib/sfx';
import { dayKey } from '../lib/util';
import { useApp } from '../store/useApp';
import { FeelArt, WordArt } from './Art';
import { getStory, HELLO_FEELINGS, HOME_HUNTS, isLine, newWordsOfDay, pickByDay, reviewWords, show, showText, STORIES, topicOfDay, UI, wordLine, type Age, type EnglishData, type Word } from './data';
import { ChizioSays } from './games/ChizioSays';
import { ColorMe } from './games/ColorMe';
import { HomeHunt } from './games/HomeHunt';
import { ListenFind } from './games/ListenFind';
import { EndCard, merge, noResult, PlayFrame, type Result } from './kit';
import { StoryReader } from './Story';
import { say } from './voice';

/** Merhaba + "Bugün nasılsın?": çocuk duygusunu seçer, Çizio onu yansıtır. */
function Hello({ age, onDone }: { age: Age; onDone: () => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  useEffect(() => say([UI.hello, UI.howAreYou]), []);
  return (
    <div className="en-hello">
      <Mascot size={150} mood="cheer" className="en-wave" />
      {showText(age) && <p className="en-says__text">{UI.howAreYou}</p>}
      <div className="en-feelings">
        {HELLO_FEELINGS.map((h) => (
          <button key={h.f} className={`en-feel ${picked === h.f ? 'on' : ''}`} disabled={!!picked} aria-label={h.f}
            onClick={() => { setPicked(h.f); sfx.select(); say(h.reply, onDone); }}>
            <FeelArt f={h.f} />
            {showText(age) && <span>{h.f}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Yeni kelimeler: büyük resim, Çizio iki kez söyler, çocuk tekrar eder ("Say it with me!"). */
export function Flashcards({ words, age, onDone, onStep }: { words: Word[]; age: Age; onDone: (r: Result) => void; onStep?: (i: number, n: number) => void }) {
  const [i, setI] = useState(0);
  const [ready, setReady] = useState(false);
  const w = words[i];
  const play = (first = false) => {
    setReady(false);
    say([...(first && i === 0 ? [UI.newWords] : []), wordLine(w), isLine(w), UI.sayWithMe, wordLine(w)], () => setReady(true));
  };
  useEffect(() => {
    onStep?.(i, words.length);
    play(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);
  return (
    <div className="en-flash">
      <button key={w.id} className="en-flash__card rise" onClick={() => play()} aria-label="Tekrar dinle">
        <WordArt art={w.art} />
        {showText(age) && <b>{w.en}</b>}
      </button>
      <button className={`round-btn en-next ${ready ? 'is-ready' : ''}`} aria-label="Sonraki kelime"
        onClick={() => (i + 1 < words.length ? setI(i + 1) : onDone({ seen: words.map((x) => x.id), got: [] }))}>
        <ChevronRight size={34} strokeWidth={3} />
      </button>
    </div>
  );
}

export type StepKind = 'hello' | 'words' | 'move' | 'find' | 'story' | 'color' | 'home' | 'bye';
export const STEP_INFO: Record<StepKind, { title: string; Icon: typeof Hand; intro?: string }> = {
  hello: { title: 'Hello!', Icon: Hand },
  words: { title: 'New Words', Icon: Sparkles },
  move: { title: 'Çizio Says', Icon: Footprints, intro: UI.letsMove },
  find: { title: 'Listen & Find', Icon: Ear, intro: UI.letsPlay },
  story: { title: 'Story Time', Icon: BookOpen, intro: UI.storyTime },
  color: { title: 'Color Me', Icon: Palette, intro: UI.letsColor },
  home: { title: 'Home Mission', Icon: Home, intro: UI.mission },
  bye: { title: 'Bye-bye!', Icon: Hand },
};

/** Bugünün planı (aynı gün aynı plan). */
export function sessionPlan(e: EnglishData, day = dayKey()) {
  const topic = topicOfDay(e);
  const fresh = newWordsOfDay(e, topic);
  const review = reviewWords(e, 3, fresh.map((w) => w.id));
  const unread = STORIES.filter((s) => !e.stories.includes(s.id));
  const storyDay = pickByDay([true, false], day, 7);
  const story = storyDay ? (unread[0] ?? pickByDay(STORIES, day)) : null;
  const steps: StepKind[] = ['hello', 'words', 'move', 'find', story ? 'story' : 'color', 'home', 'bye'];
  return { topic, fresh, review, story, steps, home: HOME_HUNTS.indexOf(pickByDay(HOME_HUNTS, day, 3)) };
}

export function EnglishSession({ e, onClose }: { e: EnglishData & { age: Age }; onClose: () => void }) {
  const record = useApp((s) => s.recordEnglish);
  const plan = useMemo(() => sessionPlan(e), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [k, setK] = useState(0);
  const [intro, setIntro] = useState(false);
  const [acc, setAcc] = useState<Result>(noResult);
  const [stars, setStars] = useState<number | null>(null);
  const [sub, setSub] = useState<[number, number]>([0, 0]);
  const step = plan.steps[k];
  const age = e.age;

  const next = (r: Result = noResult) => {
    const all = merge(acc, r);
    setAcc(all);
    setSub([0, 0]);
    const n = k + 1;
    if (plan.steps[n] === 'bye') {
      const got = record({ ...all, session: true, story: plan.story?.id });
      setStars(got);
      sfx.fanfare();
      say(UI.bye);
    } else if (STEP_INFO[plan.steps[n]].intro) {
      setIntro(true);
      say(STEP_INFO[plan.steps[n]].intro!, () => setIntro(false));
    }
    setK(n);
  };

  const onStep = (i: number, n: number) => setSub([i, n]);
  const info = STEP_INFO[step];
  const findTargets = age === 'mini' ? plan.fresh : [...plan.fresh, ...plan.review.slice(0, 2)];

  let body: React.ReactNode;
  if (intro) {
    body = (
      <div className="en-intro rise" onClick={() => setIntro(false)}>
        <Mascot size={150} mood="cheer" className="float" />
        <h2 className="title-lg">{show(info.title)}</h2>
      </div>
    );
  } else {
    switch (step) {
      case 'hello': body = <Hello age={age} onDone={() => next()} />; break;
      case 'words': body = <Flashcards words={plan.fresh} age={age} onDone={next} onStep={onStep} />; break;
      case 'move': body = <ChizioSays age={age} count={age === 'mini' ? 3 : 4} onDone={next} onStep={onStep} />; break;
      case 'find': body = <ListenFind targets={findTargets} pool={[...plan.topic.words, ...plan.review]} age={age} onDone={next} onStep={onStep} />; break;
      case 'story': body = <StoryReader story={getStory(plan.story!.id)!} age={age} onDone={() => next()} onStep={onStep} />; break;
      case 'color': body = <ColorMe age={age} onDone={next} onStep={onStep} />; break;
      case 'home': body = <HomeHunt age={age} initial={plan.home} onDone={next} />; break;
      case 'bye':
        body = (
          <EndCard title="Great job today!" stars={stars ?? 0}>
            <div className="en-learned">
              {plan.fresh.map((w) => (
                <button key={w.id} className="en-chip" onClick={() => say(wordLine(w))}>
                  <WordArt art={w.art} />
                  <span>{w.en}</span>
                </button>
              ))}
            </div>
            <button className="pill pill--teal pill--big" onClick={onClose}>See you tomorrow!</button>
          </EndCard>
        );
        break;
    }
  }

  return (
    <PlayFrame title={<>English Time <small>· {show(info.title)}</small></>} step={k} total={plan.steps.length} onClose={onClose}
      tone={step === 'story' && plan.story?.bg === 'night' ? 'night' : 'sky'}
      footer={sub[1] > 1 && !intro && step !== 'bye' ? <span className="en-substep">{sub[0] + 1} / {sub[1]}</span> : undefined}>
      {body}
    </PlayFrame>
  );
}
