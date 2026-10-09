/**
 * Çiftliğim ve Pazar'ın ekranları: altın ve seviye göstergesi, pazar (sat / al / siparişler), tohum seçimi,
 * mutfak, çiftçi defteri, inşa çubuğu, hazır yapılar, seviye kutlaması ve macera ekranları.
 * Kurallar src/world/economy.ts'te; burada yalnızca gösterilir ve `apply` ile uygulanır.
 */
import { BookOpen, Check, ChefHat, ClipboardList, Coins, Eraser, Hammer, Lock, LogOut, RotateCcw, Store, Trophy, Undo2, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Modal } from '../components/ui';
import {
  ANIMALS, BLOCKS, BLUEPRINTS, buyAnimal, buyItem, buyPack, buyPrice, buyable, canCraft, canFill, clock, countAnimals, craft, CROPS, fillOrder,
  ITEM_EMOJI, ITEM_NAME, JOURNEY, levelOf, levelProgress, PACKS, plant, plantAll, PRICE, RECIPES, sell, sellable, skipOrder, type BlockDef, type CropId,
  type FarmState, type ItemId, type Result,
} from './economy';

export type Apply = (f: (s: FarmState) => Result) => Result;

const Coin = ({ n }: { n: number }) => <span className="farm-coin"><Coins size={16} /> {n}</span>;

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
export function MarketPanel({ s, apply, tab: tab0, onClose, onSold }: { s: FarmState; apply: Apply; tab?: 'sell' | 'buy' | 'orders'; onClose: () => void; onSold: () => void }) {
  const [tab, setTab] = useState<'sell' | 'buy' | 'orders'>(tab0 ?? 'sell');
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
        <Coin n={s.coins} />
      </div>
      {tab === 'sell' && (
        items.length === 0 ? <p className="sub">Satacak ürünün yok. Çiftliğinde ürün yetiştir, hayvanlarını besle!</p> : (
          <>
            <ul className="farm-list">
              {items.map((id) => (
                <li key={id}>
                  <span className="farm-emoji">{ITEM_EMOJI[id]}</span>
                  <span className="farm-list__name"><b>{ITEM_NAME[id]}</b><small>{s.inv[id]} tane · tanesi {PRICE[id]} altın</small></span>
                  <button className="pill pill--sm" onClick={() => { apply((x) => sell(x, id, 1)); onSold(); }}>1 sat</button>
                  {(s.inv[id] ?? 0) > 1 && <button className="btn-outline btn-outline--sm" onClick={() => { apply((x) => sell(x, id, x.inv[id] ?? 0)); onSold(); }}>Hepsi</button>}
                </li>
              ))}
            </ul>
            <button className="pill pill--yellow" onClick={sellAll}><Coins size={20} /> Hepsini sat</button>
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
                  <span className="farm-emoji">{a.emoji}</span>
                  <span className="farm-list__name"><b>{a.name}</b><small>{locked ? `${a.level}. seviyede açılır` : `${ITEM_EMOJI[a.eats]} yer, ${ITEM_EMOJI[a.product]} verir · ${n}/${a.max}`}</small></span>
                  {locked ? <Lock size={20} /> : <button className="pill pill--sm" disabled={n >= a.max} onClick={() => apply((x) => buyAnimal(x, a.id))}><Coins size={16} /> {a.cost}</button>}
                </li>
              );
            })}
          </ul>
          <h3>Yem ve ürün</h3>
          <ul className="farm-list">
            {buyable(s).map((id) => (
              <li key={id}>
                <span className="farm-emoji">{ITEM_EMOJI[id]}</span>
                <span className="farm-list__name"><b>{ITEM_NAME[id]}</b><small>Elinde {s.inv[id] ?? 0}</small></span>
                <button className="pill pill--sm" onClick={() => apply((x) => buyItem(x, id, 1))}><Coins size={16} /> {buyPrice(id)}</button>
              </li>
            ))}
          </ul>
          <h3>İnşa blokları</h3>
          <ul className="farm-list">
            {PACKS.filter((p) => p.price > 0).map((p) => {
              const own = s.packs.includes(p.id), locked = lv < p.level;
              return (
                <li key={p.id} className={locked ? 'locked' : ''}>
                  <span className="farm-emoji">{p.emoji}</span>
                  <span className="farm-list__name"><b>{p.name}</b><small>{own ? 'Senin' : locked ? `${p.level}. seviyede açılır` : 'Bir kez al, istediğin kadar kullan'}</small></span>
                  {own ? <Check size={22} color="var(--green)" /> : locked ? <Lock size={20} /> : <button className="pill pill--sm" onClick={() => apply((x) => buyPack(x, p.id))}><Coins size={16} /> {p.price}</button>}
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {tab === 'orders' && <Orders s={s} apply={apply} onSold={onSold} />}
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
                return <span key={k} className={have >= n! ? 'ok' : ''}>{ITEM_EMOJI[k as ItemId]} {Math.min(have, n!)}/{n}</span>;
              })}
            </div>
            <small><Coins size={14} /> {o.coins} · ⭐ {o.xp} deneyim</small>
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
              <span className="farm-emoji">{c.emoji}</span>
              <span className="farm-list__name"><b>{c.name}</b><small>{locked ? `${c.level}. seviyede açılır` : `${clock(c.grow)} dakikada ${c.yield} tane · tanesi ${PRICE[c.id]} altın`}</small></span>
              {locked ? <Lock size={20} /> : (
                <>
                  <button className="pill pill--sm" onClick={() => go(c.id, false)}><Coins size={16} /> {c.seed}</button>
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
              <span className="farm-emoji">{r.emoji}</span>
              <span className="farm-list__name">
                <b>{r.name} <small>({PRICE[r.id]} altın)</small></b>
                <small>{locked ? `${r.level}. seviyede açılır` : Object.entries(r.needs).map(([k, n]) => `${ITEM_EMOJI[k as ItemId]} ${s.inv[k as ItemId] ?? 0}/${n}`).join('  ')}</small>
              </span>
              {locked ? <Lock size={20} /> : <button className="pill pill--sm" disabled={!canCraft(s, r.id)} onClick={() => { const x = apply((f) => craft(f, r.id)); if (!x.err) onCook(); }}>Yap</button>}
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
            <small><Coins size={14} /> {st.coins}</small>
          </li>
        ))}
      </ul>
      {s.journey >= JOURNEY.length && <p className="sub">Defterin bitti, sen artık usta bir çiftçisin!</p>}
      <h3 className="farm-h3">Ambarım</h3>
      {inv.length ? <div className="farm-inv">{inv.map((id) => <span key={id}>{ITEM_EMOJI[id]} {s.inv[id]}</span>)}</div> : <p className="sub">Ambarın boş.</p>}
    </Panel>
  );
}

// ------------------------------------------------------------------------------------------------
// İnşa
// ------------------------------------------------------------------------------------------------
const MODEL_EMOJI: Record<string, string> = { kapi: '🚪', cicek: '🌷', fidan: '🌳', cit: '🚧', bank: '🪑', fener: '🏮', masa: '🍽️', sandalye: '💺', yatak: '🛏️', kitaplik: '📚', kardanadam: '⛄' };

function Swatch({ b }: { b: BlockDef }) {
  if (b.kind === 'model') return <span className="build-swatch build-swatch--emoji">{MODEL_EMOJI[b.id] ?? '📦'}</span>;
  return <span className={`build-swatch build-swatch--${b.kind}`} style={{ background: b.color, borderTopColor: b.top ?? b.color }} />;
}

export function BuildBar({ s, tool, onTool, onUndo, onBlueprints, onDone, onJump }: {
  s: FarmState; tool: string; onTool: (t: string) => void; onUndo: () => void; onBlueprints: () => void; onDone: () => void; onJump: () => void;
}) {
  const blocks = BLOCKS.filter((b) => s.packs.includes(b.pack));
  const more = PACKS.some((p) => p.price > 0 && !s.packs.includes(p.id));
  return (
    <div className="build-bar rise">
      <div className="build-bar__row">
        <button className={`build-tool ${tool === 'erase' ? 'on' : ''}`} onClick={() => onTool('erase')} aria-label="Sil"><Eraser size={22} /><small>Sil</small></button>
        {blocks.map((b) => (
          <button key={b.id} className={`build-tool ${tool === b.id ? 'on' : ''}`} onClick={() => onTool(b.id)} aria-label={b.name}><Swatch b={b} /><small>{b.name}</small></button>
        ))}
        {more && <span className="build-more"><Store size={16} /> Daha fazla blok Pazar'da</span>}
      </div>
      <div className="build-bar__actions">
        <button className="btn-outline btn-outline--sm" onClick={onUndo}><Undo2 size={18} /> Geri al</button>
        <button className="btn-outline btn-outline--sm" onClick={onBlueprints}><Hammer size={18} /> Hazır yapılar</button>
        <button className="btn-outline btn-outline--sm" onClick={onJump}>Zıpla</button>
        <button className="pill pill--sm" onClick={onDone}><Check size={18} /> Bitti</button>
      </div>
    </div>
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
              <span className="farm-emoji">{b.emoji}</span>
              <span className="farm-list__name"><b>{b.name}</b><small>{locked ? `${b.level}. seviyede açılır` : 'Yanındaki boş yere kurulur'}</small></span>
              {locked ? <Lock size={20} /> : <button className="pill pill--sm" disabled={s.coins < b.price} onClick={() => onPick(b.id)}><Coins size={16} /> {b.price}</button>}
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
export function LevelUp({ level, unlocks, onClose }: { level: number; unlocks: string[]; onClose: () => void }) {
  return (
    <Modal onClose={onClose}>
      <div className="island__panel">
        <span className="farm-hud__lv huge">{level}</span>
        <h2 className="title-lg">Seviye atladın!</h2>
        <p className="sub">Artık {level}. seviye çiftçisin. Hediyen: {10 * (level - 1)} altın!</p>
        {unlocks.length > 0 && (
          <>
            <b>Yeni açılanlar</b>
            <div className="farm-inv">{unlocks.map((u) => <span key={u}>{u}</span>)}</div>
          </>
        )}
        <button className="pill" onClick={onClose}>Harika!</button>
      </div>
    </Modal>
  );
}

export function RealmHud({ name, goal, progress, onLeave }: { name: string; goal: string; progress: string; onLeave: () => void }) {
  return (
    <div className="realm-hud">
      <button className="pill pill--sm pill--yellow" onClick={onLeave}><LogOut size={18} /> Adaya dön</button>
      <div className="realm-hud__goal"><b>{name}</b><span>{goal}</span></div>
      {progress && <span className="realm-hud__prog">{progress}</span>}
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
        <span className="farm-coin big"><Coins size={22} /> +{coins}</span>
        <div className="farm-order__btns">
          <button className="btn-outline" onClick={onAgain}><RotateCcw size={18} /> Tekrar oyna</button>
          <button className="pill" onClick={onLeave}>Adaya dön</button>
        </div>
      </div>
    </Modal>
  );
}

