/** English Club ortak parçaları: oyun çerçevesi, bitiş kartı, yardımcılar. */
import { Volume2, X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { Mascot } from '../components/Mascot';
import { StarIcon } from '../components/Rewards';
import { useProfileData } from '../store/useApp';
import { emptyEnglish, PRAISE, type Age, type EnglishData } from './data';
import { hush } from './voice';

export function useEnglish(): EnglishData & { age: Age; ageSet: boolean } {
  const d = useProfileData();
  const e = { ...emptyEnglish(), ...d.english };
  return { ...e, age: e.age ?? 'junior', ageSet: !!e.age };
}

export function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const pick = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)];
export const praise = () => pick(PRAISE);

/** Bir etkinliğin sonucu: gösterilen ve ilk denemede bilinen kelimeler. */
export interface Result {
  seen: string[];
  got: string[];
}
export const noResult: Result = { seen: [], got: [] };
export const merge = (a: Result, b: Result): Result => ({ seen: [...a.seen, ...b.seen], got: [...a.got, ...b.got] });

/** Tam ekran etkinlik çerçevesi: kapat, ilerleme noktaları, sesi tekrar dinle. */
export function PlayFrame({ title, step, total, onClose, onReplay, children, footer, tone = 'sky' }: {
  title?: ReactNode; step?: number; total?: number; onClose: () => void; onReplay?: () => void;
  children: ReactNode; footer?: ReactNode; tone?: 'sky' | 'sun' | 'mint' | 'night';
}) {
  useEffect(() => () => hush(), []);
  return (
    <div className={`en-play en-play--${tone}`}>
      <header className="en-play__bar">
        <button className="round-btn round-btn--light" aria-label="Kapat" onClick={onClose}><X size={26} strokeWidth={2.6} /></button>
        <div className="en-play__title">
          {title && <b>{title}</b>}
          {total ? (
            <span className="en-dots" aria-label={`${(step ?? 0) + 1} / ${total}`}>
              {Array.from({ length: total }, (_, i) => <i key={i} className={i < (step ?? 0) ? 'done' : i === step ? 'on' : ''} />)}
            </span>
          ) : null}
        </div>
        {onReplay ? (
          <button className="round-btn round-btn--light" aria-label="Tekrar dinle" onClick={onReplay}><Volume2 size={26} strokeWidth={2.4} /></button>
        ) : <span style={{ width: 52 }} />}
      </header>
      <main className="en-play__stage">{children}</main>
      {footer && <footer className="en-play__foot">{footer}</footer>}
    </div>
  );
}

/** Etkinlik sonu: Çizio sevinir, kazanılan yıldızlar gösterilir. */
export function EndCard({ title, stars, children }: { title: string; stars: number; children?: ReactNode }) {
  return (
    <div className="en-end rise">
      <Mascot size={150} mood="cheer" className="float" />
      <h2 className="title-lg">{title}</h2>
      {stars > 0 ? (
        <p className="en-end__stars"><StarIcon size={30} /> <b>+{stars}</b> yıldız</p>
      ) : (
        <p className="sub">Bugünlük oyun yıldızlarını topladın. Oynamaya devam edebilirsin!</p>
      )}
      <div className="en-end__actions">{children}</div>
    </div>
  );
}
