/**
 * Uygulamanın eski adından (önceki sürümler) kalan cihaz kayıtlarını yeni ada taşır.
 * main.tsx'te her şeyden önce içe aktarılır: durum deposu (zustand) oluşturulmadan localStorage hazır olur.
 * Galeri (IndexedDB) taşıması gallery.ts'te, ilk erişimde yapılır.
 */
export const OLD_STATE_KEY = 'ciziktir-v1';
export const STATE_KEY = 'cizio-v1';
export const OLD_DB = 'ciziktir-db';
export const DB = 'cizio-db';
export const DB_MIGRATED_FLAG = 'cizio-db-migrated';

try {
  if (typeof localStorage !== 'undefined' && !localStorage.getItem(STATE_KEY)) {
    const old = localStorage.getItem(OLD_STATE_KEY);
    if (old) {
      localStorage.setItem(STATE_KEY, old);
      localStorage.removeItem(OLD_STATE_KEY);
    }
  }
} catch {
  /* gizli sekme vb.: taşıma yapılamazsa uygulama yine açılır */
}
