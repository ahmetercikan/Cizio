/**
 * Arabalar: altınla (ya da özel paketle) alınır, adada sürülür. Hepsinin üstü açık, karakter görünsün.
 * Modeller adanın çizgi film tarzında (kalın kontur), kodla kurulur. Tekerlekler 'wheel' adlıdır (dönerler).
 */
import * as THREE from 'three';
import { mesh, outline, toon } from '../play3d/kit';

export { CARS, car, type CarDef } from './carsData';

function wheel(r = 0.5, w = 0.35) {
  const g = new THREE.Group();
  const tire = mesh(new THREE.CylinderGeometry(r, r, w, 16), toon('#3a3f4a'));
  tire.rotation.z = Math.PI / 2;
  const hub = mesh(new THREE.CylinderGeometry(r * 0.45, r * 0.45, w + 0.02, 10), toon('#f4f1ea'), false);
  hub.rotation.z = Math.PI / 2;
  g.add(tire, hub);
  g.name = 'wheel';
  return g;
}

/** Arabanın modeli; önü +z. */
export function carModel(id: string): THREE.Group {
  const g = new THREE.Group();
  const add = (o: THREE.Object3D, x: number, y: number, z: number) => {
    o.position.set(x, y, z);
    g.add(o);
    return o;
  };
  const body = (w: number, h: number, l: number, c: string, y: number) => add(outline(mesh(new THREE.BoxGeometry(w, h, l), toon(c)), 1.03), 0, y, 0);
  const wheels = (wx: number, z1: number, z2: number, r = 0.5) => {
    for (const x of [-wx, wx]) for (const z of [z1, z2]) add(wheel(r), x, r, z);
  };
  const lights = (z: number, y: number, wx = 0.75) => {
    for (const x of [-wx, wx]) add(mesh(new THREE.SphereGeometry(0.16, 10, 8), toon('#fff6c9', { emissive: '#887700' }), false), x, y, z);
  };
  const seat = (z: number, c: string, y = 0.75) => {
    add(mesh(new THREE.BoxGeometry(1.5, 0.3, 0.9), toon(c)), 0, y, z);
    add(mesh(new THREE.BoxGeometry(1.5, 0.8, 0.25), toon(c)), 0, y + 0.45, z - 0.45);
  };
  switch (id) {
    case 'bisiklet': {
      for (const z of [-0.9, 0.9]) {
        const w = new THREE.Group();
        w.name = 'wheel';
        const t = mesh(new THREE.TorusGeometry(0.55, 0.08, 8, 20), toon('#3a3f4a'));
        t.rotation.y = Math.PI / 2;
        w.add(t);
        add(w, 0, 0.6, z);
      }
      add(mesh(new THREE.BoxGeometry(0.12, 0.12, 1.9), toon('#4dabf7')), 0, 0.95, 0).rotation.x = -0.15;
      add(mesh(new THREE.BoxGeometry(0.12, 0.8, 0.12), toon('#4dabf7')), 0, 0.85, 0.75).rotation.x = 0.3;
      add(mesh(new THREE.BoxGeometry(0.9, 0.08, 0.08), toon('#3a3f4a')), 0, 1.35, 0.85);
      add(mesh(new THREE.BoxGeometry(0.4, 0.12, 0.5), toon('#ff8fb1')), 0, 1.15, -0.4);
      add(mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.25, 10), toon('#ffd43b')), 0, 1.2, 1.15);
      break;
    }
    case 'mini': {
      body(2.2, 0.7, 3.4, '#ff6b6b', 0.75);
      body(2.0, 0.35, 1.0, '#ff6b6b', 1.25).position.z = 1.0;
      seat(-0.4, '#fff1c7');
      add(mesh(new THREE.BoxGeometry(1.8, 0.6, 0.06), toon('#cfeaff', { transparent: true, opacity: 0.6 }), false), 0, 1.55, 0.45).rotation.x = -0.4;
      wheels(1.05, -1.1, 1.1);
      lights(1.72, 0.85);
      break;
    }
    case 'jip': {
      body(2.4, 0.9, 3.8, '#69db7c', 1.05);
      seat(-0.4, '#c98a4b', 1.1);
      for (const x of [-1.1, 1.1]) add(mesh(new THREE.BoxGeometry(0.12, 1.1, 0.12), toon('#3a3f4a')), x, 2.0, -0.2);
      add(mesh(new THREE.BoxGeometry(2.3, 0.12, 0.12), toon('#3a3f4a')), 0, 2.55, -0.2);
      add(mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.3, 14), toon('#3a3f4a')), 0, 1.3, -2.05).rotation.x = Math.PI / 2;
      wheels(1.15, -1.25, 1.25, 0.62);
      lights(1.92, 1.15, 0.8);
      break;
    }
    case 'karavan': {
      body(2.4, 1.0, 4.6, '#fff1c7', 1.0);
      body(2.4, 1.4, 2.4, '#fff1c7', 2.2).position.z = -1.1;
      add(mesh(new THREE.BoxGeometry(2.45, 0.35, 4.65), toon('#4dabf7'), false), 0, 1.0, 0);
      for (const z of [-1.6, -0.6]) add(mesh(new THREE.BoxGeometry(2.46, 0.6, 0.7), toon('#cfeaff'), false), 0, 2.4, z);
      seat(0.8, '#ff8fb1', 1.1);
      wheels(1.15, -1.5, 1.5, 0.55);
      lights(2.32, 1.05, 0.8);
      break;
    }
    case 'spor': {
      body(2.2, 0.55, 4.2, '#ffd43b', 0.6);
      const nose = add(outline(mesh(new THREE.BoxGeometry(2.0, 0.3, 1.4), toon('#ffd43b')), 1.03), 0, 0.85, 1.3);
      nose.rotation.x = 0.12;
      seat(-0.5, '#3a3f4a', 0.6);
      add(mesh(new THREE.BoxGeometry(2.3, 0.1, 0.5), toon('#3a3f4a')), 0, 1.4, -1.9);
      for (const x of [-0.9, 0.9]) add(mesh(new THREE.BoxGeometry(0.1, 0.5, 0.1), toon('#3a3f4a')), x, 1.15, -1.9);
      add(mesh(new THREE.BoxGeometry(0.5, 0.56, 4.22), toon('#ef4b4b'), false), 0, 0.6, 0);
      wheels(1.05, -1.4, 1.4, 0.48);
      lights(2.12, 0.7, 0.75);
      break;
    }
    case 'unicorn': {
      body(2.2, 0.8, 3.6, '#ffc2dc', 0.85);
      seat(-0.4, '#ffffff', 0.85);
      const head = add(outline(mesh(new THREE.SphereGeometry(0.6, 14, 12), toon('#ffffff')), 1.04), 0, 1.6, 1.6);
      head.scale.set(0.9, 1, 1.2);
      add(outline(mesh(new THREE.ConeGeometry(0.16, 0.9, 10), toon('#ffd43b')), 1.06), 0, 2.4, 1.75).rotation.x = 0.35;
      const mane = ['#ff6b6b', '#ffd43b', '#69db7c', '#4dabf7', '#9775fa'];
      mane.forEach((c, i) => add(mesh(new THREE.SphereGeometry(0.18, 8, 6), toon(c), false), 0, 1.95 - i * 0.15, 1.2 - i * 0.18));
      mane.forEach((c, i) => add(mesh(new THREE.SphereGeometry(0.22, 8, 6), toon(c), false), 0, 1.1 - i * 0.05, -1.9 - i * 0.22));
      wheels(1.05, -1.2, 1.2);
      break;
    }
    case 'ucan': {
      const saucer = add(outline(mesh(new THREE.CylinderGeometry(1.9, 2.3, 0.6, 28), toon('#b8b4e6')), 1.03), 0, 0.6, 0);
      saucer.scale.z = 1.25;
      add(mesh(new THREE.CylinderGeometry(2.0, 2.0, 0.12, 28), toon('#7c5cff', { emissive: '#3a1f99' }), false), 0, 0.28, 0).scale.z = 1.25;
      seat(-0.2, '#ffffff', 0.85);
      for (const x of [-2.4, 2.4]) {
        const w = add(outline(mesh(new THREE.BoxGeometry(1.4, 0.12, 1.1), toon('#f783ac')), 1.05), x, 0.75, -0.3);
        w.rotation.z = x > 0 ? -0.2 : 0.2;
      }
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        add(mesh(new THREE.SphereGeometry(0.13, 8, 6), toon('#fff6c9', { emissive: '#998800' }), false), Math.cos(a) * 2.1, 0.55, Math.sin(a) * 2.6);
      }
      break;
    }
    case 'limuzin': {
      const cols = ['#ff6b6b', '#ff9f43', '#ffd43b', '#69db7c', '#4dabf7', '#9775fa'];
      cols.forEach((c, i) => add(outline(mesh(new THREE.BoxGeometry(2.3, 0.75, 1.0), toon(c)), 1.02), 0, 0.85, -2.5 + i * 1.0));
      seat(-1.2, '#fff1c7');
      seat(0.6, '#fff1c7');
      wheels(1.1, -2.2, 2.2);
      lights(3.02, 0.9, 0.8);
      add(mesh(new THREE.BoxGeometry(0.8, 0.5, 0.3), toon('#ffd43b')), 0, 1.4, 2.6);
      break;
    }
    default:
      body(2, 1, 3, '#cccccc', 0.8);
  }
  g.traverse((o) => {
    o.castShadow = (o as THREE.Mesh).isMesh ?? false;
  });
  return g;
}
