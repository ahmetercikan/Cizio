/**
 * Müze ekranı: adada bulunan balıklar, fosiller, kabuklar ve böcekler.
 *
 * Bulunmayan parçalar da görünür (soluk bir soru işaretiyle): çocuk neyi arayacağını bilir.
 * Bir parçaya dokununca adı ve kısa bilgisi çıkar.
 */
import { useState } from 'react';
import { X } from 'lucide-react';
import { Modal } from '../components/ui';
import { GameIcon } from './GameIcon';
import { sfx } from '../lib/sfx';
import { byGroup, counts, GROUPS, TOTAL, type CollectGroup, type Collectible } from './collection';

export function MuseumPanel({ found, onClose }: { found: string[]; onClose: () => void }) {
  const [sec, setSec] = useState<Collectible | null>(null);
  const say = counts(found);
  const gruplar = Object.keys(GROUPS) as CollectGroup[];

  return (
    <Modal onClose={onClose}>
    <div className="island__panel museum">
      <header className="museum__head">
        <div>
          <p className="sub">Bulduğun her şey burada</p>
          <h2 className="title-lg">Müze</h2>
        </div>
        <span className="museum__count">{found.length}/{TOTAL}</span>
        <button className="round-btn round-btn--light" aria-label="Kapat" onClick={() => { sfx.tap(); onClose(); }}><X size={24} /></button>
      </header>

      {found.length === TOTAL && <p className="museum__all">Bütün koleksiyonu tamamladın! Sen gerçek bir kâşifsin!</p>}

      <div className="museum__body">
        {gruplar.map((g) => (
          <section key={g} className="museum__group">
            <h3 className="museum__title" style={{ ['--gc' as string]: GROUPS[g].color }}>
              <GameIcon name={GROUPS[g].icon} size={22} /> {GROUPS[g].name}
              <small>{say[g].have}/{say[g].all}</small>
            </h3>
            <div className="museum__grid">
              {byGroup(g).map((c) => {
                const var_ = found.includes(c.id);
                return (
                  <button key={c.id} className={`museum__case ${var_ ? 'on' : ''} ${sec?.id === c.id ? 'sel' : ''}`}
                    style={{ ['--cc' as string]: c.color }}
                    onClick={() => { sfx.pop(); setSec(var_ ? c : null); }}>
                    <span className="museum__shape" aria-hidden="true">{var_ ? '' : '?'}</span>
                    <small>{var_ ? c.name : '???'}</small>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {sec && (
        <p className="museum__fact rise"><b>{sec.name}</b> {sec.fact}</p>
      )}
      <p className="museum__hint muted">
        Balıkları iskelede olta ile, fosilleri Dinozor Vadisi'nde kazarak, kabukları şnorkelle dalarak,
        böcekleri Evcil Hayvan Parkı'nın çiçeklerinde bulursun.
      </p>
    </div>
    </Modal>
  );
}
