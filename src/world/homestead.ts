/**
 * Çiftliğim (oyuncunun arsası), Pazar ve Macera Kapıları'nın 3B kısmı.
 *
 * Çiftlik durumu React'taki kayıttadır (economy.ts); burada `FarmBridge` ile okunur ve değiştirilir. Tarlalar, ürünler,
 * hayvanlar ve baloncuklar (su damlası, yumurta…) durumdan her yarım saniyede bir güncellenir; ürünler gerçek zamanla büyür.
 */
import * as THREE from 'three';
import { mesh, outline, toon } from '../play3d/kit';
import { WorldBlocks } from './build';
import { drawIcon } from './gameIcons';
import {
  animal, clock, collect, crop, feed, fieldStage, ITEM_ICON, ITEM_NAME, levelOf, PEN_OF, stationStage, struct, waterAll, harvestAll,
  type AnimalId, type FarmState, type Result,
} from './economy';
import { HOME, zone } from './layout';
import { sign, house, type Activity, type SpotDef, type WorldBuilder } from './zones';
import type { Blocker } from './terrain';

export interface FarmBridge {
  get(): FarmState;
  /** Bir çiftlik işlemi uygular (React kaydeder, seviye atlamayı kutlar). */
  apply(f: (s: FarmState) => Result): Result;
}

// ------------------------------------------------------------------------------------------------
// Baloncuk (simge) ve modeller
// ------------------------------------------------------------------------------------------------
const bubbleTex = new Map<string, THREE.Texture>();
/** Başının üstünde beyaz baloncuk içinde bir simge (gameIcons.ts). */
export function bubble(icon: string, scale = 1.5) {
  let t = bubbleTex.get(icon);
  if (!t) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const x = c.getContext('2d')!;
    x.fillStyle = 'rgba(255,255,255,0.96)';
    x.beginPath();
    x.arc(64, 58, 50, 0, Math.PI * 2);
    x.moveTo(52, 104);
    x.lineTo(64, 124);
    x.lineTo(76, 104);
    x.fill();
    x.strokeStyle = '#3a2b27';
    x.lineWidth = 5;
    x.beginPath();
    x.arc(64, 58, 50, 0, Math.PI * 2);
    x.stroke();
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    drawIcon(x, icon, 30, 24, 68, () => (tex.needsUpdate = true));
    bubbleTex.set(icon, tex);
    t = tex;
  }
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthWrite: false }));
  sp.scale.setScalar(scale);
  sp.renderOrder = 5;
  return sp;
}

function plantModel(id: string, k: number): THREE.Object3D {
  const g = new THREE.Group();
  const s = 0.35 + 0.65 * k; // büyüme
  const add = (o: THREE.Object3D, x: number, y: number, z: number) => { o.position.set(x, y, z); g.add(o); return o; };
  const leaf = toon('#4caf50');
  if (k < 0.34) {
    add(mesh(new THREE.ConeGeometry(0.12, 0.35, 5), leaf, false), 0, 0.18, 0);
    return g;
  }
  switch (id) {
    case 'havuc':
      for (const r of [-0.4, 0, 0.4]) { const l = add(mesh(new THREE.ConeGeometry(0.1, 0.7 * s, 5), leaf, false), r * 0.3, 0.35 * s + 0.1, 0); l.rotation.z = r; }
      if (k >= 1) add(mesh(new THREE.ConeGeometry(0.16, 0.3, 8), toon('#ff8a3d'), false), 0, 0.08, 0).rotation.x = Math.PI;
      break;
    case 'bugday':
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.1 * s, 4), toon(k >= 1 ? '#e2b94c' : '#8bc34a'), false), Math.cos(a) * 0.15, 0.55 * s, Math.sin(a) * 0.15);
        add(mesh(new THREE.CapsuleGeometry(0.06, 0.22, 2, 6), toon(k >= 1 ? '#f2c94c' : '#9ccc65'), false), Math.cos(a) * 0.15, 1.1 * s + 0.1, Math.sin(a) * 0.15);
      }
      break;
    case 'misir':
      add(mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.8 * s, 6), leaf, false), 0, 0.9 * s, 0);
      for (const r of [-0.6, 0.6]) { const l = add(mesh(new THREE.BoxGeometry(0.06, 0.8 * s, 0.18), leaf, false), r * 0.25, 0.8 * s, 0); l.rotation.z = r; }
      if (k >= 1) add(outline(mesh(new THREE.CapsuleGeometry(0.13, 0.35, 3, 8), toon('#ffd43b')), 1.08), 0.16, 1.2, 0);
      break;
    case 'domates':
      add(outline(mesh(new THREE.IcosahedronGeometry(0.42 * s, 0), leaf), 1.05), 0, 0.42 * s, 0);
      if (k >= 1) for (const [x, y, z] of [[0.3, 0.5, 0.2], [-0.25, 0.65, 0.2], [0.05, 0.4, -0.35]]) add(mesh(new THREE.SphereGeometry(0.13, 8, 6), toon('#ef4b4b')), x, y, z);
      break;
    case 'aycicegi': {
      add(mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.6 * s, 6), leaf, false), 0, 0.8 * s, 0);
      const head = add(new THREE.Group(), 0, 1.6 * s, 0.05);
      head.add(mesh(new THREE.CylinderGeometry(0.34 * s, 0.34 * s, 0.08, 12), toon(k >= 1 ? '#ffc83d' : '#c5e1a5')));
      if (k >= 1) { const c = mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.1, 10), toon('#7a4a3a')); c.position.y = 0.02; head.add(c); }
      head.rotation.x = Math.PI / 2.4;
      break;
    }
    case 'cilek':
      add(outline(mesh(new THREE.SphereGeometry(0.34 * s, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), leaf), 1.05), 0, 0, 0);
      if (k >= 1) for (const [x, z] of [[0.3, 0.1], [-0.2, 0.25], [0.05, -0.3]]) add(mesh(new THREE.ConeGeometry(0.09, 0.2, 7), toon('#ff4d6d')), x, 0.12, z).rotation.x = Math.PI;
      break;
    case 'kabak':
      add(mesh(new THREE.ConeGeometry(0.3, 0.3 * s, 6), leaf, false), -0.2, 0.15, 0);
      if (k >= 1) {
        const p = add(outline(mesh(new THREE.SphereGeometry(0.45, 12, 10), toon('#ff8c1a')), 1.05), 0.1, 0.36, 0);
        p.scale.y = 0.75;
        add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.2, 5), toon('#5d8a3a')), 0.1, 0.75, 0);
      }
      break;
  }
  return g;
}

function animalModel(k: AnimalId): THREE.Group {
  const g = new THREE.Group();
  const add = (o: THREE.Object3D, x: number, y: number, z: number) => { o.position.set(x, y, z); g.add(o); return o; };
  if (k === 'tavuk') {
    add(outline(mesh(new THREE.SphereGeometry(0.42, 12, 10), toon('#ffffff')), 1.06), 0, 0.55, 0);
    add(outline(mesh(new THREE.SphereGeometry(0.26, 10, 8), toon('#ffffff')), 1.06), 0, 0.95, 0.28);
    add(mesh(new THREE.ConeGeometry(0.08, 0.2, 6), toon('#ffb300')), 0, 0.92, 0.55).rotation.x = Math.PI / 2;
    add(mesh(new THREE.BoxGeometry(0.06, 0.18, 0.22), toon('#ef4b4b')), 0, 1.22, 0.28);
    for (const x of [-0.12, 0.12]) add(mesh(new THREE.SphereGeometry(0.04, 6, 6), toon('#3a2b27')), x, 1.0, 0.5);
    for (const x of [-0.15, 0.15]) add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 4), toon('#ffb300')), x, 0.15, 0);
    add(mesh(new THREE.ConeGeometry(0.18, 0.35, 5), toon('#f4f1ea')), 0, 0.75, -0.42).rotation.x = -0.9;
  } else if (k === 'inek') {
    add(outline(mesh(new THREE.BoxGeometry(1.1, 1.0, 2.0), toon('#ffffff')), 1.04), 0, 1.3, 0);
    for (const [x, y, z] of [[0.56, 1.4, 0.3], [-0.56, 1.2, -0.4], [0.3, 1.81, -0.5]]) add(mesh(new THREE.BoxGeometry(0.06, 0.4, 0.5), toon('#3a2b27'), false), x, y, z);
    add(outline(mesh(new THREE.BoxGeometry(0.75, 0.75, 0.75), toon('#ffffff')), 1.05), 0, 1.75, 1.15);
    add(mesh(new THREE.BoxGeometry(0.6, 0.35, 0.2), toon('#ffb3c7')), 0, 1.55, 1.55);
    for (const x of [-0.42, 0.42]) add(mesh(new THREE.ConeGeometry(0.07, 0.3, 6), toon('#f3dca2')), x, 2.22, 1.15);
    for (const x of [-0.2, 0.2]) add(mesh(new THREE.SphereGeometry(0.06, 6, 6), toon('#3a2b27')), x, 1.9, 1.53);
    for (const [x, z] of [[-0.38, 0.7], [0.38, 0.7], [-0.38, -0.7], [0.38, -0.7]]) add(mesh(new THREE.BoxGeometry(0.22, 0.85, 0.22), toon('#f4f1ea')), x, 0.42, z);
    add(mesh(new THREE.SphereGeometry(0.2, 8, 6), toon('#ffb3c7')), 0, 0.75, -0.3);
  } else if (k === 'koyun') {
    for (const [x, y, z] of [[0, 1.0, 0], [0.3, 1.1, 0.4], [-0.3, 1.1, 0.4], [0.3, 1.1, -0.4], [-0.3, 1.1, -0.4], [0, 1.35, 0]]) add(outline(mesh(new THREE.SphereGeometry(0.45, 10, 8), toon('#fbf7ef')), 1.05), x, y, z);
    add(outline(mesh(new THREE.BoxGeometry(0.45, 0.5, 0.5), toon('#3a3f4a')), 1.05), 0, 1.2, 0.85);
    for (const x of [-0.12, 0.12]) add(mesh(new THREE.SphereGeometry(0.06, 6, 6), toon('#ffffff')), x, 1.3, 1.1);
    for (const [x, z] of [[-0.3, 0.4], [0.3, 0.4], [-0.3, -0.4], [0.3, -0.4]]) add(mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 5), toon('#3a3f4a')), x, 0.3, z);
  } else {
    // arı kovanı: hasır kubbe ve uçuşan arılar
    for (let i = 0; i < 4; i++) add(outline(mesh(new THREE.TorusGeometry(0.75 - i * 0.15, 0.2, 8, 16), toon('#e2a868')), 1.04), 0, 0.25 + i * 0.32, 0).rotation.x = Math.PI / 2;
    add(mesh(new THREE.CircleGeometry(0.16, 10), toon('#3a2b27'), false), 0, 0.35, 0.76);
    for (let i = 0; i < 3; i++) {
      const bee = new THREE.Group();
      bee.add(mesh(new THREE.SphereGeometry(0.12, 8, 6), toon('#ffd43b'), false));
      const st = mesh(new THREE.TorusGeometry(0.1, 0.03, 4, 10), toon('#3a2b27'), false);
      st.rotation.y = Math.PI / 2;
      bee.add(st);
      bee.name = 'bee';
      g.add(bee);
    }
  }
  return g;
}

function fence(w: number, d: number, color = '#f4f1ea', gap = 0) {
  const g = new THREE.Group();
  const posts: [number, number][] = [];
  const line = (x1: number, z1: number, x2: number, z2: number) => {
    const n = Math.ceil(Math.hypot(x2 - x1, z2 - z1) / 1.6);
    for (let i = 0; i <= n; i++) posts.push([x1 + ((x2 - x1) * i) / n, z1 + ((z2 - z1) * i) / n]);
    const len = Math.hypot(x2 - x1, z2 - z1);
    for (const y of [0.45, 0.9]) {
      const r = mesh(new THREE.BoxGeometry(len, 0.1, 0.08), toon(color), false);
      r.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
      r.rotation.y = -Math.atan2(z2 - z1, x2 - x1);
      g.add(r);
    }
  };
  line(-w / 2, -d / 2, w / 2, -d / 2);
  line(-w / 2, d / 2, -gap / 2, d / 2);
  if (gap) line(gap / 2, d / 2, w / 2, d / 2);
  else line(-w / 2, d / 2, w / 2, d / 2);
  line(-w / 2, -d / 2, -w / 2, d / 2);
  line(w / 2, -d / 2, w / 2, d / 2);
  for (const [x, z] of posts) {
    const p = mesh(new THREE.BoxGeometry(0.16, 1.2, 0.16), toon(color));
    p.position.set(x, 0.6, z);
    g.add(p);
  }
  return g;
}

function tool(kind: 'can' | 'bucket' | 'basket' | 'shears' | 'scoop') {
  const g = new THREE.Group();
  if (kind === 'can') {
    g.add(mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.35, 10), toon('#4dabf7')));
    const sp = mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.45, 6), toon('#4dabf7'));
    sp.position.set(0, 0.05, 0.3);
    sp.rotation.x = Math.PI / 3;
    g.add(sp);
  } else if (kind === 'bucket' || kind === 'scoop') {
    g.add(outline(mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.34, 10), toon(kind === 'bucket' ? '#cfd4dc' : '#e2a868')), 1.06));
  } else if (kind === 'basket') {
    g.add(outline(mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.28, 10), toon('#c98a4b')), 1.06));
  } else {
    g.add(mesh(new THREE.BoxGeometry(0.06, 0.06, 0.4), toon('#9aa3ad')));
  }
  g.position.set(0, -0.1, 0.15);
  return g;
}

// ------------------------------------------------------------------------------------------------
// Çiftlik yapıları: çocuğun adaya kurduğu tarla, kümes, ahır, ağıl, arı bahçesi ve mutfak
// ------------------------------------------------------------------------------------------------
interface FieldView { x: number; z: number; tile: THREE.Mesh; plants: THREE.Group; key: string; bub: THREE.Sprite | null }
interface PenView { k: AnimalId; x: number; z: number; w: number; d: number; models: { obj: THREE.Group; pos: THREE.Vector3; to: THREE.Vector3; wait: number; hop: number }[]; bub: THREE.Sprite | null; key: string }

export class Homestead {
  readonly build: WorldBlocks;
  private fields: FieldView[] = [];
  private pens: PenView[] = [];
  private smoke: THREE.Vector3[] = [];
  private objs: THREE.Object3D[] = [];
  private ownSpots: SpotDef[] = [];
  private blockers: Blocker[] = [];
  private timer = 0;
  private sig = '';
  /** Arkadaşın adasındaysak onun adı (çiftlik yalnızca görülür). */
  private guest: string | null = null;

  constructor(private b: WorldBuilder, private farm: FarmBridge, canBuild: (x: number, z: number) => string | null) {
    const C = HOME;
    b.keepOut.push({ x: C.x, z: C.z, r: 58 });
    b.place(sign('Büyük Çayır', '#c5f2b0'), C.x - 36, C.z + 4, -Math.PI / 2);
    this.build = new WorldBlocks(b.scene, (x, z) => b.ground(x, z), canBuild);
    this.build.load(farm.get().build);
    this.refresh();
  }

  private add<T extends THREE.Object3D>(o: T, x: number, z: number, rot = 0, dy = 0): T {
    this.b.place(o, x, z, rot, dy);
    this.objs.push(o);
    return o;
  }
  private spot(s: SpotDef) {
    this.b.spot(s);
    this.ownSpots.push(s);
  }
  private blocker(x: number, z: number, r: number) {
    const bl = { x, z, r };
    this.b.grid.add(bl);
    this.blockers.push(bl);
  }

  /** Yapılar değişince sahnedeki çiftliği baştan kurar. */
  private layout(s: FarmState) {
    for (const o of this.objs) this.b.scene.remove(o);
    for (const p of this.pens) for (const m of p.models) this.b.scene.remove(m.obj);
    for (const f of this.fields) if (f.bub) this.b.scene.remove(f.bub);
    for (const p of this.pens) if (p.bub) this.b.scene.remove(p.bub);
    for (const sp of this.ownSpots) {
      const i = this.b.spots.indexOf(sp);
      if (i >= 0) this.b.spots.splice(i, 1);
    }
    for (const bl of this.blockers) this.b.grid.remove(bl);
    this.objs = [];
    this.ownSpots = [];
    this.blockers = [];
    this.fields = [];
    this.pens = [];
    this.smoke = [];
    const tileGeo = new THREE.BoxGeometry(3.8, 0.3, 3.8);
    for (const p of s.places) {
      const { x, z } = p;
      if (p.k === 'tarla') {
        const i = this.fields.length;
        const tile = this.add(mesh(tileGeo, toon('#9b6b43'), false), x, z, 0, 0.12);
        const plants = this.add(new THREE.Group(), x, z, 0, 0.27);
        this.fields.push({ x, z, tile, plants, key: '', bub: null });
        this.spot({ id: `field:${i}`, x, z, r: 2.4, label: '', dyn: () => this.fieldLabel(i), use: () => this.fieldUse(i) });
        continue;
      }
      if (p.k === 'mutfak') {
        const kitchen = house('#fff1c7', 0.7, '#ff8f6b');
        const chimney = outline(mesh(new THREE.BoxGeometry(0.9, 2.4, 0.9), toon('#c8553d')), 1.04);
        chimney.position.set(1.8, 6, -1);
        kitchen.add(chimney);
        this.add(kitchen, x, z, 0);
        this.blocker(x, z, 3.2);
        this.smoke.push(new THREE.Vector3(x + 1.26, this.b.h(x, z) + 6.5, z - 0.7));
        this.spot({
          id: 'kitchen', x, z: z + 3.4, r: 2.6, label: 'Mutfak',
          dyn: () => (this.guest ? null : 'Mutfakta yemek yap'),
          use: () => 'page',
        });
        continue;
      }
      const k = (Object.keys(PEN_OF) as AnimalId[]).find((a) => PEN_OF[a] === p.k)!;
      const a = animal(k);
      const w = 9, d = 8;
      this.add(fence(w, d, '#f4f1ea', 2.4), x, z, Math.PI);
      if (k === 'tavuk') this.add(house('#ffcc80', 0.35, '#e05a4f'), x + 2.6, z + 2.2, Math.PI);
      else if (k !== 'ari') this.add(outline(mesh(new THREE.BoxGeometry(2.2, 0.5, 0.7), toon('#8a5a35')), 1.05), x - 2.4, z + 3, 0, 0.25);
      this.add(sign(a.name, '#fff1c7'), x - 3, z - 4.6, Math.PI);
      this.pens.push({ k, x, z, w, d, models: [], bub: null, key: '' });
      this.spot({ id: `pen:${k}`, x, z: z - 4.8, r: 3, label: '', dyn: () => this.penLabel(k), use: () => this.penUse(k) });
    }
  }

  /** Çiftlik durumu değişince (React'tan da çağrılır). */
  refresh() {
    const s = this.farm.get();
    const sig = JSON.stringify(s.places);
    if (sig !== this.sig) {
      this.sig = sig;
      this.layout(s);
    }
    const now = Date.now();
    this.fields.forEach((f, i) => {
      const fs = s.fields[i];
      const st = fs ? fieldStage(fs, now) : null;
      const bucket = !st ? 'none' : st.stage === 'growing' ? `g${Math.min(2, Math.floor(st.u * 3))}` : st.stage;
      const key = `${fs?.c ?? ''}|${bucket}|${fs?.w ? 1 : 0}`;
      if (key === f.key) return;
      const wasEmpty = f.key === '' || f.key.startsWith('|');
      f.key = key;
      f.plants.clear();
      if (f.bub) {
        this.b.scene.remove(f.bub);
        f.bub = null;
      }
      f.tile.material = toon(fs?.w ? '#7a5235' : '#9b6b43');
      if (!fs?.c || !st) return;
      const k = st.stage === 'thirsty' ? 0 : st.stage === 'ready' ? 1 : Math.max(0.35, st.u);
      for (const [dx, dz] of [[-0.85, -0.85], [0.85, -0.85], [-0.85, 0.85], [0.85, 0.85]]) {
        const p = plantModel(fs.c, k);
        p.position.set(dx, 0, dz);
        f.plants.add(p);
      }
      if (st.stage === 'thirsty') f.bub = bubble('damla', 1.3);
      if (st.stage === 'ready') f.bub = bubble(crop(fs.c).icon, 1.5);
      if (f.bub) {
        f.bub.position.set(f.x, this.b.h(f.x, f.z) + 2.6, f.z);
        this.b.scene.add(f.bub);
      }
      if (st.stage === 'ready' || (wasEmpty && st.stage === 'thirsty')) this.b.sparkles.burst(new THREE.Vector3(f.x, this.b.h(f.x, f.z) + 1, f.z), 10);
    });
    for (const p of this.pens) {
      const own = s.animals.filter((a) => a.k === p.k);
      while (p.models.length > own.length) this.b.scene.remove(p.models.pop()!.obj);
      while (p.models.length < own.length) {
        const obj = animalModel(p.k);
        const pos = new THREE.Vector3(p.x + (Math.random() - 0.5) * 4, 0, p.z + (Math.random() - 0.5) * 3);
        this.b.scene.add(obj);
        p.models.push({ obj, pos, to: pos.clone(), wait: Math.random() * 2, hop: Math.random() * 6 });
        this.b.sparkles.burst(pos.clone().setY(this.b.h(pos.x, pos.z) + 1), 12);
      }
      const st = stationStage(s, p.k, now);
      if (st.stage !== p.key) {
        p.key = st.stage;
        if (p.bub) {
          this.b.scene.remove(p.bub);
          p.bub = null;
        }
        const def = animal(p.k);
        if (st.stage === 'hungry') p.bub = bubble(ITEM_ICON[def.eats], 1.4);
        if (st.stage === 'ready') p.bub = bubble(ITEM_ICON[def.product], 1.6);
        if (p.bub) {
          p.bub.position.set(p.x, this.b.h(p.x, p.z) + 3.8, p.z);
          this.b.scene.add(p.bub);
        }
      }
    }
  }

  /** Her kare: hayvanlar ağılda dolaşır, baloncuklar sallanır, mutfak tüter; yarım saniyede bir durum güncellenir. */
  update(dt: number, t: number) {
    this.timer -= dt;
    if (this.timer <= 0) {
      this.timer = 0.5;
      this.refresh();
    }
    if (Math.floor(t * 2) !== Math.floor((t - dt) * 2)) for (const s of this.smoke) this.b.sparkles.burst(s, 1, '#dddddd');
    for (const p of this.pens) {
      for (const m of p.models) {
        if (p.k === 'ari') {
          m.obj.position.set(p.x, this.b.h(p.x, p.z), p.z);
          let i = 0;
          for (const c of m.obj.children) if (c.name === 'bee') {
            const a = t * (2 + i) + i * 2;
            c.position.set(Math.cos(a) * 1.3, 1.4 + Math.sin(t * 3 + i) * 0.4, Math.sin(a) * 1.3);
            i++;
          }
          continue;
        }
        m.wait -= dt;
        const d = m.to.clone().sub(m.pos).setY(0);
        if (m.wait <= 0 && d.length() < 0.2) {
          m.wait = 1 + Math.random() * 4;
          m.to.set(p.x + (Math.random() - 0.5) * (p.w - 3), 0, p.z + (Math.random() - 0.5) * (p.d - 3));
        }
        const moving = m.wait <= 0 && d.length() > 0.2;
        if (moving) {
          m.pos.addScaledVector(d.normalize(), (p.k === 'tavuk' ? 1.6 : 0.9) * dt);
          m.obj.rotation.y = Math.atan2(d.x, d.z);
          m.hop += dt * (p.k === 'tavuk' ? 14 : 7);
        }
        m.obj.position.set(m.pos.x, this.b.h(m.pos.x, m.pos.z) + (moving ? Math.abs(Math.sin(m.hop)) * (p.k === 'tavuk' ? 0.15 : 0.06) : 0), m.pos.z);
      }
      if (p.bub) p.bub.position.y = this.b.h(p.x, p.z) + 3.8 + Math.sin(t * 3) * 0.15;
    }
    for (const f of this.fields) if (f.bub) f.bub.position.y = this.b.h(f.x, f.z) + 2.6 + Math.sin(t * 3 + f.x) * 0.12;
  }

  /** Dokunulan noktadaki çiftlik yapısı (kaldırmak için). */
  placeAt(x: number, z: number): number {
    const s = this.farm.get();
    let best = -1, bd = Infinity;
    s.places.forEach((p, i) => {
      const d = Math.hypot(p.x - x, p.z - z);
      if (d < struct(p.k).r + 0.5 && d < bd) [best, bd] = [i, d];
    });
    return best;
  }
  /** Bir yapının kapladığı alan boş mu (diğer yapılar). */
  placeFree(x: number, z: number, r: number) {
    return this.farm.get().places.every((p) => Math.hypot(p.x - x, p.z - z) > (struct(p.k).r + r) * 0.85);
  }

  // ----------------------------------------------------------------------------------------------
  // Tarla düğmeleri
  // ----------------------------------------------------------------------------------------------
  private fieldLabel(i: number): string | null {
    if (this.guest) return null;
    const s = this.farm.get();
    if (!s.fields[i]) return null;
    const st = fieldStage(s.fields[i], Date.now());
    const name = s.fields[i].c ? crop(s.fields[i].c!).name : '';
    if (st.stage === 'empty') return 'Tohum ek';
    if (st.stage === 'thirsty') return `${name} sula`;
    if (st.stage === 'growing') return `${name} büyüyor ${clock(st.left)}`;
    return `${name} topla`;
  }

  private fieldUse(i: number): Activity | 'page' | { msg: string } | null {
    const s = this.farm.get();
    const f = this.fields[i];
    if (!s.fields[i] || !f) return null;
    const st = fieldStage(s.fields[i], Date.now());
    if (st.stage === 'empty') return 'page';
    if (st.stage === 'growing') return { msg: `Biraz bekle, ${clock(st.left)} sonra toplayabilirsin.` };
    const h = this.b.h(f.x, f.z);
    const stand = (a: { pos: THREE.Vector3; heading: number }, u: number) => {
      a.pos.set(f.x - 2.3 + u * 0.4, h, f.z);
      a.heading = Math.PI / 2;
    };
    if (st.stage === 'thirsty') {
      let can: THREE.Object3D | null = null;
      return {
        dur: 1.8, pose: 'hold', cam: [9, 5], quest: 'farm',
        start: (a) => { can = tool('can'); a.hand.add(can); },
        step: (t, u, a) => {
          stand(a, u);
          if (Math.floor(t * 10) !== Math.floor((t - 0.02) * 10)) this.b.sparkles.burst(new THREE.Vector3(f.x - 1 + u * 2, h + 1.2, f.z + (Math.random() - 0.5) * 2), 2, '#7ee0ff');
        },
        end: (a) => {
          if (can) a.hand.remove(can);
          const r = this.farm.apply((x) => waterAll(x, Date.now()));
          this.refresh();
          return r.err ?? r.msg;
        },
      };
    }
    let basket: THREE.Object3D | null = null;
    return {
      dur: 2.2, pose: 'dig', cam: [9, 5], quest: 'farm',
      start: (a) => { basket = tool('basket'); a.hand.add(basket); },
      step: (t, u, a) => {
        stand(a, u);
        if (Math.floor(t * 4) !== Math.floor((t - 0.02) * 4)) this.b.sparkles.burst(new THREE.Vector3(f.x, h + 0.6, f.z), 3, '#f3dca2');
      },
      end: (a) => {
        if (basket) a.hand.remove(basket);
        const r = this.farm.apply((x) => harvestAll(x, Date.now()));
        this.refresh();
        return r.err ?? r.msg;
      },
    };
  }

  // ----------------------------------------------------------------------------------------------
  // Ağıl düğmeleri
  // ----------------------------------------------------------------------------------------------
  private penLabel(k: AnimalId): string | null {
    if (this.guest) return null;
    const s = this.farm.get();
    const def = animal(k);
    const st = stationStage(s, k, Date.now());
    if (st.stage === 'none') return levelOf(s.xp) >= def.level ? `${def.name}: Pazar'dan al` : `${def.name} ${def.level}. seviyede`;
    if (st.stage === 'hungry') return `Besle (${def.eatN} ${ITEM_NAME[def.eats].toLocaleLowerCase('tr')})`;
    if (st.stage === 'busy') return `${ITEM_NAME[def.product]} ${clock(st.left)}`;
    return def.verb;
  }

  private penUse(k: AnimalId): Activity | { msg: string } | null {
    const s = this.farm.get();
    const def = animal(k);
    const st = stationStage(s, k, Date.now());
    if (st.stage === 'none') return { msg: levelOf(s.xp) >= def.level ? `Kasabadaki Pazar'dan ${def.name.toLocaleLowerCase('tr')} alabilirsin (${def.cost} altın).` : `${def.name} ${def.level}. seviyede açılır.` };
    if (st.stage === 'busy') return { msg: `${ITEM_NAME[def.product]} için ${clock(st.left)} kaldı.` };
    const p = this.pens.find((x) => x.k === k);
    if (!p) return null;
    const m0 = p.models[0];
    const target = m0?.pos ?? new THREE.Vector3(p.x, 0, p.z);
    const h = () => this.b.h(target.x, target.z);
    let held: THREE.Object3D | null = null;
    const feeding = st.stage === 'hungry';
    const milk = !feeding && k === 'inek';
    return {
      dur: milk ? 3 : 2, pose: milk ? 'sit' : feeding ? 'hold' : k === 'tavuk' ? 'dig' : 'hold', cam: [9, 5], quest: feeding ? 'feed' : 'collect',
      start: (a) => {
        // hayvan durur ve yana döner; kahraman yanına gelir
        if (m0 && k !== 'ari') {
          m0.wait = 4;
          m0.to.copy(m0.pos);
          m0.obj.rotation.y = 0;
        }
        held = tool(feeding ? 'scoop' : milk ? 'bucket' : k === 'koyun' ? 'shears' : 'basket');
        a.hand.add(held);
      },
      step: (t, _u, a) => {
        a.pos.set(target.x - (k === 'inek' ? 1.9 : k === 'ari' ? 2.2 : 1.5), h() + (milk ? -0.1 : 0), target.z + (k === 'inek' ? 0.2 : 0));
        a.heading = Math.PI / 2;
        if (Math.floor(t * 5) !== Math.floor((t - 0.02) * 5)) this.b.sparkles.burst(new THREE.Vector3(target.x, h() + 1.2, target.z), 2, feeding ? '#f2c94c' : milk ? '#ffffff' : '#ffd43b');
      },
      end: (a) => {
        if (held) a.hand.remove(held);
        const r = this.farm.apply((x) => (feeding ? feed(x, k, Date.now()) : collect(x, k, Date.now())));
        this.refresh();
        return r.err ?? r.msg;
      },
    };
  }

  /** Hangi çiftlik gösterilsin: kendi çiftliğim ya da arkadaşımınki (yalnızca görülür). */
  setBridge(bridge: FarmBridge, guest: string | null) {
    this.farm = bridge;
    this.guest = guest;
    this.sig = '-';
    this.build.load(bridge.get().build);
    this.refresh();
  }
}

// ------------------------------------------------------------------------------------------------
// Pazar (kasabada)
// ------------------------------------------------------------------------------------------------
export function buildMarket(b: WorldBuilder) {
  const M = zone('market');
  const g = new THREE.Group();
  const counter = outline(mesh(new THREE.BoxGeometry(7, 1.3, 2), toon('#c98a4b')), 1.03);
  counter.position.y = 0.65;
  g.add(counter);
  for (const x of [-3.3, 3.3]) for (const z of [-0.8, 0.8]) {
    const p = mesh(new THREE.CylinderGeometry(0.14, 0.14, 4, 8), toon('#8a5a35'));
    p.position.set(x, 2, z);
    g.add(p);
  }
  // çizgili tente
  for (let i = 0; i < 7; i++) {
    const s = mesh(new THREE.BoxGeometry(1, 0.15, 3), toon(i % 2 ? '#ffffff' : '#ff9f43'));
    s.position.set(-3 + i, 4.1, 0.2);
    s.rotation.x = 0.22;
    g.add(s);
  }
  // sandıklarda ürünler
  const goods: [string, number][] = [['#ff8a3d', -2.4], ['#ef4b4b', -0.8], ['#ffd43b', 0.8], ['#69db7c', 2.4]];
  for (const [c, x] of goods) {
    const crate = mesh(new THREE.BoxGeometry(1.3, 0.4, 1), toon('#e2a868'));
    crate.position.set(x, 1.5, 0.3);
    g.add(crate);
    for (let k = 0; k < 4; k++) {
      const f = mesh(new THREE.SphereGeometry(0.2, 8, 6), toon(c), false);
      f.position.set(x - 0.35 + (k % 2) * 0.7, 1.8, 0.1 + Math.floor(k / 2) * 0.4);
      g.add(f);
    }
  }
  const ang = b.facing(M.x, M.z, 0, 0);
  b.place(g, M.x, M.z, ang);
  b.block(M.x, M.z, 3.8);
  const sg = sign('Pazar', '#ffe1a8');
  sg.scale.setScalar(1.3);
  b.place(sg, M.x - Math.sin(ang) * 1.6, M.z - Math.cos(ang) * 1.6, ang, 2.4);
  // satıcı: Çizio'nun kartı (varsa)
  if (b.tex.maskot) {
    const c = b.card('maskot', 2.6);
    b.place(c, M.x - Math.sin(ang) * 0.6, M.z - Math.cos(ang) * 0.6, 0, 0.6);
  }
  // sipariş panosu
  const board = new THREE.Group();
  const pnl = outline(mesh(new THREE.BoxGeometry(2.4, 1.8, 0.2), toon('#7c5cff')), 1.04);
  pnl.position.y = 2;
  for (let i = 0; i < 3; i++) {
    const note = mesh(new THREE.PlaneGeometry(0.6, 0.8), toon(['#fff1c7', '#c5f2b0', '#ffd1dc'][i]), false);
    note.position.set(-0.75 + i * 0.75, 2, 0.11);
    board.add(note);
  }
  for (const x of [-0.9, 0.9]) {
    const leg = mesh(new THREE.BoxGeometry(0.14, 2, 0.14), toon('#5b3aa8'));
    leg.position.set(x, 1, 0);
    board.add(leg);
  }
  board.add(pnl);
  const bx = M.x + Math.cos(ang) * 5.5, bz = M.z - Math.sin(ang) * 5.5;
  b.place(board, bx, bz, ang);
  b.block(bx, bz, 1.1);
  const sx = M.x + Math.sin(ang) * 3.2, sz = M.z + Math.cos(ang) * 3.2;
  b.spot({ id: 'market', x: sx, z: sz, r: 3.4, label: 'Pazar: al ve sat', page: true });
  b.spot({ id: 'orders', x: bx + Math.sin(ang) * 2, z: bz + Math.cos(ang) * 2, r: 2.4, label: 'Sipariş panosu', page: true });
}

// ------------------------------------------------------------------------------------------------
// Macera Kapıları
// ------------------------------------------------------------------------------------------------
export const REALMS = [
  { id: 'maze', name: 'Labirent', color: '#3fa45a', glow: '#9cf0a8', enter: 'Labirente gir' },
  { id: 'sky', name: 'Gökyüzü Parkuru', color: '#4dabf7', glow: '#bfe9ff', enter: 'Gökyüzü Parkuruna gir' },
  { id: 'candy', name: 'Şeker Diyarı', color: '#f783ac', glow: '#ffd1e8', enter: "Şeker Diyarı'na gir" },
] as const;
/** Binaların içi (adadaki kapılardan girilir). */
export const INTERIORS = {
  okul: 'Okul', hastane: 'Hastane', market: 'Market', kutuphane: 'Kütüphane', pastane: 'Pastane', itfaiye: 'İtfaiye',
} as const;
export type InteriorId = keyof typeof INTERIORS;
export type RealmId = (typeof REALMS)[number]['id'] | 'mars' | InteriorId;
/** Dünyanın adı (macera kapıları, Mars, binalar). */
export const realmName = (id: RealmId): string => REALMS.find((r) => r.id === id)?.name ?? (id === 'mars' ? 'Mars' : INTERIORS[id as InteriorId] ?? id);

export function buildPortals(b: WorldBuilder, enter: (id: RealmId) => void) {
  const P = zone('portal');
  b.keepOut.push({ x: P.x, z: P.z, r: 30 });
  const plaza = mesh(new THREE.CylinderGeometry(20, 20.5, 0.25, 48), toon('#e9e1f7'), false);
  b.place(plaza, P.x, P.z, 0, 0.03);
  b.place(sign('Macera Kapıları', '#e9d5ff'), P.x + 14, P.z + 6, Math.PI / 2);
  REALMS.forEach((r, i) => {
    const a = Math.PI + (i - 1) * 0.75;
    const x = P.x + Math.cos(a) * 12, z = P.z + Math.sin(a) * 12;
    const face = b.facing(x, z, P.x, P.z);
    const g = new THREE.Group();
    const ring = outline(mesh(new THREE.TorusGeometry(2.6, 0.45, 12, 32), toon(r.color)), 1.04);
    ring.position.y = 3.2;
    const disc = new THREE.Mesh(new THREE.CircleGeometry(2.3, 32), new THREE.MeshBasicMaterial({ color: r.glow, transparent: true, opacity: 0.85, side: THREE.DoubleSide }));
    disc.position.y = 3.2;
    const swirl = new THREE.Mesh(new THREE.RingGeometry(0.4, 2.1, 32, 1, 0, Math.PI * 1.3), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.6, side: THREE.DoubleSide }));
    swirl.position.set(0, 3.2, 0.02);
    for (const sx of [-2.6, 2.6]) {
      const pil = outline(mesh(new THREE.BoxGeometry(0.9, 1.2, 0.9), toon('#d8d0c0')), 1.04);
      pil.position.set(sx, 0.6, 0);
      g.add(pil);
    }
    g.add(ring, disc, swirl);
    b.place(g, x, z, face);
    const sg = sign(r.name, r.glow);
    b.place(sg, x - Math.sin(face) * 0.2, z - Math.cos(face) * 0.2, face, 4.4);
    b.block(x + Math.cos(face) * 2.6, z - Math.sin(face) * 2.6, 0.7);
    b.block(x - Math.cos(face) * 2.6, z + Math.sin(face) * 2.6, 0.7);
    b.tick((_dt, t) => {
      swirl.rotation.z = -t * 2;
      (disc.material as THREE.MeshBasicMaterial).opacity = 0.7 + Math.sin(t * 3 + i) * 0.15;
      if (Math.floor(t * 3) !== Math.floor((t - 0.016) * 3)) b.sparkles.burst(new THREE.Vector3(x, b.h(x, z) + 3.2, z), 2, r.glow);
    });
    const sx = x + Math.sin(face) * 2.4, sz = z + Math.cos(face) * 2.4;
    b.spot({
      id: `portal:${r.id}`, x: sx, z: sz, r: 3, label: r.enter,
      act: {
        dur: 1.1, pose: 'walk', quest: `portal`,
        step: (_t, u, a) => {
          a.pos.set(sx + (x - sx) * u, b.h(x, z), sz + (z - sz) * u);
          a.heading = b.facing(sx, sz, x, z);
        },
        end: () => {
          enter(r.id);
        },
      },
    });
  });
}

// ------------------------------------------------------------------------------------------------
// Kasabada Butik ve Oyun Çadırı
// ------------------------------------------------------------------------------------------------
export function buildShops(b: WorldBuilder) {
  // Butik: pembe tenteli küçük dükkân, vitrinde elbise
  {
    const x = -2, z = 27;
    const ang = b.facing(x, z, 0, 0);
    const g = house('#ffd1e8', 0.75, '#e9487d');
    for (let i = 0; i < 6; i++) {
      const s = mesh(new THREE.BoxGeometry(1, 0.12, 2.2), toon(i % 2 ? '#ffffff' : '#ff8fb1'));
      s.position.set(-2.5 + i, 3.7, 3.4);
      s.rotation.x = 0.3;
      g.add(s);
    }
    const dress = new THREE.Group();
    const skirt = outline(mesh(new THREE.ConeGeometry(0.55, 1.1, 12), toon('#9b6bff')), 1.06);
    skirt.position.y = 0.9;
    const top = outline(mesh(new THREE.CylinderGeometry(0.25, 0.32, 0.6, 10), toon('#9b6bff')), 1.06);
    top.position.y = 1.7;
    const pole = mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.2, 6), toon('#5b5f6b'));
    pole.position.y = 1.1;
    dress.add(pole, skirt, top);
    dress.position.set(2.6, 0, 3.6);
    g.add(dress);
    b.place(g, x, z, ang);
    b.block(x, z, 3.6);
    b.place(sign('Butik', '#ffd1e8'), x + Math.sin(ang) * 4.4 - Math.cos(ang) * 2.6, z + Math.cos(ang) * 4.4 + Math.sin(ang) * 2.6, ang);
    b.spot({ id: 'boutique', x: x + Math.sin(ang) * 4.2, z: z + Math.cos(ang) * 4.2, r: 3, label: 'Butik: kıyafetler', page: true });
  }
  // Oyun Çadırı: çizgili sirk çadırı ve bayrak
  {
    const x = 24, z = 22;
    const ang = b.facing(x, z, 0, 0);
    const g = new THREE.Group();
    const cols = ['#ef4b4b', '#ffffff'];
    for (let i = 0; i < 12; i++) {
      const seg = mesh(new THREE.CylinderGeometry(3.6, 3.6, 2.6, 2, 1, true, (i / 12) * Math.PI * 2, Math.PI / 6), toon(cols[i % 2]));
      (seg.material as THREE.Material).side = THREE.DoubleSide;
      seg.position.y = 1.3;
      g.add(seg);
      const roof = mesh(new THREE.ConeGeometry(4.0, 2.6, 2, 1, true, (i / 12) * Math.PI * 2, Math.PI / 6), toon(cols[(i + 1) % 2]));
      (roof.material as THREE.Material).side = THREE.DoubleSide;
      roof.position.y = 3.9;
      g.add(roof);
    }
    const door = mesh(new THREE.PlaneGeometry(1.8, 2.1), toon('#3a2b27'), false);
    door.position.set(0, 1.05, 3.62);
    const flagPole = mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.6, 6), toon('#5b5f6b'));
    flagPole.position.y = 5.9;
    const flag = mesh(new THREE.BoxGeometry(0.9, 0.5, 0.05), toon('#ffc83d'));
    flag.position.set(0.45, 6.4, 0);
    g.add(door, flagPole, flag);
    b.place(g, x, z, ang);
    b.block(x, z, 3.8);
    b.tick((_dt, t) => (flag.rotation.y = Math.sin(t * 3) * 0.3));
    b.place(sign('Oyun Çadırı', '#fff1c7'), x + Math.sin(ang) * 5 + Math.cos(ang) * 3, z + Math.cos(ang) * 5 - Math.sin(ang) * 3, ang);
    b.spot({ id: 'games', x: x + Math.sin(ang) * 4.6, z: z + Math.cos(ang) * 4.6, r: 3, label: 'Mini oyun oyna', page: true });
  }
}
