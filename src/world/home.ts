/**
 * Evim: içinde gezilen 3B ev (Çizio Adası'nda evin kapısından girilir), PK XD gibi.
 *
 * Kamera karakterin arkasından takip eder (sürükleyerek döner, yakınlaşır); karakter joystick ile yürür, duvarlara ve
 * eşyalara çarpar. Kamera ile karakter arasına giren duvarlar alçalır ki karakter hep görünsün.
 * Yaşam modunda bir eşyaya dokununca karakter oraya yürür ve onunla oynar (oturur, uyur, yemek yapar…); yere dokununca
 * oraya yürür. Eşya modunda kamera yukarı çıkar, seçilen eşya karakterin önünde taşınır ya da dokunulan yere konur. Eşya modunda katalogdan seçilen eşya yeşil (sığar) / kırmızı (sığmaz) önizlemeyle yerleştirilir;
 * yerleşmiş bir eşyaya dokununca döndürme, renk, taşıma ve satma seçilir.
 * Kurallar src/world/homeData.ts, modeller src/world/homeModels.ts. Ada ile aynı WebGL çiziciyi kullanır.
 */
import * as THREE from 'three';
import { Sparkles } from '../play3d/kit';
import { Avatar3D, type Pose } from './avatar3d';
import type { DollState } from '../dressup/catalog';
import { petCard } from './puppet';
import {
  canPlace, changePlan, facing, FLOORS, footprint, item, lot, normalizeHome, occupied, path, plan, PLANS, roomAt, sellPrice, useTile, wallAt, walls, WALLS,
  type HomeState, type Placed, type Side, type Use,
} from './homeData';
import { clearFloorTex, clearGeos, clearMats, floorTexture, furniture, soft } from './homeModels';

export interface HomeBridge {
  get(): HomeState;
  coins(): number;
  /** Kaydet; `coins` eksi ise harcama. Altın yetmezse hata metni. */
  save(h: HomeState, coins: number): string | null;
}

export interface GhostInfo { id: string; ok: boolean; err: string | null; price: number; moving: boolean }
export interface SelInfo { index: number; id: string; name: string; sell: number; colors: string[]; c: number }

export interface HomeEvents {
  onMessage(text: string): void;
  onPage(page: 'giydir' | 'ciz' | 'hikaye' | 'ogren'): void;
  onGhost(g: GhostInfo | null): void;
  onSelect(s: SelInfo | null): void;
  onBusy(b: boolean): void;
  /** Yeni bir eşya kondu (günlük görev için). */
  onPlaced(id: string): void;
  sound: { pop: () => void; star: (i: number) => void; note: (i: number) => void };
}

const FLOOR_Y = 0.1;
const WALL_H = 2.7, STUB_H = 0.32, WALL_T = 0.12;
const SCALE = 0.37;
const HIP = 1.25 * SCALE; // oturan karakterin kalçası ile kökü arası (ölçekli)
const SIDE_ROT: Record<Side, number> = { n: 0, w: Math.PI / 2, s: Math.PI, e: -Math.PI / 2 };
const SIDES: Side[] = ['n', 'e', 's', 'w'];

interface Act { dur: number; t: number; pose: Pose | ((u: number) => Pose); step: (t: number, u: number) => void; end: () => void }
interface WallMesh { full: THREE.Object3D; stub: THREE.Object3D; x: number; z: number; side: 'n' | 'w'; outer: boolean; mats: THREE.MeshStandardMaterial[]; fade: number; seen?: number }

export class HomeScene {
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(55, 1, 0.3, 160);
  private dist = 5.4;
  private camReady = false;
  private dt = 0.016;
  private warm = new THREE.PointLight('#ffd9a8', 1.1, 7, 1.6);
  private joy = new THREE.Vector2();
  private sun: THREE.DirectionalLight;
  private sparkles: Sparkles;
  private lotG = new THREE.Group();
  private houseG = new THREE.Group();
  private itemsG = new THREE.Group();
  private wallMeshes: WallMesh[] = [];
  private towers: { obj: THREE.Object3D; dx: number; dz: number }[] = [];
  private itemObjs: THREE.Object3D[] = [];
  private avatar: Avatar3D;
  private pet: THREE.Mesh | null = null;
  private petPos = new THREE.Vector3();
  private petTarget: THREE.Vector3 | null = null;
  private h: HomeState;
  private yaw = 0;
  private yawGoal = 0;
  private raf = 0;
  private last = 0;
  private clock = 0;
  private running = false;
  private resizeObs: ResizeObserver;
  private ray = new THREE.Raycaster();
  private ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), -FLOOR_Y);
  // kahraman
  private pos = new THREE.Vector3();
  private heading = 0;
  private route: THREE.Vector3[] = [];
  private onArrive: (() => void) | null = null;
  private act: Act | null = null;
  private walking = 0;
  private lying = false;
  // adadaki gibi hareket: hız (yumuşak hızlanma), zıplama, el sallama / dans / alkış, yukarı-aşağı bakış
  private vel = new THREE.Vector2();
  private jumpY = 0;
  private jumpV = 0;
  private emoteKind: Pose | null = null;
  private emoteUntil = 0;
  private pitchOff = 0;
  private lastDrag = -9;
  // eşya modu
  private mode: 'live' | 'build' = 'live';
  private ghost: { p: Placed; obj: THREE.Object3D; mark: THREE.Mesh; from?: Placed; fromIndex?: number } | null = null;
  private sel = -1;
  private selRing: THREE.Mesh;
  private prevTone: THREE.ToneMapping;
  private prevExposure: number;

  constructor(private renderer: THREE.WebGLRenderer, private canvas: HTMLCanvasElement, private o: { doll: DollState; pet: HTMLCanvasElement | null; art: HTMLCanvasElement[] }, private bridge: HomeBridge, private ev: HomeEvents) {
    this.h = normalizeHome(bridge.get());
    this.scene.background = new THREE.Color('#bfe3ff');
    this.scene.fog = new THREE.Fog('#bfe3ff', 30, 80);
    // arsanın çevresi çimen (kamera alçaktan bakınca boşluk görünmesin)
    const field = new THREE.Mesh(new THREE.CircleGeometry(90, 48).rotateX(-Math.PI / 2), soft('#b9dc9c'));
    field.position.y = -0.12;
    field.receiveShadow = true;
    this.scene.add(field);
    this.scene.add(new THREE.HemisphereLight('#ffffff', '#e6dcf5', 1.25));
    this.sun = new THREE.DirectionalLight('#fff3e2', 1.6);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.bias = -0.0012;
    this.sun.shadow.normalBias = 0.08;
    this.sun.shadow.radius = 4;
    this.scene.add(this.sun, this.sun.target);
    // içeride sıcak ev ışığı (karakterin üstünde yumuşak bir lamba gibi)
    this.warm.position.set(0, 2.4, 0);
    this.scene.add(this.warm);
    this.scene.add(this.lotG, this.houseG, this.itemsG);
    this.sparkles = new Sparkles(this.scene);
    this.avatar = new Avatar3D(o.doll);
    this.avatar.root.scale.setScalar(SCALE);
    this.avatar.root.rotation.order = 'YXZ';
    this.scene.add(this.avatar.root);
    if (o.pet) {
      this.pet = petCard(o.pet);
      if (this.pet) {
        this.pet.scale.multiplyScalar(0.4);
        this.scene.add(this.pet);
      }
    }
    this.selRing = new THREE.Mesh(new THREE.RingGeometry(0.45, 0.55, 32), new THREE.MeshBasicMaterial({ color: '#7c5cff', transparent: true, opacity: 0.8, depthWrite: false }));
    this.selRing.rotation.x = -Math.PI / 2;
    this.selRing.visible = false;
    this.scene.add(this.selRing);
    this.prevTone = renderer.toneMapping;
    this.prevExposure = renderer.toneMappingExposure;
    this.build();
    // ön kapının önünde başla
    this.placeHeroAtDoor();
    this.resizeObs = new ResizeObserver(() => this.resize());
  }

  // ----------------------------------------------------------------------------------------------
  // Yaşam döngüsü
  // ----------------------------------------------------------------------------------------------
  start() {
    if (this.running) return;
    this.running = true;
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.resizeObs.observe(this.canvas);
    this.resize();
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }
  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.resizeObs.disconnect();
    this.renderer.toneMapping = this.prevTone;
    this.renderer.toneMappingExposure = this.prevExposure;
  }
  dispose() {
    this.stop();
    this.avatar.dispose();
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && m.geometry && !(m.geometry as THREE.BufferGeometry & { parameters?: { radius?: number } }).userData.shared) m.geometry.dispose();
    });
    clearMats();
    clearGeos();
    clearFloorTex();
  }
  private resize() {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.updateCamera();
  }

  // ----------------------------------------------------------------------------------------------
  // Kurulum
  // ----------------------------------------------------------------------------------------------
  private get P() {
    return plan(this.h.plan);
  }
  private get L() {
    return lot(this.P);
  }
  /** Karo merkezi (dünya). */
  tileCenter(x: number, z: number, y = 0) {
    return new THREE.Vector3(x - this.L.w / 2 + 0.5, y, z - this.L.d / 2 + 0.5);
  }
  private floorAt(x: number, z: number) {
    return roomAt(this.P, x, z) ? FLOOR_Y : 0;
  }
  private worldToTile(v: THREE.Vector3): [number, number] {
    return [Math.floor(v.x + this.L.w / 2), Math.floor(v.z + this.L.d / 2)];
  }

  private clearGroup(g: THREE.Group) {
    for (const c of [...g.children]) g.remove(c);
  }

  /** Arsa, ev ve eşyaları baştan kurar. */
  private build() {
    this.clearGroup(this.lotG);
    this.clearGroup(this.houseG);
    const P = this.P, L = this.L;
    // arsa: altta toprak dilimi, üstte çimen (diorama)
    const base = new THREE.Mesh(new THREE.BoxGeometry(L.w + 0.6, 0.8, L.d + 0.6), soft('#c9b29a'));
    base.position.y = -0.44;
    base.receiveShadow = true;
    const grass = new THREE.Mesh(new THREE.BoxGeometry(L.w + 0.6, 0.1, L.d + 0.6), soft('#cfe6b8'));
    grass.position.y = -0.05;
    grass.receiveShadow = true;
    this.lotG.add(base, grass);
    // patika: ön kapıdan arsanın önüne
    const fx = P.front.x + L.hx, fz = P.front.z + L.hz;
    for (let z = fz + 1; z < L.d; z++) {
      const st = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.34, 0.06, 16), soft('#f3ead9'));
      st.position.copy(this.tileCenter(fx, z, 0.02));
      st.receiveShadow = true;
      this.lotG.add(st);
    }
    // çit (önde kapı boşluğu)
    const picket = (x: number, z: number, rot: number) => {
      const g = new THREE.Group();
      for (const dx of [-0.3, 0, 0.3]) {
        const p = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.55, 0.05), soft('#ffffff'));
        p.position.set(dx, 0.27, 0);
        p.castShadow = true;
        g.add(p);
      }
      const rail = new THREE.Mesh(new THREE.BoxGeometry(1, 0.06, 0.04), soft('#ffffff'));
      rail.position.y = 0.32;
      g.add(rail);
      g.position.set(x, 0, z);
      g.rotation.y = rot;
      this.lotG.add(g);
    };
    for (let x = 0; x < L.w; x++) {
      picket(x - L.w / 2 + 0.5, -L.d / 2 + 0.1, 0);
      if (x !== fx) picket(x - L.w / 2 + 0.5, L.d / 2 - 0.1, 0);
    }
    for (let z = 0; z < L.d; z++) {
      picket(-L.w / 2 + 0.1, z - L.d / 2 + 0.5, Math.PI / 2);
      picket(L.w / 2 - 0.1, z - L.d / 2 + 0.5, Math.PI / 2);
    }
    // zeminler (oda başına bir parça; aynı adlı odalar aynı zemini paylaşır)
    for (const r of P.rooms) {
      const key = this.roomKey(r.id);
      const f = FLOORS[this.h.floor[key] ?? 0] ?? FLOORS[0];
      const tex = floorTexture(f.id, f.color).clone();
      tex.needsUpdate = true;
      tex.repeat.set(r.w, r.d);
      const m = new THREE.Mesh(new THREE.BoxGeometry(r.w, FLOOR_Y, r.d), [soft('#e8dccb'), soft('#e8dccb'), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }), soft('#e8dccb'), soft('#e8dccb'), soft('#e8dccb')]);
      m.position.set(r.x + L.hx + r.w / 2 - L.w / 2, FLOOR_Y / 2, r.z + L.hz + r.d / 2 - L.d / 2);
      m.receiveShadow = true;
      m.userData.room = r.id;
      this.houseG.add(m);
    }
    // duvarlar
    this.wallMeshes = [];
    for (const w of walls(P)) {
      if (w.door) {
        if (w.outer) this.houseG.add(this.doorMat(w));
        // kapı kasası ve üstündeki duvar (kapıdan geçince saydamlaşır)
        const dcol = WALLS[this.h.wall[this.roomKey(w.room)] ?? 0] ?? WALLS[0];
        const pos = w.side === 'n' ? new THREE.Vector3(w.x - L.w / 2 + 0.5, 0, w.z - L.d / 2) : new THREE.Vector3(w.x - L.w / 2, 0, w.z - L.d / 2 + 0.5);
        const full = this.doorFrame(w.side, dcol, w.outer);
        const stub = new THREE.Group();
        full.position.copy(pos);
        const mats: THREE.MeshStandardMaterial[] = [];
        full.traverse((o) => {
          const m = o as THREE.Mesh;
          if (!m.isMesh) return;
          const c = (m.material as THREE.MeshStandardMaterial).clone();
          c.transparent = true;
          m.material = c;
          mats.push(c);
        });
        this.houseG.add(full, stub);
        this.wallMeshes.push({ full, stub, x: w.x, z: w.z, side: w.side, outer: w.outer, mats, fade: 1 });
        continue;
      }
      const color = WALLS[this.h.wall[this.roomKey(w.room)] ?? 0] ?? WALLS[0];
      const window = w.outer && (w.x * 7 + w.z * 3) % 4 === 1;
      const full = this.wallPiece(w.side, WALL_H, color, window);
      const stub = this.wallPiece(w.side, STUB_H, color, false);
      const pos = w.side === 'n' ? new THREE.Vector3(w.x - L.w / 2 + 0.5, 0, w.z - L.d / 2) : new THREE.Vector3(w.x - L.w / 2, 0, w.z - L.d / 2 + 0.5);
      full.position.copy(pos);
      stub.position.copy(pos);
      // her duvarın kendi malzemesi: karakteri kapatınca yalnızca o duvar saydamlaşır
      const mats: THREE.MeshStandardMaterial[] = [];
      full.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        const c = (m.material as THREE.MeshStandardMaterial).clone();
        c.transparent = true;
        m.material = c;
        mats.push(c);
      });
      this.houseG.add(full, stub);
      this.wallMeshes.push({ full, stub, x: w.x, z: w.z, side: w.side, outer: w.outer, mats, fade: 1 });
    }
    // şato: evin köşelerinde kuleler (kameranın uzak tarafındakiler görünür)
    this.towers = [];
    if (P.id === 'sato') {
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        const t = new THREE.Group();
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.85, 3.4, 16), soft('#d8d2e4'));
        body.position.y = 1.7;
        const roof = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.4, 16), soft('#9775fa'));
        roof.position.y = 4.1;
        const flag = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.04), soft('#ff8fb1'));
        flag.position.set(0.25, 5.0, 0);
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 6), soft('#5b5568'));
        pole.position.y = 4.95;
        for (const m of [body, roof]) {
          m.castShadow = true;
          m.receiveShadow = true;
        }
        t.add(body, roof, flag, pole);
        const cx = sx < 0 ? L.hx - 0.2 : L.hx + P.w + 0.2, cz = sz < 0 ? L.hz - 0.2 : L.hz + P.d + 0.2;
        t.position.set(cx - L.w / 2, 0, cz - L.d / 2);
        this.houseG.add(t);
        this.towers.push({ obj: t, dx: sx, dz: sz });
      }
    }
    this.buildItems();
    // güneş ve gölge alanı
    const R = Math.max(L.w, L.d) * 0.75;
    Object.assign(this.sun.shadow.camera, { left: -R, right: R, top: R, bottom: -R, near: 1, far: 120 });
    this.sun.shadow.camera.updateProjectionMatrix();
    this.sun.position.set(-14, 26, 12);
  }

  private roomKey(id: string) {
    // aynı adlı odalar (salon ve hol) tek oda sayılır
    const r = this.P.rooms.find((x) => x.id === id);
    return this.P.rooms.find((x) => x.name === r?.name)?.id ?? id;
  }

  private wallPiece(side: 'n' | 'w', h: number, color: string, window: boolean) {
    const g = new THREE.Group();
    const along = 1 + WALL_T;
    const box = (w: number, hh: number, y: number, c: string | THREE.Material) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(side === 'n' ? w : WALL_T, hh, side === 'n' ? WALL_T : w), typeof c === 'string' ? soft(c) : c);
      m.position.y = y;
      m.castShadow = true;
      m.receiveShadow = true;
      g.add(m);
      return m;
    };
    if (window) {
      box(along, 0.9, 0.45, color);
      box(along, h - 1.75, 1.75 + (h - 1.75) / 2, color);
      for (const s of [-1, 1]) {
        const p = box(0.18, 0.85, 1.32, color);
        if (side === 'n') p.position.x = s * 0.47;
        else p.position.z = s * 0.47;
      }
      box(0.8, 0.85, 1.32, soft('#cfeaff', { opacity: 0.45, rough: 0.1 }));
      // perdeler ve pencere pervazı
      for (const s of [-1, 1]) {
        const c = box(0.16, 1.15, 1.32, soft('#ffd1dc'));
        if (side === 'n') c.position.x = s * 0.36;
        else c.position.z = s * 0.36;
        c.scale.set(side === 'n' ? 1 : 1.6, 1, side === 'n' ? 1.6 : 1);
      }
      box(0.95, 0.06, 0.88, '#ffffff').scale.set(side === 'n' ? 1 : 2.2, 1, side === 'n' ? 2.2 : 1);
    } else box(along, h, h / 2, color);
    // süpürgelik
    if (h > 1) box(along, 0.14, 0.07, '#' + new THREE.Color(color).multiplyScalar(0.78).getHexString()).scale.set(side === 'n' ? 1 : 1.25, 1, side === 'n' ? 1.25 : 1);
    // üst kenar (biraz koyu): dioramadaki kesik duvar ağzı
    box(along, 0.03, h + 0.015, '#' + new THREE.Color(color).multiplyScalar(0.82).getHexString());
    return g;
  }

  /** Kapı boşluğu: iki yanda ahşap kasa, üstte duvar parçası (lento); ön kapıda kanat açık durur. */
  private doorFrame(side: 'n' | 'w', color: string, outer: boolean) {
    const g = new THREE.Group();
    const DH = 2.05;
    const box = (w: number, hh: number, y: number, c: string, off = 0) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(side === 'n' ? w : WALL_T + 0.04, hh, side === 'n' ? WALL_T + 0.04 : w), soft(c));
      m.position.y = y;
      if (side === 'n') m.position.x = off;
      else m.position.z = off;
      m.castShadow = true;
      m.receiveShadow = true;
      g.add(m);
      return m;
    };
    box(1 + WALL_T, WALL_H - DH, DH + (WALL_H - DH) / 2, color);
    box(1, 0.1, DH + 0.05, '#c9a27a');
    for (const s of [-1, 1]) box(0.08, DH, DH / 2, '#c9a27a', s * 0.46);
    if (outer) {
      // açık duran ön kapı kanadı
      const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.06, DH - 0.05, 0.86), soft('#e07a5f'));
      leaf.position.set(side === 'n' ? -0.43 : 0.43, DH / 2, side === 'n' ? 0.43 : -0.43);
      if (side === 'w') leaf.rotation.y = Math.PI / 2;
      leaf.castShadow = true;
      g.add(leaf);
    }
    return g;
  }

  /** Ön kapının önünde paspas. */
  private doorMat(w: { x: number; z: number; side: 'n' | 'w' }) {
    const L = this.L;
    const mat = new THREE.Mesh(new THREE.BoxGeometry(w.side === 'n' ? 0.8 : 0.5, 0.02, w.side === 'n' ? 0.5 : 0.8), soft('#c98a8a'));
    mat.position.set(w.side === 'n' ? w.x - L.w / 2 + 0.5 : w.x - L.w / 2 + 0.3, 0.02, w.side === 'n' ? w.z - L.d / 2 + 0.3 : w.z - L.d / 2 + 0.5);
    mat.receiveShadow = true;
    return mat;
  }

  private placedTransform(p: Placed, obj: THREE.Object3D) {
    const it = item(p.id)!;
    const tiles = footprint(p);
    if (it.wall) {
      const side = this.wallSideOf(p);
      const c = this.tileCenter(p.x, p.z, FLOOR_Y);
      obj.position.copy(c);
      obj.rotation.y = SIDE_ROT[side];
      return;
    }
    const xs = tiles.map((t) => t[0]), zs = tiles.map((t) => t[1]);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cz = (Math.min(...zs) + Math.max(...zs)) / 2;
    obj.position.copy(this.tileCenter(cx, cz, this.floorAt(p.x, p.z)));
    obj.rotation.y = -p.r * Math.PI / 2;
  }
  private wallSideOf(p: Placed): Side {
    const want = SIDES[p.r % 4];
    if (wallAt(this.P, p.x, p.z, want)) return want;
    return SIDES.find((s) => wallAt(this.P, p.x, p.z, s)) ?? 'n';
  }

  private buildItems() {
    this.clearGroup(this.itemsG);
    this.itemObjs = [];
    let art = 0;
    this.h.items.forEach((p, i) => {
      const it = item(p.id);
      if (!it) return;
      const color = it.colors[p.c % it.colors.length];
      const obj = furniture(p.id, color, p.id === 'tablo' ? this.o.art[art++ % Math.max(1, this.o.art.length)] : undefined);
      this.placedTransform(p, obj);
      obj.userData.index = i;
      this.itemsG.add(obj);
      this.itemObjs[i] = obj;
    });
    this.occ = occupied(this.h);
  }

  // ----------------------------------------------------------------------------------------------
  // Kamera
  // ----------------------------------------------------------------------------------------------
  rotate(dx: number, dy = 0) {
    this.yawGoal -= dx * 0.008;
    this.pitchOff = Math.min(0.45, Math.max(-0.5, this.pitchOff + dy * 0.004));
    this.lastDrag = this.clock;
  }
  /** Zıpla (adadaki gibi boş yere dokununca). */
  jump() {
    if (this.act || this.jumpY > 0.01) return;
    this.jumpV = 3.6;
    this.emoteKind = null;
  }
  emote(kind: 'wave' | 'dance' | 'clap') {
    if (this.act) return;
    this.emoteKind = kind;
    this.emoteUntil = this.clock + (kind === 'dance' ? 2.6 : 1.6);
    if (kind === 'wave') this.heading = Math.atan2(this.camera.position.x - this.pos.x, this.camera.position.z - this.pos.z);
    if (kind === 'clap') this.sparkles.burst(this.pos.clone().setY(this.pos.y + 1.1), 12);
    this.ev.sound.pop();
  }
  rotateStep(dir: 1 | -1) {
    this.yawGoal += (dir * Math.PI) / 2;
  }
  zoom(k: number) {
    this.dist = Math.min(10, Math.max(2.5, this.dist * k));
  }
  private updateCamera() {
    const w = this.canvas.clientWidth || 1, h = this.canvas.clientHeight || 1;
    this.camera.aspect = w / h;
    this.camera.fov = w < h ? 66 : 55;
    this.camera.updateProjectionMatrix();
  }
  /** Kamera karakteri arkadan izler; eşya modunda daha yukarıdan bakar. */
  private follow(dt: number) {
    const build = this.mode === 'build';
    const pitch = build ? 1.0 : Math.min(1.3, Math.max(0.3, 0.88 + this.pitchOff));
    const d = this.dist * (build ? 1.9 : 1);
    const target = this.pos.clone().setY(this.pos.y + (build ? 0.2 : 0.55));
    const want = target.clone().add(new THREE.Vector3(Math.sin(this.yaw) * Math.cos(pitch) * d, Math.sin(pitch) * d, Math.cos(this.yaw) * Math.cos(pitch) * d));
    if (!this.camReady) {
      this.camera.position.copy(want);
      this.camReady = true;
    } else this.camera.position.lerp(want, Math.min(1, dt * 6));
    this.camera.lookAt(target);
  }
  /** Kamera ile karakter arasına giren duvarları alçalt (karakter hep görünsün). */
  private occlusion() {
    const L = this.L;
    const C = new THREE.Vector2(this.camera.position.x, this.camera.position.z);
    const H = new THREE.Vector2(this.pos.x, this.pos.z);
    const dir = H.clone().sub(C);
    const perp = new THREE.Vector2(-dir.y, dir.x).normalize().multiplyScalar(0.25);
    const rays = [H, H.clone().add(perp), H.clone().sub(perp)];
    const cross = (a: THREE.Vector2, b: THREE.Vector2, c: THREE.Vector2, d: THREE.Vector2) => {
      const r = b.clone().sub(a), q = d.clone().sub(c);
      const den = r.x * q.y - r.y * q.x;
      if (Math.abs(den) < 1e-9) return false;
      const t = ((c.x - a.x) * q.y - (c.y - a.y) * q.x) / den, u = ((c.x - a.x) * r.y - (c.y - a.y) * r.x) / den;
      return t >= 0 && t <= 1 && u >= 0 && u <= 1;
    };
    for (const w of this.wallMeshes) {
      const A = new THREE.Vector2(w.x - L.w / 2, w.z - L.d / 2);
      const B = w.side === 'n' ? new THREE.Vector2(A.x + 1, A.y) : new THREE.Vector2(A.x, A.y + 1);
      // kamerayla karakter arasındaki duvar yok olmaz: yumuşakça yarı saydam olur (karakter hep görünür)
      if (rays.some((h) => cross(C, h, A, B))) w.seen = this.clock;
      const want = this.clock - (w.seen ?? -9) < 0.5 ? 0.12 : 1;
      if (!w.full.visible || w.stub.visible) {
        w.full.visible = true;
        w.stub.visible = false;
      }
      if (Math.abs(w.fade - want) > 0.01) {
        w.fade += (want - w.fade) * Math.min(1, this.dt * 7);
        if (Math.abs(w.fade - want) < 0.02) w.fade = want;
        for (const m of w.mats) {
          m.opacity = w.fade;
          m.depthWrite = w.fade > 0.98;
        }
      }
    }
    const cx = this.camera.position.x - this.pos.x, cz = this.camera.position.z - this.pos.z;
    for (const t of this.towers) t.obj.visible = t.dx * cx + t.dz * cz < 0;
  }

  /** Joystick (kameraya göre). */
  setJoystick(x: number, y: number) {
    this.joy.set(x, y);
  }
  /** Bu noktaya geçilebilir mi (duvar, eşya, arsa sınırı). */
  private canStep(from: THREE.Vector3, to: THREE.Vector3) {
    const a = this.worldToTile(from), b = this.worldToTile(to);
    if (roomAt(this.P, b[0], b[1]) === null) return false;
    if (a[0] === b[0] && a[1] === b[1]) return true;
    {
      if (Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) > 1) return false;
      const side: Side = b[0] > a[0] ? 'e' : b[0] < a[0] ? 'w' : b[1] > a[1] ? 's' : 'n';
      if (wallAt(this.P, a[0], a[1], side)) return false;
    }
    const o = this.occ.get(`${b[0]},${b[1]}`);
    return !o || o.flat;
  }
  private occ = new Map<string, { i: number; flat: boolean }>();
  private walkJoy(dt: number) {
    const f = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const r = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    const mv = f.multiplyScalar(this.joy.y).add(r.multiplyScalar(this.joy.x));
    const mag = Math.min(1, mv.length());
    mv.normalize();
    // adadaki gibi: yavaş itince yürür, sonuna kadar itince koşar; hızlanma ve yavaşlama yumuşak
    const want2 = new THREE.Vector2(mv.x, mv.z).multiplyScalar(mag > 0.92 ? 4.6 : 2.9 * mag);
    this.vel.lerp(want2, Math.min(1, dt * 9));
    const R = 0.3;
    for (const axis of ['x', 'z'] as const) {
      const step = (axis === 'x' ? this.vel.x : this.vel.y) * dt;
      if (!step) continue;
      const next = this.pos.clone();
      next[axis] += step;
      const probe = next.clone();
      probe[axis] += Math.sign(step) * R;
      if (this.canStep(this.pos, probe)) this.pos[axis] = next[axis];
      else if (axis === 'x') this.vel.x = 0;
      else this.vel.y = 0;
    }
    // kamera yürürken yavaşça arkaya geçer (sürüklenmediyse)
    if (this.clock - this.lastDrag > 1.5 && this.joy.y > -0.3 && this.mode === 'live') {
      const goal = this.heading + Math.PI;
      this.yawGoal += Math.atan2(Math.sin(goal - this.yawGoal), Math.cos(goal - this.yawGoal)) * Math.min(1, dt * 1.2 * mag);
    }
    const [tx, tz] = this.worldToTile(this.pos);
    this.pos.y = this.floorAt(tx, tz);
    const want = Math.atan2(mv.x, mv.z);
    this.heading += Math.atan2(Math.sin(want - this.heading), Math.cos(want - this.heading)) * Math.min(1, dt * 12);
    // eşya modunda seçili eşya karakterin önünde taşınır
    if (this.ghost) {
      const front = this.worldToTile(this.pos.clone().add(new THREE.Vector3(Math.sin(this.heading), 0, Math.cos(this.heading)).multiplyScalar(1.1)));
      if (front[0] !== this.ghost.p.x || front[1] !== this.ghost.p.z) this.moveGhost(front);
    }
    return this.vel.length() / 2.9;
  }

  /** Kameraya bakan duvarları alçalt (eşya modu: bebek evi görünümü). */
  private cutaway() {
    for (const w of this.wallMeshes) {
      if (w.fade === 1) continue;
      w.fade = 1;
      for (const m of w.mats) {
        m.opacity = 1;
        m.depthWrite = true;
      }
    }
    const cx = Math.sin(this.yaw), cz = Math.cos(this.yaw);
    for (const w of this.wallMeshes) {
      const n = w.side === 'n' ? [0, 1] : [1, 0];
      const dot = n[0] * cx + n[1] * cz;
      // uzak taraftaki karo: dot > 0 ise A (önceki karo), değilse B
      const far = dot > 0 ? (w.side === 'n' ? [w.x, w.z - 1] : [w.x - 1, w.z]) : [w.x, w.z];
      const farInside = !!roomAt(this.P, far[0], far[1]);
      let tall: boolean;
      if (w.outer) tall = !farInside;
      else tall = Math.abs(dot) < 0.45;
      w.full.visible = tall;
      w.stub.visible = !tall;
    }
    for (const t of this.towers) t.obj.visible = t.dx * cx + t.dz * cz < 0;
  }

  // ----------------------------------------------------------------------------------------------
  // Kahraman
  // ----------------------------------------------------------------------------------------------
  /** Karakterin durduğu karo ve yönü (başka sayfaya gidip dönünce aynı yerde başlamak için). */
  get heroSpot() {
    return { tile: this.heroTile(), heading: this.heading, yaw: this.yawGoal };
  }
  placeHero(s: { tile: [number, number]; heading: number; yaw: number }) {
    const [x, z] = s.tile;
    if (roomAt(this.P, x, z) === null) return;
    this.pos.copy(this.tileCenter(x, z, this.floorAt(x, z)));
    this.heading = s.heading;
    this.yaw = this.yawGoal = s.yaw;
    this.route = [];
    this.petPos.copy(this.pos).add(new THREE.Vector3(0.6, 0, 0.3));
    this.camReady = false;
  }
  private placeHeroAtDoor() {
    const L = this.L, P = this.P;
    const x = P.front.x + L.hx, z = P.front.z + L.hz + 1;
    this.pos.copy(this.tileCenter(x, z, 0));
    this.heading = Math.PI;
    this.yaw = this.yawGoal = 0;
    this.petPos.copy(this.pos).add(new THREE.Vector3(0.8, 0, 0.4));
  }
  private heroTile(): [number, number] {
    return this.worldToTile(this.pos);
  }

  private walkTo(tile: [number, number], then?: () => void) {
    const p = path(this.h, this.heroTile(), tile);
    if (!p) {
      this.ev.onMessage('Oraya bir yol yok. Yolu kapatan eşyaları biraz kaydıralım mı?');
      return false;
    }
    this.route = p.slice(1).map(([x, z]) => this.tileCenter(x, z, this.floorAt(x, z)));
    this.onArrive = then ?? null;
    if (!this.route.length) {
      this.onArrive = null;
      then?.();
    }
    return true;
  }

  /** Bir eşyaya git ve onunla oyna. */
  private useItem(i: number) {
    const p = this.h.items[i];
    const it = item(p.id);
    if (!it?.use) {
      this.ev.onMessage(`${it?.name ?? 'Bu'} çok güzel duruyor!`);
      return;
    }
    const t = useTile(this.h, i, this.heroTile());
    if (!t) return this.ev.onMessage('Oraya ulaşamıyorum. Önünü açar mısın?');
    this.walkTo(t, () => this.startUse(i, it.use!));
  }

  private startUse(i: number, use: Use) {
    const p = this.h.items[i];
    const obj = this.itemObjs[i];
    const c = obj.position.clone();
    const [fx, fz] = facing(p.r);
    const faceAng = Math.atan2(fx, fz);
    const lookAt = () => (this.heading = Math.atan2(c.x - this.pos.x, c.z - this.pos.z));
    const stand = this.pos.clone();
    const fy = this.floorAt(p.x, p.z);
    const hold = (kind: 'pan' | 'apple' | 'can' | 'corn') => {
      const g = new THREE.Mesh(
        kind === 'apple' ? new THREE.SphereGeometry(0.12, 10, 8) : kind === 'corn' ? new THREE.CapsuleGeometry(0.06, 0.2, 2, 6) : new THREE.CylinderGeometry(0.14, 0.12, 0.12, 12),
        soft(kind === 'apple' ? '#ef6b6b' : kind === 'can' ? '#4dabf7' : kind === 'corn' ? '#ffd43b' : '#6b6f7a'),
      );
      g.position.set(0, -0.1, 0.15);
      this.avatar.hand.add(g);
      return () => this.avatar.hand.remove(g);
    };
    let done: (() => void) | null = null;
    const burst = (y: number, n = 6, color?: string) => this.sparkles.burst(new THREE.Vector3(c.x, y, c.z), n, color);
    const tick = (t: number, every: number) => Math.floor(t / every) !== Math.floor((t - 0.02) / every);
    let a: Omit<Act, 't'>;
    switch (use.kind) {
      case 'sit': {
        const seat = p.id === 'piknik' ? c.clone().addScaledVector(new THREE.Vector3(fx, 0, fz), 0.75) : c.clone().addScaledVector(new THREE.Vector3(fx, 0, fz), 0.05);
        const sh = p.id === 'puf' ? 0.55 : p.id === 'piknik' || p.id === 'bank' || p.id === 'sandalye' ? 0.5 : 0.5;
        a = { dur: 4, pose: 'sit', step: () => { this.pos.set(seat.x, fy + sh - HIP, seat.z); this.heading = faceAng; }, end: () => this.pos.copy(stand) };
        break;
      }
      case 'sleep': {
        a = {
          dur: 5, pose: 'idle',
          step: (t) => {
            this.lying = true;
            this.pos.set(c.x, fy + 0.62, c.z);
            this.heading = -p.r * Math.PI / 2;
            if (tick(t, 1.1)) this.sparkles.burst(new THREE.Vector3(c.x, fy + 1.2, c.z), 2, '#b8b4e6');
          },
          end: () => {
            this.lying = false;
            this.pos.copy(stand);
          },
        };
        break;
      }
      case 'watch': {
        const scr = obj.getObjectByName('screenFace') as THREE.Mesh | undefined;
        const cols = ['#7fb4e8', '#f5a3c7', '#ffcf6b', '#b7e3a0'];
        a = {
          dur: 5, pose: 'sit',
          step: (t) => {
            this.pos.set(stand.x, fy + 0.12 - HIP + 0.1, stand.z);
            lookAt();
            if (scr && tick(t, 0.6)) (scr.material as THREE.MeshStandardMaterial).emissive.set(cols[Math.floor(t / 0.6) % cols.length]).multiplyScalar(0.35);
          },
          end: () => this.pos.copy(stand),
        };
        break;
      }
      case 'piano': {
        const bench = c.clone().addScaledVector(new THREE.Vector3(fx, 0, fz), 0.6);
        a = {
          dur: 4.5, pose: (u) => (Math.floor(u * 18) % 2 ? 'sit' : 'sit'),
          step: (t) => {
            this.pos.set(bench.x, fy + 0.48 - HIP, bench.z);
            this.heading = faceAng + Math.PI;
            if (tick(t, 0.32)) {
              this.ev.sound.note([0, 2, 4, 5, 4, 2, 0, 4][Math.floor(t / 0.32) % 8]);
              burst(fy + 1.2, 2, ['#ff8fb1', '#9ad0f5', '#ffcf6b'][Math.floor(t * 3) % 3]);
            }
          },
          end: () => this.pos.copy(stand),
        };
        break;
      }
      case 'cook': case 'snack': case 'wash': case 'grill': case 'water': {
        const kind = use.kind;
        a = {
          dur: 3, pose: 'hold',
          step: (t) => {
            lookAt();
            if (!done) done = hold(kind === 'cook' ? 'pan' : kind === 'snack' ? 'apple' : kind === 'grill' ? 'corn' : kind === 'water' ? 'can' : 'pan');
            if (tick(t, 0.25)) burst(fy + (kind === 'water' ? 0.7 : 1.1), 2, kind === 'wash' || kind === 'water' ? '#7ee0ff' : kind === 'cook' || kind === 'grill' ? '#dddddd' : undefined);
          },
          end: () => done?.(),
        };
        break;
      }
      case 'bath': {
        a = {
          dur: 4.5, pose: 'sit',
          step: (t) => {
            this.pos.set(c.x, fy + 0.18 - HIP + 0.2, c.z);
            this.heading = faceAng + Math.PI / 2;
            if (tick(t, 0.3)) burst(fy + 0.8, 3, '#ffffff');
          },
          end: () => this.pos.copy(stand),
        };
        break;
      }
      case 'play': case 'look': case 'pet': {
        if (use.kind === 'pet' && this.pet) this.petTarget = c.clone();
        a = {
          dur: use.kind === 'look' ? 2.4 : 3, pose: use.kind === 'play' ? 'cheer' : use.kind === 'pet' ? 'clap' : 'wave',
          step: (t) => {
            lookAt();
            if (tick(t, 0.35)) burst(fy + 1, 3);
          },
          end: () => {},
        };
        break;
      }
      case 'dance': {
        a = {
          dur: 4, pose: 'dance',
          step: (t) => {
            this.pos.set(c.x, fy + 0.03, c.z);
            this.heading += 0.02;
            if (tick(t, 0.4)) {
              this.ev.sound.note(Math.floor(t * 2.5) % 7);
              burst(fy + 0.3, 3, ['#f5a3c7', '#9ad0f5', '#ffcf6b'][Math.floor(t * 3) % 3]);
            }
          },
          end: () => this.pos.copy(stand),
        };
        break;
      }
      case 'bounce': {
        a = {
          dur: 3.6, pose: 'jump',
          step: (t) => {
            this.pos.set(c.x, fy + 0.45 + Math.abs(Math.sin(t * 4.2)) * 1.3, c.z);
            if (tick(t, Math.PI / 4.2)) this.ev.sound.pop();
          },
          end: () => this.pos.copy(stand),
        };
        break;
      }
      case 'swing': {
        const seat = obj.getObjectByName('swing');
        a = {
          dur: 5, pose: 'sit',
          step: (t) => {
            const ang = Math.sin(t * 2.6) * 0.7 * Math.min(1, t);
            if (seat) seat.rotation.x = ang;
            const piv = new THREE.Vector3(0, 1.6, 0).applyMatrix4(obj.matrixWorld);
            const dir = new THREE.Vector3(0, -1.12, 0).applyAxisAngle(new THREE.Vector3(1, 0, 0), ang).applyAxisAngle(new THREE.Vector3(0, 1, 0), obj.rotation.y);
            this.pos.copy(piv).add(dir);
            this.pos.y += 0.05 - HIP + 0.1;
            this.heading = faceAng;
          },
          end: () => {
            if (seat) seat.rotation.x = 0;
            this.pos.copy(stand);
          },
        };
        break;
      }
      case 'slide': {
        const fwd = new THREE.Vector3(fx, 0, fz);
        const top = c.clone().addScaledVector(fwd, -1.05);
        const ladder = c.clone().addScaledVector(fwd, -1.6);
        const bottom = c.clone().addScaledVector(fwd, 1.3);
        a = {
          dur: 3.4, pose: (u) => (u < 0.4 ? 'climb' : u < 0.5 ? 'idle' : 'sit'),
          step: (_t, u) => {
            if (u < 0.4) {
              const k = u / 0.4;
              this.pos.lerpVectors(ladder, top, k * 0.3).setY(fy + k * 1.2);
              this.heading = faceAng;
            } else if (u < 0.5) this.pos.copy(top).setY(fy + 1.25);
            else {
              const k = Math.min(1, (u - 0.5) / 0.45);
              this.pos.lerpVectors(top, bottom, k).setY(fy + 1.25 * (1 - k) + 0.25 - HIP + 0.35 * k);
              this.heading = faceAng;
            }
          },
          end: () => {
            this.pos.copy(bottom).setY(0);
            burst(0.3, 8);
          },
        };
        break;
      }
      case 'swim': {
        a = {
          dur: 4.5, pose: 'swim',
          step: (t) => {
            const ang = t * 1.4;
            this.pos.set(c.x + Math.cos(ang) * 0.7, fy + 0.05, c.z + Math.sin(ang) * 0.45);
            this.heading = ang + Math.PI;
            if (tick(t, 0.3)) this.sparkles.burst(this.pos.clone().setY(0.35), 2, '#ffffff');
          },
          end: () => this.pos.copy(stand),
        };
        break;
      }
      case 'dig': {
        a = {
          dur: 3, pose: 'dig',
          step: (t) => {
            this.pos.set(c.x, fy + 0.25, c.z + 0.3);
            this.heading = Math.PI;
            if (tick(t, 0.3)) burst(fy + 0.4, 3, '#f6e3b4');
          },
          end: () => this.pos.copy(stand),
        };
        break;
      }
      case 'page': {
        const pg = use.page;
        a = { dur: 1.2, pose: 'wave', step: () => lookAt(), end: () => this.ev.onPage(pg) };
        break;
      }
    }
    this.act = { ...a!, t: 0 };
    this.ev.onBusy(true);
    const msg = use.msg;
    const end = this.act.end;
    this.act.end = () => {
      end();
      if (use.kind !== 'page') {
        this.ev.onMessage(msg);
        this.sparkles.burst(this.pos.clone().setY(this.pos.y + 1.6), 10);
      }
    };
  }

  // ----------------------------------------------------------------------------------------------
  // Dokunma
  // ----------------------------------------------------------------------------------------------
  private setRay(cx: number, cy: number) {
    const r = this.canvas.getBoundingClientRect();
    this.ray.setFromCamera(new THREE.Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1), this.camera);
  }
  private hitItem(): number {
    const hits = this.ray.intersectObjects(this.itemsG.children, true);
    for (const h of hits) {
      let o: THREE.Object3D | null = h.object;
      while (o && o.userData.index === undefined) o = o.parent;
      if (o && o.visible) return o.userData.index as number;
    }
    return -1;
  }
  private hitTile(): [number, number] | null {
    const v = new THREE.Vector3();
    if (!this.ray.ray.intersectPlane(this.ground, v)) return null;
    const t = this.worldToTile(v);
    return roomAt(this.P, t[0], t[1]) === null ? null : t;
  }

  /** Fare gezinirken önizleme takip eder. */
  hover(cx: number, cy: number) {
    if (!this.ghost) return;
    this.setRay(cx, cy);
    const t = this.hitTile();
    if (t) this.moveGhost(t);
  }

  tap(cx: number, cy: number, mouse: boolean) {
    if (this.act) return;
    this.setRay(cx, cy);
    if (this.mode === 'build') {
      if (this.ghost) {
        const t = this.hitTile();
        if (!t) return;
        const same = this.ghost.p.x === t[0] && this.ghost.p.z === t[1];
        this.moveGhost(t);
        if (mouse || same) this.placeGhost();
        return;
      }
      const i = this.hitItem();
      this.select(i);
      return;
    }
    const i = this.hitItem();
    if (i >= 0) return this.useItem(i);
    this.jump();
  }

  // ----------------------------------------------------------------------------------------------
  // Eşya modu
  // ----------------------------------------------------------------------------------------------
  setMode(m: 'live' | 'build') {
    this.mode = m;
    this.cancelGhost();
    this.select(-1);
  }
  get buildMode() {
    return this.mode === 'build';
  }

  /** Katalogdan (ya da depodan) bir eşya seç: önizleme kahramanın yakınında başlar. */
  pick(id: string, c = 0, fromStore = false) {
    this.cancelGhost();
    this.select(-1);
    const it = item(id);
    if (!it) return;
    const center = this.heroTile();
    const p: Placed = { id, x: center[0], z: center[1], r: 0, c };
    if (it.out) {
      // bahçe eşyası: evin önüne
      p.x = this.P.front.x + this.L.hx + 2;
      p.z = this.L.d - 3;
    }
    const obj = furniture(id, it.colors[c % it.colors.length], id === 'tablo' ? this.o.art[0] : undefined);
    const mark = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: '#4ade80', transparent: true, opacity: 0.45, depthWrite: false }));
    mark.rotation.x = -Math.PI / 2;
    this.scene.add(obj, mark);
    this.ghost = { p, obj, mark };
    if (fromStore) this.ghost.from = { ...p, id: '@store' };
    this.refreshGhost();
  }
  private moveGhost(t: [number, number]) {
    if (!this.ghost) return;
    this.ghost.p.x = t[0];
    this.ghost.p.z = t[1];
    this.refreshGhost();
  }
  private refreshGhost() {
    const g = this.ghost;
    if (!g) return;
    const it = item(g.p.id)!;
    if (it.wall) {
      // kameranın karşısındaki duvarı tercih et
      const cx = Math.sin(this.yaw), cz = Math.cos(this.yaw);
      const prefer: Side = Math.abs(cz) > Math.abs(cx) ? (cz > 0 ? 'n' : 's') : cx > 0 ? 'w' : 'e';
      const s = (prefer && wallAt(this.P, g.p.x, g.p.z, prefer)) ? prefer : SIDES.find((x) => wallAt(this.P, g.p.x, g.p.z, x)) ?? prefer;
      g.p.r = SIDES.indexOf(s);
    }
    const err = canPlace(this.h, g.p, g.fromIndex ?? -1);
    this.placedTransform(g.p, g.obj);
    g.obj.position.y += 0.04;
    const tiles = footprint(g.p);
    const xs = tiles.map((t) => t[0]), zs = tiles.map((t) => t[1]);
    const w = Math.max(...xs) - Math.min(...xs) + 1, d = Math.max(...zs) - Math.min(...zs) + 1;
    g.mark.scale.set(w, d, 1);
    g.mark.position.copy(this.tileCenter((Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...zs) + Math.max(...zs)) / 2, this.floorAt(g.p.x, g.p.z) + 0.03));
    (g.mark.material as THREE.MeshBasicMaterial).color.set(err ? '#f87171' : '#4ade80');
    const moving = g.fromIndex !== undefined || g.from?.id === '@store';
    this.ev.onGhost({ id: g.p.id, ok: !err, err, price: moving ? 0 : it.price, moving });
  }
  rotateGhost() {
    if (!this.ghost) return;
    const it = item(this.ghost.p.id)!;
    if (it.wall) {
      // duvarlı kenarlar arasında dolaş
      for (let k = 1; k <= 4; k++) {
        const s = SIDES[(this.ghost.p.r + k) % 4];
        if (wallAt(this.P, this.ghost.p.x, this.ghost.p.z, s)) {
          this.ghost.p.r = SIDES.indexOf(s);
          break;
        }
      }
      this.placedTransform(this.ghost.p, this.ghost.obj);
    } else this.ghost.p.r = (this.ghost.p.r + 1) % 4;
    this.refreshGhost();
    this.ev.sound.pop();
  }
  ghostColor(c: number) {
    if (!this.ghost) return;
    const g = this.ghost;
    const it = item(g.p.id)!;
    g.p.c = c;
    this.scene.remove(g.obj);
    g.obj = furniture(g.p.id, it.colors[c % it.colors.length], g.p.id === 'tablo' ? this.o.art[0] : undefined);
    this.scene.add(g.obj);
    this.refreshGhost();
  }
  placeGhost() {
    const g = this.ghost;
    if (!g) return;
    const err = canPlace(this.h, g.p, g.fromIndex ?? -1);
    if (err) {
      this.ev.onMessage(err);
      return;
    }
    const it = item(g.p.id)!;
    let next: HomeState;
    let cost = 0;
    if (g.fromIndex !== undefined) {
      next = { ...this.h, items: this.h.items.map((x, i) => (i === g.fromIndex ? { ...g.p } : x)) };
    } else if (g.from?.id === '@store') {
      const k = this.h.stored.indexOf(g.p.id);
      next = { ...this.h, items: [...this.h.items, { ...g.p }], stored: this.h.stored.filter((_, i) => i !== k) };
    } else {
      next = { ...this.h, items: [...this.h.items, { ...g.p }] };
      cost = it.price;
    }
    const e = this.bridge.save(next, -cost);
    if (e) {
      this.ev.onMessage(e);
      return;
    }
    this.h = next;
    const at = g.mark.position.clone();
    this.cancelGhost(false);
    this.buildItems();
    this.sparkles.burst(at.setY(at.y + 0.6), 14);
    this.ev.sound.star(3);
    if (cost) this.ev.onPlaced(it.id);
  }
  cancelGhost(notify = true) {
    const g = this.ghost;
    if (!g) return;
    this.scene.remove(g.obj, g.mark);
    if (g.fromIndex !== undefined && this.itemObjs[g.fromIndex]) this.itemObjs[g.fromIndex].visible = true;
    this.ghost = null;
    if (notify) this.ev.onGhost(null);
    else this.ev.onGhost(null);
  }

  private select(i: number) {
    this.sel = i;
    const p = this.h.items[i];
    const it = p && item(p.id);
    if (!p || !it) {
      this.selRing.visible = false;
      this.ev.onSelect(null);
      return;
    }
    const obj = this.itemObjs[i];
    this.selRing.visible = true;
    this.selRing.position.copy(obj.position).setY(obj.position.y + 0.05);
    const tiles = footprint(p);
    this.selRing.scale.setScalar(Math.max(1, Math.sqrt(tiles.length) * 1.2));
    this.ev.onSelect({ index: i, id: p.id, name: it.name, sell: sellPrice(p.id), colors: it.colors, c: p.c });
    this.ev.sound.pop();
  }
  selRotate() {
    const i = this.sel;
    if (i < 0) return;
    const p = this.h.items[i];
    const it = item(p.id)!;
    for (let k = 1; k <= 4; k++) {
      const cand = { ...p, r: (p.r + k) % 4 };
      if (it.wall && !wallAt(this.P, p.x, p.z, SIDES[cand.r])) continue;
      if (canPlace(this.h, cand, i) === null) {
        this.commit({ ...this.h, items: this.h.items.map((x, j) => (j === i ? cand : x)) }, 0);
        this.select(i);
        return;
      }
    }
    this.ev.onMessage('Burada dönecek yer yok. Önce biraz taşıyalım.');
  }
  selColor(c: number) {
    const i = this.sel;
    if (i < 0) return;
    this.commit({ ...this.h, items: this.h.items.map((x, j) => (j === i ? { ...x, c } : x)) }, 0);
    this.select(i);
  }
  selMove() {
    const i = this.sel;
    if (i < 0) return;
    const p = this.h.items[i];
    this.pick(p.id, p.c);
    if (!this.ghost) return;
    this.ghost.p = { ...p };
    this.ghost.fromIndex = i;
    this.itemObjs[i].visible = false;
    this.refreshGhost();
  }
  selSell() {
    const i = this.sel;
    if (i < 0) return;
    const p = this.h.items[i];
    const obj = this.itemObjs[i];
    const at = obj.position.clone();
    this.commit({ ...this.h, items: this.h.items.filter((_, j) => j !== i) }, sellPrice(p.id));
    this.select(-1);
    this.sparkles.burst(at.setY(at.y + 0.8), 12, '#ffd43b');
    this.ev.onMessage(`+${sellPrice(p.id)} altın`);
  }
  private commit(next: HomeState, coins: number) {
    const e = this.bridge.save(next, coins);
    if (e) return this.ev.onMessage(e);
    this.h = next;
    this.buildItems();
    this.ev.sound.pop();
  }

  // ----------------------------------------------------------------------------------------------
  // Zemin, duvar ve plan
  // ----------------------------------------------------------------------------------------------
  rooms() {
    const seen = new Set<string>();
    return this.P.rooms.filter((r) => {
      const k = this.roomKey(r.id);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    }).map((r) => ({ id: this.roomKey(r.id), name: r.name, floor: this.h.floor[this.roomKey(r.id)] ?? 0, wall: this.h.wall[this.roomKey(r.id)] ?? 0 }));
  }
  setFinish(room: string, kind: 'floor' | 'wall', v: number) {
    const next = { ...this.h, [kind]: { ...this.h[kind], [room]: v } };
    const e = this.bridge.save(next, 0);
    if (e) return this.ev.onMessage(e);
    this.h = next;
    this.build();
    this.ev.sound.pop();
  }
  /** Ev planı: sahip olunanlar bedava, yenisi altınla. */
  setPlan(id: string): string | null {
    const P = PLANS.find((p) => p.id === id);
    if (!P) return null;
    const owned = this.h.plans.includes(id);
    const next = changePlan(this.h, id);
    const e = this.bridge.save(next, owned ? 0 : -P.price);
    if (e) return e;
    this.h = next;
    this.cancelGhost();
    this.select(-1);
    this.build();
    this.placeHeroAtDoor();
    this.sparkles.burst(new THREE.Vector3(0, 2, 0), 30);
    this.ev.sound.star(5);
    return next.stored.length ? `${P.name} hazır! Sığmayan eşyalar depoda.` : `${P.name} hazır!`;
  }
  get state() {
    return this.h;
  }
  /** Dışarıda değişti (ör. depodan eşya). */
  reload() {
    this.h = normalizeHome(this.bridge.get());
    this.build();
  }

  // ----------------------------------------------------------------------------------------------
  // Katalog resimleri
  // ----------------------------------------------------------------------------------------------
  private thumbCache = new Map<string, string>();
  thumbnail(id: string, c = 0): string {
    const key = `${id}|${c}`;
    const hit = this.thumbCache.get(key);
    if (hit) return hit;
    const it = item(id);
    if (!it) return '';
    const S = 160;
    const sc = new THREE.Scene();
    sc.add(new THREE.HemisphereLight('#ffffff', '#e6dcf5', 1.4));
    const d = new THREE.DirectionalLight('#ffffff', 1.4);
    d.position.set(-3, 6, 4);
    sc.add(d);
    const obj = furniture(id, it.colors[c % it.colors.length], id === 'tablo' ? this.o.art[0] : undefined);
    if (it.wall) obj.position.set(0, -1.1, 0.5);
    sc.add(obj);
    const box = new THREE.Box3().setFromObject(obj);
    const ctr = box.getCenter(new THREE.Vector3());
    const r = Math.max(0.6, box.getSize(new THREE.Vector3()).length() / 2);
    const cam = new THREE.OrthographicCamera(-r, r, r, -r, 0.1, 50);
    cam.position.copy(ctr).add(new THREE.Vector3(1, 0.85, 1.25).normalize().multiplyScalar(20));
    cam.lookAt(ctr);
    const rt = new THREE.WebGLRenderTarget(S, S, { samples: 4 });
    rt.texture.colorSpace = THREE.SRGBColorSpace;
    const prev = this.renderer.getRenderTarget();
    const clear = this.renderer.getClearAlpha();
    this.renderer.setRenderTarget(rt);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.clear();
    this.renderer.render(sc, cam);
    const px = new Uint8Array(S * S * 4);
    this.renderer.readRenderTargetPixels(rt, 0, 0, S, S, px);
    this.renderer.setRenderTarget(prev);
    this.renderer.setClearAlpha(clear);
    rt.dispose();
    const cv = document.createElement('canvas');
    cv.width = cv.height = S;
    const ctx = cv.getContext('2d')!;
    const img = ctx.createImageData(S, S);
    for (let y = 0; y < S; y++) img.data.set(px.subarray((S - 1 - y) * S * 4, (S - y) * S * 4), y * S * 4);
    ctx.putImageData(img, 0, 0);
    const url = cv.toDataURL('image/png');
    this.thumbCache.set(key, url);
    return url;
  }

  // ----------------------------------------------------------------------------------------------
  // Döngü
  // ----------------------------------------------------------------------------------------------
  private frame = (now: number) => {
    if (!this.running) return;
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.dt = dt;
    this.last = now;
    this.clock += dt;
    // kamera dönüşü
    if (Math.abs(this.yawGoal - this.yaw) > 0.0005) {
      this.yaw += (this.yawGoal - this.yaw) * Math.min(1, dt * 8);
      if (this.ghost) this.refreshGhost();
    }
    let pose: Pose = 'walk';
    let speed = 0;
    if (!this.act && (this.joy.lengthSq() > 0.01 || this.vel.lengthSq() > 0.01)) {
      this.route = [];
      this.onArrive = null;
      speed = this.walkJoy(dt);
      if (speed > 0.05) this.emoteKind = null;
    } else if (this.act) {
      const a = this.act;
      a.t += dt;
      const u = Math.min(1, a.t / a.dur);
      a.step(a.t, u);
      pose = typeof a.pose === 'function' ? a.pose(u) : a.pose;
      if (u >= 1) {
        this.act = null;
        a.end();
        this.ev.onBusy(false);
      }
    } else if (this.route.length) {
      const target = this.route[0];
      const d = target.clone().sub(this.pos);
      const l = Math.hypot(d.x, d.z);
      const sp = 3.2 * dt;
      if (l <= sp) {
        this.pos.copy(target);
        this.route.shift();
        if (!this.route.length) {
          const f = this.onArrive;
          this.onArrive = null;
          f?.();
        }
      } else {
        this.pos.addScaledVector(d.normalize(), sp);
        this.pos.y = target.y;
        const want = Math.atan2(d.x, d.z);
        this.heading += Math.atan2(Math.sin(want - this.heading), Math.cos(want - this.heading)) * Math.min(1, dt * 12);
      }
      speed = 0.7;
    }
    this.walking = speed;
    // zıplama
    if (this.jumpV !== 0 || this.jumpY > 0) {
      this.jumpV -= 11 * dt;
      this.jumpY = Math.max(0, this.jumpY + this.jumpV * dt);
      if (this.jumpY === 0 && this.jumpV < 0) this.jumpV = 0;
    }
    if (!this.act) {
      if (this.jumpY > 0.02) pose = 'jump';
      else if (this.emoteKind && this.clock < this.emoteUntil && speed < 0.05) pose = this.emoteKind;
    }
    // kahraman
    this.avatar.root.position.copy(this.pos).setY(this.pos.y + this.jumpY);
    this.warm.position.set(this.pos.x, this.pos.y + 2.3, this.pos.z);
    this.avatar.root.rotation.y = this.heading;
    this.avatar.root.rotation.x = this.lying ? -Math.PI / 2 : 0;
    this.avatar.update(dt, this.clock, pose, speed);
    // evcil hayvan: peşinden gelir (ya da yatağına gider)
    if (this.pet) {
      const want = this.petTarget ?? this.pos.clone().add(new THREE.Vector3(-Math.sin(this.heading) * 0.9 + 0.4, 0, -Math.cos(this.heading) * 0.9));
      if (this.petTarget && (this.route.length || (!this.act && this.clock % 1 < dt && this.walking))) this.petTarget = null;
      const d = want.clone().sub(this.petPos).setY(0);
      if (d.length() > 0.2) this.petPos.addScaledVector(d, Math.min(1, dt * 3));
      const [tx, tz] = this.worldToTile(this.petPos);
      this.pet.position.set(this.petPos.x, this.floorAt(tx, tz) + (d.length() > 0.2 ? Math.abs(Math.sin(this.clock * 10)) * 0.12 : 0), this.petPos.z);
      this.pet.rotation.y = Math.atan2(this.camera.position.x - this.pet.position.x, this.camera.position.z - this.pet.position.z);
    }
    // canlı küçük şeyler: akvaryumdaki balıklar
    for (const o of this.itemObjs) {
      if (!o) continue;
      o.traverse((c) => {
        if (c.name === 'fish') c.position.x = Math.sin(this.clock * 1.5 + c.id) * 0.2;
        else if (c.name === 'flame') c.scale.y = 0.85 + Math.sin(this.clock * 9 + c.id) * 0.18;
      });
    }
    if (this.sel >= 0) this.selRing.rotation.z += dt;
    this.sparkles.update(dt);
    this.follow(dt);
    if (this.mode === 'build') this.cutaway();
    else this.occlusion();
    this.renderer.render(this.scene, this.camera);
    this.raf = requestAnimationFrame(this.frame);
  };

  /** Test: kahramanın karosu ve durumu. */
  get heroState() {
    return { tile: this.heroTile(), busy: !!this.act, walking: this.route.length > 0, mode: this.mode, items: this.h.items.length };
  }
}
