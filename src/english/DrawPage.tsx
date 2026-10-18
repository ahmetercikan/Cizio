/**
 * Draw in English: çizim derslerini İngilizce anlatımla yapma.
 *
 * Aynı dersler, aynı çizimler — yalnızca Çizio İngilizce konuşur. Çocuk zaten bildiği bir şeyi
 * çizerken "circle, line, big, small, under, next to" gibi kelimeleri kendiliğinden öğrenir.
 * Ders sayfası `/ders/<id>?dil=en` adresiyle İngilizce kipte açılır.
 */
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { Mascot } from '../components/Mascot';
import { SketchImg } from '../components/Sketch';
import { Stars } from '../components/ui';
import { getLesson } from '../lessons';
import { sfx } from '../lib/sfx';
import { useProfileData } from '../store/useApp';
import { DRAW_UI, EN_DRAW, EN_DRAW_IDS } from './draw';
import { say } from './voice';

export default function EnglishDraw() {
  const data = useProfileData();
  useEffect(() => {
    say(DRAW_UI.intro);
  }, []);

  const dersler = EN_DRAW_IDS.map((id) => ({ id, lesson: getLesson(id)!, en: EN_DRAW[id] })).filter((x) => x.lesson);

  return (
    <AppShell>
      <header className="page-head rise">
        <div>
          <p className="sub">Same drawings, English words</p>
          <h1 className="title-xl">{DRAW_UI.intro}</h1>
        </div>
        <Mascot size={74} mood="happy" className="float" />
      </header>

      <p className="en-draw__note rise">
        Çizio bu derslerde İngilizce konuşur. Çocuk çizerken <b>circle, line, big, small, under</b> gibi
        kelimeleri duyar — çeviri yok, ezber yok.
      </p>

      <div className="en-draw__grid">
        {dersler.map(({ id, lesson, en }, i) => {
          const p = data.lessons[id];
          return (
            <Link key={id} to={`/ders/${id}?dil=en`} className="en-draw__card rise" style={{ animationDelay: `${i * 0.02}s` }} onClick={() => sfx.pop()}>
              <SketchImg lesson={lesson} pad={18} className="en-draw__img" />
              <span className="en-draw__text">
                <b>{en.title}</b>
                <small>{lesson.title}</small>
                {p ? <Stars value={p.bestStars} size={13} dim="rgba(29,23,64,0.12)" /> : <span className="en-draw__new">{en.steps.length} steps</span>}
              </span>
              <ChevronRight size={22} />
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
