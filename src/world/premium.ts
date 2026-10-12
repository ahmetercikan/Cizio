/**
 * Özel paketler: Çizio Adası'nda yalnızca gerçek parayla açılan eşyalar (bir kez alınır, hep kalır).
 *
 * - Satın alma yalnızca Ebeveyn bölümünde, ebeveyn kilidinin arkasındadır (Google Play Aileler politikası).
 *   Oyunda çocuğa satın alma ekranı ya da "satın al" çağrısı gösterilmez; özel eşyalar yalnızca küçük bir taçla
 *   işaretlenir ve dokununca "Bir büyüğün ebeveyn bölümünden açabilir" bilgisi çıkar.
 * - Ada altını gerçek parayla satılmaz; altınla alınan her şey oynayarak kazanılır.
 * - Google Play Faturalandırma (cordova-plugin-purchase), tüketilmeyen ürünler; sunucu yok, yerel doğrulama.
 *
 * ŞİMDİLİK KAPALI (PREMIUM_ENABLED = false): satıcı hesabı açılınca true yapılır, `npm i cordova-plugin-purchase`,
 * `npx cap sync android` ve Play Console'da aşağıdaki ürün kimlikleri "uygulama içi ürün" olarak eklenir.
 * Geliştirmede localStorage 'cizio-premium-dev' = '1' bütün paketleri açar.
 */
import { Capacitor } from '@capacitor/core';
import { create } from 'zustand';

export const PREMIUM_ENABLED = false;

export interface PremiumPack {
  id: string;
  /** Google Play ürün kimliği. */
  product: string;
  name: string;
  emoji: string;
  desc: string;
  price: string;
}

export const PREMIUM: PremiumPack[] = [
  { id: 'araba', product: 'cizio_paket_araba', name: 'Hayal Arabaları', emoji: '🦄', desc: 'Unicorn arabası, uçan araba (denizin üstünden uçar) ve gökkuşağı limuzin.', price: '79,99 TL' },
  { id: 'sato', product: 'cizio_paket_sato', name: 'Şato Evi', emoji: '🏰', desc: 'Kuleli kocaman bir şato evi planı, taht, kale yatak ve kristal avize.', price: '99,99 TL' },
  { id: 'sihir', product: 'cizio_paket_sihir', name: 'Sihirli Eşyalar', emoji: '✨', desc: 'Uzay yatağı, dondurma makinesi, dev akvaryum ve gökkuşağı halı.', price: '59,99 TL' },
  { id: 'renk', product: 'cizio_paket_renk', name: 'Parıltılı Renkler', emoji: '💎', desc: 'Giydir\'de bütün kıyafetler için altın, gümüş, inci, neon ve galaksi renkleri.', price: '39,99 TL' },
];
export const premiumPack = (id: string) => PREMIUM.find((p) => p.id === id);

type Status = 'unknown' | 'loading' | 'ready' | 'unavailable';
interface PremiumState {
  owned: string[];
  status: Status;
  prices: Record<string, string>;
  busy: string | null;
  error: string | null;
}

const CACHE_KEY = 'cizio-premium';
const read = (): string[] => {
  try {
    if (import.meta.env.DEV && localStorage.getItem('cizio-premium-dev') === '1') return PREMIUM.map((p) => p.id);
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
};

export const usePremium = create<PremiumState>(() => ({ owned: read(), status: 'unknown', prices: {}, busy: null, error: null }));

/** Bu özel paket açık mı? */
export const hasPremium = (id: string | undefined) => !id || usePremium.getState().owned.includes(id);

function setOwned(ids: string[]) {
  const dev = read();
  const owned = [...new Set([...ids, ...(import.meta.env.DEV ? dev : [])])];
  usePremium.setState({ owned });
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(ids));
  } catch {
    /* yok say */
  }
}

export const canBuyPremium = () => PREMIUM_ENABLED && Capacitor.getPlatform() === 'android';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cdv = (): any => (window as any).CdvPurchase;
let started: Promise<void> | null = null;

/** Mağazayı başlatır (uygulama açılışında bir kez). */
export function initPremium(): Promise<void> {
  if (started) return started;
  started = (async () => {
    if (!canBuyPremium()) {
      usePremium.setState({ status: 'unavailable' });
      return;
    }
    await new Promise<void>((res) => (cdv() ? res() : document.addEventListener('deviceready', () => res(), { once: true })));
    const C = cdv();
    if (!C) return usePremium.setState({ status: 'unavailable' });
    const { store, ProductType, Platform } = C;
    usePremium.setState({ status: 'loading' });
    store.register(PREMIUM.map((p) => ({ id: p.product, type: ProductType.NON_CONSUMABLE, platform: Platform.GOOGLE_PLAY })));
    const sync = () => setOwned(PREMIUM.filter((p) => store.owned(p.product)).map((p) => p.id));
    store
      .when()
      .productUpdated((p: { id: string; pricing?: { price?: string } }) => {
        const pack = PREMIUM.find((x) => x.product === p.id);
        if (pack && p.pricing?.price) usePremium.setState((s) => ({ prices: { ...s.prices, [pack.id]: p.pricing!.price! } }));
      })
      .approved((t: { verify: () => unknown }) => void t.verify())
      .verified((r: { finish: () => unknown }) => void r.finish())
      .finished(() => {
        sync();
        usePremium.setState({ busy: null });
      })
      .receiptUpdated(sync);
    const errs = await Promise.race([store.initialize([Platform.GOOGLE_PLAY]), new Promise<null>((r) => setTimeout(() => r(null), 10000))]);
    usePremium.setState({ status: errs ? 'ready' : 'unavailable' });
    sync();
  })();
  return started;
}

/** Satın alma penceresi (Google Play). Yalnızca ebeveyn kilidinden sonra çağrılır. */
export async function buyPremium(id: string) {
  const pack = premiumPack(id);
  const C = cdv();
  const offer = pack && C?.store.get(pack.product)?.getOffer();
  if (!C || !offer) {
    usePremium.setState({ error: 'Mağaza şu an hazır değil. İnternet bağlantısını kontrol edip tekrar deneyin.' });
    return;
  }
  usePremium.setState({ busy: id, error: null });
  const err = await C.store.order(offer);
  if (err && err.code !== C.ErrorCode.PAYMENT_CANCELLED) usePremium.setState({ error: 'Satın alma tamamlanamadı. Daha sonra tekrar deneyin.' });
  usePremium.setState({ busy: null });
}

export async function restorePremium() {
  const C = cdv();
  if (!C) return;
  usePremium.setState({ busy: 'restore', error: null });
  await C.store.restorePurchases();
  setOwned(PREMIUM.filter((p) => C.store.owned(p.product)).map((p) => p.id));
  usePremium.setState({ busy: null });
}

/** Oyunda kilitli özel eşyaya dokununca gösterilen (satın almaya çağırmayan) bilgi. */
export const PREMIUM_HINT = 'Bu özel bir eşya. Bir büyüğün ebeveyn bölümünden açabilir.';
