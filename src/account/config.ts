/**
 * Çizio Premium ayarları. RevenueCat anahtarları gizli değildir (her uygulamanın içinde durur); RevenueCat konsolu →
 * Project settings → API keys → "Public app-specific API keys". Boşken satın alma kapalı kalır.
 */
export const RC_KEYS = {
  android: '',
  ios: '',
};

/** RevenueCat'te Premium'u açan yetki (Entitlement) kimliği. */
export const ENTITLEMENT = 'premium';

/** Mağaza fiyatı gelmezse gösterilen fiyatlar (Play/App Store'daki fiyatla aynı tutulur). */
export const PRICE_FALLBACK = { monthly: '79,99 TL', annual: '499,99 TL' };
export const TRIAL_DAYS = 7;

export const LEGAL = {
  privacy: 'https://ahmetercikan.github.io/Cizio/gizlilik.html',
  terms: 'https://ahmetercikan.github.io/Cizio/kosullar.html',
};

export const STORE_LINKS = {
  android: 'https://play.google.com/store/apps/details?id=com.ahmetercikan.cizio',
};
