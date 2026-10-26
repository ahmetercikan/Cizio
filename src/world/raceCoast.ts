/**
 * Yarış Kıyısı: adanın batı-güneybatıdaki yeni yarımadası (layout.ts → CAPES).
 * - Yarış Kapıları: dört kapı (Kart Yarışı, Engelli Koşu, Volkan ve Buz Parkuru; races.ts)
 * - Engel Parkuru: çamur havuzunun üstünde ahşap direkler, süre tutulur; düşen son bastığı direğe döner
 * - Trambolin Parkı: trambolinden trambolinine uçup havadaki halkalardan geçilir
 * - Balon Alanı: uçuşan balonlara dokunup patlat
 * Zıplamalar adadaki yardımlı zıplamayı kullanır (b.surfaces → jumpAssist.ts).
 */
import * as THREE from 'three';
import { mesh, outline, toon } from '../play3d/kit';
import { zone } from './layout';
import { portalGate, RACE_REALMS, type RealmId } from './homestead';
import { sign, type WorldBuilder } from './zones';

export function buildRaceCoast(b: WorldBuilder, enter: (id: RealmId) => void) {
  const R = zone('race');
  b.keepOut.push({ x: R.x, z: R.z, r: 78 });
  const sound = b.sound;

  // ---- Yarış Kapıları: meydan ve dört kapı (batı yarım çemberi; gelen yol doğudan)
  const plaza = mesh(new THREE.CylinderGeometry(19, 19.5, 0.25, 48), toon('#ffe3d6'), false);
  b.place(plaza, R.x, R.z, 0, 0.03);
  const inner = mesh(new THREE.CylinderGeometry(5, 5, 0.27, 32), toon('#ff8a65'), false);
  b.place(inner, R.x, R.z, 0, 0.04);
  RACE_REALMS.forEach((r, i) => {
    const a = Math.PI + (i - 1.5) * 0.62;
    const x = R.x + Math.cos(a) * 13, z = R.z + Math.sin(a) * 13;
    portalGate(b, r, x, z, b.facing(x, z, R.x, R.z), i, enter);
  });
  b.place(sign('Yarış Kıyısı', '#ffe3d6'), R.x + 25, R.z + 7, Math.PI / 2);
  b.place(sign('Yarış Kapıları', '#ffd1c2'), R.x + 16, R.z - 9, Math.PI / 2);
  // meydanın çevresinde renkli bayraklar
  const fcols = ['#ef4b4b', '#ffc83d', '#4dabf7', '#7cc760', '#e9487d', '#9775fa'];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.3;
    if (Math.cos(a) < -0.55) continue; // kapıların arkası boş kalsın
    const g = new THREE.Group();
    const p = mesh(new THREE.CylinderGeometry(0.07, 0.09, 4.4, 6), toon('#ffffff'));
    p.position.y = 2.2;
    const f = mesh(new THREE.PlaneGeometry(1.3, 0.8), new THREE.MeshToonMaterial({ color: fcols[i % fcols.length], side: THREE.DoubleSide }), false);
    f.position.set(0.66, 3.9, 0);
    g.add(p, f);
    g.userData.foot = { r: 0.3 };
    b.place(g, R.x + Math.cos(a) * 20.5, R.z + Math.sin(a) * 20.5, -a);
    b.tick((_dt, t) => void (f.rotation.y = Math.sin(t * 3 + i) * 0.35));
  }

  // ---- Engel Parkuru (meydanın kuzeyinde, doğudan batıya)
  {
    const sx = R.x + 22, sz = R.z - 36;
    const g0 = b.h(sx, sz);
    const mud = mesh(new THREE.PlaneGeometry(70, 12).rotateX(-Math.PI / 2), toon('#8b5e3c'), false);
    b.place(mud, sx - 30, sz + 0.5, 0, 0.04);
    // [x farkı, z farkı, genişlik, derinlik, yükseklik]; 'pad' trambolin, 'end' bitiş
    const course: [number, number, number, number, number, ('pad' | 'end')?][] = [
      [0, 0, 5, 5, 0.6], [-6, 0, 2.4, 2.4, 1.2], [-11, 1.6, 2.4, 2.4, 1.8], [-16, -0.6, 2.2, 2.2, 2.4], [-21.5, 1, 3, 3, 2],
      [-27, 0, 2.8, 2.8, 0.5, 'pad'], [-34, 0, 3, 3, 4], [-39.5, 1.6, 2.2, 2.2, 3.4], [-46, 1.6, 6.5, 1.3, 3], [-53, 0, 2.4, 2.4, 2.4],
      [-59, 0, 5, 5, 1, 'end'],
    ];
    const tops: { x: number; z: number; y: number; w: number; d: number; kind?: 'pad' | 'end' }[] = [];
    course.forEach(([dx, dz, w, d, h, kind], i) => {
      const x = sx + dx, z = sz + dz, y = g0 + h;
      if (kind === 'pad') {
        const pad = new THREE.Group();
        const ring = outline(mesh(new THREE.TorusGeometry(w / 2, 0.2, 8, 24).rotateX(Math.PI / 2), toon('#3a3f4a')), 1.04);
        ring.position.y = h;
        const mat = mesh(new THREE.CylinderGeometry(w / 2 - 0.1, w / 2 - 0.1, 0.08, 24), toon('#4dabf7'), false);
        mat.position.y = h - 0.02;
        pad.add(ring, mat);
        b.place(pad, x, z);
        b.decks.push({ x, z, r: w / 2, y });
      } else {
        const post = outline(mesh(new THREE.BoxGeometry(w, h, d), toon(kind === 'end' ? '#7cc760' : i % 2 ? '#c98a4b' : '#b9773f')), 1.03);
        post.position.y = h / 2;
        const g = new THREE.Group();
        g.add(post);
        b.place(g, x, z);
        b.decks.push({ x, z, w, d, y, tall: h > 0.9 });
      }
      b.surfaces.push({ x, y, z, w, d, round: kind === 'pad' });
      tops.push({ x, z, y, w, d, kind });
    });
    const end = tops[tops.length - 1];
    const flag = new THREE.Group();
    const fp = mesh(new THREE.CylinderGeometry(0.1, 0.1, 4, 8), toon('#ffffff'));
    fp.position.y = 2;
    const fl = mesh(new THREE.PlaneGeometry(1.8, 1.1), new THREE.MeshToonMaterial({ color: '#ef4b4b', side: THREE.DoubleSide }), false);
    fl.position.set(0.9, 3.4, 0);
    flag.add(fp, fl);
    flag.position.set(end.x - 1.5, end.y, end.z - 1.5);
    b.scene.add(flag);
    b.place(sign('Engel Parkuru', '#fff1c7'), sx + 6, sz + 5, Math.PI / 2);
    let running = false, t0 = 0, last = 0, best = Infinity, lastLaunch = 0, now = 0;
    const inside = (p: (typeof tops)[number], x: number, z: number) =>
      p.kind === 'pad' ? Math.hypot(x - p.x, z - p.z) < p.w / 2 + 0.2 : Math.abs(x - p.x) < p.w / 2 + 0.3 && Math.abs(z - p.z) < p.d / 2 + 0.3;
    b.spot({
      id: 'parkur', x: sx + 3.6, z: sz, r: 2.4, label: 'Engel Parkuruna başla',
      act: {
        dur: 0.9, pose: 'jump', cam: [12, 6],
        step: (_t, u, a) => {
          a.pos.set(sx + 3.6 - u * 3.4, g0 + Math.sin(u * Math.PI) * 1.4 + u * 0.6, sz);
          a.heading = -Math.PI / 2;
        },
        end: () => {
          running = true;
          t0 = now;
          last = 0;
          sound.fx?.('whistle');
          return 'Süre başladı! Direklerden zıpla, bayrağa ulaş!';
        },
      },
    });
    b.tick((_dt, t) => {
      now = t;
      const h = b.hero, p = h.pos;
      if (Math.abs(p.x - (sx - 30)) > 40 || Math.abs(p.z - sz) > 10) return;
      if (h.grounded) {
        const i = tops.findIndex((q) => inside(q, p.x, p.z) && Math.abs(p.y - q.y) < 0.4);
        if (i >= 0) {
          last = Math.max(last, i);
          const q = tops[i];
          if (q.kind === 'pad' && t - lastLaunch > 0.4) {
            lastLaunch = t;
            h.launch = 19;
            h.grounded = false;
            sound.fx?.('boing');
            b.sparkles.burst(new THREE.Vector3(q.x, q.y + 0.3, q.z), 10, '#4dabf7');
          }
          if (q.kind === 'end' && running) {
            running = false;
            const sec = Math.round((t - t0) * 10) / 10;
            const rec = sec < best;
            best = Math.min(best, sec);
            sound.fx?.('cheer');
            b.sparkles.burst(new THREE.Vector3(q.x, q.y + 2, q.z), 24);
            b.say(rec ? `Bitirdin! ${sec} saniye, yeni rekor!` : `Bitirdin! ${sec} saniye. Rekorun ${best} saniye.`);
          }
        } else if (running && p.y < g0 + 0.3) {
          // çamura düştü: son bastığı direğe döner, süre işlemeye devam eder
          const q = tops[last];
          p.set(q.x, q.y, q.z);
          h.vy = 0;
          sound.pop();
          b.say('Hoppala, çamura düştün! Son direğe döndün.');
        }
      }
    });
  }

  // ---- Trambolin Parkı (meydanın güneybatısında): trambolinden trambolinine uç, halkalardan geç
  {
    const cx = R.x - 6, cz = R.z + 40;
    const pads: { x: number; z: number; y: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const a = -0.9 + i * 0.32;
      const x = cx + Math.cos(a) * 26 - 18, z = cz + Math.sin(a) * 12;
      const y = b.h(x, z) + 0.5;
      const pad = new THREE.Group();
      const ring = outline(mesh(new THREE.TorusGeometry(1.7, 0.22, 8, 24).rotateX(Math.PI / 2), toon(['#ef4b4b', '#ffc83d', '#7cc760', '#4dabf7'][i % 4])), 1.04);
      ring.position.y = 0.5;
      const mat = mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.08, 24), toon('#2b2d33'), false);
      mat.position.y = 0.48;
      for (let k = 0; k < 4; k++) {
        const leg = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 5), toon('#3a3f4a'), false);
        leg.position.set(Math.cos(k * 1.57) * 1.6, 0.25, Math.sin(k * 1.57) * 1.6);
        pad.add(leg);
      }
      pad.add(ring, mat);
      b.place(pad, x, z);
      b.decks.push({ x, z, r: 1.8, y });
      b.surfaces.push({ x, y, z, w: 3.4, d: 3.4, round: true });
      pads.push({ x, z, y });
    }
    // halkalar: iki trambolinin arasında, uçuşun tepesinde
    const rings: { obj: THREE.Object3D; taken: boolean }[] = [];
    for (let i = 1; i < pads.length; i++) {
      const a = pads[i - 1], c = pads[i];
      const r = outline(mesh(new THREE.TorusGeometry(1.3, 0.14, 8, 24), toon('#ffd43b', { emissive: '#7a5a00' })), 1.06);
      r.position.set((a.x + c.x) / 2, Math.max(a.y, c.y) + 4.6, (a.z + c.z) / 2);
      r.rotation.y = Math.atan2(c.x - a.x, c.z - a.z);
      r.userData.moving = true;
      b.scene.add(r);
      rings.push({ obj: r, taken: false });
    }
    b.place(sign('Trambolin Parkı', '#d0ecff'), pads[0].x + 4, pads[0].z - 4, Math.PI / 2);
    let lastLaunch = 0, got = 0, resetAt = 0;
    b.tick((_dt, t) => {
      const h = b.hero, p = h.pos;
      if (Math.abs(p.x - cx + 10) > 40 || Math.abs(p.z - cz) > 30) return;
      for (const r of rings) {
        r.obj.rotation.z = Math.sin(t * 2) * 0.1;
        if (r.taken) continue;
        if (Math.hypot(p.x - r.obj.position.x, p.y + 1 - r.obj.position.y, p.z - r.obj.position.z) < 2.3) {
          r.taken = true;
          r.obj.visible = false;
          got++;
          sound.star(got);
          b.sparkles.burst(r.obj.position.clone(), 14, '#ffd43b');
          if (got === rings.length) {
            sound.fx?.('cheer');
            b.say('Bütün halkalardan geçtin, uçan bir şampiyonsun!');
            resetAt = t + 8;
          } else b.say(`Halka ${got}/${rings.length}`);
        }
      }
      if (resetAt && t > resetAt) {
        resetAt = 0;
        got = 0;
        for (const r of rings) r.obj.visible = !(r.taken = false);
      }
      if (!h.grounded || t - lastLaunch < 0.4) return;
      for (const q of pads) {
        if (Math.hypot(p.x - q.x, p.z - q.z) < 1.7 && Math.abs(p.y - q.y) < 0.4) {
          lastLaunch = t;
          h.launch = 18;
          h.grounded = false;
          sound.fx?.('boing');
          b.sparkles.burst(new THREE.Vector3(q.x, q.y + 0.2, q.z), 8, '#ffffff');
          break;
        }
      }
    });
  }

  // ---- Balon Alanı (meydanın güneydoğusunda): uçuşan balonlara dokun, patlat
  {
    const cx = R.x + 24, cz = R.z + 30;
    const bcols = ['#ef4b4b', '#ffc83d', '#4dabf7', '#7cc760', '#e9487d', '#9775fa', '#ff8a3d'];
    const balloons: { obj: THREE.Object3D; x: number; z: number; y: number; ph: number; popped: boolean }[] = [];
    const rnd = (i: number) => ((Math.sin(i * 91.7) * 43758.5) % 1 + 1) % 1;
    for (let i = 0; i < 14; i++) {
      const a = rnd(i) * Math.PI * 2, r = 3 + rnd(i + 30) * 11;
      const x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
      const g = new THREE.Group();
      const ball = outline(mesh(new THREE.SphereGeometry(0.55, 14, 10), toon(bcols[i % bcols.length])), 1.06);
      ball.scale.y = 1.2;
      const str = mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.1, 4), toon('#ffffff'), false);
      str.position.y = -1.1;
      g.add(ball, str);
      const y = b.h(x, z) + 1.6 + rnd(i + 60) * 2.6;
      g.position.set(x, y, z);
      g.userData.moving = true;
      b.scene.add(g);
      balloons.push({ obj: g, x, z, y, ph: i, popped: false });
    }
    b.place(sign('Balon Alanı', '#ffe1ec'), cx - 15, cz - 4, Math.PI / 2);
    let popped = 0, respawn = 0;
    b.tick((_dt, t) => {
      const p = b.hero.pos;
      const near = Math.abs(p.x - cx) < 30 && Math.abs(p.z - cz) < 30;
      for (const bl of balloons) {
        if (bl.popped) continue;
        bl.obj.position.set(bl.x + Math.sin(t * 0.7 + bl.ph) * 0.6, bl.y + Math.sin(t * 1.3 + bl.ph) * 0.35, bl.z + Math.cos(t * 0.6 + bl.ph) * 0.6);
        if (!near) continue;
        const o = bl.obj.position;
        if (Math.hypot(p.x - o.x, p.z - o.z) < 1.3 && p.y + 2.2 > o.y && p.y < o.y + 0.5) {
          bl.popped = true;
          bl.obj.visible = false;
          popped++;
          sound.pop();
          b.sparkles.burst(o.clone(), 12, bcols[bl.ph % bcols.length]);
          if (popped === balloons.length) {
            sound.fx?.('cheer');
            b.say('Bütün balonları patlattın! Yenileri geliyor.');
            respawn = t + 6;
          }
        }
      }
      if (respawn && t > respawn) {
        respawn = 0;
        popped = 0;
        for (const bl of balloons) bl.obj.visible = !(bl.popped = false);
      }
    });
  }
}
