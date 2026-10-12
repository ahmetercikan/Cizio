/**
 * Evim'in eşya modelleri: yuvarlak köşeli, pastel, yumuşak ışıkta güzel görünen küçük modeller (kodla kurulur).
 * Her model ayak izinin ortasına göre kurulur ve önü +z'ye bakar (r=0). Duvar eşyaları arkası z=-0.5'te, duvara yaslı.
 * Ölçek: 1 karo = 1 birim; çocuk karakter ~1.75 boyunda.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { item } from './homeData';

const mats = new Map<string, THREE.MeshStandardMaterial>();
export function soft(color: string, opts: { emissive?: string; opacity?: number; rough?: number } = {}) {
  const key = `${color}|${opts.emissive ?? ''}|${opts.opacity ?? 1}|${opts.rough ?? 0.85}`;
  let m = mats.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: opts.rough ?? 0.85, metalness: 0, transparent: (opts.opacity ?? 1) < 1, opacity: opts.opacity ?? 1 });
    if (opts.emissive) m.emissive = new THREE.Color(opts.emissive);
    mats.set(key, m);
  }
  return m;
}
export function clearMats() {
  mats.forEach((m) => m.dispose());
  mats.clear();
}

const geos = new Map<string, THREE.BufferGeometry>();
function rbox(w: number, h: number, d: number, r = 0.06) {
  const key = `${w}|${h}|${d}|${r}`;
  let g = geos.get(key);
  if (!g) {
    g = new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2) * 0.999);
    geos.set(key, g);
  }
  return g;
}
export function clearGeos() {
  geos.forEach((g) => g.dispose());
  geos.clear();
}

type Add = (geo: THREE.BufferGeometry, color: string | THREE.Material, x: number, y: number, z: number, shadow?: boolean) => THREE.Mesh;

const shade = (c: string, k: number) => '#' + new THREE.Color(c).multiplyScalar(k).getHexString();
const WOOD = '#d9b48a', WOOD_D = '#a87c55', WHITE = '#f8f5ef', INK = '#5b5568';

/** Bir eşyanın modeli. `art`: tablolar için çocuğun resmi. */
export function furniture(id: string, color: string, art?: HTMLCanvasElement): THREE.Group {
  const g = new THREE.Group();
  const add: Add = (geo, c, x, y, z, shadow = true) => {
    const m = new THREE.Mesh(geo, typeof c === 'string' ? soft(c) : c);
    m.position.set(x, y, z);
    m.castShadow = shadow;
    m.receiveShadow = true;
    g.add(m);
    return m;
  };
  const it = item(id);
  const W = it?.w ?? 1, D = it?.d ?? 1;
  const legs = (w: number, d: number, h: number, c = WOOD_D, t = 0.06) => {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(rbox(t, h, t, 0.02), c, sx * (w / 2 - t), h / 2, sz * (d / 2 - t));
  };
  switch (id) {
    case 'kanepe': {
      add(rbox(1.9, 0.28, 0.8, 0.1), color, 0, 0.3, 0);
      add(rbox(1.9, 0.5, 0.24, 0.1), color, 0, 0.62, -0.3);
      for (const sx of [-1, 1]) add(rbox(0.2, 0.42, 0.8, 0.08), color, sx * 0.86, 0.48, 0);
      for (const sx of [-0.45, 0.45]) add(rbox(0.82, 0.12, 0.6, 0.06), shade(color, 1.08), sx, 0.48, 0.06);
      add(rbox(0.32, 0.32, 0.12, 0.06), WHITE, -0.55, 0.66, -0.12).rotation.z = 0.2;
      legs(1.8, 0.7, 0.16);
      break;
    }
    case 'koltuk': {
      add(rbox(0.85, 0.28, 0.8, 0.1), color, 0, 0.3, 0);
      add(rbox(0.85, 0.55, 0.22, 0.1), color, 0, 0.64, -0.3);
      for (const sx of [-1, 1]) add(rbox(0.18, 0.4, 0.8, 0.08), color, sx * 0.36, 0.48, 0);
      add(rbox(0.5, 0.1, 0.55, 0.05), shade(color, 1.08), 0, 0.48, 0.05);
      legs(0.75, 0.7, 0.16);
      break;
    }
    case 'puf': {
      const s = add(new THREE.SphereGeometry(0.42, 20, 14), color, 0, 0.32, 0);
      s.scale.set(1, 0.78, 1);
      break;
    }
    case 'sehpa':
      add(rbox(0.8, 0.07, 0.8, 0.03), color, 0, 0.4, 0);
      legs(0.7, 0.7, 0.38);
      add(new THREE.CylinderGeometry(0.08, 0.06, 0.14, 12), '#9ad0f5', 0.15, 0.5, 0.1);
      break;
    case 'tv': {
      add(rbox(1.8, 0.45, 0.5, 0.05), color, 0, 0.23, -0.1);
      const scr = add(rbox(1.3, 0.75, 0.06, 0.03), '#3a3f4a', 0, 0.9, -0.15);
      scr.name = 'screen';
      add(new THREE.PlaneGeometry(1.2, 0.66), soft('#7fb4e8', { emissive: '#204060' }), 0, 0.9, -0.115).name = 'screenFace';
      add(rbox(0.1, 0.25, 0.1, 0.03), INK, 0, 0.55, -0.15);
      break;
    }
    case 'kitaplik': {
      add(rbox(1.8, 1.6, 0.45, 0.04), color, 0, 0.8, -0.25);
      const cols = ['#f2b8a2', '#9ad0f5', '#ffcf6b', '#b7e3a0', '#b8b4e6', '#f5a3c7'];
      for (let r = 0; r < 3; r++) {
        add(rbox(1.7, 0.04, 0.4, 0.01), shade(color, 0.85), 0, 0.3 + r * 0.48, -0.22, false);
        for (let i = 0; i < 9; i++) add(rbox(0.12, 0.3 + ((i * 7 + r) % 3) * 0.04, 0.3, 0.02), cols[(i + r * 2) % cols.length], -0.75 + i * 0.17 + (i > 5 ? 0.12 : 0), 0.48 + r * 0.48, -0.2, false);
      }
      break;
    }
    case 'hali': {
      const r = add(rbox(W - 0.1, 0.03, D - 0.1, 0.012), color, 0, 0.015, 0, false);
      r.receiveShadow = true;
      add(rbox(W - 0.5, 0.032, D - 0.5, 0.012), shade(color, 0.92), 0, 0.017, 0, false);
      break;
    }
    case 'lamba': case 'yerlamba': {
      add(new THREE.CylinderGeometry(0.16, 0.2, 0.06, 16), INK, 0, 0.03, 0);
      add(new THREE.CylinderGeometry(0.025, 0.025, 1.2, 8), INK, 0, 0.62, 0);
      if (id === 'lamba') add(new THREE.CylinderGeometry(0.16, 0.28, 0.3, 18, 1, true), soft(color, { emissive: shade(color, 0.6) }), 0, 1.3, 0, false);
      else add(new THREE.OctahedronGeometry(0.22), soft(color, { emissive: shade(color, 0.7) }), 0, 1.35, 0, false).rotation.y = 0.6;
      break;
    }
    case 'masa':
      add(rbox(1.8, 0.07, 0.85, 0.03), color, 0, 0.72, 0);
      legs(1.65, 0.7, 0.7);
      add(new THREE.CylinderGeometry(0.1, 0.08, 0.2, 14), '#ffffff', 0, 0.85, 0);
      add(new THREE.SphereGeometry(0.1, 10, 8), '#f5a3c7', 0, 1.0, 0);
      break;
    case 'sandalye':
      add(rbox(0.6, 0.07, 0.6, 0.03), color, 0, 0.45, 0);
      add(rbox(0.6, 0.55, 0.06, 0.03), color, 0, 0.75, -0.27);
      legs(0.55, 0.55, 0.44);
      break;
    case 'yatak': {
      add(rbox(0.95, 0.3, 1.9, 0.06), WOOD, 0, 0.18, 0);
      add(rbox(0.95, 0.75, 0.1, 0.05), WOOD, 0, 0.45, -0.92);
      add(rbox(0.88, 0.16, 1.8, 0.08), WHITE, 0, 0.4, 0.02);
      add(rbox(0.9, 0.08, 1.2, 0.06), color, 0, 0.5, 0.32);
      add(rbox(0.6, 0.14, 0.32, 0.07), '#ffffff', 0, 0.54, -0.62);
      break;
    }
    case 'komodin':
      add(rbox(0.7, 0.55, 0.6, 0.05), color, 0, 0.28, -0.1);
      add(rbox(0.5, 0.02, 0.02, 0.01), INK, 0, 0.36, 0.21, false);
      add(new THREE.CylinderGeometry(0.1, 0.12, 0.25, 12), '#ffe9a8', 0.1, 0.68, -0.1);
      break;
    case 'gardirop': {
      add(rbox(1.8, 1.9, 0.55, 0.05), color, 0, 0.95, -0.2);
      add(rbox(0.02, 1.7, 0.02, 0.01), shade(color, 0.8), 0, 0.95, 0.08, false);
      for (const sx of [-0.12, 0.12]) add(new THREE.SphereGeometry(0.035, 8, 6), '#c9a24b', sx, 1.0, 0.1, false);
      break;
    }
    case 'calisma': {
      add(rbox(1.8, 0.06, 0.7, 0.03), color, 0, 0.7, -0.1);
      legs(1.7, 0.6, 0.68, shade(color, 0.85));
      add(rbox(0.6, 0.4, 0.05, 0.03), '#3a3f4a', -0.3, 0.98, -0.32);
      add(new THREE.PlaneGeometry(0.54, 0.34), soft('#bfe3ff', { emissive: '#2a4a66' }), -0.3, 0.98, -0.293);
      add(new THREE.CylinderGeometry(0.06, 0.06, 0.16, 10), '#f5a3c7', 0.5, 0.81, -0.2);
      add(rbox(0.3, 0.02, 0.22, 0.01), '#ffffff', 0.2, 0.74, 0);
      break;
    }
    case 'evcil': {
      const b = add(new THREE.TorusGeometry(0.3, 0.12, 10, 20), color, 0, 0.12, 0);
      b.rotation.x = Math.PI / 2;
      add(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 20), shade(color, 1.1), 0, 0.05, 0);
      break;
    }
    case 'buzdolabi':
      add(rbox(0.85, 1.75, 0.7, 0.08), color, 0, 0.88, -0.1);
      add(rbox(0.8, 0.02, 0.02, 0.01), shade(color, 0.85), 0, 1.15, 0.25, false);
      add(rbox(0.05, 0.4, 0.05, 0.02), '#c9ced6', 0.3, 1.45, 0.27);
      add(rbox(0.05, 0.4, 0.05, 0.02), '#c9ced6', 0.3, 0.8, 0.27);
      break;
    case 'ocak':
      add(rbox(0.9, 0.85, 0.7, 0.04), color, 0, 0.43, -0.1);
      add(rbox(0.9, 0.04, 0.7, 0.02), '#3a3f4a', 0, 0.87, -0.1);
      for (const [x, z] of [[-0.2, -0.25], [0.2, -0.25], [-0.2, 0.05], [0.2, 0.05]]) add(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 14), '#6b6f7a', x, 0.9, z, false);
      add(rbox(0.7, 0.4, 0.02, 0.02), '#3a3f4a', 0, 0.42, 0.26, false);
      add(new THREE.CylinderGeometry(0.15, 0.13, 0.18, 14), '#f2b8a2', -0.2, 0.99, 0.05);
      break;
    case 'tezgah':
      add(rbox(0.95, 0.85, 0.7, 0.04), color, 0, 0.43, -0.1);
      add(rbox(0.98, 0.05, 0.74, 0.02), '#e9e4dc', 0, 0.88, -0.1);
      add(new THREE.SphereGeometry(0.08, 10, 8), '#ef6b6b', 0.2, 0.96, -0.1);
      add(new THREE.SphereGeometry(0.07, 10, 8), '#b7e3a0', 0.05, 0.95, 0);
      break;
    case 'evye':
      add(rbox(0.95, 0.85, 0.7, 0.04), color, 0, 0.43, -0.1);
      add(rbox(0.98, 0.05, 0.74, 0.02), '#e9e4dc', 0, 0.88, -0.1);
      add(rbox(0.5, 0.06, 0.4, 0.04), '#c9d6e0', 0, 0.89, -0.05, false);
      add(new THREE.TorusGeometry(0.12, 0.02, 6, 12, Math.PI), '#c9ced6', 0, 1.0, -0.33).rotation.y = Math.PI / 2;
      break;
    case 'kuvet': {
      add(rbox(1.8, 0.55, 0.85, 0.2), color, 0, 0.28, 0);
      add(rbox(1.6, 0.06, 0.65, 0.05), soft('#bfe9ff', { opacity: 0.85 }), 0, 0.5, 0, false);
      for (let i = 0; i < 5; i++) add(new THREE.SphereGeometry(0.1 + (i % 2) * 0.05, 10, 8), '#ffffff', -0.5 + i * 0.25, 0.56, (i % 3) * 0.1 - 0.1, false);
      add(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8), '#c9ced6', -0.8, 0.7, 0);
      break;
    }
    case 'lavabo':
      add(new THREE.CylinderGeometry(0.1, 0.14, 0.8, 14), WHITE, 0, 0.4, -0.15);
      add(rbox(0.7, 0.18, 0.5, 0.08), color, 0, 0.85, -0.15);
      add(rbox(0.5, 0.65, 0.04, 0.03), soft('#dff3ff', { rough: 0.2 }), 0, 1.4, -0.42);
      break;
    case 'sovale': {
      for (const sx of [-0.25, 0.25]) add(rbox(0.06, 1.5, 0.06, 0.02), color, sx, 0.75, 0).rotation.z = -sx * 0.25;
      add(rbox(0.06, 1.4, 0.06, 0.02), color, 0, 0.7, -0.25).rotation.x = -0.3;
      add(rbox(0.75, 0.6, 0.04, 0.02), '#ffffff', 0, 1.05, 0.05);
      for (const [c, x, y] of [['#ef6b6b', -0.15, 1.1], ['#4dabf7', 0.1, 0.95], ['#ffd43b', 0.18, 1.18]] as const) add(new THREE.CircleGeometry(0.1, 12), c, x, y, 0.075, false);
      add(rbox(0.6, 0.04, 0.1, 0.02), color, 0, 0.72, 0.06);
      break;
    }
    case 'piyano': {
      add(rbox(1.8, 1.1, 0.55, 0.05), color, 0, 0.55, -0.2);
      add(rbox(1.7, 0.08, 0.3, 0.02), '#ffffff', 0, 0.78, 0.18);
      for (let i = 0; i < 10; i++) add(rbox(0.06, 0.04, 0.16, 0.01), '#3a3f4a', -0.72 + i * 0.16, 0.83, 0.13, false);
      add(rbox(0.8, 0.07, 0.35, 0.03), WOOD_D, 0, 0.45, 0.6);
      legs(0.75, 0.3, 0.44, WOOD_D);
      g.children.slice(-4).forEach((m) => (m.position.z += 0.6));
      break;
    }
    case 'oyuncak': {
      add(rbox(0.85, 0.5, 0.6, 0.06), color, 0, 0.25, 0);
      add(rbox(0.88, 0.1, 0.63, 0.05), shade(color, 0.88), 0, 0.55, -0.05).rotation.x = -0.5;
      add(new THREE.SphereGeometry(0.13, 12, 10), '#ffcf6b', -0.2, 0.55, 0.05);
      add(rbox(0.18, 0.18, 0.18, 0.04), '#9ad0f5', 0.2, 0.55, 0.02);
      break;
    }
    case 'akvaryum': {
      add(rbox(0.8, 0.5, 0.6, 0.04), color, 0, 0.25, -0.1);
      add(rbox(0.78, 0.55, 0.5, 0.06), soft('#9fe0f5', { opacity: 0.6, rough: 0.1 }), 0, 0.78, -0.1, false);
      for (const [c, x, y] of [['#ff9f43', -0.15, 0.8], ['#ffd43b', 0.15, 0.7]] as const) {
        const f = add(new THREE.SphereGeometry(0.06, 10, 8), c, x, y, -0.05, false);
        f.scale.x = 1.6;
        f.name = 'fish';
      }
      break;
    }
    case 'dansmat': {
      const cols = ['#f5a3c7', '#9ad0f5', '#ffcf6b', '#b7e3a0'];
      add(rbox(1.9, 0.03, 1.9, 0.01), '#ffffff', 0, 0.015, 0, false);
      for (let i = 0; i < 4; i++) add(rbox(0.85, 0.035, 0.85, 0.01), i === 0 ? color : cols[i], (i % 2 ? 0.45 : -0.45), 0.02, (i < 2 ? -0.45 : 0.45), false);
      break;
    }
    case 'saksi': {
      add(new THREE.CylinderGeometry(0.2, 0.15, 0.3, 14), '#e8a07a', 0, 0.15, 0);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        add(new THREE.CylinderGeometry(0.015, 0.015, 0.3, 4), '#5fae6e', Math.cos(a) * 0.08, 0.42, Math.sin(a) * 0.08, false);
        add(new THREE.SphereGeometry(0.08, 10, 8), color, Math.cos(a) * 0.1, 0.6, Math.sin(a) * 0.1);
      }
      break;
    }
    case 'bitki': {
      add(new THREE.CylinderGeometry(0.26, 0.2, 0.42, 16), color, 0, 0.21, 0);
      for (let i = 0; i < 6; i++) {
        const l = add(new THREE.SphereGeometry(0.22, 12, 8), '#6fbf7f', Math.cos(i) * 0.15, 0.75 + (i % 3) * 0.18, Math.sin(i) * 0.15);
        l.scale.set(0.7, 1.3, 0.35);
        l.rotation.set(Math.sin(i) * 0.5, i, Math.cos(i) * 0.5);
      }
      break;
    }
    case 'ayicik': {
      const b = add(new THREE.SphereGeometry(0.22, 14, 12), color, 0, 0.25, 0);
      b.scale.y = 1.1;
      add(new THREE.SphereGeometry(0.17, 14, 12), color, 0, 0.6, 0.02);
      for (const sx of [-0.12, 0.12]) add(new THREE.SphereGeometry(0.06, 10, 8), color, sx, 0.74, 0);
      add(new THREE.SphereGeometry(0.06, 10, 8), shade(color, 1.2), 0, 0.57, 0.16, false);
      for (const sx of [-0.06, 0.06]) add(new THREE.SphereGeometry(0.02, 6, 6), INK, sx, 0.64, 0.17, false);
      break;
    }
    // duvar eşyaları: arka yüzü z=-0.5
    case 'tablo': {
      add(rbox(0.8, 0.65, 0.06, 0.03), color, 0, 1.45, -0.46);
      if (art) {
        const t = new THREE.CanvasTexture(art);
        t.colorSpace = THREE.SRGBColorSpace;
        add(new THREE.PlaneGeometry(0.66, 0.51), new THREE.MeshStandardMaterial({ map: t, roughness: 0.9 }), 0, 1.45, -0.425, false);
      } else add(new THREE.PlaneGeometry(0.66, 0.51), '#fff6e0', 0, 1.45, -0.425, false);
      break;
    }
    case 'raf': {
      add(rbox(0.9, 0.05, 0.25, 0.02), color, 0, 1.3, -0.38);
      add(new THREE.CylinderGeometry(0.07, 0.07, 0.18, 10), '#b7e3a0', -0.25, 1.42, -0.38);
      add(rbox(0.12, 0.2, 0.15, 0.02), '#f2b8a2', 0.05, 1.43, -0.38);
      add(rbox(0.1, 0.24, 0.15, 0.02), '#9ad0f5', 0.18, 1.45, -0.38);
      break;
    }
    case 'saat': {
      const c = add(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 24), color, 0, 1.6, -0.45);
      c.rotation.x = Math.PI / 2;
      add(rbox(0.02, 0.14, 0.02, 0.01), INK, 0, 1.65, -0.41, false);
      add(rbox(0.1, 0.02, 0.02, 0.01), INK, 0.04, 1.6, -0.41, false);
      break;
    }
    case 'ayna': {
      add(rbox(0.6, 0.95, 0.05, 0.25), color, 0, 1.3, -0.46);
      add(rbox(0.5, 0.85, 0.02, 0.22), soft('#e6f6ff', { rough: 0.1 }), 0, 1.3, -0.43, false);
      break;
    }
    // bahçe
    case 'agac': {
      add(new THREE.CylinderGeometry(0.1, 0.14, 1.0, 10), '#a87c55', 0, 0.5, 0);
      for (const [x, y, z, r] of [[0, 1.4, 0, 0.55], [0.3, 1.2, 0.15, 0.4], [-0.28, 1.25, -0.1, 0.42], [0.05, 1.75, 0.05, 0.38]]) add(new THREE.SphereGeometry(r, 16, 12), color, x, y, z);
      break;
    }
    case 'cicek': {
      add(rbox(1.9, 0.22, 0.8, 0.06), '#c9a27e', 0, 0.11, 0);
      add(rbox(1.8, 0.04, 0.7, 0.02), '#8a6a4f', 0, 0.22, 0, false);
      for (let i = 0; i < 10; i++) {
        const x = -0.75 + (i % 5) * 0.37, z = i < 5 ? -0.15 : 0.18;
        add(new THREE.CylinderGeometry(0.012, 0.012, 0.25, 4), '#5fae6e', x, 0.35, z, false);
        add(new THREE.SphereGeometry(0.08, 8, 6), i % 3 ? color : '#ffffff', x, 0.5, z);
      }
      break;
    }
    case 'salincak': {
      for (const sx of [-0.85, 0.85]) for (const sz of [-0.3, 0.3]) add(rbox(0.07, 1.7, 0.07, 0.02), WOOD_D, sx, 0.82, sz * 0.9).rotation.x = sz;
      add(rbox(1.85, 0.08, 0.08, 0.03), WOOD_D, 0, 1.62, 0);
      const seat = new THREE.Group();
      seat.name = 'swing';
      seat.position.set(0, 1.6, 0);
      for (const sx of [-0.22, 0.22]) {
        const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.15, 4), soft('#e9e4dc'));
        rope.position.set(sx, -0.58, 0);
        seat.add(rope);
      }
      const sb = new THREE.Mesh(rbox(0.55, 0.05, 0.3, 0.02), soft(color));
      sb.position.y = -1.15;
      sb.castShadow = true;
      seat.add(sb);
      g.add(seat);
      break;
    }
    case 'kaydirak': {
      add(rbox(0.8, 0.08, 0.8, 0.03), WOOD, 0, 1.2, -1.05);
      legs(0.75, 0.75, 1.2, WOOD_D);
      g.children.slice(-4).forEach((m) => (m.position.z -= 1.05));
      for (let i = 0; i < 4; i++) add(rbox(0.6, 0.04, 0.06, 0.01), WOOD_D, 0, 0.25 + i * 0.28, -1.5);
      for (const sx of [-0.3, 0.3]) add(rbox(0.05, 1.3, 0.05, 0.01), WOOD_D, sx, 0.65, -1.5);
      const s = add(rbox(0.7, 0.06, 2.1, 0.03), color, 0, 0.65, 0.15);
      s.rotation.x = 0.55;
      for (const sx of [-0.36, 0.36]) {
        const r = add(rbox(0.06, 0.16, 2.1, 0.02), shade(color, 0.88), sx, 0.72, 0.15);
        r.rotation.x = 0.55;
      }
      break;
    }
    case 'trambolin': {
      const ring = add(new THREE.TorusGeometry(0.85, 0.07, 10, 32), '#3a3f4a', 0, 0.45, 0);
      ring.rotation.x = Math.PI / 2;
      add(new THREE.CylinderGeometry(0.8, 0.8, 0.03, 32), color, 0, 0.44, 0).name = 'mat';
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        add(rbox(0.05, 0.45, 0.05, 0.01), '#3a3f4a', Math.cos(a) * 0.82, 0.22, Math.sin(a) * 0.82);
      }
      break;
    }
    case 'havuz': {
      add(rbox(2.9, 0.35, 1.9, 0.15), '#ffffff', 0, 0.17, 0);
      add(rbox(2.6, 0.04, 1.6, 0.1), soft(color, { opacity: 0.9, rough: 0.15, emissive: shade(color, 0.15) }), 0, 0.3, 0, false).name = 'water';
      add(new THREE.TorusGeometry(0.22, 0.08, 8, 16), '#ff8fb1', 0.6, 0.34, 0.2, false).rotation.x = Math.PI / 2;
      break;
    }
    case 'kum': {
      add(rbox(1.9, 0.25, 1.9, 0.06), WOOD, 0, 0.12, 0);
      add(rbox(1.7, 0.06, 1.7, 0.04), color, 0, 0.24, 0, false);
      add(new THREE.ConeGeometry(0.25, 0.35, 8), shade(color, 0.92), -0.3, 0.42, -0.2);
      add(new THREE.CylinderGeometry(0.12, 0.09, 0.15, 10), '#ef6b6b', 0.35, 0.33, 0.3);
      break;
    }
    case 'mangal': {
      const b = add(new THREE.SphereGeometry(0.32, 16, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), color, 0, 0.8, 0);
      b.rotation.x = 0;
      add(new THREE.CylinderGeometry(0.32, 0.32, 0.02, 16), '#6b6f7a', 0, 0.8, 0, false);
      for (let i = 0; i < 3; i++) add(rbox(0.04, 0.8, 0.04, 0.01), '#3a3f4a', Math.cos(i * 2.1) * 0.22, 0.4, Math.sin(i * 2.1) * 0.22);
      add(new THREE.CapsuleGeometry(0.05, 0.2, 2, 6), '#ffd43b', 0.05, 0.84, 0).rotation.z = Math.PI / 2;
      break;
    }
    case 'piknik': {
      add(rbox(1.8, 0.07, 0.9, 0.03), color, 0, 0.72, 0);
      for (const sz of [-0.75, 0.75]) add(rbox(1.8, 0.06, 0.3, 0.02), color, 0, 0.45, sz);
      legs(1.6, 0.6, 0.7, shade(color, 0.85));
      add(rbox(0.6, 0.02, 0.6, 0.01), '#ef9a9a', 0, 0.77, 0, false);
      add(new THREE.CylinderGeometry(0.12, 0.1, 0.1, 12), '#c98a4b', 0.1, 0.83, 0);
      break;
    }
    case 'bank': {
      add(rbox(1.8, 0.07, 0.5, 0.03), color, 0, 0.45, 0.05);
      add(rbox(1.8, 0.35, 0.06, 0.03), color, 0, 0.75, -0.2);
      for (const sx of [-0.8, 0.8]) add(rbox(0.08, 0.45, 0.45, 0.02), '#6b6f7a', sx, 0.22, 0);
      break;
    }
    case 'kulube': {
      add(rbox(0.85, 0.6, 0.85, 0.05), color, 0, 0.3, 0);
      const r = add(new THREE.CylinderGeometry(0.62, 0.62, 0.95, 3), '#ef9a9a', 0, 0.8, 0);
      r.rotation.set(Math.PI / 2, 0, Math.PI / 2);
      r.scale.set(1, 1, 0.55);
      add(new THREE.CircleGeometry(0.2, 16), '#4a3f45', 0, 0.3, 0.43, false);
      break;
    }
    case 'fiskiye': {
      add(new THREE.CylinderGeometry(0.48, 0.52, 0.3, 24), color, 0, 0.15, 0);
      add(new THREE.CylinderGeometry(0.42, 0.42, 0.02, 24), soft('#9fe0f5', { opacity: 0.85, rough: 0.1 }), 0, 0.29, 0, false);
      add(new THREE.CylinderGeometry(0.06, 0.08, 0.6, 10), color, 0, 0.55, 0);
      add(new THREE.CylinderGeometry(0.2, 0.12, 0.08, 16), color, 0, 0.85, 0);
      break;
    }
    default:
      add(rbox(W * 0.9, 0.6, D * 0.9, 0.06), color, 0, 0.3, 0);
  }
  return g;
}

// ------------------------------------------------------------------------------------------------
// Zemin dokuları
// ------------------------------------------------------------------------------------------------
const floorTex = new Map<string, THREE.Texture>();
export function floorTexture(kind: string, color: string) {
  const key = `${kind}|${color}`;
  let t = floorTex.get(key);
  if (t) return t;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const x = c.getContext('2d')!;
  x.fillStyle = color;
  x.fillRect(0, 0, 128, 128);
  const dark = '#' + new THREE.Color(color).multiplyScalar(0.9).getHexString();
  if (kind === 'tahta' || kind === 'koyu') {
    x.fillStyle = dark;
    for (let i = 0; i < 4; i++) {
      x.fillRect(0, i * 32, 128, 2);
      x.fillRect(((i * 53) % 96) + 16, i * 32, 2, 32);
    }
  } else if (kind === 'karo') {
    x.fillStyle = dark;
    x.fillRect(0, 0, 128, 3);
    x.fillRect(0, 0, 3, 128);
    x.fillRect(0, 63, 128, 2);
    x.fillRect(63, 0, 2, 128);
  } else {
    for (let i = 0; i < 400; i++) {
      x.fillStyle = `rgba(255,255,255,${Math.random() * 0.12})`;
      x.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
    }
  }
  t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  floorTex.set(key, t);
  return t;
}
export function clearFloorTex() {
  floorTex.forEach((t) => t.dispose());
  floorTex.clear();
}
