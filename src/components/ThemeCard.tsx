/**
 * Haftanın çizim teması kartı.
 *
 * Her hafta bir çizim yolu seçilir; çocuk o temadan üç ders bitirince rozeti ve bir hazine sandığı kazanır.
 * Kart üç öneri gösterir — önce hiç yapmadığı dersler. Hedefe ulaşınca kart altın rengine döner.
 */
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Trophy } from 'lucide-react';
import { SketchImg } from './Sketch';
import { sfx } from '../lib/sfx';
import { THEME_GOAL, themeClaimed, themeDone, themeNext, themeWon, weekTheme } from '../lib/theme';
import { useApp, useProfileData } from '../store/useApp';
import { lessonFree } from '../account/limits';
import { useUnlocked } from '../account/membership';
import { LockBadge } from '../account/Locked';

export function ThemeCard() {
  const data = useProfileData();
  const claim = useApp((s) => s.claimTheme);
  const t = weekTheme();
  const done = themeDone(data, t);
  const won = themeWon(data, t);
  const alindi = themeClaimed(data, t);
  const unlocked = useUnlocked();

  // hedefe ulaşıldıysa ödül bir kez verilir
  useEffect(() => {
    if (won && !alindi) {
      claim(t.week);
      sfx.fanfare();
    }
  }, [won, alindi, claim, t.week]);

  // Premium yoksa önce açık dersler önerilir
  const free = (id: string) => unlocked || lessonFree(id, !!data.lessons[id]);
  const oneri = [...themeNext(data, t)].sort((a, b) => Number(free(b.id)) - Number(free(a.id)));
  if (!oneri.length) return null;

  return (
    <section className={`themecard rise ${won ? 'won' : ''}`} style={{ ['--tc' as string]: t.color }}>
      <div className="themecard__head">
        <span className="themecard__emoji" aria-hidden="true">{won ? <Trophy size={26} /> : t.emoji}</span>
        <div className="themecard__text">
          <p className="themecard__label"><Sparkles size={15} /> Bu haftanın teması</p>
          <h2 className="title-md">{t.title}</h2>
        </div>
        <span className="themecard__count">{Math.min(done, THEME_GOAL)}/{THEME_GOAL}</span>
      </div>
      <div className="themecard__bar"><span style={{ width: `${Math.min(100, (done / THEME_GOAL) * 100)}%` }} /></div>
      <p className="themecard__hint">
        {won ? 'Hafta rozetini kazandın! Sandığın hazır.' : `Bu temadan ${THEME_GOAL - done} ders daha bitir, rozeti kazan.`}
      </p>
      <div className="themecard__row">
        {oneri.map((l) => (
          <Link key={l.id} to={`/ders/${l.id}`} className={`themecard__item ${data.lessons[l.id] ? 'done' : ''}`} onClick={() => sfx.pop()}>
            <SketchImg lesson={l} pad={16} className="themecard__img" />
            <small>{l.title}</small>
            {!free(l.id) && <LockBadge />}
          </Link>
        ))}
      </div>
    </section>
  );
}
