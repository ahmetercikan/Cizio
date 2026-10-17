/**
 * Çizio Adası'nın araçları: arabalar, ambulans, itfaiye, uçak, traktör, tekne ve jet ski.
 *
 * Karaktere göre gerçek boyutta (karakter ~2,3 boyunda, kalçası yerden 1 birim): araba ~5 uzunluğunda, uçak ~11.
 * Yuvarlak köşeli gövde, jantlı tekerlek, cam, far, stop lambası, tampon, direksiyon ve koltuklar.
 * Her model önü +z'ye bakar; tekerlekler 'wheel' adlıdır (döner). `seat`: karakterin kökünün (ayak) aracın kendi
 * eksenindeki yeri: kalça koltuğun üstüne oturur, bacaklar gövdenin içinde kalır.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mesh, outline, toon } from '../play3d/kit';

/** Karakterin kalçası ile ayağı arası. */
const HIP = 1.0;
export interface VehicleModel {
  model: THREE.Group;
  seat: [number, number, number];
  /** Tepe lambaları (ambulans, itfaiye): yanıp söner. */
  beacons?: THREE.Mesh[];
  /** Pervane (uçak). */
  prop?: THREE.Object3D;
}

const geos = new Map<string, THREE.BufferGeometry>();
const RB = (w: number, h: number, d: number, r = 0.2) => {
  const k = `${w}|${h}|${d}|${r}`;
  let g = geos.get(k);
  if (!g) {
    g = new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2) * 0.999);
    geos.set(k, g);
  }
  return g;
};
const GLASS = () => toon('#bfe6ff', { transparent: true, opacity: 0.5 });
const DARK = '#3a3f4a', CHROME = '#e9ecef', TIRE = '#2b2d33';

class Kit {
  g = new THREE.Group();
  add<T extends THREE.Object3D>(o: T, x: number, y: number, z: number): T {
    o.position.set(x, y, z);
    this.g.add(o);
    return o;
  }
  /** Konturlu yuvarlak kutu. */
  box(w: number, h: number, d: number, c: string | THREE.Material, x: number, y: number, z: number, r = 0.2, edge = true) {
    const m = mesh(RB(w, h, d, r), typeof c === 'string' ? toon(c) : c, true);
    return this.add(edge ? outline(m, 1.025) : m, x, y, z);
  }
  /** Jantlı tekerlek (yan yüzü x eksenine bakar). */
  wheel(x: number, y: number, z: number, r = 0.55, w = 0.42, rim = CHROME) {
    const wg = new THREE.Group();
    wg.name = 'wheel';
    const tire = mesh(new THREE.CylinderGeometry(r, r, w, 22), toon(TIRE));
    tire.rotation.z = Math.PI / 2;
    const side = mesh(new THREE.TorusGeometry(r * 0.86, r * 0.12, 6, 20), toon('#1f2126'), false);
    side.rotation.y = Math.PI / 2;
    const disc = mesh(new THREE.CylinderGeometry(r * 0.6, r * 0.6, w + 0.03, 16), toon(rim), false);
    disc.rotation.z = Math.PI / 2;
    const hub = mesh(new THREE.CylinderGeometry(r * 0.2, r * 0.2, w + 0.06, 10), toon(DARK), false);
    hub.rotation.z = Math.PI / 2;
    wg.add(tire, side, disc, hub);
    for (let i = 0; i < 5; i++) {
      const sp = mesh(new THREE.BoxGeometry(w + 0.05, r * 0.1, r * 0.5), toon(shade(rim, 0.8)), false);
      sp.rotation.x = (i / 5) * Math.PI * 2;
      wg.add(sp);
    }
    return this.add(wg, x, y, z);
  }
  /** Ön farlar (z: ön yüz) ve arka stop lambaları. */
  lights(zf: number, zb: number, y: number, wx: number) {
    for (const s of [-1, 1]) {
      const f = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 14), toon('#fff6c9', { emissive: '#a08a20' }), false);
      f.rotation.x = Math.PI / 2;
      this.add(f, s * wx, y, zf);
      this.box(0.4, 0.18, 0.06, toon('#ff4d4d', { emissive: '#7a1010' }), s * wx, y, zb, 0.05, false);
    }
  }
  /** Tamponlar. */
  bumpers(zf: number, zb: number, y: number, w: number) {
    this.box(w, 0.26, 0.32, DARK, 0, y, zf, 0.12);
    this.box(w, 0.26, 0.32, DARK, 0, y, zb, 0.12);
  }
  /** Ön cam (çerçeveli, eğik). */
  windshield(w: number, h: number, y: number, z: number, tilt = -0.35, frame = DARK) {
    const g = new THREE.Group();
    const gl = mesh(new THREE.BoxGeometry(w - 0.1, h, 0.05), GLASS(), false);
    g.add(gl);
    for (const s of [-1, 1]) {
      const p = mesh(new THREE.BoxGeometry(0.08, h + 0.08, 0.1), toon(frame), false);
      p.position.x = s * (w / 2 - 0.04);
      g.add(p);
    }
    const top = mesh(new THREE.BoxGeometry(w, 0.08, 0.1), toon(frame), false);
    top.position.y = h / 2;
    g.add(top);
    g.rotation.x = tilt;
    return this.add(g, 0, y, z);
  }
  /** Koltuk: oturak üstü y'de; arkalık ve başlık. */
  seat(x: number, top: number, z: number, c: string, w = 0.9) {
    this.box(w, 0.28, 0.85, c, x, top - 0.14, z, 0.1, false);
    this.box(w, 0.95, 0.24, c, x, top + 0.4, z - 0.42, 0.1, false);
    this.box(w * 0.6, 0.3, 0.2, shade(c, 0.9), x, top + 1.0, z - 0.44, 0.08, false);
  }
  /** Direksiyon (sürücünün önünde). */
  steering(x: number, y: number, z: number) {
    const t = mesh(new THREE.TorusGeometry(0.26, 0.045, 8, 20), toon(DARK), false);
    t.rotation.x = -0.9;
    this.add(t, x, y, z);
    const col = mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 6), toon(DARK), false);
    col.rotation.x = 0.7;
    this.add(col, x, y - 0.18, z + 0.18);
  }
  mirrors(z: number, y: number, wx: number, c: string) {
    for (const s of [-1, 1]) this.box(0.28, 0.2, 0.12, c, s * wx, y, z, 0.05, false);
  }
  plate(z: number, y: number) {
    this.box(0.6, 0.18, 0.04, '#ffffff', 0, y, z, 0.02, false);
  }
  done(scale = 1) {
    this.g.scale.setScalar(scale);
    this.g.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) o.castShadow = true;
    });
    return this.g;
  }
}
const shade = (c: string, k: number) => '#' + new THREE.Color(c).multiplyScalar(k).getHexString();
/** Koltuk üstü → karakterin kökü (aracın kendi ekseninde, ölçek düzeltmeli). */
const seatPos = (x: number, top: number, z: number, scale = 1): [number, number, number] => [x, top - HIP / scale + 0.04, z];

// ================================================================================================
// Arabalar
// ================================================================================================
export function carModel(id: string): VehicleModel {
  // traktör ve uçak: çiftlikte/pistte duran modellerin aynısı
  if (id === 'traktor') return tractorModel();
  if (id === 'ucak') return planeModel();
  const k = new Kit();
  let seat: [number, number, number] = seatPos(-0.5, 0.95, -0.3);
  switch (id) {
    case 'bisiklet': {
      for (const z of [-1.0, 1.0]) {
        const w = new THREE.Group();
        w.name = 'wheel';
        const t = mesh(new THREE.TorusGeometry(0.62, 0.08, 8, 24), toon(TIRE));
        t.rotation.y = Math.PI / 2;
        w.add(t);
        for (let i = 0; i < 8; i++) {
          const sp = mesh(new THREE.BoxGeometry(0.02, 1.2, 0.02), toon('#c0c6cf'), false);
          sp.rotation.x = (i / 8) * Math.PI;
          w.add(sp);
        }
        k.add(w, 0, 0.66, z);
      }
      const frame = (x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) => {
        const a = new THREE.Vector3(x1, y1, z1), b = new THREE.Vector3(x2, y2, z2);
        const m = mesh(new THREE.CylinderGeometry(0.06, 0.06, a.distanceTo(b), 8), toon('#4dabf7'));
        m.position.copy(a).add(b).multiplyScalar(0.5);
        m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
        k.g.add(m);
      };
      frame(0, 0.66, -1.0, 0, 1.1, -0.15);
      frame(0, 1.1, -0.15, 0, 0.66, 1.0);
      frame(0, 1.1, -0.15, 0, 1.25, 0.75);
      frame(0, 0.66, -1.0, 0, 1.2, -0.5);
      k.box(0.95, 0.07, 0.07, DARK, 0, 1.45, 0.82, 0.03, false);
      k.box(0.42, 0.12, 0.6, '#ff8fb1', 0, 1.28, -0.55, 0.06, false);
      k.box(0.5, 0.36, 0.4, '#ffd43b', 0, 1.25, 1.15, 0.1);
      return { model: k.done(1.1), seat: seatPos(0, 1.34, -0.5, 1.1) };
    }
    case 'mini': {
      const c = '#ff5c5c';
      k.box(2.5, 0.85, 4.6, c, 0, 0.82, 0, 0.35);
      k.box(2.36, 0.34, 1.5, c, 0, 1.33, 1.45, 0.16);
      k.box(2.36, 0.3, 1.0, c, 0, 1.3, -1.75, 0.14);
      k.box(2.0, 0.12, 2.4, '#ffe3e3', 0, 1.24, -0.2, 0.05, false);
      k.windshield(2.2, 0.75, 1.75, 0.6);
      k.seat(-0.55, 0.95, -0.4, '#fff1c7', 0.85);
      k.seat(0.55, 0.95, -0.4, '#fff1c7', 0.85);
      k.steering(-0.55, 1.55, 0.25);
      k.lights(2.3, -2.3, 0.95, 0.8);
      k.bumpers(2.32, -2.32, 0.5, 2.4);
      k.mirrors(0.5, 1.55, 1.3, c);
      k.plate(-2.5, 0.6);
      for (const s of [-1, 1]) for (const z of [-1.5, 1.5]) k.wheel(s * 1.2, 0.56, z, 0.56);
      seat = seatPos(-0.55, 0.95, -0.4);
      break;
    }
    case 'jip': {
      const c = '#5fbf6f';
      k.box(2.7, 1.1, 4.9, c, 0, 1.25, 0, 0.25);
      k.box(2.5, 0.3, 1.6, shade(c, 0.9), 0, 1.92, 1.45, 0.12);
      k.box(1.6, 0.5, 0.12, DARK, 0, 1.4, 2.47, 0.04);
      k.windshield(2.5, 0.9, 2.45, 0.6, -0.1);
      k.seat(-0.6, 1.45, -0.5, '#c98a4b', 0.9);
      k.seat(0.6, 1.45, -0.5, '#c98a4b', 0.9);
      k.steering(-0.6, 2.05, 0.2);
      for (const s of [-1, 1]) k.box(0.12, 1.3, 0.12, DARK, s * 1.25, 2.45, -1.2, 0.05, false);
      k.box(2.6, 0.12, 0.12, DARK, 0, 3.1, -1.2, 0.05, false);
      const spare = k.wheel(0, 1.45, -2.65, 0.6, 0.35, DARK);
      spare.rotation.y = Math.PI / 2;
      spare.name = 'spare';
      k.lights(2.47, -2.47, 1.4, 0.85);
      k.bumpers(2.55, -2.55, 0.75, 2.8);
      k.mirrors(0.5, 2.15, 1.42, c);
      for (const s of [-1, 1]) for (const z of [-1.6, 1.6]) k.wheel(s * 1.3, 0.75, z, 0.75, 0.55, DARK);
      seat = seatPos(-0.6, 1.45, -0.5);
      break;
    }
    case 'karavan': {
      const c = '#fff1c7';
      k.box(2.7, 1.0, 6.2, c, 0, 1.05, 0, 0.3);
      k.box(2.7, 1.9, 3.4, c, 0, 2.45, -1.35, 0.35);
      k.box(2.72, 0.3, 6.22, '#4dabf7', 0, 1.2, 0, 0.1, false);
      for (const z of [-2.3, -0.9]) for (const s of [-1, 1]) k.box(0.06, 0.7, 0.9, GLASS(), s * 1.36, 2.6, z, 0.04, false);
      k.box(0.06, 1.5, 0.8, '#ff8fb1', 1.36, 2.1, -0.2, 0.04, false);
      k.box(1.0, 0.3, 0.8, '#dee2e6', 0, 3.5, -1.6, 0.1);
      k.windshield(2.5, 0.85, 1.95, 1.85, -0.3);
      k.seat(-0.6, 1.3, 1.05, '#ff8fb1', 0.9);
      k.seat(0.6, 1.3, 1.05, '#ff8fb1', 0.9);
      k.steering(-0.6, 1.85, 1.65);
      k.lights(3.1, -3.1, 1.15, 0.9);
      k.bumpers(3.15, -3.15, 0.55, 2.8);
      k.mirrors(1.8, 1.9, 1.45, c);
      for (const s of [-1, 1]) for (const z of [-2.0, 2.0]) k.wheel(s * 1.3, 0.6, z, 0.6);
      seat = seatPos(-0.6, 1.3, 1.05);
      break;
    }
    case 'spor': {
      const c = '#ffd43b';
      k.box(2.5, 0.7, 5.0, c, 0, 0.65, 0, 0.3);
      k.box(2.3, 0.3, 1.8, c, 0, 1.05, 1.5, 0.15).rotation.x = 0.1;
      k.box(0.6, 0.72, 5.02, '#ef4b4b', 0, 0.65, 0, 0.1, false);
      k.windshield(2.2, 0.55, 1.35, 0.5, -0.6);
      k.seat(-0.55, 0.75, -0.5, DARK, 0.8);
      k.seat(0.55, 0.75, -0.5, DARK, 0.8);
      k.steering(-0.55, 1.25, 0.1);
      k.box(2.5, 0.1, 0.55, DARK, 0, 1.45, -2.25, 0.04);
      for (const s of [-0.9, 0.9]) k.box(0.1, 0.5, 0.1, DARK, s, 1.2, -2.25, 0.03, false);
      k.lights(2.5, -2.5, 0.75, 0.85);
      k.bumpers(2.55, -2.55, 0.38, 2.4);
      for (const s of [-1, 1]) for (const z of [-1.6, 1.6]) k.wheel(s * 1.2, 0.5, z, 0.5, 0.45, '#ffd43b');
      seat = seatPos(-0.55, 0.75, -0.5);
      break;
    }
    case 'skuter': {
      // skuter: basamaklı gövde, ön panel, gidon, arkada sepet
      const c = '#ff8fb1';
      for (const z of [-0.95, 0.95]) k.wheel(0, 0.44, z, 0.44, 0.26, '#e9ecef');
      k.box(0.78, 0.4, 2.1, c, 0, 0.74, -0.1, 0.18);
      k.box(0.8, 1.15, 0.55, c, 0, 1.3, 1.0, 0.22);
      k.box(0.6, 0.12, 0.44, GLASS(), 0, 1.78, 1.18, 0.05, false);
      k.box(0.66, 0.24, 1.0, DARK, 0, 1.06, -0.6, 0.11, false);
      k.box(0.66, 0.5, 0.18, DARK, 0, 1.4, -1.12, 0.08, false);
      k.box(1.1, 0.1, 0.1, DARK, 0, 1.86, 1.0, 0.05, false);
      for (const s of [-1, 1]) k.box(0.14, 0.12, 0.3, '#3a3f4a', s * 0.52, 1.86, 0.88, 0.05, false);
      const lamp = mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.1, 14), toon('#fff6c9', { emissive: '#a08a20' }), false);
      lamp.rotation.x = Math.PI / 2;
      k.add(lamp, 0, 1.5, 1.3);
      k.box(0.5, 0.36, 0.42, '#ffd43b', 0, 1.3, -1.35, 0.1);
      seat = seatPos(0, 1.06, -0.6);
      break;
    }
    case 'kamyonet': {
      // kamyonet: kabin önde, arkası açık kasa
      const c = '#4dabf7';
      k.box(2.6, 1.0, 5.6, c, 0, 1.1, 0, 0.26);
      k.box(2.44, 0.9, 2.2, c, 0, 2.05, 1.35, 0.22);
      k.windshield(2.4, 0.85, 2.3, 2.4, -0.2);
      for (const s of [-1, 1]) k.box(0.06, 0.7, 1.2, GLASS(), s * 1.24, 2.15, 1.25, 0.03, false);
      k.box(2.46, 0.14, 2.24, shade(c, 0.9), 0, 2.56, 1.35, 0.07, false);
      k.box(2.3, 0.1, 3.0, '#6b7280', 0, 1.63, -1.2, 0.04, false);
      for (const s of [-1, 1]) k.box(0.12, 0.55, 3.0, shade(c, 0.85), s * 1.22, 1.9, -1.2, 0.06);
      k.box(2.5, 0.55, 0.12, shade(c, 0.85), 0, 1.9, -2.72, 0.06);
      k.seat(-0.6, 1.6, 1.0, '#3a3f4a', 0.9);
      k.seat(0.6, 1.6, 1.0, '#3a3f4a', 0.9);
      k.steering(-0.6, 2.2, 1.7);
      k.lights(2.82, -2.82, 1.25, 0.9);
      k.bumpers(2.88, -2.88, 0.7, 2.7);
      k.mirrors(2.0, 2.3, 1.38, c);
      k.plate(-2.95, 0.75);
      for (const s of [-1, 1]) for (const z of [-1.7, 1.75]) k.wheel(s * 1.28, 0.7, z, 0.7, 0.5, DARK);
      seat = seatPos(-0.6, 1.6, 1.0);
      break;
    }
    case 'otobus': {
      // okul otobüsü: uzun sarı gövde, sıra sıra camlar, DUR tabelası
      const c = '#ffc83d';
      k.box(2.9, 2.5, 8.6, c, 0, 1.85, 0, 0.3);
      k.box(2.92, 0.3, 8.62, '#3a3f4a', 0, 1.1, 0, 0.1, false);
      k.box(2.7, 0.16, 8.3, shade(c, 0.9), 0, 3.14, 0, 0.07, false);
      k.windshield(2.6, 1.1, 2.5, 4.28, -0.12);
      for (const s of [-1, 1]) for (let i = 0; i < 5; i++) k.box(0.06, 0.95, 1.25, GLASS(), s * 1.44, 2.5, 2.6 - i * 1.5, 0.05, false);
      k.box(0.08, 1.6, 1.0, GLASS(), 1.45, 1.9, 3.3, 0.05, false);
      k.box(2.2, 0.5, 0.08, '#3a3f4a', 0, 3.0, 4.34, 0.04, false);
      k.box(0.1, 0.72, 0.72, '#ef4b4b', -1.5, 1.9, 1.8, 0.06, false);
      k.seat(-0.75, 2.05, 3.2, '#3a3f4a', 0.95);
      k.steering(-0.75, 2.65, 3.9);
      for (let i = 0; i < 3; i++) for (const s of [-0.75, 0.75]) k.box(0.9, 0.22, 0.8, '#c98a4b', s, 2.05, 1.2 - i * 1.5, 0.08, false);
      k.lights(4.36, -4.36, 1.5, 1.05);
      k.bumpers(4.44, -4.44, 0.9, 3.0);
      k.mirrors(4.1, 2.8, 1.6, c);
      k.plate(-4.5, 0.95);
      for (const s of [-1, 1]) for (const z of [-2.6, 2.8]) k.wheel(s * 1.42, 0.78, z, 0.78, 0.56, DARK);
      seat = seatPos(-0.75, 2.05, 3.2);
      break;
    }
    case 'yaris': {
      // yarış arabası: yere yakın, geniş, kocaman arka kanat ve yan kutular
      const c = '#ef4b4b';
      k.box(2.0, 0.5, 5.6, c, 0, 0.5, 0, 0.22);
      k.box(1.5, 0.45, 1.6, c, 0, 0.9, -0.2, 0.2);
      k.box(1.1, 0.3, 1.1, '#ffffff', 0, 0.78, 1.5, 0.12, false);
      for (const s of [-1, 1]) k.box(0.55, 0.42, 2.2, shade(c, 0.85), s * 1.12, 0.6, -0.1, 0.14);
      k.box(1.9, 0.14, 1.1, DARK, 0, 0.3, 2.75, 0.05);
      k.windshield(1.4, 0.4, 1.2, 0.5, -0.75);
      k.seat(0, 0.72, -0.5, DARK, 0.8);
      k.steering(0, 1.14, 0.0);
      k.box(2.5, 0.12, 0.8, '#3a3f4a', 0, 1.5, -2.5, 0.05);
      for (const s of [-0.95, 0.95]) k.box(0.12, 0.7, 0.5, '#3a3f4a', s, 1.15, -2.5, 0.04, false);
      k.box(0.5, 0.3, 0.5, '#ffffff', 0, 1.2, -1.5, 0.08, false);
      k.lights(2.78, -2.78, 0.55, 0.7);
      for (const s of [-1, 1]) {
        k.wheel(s * 1.18, 0.52, 1.75, 0.52, 0.52, '#ffd43b');
        k.wheel(s * 1.22, 0.58, -1.75, 0.58, 0.62, '#ffd43b');
      }
      seat = seatPos(0, 0.72, -0.5);
      break;
    }
    case 'unicorn': {
      const c = '#ffc2dc';
      k.box(2.5, 0.95, 4.6, c, 0, 0.95, 0, 0.4);
      k.seat(0, 1.05, -0.4, '#ffffff', 1.4);
      k.steering(0, 1.65, 0.3);
      const head = k.add(outline(mesh(new THREE.SphereGeometry(0.7, 16, 12), toon('#ffffff')), 1.04), 0, 2.0, 2.0);
      head.scale.set(0.85, 1, 1.25);
      k.add(outline(mesh(new THREE.ConeGeometry(0.18, 1.0, 12), toon('#ffd43b')), 1.06), 0, 2.85, 2.2).rotation.x = 0.35;
      for (const s of [-0.3, 0.3]) k.add(mesh(new THREE.SphereGeometry(0.09, 8, 6), toon(DARK), false), s, 2.1, 2.75);
      const mane = ['#ff6b6b', '#ffd43b', '#69db7c', '#4dabf7', '#9775fa'];
      mane.forEach((m, i) => k.add(mesh(new THREE.SphereGeometry(0.24, 10, 8), toon(m), false), 0, 2.45 - i * 0.18, 1.55 - i * 0.22));
      mane.forEach((m, i) => k.add(mesh(new THREE.SphereGeometry(0.26, 10, 8), toon(m), false), 0, 1.35 - i * 0.06, -2.3 - i * 0.24));
      k.lights(2.3, -2.3, 0.9, 0.85);
      for (const s of [-1, 1]) for (const z of [-1.5, 1.5]) k.wheel(s * 1.2, 0.55, z, 0.55, 0.42, '#ffc2dc');
      seat = seatPos(0, 1.05, -0.4);
      break;
    }
    case 'ucan': {
      const saucer = k.add(outline(mesh(new THREE.CylinderGeometry(2.3, 2.8, 0.7, 32), toon('#b8b4e6')), 1.03), 0, 0.7, 0);
      saucer.scale.z = 1.2;
      k.add(mesh(new THREE.CylinderGeometry(2.4, 2.4, 0.14, 32), toon('#7c5cff', { emissive: '#3a1f99' }), false), 0, 0.32, 0).scale.z = 1.2;
      k.seat(0, 1.15, -0.2, '#ffffff', 1.2);
      k.steering(0, 1.75, 0.55);
      const dome = new THREE.Mesh(new THREE.SphereGeometry(1.5, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2), GLASS());
      k.add(dome, 0, 1.0, 0);
      for (const x of [-2.9, 2.9]) {
        const w = k.box(1.6, 0.14, 1.3, '#f783ac', x, 0.85, -0.3, 0.06);
        w.rotation.z = x > 0 ? -0.2 : 0.2;
      }
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        k.add(mesh(new THREE.SphereGeometry(0.15, 8, 6), toon('#fff6c9', { emissive: '#998800' }), false), Math.cos(a) * 2.55, 0.62, Math.sin(a) * 3.05);
      }
      seat = seatPos(0, 1.15, -0.2);
      break;
    }
    case 'limuzin': {
      const cols = ['#ff6b6b', '#ff9f43', '#ffd43b', '#69db7c', '#4dabf7', '#9775fa', '#f783ac'];
      cols.forEach((m, i) => k.box(2.5, 0.9, 1.06, m, 0, 0.9, -3.2 + i * 1.05, 0.15, false));
      k.box(2.52, 0.3, 7.4, '#ffffff', 0, 1.4, 0, 0.12, false);
      k.windshield(2.3, 0.7, 1.75, 2.75, -0.35);
      k.seat(-0.55, 1.0, 2.0, '#fff1c7', 0.85);
      k.seat(0.55, 1.0, 2.0, '#fff1c7', 0.85);
      k.seat(0, 1.0, -1.5, '#fff1c7', 2.0);
      k.steering(-0.55, 1.6, 2.6);
      k.lights(3.75, -3.75, 0.95, 0.85);
      k.bumpers(3.8, -3.8, 0.5, 2.6);
      for (const s of [-1, 1]) for (const z of [-2.7, 0, 2.7]) k.wheel(s * 1.2, 0.55, z, 0.55);
      seat = seatPos(-0.55, 1.0, 2.0);
      break;
    }
    default:
      k.box(2.4, 1, 4, '#cccccc', 0, 0.9, 0);
  }
  return { model: k.done(), seat };
}


/** Şehir taksisi: sarı sedan, tepesinde ışıklı TAKSİ levhası, damalı şerit. */
export function taxiModel(): VehicleModel {
  const k = new Kit();
  const c = '#ffc83d';
  k.box(2.5, 0.9, 4.8, c, 0, 0.85, 0, 0.32);
  k.box(2.34, 0.34, 1.6, c, 0, 1.4, 1.4, 0.16);
  k.box(2.34, 0.3, 1.1, c, 0, 1.36, -1.8, 0.14);
  // damalı şerit
  for (let i = 0; i < 8; i++) for (const s of [-1, 1]) k.box(0.06, 0.22, 0.56, i % 2 ? '#ffffff' : '#2b2d33', s * 1.26, 1.06 + (i % 2) * 0.24, -2.1 + i * 0.58, 0.02, false);
  k.windshield(2.2, 0.8, 1.8, 0.55);
  k.seat(-0.55, 0.98, -0.4, '#3a3f4a', 0.85);
  k.seat(0.55, 0.98, -0.4, '#3a3f4a', 0.85);
  k.steering(-0.55, 1.6, 0.25);
  // tepe levhası
  k.box(1.3, 0.42, 0.42, '#ffffff', 0, 1.82, 0.5, 0.1);
  const sign = mesh(new THREE.BoxGeometry(1.0, 0.26, 0.05), toon('#2b2d33', { emissive: '#111111' }), false);
  k.add(sign, 0, 1.82, 0.72);
  k.lights(2.4, -2.4, 1.0, 0.82);
  k.bumpers(2.44, -2.44, 0.52, 2.4);
  k.mirrors(0.6, 1.6, 1.32, c);
  k.plate(-2.6, 0.62);
  for (const s of [-1, 1]) for (const z of [-1.55, 1.55]) k.wheel(s * 1.2, 0.56, z, 0.56);
  return { model: k.done(), seat: seatPos(-0.55, 0.98, -0.4) };
}

// ================================================================================================
// Şehir araçları
// ================================================================================================
/** Kabin: altı boyalı, üstü camlı (karakter içeriden görünür), tavan camı. */
function cab(k: Kit, w: number, zc: number, len: number, color: string, floorY: number) {
  k.box(w, 1.0, len, color, 0, floorY + 0.5, zc, 0.22);
  for (const s of [-1, 1]) k.box(0.06, 1.0, len - 0.3, GLASS(), s * (w / 2 - 0.03), floorY + 1.5, zc, 0.03, false);
  k.box(w - 0.2, 0.06, len - 0.2, GLASS(), 0, floorY + 2.02, zc, 0.03, false);
  for (const s of [-1, 1]) for (const z of [-len / 2 + 0.1, len / 2 - 0.1]) k.box(0.12, 1.05, 0.12, color, s * (w / 2 - 0.06), floorY + 1.5, zc + z, 0.04, false);
  k.box(w, 0.12, len, color, 0, floorY + 2.05, zc, 0.06, false);
  k.windshield(w - 0.1, 1.0, floorY + 1.5, zc + len / 2 - 0.02, -0.12, color);
}

export function ambulanceModel(): VehicleModel & { beacons: THREE.Mesh[] } {
  const k = new Kit();
  const W = '#fbfcfd';
  // arka bölüm (yüksek kutu) + kabin
  k.box(2.7, 2.15, 4.2, W, 0, 1.72, -1.1, 0.3);
  k.box(2.72, 0.42, 4.22, '#ef4b4b', 0, 1.45, -1.1, 0.08, false);
  cab(k, 2.7, 1.9, 2.0, W, 0.65);
  k.box(2.6, 0.6, 1.2, W, 0, 0.95, 3.2, 0.25);
  k.box(1.4, 0.3, 0.08, DARK, 0, 1.05, 3.82, 0.04);
  for (const s of [-1, 1]) {
    const cross = new THREE.Group();
    for (const [a, b] of [[1.0, 0.32], [0.32, 1.0]]) cross.add(mesh(new THREE.BoxGeometry(0.05, b, a), toon('#ef4b4b'), false));
    k.add(cross, s * 1.38, 2.25, -1.3);
    k.box(0.06, 0.5, 0.9, GLASS(), s * 1.37, 2.3, -2.4, 0.03, false);
  }
  k.box(1.1, 1.5, 0.06, '#dee2e6', 0, 1.75, -3.22, 0.03, false);
  const beacons: THREE.Mesh[] = [];
  for (const [x, c] of [[-0.5, '#ff3b3b'], [0.5, '#3b7bff']] as const) {
    const b = mesh(new THREE.BoxGeometry(0.6, 0.28, 0.4), new THREE.MeshBasicMaterial({ color: c }), false);
    k.add(b, x, 2.85, 1.9);
    beacons.push(b);
  }
  k.lights(3.82, -3.22, 1.1, 0.95);
  k.bumpers(3.86, -3.28, 0.55, 2.8);
  k.mirrors(2.7, 1.9, 1.5, W);
  for (const s of [-1, 1]) for (const z of [-2.2, 2.4]) k.wheel(s * 1.3, 0.6, z, 0.6);
  k.seat(-0.6, 1.3, 1.6, '#5b8def', 0.9);
  k.seat(0.6, 1.3, 1.6, '#5b8def', 0.9);
  k.steering(-0.6, 1.9, 2.3);
  return { model: k.done(), seat: seatPos(-0.6, 1.3, 1.6), beacons };
}

export function firetruckModel(): VehicleModel & { beacons: THREE.Mesh[] } {
  const k = new Kit();
  const R = '#e8383d';
  k.box(2.8, 1.8, 5.6, R, 0, 1.6, -1.6, 0.25);
  for (let i = 0; i < 3; i++) for (const s of [-1, 1]) k.box(0.06, 1.1, 1.5, '#c0c6cf', s * 1.41, 1.6, -3.4 + i * 1.8, 0.04, false);
  k.box(2.82, 0.2, 5.62, '#ffffff', 0, 2.25, -1.6, 0.06, false);
  cab(k, 2.8, 2.3, 2.2, R, 0.7);
  k.box(2.7, 0.7, 1.2, R, 0, 1.05, 3.8, 0.25);
  k.box(1.6, 0.4, 0.08, '#c0c6cf', 0, 1.1, 4.42, 0.04);
  // merdiven
  const lad = new THREE.Group();
  for (const s of [-0.45, 0.45]) lad.add(mesh(new THREE.BoxGeometry(0.1, 0.1, 6.2), toon('#dee2e6'), false).translateX(s));
  for (let i = 0; i < 12; i++) lad.add(mesh(new THREE.BoxGeometry(0.9, 0.06, 0.06), toon('#dee2e6'), false).translateZ(-3 + i * 0.55));
  lad.rotation.x = -0.05;
  k.add(lad, 0, 2.75, -1.3);
  const reel = mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.45, 16), toon('#ffd43b'));
  reel.rotation.z = Math.PI / 2;
  k.add(reel, 1.55, 1.3, -1.0);
  const beacons: THREE.Mesh[] = [];
  for (const [x, c] of [[-0.6, '#ff3b3b'], [0.6, '#3b7bff']] as const) {
    const b = mesh(new THREE.BoxGeometry(0.6, 0.28, 0.4), new THREE.MeshBasicMaterial({ color: c }), false);
    k.add(b, x, 3.08, 2.3);
    beacons.push(b);
  }
  k.lights(4.42, -4.42, 1.1, 1.0);
  k.bumpers(4.46, -4.48, 0.6, 2.9);
  k.mirrors(3.1, 2.0, 1.55, R);
  for (const s of [-1, 1]) for (const z of [-3.3, -1.8, 2.8]) k.wheel(s * 1.35, 0.65, z, 0.65);
  k.seat(-0.6, 1.35, 2.0, DARK, 0.9);
  k.seat(0.6, 1.35, 2.0, DARK, 0.9);
  k.steering(-0.6, 1.95, 2.7);
  return { model: k.done(), seat: seatPos(-0.6, 1.35, 2.0), beacons };
}

export function tractorModel(): VehicleModel {
  const k = new Kit();
  const G = '#2bb673';
  k.box(1.7, 1.2, 3.2, G, 0, 1.4, 0.8, 0.25);
  k.box(1.5, 0.5, 0.1, DARK, 0, 1.35, 2.42, 0.04);
  for (let i = 0; i < 4; i++) k.box(1.3, 0.05, 0.06, '#c0c6cf', 0, 1.15 + i * 0.12, 2.45, 0.02, false);
  k.box(2.2, 0.6, 1.8, G, 0, 1.35, -1.1, 0.2);
  k.seat(0, 1.95, -1.1, DARK, 0.9);
  k.steering(0, 2.55, -0.45);
  const pipe = mesh(new THREE.CylinderGeometry(0.1, 0.12, 1.4, 10), toon(DARK), false);
  k.add(pipe, 0.55, 2.6, 1.6);
  for (const s of [-1, 1]) for (const z of [-2.0, -0.2]) k.box(0.1, 2.0, 0.1, DARK, s * 0.95, 3.0, z, 0.04, false);
  k.box(2.2, 0.15, 2.1, '#ffd43b', 0, 4.0, -1.1, 0.06);
  k.lights(2.42, -2.0, 1.6, 0.6);
  for (const s of [-1, 1]) {
    k.wheel(s * 1.4, 1.15, -1.1, 1.15, 0.7, '#ffd43b');
    k.box(0.75, 0.15, 1.4, G, s * 1.4, 2.3, -1.1, 0.06, false);
    k.wheel(s * 1.05, 0.6, 1.8, 0.6, 0.45, '#ffd43b');
  }
  return { model: k.done(), seat: seatPos(0, 1.95, -1.1) };
}

// ================================================================================================
// Uçak
// ================================================================================================
export function planeModel(): VehicleModel & { prop: THREE.Object3D } {
  const k = new Kit();
  const W = '#ffffff', R = '#ef4b4b';
  const body = outline(mesh(new THREE.CapsuleGeometry(1.15, 7.2, 8, 18), toon(W, { emissive: '#3a3f48' })), 1.02);
  body.rotation.x = Math.PI / 2;
  k.add(body, 0, 0, 0);
  const stripe = mesh(new THREE.CylinderGeometry(1.17, 1.17, 6.6, 18, 1, true), toon(R), false);
  stripe.rotation.x = Math.PI / 2;
  stripe.scale.set(1, 1, 0.22);
  k.add(stripe, 0, -0.25, 0);
  const nose = outline(mesh(new THREE.ConeGeometry(0.55, 0.9, 16), toon(R)), 1.04);
  nose.rotation.x = Math.PI / 2;
  k.add(nose, 0, 0, 5.0);
  const prop = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const b = mesh(new THREE.BoxGeometry(0.22, 1.7, 0.06), toon(DARK), false);
    b.position.y = 0.85;
    const h = new THREE.Group();
    h.add(b);
    h.rotation.z = (i / 3) * Math.PI * 2;
    prop.add(h);
  }
  k.add(prop, 0, 0, 5.45);
  // açık kokpit: ön cam ve koltuk
  k.box(1.5, 0.3, 2.4, DARK, 0, 1.0, 0.8, 0.12, false);
  k.windshield(1.4, 0.55, 1.45, 2.05, -0.5);
  k.seat(0, 0.75, 0.6, '#ffd43b', 0.85);
  k.steering(0, 1.35, 1.3);
  // pencereler
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) {
    const w = mesh(new THREE.CircleGeometry(0.22, 12), toon('#bfe6ff', { emissive: '#1a3040' }), false);
    w.rotation.y = s * Math.PI / 2;
    k.add(w, s * 1.13, 0.3, -1.2 - i * 0.8);
  }
  // kanatlar
  const wingShape = new THREE.Shape([new THREE.Vector2(0, 0.9), new THREE.Vector2(6.2, 0.4), new THREE.Vector2(6.2, -0.5), new THREE.Vector2(0, -1.1)]);
  for (const s of [-1, 1]) {
    const wg = new THREE.ExtrudeGeometry(wingShape, { depth: 0.18, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 2 });
    const wing = outline(mesh(wg, toon(R)), 1.02);
    wing.rotation.x = Math.PI / 2;
    wing.scale.x = s;
    k.add(wing, s * 0.6, -0.15, 0.6);
    k.box(0.3, 0.5, 0.9, W, s * 6.75, 0.0, 0.3, 0.1);
  }
  // kuyruk
  k.box(4.0, 0.15, 1.3, R, 0, 0.3, -4.2, 0.06);
  const fin = outline(mesh(new THREE.BoxGeometry(0.16, 1.9, 1.5), toon(R)), 1.03);
  fin.rotation.x = -0.25;
  k.add(fin, 0, 1.25, -4.3);
  // iniş takımı
  for (const [x, z, r] of [[-1.3, 0.8, 0.42], [1.3, 0.8, 0.42], [0, -3.9, 0.25]] as const) {
    k.box(0.12, 0.9, 0.12, DARK, x, -0.95, z, 0.04, false);
    k.wheel(x, -1.4, z, r, 0.3);
  }
  return { model: k.done(), seat: seatPos(0, 0.75, 0.6), prop };
}

// ================================================================================================
// Su araçları
// ================================================================================================
/** Tekne: sivri burunlu gövde, güverte, küçük kamara, direk ve yelken, can simidi. */
export function boatModel(): VehicleModel {
  const k = new Kit();
  const hull = new THREE.Shape();
  hull.moveTo(-1.6, -3.4);
  hull.lineTo(1.6, -3.4);
  hull.quadraticCurveTo(1.85, 0.8, 0, 4.0);
  hull.quadraticCurveTo(-1.85, 0.8, -1.6, -3.4);
  const geo = new THREE.ExtrudeGeometry(hull, { depth: 1.1, bevelEnabled: true, bevelSize: 0.15, bevelThickness: 0.15, bevelSegments: 3 });
  geo.rotateX(Math.PI / 2);
  const h = outline(mesh(geo, toon('#4dabf7')), 1.02);
  k.add(h, 0, 0.75, 0);
  // güverte (burun gövdeyle aynı yöne, +z): iki yüzlü
  const deckGeo = new THREE.ShapeGeometry(hull).rotateX(Math.PI / 2);
  const deckMat = toon('#d9a066');
  deckMat.side = THREE.DoubleSide;
  const deck = mesh(deckGeo, deckMat, false);
  deck.scale.setScalar(0.92);
  deck.receiveShadow = false;
  k.add(deck, 0, 0.97, 0);
  // beyaz küpeşte: gövdenin kenarında halka (ortası boş, güverte görünür)
  const edge = hull.getPoints(24);
  const railShape = new THREE.Shape(edge.map((p) => p.clone().multiplyScalar(1.03)));
  railShape.holes.push(new THREE.Path(edge.map((p) => p.clone().multiplyScalar(0.9)).reverse()));
  const rim = mesh(new THREE.ExtrudeGeometry(railShape, { depth: 0.3, bevelEnabled: false }).rotateX(Math.PI / 2), toon('#ffffff'), false);
  rim.receiveShadow = false;
  k.add(rim, 0, 1.2, 0);
  // kamara
  k.box(2.0, 1.0, 1.8, '#ffffff', 0, 1.3, 0.6, 0.2);
  for (const s of [-1, 1]) k.box(0.05, 0.4, 1.2, GLASS(), s * 1.0, 1.4, 0.6, 0.03, false);
  k.box(1.6, 0.4, 0.05, GLASS(), 0, 1.4, 1.52, 0.03, false);
  k.box(2.2, 0.12, 2.0, '#ff6b4a', 0, 1.86, 0.6, 0.05);
  // direk ve yelken
  k.add(mesh(new THREE.CylinderGeometry(0.08, 0.1, 5.4, 8), toon('#9b6b43')), 0, 4.2, 0.1);
  const sail = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(0, 4.2), new THREE.Vector2(-2.4, 0)]);
  const s1 = mesh(new THREE.ShapeGeometry(sail), new THREE.MeshToonMaterial({ color: '#ffffff', side: THREE.DoubleSide }), false);
  s1.rotation.y = -Math.PI / 2;
  k.add(s1, 0, 2.3, 0.0);
  const flag = mesh(new THREE.PlaneGeometry(0.7, 0.45), new THREE.MeshToonMaterial({ color: '#ffd43b', side: THREE.DoubleSide }), false);
  k.add(flag, 0.0, 6.8, -0.3).rotation.y = Math.PI / 2;
  // can simidi ve dümen
  const ring = mesh(new THREE.TorusGeometry(0.35, 0.1, 8, 16), toon('#ff6b4a'), false);
  ring.rotation.y = Math.PI / 2;
  k.add(ring, 1.72, 1.15, -1.0);
  k.steering(0, 2.0, -1.5);
  k.seat(0, 1.35, -2.2, '#ffd43b', 1.2);
  return { model: k.done(1.2), seat: seatPos(0, 1.35, -2.2, 1.2) };
}

export function jetskiModel(color = '#ffd43b'): VehicleModel {
  const k = new Kit();
  const body = k.box(1.4, 0.7, 3.4, color, 0, 0.35, 0, 0.3);
  body.scale.set(1, 1, 1);
  k.box(1.2, 0.5, 1.3, color, 0, 0.7, 1.2, 0.25).rotation.x = 0.25;
  k.box(1.42, 0.2, 3.42, '#ffffff', 0, 0.1, 0, 0.1, false);
  k.box(0.75, 0.3, 1.5, DARK, 0, 0.85, -0.5, 0.14);
  k.box(1.2, 0.08, 0.08, DARK, 0, 1.45, 0.75, 0.03, false);
  k.box(0.1, 0.5, 0.1, DARK, 0, 1.2, 0.85, 0.03, false);
  k.windshield(0.9, 0.35, 1.25, 1.55, -0.7);
  return { model: k.done(), seat: seatPos(0, 1.0, -0.5) };
}
