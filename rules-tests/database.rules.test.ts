/**
 * Realtime Database güvenlik kuralları (Çizio Adası'nda birlikte oynama). Emulator gerekir: npm run test:rules
 * Ali (uidA, pA) adasının sahibi; Zeynep (uidB, pB) onaylı arkadaşı; yabancı (uidX, pX) arkadaş değil.
 */
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { get, ref, remove, set, update } from 'firebase/database';
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

let env: RulesTestEnvironment;
const pA = 'pAAAA', pB = 'pBBBB', pX = 'pXXXX';
const live = { x: 1, z: 2, y: 0, h: 0.5, p: 'walk', n: 'Zeynep' };

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-cizio',
    database: { rules: readFileSync('database.rules.json', 'utf8'), host: '127.0.0.1', port: 9000 },
  });
});
afterAll(() => env.cleanup());

beforeEach(async () => {
  await env.clearDatabase();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.database();
    await set(ref(db, 'owners'), { [pA]: 'uidA', [pB]: 'uidB', [pX]: 'uidX' });
    await set(ref(db, `allow/${pA}`), { uidA: true, uidB: true });
  });
});

const as = (uid: string) => env.authenticatedContext(uid).database();

describe('sahiplik', () => {
  it('kendi oyuncusunu sahiplenir, başkasınınkini değiştiremez', async () => {
    await assertSucceeds(set(ref(as('uidN'), 'owners/pNEW'), 'uidN'));
    await assertFails(set(ref(as('uidX'), `owners/${pA}`), 'uidX'));
    await assertFails(set(ref(as('uidN'), 'owners/pNEW2'), 'baskasi'));
  });
  it('izin listesini yalnızca oda sahibi yazar ve okur', async () => {
    await assertSucceeds(set(ref(as('uidA'), `allow/${pA}`), { uidA: true }));
    await assertFails(set(ref(as('uidX'), `allow/${pA}`), { uidX: true }));
    await assertFails(get(ref(as('uidB'), `allow/${pA}`)));
  });
});

describe('oda', () => {
  it('sahip ve onaylı arkadaş odaya girer; yabancı giremez ve okuyamaz', async () => {
    await assertSucceeds(set(ref(as('uidA'), `rooms/${pA}/live/${pA}`), { ...live, n: 'Ali' }));
    await assertSucceeds(set(ref(as('uidB'), `rooms/${pA}/live/${pB}`), live));
    await assertSucceeds(set(ref(as('uidB'), `rooms/${pA}/looks/${pB}`), { hair: 'uzun' }));
    await assertSucceeds(get(ref(as('uidB'), `rooms/${pA}`)));
    await assertFails(set(ref(as('uidX'), `rooms/${pA}/live/${pX}`), live));
    await assertFails(get(ref(as('uidX'), `rooms/${pA}`)));
  });
  it('başkasının konumunu yazamaz ya da silemez', async () => {
    await env.withSecurityRulesDisabled((ctx) => set(ref(ctx.database(), `rooms/${pA}/live/${pA}`), live));
    await assertFails(update(ref(as('uidB'), `rooms/${pA}/live/${pA}`), { x: 99 }));
    await assertFails(remove(ref(as('uidB'), `rooms/${pA}/live/${pA}`)));
  });
  it('konum paketi biçimi denetlenir (ad en çok 20 harf, serbest metin yok)', async () => {
    await assertFails(set(ref(as('uidB'), `rooms/${pA}/live/${pB}`), { ...live, n: 'x'.repeat(40) }));
    await assertFails(set(ref(as('uidB'), `rooms/${pA}/live/${pB}`), { x: 1, z: 2 }));
    await assertFails(set(ref(as('uidB'), `rooms/${pA}/live/${pB}`), { ...live, p: 'cok-uzun-bir-poz-adi' }));
  });
  it('varlık: yalnızca kendi oyuncusu için yazar', async () => {
    await assertSucceeds(set(ref(as('uidB'), `presence/${pB}`), { room: pA, ts: 1 }));
    await assertFails(set(ref(as('uidX'), `presence/${pB}`), { room: pA, ts: 1 }));
    await assertSucceeds(get(ref(as('uidX'), `presence/${pB}`)));
  });
});
