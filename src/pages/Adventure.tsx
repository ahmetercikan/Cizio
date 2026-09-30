/**
 * Çizio'nun maceraları: ders yolları, ekranı boydan boya kaplayan bir haritada kıvrımlı yol üzerindeki
 * duraklardır. Duraklar sırayla açılır; bir durağın bütün dersleri bitince Çizio o durağın kıyafetini
 * kazanır. Gardırop, başlıktaki düğmeyle açılan bir pencerededir.
 */
import { Lock, MapPin } from 'lucide-react';
import { useState } from 'react';
import { AdventureMap } from '../components/AdventureMap';
import { AppShell } from '../components/AppShell';
import { Mascot } from '../components/Mascot';
import { getOutfit, OUTFITS } from '../components/Outfits';
import { Modal, useToast } from '../components/ui';
import { chapterStates, type ChapterState } from '../lib/adventure';
import { sfx } from '../lib/sfx';
import { useApp, useProfileData } from '../store/useApp';

export default function Adventure() {
  const data = useProfileData();
  const [toast, showToast] = useToast();
  const [wardrobe, setWardrobe] = useState(false);
  const chapters = chapterStates(data);
  const doneCount = chapters.filter((c) => c.complete).length;
  const here = chapters.findIndex((c) => !c.complete);

  return (
    <AppShell flow={2}>
      <header className="page-head adv-head rise">
        <div>
          <p className="sub">Durakları tamamla, Çizio'ya kıyafet kazan!</p>
          <h1 className="title-xl">Çizio'nun maceraları</h1>
        </div>
        <div className="chips">
          <span className="chip"><MapPin size={20} color="#de4d2d" /> {doneCount} / {chapters.length} durak</span>
          <button type="button" className="chip adv-wardrobe-btn" onClick={() => { sfx.pop(); setWardrobe(true); }}>
            <Mascot size={30} /> Gardırop
          </button>
        </div>
      </header>

      <AdventureMap chapters={chapters} here={here}
        onLocked={(i) => { sfx.soft(); showToast('Önce ' + chapters[i - 1].place + ' durağını bitir!'); }} />

      {wardrobe && <Wardrobe chapters={chapters} onClose={() => setWardrobe(false)} />}
      {toast}
    </AppShell>
  );
}

function Wardrobe({ chapters, onClose }: { chapters: ChapterState[]; onClose: () => void }) {
  const data = useProfileData();
  const setOutfit = useApp((s) => s.setOutfit);
  const unlocked = new Set(chapters.filter((c) => c.complete).map((c) => c.outfit));
  return (
    <Modal onClose={onClose} className="wardrobe-modal">
      <div className="wardrobe">
        <div className="wardrobe__stage">
          <Mascot size={110} mood="cheer" className="float" />
          <b>{getOutfit(data.outfit)?.title ?? 'Kıyafetsiz'}</b>
        </div>
        <div className="wardrobe__list" role="listbox" aria-label="Kıyafetler">
          <button type="button" role="option" aria-selected={!data.outfit} className={`outfit-chip ${!data.outfit ? 'on' : ''}`}
            onClick={() => { sfx.select(); setOutfit(undefined); }}>
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
                onClick={() => { sfx.wear(); setOutfit(o.id); }}>
                <Mascot size={46} outfit={o.id} />
                <span>{open ? o.title : ch?.place}</span>
                {!open && <Lock size={14} className="outfit-chip__lock" />}
              </button>
            );
          })}
        </div>
      </div>
      <div className="wardrobe-modal__actions">
        <button type="button" className="btn-dark" onClick={onClose}>Tamam</button>
      </div>
    </Modal>
  );
}
