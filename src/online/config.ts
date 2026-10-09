/**
 * Firebase projesi ayarları (Firebase konsolu → Proje ayarları → Uygulamalarınız → Web uygulaması).
 * Bu değerler gizli değildir (uygulamanın içinde zaten görünür); güvenliği firestore.rules sağlar.
 * null iken çevrimiçi özellikler gizlenir. Geliştirmede VITE_FIREBASE_EMULATOR=1 ile yerel emulator kullanılır.
 */
import type { FirebaseOptions } from 'firebase/app';

export const FIREBASE_CONFIG: FirebaseOptions | null = {
  apiKey: 'AIzaSyDQ5KHg4a7nM6bVwMtdxNKLp4TWT4NJsL8',
  authDomain: 'cizio-5a08c.firebaseapp.com',
  projectId: 'cizio-5a08c',
  storageBucket: 'cizio-5a08c.firebasestorage.app',
  messagingSenderId: '384704755624',
  appId: '1:384704755624:web:2832a82106a95308f54f9d',
};

export const USE_EMULATOR = import.meta.env.VITE_FIREBASE_EMULATOR === '1';

/** Çevrimiçi özellikler bu sürümde kullanılabilir mi? */
export const ONLINE_AVAILABLE = USE_EMULATOR || FIREBASE_CONFIG !== null;

/** Çizio Adası'nda birlikte oynama (Realtime Database) kullanılabilir mi? Konsolda veritabanı oluşturulup databaseURL eklenince açılır. */
export const ISLAND_ONLINE = USE_EMULATOR || !!FIREBASE_CONFIG?.databaseURL;
