/**
 * Macera Kapıları'nın ardındaki dünyalar: Labirent, Gökyüzü Parkuru, Şeker Diyarı.
 *
 * Her dünya kendi sahnesidir; kahraman (aynı 3B karakter) kapıdan girince oraya taşınır. Ada motoru (island.ts)
 * yürümeyi, zıplamayı ve kamerayı yürütür; dünya zemini (`floor`), duvarları (`blocked`) ve kurallarını verir.
 * Labirent bir tohumla kurulur: aynı adadaki arkadaşlar aynı labirenti görür (tohum: oda + gün).
 */
import * as THREE from 'three';
import { cloud, mesh, outline, Sparkles, star, toon, tree } from '../play3d/kit';
import type { RealmId } from './homestead';

export interface Hero {
  pos: THREE.Vector3;
  vy: number;
  grounded: boolean;
}

export interface RealmEvents {
  /** Toplanan (yıldız, şeker) sayısı değişti. */
  progress(text: string): void;
  msg(text: string): void;
  /** Bitti: kazanılan ek altın (toplananlar). */
  finish(bonus: number, text: string): void;
  sound: { star: (i: number) => void; pop: () => void };
}

export abstract class Realm {
  readonly scene = new THREE.Scene();
  readonly sparkles: Sparkles;
  /** Güneş kahramanı izler (gölgeler hep yakında net). */
  readonly sun: THREE.DirectionalLight;
  spawn = new THREE.Vector3();
  spawnH = 0;
  /** Kamera: [uzaklık, yükseklik]. */
  cam: [number, number] = [13, 7.5];
  done = false;
  /** Dokunma (zıplama değil) hedefleri yok; yalnızca zemin. */
  abstract readonly id: RealmId;
  /** Ekranda görünen hedef. */
  abstract goal: string;
  protected exitAt = new THREE.Vector3();
  private exitObj: THREE.Object3D;

  constructor(protected ev: RealmEvents, sky: string, fog: [number, number]) {
    this.scene.background = new THREE.Color(sky);
    this.scene.fog = new THREE.Fog(sky, fog[0], fog[1]);
    this.scene.add(new THREE.HemisphereLight('#ffffff', '#c9b6ff', 1.2));
    const sun = (this.sun = new THREE.DirectionalLight('#fff4dc', 1.4));
    sun.position.set(-30, 60, 26);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.bias = -0.0006;
    sun.shadow.normalBias = 0.05;
    Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 200 });
    this.scene.add(sun, sun.target);
    this.sparkles = new Sparkles(this.scene);
    this.exitObj = portalModel();
    this.scene.add(this.exitObj);
  }
  protected placeExit(x: number, y: number, z: number, face: number) {
    this.exitAt.set(x, y, z);
    this.exitObj.position.set(x, y, z);
    this.exitObj.rotation.y = face;
  }
  /** (x,z)'de y yüksekliğindeki kahramanın basabileceği zemin (yoksa -Infinity). */
  abstract floor(x: number, z: number, y: number): number;
  /** Gövde bir duvara çarpıyor mu? */
  abstract blocked(x: number, z: number, y: number): boolean;
  /** Bu yüksekliğin altına düşen başa döner. */
  killY = -30;
  /** Düşünce dönülen yer. */
  checkpoint = new THREE.Vector3();
  /** Her kare. Çıkış kapısına girildiyse true. */
  update(dt: number, t: number, hero: Hero): boolean {
    this.exitObj.children[2].rotation.z = -t * 2;
    this.sparkles.update(dt);
    if (hero.pos.y < this.killY) {
      hero.pos.copy(this.checkpoint);
      hero.vy = 0;
      this.ev.msg('Hoppala! Tekrar dene.');
      this.ev.sound.pop();
    }
    return this.time > 1.5 && Math.hypot(hero.pos.x - this.exitAt.x, hero.pos.z - this.exitAt.z) < 1.6 && Math.abs(hero.pos.y - this.exitAt.y) < 2;
  }
  protected time = 0;
  tick(dt: number) {
    this.time += dt;
  }
  dispose() {
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
    });
  }
}

function portalModel() {
  const g = new THREE.Group();
  const ring = outline(mesh(new THREE.TorusGeometry(1.8, 0.32, 10, 28), toon('#c86bff')), 1.05);
  ring.position.y = 2.3;
  const disc = new THREE.Mesh(new THREE.CircleGeometry(1.6, 28), new THREE.MeshBasicMaterial({ color: '#f1d9ff', transparent: true, opacity: 0.85, side: THREE.DoubleSide }));
  disc.position.y = 2.3;
  const swirl = new THREE.Mesh(new THREE.RingGeometry(0.3, 1.45, 28, 1, 0, Math.PI * 1.3), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.6, side: THREE.DoubleSide }));
  swirl.position.set(0, 2.3, 0.02);
  g.add(ring, disc, swirl);
  return g;
}

/** Tohumlu rastgele sayı (aynı tohum, aynı labirent). */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Tohumdan labirent: her hücrenin doğu ve güney duvarı var mı (yol hep bağlı: derinlik öncelikli kazı). */
export function makeMaze(n: number, seed: number) {
  const r = rng(seed);
  const east = Array.from({ length: n * n }, () => true);
  const south = Array.from({ length: n * n }, () => true);
  const seen = new Set<number>([0]);
  const stack = [0];
  while (stack.length) {
    const c = stack[stack.length - 1];
    const x = c % n, z = Math.floor(c / n);
    const nb = ([[1, 0], [-1, 0], [0, 1], [0, -1]] as const).map(([dx, dz]) => [x + dx, z + dz, dx, dz] as const)
      .filter(([nx, nz]) => nx >= 0 && nz >= 0 && nx < n && nz < n && !seen.has(nz * n + nx));
    if (!nb.length) {
      stack.pop();
      continue;
    }
    const [nx, nz, dx, dz] = nb[Math.floor(r() * nb.length)];
    if (dx === 1) east[c] = false;
    if (dx === -1) east[nz * n + nx] = false;
    if (dz === 1) south[c] = false;
    if (dz === -1) south[nz * n + nx] = false;
    const k = nz * n + nx;
    seen.add(k);
    stack.push(k);
  }
  return { east, south };
}

// ================================================================================================
// Labirent
// ================================================================================================
const MN = 9, MC = 7, WALL_H = 3.4;

export class MazeRealm extends Realm {
  readonly id = 'maze' as const;
  goal = 'Labirentteki hazine sandığını bul!';
  private walls: { x1: number; z1: number; x2: number; z2: number }[] = [];
  private stars: { obj: THREE.Object3D; taken: boolean }[] = [];
  private chest: THREE.Group;
  private lid: THREE.Object3D;
  private size = MN * MC;

  constructor(ev: RealmEvents, seed: number) {
    super(ev, '#bfeaff', [40, 140]);
    this.cam = [9, 14];
    const S = this.size;
    const floor = mesh(new THREE.BoxGeometry(S + 30, 1, S + 30), toon('#8fd16f'), false);
    floor.position.set(S / 2, -0.5, S / 2);
    this.scene.add(floor);
    // labirent
    const { east, south } = makeMaze(MN, seed);
    const hedge = toon('#3fa45a');
    const addWall = (x1: number, z1: number, x2: number, z2: number) => {
      const w = Math.max(0.9, x2 - x1), d = Math.max(0.9, z2 - z1);
      const m = outline(mesh(new THREE.BoxGeometry(w, WALL_H, d), hedge), 1.02);
      m.position.set((x1 + x2) / 2, WALL_H / 2, (z1 + z2) / 2);
      this.scene.add(m);
      this.walls.push({ x1: (x1 + x2) / 2 - w / 2, z1: (z1 + z2) / 2 - d / 2, x2: (x1 + x2) / 2 + w / 2, z2: (z1 + z2) / 2 + d / 2 });
    };
    // dış duvar (giriş: kuzeybatı, çıkış: güneydoğu köşesinde açıklık)
    addWall(MC, 0, S, 0);
    addWall(0, S, S - MC, S);
    addWall(0, 0, 0, S);
    addWall(S, 0, S, S);
    for (let z = 0; z < MN; z++) for (let x = 0; x < MN; x++) {
      const c = z * MN + x;
      if (east[c] && x < MN - 1) addWall((x + 1) * MC, z * MC, (x + 1) * MC, (z + 1) * MC);
      if (south[c] && z < MN - 1) addWall(x * MC, (z + 1) * MC, (x + 1) * MC, (z + 1) * MC);
    }
    // köşe direkleri (duvar uçları düzgün görünsün)
    for (let z = 0; z <= MN; z++) for (let x = 0; x <= MN; x++) {
      const p = mesh(new THREE.BoxGeometry(1.1, WALL_H + 0.3, 1.1), toon('#36924e'));
      p.position.set(x * MC, (WALL_H + 0.3) / 2, z * MC);
      this.scene.add(p);
    }
    // giriş ve çıkış
    this.spawn.set(MC / 2, 0, -4);
    this.spawnH = 0;
    this.checkpoint.copy(this.spawn);
    this.placeExit(MC / 2 - 4, 0, -7, 0);
    const r = rng(seed ^ 0x9e37);
    // yıldızlar: rastgele 6 hücrede
    const used = new Set<number>([0, MN * MN - 1]);
    while (this.stars.length < 6) {
      const c = Math.floor(r() * MN * MN);
      if (used.has(c)) continue;
      used.add(c);
      const s = star();
      s.scale.setScalar(1.2);
      s.position.set((c % MN + 0.5) * MC, 1.4, (Math.floor(c / MN) + 0.5) * MC);
      this.scene.add(s);
      this.stars.push({ obj: s, taken: false });
    }
    // hazine sandığı (son hücrede)
    this.chest = new THREE.Group();
    const box = outline(mesh(new THREE.BoxGeometry(1.8, 1.1, 1.3), toon('#c98a4b')), 1.05);
    box.position.y = 0.55;
    this.lid = outline(mesh(new THREE.CylinderGeometry(0.65, 0.65, 1.8, 12, 1, false, 0, Math.PI), toon('#ffc83d')), 1.05);
    this.lid.rotation.z = Math.PI / 2;
    this.lid.position.y = 1.1;
    this.chest.add(box, this.lid);
    this.chest.position.set(S - MC / 2, 0, S - MC / 2);
    this.scene.add(this.chest);
    // süsler: dışarıda ağaçlar ve bulutlar
    for (let i = 0; i < 30; i++) {
      const a = (i / 30) * Math.PI * 2;
      const tx = S / 2 + Math.cos(a) * (S * 0.72 + 6), tz = S / 2 + Math.sin(a) * (S * 0.72 + 6);
      if (Math.hypot(tx - MC / 2, tz + 5) < 14) continue; // giriş ve çıkış kapısının önü açık
      const t = tree(i % 3 ? 'round' : 'pine', 1.6);
      t.position.set(tx, 0, tz);
      this.scene.add(t);
    }
    for (let i = 0; i < 8; i++) {
      const c = cloud(2.4);
      c.position.set(S / 2 + Math.cos(i) * 70, 30 + (i % 3) * 6, S / 2 + Math.sin(i) * 70);
      this.scene.add(c);
    }
  }

  floor(x: number, z: number) {
    return x > -15 && z > -15 && x < this.size + 15 && z < this.size + 15 ? 0 : -Infinity;
  }
  blocked(x: number, z: number) {
    const r = 0.55;
    for (const w of this.walls) if (x > w.x1 - r && x < w.x2 + r && z > w.z1 - r && z < w.z2 + r) return true;
    return false;
  }
  private found = 0;
  update(dt: number, t: number, hero: Hero) {
    this.tick(dt);
    for (const s of this.stars) {
      if (s.taken) {
        continue;
      }
      s.obj.rotation.y += dt * 2;
      if (hero.pos.distanceTo(s.obj.position) < 1.8) {
        s.taken = true;
        s.obj.visible = false;
        this.found++;
        this.sparkles.burst(s.obj.position.clone(), 12);
        this.ev.sound.star(this.found);
        this.ev.progress(`⭐ ${this.found}/${this.stars.length}`);
      }
    }
    if (!this.done && Math.hypot(hero.pos.x - this.chest.position.x, hero.pos.z - this.chest.position.z) < 2.2) {
      this.done = true;
      this.lid.rotation.x = -1.2;
      this.sparkles.burst(this.chest.position.clone().setY(1.5), 30);
      this.ev.finish(this.found * 2, this.found === this.stars.length ? 'Hazineyi buldun ve bütün yıldızları topladın!' : 'Hazineyi buldun!');
    }
    return super.update(dt, t, hero);
  }
}

// ================================================================================================
// Gökyüzü Parkuru
// ================================================================================================
interface Plat { x: number; y: number; z: number; w: number; d: number; h: number; mesh: THREE.Object3D; move?: { ax: 'x' | 'y' | 'z'; amp: number; sp: number; ph: number; base: number }; bounce?: boolean; check?: boolean; dx: number; dy: number; dz: number }

export class SkyRealm extends Realm {
  readonly id = 'sky' as const;
  goal = 'Platformlardan zıplayarak bayrağa ulaş!';
  private plats: Plat[] = [];
  private stars: { obj: THREE.Object3D; taken: boolean }[] = [];
  private flag: THREE.Vector3;
  private found = 0;
  private checks = 0;

  constructor(ev: RealmEvents) {
    super(ev, '#9fd8ff', [60, 220]);
    this.killY = -12;
    const cols = ['#ff8fb1', '#ffd166', '#9be7de', '#b39ddb', '#c5e1a5', '#ffcc80'];
    let ci = 0;
    const P = (x: number, y: number, z: number, w: number, d: number, o: Partial<Plat> = {}) => {
      const h = o.bounce ? 0.8 : 1;
      const color = o.bounce ? '#ef4b4b' : o.check ? '#7cc760' : cols[ci++ % cols.length];
      let m: THREE.Object3D;
      if (o.bounce) {
        const g = new THREE.Group();
        const cap = outline(mesh(new THREE.SphereGeometry(w / 2, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon(color)), 1.04);
        cap.scale.y = 0.6;
        const stem = mesh(new THREE.CylinderGeometry(w / 5, w / 4, 1.2, 10), toon('#fff1c7'));
        stem.position.y = -0.6;
        g.add(cap, stem);
        for (let k = 0; k < 5; k++) {
          const dot = mesh(new THREE.SphereGeometry(w / 12, 8, 6), toon('#ffffff'), false);
          const a = (k / 5) * Math.PI * 2;
          dot.position.set(Math.cos(a) * w * 0.28, w * 0.22, Math.sin(a) * w * 0.28);
          g.add(dot);
        }
        m = g;
      } else {
        m = outline(mesh(new THREE.BoxGeometry(w, h, d), toon(color)), 1.02);
        // altında bulut
        const c = cloud(Math.min(w, d) / 5);
        c.position.y = -h / 2 - 0.5 - Math.min(w, d) * 0.25;
        m.add(c);
      }
      m.position.set(x, o.bounce ? y - w * 0.3 : y - h / 2, z);
      this.scene.add(m);
      const p: Plat = { x, y, z, w, d, h, mesh: m, dx: 0, dy: 0, dz: 0, ...o };
      if (p.move) p.move.base = p.move.ax === 'x' ? x : p.move.ax === 'y' ? y : z;
      this.plats.push(p);
      return p;
    };
    const mv = (ax: 'x' | 'y' | 'z', amp: number, sp: number, ph = 0) => ({ move: { ax, amp, sp, ph, base: 0 } });
    // başlangıç
    P(0, 10, 0, 10, 10);
    this.spawn.set(0, 10, 2);
    this.spawnH = Math.PI;
    this.checkpoint.copy(this.spawn);
    this.placeExit(-3.5, 10, 3.5, Math.PI / 4);
    // 1. bölüm: kolay basamaklar
    P(0, 10.5, -8, 4, 4);
    P(2, 11.5, -14, 4, 4);
    P(-1, 12.5, -20, 4, 4);
    P(0, 12.5, -27, 3, 6);
    P(0, 12.5, -34, 5, 5, { check: true });
    // 2. bölüm: kayan platformlar ve mantar
    P(0, 12.5, -42, 4, 4, mv('x', 4, 0.9));
    P(0, 12.5, -50, 4, 4, mv('x', 4, 0.9, Math.PI));
    P(0, 11, -57, 3, 3, { bounce: true });
    P(0, 18, -63, 5, 5);
    P(6, 18, -66, 3, 3);
    P(12, 18.5, -66, 3, 3);
    P(18, 19, -66, 5, 5, { check: true });
    // 3. bölüm: asansör ve dar köprü
    P(24, 19, -66, 4, 4, mv('y', 3, 0.8));
    P(30, 22, -66, 3, 3);
    P(36, 22, -66, 10, 1.6);
    P(46, 22, -66, 1.6, 1.6);
    P(50, 22.5, -66, 1.6, 1.6);
    P(54, 23, -66, 5, 5, { check: true });
    // 4. bölüm: dönen adalar ve son mantar
    P(54, 23, -73, 4, 4, mv('z', 3, 1.1));
    P(54, 23.5, -81, 3.5, 3.5, mv('x', 3, 1.3));
    P(54, 22, -88, 3, 3, { bounce: true });
    P(54, 29, -95, 9, 9);
    this.flag = new THREE.Vector3(54, 29, -97);
    // bayrak ve kupa
    const pole = mesh(new THREE.CylinderGeometry(0.12, 0.12, 6, 8), toon('#ffffff'));
    pole.position.set(this.flag.x, this.flag.y + 3, this.flag.z);
    const flag = mesh(new THREE.BoxGeometry(2.4, 1.4, 0.08), toon('#ef4b4b'));
    flag.position.set(this.flag.x + 1.2, this.flag.y + 5.2, this.flag.z);
    const cup = outline(mesh(new THREE.CylinderGeometry(0.7, 0.35, 1.2, 14), toon('#ffc83d')), 1.06);
    cup.position.set(this.flag.x - 2, this.flag.y + 0.6, this.flag.z + 1);
    this.scene.add(pole, flag, cup);
    // yıldızlar yol boyunca
    for (const [x, y, z] of [[2, 13.5, -14], [0, 14.5, -27], [0, 14, -46], [6, 20, -66], [36, 24, -66], [50, 24.5, -66], [54, 25.5, -81], [54, 26, -88]]) {
      const s = star();
      s.position.set(x, y, z);
      this.scene.add(s);
      this.stars.push({ obj: s, taken: false });
    }
    // aşağıda bulut denizi
    for (let i = 0; i < 40; i++) {
      const c = cloud(3 + (i % 3));
      c.position.set(-60 + (i % 8) * 22, -6 - (i % 4), 30 - Math.floor(i / 8) * 34);
      this.scene.add(c);
    }
    this.cam = [12, 8];
  }

  floor(x: number, z: number, y: number) {
    let best = -Infinity;
    for (const p of this.plats) {
      const r = p.bounce ? p.w / 2 : 0;
      const inside = r ? Math.hypot(x - p.x, z - p.z) < r : Math.abs(x - p.x) <= p.w / 2 + 0.3 && Math.abs(z - p.z) <= p.d / 2 + 0.3;
      if (inside && p.y <= y + 0.45 && p.y > best) best = p.y;
    }
    return best;
  }
  blocked(x: number, z: number, y: number) {
    for (const p of this.plats) {
      if (p.bounce) continue;
      if (Math.abs(x - p.x) < p.w / 2 + 0.3 && Math.abs(z - p.z) < p.d / 2 + 0.3 && y + 0.45 < p.y && y + 3 > p.y - p.h) return true;
    }
    return false;
  }
  update(dt: number, t: number, hero: Hero) {
    this.tick(dt);
    for (const p of this.plats) {
      if (!p.move) continue;
      const v = p.move.base + Math.sin(t * p.move.sp + p.move.ph) * p.move.amp;
      const old = { x: p.x, y: p.y, z: p.z };
      if (p.move.ax === 'x') p.x = v;
      else if (p.move.ax === 'y') p.y = v;
      else p.z = v;
      p.dx = p.x - old.x;
      p.dy = p.y - old.y;
      p.dz = p.z - old.z;
      p.mesh.position.set(p.x, p.y - p.h / 2, p.z);
    }
    // üstünde durulan platform: taşır; mantar: zıplatır; kontrol noktası
    if (hero.grounded) {
      for (const p of this.plats) {
        const r = p.bounce ? p.w / 2 : 0;
        const inside = r ? Math.hypot(hero.pos.x - p.x, hero.pos.z - p.z) < r : Math.abs(hero.pos.x - p.x) <= p.w / 2 + 0.3 && Math.abs(hero.pos.z - p.z) <= p.d / 2 + 0.3;
        if (!inside || Math.abs(hero.pos.y - p.y) > 0.5) continue;
        hero.pos.x += p.dx;
        hero.pos.z += p.dz;
        hero.pos.y += Math.max(0, p.dy);
        if (p.bounce) {
          hero.vy = 24;
          hero.grounded = false;
          this.ev.sound.pop();
          this.sparkles.burst(new THREE.Vector3(p.x, p.y + 0.5, p.z), 10, '#ffffff');
        }
        if (p.check && this.checkpoint.distanceTo(new THREE.Vector3(p.x, p.y, p.z)) > 1) {
          this.checkpoint.set(p.x, p.y, p.z);
          this.checks++;
          this.ev.msg('Kontrol noktası!');
          this.sparkles.burst(new THREE.Vector3(p.x, p.y + 1, p.z), 16, '#7cc760');
        }
        break;
      }
    }
    for (const s of this.stars) {
      if (s.taken) continue;
      s.obj.rotation.y += dt * 2;
      if (hero.pos.clone().setY(hero.pos.y + 1.4).distanceTo(s.obj.position) < 1.8) {
        s.taken = true;
        s.obj.visible = false;
        this.found++;
        this.sparkles.burst(s.obj.position.clone(), 12);
        this.ev.sound.star(this.found);
        this.ev.progress(`⭐ ${this.found}/${this.stars.length}`);
      }
    }
    if (!this.done && hero.grounded && Math.hypot(hero.pos.x - this.flag.x, hero.pos.z - this.flag.z) < 4 && Math.abs(hero.pos.y - this.flag.y) < 0.6) {
      this.done = true;
      this.sparkles.burst(this.flag.clone().setY(this.flag.y + 3), 30);
      this.ev.finish(this.found * 2, 'Parkuru bitirdin, harikasın!');
    }
    return super.update(dt, t, hero);
  }
}

// ================================================================================================
// Şeker Diyarı
// ================================================================================================
const CANDY_GOAL = 20, CANDY_TIME = 75;

export class CandyRealm extends Realm {
  readonly id = 'candy' as const;
  goal = `${CANDY_TIME} saniyede ${CANDY_GOAL} şeker topla!`;
  private candies: { obj: THREE.Object3D; taken: boolean; base: number }[] = [];
  private jellies: { x: number; z: number; r: number; y: number; obj: THREE.Object3D }[] = [];
  private got = 0;
  private left = CANDY_TIME;
  private R = 42;

  constructor(ev: RealmEvents, seed: number) {
    super(ev, '#ffd6ec', [70, 200]);
    const ground = outline(mesh(new THREE.CylinderGeometry(this.R, this.R - 3, 4, 48), toon('#ffb3d1')), 1.01);
    ground.position.y = -2;
    this.scene.add(ground);
    const icing = mesh(new THREE.CylinderGeometry(this.R + 0.3, this.R + 0.3, 0.4, 48), toon('#ffffff'), false);
    icing.position.y = -0.15;
    this.scene.add(icing);
    const top = mesh(new THREE.CircleGeometry(this.R - 0.2, 48), toon('#ffe3f0'), false);
    top.rotation.x = -Math.PI / 2;
    top.position.y = 0.06;
    this.scene.add(top);
    const r = rng(seed ^ 0x51ed);
    // lolipop ağaçları ve şeker kamışları
    for (let i = 0; i < 26; i++) {
      const a = r() * Math.PI * 2, d = 10 + r() * (this.R - 14);
      const x = Math.cos(a) * d, z = Math.sin(a) * d;
      const g = new THREE.Group();
      const stick = mesh(new THREE.CylinderGeometry(0.18, 0.18, 4, 8), toon('#ffffff'));
      stick.position.y = 2;
      const lol = outline(mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.5, 20), toon(['#ff6b8a', '#9775fa', '#4dabf7', '#ffd43b', '#69db7c'][i % 5])), 1.04);
      lol.rotation.x = Math.PI / 2;
      lol.position.y = 4.6;
      const sw = mesh(new THREE.TorusGeometry(0.8, 0.12, 6, 20), toon('#ffffff'), false);
      sw.position.set(0, 4.6, 0.27);
      g.add(stick, lol, sw);
      g.position.set(x, 0, z);
      g.rotation.y = r() * Math.PI;
      this.scene.add(g);
    }
    // jöle tepeleri (üstüne zıplanır)
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + 0.3, d = 22;
      const x = Math.cos(a) * d, z = Math.sin(a) * d, rr = 2.6, y = 1.8;
      const j = new THREE.Mesh(new THREE.CylinderGeometry(rr, rr + 0.3, y, 18), new THREE.MeshToonMaterial({ color: ['#69db7c', '#ff922b', '#f783ac'][i % 3], transparent: true, opacity: 0.85 }));
      j.position.set(x, y / 2, z);
      j.castShadow = true;
      this.scene.add(j);
      this.jellies.push({ x, z, r: rr, y, obj: j });
    }
    // şekerler
    const cols = ['#ff6b8a', '#ffd43b', '#4dabf7', '#69db7c', '#9775fa', '#ff922b'];
    for (let i = 0; i < 30; i++) {
      const a = r() * Math.PI * 2, d = 4 + r() * (this.R - 7);
      const onJelly = i < 7;
      const x = onJelly ? this.jellies[i].x : Math.cos(a) * d, z = onJelly ? this.jellies[i].z : Math.sin(a) * d;
      const base = onJelly ? this.jellies[i].y + 1.3 : 1.2;
      const g = new THREE.Group();
      const body = outline(mesh(new THREE.SphereGeometry(0.42, 12, 10), toon(cols[i % cols.length])), 1.08);
      body.scale.x = 1.3;
      g.add(body);
      for (const s of [-1, 1]) {
        const w = mesh(new THREE.ConeGeometry(0.3, 0.45, 8), toon(cols[i % cols.length]));
        w.rotation.z = (s * Math.PI) / 2;
        w.position.x = s * 0.7;
        g.add(w);
      }
      g.position.set(x, base, z);
      this.scene.add(g);
      this.candies.push({ obj: g, taken: false, base });
    }
    for (let i = 0; i < 10; i++) {
      const c = cloud(3, '#ffffff');
      c.position.set(Math.cos(i) * 80, 18 + (i % 3) * 6, Math.sin(i) * 80);
      this.scene.add(c);
    }
    this.spawn.set(0, 0, 6);
    this.spawnH = Math.PI;
    this.checkpoint.copy(this.spawn);
    this.placeExit(0, 0, 12, Math.PI);
    this.killY = -10;
  }

  floor(x: number, z: number, y: number) {
    for (const j of this.jellies) if (Math.hypot(x - j.x, z - j.z) < j.r && j.y <= y + 0.45) return j.y;
    return Math.hypot(x, z) < this.R ? 0 : -Infinity;
  }
  blocked(x: number, z: number, y: number) {
    for (const j of this.jellies) if (Math.hypot(x - j.x, z - j.z) < j.r + 0.4 && y + 0.45 < j.y) return true;
    return false;
  }
  update(dt: number, t: number, hero: Hero) {
    this.tick(dt);
    if (!this.done) {
      const before = Math.ceil(this.left);
      this.left -= dt;
      if (Math.ceil(this.left) !== before) this.ev.progress(`🍬 ${this.got}/${CANDY_GOAL}  ⏱ ${Math.max(0, Math.ceil(this.left))}`);
      if (this.left <= 0) {
        this.done = true;
        this.ev.finish(this.got, this.got >= CANDY_GOAL ? 'Bütün şekerleri topladın!' : `Süre bitti! ${this.got} şeker topladın.`);
      }
    }
    for (const j of this.jellies) j.obj.scale.y = 1 + Math.sin(t * 4 + j.x) * 0.04;
    for (const c of this.candies) {
      if (c.taken) continue;
      c.obj.rotation.y += dt * 2;
      c.obj.position.y = c.base + Math.sin(t * 3 + c.obj.position.x) * 0.2;
      if (!this.done && hero.pos.clone().setY(hero.pos.y + 1).distanceTo(c.obj.position) < 1.8) {
        c.taken = true;
        c.obj.visible = false;
        this.got++;
        this.sparkles.burst(c.obj.position.clone(), 10, '#ffd1e8');
        this.ev.sound.star(this.got);
        this.ev.progress(`🍬 ${this.got}/${CANDY_GOAL}  ⏱ ${Math.max(0, Math.ceil(this.left))}`);
        if (this.got >= CANDY_GOAL) {
          this.done = true;
          this.ev.finish(this.got, `${CANDY_GOAL} şekerin hepsini topladın!`);
        }
      }
    }
    return super.update(dt, t, hero);
  }
}

export function makeRealm(id: RealmId, ev: RealmEvents, seed: number): Realm {
  if (id === 'maze') return new MazeRealm(ev, seed);
  if (id === 'sky') return new SkyRealm(ev);
  return new CandyRealm(ev, seed);
}
