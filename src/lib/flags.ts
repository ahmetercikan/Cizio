import { Capacitor } from '@capacitor/core';
/**
 * Şimdilik kapalı bölümler.
 *
 * Müzik Odası ve Matematik Parkı yazılımda duruyor ama ana sayfada görünmüyor ve adresleri çalışmıyor.
 * İleride geri açmak için aşağıdaki değeri `true` yapmak yeterli.
 */
export const MUZIK_MATEMATIK_ACIK: boolean = false;

/**
 * Çizio Premium (src/account/): aylık/yıllık abonelik; ücretsiz kullanıcıda derslerin, English Club'ın bir kısmı ve
 * Çizio Adası kilitlenir. Kapalıyken her şey herkese açık ve satın alma hiçbir yerde görünmez.
 * Açmadan önce: RevenueCat anahtarları (src/account/config.ts) ve mağaza ürünleri hazır olmalı
 * (adımlar: store/premium-kurulum.md). Geliştirmede localStorage 'cizio-premium-ac' = '1' bayrağı açar,
 * 'cizio-premium-dev' = '1' satın almadan Premium yapar.
 */
const devFlag = (key: string) => {
  try {
    return import.meta.env.DEV && localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
};
/**
 * Yayında açık mı: telefon/tablet uygulamasında açık (satın alma Google Play'den). Web'de satın alma olmadığı için
 * web şimdilik ücretsiz kalır; web'i de kilitlemek için `true` yapılır.
 */
const PREMIUM_YAYINDA: boolean = Capacitor.isNativePlatform();
export const PREMIUM_ACIK: boolean = PREMIUM_YAYINDA || devFlag('cizio-premium-ac');

/**
 * Ebeveyn hesabı ve ilerleme eşitlemesi (src/account/auth.ts, sync.ts): Premium'dan bağımsız açılabilir.
 * Açmadan önce Firebase'de E-posta/Şifre girişi açık ve firestore.rules yayında olmalı.
 * Geliştirmede localStorage 'cizio-hesap-ac' = '1'.
 */
const HESAP_YAYINDA = true;
export const HESAP_ACIK: boolean = HESAP_YAYINDA || PREMIUM_ACIK || devFlag('cizio-hesap-ac');
