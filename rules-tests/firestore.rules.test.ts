/**
 * Firestore güvenlik kuralları testleri (emulator gerekir):  npm run test:rules
 * Senaryo: iki aile (cihaz) — Ali'nin cihazı (uidA, oyuncu pA) ve Zeynep'in cihazı (uidB, oyuncu pB); bir de
 * yabancı cihaz (uidX, oyuncu pX).
 */
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

let env: RulesTestEnvironment;
const pA = 'pAAAAAAAAAAAAAAAAAAA';
const pB = 'pBBBBBBBBBBBBBBBBBBB';
const pX = 'pXXXXXXXXXXXXXXXXXXX';
const pair = pA < pB ? `${pA}_${pB}` : `${pB}_${pA}`;
const members = [pA, pB].sort();
const owners = members.map((p) => (p === pA ? 'uidA' : 'uidB'));

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-cizio',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8085 },
  });
});
afterAll(() => env.cleanup());

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await db.doc(`players/${pA}`).set({ owner: 'uidA', name: 'Ali', avatar: 'kedi', code: 'AAAAAA', createdAt: 1 });
    await db.doc(`players/${pB}`).set({ owner: 'uidB', name: 'Zeynep', avatar: 'panda', code: 'BBBBBB', createdAt: 1 });
    await db.doc(`players/${pX}`).set({ owner: 'uidX', name: 'Yabancı', avatar: 'robot', code: 'XXXXXX', createdAt: 1 });
  });
});

const as = (uid: string) => env.authenticatedContext(uid).firestore();
const accepted = () =>
  env.withSecurityRulesDisabled((ctx) =>
    ctx.firestore().doc(`friendships/${pair}`).set({ members, owners, requestedBy: pA, status: 'accepted', createdAt: 1 }),
  );
const request = { members, owners, requestedBy: pA, status: 'pending', createdAt: 1 };

describe('oyuncular ve kodlar', () => {
  it('kendi oyuncusunu ve kodunu oluşturur; başkası adına oluşturamaz', async () => {
    const db = as('uidN');
    const b = db.batch();
    b.set(db.doc('players/pNNNNNNNNNNNNNNNNNNN'), { owner: 'uidN', name: 'Can', avatar: 'kedi', code: 'NNNNNN', createdAt: 1 });
    b.set(db.doc('codes/NNNNNN'), { pid: 'pNNNNNNNNNNNNNNNNNNN', owner: 'uidN' });
    await assertSucceeds(b.commit());
    await assertFails(db.doc('players/pYYYYYYYYYYYYYYYYYYY').set({ owner: 'uidA', name: 'Sahte', avatar: 'kedi', code: 'YYYYYY', createdAt: 1 }));
    await assertFails(db.doc('codes/AAAAAA').set({ pid: pA, owner: 'uidN' }));
  });

  it('oyuncular listelenemez, yalnızca kimliği bilinen okunur; başkasının adı değiştirilemez', async () => {
    await assertFails(as('uidX').collection('players').get());
    await assertSucceeds(as('uidX').doc(`players/${pA}`).get());
    await assertFails(as('uidX').doc(`players/${pA}`).update({ name: 'Kötü' }));
    await assertFails(as('uidA').doc(`players/${pA}`).update({ name: 'x'.repeat(30) }));
    await assertSucceeds(as('uidA').doc(`players/${pA}`).update({ name: 'Ali Can', lastSeen: 5 }));
  });
});

describe('arkadaşlık', () => {
  it('istek yalnızca kendi oyuncusu adına ve doğru sahiplerle gönderilir', async () => {
    await assertSucceeds(as('uidA').doc(`friendships/${pair}`).set(request));
    await env.clearFirestore();
    await env.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().doc(`players/${pA}`).set({ owner: 'uidA', name: 'Ali', avatar: 'kedi', code: 'AAAAAA', createdAt: 1 });
      await ctx.firestore().doc(`players/${pB}`).set({ owner: 'uidB', name: 'Zeynep', avatar: 'panda', code: 'BBBBBB', createdAt: 1 });
    });
    await assertFails(as('uidX').doc(`friendships/${pair}`).set(request)); // yabancı Ali adına
    await assertFails(as('uidA').doc(`friendships/${pair}`).set({ ...request, status: 'accepted' })); // kendini onaylayamaz
    await assertFails(as('uidA').doc(`friendships/${pair}`).set({ ...request, owners: ['uidA', 'uidA'] }));
  });

  it('isteği yalnızca karşı tarafın ebeveyni onaylar', async () => {
    await assertSucceeds(as('uidA').doc(`friendships/${pair}`).set(request));
    await assertFails(as('uidA').doc(`friendships/${pair}`).update({ status: 'accepted' }));
    await assertFails(as('uidX').doc(`friendships/${pair}`).update({ status: 'accepted' }));
    await assertSucceeds(as('uidB').doc(`friendships/${pair}`).update({ status: 'accepted' }));
    await assertFails(as('uidX').doc(`friendships/${pair}`).get());
    await assertSucceeds(as('uidA').doc(`friendships/${pair}`).delete());
  });
});

describe('meydan okuma', () => {
  const ch = (extra: object = {}) => ({
    pair, members, owners, from: pA, kind: 'speed', lessonId: 'kedi', results: { [pA]: { percent: 72, stars: 3, image: 'data:,' } }, reactions: {}, createdAt: 1, updatedAt: 1, ...extra,
  });

  it('arkadaş olmadan gönderilemez; arkadaşsa gönderilir', async () => {
    await assertFails(as('uidA').doc('challenges/c1').set(ch()));
    await accepted();
    await assertSucceeds(as('uidA').doc('challenges/c1').set(ch()));
    await assertFails(as('uidA').doc('challenges/c2').set(ch({ from: pB }))); // arkadaşı adına
    await assertFails(as('uidX').doc('challenges/c1').get());
  });

  it('herkes yalnızca kendi sonucunu yazar', async () => {
    await accepted();
    await assertSucceeds(as('uidA').doc('challenges/c1').set(ch()));
    await assertSucceeds(as('uidB').doc('challenges/c1').update({ [`results.${pB}`]: { percent: 80, stars: 3, image: 'data:,' }, updatedAt: 2 }));
    await assertFails(as('uidB').doc('challenges/c1').update({ [`results.${pA}`]: { percent: 1, stars: 0, image: 'data:,' } }));
    await assertSucceeds(as('uidA').doc('challenges/c1').update({ [`reactions.${pA}`]: 'clap' }));
    await assertFails(as('uidA').doc('challenges/c1').update({ [`reactions.${pB}`]: 'clap' }));
    await assertFails(as('uidB').doc('challenges/c1').update({ kind: 'memory' }));
  });
});

describe('canlı düello ve birlikte boyama', () => {
  it('düello daveti, kabul ve sonuçlar', async () => {
    await accepted();
    const duel = { pair, members, owners, from: pA, lessonId: 'kedi', mode: 'look', state: 'invited', startAt: null, results: {}, createdAt: 1, updatedAt: 1 };
    await assertSucceeds(as('uidA').doc('duels/d1').set(duel));
    await assertSucceeds(as('uidB').doc('duels/d1').update({ state: 'countdown', startAt: 10, updatedAt: 2 }));
    await assertSucceeds(as('uidB').doc('duels/d1').update({ [`results.${pB}`]: { percent: 60, stars: 2, image: 'data:,' } }));
    await assertFails(as('uidB').doc('duels/d1').update({ [`results.${pA}`]: { percent: 0, stars: 0, image: 'data:,' } }));
    await assertFails(as('uidX').doc('duels/d1').update({ state: 'cancelled' }));
  });

  it('boyamada hamleyi yalnızca sırası gelen ekler', async () => {
    await accepted();
    const coop = { pair, members, owners, from: pA, lessonId: 'kedi', state: 'invited', turnOf: pB, moves: [], createdAt: 1, updatedAt: 1 };
    await assertSucceeds(as('uidA').doc('coops/k1').set(coop));
    const move = { by: pA, color: '#ff0000', at: [100, 100] };
    await assertFails(as('uidA').doc('coops/k1').update({ moves: [move] })); // sıra Zeynep'te
    await assertSucceeds(as('uidB').doc('coops/k1').update({ moves: [{ ...move, by: pB }], turnOf: pA, state: 'playing' }));
    await assertSucceeds(as('uidA').doc('coops/k1').update({ moves: [{ ...move, by: pB }, move], turnOf: pB }));
    await assertFails(as('uidX').doc('coops/k1').get());
  });
});
