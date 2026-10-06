/**
 * Meydan okuma sonuç ekranının çevrimiçi parçaları:
 * - SendToFriend: sonucu ve çizimi bir arkadaşa "senin sıran" diye gönderir.
 * - AnswerCompare: arkadaşın gönderdiği meydan okumaya verilen cevabı kaydeder; iki çizim yan yana, kazanan ve
 *   hazır tepkiler.
 */
import { Check, Loader2, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { AvatarArt } from '../components/Avatars';
import { Modal } from '../components/ui';
import type { ChallengeKind } from '../lib/daily';
import { sfx } from '../lib/sfx';
import { FeelArt, shapePath } from '../english/Art';
import { dative } from '../lib/util';
import { online } from './index';
import { useOnlineView } from './OnlineHost';
import { useOnline } from './store';
import { isOnlineNow, otherOf, REACTIONS, type PlayResult, type Reaction } from './types';

export const REACTION_LABEL: Record<Reaction, string> = { clap: 'Alkış', star: 'Yıldız', heart: 'Kalp', wow: 'Vay be', laugh: 'Çok güzel' };

/** Tepkiler emoji değil, uygulamanın mürekkep çizgisiyle çizilir. */
export function ReactionIcon({ r, size = 30 }: { r: Reaction; size?: number }) {
  if (r === 'wow') return <span style={{ display: 'inline-block', width: size, height: size }}><FeelArt f="surprised" /></span>;
  if (r === 'laugh') return <span style={{ display: 'inline-block', width: size, height: size }}><FeelArt f="happy" /></span>;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden="true">
      {r === 'star' && <path d={shapePath('star')} fill="#ffc83d" stroke="#3a2b27" strokeWidth={10} strokeLinejoin="round" />}
      {r === 'heart' && <path d={shapePath('heart')} fill="#ff6b8a" stroke="#3a2b27" strokeWidth={10} strokeLinejoin="round" />}
      {r === 'clap' && (
        <g stroke="#3a2b27" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round">
          <rect x="52" y="62" width="52" height="96" rx="26" fill="#ffd9b3" transform="rotate(-18 78 110)" />
          <rect x="96" y="62" width="52" height="96" rx="26" fill="#ffc89a" transform="rotate(18 122 110)" />
          <path d="M100,22 V40 M62,32 L72,48 M138,32 L128,48" fill="none" />
        </g>
      )}
    </svg>
  );
}

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function SendToFriend({ kind, lessonId, result, getImage, auto }: {
  kind: ChallengeKind;
  lessonId: string;
  result: { percent: number; stars: number };
  getImage: () => Promise<string>;
  /** Bu arkadaşa otomatik gönder (arkadaşlar sayfasından "meydan oku" ile gelindiyse). */
  auto?: string;
}) {
  const v = useOnlineView();
  const [status, setStatus] = useState<Status>('idle');
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const started = useRef(false);

  const send = async (pid: string) => {
    if (!v) return;
    setPicking(false);
    setStatus('sending');
    setSentTo(pid);
    try {
      const image = await getImage();
      await (await online()).sendChallenge(v.me, pid, kind, lessonId, { ...result, image, at: Date.now() });
      setStatus('sent');
      sfx.success();
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => {
    if (auto && v && !started.current) {
      started.current = true;
      void send(auto);
    }
  }, [auto, v]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!v || (!v.friends.length && !auto)) return null;
  const name = (pid: string) => v.players[pid]?.name ?? 'Arkadaşın';
  return (
    <div className="online-send">
      {status === 'sent' && sentTo ? (
        <p className="online-send__ok"><Check size={20} /> {name(sentTo)} meydan okumanı aldı! Sırası gelince sonucu Arkadaşlarım'da göreceksin.</p>
      ) : status === 'sending' ? (
        <p className="online-send__ok"><Loader2 className="spin" size={20} /> Gönderiliyor…</p>
      ) : (
        <button className="pill pill--teal" onClick={() => (v.friends.length === 1 ? send(v.friends[0].pid) : setPicking(true))}>
          <Send size={20} /> {v.friends.length === 1 ? `${dative(name(v.friends[0].pid))} meydan oku` : 'Arkadaşına meydan oku'}
        </button>
      )}
      {status === 'error' && <p className="online-send__err">Gönderilemedi. İnternet bağlantısını kontrol edip tekrar dene.</p>}
      {picking && (
        <Modal onClose={() => setPicking(false)}>
          <h2 className="title-lg">Kime meydan okuyalım?</h2>
          <div className="friend-pick">
            {v.friends.map(({ pid }) => (
              <button key={pid} className="friend-pick__item" onClick={() => send(pid)}>
                <AvatarArt id={v.players[pid]?.avatar ?? 'kedi'} size={64} />
                <b>{name(pid)}</b>
                {isOnlineNow(v.players[pid]) && <span className="online-dot" />}
              </button>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

export function AnswerCompare({ challengeId, result, getImage, myName, myAvatar }: {
  challengeId: string;
  result: { percent: number; stars: number };
  getImage: () => Promise<string>;
  myName: string;
  myAvatar: string;
}) {
  const v = useOnlineView();
  const ch = useOnline((s) => s.challenges.find((c) => c.id === challengeId));
  const [mine, setMine] = useState<PlayResult | null>(null);
  const [status, setStatus] = useState<Status>('sending');
  const saved = useRef(false);

  useEffect(() => {
    if (saved.current || !v) return;
    saved.current = true;
    void (async () => {
      try {
        const image = await getImage();
        const r = { ...result, image, at: Date.now() };
        setMine(r);
        await (await online()).answerChallenge(challengeId, v.me, r);
        setStatus('sent');
      } catch {
        setStatus('error');
      }
    })();
  }, [v]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!v || !ch) return null;
  const friend = otherOf(ch, v.me);
  const theirs = ch.results[friend];
  const fname = v.players[friend]?.name ?? 'Arkadaşın';
  const myReaction = ch.reactions[v.me];
  const theirReaction = ch.reactions[friend];
  const win = theirs ? (result.percent === theirs.percent ? 0 : result.percent > theirs.percent ? 1 : -1) : 0;

  return (
    <div className="online-compare rise">
      <h2 className="title-lg">{win > 0 ? 'Bu turu sen kazandın!' : win < 0 ? `${fname} bu turu kazandı!` : 'Berabere!'}</h2>
      <div className="online-compare__cards">
        <figure className={win > 0 ? 'win' : ''}>
          {mine ? <img src={mine.image} alt="Senin çizimin" /> : <div className="online-compare__ph" />}
          <figcaption><AvatarArt id={myAvatar} size={34} /> <b>{myName}</b> <span>%{result.percent}</span></figcaption>
        </figure>
        {theirs && (
          <figure className={win < 0 ? 'win' : ''}>
            <img src={theirs.image} alt={`${fname} çizimi`} />
            <figcaption><AvatarArt id={v.players[friend]?.avatar ?? 'kedi'} size={34} /> <b>{fname}</b> <span>%{theirs.percent}</span></figcaption>
          </figure>
        )}
      </div>
      {theirReaction && <p className="online-compare__their">{fname} sana <ReactionIcon r={theirReaction} size={28} /> gönderdi</p>}
      <ReactionBar value={myReaction} onPick={(r) => online().then((c) => c.react('challenges', challengeId, v.me, r))} label={`${dative(fname)} tepki gönder`} />
      {status === 'error' && <p className="online-send__err">Sonucun gönderilemedi. İnternet bağlantısını kontrol et.</p>}
    </div>
  );
}

/** Hazır tepkiler (serbest metin yok). */
export function ReactionBar({ value, onPick, label }: { value?: Reaction; onPick: (r: Reaction) => void; label: string }) {
  return (
    <div className="reaction-bar" role="group" aria-label={label}>
      <span>{label}:</span>
      {REACTIONS.map((r) => (
        <button key={r} className={`reaction ${value === r ? 'on' : ''}`} aria-label={REACTION_LABEL[r]} aria-pressed={value === r}
          onClick={() => { sfx.pop(); onPick(r); }}>
          <ReactionIcon r={r} />
        </button>
      ))}
    </div>
  );
}
