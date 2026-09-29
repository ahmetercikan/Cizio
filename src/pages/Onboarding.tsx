/**
 * Karşılama akışı:
 * açılış (Çizio tanışır) → avatar → isim → 3 tur "hangisini daha çok seviyorsun?" → vitrin
 * → ebeveyn onayı (bir büyüğü çağır) → "Hadi başlayalım" (ilk ders).
 * Zaten bir profil varsa (kardeş ekleme) ebeveyn onayı atlanır.
 */
import { ArrowRight, Check, Heart, ShieldCheck, Smartphone, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AvatarArt, AVATARS } from '../components/Avatars';
import { Doodles } from '../components/Doodles';
import { HeartDraw } from '../components/HeartDraw';
import { Mascot } from '../components/Mascot';
import { SketchImg } from '../components/Sketch';
import { getLesson, lessons, lessonsByPath } from '../lessons';

import type { Lesson, PathId } from '../lessons/types';
import { sfx } from '../lib/sfx';
import { speak, unlockAudio } from '../lib/speech';
import { useApp } from '../store/useApp';
import { PREF_ROUNDS } from '../voice/lines';

type Step = 'splash' | 'avatar' | 'name' | 'pref' | 'showcase' | 'parent' | 'start';


const ROUNDS: [string, string][] = [
  ['tavsan', 'cicek'],
  ['dondurma', 'peri'],
  ['kedi', 'robot'],
];

const LINES: Partial<Record<Step, string>> = {
  splash: 'Merhaba! Ben Çizio. Seninle adım adım harika resimler çizeceğiz!',
  avatar: 'Avatarını seç!',
  name: 'Adın ne?',
  pref: PREF_ROUNDS[0].text,
  showcase: 'Çizio ile en sevdiğin şeyleri çizebileceksin!',
  parent: 'Hadi bir büyüğünü çağır! Çizio’yu birlikte kuralım.',
  start: 'Hadi başlayalım!',
};

export default function Onboarding() {
  const nav = useNavigate();
  const addProfile = useApp((s) => s.addProfile);
  const hasProfiles = useApp((s) => s.profiles.length > 0);
  const settings = useApp((s) => s.settings);
  const [step, setStep] = useState<Step>('splash');
  const [consent, setConsent] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [round, setRound] = useState(0);
  const [picks, setPicks] = useState<string[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [jump, setJump] = useState(false);

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

  const variant = { splash: 0, avatar: 1, name: 1, pref: 2, showcase: 3, parent: 1, start: 0 }[step];
  const progress = ['avatar', 'name', 'pref', 'showcase', 'parent'].indexOf(step);

  return (
    <div className="bg onb">
      <Doodles variant={variant} />

      {progress >= 0 && (
        <div className="onb__steps" aria-label={`Adım ${progress + 1} / ${hasProfiles ? 4 : 5}`}>
          {Array.from({ length: hasProfiles ? 4 : 5 }, (_, k) => (
            <span key={k} className={k < progress ? 'done' : k === progress ? 'now' : ''} />
          ))}
        </div>
      )}

      {step === 'splash' && (
        <div className="onb__center splash rise">
          <button
            type="button"
            className={`splash__mascot ${jump ? 'jump' : ''}`}
            aria-label="Çizio"
            onClick={() => {
              sfx.pop();
              setJump(true);
              window.setTimeout(() => setJump(false), 700);
            }}
          >
            <span className="splash__glow" />
            <Mascot size={118} mood="cheer" className="float mascot--wave splash__pal" />
            <HeartDraw />
            <span className="splash__spark" style={{ left: '6%', top: '14%' }} />
            <span className="splash__spark" style={{ right: '4%', top: '26%', animationDelay: '0.7s' }} />
            <span className="splash__spark" style={{ left: '14%', bottom: '8%', animationDelay: '1.3s' }} />
          </button>
          <h1 className="brand-title splash__title" aria-label="Çizio">
            {'Çizio'.split('').map((ch, i) => (
              <span key={i} style={{ animationDelay: `${0.2 + i * 0.09}s` }}>{ch}</span>
            ))}
          </h1>
          <p className="sub onb__lead">Adım adım çizmeyi öğren. Kâğıtta ya da ekranda!</p>
          <button
            className="pill pill--big pulse splash__start"
            onClick={() => {
              unlockAudio();
              say(LINES.splash);
              go('avatar');
            }}
          >
            Başla <ArrowRight size={24} />
          </button>
        </div>
      )}

      {step === 'avatar' && (
        <Screen title="Avatarını seç" action={<button className="pill" disabled={!avatar} onClick={() => go('name')}>Devam</button>}>
          <div className="avatar-grid">
            {AVATARS.map((a) => (
              <button key={a.id} className={`avatar-pick ${avatar === a.id ? 'on' : ''}`} aria-label={a.label} onClick={() => { sfx.tap(); setAvatar(a.id); }}>
                <AvatarArt id={a.id} size={120} />
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
        <Screen title={PREF_ROUNDS[Math.min(round, PREF_ROUNDS.length - 1)].title}
          top={<p className="onb__round">{round + 1} / {ROUNDS.length}</p>}>
          <div className="choice-pair" key={round}>
            {ROUNDS[round].map((id) => {
              const l = getLesson(id) as Lesson;
              return (
                <button key={id} className={`pref-card rise ${picked === id ? 'on' : ''} ${picked && picked !== id ? 'off' : ''}`} onClick={() => pick(id)}>
                  <SketchImg lesson={l} mode="color" pad={30} />
                  <span className="pref-card__heart"><Heart size={22} fill="currentColor" /></span>
                </button>
              );
            })}
          </div>
        </Screen>
      )}

      {step === 'showcase' && (
        <Screen
          title={<>Çizio ile <span className="hl">en sevdiğin şeyleri</span> çizebileceksin!</>}
          action={<button className="pill" onClick={() => go(hasProfiles ? 'start' : 'parent')}>Devam</button>}
        >
          <div className="marquee">
            <div className="marquee__track">
              {[...showcase, ...showcase].map((l, i) => (
                <figure key={i} className="show-card" style={{ ['--r' as string]: `${(i % 3) * 3 - 3}deg` }}>
                  <span className="show-card__tape" />
                  <SketchImg lesson={l} mode={i % 2 ? 'color' : 'graphite'} paper pad={24} />
                  <figcaption>{l.title}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </Screen>
      )}

      {step === 'parent' && (
        <div className="onb__center">
          <div className="parent-card rise">
            <Mascot size={90} mood="happy" />
            <h2 className="title-lg">Bir büyüğünü çağır!</h2>
            <p className="parent-card__text">
              Çizio 7-9 yaş çocuklar için. Başlamadan önce bir ebeveynin onayı gerekiyor.
            </p>
            <ul className="parent-card__facts">
              <li><ShieldCheck size={22} /> Reklam ve satın alma yok</li>
              <li><Smartphone size={22} /> Çizimler ve fotoğraflar yalnızca bu cihazda kalır</li>
              <li><Sparkles size={22} /> Ayarlar ebeveyn bölümünde, korumalı</li>
            </ul>
            <label className="parent-card__consent">
              <input type="checkbox" className="switch" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              Ben bir ebeveynim ve onaylıyorum
            </label>
            <button className="pill" disabled={!consent} onClick={() => go('start')}>
              <Check size={22} /> Onayla
            </button>
          </div>
        </div>
      )}

      {step === 'start' && (
        <div className="onb__center start rise">
          <div className="start__stage">
            {avatar && <AvatarArt id={avatar} size={120} ring />}
            <Mascot size={150} mood="wow" className="float" />
          </div>
          <h1 className="title-xl">Hazırsın, {name.trim()}!</h1>
          <p className="sub onb__lead">İlk çizimimize kâğıdını ve kalemini al, birlikte başlayalım.</p>
          <button className="pill pill--big" onClick={finish} aria-label="Hadi başlayalım">
            Hadi başlayalım! <ArrowRight size={24} />
          </button>
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
      <div className="onb__head rise">
        {top}
        <h1 className="title-lg">{title}</h1>
        {sub && <p className="sub">{sub}</p>}
      </div>
      <div className="onb__body">{children}</div>
      {action && <div className="onb__action rise">{action}</div>}
    </div>
  );
}
