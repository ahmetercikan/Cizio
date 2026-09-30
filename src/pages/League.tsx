/**
 * Haftalık lig: bu hafta kazanılan yıldızlarla Çizio'nun arkadaşlarına karşı sıralama.
 * Hafta bitince sıra kaydedilir; ilk 3 kürsü, birinci şampiyonluk çıkartması kazanır.
 */
import { Clock, Star, Trophy } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { AvatarArt } from '../components/Avatars';
import { daysLeft, lastWeekResult, standings, type Standing } from '../lib/league';
import { useApp, useProfile, useProfileData } from '../store/useApp';

/** Geçen hafta oynandıysa ve henüz kaydedilmediyse sırayı kaydeder (çıkartmalar). */
export function useSettleLeague() {
  const profile = useProfile();
  const data = useProfileData();
  const settle = useApp((s) => s.settleLeague);
  useEffect(() => {
    if (!profile) return;
    const r = lastWeekResult(profile, data);
    if (r.played && !data.leagues?.[r.wk]) settle(r.wk, r.rank);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);
}

export default function League() {
  const profile = useProfile()!;
  const data = useProfileData();
  useSettleLeague();
  const rows = standings(profile, data);
  const me = rows.findIndex((r) => r.you) + 1;
  const last = lastWeekResult(profile, data);
  const lastRank = data.leagues?.[last.wk];
  const left = daysLeft();
  const ahead = me > 1 ? rows[me - 2] : undefined;
  const mine = rows[me - 1];

  return (
    <AppShell flow={2}>
      <header className="page-head rise">
        <div>
          <p className="sub">Her yıldızın lige sayılır</p>
          <h1 className="title-xl">Haftalık lig</h1>
        </div>
        <div className="chips">
          <span className="chip"><Clock size={20} color="#0d8074" /> {left === 1 ? 'Son gün!' : `${left} gün kaldı`}</span>
        </div>
      </header>

      {lastRank && (
        <p className="league-last rise">
          <Trophy size={20} /> Geçen hafta <b>{lastRank}.</b> oldun{lastRank <= 3 ? ', kürsüye çıktın!' : '.'}
        </p>
      )}

      <section className="podium rise" aria-label="İlk üç">
        {[1, 0, 2].map((i) => rows[i] && <PodiumStep key={rows[i].id} row={rows[i]} place={i + 1} />)}
      </section>

      <p className="league-tip rise">
        {me === 1
          ? 'Zirvedesin! Yerini korumak için çizmeye devam et.'
          : ahead && mine
            ? `Bir üst sıraya çıkmak için ${Math.max(1, ahead.stars - mine.stars)} yıldız daha kazan!`
            : ''}
      </p>

      <ol className="league-list">
        {rows.map((r, i) => (
          <li key={r.id} className={`league-row ${r.you ? 'you' : ''} rise`} style={{ animationDelay: `${0.05 + i * 0.04}s` }}>
            <span className="league-row__rank">{i + 1}</span>
            <AvatarArt id={r.avatar} size={48} />
            <b className="league-row__name">{r.you ? `${r.name} (sen)` : r.name}</b>
            <span className="league-row__stars"><Star size={18} color="#f0a500" fill="#ffd43b" /> {r.stars}</span>
          </li>
        ))}
      </ol>

      <div className="league-actions rise">
        <Link to="/" className="pill">Yıldız kazan</Link>
        <p className="sub">Derslerde ve meydan okumalarda kazandığın yıldızlar bu haftanın puanına eklenir. Lig her pazartesi yeniden başlar.</p>
      </div>
    </AppShell>
  );
}

function PodiumStep({ row, place }: { row: Standing; place: number }) {
  return (
    <div className={`podium__step podium__step--${place} ${row.you ? 'you' : ''}`}>
      {place === 1 && <span className="podium__crown" aria-hidden="true">👑</span>}
      <AvatarArt id={row.avatar} size={place === 1 ? 84 : 66} ring={row.you} />
      <b>{row.you ? 'Sen' : row.name}</b>
      <span className="podium__stars"><Star size={16} color="#f0a500" fill="#ffd43b" /> {row.stars}</span>
      <span className="podium__block">{place}</span>
    </div>
  );
}
