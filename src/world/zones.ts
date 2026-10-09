/**
 * Çizio Adası'nın bölgeleri ve etkinlikleri.
 *
 * Her bölge `WorldBuilder` üzerinden nesnelerini yerleştirir, engellerini (daire), yürünebilir zeminlerini (iskele, ada),
 * etkinlik noktalarını, araçlarını ve sürekli canlandırmalarını (dönme dolap döner, ördekler yüzer…) kaydeder.
 * Etkinlik: kısa bir sahne (`step` her kare kahramanı yerleştirir); araç: joystick ile sürülür (jet ski, kuğu tekne).
 */
import * as THREE from 'three';
import { cloud, mesh, outline, Sparkles, star, toon, tree } from '../play3d/kit';
import type { Pose } from './avatar3d';
import { heightAt, isWater, LAKE, SNOW_PEAK, VOLCANO, zone } from './layout';
import type { BlockGrid } from './terrain';

export interface Actor {
  pos: THREE.Vector3;
  heading: number;
  hand: THREE.Group;
}

export interface Activity {
  dur: number;
  pose: Pose | ((u: number) => Pose);
  /** Kamera: [uzaklık, yükseklik]. */
  cam?: [number, number];
  /** Su altı görünümü (şnorkel). */
  underwater?: boolean;
  start?(a: Actor): void;
  step(t: number, u: number, a: Actor, dt: number): void;
  /** Bitince söylenen kısa mesaj. */
  end?(a: Actor): string | void;
  /** Hangi görevi tamamlar (yoksa etkinlik kimliği). */
  quest?: string;
}

export interface Vehicle {
  model: THREE.Object3D;
  pos: THREE.Vector3;
  heading: number;
  speed: number;
  water: boolean;
  seatY: number;
}

export interface SpotDef {
  id: string;
  x: number;
  z: number;
  r: number;
  label: string;
  act?: Activity;
  vehicle?: Vehicle;
  /** React tarafında açılır (ev, galeri, Çizio). */
  page?: boolean;
  /** Duruma göre değişen düğme yazısı (null: düğme gösterilmez). */
  dyn?: () => string | null;
  /** Duruma göre ne yapılacağı: bir etkinlik, React sayfası ya da yalnızca mesaj. */
  use?: () => Activity | 'page' | { msg: string } | null;
}

export interface Deck { x: number; z: number; r?: number; w?: number; d?: number; y: number }

export interface Wanderer { obj: THREE.Object3D; pos: THREE.Vector3; target: THREE.Vector3; home: [number, number]; range: number; speed: number; wait: number; hop: number; card: boolean; facing: number; water?: boolean; y?: number }

type Tick = (dt: number, t: number, a: Actor) => void;

const sm = (u: number) => u * u * (3 - 2 * u);

export class WorldBuilder {
  spots: SpotDef[] = [];
  ticks: Tick[] = [];
  decks: Deck[] = [];
  cards: THREE.Object3D[] = [];
  wanderers: Wanderer[] = [];
  keepOut: { x: number; z: number; r: number }[] = [];
  starSpots: [number, number][] = [];
  ball!: THREE.Mesh;
  musicTiles: { x: number; z: number; note: number; mesh: THREE.Mesh }[] = [];
  /** Su altı süsleri (şnorkelde görünür). */
  reef = new THREE.Group();

  constructor(
    public scene: THREE.Scene,
    public grid: BlockGrid,
    public sparkles: Sparkles,
    public tex: Record<string, HTMLCanvasElement>,
    public art: HTMLCanvasElement[],
    /** Pasif görev bitti (gol, müzik…) ve kısa mesaj. */
    public done: (quest: string, msg?: string) => void,
    public sound: { note: (i: number) => void; kick: () => void; pop: () => void; star: (i: number) => void },
  ) {}

  /** Zemin yüksekliği (iskele / ada güvertesi dahil). */
  ground(x: number, z: number) {
    for (const d of this.decks) {
      const on = d.r ? Math.hypot(x - d.x, z - d.z) < d.r : Math.abs(x - d.x) < d.w! / 2 && Math.abs(z - d.z) < d.d! / 2;
      if (on) return d.y;
    }
    return heightAt(x, z);
  }
  h(x: number, z: number) {
    return Math.max(0, this.ground(x, z));
  }
  place<T extends THREE.Object3D>(o: T, x: number, z: number, rot = 0, dy = 0): T {
    o.position.set(x, this.h(x, z) + dy, z);
    o.rotation.y = rot;
    this.scene.add(o);
    return o;
  }
  block(x: number, z: number, r: number) {
    this.grid.add({ x, z, r });
  }
  spot(s: SpotDef) {
    this.spots.push(s);
  }
  tick(f: Tick) {
    this.ticks.push(f);
  }
  /** Ders çiziminden kâğıt kart (hayvanlar, dinozorlar…), kameraya döner. */
  card(key: string, size: number) {
    const c = this.tex[key];
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.06, side: THREE.DoubleSide }));
    m.geometry.translate(0, size / 2, 0);
    this.cards.push(m);
    return m;
  }
  wander(obj: THREE.Object3D, x: number, z: number, range: number, speed = 1.6, card = true, water = false) {
    const pos = new THREE.Vector3(x, 0, z);
    this.scene.add(obj);
    this.wanderers.push({ obj, pos, target: pos.clone(), home: [x, z], range, speed, wait: Math.random() * 3, hop: Math.random() * 6, card, facing: 1, water });
  }
  /** Bir açıdaki kıyı noktası (kara ile suyun buluştuğu yarıçap). */
  shore(ang: number) {
    let lo = 150, hi = 320;
    for (let i = 0; i < 30; i++) {
      const m = (lo + hi) / 2;
      if (heightAt(Math.cos(ang) * m, Math.sin(ang) * m) > 0) lo = m;
      else hi = m;
    }
    return lo;
  }
  polar(ang: number, r: number): [number, number] {
    return [Math.cos(ang) * r, Math.sin(ang) * r];
  }
  facing(x: number, z: number, tx: number, tz: number) {
    return Math.atan2(tx - x, tz - z);
  }
}

// ================================================================================================
// Ortak modeller
// ================================================================================================
export function house(color: string, s = 1, roof = '#e05a4f') {
  const g = new THREE.Group();
  const body = outline(mesh(new THREE.BoxGeometry(7, 4.5, 6), toon(color)), 1.02);
  body.position.y = 2.25;
  const r = outline(mesh(new THREE.ConeGeometry(5.6, 3, 4), toon(roof)), 1.03);
  r.position.y = 6;
  r.rotation.y = Math.PI / 4;
  const door = mesh(new THREE.BoxGeometry(1.4, 2.4, 0.15), toon('#9b6b43'), false);
  door.position.set(0, 1.2, 3.05);
  g.add(body, r, door);
  for (const wx of [-2.2, 2.2]) {
    const w = mesh(new THREE.BoxGeometry(1.3, 1.1, 0.12), toon('#fff6c9', { emissive: '#3a3000' }), false);
    w.position.set(wx, 2.8, 3.05);
    g.add(w);
  }
  g.scale.setScalar(s);
  return g;
}

export function sign(text: string, color = '#ffffff') {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 160;
  const x = c.getContext('2d')!;
  x.fillStyle = color;
  x.fillRect(0, 0, 512, 160);
  x.strokeStyle = '#3a2b27';
  x.lineWidth = 12;
  x.strokeRect(6, 6, 500, 148);
  x.fillStyle = '#3a2b27';
  x.font = '600 64px Fredoka, Nunito, sans-serif';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillText(text, 256, 84);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const g = new THREE.Group();
  // iki yüzlü tabela: arkadan da düz okunur
  const mat = new THREE.MeshBasicMaterial({ map: t });
  for (const r of [0, Math.PI]) {
    const board = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.1), mat);
    board.position.set(0, 2.4, r ? -0.02 : 0.02);
    board.rotation.y = r;
    g.add(board);
  }
  const post = mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.4, 6), toon('#9b6b43'));
  post.position.y = 1.2;
  g.add(post);
  return g;
}

function coneModel(s = 1) {
  const g = new THREE.Group();
  const cone = outline(mesh(new THREE.ConeGeometry(0.22 * s, 0.6 * s, 10), toon('#e2a868')), 1.06);
  cone.rotation.x = Math.PI;
  const top = outline(mesh(new THREE.SphereGeometry(0.26 * s, 12, 10), toon(['#ff8fb1', '#fff1c7', '#9be7de'][Math.floor(Math.random() * 3)])), 1.06);
  top.position.y = 0.38 * s;
  g.add(cone, top);
  return g;
}

function boatModel(color = '#ff6b4a') {
  const g = new THREE.Group();
  const hull = outline(mesh(new THREE.BoxGeometry(2.4, 0.9, 4.4), toon(color)), 1.03);
  hull.position.y = 0.1;
  const rim = mesh(new THREE.BoxGeometry(2.5, 0.15, 4.5), toon('#ffffff'));
  rim.position.y = 0.6;
  const mast = mesh(new THREE.CylinderGeometry(0.07, 0.07, 4, 6), toon('#9b6b43'));
  mast.position.y = 2.6;
  const sail = mesh(new THREE.ConeGeometry(1.5, 3.2, 3), toon('#ffffff'));
  sail.position.set(0, 2.8, 0.5);
  sail.scale.z = 0.12;
  g.add(hull, rim, mast, sail);
  return g;
}

/** X işareti ve sandık: kazınca açılır. */
function treasure(b: WorldBuilder, id: string, x: number, z: number, taken: string[]) {
  const done = taken.includes(id);
  const mark = new THREE.Group();
  for (const r of [0.6, -0.6]) {
    const bar = mesh(new THREE.BoxGeometry(1.6, 0.05, 0.28), toon('#e05a4f'), false);
    bar.rotation.y = r * 1.3;
    mark.add(bar);
  }
  b.place(mark, x, z, 0, 0.05);
  const chest = new THREE.Group();
  const box = outline(mesh(new THREE.BoxGeometry(1, 0.6, 0.7), toon('#c98a4b')), 1.05);
  box.position.y = 0.3;
  const lid = outline(mesh(new THREE.CylinderGeometry(0.35, 0.35, 1, 10, 1, false, 0, Math.PI), toon('#e2a868')), 1.05);
  lid.rotation.z = Math.PI / 2;
  lid.position.y = 0.6;
  chest.add(box, lid);
  b.place(chest, x, z);
  mark.visible = !done;
  chest.visible = done;
  let dug = done;
  b.spot({
    id, x, z, r: 2, label: 'Hazineyi kaz',
    act: {
      dur: 2.4, pose: 'dig', quest: 'treasure',
      step(t, _u, a) {
        if (dug) return;
        a.pos.set(x - 0.9, b.h(x, z), z);
        a.heading = Math.PI / 2;
        if (Math.floor(t * 5) !== Math.floor((t - 0.02) * 5)) b.sparkles.burst(new THREE.Vector3(x, b.h(x, z) + 0.4, z), 3, '#f3dca2');
      },
      end() {
        if (dug) return;
        dug = true;
        mark.visible = false;
        chest.visible = true;
        b.sparkles.burst(new THREE.Vector3(x, b.h(x, z) + 1, z), 18);
        b.done(`star:${id}`);
        return 'Hazine! Bir yıldız buldun!';
      },
    },
  });
}

// ================================================================================================
// Bölgeler
// ================================================================================================
export function buildZones(b: WorldBuilder, taken: string[]) {
  buildTown(b);
  buildFun(b);
  buildLake(b, taken);
  buildBeach(b, taken);
  buildForest(b);
  buildFarm(b);
  buildSnow(b);
  buildDino(b);
  buildCastle(b);
  buildLighthouse(b);
  buildRocket(b);
}

// ------------------------------------------------------------------------------------------------
function buildTown(b: WorldBuilder) {
  const T = zone('town');
  b.keepOut.push({ x: T.x, z: T.z, r: 46 });
  // meydan ve çeşme
  const plaza = mesh(new THREE.CylinderGeometry(9, 9.2, 0.2, 40), toon('#efe2c4'), false);
  b.place(plaza, 0, 0, 0, 0.02);
  const pool = outline(mesh(new THREE.CylinderGeometry(2.8, 3, 0.8, 24), toon('#d8d0c0')), 1.03);
  b.place(pool, 0, 0, 0, 0.4);
  const water = mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.1, 24), toon('#7ee0ff'), false);
  b.place(water, 0, 0, 0, 0.78);
  const col = mesh(new THREE.CylinderGeometry(0.3, 0.4, 2, 10), toon('#d8d0c0'));
  b.place(col, 0, 0, 0, 1.6);
  b.block(0, 0, 3.4);
  // fıskiye damlaları
  b.tick((_dt, t) => {
    if (Math.floor(t * 4) !== Math.floor((t - 0.016) * 4)) b.sparkles.burst(new THREE.Vector3(0, b.h(0, 0) + 3, 0), 2, '#7ee0ff');
  });
  // evler: halka şeklinde
  const homeAt: [number, number] = [-26, -20];
  const cols = ['#9be7de', '#ffb3c7', '#b39ddb', '#ffd166', '#c5e1a5', '#ffcc80'];
  const ring: [number, number][] = [[-38, 4], [-14, -40], [16, -42], [40, -6], [-34, 30], [30, 34]];
  for (const [i, [x, z]] of ring.entries()) {
    b.place(house(cols[i % cols.length], 0.85), x, z, b.facing(x, z, 0, 0));
    b.block(x, z, 4);
  }
  b.place(house('#ffd166'), ...homeAt, b.facing(...homeAt, 0, 0));
  b.block(...homeAt, 4.6);
  b.spot({ id: 'home', x: -21.8, z: -16.8, r: 3.2, label: 'Kıyafetimi değiştir', page: true });
  b.place(sign('Evim', '#fff1c7'), -20, -14, b.facing(-20, -14, 0, 0));
  // sanat galerisi
  const gx = 26, gz = -20;
  const g = new THREE.Group();
  const floor = mesh(new THREE.BoxGeometry(10, 0.3, 7), toon('#f4efe6'), false);
  floor.position.y = 0.15;
  const back = outline(mesh(new THREE.BoxGeometry(10, 5, 0.4), toon('#b39ddb')), 1.01);
  back.position.set(0, 2.5, -3.3);
  g.add(floor, back);
  for (let i = 0; i < 4; i++) {
    const beam = mesh(new THREE.BoxGeometry(0.3, 0.3, 7.4), toon('#7c5cff'));
    beam.position.set(-4.5 + i * 3, 5.1, 0);
    g.add(beam);
  }
  const arts = b.art.slice(0, 5);
  arts.forEach((cv, i) => {
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    const ex = arts.length === 1 ? 0 : -3.6 + i * (7.2 / (arts.length - 1));
    const frame = outline(mesh(new THREE.BoxGeometry(1.7, 1.7, 0.12), toon('#c98a4b')), 1.03);
    const pic = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), new THREE.MeshBasicMaterial({ map: tex }));
    pic.position.z = 0.07;
    frame.add(pic);
    frame.position.set(ex, 2.4, -1);
    frame.rotation.x = -0.12;
    const leg = mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.4, 5), toon('#9b6b43'));
    leg.position.set(ex, 1.2, -0.9);
    g.add(frame, leg);
  });
  b.place(g, gx, gz, b.facing(gx, gz, 0, 0));
  b.block(gx + 2.6, gz - 2, 3.5);
  b.spot({ id: 'gallery', x: 22.6, z: -17.2, r: 3.4, label: 'Resimlerime bak', page: true });
  // Çizio
  const npc = b.card('maskot', 2.6);
  b.place(npc, 6, 6);
  b.block(6, 6, 0.9);
  b.tick((_dt, t) => (npc.position.y = b.h(6, 6) + Math.sin(t * 2) * 0.12));
  b.spot({ id: 'cizio', x: 6, z: 6, r: 3.2, label: 'Çizio ile konuş', page: true });
  // dondurma arabası
  const ix = 13, iz = 15;
  const truck = new THREE.Group();
  const body = outline(mesh(new THREE.BoxGeometry(3.6, 2.2, 2), toon('#9be7de')), 1.03);
  body.position.y = 1.6;
  const roof = outline(mesh(new THREE.BoxGeometry(4, 0.3, 2.4), toon('#ff8fb1')), 1.03);
  roof.position.y = 3.6;
  const cone = coneModel(1.6);
  cone.position.y = 4.3;
  truck.add(body, roof, cone);
  for (const wx of [-1.1, 1.1]) {
    const w = mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.25, 12), toon('#3a2b27'));
    w.rotation.x = Math.PI / 2;
    w.position.set(wx, 0.42, 1.05);
    truck.add(w);
  }
  b.place(truck, ix, iz, b.facing(ix, iz, 0, 0));
  b.block(ix, iz, 2.4);
  b.spot({
    id: 'icecream', x: 10.6, z: 12.4, r: 2.4, label: 'Dondurma al',
    act: { dur: 1.4, pose: 'hold', step() {}, end: (a) => { const c = coneModel(1); c.position.set(0, -0.05, 0.12); c.name = 'held'; a.hand.add(c); return 'Afiyet olsun!'; } },
  });
  // müzik karoları
  const mz = -26;
  const tcols = ['#ff6b6b', '#ff9f43', '#ffd43b', '#69db7c', '#38d9a9', '#4dabf7', '#9775fa', '#f783ac'];
  tcols.forEach((c, i) => {
    const t = outline(mesh(new THREE.BoxGeometry(1.6, 0.2, 2.6), new THREE.MeshToonMaterial({ color: c, emissive: new THREE.Color('#000000') }), false), 1.02);
    const tx = -6.3 + i * 1.8;
    b.place(t, tx, mz, 0, 0.12);
    b.musicTiles.push({ x: tx, z: mz, note: i, mesh: t });
  });
  b.place(sign('Müzik', '#ffffff'), 0, mz - 3);
  // futbol stadyumu
  buildFootball(b, 52, 30);
  // çiçek bahçesi
  buildGarden(b, -40, -40);
  // fener direkleri ve bayraklar
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    const p = mesh(new THREE.CylinderGeometry(0.08, 0.1, 3.4, 6), toon('#5b5f6b'));
    const l = mesh(new THREE.SphereGeometry(0.3, 10, 8), toon('#fff6c9', { emissive: '#665500' }));
    b.place(p, Math.cos(a) * 10, Math.sin(a) * 10, 0, 1.7);
    b.place(l, Math.cos(a) * 10, Math.sin(a) * 10, 0, 3.5);
  }
  // yol tabelaları (bölgelere)
  for (const zid of ['fun', 'lake', 'beach', 'forest', 'farm', 'snow', 'dino', 'castle', 'rocket']) {
    const zn = zone(zid);
    const a = Math.atan2(zn.z, zn.x);
    const [x, z] = b.polar(a, 13.5);
    b.place(sign(zn.name, '#fff1c7'), x, z, b.facing(x, z, 0, 0) + Math.PI);
  }
}

function buildFootball(b: WorldBuilder, x: number, z: number) {
  const field = mesh(new THREE.PlaneGeometry(22, 13), toon('#6cc35a'), false);
  field.rotation.x = -Math.PI / 2;
  b.place(field, x, z, 0, 0.06);
  const lm = toon('#ffffff');
  for (const [lx, lz, w, d] of [[0, -6.5, 22, 0.15], [0, 6.5, 22, 0.15], [-11, 0, 0.15, 13], [11, 0, 0.15, 13], [0, 0, 0.15, 13]]) {
    const l = mesh(new THREE.BoxGeometry(w, 0.02, d), lm, false);
    b.place(l, x + lx, z + lz, 0, 0.08);
  }
  for (const side of [-1, 1]) {
    const goal = new THREE.Group();
    for (const gz of [-1.8, 1.8]) {
      const post = mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.9, 6), toon('#ffffff'));
      post.position.set(0, 0.95, gz);
      goal.add(post);
    }
    const bar = mesh(new THREE.CylinderGeometry(0.09, 0.09, 3.7, 6), toon('#ffffff'));
    bar.rotation.x = Math.PI / 2;
    bar.position.y = 1.9;
    const net = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.9), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.35, side: THREE.DoubleSide }));
    net.rotation.y = Math.PI / 2;
    net.position.set(side * 0.8, 0.95, 0);
    goal.add(bar, net);
    b.place(goal, x + side * 11, z);
  }
  // tribünler
  for (const sz of [-9, 9]) {
    for (let r = 0; r < 3; r++) {
      const st = mesh(new THREE.BoxGeometry(20, 0.5, 1.2), toon(['#5b8def', '#ffc83d', '#ff6b4a'][r]));
      b.place(st, x, z + sz + Math.sign(sz) * r * 1.2, 0, 0.25 + r * 0.5);
    }
    b.block(x - 6, z + sz + Math.sign(sz) * 1.2, 3);
    b.block(x + 6, z + sz + Math.sign(sz) * 1.2, 3);
    b.block(x, z + sz + Math.sign(sz) * 1.2, 3);
  }
  const ball = outline(mesh(new THREE.IcosahedronGeometry(0.42, 1), toon('#ffffff')), 1.06);
  ball.add(mesh(new THREE.IcosahedronGeometry(0.43, 0), new THREE.MeshToonMaterial({ color: '#3a2b27', wireframe: true }), false));
  b.place(ball, x, z, 0, 0.42);
  b.ball = ball;
  const vel = new THREE.Vector3();
  let cool = 0;
  b.tick((dt, _t, a) => {
    const p = ball.position;
    const dx = p.x - a.pos.x, dz = p.z - a.pos.z, d = Math.hypot(dx, dz);
    if (d < 1.2 && Math.abs(a.pos.y - p.y) < 1.5) {
      vel.set((dx / (d || 1)) * 12, 0, (dz / (d || 1)) * 12);
      b.sound.kick();
    }
    p.addScaledVector(vel, dt);
    vel.multiplyScalar(Math.pow(0.35, dt));
    ball.rotation.x += vel.z * dt * 2;
    ball.rotation.z -= vel.x * dt * 2;
    cool -= dt;
    if (Math.abs(p.z - z) < 1.7 && Math.abs(p.x - x) > 11 && cool <= 0) {
      cool = 2;
      b.sparkles.burst(p.clone().setY(1.4), 24);
      b.done('goal', 'Gooool!');
      setTimeout(() => {
        p.set(x, b.h(x, z) + 0.42, z);
        vel.set(0, 0, 0);
      }, 900);
    }
    if (Math.abs(p.z - z) > 6.3) {
      p.z = z + Math.sign(p.z - z) * 6.3;
      vel.z *= -0.7;
    }
    if (Math.abs(p.x - x) > 11.2 && Math.abs(p.z - z) >= 1.7) {
      p.x = x + Math.sign(p.x - x) * 11.2;
      vel.x *= -0.7;
    }
    if (Math.abs(p.x - x) > 12.5) p.x = x + Math.sign(p.x - x) * 12.5;
  });
}

function buildGarden(b: WorldBuilder, x: number, z: number) {
  const cols = ['#ff6b8a', '#ffc83d', '#ffffff', '#b98cff', '#ff8a65'];
  const flowers: THREE.Object3D[] = [];
  for (let r = 0; r < 3; r++) {
    const bed = mesh(new THREE.BoxGeometry(8, 0.4, 1.6), toon('#9b6b43'), false);
    b.place(bed, x, z - 3 + r * 3, 0, 0.2);
    for (let i = 0; i < 7; i++) {
      const f = new THREE.Group();
      const stem = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.8, 5), toon('#3f9a4a'), false);
      stem.position.y = 0.4;
      const head = mesh(new THREE.SphereGeometry(0.28, 10, 8), toon(cols[(i + r) % cols.length]), false);
      head.position.y = 0.85;
      f.add(stem, head);
      b.place(f, x - 3.3 + i * 1.1, z - 3 + r * 3, 0, 0.4);
      f.scale.setScalar(0.6);
      flowers.push(f);
    }
  }
  b.block(x, z, 4.6);
  const can = new THREE.Group();
  can.add(outline(mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.45, 10), toon('#5b8def')), 1.06));
  b.spot({
    id: 'flowers', x: x + 4.6, z: z + 4.6, r: 2.8, label: 'Çiçekleri sula',
    act: {
      dur: 4, pose: 'hold',
      start: (a) => a.hand.add(can),
      step(t, _u, a) {
        a.heading = b.facing(a.pos.x, a.pos.z, x, z);
        if (Math.floor(t * 6) !== Math.floor((t - 0.02) * 6)) {
          const f = flowers[Math.floor(Math.random() * flowers.length)];
          b.sparkles.burst(f.position.clone().setY(f.position.y + 0.8), 3, '#7ee0ff');
        }
        for (const f of flowers) f.scale.setScalar(Math.min(1.25, f.scale.x + 0.003));
      },
      end: () => { can.removeFromParent(); return 'Çiçekler büyüdü!'; },
    },
  });
}

// ------------------------------------------------------------------------------------------------
function buildFun(b: WorldBuilder) {
  const F = zone('fun');
  b.keepOut.push({ x: F.x, z: F.z, r: 52 });
  const gate = new THREE.Group();
  for (const sx of [-4, 4]) {
    const p = outline(mesh(new THREE.CylinderGeometry(0.4, 0.5, 5, 10), toon('#e9487d')), 1.04);
    p.position.set(sx, 2.5, 0);
    gate.add(p);
  }
  const arch = outline(mesh(new THREE.TorusGeometry(4, 0.4, 8, 20, Math.PI), toon('#ffc83d')), 1.04);
  arch.position.y = 5;
  gate.add(arch);
  b.place(gate, F.x - 22, F.z + 18, b.facing(F.x - 22, F.z + 18, 0, 0));
  b.place(sign('Lunapark', '#ffd1e0'), F.x - 26, F.z + 22, b.facing(F.x - 26, F.z + 22, 0, 0));

  // dönme dolap
  {
    const x = F.x + 14, z = F.z - 14, R = 8;
    const g = new THREE.Group();
    for (const sz of [-1.3, 1.3]) for (const sx of [-1, 1]) {
      const l = mesh(new THREE.CylinderGeometry(0.24, 0.3, 10.4, 8), toon('#7c5cff'));
      l.position.set(sx * 2.7, 5, sz);
      l.rotation.z = sx * 0.26;
      g.add(l);
    }
    const wheel = new THREE.Group();
    for (const sz of [-0.9, 0.9]) {
      const rim = mesh(new THREE.TorusGeometry(R, 0.15, 6, 48), toon('#ff8fb1'));
      rim.position.z = sz;
      wheel.add(rim);
    }
    const cabins: THREE.Group[] = [];
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const spoke = mesh(new THREE.CylinderGeometry(0.06, 0.06, R, 5), toon('#ffffff'), false);
      spoke.position.set((Math.cos(a) * R) / 2, (Math.sin(a) * R) / 2, 0);
      spoke.rotation.z = a - Math.PI / 2;
      wheel.add(spoke);
      const cab = new THREE.Group();
      const box = outline(mesh(new THREE.BoxGeometry(1.5, 1.2, 1.5), toon(['#ffc83d', '#14a89a', '#ff6b4a', '#5b8def', '#e9487d'][i % 5])), 1.04);
      box.position.y = -1;
      cab.add(box);
      cab.position.set(Math.cos(a) * R, Math.sin(a) * R, 0);
      wheel.add(cab);
      cabins.push(cab);
    }
    wheel.position.y = 10;
    g.add(wheel);
    b.place(g, x, z, b.facing(x, z, F.x, F.z) + Math.PI / 2);
    b.block(x, z, 3.2);
    b.tick((dt) => {
      wheel.rotation.z += dt * 0.2;
      for (const c of cabins) c.rotation.z = -wheel.rotation.z;
    });
    const p = new THREE.Vector3();
    b.spot({
      id: 'ferris', x: x - 4, z: z + 4, r: 3, label: 'Dönme dolaba bin',
      act: { dur: 16, pose: 'sit', cam: [30, 14], step(_t, _u, a) { cabins[0].getWorldPosition(p); a.pos.set(p.x, p.y - 1.5, p.z); } },
    });
  }
  // atlıkarınca
  {
    const x = F.x - 14, z = F.z + 4;
    const base = outline(mesh(new THREE.CylinderGeometry(5, 5.2, 0.5, 24), toon('#fff1c7')), 1.02);
    b.place(base, x, z, 0, 0.25);
    const top = new THREE.Group();
    const roof = outline(mesh(new THREE.ConeGeometry(5.6, 2.2, 16), toon('#e9487d')), 1.03);
    roof.position.y = 5.8;
    const pole = mesh(new THREE.CylinderGeometry(0.35, 0.35, 5.4, 10), toon('#ffc83d'));
    pole.position.y = 2.7;
    top.add(roof, pole);
    const horses: THREE.Object3D[] = [];
    const hc = ['#ffffff', '#ffb3c7', '#9be7de', '#ffd166', '#b39ddb', '#ffffff'];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const h = new THREE.Group();
      const rod = mesh(new THREE.CylinderGeometry(0.05, 0.05, 4.2, 5), toon('#e0c070'), false);
      rod.position.y = 2.6;
      const body = outline(mesh(new THREE.CapsuleGeometry(0.42, 1.2, 4, 8), toon(hc[i])), 1.06);
      body.rotation.x = Math.PI / 2;
      body.position.y = 1.6;
      const head = outline(mesh(new THREE.BoxGeometry(0.38, 0.9, 0.42), toon(hc[i])), 1.06);
      head.position.set(0, 2.1, 0.85);
      head.rotation.x = 0.35;
      h.add(rod, body, head);
      h.position.set(Math.cos(a) * 3.4, 0.5, Math.sin(a) * 3.4);
      h.rotation.y = -a;
      top.add(h);
      horses.push(h);
    }
    b.place(top, x, z);
    b.block(x, z, 5);
    b.tick((dt, t) => {
      top.rotation.y += dt * 0.6;
      horses.forEach((h, i) => (h.position.y = 0.5 + Math.sin(t * 3 + i) * 0.3));
    });
    const p = new THREE.Vector3();
    b.spot({
      id: 'carousel', x: x + 6.4, z: z + 2, r: 2.6, label: 'Atlıkarıncaya bin',
      act: {
        dur: 12, pose: 'sit', cam: [11, 3],
        step(_t, _u, a) {
          horses[0].getWorldPosition(p);
          a.pos.set(p.x, p.y + 0.9, p.z);
          a.heading = top.rotation.y + Math.PI;
        },
      },
    });
  }
  // trambolin
  {
    const x = F.x + 16, z = F.z + 14;
    const ring = outline(mesh(new THREE.TorusGeometry(2.4, 0.22, 8, 32), toon('#5b8def')), 1.04);
    ring.rotation.x = Math.PI / 2;
    b.place(ring, x, z, 0, 0.9);
    const mat = mesh(new THREE.CircleGeometry(2.3, 32), toon('#3a2b27'), false);
    mat.rotation.x = -Math.PI / 2;
    b.place(mat, x, z, 0, 0.85);
    b.block(x, z, 2.5);
    const g0 = b.h(x, z);
    b.spot({
      id: 'trampoline', x, z: z + 3.6, r: 2.2, label: 'Tramboline zıpla',
      act: {
        dur: 6, pose: 'jump', cam: [16, 8],
        step(t, _u, a) {
          const hop = Math.abs(Math.sin(t * 2.4));
          a.pos.set(x, g0 + 0.85 + hop * 5, z);
          mat.position.y = g0 + 0.85 - (hop < 0.15 ? (0.15 - hop) * 2 : 0);
          a.heading += 0.08;
        },
      },
    });
  }
  // hız treni
  {
    const pts: THREE.Vector3[] = [];
    const n = 16;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = 26 + 8 * Math.sin(a * 3);
      const y = 3 + 6 * (Math.sin(a * 2) + 1) + (i === 4 ? 6 : 0);
      pts.push(new THREE.Vector3(F.x + Math.cos(a) * r, b.h(F.x, F.z) + y, F.z + Math.sin(a) * r * 0.8));
    }
    const curve = new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.5);
    for (const off of [-0.45, 0.45]) {
      const shifted = new THREE.CatmullRomCurve3(curve.getSpacedPoints(160).map((p, i, arr) => {
        const t = arr[(i + 1) % arr.length].clone().sub(p).normalize();
        return p.clone().add(new THREE.Vector3(-t.z, 0, t.x).multiplyScalar(off));
      }), true);
      const rail = mesh(new THREE.TubeGeometry(shifted, 320, 0.1, 6, true), toon('#ff6b4a'));
      b.scene.add(rail);
    }
    curve.getSpacedPoints(40).forEach((p) => {
      const gh = b.h(p.x, p.z);
      const post = mesh(new THREE.CylinderGeometry(0.12, 0.12, p.y - gh, 6), toon('#ffc83d'));
      post.position.set(p.x, gh + (p.y - gh) / 2, p.z);
      b.scene.add(post);
      b.block(p.x, p.z, 0.4);
    });
    const cart = new THREE.Group();
    const cb = outline(mesh(new THREE.BoxGeometry(1.4, 0.8, 2), toon('#5b8def')), 1.04);
    cb.position.y = 0.5;
    cart.add(cb);
    b.scene.add(cart);
    const placeCart = (u: number) => {
      const p = curve.getPointAt(u), t = curve.getTangentAt(u);
      cart.position.copy(p);
      cart.lookAt(p.clone().add(t));
      return { p, t };
    };
    placeCart(0);
    const s0 = curve.getPointAt(0);
    b.spot({
      id: 'coaster', x: s0.x - 3, z: s0.z, r: 3, label: 'Hız trenine bin',
      act: {
        dur: 18, pose: (u) => (u > 0.1 && u < 0.9 ? 'cheer' : 'sit'), cam: [12, 5],
        step(_t, u, a) {
          const { p, t } = placeCart(sm(u));
          a.pos.set(p.x, p.y + 0.6, p.z);
          a.heading = Math.atan2(t.x, t.z);
        },
        end: () => { placeCart(0); return 'Vay! Çok hızlıydı!'; },
      },
    });
  }
  // oyun parkı: kaydırak ve salıncak
  {
    const px = F.x - 4, pz = F.z - 26;
    const slide = new THREE.Group();
    const tower = outline(mesh(new THREE.BoxGeometry(1.6, 0.2, 1.6), toon('#ff6b4a')), 1.04);
    tower.position.y = 3;
    slide.add(tower);
    for (const [lx, lz] of [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]]) {
      const leg = mesh(new THREE.CylinderGeometry(0.08, 0.08, 3, 6), toon('#5b8def'));
      leg.position.set(lx, 1.5, lz);
      slide.add(leg);
    }
    const ramp = outline(mesh(new THREE.BoxGeometry(1.2, 0.15, 5), toon('#ffc83d')), 1.03);
    ramp.position.set(0, 1.6, 3);
    ramp.rotation.x = 0.62;
    slide.add(ramp);
    b.place(slide, px, pz);
    b.block(px, pz, 1.4);
    const g0 = b.h(px, pz);
    b.spot({
      id: 'slide', x: px, z: pz - 2.4, r: 2.4, label: 'Kaydıraktan kay',
      act: {
        dur: 2.6, pose: (u) => (u < 0.4 ? 'climb' : 'cheer'),
        step(_t, u, a) {
          const top = new THREE.Vector3(px, g0 + 3.1, pz + 0.6), bottom = new THREE.Vector3(px, g0, pz + 5.4);
          if (u < 0.4) a.pos.lerpVectors(new THREE.Vector3(px, g0, pz - 1.4), top, u / 0.4);
          else a.pos.lerpVectors(top, bottom, ((u - 0.4) / 0.6) ** 2);
          a.heading = 0;
        },
      },
    });
    const sx = px + 8;
    const frame = new THREE.Group();
    for (const fx of [-1.6, 1.6]) for (const fz of [-0.5, 0.5]) {
      const leg = mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.6, 6), toon('#e9487d'));
      leg.position.set(fx, 1.7, fz);
      leg.rotation.x = fz * 0.5;
      frame.add(leg);
    }
    const bar = mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.4, 6), toon('#e9487d'));
    bar.rotation.z = Math.PI / 2;
    bar.position.y = 3.4;
    frame.add(bar);
    const seat = new THREE.Group();
    const sb = mesh(new THREE.BoxGeometry(1, 0.12, 0.6), toon('#14a89a'));
    sb.position.y = -2.4;
    seat.add(sb);
    for (const rx of [-0.45, 0.45]) {
      const rope = mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.4, 4), toon('#5a4636'), false);
      rope.position.set(rx, -1.2, 0);
      seat.add(rope);
    }
    seat.position.y = 3.4;
    frame.add(seat);
    b.place(frame, sx, pz);
    b.block(sx, pz, 1.3);
    b.spot({
      id: 'swing', x: sx, z: pz + 2.6, r: 2.4, label: 'Salıncakta sallan',
      act: {
        dur: 6, pose: 'sit',
        step(t, _u, a) {
          const ang = Math.sin(t * 2.6) * 0.75 * Math.min(1, t) * Math.min(1, (6 - t) * 1.5);
          seat.rotation.x = ang;
          a.pos.set(sx, g0 + 3.4 - Math.cos(ang) * 2.4 - 1.0, pz + Math.sin(ang) * 2.4);
          a.heading = 0;
        },
        end: () => void (seat.rotation.x = 0),
      },
    });
  }
  // dans pisti
  {
    const x = F.x + 2, z = F.z + 26;
    const base = outline(mesh(new THREE.CylinderGeometry(5, 5.2, 0.5, 8), toon('#3a2b27')), 1.01);
    b.place(base, x, z, 0, 0.25);
    const tiles: THREE.Mesh[] = [];
    const colors = ['#ff6b8a', '#ffc83d', '#14a89a', '#7c5cff', '#5b8def', '#ff8a65'];
    for (let ix = -2; ix <= 2; ix++) for (let iz = -2; iz <= 2; iz++) {
      if (Math.hypot(ix, iz) > 2.5) continue;
      const t = mesh(new THREE.BoxGeometry(1.5, 0.12, 1.5), new THREE.MeshToonMaterial({ color: colors[(ix + iz + 10) % colors.length], emissive: new THREE.Color('#000000') }), false);
      b.place(t, x + ix * 1.6, z + iz * 1.6, 0, 0.55);
      tiles.push(t);
    }
    b.decks.push({ x, z, r: 5, y: b.h(x, z) + 0.6 });
    b.spot({
      id: 'dance', x, z, r: 4.4, label: 'Dans et',
      act: {
        dur: 7, pose: 'dance',
        step(t, _u, a) {
          a.pos.set(x, b.h(x, z), z);
          a.heading = t * 1.4;
          const beat = Math.floor(t * 3);
          tiles.forEach((tl, i) => (tl.material as THREE.MeshToonMaterial).emissive.set((i + beat) % 3 === 0 ? '#665500' : '#000000'));
          if (Math.floor((t - 0.02) * 3) !== beat) {
            b.sound.star(beat % 6);
            if (beat % 2 === 0) b.sparkles.burst(new THREE.Vector3(x, b.h(x, z) + 3, z), 6);
          }
        },
        end: () => void tiles.forEach((tl) => (tl.material as THREE.MeshToonMaterial).emissive.set('#000000')),
      },
    });
  }
}

// ------------------------------------------------------------------------------------------------
function buildLake(b: WorldBuilder, taken: string[]) {
  // iskele (göle doğru) ve balık tutma
  const px0 = LAKE.x + LAKE.r + 4, pz = LAKE.z + 8;
  const len = 16;
  const pier = new THREE.Group();
  for (let i = 0; i < len; i++) {
    const plank = mesh(new THREE.BoxGeometry(1.1, 0.2, 3), toon(i % 2 ? '#b07d4f' : '#c08c5c'));
    plank.position.set(-i * 1.15, 0, 0);
    pier.add(plank);
  }
  pier.position.set(px0, 0.45, pz);
  b.scene.add(pier);
  b.decks.push({ x: px0 - (len * 1.15) / 2, z: pz, w: len * 1.15 + 1, d: 3, y: 0.5 });
  const fx = px0 - len * 1.15 + 1.5;
  const rod = new THREE.Group();
  const stick = mesh(new THREE.CylinderGeometry(0.035, 0.05, 2.6, 5), toon('#9b6b43'), false);
  stick.rotation.x = 1.1;
  stick.position.set(0, 0.5, 1.1);
  rod.add(stick);
  const FISH = ['Minik Balık', 'Neşeli Yunus', 'Denizatı', 'Yengeç', 'Deniz Yıldızı', 'Sevimli Ahtapot'];
  b.spot({
    id: 'fish', x: fx, z: pz, r: 2.2, label: 'Balık tut',
    act: {
      dur: 5, pose: 'fish',
      start: (a) => a.hand.add(rod),
      step(_t, _u, a) {
        a.pos.set(fx, 0.5, pz);
        a.heading = -Math.PI / 2;
      },
      end: () => {
        rod.removeFromParent();
        b.sparkles.burst(new THREE.Vector3(fx - 3, 0.5, pz), 16, '#7ee0ff');
        return `${FISH[Math.floor(Math.random() * FISH.length)]} yakaladın!`;
      },
    },
  });
  // kuğu tekne (sürülür)
  const swan = new THREE.Group();
  const hull = outline(mesh(new THREE.SphereGeometry(1.4, 16, 12), toon('#ffffff')), 1.04);
  hull.scale.set(1, 0.55, 1.4);
  const neck = outline(mesh(new THREE.CapsuleGeometry(0.25, 1.4, 4, 8), toon('#ffffff')), 1.06);
  neck.position.set(0, 1.3, 1.3);
  neck.rotation.x = -0.25;
  const head = outline(mesh(new THREE.SphereGeometry(0.35, 12, 10), toon('#ffffff')), 1.06);
  head.position.set(0, 2.1, 1.55);
  const beak = mesh(new THREE.ConeGeometry(0.12, 0.4, 8), toon('#ff9f43'));
  beak.rotation.x = Math.PI / 2;
  beak.position.set(0, 2.05, 1.95);
  swan.add(hull, neck, head, beak);
  swan.scale.setScalar(1.5);
  const sv: Vehicle = { model: swan, pos: new THREE.Vector3(px0 - 6, 0, pz + 5), heading: -Math.PI / 2, speed: 9, water: true, seatY: 0.6 };
  b.scene.add(swan);
  b.spot({ id: 'swan', x: sv.pos.x, z: sv.pos.z, r: 3.5, label: 'Kuğu tekneye bin', vehicle: sv });
  // su kaydırağı: kuzey kıyısında kule, kıvrımlı oluk göle iner
  const tx = LAKE.x, tz = LAKE.z - LAKE.r - 10;
  const g0 = b.h(tx, tz);
  const tower = outline(mesh(new THREE.CylinderGeometry(1.6, 1.9, 10, 12), toon('#14a89a')), 1.02);
  b.place(tower, tx, tz, 0, 5);
  const topDeck = outline(mesh(new THREE.CylinderGeometry(2.3, 2.3, 0.4, 12), toon('#ffc83d')), 1.03);
  b.place(topDeck, tx, tz, 0, 10.2);
  b.block(tx, tz, 2.2);
  const slidePts: THREE.Vector3[] = [];
  for (let i = 0; i <= 24; i++) {
    const u = i / 24;
    const a = u * Math.PI * 3;
    const r = 3.4 + u * 4;
    slidePts.push(new THREE.Vector3(tx + Math.sin(a) * r * (1 - u * 0.6), g0 + 10.4 - u * 10.6, tz + 2 + u * 30 + Math.cos(a) * r * 0.5 * (1 - u)));
  }
  const slideCurve = new THREE.CatmullRomCurve3(slidePts);
  const tube = mesh(new THREE.TubeGeometry(slideCurve, 120, 0.9, 10, false), toon('#ff8fb1', { transparent: true, opacity: 0.85 }));
  (tube.material as THREE.Material).side = THREE.DoubleSide;
  b.scene.add(tube);
  slideCurve.getSpacedPoints(10).forEach((p) => {
    const gh = Math.max(-2.5, b.ground(p.x, p.z));
    if (p.y - gh < 1) return;
    const post = mesh(new THREE.CylinderGeometry(0.15, 0.15, p.y - gh, 6), toon('#ffffff'));
    post.position.set(p.x, gh + (p.y - gh) / 2, p.z);
    b.scene.add(post);
  });
  b.spot({
    id: 'waterslide', x: tx, z: tz - 3.2, r: 2.6, label: 'Su kaydırağından kay',
    act: {
      dur: 7, pose: (u) => (u < 0.35 ? 'climb' : 'cheer'), cam: [16, 8],
      step(_t, u, a) {
        if (u < 0.35) {
          const k = u / 0.35;
          a.pos.set(tx + Math.sin(k * 6) * 2.2, g0 + k * 10.4, tz + Math.cos(k * 6) * 2.2);
        } else {
          const k = (u - 0.35) / 0.65;
          const p = slideCurve.getPointAt(k), t = slideCurve.getTangentAt(k);
          a.pos.set(p.x, p.y - 0.6, p.z);
          a.heading = Math.atan2(t.x, t.z);
        }
      },
      end: (a) => {
        b.sparkles.burst(a.pos.clone().setY(0.3), 26, '#7ee0ff');
        b.sound.pop();
        return 'Şıp! Göle düştün!';
      },
    },
  });
  // göl adacığı ve hazine
  const ix = LAKE.x - 4, iz = LAKE.z + 2;
  const isl = mesh(new THREE.CylinderGeometry(5, 6.5, 3.2, 20), toon('#f3dca2'), false);
  isl.position.set(ix, -1.0, iz);
  const top = mesh(new THREE.CylinderGeometry(3.6, 4.8, 0.5, 20), toon('#8fd16f'), false);
  top.position.set(ix, 0.55, iz);
  b.scene.add(isl, top);
  b.decks.push({ x: ix, z: iz, r: 5.4, y: 0.7 });
  const palm = new THREE.Group();
  const trunk = mesh(new THREE.CylinderGeometry(0.18, 0.28, 4.5, 6), toon('#b07d4f'));
  trunk.position.y = 2.2;
  trunk.rotation.z = 0.15;
  palm.add(trunk);
  for (let i = 0; i < 6; i++) {
    const leaf = mesh(new THREE.ConeGeometry(0.4, 2.6, 4), toon('#4caf50'));
    leaf.position.set(0.3, 4.4, 0);
    leaf.rotation.set(0, (i * Math.PI * 2) / 6, Math.PI / 2.3);
    palm.add(leaf);
  }
  palm.position.set(ix + 1.6, 0.7, iz - 1.4);
  b.scene.add(palm);
  b.block(ix + 1.6, iz - 1.4, 0.6);
  treasure(b, 't3', ix - 1.2, iz + 1.2, taken);
  // ördekler
  for (let i = 0; i < 6; i++) {
    const d = new THREE.Group();
    const body = outline(mesh(new THREE.SphereGeometry(0.4, 12, 10), toon(i === 0 ? '#ffffff' : '#ffd43b')), 1.06);
    body.scale.set(1, 0.75, 1.3);
    const hd = outline(mesh(new THREE.SphereGeometry(0.24, 10, 8), toon(i === 0 ? '#ffffff' : '#ffd43b')), 1.06);
    hd.position.set(0, 0.42, 0.42);
    const bk = mesh(new THREE.ConeGeometry(0.08, 0.22, 6), toon('#ff9f43'));
    bk.rotation.x = Math.PI / 2;
    bk.position.set(0, 0.4, 0.68);
    d.add(body, hd, bk);
    d.scale.setScalar(i === 0 ? 1.3 : 0.8);
    b.scene.add(d);
    const ph = i * 0.6;
    b.tick((_dt, t) => {
      const a = t * 0.12 + ph;
      const r = 20 + (i === 0 ? 0 : 1.5);
      d.position.set(LAKE.x + Math.cos(a) * r - i * 0.2, 0.05 + Math.sin(t * 3 + i) * 0.05, LAKE.z + Math.sin(a) * r);
      d.rotation.y = -a;
    });
  }
  b.place(sign('Göl', '#d4f3ee'), px0 + 3, pz - 4, -Math.PI / 2);
}

// ------------------------------------------------------------------------------------------------
function buildBeach(b: WorldBuilder, taken: string[]) {
  const A = Math.PI / 2; // güney kıyısı (+z)
  const sr = b.shore(A);
  const sand = (da: number, d: number): [number, number] => b.polar(A + da, sr - d);
  // şemsiyeler ve havlular
  const ucols = ['#ff6b4a', '#14a89a', '#ffc83d', '#e9487d', '#5b8def'];
  for (let i = 0; i < 10; i++) {
    const [x, z] = sand(-0.16 + i * 0.035, 7 + (i % 2) * 3);
    const u = new THREE.Group();
    const pole = mesh(new THREE.CylinderGeometry(0.06, 0.06, 3, 6), toon('#ffffff'));
    pole.position.y = 1.5;
    const top = outline(mesh(new THREE.ConeGeometry(1.8, 0.8, 12), toon(ucols[i % ucols.length])), 1.03);
    top.position.y = 3;
    const towel = mesh(new THREE.BoxGeometry(1.2, 0.04, 2.2), toon(ucols[(i + 2) % ucols.length]), false);
    towel.position.set(1.4, 0.05, 0);
    u.add(pole, top, towel);
    b.place(u, x, z, A + Math.PI);
    b.block(x, z, 0.4);
  }
  // kumdan kale
  {
    const [x, z] = sand(0.05, 9);
    const castle = new THREE.Group();
    const parts: THREE.Mesh[] = [];
    for (const [dx, dz, s] of [[0, 0, 1.2], [-1.4, 0, 0.7], [1.4, 0, 0.7], [0, -1.4, 0.7], [0, 1.4, 0.7]] as const) {
      const t = outline(mesh(new THREE.CylinderGeometry(0.5 * s, 0.6 * s, 1.4 * s, 10), toon('#e6c27a')), 1.05);
      t.position.set(dx, 0.7 * s, dz);
      const c = mesh(new THREE.ConeGeometry(0.55 * s, 0.6 * s, 10), toon('#e6c27a'));
      c.position.set(dx, 1.4 * s + 0.3 * s, dz);
      castle.add(t, c);
      parts.push(t);
    }
    const flag = mesh(new THREE.ConeGeometry(0.2, 0.5, 3), toon('#ef4b4b'));
    flag.position.y = 2.6;
    flag.rotation.z = Math.PI / 2;
    castle.add(flag);
    castle.scale.setScalar(0.01);
    b.place(castle, x, z);
    let built = false;
    b.spot({
      id: 'sandcastle', x: x + 2, z, r: 2.6, label: 'Kumdan kale yap',
      act: {
        dur: 5, pose: 'dig',
        step(_t, u, a) {
          a.heading = b.facing(a.pos.x, a.pos.z, x, z);
          if (!built) castle.scale.setScalar(Math.max(0.01, u));
        },
        end: () => { built = true; castle.scale.setScalar(1); b.block(x, z, 2); return 'Harika bir kale yaptın!'; },
      },
    });
  }
  // cankurtaran kulesi
  {
    const [x, z] = sand(-0.1, 10);
    const t = new THREE.Group();
    for (const [lx, lz] of [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) {
      const leg = mesh(new THREE.CylinderGeometry(0.1, 0.12, 4, 6), toon('#ffffff'));
      leg.position.set(lx, 2, lz);
      t.add(leg);
    }
    const hut = outline(mesh(new THREE.BoxGeometry(2.2, 1.6, 2.2), toon('#ef4b4b')), 1.03);
    hut.position.y = 4.8;
    const roof = mesh(new THREE.ConeGeometry(1.9, 1, 4), toon('#ffffff'));
    roof.position.y = 6.1;
    roof.rotation.y = Math.PI / 4;
    t.add(hut, roof);
    b.place(t, x, z, A + Math.PI);
    b.block(x, z, 1.2);
    const g0 = b.h(x, z);
    b.spot({
      id: 'lifeguard', x: x - 2, z: z - 1, r: 2.4, label: 'Cankurtaran kulesine çık',
      act: {
        dur: 6, pose: (u) => (u < 0.3 || u > 0.8 ? 'climb' : 'wave'), cam: [18, 8],
        step(_t, u, a) {
          const k = Math.min(1, u / 0.3, (1 - u) / 0.2);
          a.pos.set(x, g0 + k * 4.2, z + 1.4 * (1 - k));
          a.heading = A;
        },
      },
    });
  }
  // jet ski (sürülür)
  {
    const [x, z] = b.polar(A + 0.08, sr + 12);
    const js = new THREE.Group();
    const body = outline(mesh(new THREE.BoxGeometry(1.2, 0.6, 2.8), toon('#ffc83d')), 1.04);
    body.position.y = 0.2;
    const nose = outline(mesh(new THREE.ConeGeometry(0.6, 1.1, 4), toon('#ffc83d')), 1.04);
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, 0.2, 1.9);
    const seat = mesh(new THREE.BoxGeometry(0.7, 0.3, 1.2), toon('#3a2b27'));
    seat.position.set(0, 0.6, -0.4);
    const bar = mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.1, 6), toon('#3a2b27'));
    bar.rotation.z = Math.PI / 2;
    bar.position.set(0, 1.0, 0.5);
    js.add(body, nose, seat, bar);
    const v: Vehicle = { model: js, pos: new THREE.Vector3(x, 0, z), heading: A, speed: 24, water: true, seatY: 0.55 };
    b.scene.add(js);
    b.spot({ id: 'jetski', x, z, r: 4, label: 'Jet ski sür', vehicle: v });
    const [sx, sz] = sand(0.08, 4);
    b.place(sign('Jet Ski', '#fff1c7'), sx, sz, A + Math.PI);
  }
  // sörf
  {
    const [x, z] = sand(0.16, 2);
    const board = outline(mesh(new THREE.CapsuleGeometry(0.35, 2, 4, 10), toon('#14a89a')), 1.05);
    board.rotation.x = Math.PI / 2;
    board.scale.y = 0.25;
    const rack = new THREE.Group();
    const b2 = board.clone();
    b2.rotation.set(0, 0, 0.2);
    b2.scale.set(1, 1, 0.25);
    b2.position.y = 1.4;
    rack.add(b2);
    b.place(rack, x, z);
    const wave = mesh(new THREE.CylinderGeometry(1.5, 1.1, 12, 16, 1, true, 0, Math.PI * 1.2), toon('#e9fbff', { transparent: true, opacity: 0.8 }));
    (wave.material as THREE.Material).side = THREE.DoubleSide;
    wave.rotation.z = Math.PI / 2;
    wave.visible = false;
    b.scene.add(wave);
    b.spot({
      id: 'surf', x, z, r: 2.6, label: 'Sörf yap',
      act: {
        dur: 12, pose: (u) => (u < 0.1 ? 'walk' : 'cheer'), cam: [18, 7],
        step(t, u, a) {
          const along = (u - 0.5) * 0.5;
          const [wx, wz] = b.polar(A + along, sr + 22 - Math.sin(u * Math.PI) * 8);
          a.pos.set(wx, 0.35 + Math.abs(Math.sin(t * 2)) * 0.5, wz);
          a.heading = A + along + Math.PI / 2 + Math.sin(t * 1.5) * 0.3;
          board.position.set(wx, 0.25, wz);
          board.rotation.set(Math.PI / 2, 0, -a.heading);
          b.scene.add(board);
          wave.visible = true;
          const [vx, vz] = b.polar(A + along, sr + 24);
          wave.position.set(vx, 0.2, vz);
          wave.rotation.set(0, -(A + along), Math.PI / 2);
          if (Math.floor(t * 4) !== Math.floor((t - 0.02) * 4)) b.sparkles.burst(new THREE.Vector3(wx, 0.4, wz), 4, '#ffffff');
        },
        end: () => { board.removeFromParent(); wave.visible = false; return 'Süper bir dalga yakaladın!'; },
      },
    });
  }
  // şnorkel: su altı
  {
    const [x, z] = sand(-0.05, 2);
    const reefAt = b.polar(A - 0.05, sr + 26);
    const reef = b.reef;
    const ccols = ['#ff8fb1', '#ffb36b', '#b98cff', '#ff6b6b', '#ffd43b'];
    for (let i = 0; i < 26; i++) {
      const c = outline(mesh(new THREE.IcosahedronGeometry(0.6 + Math.random() * 0.8, 0), toon(ccols[i % ccols.length])), 1.05);
      c.position.set(reefAt[0] + (Math.random() - 0.5) * 24, -3 + Math.random() * 0.6, reefAt[1] + (Math.random() - 0.5) * 18);
      reef.add(c);
    }
    for (const [i, key] of ['balik', 'denizyildizi', 'ahtapot', 'denizati', 'yengec', 'balik'].entries()) {
      const f = b.card(key, i === 2 ? 2.4 : 1.6);
      f.position.set(reefAt[0] + Math.cos(i) * 7, -2.6 + (i % 3) * 0.5, reefAt[1] + Math.sin(i) * 5);
      reef.add(f);
      b.tick((_dt, t) => (f.position.x = reefAt[0] + Math.cos(i + t * 0.3) * 7));
    }
    reef.visible = false;
    b.scene.add(reef);
    b.spot({
      id: 'snorkel', x, z, r: 2.6, label: 'Şnorkelle dal',
      act: {
        dur: 12, pose: 'swim', underwater: true, cam: [7, 1.5],
        start: () => void (reef.visible = true),
        step(t, u, a) {
          const k = Math.min(1, u * 5, (1 - u) * 5);
          a.pos.set(reefAt[0] + Math.sin(t * 0.4) * 8, -2 * k - 0.2, reefAt[1] + Math.cos(t * 0.3) * 5);
          a.heading = t * 0.4 + Math.PI / 2;
        },
        end: () => { reef.visible = false; return 'Su altında rengarenk balıklar gördün!'; },
      },
    });
  }
  // tekne turu: adanın etrafında
  {
    const [x, z] = b.polar(A - 0.12, sr + 8);
    const boat = boatModel();
    b.place(boat, x, z, A + Math.PI / 2, -0.35);
    const R = Math.hypot(x, z) + 30;
    const [dx, dz] = sand(-0.12, 2);
    b.spot({
      id: 'boat', x: dx, z: dz, r: 3, label: 'Tekneyle adayı gez',
      act: {
        dur: 30, pose: 'sit', cam: [34, 20],
        step(t, u, a) {
          const ang = A - 0.12 + u * Math.PI * 2;
          const rr = R * (u < 0.05 ? u / 0.05 : u > 0.95 ? (1 - u) / 0.05 : 1) * 0.15 + R * 0.85;
          boat.position.set(Math.cos(ang) * rr, -0.35 + Math.sin(t * 2) * 0.12, Math.sin(ang) * rr);
          boat.rotation.y = -ang;
          a.pos.set(boat.position.x, 0.45, boat.position.z);
          a.heading = -ang;
        },
        end: () => void boat.position.set(x, -0.35, z),
      },
    });
  }
  // kıyı hazineleri
  ([[A + 0.22, 't0'], [Math.PI + 0.3, 't1'], [-0.5, 't2']] as const).forEach(([ang, id]) => {
    const [x, z] = b.polar(ang, b.shore(ang) - 5);
    treasure(b, id, x, z, taken);
  });
  b.place(sign('Plaj', '#fff1c7'), ...sand(0, 16), A + Math.PI);
}

// ------------------------------------------------------------------------------------------------
function buildForest(b: WorldBuilder) {
  const F = zone('forest');
  // kamp ateşi
  const fx = F.x, fz = F.z;
  const fire = new THREE.Group();
  for (let i = 0; i < 8; i++) {
    const s = mesh(new THREE.DodecahedronGeometry(0.35, 0), toon('#9a9aa8'));
    s.position.set(Math.cos((i / 8) * Math.PI * 2) * 1.1, 0.2, Math.sin((i / 8) * Math.PI * 2) * 1.1);
    fire.add(s);
  }
  const flames: THREE.Mesh[] = [];
  for (const [c, s] of [['#ff6b4a', 1], ['#ffc83d', 0.65]] as const) {
    const f = mesh(new THREE.ConeGeometry(0.55 * s, 1.5 * s, 8), toon(c, { emissive: c === '#ff6b4a' ? '#7a1a00' : '#7a5a00' }), false);
    f.position.y = 0.75 * s;
    fire.add(f);
    flames.push(f);
  }
  b.place(fire, fx, fz);
  b.block(fx, fz, 1.4);
  b.tick((_dt, t) => flames.forEach((f, i) => (f.scale.y = 1 + 0.2 * Math.sin(t * 9 + i * 2))));
  for (const a of [0.4, 2.2, 4.0]) {
    const log = outline(mesh(new THREE.CylinderGeometry(0.35, 0.35, 2.4, 10), toon('#9b6b43')), 1.04);
    log.rotation.z = Math.PI / 2;
    b.place(log, fx + Math.cos(a) * 3.2, fz + Math.sin(a) * 3.2, -a, 0.35);
    b.block(fx + Math.cos(a) * 3.2, fz + Math.sin(a) * 3.2, 0.9);
  }
  const stick = new THREE.Group();
  const st = mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.8, 5), toon('#9b6b43'), false);
  st.rotation.x = 1.2;
  st.position.set(0, 0.2, 0.8);
  const mallow = mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.24, 10), toon('#fff6e8'), false);
  mallow.position.set(0, 0.55, 1.6);
  stick.add(st, mallow);
  b.spot({
    id: 'campfire', x: fx + 3, z: fz - 3.2, r: 2.6, label: 'Ateşte marshmallow kızart',
    act: {
      dur: 6, pose: 'fish',
      start: (a) => a.hand.add(stick),
      step(t, u, a) {
        a.pos.set(fx + 2.2, b.h(fx, fz), fz - 2.2);
        a.heading = b.facing(a.pos.x, a.pos.z, fx, fz);
        (mallow.material as THREE.MeshToonMaterial).color.set(u > 0.6 ? '#e2a868' : '#fff6e8');
        if (Math.floor(t * 3) !== Math.floor((t - 0.02) * 3)) b.sparkles.burst(new THREE.Vector3(fx, b.h(fx, fz) + 1.4, fz), 3, '#ffc83d');
      },
      end: () => { stick.removeFromParent(); return 'Mmm, nefis bir marshmallow!'; },
    },
  });
  // çadır
  {
    const x = fx + 10, z = fz + 4;
    const tent = outline(mesh(new THREE.ConeGeometry(3.6, 4.4, 4), toon('#ff9f43')), 1.03);
    tent.position.y = 2.2;
    const door = mesh(new THREE.PlaneGeometry(1, 1.6), toon('#3a2b27'));
    door.position.set(0, 0.9, 2.56);
    door.rotation.x = -0.55;
    const g = new THREE.Group();
    g.add(tent, door);
    b.place(g, x, z, b.facing(x, z, fx, fz) + Math.PI / 4);
    b.block(x, z, 3);
    b.spot({
      id: 'tent', x: x - 3.8, z: z - 1.4, r: 2.4, label: 'Çadırda dinlen',
      act: { dur: 5, pose: 'sit', cam: [9, 4], step(_t, _u, a) { a.pos.set(x, b.h(x, z), z); }, end: () => 'Biraz dinlendin, enerjin yerinde!' },
    });
  }
  // ağaç ev
  {
    const x = fx - 12, z = fz - 8;
    const trunk = outline(mesh(new THREE.CylinderGeometry(1.1, 1.4, 9, 10), toon('#8a5a32')), 1.02);
    b.place(trunk, x, z, 0, 4.5);
    const deck = mesh(new THREE.CylinderGeometry(3.4, 3.4, 0.35, 12), toon('#c08c5c'));
    b.place(deck, x, z, 0, 6.2);
    const hut = outline(mesh(new THREE.BoxGeometry(3, 2.2, 3), toon('#d9a066')), 1.03);
    b.place(hut, x, z, 0.3, 7.5);
    const roof = outline(mesh(new THREE.ConeGeometry(2.6, 1.6, 4), toon('#3fa45a')), 1.03);
    b.place(roof, x, z, Math.PI / 4 + 0.3, 9.4);
    const crown = outline(mesh(new THREE.IcosahedronGeometry(4, 1), toon('#5cc36b')), 1.02);
    b.place(crown, x, z, 0, 12);
    for (let i = 0; i < 8; i++) {
      const rung = mesh(new THREE.BoxGeometry(1, 0.1, 0.12), toon('#c08c5c'));
      b.place(rung, x, z + 1.5, 0, 0.6 + i * 0.75);
    }
    b.block(x, z, 1.6);
    const g0 = b.h(x, z);
    b.spot({
      id: 'treehouse', x, z: z + 2.8, r: 2.4, label: 'Ağaç eve tırman',
      act: {
        dur: 8, pose: (u) => (u > 0.35 && u < 0.7 ? 'wave' : 'climb'), cam: [16, 7],
        step(_t, u, a) {
          const k = Math.min(1, u / 0.35, (1 - u) / 0.3);
          a.pos.set(x + (k >= 1 ? 1.6 : 0), g0 + k * 6.4, z + 1.6 * (1 - k) + (k >= 1 ? 1.2 : 0));
          a.heading = Math.PI;
          if (k >= 1) a.heading = 0;
        },
      },
    });
  }
  // orman sakinleri
  b.wander(b.card('ayi', 2.4), fx + 18, fz + 14, 10, 1.2);
  b.wander(b.card('tilki', 1.8), fx - 16, fz + 12, 12, 2);
  b.wander(b.card('tavsan', 1.4), fx + 6, fz - 16, 10, 2.4);
  const owl = b.card('baykus', 1.6);
  b.place(owl, fx - 12 + 2.6, fz - 8 - 1, 0, 6.4);
  // mantarlar
  for (let i = 0; i < 14; i++) {
    const a = Math.random() * Math.PI * 2, r = 6 + Math.random() * 30;
    const mx = fx + Math.cos(a) * r, mz = fz + Math.sin(a) * r;
    const m = new THREE.Group();
    const s = mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.5, 8), toon('#fff6e8'));
    s.position.y = 0.25;
    const c = outline(mesh(new THREE.SphereGeometry(0.45, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon('#ef4b4b')), 1.06);
    c.position.y = 0.45;
    m.add(s, c);
    b.place(m, mx, mz);
  }
  b.place(sign('Orman Kampı', '#d4f3ee'), fx + 22, fz + 20, b.facing(fx + 22, fz + 20, 0, 0));
}

// ------------------------------------------------------------------------------------------------
function buildFarm(b: WorldBuilder) {
  const F = zone('farm');
  b.keepOut.push({ x: F.x, z: F.z, r: 44 });
  // ahır ve silo
  const barn = new THREE.Group();
  const body = outline(mesh(new THREE.BoxGeometry(9, 6, 7), toon('#d9534f')), 1.02);
  body.position.y = 3;
  const roof = outline(mesh(new THREE.CylinderGeometry(4.9, 4.9, 7.4, 3), toon('#7a4a3a')), 1.02);
  roof.rotation.set(Math.PI / 2, 0, 0);
  roof.rotation.y = 0;
  roof.position.y = 6.9;
  const door = mesh(new THREE.BoxGeometry(3.2, 3.6, 0.15), toon('#ffffff'), false);
  door.position.set(0, 1.8, 3.55);
  barn.add(body, roof, door);
  b.place(barn, F.x - 12, F.z - 10, b.facing(F.x - 12, F.z - 10, F.x, F.z));
  b.block(F.x - 12, F.z - 10, 5.4);
  const silo = outline(mesh(new THREE.CylinderGeometry(2, 2, 10, 14), toon('#cfcbe0')), 1.02);
  b.place(silo, F.x - 20, F.z - 4, 0, 5);
  const dome = mesh(new THREE.SphereGeometry(2, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon('#9a9aa8'));
  b.place(dome, F.x - 20, F.z - 4, 0, 10);
  b.block(F.x - 20, F.z - 4, 2.2);
  // tarla: havuç
  const fx = F.x + 10, fz = F.z + 6;
  const soil = mesh(new THREE.BoxGeometry(14, 0.25, 10), toon('#9b6b43'), false);
  b.place(soil, fx, fz, 0, 0.12);
  const leaves: THREE.Object3D[] = [];
  for (let i = 0; i < 6; i++) for (let j = 0; j < 8; j++) {
    const l = mesh(new THREE.ConeGeometry(0.22, 0.6, 5), toon('#4caf50'), false);
    b.place(l, fx - 6 + j * 1.7, fz - 4 + i * 1.6, 0, 0.5);
    leaves.push(l);
  }
  const basket = outline(mesh(new THREE.CylinderGeometry(0.35, 0.28, 0.4, 10), toon('#c98a4b')), 1.06);
  const carrot = mesh(new THREE.ConeGeometry(0.1, 0.5, 6), toon('#ff8a3d'));
  carrot.position.y = 0.3;
  basket.add(carrot);
  b.spot({
    id: 'harvest', x: fx - 8.5, z: fz, r: 2.6, label: 'Havuç topla',
    act: {
      dur: 5, pose: 'dig',
      step(t, _u, a) {
        a.pos.set(fx - 6 + (t / 5) * 10, b.h(fx, fz) + 0.1, fz);
        a.heading = Math.PI / 2;
        const i = Math.floor(t * 2);
        if (leaves[i] && leaves[i].visible) {
          leaves[i].visible = false;
          b.sparkles.burst(leaves[i].position.clone(), 3, '#ff8a3d');
        }
      },
      end: (a) => {
        a.hand.add(basket);
        setTimeout(() => {
          basket.removeFromParent();
          leaves.forEach((l) => (l.visible = true));
        }, 20000);
        return 'Bir sepet havuç topladın!';
      },
    },
  });
  // traktör turu
  {
    const tr = new THREE.Group();
    const tb = outline(mesh(new THREE.BoxGeometry(1.6, 1.2, 2.6), toon('#2bb673')), 1.03);
    tb.position.y = 1.1;
    const cab = outline(mesh(new THREE.BoxGeometry(1.4, 1.2, 1.2), toon('#2bb673')), 1.03);
    cab.position.set(0, 2.2, -0.5);
    tr.add(tb, cab);
    for (const [wx, wz, r] of [[-0.95, -0.7, 0.9], [0.95, -0.7, 0.9], [-0.85, 1, 0.5], [0.85, 1, 0.5]] as const) {
      const w = mesh(new THREE.CylinderGeometry(r, r, 0.35, 14), toon('#3a2b27'));
      w.rotation.z = Math.PI / 2;
      w.position.set(wx, r, wz);
      tr.add(w);
    }
    const x0 = F.x + 2, z0 = F.z - 14;
    b.place(tr, x0, z0, Math.PI / 2);
    b.block(x0, z0, 1.6);
    b.spot({
      id: 'tractor', x: x0, z: z0 - 2.6, r: 2.6, label: 'Traktöre bin',
      act: {
        dur: 14, pose: 'drive', cam: [14, 7],
        step(t, u, a) {
          const ang = u * Math.PI * 2;
          const x = fx + Math.cos(ang) * 12, z = fz + Math.sin(ang) * 9;
          tr.position.set(x, b.h(x, z), z);
          tr.rotation.y = -ang;
          a.pos.set(x, b.h(x, z) + 1.6, z);
          a.heading = -ang;
          tr.position.y += Math.abs(Math.sin(t * 8)) * 0.05;
        },
        end: () => void (tr.position.set(x0, b.h(x0, z0), z0), (tr.rotation.y = Math.PI / 2)),
      },
    });
  }
  // çit ve hayvanlar
  const px = F.x - 4, pz = F.z + 22;
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const post = mesh(new THREE.BoxGeometry(0.2, 1.2, 0.2), toon('#ffffff'));
    b.place(post, px + Math.cos(a) * 9, pz + Math.sin(a) * 7, 0, 0.6);
  }
  const sheep = () => {
    const g = new THREE.Group();
    for (const [dx, dy, dz] of [[0, 0.8, 0], [0.4, 0.9, 0.3], [-0.4, 0.9, 0.2], [0, 1.05, -0.35], [0.1, 0.85, 0.45]]) {
      const p = mesh(new THREE.SphereGeometry(0.45, 10, 8), toon('#ffffff'));
      p.position.set(dx, dy, dz);
      g.add(p);
    }
    const head = mesh(new THREE.SphereGeometry(0.28, 10, 8), toon('#3a2b27'));
    head.position.set(0, 1, 0.75);
    g.add(head);
    for (const [lx, lz] of [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.3], [0.25, 0.3]]) {
      const l = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 5), toon('#3a2b27'));
      l.position.set(lx, 0.25, lz);
      g.add(l);
    }
    return g;
  };
  const chicken = () => {
    const g = new THREE.Group();
    const bd = outline(mesh(new THREE.SphereGeometry(0.32, 10, 8), toon('#ffffff')), 1.06);
    bd.position.y = 0.4;
    const comb = mesh(new THREE.BoxGeometry(0.06, 0.15, 0.2), toon('#ef4b4b'));
    comb.position.set(0, 0.75, 0.15);
    const bk = mesh(new THREE.ConeGeometry(0.06, 0.16, 5), toon('#ffc83d'));
    bk.rotation.x = Math.PI / 2;
    bk.position.set(0, 0.5, 0.36);
    g.add(bd, comb, bk);
    return g;
  };
  for (let i = 0; i < 4; i++) b.wander(sheep(), px + (Math.random() - 0.5) * 8, pz + (Math.random() - 0.5) * 6, 5, 0.8, false);
  for (let i = 0; i < 6; i++) b.wander(chicken(), F.x - 6 + Math.random() * 8, F.z - 2 + Math.random() * 6, 6, 1.6, false);
  b.wander(b.card('kedi', 1.4), F.x - 10, F.z - 2, 6, 1.5);
  b.wander(b.card('kopek', 1.6), F.x + 2, F.z + 2, 8, 2.2);
  // sıcak hava balonu
  {
    const x = F.x + 22, z = F.z - 14;
    const pad = mesh(new THREE.CylinderGeometry(3, 3, 0.15, 24), toon('#efe2c4'), false);
    b.place(pad, x, z, 0, 0.08);
    const bal = new THREE.Group();
    const env = outline(mesh(new THREE.SphereGeometry(3, 20, 16), toon('#ff6b4a')), 1.02);
    env.scale.y = 1.15;
    env.position.y = 6.5;
    const stripe = mesh(new THREE.SphereGeometry(3.04, 20, 16, 0, Math.PI * 2, Math.PI * 0.42, Math.PI * 0.16), toon('#ffc83d'), false);
    stripe.scale.y = 1.15;
    stripe.position.y = 6.5;
    const bk = outline(mesh(new THREE.BoxGeometry(1.6, 1, 1.6), toon('#b07d4f')), 1.04);
    bk.position.y = 0.5;
    bal.add(env, stripe, bk);
    b.place(bal, x, z);
    b.block(x, z, 1.4);
    const g0 = b.h(x, z);
    b.tick((_dt, t) => {
      if (!bal.userData.flying) bal.position.y = g0 + Math.sin(t * 1.2) * 0.15;
    });
    b.spot({
      id: 'balloon', x: x - 3, z, r: 2.4, label: 'Balonla uç',
      act: {
        dur: 24, pose: 'wave', cam: [34, 16],
        start: () => void (bal.userData.flying = true),
        step(_t, u, a) {
          const k = Math.min(1, u * 5, (1 - u) * 5);
          const ang = u * Math.PI * 2;
          const R = 70 * k;
          bal.position.set(x - R + Math.cos(ang) * R, g0 + 40 * k, z + Math.sin(ang) * R);
          a.pos.set(bal.position.x, bal.position.y + 0.5, bal.position.z);
          a.heading = -ang;
        },
        end: () => { bal.userData.flying = false; bal.position.set(x, g0, z); return 'Adayı yukarıdan gördün!'; },
      },
    });
  }
  b.place(sign('Çiftlik', '#fff1c7'), F.x - 2, F.z - 24, b.facing(F.x - 2, F.z - 24, 0, 0));
}

// ------------------------------------------------------------------------------------------------
function buildSnow(b: WorldBuilder) {
  const px = SNOW_PEAK.x - 6, pz = SNOW_PEAK.z - 4;
  // kardan adam (yapılır)
  const sm3 = new THREE.Group();
  for (const [r, y] of [[1.1, 1.0], [0.8, 2.6], [0.55, 3.7]]) {
    const s = outline(mesh(new THREE.SphereGeometry(r, 16, 12), toon('#ffffff')), 1.04);
    s.position.y = y;
    sm3.add(s);
  }
  const nose = mesh(new THREE.ConeGeometry(0.1, 0.5, 6), toon('#ff8a3d'));
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 3.7, 0.7);
  sm3.add(nose);
  sm3.scale.setScalar(0.01);
  b.place(sm3, px, pz);
  let built = false;
  b.spot({
    id: 'snowman', x: px + 2.6, z: pz + 1, r: 2.6, label: 'Kardan adam yap',
    act: {
      dur: 5, pose: 'dig',
      step(_t, u, a) {
        a.heading = b.facing(a.pos.x, a.pos.z, px, pz);
        if (!built) sm3.scale.setScalar(Math.max(0.01, u));
        if (Math.random() < 0.2) b.sparkles.burst(new THREE.Vector3(px, b.h(px, pz) + 1, pz), 2, '#ffffff');
      },
      end: () => { built = true; sm3.scale.setScalar(1); b.block(px, pz, 1.2); return 'Kocaman bir kardan adam yaptın!'; },
    },
  });
  // kızak: zirveden eteğe kayış
  const sx0 = SNOW_PEAK.x + 2, sz0 = SNOW_PEAK.z + 4;
  const sx1 = SNOW_PEAK.x - 50, sz1 = SNOW_PEAK.z - 22;
  const sled = new THREE.Group();
  const sb = outline(mesh(new THREE.BoxGeometry(1, 0.2, 1.8), toon('#ef4b4b')), 1.05);
  sb.position.y = 0.3;
  sled.add(sb);
  for (const rx of [-0.45, 0.45]) {
    const run = mesh(new THREE.BoxGeometry(0.08, 0.08, 2), toon('#5b5f6b'));
    run.position.set(rx, 0.08, 0);
    sled.add(run);
  }
  b.place(sled, sx0, sz0, b.facing(sx0, sz0, sx1, sz1));
  b.spot({
    id: 'sled', x: sx0 + 2, z: sz0, r: 2.6, label: 'Kızakla kay',
    act: {
      dur: 7, pose: 'cheer', cam: [12, 5],
      step(t, u, a) {
        const k = u * u;
        const x = sx0 + (sx1 - sx0) * k + Math.sin(k * 8) * 3, z = sz0 + (sz1 - sz0) * k;
        const y = b.h(x, z);
        sled.position.set(x, y, z);
        sled.rotation.y = b.facing(sx0, sz0, sx1, sz1) + Math.cos(k * 8) * 0.4;
        a.pos.set(x, y + 0.4, z);
        a.heading = sled.rotation.y;
        if (Math.floor(t * 8) !== Math.floor((t - 0.02) * 8)) b.sparkles.burst(new THREE.Vector3(x, y + 0.3, z), 3, '#ffffff');
      },
      end: () => { sled.position.set(sx0, b.h(sx0, sz0), sz0); return 'Vuuuu! Harika bir kayıştı!'; },
    },
  });
  // iglo ve penguenler
  const ix = SNOW_PEAK.x - 34, iz = SNOW_PEAK.z - 18;
  const igloo = outline(mesh(new THREE.SphereGeometry(3, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon('#eaf6ff')), 1.02);
  b.place(igloo, ix, iz);
  b.block(ix, iz, 3);
  for (let i = 0; i < 4; i++) b.wander(b.card('penguen', 1.5), ix + 6 + i * 2, iz + 4, 8, 1.2);
  b.place(sign('Karlı Dağ', '#e9f6ff'), SNOW_PEAK.x - 54, SNOW_PEAK.z - 28, b.facing(SNOW_PEAK.x - 54, SNOW_PEAK.z - 28, 0, 0));
}

// ------------------------------------------------------------------------------------------------
function buildDino(b: WorldBuilder) {
  const D = zone('dino');
  // yanardağ
  const v = VOLCANO;
  const cone = outline(mesh(new THREE.CylinderGeometry(4, v.r, v.h, 18, 1, true), toon('#8a5a3a')), 1.01);
  (cone.material as THREE.Material).side = THREE.DoubleSide;
  b.place(cone, v.x, v.z, 0, v.h / 2);
  const lava = mesh(new THREE.CircleGeometry(4, 18), toon('#ff6b2a', { emissive: '#aa3300' }), false);
  lava.rotation.x = -Math.PI / 2;
  b.place(lava, v.x, v.z, 0, v.h - 1);
  b.block(v.x, v.z, v.r + 0.5);
  const top = new THREE.Vector3(v.x, b.h(v.x, v.z) + v.h, v.z);
  const puffs: THREE.Object3D[] = [];
  for (let i = 0; i < 6; i++) {
    const p = cloud(1.4, '#b9b3c9');
    b.scene.add(p);
    puffs.push(p);
  }
  b.tick((_dt, t) => {
    puffs.forEach((p, i) => {
      const u = (t * 0.15 + i / 6) % 1;
      p.position.set(top.x + Math.sin(u * 4 + i) * 2, top.y + u * 16, top.z + Math.cos(u * 3 + i) * 2);
      p.scale.setScalar(0.6 + u * 1.6);
    });
    if (Math.floor(t / 7) !== Math.floor((t - 0.02) / 7)) b.sparkles.burst(top.clone().setY(top.y + 1), 30, '#ff8a3d');
  });
  // dinozorlar
  b.wander(b.card('trex', 6), D.x + 14, D.z + 6, 12, 1.4);
  b.wander(b.card('triceratops', 5), D.x - 16, D.z + 10, 12, 1.2);
  b.wander(b.card('uzun-boyun', 10), D.x + 24, D.z - 14, 14, 0.8);
  b.wander(b.card('stegozor', 5), D.x - 6, D.z + 22, 10, 1);
  const ptero = b.card('ucan-dinozor', 4);
  b.scene.add(ptero);
  b.tick((_dt, t) => ptero.position.set(D.x + Math.cos(t * 0.3) * 28, b.h(D.x, D.z) + 20 + Math.sin(t) * 2, D.z + Math.sin(t * 0.3) * 28));
  // fosil kazısı
  const fx = D.x + 16, fz = D.z + 6;
  const pit = mesh(new THREE.CylinderGeometry(3, 3, 0.3, 20), toon('#c4874f'), false);
  b.place(pit, fx, fz, 0, 0.1);
  const bones = new THREE.Group();
  const bm = toon('#fff6e0');
  const spine = outline(mesh(new THREE.CapsuleGeometry(0.15, 3.4, 4, 8), bm), 1.08);
  spine.rotation.z = Math.PI / 2;
  bones.add(spine);
  for (let i = 0; i < 5; i++) {
    const rib = outline(mesh(new THREE.TorusGeometry(0.5, 0.07, 6, 12, Math.PI), bm), 1.1);
    rib.position.set(-1.2 + i * 0.6, 0, 0);
    rib.rotation.y = Math.PI / 2;
    bones.add(rib);
  }
  const skull = outline(mesh(new THREE.BoxGeometry(0.8, 0.5, 0.6), bm), 1.06);
  skull.position.set(2.1, 0.1, 0);
  bones.add(skull);
  bones.visible = false;
  b.place(bones, fx, fz, 0, 0.35);
  b.spot({
    id: 'fossil', x: fx - 3.6, z: fz, r: 2.6, label: 'Fosil kaz',
    act: {
      dur: 5, pose: 'dig',
      step(t, u, a) {
        a.heading = b.facing(a.pos.x, a.pos.z, fx, fz);
        if (Math.floor(t * 5) !== Math.floor((t - 0.02) * 5)) b.sparkles.burst(new THREE.Vector3(fx, b.h(fx, fz) + 0.4, fz), 3, '#c4874f');
        if (u > 0.5) bones.visible = true;
      },
      end: () => 'Bir dinozor iskeleti buldun!',
    },
  });
  // dev yumurta
  const ex = D.x - 2, ez = D.z + 18;
  const egg = outline(mesh(new THREE.SphereGeometry(1, 18, 14), toon('#f4efe6')), 1.04);
  egg.scale.set(1, 1.3, 1);
  b.place(egg, ex, ez, 0, 1.3);
  b.block(ex, ez, 1.2);
  let hatched = false;
  b.spot({
    id: 'egg', x: ex + 2.6, z: ez, r: 2.4, label: 'Yumurtaya dokun',
    act: {
      dur: 4, pose: 'clap',
      step(t, _u, a) {
        a.heading = b.facing(a.pos.x, a.pos.z, ex, ez);
        if (!hatched) egg.rotation.z = Math.sin(t * 14) * 0.15;
      },
      end: () => {
        if (hatched) return 'Minik dino seni çok sevdi!';
        hatched = true;
        egg.visible = false;
        b.sparkles.burst(new THREE.Vector3(ex, b.h(ex, ez) + 1.5, ez), 24);
        b.wander(b.card('dino-yumurta', 2), ex, ez, 6, 2);
        return 'Yumurtadan minik bir dino çıktı!';
      },
    },
  });
  b.place(sign('Dinozor Vadisi', '#ffe1d8'), D.x + 6, D.z + 30, b.facing(D.x + 6, D.z + 30, 0, 0));
}

// ------------------------------------------------------------------------------------------------
function buildCastle(b: WorldBuilder) {
  const C = zone('castle');
  b.keepOut.push({ x: C.x, z: C.z, r: 30 });
  const W = 18;
  const stone = toon('#cfc8e0');
  const g = new THREE.Group();
  for (const [x, z, w, d] of [[0, -W / 2, W, 1], [0, W / 2, W, 1], [-W / 2, 0, 1, W], [W / 2, 0, 1, W]] as const) {
    const wall = outline(mesh(new THREE.BoxGeometry(w, 5, d), stone), 1.01);
    wall.position.set(x, 2.5, z);
    g.add(wall);
  }
  const towers: THREE.Vector3[] = [];
  for (const [x, z] of [[-W / 2, -W / 2], [W / 2, -W / 2], [-W / 2, W / 2], [W / 2, W / 2]] as const) {
    const t = outline(mesh(new THREE.CylinderGeometry(1.8, 2, 9, 12), stone), 1.02);
    t.position.set(x, 4.5, z);
    const r = outline(mesh(new THREE.ConeGeometry(2.3, 3, 12), toon('#9b6bff')), 1.03);
    r.position.set(x, 10.5, z);
    g.add(t, r);
    towers.push(new THREE.Vector3(x, 0, z));
  }
  const keep = outline(mesh(new THREE.CylinderGeometry(3, 3.2, 13, 14), stone), 1.02);
  keep.position.y = 6.5;
  const keepRoof = outline(mesh(new THREE.ConeGeometry(3.6, 4, 14), toon('#e9487d')), 1.03);
  keepRoof.position.y = 15;
  const flag = mesh(new THREE.PlaneGeometry(1.6, 1), toon('#ffc83d'));
  flag.position.set(0.8, 18, 0);
  const pole = mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 5), toon('#3a2b27'));
  pole.position.y = 18;
  g.add(keep, keepRoof, flag, pole);
  const gate = mesh(new THREE.BoxGeometry(3, 3.6, 1.2), toon('#3a2b27'), false);
  gate.position.set(W / 2, 1.8, 0);
  g.add(gate);
  b.place(g, C.x, C.z);
  b.tick((_dt, t) => (flag.rotation.y = Math.sin(t * 3) * 0.3));
  // duvarlar engel (kapı açık)
  for (let i = -W / 2; i <= W / 2; i += 2) {
    b.block(C.x + i, C.z - W / 2, 1.1);
    b.block(C.x + i, C.z + W / 2, 1.1);
    b.block(C.x - W / 2, C.z + i, 1.1);
    if (Math.abs(i) > 2) b.block(C.x + W / 2, C.z + i, 1.1);
  }
  b.block(C.x, C.z, 3.4);
  b.wander(b.card('prenses', 2.6), C.x + 4, C.z + 4, 4, 1);
  b.wander(b.card('sovalye', 2.6), C.x + 14, C.z - 3, 4, 1.2);
  const g0 = b.h(C.x, C.z);
  const tw = towers[1];
  b.spot({
    id: 'castle', x: C.x + 4, z: C.z - 4, r: 3, label: 'Şato kulesine çık',
    act: {
      dur: 8, pose: (u) => (u > 0.35 && u < 0.7 ? 'wave' : 'climb'), cam: [24, 12],
      step(_t, u, a) {
        const k = Math.min(1, u / 0.35, (1 - u) / 0.3);
        a.pos.set(C.x + tw.x * k + 4 * (1 - k), g0 + k * 9.2, C.z + tw.z * k - 4 * (1 - k));
        a.heading = Math.PI / 2;
      },
      end: () => 'Şatonun tepesinden her yeri gördün!',
    },
  });
  b.place(sign('Şato', '#efe5ff'), C.x + W / 2 + 6, C.z + 4, Math.PI / 2);
}

// ------------------------------------------------------------------------------------------------
function buildLighthouse(b: WorldBuilder) {
  const L = zone('lighthouse');
  const g = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const s = mesh(new THREE.CylinderGeometry(1.7 - i * 0.18, 1.9 - i * 0.18, 2.6, 16), toon(i % 2 ? '#ffffff' : '#ef4b4b'));
    s.position.y = 1.3 + i * 2.6;
    g.add(s);
  }
  const room = outline(mesh(new THREE.CylinderGeometry(1.1, 1.1, 1.5, 12), toon('#fff6c9', { emissive: '#554400' })), 1.04);
  room.position.y = 13.6;
  const cap = mesh(new THREE.ConeGeometry(1.4, 1.3, 12), toon('#ef4b4b'));
  cap.position.y = 15;
  g.add(room, cap);
  const beamGeo = new THREE.ConeGeometry(2.6, 22, 16, 1, true);
  beamGeo.translate(0, -11, 0);
  const beamMat = new THREE.MeshBasicMaterial({ color: '#fff6a0', transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false });
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beam.rotation.z = Math.PI / 2;
  const bg = new THREE.Group();
  bg.add(beam);
  bg.position.y = 13.6;
  g.add(bg);
  b.place(g, L.x, L.z);
  b.block(L.x, L.z, 2.1);
  b.tick((dt) => (bg.rotation.y += dt * 1.4));
  const g0 = b.h(L.x, L.z);
  b.spot({
    id: 'lighthouse', x: L.x - 3.4, z: L.z + 2, r: 2.6, label: 'Feneri yak',
    act: {
      dur: 8, pose: (u) => (u > 0.3 && u < 0.85 ? 'wave' : 'climb'), cam: [26, 14],
      step(_t, u, a) {
        const k = Math.min(1, u / 0.3, (1 - u) / 0.15);
        a.pos.set(L.x + 1.6, g0 + 12.9 * k, L.z);
        beamMat.opacity = u > 0.3 && u < 0.85 ? 0.5 : 0.12;
        a.heading = -Math.PI / 2;
      },
      end: () => void (beamMat.opacity = 0.12),
    },
  });
}

// ------------------------------------------------------------------------------------------------
function buildRocket(b: WorldBuilder) {
  const R = zone('rocket');
  const pad = mesh(new THREE.CylinderGeometry(7, 7.4, 0.6, 24), toon('#9a9aa8'), false);
  b.place(pad, R.x, R.z, 0, 0.3);
  const towerG = new THREE.Group();
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const l = mesh(new THREE.CylinderGeometry(0.12, 0.12, 16, 6), toon('#ef4b4b'));
    l.position.set(x, 8, z);
    towerG.add(l);
  }
  for (let i = 0; i < 8; i++) {
    const r = mesh(new THREE.BoxGeometry(2.2, 0.12, 2.2), toon('#ef4b4b'));
    r.position.y = 1 + i * 2;
    towerG.add(r);
  }
  b.place(towerG, R.x - 4, R.z);
  b.block(R.x - 4, R.z, 1.8);
  const rocket = new THREE.Group();
  const body = outline(mesh(new THREE.CylinderGeometry(1.4, 1.4, 9, 18), toon('#ffffff')), 1.02);
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
  rocket.add(flame);
  b.place(rocket, R.x, R.z, 0, 0.6);
  b.block(R.x, R.z, 2);
  const g0 = b.h(R.x, R.z) + 0.6;
  b.spot({
    id: 'rocket', x: R.x + 4, z: R.z + 3, r: 3, label: 'Roketle uzaya çık',
    act: {
      dur: 18, pose: 'sit', cam: [60, 30],
      step(t, u, a) {
        let y = 0;
        if (u < 0.15) rocket.position.x = R.x + Math.sin(t * 50) * 0.08;
        else if (u < 0.6) y = ((u - 0.15) / 0.45) ** 2 * 260;
        else y = 260 * (1 - sm((u - 0.6) / 0.4));
        flame.visible = u > 0.12 && u < 0.6;
        flame.scale.y = 1 + Math.random() * 0.5;
        rocket.position.y = g0 + y;
        a.pos.set(R.x, g0 + y + 7.5, R.z + 0.2);
        a.heading = 0;
        if (flame.visible && Math.random() < 0.4) b.sparkles.burst(new THREE.Vector3(R.x, g0 + y - 1, R.z), 3, '#ffc83d');
      },
      end: () => { rocket.position.set(R.x, g0, R.z); flame.visible = false; return 'Uzaydan adayı gördün!'; },
    },
  });
  b.place(sign('Roket Üssü', '#dcecff'), R.x - 10, R.z + 10, b.facing(R.x - 10, R.z + 10, 0, 0));
}

/** Günün yıldızları: karada, tohuma göre (bölgelerin çevresine de dağılır). */
export function starPlaces(seed: number, count = 30): { id: string; x: number; z: number }[] {
  let s = seed % 2147483647 || 1;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const out: { id: string; x: number; z: number }[] = [];
  let i = 0;
  while (out.length < count && i++ < 2000) {
    const a = rnd() * Math.PI * 2, r = 10 + Math.sqrt(rnd()) * 240;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (isWater(x, z) || heightAt(x, z) < 0.6) continue;
    out.push({ id: `s${out.length}`, x, z });
  }
  return out;
}
export { star as starModel, tree as treeModel };
