/**
 * Evim'in ekranları: üst çubuk (yaşam / eşya modu, altın, adaya dönüş), kamera düğmeleri, eşya kataloğu
 * (resimli kartlar, kategoriler, depo), yerleştirme kartı (renk, döndür, koy), seçili eşya kartı (döndür, renk,
 * taşı, sat), duvar ve zemin renkleri, ev planları.
 */
import { Check, LogOut, Minus, Move, Plus, RotateCcw, RotateCw, Sofa, Sparkles, X } from 'lucide-react';
import { PREMIUM_HINT, usePremium } from './premium';
import { GameIcon } from './GameIcon';
import { useMemo, useState } from 'react';
import { CATS, FLOORS, ITEMS, PLANS, WALLS, item, type Cat } from './homeData';
import type { GhostInfo, HomeScene, SelInfo } from './home';

export function HomeTop({ mode, coins, onMode, onLeave }: { mode: 'live' | 'build'; coins: number; onMode: (m: 'live' | 'build') => void; onLeave: () => void }) {
  return (
    <header className="home-top">
      <button className="pill pill--sm pill--yellow" onClick={onLeave}><LogOut size={18} /> Adaya dön</button>
      <div className="home-top__modes">
        <button className={mode === 'live' ? 'on' : ''} onClick={() => onMode('live')}><Sparkles size={18} /> Evde oyna</button>
        <button className={mode === 'build' ? 'on' : ''} onClick={() => onMode('build')}><Sofa size={18} /> Eşya ekle</button>
      </div>
      <span className="farm-coin home-top__coins"><GameIcon name="altin" size={23} /> {coins}</span>
    </header>
  );
}

export function CamButtons({ home }: { home: HomeScene }) {
  return (
    <div className="home-cam">
      <button aria-label="Uzaklaş" onClick={() => home.zoom(1.15)}><Minus size={20} /></button>
      <button aria-label="Yaklaş" onClick={() => home.zoom(1 / 1.15)}><Plus size={20} /></button>
      <button aria-label="Sola döndür" onClick={() => home.rotateStep(-1)}><RotateCcw size={20} /></button>
      <button aria-label="Sağa döndür" onClick={() => home.rotateStep(1)}><RotateCw size={20} /></button>
    </div>
  );
}

type Tab = Cat | 'finish' | 'plan' | 'store';

export function Catalog({ home, coins, onPick, onHint }: { home: HomeScene; coins: number; onPick: (id: string, fromStore: boolean) => void; onHint: (t: string) => void }) {
  const premium = usePremium((x) => x.owned);
  const [tab, setTab] = useState<Tab>('oturma');
  const [, force] = useState(0);
  const stored = home.state.stored;
  const items = useMemo(() => ITEMS.filter((i) => i.cat === tab), [tab]);
  const tabs: { id: Tab; name: string; icon: string }[] = [
    ...CATS,
    { id: 'finish', name: 'Duvar ve zemin', icon: 'rulo' },
    { id: 'plan', name: 'Ev planı', icon: 'ev' },
    ...(stored.length ? [{ id: 'store' as Tab, name: `Depo (${stored.length})`, icon: 'kutu' }] : []),
  ];
  return (
    <div className="home-cat rise">
      <div className="home-cat__tabs">
        {tabs.map((t) => (
          <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}><GameIcon name={t.icon} size={22} /> {t.name}</button>
        ))}
      </div>
      {tab === 'finish' ? (
        <div className="home-finish">
          {home.rooms().map((r) => (
            <div key={r.id} className="home-finish__row">
              <b>{r.name}</b>
              <span className="home-finish__sw">
                <small>Zemin</small>
                {FLOORS.map((f, i) => <button key={f.id} aria-label={f.name} className={r.floor === i ? 'on' : ''} style={{ background: f.color }} onClick={() => { home.setFinish(r.id, 'floor', i); force((x) => x + 1); }} />)}
              </span>
              <span className="home-finish__sw">
                <small>Duvar</small>
                {WALLS.map((c, i) => <button key={c} aria-label={`Duvar rengi ${i + 1}`} className={r.wall === i ? 'on' : ''} style={{ background: c }} onClick={() => { home.setFinish(r.id, 'wall', i); force((x) => x + 1); }} />)}
              </span>
            </div>
          ))}
        </div>
      ) : tab === 'plan' ? (
        <div className="home-cat__cards">
          {PLANS.map((p) => {
            const own = home.state.plans.includes(p.id) || (!!p.premium && premium.includes(p.premium)), now = home.state.plan === p.id;
            const locked = !!p.premium && !premium.includes(p.premium);
            return (
              <div key={p.id} className={`home-card home-card--plan ${now ? 'on' : ''}`}>
                <span className="home-card__plan">{p.rooms.length} oda · {p.w}×{p.d}</span>
                <b>{p.name}</b>
                {locked && <span className="crown-tag"><GameIcon name="tac" size={20} /></span>}
                {now ? <small>Şu an buradasın</small> : locked ? <button className="btn-outline btn-outline--sm" onClick={() => onHint(PREMIUM_HINT)}><GameIcon name="tac" size={20} /> Özel</button> : (
                  <button className="pill pill--sm" disabled={!own && coins < p.price} onClick={() => onPick(`@plan:${p.id}`, false)}>
                    {own ? 'Taşın' : <><GameIcon name="altin" size={21} /> {p.price}</>}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="home-cat__cards">
          {(tab === 'store' ? stored.map((id) => item(id)!).filter(Boolean) : items).map((it, k) => (
            <button key={`${it.id}${k}`} className={`home-card ${it.premium ? 'home-card--premium' : ''}`} disabled={tab !== 'store' && !it.premium && coins < it.price}
              onClick={() => (it.premium && !premium.includes(it.premium) && tab !== 'store' ? onHint(PREMIUM_HINT) : onPick(it.id, tab === 'store'))}>
              {it.premium && <span className="crown-tag"><GameIcon name="tac" size={20} /></span>}
              <img src={home.thumbnail(it.id)} alt="" />
              <b>{it.name}</b>
              <small>{tab === 'store' ? 'Depoda' : it.premium ? (premium.includes(it.premium) ? 'Senin' : 'Özel') : <><GameIcon name="altin" size={18} /> {it.price}</>}</small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function GhostCard({ g, home }: { g: GhostInfo; home: HomeScene }) {
  const it = item(g.id)!;
  return (
    <div className="home-ghost rise">
      <div className="home-ghost__head">
        <b>{it.name}</b>
        <small>{g.moving ? 'Taşınıyor' : g.price ? <><GameIcon name="altin" size={18} /> {g.price}</> : 'Bedava'}</small>
      </div>
      {it.colors.length > 1 && (
        <div className="home-sw">{it.colors.map((c, i) => <button key={c} aria-label={`Renk ${i + 1}`} style={{ background: c }} onClick={() => home.ghostColor(i)} />)}</div>
      )}
      <p className={g.ok ? 'ok' : 'bad'}>{g.ok ? 'Yeşil: buraya sığar! Tekrar dokun ya da "Buraya koy" de.' : g.err}</p>
      <div className="home-ghost__btns">
        <button className="btn-outline btn-outline--sm" onClick={() => home.rotateGhost()}><RotateCw size={16} /> Döndür</button>
        <button className="btn-outline btn-outline--sm" aria-label="Vazgeç" onClick={() => home.cancelGhost()}><X size={16} /></button>
        <button className="pill pill--sm" disabled={!g.ok} onClick={() => home.placeGhost()}><Check size={16} /> Buraya koy</button>
      </div>
    </div>
  );
}

export function SelCard({ s, home }: { s: SelInfo; home: HomeScene }) {
  return (
    <div className="home-ghost rise">
      <div className="home-ghost__head"><b>{s.name}</b></div>
      {s.colors.length > 1 && (
        <div className="home-sw">{s.colors.map((c, i) => <button key={c} aria-label={`Renk ${i + 1}`} className={s.c === i ? 'on' : ''} style={{ background: c }} onClick={() => home.selColor(i)} />)}</div>
      )}
      <div className="home-ghost__btns">
        <button className="btn-outline btn-outline--sm" onClick={() => home.selRotate()}><RotateCw size={16} /> Döndür</button>
        <button className="btn-outline btn-outline--sm" onClick={() => home.selMove()}><Move size={16} /> Taşı</button>
        <button className="btn-outline btn-outline--sm" onClick={() => home.selSell()}><GameIcon name="altin" size={21} /> Sat +{s.sell}</button>
        <button className="btn-outline btn-outline--sm" aria-label="Kapat" onClick={() => home.setMode('build')}><X size={16} /></button>
      </div>
    </div>
  );
}
