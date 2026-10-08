/**
 * Çizio Adası: 3B, tek kişilik oyun dünyası.
 *
 * Çocuğun Giydir karakteri yürüyen bir kâğıt kukla olarak (src/world/puppet.ts) adada dolaşır; evcil hayvanı
 * arkasından gelir. Mekânlar ve etkinlikler:
 *   ev (kıyafet), sanat galerisi, oyun parkı (kaydırak, salıncak), dans pisti, müzik karoları, trambolin, futbol sahası,
 *   dönme dolap, atlıkarınca, çiçek bahçesi (sulama), dondurma arabası, deniz feneri, sıcak hava balonu, iskele (tekne turu,
 *   balık tutma), kumsalda hazine kazma, Çizio (görevler). Adada hayvanlar dolaşır, kelebekler uçar, denizde yunuslar zıplar.
 *
 * React tarafı (src/pages/World.tsx) yalnızca girdi verir ve olayları dinler.
 */
import * as THREE from 'three';
import { canvasTexture, cloud, disposeScene, makeRenderer, mesh, outline, Sparkles, star, toon, tree } from '../play3d/kit';
import { petCard, Puppet, type Pose } from './puppet';
import type { DollParts } from './textures';

export type SpotId = string;
export interface Spot { id: SpotId; pos: THREE.Vector3; r: number; label: string }

export interface IslandEvents {
  onNear: (s: Spot | null) => void;
  onStar: (id: string) => void;
  onActivityDone: (id: SpotId) => void;
  onBusy: (busy: boolean) => void;
  onMessage: (text: string) => void;
  sound: { star: (i: number) => void; step: () => void; pop: () => void; dance: (beat: number) => void; note: (i: number) => void; kick: () => void };
}

export interface IslandOptions {
  parts: DollParts;
  mascot: HTMLCanvasElement;
  art: HTMLCanvasElement[];
  /** Adada dolaşan hayvanlar ve deniz canlıları (ders çizimleri). */
  critters: { id: string; canvas: HTMLCanvasElement }[];
  /** Bugün toplanmış yıldızlar ve kazılmış hazineler (yeniden çıkmasınlar). */
  taken: string[];
  starSeed: number;
}

export const ISLAND_R = 60;
const BEACH_R = 68;
const SPEED = 8;

/** Mekânların yerleri (x, z). */
const Z = {
  home: [-28, -22], gallery: [28, -22], park: [-26, 22], dance: [26, 20], music: [0, -27], trampoline: [-8, 33],
  football: [-45, -2], ferris: [43, -34], carousel: [47, 6], garden: [-38, -38], icecream: [12, 14], lighthouse: [-49, 33],
  balloon: [28, 42], cizio: [6, 6],
} as const;
const DIGS = [-140, -40, 155].map((a) => [Math.cos((a * Math.PI) / 180) * 64, Math.sin((a * Math.PI) / 180) * 64]);
const FISH = ['Minik Balık', 'Neşeli Yunus', 'Denizatı', 'Yengeç', 'Deniz Yıldızı', 'Sevimli Ahtapot', 'Mavi Balina'];

interface Blocker { x: number; z: number; r: number }
interface Critter { obj: THREE.Mesh; pos: THREE.Vector3; target: THREE.Vector3; wait: number; facing: number; hop: number; speed: number; home: [number, number]; range: number }

/** Bugünün yıldızları: tohuma göre adanın farklı yerlerinde. */
export function starSpots(seed: number): { id: string; x: number; z: number; y: number }[] {
  let s = seed % 2147483647 || 1;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const out: { id: string; x: number; z: number; y: number }[] = [];
  for (let i = 0; i < 16; i++) {
    const a = rnd() * Math.PI * 2, r = 9 + rnd() * 46;
    out.push({ id: `s${i}`, x: Math.cos(a) * r, z: Math.sin(a) * r, y: 1.2 + rnd() * 0.6 });
  }
  return out;
}

const ACT: Record<string, { dur: number; label: string; cam?: [number, number] }> = {
  slide: { dur: 2.4, label: 'Kaydıraktan kay' },
  swing: { dur: 6, label: 'Salıncakta sallan' },
  dance: { dur: 7, label: 'Dans et' },
  boat: { dur: 22, label: 'Tekneyle gez', cam: [24, 15] },
  ferris: { dur: 16, label: 'Dönme dolaba bin', cam: [30, 16] },
  carousel: { dur: 11, label: 'Atlıkarıncaya bin', cam: [10, 2.6] },
  trampoline: { dur: 6, label: 'Tramboline zıpla', cam: [17, 9] },
  balloon: { dur: 20, label: 'Balonla uç', cam: [30, 18] },
  fish: { dur: 4.5, label: 'Balık tut' },
  icecream: { dur: 1.4, label: 'Dondurma al' },
  flowers: { dur: 4, label: 'Çiçekleri sula' },
  lighthouse: { dur: 7, label: 'Feneri yak', cam: [26, 16] },
  dig: { dur: 2.2, label: 'Hazineyi kaz' },
};

export class Island {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(50, 1, 0.1, 500);
  private sun!: THREE.DirectionalLight;
  private puppet: Puppet;
  private pet: THREE.Mesh | null;
  private petPos = new THREE.Vector3();
  private petHop = 0;
  private shadow: THREE.Mesh;
  private sparkles: Sparkles;
  private spots: Spot[] = [];
  private blockers: Blocker[] = [];
  private stars: { id: string; obj: THREE.Object3D; taken: boolean }[] = [];
  private critters: Critter[] = [];
  private flyers: { obj: THREE.Mesh; t: number; r: number; c: [number, number]; h: number; sp: number }[] = [];
  private dolphins: { obj: THREE.Mesh; t: number; a: number }[] = [];
  private water?: THREE.Texture;
  private npc?: THREE.Mesh;
  private ground!: THREE.Mesh;
  // hareketli düzenekler
  private danceTiles: THREE.Mesh[] = [];
  private swingSeat = new THREE.Group();
  private boat = new THREE.Group();
  private ferris = new THREE.Group();
  private ferrisCabins: THREE.Group[] = [];
  private carousel = new THREE.Group();
  private carouselHorses: THREE.Object3D[] = [];
  private tramp!: THREE.Mesh;
  private balloon = new THREE.Group();
  private beam = new THREE.Group();
  private gardenFlowers: THREE.Object3D[] = [];
  private musicTiles: { mesh: THREE.Mesh; x: number; z: number; note: number }[] = [];
  private musicLast = -1;
  private musicPlayed = new Set<number>();
  private ball!: THREE.Mesh;
  private ballVel = new THREE.Vector3();
  private digMarks: { id: string; mark: THREE.Object3D; chest: THREE.Object3D; done: boolean }[] = [];
  private held: THREE.Object3D | null = null;
  private heldUntil = 0;
  private rod!: THREE.Group;
  private can!: THREE.Group;
  // durum
  private raf = 0;
  private last = 0;
  private clock = 0;
  private pos = new THREE.Vector3(0, 0, 10);
  private target: THREE.Vector3 | null = null;
  private joy = new THREE.Vector2();
  private camYaw = 0;
  private camYawGoal = 0;
  private facing = 1;
  private speed = 0;
  private near: Spot | null = null;
  private stepAcc = 0;
  private emoteUntil = 0;
  private emoteKind: 'wave' | 'jump' | 'clap' | null = null;
  private act: { id: SpotId; kind: string; t: number; dur: number } | null = null;
  private resizeObs: ResizeObserver;
  private ray = new THREE.Raycaster();
  private goalCooldown = 0;

  constructor(private canvas: HTMLCanvasElement, private o: IslandOptions, private ev: IslandEvents) {
    this.renderer = makeRenderer(canvas);
    const sky = new THREE.Color('#a9e4ff');
    this.scene.background = sky;
    this.scene.fog = new THREE.Fog(sky, 90, 220);
    this.scene.add(new THREE.HemisphereLight('#ffffff', '#7fbf6a', 1.15));
    this.sun = new THREE.DirectionalLight('#fff4dc', 1.5);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.bias = -0.0006;
    this.sun.shadow.normalBias = 0.04;
    Object.assign(this.sun.shadow.camera, { left: -36, right: 36, top: 36, bottom: -36, near: 1, far: 140 });
    this.scene.add(this.sun, this.sun.target);

    this.buildTerrain();
    this.buildPlaza();
    this.buildHome();
    this.buildGallery();
    this.buildPark();
    this.buildDance();
    this.buildMusic();
    this.buildTrampoline();
    this.buildFootball();
    this.buildFerris();
    this.buildCarousel();
    this.buildGarden();
    this.buildIceCream();
    this.buildLighthouse();
    this.buildBalloon();
    this.buildPier();
    this.buildTreasure();
    this.buildNpc();
    this.buildNature();
    this.buildStars();
    this.buildCritters();
    this.buildProps();

    // Kahraman: yürüyen kâğıt kukla
    this.puppet = new Puppet(o.parts);
    this.scene.add(this.puppet.root);
    this.pet = o.parts.pet ? petCard(o.parts.pet) : null;
    if (this.pet) {
      this.petPos.copy(this.pos).add(new THREE.Vector3(-1.6, 0, 0.6));
      this.scene.add(this.pet);
    }
    this.shadow = new THREE.Mesh(new THREE.CircleGeometry(0.8, 24), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false }));
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.scale.y = 0.55;
    this.scene.add(this.shadow);

    this.sparkles = new Sparkles(this.scene);
    this.camera.position.set(this.pos.x, 9.5, this.pos.z + 14);
    this.resizeObs = new ResizeObserver(() => this.resize());
    this.resizeObs.observe(canvas);
    this.resize();
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  // ----------------------------------------------------------------------------------------------
  // Ada ve mekânlar
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
    }, [36, 36]);
    const sea = mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshToonMaterial({ map: this.water }), false);
    sea.rotation.x = -Math.PI / 2;
    sea.position.y = -0.6;
    this.scene.add(sea);
    const beach = mesh(new THREE.CylinderGeometry(BEACH_R, BEACH_R + 4, 1.2, 96), toon('#f3dca2'), false);
    beach.position.y = -0.68;
    this.scene.add(beach);
    const grass = mesh(new THREE.CylinderGeometry(ISLAND_R, ISLAND_R + 2, 1, 96), toon('#8fd16f'), false);
    grass.position.y = -0.45;
    this.scene.add(grass);
    this.ground = new THREE.Mesh(new THREE.CircleGeometry(BEACH_R + 14, 64), new THREE.MeshBasicMaterial({ visible: false }));
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.position.y = 0.06;
    this.scene.add(this.ground);
    for (let i = 0; i < 14; i++) {
      const c = cloud(3 + Math.random() * 4);
      const a = (i / 14) * Math.PI * 2;
      c.position.set(Math.cos(a) * 150, 22 + Math.random() * 18, Math.sin(a) * 150);
      this.scene.add(c);
    }
    // uzak küçük adalar
    for (const [x, z, r] of [[-130, -90, 14], [140, 60, 18], [40, -150, 11]]) {
      const isl = mesh(new THREE.CylinderGeometry(r, r + 3, 2, 20), toon('#f3dca2'), false);
      isl.position.set(x, -0.8, z);
      const top = mesh(new THREE.CylinderGeometry(r * 0.75, r * 0.8, 1.2, 20), toon('#8fd16f'), false);
      top.position.set(x, 0, z);
      const t = tree('round', 2.2);
      t.position.set(x, 0.5, z);
      this.scene.add(isl, top, t);
    }
  }

  private path(x1: number, z1: number, x2: number, z2: number) {
    const len = Math.hypot(x2 - x1, z2 - z1);
    const n = Math.floor(len / 1.7);
    const m = toon('#e8d9b8');
    const geo = new THREE.CylinderGeometry(0.7, 0.75, 0.12, 8);
    for (let i = 1; i < n; i++) {
      const u = i / n;
      const p = mesh(geo, m, false);
      p.position.set(x1 + (x2 - x1) * u + (Math.random() - 0.5) * 0.3, 0.06, z1 + (z2 - z1) * u + (Math.random() - 0.5) * 0.3);
      this.scene.add(p);
    }
  }

  private spot(id: SpotId, x: number, z: number, r: number, label: string) {
    this.spots.push({ id, pos: new THREE.Vector3(x, 0, z), r, label });
  }

  private buildPlaza() {
    const base = mesh(new THREE.CylinderGeometry(7, 7.2, 0.2, 40), toon('#efe2c4'), false);
    base.position.y = 0.1;
    this.scene.add(base);
    const pool = outline(mesh(new THREE.CylinderGeometry(2.8, 3, 0.8, 24), toon('#d8d0c0')), 1.03);
    pool.position.y = 0.4;
    const water = mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.1, 24), toon('#7ee0ff'), false);
    water.position.y = 0.78;
    const col = mesh(new THREE.CylinderGeometry(0.3, 0.4, 2, 10), toon('#d8d0c0'));
    col.position.y = 1.6;
    const bowl = mesh(new THREE.SphereGeometry(0.9, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon('#d8d0c0'));
    bowl.rotation.x = Math.PI;
    bowl.position.y = 2.7;
    this.scene.add(pool, water, col, bowl);
    this.blockers.push({ x: 0, z: 0, r: 3.4 });
    for (const [x, z] of Object.values(Z)) this.path(0, 0, x, z);
    this.path(0, 0, 0, 62);
  }

  private house(x: number, z: number, color: string, rot = 0, s = 1) {
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
    g.scale.setScalar(s);
    g.position.set(x, 0, z);
    g.rotation.y = rot;
    this.scene.add(g);
    this.blockers.push({ x, z, r: 4.6 * s });
    return g;
  }

  /** Bir noktadan meydana bakan dönüş açısı. */
  private facePlaza(x: number, z: number) {
    return Math.atan2(-x, -z);
  }
  /** Mekânın meydana bakan önünde bir nokta. */
  private front(x: number, z: number, d: number): [number, number] {
    const l = Math.hypot(x, z) || 1;
    return [x - (x / l) * d, z - (z / l) * d];
  }

  private buildHome() {
    const [x, z] = Z.home;
    const h = this.house(x, z, '#ffd166', this.facePlaza(x, z));
    const mail = mesh(new THREE.BoxGeometry(0.5, 0.4, 0.7), toon('#5b8def'));
    mail.position.set(3.4, 1.2, 3.6);
    const post = mesh(new THREE.CylinderGeometry(0.06, 0.06, 1, 6), toon('#9b6b43'));
    post.position.set(3.4, 0.5, 3.6);
    h.add(mail, post);
    // komşu evler
    this.house(-40, -12, '#9be7de', this.facePlaza(-40, -12), 0.8);
    this.house(-16, -42, '#ffb3c7', this.facePlaza(-16, -42), 0.85);
    this.house(14, -44, '#b39ddb', this.facePlaza(14, -44), 0.8);
    this.spot('home', ...this.front(x, z, 5.2), 3.2, 'Kıyafetimi değiştir');
  }

  private buildGallery() {
    const [x, z] = Z.gallery;
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
    const fr = outline(mesh(new THREE.BoxGeometry(10.4, 0.5, 0.4), toon('#7c5cff')), 1.03);
    fr.position.set(0, 5.1, 3.4);
    g.add(fr);
    for (const cx of [-4.8, 4.8]) {
      const c = mesh(new THREE.CylinderGeometry(0.25, 0.25, 5, 10), toon('#ffffff'));
      c.position.set(cx, 2.5, 3.2);
      g.add(c);
    }
    const arts = this.o.art.slice(0, 5);
    arts.forEach((cv, i) => {
      const tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      const ex = arts.length === 1 ? 0 : -3.6 + i * (7.2 / (arts.length - 1));
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
      easel.position.set(ex, 0.3, -1);
      g.add(easel);
    });
    g.position.set(x, 0, z);
    g.rotation.y = this.facePlaza(x, z);
    this.scene.add(g);
    const [bx, bz] = this.front(x, z, -3.3);
    this.blockers.push({ x: bx, z: bz, r: 3.5 });
    this.spot('gallery', ...this.front(x, z, 4.2), 3.4, 'Resimlerime bak');
  }

  private buildPark() {
    const [px, pz] = Z.park;
    const g = new THREE.Group();
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
    const sand = mesh(new THREE.CylinderGeometry(2, 2, 0.25, 20), toon('#f3dca2'), false);
    sand.position.set(0, 0.12, 4);
    g.add(sand);
    g.position.set(px, 0, pz);
    this.scene.add(g);
    this.blockers.push({ x: px - 2.5, z: pz - 1, r: 1.4 }, { x: px + 3, z: pz, r: 1.3 });
    this.spot('slide', px - 2.5, pz - 3, 2.4, ACT.slide.label);
    this.spot('swing', px + 3, pz + 2.5, 2.4, ACT.swing.label);
  }

  private buildDance() {
    const [x, z] = Z.dance;
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
    g.position.set(x, 0, z);
    this.scene.add(g);
    this.spot('dance', x, z, 4.4, ACT.dance.label);
  }

  /** Müzik karoları: üstüne basınca nota çalar (bir düğmeye gerek yok). */
  private buildMusic() {
    const [x, z] = Z.music;
    const cols = ['#ff6b6b', '#ff9f43', '#ffd43b', '#69db7c', '#38d9a9', '#4dabf7', '#9775fa', '#f783ac'];
    cols.forEach((c, i) => {
      const t = outline(mesh(new THREE.BoxGeometry(1.6, 0.2, 2.6), new THREE.MeshToonMaterial({ color: c, emissive: new THREE.Color('#000000') }), false), 1.02);
      const tx = x - 6.3 + i * 1.8;
      t.position.set(tx, 0.12, z);
      this.scene.add(t);
      this.musicTiles.push({ mesh: t, x: tx, z, note: i });
    });
    const sign = outline(mesh(new THREE.BoxGeometry(3, 1.4, 0.2), toon('#ffffff')), 1.04);
    sign.position.set(x, 2.6, z - 2.6);
    const p = mesh(new THREE.CylinderGeometry(0.08, 0.08, 2, 6), toon('#9b6b43'));
    p.position.set(x, 1, z - 2.6);
    const n1 = mesh(new THREE.SphereGeometry(0.22, 10, 8), toon('#3a2b27'), false);
    n1.position.set(x - 0.5, 2.4, z - 2.48);
    const n2 = n1.clone();
    n2.position.x = x + 0.5;
    this.scene.add(sign, p, n1, n2);
  }

  private buildTrampoline() {
    const [x, z] = Z.trampoline;
    const ring = outline(mesh(new THREE.TorusGeometry(2.4, 0.22, 8, 32), toon('#5b8def')), 1.04);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(x, 0.9, z);
    this.tramp = mesh(new THREE.CircleGeometry(2.3, 32), toon('#3a2b27'), false);
    this.tramp.rotation.x = -Math.PI / 2;
    this.tramp.position.set(x, 0.85, z);
    this.scene.add(ring, this.tramp);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const l = mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.9, 5), toon('#5b8def'));
      l.position.set(x + Math.cos(a) * 2.3, 0.45, z + Math.sin(a) * 2.3);
      this.scene.add(l);
    }
    this.blockers.push({ x, z, r: 2.5 });
    this.spot('trampoline', x, z + 3.6, 2.2, ACT.trampoline.label);
  }

  private buildFootball() {
    const [x, z] = Z.football;
    const field = mesh(new THREE.PlaneGeometry(18, 11), toon('#6cc35a'), false);
    field.rotation.x = -Math.PI / 2;
    field.position.set(x, 0.07, z);
    this.scene.add(field);
    const lineMat = toon('#ffffff');
    const lines: [number, number, number, number][] = [[0, -5.5, 18, 0.15], [0, 5.5, 18, 0.15], [-9, 0, 0.15, 11], [9, 0, 0.15, 11], [0, 0, 0.15, 11]];
    for (const [lx, lz, w, d] of lines) {
      const l = mesh(new THREE.BoxGeometry(w, 0.02, d), lineMat, false);
      l.position.set(x + lx, 0.09, z + lz);
      this.scene.add(l);
    }
    const circ = mesh(new THREE.TorusGeometry(1.8, 0.07, 4, 32), lineMat, false);
    circ.rotation.x = Math.PI / 2;
    circ.position.set(x, 0.09, z);
    this.scene.add(circ);
    for (const side of [-1, 1]) {
      const goal = new THREE.Group();
      for (const gz of [-1.6, 1.6]) {
        const post = mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.8, 6), toon('#ffffff'));
        post.position.set(0, 0.9, gz);
        goal.add(post);
      }
      const bar = mesh(new THREE.CylinderGeometry(0.09, 0.09, 3.3, 6), toon('#ffffff'));
      bar.rotation.x = Math.PI / 2;
      bar.position.y = 1.8;
      const net = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.8), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.35, side: THREE.DoubleSide }));
      net.rotation.y = Math.PI / 2;
      net.position.set(side * 0.8, 0.9, 0);
      goal.add(bar, net);
      goal.position.set(x + side * 9, 0, z);
      this.scene.add(goal);
    }
    this.ball = outline(mesh(new THREE.IcosahedronGeometry(0.42, 1), toon('#ffffff')), 1.06);
    const patch = mesh(new THREE.IcosahedronGeometry(0.43, 0), new THREE.MeshToonMaterial({ color: '#3a2b27', wireframe: true }), false);
    this.ball.add(patch);
    this.ball.position.set(x, 0.42, z);
    this.scene.add(this.ball);
  }

  private buildFerris() {
    const [x, z] = Z.ferris;
    const R = 7;
    const g = new THREE.Group();
    for (const sz of [-1.2, 1.2]) {
      for (const sx of [-1, 1]) {
        const l = mesh(new THREE.CylinderGeometry(0.22, 0.28, 9.2, 8), toon('#7c5cff'));
        l.position.set(sx * 2.4, 4.4, sz);
        l.rotation.z = sx * 0.26;
        g.add(l);
      }
    }
    const wheel = this.ferris;
    for (const sz of [-0.9, 0.9]) {
      const rim = mesh(new THREE.TorusGeometry(R, 0.14, 6, 48), toon('#ff8fb1'));
      rim.position.z = sz;
      wheel.add(rim);
    }
    const n = 8;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const spoke = mesh(new THREE.CylinderGeometry(0.06, 0.06, R, 5), toon('#ffffff'), false);
      spoke.position.set((Math.cos(a) * R) / 2, (Math.sin(a) * R) / 2, 0);
      spoke.rotation.z = a - Math.PI / 2;
      wheel.add(spoke);
      const cab = new THREE.Group();
      const box = outline(mesh(new THREE.BoxGeometry(1.4, 1.1, 1.4), toon(['#ffc83d', '#14a89a', '#ff6b4a', '#5b8def'][i % 4])), 1.04);
      box.position.y = -0.9;
      const roof = mesh(new THREE.ConeGeometry(1.05, 0.5, 4), toon('#ffffff'));
      roof.position.y = -0.1;
      roof.rotation.y = Math.PI / 4;
      cab.add(box, roof);
      cab.position.set(Math.cos(a) * R, Math.sin(a) * R, 0);
      wheel.add(cab);
      this.ferrisCabins.push(cab);
    }
    const hub = mesh(new THREE.CylinderGeometry(0.6, 0.6, 2.2, 12), toon('#ffc83d'));
    hub.rotation.x = Math.PI / 2;
    wheel.add(hub);
    wheel.position.y = 9;
    g.add(wheel);
    const platform = mesh(new THREE.BoxGeometry(5, 0.3, 3.4), toon('#cfcbe0'), false);
    platform.position.y = 0.15;
    g.add(platform);
    g.position.set(x, 0, z);
    g.rotation.y = this.facePlaza(x, z) + Math.PI / 2;
    this.scene.add(g);
    this.blockers.push({ x, z, r: 3 });
    this.spot('ferris', ...this.front(x, z, 4.4), 2.8, ACT.ferris.label);
  }

  private buildCarousel() {
    const [x, z] = Z.carousel;
    const base = outline(mesh(new THREE.CylinderGeometry(4.6, 4.8, 0.5, 24), toon('#fff1c7')), 1.02);
    base.position.set(x, 0.25, z);
    const pole = mesh(new THREE.CylinderGeometry(0.35, 0.35, 5, 10), toon('#ffc83d'));
    pole.position.set(x, 2.6, z);
    this.scene.add(base, pole);
    const top = this.carousel;
    const roof = outline(mesh(new THREE.ConeGeometry(5.2, 2.2, 16), toon('#e9487d')), 1.03);
    roof.position.y = 5.8;
    const ring = mesh(new THREE.CylinderGeometry(5.2, 5.2, 0.4, 16), toon('#ffffff'));
    ring.position.y = 4.6;
    top.add(roof, ring);
    const horseCols = ['#ffffff', '#ffb3c7', '#9be7de', '#ffd166', '#b39ddb', '#ffffff'];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const h = new THREE.Group();
      const rod = mesh(new THREE.CylinderGeometry(0.05, 0.05, 4.2, 5), toon('#e0c070'), false);
      rod.position.y = 2.6;
      const body = outline(mesh(new THREE.CapsuleGeometry(0.42, 1.2, 4, 8), toon(horseCols[i])), 1.06);
      body.rotation.z = Math.PI / 2;
      body.position.y = 1.6;
      const head = outline(mesh(new THREE.BoxGeometry(0.42, 0.9, 0.38), toon(horseCols[i])), 1.06);
      head.position.set(0.85, 2.1, 0);
      head.rotation.z = -0.35;
      h.add(rod, body, head);
      h.position.set(Math.cos(a) * 3.3, 0.5, Math.sin(a) * 3.3);
      h.rotation.y = -a;
      top.add(h);
      this.carouselHorses.push(h);
    }
    top.position.set(x, 0, z);
    this.scene.add(top);
    this.blockers.push({ x, z, r: 4.8 });
    this.spot('carousel', ...this.front(x, z, 6.4), 2.6, ACT.carousel.label);
  }

  private buildGarden() {
    const [x, z] = Z.garden;
    const cols = ['#ff6b8a', '#ffc83d', '#ffffff', '#b98cff', '#ff8a65'];
    for (let r = 0; r < 3; r++) {
      const bed = mesh(new THREE.BoxGeometry(8, 0.4, 1.6), toon('#9b6b43'), false);
      bed.position.set(x, 0.2, z - 3 + r * 3);
      this.scene.add(bed);
      for (let i = 0; i < 7; i++) {
        const f = new THREE.Group();
        const stem = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.8, 5), toon('#3f9a4a'), false);
        stem.position.y = 0.4;
        const head = mesh(new THREE.SphereGeometry(0.28, 10, 8), toon(cols[(i + r) % cols.length]), false);
        head.position.y = 0.85;
        const mid = mesh(new THREE.SphereGeometry(0.12, 8, 6), toon('#ffd43b'), false);
        mid.position.set(0, 0.9, 0.18);
        f.add(stem, head, mid);
        f.position.set(x - 3.3 + i * 1.1, 0.4, z - 3 + r * 3);
        f.scale.setScalar(0.65);
        this.scene.add(f);
        this.gardenFlowers.push(f);
      }
    }
    this.blockers.push({ x, z, r: 4.6 });
    this.spot('flowers', ...this.front(x, z, 6.2), 2.8, ACT.flowers.label);
  }

  private buildIceCream() {
    const [x, z] = Z.icecream;
    const g = new THREE.Group();
    const body = outline(mesh(new THREE.BoxGeometry(3.6, 2.2, 2), toon('#9be7de')), 1.03);
    body.position.y = 1.6;
    const roof = outline(mesh(new THREE.BoxGeometry(4, 0.3, 2.4), toon('#ff8fb1')), 1.03);
    roof.position.y = 3.6;
    for (const sx of [-1.7, 1.7]) {
      const post = mesh(new THREE.CylinderGeometry(0.07, 0.07, 1, 5), toon('#ffffff'));
      post.position.set(sx, 3.1, 0.9);
      g.add(post);
    }
    for (const wx of [-1.1, 1.1]) {
      const w = mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.25, 12), toon('#3a2b27'));
      w.rotation.x = Math.PI / 2;
      w.position.set(wx, 0.42, 1.05);
      g.add(w);
    }
    const sign = this.coneModel(1.6);
    sign.position.set(0, 4.3, 0);
    g.add(body, roof, sign);
    g.position.set(x, 0, z);
    g.rotation.y = this.facePlaza(x, z);
    this.scene.add(g);
    this.blockers.push({ x, z, r: 2.4 });
    this.spot('icecream', ...this.front(x, z, 3.4), 2.4, ACT.icecream.label);
  }

  /** Dondurma külahı modeli. */
  private coneModel(s = 1) {
    const g = new THREE.Group();
    const cone = outline(mesh(new THREE.ConeGeometry(0.22 * s, 0.6 * s, 10), toon('#e2a868')), 1.06);
    cone.rotation.x = Math.PI;
    const top = outline(mesh(new THREE.SphereGeometry(0.26 * s, 12, 10), toon(['#ff8fb1', '#fff1c7', '#9be7de'][Math.floor(Math.random() * 3)])), 1.06);
    top.position.y = 0.38 * s;
    g.add(cone, top);
    return g;
  }

  private buildLighthouse() {
    const [x, z] = Z.lighthouse;
    const g = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const s = mesh(new THREE.CylinderGeometry(1.5 - i * 0.18, 1.7 - i * 0.18, 2.4, 16), toon(i % 2 ? '#ffffff' : '#ef4b4b'));
      s.position.y = 1.2 + i * 2.4;
      g.add(s);
    }
    const room = outline(mesh(new THREE.CylinderGeometry(1, 1, 1.4, 12), toon('#fff6c9', { emissive: '#554400' })), 1.04);
    room.position.y = 10.4;
    const cap = mesh(new THREE.ConeGeometry(1.3, 1.2, 12), toon('#ef4b4b'));
    cap.position.y = 11.7;
    const balcony = mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.2, 16), toon('#3a2b27'));
    balcony.position.y = 9.6;
    g.add(room, cap, balcony);
    const beamGeo = new THREE.ConeGeometry(2.2, 14, 16, 1, true);
    beamGeo.translate(0, -7, 0);
    const beamM = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ color: '#fff6a0', transparent: true, opacity: 0.0, side: THREE.DoubleSide, depthWrite: false }));
    beamM.rotation.z = Math.PI / 2;
    this.beam.add(beamM);
    this.beam.position.y = 10.4;
    g.add(this.beam);
    g.position.set(x, 0, z);
    this.scene.add(g);
    this.blockers.push({ x, z, r: 1.9 });
    this.spot('lighthouse', ...this.front(x, z, 3.4), 2.4, ACT.lighthouse.label);
  }

  private buildBalloon() {
    const [x, z] = Z.balloon;
    const pad = mesh(new THREE.CylinderGeometry(3, 3, 0.15, 24), toon('#efe2c4'), false);
    pad.position.set(x, 0.08, z);
    this.scene.add(pad);
    const b = this.balloon;
    const env = outline(mesh(new THREE.SphereGeometry(3, 20, 16), toon('#ff6b4a')), 1.02);
    env.scale.y = 1.15;
    env.position.y = 6.5;
    const stripe = mesh(new THREE.SphereGeometry(3.04, 20, 16, 0, Math.PI * 2, Math.PI * 0.42, Math.PI * 0.16), toon('#ffc83d'), false);
    stripe.scale.y = 1.15;
    stripe.position.y = 6.5;
    const basket = outline(mesh(new THREE.BoxGeometry(1.6, 1, 1.6), toon('#b07d4f')), 1.04);
    basket.position.y = 0.5;
    b.add(env, stripe, basket);
    for (const [rx, rz] of [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]]) {
      const rope = mesh(new THREE.CylinderGeometry(0.03, 0.03, 3.3, 4), toon('#5a4636'), false);
      rope.position.set(rx * 1.3, 2.6, rz * 1.3);
      b.add(rope);
    }
    b.position.set(x, 0, z);
    this.scene.add(b);
    this.blockers.push({ x, z, r: 1.4 });
    this.spot('balloon', ...this.front(x, z, 3), 2.4, ACT.balloon.label);
  }

  private buildPier() {
    const pier = new THREE.Group();
    for (let i = 0; i < 15; i++) {
      const plank = mesh(new THREE.BoxGeometry(3, 0.2, 1.1), toon(i % 2 ? '#b07d4f' : '#c08c5c'));
      plank.position.set(0, 0.25, i * 1.15);
      pier.add(plank);
    }
    for (let i = 0; i < 15; i += 3) for (const sx of [-1.5, 1.5]) {
      const post = mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.6, 6), toon('#8a5a32'));
      post.position.set(sx, -0.2, i * 1.15);
      pier.add(post);
    }
    pier.position.set(0, 0, 63);
    this.scene.add(pier);
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
    this.boat.position.set(2.8, -0.3, 70);
    this.scene.add(this.boat);
    this.spot('boat', 0, 69, 2.4, ACT.boat.label);
    this.spot('fish', 0, 78.5, 2.4, ACT.fish.label);
    // olta ve sulama kabı (etkinlikte elde görünür)
    this.rod = new THREE.Group();
    const stick = mesh(new THREE.CylinderGeometry(0.035, 0.05, 2.6, 5), toon('#9b6b43'), false);
    stick.rotation.z = -1.1;
    stick.position.set(1.1, 0.5, 0);
    const line = mesh(new THREE.CylinderGeometry(0.01, 0.01, 2.2, 3), toon('#ffffff'), false);
    line.position.set(2.25, -0.5, 0);
    this.rod.add(stick, line);
    this.rod.visible = false;
    this.can = new THREE.Group();
    const canBody = outline(mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.45, 10), toon('#5b8def')), 1.06);
    const spout = mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.6, 5), toon('#5b8def'), false);
    spout.rotation.z = -1;
    spout.position.set(0.35, 0.1, 0);
    this.can.add(canBody, spout);
    this.can.visible = false;
  }

  private buildTreasure() {
    DIGS.forEach(([x, z], i) => {
      const id = `t${i}`;
      const done = this.o.taken.includes(id);
      const mark = new THREE.Group();
      for (const r of [0.6, -0.6]) {
        const bar = mesh(new THREE.BoxGeometry(1.6, 0.05, 0.28), toon('#e05a4f'), false);
        bar.rotation.y = r * 1.3;
        mark.add(bar);
      }
      mark.position.set(x, 0.05, z);
      mark.visible = !done;
      const chest = new THREE.Group();
      const box = outline(mesh(new THREE.BoxGeometry(1, 0.6, 0.7), toon('#c98a4b')), 1.05);
      box.position.y = 0.3;
      const lid = outline(mesh(new THREE.CylinderGeometry(0.35, 0.35, 1, 10, 1, false, 0, Math.PI), toon('#e2a868')), 1.05);
      lid.rotation.z = Math.PI / 2;
      lid.position.y = 0.6;
      const lock = mesh(new THREE.BoxGeometry(0.18, 0.2, 0.05), toon('#ffc83d'), false);
      lock.position.set(0, 0.42, 0.37);
      chest.add(box, lid, lock);
      chest.position.set(x, 0, z);
      chest.visible = done;
      this.scene.add(mark, chest);
      this.digMarks.push({ id, mark, chest, done });
      this.spot(`dig${i}`, x, z, 2, ACT.dig.label);
    });
  }

  private buildNpc() {
    const tex = new THREE.CanvasTexture(this.o.mascot);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.npc = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.05, side: THREE.DoubleSide }));
    const [x, z] = Z.cizio;
    this.npc.position.set(x, 1.4, z);
    this.scene.add(this.npc);
    const sh = new THREE.Mesh(new THREE.CircleGeometry(0.8, 20), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.2, depthWrite: false }));
    sh.rotation.x = -Math.PI / 2;
    sh.position.set(x, 0.08, z);
    this.scene.add(sh);
    this.blockers.push({ x, z, r: 0.9 });
    this.spot('cizio', x, z, 3, 'Çizio ile konuş');
  }

  private buildNature() {
    const placed: [number, number][] = [];
    const free = (x: number, z: number, r: number) =>
      this.blockers.every((b) => Math.hypot(b.x - x, b.z - z) > b.r + r + 1.5) &&
      this.spots.every((s) => Math.hypot(s.pos.x - x, s.pos.z - z) > s.r + r + 1.5) &&
      placed.every(([px, pz]) => Math.hypot(px - x, pz - z) > 3) && Math.hypot(x, z) > 9 && !(Math.abs(x) < 3 && z > 6) &&
      Object.values(Z).every(([zx, zz]) => Math.hypot(zx - x, zz - z) > 7) && Math.hypot(x - Z.football[0], z - Z.football[1]) > 12 &&
      Math.hypot(x - Z.music[0], z - Z.music[1]) > 9;
    let n = 0, tries = 0;
    while (n < 70 && tries++ < 3000) {
      const a = Math.random() * Math.PI * 2, r = 10 + Math.random() * 48;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (!free(x, z, 1)) continue;
      const t = tree(Math.random() < 0.6 ? 'round' : 'pine', 0.9 + Math.random() * 0.8);
      t.position.set(x, 0, z);
      this.scene.add(t);
      this.blockers.push({ x, z, r: 0.9 });
      placed.push([x, z]);
      n++;
    }
    const cols = ['#ff6b8a', '#ffc83d', '#ffffff', '#b98cff'];
    const fgeo = new THREE.SphereGeometry(0.18, 6, 5);
    for (let i = 0; i < 160; i++) {
      const a = Math.random() * Math.PI * 2, r = 7 + Math.random() * 52;
      const f = mesh(fgeo, toon(cols[i % 4]), false);
      f.position.set(Math.cos(a) * r, 0.25, Math.sin(a) * r);
      this.scene.add(f);
    }
    for (let i = 0; i < 12; i++) {
      const a = Math.random() * Math.PI * 2, r = 30 + Math.random() * 28;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (!free(x, z, 1)) continue;
      const rock = outline(mesh(new THREE.DodecahedronGeometry(0.6 + Math.random() * 0.6, 0), toon('#b9b3c9')), 1.05);
      rock.position.set(x, 0.3, z);
      rock.scale.y = 0.6;
      this.scene.add(rock);
      this.blockers.push({ x, z, r: 0.9 });
    }
    for (const [x, z] of [[8, -6], [-8, 6], [-14, -10], [14, 6]] as const) {
      const b = new THREE.Group();
      const seat = mesh(new THREE.BoxGeometry(2.2, 0.15, 0.7), toon('#b07d4f'));
      seat.position.y = 0.6;
      const back = mesh(new THREE.BoxGeometry(2.2, 0.6, 0.12), toon('#b07d4f'));
      back.position.set(0, 1, -0.32);
      b.add(seat, back);
      b.position.set(x, 0, z);
      b.rotation.y = this.facePlaza(x, z) + Math.PI;
      this.scene.add(b);
      this.blockers.push({ x, z, r: 1.1 });
    }
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.26;
      const p = mesh(new THREE.CylinderGeometry(0.08, 0.1, 3.4, 6), toon('#5b5f6b'));
      p.position.set(Math.cos(a) * 8.3, 1.7, Math.sin(a) * 8.3);
      const l = mesh(new THREE.SphereGeometry(0.3, 10, 8), toon('#fff6c9', { emissive: '#665500' }));
      l.position.set(Math.cos(a) * 8.3, 3.5, Math.sin(a) * 8.3);
      this.scene.add(p, l);
    }
  }

  private buildStars() {
    for (const s of starSpots(this.o.starSeed)) {
      const taken = this.o.taken.includes(s.id);
      let { x, z } = s;
      for (let pass = 0; pass < 3; pass++) for (const b of this.blockers) {
        const d = Math.hypot(x - b.x, z - b.z);
        if (d < b.r + 1) {
          const k = (b.r + 1.3) / Math.max(0.01, d);
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

  private card(c: HTMLCanvasElement, size: number) {
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.06, side: THREE.DoubleSide }));
    m.geometry.translate(0, size / 2, 0);
    return m;
  }

  /** Dolaşan hayvanlar, kelebekler ve yunuslar. */
  private buildCritters() {
    const homes: [number, number][] = [[-14, 10], [16, -8], [-30, 4], [20, 30], [-20, -30], [34, -6], [6, 40], [-6, -14]];
    let hi = 0;
    for (const { id, canvas } of this.o.critters) {
      if (id === 'kelebek' || id === 'ari') {
        for (let i = 0; i < 3; i++) {
          const obj = this.card(canvas, 0.9);
          const c: [number, number] = i === 0 ? [Z.garden[0], Z.garden[1]] : [(Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60];
          this.flyers.push({ obj, t: Math.random() * 10, r: 2 + Math.random() * 3, c, h: 2 + Math.random() * 1.5, sp: 0.6 + Math.random() * 0.5 });
          this.scene.add(obj);
        }
        continue;
      }
      if (id === 'yunus') {
        for (let i = 0; i < 2; i++) {
          const obj = this.card(canvas, 2.6);
          obj.visible = false;
          this.dolphins.push({ obj, t: -Math.random() * 6, a: Math.random() * Math.PI * 2 });
          this.scene.add(obj);
        }
        continue;
      }
      const home = homes[hi++ % homes.length];
      const obj = this.card(canvas, 1.7);
      const pos = new THREE.Vector3(home[0], 0, home[1]);
      this.critters.push({ obj, pos, target: pos.clone(), wait: Math.random() * 3, facing: 1, hop: Math.random() * 6, speed: 1.6 + Math.random(), home, range: 7 });
      this.scene.add(obj);
    }
  }

  /** Meydanın üstünde renkli bayraklar. */
  private buildProps() {
    const cols = ['#ff6b4a', '#ffc83d', '#14a89a', '#e9487d', '#7c5cff'];
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const flag = mesh(new THREE.ConeGeometry(0.35, 0.7, 3), toon(cols[i % cols.length]), false);
      flag.rotation.x = Math.PI;
      flag.position.set(Math.cos(a) * 7.4, 5.2 - Math.abs(Math.sin(a * 2.5)) * 0.4, Math.sin(a) * 7.4);
      this.scene.add(flag);
    }
  }

  // ----------------------------------------------------------------------------------------------
  // Girdi
  // ----------------------------------------------------------------------------------------------
  setJoystick(x: number, y: number) {
    this.joy.set(x, y);
    if (x || y) this.target = null;
  }
  tapTo(clientX: number, clientY: number) {
    if (this.act) return;
    const r = this.canvas.getBoundingClientRect();
    const v = new THREE.Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(v, this.camera);
    const hit = this.ray.intersectObject(this.ground)[0];
    if (hit) this.target = hit.point.clone().setY(0);
  }
  rotateCamera(dx: number) {
    this.camYawGoal -= dx * 0.006;
  }
  emote(kind: 'wave' | 'jump' | 'clap') {
    if (this.act) return;
    this.emoteKind = kind;
    this.emoteUntil = this.clock + (kind === 'jump' ? 0.7 : 1.6);
    if (kind === 'clap') this.sparkles.burst(this.pos.clone().setY(2.5), 14);
    this.ev.sound.pop();
  }
  /** Yakındaki mekânın etkinliği. Ev, galeri ve Çizio React tarafında açılır. */
  activity(id: SpotId) {
    if (this.act) return;
    const kind = id.startsWith('dig') ? 'dig' : id;
    const def = ACT[kind];
    if (!def) return this.ev.onActivityDone(id);
    if (kind === 'dig' && this.digMarks[Number(id.slice(3))]?.done) return;
    this.act = { id, kind, t: 0, dur: def.dur };
    this.target = null;
    this.ev.onBusy(true);
    this.near = null;
    this.ev.onNear(null);
    if (kind === 'fish') {
      this.puppet.hand.add(this.rod);
      this.rod.visible = true;
    }
    if (kind === 'flowers') {
      this.puppet.hand.add(this.can);
      this.can.visible = true;
    }
  }
  teleport(x: number, z: number) {
    this.pos.set(x, 0, z);
    this.target = null;
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
    this.draw(dt);
    this.raf = requestAnimationFrame(this.frame);
  };

  private push(next: THREE.Vector3, r = 0.6) {
    for (const b of this.blockers) {
      const dx = next.x - b.x, dz = next.z - b.z, d = Math.hypot(dx, dz), min = b.r + r;
      if (d < min) {
        next.x = b.x + (dx / (d || 1)) * min;
        next.z = b.z + (dz / (d || 1)) * min;
      }
    }
  }

  private stepWalk(dt: number) {
    let dir = new THREE.Vector3();
    if (this.joy.lengthSq() > 0.01) {
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
    const want = dir.lengthSq() > 0.0001 ? Math.min(1, dir.length()) : 0;
    this.speed += (want - this.speed) * Math.min(1, dt * 10);
    if (want > 0) {
      dir.normalize();
      const next = this.pos.clone().addScaledVector(dir, want * SPEED * dt);
      this.push(next);
      const R = Math.hypot(next.x, next.z);
      const onPier = Math.abs(next.x) < 1.6 && next.z > 58;
      if (onPier) next.z = Math.min(next.z, 79.5);
      else if (R > BEACH_R - 1) next.multiplyScalar((BEACH_R - 1) / R);
      this.pos.copy(next);
      const camRight = new THREE.Vector3(Math.cos(this.camYaw), 0, -Math.sin(this.camYaw));
      const side = dir.dot(camRight);
      if (Math.abs(side) > 0.2) this.facing = side > 0 ? 1 : -1;
      this.stepAcc += dt;
      if (this.stepAcc > 0.32) {
        this.stepAcc = 0;
        this.ev.sound.step();
      }
    }
    for (const s of this.stars) {
      if (s.taken) continue;
      if (Math.hypot(s.obj.position.x - this.pos.x, s.obj.position.z - this.pos.z) < 1.4) {
        s.taken = true;
        s.obj.visible = false;
        this.sparkles.burst(s.obj.position.clone(), 12);
        this.ev.sound.star(this.stars.filter((x) => x.taken).length);
        this.ev.onStar(s.id);
      }
    }
    this.stepMusic();
    this.stepBall(dt);
    let near: Spot | null = null;
    for (const s of this.spots) {
      if (s.id.startsWith('dig') && this.digMarks[Number(s.id.slice(3))].done) continue;
      if (Math.hypot(s.pos.x - this.pos.x, s.pos.z - this.pos.z) < s.r) near = s;
    }
    if (near?.id !== this.near?.id) {
      this.near = near;
      this.ev.onNear(near);
    }
  }

  private stepMusic() {
    let on = -1;
    for (const t of this.musicTiles) if (Math.abs(this.pos.x - t.x) < 0.9 && Math.abs(this.pos.z - t.z) < 1.4) on = t.note;
    if (on === this.musicLast) return;
    this.musicLast = on;
    if (on < 0) return;
    this.ev.sound.note(on);
    const t = this.musicTiles[on];
    const m = t.mesh.material as THREE.MeshToonMaterial;
    m.emissive.set('#555555');
    setTimeout(() => m.emissive.set('#000000'), 260);
    this.sparkles.burst(new THREE.Vector3(t.x, 0.6, t.z), 4);
    this.musicPlayed.add(on);
    if (this.musicPlayed.size === 6) this.ev.onActivityDone('music');
  }

  private stepBall(dt: number) {
    const b = this.ball.position;
    const dx = b.x - this.pos.x, dz = b.z - this.pos.z, d = Math.hypot(dx, dz);
    if (d < 1.1 && this.speed > 0.1) {
      const k = 9 + this.speed * 5;
      this.ballVel.set((dx / (d || 1)) * k, 0, (dz / (d || 1)) * k);
      this.ev.sound.kick();
    }
    b.addScaledVector(this.ballVel, dt);
    this.ballVel.multiplyScalar(Math.pow(0.35, dt));
    this.ball.rotation.x += this.ballVel.z * dt * 2;
    this.ball.rotation.z -= this.ballVel.x * dt * 2;
    const [fx, fz] = Z.football;
    this.goalCooldown -= dt;
    // gol: kale ağzından geçti mi
    if (Math.abs(b.z - fz) < 1.5 && Math.abs(b.x - fx) > 9 && this.goalCooldown <= 0) {
      this.goalCooldown = 2;
      this.sparkles.burst(b.clone().setY(1.2), 24);
      this.ev.onMessage('Gooool!');
      this.ev.onActivityDone('goal');
      setTimeout(() => {
        this.ball.position.set(fx, 0.42, fz);
        this.ballVel.set(0, 0, 0);
      }, 900);
    }
    // saha kenarlarından sek (kale ağzı hariç)
    if (Math.abs(b.z - fz) > 5.3) {
      b.z = fz + Math.sign(b.z - fz) * 5.3;
      this.ballVel.z *= -0.7;
    }
    if (Math.abs(b.x - fx) > 9.2 && Math.abs(b.z - fz) >= 1.5) {
      b.x = fx + Math.sign(b.x - fx) * 9.2;
      this.ballVel.x *= -0.7;
    }
    if (Math.abs(b.x - fx) > 10) b.x = fx + Math.sign(b.x - fx) * 10;
  }

  private stepActivity(dt: number) {
    const a = this.act!;
    a.t += dt;
    const u = Math.min(1, a.t / a.dur);
    switch (a.kind) {
      case 'slide': {
        const [px, pz] = Z.park;
        const top = new THREE.Vector3(px - 2.5, 3.1, pz - 0.4), bottom = new THREE.Vector3(px - 2.5, 0, pz + 4.4);
        if (u < 0.35) this.pos.lerpVectors(new THREE.Vector3(px - 2.5, 0, pz - 2.4), top, u / 0.35);
        else {
          const k = (u - 0.35) / 0.65;
          this.pos.lerpVectors(top, bottom, k * k);
        }
        break;
      }
      case 'swing': {
        const [px, pz] = Z.park;
        const ang = Math.sin(a.t * 2.6) * 0.75 * Math.min(1, a.t) * Math.min(1, (a.dur - a.t) * 1.5);
        this.swingSeat.rotation.x = ang;
        this.pos.set(px + 3, 3.4 - Math.cos(ang) * 2.4 - 0.9, pz + Math.sin(ang) * 2.4);
        break;
      }
      case 'dance': {
        const [x, z] = Z.dance;
        this.pos.set(x, 0.6, z);
        const beat = Math.floor(a.t * 3);
        this.danceTiles.forEach((t, i) => (t.material as THREE.MeshToonMaterial).emissive.set((i + beat) % 3 === 0 ? '#665500' : '#000000'));
        if (Math.floor((a.t - dt) * 3) !== beat) {
          this.ev.sound.dance(beat);
          if (beat % 2 === 0) this.sparkles.burst(new THREE.Vector3(x, 3, z), 6);
        }
        this.facing = Math.floor(a.t * 1.5) % 2 ? 1 : -1;
        break;
      }
      case 'boat': {
        const ang = Math.PI / 2 - u * Math.PI * 2, R = 80;
        this.boat.position.set(Math.cos(ang) * R, -0.3 + Math.sin(a.t * 2) * 0.12, Math.sin(ang) * R);
        this.boat.rotation.y = -ang + Math.PI;
        this.pos.set(this.boat.position.x, 0.4 + this.boat.position.y, this.boat.position.z);
        break;
      }
      case 'ferris': {
        const p = new THREE.Vector3();
        this.ferrisCabins[0].getWorldPosition(p);
        this.pos.set(p.x, p.y - 1.5, p.z);
        break;
      }
      case 'carousel': {
        const p = new THREE.Vector3();
        this.carouselHorses[0].getWorldPosition(p);
        this.pos.set(p.x, 1.4 + Math.sin(a.t * 4) * 0.25, p.z);
        break;
      }
      case 'trampoline': {
        const [x, z] = Z.trampoline;
        const hop = Math.abs(Math.sin(a.t * 2.4));
        this.pos.set(x, 0.85 + hop * 4.5, z);
        this.tramp.position.y = 0.85 - (hop < 0.15 ? (0.15 - hop) * 2 : 0);
        if (Math.floor((a.t * 2.4) / Math.PI) !== Math.floor(((a.t - dt) * 2.4) / Math.PI)) this.ev.sound.pop();
        break;
      }
      case 'balloon': {
        const [x, z] = Z.balloon;
        const k = Math.min(1, u * 4, (1 - u) * 4);
        const ang = u * Math.PI * 2, R = 30 * k;
        this.balloon.position.set(x - R + Math.cos(ang) * R, 22 * k, z + Math.sin(ang) * R);
        this.pos.set(this.balloon.position.x, 22 * k + 0.5, this.balloon.position.z);
        break;
      }
      case 'fish':
        this.pos.set(0, 0.35, 79);
        this.facing = 1;
        break;
      case 'flowers': {
        if (Math.floor(a.t * 6) !== Math.floor((a.t - dt) * 6)) {
          const f = this.gardenFlowers[Math.floor(Math.random() * this.gardenFlowers.length)];
          this.sparkles.burst(new THREE.Vector3(f.position.x, 1.2, f.position.z), 3, '#7ee0ff');
        }
        for (const f of this.gardenFlowers) f.scale.setScalar(Math.min(1.25, f.scale.x + dt * 0.15));
        break;
      }
      case 'lighthouse': {
        const [x, z] = Z.lighthouse;
        const k = Math.min(1, u * 3, (1 - u) * 3);
        this.pos.set(x + 1.4, 9.7 * k, z);
        (this.beam.children[0] as THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>).material.opacity = u > 0.25 && u < 0.85 ? 0.45 : 0.1 * k;
        break;
      }
      case 'dig': {
        const d = this.digMarks[Number(a.id.slice(3))];
        this.pos.set(d.mark.position.x - 0.9, 0, d.mark.position.z);
        if (Math.floor(a.t * 5) !== Math.floor((a.t - dt) * 5)) this.sparkles.burst(d.mark.position.clone().setY(0.4), 4, '#f3dca2');
        break;
      }
    }
    if (u >= 1) this.finishActivity(a);
  }

  private finishActivity(a: { id: SpotId; kind: string }) {
    const back = (x: number, z: number) => this.pos.set(x, 0, z);
    switch (a.kind) {
      case 'slide': back(Z.park[0] - 2.5, Z.park[1] + 5); break;
      case 'swing': this.swingSeat.rotation.x = 0; back(Z.park[0] + 3, Z.park[1] + 3.5); break;
      case 'dance':
        this.danceTiles.forEach((t) => (t.material as THREE.MeshToonMaterial).emissive.set('#000000'));
        back(Z.dance[0], Z.dance[1] + 5.6);
        break;
      case 'boat':
        this.boat.position.set(2.8, -0.3, 70);
        this.boat.rotation.y = 0;
        back(0, 68);
        break;
      case 'ferris': case 'carousel': case 'balloon': case 'lighthouse': case 'trampoline': {
        const s = this.spots.find((x) => x.id === a.id)!;
        if (a.kind === 'balloon') this.balloon.position.set(Z.balloon[0], 0, Z.balloon[1]);
        if (a.kind === 'trampoline') this.tramp.position.y = 0.85;
        if (a.kind === 'lighthouse') (this.beam.children[0] as THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>).material.opacity = 0;
        back(s.pos.x, s.pos.z);
        break;
      }
      case 'fish': {
        this.rod.visible = false;
        this.rod.removeFromParent();
        this.ev.onMessage(`${FISH[Math.floor(Math.random() * FISH.length)]} yakaladın!`);
        this.sparkles.burst(new THREE.Vector3(1.5, 1, 80), 16, '#7ee0ff');
        back(0, 77.5);
        break;
      }
      case 'flowers':
        this.can.visible = false;
        this.can.removeFromParent();
        this.ev.onMessage('Çiçekler büyüdü!');
        break;
      case 'icecream': {
        const cone = this.coneModel(1);
        cone.position.set(0.1, 0.25, 0.05);
        this.held?.removeFromParent();
        this.held = cone;
        this.heldUntil = this.clock + 25;
        this.puppet.hand.add(cone);
        this.ev.onMessage('Afiyet olsun!');
        break;
      }
      case 'dig': {
        const d = this.digMarks[Number(a.id.slice(3))];
        d.done = true;
        d.mark.visible = false;
        d.chest.visible = true;
        this.sparkles.burst(d.chest.position.clone().setY(1), 18);
        this.ev.sound.star(5);
        this.ev.onStar(d.id);
        this.ev.onMessage('Hazine! Bir yıldız buldun!');
        break;
      }
    }
    this.act = null;
    this.ev.onBusy(false);
    this.ev.onActivityDone(a.kind === 'dig' ? 'treasure' : a.id);
    this.sparkles.burst(this.pos.clone().setY(2), 14);
  }

  private stepWorld(dt: number) {
    if (this.water) this.water.offset.x += dt * 0.02;
    for (const s of this.stars) if (!s.taken) s.obj.rotation.y += dt * 2;
    if (!this.act || this.act.kind !== 'boat') this.boat.position.y = -0.3 + Math.sin(this.clock * 1.5) * 0.1;
    // dönme dolap, atlıkarınca ve fener hep döner
    this.ferris.rotation.z += dt * 0.22;
    for (const c of this.ferrisCabins) c.rotation.z = -this.ferris.rotation.z;
    this.carousel.rotation.y += dt * 0.6;
    this.carouselHorses.forEach((h, i) => (h.position.y = 0.5 + Math.sin(this.clock * 3 + i) * 0.3));
    if (!this.act || this.act.kind !== 'balloon') this.balloon.position.y = Math.sin(this.clock * 1.2) * 0.15;
    this.beam.rotation.y += dt * 1.6;
    if (this.held && this.clock > this.heldUntil) {
      this.held.removeFromParent();
      this.held = null;
    }
    const camRight = new THREE.Vector3(Math.cos(this.camYaw), 0, -Math.sin(this.camYaw));
    for (const c of this.critters) {
      c.wait -= dt;
      const d = c.target.clone().sub(c.pos).setY(0);
      if (c.wait <= 0 && d.length() < 0.3) {
        c.wait = 1.5 + Math.random() * 4;
        const a = Math.random() * Math.PI * 2, r = Math.random() * c.range;
        c.target.set(c.home[0] + Math.cos(a) * r, 0, c.home[1] + Math.sin(a) * r);
      }
      const moving = c.wait <= 0 && d.length() > 0.3;
      if (moving) {
        d.normalize();
        c.pos.addScaledVector(d, c.speed * dt);
        this.push(c.pos, 0.5);
        const side = d.dot(camRight);
        if (Math.abs(side) > 0.2) c.facing = side > 0 ? 1 : -1;
        c.hop += dt * 10;
      }
      c.obj.position.set(c.pos.x, moving ? Math.abs(Math.sin(c.hop)) * 0.35 : 0, c.pos.z);
      c.obj.rotation.y = Math.atan2(this.camera.position.x - c.pos.x, this.camera.position.z - c.pos.z);
      c.obj.scale.x = c.facing;
    }
    for (const f of this.flyers) {
      f.t += dt * f.sp;
      f.obj.position.set(f.c[0] + Math.cos(f.t) * f.r, f.h + Math.sin(f.t * 3) * 0.4, f.c[1] + Math.sin(f.t * 1.3) * f.r);
      f.obj.rotation.y = Math.atan2(this.camera.position.x - f.obj.position.x, this.camera.position.z - f.obj.position.z);
      f.obj.scale.x = Math.cos(f.t * 14) > 0 ? 1 : 0.6;
    }
    for (const d of this.dolphins) {
      d.t += dt;
      if (d.t < 0) continue;
      if (d.t > 1.6) {
        d.t = -4 - Math.random() * 8;
        d.a = Math.random() * Math.PI * 2;
        d.obj.visible = false;
        continue;
      }
      const u = d.t / 1.6, R = 84;
      d.obj.visible = true;
      const ax = Math.cos(d.a) * R, az = Math.sin(d.a) * R;
      const tx = -Math.sin(d.a), tz = Math.cos(d.a);
      d.obj.position.set(ax + tx * (u - 0.5) * 7, -1.5 + Math.sin(u * Math.PI) * 4, az + tz * (u - 0.5) * 7);
      d.obj.rotation.y = Math.atan2(this.camera.position.x - d.obj.position.x, this.camera.position.z - d.obj.position.z);
      d.obj.rotation.z = (0.5 - u) * 1.6;
    }
    this.sparkles.update(dt);
  }

  private pose(): Pose {
    if (this.act) {
      const u = this.act.t / this.act.dur;
      switch (this.act.kind) {
        case 'dance': return 'dance';
        case 'trampoline': return 'jump';
        case 'swing': case 'ferris': case 'carousel': case 'boat': case 'balloon': return 'sit';
        case 'fish': return 'fish';
        case 'slide': return u < 0.35 ? 'walk' : 'cheer';
        case 'lighthouse': return u > 0.3 && u < 0.85 ? 'wave' : 'walk';
        case 'dig': return 'clap';
        case 'flowers': case 'icecream': return 'hold';
      }
    }
    if (this.emoteKind && this.clock < this.emoteUntil) return this.emoteKind;
    this.emoteKind = null;
    return this.held ? 'hold' : 'walk';
  }

  private draw(dt: number) {
    const pose = this.pose();
    let jump = 0;
    if (pose === 'jump' && !this.act) jump = Math.sin(Math.max(0, 1 - (this.emoteUntil - this.clock) / 0.7) * Math.PI) * 1.4;
    const climbing = this.act && ((this.act.kind === 'slide' || this.act.kind === 'lighthouse') && pose === 'walk');
    const speed = this.act ? (climbing ? 0.8 : 0) : this.speed;
    this.puppet.root.position.set(this.pos.x, this.pos.y + jump, this.pos.z);
    const yaw = Math.atan2(this.camera.position.x - this.pos.x, this.camera.position.z - this.pos.z);
    this.puppet.update(dt, this.clock, pose, speed, this.facing, yaw);
    // trambolinde tepeye yakınken takla
    const inner = this.puppet.root.children[0];
    if (this.act?.kind === 'trampoline') {
      const ph = (this.act.t * 2.4) % Math.PI;
      inner.rotation.z = ph > 0.9 && ph < 2.2 ? ((ph - 0.9) / 1.3) * Math.PI * 2 : 0;
    } else inner.rotation.z = 0;
    const tramp = this.act?.kind === 'trampoline', dance = this.act?.kind === 'dance';
    this.shadow.visible = (this.pos.y < 0.7 && !this.act) || tramp || dance;
    this.shadow.position.set(this.pos.x, tramp ? 0.9 : dance ? 0.62 : 0.07, this.pos.z);
    const sk = 1 / (1 + Math.max(0, this.pos.y + jump - (tramp ? 0.85 : dance ? 0.6 : 0)) * 0.25);
    this.shadow.scale.set(sk, 0.55 * sk, 1);
    // evcil hayvan: biraz arkada, zıplayarak gelir
    if (this.pet) {
      const spot = this.act ? this.spots.find((s) => s.id === this.act!.id)?.pos : null;
      const want = spot ?? this.pos.clone().add(new THREE.Vector3(-this.facing * 1.4, 0, 0.9));
      const d = want.clone().sub(this.petPos).setY(0);
      const moving = d.length() > 0.4;
      if (moving) {
        this.petPos.addScaledVector(d, Math.min(1, dt * 4));
        this.petHop += dt * 12;
      }
      this.pet.position.set(this.petPos.x, moving ? Math.abs(Math.sin(this.petHop)) * 0.3 : 0, this.petPos.z);
      this.pet.rotation.y = Math.atan2(this.camera.position.x - this.petPos.x, this.camera.position.z - this.petPos.z);
      this.pet.scale.x = this.facing;
    }
    if (this.npc) {
      const [x, z] = Z.cizio;
      this.npc.rotation.y = Math.atan2(this.camera.position.x - x, this.camera.position.z - z);
      this.npc.position.y = 1.4 + Math.sin(this.clock * 2) * 0.12;
    }
    // kamera: arkadan, yukarıdan; büyük etkinliklerde (dönme dolap, balon) uzaklaşır
    this.camYaw += (this.camYawGoal - this.camYaw) * 0.12;
    const [dist, h] = (this.act && ACT[this.act.kind]?.cam) || [14, 9.5];
    const cx = this.pos.x + Math.sin(this.camYaw) * dist, cz = this.pos.z + Math.cos(this.camYaw) * dist;
    this.camera.position.lerp(new THREE.Vector3(cx, this.pos.y + h, cz), 0.1);
    this.camera.lookAt(this.pos.x, this.pos.y + 1.6, this.pos.z);
    // güneş (gölgeler) kahramanı izler
    this.sun.position.set(this.pos.x - 20, 40, this.pos.z + 18);
    this.sun.target.position.set(this.pos.x, 0, this.pos.z);
    this.renderer.render(this.scene, this.camera);
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
    this.puppet.dispose();
    disposeScene(this.scene);
    this.renderer.dispose();
  }
}
