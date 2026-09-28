/**
 * Karşılama akışı:
 * açılış → yanında yetişkin var mı → ebeveyn izni → avatar → isim → 3 tur "hangisini daha çok seviyorsun?"
 * → vitrin → "Hadi başlayalım" (ilk ders).
 * Zaten bir profil varsa (kardeş ekleme) yetişkin/izin adımları atlanır.
 */
import { ArrowRight, Check, Play, ShieldCheck, Smartphone, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdultIllustration, AvatarArt, AVATARS } from '../components/Avatars';
import { FlowLine } from '../components/FlowLine';
import { SketchImg } from '../components/Sketch';
import { getLesson, lessons, lessonsByPath } from '../lessons';
import type { Lesson, PathId } from '../lessons/types';
import { sfx } from '../lib/sfx';
import { speak, unlockAudio } from '../lib/speech';
import { useApp } from '../store/useApp';
import { PREF_ROUNDS } from '../voice/lines';

type Step = 'splash' | 'adult' | 'adultTip' | 'permission' | 'avatar' | 'name' | 'pref' | 'showcase' | 'start';

const ROUNDS: [string, string][] = [
  ['tavsan', 'cicek'],
  ['dondurma', 'peri'],
  ['kedi', 'robot'],
];

const LINES: Partial<Record<Step, string>> = {
  splash: 'Merhaba! Ben Kalemo. Seninle adım adım harika resimler çizeceğiz!',
  adult: 'Yanında bir yetişkin var mı?',
  adultTip: 'Başlamak için yanında bir yetişkin olması daha iyi.',
  avatar: 'Avatarını seç!',
  name: 'Adın ne?',
  pref: PREF_ROUNDS[0].text,
  showcase: 'Çiziktir ile en sevdiğin şeyleri çizebileceksin!',
  start: 'Hadi başlayalım!',
};

export default function Onboarding() {
  const nav = useNavigate();
  const addProfile = useApp((s) => s.addProfile);
  const hasProfiles = useApp((s) => s.profiles.length > 0);
  const settings = useApp((s) => s.settings);
  const [step, setStep] = useState<Step>('splash');
  const [adult, setAdult] = useState<boolean | null>(null);
  const [permission, setPermission] = useState<'ask' | 'denied'>('ask');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [round, setRound] = useState(0);
  const [picks, setPicks] = useState<string[]>([]);
  const [picked, setPicked] = useState<string | null>(null);

  const say = (t?: string) => t && settings.narration && speak(t, { rate: settings.rate, voiceURI: settings.voiceURI });

  useEffect(() => {
    if (step !== 'splash') say(LINES[step]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const go = (s: Step) => {
    sfx.pop();
    setStep(s);
  };

  const favorite: PathId = useMemo(() => {
    const votes = new Map<PathId, number>();
    for (const id of picks) {
      const l = getLesson(id);
      if (l) votes.set(l.path, (votes.get(l.path) ?? 0) + 1);
    }
    let best: PathId = 'hayvanlar', n = 0;
    for (const [p, c] of votes) if (c > n) [best, n] = [p, c];
    return best;
  }, [picks]);

  const showcase = useMemo(() => {
    const fav = lessonsByPath(favorite);
    const others = lessons.filter((l) => l.path !== favorite && l.level >= 2);
    return [...fav, ...others].slice(0, 10);
  }, [favorite]);

  const pick = (id: string) => {
    if (picked) return;
    sfx.pop();
    setPicked(id);
    setTimeout(() => {
      setPicks((p) => [...p, id]);
      setPicked(null);
      if (round < ROUNDS.length - 1) {
        setRound(round + 1);
        // Her tur farklı bir cümle ve tonla sorulur (aynı soruyu aynı sesle tekrar etmesin).
        say(PREF_ROUNDS[Math.min(round + 1, PREF_ROUNDS.length - 1)].text);
      } else setStep('showcase');
    }, 450);
  };

  const finish = () => {
    sfx.success();
    addProfile({ name: name.trim(), avatar: avatar ?? 'kedi', favoritePath: favorite });
    const first = lessonsByPath(favorite)[0] ?? lessons[0];
    nav(`/ders/${first.id}`, { replace: true });
  };

  const variant = { splash: 0, adult: 1, adultTip: 1, permission: 1, avatar: 2, name: 2, pref: 0, showcase: 3, start: 0 }[step];

  return (
    <div className="bg onb">
      <FlowLine variant={variant} />

      {step === 'splash' && (
        <div className="onb__center rise">
          <SplashArt />
          <h1 className="title-xl">Çiziktir</h1>
          <p className="sub onb__lead">Adım adım çizmeyi öğren. Kâğıtta ya da ekranda!</p>
          <button
            className="pill"
            onClick={() => {
              unlockAudio();
              say(LINES.splash);
              go(hasProfiles ? 'avatar' : 'adult');
            }}
          >
            Başla <ArrowRight size={22} />
          </button>
        </div>
      )}

      {step === 'adult' && (
        <Screen title="Yanında bir yetişkin var mı?" sub="Yanında bir yetişkin olması daha iyi"
          action={<button className="pill" disabled={adult === null} onClick={() => go(adult ? 'permission' : 'adultTip')}>Devam</button>}>
          <div className="choice-pair">
            {[false, true].map((v) => (
              <button key={String(v)} className={`choice choice--illus ${adult === v ? 'on' : ''}`} onClick={() => { sfx.tap(); setAdult(v); }}>
                <AdultIllustration withAdult={v} />
                <span className="choice__label">{v ? 'Evet' : 'Hayır'}</span>
              </button>
            ))}
          </div>
        </Screen>
      )}

      {step === 'adultTip' && (
        <Screen title="Başlamak için yanında bir yetişkin olması daha iyi" action={<button className="pill" onClick={() => go('permission')}>Devam</button>}>
          <div className="illus-big">
            <AdultIllustration withAdult />
          </div>
        </Screen>
      )}

      {step === 'permission' && (
        <div className="onb__center">
          <div className="permission rise">
            <div className="permission__body">
              {permission === 'ask' ? (
                <>
                  <h2 className="title-lg">Yetişkin izniniz var mı?</h2>
                  <p className="permission__text">
                    Çiziktir'i kullanmak için bir yetişkinin izni gerekir. Çizimler ve fotoğraflar yalnızca bu cihazda saklanır.
                  </p>
                  <button className="btn-dark" onClick={() => go('avatar')}>
                    <Check size={22} /> Evet
                  </button>
                  <button className="link-btn" style={{ color: 'var(--ink)' }} onClick={() => setPermission('denied')}>Hayır</button>
                </>
              ) : (
                <>
                  <h2 className="title-lg">Bir yetişkini çağır!</h2>
                  <p className="permission__text">Bir yetişkin yanına gelince birlikte başlayabilirsiniz.</p>
                  <button className="btn-dark" onClick={() => setPermission('ask')}>Tekrar dene</button>
                </>
              )}
            </div>
            <div className="permission__badges">
              <span className="pbadge pbadge--green"><ShieldCheck size={30} />Çocuk dostu</span>
              <span className="pbadge pbadge--blue"><Sparkles size={30} />Reklamsız</span>
              <span className="pbadge pbadge--yellow"><Smartphone size={30} />Veriler cihazda</span>
            </div>
          </div>
        </div>
      )}

      {step === 'avatar' && (
        <Screen title="Avatarını seç" action={<button className="pill" disabled={!avatar} onClick={() => go('name')}>Devam</button>}>
          <div className="avatar-grid">
            {AVATARS.map((a) => (
              <button key={a.id} className={`avatar-pick ${avatar === a.id ? 'on' : ''}`} aria-label={a.label} onClick={() => { sfx.tap(); setAvatar(a.id); }}>
                <AvatarArt id={a.id} size={132} />
              </button>
            ))}
          </div>
        </Screen>
      )}

      {step === 'name' && (
        <Screen title="Adın ne?" action={<button className="pill" disabled={!name.trim()} onClick={() => go('pref')}>Devam</button>}>
          <div className="name-step">
            {avatar && <AvatarArt id={avatar} size={140} ring />}
            <input
              className="name-input"
              value={name}
              maxLength={20}
              placeholder="Adını yaz"
              autoFocus
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && name.trim() && go('pref')}
            />
          </div>
        </Screen>
      )}

      {step === 'pref' && (
        <Screen title={PREF_ROUNDS[Math.min(round, PREF_ROUNDS.length - 1)].title} top={<Progress n={ROUNDS.length} i={round} />}>
          <div className="choice-pair" key={round}>
            {ROUNDS[round].map((id) => {
              const l = getLesson(id) as Lesson;
              return (
                <button key={id} className={`pref-card rise ${picked === id ? 'on' : ''} ${picked && picked !== id ? 'off' : ''}`} onClick={() => pick(id)}>
                  <SketchImg lesson={l} paper pad={30} />
                </button>
              );
            })}
          </div>
        </Screen>
      )}

      {step === 'showcase' && (
        <Screen
          title={<>Çiziktir ile <span className="hl">en sevdiğin şeyleri</span> çizebileceksin!</>}
          action={<button className="pill" onClick={() => go('start')}>Devam</button>}
        >
          <div className="marquee">
            <div className="marquee__track">
              {[...showcase, ...showcase].map((l, i) => (
                <figure key={i} className="show-card" style={{ ['--r' as string]: `${(i % 3) * 3 - 3}deg` }}>
                  <SketchImg lesson={l} paper pad={24} />
                  <figcaption>{l.title}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </Screen>
      )}

      {step === 'start' && (
        <div className="onb__center">
          <div className="start-art rise">
            <span className="start-art__note hand">Hadi başlayalım</span>
            <svg className="start-art__arrow" viewBox="0 0 160 110" aria-hidden="true">
              <path d="M150 20 C 110 0, 40 10, 26 80" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="7 8" strokeLinecap="round" />
              <path d="M12 66 L26 86 L42 70" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <button className="start-art__paper" onClick={finish} aria-label="Hadi başlayalım">
              <span className="start-art__play"><Play size={40} fill="currentColor" /></span>
            </button>
            <svg className="start-art__pencil" viewBox="0 0 200 30" aria-hidden="true">
              <path d="M6,15 L26,7 L190,7 Q196,7 196,15 Q196,23 190,23 L26,23 Z" fill="#2a1b8c" />
              <path d="M6,15 L26,7 L26,23 Z" fill="#fff6e0" />
              <path d="M6,15 L13,12 L13,18 Z" fill="#2a1b8c" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

function Screen({ title, sub, children, action, top }: {
  title: React.ReactNode; sub?: string; children: React.ReactNode; action?: React.ReactNode; top?: React.ReactNode;
}) {
  return (
    <div className="onb__screen">
      {top}
      <div className="onb__head rise">
        <h1 className="title-lg">{title}</h1>
        {sub && <p className="sub">{sub}</p>}
      </div>
      <div className="onb__body">{children}</div>
      {action && <div className="onb__action rise">{action}</div>}
    </div>
  );
}

function Progress({ n, i }: { n: number; i: number }) {
  return (
    <div className="onb__progress" aria-label={`${i + 1} / ${n}`}>
      {Array.from({ length: n }, (_, k) => (
        <span key={k} className={k <= i ? 'on' : ''} />
      ))}
    </div>
  );
}

/** Açılış görseli: akan çizgi bir kâğıda dönüşür, mor kalem çizer. */
function SplashArt() {
  return (
    <svg className="splash-art" viewBox="0 0 320 260" aria-hidden="true">
      <path className="splash-art__line" d="M20 -10 C 0 60, 20 110, 90 118" pathLength={1} />
      <g transform="rotate(-12 170 130)">
        <path className="splash-art__line splash-art__line--2" pathLength={1}
          d="M92 118 L 214 96 Q 222 104 232 118 L 250 214 L 120 238 Z M 214 96 L 218 116 L 232 118" />
      </g>
      <g transform="translate(150 196) rotate(-58)">
        <rect x="0" y="-8" width="100" height="16" rx="8" fill="#8b4dff" />
        <path d="M0,-8 L-18,0 L0,8 Z" fill="#fff6e0" />
        <path d="M-12,-2.6 L-18,0 L-12,2.6 Z" fill="#8b4dff" />
      </g>
    </svg>
  );
}
