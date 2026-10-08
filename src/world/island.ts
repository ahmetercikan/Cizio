/**
 * Çizio Adası: 3B, tek kişilik oyun dünyası (Çizio Plus).
 *
 * Çocuğun Giydir karakteri kâğıt bebek gibi (Paper Mario tarzı) adada dolaşır. Mekânlar: ev (kıyafet değiştir),
 * sanat galerisi (çocuğun kendi resimleri sehpalarda), oyun parkı (kaydırak, salıncak), dans pisti, iskele ve tekne turu,
 * Çizio (görevler). Adaya saçılmış yıldızlar toplanır.
 *
 * React tarafı (src/pages/World.tsx) yalnızca girdi (joystick, düğmeler) verir ve olayları dinler.
 */
import * as THREE from 'three';
import { canvasTexture, cloud, disposeScene, makeRenderer, mesh, outline, Sparkles, star, toon, tree } from '../play3d/kit';

export type SpotId = 'home' | 'gallery' | 'slide' | 'swing' | 'dance' | 'boat' | 'cizio';
export interface Spot { id: SpotId; pos: THREE.Vector3; r: number; label: string }

export interface IslandEvents {
  onNear: (s: Spot | null) => void;
  onStar: (id: string) => void;
  onActivityDone: (id: SpotId) => void;
  onBusy: (busy: boolean) => void;
  sound: { star: (i: number) => void; step: () => void; pop: () => void; dance: (beat: number) => void };
}

export interface IslandOptions {
  avatar: HTMLCanvasElement;
  mascot: HTMLCanvasElement;
  art: HTMLCanvasElement[];
  /** Bugün toplanmış yıldızlar (yeniden çıkmasınlar). */
  taken: string[];
  starSeed: number;
}

const ISLAND_R = 38;
const BEACH_R = 44;
const SPEED = 7.5;

interface Blocker { x: number; z: number; r: number }

/** Bugünün yıldızları: tohuma göre adanın farklı yerlerinde. */
export function starSpots(seed: number): { id: string; x: number; z: number; y: number }[] {
  let s = seed % 2147483647 || 1;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const out: { id: string; x: number; z: number; y: number }[] = [];
  for (let i = 0; i < 12; i++) {
    const a = rnd() * Math.PI * 2, r = 8 + rnd() * 26;
    out.push({ id: `s${i}`, x: Math.cos(a) * r, z: Math.sin(a) * r, y: 1.2 + rnd() * 0.6 });
  }
  return out;
}

export class Island {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(50, 1, 0.1, 400);
  private avatar = new THREE.Group();
  private card: THREE.Mesh;
  private avatarTex: THREE.CanvasTexture;
  private shadow: THREE.Mesh;
  private sparkles: Sparkles;
  private spots: Spot[] = [];
  private blockers: Blocker[] = [];
  private stars: { id: string; obj: THREE.Object3D; taken: boolean }[] = [];
  private danceTiles: THREE.Mesh[] = [];
  private swingSeat = new THREE.Group();
  private boat = new THREE.Group();
  private water?: THREE.Texture;
  private npc?: THREE.Mesh;
  private raf = 0;
  private last = 0;
  private clock = 0;
  private pos = new THREE.Vector3(0, 0, 8);
  private target: THREE.Vector3 | null = null;
  private joy = new THREE.Vector2();
  private camYaw = 0;
  private camYawGoal = 0;
  private facing = 1;
  private moving = false;
  private near: Spot | null = null;
  private stepAcc = 0;
  private emoteUntil = 0;
  private emoteKind: 'wave' | 'jump' | 'clap' | null = null;
  /** Etkinlik: kaydırak, salıncak, dans, tekne. */
  private act: { id: SpotId; t: number; dur: number } | null = null;
  private resizeObs: ResizeObserver;
  private ray = new THREE.Raycaster();
  private ground!: THREE.Mesh;

  constructor(private canvas: HTMLCanvasElement, private o: IslandOptions, private ev: IslandEvents) {
    this.renderer = makeRenderer(canvas);
    const sky = new THREE.Color('#a9e4ff');
    this.scene.background = sky;
    this.scene.fog = new THREE.Fog(sky, 70, 160);
    this.scene.add(new THREE.HemisphereLight('#ffffff', '#7fbf6a', 1.15));
    const sun = new THREE.DirectionalLight('#fff4dc', 1.5);
    sun.position.set(-20, 40, 18);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.bias = -0.0006;
    sun.shadow.normalBias = 0.04;
    Object.assign(sun.shadow.camera, { left: -50, right: 50, top: 50, bottom: -50, near: 1, far: 120 });
    this.scene.add(sun);

    this.buildTerrain();
    this.buildPlaza();
    this.buildHome();
    this.buildGallery();
    this.buildPark();
    this.buildDance();
    this.buildPier();
    this.buildNature();
    this.buildStars();
    this.buildNpc();

    // Kahraman: Giydir karakteri, kâğıt bebek
    this.avatarTex = new THREE.CanvasTexture(o.avatar);
    this.avatarTex.colorSpace = THREE.SRGBColorSpace;
    const H = 3, W = H * (o.avatar.width / o.avatar.height);
    this.card = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ map: this.avatarTex, transparent: true, alphaTest: 0.05, side: THREE.DoubleSide }));
    this.card.position.y = H / 2;
    this.avatar.add(this.card);
    this.shadow = new THREE.Mesh(new THREE.CircleGeometry(0.75, 24), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false }));
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.scale.y = 0.55;
    this.scene.add(this.avatar, this.shadow);

    this.sparkles = new Sparkles(this.scene);
    this.camera.position.set(this.pos.x, 9.5, this.pos.z + 14);
    this.resizeObs = new ResizeObserver(() => this.resize());
    this.resizeObs.observe(canvas);
    this.resize();
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  // ----------------------------------------------------------------------------------------------
  // Ada
  // ----------------------------------------------------------------------------------------------
  private buildTerrain() {
    this.water = canvasTexture(128, 128, (ctx) => {
      ctx.fillStyle = '#3fb7dd';
      ctx.fillRect(0, 0, 128, 128);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        const y = 10 + i * 21;
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(32, y - 6, 64, y + 6, 128, y);
        ctx.stroke();
      }
    }, [24, 24]);
    const sea = mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshToonMaterial({ map: this.water }), false);
    sea.rotation.x = -Math.PI / 2;
    sea.position.y = -0.6;
    this.scene.add(sea);
    const beach = mesh(new THREE.CylinderGeometry(BEACH_R, BEACH_R + 3, 1.2, 64), toon('#f3dca2'), false);
    beach.position.y = -0.68;
    this.scene.add(beach);
    const grass = mesh(new THREE.CylinderGeometry(ISLAND_R, ISLAND_R + 1.5, 1, 64), toon('#8fd16f'), false);
    grass.position.y = -0.45;
    grass.receiveShadow = true;
    this.scene.add(grass);
    // Tıklanabilir zemin (dokunarak yürüme)
    this.ground = new THREE.Mesh(new THREE.CircleGeometry(BEACH_R, 48), new THREE.MeshBasicMaterial({ visible: false }));
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.position.y = 0.06;
    this.scene.add(this.ground);
    // Uzak bulutlar
    for (let i = 0; i < 10; i++) {
      const c = cloud(3 + Math.random() * 3);
      const a = (i / 10) * Math.PI * 2;
      c.position.set(Math.cos(a) * 110, 18 + Math.random() * 14, Math.sin(a) * 110);
      this.scene.add(c);
    }
  }

  private path(x1: number, z1: number, x2: number, z2: number) {
    const len = Math.hypot(x2 - x1, z2 - z1);
    const n = Math.floor(len / 1.6);
    const m = toon('#e8d9b8');
    for (let i = 1; i < n; i++) {
      const u = i / n;
      const p = mesh(new THREE.CylinderGeometry(0.65, 0.7, 0.12, 8), m, false);
      p.position.set(x1 + (x2 - x1) * u + (Math.random() - 0.5) * 0.3, 0.06, z1 + (z2 - z1) * u + (Math.random() - 0.5) * 0.3);
      this.scene.add(p);
    }
  }

  private spot(id: SpotId, x: number, z: number, r: number, label: string) {
    this.spots.push({ id, pos: new THREE.Vector3(x, 0, z), r, label });
  }

  private buildPlaza() {
    const base = mesh(new THREE.CylinderGeometry(6, 6.2, 0.2, 32), toon('#efe2c4'), false);
    base.position.y = 0.1;
    this.scene.add(base);
    const pool = outline(mesh(new THREE.CylinderGeometry(2.6, 2.8, 0.8, 24), toon('#d8d0c0')), 1.03);
    pool.position.y = 0.4;
    const water = mesh(new THREE.CylinderGeometry(2.3, 2.3, 0.1, 24), toon('#7ee0ff'), false);
    water.position.y = 0.78;
    const col = mesh(new THREE.CylinderGeometry(0.3, 0.4, 2, 10), toon('#d8d0c0'));
    col.position.y = 1.6;
    const bowl = mesh(new THREE.SphereGeometry(0.9, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon('#d8d0c0'));
    bowl.rotation.x = Math.PI;
    bowl.position.y = 2.7;
    this.scene.add(pool, water, col, bowl);
    this.blockers.push({ x: 0, z: 0, r: 3.2 });
    for (const [x, z] of [[-18, -14], [18, -14], [-16, 14], [16, 14], [0, 30]]) this.path(0, 0, x, z);
  }

  private house(x: number, z: number, color: string, rot = 0) {
    const g = new THREE.Group();
    const body = outline(mesh(new THREE.BoxGeometry(7, 4.5, 6), toon(color)), 1.02);
    body.position.y = 2.25;
    const roof = outline(mesh(new THREE.ConeGeometry(5.6, 3, 4), toon('#e05a4f')), 1.03);
    roof.position.y = 6;
    roof.rotation.y = Math.PI / 4;
    const door = mesh(new THREE.BoxGeometry(1.4, 2.4, 0.15), toon('#9b6b43'), false);
    door.position.set(0, 1.2, 3.05);
    g.add(body, roof, door);
    for (const wx of [-2.2, 2.2]) {
      const w = mesh(new THREE.BoxGeometry(1.3, 1.1, 0.12), toon('#fff6c9', { emissive: '#3a3000' }), false);
      w.position.set(wx, 2.8, 3.05);
      g.add(w);
    }
    g.position.set(x, 0, z);
    g.rotation.y = rot;
    this.scene.add(g);
    this.blockers.push({ x, z, r: 4.6 });
    return g;
  }

  private buildHome() {
    const h = this.house(-18, -14, '#ffd166', Math.atan2(18, 14));
    const mail = mesh(new THREE.BoxGeometry(0.5, 0.4, 0.7), toon('#5b8def'));
    mail.position.set(3.4, 1.2, 3.6);
    const post = mesh(new THREE.CylinderGeometry(0.06, 0.06, 1, 6), toon('#9b6b43'));
    post.position.set(3.4, 0.5, 3.6);
    h.add(mail, post);
    this.spot('home', -14.5, -10.8, 3.2, 'Kıyafetimi değiştir');
  }

  private buildGallery() {
    const g = new THREE.Group();
    const floor = mesh(new THREE.BoxGeometry(10, 0.3, 7), toon('#f4efe6'), false);
    floor.position.y = 0.15;
    const back = outline(mesh(new THREE.BoxGeometry(10, 5, 0.4), toon('#b39ddb')), 1.01);
    back.position.set(0, 2.5, -3.3);
    g.add(floor, back);
    // Açık çatı (pergola): yukarıdan bakan kamera resimleri görebilsin
    for (let i = 0; i < 4; i++) {
      const beam = mesh(new THREE.BoxGeometry(0.3, 0.3, 7.4), toon('#7c5cff'));
      beam.position.set(-4.5 + i * 3, 5.1, 0);
      g.add(beam);
    }
    const front = outline(mesh(new THREE.BoxGeometry(10.4, 0.5, 0.4), toon('#7c5cff')), 1.03);
    front.position.set(0, 5.1, 3.4);
    g.add(front);
    for (const x of [-4.8, 4.8]) {
      const c = mesh(new THREE.CylinderGeometry(0.25, 0.25, 5, 10), toon('#ffffff'));
      c.position.set(x, 2.5, 3.2);
      g.add(c);
    }
    // Çocuğun resimleri sehpalarda
    const arts = this.o.art.slice(0, 5);
    arts.forEach((cv, i) => {
      const tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      const x = -3.6 + i * (7.2 / Math.max(1, arts.length - 1 || 1));
      const easel = new THREE.Group();
      const frame = outline(mesh(new THREE.BoxGeometry(1.7, 1.7, 0.12), toon('#c98a4b')), 1.03);
      const pic = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), new THREE.MeshBasicMaterial({ map: tex }));
      pic.position.z = 0.07;
      frame.add(pic);
      frame.position.y = 2.1;
      frame.rotation.x = -0.12;
      for (const lx of [-0.55, 0.55]) {
        const leg = mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.4, 5), toon('#9b6b43'));
        leg.position.set(lx, 1.1, 0.1);
        leg.rotation.z = lx > 0 ? -0.12 : 0.12;
        easel.add(leg);
      }
      easel.add(frame);
      easel.position.set(arts.length === 1 ? 0 : x, 0.3, -1);
      g.add(easel);
    });
    g.position.set(18, 0, -14);
    g.rotation.y = Math.atan2(-18, 14);
    this.scene.add(g);
    this.blockers.push({ x: 18 + Math.sin(g.rotation.y) * -3.3, z: -14 + Math.cos(g.rotation.y) * -3.3, r: 3.5 });
    this.spot('gallery', 14.6, -10.6, 3.4, 'Resimlerime bak');
  }

  private buildPark() {
    const g = new THREE.Group();
    // Kaydırak: merdiven + eğik kayma yüzeyi
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
    slide.position.set(-2.5, 0, -1);
    g.add(slide);
    // Salıncak
    const frame = new THREE.Group();
    for (const sx of [-1.6, 1.6]) for (const sz of [-0.8, 0.8]) {
      const leg = mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.6, 6), toon('#e9487d'));
      leg.position.set(sx, 1.7, sz * 0.5);
      leg.rotation.x = sz * 0.3;
      frame.add(leg);
    }
    const bar = mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.4, 6), toon('#e9487d'));
    bar.rotation.z = Math.PI / 2;
    bar.position.y = 3.4;
    frame.add(bar);
    const seat = mesh(new THREE.BoxGeometry(1, 0.12, 0.6), toon('#14a89a'));
    seat.position.y = -2.4;
    for (const rx of [-0.45, 0.45]) {
      const rope = mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.4, 4), toon('#5a4636'), false);
      rope.position.set(rx, -1.2, 0);
      this.swingSeat.add(rope);
    }
    this.swingSeat.add(seat);
    this.swingSeat.position.y = 3.4;
    frame.add(this.swingSeat);
    frame.position.set(3, 0, 0);
    g.add(frame);
    // Kum havuzu
    const sand = mesh(new THREE.CylinderGeometry(2, 2, 0.25, 20), toon('#f3dca2'), false);
    sand.position.set(0, 0.12, 4);
    g.add(sand);
    g.position.set(-16, 0, 14);
    this.scene.add(g);
    this.blockers.push({ x: -18.5, z: 13, r: 1.4 }, { x: -13, z: 14, r: 1.3 });
    this.spot('slide', -18.5, 11, 2.6, 'Kaydıraktan kay');
    this.spot('swing', -13, 16.5, 2.6, 'Salıncakta sallan');
  }

  private buildDance() {
    const g = new THREE.Group();
    const base = outline(mesh(new THREE.CylinderGeometry(5, 5.2, 0.5, 8), toon('#3a2b27')), 1.01);
    base.position.y = 0.25;
    g.add(base);
    const colors = ['#ff6b8a', '#ffc83d', '#14a89a', '#7c5cff', '#5b8def', '#ff8a65'];
    for (let ix = -2; ix <= 2; ix++) for (let iz = -2; iz <= 2; iz++) {
      if (Math.hypot(ix, iz) > 2.5) continue;
      const t = mesh(new THREE.BoxGeometry(1.5, 0.12, 1.5), new THREE.MeshToonMaterial({ color: colors[(ix + iz + 10) % colors.length], emissive: new THREE.Color('#000000') }), false);
      t.position.set(ix * 1.6, 0.55, iz * 1.6);
      g.add(t);
      this.danceTiles.push(t);
    }
    for (const a of [0.6, 2.5, 4.4]) {
      const pole = mesh(new THREE.CylinderGeometry(0.1, 0.1, 4, 6), toon('#cfcbe0'));
      pole.position.set(Math.cos(a) * 5, 2, Math.sin(a) * 5);
      const lamp = mesh(new THREE.SphereGeometry(0.4, 10, 8), toon('#ffc83d', { emissive: '#665500' }));
      lamp.position.set(Math.cos(a) * 5, 4.1, Math.sin(a) * 5);
      g.add(pole, lamp);
    }
    g.position.set(16, 0, 14);
    this.scene.add(g);
    this.spot('dance', 16, 14, 4.2, 'Dans et');
  }

  private buildPier() {
    const pier = new THREE.Group();
    for (let i = 0; i < 9; i++) {
      const plank = mesh(new THREE.BoxGeometry(3, 0.2, 1.1), toon(i % 2 ? '#b07d4f' : '#c08c5c'));
      plank.position.set(0, 0.25, i * 1.15);
      pier.add(plank);
    }
    pier.position.set(0, 0, 36);
    this.scene.add(pier);
    // Tekne
    const hull = outline(mesh(new THREE.BoxGeometry(2.2, 0.8, 4), toon('#ff6b4a')), 1.03);
    hull.position.y = 0.1;
    const rim = mesh(new THREE.BoxGeometry(2.3, 0.15, 4.1), toon('#ffffff'));
    rim.position.y = 0.55;
    const mast = mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.4, 6), toon('#9b6b43'));
    mast.position.y = 2.1;
    const sail = mesh(new THREE.ConeGeometry(1.3, 2.8, 3), toon('#ffffff'));
    sail.position.set(0, 2.3, 0.4);
    sail.scale.z = 0.12;
    this.boat.add(hull, rim, mast, sail);
    this.boat.position.set(2.6, -0.3, 44);
    this.scene.add(this.boat);
    this.spot('boat', 0, 41, 3, 'Tekneyle gez');
  }

  private buildNature() {
    const placed: [number, number][] = [];
    const free = (x: number, z: number, r: number) =>
      this.blockers.every((b) => Math.hypot(b.x - x, b.z - z) > b.r + r + 1.5) &&
      this.spots.every((s) => Math.hypot(s.pos.x - x, s.pos.z - z) > s.r + r + 1) &&
      placed.every(([px, pz]) => Math.hypot(px - x, pz - z) > 3) && Math.hypot(x, z) > 8 && !(Math.abs(x) < 2.5 && z > 6);
    let n = 0, tries = 0;
    while (n < 34 && tries++ < 900) {
      const a = Math.random() * Math.PI * 2, r = 10 + Math.random() * 26;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (!free(x, z, 1)) continue;
      const t = tree(Math.random() < 0.65 ? 'round' : 'pine', 0.9 + Math.random() * 0.7);
      t.position.set(x, 0, z);
      this.scene.add(t);
      this.blockers.push({ x, z, r: 0.9 });
      placed.push([x, z]);
      n++;
    }
    // Çiçekler (yürünebilir)
    const cols = ['#ff6b8a', '#ffc83d', '#ffffff', '#b98cff'];
    for (let i = 0; i < 70; i++) {
      const a = Math.random() * Math.PI * 2, r = 6 + Math.random() * 31;
      const f = mesh(new THREE.SphereGeometry(0.18, 6, 5), toon(cols[i % 4]), false);
      f.position.set(Math.cos(a) * r, 0.25, Math.sin(a) * r);
      this.scene.add(f);
    }
    // Banklar
    for (const [x, z, ry] of [[6, -4, 0.6], [-6, 4, 3.7]] as const) {
      const b = new THREE.Group();
      const seat = mesh(new THREE.BoxGeometry(2.2, 0.15, 0.7), toon('#b07d4f'));
      seat.position.y = 0.6;
      const back = mesh(new THREE.BoxGeometry(2.2, 0.6, 0.12), toon('#b07d4f'));
      back.position.set(0, 1, -0.32);
      b.add(seat, back);
      b.position.set(x, 0, z);
      b.rotation.y = ry;
      this.scene.add(b);
      this.blockers.push({ x, z, r: 1.1 });
    }
  }

  private buildStars() {
    for (const s of starSpots(this.o.starSeed)) {
      const taken = this.o.taken.includes(s.id);
      // ağaç ya da binaya denk gelirse biraz kaydır
      let { x, z } = s;
      for (const b of this.blockers) {
        const d = Math.hypot(x - b.x, z - b.z);
        if (d < b.r + 1) {
          const k = (b.r + 1.2) / Math.max(0.01, d);
          x = b.x + (x - b.x) * k;
          z = b.z + (z - b.z) * k;
        }
      }
      const obj = star();
      obj.scale.setScalar(1.3);
      obj.position.set(x, s.y, z);
      obj.visible = !taken;
      this.scene.add(obj);
      this.stars.push({ id: s.id, obj, taken });
    }
  }

  private buildNpc() {
    const tex = new THREE.CanvasTexture(this.o.mascot);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.npc = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.05, side: THREE.DoubleSide }));
    this.npc.position.set(5, 1.4, 5);
    this.scene.add(this.npc);
    const sh = new THREE.Mesh(new THREE.CircleGeometry(0.8, 20), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.2, depthWrite: false }));
    sh.rotation.x = -Math.PI / 2;
    sh.position.set(5, 0.08, 5);
    this.scene.add(sh);
    this.blockers.push({ x: 5, z: 5, r: 0.9 });
    this.spot('cizio', 5, 5, 3, 'Çizio ile konuş');
  }

  // ----------------------------------------------------------------------------------------------
  // Girdi
  // ----------------------------------------------------------------------------------------------
  /** Joystick: x sağ, y ileri (-1..1). */
  setJoystick(x: number, y: number) {
    this.joy.set(x, y);
    if (x || y) this.target = null;
  }
  /** Ekrana dokunulan yere yürü. */
  tapTo(clientX: number, clientY: number) {
    if (this.act) return;
    const r = this.canvas.getBoundingClientRect();
    const v = new THREE.Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(v, this.camera);
    const hit = this.ray.intersectObject(this.ground)[0];
    if (hit) this.target = hit.point.clone().setY(0);
  }
  /** Kamerayı döndür (sürükleme). */
  rotateCamera(dx: number) {
    this.camYawGoal -= dx * 0.006;
  }
  emote(kind: 'wave' | 'jump' | 'clap') {
    if (this.act) return;
    this.emoteKind = kind;
    this.emoteUntil = this.clock + (kind === 'jump' ? 0.6 : 1.4);
    if (kind === 'clap') this.sparkles.burst(this.pos.clone().setY(2.5), 14);
    this.ev.sound.pop();
  }
  /** Yakındaki mekânın etkinliği. Ev, galeri ve Çizio React tarafında açılır. */
  activity(id: SpotId) {
    if (this.act) return;
    const dur = { slide: 2.2, swing: 6, dance: 7, boat: 16 }[id as 'slide'];
    if (!dur) return this.ev.onActivityDone(id);
    this.act = { id, t: 0, dur };
    this.target = null;
    this.ev.onBusy(true);
  }

  // ----------------------------------------------------------------------------------------------
  // Döngü
  // ----------------------------------------------------------------------------------------------
  private frame = (now: number) => {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.clock += dt;
    if (this.act) this.stepActivity(dt);
    else this.stepWalk(dt);
    this.stepWorld(dt);
    this.draw();
    this.raf = requestAnimationFrame(this.frame);
  };

  private stepWalk(dt: number) {
    let dir = new THREE.Vector3();
    if (this.joy.lengthSq() > 0.01) {
      // kameraya göre: ileri = kameranın baktığı yön
      const f = new THREE.Vector3(-Math.sin(this.camYaw), 0, -Math.cos(this.camYaw));
      const r = new THREE.Vector3(Math.cos(this.camYaw), 0, -Math.sin(this.camYaw));
      dir = f.multiplyScalar(this.joy.y).add(r.multiplyScalar(this.joy.x));
    } else if (this.target) {
      dir = this.target.clone().sub(this.pos).setY(0);
      if (dir.length() < 0.3) {
        this.target = null;
        dir.set(0, 0, 0);
      }
    }
    this.moving = dir.lengthSq() > 0.0001;
    if (this.moving) {
      const sp = Math.min(1, dir.length()) * SPEED;
      dir.normalize();
      const next = this.pos.clone().addScaledVector(dir, sp * dt);
      // engeller: dairelerin dışına it
      for (const b of this.blockers) {
        const dx = next.x - b.x, dz = next.z - b.z, d = Math.hypot(dx, dz), min = b.r + 0.6;
        if (d < min) {
          next.x = b.x + (dx / (d || 1)) * min;
          next.z = b.z + (dz / (d || 1)) * min;
        }
      }
      const R = Math.hypot(next.x, next.z);
      const limit = next.z > 33 && Math.abs(next.x) < 1.6 ? 46 : BEACH_R - 1; // iskeleye çıkılabilir
      if (R > limit) next.multiplyScalar(limit / R);
      this.pos.copy(next);
      // ekranda sağa mı sola mı gidiyor: kartı ona göre çevir
      const camRight = new THREE.Vector3(Math.cos(this.camYaw), 0, -Math.sin(this.camYaw));
      const side = dir.dot(camRight);
      if (Math.abs(side) > 0.2) this.facing = side > 0 ? 1 : -1;
      this.stepAcc += dt;
      if (this.stepAcc > 0.32) {
        this.stepAcc = 0;
        this.ev.sound.step();
      }
    }
    // yıldızlar
    for (const s of this.stars) {
      if (s.taken) continue;
      if (Math.hypot(s.obj.position.x - this.pos.x, s.obj.position.z - this.pos.z) < 1.3) {
        s.taken = true;
        s.obj.visible = false;
        this.sparkles.burst(s.obj.position.clone(), 12);
        this.ev.sound.star(this.stars.filter((x) => x.taken).length);
        this.ev.onStar(s.id);
      }
    }
    // yakındaki mekân
    let near: Spot | null = null;
    for (const s of this.spots) if (Math.hypot(s.pos.x - this.pos.x, s.pos.z - this.pos.z) < s.r) near = s;
    if (near?.id !== this.near?.id) {
      this.near = near;
      this.ev.onNear(near);
    }
  }

  private stepActivity(dt: number) {
    const a = this.act!;
    a.t += dt;
    const u = Math.min(1, a.t / a.dur);
    if (a.id === 'slide') {
      // merdivenden çık, sonra kay (kaydırak park içinde -2.5,-1 → yerel z +3 yönünde)
      const top = new THREE.Vector3(-18.5, 3.1, 12.6), bottom = new THREE.Vector3(-18.5, 0, 17.4);
      if (u < 0.35) this.pos.lerpVectors(new THREE.Vector3(-18.5, 0, 11.6), top, u / 0.35);
      else {
        const k = (u - 0.35) / 0.65;
        this.pos.lerpVectors(top, bottom, k * k);
      }
    } else if (a.id === 'swing') {
      const ang = Math.sin(a.t * 2.6) * 0.75 * Math.min(1, a.t) * Math.min(1, (a.dur - a.t) * 1.5);
      this.swingSeat.rotation.x = ang;
      this.pos.set(-13, 3.4 - Math.cos(ang) * 2.4 - 0.9, 14 + Math.sin(ang) * 2.4);
    } else if (a.id === 'dance') {
      this.pos.set(16, 0.6 + Math.abs(Math.sin(a.t * 6)) * 0.5, 14);
      const beat = Math.floor(a.t * 3);
      this.danceTiles.forEach((t, i) => {
        const on = (i + beat) % 3 === 0;
        (t.material as THREE.MeshToonMaterial).emissive.set(on ? '#665500' : '#000000');
      });
      if (Math.floor((a.t - dt) * 3) !== beat) {
        this.ev.sound.dance(beat);
        if (beat % 2 === 0) this.sparkles.burst(new THREE.Vector3(16, 3, 14), 6);
      }
      this.facing = Math.floor(a.t * 3) % 2 ? 1 : -1;
    } else if (a.id === 'boat') {
      const ang = Math.PI / 2 - u * Math.PI * 2;
      const R = 50;
      this.boat.position.set(Math.cos(ang) * R, -0.3 + Math.sin(a.t * 2) * 0.12, Math.sin(ang) * R);
      this.boat.rotation.y = -ang + Math.PI;
      this.pos.set(this.boat.position.x, 0.4 + this.boat.position.y, this.boat.position.z);
    }
    if (u >= 1) {
      if (a.id === 'swing') this.swingSeat.rotation.x = 0;
      if (a.id === 'dance') this.danceTiles.forEach((t) => (t.material as THREE.MeshToonMaterial).emissive.set('#000000'));
      if (a.id === 'boat') {
        this.boat.position.set(2.6, -0.3, 44);
        this.boat.rotation.y = 0;
        this.pos.set(0, 0, 40);
      }
      if (a.id === 'slide') this.pos.set(-18.5, 0, 18);
      if (a.id === 'swing') this.pos.set(-13, 0, 17.5);
      if (a.id === 'dance') this.pos.set(16, 0, 18.5);
      this.act = null;
      this.ev.onBusy(false);
      this.ev.onActivityDone(a.id);
      this.sparkles.burst(this.pos.clone().setY(2), 14);
    }
  }

  private stepWorld(dt: number) {
    if (this.water) this.water.offset.x += dt * 0.02;
    for (const s of this.stars) {
      if (s.taken) continue;
      s.obj.rotation.y += dt * 2;
      s.obj.position.y += Math.sin(this.clock * 3 + s.obj.position.x) * 0.004;
    }
    if (!this.act || this.act.id !== 'boat') this.boat.position.y = -0.3 + Math.sin(this.clock * 1.5) * 0.1;
    this.sparkles.update(dt);
  }

  private draw() {
    // kahraman: yürürken sekme, el sallama, zıplama
    let bob = this.moving ? Math.abs(Math.sin(this.clock * 11)) * 0.18 : 0;
    let tilt = this.moving ? Math.sin(this.clock * 11) * 0.06 : 0;
    if (this.emoteKind && this.clock < this.emoteUntil) {
      const k = this.emoteUntil - this.clock;
      if (this.emoteKind === 'jump') bob = Math.sin((1 - k / 0.6) * Math.PI) * 1.4;
      else if (this.emoteKind === 'wave') tilt = Math.sin(this.clock * 14) * 0.18;
      else bob = Math.abs(Math.sin(this.clock * 16)) * 0.25;
    } else this.emoteKind = null;
    this.avatar.position.set(this.pos.x, this.pos.y + bob, this.pos.z);
    const camYawToAvatar = Math.atan2(this.camera.position.x - this.pos.x, this.camera.position.z - this.pos.z);
    this.card.rotation.set(0, camYawToAvatar, -tilt);
    this.card.scale.x = this.facing;
    this.shadow.position.set(this.pos.x, Math.max(0.07, this.act?.id === 'boat' ? -10 : this.pos.y < 1 ? 0.07 : this.pos.y - 3), this.pos.z);
    this.shadow.visible = this.act?.id !== 'boat' && this.act?.id !== 'swing';
    if (this.npc) {
      this.npc.rotation.y = Math.atan2(this.camera.position.x - 5, this.camera.position.z - 5);
      this.npc.position.y = 1.4 + Math.sin(this.clock * 2) * 0.12;
    }
    // kamera: arkadan, yukarıdan; yumuşak takip
    this.camYaw += (this.camYawGoal - this.camYaw) * 0.12;
    const dist = this.act?.id === 'boat' ? 22 : 14, h = this.act?.id === 'boat' ? 14 : 9.5;
    const cx = this.pos.x + Math.sin(this.camYaw) * dist, cz = this.pos.z + Math.cos(this.camYaw) * dist;
    this.camera.position.lerp(new THREE.Vector3(cx, this.pos.y + h, cz), 0.12);
    this.camera.lookAt(this.pos.x, this.pos.y + 1.6, this.pos.z);
    this.renderer.render(this.scene, this.camera);
  }

  /** Geliştirme/test: kahramanı bir yere ışınla. */
  teleport(x: number, z: number) {
    this.pos.set(x, 0, z);
    this.target = null;
  }

  /** Kıyafet değişince karakter dokusunu tazele. */
  refreshAvatar() {
    this.avatarTex.needsUpdate = true;
  }

  private resize() {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.fov = w < h ? 62 : 50;
    this.camera.updateProjectionMatrix();
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.resizeObs.disconnect();
    disposeScene(this.scene);
    this.renderer.dispose();
  }
}
