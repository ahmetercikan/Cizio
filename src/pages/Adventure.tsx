/**
 * Çizio'nun maceraları: ders yolları haritada durak olarak dizilir. Durağın bütün dersleri bitince
 * Çizio o durağın kıyafetini kazanır; gardıroptan istediği kıyafeti giydirilir.
 */
import { Check, Lock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { Mascot } from '../components/Mascot';
import { getOutfit, OUTFITS } from '../components/Outfits';
import { SketchImg } from '../components/Sketch';
import { getPath, lessonsByPath } from '../lessons';
import { chapterStates } from '../lib/adventure';
import { sfx } from '../lib/sfx';
import { useApp, useProfileData } from '../store/useApp';

export default function Adventure() {
  const data = useProfileData();
  const setOutfit = useApp((s) => s.setOutfit);
  const chapters = chapterStates(data);
  const doneCount = chapters.filter((c) => c.complete).length;
  const here = chapters.findIndex((c) => !c.complete);
  const unlocked = new Set(chapters.filter((c) => c.complete).map((c) => c.outfit));

  return (
    <AppShell flow={2}>
      <header className="page-head rise">
        <div>
          <p className="sub">Durakları tamamla, Çizio'ya kıyafet kazan!</p>
          <h1 className="title-xl">Çizio'nun maceraları</h1>
        </div>
        <div className="chips">
          <span className="chip"><MapPin size={20} color="#de4d2d" /> {doneCount} / {chapters.length} durak</span>
        </div>
      </header>

      {/* Gardırop */}
      <section className="wardrobe rise">
        <div className="wardrobe__stage">
          <Mascot size={120} mood="cheer" className="float" />
          <b>{getOutfit(data.outfit)?.title ?? 'Kıyafetsiz'}</b>
        </div>
        <div className="wardrobe__list" role="listbox" aria-label="Kıyafetler">
          <button type="button" role="option" aria-selected={!data.outfit} className={`outfit-chip ${!data.outfit ? 'on' : ''}`}
            onClick={() => { sfx.tap(); setOutfit(undefined); }}>
            <Mascot size={46} outfit="none" />
            <span>Kıyafetsiz</span>
          </button>
          {OUTFITS.map((o) => {
            const open = unlocked.has(o.id);
            const ch = chapters.find((c) => c.outfit === o.id);
            return (
              <button key={o.id} type="button" role="option" aria-selected={data.outfit === o.id} disabled={!open}
                className={`outfit-chip ${data.outfit === o.id ? 'on' : ''} ${open ? '' : 'locked'}`}
                title={open ? o.title : `${ch?.place ?? ''} durağını bitir`}
                onClick={() => { sfx.pop(); setOutfit(o.id); }}>
                <Mascot size={46} outfit={o.id} />
                <span>{open ? o.title : ch?.place}</span>
                {!open && <Lock size={14} className="outfit-chip__lock" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* Harita */}
      <ol className="adv-map">
        {chapters.map((c, i) => {
          const path = getPath(c.path);
          const first = lessonsByPath(c.path)[0];
          const state = c.complete ? 'done' : i === here ? 'here' : '';
          return (
            <li key={c.path} className={`adv-stop ${state} ${i % 2 ? 'adv-stop--right' : ''}`} style={{ ['--pc' as string]: path?.color }}>
              <Link to={`/yol/${c.path}`} className="adv-stop__card rise" style={{ animationDelay: `${i * 0.04}s` }}>
                <span className="adv-stop__art">
                  {first && <SketchImg lesson={first} mode={c.complete ? 'color' : 'graphite'} pad={14} />}
                  {state === 'here' && (
                    <span className="adv-stop__pin" aria-label="Buradasın"><Mascot size={40} mood="happy" /></span>
                  )}
                </span>
                <span className="adv-stop__text">
                  <em>{i + 1}. durak</em>
                  <b>{c.place}</b>
                  <span>{path?.title}</span>
                  <span className="adv-stop__bar"><i style={{ width: `${(c.done / Math.max(1, c.total)) * 100}%` }} /></span>
                  <small>{c.done} / {c.total} ders</small>
                </span>
                <span className={`adv-stop__prize ${c.complete ? 'won' : ''}`} title={getOutfit(c.outfit)?.title}>
                  <Mascot size={34} outfit={c.outfit} />
                  {c.complete ? <Check size={14} strokeWidth={3} className="adv-stop__check" /> : <Lock size={12} className="adv-stop__check" />}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </AppShell>
  );
}
