/**
 * Ebeveyn hesabı: Premium'un kaybolmaması (yeni telefon, iPhone ↔ Android) için. Giriş yalnızca ebeveyn bölümünde.
 *
 * - E-posta ve şifre (her yerde) ve iPhone/iPad'de Apple ile giriş. Google ile giriş bilerek yok: Google'ın kuralları
 *   ağırlıklı olarak çocuklara yönelik uygulamalarda "Google ile giriş"e izin vermiyor.
 * - Ayrı bir Firebase uygulaması ('hesap'): çevrimiçi arkadaş özellikleri cihazın anonim oturumuyla sürer
 *   (online/client.ts), hesaba girip çıkmak onları bozmaz.
 * - Hesap yalnızca e-posta ve kimlik tutar; çocuğun adı, çizimleri ya da ilerlemesi hesaba gönderilmez.
 * - Firebase ilk kez ebeveyn bölümü açılınca (ya da daha önce giriş yapılmışsa açılışta) yüklenir.
 */
import { Capacitor } from '@capacitor/core';
import type { Auth, User } from 'firebase/auth';
import { create } from 'zustand';
import { FIREBASE_CONFIG, USE_EMULATOR } from '../online/config';
import { identify } from './membership';

export interface AccountUser {
  uid: string;
  email: string | null;
  apple: boolean;
  verified: boolean;
}

interface AccountState {
  ready: boolean;
  user: AccountUser | null;
}

const SIGNED_KEY = 'cizio-hesap';
const signedBefore = () => {
  try {
    return localStorage.getItem(SIGNED_KEY) === '1';
  } catch {
    return false;
  }
};

export const useAccount = create<AccountState>(() => ({ ready: false, user: null }));

export const appleAvailable = () => Capacitor.getPlatform() === 'ios';
export const accountAvailable = () => USE_EMULATOR || FIREBASE_CONFIG !== null;

type FA = typeof import('firebase/auth');
let fa: FA;
let auth: Auth | null = null;
let starting: Promise<Auth> | null = null;

const toUser = (u: User | null): AccountUser | null =>
  u && !u.isAnonymous
    ? { uid: u.uid, email: u.email, apple: u.providerData.some((p) => p.providerId === 'apple.com'), verified: u.emailVerified }
    : null;

/** Hesap oturumunu başlatır; giriş durumu useAccount'ta. */
export function startAccount(): Promise<Auth> {
  if (starting) return starting;
  starting = (async () => {
    const [{ initializeApp, getApps }, f] = await Promise.all([import('firebase/app'), import('firebase/auth')]);
    fa = f;
    const app =
      getApps().find((a) => a.name === 'hesap') ??
      initializeApp(USE_EMULATOR ? { projectId: 'demo-cizio', apiKey: 'demo-key', authDomain: 'localhost' } : FIREBASE_CONFIG!, 'hesap');
    // Açılır pencere çözücüsü yok (Android WebView'de sorun çıkarır); Apple girişi yerel eklentiyle yapılır.
    auth = f.initializeAuth(app, { persistence: [f.indexedDBLocalPersistence, f.browserLocalPersistence] });
    auth.languageCode = 'tr';
    if (USE_EMULATOR) f.connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    f.onAuthStateChanged(auth, (u) => {
      const user = toUser(u);
      useAccount.setState({ ready: true, user });
      try {
        localStorage.setItem(SIGNED_KEY, user ? '1' : '0');
      } catch {
        /* yok say */
      }
      void identify(user?.uid ?? null);
    });
    return auth;
  })();
  return starting;
}

/** Açılışta: daha önce giriş yapılmışsa oturumu geri yükler (yoksa Firebase'i hiç yüklemez). */
export function restoreAccount() {
  if (accountAvailable() && signedBefore()) void startAccount().catch(() => {});
}

/** Firebase hata kodu → ebeveynin anlayacağı Türkçe ileti. */
export function authMessage(e: unknown): string {
  const code = (e as { code?: string })?.code ?? '';
  const map: Record<string, string> = {
    'auth/email-already-in-use': 'Bu e-postayla zaten bir hesap var. "Giriş yap"ı seçin.',
    'auth/invalid-email': 'E-posta adresi geçerli görünmüyor.',
    'auth/missing-email': 'E-posta adresinizi yazın.',
    'auth/weak-password': 'Şifre en az 6 karakter olmalı.',
    'auth/missing-password': 'Şifrenizi yazın.',
    'auth/invalid-credential': 'E-posta ya da şifre hatalı.',
    'auth/wrong-password': 'E-posta ya da şifre hatalı.',
    'auth/user-not-found': 'Bu e-postayla bir hesap bulunamadı.',
    'auth/too-many-requests': 'Çok fazla deneme yapıldı. Biraz bekleyip tekrar deneyin.',
    'auth/network-request-failed': 'İnternet bağlantısı yok. Bağlantıyı kontrol edip tekrar deneyin.',
    'auth/requires-recent-login': 'Güvenlik için şifrenizi yeniden girmeniz gerekiyor.',
    'auth/user-disabled': 'Bu hesap kapatılmış.',
  };
  if ((e as { message?: string })?.message?.includes('canceled') || code === '1001') return '';
  return map[code] ?? 'Bir sorun oldu. Biraz sonra tekrar deneyin.';
}

export async function register(email: string, password: string) {
  const a = await startAccount();
  const { user } = await fa.createUserWithEmailAndPassword(a, email.trim(), password);
  // Doğrulama e-postası: hesap onu beklemeden çalışır; şifre sıfırlamanın doğru adrese gitmesini sağlar.
  void fa.sendEmailVerification(user).catch(() => {});
}

export async function login(email: string, password: string) {
  const a = await startAccount();
  await fa.signInWithEmailAndPassword(a, email.trim(), password);
}

export async function resetPassword(email: string) {
  const a = await startAccount();
  await fa.sendPasswordResetEmail(a, email.trim());
}

export async function logout() {
  const a = await startAccount();
  await fa.signOut(a);
}

// ---------------------------------------------------------------------------------------------
// Apple ile giriş (yalnızca iPhone/iPad; yerel pencere)
// ---------------------------------------------------------------------------------------------
async function sha256(s: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Apple penceresini açar; döner: Firebase kimliği ve Apple'ın tek kullanımlık kodu (hesap silerken gerekir). */
async function appleCredential() {
  const { SignInWithApple } = await import('@capacitor-community/apple-sign-in');
  const raw = Array.from(crypto.getRandomValues(new Uint8Array(24)), (b) => b.toString(16).padStart(2, '0')).join('');
  const { response } = await SignInWithApple.authorize({
    clientId: 'com.ahmetercikan.cizioapp',
    redirectURI: '',
    scopes: 'email',
    state: raw.slice(0, 8),
    nonce: await sha256(raw),
  });
  const credential = new fa.OAuthProvider('apple.com').credential({ idToken: response.identityToken, rawNonce: raw });
  return { credential, code: response.authorizationCode };
}

export async function loginWithApple() {
  const a = await startAccount();
  const { credential } = await appleCredential();
  await fa.signInWithCredential(a, credential);
}

/**
 * Hesabı kalıcı olarak siler (App Store ve Google Play bunu uygulama içinde ister). Güvenlik için yeniden doğrulama:
 * e-postalı hesapta şifre, Apple hesabında Apple penceresi (Apple'a verilen izin de geri alınır).
 * Abonelik mağazada sürer; iptal mağazanın abonelik sayfasından yapılır.
 */
export async function deleteAccount(password?: string) {
  const a = await startAccount();
  const u = a.currentUser;
  if (!u) return;
  if (toUser(u)?.apple) {
    const { credential, code } = await appleCredential();
    await fa.reauthenticateWithCredential(u, credential);
    await fa.revokeAccessToken(a, code).catch(() => {});
  } else {
    await fa.reauthenticateWithCredential(u, fa.EmailAuthProvider.credential(u.email ?? '', password ?? ''));
  }
  await fa.deleteUser(u);
}
