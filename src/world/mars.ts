/**
 * Mars: Çizio Adası'ndaki roketle gidilen kızıl gezegen.
 *
 * Yerçekimi azdır (kahraman çok yükseğe zıplar), kahraman uzay kaskı takar. Kraterli kızıl arazi, gökyüzünde mavi
 * Dünya ve iki küçük ay (Phobos, Deimos). Üs (kubbeler, güneş panelleri, dönen anten), sera, astronot, Mars aracı,
 * uçan daire ve sevimli uzaylılar. Görev: 8 Mars kristali topla. Dönüş: roketle adaya.
 */
import * as THREE from 'three';
import { mesh, outline, toon, toonGradient } from '../play3d/kit';
import { PRESETS } from '../dressup/catalog';
import { Avatar3D, spaceHelmet } from './avatar3d';
import { board, holdItem } from './places';
import { Realm, type Hero, type RealmEvents } from './realms';

const sm = (u: number) => u * u * (3 - 2 * u);
const clamp01 = (u: number) => Math.min(1, Math.max(0, u));
const beat = (t: number, dt: number, period: number, off = 0) => t >= off && Math.floor((t - off) / period) !== Math.floor((t - dt - off) / period);
const pick = <T>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

const EDGE = 104;
const CRATERS = [
  { x: -22, z: -30, r: 10, d: 3.2 },
  { x: 32, z: 34, r: 13, d: 4 },
  { x: -40, z: 34, r: 8, d: 2.6 },
  { x: 44, z: -40, r: 9, d: 3 },
  { x: 2, z: 52, r: 7, d: 2.2 },
  { x: -62, z: -6, r: 11, d: 3.5 },
];
/** Düz yerler: iniş alanı, üs, uçan daire. */
const FLAT = [
  { x: 0, z: 0, a: 12, b: 20 },
  { x: 26, z: -8, a: 16, b: 26 },
  { x: -30, z: 14, a: 8, b: 14 },
];

export function marsHeight(x: number, z: number) {
  const r = Math.hypot(x, z);
  let h = 1.3 * Math.sin(x * 0.05 + 1) * Math.cos(z * 0.045) + 0.6 * Math.sin(x * 0.13 - z * 0.09) + 0.25 * Math.sin(x * 0.4) * Math.sin(z * 0.37);
  let flat = 0;
  for (const f of FLAT) flat = Math.max(flat, 1 - smooth(f.a, f.b, Math.hypot(x - f.x, z - f.z)));
  h *= 1 - flat;
  for (const c of CRATERS) {
    const d = Math.hypot(x - c.x, z - c.z);
    if (d < c.r) h -= c.d * (1 - (d / c.r) ** 2);
    h += 0.9 * Math.exp(-(((d - c.r) / 1.8) ** 2));
  }
  // kenarda dağlar (dünyanın sınırı)
  h += Math.max(0, r - 80) ** 1.4 * 0.18;
  return h;
}

function alienModel(color = '#7ee081') {
  const g = new THREE.Group();
  const body = outline(mesh(new THREE.CapsuleGeometry(0.35, 0.5, 6, 12), toon(color)), 1.06);
  body.position.y = 0.7;
  const head = outline(mesh(new THREE.SphereGeometry(0.55, 16, 12), toon(color)), 1.05);
  head.position.y = 1.65;
  head.scale.set(1.1, 0.95, 1);
  g.add(body, head);
  for (const sx of [-0.2, 0.2]) {
    const eye = mesh(new THREE.SphereGeometry(0.17, 12, 10), toon('#1b1b2f'), false);
    eye.scale.set(1, 1.3, 0.6);
    eye.position.set(sx, 1.7, 0.45);
    const shine = mesh(new THREE.SphereGeometry(0.05, 6, 6), new THREE.MeshBasicMaterial({ color: '#ffffff' }), false);
    shine.position.set(sx + 0.05, 1.78, 0.55);
    const ant = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 5), toon(color), false);
    ant.position.set(sx * 1.4, 2.3, 0);
    ant.rotation.z = -sx * 1.2;
    const ball = mesh(new THREE.SphereGeometry(0.09, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffe066' }), false);
    ball.position.set(sx * 2.2, 2.55, 0);
    g.add(eye, shine, ant, ball);
  }
  const smile = mesh(new THREE.TorusGeometry(0.12, 0.025, 6, 12, Math.PI), toon('#1b1b2f'), false);
  smile.rotation.z = Math.PI;
  smile.position.set(0, 1.45, 0.5);
  g.add(smile);
  return g;
}

function rocketModel() {
  const rocket = new THREE.Group();
  const body = outline(mesh(new THREE.CylinderGeometry(1.4, 1.4, 9, 18), toon('#ffffff', { emissive: '#3a3a3a' })), 1.02);
  body.position.y = 5.5;
  const nose = outline(mesh(new THREE.ConeGeometry(1.4, 3, 18), toon('#ef4b4b')), 1.03);
  nose.position.y = 11.5;
  const win = mesh(new THREE.CircleGeometry(0.55, 16), toon('#7ee0ff', { emissive: '#103040' }));
  win.position.set(0, 8, 1.42);
  rocket.add(body, nose, win);
  for (let i = 0; i < 3; i++) {
    const f = outline(mesh(new THREE.BoxGeometry(0.2, 2.4, 1.6), toon('#ef4b4b')), 1.05);
    const a = (i / 3) * Math.PI * 2;
    f.position.set(Math.cos(a) * 1.5, 1.8, Math.sin(a) * 1.5);
    f.rotation.y = -a;
    rocket.add(f);
  }
  const flame = mesh(new THREE.ConeGeometry(1, 3, 12), toon('#ffc83d', { emissive: '#aa5500' }), false);
  flame.rotation.x = Math.PI;
  flame.position.y = -0.8;
  flame.visible = false;
  flame.name = 'flame';
  rocket.add(flame);
  return rocket;
}

export class MarsRealm extends Realm {
  readonly id = 'mars' as const;
  name = 'Mars';
  goal = '8 Mars kristali topla! Yerçekimi az: zıpla!';
  icon = 'mucevher';
  gravity = 0.38;
  helmet = true;
  leave = 'Adaya dön';
  private solids: { x: number; z: number; r: number }[] = [];
  private ticks: ((dt: number, t: number) => void)[] = [];
  private crystals: { obj: THREE.Object3D; taken: boolean; base: number }[] = [];
  private got = 0;
  private astro: Avatar3D;
  private astroPose: 'idle' | 'wave' = 'idle';
  private greeted = false;

  constructor(ev: RealmEvents) {
    super(ev, '#e9b58c', [60, 230], 'none');
    this.cam = [13, 7.5];
    this.scene.children.filter((o) => (o as THREE.Light).isLight).forEach((l) => {
      if ((l as THREE.HemisphereLight).isHemisphereLight) {
        (l as THREE.HemisphereLight).color.set('#fff1e2');
        (l as THREE.HemisphereLight).groundColor.set('#b8643a');
      }
    });
    this.sun.color.set('#ffe6cc');
    this.ground();
    this.sky();
    this.rocks();
    const rocket = this.landing();
    this.base();
    this.greenhouse();
    this.buildUfo();
    this.extras();
    this.placeCrystals();
    this.activities(rocket);
    this.astro = new Avatar3D({ ...PRESETS[6], dress: 'astronot', dressColor: '#ffffff', hat: '', hand: '', pet: '', back: 'jetpack' });
    this.astro.root.scale.setScalar(1.15);
    this.astro.root.position.set(18, marsHeight(18, -2), -2);
    this.astro.root.rotation.y = -Math.PI / 2 - 0.4;
    this.scene.add(this.astro.root);
    this.astro.head.add(spaceHelmet());
    this.solids.push({ x: 18, z: -2, r: 0.8 });
    // eşyanın gövdesi (üs, sera, araç, astronot…): hangi yandan gelinirse gelinsin düğme çıkar
    for (const s of this.spots) {
      let best: { x: number; z: number; r: number } | null = null;
      for (const k of this.solids) {
        if (k.r < 0.5) continue;
        if (Math.hypot(k.x - s.x, k.z - s.z) - k.r < s.r * 0.8 + 0.6 && (!best || k.r > best.r)) best = k;
      }
      if (best) s.body = best;
    }
    this.spawn.set(5, marsHeight(5, 5), 5);
    this.spawnH = Math.PI * 0.75;
    this.checkpoint.copy(this.spawn);
    this.killY = -20;
  }

  private ground() {
    const geo = new THREE.PlaneGeometry(EDGE * 2.4, EDGE * 2.4, 170, 170).rotateX(-Math.PI / 2);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const col = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    const A = new THREE.Color('#c4521f'), B = new THREE.Color('#d9783e'), C = new THREE.Color('#9c3f1a'), Dd = new THREE.Color('#e9a170');
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const h = marsHeight(x, z);
      pos.setY(i, h);
      const n = Math.sin(x * 0.7) * Math.cos(z * 0.6) * 0.5 + 0.5;
      c.copy(A).lerp(B, n);
      if (h < -0.8) c.lerp(C, clamp01((-h - 0.8) / 2.5));
      if (h > 1.5) c.lerp(Dd, clamp01((h - 1.5) / 6));
      col.set([c.r, c.g, c.b], i * 3);
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: toonGradient() }));
    m.receiveShadow = true;
    this.scene.add(m);
  }

  private sky() {
    const earthTex = (() => {
      const cv = document.createElement('canvas');
      cv.width = 256;
      cv.height = 128;
      const x = cv.getContext('2d')!;
      x.fillStyle = '#2f7de1';
      x.fillRect(0, 0, 256, 128);
      x.fillStyle = '#5cbf6a';
      for (const [cx, cy, rx, ry] of [[50, 50, 28, 22], [70, 92, 14, 22], [130, 44, 22, 18], [140, 86, 16, 24], [200, 50, 30, 18], [214, 98, 14, 8]]) {
        x.beginPath();
        x.ellipse(cx, cy, rx, ry, 0.3, 0, Math.PI * 2);
        x.fill();
      }
      x.fillStyle = 'rgba(255,255,255,0.8)';
      for (let i = 0; i < 14; i++) {
        x.beginPath();
        x.ellipse(Math.random() * 256, Math.random() * 128, 16, 4, 0, 0, Math.PI * 2);
        x.fill();
      }
      const t = new THREE.CanvasTexture(cv);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    })();
    const earth = new THREE.Mesh(new THREE.SphereGeometry(9, 32, 24), new THREE.MeshBasicMaterial({ map: earthTex, fog: false }));
    earth.position.set(-120, 95, -170);
    this.scene.add(earth);
    this.ticks.push((dt) => void (earth.rotation.y += dt * 0.05));
    for (const [r, p] of [[3, [90, 70, -150]], [2, [150, 110, 40]]] as const) {
      const moon = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 1), new THREE.MeshBasicMaterial({ color: '#9b8a7c', fog: false }));
      moon.position.set(p[0], p[1], p[2]);
      this.scene.add(moon);
    }
    // toz bulutları ufukta
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const d = mesh(new THREE.SphereGeometry(8 + Math.random() * 6, 10, 8), new THREE.MeshBasicMaterial({ color: '#e8b18a', transparent: true, opacity: 0.35, depthWrite: false }), false);
      d.scale.y = 0.35;
      d.position.set(Math.cos(a) * 150, 18 + Math.random() * 10, Math.sin(a) * 150);
      this.scene.add(d);
    }
  }

  private rocks() {
    const list: { x: number; z: number; s: number }[] = [];
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 400 && list.length < 160; i++) {
      const a = rnd() * Math.PI * 2, r = 8 + rnd() * 92;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (FLAT.some((f) => Math.hypot(x - f.x, z - f.z) < f.a)) continue;
      list.push({ x, z, s: 0.3 + rnd() ** 2 * 2.2 });
    }
    const im = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), toon('#8e3b1a'), list.length);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
    list.forEach((r, i) => {
      q.setFromEuler(new THREE.Euler(rnd(), rnd() * 6, rnd()));
      m4.compose(new THREE.Vector3(r.x, marsHeight(r.x, r.z) + r.s * 0.3, r.z), q, new THREE.Vector3(r.s, r.s * 0.7, r.s));
      im.setMatrixAt(i, m4);
      if (r.s > 0.9) this.solids.push({ x: r.x, z: r.z, r: r.s * 0.9 });
    });
    im.castShadow = im.receiveShadow = true;
    this.scene.add(im);
  }

  private landing() {
    const pad = mesh(new THREE.CylinderGeometry(6, 6.4, 0.4, 28), toon('#8d939e'), false);
    pad.position.set(0, 0.2, 0);
    const ring = mesh(new THREE.RingGeometry(3.6, 4.1, 32).rotateX(-Math.PI / 2), toon('#ffd43b'), false);
    ring.position.y = 0.42;
    this.scene.add(pad, ring);
    const rocket = rocketModel();
    rocket.position.set(0, 0.4, 0);
    this.scene.add(rocket);
    this.solids.push({ x: 0, z: 0, r: 2.2 });
    return rocket;
  }

  private base() {
    const bx = 26, bz = -10;
    const dome = (x: number, z: number, r: number) => {
      const g = new THREE.Group();
      const d = outline(mesh(new THREE.SphereGeometry(r, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2), toon('#f4f6fa', { emissive: '#3a3a40' })), 1.02);
      const band = mesh(new THREE.TorusGeometry(r * 0.96, 0.12, 6, 32), toon('#ef4b4b'), false);
      band.rotation.x = Math.PI / 2;
      band.position.y = r * 0.35;
      const door = mesh(new THREE.BoxGeometry(1.4, 2, 0.4), toon('#5b5f6b'), false);
      door.position.set(0, 1, r - 0.1);
      g.add(d, band, door);
      for (let i = 0; i < 4; i++) {
        const w = mesh(new THREE.CircleGeometry(0.35, 12), toon('#7ee0ff', { emissive: '#1a4050' }), false);
        const a = (i / 4) * Math.PI * 2 + 0.6;
        w.position.set(Math.sin(a) * r * 0.85, r * 0.55, Math.cos(a) * r * 0.85);
        w.lookAt(new THREE.Vector3(Math.sin(a) * r * 2, r * 0.55, Math.cos(a) * r * 2));
        g.add(w);
      }
      g.position.set(x, marsHeight(x, z), z);
      this.scene.add(g);
      this.solids.push({ x, z, r: r + 0.2 });
    };
    dome(bx, bz, 5);
    dome(bx + 9, bz + 3, 3.6);
    dome(bx + 2, bz - 9, 3.2);
    for (const [x0, z0, x1, z1] of [[bx, bz, bx + 9, bz + 3], [bx, bz, bx + 2, bz - 9]]) {
      const len = Math.hypot(x1 - x0, z1 - z0);
      const tube = mesh(new THREE.CylinderGeometry(0.9, 0.9, len, 14), toon('#dee2e6'), false);
      tube.rotation.z = Math.PI / 2;
      tube.rotation.y = -Math.atan2(z1 - z0, x1 - x0);
      tube.position.set((x0 + x1) / 2, marsHeight((x0 + x1) / 2, (z0 + z1) / 2) + 1, (z0 + z1) / 2);
      this.scene.add(tube);
    }
    const sg = board('ÇİZİO MARS ÜSSÜ', '#ef4b4b', '#ffffff', 5, 0.9, 800);
    sg.position.set(bx, marsHeight(bx, bz) + 6.3, bz + 0.5);
    this.scene.add(sg);
    // güneş panelleri
    for (let i = 0; i < 4; i++) {
      const p = new THREE.Group();
      const leg = mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.4, 6), toon('#8d939e'), false);
      leg.position.y = 0.7;
      const panel = mesh(new THREE.BoxGeometry(3, 0.1, 1.8), new THREE.MeshStandardMaterial({ color: '#1d3557', metalness: 0.6, roughness: 0.3 }), false);
      panel.position.y = 1.5;
      panel.rotation.x = -0.5;
      p.add(leg, panel);
      const x = bx + 12, z = bz - 10 + i * 2.6;
      p.position.set(x, marsHeight(x, z), z);
      this.scene.add(p);
      this.solids.push({ x, z, r: 1.4 });
    }
    // dönen çanak anten
    const ant = new THREE.Group();
    const post = mesh(new THREE.CylinderGeometry(0.15, 0.2, 4, 8), toon('#8d939e'));
    post.position.y = 2;
    const head = new THREE.Group();
    head.position.y = 4;
    const dish = outline(mesh(new THREE.SphereGeometry(1.4, 18, 10, 0, Math.PI * 2, 0, Math.PI / 3), toon('#ffffff')), 1.03);
    dish.rotation.x = -Math.PI / 2 - 0.5;
    head.add(dish);
    ant.add(post, head);
    const ax = bx - 8, az = bz - 6;
    ant.position.set(ax, marsHeight(ax, az), az);
    this.scene.add(ant);
    this.solids.push({ x: ax, z: az, r: 0.6 });
    this.ticks.push((dt) => void (head.rotation.y += dt * 0.4));
  }

  private plants: THREE.Object3D[] = [];
  private greenhouse() {
    const gx = 34, gz = 6;
    const g = new THREE.Group();
    const soil = mesh(new THREE.CylinderGeometry(4.6, 4.6, 0.3, 24), toon('#6b3e26'), false);
    soil.position.y = 0.15;
    const glass = new THREE.Mesh(new THREE.SphereGeometry(5, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: '#d8f3ff', transparent: true, opacity: 0.25, roughness: 0.1, depthWrite: false }));
    const frame = mesh(new THREE.SphereGeometry(5.02, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ffffff', wireframe: true, transparent: true, opacity: 0.5 }), false);
    g.add(soil, glass, frame);
    for (let i = 0; i < 9; i++) {
      const p = new THREE.Group();
      const leaf = outline(mesh(new THREE.IcosahedronGeometry(0.45, 0), toon('#5cbf6a')), 1.05);
      leaf.position.y = 0.6;
      p.add(leaf);
      p.position.set(-2.4 + (i % 3) * 2.4, 0.3, -2.4 + Math.floor(i / 3) * 2.4);
      p.scale.setScalar(0.5);
      g.add(p);
      this.plants.push(p);
    }
    g.position.set(gx, marsHeight(gx, gz), gz);
    this.scene.add(g);
    this.solids.push({ x: gx, z: gz, r: 5.2 });
    const sg = board('SERA', '#2f9e44', '#ffffff', 1.8, 0.6, 800);
    sg.position.set(gx - 5.3, marsHeight(gx - 5.3, gz) + 2.2, gz);
    sg.rotation.y = -Math.PI / 2;
    this.scene.add(sg);
  }

  private ufo!: THREE.Group;
  private beam!: THREE.Mesh;
  private aliens: { obj: THREE.Group; home: THREE.Vector3; t: THREE.Vector3; wait: number; hop: number }[] = [];
  private ufoAt = new THREE.Vector3(-30, 0, 14);
  private ufoFree = true;
  private ufoModel() {
    const g = new THREE.Group();
    const disc = outline(mesh(new THREE.SphereGeometry(3, 28, 14), new THREE.MeshStandardMaterial({ color: '#b8c0cc', metalness: 0.7, roughness: 0.35 })), 1.02);
    disc.scale.set(1, 0.28, 1);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(1.4, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: '#9ff7c3', transparent: true, opacity: 0.55, roughness: 0.1 }));
    dome.position.y = 0.6;
    g.add(disc, dome);
    const lights: THREE.Mesh[] = [];
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const l = mesh(new THREE.SphereGeometry(0.18, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffe066' }), false);
      l.position.set(Math.cos(a) * 2.7, -0.1, Math.sin(a) * 2.7);
      g.add(l);
      lights.push(l);
    }
    this.ticks.push((_dt, t) => lights.forEach((l, i) => (l.material as THREE.MeshBasicMaterial).color.set((i + Math.floor(t * 6)) % 3 === 0 ? '#ff6b8a' : (i + Math.floor(t * 6)) % 3 === 1 ? '#ffe066' : '#7ee0ff')));
    return g;
  }
  private buildUfo() {
    this.ufo = this.ufoModel();
    const p = this.ufoAt;
    p.y = marsHeight(p.x, p.z) + 6;
    this.ufo.position.copy(p);
    this.scene.add(this.ufo);
    this.beam = new THREE.Mesh(new THREE.ConeGeometry(2.2, 6, 20, 1, true), new THREE.MeshBasicMaterial({ color: '#9ff7c3', transparent: true, opacity: 0.25, depthWrite: false, side: THREE.DoubleSide }));
    this.beam.visible = false;
    this.scene.add(this.beam);
    this.ticks.push((_dt, t) => {
      if (!this.ufoFree) return;
      this.ufo.position.y = p.y + Math.sin(t * 1.4) * 0.4;
      this.ufo.rotation.y = t * 0.5;
    });
    ['#7ee081', '#b388ff', '#7ee0ff'].forEach((c, i) => {
      const a = alienModel(c);
      const home = new THREE.Vector3(p.x + (i - 1) * 3, 0, p.z + 4 + (i % 2) * 2);
      a.position.set(home.x, marsHeight(home.x, home.z), home.z);
      this.scene.add(a);
      this.aliens.push({ obj: a, home, t: home.clone(), wait: Math.random() * 2, hop: Math.random() * 5 });
    });
    this.ticks.push((dt, t) => {
      for (const al of this.aliens) {
        const o = al.obj;
        const d = al.t.clone().sub(o.position).setY(0);
        if (d.length() < 0.3) {
          if ((al.wait -= dt) < 0) {
            al.wait = 1 + Math.random() * 3;
            al.t.set(al.home.x + (Math.random() - 0.5) * 8, 0, al.home.z + (Math.random() - 0.5) * 8);
          }
        } else {
          o.position.addScaledVector(d.normalize(), dt * 1.4);
          o.rotation.y = Math.atan2(d.x, d.z);
        }
        al.hop += dt * 6;
        o.position.y = marsHeight(o.position.x, o.position.z) + Math.abs(Math.sin(al.hop)) * 0.5 + Math.sin(t) * 0.02;
      }
    });
  }

  private flag!: THREE.Group;
  private extras() {
    // teleskop
    const tel = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const l = mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.8, 5), toon('#5b5f6b'), false);
      const a = (i / 3) * Math.PI * 2;
      l.position.set(Math.cos(a) * 0.35, 0.85, Math.sin(a) * 0.35);
      l.rotation.set(Math.sin(a) * 0.2, 0, -Math.cos(a) * 0.2);
      tel.add(l);
    }
    const tube = outline(mesh(new THREE.CylinderGeometry(0.22, 0.3, 2, 14), toon('#ffffff')), 1.05);
    tube.position.y = 2;
    tube.rotation.x = -0.9;
    tel.add(tube);
    tel.position.set(-8, marsHeight(-8, 10), 10);
    tel.rotation.y = Math.atan2(-120 + 8, -170 - 10);
    this.scene.add(tel);
    this.solids.push({ x: -8, z: 10, r: 0.6 });
    // zıplama halkası
    const pad = new THREE.Group();
    const ring = mesh(new THREE.TorusGeometry(2.2, 0.25, 8, 28), toon('#b388ff', { emissive: '#3a1a6a' }), false);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.3;
    const disc = mesh(new THREE.CircleGeometry(2, 28).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#e5d4ff' }), false);
    disc.position.y = 0.32;
    pad.add(ring, disc);
    pad.position.set(-14, marsHeight(-14, -10), -10);
    this.scene.add(pad);
    this.ticks.push((_dt, t) => void ((disc.material as THREE.MeshBasicMaterial).color.setHSL(0.75, 0.8, 0.82 + Math.sin(t * 4) * 0.08)));
    // bayrak (dikilince görünür)
    this.flag = new THREE.Group();
    const pole = mesh(new THREE.CylinderGeometry(0.06, 0.06, 4, 6), toon('#dee2e6'), false);
    pole.position.y = 2;
    const cloth = board('ÇİZİO', '#ef4b4b', '#ffffff', 1.8, 1.1, 800);
    cloth.position.set(0.95, 3.4, 0);
    (cloth.material as THREE.MeshBasicMaterial).side = THREE.DoubleSide;
    this.flag.add(pole, cloth);
    this.flag.position.set(8, marsHeight(8, -6), -6);
    this.flag.scale.setScalar(0.001);
    this.flag.visible = false;
    this.scene.add(this.flag);
  }

  private placeCrystals() {
    const spots = [[-22, -30], [32, 34], [-40, 34], [44, -40], [2, 52], [-62, -6], [-48, -48], [58, 10]];
    const cols = ['#b388ff', '#7ee0ff', '#ff8fd8'];
    spots.forEach(([x, z], i) => {
      const g = new THREE.Group();
      for (let k = 0; k < 3; k++) {
        const c = mesh(new THREE.OctahedronGeometry(0.45 + (k === 0 ? 0.25 : 0), 0), new THREE.MeshToonMaterial({ color: cols[i % 3], emissive: new THREE.Color(cols[i % 3]).multiplyScalar(0.45) }), false);
        c.scale.y = 1.8;
        c.position.set(k === 0 ? 0 : (k === 1 ? 0.45 : -0.4), k === 0 ? 0.9 : 0.6, k === 2 ? 0.3 : 0);
        c.rotation.z = k === 0 ? 0 : (k === 1 ? -0.4 : 0.4);
        g.add(c);
      }
      const base = marsHeight(x, z) + 0.2;
      g.position.set(x, base, z);
      this.scene.add(g);
      this.crystals.push({ obj: g, taken: false, base });
    });
  }

  private activities(rocket: THREE.Group) {
    const flame = rocket.getObjectByName('flame')!;
    // adaya dönüş
    this.spots.push({
      id: 'mars-donus', x: 3.6, z: 3.2, r: 2.6, label: 'Roketle adaya dön',
      act: {
        dur: 7, pose: 'sit', cam: [40, 18],
        step: (t, u, a) => {
          let y = 0;
          if (u < 0.2) rocket.position.x = Math.sin(t * 50) * 0.08;
          else y = ((u - 0.2) / 0.8) ** 2 * 160;
          flame.visible = u > 0.15;
          flame.scale.y = 1 + Math.random() * 0.5;
          rocket.position.y = 0.4 + y;
          a.pos.set(0, 0.4 + y + 7.5, 0.2);
          a.heading = 0;
          if (flame.visible && Math.random() < 0.5) this.sparkles.burst(new THREE.Vector3(0, y - 0.6, 0), 3, '#ffc83d');
          if (beat(t, 1 / 60, 0.55, 1)) this.ev.sound.fx?.('engine');
        },
        end: () => {
          this.ev.leave?.();
          return 'Mars macerası bitti; Çizio Adası’na geri döndün!';
        },
      },
    });
    // Mars aracı turu
    const rover = new THREE.Group();
    rover.add(outline(mesh(new THREE.BoxGeometry(2.4, 0.8, 3.4), toon('#f4f6fa', { emissive: '#333' })), 1.03).translateY(1.2));
    const solar = mesh(new THREE.BoxGeometry(3, 0.08, 2.2), new THREE.MeshStandardMaterial({ color: '#1d3557', metalness: 0.6, roughness: 0.3 }), false);
    solar.position.set(0, 1.7, -0.6);
    const mast = mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.4, 6), toon('#8d939e'), false);
    mast.position.set(0.8, 2.2, 1.2);
    const camHead = mesh(new THREE.BoxGeometry(0.5, 0.3, 0.3), toon('#3a3f4a'), false);
    camHead.position.set(0.8, 2.95, 1.2);
    rover.add(solar, mast, camHead);
    const wheels: THREE.Mesh[] = [];
    for (const sx of [-1.35, 1.35]) for (const sz of [-1.3, 0, 1.3]) {
      const w = mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.4, 12), toon('#3a3f4a'));
      w.rotation.z = Math.PI / 2;
      w.position.set(sx, 0.45, sz);
      rover.add(w);
      wheels.push(w);
    }
    const rp = new THREE.Vector3(12, 0, 8);
    rover.position.set(rp.x, marsHeight(rp.x, rp.z), rp.z);
    rover.rotation.y = 0.6;
    this.scene.add(rover);
    this.solids.push({ x: rp.x, z: rp.z, r: 1.9 });
    const tour = new THREE.CatmullRomCurve3([[12, 8], [20, 20], [32, 22], [44, 30], [40, 44], [24, 46], [6, 40], [-10, 30], [-20, 16], [-12, 4], [4, 12], [12, 8]].map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'centripetal');
    this.spots.push({
      id: 'mars-rover', x: 14.6, z: 9.2, r: 2.4, label: 'Mars aracını sür',
      act: {
        dur: 22, pose: 'drive', cam: [12, 6], follow: true,
        step: (t, u, a, dt) => {
          const s = sm(u), p = tour.getPointAt(s), tg = tour.getTangentAt(s);
          const h = Math.atan2(tg.x, tg.z);
          const y = marsHeight(p.x, p.z);
          rover.position.set(p.x, y, p.z);
          rover.rotation.set(-Math.atan2(marsHeight(p.x + tg.x, p.z + tg.z) - marsHeight(p.x - tg.x, p.z - tg.z), 2), h, 0, 'YXZ');
          for (const w of wheels) w.rotation.x += dt * 6;
          rover.updateMatrixWorld();
          a.pos.copy(rover.localToWorld(new THREE.Vector3(0, 1.5, 0.2)));
          a.heading = h;
          if (beat(t, dt, 0.6)) this.ev.sound.fx?.('rumble');
          if (Math.random() < dt * 10) this.sparkles.burst(rover.localToWorld(new THREE.Vector3(0, 0.3, -1.8)), 2, '#e8a070');
        },
        end: () => {
          rover.position.set(rp.x, marsHeight(rp.x, rp.z), rp.z);
          rover.rotation.set(0, 0.6, 0);
          return 'Mars aracıyla kraterleri gezdin! Burada kayalar bile kırmızı.';
        },
      },
    });
    // bayrak dik
    let planted = false;
    this.spots.push({
      id: 'mars-bayrak', x: 8, z: -4, r: 2.2, label: 'Mars’a bayrak dik',
      dyn: () => (planted ? null : 'Mars’a bayrak dik'),
      act: {
        dur: 3.5, pose: (u) => (u < 0.7 ? 'dig' : 'cheer'), cam: [9, 5],
        step: (t, u, a, dt) => {
          a.pos.set(8, marsHeight(8, -4.6), -4.6);
          a.heading = Math.PI;
          this.flag.visible = true;
          this.flag.scale.setScalar(Math.max(0.001, sm(clamp01((u - 0.4) / 0.5))));
          if (beat(t, dt, 0.6)) this.ev.sound.fx?.('step');
        },
        end: () => {
          planted = true;
          this.ev.sound.fx?.('yay');
          return 'Çizio bayrağı Mars’ta dalgalanıyor!';
        },
      },
    });
    // teleskop
    this.spots.push({
      id: 'mars-teleskop', x: -8, z: 12, r: 2, label: 'Teleskopla Dünya’ya bak',
      act: {
        dur: 4, pose: 'hold', cam: [6, 3],
        step: (_t, _u, a) => {
          a.pos.set(-7.4, marsHeight(-7.4, 11), 11);
          a.heading = Math.atan2(-120 + 7.4, -170 - 11);
        },
        end: () => 'Mavi Dünya’yı gördün! Çizio Adası da orada bir yerde.',
      },
    });
    // kaya örneği
    this.spots.push({
      id: 'mars-kaya', x: -18, z: -26, r: 2.4, label: 'Kaya örneği topla',
      act: {
        dur: 3.5, pose: 'dig', cam: [8, 4],
        step: (t, _u, a, dt) => {
          a.heading = Math.PI * 1.2;
          if (beat(t, dt, 0.4)) this.ev.sound.fx?.('buzz');
          if (Math.random() < 0.3) this.sparkles.burst(a.pos.clone().setY(a.pos.y + 0.3), 1, '#c4521f');
        },
        end: (a) => {
          holdItem(a, outline(mesh(new THREE.DodecahedronGeometry(0.22, 0), toon('#9c3f1a')), 1.08));
          return pick(['Mars’ın kırmızı rengi pas gibi demir tozundan gelir!', 'Mars’ta bir gün Dünya’dakinden biraz uzun: 24 saat 37 dakika!', 'Mars’taki Olimpos Dağı Everest’ten üç kat yüksek!']);
        },
      },
    });
    // sera
    this.spots.push({
      id: 'mars-sera', x: 28, z: 6, r: 2.2, label: 'Serada patates yetiştir',
      act: {
        dur: 5, pose: 'hold', cam: [10, 6],
        step: (t, u, a, dt) => {
          a.pos.set(28.3, marsHeight(28.3, 6), 6);
          a.heading = Math.PI / 2;
          this.plants.forEach((p, i) => p.scale.setScalar(0.5 + sm(clamp01(u * 1.2 - i * 0.05)) * 0.9));
          if (beat(t, dt, 0.8)) this.ev.sound.fx?.('splash');
        },
        end: () => 'Mars’ta patates yetiştirdin! Astronotlar çok sevinecek.',
      },
    });
    // astronotla konuş
    this.spots.push({
      id: 'mars-astronot', x: 16.4, z: -1, r: 2.2, label: 'Astronotla konuş',
      act: {
        dur: 3, pose: 'wave', cam: [8, 4],
        start: () => void (this.astroPose = 'wave'),
        step: (_t, _u, a) => void (a.heading = Math.atan2(18 - a.pos.x, -2 - a.pos.z)),
        end: () => {
          this.astroPose = 'idle';
          return pick(['Astronot: Merhaba küçük kaşif! Kristalleri buldun mu?', 'Astronot: Burada yerçekimi az; bir zıpla, uçar gibi olursun!', 'Astronot: Mars’ta hava yok, kaskını hiç çıkarma!']);
        },
      },
    });
    // uzaylılar
    this.spots.push({
      id: 'mars-uzayli', x: -30, z: 19, r: 3, label: 'Uzaylılara el salla',
      act: {
        dur: 3.5, pose: 'wave', cam: [10, 5],
        step: (t, _u, a, dt) => {
          a.heading = Math.atan2(-30 - a.pos.x, 19 - a.pos.z);
          for (const al of this.aliens) al.obj.position.y += Math.abs(Math.sin(t * 8)) * 0.05;
          if (beat(t, dt, 0.5)) this.ev.sound.fx?.('musicbox', Math.floor(t * 2) % 7);
        },
        end: () => pick(['Uzaylı: Bip bop! Merhaba dünyalı arkadaş!', 'Uzaylı: Zip zap! Senin adan çok güzelmiş!', 'Uzaylı: Biiip! Birlikte zıplayalım mı?']),
      },
    });
    // uçan daire turu
    const ufoHome = this.ufoAt.clone();
    this.spots.push({
      id: 'mars-ufo', x: -26, z: 10, r: 2.6, label: 'Uçan daireye bin',
      act: {
        dur: 14, pose: (u) => (u > 0.2 && u < 0.85 ? 'cheer' : 'idle'), cam: [22, 10], follow: true,
        start: () => void (this.ufoFree = false),
        step: (t, u, a, dt) => {
          const start = new THREE.Vector3(-26, marsHeight(-26, 10), 10);
          const hover = ufoHome.clone();
          if (u < 0.15) {
            // ışınla yukarı çek
            const k = u / 0.15;
            this.ufo.position.lerp(new THREE.Vector3(start.x, start.y + 6, start.z), 0.1);
            this.beam.visible = true;
            this.beam.position.set(this.ufo.position.x, this.ufo.position.y - 3, this.ufo.position.z);
            a.pos.set(start.x, start.y + k * 5.5, start.z);
            a.heading += dt * 3;
            if (beat(t, dt, 0.3)) this.ev.sound.fx?.('musicbox', Math.floor(t * 3) % 7);
          } else if (u < 0.85) {
            this.beam.visible = false;
            const k = (u - 0.15) / 0.7, ang = k * Math.PI * 2;
            const R = 30;
            const x = -10 + Math.cos(ang + Math.PI) * R, z = 10 + Math.sin(ang + Math.PI) * R;
            const y = Math.max(marsHeight(x, z), 0) + 14 + Math.sin(k * Math.PI * 3) * 3;
            this.ufo.position.set(x, y, z);
            this.ufo.rotation.y += dt * 4;
            a.pos.set(x, y + 0.4, z);
            a.heading = -ang;
            if (beat(t, dt, 1.2)) this.ev.sound.whoosh?.();
          } else {
            const k = (u - 0.85) / 0.15;
            this.ufo.position.lerp(new THREE.Vector3(hover.x, hover.y + 6, hover.z), 0.08);
            this.beam.visible = true;
            this.beam.position.set(this.ufo.position.x, this.ufo.position.y - 3, this.ufo.position.z);
            a.pos.set(this.ufo.position.x, this.ufo.position.y - k * 6, this.ufo.position.z + k * 2);
          }
        },
        end: (a) => {
          this.beam.visible = false;
          this.ufoFree = true;
          this.ufo.position.set(ufoHome.x, ufoHome.y + 6, ufoHome.z);
          a.pos.set(-26, marsHeight(-26, 10), 10);
          this.ev.sound.fx?.('yay');
          return 'Uzaylılarla Mars’ın üstünde uçtun! Bip bop!';
        },
      },
    });
    // düşük yerçekimi zıplama halkası
    this.spots.push({
      id: 'mars-zipla', x: -14, z: -10, r: 2.2, label: 'Süper zıplama halkası',
      act: {
        dur: 7, pose: 'jump', cam: [16, 8],
        step: (t, _u, a, dt) => {
          const g0 = marsHeight(-14, -10) + 0.35;
          const hop = Math.abs(Math.sin(t * 1.35));
          a.pos.set(-14, g0 + hop * 11, -10);
          a.heading += dt * 1.2;
          if (beat(t, dt, Math.PI / 1.35)) this.ev.sound.fx?.('boing');
        },
        end: () => 'Mars’ta yerçekimi az: Dünya’dakinin neredeyse üç katı yükseğe zıpladın!',
      },
    });
  }

  floor(x: number, z: number) {
    if (Math.hypot(x, z) > EDGE + 6) return -Infinity;
    return marsHeight(x, z);
  }
  blocked(x: number, z: number, y: number) {
    if (Math.hypot(x, z) > EDGE) return true;
    for (const s of this.solids) if (Math.hypot(x - s.x, z - s.z) < s.r + 0.4 && y < marsHeight(s.x, s.z) + 3) return true;
    return false;
  }
  update(dt: number, t: number, hero: Hero) {
    this.tick(dt);
    if (!this.greeted && this.time > 0.6) {
      this.greeted = true;
      this.ev.msg('Mars’a hoş geldin! Burada yerçekimi az: zıpla bakalım!');
      this.ev.progress(`0/${this.crystals.length}`);
    }
    for (const f of this.ticks) f(dt, t);
    this.astro.update(dt, t, this.astroPose, 0);
    for (const c of this.crystals) {
      if (c.taken) continue;
      c.obj.rotation.y += dt * 1.2;
      c.obj.position.y = c.base + Math.sin(t * 2 + c.obj.position.x) * 0.15;
      if (!this.done && hero.pos.clone().setY(hero.pos.y + 1).distanceTo(c.obj.position) < 2) {
        c.taken = true;
        c.obj.visible = false;
        this.got++;
        this.sparkles.burst(c.obj.position.clone().setY(c.obj.position.y + 1), 14, '#e5d4ff');
        this.ev.sound.star(this.got);
        this.ev.progress(`${this.got}/${this.crystals.length}`);
        if (this.got >= this.crystals.length) {
          this.done = true;
          this.ev.finish(this.got * 2, 'Bütün Mars kristallerini buldun, uzay kaşifi!');
        }
      }
    }
    return super.update(dt, t, hero);
  }
  dispose() {
    this.astro.dispose();
    super.dispose();
  }
}
