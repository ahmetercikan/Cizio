/**
 * Firebase projesi ayarları (Firebase konsolu → Proje ayarları → Uygulamalarınız → Web uygulaması).
 * Bu değerler gizli değildir (uygulamanın içinde zaten görünür); güvenliği firestore.rules sağlar.
 * null iken çevrimiçi özellikler gizlenir. Geliştirmede VITE_FIREBASE_EMULATOR=1 ile yerel emulator kullanılır.
 */
import type { FirebaseOptions } from 'firebase/app';

export const FIREBASE_CONFIG: FirebaseOptions | null = null;

export const USE_EMULATOR = import.meta.env.VITE_FIREBASE_EMULATOR === '1';

/** Çevrimiçi özellikler bu sürümde kullanılabilir mi? */
export const ONLINE_AVAILABLE = USE_EMULATOR || FIREBASE_CONFIG !== null;
