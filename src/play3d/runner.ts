/**
 * "Çizdiğinle oyna" 3B koşu oyunu.
 *
 * Dünya derinlemesine akar (ileri = +x); kamera arkadan-yandan ve yüksekten bakar. Çocuğun çizimi kâğıt bir kart gibi
 * (Paper Mario tarzı) kameraya döner; parçaları (tekerlek, kanat, göz…) oynamaya devam eder.
 *   koş / sür : 3 şerit yan yana (kaydırarak geç), dokununca zıpla; alçak engeller zıplanır, yüksekler şerit değiştirerek
 *   uç / yüz  : 3 şerit üst üste (kaydırarak yüksel/alçal)
 * Yıldızlar, mıknatıs (yıldızları çeker), kalkan (bir çarpmayı önler) ve kalp (can). 3 can; süre dolunca ya da canlar
 * bitince tur biter.
 */
import * as THREE from 'three';
import type { GameKind } from '../art/motion';
import { drawRig, type Rig } from '../art/rig';
import { canvasTexture, cloud, disposeScene, heart, makeRenderer, mesh, outline, Sparkles, star, toon, tree } from './kit';

export type RunScene = 'road' | 'meadow' | 'snow' | 'beach' | 'sea' | 'sky' | 'space';
export type Power = 'magnet' | 'shield';

export interface RunnerHud {
  stars: number;
  lives: number;
  left: number;
  dist: number;
  power: Power | null;
}
export interface RunnerEnd { stars: number; dist: number; reason: 'time' | 'lives' }

export interface RunnerOptions {
  rig: Rig;
  facing: number;
  game: GameKind;
  scene: RunScene;
  seconds: number;
  onHud: (h: RunnerHud) => void;
  onEnd: (r: RunnerEnd) => void;
  sound: { star: (i: number) => void; hit: () => void; jump: () => void; power: () => void; lane: () => void };
}

const LANE = 2.6;
const AIR_Y = [1.0, 2.9, 4.8];
const SPAWN_X = 90;

interface Thing {
  obj: THREE.Object3D;
  x: number;
  lane: number;
  kind: 'star' | 'block' | 'power' | 'heart' | 'deco';
  /** Engelin yüksekliği: üstünden zıplanabilir mi (koşu). */
  low?: boolean;
  power?: Power;
  y0?: number;
  /** Süs eşyası (ağaç, ev…): z konumu sabit, çarpışmaz. */
  spin?: number;
}

const SKY: Record<RunScene, string> = {
  road: '#9fdcff', meadow: '#a9e4ff', snow: '#cfeaff', beach: '#9fe1ff', sea: '#2a9cc8', sky: '#8fd0ff', space: '#1b1640',
};

export class Runner {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(48, 1, 0.1, 300);
  private player = new THREE.Group();
  private card: THREE.Mesh;
  private cardTex: THREE.CanvasTexture;
  private cardCtx: CanvasRenderingContext2D;
  private shadow: THREE.Mesh;
  private shieldBubble: THREE.Mesh;
  private things: Thing[] = [];
  private sparkles: Sparkles;
  private groundTex?: THREE.Texture;
  private raf = 0;
  private last = 0;
  private running = false;
  private ended = false;
  private t = 0;
  private clock = 0;
  private speed = 11;
  private dist = 0;
  private nextSpawn = 30;
  private nextPower = 18;
  private nextDeco = 0;
  private lane = 1;
  private laneZ = 0;
  private y = 0;
  private vy = 0;
  private jumps = 0;
  private stars = 0;
  private lives = 3;
  private hitUntil = 0;
  private power: Power | null = null;
  private powerUntil = 0;
  private shake = 0;
  private hudKey = '';
  private air: boolean;
  /** Çizimin yarı yüksekliği: havada engeller ve yıldızlar çizimin ortasına hizalanır. */
  private mid = 1;
  private resizeObs: ResizeObserver;

  constructor(private canvas: HTMLCanvasElement, private o: RunnerOptions) {
    this.air = o.game === 'fly' || o.game === 'swim';
    this.renderer = makeRenderer(canvas);
    const sky = new THREE.Color(SKY[o.scene]);
    this.scene.background = sky;
    this.scene.fog = new THREE.Fog(sky, o.scene === 'sea' ? 22 : 40, o.scene === 'sea' ? 75 : 110);

    // Işıklar
    this.scene.add(new THREE.HemisphereLight(o.scene === 'space' ? '#9a8cff' : '#ffffff', o.scene === 'sea' ? '#0d5a7a' : '#7fbf6a', o.scene === 'space' ? 0.9 : 1.1));
    const sun = new THREE.DirectionalLight('#fff4dc', o.scene === 'sea' ? 1.1 : 1.6);
    sun.position.set(-10, 20, 12);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.bias = -0.0006;
    sun.shadow.normalBias = 0.04;
    Object.assign(sun.shadow.camera, { left: -16, right: 30, top: 16, bottom: -16, near: 1, far: 60 });
    sun.target.position.set(6, 0, 0);
    this.scene.add(sun, sun.target);

    this.buildWorld();

    // Oyuncu: çizimden kâğıt kart
    const c = document.createElement('canvas');
    c.width = c.height = 320;
    this.cardCtx = c.getContext('2d')!;
    this.cardTex = new THREE.CanvasTexture(c);
    this.cardTex.colorSpace = THREE.SRGBColorSpace;
    const box = o.rig.box;
    const aspect = box.w / Math.max(1, box.h);
    const H = 2.1, W = Math.min(3.4, H * Math.max(0.6, aspect));
    // kartın tuvali kare: içerik kare içinde sığdırılır, düzlem de kare olur
    const S = Math.max(W, H);
    this.card = new THREE.Mesh(new THREE.PlaneGeometry(S, S), new THREE.MeshBasicMaterial({ map: this.cardTex, transparent: true, alphaTest: 0.05, side: THREE.DoubleSide }));
    // çizimin alt kenarı yere basar (kare kartın içinde boşluk kalmasın)
    const drawH = S * (300 / 320) * (box.h / Math.max(box.w, box.h));
    this.card.position.y = drawH / 2 - 0.03;
    this.mid = drawH / 2;
    this.player.add(this.card);
    this.shadow = new THREE.Mesh(new THREE.CircleGeometry(Math.min(W, 2.2) * 0.45, 24), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false }));
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.scale.y = 0.5;
    this.scene.add(this.shadow);
    this.shieldBubble = new THREE.Mesh(new THREE.SphereGeometry(S * 0.62, 24, 18), new THREE.MeshBasicMaterial({ color: '#7ee0ff', transparent: true, opacity: 0.25, depthWrite: false }));
    this.shieldBubble.position.y = drawH / 2;
    this.shieldBubble.visible = false;
    this.player.add(this.shieldBubble);
    this.scene.add(this.player);
    if (this.air) this.y = AIR_Y[1];

    this.sparkles = new Sparkles(this.scene);
    // Başlangıçta yol boş olmasın: süsler önceden dizilir
    for (let x = -20; x < SPAWN_X; x += 7) this.spawnDeco(x);

    this.resizeObs = new ResizeObserver(() => this.resize());
    this.resizeObs.observe(canvas);
    this.resize();
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  // ----------------------------------------------------------------------------------------------
  // Dünya
  // ----------------------------------------------------------------------------------------------
  private buildWorld() {
    const sc = this.o.scene;
    if (sc === 'space') {
      const g = new THREE.BufferGeometry();
      const pts: number[] = [];
      for (let i = 0; i < 700; i++) pts.push((Math.random() - 0.3) * 260, Math.random() * 90 - 20, -40 - Math.random() * 120);
      g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
      this.scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: '#fff7d0', size: 0.6 })));
      const planet = outline(mesh(new THREE.SphereGeometry(9, 24, 18), toon('#ff8fb1'), false), 1.02);
      planet.position.set(70, 22, -70);
      const ring = mesh(new THREE.TorusGeometry(14, 0.9, 6, 40), toon('#ffd43b'), false);
      ring.rotation.x = 1.2;
      planet.add(ring);
      this.scene.add(planet);
      return;
    }
    if (sc === 'sky') {
      for (let i = 0; i < 14; i++) {
        const c = cloud(2 + Math.random() * 2);
        c.position.set(Math.random() * 200 - 30, -4 - Math.random() * 3, (Math.random() - 0.5) * 60);
        this.scene.add(c);
      }
      return;
    }
    // Zemin şeridi (kayan doku) ve iki yanı
    const ground = { road: '#8d8f99', meadow: '#d9b98a', snow: '#f4f8ff', beach: '#f3dca2', sea: '#e9d39a' }[sc];
    const side = { road: '#7fcf63', meadow: '#7fcf63', snow: '#ffffff', beach: '#f7e6b6', sea: '#d8c084' }[sc];
    this.groundTex = canvasTexture(256, 256, (ctx) => {
      ctx.fillStyle = ground;
      ctx.fillRect(0, 0, 256, 256);
      if (sc === 'road') {
        ctx.fillStyle = '#ffffff';
        // iki şerit çizgisi, kesikli
        for (const y of [256 / 3, (256 * 2) / 3]) ctx.fillRect(0, y - 3, 140, 6);
        ctx.fillStyle = '#ffc83d';
        ctx.fillRect(0, 0, 256, 6);
        ctx.fillRect(0, 250, 256, 6);
      } else {
        for (let i = 0; i < 60; i++) {
          ctx.fillStyle = `rgba(0,0,0,${0.03 + Math.random() * 0.05})`;
          ctx.beginPath();
          ctx.arc(Math.random() * 256, Math.random() * 256, 2 + Math.random() * 5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        for (const y of [256 / 3, (256 * 2) / 3]) for (let x = 0; x < 256; x += 32) ctx.fillRect(x, y - 2, 14, 4);
      }
    }, [10, 1]);
    const strip = mesh(new THREE.PlaneGeometry(240, LANE * 3 + 0.6), new THREE.MeshToonMaterial({ map: this.groundTex }), false);
    strip.rotation.x = -Math.PI / 2;
    strip.position.set(60, 0, 0);
    this.scene.add(strip);
    const sideMat = toon(side);
    for (const z of [-60, 60]) {
      const s = mesh(new THREE.PlaneGeometry(260, 116), sideMat, false);
      s.rotation.x = -Math.PI / 2;
      s.position.set(60, -0.02, z > 0 ? 58 + LANE * 1.5 + 0.3 : -58 - LANE * 1.5 - 0.3);
      this.scene.add(s);
    }
    if (sc === 'sea') {
      // su yüzeyi ve ışık huzmeleri
      const surf = new THREE.Mesh(new THREE.PlaneGeometry(300, 200), new THREE.MeshBasicMaterial({ color: '#8fe3f5', transparent: true, opacity: 0.35, side: THREE.DoubleSide }));
      surf.rotation.x = Math.PI / 2;
      surf.position.set(60, 9, 0);
      this.scene.add(surf);
    }
    // uzak tepeler
    if (sc !== 'sea') {
      for (let i = 0; i < 9; i++) {
        const h = mesh(new THREE.SphereGeometry(14 + Math.random() * 10, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon(sc === 'snow' ? '#ffffff' : i % 2 ? '#8fd16f' : '#6cc35a'), false);
        h.position.set(i * 30 - 10, -2, -55 - Math.random() * 10);
        h.scale.y = 0.45;
        this.scene.add(h);
      }
    }
  }

  private add(obj: THREE.Object3D, x: number, lane: number, kind: Thing['kind'], extra: Partial<Thing> = {}) {
    this.scene.add(obj);
    const t: Thing = { obj, x, lane, kind, ...extra };
    this.things.push(t);
    this.place(t);
    return t;
  }

  private laneZOf = (lane: number) => (lane - 1) * LANE;

  private place(t: Thing) {
    if (t.kind === 'deco') {
      t.obj.position.x = t.x;
      return;
    }
    if (this.air) t.obj.position.set(t.x, AIR_Y[t.lane] + this.mid, 0);
    else t.obj.position.set(t.x, t.y0 ?? 0, this.laneZOf(t.lane));
  }

  /** Yol kenarı süsleri: ağaç, ev, lamba; denizde yosun ve mercan; gökte bulut. */
  private spawnDeco(x: number) {
    const sc = this.o.scene;
    const farZ = -LANE * 1.5 - 3 - Math.random() * 8;
    let o: THREE.Object3D | null = null;
    const r = Math.random();
    if (sc === 'road') {
      if (r < 0.45) {
        o = new THREE.Group();
        const h = 3 + Math.random() * 4;
        const colors = ['#ff8a65', '#ffd166', '#7ec8e3', '#b39ddb', '#f48fb1'];
        const b = outline(mesh(new THREE.BoxGeometry(4, h, 3.2), toon(colors[Math.floor(Math.random() * colors.length)])), 1.02);
        b.position.y = h / 2;
        const roof = mesh(new THREE.ConeGeometry(3, 1.6, 4), toon('#d9534f'));
        roof.position.y = h + 0.8;
        roof.rotation.y = Math.PI / 4;
        o.add(b, roof);
        for (let wy = 1.2; wy < h - 0.4; wy += 1.3) for (const wx of [-1, 1]) {
          const w = mesh(new THREE.BoxGeometry(0.8, 0.7, 0.05), toon('#fff6c9', { emissive: '#3a3000' }), false);
          w.position.set(wx, wy, 1.62);
          o.add(w);
        }
      } else if (r < 0.75) o = tree('round', 0.9 + Math.random() * 0.5);
      else {
        o = new THREE.Group();
        const p = mesh(new THREE.CylinderGeometry(0.08, 0.1, 3.4, 6), toon('#5b5f6b'));
        p.position.y = 1.7;
        const l = mesh(new THREE.SphereGeometry(0.3, 10, 8), toon('#fff6c9', { emissive: '#665500' }));
        l.position.set(0.3, 3.4, 0);
        o.add(p, l);
        o.position.z = -LANE * 1.5 - 0.8;
      }
    } else if (sc === 'meadow' || sc === 'beach' || sc === 'snow') {
      if (sc === 'beach') {
        o = new THREE.Group();
        const trunk = mesh(new THREE.CylinderGeometry(0.15, 0.25, 4, 6), toon('#b07d4f'));
        trunk.position.y = 2;
        trunk.rotation.z = 0.15;
        o.add(trunk);
        for (let i = 0; i < 5; i++) {
          const leaf = mesh(new THREE.ConeGeometry(0.35, 2.4, 4), toon('#4caf50'));
          leaf.position.set(0.3, 4, 0);
          leaf.rotation.set(0, (i * Math.PI * 2) / 5, Math.PI / 2.4);
          o.add(leaf);
        }
      } else o = r < 0.6 ? tree(sc === 'snow' ? 'snow' : 'round', 0.8 + Math.random() * 0.6) : tree(sc === 'snow' ? 'snow' : 'pine', 0.8 + Math.random() * 0.5);
    } else if (sc === 'sea') {
      o = new THREE.Group();
      for (let i = 0; i < 3; i++) {
        const w = mesh(new THREE.CylinderGeometry(0.08, 0.14, 2 + Math.random() * 2.5, 5), toon('#2bb673'));
        w.position.set(i * 0.4, 1.4, Math.random());
        w.rotation.z = (Math.random() - 0.5) * 0.4;
        o.add(w);
      }
      if (r < 0.5) {
        const c = outline(mesh(new THREE.IcosahedronGeometry(0.9, 0), toon(['#ff8fb1', '#ffb36b', '#b98cff'][Math.floor(Math.random() * 3)])), 1.05);
        c.position.set(-0.8, 0.6, 0);
        o.add(c);
      }
    } else if (sc === 'sky' || sc === 'space') {
      if (Math.random() < 0.5) return;
      o = sc === 'sky' ? cloud(1 + Math.random()) : outline(mesh(new THREE.DodecahedronGeometry(0.6 + Math.random() * 0.8, 0), toon('#8d86a8')), 1.05);
      o.position.set(x, Math.random() * 8 - 1, -8 - Math.random() * 12);
      this.add(o, x, 0, 'deco');
      return;
    }
    if (!o) return;
    if (o.position.z === 0) o.position.z = farZ;
    this.add(o, x, 0, 'deco');
  }

  /** Engeller sahneye göre. Alçak olanlar zıplanır. */
  private obstacle(low: boolean): THREE.Object3D {
    const sc = this.o.scene;
    const g = new THREE.Group();
    if (this.air) {
      if (sc === 'sea') {
        // denizanası
        const dome = outline(mesh(new THREE.SphereGeometry(0.7, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon('#ff8fb1')), 1.06);
        dome.position.y = 0.3;
        g.add(dome);
        for (let i = 0; i < 5; i++) {
          const t = mesh(new THREE.CylinderGeometry(0.05, 0.03, 1.1, 4), toon('#ffb3c7'), false);
          t.position.set(Math.cos(i * 1.25) * 0.4, -0.25, Math.sin(i * 1.25) * 0.4);
          g.add(t);
        }
      } else if (sc === 'space') {
        g.add(outline(mesh(new THREE.DodecahedronGeometry(0.9, 0), toon('#9a8f7f')), 1.05));
      } else {
        const c = cloud(0.85, '#8d93a8');
        g.add(c);
        const bolt = mesh(new THREE.ConeGeometry(0.18, 0.9, 4), toon('#ffc83d', { emissive: '#664400' }), false);
        bolt.position.y = -0.9;
        bolt.rotation.x = Math.PI;
        g.add(bolt);
      }
      return g;
    }
    if (low) {
      if (sc === 'road') {
        const cone = outline(mesh(new THREE.ConeGeometry(0.45, 1.1, 12), toon('#ff7a3d')), 1.06);
        cone.position.y = 0.55;
        const band = mesh(new THREE.CylinderGeometry(0.3, 0.36, 0.2, 12), toon('#ffffff'), false);
        band.position.y = 0.55;
        const base = mesh(new THREE.BoxGeometry(1, 0.12, 1), toon('#ff7a3d'));
        base.position.y = 0.06;
        g.add(cone, band, base);
      } else if (sc === 'snow') {
        const b = outline(mesh(new THREE.SphereGeometry(0.6, 14, 10), toon('#ffffff')), 1.05);
        b.position.y = 0.55;
        g.add(b);
      } else {
        const log = outline(mesh(new THREE.CylinderGeometry(0.4, 0.4, 2.2, 10), toon('#a0703f')), 1.05);
        log.rotation.x = Math.PI / 2;
        log.position.y = 0.4;
        g.add(log);
      }
      return g;
    }
    // yüksek: şerit değiştirerek kaçılır
    if (sc === 'road') {
      const board = outline(mesh(new THREE.BoxGeometry(0.3, 1, 2.3), toon('#ffffff')), 1.03);
      board.position.y = 1.7;
      for (const z of [-0.9, 0.9]) {
        const leg = mesh(new THREE.BoxGeometry(0.2, 2.2, 0.2), toon('#ff5252'));
        leg.position.set(0, 1.1, z);
        g.add(leg);
      }
      for (let i = -1; i <= 1; i++) {
        const s = mesh(new THREE.BoxGeometry(0.32, 1.02, 0.35), toon('#ff5252'), false);
        s.position.set(0, 1.7, i * 0.75);
        s.rotation.x = 0.6;
        g.add(s);
      }
      g.add(board);
    } else if (sc === 'snow') {
      const ice = outline(mesh(new THREE.BoxGeometry(1.4, 2.4, 2), toon('#bfe9ff', { transparent: true, opacity: 0.9 })), 1.03);
      ice.position.y = 1.2;
      g.add(ice);
    } else {
      const bush = outline(mesh(new THREE.IcosahedronGeometry(1.25, 1), toon('#3fa45a')), 1.04);
      bush.position.y = 1.2;
      bush.scale.set(0.9, 1.15, 1);
      g.add(bush);
    }
    return g;
  }

  private spawnRow(x: number) {
    // 1-2 şerit engel; en az bir şerit hep boş
    const lanes = [0, 1, 2].sort(() => Math.random() - 0.5);
    const nBlocks = this.t < 6 ? 1 : Math.random() < 0.45 + Math.min(0.25, this.t / 120) ? 2 : 1;
    const blocked = lanes.slice(0, nBlocks);
    const free = lanes.slice(nBlocks);
    for (const l of blocked) {
      const low = !this.air && Math.random() < 0.5;
      this.add(this.obstacle(low), x, l, 'block', { low });
      // alçak engelin üstünden yay çizen yıldızlar
      if (low && Math.random() < 0.6) for (let i = 0; i < 3; i++) this.add(star(), x - 2.4 + i * 2.4, l, 'star', { y0: 2.2 + Math.sin((Math.PI * (i + 1)) / 4) * 1.2, spin: Math.random() * 6 });
    }
    const sl = free[Math.floor(Math.random() * free.length)];
    for (let i = 0; i < 5; i++) this.add(star(), x + 4 + i * 2.2, sl, 'star', { y0: 0.9, spin: Math.random() * 6 });
  }

  private spawnPower(x: number) {
    const lane = Math.floor(Math.random() * 3);
    const r = Math.random();
    if (r < 0.2 && this.lives < 3) {
      this.add(heart(), x, lane, 'heart', { y0: 1.2 });
      return;
    }
    const power: Power = r < 0.6 ? 'magnet' : 'shield';
    let obj: THREE.Object3D;
    if (power === 'magnet') {
      const g = new THREE.Group();
      const u = outline(mesh(new THREE.TorusGeometry(0.45, 0.16, 8, 16, Math.PI), toon('#ff5252')), 1.08);
      u.rotation.z = Math.PI;
      const tips = [-0.45, 0.45].map((tx) => {
        const t = mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.25, 8), toon('#e0e0e0'));
        t.position.set(tx, 0.12, 0);
        return t;
      });
      g.add(u, ...tips);
      obj = g;
    } else obj = new THREE.Mesh(new THREE.SphereGeometry(0.55, 20, 14), new THREE.MeshToonMaterial({ color: '#7ee0ff', transparent: true, opacity: 0.75 }));
    this.add(obj, x, lane, 'power', { power, y0: 1.2 });
  }

  // ----------------------------------------------------------------------------------------------
  // Kontrol
  // ----------------------------------------------------------------------------------------------
  /** left/right: koşuda şerit, havada da şerit (aşağı/yukarı). up: zıpla (koşu) ya da yüksel (hava). */
  input(cmd: 'left' | 'right' | 'up' | 'down' | 'jump') {
    if (!this.running) return;
    if (this.air) {
      const d = cmd === 'up' || cmd === 'jump' ? 1 : cmd === 'down' ? -1 : 0;
      if (!d) return;
      const nl = Math.max(0, Math.min(2, this.lane + d));
      if (nl !== this.lane) {
        this.lane = nl;
        this.o.sound.lane();
      }
      return;
    }
    if (cmd === 'jump' || cmd === 'up') {
      if (this.jumps < 2) {
        this.vy = this.jumps ? 8.5 : 10.5;
        this.jumps++;
        this.o.sound.jump();
      }
      return;
    }
    // ekranda sol = uzak şerit (kameranın baktığı taraf), sağ = yakın şerit
    const nl = Math.max(0, Math.min(2, this.lane + (cmd === 'left' ? -1 : 1)));
    if (nl !== this.lane) {
      this.lane = nl;
      this.o.sound.lane();
    }
  }

  start() {
    this.running = true;
  }

  // ----------------------------------------------------------------------------------------------
  // Döngü
  // ----------------------------------------------------------------------------------------------
  private frame = (now: number) => {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.clock += dt;
    if (this.running && !this.ended) this.step(dt);
    else this.idle(dt);
    this.draw(dt);
    this.raf = requestAnimationFrame(this.frame);
  };

  private idle(dt: number) {
    // hazır ekranında dünya yavaşça akar
    this.scroll(dt * 3);
  }

  private scroll(d: number) {
    for (const t of this.things) {
      t.x -= d;
      t.obj.position.x = t.x;
    }
    if (this.groundTex) this.groundTex.offset.x += d / 24;
    this.nextDeco -= d;
    if (this.nextDeco <= 0) {
      this.spawnDeco(SPAWN_X);
      this.nextDeco = 5 + Math.random() * 5;
    }
    for (const t of this.things.filter((x) => x.x < -25)) {
      this.scene.remove(t.obj);
    }
    this.things = this.things.filter((x) => x.x >= -25);
  }

  private step(dt: number) {
    this.t += dt;
    const left = Math.max(0, this.o.seconds - this.t);
    this.speed = 11 + Math.min(9, this.t * 0.16);
    const d = this.speed * dt * (this.hitUntil > this.t ? 0.65 : 1);
    this.dist += d;
    this.scroll(d);

    // yeni sıralar
    this.nextSpawn -= d;
    if (this.nextSpawn <= 0) {
      this.spawnRow(SPAWN_X);
      this.nextSpawn = 16 + Math.random() * 6 - Math.min(5, this.t / 12);
    }
    this.nextPower -= dt;
    if (this.nextPower <= 0) {
      this.spawnPower(SPAWN_X - 6);
      this.nextPower = 14 + Math.random() * 8;
    }
    if (this.power && this.t > this.powerUntil) this.power = null;

    // zıplama
    if (!this.air) {
      this.vy -= 28 * dt;
      this.y += this.vy * dt;
      if (this.y <= 0) {
        this.y = 0;
        this.vy = 0;
        this.jumps = 0;
      }
    }

    // çarpışmalar
    const py = this.air ? AIR_Y[this.lane] : this.y;
    for (const t of this.things) {
      if (t.kind === 'deco') continue;
      const near = Math.abs(t.x) < (t.kind === 'block' ? 1.1 : 1.0);
      const magnet = this.power === 'magnet' && t.kind === 'star' && t.x < 9 && t.x > -1;
      if (magnet) {
        // mıknatıs: yıldızlar oyuncuya uçar
        t.lane = this.lane;
        t.x -= Math.min(t.x, 18 * dt);
        if (t.y0 !== undefined) t.y0 += ((this.air ? 0 : this.y + 1) - t.y0) * Math.min(1, 6 * dt);
        this.place(t);
      }
      if (!near || t.lane !== this.lane) continue;
      if (t.kind === 'block') {
        if (t.low && py > 1.0) continue;
        if (this.hitUntil > this.t) continue;
        if (this.power === 'shield') {
          this.power = null;
          this.sparkles.burst(new THREE.Vector3(0, 1.5, this.laneZ), 14, '#7ee0ff');
          t.x = -100;
          this.o.sound.power();
          continue;
        }
        this.lives--;
        this.hitUntil = this.t + 1.3;
        this.shake = 0.35;
        this.o.sound.hit();
        if (this.lives <= 0) return this.finish('lives');
      } else if (t.kind === 'star') {
        t.x = -100;
        this.stars++;
        this.sparkles.burst(new THREE.Vector3(0, (t.y0 ?? 1) + (this.air ? AIR_Y[this.lane] : 0), this.laneZ), 8);
        this.o.sound.star(this.stars);
      } else if (t.kind === 'power') {
        t.x = -100;
        this.power = t.power!;
        this.powerUntil = this.t + (t.power === 'magnet' ? 9 : 30);
        this.sparkles.burst(new THREE.Vector3(0, 1.5, this.laneZ), 14, t.power === 'magnet' ? '#ff8a80' : '#7ee0ff');
        this.o.sound.power();
      } else if (t.kind === 'heart') {
        t.x = -100;
        this.lives = Math.min(3, this.lives + 1);
        this.sparkles.burst(new THREE.Vector3(0, 1.5, this.laneZ), 12, '#ff8fb1');
        this.o.sound.power();
      }
    }

    const hud: RunnerHud = { stars: this.stars, lives: this.lives, left: Math.ceil(left), dist: Math.floor(this.dist), power: this.power };
    const key = `${hud.stars}|${hud.lives}|${hud.left}|${hud.power}|${Math.floor(hud.dist / 10)}`;
    if (key !== this.hudKey) {
      this.hudKey = key;
      this.o.onHud(hud);
    }
    if (left <= 0) this.finish('time');
  }

  private finish(reason: RunnerEnd['reason']) {
    if (this.ended) return;
    this.ended = true;
    this.running = false;
    this.o.onEnd({ stars: this.stars, dist: Math.floor(this.dist), reason });
  }

  private draw(dt: number) {
    // oyuncunun yeri: şerit (z) ya da yükseklik (y) yumuşak geçişle
    const targetZ = this.air ? 0 : this.laneZOf(this.lane);
    this.laneZ += (targetZ - this.laneZ) * Math.min(1, 12 * dt);
    const airY = this.air ? AIR_Y[this.lane] : 0;
    const prevY = this.player.position.y;
    const y = this.air ? prevY + (airY - prevY) * Math.min(1, 9 * dt) + Math.sin(this.clock * 3) * 0.004 : this.y;
    this.player.position.set(0, y, this.laneZ);
    const tilt = (targetZ - this.laneZ) * 0.06 + (this.air ? (airY - prevY) * 0.05 : this.vy * 0.012);
    this.card.rotation.z = -tilt;
    // kart kameraya döner (yalnızca dikey eksende)
    const camYaw = Math.atan2(this.camera.position.x - this.player.position.x, this.camera.position.z - this.player.position.z);
    this.card.rotation.y = camYaw;
    this.shieldBubble.visible = this.power === 'shield';
    // çarpınca yanıp söner
    this.card.visible = !(this.hitUntil > this.t && Math.floor(this.t * 14) % 2 === 0);
    // gölge yerde, zıpladıkça küçülür
    this.shadow.position.set(0, this.air ? 0.02 : 0.03, this.laneZ);
    this.shadow.visible = this.o.scene !== 'sky' && this.o.scene !== 'space';
    const k = 1 / (1 + (this.air ? y : this.y) * 0.25);
    this.shadow.scale.set(k, 0.5 * k, 1);

    // çizim kartını güncelle (tekerlek, kanat, göz…)
    const ctx = this.cardCtx;
    ctx.clearRect(0, 0, 320, 320);
    drawRig(ctx, this.o.rig, this.clock, 160, 160, 300, { flip: this.o.facing < 0, spin: this.running ? 2.5 : 1 });
    this.cardTex.needsUpdate = true;

    // yıldızlar ve güçlendiriciler döner, süzülür
    for (const t of this.things) {
      if (t.kind === 'deco') continue;
      if (t.kind === 'star' || t.kind === 'power' || t.kind === 'heart') {
        t.obj.rotation.y = this.clock * 3 + (t.spin ?? 0);
        const base = this.air ? AIR_Y[t.lane] + this.mid : t.y0 ?? 1;
        if (!(this.power === 'magnet' && t.kind === 'star' && t.x < 9)) t.obj.position.y = base + Math.sin(this.clock * 4 + t.x) * 0.12;
      } else if (this.air && this.o.scene === 'sea') {
        t.obj.position.y = AIR_Y[t.lane] + this.mid + Math.sin(this.clock * 2 + t.x) * 0.25;
      }
    }
    this.sparkles.update(dt);

    // kamera: arkadan-yandan, yüksekten; oyuncuyu yumuşakça izler
    const sh = this.shake > 0 ? (this.shake -= dt, (Math.random() - 0.5) * this.shake) : 0;
    const camY = this.air ? 6.5 + (y - AIR_Y[1]) * 0.4 : 6.2 + this.y * 0.25;
    // yatay ekranda arkadan-yandan; dikey telefonda daha arkadan (kahraman ortada kalsın)
    const portrait = this.camera.aspect < 1;
    const side = portrait ? 2.2 : 7;
    this.camera.position.set((portrait ? -11 : -10) + sh, camY + (portrait ? 1.2 : 0) + sh, side + this.laneZ * (portrait ? 0.8 : 0.4));
    this.camera.lookAt(portrait ? 10 : 9, this.air ? y * 0.6 + 0.6 : 0.6 + this.y * 0.2, this.laneZ * (portrait ? 0.85 : 0.6));
    this.renderer.render(this.scene, this.camera);
  }

  private resize() {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // dikey telefonda dünya daha geniş görünsün
    this.camera.fov = w < h ? 58 : 48;
    this.camera.updateProjectionMatrix();
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.resizeObs.disconnect();
    disposeScene(this.scene);
    this.cardTex.dispose();
    this.groundTex?.dispose();
    this.renderer.dispose();
  }
}
