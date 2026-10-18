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

export function ThemeCard() {
  const data = useProfileData();
  const claim = useApp((s) => s.claimTheme);
  const t = weekTheme();
  const done = themeDone(data, t);
  const won = themeWon(data, t);
  const alindi = themeClaimed(data, t);

  // hedefe ulaşıldıysa ödül bir kez verilir
  useEffect(() => {
    if (won && !alindi) {
      claim(t.week);
      sfx.fanfare();
    }
  }, [won, alindi, claim, t.week]);

  const oneri = themeNext(data, t);
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
          </Link>
        ))}
      </div>
    </section>
  );
}
