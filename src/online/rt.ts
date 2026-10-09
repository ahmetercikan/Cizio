/**
 * Çizio Adası'nda arkadaşlarla birlikte oynama: Firebase Realtime Database (anlık konum).
 *
 * Yapı:
 *   /owners/{pid} = uid                    oyuncu bu cihaza ait (kurallar bununla doğrular)
 *   /allow/{room}/{uid} = true             oda sahibinin onaylı arkadaşlarının cihazları (sahip yazar)
 *   /presence/{pid} = { room, ts }         şu an adada mı, hangi odada (bağlantı kopunca silinir)
 *   /rooms/{room}/looks/{pid} = DollState  karakterin görünüşü (girerken bir kez)
 *   /rooms/{room}/live/{pid} = { x, z, y, h, p, n, t }  konum ve poz (yalnızca değişince, saniyede en çok 5 kez)
 * Her oda bir oyuncunun adasıdır (oda kimliği = sahibinin pid'i). Bir odada sen ve en çok 10 arkadaşın.
 * Ücretsiz planda kalmak için paketler küçük tutulur ve kahraman dururken hiç gönderilmez.
 */
import { getDatabase, onDisconnect, onValue, ref, remove, serverTimestamp, set, update, type Database, type Unsubscribe } from 'firebase/database';
import { connectDatabaseEmulator } from 'firebase/database';
import type { DollState } from '../dressup/catalog';
import { firebaseApp, signIn } from './client';
import { USE_EMULATOR } from './config';

/** Bir adada sahibinin yanında en çok kaç arkadaş olabilir (toplam 11 kişi). */
export const ROOM_MAX = 10;

let db: Database | null = null;
function rtdb() {
  if (db) return db;
  db = getDatabase(firebaseApp());
  if (USE_EMULATOR) connectDatabaseEmulator(db, '127.0.0.1', 9000);
  return db;
}

/** Bu cihazın oyuncusu olduğunu kaydeder (bir kez; kurallar bununla yazma iznini doğrular). */
export async function claim(pid: string) {
  const uid = await signIn();
  await set(ref(rtdb(), `owners/${pid}`), uid).catch(() => {});
}

/** Oda sahibi, onaylı arkadaşlarının cihazlarına izin verir (arkadaş listesi değişince yeniden yazılır). */
export async function allowFriends(room: string, friendOwners: string[]) {
  const uid = await signIn();
  const allow: Record<string, true> = { [uid]: true };
  for (const u of friendOwners) allow[u] = true;
  await set(ref(rtdb(), `allow/${room}`), allow);
}

/** Çevrimiçi kapatılınca bu oyuncunun ada kayıtlarını siler (sahiplik en son: diğerlerinin silinmesine izin veren odur). */
export async function forget(pid: string) {
  await signIn();
  const d = rtdb();
  await Promise.all([remove(ref(d, `allow/${pid}`)), remove(ref(d, `presence/${pid}`))]).catch(() => {});
  await remove(ref(d, `owners/${pid}`)).catch(() => {});
}

export interface Live { x: number; z: number; y: number; h: number; p: string; n: string; t?: number }
export interface Presence { room: string; ts: number }

/** Arkadaşların şu an adada olup olmadığı ve hangi odada oldukları. */
export function watchPresence(pids: string[], cb: (p: Record<string, Presence | null>) => void): Unsubscribe {
  const out: Record<string, Presence | null> = {};
  const offs = pids.map((pid) =>
    onValue(ref(rtdb(), `presence/${pid}`), (s) => {
      out[pid] = (s.val() as Presence | null) ?? null;
      cb({ ...out });
    }, () => {
      out[pid] = null;
      cb({ ...out });
    }),
  );
  return () => offs.forEach((o) => o());
}

export interface RoomHandle {
  /** Konum/poz gönder (çağıran sıklığı ayarlar; aynı durum tekrar gönderilmez). */
  send(l: Live): void;
  leave(): Promise<void>;
}

/**
 * Bir odaya katılır: görünüşünü yazar, canlı konumunu bağlantı kopunca silinecek şekilde kaydeder, varlığını bildirir.
 * `onPeers`: odadaki diğer oyuncuların görünüşü ve canlı durumu.
 */
export async function joinRoom(room: string, me: string, look: DollState, onPeers: (peers: Record<string, { look?: DollState; live?: Live }>) => void, onFull: () => void): Promise<RoomHandle | null> {
  await signIn();
  const d = rtdb();
  // Oda dolu mu? (anlık bir okuma; sahibi + en çok ROOM_MAX arkadaş)
  const count = await new Promise<number>((res) => {
    const off = onValue(ref(d, `rooms/${room}/live`), (s) => {
      off();
      const v = s.val() as Record<string, Live> | null;
      res(v ? Object.keys(v).filter((k) => k !== me).length : 0);
    }, () => res(0));
  });
  if (count > ROOM_MAX) {
    onFull();
    return null;
  }
  const liveRef = ref(d, `rooms/${room}/live/${me}`);
  const lookRef = ref(d, `rooms/${room}/looks/${me}`);
  const presRef = ref(d, `presence/${me}`);
  await set(lookRef, look);
  await onDisconnect(liveRef).remove();
  await onDisconnect(lookRef).remove();
  await onDisconnect(presRef).remove();
  await set(presRef, { room, ts: serverTimestamp() });

  const peers: Record<string, { look?: DollState; live?: Live }> = {};
  const emit = () => onPeers({ ...peers });
  const offLooks = onValue(ref(d, `rooms/${room}/looks`), (s) => {
    const v = (s.val() ?? {}) as Record<string, DollState>;
    for (const k of Object.keys(peers)) if (!v[k]) delete peers[k];
    for (const [k, l] of Object.entries(v)) if (k !== me) peers[k] = { ...peers[k], look: l };
    emit();
  });
  const offLive = onValue(ref(d, `rooms/${room}/live`), (s) => {
    const v = (s.val() ?? {}) as Record<string, Live>;
    for (const k of Object.keys(peers)) if (!v[k] && peers[k]) peers[k].live = undefined;
    for (const [k, l] of Object.entries(v)) if (k !== me) peers[k] = { ...peers[k], live: l };
    emit();
  });

  let last = '';
  return {
    send(l) {
      const key = `${l.x.toFixed(1)}|${l.z.toFixed(1)}|${l.y.toFixed(1)}|${l.h.toFixed(2)}|${l.p}`;
      if (key === last) return;
      last = key;
      void update(liveRef, { x: +l.x.toFixed(2), z: +l.z.toFixed(2), y: +l.y.toFixed(2), h: +l.h.toFixed(2), p: l.p, n: l.n, t: serverTimestamp() }).catch(() => {});
    },
    async leave() {
      offLooks();
      offLive();
      await Promise.all([remove(liveRef), remove(lookRef), remove(presRef)]).catch(() => {});
      await Promise.all([onDisconnect(liveRef).cancel(), onDisconnect(lookRef).cancel(), onDisconnect(presRef).cancel()]).catch(() => {});
    },
  };
}
