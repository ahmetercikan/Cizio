/**
 * Yarış Kıyısı'ndaki kapıların ardındaki dünyalar: rakiple yarışılan parkurlar (Volkan, Buz), Engelli Koşu ve
 * Kart Yarışı. Hepsi ada motorunun yardımlı zıplamasını kullanır (`surfaces`, jumpAssist.ts): çocuk platforma
 * doğru zıplayınca karakter üstüne iner, havada bir kez daha zıplanır, düşünce son basılan yere dönülür.
 * Rakipler çocuğu fazla geride bırakmaz, çok da yavaş kalmaz: yarış hep heyecanlı, kazanmak mümkün.
 */
import * as THREE from 'three';
import { cloud, mesh, outline, star, toon, tree } from '../play3d/kit';
import { Avatar3D } from './avatar3d';
import { PRESETS } from '../dressup/catalog';
import { carModel } from './cars';
import { Realm, type Hero, type RealmEvents } from './realms';
import type { Surface } from './jumpAssist';
import type { Vehicle } from './zones';
import { RACE_LINES as L } from './raceLines';

/** Rakip: hazır bebeklerden biri, kendi kıyafetiyle. */
function rivalAvatar(scene: THREE.Scene, i: number) {
  const av = new Avatar3D({ ...PRESETS[(i * 3 + 2) % PRESETS.length], hat: '', hand: '', pet: '', back: '', bg: 'park' });
  scene.add(av.root);
  return av;
}

/** Yarış sırası (1 birinci). */
const RANK_BONUS = [20, 12, 8, 5];
const rankText = (r: number) => L.rank[Math.min(r, 4) - 1];

/** Damalı bitiş bayrağı dokusu. */
function checker(n = 8) {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const x = c.getContext('2d')!;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    x.fillStyle = (i + j) % 2 ? '#222' : '#fff';
    x.fillRect((i * 64) / n, (j * 64) / n, 64 / n, 64 / n);
  }
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Başlangıç ya da bitiş kemeri (iki direk, damalı pankart). */
function arch(w: number) {
  const g = new THREE.Group();
  for (const s of [-1, 1]) {
    const p = outline(mesh(new THREE.CylinderGeometry(0.3, 0.35, 5, 10), toon('#ffffff')), 1.05);
    p.position.set((s * w) / 2, 2.5, 0);
    g.add(p);
  }
  const t = checker();
  t.wrapS = THREE.RepeatWrapping;
  t.repeat.set(w / 2, 1);
  const ban = mesh(new THREE.BoxGeometry(w, 1.2, 0.2), new THREE.MeshToonMaterial({ map: t }), false);
  ban.position.y = 5;
  g.add(ban);
  return g;
}

// ================================================================================================
// Rakipli parkur: Volkan ve Buz
// ================================================================================================
interface PPlat {
  x: number; y: number; z: number; w: number; d: number; h: number;
  kind?: 'move' | 'bounce' | 'check';
  move?: { amp: number; sp: number; ph: number; base: number };
  mesh: THREE.Object3D;
  dx: number;
}

const THEMES = {
  volkan: {
    sky: '#ffb38a', fog: [70, 230] as [number, number], below: '#ff6a00', belowGlow: '#ff3d00', plats: ['#6b4f4f', '#7d5a50', '#5e4b56'], top: '#ff9f43',
    goal: L.goalVolkan, start: L.rivalVolkan, rivalDone: L.rivalDoneVolkan, first: L.firstVolkan,
  },
  buz: {
    sky: '#d8f1ff', fog: [70, 230] as [number, number], below: '#7cc8f0', belowGlow: '#2a8ac4', plats: ['#e9f6ff', '#cfeaff', '#b9e1ff'], top: '#ffffff',
    goal: L.goalBuz, start: L.rivalBuz, rivalDone: L.rivalDoneBuz, first: L.firstBuz,
  },
};

export class ParkourRealm extends Realm {
  readonly id: 'volkan' | 'buz';
  goal: string;
  icon = 'kupa';
  private plats: PPlat[] = [];
  private stars: { obj: THREE.Object3D; taken: boolean }[] = [];
  private found = 0;
  private flag = new THREE.Vector3();
  private rival: Avatar3D;
  private th: (typeof THEMES)['volkan'];
  /** Rakibin bulunduğu platform, atlayışın ilerlemesi ve bekleme. */
  private ri = 0;
  private rHop = -1;
  private rWait = 2.5;
  private rFrom = new THREE.Vector3();
  private rPos = new THREE.Vector3();
  private rivalDone = false;
  /** Kahramanın ulaştığı en ileri platform. */
  private best = 0;
  private clockT = 0;
  private shown = '';
  private lava: THREE.Mesh;

  constructor(ev: RealmEvents, id: 'volkan' | 'buz') {
    const th = THEMES[id];
    super(ev, th.sky, th.fog);
    this.id = id;
    this.goal = th.goal;
    this.th = th;
    this.killY = 4;
    this.cam = [12, 8];
    // aşağıda lav ya da buzlu su
    this.lava = new THREE.Mesh(new THREE.PlaneGeometry(600, 600).rotateX(-Math.PI / 2), toon(th.below, { emissive: th.belowGlow }));
    (this.lava.material as THREE.MeshToonMaterial).emissiveIntensity = id === 'volkan' ? 0.55 : 0.15;
    this.lava.position.set(0, 1.5, -100);
    this.scene.add(this.lava);
    // parkur: ilerledikçe biraz zorlaşır (küçülen taşlar, kayan taşlar, zıplatan mantarlar); her 6 taşta kontrol
    const P = (x: number, y: number, z: number, w: number, d: number, kind?: PPlat['kind'], move?: { amp: number; sp: number }) => {
      const h = kind === 'bounce' ? 0.8 : 1.4;
      let m: THREE.Object3D;
      if (kind === 'bounce') {
        const g = new THREE.Group();
        const cap = outline(mesh(new THREE.SphereGeometry(w / 2, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon(id === 'volkan' ? '#ef4b4b' : '#9775fa')), 1.04);
        cap.scale.y = 0.6;
        const stem = mesh(new THREE.CylinderGeometry(w / 5, w / 4, 1.2, 10), toon('#fff1c7'));
        stem.position.y = -0.6;
        g.add(cap, stem);
        m = g;
      } else {
        const g = new THREE.Group();
        const col = kind === 'check' ? '#7cc760' : th.plats[this.plats.length % th.plats.length];
        const body = outline(mesh(new THREE.BoxGeometry(w, h, d), toon(col)), 1.02);
        g.add(body);
        const cap = mesh(new THREE.BoxGeometry(w * 0.92, 0.12, d * 0.92), toon(kind === 'check' ? '#a9e58f' : th.top, id === 'volkan' && kind !== 'check' ? { emissive: '#7a2e00' } : {}), false);
        cap.position.y = h / 2 + 0.04;
        cap.receiveShadow = false; // ince kapakta gölge çizgileri oluşmasın
        g.add(cap);
        if (id === 'buz' && kind !== 'check') {
          // buz sarkıtları
          for (let k = 0; k < 3; k++) {
            const ic = mesh(new THREE.ConeGeometry(0.22, 0.9, 6), toon('#cfeaff'), false);
            ic.rotation.x = Math.PI;
            ic.position.set((k - 1) * w * 0.28, -h / 2 - 0.4, d * 0.3);
            g.add(ic);
          }
        }
        m = g;
      }
      m.position.set(x, kind === 'bounce' ? y - w * 0.3 : y - h / 2, z);
      this.scene.add(m);
      const p: PPlat = { x, y, z, w, d, h, kind, mesh: m, dx: 0, move: move ? { ...move, ph: this.plats.length, base: x } : undefined };
      this.plats.push(p);
      return p;
    };
    P(0, 10, 0, 10, 10);
    this.spawn.set(1.5, 10, 2);
    this.spawnH = Math.PI;
    this.checkpoint.copy(this.spawn);
    this.placeExit(-3.5, 10, 3.5, Math.PI / 4);
    const wig = [0, 3, -2.5, 2, -3, 1.5, -1];
    const rise = [0, 0.8, 0, -0.6, 0.7, 0.3];
    let x = 0, y = 10, z = -5;
    for (let i = 1; i <= 26; i++) {
      const size = Math.max(2.8, 4.3 - i * 0.055);
      z -= 4.5 + (i % 3) + size / 2;
      x = wig[i % wig.length] * (1 + i / 26);
      if (i % 6 === 0) {
        P(x, y, z - 1, 6, 6, 'check');
        z -= 4;
        continue;
      }
      if (i % 7 === 3) P(x, y, z, size + 0.4, size + 0.4, 'move', { amp: 2.6, sp: 0.8 + i * 0.015 });
      else if (i % 9 === 5) {
        P(x, y - 1.2, z, 3, 3, 'bounce');
        y += 4.5;
      } else {
        y += rise[i % rise.length];
        P(x, y, z, size, size);
      }
      z -= size / 2;
    }
    // bitiş: büyük taş, bayrak ve kupa
    z -= 9;
    P(0, y + 0.5, z, 10, 10);
    this.flag.set(0, y + 0.5, z - 2);
    const pole = mesh(new THREE.CylinderGeometry(0.12, 0.12, 6, 8), toon('#ffffff'));
    pole.position.set(this.flag.x, this.flag.y + 3, this.flag.z);
    const fl = mesh(new THREE.BoxGeometry(2.4, 1.4, 0.08), new THREE.MeshToonMaterial({ map: checker() }));
    fl.position.set(this.flag.x + 1.2, this.flag.y + 5.2, this.flag.z);
    const cup = outline(mesh(new THREE.CylinderGeometry(0.7, 0.35, 1.2, 14), toon('#ffc83d')), 1.06);
    cup.position.set(this.flag.x - 2, this.flag.y + 0.6, this.flag.z + 1);
    this.scene.add(pole, fl, cup);
    // yıldızlar: atlayışların tepesinde (yardımlı zıplama çoğunu kendiliğinden toplar)
    for (let i = 2; i < this.plats.length - 1; i += 3) {
      const a = this.plats[i - 1], b = this.plats[i];
      const s = star();
      s.position.set((a.x + b.x) / 2, Math.max(a.y, b.y) + 2.6, (a.z + b.z) / 2);
      this.scene.add(s);
      this.stars.push({ obj: s, taken: false });
    }
    // uzaktaki süs: volkanlar ya da buz dağları, bulutlar
    for (let i = 0; i < 14; i++) {
      const side = i % 2 ? 1 : -1;
      const cone = outline(mesh(new THREE.ConeGeometry(14 + (i % 4) * 4, 26 + (i % 3) * 8, 8), toon(id === 'volkan' ? '#5e4b56' : '#ffffff')), 1.01);
      cone.position.set(side * (45 + (i % 3) * 18), 12, -i * 18 + 10);
      this.scene.add(cone);
      if (id === 'volkan') {
        const top = mesh(new THREE.ConeGeometry(4, 4, 8), toon('#ff6a00', { emissive: '#ff3d00' }), false);
        top.position.set(cone.position.x, 24 + (i % 3) * 4, cone.position.z);
        this.scene.add(top);
      }
    }
    for (let i = 0; i < 16; i++) {
      const c = cloud(3 + (i % 3));
      c.position.set(-70 + (i % 8) * 20, 34 + (i % 3) * 4, 20 - Math.floor(i / 8) * 90);
      this.scene.add(c);
    }
    // rakip, başlangıç taşının öbür yanında
    this.rival = rivalAvatar(this.scene, id === 'volkan' ? 0 : 1);
    this.rPos.set(-1.5, 10, 2);
    this.rival.root.position.copy(this.rPos);
    this.rival.root.rotation.y = Math.PI;
    this.ev.msg(th.start);
  }

  private platAt(p: PPlat, t: number) {
    return p.move ? p.move.base + Math.sin(t * p.move.sp + p.move.ph) * p.move.amp : p.x;
  }
  surfaces(): Surface[] {
    return this.plats.map((p) => ({
      x: p.x, y: p.y, z: p.z, w: p.w, d: p.d, round: p.kind === 'bounce',
      at: p.move ? (dt: number) => ({ x: this.platAt(p, this.clockT + dt), y: p.y, z: p.z }) : undefined,
    }));
  }
  private on(p: PPlat, x: number, z: number, pad = 0.45) {
    return p.kind === 'bounce' ? Math.hypot(x - p.x, z - p.z) < p.w / 2 + 0.3 : Math.abs(x - p.x) <= p.w / 2 + pad && Math.abs(z - p.z) <= p.d / 2 + pad;
  }
  floor(x: number, z: number, y: number) {
    let best = -Infinity;
    for (const p of this.plats) if (this.on(p, x, z) && p.y <= y + 0.45 && p.y > best) best = p.y;
    return best;
  }
  blocked(x: number, z: number, y: number) {
    for (const p of this.plats) {
      if (p.kind === 'bounce') continue;
      if (this.on(p, x, z, 0.3) && y + 0.45 < p.y && y + 3 > p.y - p.h) return true;
    }
    return false;
  }

  /** Rakip taştan taşa zıplar; çocuk çok gerideyse bekler, öndeyse biraz hızlanır. */
  private stepRival(dt: number) {
    if (this.rivalDone) {
      this.rival.update(dt, this.clockT, 'cheer', 0);
      return;
    }
    const last = this.plats.length - 1;
    const lead = this.ri - this.best;
    if (this.rHop < 0) {
      this.rWait -= dt * (lead > 2 ? 0.45 : lead < -2 ? 1.6 : 1);
      if (this.rWait <= 0) {
        this.rHop = 0;
        this.rFrom.copy(this.rPos);
      }
      this.rival.update(dt, this.clockT, 'idle', 0);
      return;
    }
    const next = this.plats[this.ri + 1];
    this.rHop = Math.min(1, this.rHop + dt / 0.85);
    const u = this.rHop;
    const tx = this.platAt(next, this.clockT) + (next.kind === 'bounce' ? 0 : -0.8), tz = next.z + 0.6;
    this.rPos.set(this.rFrom.x + (tx - this.rFrom.x) * u, this.rFrom.y + (next.y - this.rFrom.y) * u + Math.sin(u * Math.PI) * (2.4 + Math.max(0, next.y - this.rFrom.y)), this.rFrom.z + (tz - this.rFrom.z) * u);
    this.rival.root.rotation.y = Math.atan2(tx - this.rFrom.x, tz - this.rFrom.z);
    this.rival.update(dt, this.clockT, 'jump', 1);
    if (u >= 1) {
      this.ri++;
      this.rHop = -1;
      this.rWait = 1.1 + ((this.ri * 37) % 10) / 12;
      if (this.ri >= last) {
        this.rivalDone = true;
        if (!this.done) this.ev.msg(this.th.rivalDone);
      }
    }
  }

  update(dt: number, t: number, hero: Hero) {
    this.tick(dt);
    this.clockT = t;
    (this.lava.material as THREE.MeshToonMaterial).emissiveIntensity = this.id === 'volkan' ? 0.5 + Math.sin(t * 2) * 0.08 : 0.15;
    for (const p of this.plats) {
      if (!p.move) continue;
      const nx = this.platAt(p, t);
      p.dx = nx - p.x;
      p.x = nx;
      p.mesh.position.x = nx;
    }
    if (hero.grounded) {
      for (let i = 0; i < this.plats.length; i++) {
        const p = this.plats[i];
        if (!this.on(p, hero.pos.x, hero.pos.z) || Math.abs(hero.pos.y - p.y) > 0.5) continue;
        hero.pos.x += p.dx;
        if (i > this.best) this.best = i;
        if (p.kind === 'bounce') {
          hero.launch = 23;
          hero.grounded = false;
          this.ev.sound.fx?.('boing');
          this.sparkles.burst(new THREE.Vector3(p.x, p.y + 0.5, p.z), 10, '#ffffff');
        }
        if (p.kind === 'check' && this.checkpoint.distanceTo(new THREE.Vector3(p.x, p.y, p.z)) > 1) {
          this.checkpoint.set(p.x, p.y, p.z);
          this.ev.msg(L.check);
          this.sparkles.burst(new THREE.Vector3(p.x, p.y + 1, p.z), 16, '#7cc760');
        }
        break;
      }
    }
    this.stepRival(dt);
    this.rival.root.position.copy(this.rPos);
    for (const s of this.stars) {
      if (s.taken) continue;
      s.obj.rotation.y += dt * 2;
      if (hero.pos.clone().setY(hero.pos.y + 1.2).distanceTo(s.obj.position) < 2) {
        s.taken = true;
        s.obj.visible = false;
        this.found++;
        this.sparkles.burst(s.obj.position.clone(), 12);
        this.ev.sound.star(this.found);
      }
    }
    const rank = this.done ? 0 : this.best >= this.ri ? 1 : 2;
    const text = `${this.found}/${this.stars.length} · ${rank || 1}.`;
    if (text !== this.shown) {
      this.shown = text;
      this.ev.progress(text);
    }
    // son taşa inmek yeter (bayrağa kadar yürümek gerekmez)
    if (!this.done && hero.grounded && this.best === this.plats.length - 1) {
      this.done = true;
      const first = !this.rivalDone;
      this.rivalDone = true;
      this.sparkles.burst(this.flag.clone().setY(this.flag.y + 3), 30);
      this.ev.sound.fx?.('cheer');
      this.ev.finish(this.found * 2 + (first ? 12 : 4), first ? this.th.first : L.parkourDone);
    }
    return super.update(dt, t, hero);
  }
  dispose() {
    this.rival.dispose();
    super.dispose();
  }
}

// ================================================================================================
// Engelli Koşu
// ================================================================================================
const RUN_L = 236;
/** Çukurlar (zemin yok): [başlangıç z, bitiş z]; içlerindeki taşlar ayrı. */
const PITS: [number, number][] = [[-62, -80], [-118, -142], [-188, -204]];
const HURDLES = [-24, -38, -50, -92, -104, -156, -168, -216];

export class RunRealm extends Realm {
  readonly id = 'kosu' as const;
  goal = L.goalKosu;
  icon = 'kupa';
  private stones: { x: number; y: number; z: number; w: number; d: number; move?: number; mesh: THREE.Object3D; dx: number }[] = [];
  private pads: { x: number; z: number; r: number }[] = [];
  private rivals: { av: Avatar3D; x: number; z: number; sp: number; done: number }[] = [];
  private start = 3.2;
  private heroDone = 0;
  private clockT = 0;
  private shown = '';
  private finishedAt = 0;

  constructor(ev: RealmEvents) {
    super(ev, '#bfe9ff', [80, 260]);
    this.killY = -5;
    this.cam = [11, 6.5];
    // çim ve koşu yolu (çukurlarda yol yok)
    const grass = mesh(new THREE.PlaneGeometry(400, 500).rotateX(-Math.PI / 2), toon('#8fd16f'), false);
    grass.position.set(0, -0.02, -120);
    this.scene.add(grass);
    const segs: [number, number][] = [];
    let z0 = 12;
    for (const [a, b] of PITS) {
      segs.push([z0, a]);
      z0 = b;
    }
    segs.push([z0, -RUN_L - 12]);
    const lanes = toon('#e86a4b');
    for (const [a, b] of segs) {
      const road = mesh(new THREE.BoxGeometry(13, 0.4, a - b), lanes, false);
      road.position.set(0, -0.2, (a + b) / 2);
      this.scene.add(road);
      for (const lx of [-3.25, 0, 3.25]) {
        const line = mesh(new THREE.PlaneGeometry(0.12, a - b).rotateX(-Math.PI / 2), toon('#ffffff'), false);
        line.position.set(lx, 0.01, (a + b) / 2);
        this.scene.add(line);
      }
    }
    // çukurlar: su, içinde basamak taşları; ikinci çukurda kayan taşlar, üçüncüde trambolin ve büyük ada
    for (const [a, b] of PITS) {
      const w = mesh(new THREE.BoxGeometry(13, 0.2, a - b), toon('#49c4ea', { emissive: '#0d4a66' }), false);
      w.position.set(0, -2.4, (a + b) / 2);
      this.scene.add(w);
    }
    const stone = (x: number, y: number, z: number, w: number, move?: number) => {
      const m = outline(mesh(new THREE.BoxGeometry(w, 1, w), toon(move ? '#ffc83d' : '#b39ddb')), 1.03);
      m.position.set(x, y - 0.5, z);
      this.scene.add(m);
      this.stones.push({ x, y, z, w, d: w, move, mesh: m, dx: 0 });
    };
    stone(0, 0, -67, 4);
    stone(1.5, 0.4, -74, 4);
    stone(0, 0, -124, 3.6, 0.9);
    stone(0, 0.3, -130.5, 3.6, 1.1);
    stone(0, 0, -137, 3.6, 1.3);
    stone(0, 2.6, -196, 7);
    // trambolin: çukurun önünde, ortadaki yüksek adaya fırlatır
    this.pads.push({ x: 0, z: -184, r: 1.6 });
    const pad = new THREE.Group();
    const ring = outline(mesh(new THREE.TorusGeometry(1.6, 0.22, 8, 24).rotateX(Math.PI / 2), toon('#3a3f4a')), 1.04);
    ring.position.y = 0.5;
    const mat = mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.08, 24), toon('#4dabf7'), false);
    mat.position.y = 0.48;
    pad.add(ring, mat);
    pad.position.set(0, 0, -184);
    this.scene.add(pad);
    // engeller (çocuk zıplamazsa takılır)
    for (const hz of HURDLES) {
      const g = new THREE.Group();
      for (const s of [-1, 1]) {
        const leg = mesh(new THREE.BoxGeometry(0.2, 0.8, 0.2), toon('#ffffff'), false);
        leg.position.set(s * 6.2, 0.4, 0);
        g.add(leg);
      }
      for (let k = 0; k < 6; k++) {
        const bar = outline(mesh(new THREE.BoxGeometry(2.08, 0.3, 0.16), toon(k % 2 ? '#ffffff' : '#ef4b4b')), 1.04);
        bar.position.set(-5.2 + k * 2.08, 0.75, 0);
        g.add(bar);
      }
      g.position.z = hz;
      this.scene.add(g);
    }
    // kenarda tribünler, ağaçlar ve bayraklar; başlangıç ve bitiş kemerleri
    for (let z = 0; z > -RUN_L; z -= 24) {
      for (const s of [-1, 1]) {
        const t = tree(z % 48 ? 'round' : 'pine', 1.6);
        t.position.set(s * (12 + ((-z / 24) % 3) * 3), 0, z - 8);
        this.scene.add(t);
      }
    }
    for (const s of [-1, 1]) {
      const stand = outline(mesh(new THREE.BoxGeometry(4, 3, 40), toon(s < 0 ? '#5b8def' : '#ffc83d')), 1.01);
      stand.position.set(s * 10.5, 1.5, -RUN_L + 18);
      this.scene.add(stand);
    }
    const a1 = arch(13.4);
    a1.position.set(0, 0, 0);
    const a2 = arch(13.4);
    a2.position.set(0, 0, -RUN_L);
    this.scene.add(a1, a2);
    this.spawn.set(1.6, 0, 2);
    this.spawnH = Math.PI;
    this.checkpoint.copy(this.spawn);
    this.placeExit(-9, 0, 6, Math.PI / 2);
    // üç rakip
    [[-4.6, 9.4], [-1.6, 10.2], [4.6, 10.8]].forEach(([x, sp], i) => {
      const av = rivalAvatar(this.scene, i + 2);
      av.root.position.set(x, 0, 2);
      av.root.rotation.y = Math.PI;
      this.rivals.push({ av, x, z: 2, sp, done: 0 });
    });
    this.ev.msg(L.ready);
  }

  private inPit(z: number) {
    return PITS.some(([a, b]) => z < a && z > b);
  }
  surfaces(): Surface[] {
    const out: Surface[] = [];
    let z0 = 12;
    for (const [a, b] of PITS) {
      out.push({ x: 0, y: 0, z: (z0 + a) / 2, w: 13, d: z0 - a });
      z0 = b;
    }
    out.push({ x: 0, y: 0, z: (z0 - RUN_L - 12) / 2, w: 13, d: z0 + RUN_L + 12 });
    for (const s of this.stones) {
      out.push({
        x: s.x, y: s.y, z: s.z, w: s.w, d: s.d,
        at: s.move ? (dt: number) => ({ x: Math.sin((this.clockT + dt) * s.move!) * 3.5, y: s.y, z: s.z }) : undefined,
      });
    }
    return out;
  }
  floor(x: number, z: number, y: number) {
    let best = Math.abs(x) <= 6.8 && z < 14 && z > -RUN_L - 14 && !this.inPit(z) ? 0 : -Infinity;
    for (const s of this.stones) if (Math.abs(x - s.x) <= s.w / 2 + 0.45 && Math.abs(z - s.z) <= s.d / 2 + 0.45 && s.y <= y + 0.45 && s.y > best) best = s.y;
    return best;
  }
  blocked(x: number, z: number, y: number) {
    if (Math.abs(x) > 6.4 && y < 4) return true;
    if (z > 13.5 || z < -RUN_L - 13) return true;
    for (const hz of HURDLES) if (Math.abs(z - hz) < 0.45 && y < 0.9) return true;
    // yarış başlamadan çizginin önüne geçilmez
    if (this.start > 0 && z < -0.6) return true;
    for (const s of this.stones) if (Math.abs(x - s.x) < s.w / 2 + 0.3 && Math.abs(z - s.z) < s.d / 2 + 0.3 && y + 0.45 < s.y && y + 3 > s.y - 1) return true;
    return false;
  }

  /** Rakibin yüksekliği: engelin üstünden atlar, çukurda taştan taşa sıçrar. */
  private rivalY(z: number) {
    for (const hz of HURDLES) {
      const d = Math.abs(z - hz);
      if (d < 2.2) return Math.cos((d / 2.2) * Math.PI / 2) * 1.6;
    }
    for (const [a, b] of PITS) {
      if (z >= a || z <= b) continue;
      const hops = [a, ...this.stones.filter((s) => s.z < a && s.z > b).map((s) => s.z), b];
      for (let i = 1; i < hops.length; i++) {
        if (z <= hops[i - 1] && z >= hops[i]) {
          const u = (hops[i - 1] - z) / (hops[i - 1] - hops[i]);
          const base = i < hops.length - 1 ? this.stones.find((s) => s.z === hops[i])?.y ?? 0 : 0;
          return base * u + Math.sin(u * Math.PI) * 2.6;
        }
      }
    }
    return 0;
  }

  update(dt: number, t: number, hero: Hero) {
    this.tick(dt);
    this.clockT = t;
    if (this.start > 0) {
      const before = Math.ceil(this.start);
      this.start -= dt;
      const now = Math.ceil(this.start);
      if (now !== before && now > 0) this.ev.msg(L.count[now - 1]);
      if (this.start <= 0) {
        this.ev.msg(L.run);
        this.ev.sound.fx?.('whistle');
      }
    }
    for (const s of this.stones) {
      if (!s.move) continue;
      const nx = Math.sin(t * s.move) * 3.5;
      s.dx = nx - s.x;
      s.x = nx;
      s.mesh.position.x = nx;
    }
    if (hero.grounded) {
      for (const s of this.stones) if (Math.abs(hero.pos.x - s.x) <= s.w / 2 + 0.45 && Math.abs(hero.pos.z - s.z) <= s.d / 2 + 0.45 && Math.abs(hero.pos.y - s.y) < 0.5) hero.pos.x += s.dx;
      for (const p of this.pads) {
        if (Math.hypot(hero.pos.x - p.x, hero.pos.z - p.z) < p.r && hero.pos.y < 0.6) {
          hero.launch = 21;
          hero.grounded = false;
          this.ev.sound.fx?.('boing');
          this.sparkles.burst(new THREE.Vector3(p.x, 1, p.z), 10, '#4dabf7');
        }
      }
    }
    // rakipler: çok öne geçen yavaşlar, geride kalan hızlanır (çocuk hep yarışın içinde)
    for (const r of this.rivals) {
      if (r.done || this.start > 0) {
        r.av.update(dt, t, r.done ? 'cheer' : 'idle', 0);
        continue;
      }
      const lead = hero.pos.z - r.z;
      const k = lead > 25 ? 0.75 : lead < -30 ? 1.12 : 1;
      r.z -= r.sp * k * dt;
      if (r.z <= -RUN_L) {
        r.done = ++this.finishedAt;
        r.z = -RUN_L - 2;
      }
      r.av.root.position.set(r.x, this.rivalY(r.z), r.z);
      r.av.update(dt, t, r.av.root.position.y > 0.3 ? 'jump' : 'walk', 1.6);
    }
    const rank = 1 + this.rivals.filter((r) => r.done || r.z < hero.pos.z).length;
    const text = this.heroDone ? `${this.heroDone}.` : `${rank}.`;
    if (text !== this.shown) {
      this.shown = text;
      this.ev.progress(text);
    }
    if (!this.done && hero.pos.z < -RUN_L) {
      this.done = true;
      this.heroDone = 1 + this.rivals.filter((r) => r.done).length;
      this.ev.sound.fx?.('cheer');
      this.sparkles.burst(new THREE.Vector3(0, 4, -RUN_L), 30);
      this.ev.finish(RANK_BONUS[this.heroDone - 1] ?? 5, rankText(this.heroDone));
    }
    return super.update(dt, t, hero);
  }
  dispose() {
    for (const r of this.rivals) r.av.dispose();
    super.dispose();
  }
}

// ================================================================================================
// Kart Yarışı
// ================================================================================================
const LAPS = 2;
const HALF_W = 7;

export class KartRealm extends Realm {
  readonly id = 'kart' as const;
  goal = L.goalKart;
  icon = 'kupa';
  private pts: THREE.Vector3[] = [];
  private tans: THREE.Vector3[] = [];
  private len = 0;
  private kart: Vehicle;
  /** Kahraman şu an kartta mı (araç her kare haber verir). */
  private drivingAt = -1;
  private started = false;
  private count = 0;
  private go = false;
  private lap = 0;
  private idx = 0;
  private half = false;
  private ai: { model: THREE.Object3D; s: number; lane: number; sp: number; done: number }[] = [];
  private finishedAt = 0;
  private clockT = 0;
  private shown = '';

  constructor(ev: RealmEvents) {
    super(ev, '#bfe9ff', [90, 320]);
    this.cam = [13, 7];
    // pist: kapalı, kıvrımlı bir yol
    const ctrl = [[0, 0], [55, -6], [92, -36], [96, -82], [64, -116], [16, -112], [-14, -86], [-6, -54], [-44, -38], [-52, 2], [-30, 22]]
      .map(([x, z]) => new THREE.Vector3(x, 0, z));
    const curve = new THREE.CatmullRomCurve3(ctrl, true, 'centripetal');
    const N = 420;
    this.pts = curve.getSpacedPoints(N).slice(0, N);
    this.len = curve.getLength();
    this.tans = this.pts.map((_, i) => this.pts[(i + 1) % N].clone().sub(this.pts[(i + N - 1) % N]).normalize());
    const grass = mesh(new THREE.PlaneGeometry(500, 500).rotateX(-Math.PI / 2), toon('#8fd16f'), false);
    grass.position.set(20, -0.03, -50);
    this.scene.add(grass);
    this.scene.add(this.ribbon(HALF_W, 0.01, () => '#4a4f5c'));
    this.scene.add(this.ribbon(HALF_W + 0.9, 0.0, (i) => (Math.floor(i / 3) % 2 ? '#ef4b4b' : '#ffffff')));
    this.scene.add(this.ribbon(0.15, 0.02, (i) => (Math.floor(i / 4) % 2 ? '#ffffff' : '#4a4f5c')));
    // başlangıç kemeri, tribün, lastik yığınları, ağaçlar
    const p0 = this.pts[0], t0 = this.tans[0], yaw0 = Math.atan2(t0.x, t0.z);
    const a = arch(HALF_W * 2 + 1);
    a.position.copy(p0);
    a.rotation.y = yaw0;
    this.scene.add(a);
    const nrm = (i: number) => new THREE.Vector3(this.tans[i].z, 0, -this.tans[i].x);
    for (let i = 0; i < N; i += 14) {
      for (const s of [-1, 1]) {
        const p = this.pts[i].clone().addScaledVector(nrm(i), s * (HALF_W + 3));
        if (this.nearest(p.x, p.z).d < HALF_W + 2) continue;
        if (i % 28 === 0) {
          const tires = new THREE.Group();
          for (let k = 0; k < 3; k++) {
            const tr = outline(mesh(new THREE.TorusGeometry(0.5, 0.22, 8, 14).rotateX(Math.PI / 2), toon(k % 2 ? '#ef4b4b' : '#2b2d33')), 1.04);
            tr.position.y = 0.25 + k * 0.42;
            tires.add(tr);
          }
          tires.position.copy(p);
          this.scene.add(tires);
        } else {
          const q = p.clone().addScaledVector(nrm(i), s * 6);
          if (this.nearest(q.x, q.z).d < HALF_W + 4) continue;
          const t = tree(i % 3 ? 'round' : 'pine', 1.8);
          t.position.copy(q);
          this.scene.add(t);
        }
      }
    }
    // tribün: pistin hangi yanı boşsa (viraj içine taşmasın)
    for (const side of [-1, 1]) {
      const c = p0.clone().addScaledVector(nrm(0), side * (HALF_W + 9));
      const ends = [-15, 0, 15].map((k) => c.clone().addScaledVector(t0, k));
      if (ends.some((e) => this.nearest(e.x, e.z).d < HALF_W + 4)) continue;
      const stand = outline(mesh(new THREE.BoxGeometry(5, 4, 30), toon('#5b8def')), 1.01);
      stand.position.copy(c).setY(2);
      stand.rotation.y = yaw0;
      this.scene.add(stand);
      break;
    }
    // oyuncunun kartı (yarış arabası) ve üç rakip, başlangıç çizgisinin arkasında
    const km = carModel('yaris');
    const kp = this.pts[N - 6].clone().addScaledVector(nrm(N - 6), 2.6);
    this.kart = {
      model: km, pos: kp.clone(), heading: Math.atan2(this.tans[N - 6].x, this.tans[N - 6].z), speed: 24, water: false, seatY: 0.72, land: true,
      seat: km.userData.seat as [number, number, number], cam: [14, 7], engine: 'race',
      update: () => void (this.drivingAt = this.clockT),
    };
    km.position.copy(kp);
    km.rotation.y = this.kart.heading;
    this.scene.add(km);
    this.spots.push({ id: 'kart-bin', x: kp.x, z: kp.z, r: 3.6, label: 'Karta bin, yarış başlasın!', vehicle: this.kart });
    this.idx = N - 6;
    (['spor', 'mini', 'jip'] as const).forEach((id, i) => {
      const m = carModel(id);
      this.scene.add(m);
      this.ai.push({ model: m, s: this.len - 5 - i * 7, lane: [-2.6, 2.6, -2.6][i] * (i === 2 ? -1 : 1), sp: [20.5, 19, 17.5][i], done: 0 });
    });
    for (const r of this.ai) this.placeAi(r);
    // kahraman kartın yanında, çıkış kapısı tribünün önünde
    const sp = kp.clone().addScaledVector(nrm(N - 6), HALF_W + 1.5);
    this.spawn.set(sp.x, 0, sp.z);
    this.spawnH = this.kart.heading;
    this.checkpoint.copy(this.spawn);
    const ex = this.pts[N - 20].clone().addScaledVector(nrm(N - 20), HALF_W + 6);
    this.placeExit(ex.x, 0, ex.z, this.kart.heading);
  }

  /** Pistin şeridi (kenar ve orta çizgi de aynı yoldan, farklı genişlikte). */
  private ribbon(hw: number, y: number, color: (i: number) => string) {
    const N = this.pts.length;
    const pos: number[] = [], col: number[] = [];
    const c = new THREE.Color();
    for (let i = 0; i < N; i++) {
      const a = this.pts[i], b = this.pts[(i + 1) % N];
      const na = new THREE.Vector3(this.tans[i].z, 0, -this.tans[i].x), nb = new THREE.Vector3(this.tans[(i + 1) % N].z, 0, -this.tans[(i + 1) % N].x);
      const v = [a.clone().addScaledVector(na, hw), a.clone().addScaledVector(na, -hw), b.clone().addScaledVector(nb, hw), b.clone().addScaledVector(nb, -hw)];
      for (const k of [0, 2, 1, 1, 2, 3]) pos.push(v[k].x, y, v[k].z);
      c.set(color(i));
      for (let k = 0; k < 6; k++) col.push(c.r, c.g, c.b);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshToonMaterial({ vertexColors: true, side: THREE.DoubleSide }));
    m.receiveShadow = true;
    return m;
  }

  /** Pistin en yakın noktası. */
  private nearest(x: number, z: number) {
    let bi = 0, bd = Infinity;
    for (let i = 0; i < this.pts.length; i++) {
      const d = (this.pts[i].x - x) ** 2 + (this.pts[i].z - z) ** 2;
      if (d < bd) [bi, bd] = [i, d];
    }
    return { i: bi, d: Math.sqrt(bd) };
  }
  private placeAi(r: KartRealm['ai'][number]) {
    const N = this.pts.length, f = (((r.s / this.len) % 1) + 1) % 1 * N, i = Math.floor(f) % N;
    const p = this.pts[i].clone().lerp(this.pts[(i + 1) % N], f - Math.floor(f));
    const t = this.tans[i];
    p.addScaledVector(new THREE.Vector3(t.z, 0, -t.x), r.lane + Math.sin(r.s * 0.05) * 0.8);
    r.model.position.copy(p);
    r.model.rotation.y = Math.atan2(t.x, t.z);
  }

  floor() {
    return 0;
  }
  /** Kartla pistin dışına çıkılmaz; yürürken her yer serbest. */
  blocked(x: number, z: number) {
    if (this.clockT - this.drivingAt > 0.25) return Math.hypot(x - 20, z + 50) > 170;
    return this.nearest(x, z).d > HALF_W + 1;
  }

  update(dt: number, t: number, hero: Hero) {
    this.tick(dt);
    this.clockT = t;
    const driving = t - this.drivingAt < 0.25;
    // ilk binişte geri sayım
    if (driving && !this.started) {
      this.started = true;
      this.count = 3.2;
      this.ev.msg(L.ready);
    }
    if (this.started && !this.go) {
      const before = Math.ceil(this.count);
      this.count -= dt;
      const now = Math.ceil(this.count);
      if (now !== before && now > 0) this.ev.msg(L.count[now - 1]);
      if (this.count <= 0) {
        this.go = true;
        this.ev.msg(L.go);
        this.ev.sound.fx?.('whistle');
      }
    }
    // kahramanın ilerlemesi: yarı yolu geçip başlangıç çizgisinden geçince tur sayılır
    const N = this.pts.length;
    if (driving && !this.done) {
      const n = this.nearest(hero.pos.x, hero.pos.z).i;
      if (n > N * 0.4 && n < N * 0.6) this.half = true;
      if (this.half && this.idx > N * 0.85 && n < N * 0.15) {
        this.lap++;
        this.half = false;
        if (this.lap < LAPS) {
          this.ev.msg(L.lastLap);
          this.ev.sound.fx?.('bell');
        }
      }
      this.idx = n;
    }
    // başlangıç çizgisinin arkasındayken (ilk geçişten önce) ilerleme eksidedir
    const behind = this.lap === 0 && !this.half && this.idx > N * 0.5;
    const mine = (this.lap + this.idx / N - (behind ? 1 : 0)) * this.len;
    // rakipler: çocuğa göre hızlanıp yavaşlar
    for (const r of this.ai) {
      if (this.go && !r.done) {
        const gap = r.s - this.len - mine; // rakip başlangıçta bir tur geriden sayılır (çizginin arkasında)
        const k = gap > 45 ? 0.78 : gap < -60 ? 1.1 : 1;
        r.s += r.sp * k * dt;
        if (r.s >= this.len * (LAPS + 1)) r.done = ++this.finishedAt;
      }
      this.placeAi(r);
    }
    const rank = 1 + this.ai.filter((r) => r.done || r.s - this.len > mine).length;
    const text = this.done ? this.shown : `Tur ${Math.min(this.lap + 1, LAPS)}/${LAPS} · ${rank}.`;
    if (text !== this.shown) {
      this.shown = text;
      this.ev.progress(text);
    }
    if (!this.done && this.lap >= LAPS) {
      this.done = true;
      this.ev.sound.fx?.('cheer');
      this.sparkles.burst(hero.pos.clone().setY(hero.pos.y + 3), 30);
      this.ev.finish(RANK_BONUS[rank - 1] ?? 5, rankText(rank));
    }
    return super.update(dt, t, hero);
  }
}

