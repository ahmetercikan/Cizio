/**
 * Arkadaşlarım (çevrimiçi): sıra sende olanlar, arkadaşlar (meydan oku / canlı düello / birlikte boya),
 * bekleyenler ve sonuçlar. Arkadaş ekleme burada değil, ebeveyn bölümündedir.
 */
import { Brush, Eye, Loader2, Lock, Play, Swords, Trophy, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { AvatarArt } from '../components/Avatars';
import { ChallengeArt } from '../components/ChallengeArt';
import { SketchImg } from '../components/Sketch';
import { Modal, useToast } from '../components/ui';
import { getLesson, lessons } from '../lessons';
import { CHALLENGES, type ChallengeKind } from '../lib/daily';
import { sfx } from '../lib/sfx';
import { dative, locative } from '../lib/util';
import { ONLINE_AVAILABLE, online } from '../online';
import { ReactionBar, ReactionIcon } from '../online/ChallengeOnline';
import { useOnlineView } from '../online/OnlineHost';
import { useOnline } from '../online/store';
import { isOnlineNow, otherOf, type Challenge } from '../online/types';
import { useProfile } from '../store/useApp';
import { randomDuelLesson } from './LiveDuel';

const kindTitle = (k: ChallengeKind) => CHALLENGES.find((c) => c.id === k)?.title ?? 'Meydan okuma';
const easyLessons = () => lessons.filter((l) => l.level <= 2);
const pickSome = <T,>(xs: T[], n: number) => [...xs].sort(() => Math.random() - 0.5).slice(0, n);

export default function Friends() {
  const v = useOnlineView();
  const status = useOnline((s) => s.status);
  const profile = useProfile()!;
  const nav = useNavigate();
  const [toast, showToast] = useToast();
  const [modal, setModal] = useState<{ kind: 'challenge' | 'duel' | 'coop'; pid: string } | null>(null);
  const [result, setResult] = useState<Challenge | null>(null);
  const [busy, setBusy] = useState(false);

  if (!ONLINE_AVAILABLE || !v) {
    return (
      <AppShell>
        <section className="online-off rise">
          <Lock size={40} />
          <h1 className="title-lg">Arkadaşlarınla oyna</h1>
          <p className="sub">Arkadaşlarınla meydan okuma, canlı düello ve birlikte boyama için bir büyüğünden ebeveyn bölümünde "Çevrimiçi arkadaşlar"ı açmasını iste.</p>
          <Link to="/ebeveyn" className="pill">Ebeveyn bölümü</Link>
        </section>
      </AppShell>
    );
  }

  const name = (pid: string) => v.players[pid]?.name ?? 'Arkadaşın';
  const avatar = (pid: string) => v.players[pid]?.avatar ?? 'kedi';
  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } catch {
      showToast('Olmadı. İnternet bağlantısını kontrol edip tekrar dene.');
    } finally {
      setBusy(false);
    }
  };

  const startDuel = (pid: string, mode: 'look' | 'memory') =>
    run(async () => {
      const id = await (await online()).inviteDuel(v.me, pid, randomDuelLesson().id, mode);
      nav(`/canli/${id}`);
    });
  const startCoop = (pid: string, lessonId: string) =>
    run(async () => {
      const id = await (await online()).inviteCoop(v.me, pid, lessonId);
      nav(`/birlikte/${id}`);
    });

  const waitingCoops = v.coops.filter((c) => c.state !== 'done' && c.turnOf !== v.me);
  const doneCoops = v.coops.filter((c) => c.state === 'done');

  return (
    <AppShell>
      <header className="page-head rise">
        <div>
          <p className="sub">Arkadaşlarınla oyna</p>
          <h1 className="title-xl">Arkadaşlarım</h1>
        </div>
        {status === 'connecting' && <span className="sub"><Loader2 className="spin" size={18} /> Bağlanıyor…</span>}
        {status === 'error' && <span className="sub">İnternete bağlanılamadı</span>}
      </header>

      {(v.toPlay.length > 0 || v.duelInvites.length > 0 || v.myTurn.length > 0) && (
        <section className="row-section">
          <h2 className="row-section__title"><Play size={20} /> Sıra sende</h2>
          <div className="online-cards">
            {v.duelInvites.map((d) => (
              <article key={d.id} className="online-card online-card--hot">
                <AvatarArt id={avatar(d.from)} size={56} />
                <div><b>{name(d.from)} seni canlı düelloya çağırıyor!</b><small>Aynı resmi aynı anda çizin</small></div>
                <button className="pill pill--sm" onClick={() => nav(`/canli/${d.id}?kabul=1`)}><Swords size={18} /> Kabul et</button>
              </article>
            ))}
            {v.toPlay.map((c) => {
              const l = getLesson(c.lessonId);
              return (
                <article key={c.id} className="online-card">
                  {l && <span className="online-card__thumb"><SketchImg lesson={l} paper pad={14} /></span>}
                  <div><b>{name(c.from)} sana meydan okudu!</b><small>{kindTitle(c.kind)} · {l?.title}</small></div>
                  <button className="pill pill--sm" onClick={() => nav(`/meydan/${c.kind}/${c.lessonId}?yanit=${c.id}`)}><Play size={18} /> Oyna</button>
                </article>
              );
            })}
            {v.myTurn.map((c) => {
              const l = getLesson(c.lessonId);
              return (
                <article key={c.id} className="online-card">
                  {l && <span className="online-card__thumb"><SketchImg lesson={l} pad={14} /></span>}
                  <div><b>Birlikte boyama: sıra sende!</b><small>{name(otherOf(c, v.me))} ile · {l?.title}</small></div>
                  <button className="pill pill--sm" onClick={() => nav(`/birlikte/${c.id}`)}><Brush size={18} /> Boya</button>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <section className="row-section">
        <h2 className="row-section__title"><Users size={20} /> Arkadaşlarım</h2>
        {v.friends.length === 0 ? (
          <p className="hint">Henüz arkadaşın yok. Bir büyüğün ebeveyn bölümünden arkadaşının kodunu ekleyebilir.</p>
        ) : (
          <div className="friend-grid">
            {v.friends.map(({ pid }) => (
              <article key={pid} className="friend-card rise">
                <div className="friend-card__head">
                  <AvatarArt id={avatar(pid)} size={64} ring />
                  <div>
                    <b>{name(pid)}</b>
                    <small>{isOnlineNow(v.players[pid]) ? <><span className="online-dot" /> Şu an uygulamada</> : 'Şu an uygulamada değil'}</small>
                  </div>
                </div>
                <div className="friend-card__actions">
                  <button className="pill pill--sm" disabled={busy} onClick={() => { sfx.tap(); setModal({ kind: 'challenge', pid }); }}><Trophy size={18} /> Meydan oku</button>
                  <button className="pill pill--sm pill--teal" disabled={busy} onClick={() => { sfx.tap(); setModal({ kind: 'duel', pid }); }}><Swords size={18} /> Canlı düello</button>
                  <button className="pill pill--sm pill--yellow" disabled={busy} onClick={() => { sfx.tap(); setModal({ kind: 'coop', pid }); }}><Brush size={18} /> Birlikte boya</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {(v.waiting.length > 0 || waitingCoops.length > 0) && (
        <section className="row-section">
          <h2 className="row-section__title"><Loader2 size={20} /> Arkadaşını bekliyorsun</h2>
          <div className="online-cards">
            {v.waiting.map((c) => (
              <article key={c.id} className="online-card online-card--wait">
                <AvatarArt id={avatar(otherOf(c, v.me))} size={48} />
                <div><b>{dative(name(otherOf(c, v.me)))} meydan okudun</b><small>{kindTitle(c.kind)} · sen %{c.results[v.me]?.percent}</small></div>
              </article>
            ))}
            {waitingCoops.map((c) => (
              <article key={c.id} className="online-card online-card--wait" role="button" tabIndex={0} onClick={() => nav(`/birlikte/${c.id}`)}>
                <AvatarArt id={avatar(otherOf(c, v.me))} size={48} />
                <div><b>Birlikte boyama: sıra {locative(name(otherOf(c, v.me)))}</b><small>{getLesson(c.lessonId)?.title}</small></div>
              </article>
            ))}
          </div>
        </section>
      )}

      {(v.finished.length > 0 || doneCoops.length > 0) && (
        <section className="row-section">
          <h2 className="row-section__title"><Trophy size={20} /> Sonuçlar</h2>
          <div className="online-results">
            {v.finished.map((c) => {
              const f = otherOf(c, v.me);
              const a = c.results[v.me], b = c.results[f];
              const win = a.percent === b.percent ? 0 : a.percent > b.percent ? 1 : -1;
              return (
                <button key={c.id} className="online-result" onClick={() => setResult(c)}>
                  <span className={`online-result__pic ${win > 0 ? 'win' : ''}`}><img src={a.image} alt="" /><i>%{a.percent}</i></span>
                  <span className={`online-result__pic ${win < 0 ? 'win' : ''}`}><img src={b.image} alt="" /><i>%{b.percent}</i></span>
                  <small>{kindTitle(c.kind)} · {win > 0 ? 'Sen kazandın' : win < 0 ? `${name(f)} kazandı` : 'Berabere'}</small>
                  {c.reactions[f] && <span className="online-result__react"><ReactionIcon r={c.reactions[f]} size={24} /></span>}
                </button>
              );
            })}
            {doneCoops.map((c) => {
              const l = getLesson(c.lessonId);
              return (
                <button key={c.id} className="online-result" onClick={() => nav(`/birlikte/${c.id}`)}>
                  {l && <span className="online-result__pic online-result__pic--wide"><SketchImg lesson={l} mode="color" pad={14} /></span>}
                  <small>{name(otherOf(c, v.me))} ile birlikte boyadınız</small>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {modal?.kind === 'challenge' && (
        <Modal onClose={() => setModal(null)}>
          <h2 className="title-lg">{dative(name(modal.pid))} hangi meydan okumayı gönderelim?</h2>
          <p className="sub">Önce sen oynayacaksın, sonra sıra {locative(name(modal.pid))}.</p>
          <div className="friend-pick">
            {CHALLENGES.map((c) => (
              <button key={c.id} className="friend-pick__item" onClick={() => nav(`/meydan/${c.id}/${pickSome(easyLessons(), 1)[0].id}?arkadas=${modal.pid}`)}>
                <span className="friend-pick__art"><ChallengeArt kind={c.id} /></span>
                <b>{c.title}</b>
                <small>{c.desc}</small>
              </button>
            ))}
          </div>
        </Modal>
      )}
      {modal?.kind === 'duel' && (
        <Modal onClose={() => setModal(null)}>
          <h2 className="title-lg">{name(modal.pid)} ile canlı düello</h2>
          <p className="sub">{isOnlineNow(v.players[modal.pid]) ? `${name(modal.pid)} şu an uygulamada!` : `${name(modal.pid)} şu an uygulamada değil; davet 2 dakika bekler.`}</p>
          <div className="friend-pick">
            <button className="friend-pick__item" disabled={busy} onClick={() => { setModal(null); void startDuel(modal.pid, 'look'); }}>
              <Eye size={40} /><b>Bakarak</b><small>Örnek hep görünür, 60 saniye</small>
            </button>
            <button className="friend-pick__item" disabled={busy} onClick={() => { setModal(null); void startDuel(modal.pid, 'memory'); }}>
              <Swords size={40} /><b>Hafızadan</b><small>6 saniye bak, sonra çiz</small>
            </button>
          </div>
        </Modal>
      )}
      {modal?.kind === 'coop' && <CoopPicker name={name(modal.pid)} onClose={() => setModal(null)} onPick={(id) => { const p = modal.pid; setModal(null); void startCoop(p, id); }} />}
      {result && (
        <Modal onClose={() => setResult(null)} className="modal--wide">
          <ResultDetail c={result} me={v.me} name={name} avatar={avatar} myName={profile.name} myAvatar={profile.avatar} />
        </Modal>
      )}
      {toast}
    </AppShell>
  );
}

function CoopPicker({ name, onClose, onPick }: { name: string; onClose: () => void; onPick: (lessonId: string) => void }) {
  const [seed, setSeed] = useState(0);
  const choices = useMemo(() => pickSome(easyLessons(), 6), [seed]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Modal onClose={onClose} className="modal--wide">
      <h2 className="title-lg">{name} ile hangi resmi boyayalım?</h2>
      <p className="sub">Sırayla boyayacaksınız: her sırada 3 boyama hakkı.</p>
      <div className="coop-pick">
        {choices.map((l) => (
          <button key={l.id} className="coop-pick__item" onClick={() => onPick(l.id)}>
            <SketchImg lesson={l} paper pad={16} />
            <b>{l.title}</b>
          </button>
        ))}
      </div>
      <button className="btn-outline" onClick={() => setSeed((s) => s + 1)}>Başka resimler</button>
    </Modal>
  );
}

function ResultDetail({ c, me, name, avatar, myName, myAvatar }: {
  c: Challenge; me: string; name: (p: string) => string; avatar: (p: string) => string; myName: string; myAvatar: string;
}) {
  const f = otherOf(c, me);
  const live = useOnline((s) => s.challenges.find((x) => x.id === c.id)) ?? c;
  const l = getLesson(c.lessonId);
  const a = live.results[me], b = live.results[f];
  return (
    <div className="online-compare">
      <h2 className="title-lg">{kindTitle(c.kind)}{l ? ` · ${l.title}` : ''}</h2>
      <div className="online-compare__cards">
        <figure className={a.percent > b.percent ? 'win' : ''}><img src={a.image} alt="Senin çizimin" /><figcaption><AvatarArt id={myAvatar} size={34} /> <b>{myName}</b> <span>%{a.percent}</span></figcaption></figure>
        <figure className={b.percent > a.percent ? 'win' : ''}><img src={b.image} alt={`${name(f)} çizimi`} /><figcaption><AvatarArt id={avatar(f)} size={34} /> <b>{name(f)}</b> <span>%{b.percent}</span></figcaption></figure>
      </div>
      {live.reactions[f] && <p className="online-compare__their">{name(f)} sana <ReactionIcon r={live.reactions[f]} size={28} /> gönderdi</p>}
      <ReactionBar value={live.reactions[me]} onPick={(r) => online().then((cl) => cl.react('challenges', c.id, me, r))} label={`${dative(name(f))} tepki gönder`} />
    </div>
  );
}
