/**
 * Çizio Plus: Çizio Adası'nı açan yıllık abonelik (Google Play Faturalandırma, cordova-plugin-purchase).
 *
 * - Yalnızca Android uygulamasında satın alınabilir; web'de bölüm tanıtılır.
 * - Satın alma ebeveyn kilidinin arkasındadır (Google Play Aileler politikası).
 * - Sunucu yok: satın alma Play kütüphanesiyle yerelde doğrulanır ve onaylanır (acknowledge); sahiplik son bilinen
 *   durumuyla cihazda da tutulur, böylece çevrimdışıyken de ada açılır. Abonelik iptal edilince Play bildirir.
 * - Geliştirme: localStorage 'cizio-plus-dev' = '1' adayı satın almadan açar (yalnızca geliştirme sunucusunda).
 *
 * ŞİMDİLİK KAPALI (PLUS_ENABLED = false): Çizio Adası herkese ücretsiz. Yeniden açmak için PLUS_ENABLED = true,
 * `npm i cordova-plugin-purchase` ve `npx cap sync android` (bkz. store/release-1.7.0.md: Play Console adımları).
 */
import { Capacitor } from '@capacitor/core';
import { create } from 'zustand';

/** Ücretli bölüm açık mı? Kapalıyken ada herkese açık, satın alma görünmez. */
export const PLUS_ENABLED = false;

export const PLUS_PRODUCT = 'cizio_plus_yearly';
export const PLUS_PRICE_FALLBACK = '499,99 TL';
const CACHE_KEY = 'cizio-plus';

type Status = 'unknown' | 'loading' | 'ready' | 'unavailable';

interface PlusState {
  owned: boolean;
  status: Status;
  price: string;
  busy: boolean;
  error: string | null;
}

const cached = (() => {
  try {
    return localStorage.getItem(CACHE_KEY) === '1';
  } catch {
    return false;
  }
})();
const dev = (() => {
  try {
    return import.meta.env.DEV && localStorage.getItem('cizio-plus-dev') === '1';
  } catch {
    return false;
  }
})();

export const usePlus = create<PlusState>(() => ({ owned: !PLUS_ENABLED || cached || dev, status: 'unknown', price: PLUS_PRICE_FALLBACK, busy: false, error: null }));

const setOwned = (owned: boolean) => {
  usePlus.setState({ owned: !PLUS_ENABLED || owned || dev });
  try {
    localStorage.setItem(CACHE_KEY, owned ? '1' : '0');
  } catch {
    /* yok say */
  }
};

export const canBuy = () => PLUS_ENABLED && Capacitor.getPlatform() === 'android';

// Eklentinin küresel nesnesi (cordova-plugin-purchase); eklenti kurulu değilse yoktur.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cdv = (): any => (window as any).CdvPurchase;

let started: Promise<void> | null = null;

/** Mağazayı başlatır (uygulama açılışında bir kez). Web'de hiçbir şey yapmaz. */
export function initPlus(): Promise<void> {
  if (started) return started;
  started = (async () => {
    if (!PLUS_ENABLED || !canBuy()) {
      usePlus.setState({ status: 'unavailable' });
      return;
    }
    await new Promise<void>((res) => (cdv() ? res() : document.addEventListener('deviceready', () => res(), { once: true })));
    const C = cdv();
    if (!C) {
      usePlus.setState({ status: 'unavailable' });
      return;
    }
    const { store, ProductType, Platform } = C;
    usePlus.setState({ status: 'loading' });
    store.register([{ id: PLUS_PRODUCT, type: ProductType.PAID_SUBSCRIPTION, platform: Platform.GOOGLE_PLAY }]);
    store
      .when()
      .productUpdated((p: { id: string; owned: boolean; pricing?: { price?: string } }) => {
        if (p.id !== PLUS_PRODUCT) return;
        const price = p.pricing?.price;
        usePlus.setState({ price: price ?? PLUS_PRICE_FALLBACK });
        setOwned(p.owned);
      })
      // Yerel doğrulama: Play kütüphanesinin imzalı satın alımı yeterli (sunucu yok)
      .approved((t: { verify: () => unknown }) => void t.verify())
      .verified((r: { finish: () => unknown }) => void r.finish())
      .finished(() => {
        setOwned(store.owned(PLUS_PRODUCT));
        usePlus.setState({ busy: false });
      })
      .receiptUpdated(() => setOwned(store.owned(PLUS_PRODUCT)));
    // Play'e bağlanılamazsa (Play Store yok, çevrimdışı) beklemede kalınmasın
    const errs = await Promise.race([store.initialize([Platform.GOOGLE_PLAY]), new Promise<null>((r) => setTimeout(() => r(null), 10000))]);
    const product = store.get(PLUS_PRODUCT);
    usePlus.setState({ status: !errs || (errs.length && !product?.getOffer()) ? 'unavailable' : 'ready' });
    setOwned(store.owned(PLUS_PRODUCT));
  })();
  return started;
}

/** Satın alma penceresini açar (Google Play). */
export async function buyPlus() {
  const C = cdv();
  const p = C?.store.get(PLUS_PRODUCT);
  const offer = p?.getOffer();
  if (!C || !offer) {
    usePlus.setState({ error: 'Mağaza şu an hazır değil. İnternet bağlantısını kontrol edip tekrar deneyin.' });
    return;
  }
  usePlus.setState({ busy: true, error: null });
  const err = await C.store.order(offer);
  // Kullanıcı vazgeçtiyse hata göstermeye gerek yok
  if (err && err.code !== C.ErrorCode.PAYMENT_CANCELLED) usePlus.setState({ error: 'Satın alma tamamlanamadı. Daha sonra tekrar deneyin.' });
  usePlus.setState({ busy: false });
}

/** Önceki satın alımları geri yükler (yeni telefon, yeniden kurulum). */
export async function restorePlus() {
  const C = cdv();
  if (!C) return;
  usePlus.setState({ busy: true, error: null });
  await C.store.restorePurchases();
  setOwned(C.store.owned(PLUS_PRODUCT));
  usePlus.setState({ busy: false });
}

/** Google Play abonelik yönetimi (iptal, ödeme yöntemi). */
export async function managePlus() {
  const C = cdv();
  if (C) await C.store.manageSubscriptions();
  else window.open('https://play.google.com/store/account/subscriptions', '_blank');
}
