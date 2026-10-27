/**
 * Ebeveyn bölümü: hesap ve Premium özeti, bir de mağazada puan isteği.
 * Puan isteği çocuğa değil, ebeveyn bölümünde gösterilir (çocuk uygulamalarında oyun ortasında istek kurallara aykırı).
 */
import { ChevronRight, CloudCheck, Crown, Star, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { useApp } from '../store/useApp';
import { PREMIUM_ACIK } from '../lib/flags';
import { STORE_LINKS } from './config';
import { startAccount, useAccount, accountAvailable } from './auth';
import { useMembership } from './membership';
import { useSync } from './sync';

export function ParentAccount() {
  const nav = useNavigate();
  const user = useAccount((s) => s.user);
  const premium = useMembership((s) => s.premium);
  const sync = useSync();
  const lessonsDone = useApp((s) => Object.values(s.data).reduce((n, d) => n + Object.keys(d?.lessons ?? {}).length, 0));
  useEffect(() => {
    if (accountAvailable()) void startAccount().catch(() => {});
  }, []);
  if (!accountAvailable() && !PREMIUM_ACIK) return null;
  // Hesap yoksa ve çocuk ilerlemeye başladıysa nazik hatırlatma (PK XD'deki "kaydol, ilerlemen kaybolmasın" gibi)
  const nudge = !user && lessonsDone >= 3;
  return (
    <section className="paper-card settings-card parent-premium">
      {PREMIUM_ACIK && (
        <button className="parent-premium__row" onClick={() => nav('/premium', { state: { gated: true } })}>
          <span className={`parent-premium__icon is-gold ${premium ? 'is-on' : ''}`}><Crown size={24} /></span>
          <span>
            <b>{premium ? 'Çizio Premium açık' : "Çizio Premium'a geçin"}</b>
            <small>{premium ? 'Bütün dersler, English Club ve Çizio Adası açık' : 'Bütün dersler, English Club ve Çizio Adası · 7 gün ücretsiz'}</small>
          </span>
          <ChevronRight size={22} />
        </button>
      )}
      {accountAvailable() && (
        <button className={`parent-premium__row ${nudge ? 'is-nudge' : ''}`} onClick={() => nav('/hesap', { state: { gated: true } })}>
          <span className="parent-premium__icon">{user ? <CloudCheck size={24} /> : <UserRound size={24} />}</span>
          <span>
            <b>{user ? 'Hesabınız' : nudge ? 'İlerleme kaybolmasın: hesap açın' : 'Hesap açın ya da giriş yapın'}</b>
            <small>
              {user
                ? `${user.email ?? 'Apple ile giriş'} · ${syncText(sync.status, sync.last)}`
                : 'Yıldızlar, dersler ve ada yeni telefonda da sizinle olsun'}
            </small>
          </span>
          <ChevronRight size={22} />
        </button>
      )}
    </section>
  );
}

/** Eşitleme durumunun kısa yazısı. */
export function syncText(status: string, last?: number) {
  if (status === 'syncing') return 'yedekleniyor…';
  if (status === 'error') return 'yedeklenemedi, internet gelince tekrar denenecek';
  if (last) return `ilerleme yedeklendi (${new Date(last).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })})`;
  return 'ilerleme yedekleniyor';
}

const RATE_KEY = 'cizio-puan';
/** Bir kez puan verildiyse ya da "Sonra" dendiyse 120 gün sorulmaz. */
const RATE_PAUSE = 120 * 864e5;

export function RateCard() {
  const lessonsDone = useApp((s) => Object.values(s.data).reduce((n, d) => n + Object.keys(d?.lessons ?? {}).length, 0));
  const [hidden, setHidden] = useState(() => {
    try {
      return Date.now() - Number(localStorage.getItem(RATE_KEY) ?? 0) < RATE_PAUSE;
    } catch {
      return true;
    }
  });
  if (hidden || lessonsDone < 3) return null;
  const close = () => {
    try {
      localStorage.setItem(RATE_KEY, String(Date.now()));
    } catch {
      /* yok say */
    }
    setHidden(true);
  };
  const rate = async () => {
    close();
    if (Capacitor.isNativePlatform()) {
      const { InAppReview } = await import('@capacitor-community/in-app-review');
      await InAppReview.requestReview().catch(() => window.open(STORE_LINKS.android, '_blank'));
    } else window.open(STORE_LINKS.android, '_blank');
  };
  return (
    <section className="paper-card settings-card rate-card">
      <span className="rate-card__stars" aria-hidden="true">{[0, 1, 2, 3, 4].map((i) => <Star key={i} size={22} fill="currentColor" />)}</span>
      <h2 className="card-title">Çizio'yu beğendiniz mi?</h2>
      <p className="muted">Mağazada birkaç yıldız ve kısa bir yorum, Çizio'yu başka ailelerin bulmasını sağlar. Bize de çok yardımcı olur!</p>
      <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
        <button className="pill pill--sm pill--yellow" onClick={() => void rate()}><Star size={18} fill="currentColor" /> Puan ver</button>
        <button className="btn-outline btn-outline--sm" onClick={close}>Sonra</button>
      </div>
    </section>
  );
}
