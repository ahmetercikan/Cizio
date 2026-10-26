/**
 * Çiftliğim ve Pazar'ın ekranları: altın ve seviye göstergesi, pazar (sat / al / siparişler), tohum seçimi,
 * mutfak, çiftçi defteri, inşa çubuğu, hazır yapılar, seviye kutlaması ve macera ekranları.
 * Kurallar src/world/economy.ts'te; burada yalnızca gösterilir ve `apply` ile uygulanır.
 */
import { Backpack, BookOpen, Car, Check, ChefHat, ChevronsUp, ClipboardList, Hammer, LogOut, Pickaxe, RotateCcw, Store, Trophy, Undo2, X } from 'lucide-react';
import { CARS } from './carsData';
import { GameIcon } from './GameIcon';
import { PREMIUM_HINT, usePremium } from './premium';
import { useState, type ReactNode } from 'react';
import { Modal } from '../components/ui';
import {
  ANIMALS, BLOCKS, BLUEPRINTS, buyAnimal, buyCar, STRUCTS, structPrice, buyItem, buyPack, buyPrice, buyable, canCraft, canFill, clock, countAnimals, craft, CROPS, fillOrder,
  ITEM_ICON, ITEM_NAME, JOURNEY, levelOf, levelProgress, PACKS, plant, plantAll, PRICE, RECIPES, sell, sellable, skipOrder, type BlockDef, type CropId,
  type FarmState, type ItemId, type Result,
} from './economy';

export type Apply = <R extends Result>(f: (s: FarmState) => R) => R;

const Coin = ({ n }: { n: number }) => <span className="farm-coin"><GameIcon name="altin" size={22} /> {n}</span>;

/** Sol üst (PK XD gibi): karakterin resmi, seviyesi ve ince seviye çubuğu; dokununca çiftçi defteri. */
export function PlayerBadge({ avatar, name, s, onOpen }: { avatar: ReactNode; name: string; s: FarmState; onOpen: () => void }) {
  const lv = levelOf(s.xp);
  const [a, b] = levelProgress(s.xp);
  return (
    <button className="hud-player" onClick={onOpen} aria-label="Çiftçi defterim">
      <span className="hud-player__pic">{avatar}<i>{lv}</i></span>
      <span className="hud-player__info">
        <b>{name}</b>
        <span className="hud-player__bar"><i style={{ width: `${Math.round((a / b) * 100)}%` }} /></span>
      </span>
    </button>
  );
}

/** Sağ üst: küçük altın göstergesi. */
export function CoinChip({ n }: { n: number }) {
  return <span className="hud-coins"><GameIcon name="altin" size={22} /> {n}</span>;
}

/** Sol kenarda küçük, kapatılabilir "sıradaki hedef" notu. */
export function JourneyNote({ s, open, onToggle, onOpen }: { s: FarmState; open: boolean; onToggle: () => void; onOpen: () => void }) {
  const step = JOURNEY[s.journey];
  if (!step) return null;
  return open ? (
    <div className="hud-note">
      <button className="hud-note__text" onClick={onOpen}><BookOpen size={15} /> {step.text}</button>
      <button className="hud-note__x" aria-label="Notu kapat" onClick={onToggle}><X size={14} /></button>
    </div>
  ) : (
    <button className="hud-side__btn hud-side__btn--sm" aria-label="Sıradaki hedef" onClick={onToggle}><BookOpen size={20} /></button>
  );
}

/** Üstte: altın, seviye çubuğu ve sıradaki defter adımı. */
export function FarmHud({ s, onOpen }: { s: FarmState; onOpen: () => void }) {
  const lv = levelOf(s.xp);
  const [a, b] = levelProgress(s.xp);
  return (
    <button className="farm-hud" onClick={onOpen} aria-label="Çiftçi defteri">
      <span className="farm-hud__lv">{lv}</span>
      <span className="farm-hud__bar"><i style={{ width: `${Math.round((a / b) * 100)}%` }} /></span>
      <Coin n={s.coins} />
    </button>
  );
}

export function JourneyChip({ s, onOpen }: { s: FarmState; onOpen: () => void }) {
  const step = JOURNEY[s.journey];
  if (!step) return null;
  return (
    <button className="farm-chip" onClick={onOpen}><BookOpen size={16} /> {step.text}</button>
  );
}

function Panel({ title, icon, onClose, children, wide }: { title: string; icon?: ReactNode; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <Modal onClose={onClose} className={wide ? 'modal--wide farm-modal' : 'farm-modal'}>
      <div className="art-view__head">
        <b className="title-lg">{icon} {title}</b>
        <button className="round-btn round-btn--light" aria-label="Kapat" onClick={onClose}><X /></button>
      </div>
      {children}
    </Modal>
  );
}

// ------------------------------------------------------------------------------------------------
// Pazar
// ------------------------------------------------------------------------------------------------
/** Sahip olunan arabalar: altınla alınanlar + açık özel paketteki arabalar. */
export function ownedCars(s: FarmState, premium: string[]) {
  return CARS.filter((c) => (c.premium ? premium.includes(c.premium) : (s.cars ?? []).includes(c.id))).map((c) => c.id);
}

function CarsTab({ s, apply, onHint }: { s: FarmState; apply: Apply; onHint: (t: string) => void }) {
  const premium = usePremium((x) => x.owned);
  const own = ownedCars(s, premium);
  const lv = levelOf(s.xp);
  return (
    <ul className="farm-list">
      {CARS.map((c) => {
        const has = own.includes(c.id), locked = !c.premium && lv < c.level, now = (s.car ?? own[0]) === c.id;
        return (
          <li key={c.id} className={locked ? 'locked' : ''}>
            <GameIcon name={c.icon} size={40} className="farm-emoji" />
            <span className="farm-list__name"><b>{c.name}</b><small>{c.fly ? 'Denizin üstünden bile uçar!' : locked ? `${c.level}. seviyede açılır` : `Hız ${c.speed}`}</small></span>
            {has ? (now ? <span className="premium-list__own"><Check size={18} /> Seçili</span> : <button className="btn-outline btn-outline--sm" onClick={() => apply((x) => ({ s: { ...x, car: c.id }, msg: `${c.name} seçildi.` }))}>Bunu kullan</button>)
              : c.premium ? <button className="btn-outline btn-outline--sm" aria-label="Özel araba" onClick={() => onHint(PREMIUM_HINT)}><GameIcon name="tac" size={22} /></button>
                : locked ? <GameIcon name="kilit" size={26} /> : <button className="pill pill--sm" disabled={s.coins < c.price} onClick={() => apply((x) => buyCar(x, c.id))}><GameIcon name="altin" size={20} /> {c.price}</button>}
          </li>
        );
      })}
    </ul>
  );
}

export function MarketPanel({ s, apply, tab: tab0, onClose, onSold, onHint }: { s: FarmState; apply: Apply; tab?: 'sell' | 'buy' | 'orders' | 'cars'; onClose: () => void; onSold: () => void; onHint: (t: string) => void }) {
  const [tab, setTab] = useState<'sell' | 'buy' | 'orders' | 'cars'>(tab0 ?? 'sell');
  const lv = levelOf(s.xp);
  const items = sellable(s);
  const sellAll = () => {
    let any = false;
    apply((x) => {
      let cur: Result = { s: x };
      let coins = 0;
      for (const id of sellable(x)) {
        const before = cur.s.coins;
        const r = sell(cur.s, id, x.inv[id] ?? 0);
        cur = { s: r.s, levelUp: r.levelUp ?? cur.levelUp };
        coins += r.s.coins - before;
        any = true;
      }
      return { ...cur, msg: `+${coins} altın` };
    });
    if (any) onSold();
  };
  return (
    <Panel title="Pazar" icon={<Store size={24} style={{ verticalAlign: '-4px' }} />} onClose={onClose} wide>
      <div className="farm-tabs">
        <button className={tab === 'sell' ? 'on' : ''} onClick={() => setTab('sell')}>Sat</button>
        <button className={tab === 'buy' ? 'on' : ''} onClick={() => setTab('buy')}>Al</button>
        <button className={tab === 'orders' ? 'on' : ''} onClick={() => setTab('orders')}>Siparişler</button>
        <button className={tab === 'cars' ? 'on' : ''} onClick={() => setTab('cars')}><Car size={16} style={{ verticalAlign: '-3px' }} /> Arabalar</button>
        <Coin n={s.coins} />
      </div>
      {tab === 'sell' && (
        items.length === 0 ? <p className="sub">Satacak ürünün yok. Çiftliğinde ürün yetiştir, hayvanlarını besle!</p> : (
          <>
            <ul className="farm-list">
              {items.map((id) => (
                <li key={id}>
                  <GameIcon name={ITEM_ICON[id]} size={40} className="farm-emoji" />
                  <span className="farm-list__name"><b>{ITEM_NAME[id]}</b><small>{s.inv[id]} tane · tanesi {PRICE[id]} altın</small></span>
                  <button className="pill pill--sm" onClick={() => { apply((x) => sell(x, id, 1)); onSold(); }}>1 sat</button>
                  {(s.inv[id] ?? 0) > 1 && <button className="btn-outline btn-outline--sm" onClick={() => { apply((x) => sell(x, id, x.inv[id] ?? 0)); onSold(); }}>Hepsi</button>}
                </li>
              ))}
            </ul>
            <button className="pill pill--yellow" onClick={sellAll}><GameIcon name="altin" size={24} /> Hepsini sat</button>
          </>
        )
      )}
      {tab === 'buy' && (
        <div className="farm-shop">
          <h3>Hayvanlar</h3>
          <ul className="farm-list">
            {ANIMALS.map((a) => {
              const locked = lv < a.level, n = countAnimals(s, a.id);
              return (
                <li key={a.id} className={locked ? 'locked' : ''}>
                  <GameIcon name={a.icon} size={40} className="farm-emoji" />
                  <span className="farm-list__name"><b>{a.name}</b><small>{locked ? `${a.level}. seviyede açılır` : <><GameIcon name={ITEM_ICON[a.eats]} size={18} /> yer, <GameIcon name={ITEM_ICON[a.product]} size={18} /> verir · {n}/{a.max}</>}</small></span>
                  {locked ? <GameIcon name="kilit" size={26} /> : <button className="pill pill--sm" disabled={n >= a.max} onClick={() => apply((x) => buyAnimal(x, a.id))}><GameIcon name="altin" size={20} /> {a.cost}</button>}
                </li>
              );
            })}
          </ul>
          <h3>Yem ve ürün</h3>
          <ul className="farm-list">
            {buyable(s).map((id) => (
              <li key={id}>
                <GameIcon name={ITEM_ICON[id]} size={40} className="farm-emoji" />
                <span className="farm-list__name"><b>{ITEM_NAME[id]}</b><small>Elinde {s.inv[id] ?? 0}</small></span>
                <button className="pill pill--sm" onClick={() => apply((x) => buyItem(x, id, 1))}><GameIcon name="altin" size={20} /> {buyPrice(id)}</button>
              </li>
            ))}
          </ul>
          <h3>İnşa blokları</h3>
          <ul className="farm-list">
            {PACKS.filter((p) => p.price > 0).map((p) => {
              const own = s.packs.includes(p.id), locked = lv < p.level;
              return (
                <li key={p.id} className={locked ? 'locked' : ''}>
                  <GameIcon name={p.icon} size={40} className="farm-emoji" />
                  <span className="farm-list__name"><b>{p.name}</b><small>{own ? 'Senin' : locked ? `${p.level}. seviyede açılır` : 'Bir kez al, istediğin kadar kullan'}</small></span>
                  {own ? <Check size={22} color="var(--green)" /> : locked ? <GameIcon name="kilit" size={26} /> : <button className="pill pill--sm" onClick={() => apply((x) => buyPack(x, p.id))}><GameIcon name="altin" size={20} /> {p.price}</button>}
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {tab === 'orders' && <Orders s={s} apply={apply} onSold={onSold} />}
      {tab === 'cars' && <CarsTab s={s} apply={apply} onHint={onHint} />}
    </Panel>
  );
}

function Orders({ s, apply, onSold }: { s: FarmState; apply: Apply; onSold: () => void }) {
  return (
    <div className="farm-orders">
      {s.orders.map((o) => {
        const ok = canFill(s, o);
        return (
          <div key={o.id} className={`farm-order ${ok ? 'ready' : ''}`}>
            <b>{o.who}</b>
            <div className="farm-order__needs">
              {Object.entries(o.needs).map(([k, n]) => {
                const have = s.inv[k as ItemId] ?? 0;
                return <span key={k} className={have >= n! ? 'ok' : ''}><GameIcon name={ITEM_ICON[k as ItemId]} size={22} /> {Math.min(have, n!)}/{n}</span>;
              })}
            </div>
            <small><GameIcon name="altin" size={18} /> {o.coins} · <GameIcon name="yildiz" size={18} /> {o.xp} deneyim</small>
            <div className="farm-order__btns">
              <button className="pill pill--sm" disabled={!ok} onClick={() => { apply((x) => fillOrder(x, o.id)); onSold(); }}>Teslim et</button>
              <button className="btn-outline btn-outline--sm" aria-label="Başka sipariş" onClick={() => apply((x) => ({ s: skipOrder(x, o.id) }))}><RotateCcw size={16} /></button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function OrdersPanel({ s, apply, onClose, onSold }: { s: FarmState; apply: Apply; onClose: () => void; onSold: () => void }) {
  return (
    <Panel title="Sipariş panosu" icon={<ClipboardList size={24} style={{ verticalAlign: '-4px' }} />} onClose={onClose} wide>
      <p className="sub" style={{ marginTop: 0 }}>Adadaki hayvan dostların ürün istiyor. Teslim et, bol altın ve deneyim kazan!</p>
      <Orders s={s} apply={apply} onSold={onSold} />
    </Panel>
  );
}

// ------------------------------------------------------------------------------------------------
// Tohum seçimi
// ------------------------------------------------------------------------------------------------
export function SeedPanel({ s, field, apply, onClose }: { s: FarmState; field: number; apply: Apply; onClose: () => void }) {
  const lv = levelOf(s.xp);
  const empty = s.fields.filter((f) => !f.c).length;
  const go = (c: CropId, all: boolean) => {
    const r = apply((x) => (all ? plantAll(x, c) : plant(x, field, c)));
    if (!r.err) onClose();
  };
  return (
    <Panel title="Ne ekelim?" onClose={onClose} wide>
      <ul className="farm-list">
        {CROPS.map((c) => {
          const locked = lv < c.level;
          return (
            <li key={c.id} className={locked ? 'locked' : ''}>
              <GameIcon name={c.icon} size={40} className="farm-emoji" />
              <span className="farm-list__name"><b>{c.name}</b><small>{locked ? `${c.level}. seviyede açılır` : `${clock(c.grow)} dakikada ${c.yield} tane · tanesi ${PRICE[c.id]} altın`}</small></span>
              {locked ? <GameIcon name="kilit" size={26} /> : (
                <>
                  <button className="pill pill--sm" onClick={() => go(c.id, false)}><GameIcon name="altin" size={20} /> {c.seed}</button>
                  {empty > 1 && <button className="btn-outline btn-outline--sm" onClick={() => go(c.id, true)}>Hepsine ek</button>}
                </>
              )}
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

// ------------------------------------------------------------------------------------------------
// Mutfak
// ------------------------------------------------------------------------------------------------
export function KitchenPanel({ s, apply, onClose, onCook }: { s: FarmState; apply: Apply; onClose: () => void; onCook: () => void }) {
  const lv = levelOf(s.xp);
  return (
    <Panel title="Mutfak" icon={<ChefHat size={24} style={{ verticalAlign: '-4px' }} />} onClose={onClose} wide>
      <p className="sub" style={{ marginTop: 0 }}>Ürünlerinden yemek yap; pazarda daha çok altına satılır!</p>
      <ul className="farm-list">
        {RECIPES.map((r) => {
          const locked = lv < r.level;
          return (
            <li key={r.id} className={locked ? 'locked' : ''}>
              <GameIcon name={r.icon} size={40} className="farm-emoji" />
              <span className="farm-list__name">
                <b>{r.name} <small>({PRICE[r.id]} altın)</small></b>
                <small className="farm-needs">{locked ? `${r.level}. seviyede açılır` : Object.entries(r.needs).map(([k, n]) => <span key={k}><GameIcon name={ITEM_ICON[k as ItemId]} size={18} /> {s.inv[k as ItemId] ?? 0}/{n}</span>)}</small>
              </span>
              {locked ? <GameIcon name="kilit" size={26} /> : <button className="pill pill--sm" disabled={!canCraft(s, r.id)} onClick={() => { const x = apply((f) => craft(f, r.id)); if (!x.err) onCook(); }}>Yap</button>}
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

// ------------------------------------------------------------------------------------------------
// Çiftçi defteri
// ------------------------------------------------------------------------------------------------
export function JournalPanel({ s, onClose }: { s: FarmState; onClose: () => void }) {
  const lv = levelOf(s.xp);
  const [a, b] = levelProgress(s.xp);
  const inv = sellable(s);
  return (
    <Panel title="Çiftçi defterim" icon={<BookOpen size={24} style={{ verticalAlign: '-4px' }} />} onClose={onClose} wide>
      <div className="farm-journal__top">
        <span className="farm-hud__lv big">{lv}</span>
        <div>
          <b>{lv}. seviye çiftçi</b>
          <span className="farm-hud__bar wide"><i style={{ width: `${Math.round((a / b) * 100)}%` }} /></span>
          <small>Sonraki seviyeye {b - a} deneyim kaldı</small>
        </div>
        <Coin n={s.coins} />
      </div>
      <ul className="island__qlist">
        {JOURNEY.map((st, i) => i <= s.journey + 2 && (
          <li key={i} className={i < s.journey ? 'done' : i === s.journey ? 'now' : 'next'}>
            <span className="island__check">{i < s.journey && <Check size={18} strokeWidth={3} />}</span>
            <span style={{ flex: 1 }}>{st.text}</span>
            <small><GameIcon name="altin" size={18} /> {st.coins}</small>
          </li>
        ))}
      </ul>
      {s.journey >= JOURNEY.length && <p className="sub">Defterin bitti, sen artık usta bir çiftçisin!</p>}
      <h3 className="farm-h3">Ambarım</h3>
      {inv.length ? <div className="farm-inv">{inv.map((id) => <span key={id}><GameIcon name={ITEM_ICON[id]} size={22} /> {s.inv[id]}</span>)}</div> : <p className="sub">Ambarın boş.</p>}
    </Panel>
  );
}

// ------------------------------------------------------------------------------------------------
// İnşa
// ------------------------------------------------------------------------------------------------
const MODEL_ICON: Record<string, string> = { kapi: 'kapi', cicek: 'lale', fidan: 'agac', cit: 'cit', bank: 'bank', fener: 'fener', masa: 'masa', sandalye: 'sandalye', yatak: 'yatak', kitaplik: 'kitaplik', kardanadam: 'kardanadam' };

function Swatch({ b }: { b: BlockDef }) {
  if (b.kind === 'model') return <GameIcon name={MODEL_ICON[b.id] ?? 'kutu'} size={32} />;
  return <span className={`build-swatch build-swatch--${b.kind}`} style={{ background: b.color, borderTopColor: b.top ?? b.color }} />;
}

/** Hızlı çubuktaki kutu sayısı (kazmadan başka). */
const SLOTS = 8;
const HOTBAR_KEY = 'cizio-hotbar';

/** Çubuktaki bir araç geçerli mi: sahip olunan blok ya da bilinen yapı. */
const validTool = (s: FarmState, t: string) =>
  t.startsWith('struct:') ? STRUCTS.some((d) => `struct:${d.k}` === t) : BLOCKS.some((b) => b.id === t && s.packs.includes(b.pack));

/** Hızlı çubuk: çocuğun en son dizdiği bloklar (yoksa ilk sekiz blok). */
function loadBar(s: FarmState): string[] {
  let saved: string[] = [];
  try {
    const j = JSON.parse(localStorage.getItem(HOTBAR_KEY) ?? '[]');
    if (Array.isArray(j)) saved = j.filter((t): t is string => typeof t === 'string');
  } catch {
    /* yok say */
  }
  const bar = saved.filter((t, i) => validTool(s, t) && saved.indexOf(t) === i).slice(0, SLOTS);
  for (const b of BLOCKS) {
    if (bar.length >= SLOTS) break;
    if (s.packs.includes(b.pack) && !bar.includes(b.id)) bar.push(b.id);
  }
  return bar;
}

function toolName(t: string) {
  if (t === 'erase') return 'Kazma';
  if (t.startsWith('struct:')) return STRUCTS.find((d) => `struct:${d.k}` === t)?.name ?? '';
  return BLOCKS.find((b) => b.id === t)?.name ?? '';
}

function ToolIcon({ t, size = 30 }: { t: string; size?: number }) {
  if (t === 'erase') return <Pickaxe size={size - 4} />;
  if (t.startsWith('struct:')) return <GameIcon name={STRUCTS.find((d) => `struct:${d.k}` === t)?.icon ?? 'kutu'} size={size} />;
  const b = BLOCKS.find((x) => x.id === t);
  return b ? <Swatch b={b} /> : null;
}

/**
 * İnşa: Minecraft'taki gibi altta tek sıra hızlı çubuk. Seçilen blok karakterin elinde durur, çubuk ekranı kapatmaz.
 * Bütün bloklar ve yapılar Çanta'da; oradan seçilen şey çubuktaki seçili kutuya geçer.
 */
export function BuildBar({ s, tool, onTool, onUndo, onBlueprints, onDone, onJump }: {
  s: FarmState; tool: string; onTool: (t: string) => void; onUndo: () => void; onBlueprints: () => void; onDone: () => void; onJump: () => void;
}) {
  const [bar, setBar] = useState(() => loadBar(s));
  const [slot, setSlot] = useState(() => Math.max(0, bar.indexOf(tool)));
  const [bag, setBag] = useState(false);
  const lv = levelOf(s.xp);
  const structOff = (t: string) => {
    const d = STRUCTS.find((x) => `struct:${x.k}` === t);
    return !!d && (lv < d.level || (d.k !== 'tarla' && s.places.some((p) => p.k === d.k)));
  };
  const choose = (t: string, i: number) => {
    setSlot(i);
    onTool(t);
  };
  /** Çanta'dan seçilen: çubukta varsa o kutu, yoksa seçili kutunun yerine geçer. */
  const fromBag = (t: string) => {
    let i = bar.indexOf(t);
    if (i < 0) {
      i = slot;
      const nb = bar.slice();
      nb[i] = t;
      setBar(nb);
      try {
        localStorage.setItem(HOTBAR_KEY, JSON.stringify(nb));
      } catch {
        /* yok say */
      }
    }
    choose(t, i);
    setBag(false);
  };
  return (
    <>
      <button className="build-done pill pill--sm rise" onClick={onDone}><Check size={18} /> Bitti</button>
      <div className="build-side rise">
        <button className="build-round build-round--sm" onClick={onUndo} aria-label="Geri al"><Undo2 size={22} /></button>
        <button className="build-round" onClick={onJump} aria-label="Zıpla"><ChevronsUp size={30} /><small>Zıpla</small></button>
      </div>
      <div className="hotbar rise">
        <div className="hotbar__name">
          <b>{toolName(tool)}</b>
          <span>{tool === 'erase' ? 'Kaldırmak istediğine dokun' : tool.startsWith('struct:') ? 'Düz bir yere dokun' : 'Yere ya da bir bloğa dokun'}</span>
        </div>
        <div className="hotbar__slots">
          <button className={`hotbar__slot hotbar__slot--erase ${tool === 'erase' ? 'on' : ''}`} onClick={() => onTool('erase')} aria-label="Kazma: sil">
            <ToolIcon t="erase" />
          </button>
          {bar.map((t, i) => (
            <button key={i} className={`hotbar__slot ${tool === t ? 'on' : ''} ${structOff(t) ? 'off' : ''}`} onClick={() => choose(t, i)} aria-label={toolName(t)}>
              <ToolIcon t={t} />
            </button>
          ))}
          <button className="hotbar__slot hotbar__bag" onClick={() => setBag(true)} aria-label="Çanta: bütün bloklar">
            <Backpack size={26} />
          </button>
        </div>
      </div>
      {bag && <BuildBag s={s} tool={tool} onPick={fromBag} onBlueprints={() => { setBag(false); onBlueprints(); }} onClose={() => setBag(false)} />}
    </>
  );
}

/** Çanta: bütün bloklar, çiftlik yapıları ve hazır yapılar. */
function BuildBag({ s, tool, onPick, onBlueprints, onClose }: {
  s: FarmState; tool: string; onPick: (t: string) => void; onBlueprints: () => void; onClose: () => void;
}) {
  const [tab, setTab] = useState<'blocks' | 'structs'>(tool.startsWith('struct:') ? 'structs' : 'blocks');
  const blocks = BLOCKS.filter((b) => s.packs.includes(b.pack));
  const more = PACKS.some((p) => p.price > 0 && !s.packs.includes(p.id));
  const lv = levelOf(s.xp);
  return (
    <Panel title="Çanta" icon={<Backpack size={24} style={{ verticalAlign: '-4px' }} />} onClose={onClose} wide>
      <div className="build-bar__tabs">
        <button className={tab === 'blocks' ? 'on' : ''} onClick={() => setTab('blocks')}><GameIcon name="tugla" size={20} /> Bloklar</button>
        <button className={tab === 'structs' ? 'on' : ''} onClick={() => setTab('structs')}><GameIcon name="tarla" size={20} /> Yapılar</button>
        <button onClick={onBlueprints}><Hammer size={18} /> Hazır yapılar</button>
      </div>
      <div className="build-bag">
        {tab === 'blocks' ? (
          <>
            {blocks.map((b) => (
              <button key={b.id} className={`build-tool ${tool === b.id ? 'on' : ''}`} onClick={() => onPick(b.id)} aria-label={b.name}><Swatch b={b} /><small>{b.name}</small></button>
            ))}
            {more && <span className="build-more"><Store size={16} /> Daha fazla blok Pazar'da</span>}
          </>
        ) : STRUCTS.map((d) => {
          const locked = lv < d.level, price = structPrice(s, d.k), has = d.k !== 'tarla' && s.places.some((p) => p.k === d.k);
          return (
            <button key={d.k} className={`build-tool build-tool--struct ${tool === `struct:${d.k}` ? 'on' : ''}`} disabled={locked || has} onClick={() => onPick(`struct:${d.k}`)} aria-label={d.name}>
              <GameIcon name={locked ? 'kilit' : d.icon} size={32} />
              <small>{d.name}</small>
              <small className="build-tool__price">{locked ? `${d.level}. seviye` : has ? 'Kurulu' : price ? `${price} altın` : 'Bedava'}</small>
            </button>
          );
        })}
      </div>
      <p className="sub build-bag__hint">Seçtiğin şey alttaki çubuğa ve karakterinin eline geçer.</p>
    </Panel>
  );
}

export function BlueprintPanel({ s, onPick, onClose }: { s: FarmState; onPick: (id: string) => void; onClose: () => void }) {
  const lv = levelOf(s.xp);
  return (
    <Panel title="Hazır yapılar" icon={<Hammer size={24} style={{ verticalAlign: '-4px' }} />} onClose={onClose} wide>
      <p className="sub" style={{ marginTop: 0 }}>Bir dokunuşta kurulur; sonra istediğin gibi değiştirebilirsin.</p>
      <ul className="farm-list">
        {BLUEPRINTS.map((b) => {
          const locked = lv < b.level;
          return (
            <li key={b.id} className={locked ? 'locked' : ''}>
              <GameIcon name={b.icon} size={40} className="farm-emoji" />
              <span className="farm-list__name"><b>{b.name}</b><small>{locked ? `${b.level}. seviyede açılır` : 'Yanındaki boş yere kurulur'}</small></span>
              {locked ? <GameIcon name="kilit" size={26} /> : <button className="pill pill--sm" disabled={s.coins < b.price} onClick={() => onPick(b.id)}><GameIcon name="altin" size={20} /> {b.price}</button>}
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

// ------------------------------------------------------------------------------------------------
// Kutlamalar ve macera
// ------------------------------------------------------------------------------------------------
export function LevelUp({ level, unlocks, onClose }: { level: number; unlocks: { icon: string; name: string }[]; onClose: () => void }) {
  return (
    <Modal onClose={onClose}>
      <div className="island__panel">
        <span className="farm-hud__lv huge">{level}</span>
        <h2 className="title-lg">Seviye atladın!</h2>
        <p className="sub">Artık {level}. seviye çiftçisin. Hediyen: {10 * (level - 1)} altın!</p>
        {unlocks.length > 0 && (
          <>
            <b>Yeni açılanlar</b>
            <div className="farm-inv">{unlocks.map((u) => <span key={u.name}><GameIcon name={u.icon} size={22} /> {u.name}</span>)}</div>
          </>
        )}
        <button className="pill" onClick={onClose}>Harika!</button>
      </div>
    </Modal>
  );
}

export function RealmHud({ name, goal, progress, icon, leave = 'Adaya dön', onLeave }: { name: string; goal: string; progress: string; icon: string; leave?: string; onLeave: () => void }) {
  return (
    <div className="realm-hud">
      <button className="pill pill--sm pill--yellow" onClick={onLeave}><LogOut size={18} /> {leave}</button>
      <div className="realm-hud__goal"><b>{name}</b><span>{goal}</span></div>
      {progress && <span className="realm-hud__prog"><GameIcon name={icon} size={24} /> {progress}</span>}
    </div>
  );
}

export function RealmDone({ name, text, coins, onAgain, onLeave }: { name: string; text: string; coins: number; onAgain: () => void; onLeave: () => void }) {
  return (
    <Modal onClose={onLeave}>
      <div className="island__panel">
        <Trophy size={64} color="#ffc83d" fill="#ffe8a3" />
        <h2 className="title-lg">{name}</h2>
        <p className="sub">{text}</p>
        <span className="farm-coin big"><GameIcon name="altin" size={26} /> +{coins}</span>
        <div className="farm-order__btns">
          <button className="btn-outline" onClick={onAgain}><RotateCcw size={18} /> Tekrar oyna</button>
          <button className="pill" onClick={onLeave}>Adaya dön</button>
        </div>
      </div>
    </Modal>
  );
}

