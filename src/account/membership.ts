/**
 * Çizio Premium üyeliği: aylık ya da yıllık abonelik (Google Play / App Store), RevenueCat ile.
 *
 * - Satın alma yalnızca telefon/tablet uygulamasında; web'de Premium bölümleri tanıtılır, mağaza bağlantısı verilir.
 * - RevenueCat satın almayı mağazayla sunucuda doğrular ve hesaba bağlar: ebeveyn hesap açtıysa (auth.ts) başka bir
 *   cihazda giriş yapınca Premium kendiliğinden gelir. Hesap yoksa satın alma cihazın mağaza hesabına bağlıdır
 *   ("Satın alımı geri yükle" ile geri gelir).
 * - Son bilinen durum cihazda saklanır: çevrimdışıyken de Premium açık kalır (bitiş tarihine kadar).
 * - Satın alma ekranı ebeveyn kilidinin arkasındadır (Google Play Aileler, App Store Kids).
 */
import { Capacitor } from '@capacitor/core';
import { create } from 'zustand';
import { PREMIUM_ACIK } from '../lib/flags';
import { ENTITLEMENT, PRICE_FALLBACK, RC_KEYS, TRIAL_DAYS } from './config';

export type Plan = 'monthly' | 'annual';

export interface PlanOffer {
  plan: Plan;
  /** Mağazanın yerel fiyatı ("79,99 TL"). */
  price: string;
  /** Sayısal fiyat (yıllıkta indirim oranı için). */
  amount?: number;
  /** Yıllıkta aylık karşılığı. */
  perMonth?: string;
  /** Ücretsiz deneme günü (yoksa 0; deneme bir kez kullanılır). */
  trialDays: number;
  pkg?: unknown;
}

type Status = 'idle' | 'loading' | 'ready' | 'unavailable';

interface MembershipState {
  /** Premium açık mı (satın alma ya da son bilinen durum). */
  premium: boolean;
  plan?: Plan;
  /** Bitiş / yenilenme zamanı (ms). */
  until?: number | null;
  renews?: boolean;
  trial?: boolean;
  /** Satın alındığı mağaza (PLAY_STORE, APP_STORE). */
  store?: string;
  manageUrl?: string | null;
  status: Status;
  offers: PlanOffer[];
  busy: boolean;
  error: string | null;
}

const CACHE_KEY = 'cizio-uyelik';
/** Bitiş tarihinden sonra çevrimdışı tanınan süre (yenilenme bilgisi gecikebilir). */
const GRACE_MS = 3 * 864e5;

const devPremium = () => {
  try {
    return import.meta.env.DEV && localStorage.getItem('cizio-premium-dev') === '1';
  } catch {
    return false;
  }
};

type Cached = Pick<MembershipState, 'premium' | 'plan' | 'until' | 'renews' | 'trial' | 'store'>;
const readCache = (): Cached => {
  try {
    const c = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null') as Cached | null;
    if (c?.premium && (!c.until || c.until + GRACE_MS > Date.now())) return c;
  } catch {
    /* yok say */
  }
  return { premium: false };
};

const DEFAULT_OFFERS: PlanOffer[] = [
  { plan: 'annual', price: PRICE_FALLBACK.annual, amount: 499.99, perMonth: '41,67 TL', trialDays: TRIAL_DAYS },
  { plan: 'monthly', price: PRICE_FALLBACK.monthly, amount: 79.99, trialDays: TRIAL_DAYS },
];

export const useMembership = create<MembershipState>(() => ({
  ...readCache(),
  premium: readCache().premium || devPremium(), // önbellek süresi geçmişse false
  status: 'idle',
  offers: DEFAULT_OFFERS,
  busy: false,
  error: null,
}));

/** Yıllık planın aylığa göre indirimi (%), hesaplanamazsa 0. */
export function annualSaving(offers: PlanOffer[]) {
  const a = offers.find((o) => o.plan === 'annual')?.amount;
  const m = offers.find((o) => o.plan === 'monthly')?.amount;
  return a && m ? Math.max(0, Math.round((1 - a / (m * 12)) * 100)) : 0;
}

/** Kilitli bölümler açık mı? (Premium kapalıysa her şey açık.) */
export const unlocked = (premium: boolean) => !PREMIUM_ACIK || premium;
export const useUnlocked = () => unlocked(useMembership((s) => s.premium));

/** Bu cihazda satın alma yapılabilir mi? */
export const canPurchase = () => PREMIUM_ACIK && Capacitor.isNativePlatform() && !!rcKey();
const rcKey = () => (Capacitor.getPlatform() === 'ios' ? RC_KEYS.ios : Capacitor.getPlatform() === 'android' ? RC_KEYS.android : '');

// RevenueCat yalnızca telefonda yüklenir (web paketine girmez).
type RC = typeof import('@revenuecat/purchases-capacitor');
let rc: RC | null = null;
let started: Promise<void> | null = null;
/** Hesap girişi RevenueCat hazır olmadan gelirse bekletilir. */
let pendingUser: string | null | undefined;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Info = any;

function applyInfo(info: Info) {
  const ent = info?.entitlements?.active?.[ENTITLEMENT];
  const premium = !!ent || devPremium();
  const id: string = ent?.productIdentifier ?? '';
  const c: Cached = {
    premium,
    plan: ent ? (/annual|yearly|yillik|year/i.test(id) ? 'annual' : 'monthly') : undefined,
    until: ent?.expirationDateMillis ?? null,
    renews: ent?.willRenew,
    trial: ent?.periodType === 'TRIAL',
    store: ent?.store,
  };
  useMembership.setState({ ...c, manageUrl: info?.managementURL ?? null });
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(c));
  } catch {
    /* yok say */
  }
}

/** "P7D", "P1W" ya da { unit: 'DAY', value: 7 } → gün. */
function days(period: unknown): number {
  if (!period) return 0;
  if (typeof period === 'string') {
    const m = /^P(\d+)([DWMY])$/.exec(period);
    return m ? Number(m[1]) * { D: 1, W: 7, M: 30, Y: 365 }[m[2] as 'D'] : 0;
  }
  const p = period as { unit?: string; value?: number; periodNumberOfUnits?: number; periodUnit?: string };
  const n = p.value ?? p.periodNumberOfUnits ?? 0;
  const u = (p.unit ?? p.periodUnit ?? 'DAY').toUpperCase();
  return n * (u.startsWith('W') ? 7 : u.startsWith('M') ? 30 : u.startsWith('Y') ? 365 : 1);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function offerOf(plan: Plan, pkg: any): PlanOffer | null {
  const p = pkg?.product;
  if (!p) return null;
  // App Store: ücretsiz giriş fiyatı; Google Play: temel planın ücretsiz aşaması
  const intro = p.introPrice && p.introPrice.price === 0 ? days(p.introPrice) : 0;
  const free = p.defaultOption?.freePhase?.billingPeriod;
  return {
    plan,
    price: p.priceString,
    amount: typeof p.price === 'number' ? p.price : undefined,
    perMonth: plan === 'annual' ? p.pricePerMonthString ?? undefined : undefined,
    trialDays: intro || days(free?.iso8601 ?? free),
    pkg,
  };
}

/** Uygulama açılışında bir kez: mağazaya bağlanır, Premium durumunu ve fiyatları getirir. */
export function initMembership(): Promise<void> {
  if (started) return started;
  started = (async () => {
    if (!canPurchase()) {
      useMembership.setState({ status: 'unavailable' });
      return;
    }
    useMembership.setState({ status: 'loading' });
    try {
      rc = await import('@revenuecat/purchases-capacitor');
      const { Purchases } = rc;
      await Purchases.configure({ apiKey: rcKey(), appUserID: pendingUser ?? undefined });
      pendingUser = undefined;
      await Purchases.addCustomerInfoUpdateListener(applyInfo);
      applyInfo((await Purchases.getCustomerInfo()).customerInfo);
      const cur = (await Purchases.getOfferings()).current;
      const offers = [offerOf('annual', cur?.annual), offerOf('monthly', cur?.monthly)].filter(Boolean) as PlanOffer[];
      useMembership.setState({ status: offers.length ? 'ready' : 'unavailable', offers: offers.length ? offers : DEFAULT_OFFERS });
    } catch {
      useMembership.setState({ status: 'unavailable' });
    }
  })();
  return started;
}

/** Ebeveyn hesabı açıldı/kapandı: satın almalar hesaba bağlanır (başka cihazda giriş yapınca gelir). */
export async function identify(uid: string | null) {
  if (!rc) {
    pendingUser = uid;
    return;
  }
  try {
    const { Purchases } = rc;
    if (uid) applyInfo((await Purchases.logIn({ appUserID: uid })).customerInfo);
    else if (!(await Purchases.isAnonymous()).isAnonymous) applyInfo((await Purchases.logOut()).customerInfo);
  } catch {
    /* bir sonraki açılışta yeniden denenir */
  }
}

/** Satın alma penceresini açar (Google Play / App Store). */
export async function buy(plan: Plan) {
  const offer = useMembership.getState().offers.find((o) => o.plan === plan);
  if (!rc || !offer?.pkg) {
    useMembership.setState({ error: 'Mağazaya şu an bağlanılamıyor. İnternet bağlantısını kontrol edip tekrar deneyin.' });
    return;
  }
  useMembership.setState({ busy: true, error: null });
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = await rc.Purchases.purchasePackage({ aPackage: offer.pkg as any });
    applyInfo(r.customerInfo);
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = e as any;
    const cancelled = err?.userCancelled || err?.code === rc.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR || err?.code === '1';
    if (!cancelled) useMembership.setState({ error: 'Satın alma tamamlanamadı. Ödemeniz alınmadı; daha sonra tekrar deneyin.' });
  }
  useMembership.setState({ busy: false });
}

/** Önceki satın alımları geri yükler (yeni telefon, yeniden kurulum). */
export async function restore(): Promise<boolean> {
  if (!rc) return false;
  useMembership.setState({ busy: true, error: null });
  try {
    applyInfo((await rc.Purchases.restorePurchases()).customerInfo);
  } catch {
    useMembership.setState({ error: 'Satın alımlar geri yüklenemedi. İnternet bağlantısını kontrol edin.' });
  }
  useMembership.setState({ busy: false });
  return useMembership.getState().premium;
}

/** Aboneliği yönet / iptal et: mağazanın abonelik sayfası. */
export function manage() {
  const s = useMembership.getState();
  const url =
    s.manageUrl ??
    (s.store === 'APP_STORE' || Capacitor.getPlatform() === 'ios'
      ? 'https://apps.apple.com/account/subscriptions'
      : 'https://play.google.com/store/account/subscriptions');
  window.open(url, '_blank');
}
