/**
 * Evcil Hayvan Parkı: Çizio Adası'nda evin yanındaki çitli bahçe.
 *
 * Çocuk dostlarını besler, yıkar ve toplarıyla oynar. Park hayvanları (kedi ve köpek) kendi çizim
 * derslerinden yapılmış kartlardır, bahçede dolaşırlar. Üç etkinlik de aynı günlük görevi tamamlar.
 */
import * as THREE from 'three';
import { mesh, outline, toon } from '../play3d/kit';
import { holdItem } from './places';
import { sign, type WorldBuilder } from './zones';

/** Etkinlik adımında `period` saniyelik bir vuruş bu karede geçildi mi. */
const beat = (t: number, dt: number, period: number, off = 0) => t >= off && Math.floor((t - off) / period) !== Math.floor((t - dt - off) / period);

// ------------------------------------------------------------------------------------------------
// Evcil Hayvan Parkı (kasabada, evin yanında)
// ------------------------------------------------------------------------------------------------
/**
 * Çocuğun dostlarıyla ilgilendiği çitli bahçe: mama kabı, yıkama teknesi, top ve kulübe.
 * Park kasabanın (0,0) merkezine bakar; kasaba bölgesi tam merkezde olduğu için `frame()` yerine
 * kendi yerel eksenini kullanır (+lz kasabaya bakar).
 */
export function buildPetPark(b: WorldBuilder) {
    const PX = -19, PZ = -4, PR = 6.5;
    b.keepOut.push({ x: PX, z: PZ, r: PR + 2.5 });
    const ang = b.facing(PX, PZ, 0, 0);
    const ca = Math.cos(ang), sa = Math.sin(ang);
    /** Park yerel koordinatı → dünya. +lz kasabaya bakar. */
    const L = (lx: number, lz: number): [number, number] => [PX + lx * ca + lz * sa, PZ - lx * sa + lz * ca];
    const G = (lx: number, lz: number, dy = 0) => {
      const [x, z] = L(lx, lz);
      return new THREE.Vector3(x, b.h(x, z) + dy, z);
    };
    const put = <T extends THREE.Object3D>(o: T, lx: number, lz: number, rot = 0, dy = 0): T => b.place(o, ...L(lx, lz), ang + rot, dy);

    // çimen ve çit
    const grass = mesh(new THREE.CircleGeometry(PR, 32).rotateX(-Math.PI / 2), toon('#8fd16f'), false);
    grass.receiveShadow = true;
    put(grass, 0, 0, 0, 0.07);
    for (let i = 0; i < 22; i++) {
      const a = (i / 22) * Math.PI * 2;
      // kasabaya bakan yüzde giriş boşluğu
      if (Math.abs(((a - Math.PI / 2 + Math.PI) % (Math.PI * 2)) - Math.PI) < 0.42) continue;
      const post = outline(mesh(new THREE.BoxGeometry(0.2, 1.3, 0.2), toon('#b9773f')), 1.05);
      post.position.y = 0.65;
      const [px, pz] = [Math.cos(a) * PR, Math.sin(a) * PR];
      put(post, px, pz);
      b.block(...L(px, pz), 0.3);
    }
    const rail = mesh(new THREE.TorusGeometry(PR, 0.08, 6, 48), toon('#b9773f'), false);
    rail.rotation.x = Math.PI / 2;
    put(rail, 0, 0, 0, 0.82);
    const rail2 = rail.clone();
    put(rail2, 0, 0, 0, 0.42);
    b.place(sign('Evcil Hayvan Parkı', '#ffe1a8'), ...L(0, PR + 1.8), ang);

    // kulübe
    {
      const kul = new THREE.Group();
      kul.add(outline(mesh(new THREE.BoxGeometry(2.6, 2, 2.4), toon('#e0a95c')), 1.03).translateY(1));
      const cati = outline(mesh(new THREE.ConeGeometry(2.1, 1.2, 4), toon('#c0563f')), 1.04);
      cati.position.y = 2.6;
      cati.rotation.y = Math.PI / 4;
      const kapi = mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.14, 16, 1, false, 0, Math.PI), toon('#6b4a33'), false);
      kapi.rotation.set(Math.PI / 2, 0, 0);
      kapi.position.set(0, 0.78, 1.22);
      kul.add(cati, kapi);
      put(kul, -4.2, -2.6, 0.5);
      b.block(...L(-4.2, -2.6), 1.7);
    }

    // mama ve su kabı
    const mama: THREE.Mesh[] = [];
    for (const [i, [lx, lz, c]] of ([[3.4, -1.2, '#e9b64a'], [5, -1.2, '#6fc7e8']] as const).entries()) {
      const kap = outline(mesh(new THREE.CylinderGeometry(0.62, 0.48, 0.34, 16), toon('#cfd6e2')), 1.05);
      kap.position.y = 0.17;
      put(kap, lx, lz);
      const ic = mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.12, 16), toon(c), false);
      ic.position.y = 0.3;
      ic.visible = i === 1;
      put(ic, lx, lz);
      mama.push(ic);
      b.block(...L(lx, lz), 0.7);
    }

    // yıkama teknesi
    const tekne = new THREE.Group();
    {
      tekne.add(outline(mesh(new THREE.CylinderGeometry(1.25, 1.05, 0.9, 20), toon('#eef6fb')), 1.04).translateY(0.45));
      const su = mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.1, 20), toon('#6fc7e8', { transparent: true, opacity: 0.85 }), false);
      su.position.y = 0.72;
      tekne.add(su);
      put(tekne, -4, 2.6);
      b.block(...L(-4, 2.6), 1.4);
    }

    // top
    const top = outline(mesh(new THREE.SphereGeometry(0.36, 14, 10), toon('#ef4b4b')), 1.07);
    const topObj = put(top, 1.6, 3.4, 0, 0.36);

    // park dostları: kedi ve köpek (çizim kartları)
    for (const [key, s, lx, lz] of [['kopek', 2.4, -1.6, -1.2], ['kedi', 1.9, 2.2, 1.4]] as const) {
      if (!b.tex[key]) continue;
      b.wander(b.card(key, s), ...L(lx, lz), PR - 2.4, 0.8);
    }

    /** Dostların üstünde kalp çıkar. */
    const kalp = (lx: number, lz: number) => b.sparkles.burst(G(lx, lz, 1.6), 10, '#ff8fb1');

    b.spot({
      id: 'pet-besle', x: L(3.4, 1.1)[0], z: L(3.4, 1.1)[1], r: 2.4, label: 'Dostlarını besle',
      act: {
        dur: 4.4, pose: (u) => (u < 0.55 ? 'hold' : 'clap'), quest: 'pet', cam: [10, 5.5],
        start(a) {
          const kase = new THREE.Group();
          kase.add(outline(mesh(new THREE.CylinderGeometry(0.22, 0.16, 0.26, 12), toon('#e9b64a')), 1.07));
          holdItem(a, kase);
          mama[0].visible = false;
        },
        step(t, u, a, dt) {
          a.pos.copy(G(3.4, 0.6));
          a.heading = ang + Math.PI;
          if (u > 0.5) {
            a.hand.getObjectByName('held')?.removeFromParent();
            mama[0].visible = true;
          }
          if (beat(t, dt, 0.8, 0.6)) {
            b.sound.fx?.('pop');
            kalp(3.4, -1.2);
          }
        },
        end: () => {
          b.sound.fx?.('yay');
          return 'Mamalar hazır! Dostların karnını doyurdu.';
        },
      },
    });

    b.spot({
      id: 'pet-yika', x: L(-4, 4.4)[0], z: L(-4, 4.4)[1], r: 2.4, label: 'Dostunu yıka',
      act: {
        dur: 5.2, pose: 'hold', quest: 'pet', cam: [10, 5.5],
        step(t, u, a, dt) {
          a.pos.copy(G(-4, 4.2));
          a.heading = ang + Math.PI;
          if (beat(t, dt, 0.4)) {
            b.sparkles.burst(G(-4, 2.6, 1 + u * 0.8), 5, '#ffffff');
            b.sound.fx?.('spray');
          }
        },
        end: () => {
          b.sound.fx?.('yay');
          kalp(-4, 2.6);
          return 'Köpüklü banyo bitti! Mis gibi oldu.';
        },
      },
    });

    b.spot({
      id: 'pet-oyna', x: L(1.6, 5)[0], z: L(1.6, 5)[1], r: 2.4, label: 'Topla oyna',
      act: {
        dur: 6, pose: (u) => (u % 0.5 < 0.25 ? 'wave' : 'clap'), quest: 'pet', cam: [12, 6],
        step(t, u, a, dt) {
          a.pos.copy(G(1.6, 4.6));
          a.heading = ang + Math.PI;
          // top ileri gidip geri gelir, zıplayarak
          const k = (u * 3) % 1;
          const ileri = Math.floor(u * 3) % 2 === 0 ? k : 1 - k;
          const p = G(1.6, 3.4).lerp(G(-2.4, -3.4), ileri);
          topObj.position.set(p.x, p.y + 0.36 + Math.abs(Math.sin(k * Math.PI * 2)) * 1.3, p.z);
          if (beat(t, dt, 1)) b.sound.fx?.('bounce');
        },
        end: () => {
          topObj.position.copy(G(1.6, 3.4, 0.36));
          b.sound.fx?.('yay');
          kalp(-1, 0);
          return 'Koş topu getir! Dostların çok eğlendi.';
        },
      },
    });
  }
