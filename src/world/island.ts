/**
 * Çizio Adası: büyük, 3B oyun dünyası (eski adanın ~20 katı), çiftliğim, pazar ve macera kapıları.
 *
 * Kahraman Giydir karakterinin 3B hâli (src/world/avatar3d.ts): yürüdüğü yöne döner, koşar, yüzer, zıplar, araç sürer.
 * Dokunma: bir eşyaya (tarla, kaydırak, kapı…) dokununca o iş yapılır (uzaksa önce yanına yürünür); boş bir yere
 * dokununca zıplar; inşa modunda blok konur ya da kaldırılır.
 * Arazi src/world/terrain.ts, bölgeler src/world/zones.ts, çiftlik/pazar/kapılar src/world/homestead.ts,
 * inşa src/world/build.ts, kapıların ardındaki dünyalar src/world/realms.ts.
 * React tarafı (src/pages/World.tsx) yalnızca girdi verir ve olayları dinler.
 */
import * as THREE from 'three';
import { cloud, disposeScene, makeRenderer, Sparkles, star } from '../play3d/kit';
import { spaceHelmet, Avatar3D, type Pose } from './avatar3d';
import type { DollState } from '../dressup/catalog';
import { isWater, WORLD_R } from './layout';
import { petCard } from './puppet';
import { BlockGrid, buildHorizon, buildTerrain, buildVegetation } from './terrain';
import { Sky, weatherOf } from './weather';
import { buildPlaces } from './places';
import { buildZones, starPlaces, WorldBuilder, type Activity, type SpotDef, type Vehicle } from './zones';
import { buildMarket, buildPortals, buildShops, Homestead, realmName, type FarmBridge, type RealmId } from './homestead';
import { type Hero, type Realm } from './realms';
import { makeRealm } from './worlds';
import { blockById, buyBlueprint, placedBlocks, placeStruct, removeStruct, struct, type FarmState, type PlaceKind } from './economy';
import { blueprint as blueprintParts } from './build';
import type { Cell } from './build';
import { car as carDef, carModel } from './cars';
import { DayNight } from './daynight';
import { buildSports } from './sports';
import type { Live } from '../online/rt';

/** İnşa aracı: blok, silgi ya da çiftlik yapısı. */
export type Tool = { block: string } | { erase: true } | { struct: PlaceKind };

/** Adadaki bir arkadaş (çok oyunculu). */
interface Remote { av: Avatar3D; tag: THREE.Sprite; look: string; pos: THREE.Vector3; target: THREE.Vector3; h: number; th: number; pose: Pose; speed: number; seen: number; w: string; car: THREE.Object3D | null; carId: string; net?: string; netSeen?: Record<string, string> }

function nameTag(name: string) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 72;
  const x = c.getContext('2d')!;
  x.font = '600 34px Fredoka, Nunito, sans-serif';
  const w = Math.min(244, x.measureText(name).width + 36);
  x.fillStyle = 'rgba(255,255,255,0.92)';
  x.beginPath();
  x.roundRect((256 - w) / 2, 10, w, 52, 26);
  x.fill();
  x.fillStyle = '#3a2b27';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillText(name, 128, 38);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true }));
  sp.scale.set(2.6, 0.73, 1);
  sp.renderOrder = 10;
  return sp;
}

export interface Spot { id: string; pos: THREE.Vector3; r: number; label: string }

export interface RealmInfo { id: RealmId; name: string; goal: string; leave: string; icon: string }

export interface IslandEvents {
  onNear: (s: Spot | null) => void;
  onStar: (id: string) => void;
  /** Bir görev / etkinlik tamamlandı (görev kimliği). */
  onDone: (quest: string) => void;
  /** Koleksiyona bir parça eklendi (balık, fosil, kabuk, böcek). */
  onCollect?: (id: string) => void;
  onBusy: (busy: boolean) => void;
  onMessage: (text: string) => void;
  /** Araç sürülüyor mu (İn düğmesi için). */
  onDrive: (driving: boolean) => void;
  /** Konum (küçük harita için, saniyede birkaç kez). */
  onPos: (x: number, z: number, heading: number) => void;
  /** React'ta açılan mekân (ev, galeri, Çizio, pazar, tarla…). */
  onPage: (id: string) => void;
  /** Macera kapısından girildi / çıkıldı (null). */
  onRealm?: (r: RealmInfo | null) => void;
  /** Macera ilerlemesi ("2/6", "5/20 · 40 sn"). */
  onRealmProgress?: (text: string) => void;
  /** Macera bitti: ek altın ve mesaj. */
  onRealmFinish?: (id: RealmId, bonus: number, text: string) => void;
  /** Kahraman inşa alanında mı (İnşa düğmesi için). */
  onBuildArea?: (inside: boolean) => void;
  sound: { star: (i: number) => void; pop: () => void; note: (i: number) => void; kick: () => void; whoosh?: () => void; fx?: (name: string, i?: number) => void; engine?: (level: number, kind: string) => void };
}

export interface IslandOptions {
  doll: DollState;
  pet: HTMLCanvasElement | null;
  art: HTMLCanvasElement[];
  /** Kâğıt kartlar: hayvanlar, dinozorlar, deniz canlıları, Çizio (ders çizimleri). */
  tex: Record<string, HTMLCanvasElement>;
  /** Bugün toplanmış yıldızlar ve kazılmış hazineler. */
  taken: string[];
  starSeed: number;
  start?: [number, number];
  /** Çiftliğim (kayıt React'ta). */
  farm: FarmBridge;
}

const WALK = 8, RUN = 15;
const GRAVITY = 32, JUMP = 12.5;
const SKY = new THREE.Color('#bde6f7');
const DEEP = new THREE.Color('#1f86b8');

const angDiff = (a: number, b: number) => Math.atan2(Math.sin(a - b), Math.cos(a - b));

export class Island {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(52, 1, 0.1, 1200);
  private sun: THREE.DirectionalLight;
  private hemi: THREE.HemisphereLight;
  /** Gece ve gündüz (cihazın saatine göre). */
  sky!: DayNight;
  private grid = new BlockGrid();
  private wb: WorldBuilder;
  private home: Homestead;
  private avatar: Avatar3D;
  private pet: THREE.Mesh | null = null;
  private petPos = new THREE.Vector3();
  private petHop = 0;
  private shadow: THREE.Mesh;
  private sparkles: Sparkles;
  private pick: THREE.Mesh;
  private land: THREE.Object3D;
  private sea: THREE.Mesh;
  private water: THREE.Texture;
  private stars: { id: string; obj: THREE.Object3D; taken: boolean }[] = [];
  private spots: SpotDef[];
  // durum
  private raf = 0;
  /** Günün havası (yağmur / kar); açık havada yok. */
  private hava: Sky | null = null;
  private last = 0;
  private clock = 0;
  private pos = new THREE.Vector3();
  private heading = 0;
  private hero: Hero;
  private target: THREE.Vector3 | null = null;
  private pending: string | null = null;
  private joy = new THREE.Vector2();
  private camYaw = Math.PI;
  private camYawGoal = Math.PI;
  private lastDrag = -10;
  private speed = 0;
  private swimming = false;
  private swimTime = 0;
  private near: SpotDef | null = null;
  /** Araçtan inince kısa süre yakındaki düğme çıkmaz (aynı yere dokunup yeniden binmesin). */
  private nearQuietUntil = 0;
  private nearLabel = '';
  private emoteUntil = 0;
  private emoteKind: 'wave' | 'dance' | 'clap' | null = null;
  private act: { spot: SpotDef; def: Activity; t: number } | null = null;
  private drive: Vehicle | null = null;
  private musicLast = -1;
  private musicPlayed = new Set<number>();
  private posTimer = 0;
  private underwater = false;
  private resizeObs: ResizeObserver;
  private ray = new THREE.Raycaster();
  private actor: { pos: THREE.Vector3; heading: number; hand: THREE.Group };
  private remotes = new Map<string, Remote>();
  private lastPose: Pose = 'walk';
  // inşa
  private building = false;
  private tool: Tool = { block: 'ahsap' };
  private undo: string[] = [];
  // macera kapıları
  private realm: Realm | null = null;
  private realmBack = new THREE.Vector3();
  /** Dünyadan çıkınca adada durulacak yer ve yön (bina kapısının önü gibi). */
  private realmReturn: { x: number; z: number; h: number } | null = null;
  private helmet: THREE.Object3D | null = null;
  private engineOn = false;
  private seed = 1;
  /** Evim'deyken arkadaşlar adada görmesin. */
  away = false;
  // gerçekçi hareket: hız yumuşakça değişir, dönüşte yana yatar, iniş esnemesi
  private vel = new THREE.Vector3();
  private lean = 0;
  private squash = 0;
  private coyote = 0;
  private jumpBuf = 0;
  private dustT = 0;
  // kamera: yukarı / aşağı bakış
  private camPitch = 0;
  private camPitchGoal = 0;
  // başarım: uzaktaki bölgeler çizilmez, çözünürlük kare hızına göre ayarlanır
  private chunks: { g: THREE.Group; x: number; z: number }[] = [];
  private cullT = 0;
  private fpsT = 0;
  private fpsN = 0;
  private ratio = 1;
  private maxRatio = 1;
  /** Benim arabam (adada park eder, çağrılınca yanıma gelir). */
  private myCar: { id: string; spot: SpotDef } | null = null;

  constructor(private canvas: HTMLCanvasElement, private o: IslandOptions, private ev: IslandEvents) {
    this.renderer = makeRenderer(canvas);
    // yumuşak, pastel görünüm (Evim ile aynı)
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.scene.background = SKY.clone();
    this.scene.fog = new THREE.Fog(SKY.clone(), 120, 300);
    this.hemi = new THREE.HemisphereLight('#fffaf2', '#b9d9a0', 1.2);
    this.scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight('#fff4dc', 1.5);
    this.sun.castShadow = true;
    // telefonda gölge haritası daha küçük
    const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
    this.sun.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048);
    this.maxRatio = Math.min(coarse ? 1.5 : 1.75, window.devicePixelRatio || 1);
    this.ratio = this.maxRatio;
    this.renderer.setPixelRatio(this.ratio);
    this.sun.shadow.bias = -0.0006;
    this.sun.shadow.normalBias = 0.05;
    Object.assign(this.sun.shadow.camera, { left: -42, right: 42, top: 42, bottom: -42, near: 1, far: 220 });
    this.scene.add(this.sun, this.sun.target);

    const T = performance.now();
    const mark = (n: string) => import.meta.env.DEV && console.log(`[perf] ${n} ${Math.round(performance.now() - T)}ms`);
    const terrain = buildTerrain(this.scene);
    mark('arazi');
    this.pick = terrain.pick;
    this.land = terrain.land;
    this.sea = terrain.sea;
    this.water = terrain.water;
    buildHorizon(this.scene, (s) => cloud(s));
    this.sparkles = new Sparkles(this.scene);

    this.wb = new WorldBuilder(this.scene, this.grid, this.sparkles, o.tex, o.art,
      (quest, msg) => {
        if (quest.startsWith('koleksiyon:')) {
          this.ev.onCollect?.(quest.slice(11));
          if (msg) this.ev.onMessage(msg);
          return;
        }
        if (quest.startsWith('star:')) {
          this.ev.onStar(quest.slice(5));
          this.ev.sound.star(5);
          return;
        }
        if (msg) this.ev.onMessage(msg);
        this.ev.onDone(quest);
      },
      { note: (i) => this.ev.sound.note(i), kick: () => this.ev.sound.kick(), pop: () => this.ev.sound.pop(), star: (i) => this.ev.sound.star(i), whoosh: () => this.ev.sound.whoosh?.(), fx: (n, i) => this.ev.sound.fx?.(n, i) });
    this.wb.enter = (id, back) => this.enterRealm(id, back);
    buildZones(this.wb, o.taken);
    buildPlaces(this.wb);
    buildSports(this.wb);
    this.wb.myName = o.doll.name?.trim() || 'Sen';
    this.wb.peerPos = (pid) => {
      const r = this.remotes.get(pid);
      return r && r.w === (this.realm?.id ?? '') && r.av.root.visible ? r.pos : null;
    };
    this.wb.peerCount = () => [...this.remotes.values()].filter((r) => r.w === '').length;
    mark('bölgeler');
    buildMarket(this.wb);
    buildShops(this.wb);
    buildPortals(this.wb, (id) => this.enterRealm(id));
    this.chunkStatics();
    this.home = new Homestead(this.wb, o.farm, (x, z) => this.canBuildAt(x, z));
    // kapı açılırken tahta kapı sesi
    this.home.build.onDoor = () => this.ev.sound.fx?.('dooropen');
    mark('çiftlik+pazar+kapılar');
    this.wb.autoBodies();
    buildVegetation(this.scene, this.grid, this.wb.keepOut);
    // günün havası (aynı gün hep aynı): yağmur ya da kar kahramanın çevresinde yağar
    const hava = weatherOf();
    if (hava !== 'acik') this.hava = new Sky(this.scene, hava);
    mark('bitki örtüsü');
    this.spots = this.wb.spots;
    this.buildStars();
    this.sky = new DayNight(this.scene, this.hemi, this.sun, this.renderer, this.wb.lamps);
    this.wb.night = () => this.sky.night;

    // Kahraman
    this.avatar = new Avatar3D(o.doll);
    this.scene.add(this.avatar.root);
    this.actor = { pos: this.pos, heading: 0, hand: this.avatar.hand };
    this.hero = { pos: this.pos, vy: 0, grounded: true };
    const [sx, sz] = o.start ?? [0, 12];
    this.pos.set(sx, this.wb.ground(sx, sz), sz);
    this.heading = Math.PI;
    if (o.pet) {
      this.pet = petCard(o.pet);
      if (this.pet) {
        this.petPos.copy(this.pos).add(new THREE.Vector3(1.6, 0, 1));
        this.scene.add(this.pet);
      }
    }
    this.shadow = new THREE.Mesh(new THREE.CircleGeometry(0.75, 24), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false }));
    this.shadow.rotation.x = -Math.PI / 2;
    this.scene.add(this.shadow);

    this.camera.position.set(this.pos.x, this.pos.y + 9, this.pos.z - 14);
    this.resizeObs = new ResizeObserver(() => this.resize());
    this.resizeObs.observe(canvas);
    this.resize();
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
    mark('kurulum bitti');
  }

  /** Sabit nesneleri 70 birimlik bölgelere toplar; uzaktaki bölgeler çizilmez (daha az çizim çağrısı). */
  private chunkStatics() {
    const C = 70;
    const moving = new Set<THREE.Object3D>([...this.wb.wanderers.map((w) => w.obj), ...this.wb.spots.filter((s) => s.vehicle).map((s) => s.vehicle!.model)]);
    const map = new Map<string, { g: THREE.Group; x: number; z: number }>();
    const box = new THREE.Box3(), sph = new THREE.Sphere();
    for (const o of [...this.scene.children]) {
      if (moving.has(o) || o.userData.moving || o === this.land || o === this.sea || o === this.pick || o === this.sun || o === this.sun.target) continue;
      if ((o as THREE.Light).isLight || (o as THREE.InstancedMesh).isInstancedMesh || (o as THREE.Sprite).isSprite) continue;
      box.setFromObject(o).getBoundingSphere(sph);
      if (!Number.isFinite(sph.radius) || sph.radius > 50 || Math.hypot(sph.center.x, sph.center.z) > WORLD_R) continue;
      const kx = Math.floor(sph.center.x / C), kz = Math.floor(sph.center.z / C);
      const k = `${kx},${kz}`;
      let ch = map.get(k);
      if (!ch) {
        ch = { g: new THREE.Group(), x: (kx + 0.5) * C, z: (kz + 0.5) * C };
        this.scene.add(ch.g);
        map.set(k, ch);
      }
      ch.g.add(o);
    }
    this.chunks = [...map.values()];
  }
  private cull() {
    const R = 230;
    for (const c of this.chunks) c.g.visible = Math.hypot(c.x - this.pos.x, c.z - this.pos.z) < R;
  }

  private buildStars() {
    for (const s of starPlaces(this.o.starSeed)) {
      const taken = this.o.taken.includes(s.id);
      const p = { x: s.x, z: s.z };
      this.grid.push(p, 1.2);
      if (this.home.build.near(p.x, p.z, 2)) continue;
      const obj = star();
      obj.scale.setScalar(1.4);
      obj.position.set(p.x, this.wb.ground(p.x, p.z) + 1.4, p.z);
      obj.visible = !taken;
      this.scene.add(obj);
      this.stars.push({ id: s.id, obj, taken });
    }
  }

  /** Bulunulan sahne (ada ya da macera dünyası). */
  private get stage() {
    return this.realm?.scene ?? this.scene;
  }
  private get fx() {
    return this.realm?.sparkles ?? this.sparkles;
  }

  /** Kahramanın basabileceği zemin: adada arazi + iskele + bloklar; macerada dünyanın zemini. */
  private floorAt(x: number, z: number, y: number) {
    if (this.realm) return this.realm.floor(x, z, y);
    const g = this.wb.ground(x, z);
    const b = this.home.build.standY(x, z, y);
    return b !== null ? Math.max(b, g) : g;
  }
  private blockedAt(x: number, z: number, y: number) {
    return this.realm ? this.realm.blocked(x, z, y) : this.home.build.blocked(x, z, y);
  }

  // ----------------------------------------------------------------------------------------------
  // Girdi
  // ----------------------------------------------------------------------------------------------
  setJoystick(x: number, y: number) {
    this.joy.set(x, y);
    if (x || y) {
      this.target = null;
      this.pending = null;
    }
  }
  /** Ekrana dokunma: inşa modunda blok; bir eşyaya dokunduysa o iş; değilse zıplama. */
  tapTo(clientX: number, clientY: number) {
    if (this.act) return;
    const r = this.canvas.getBoundingClientRect();
    const v = new THREE.Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(v, this.camera);
    if (this.building && !this.realm) return this.buildTap();
    if (this.drive) return this.jump();
    const s = this.spotUnderTap();
    if (!s) return this.jump();
    if (this.spotDist(s, this.pos.x, this.pos.z) < 1.15) return this.activity(s.id);
    // uzak: önce yanına yürü (gövdesi varsa gövdenin bu yana bakan kenarına)
    if (s.body) {
      const dx = this.pos.x - s.body.x, dz = this.pos.z - s.body.z, l = Math.hypot(dx, dz) || 1;
      this.target = new THREE.Vector3(s.body.x + (dx / l) * (s.body.r + 1.1), 0, s.body.z + (dz / l) * (s.body.r + 1.1));
    } else if (s.vehicle) this.target = new THREE.Vector3(s.vehicle.pos.x, 0, s.vehicle.pos.z);
    else this.target = new THREE.Vector3(s.x, 0, s.z);
    this.pending = s.id;
  }
  /**
   * Mekâna uzaklık (1'in altı: yakında). Ya mekân noktasının yarıçapı içinde ya da gövdesinin kenarına 1,8 birimden
   * yakın: atlıkarıncaya, binaya hangi yandan gelinirse gelinsin.
   */
  private spotDist(s: SpotDef, x: number, z: number) {
    const cx = s.vehicle ? s.vehicle.pos.x : s.x, cz = s.vehicle ? s.vehicle.pos.z : s.z;
    let d = Math.hypot(cx - x, cz - z) / s.r;
    if (s.body) d = Math.min(d, Math.max(0, Math.hypot(s.body.x - x, s.body.z - z) - s.body.r) / 1.8);
    return d;
  }
  /** Dokunulan noktanın yakınındaki mekân (arazi ya da gökyüzü değilse). */
  private spotUnderTap(): SpotDef | null {
    const hits = this.ray.intersectObjects(this.stage.children, true);
    for (const h of hits) {
      let o: THREE.Object3D | null = h.object;
      if (o === this.shadow || o === this.pick || o === this.sea) continue;
      while (o && o !== this.avatar.root && o !== this.pet) o = o.parent;
      if (o) continue; // kendi karakterine dokundu
      if (h.object === this.land || h.distance > 90) return null;
      let best: SpotDef | null = null, bd = Infinity;
      for (const s of this.live) {
        if (s.dyn && s.dyn() === null) continue;
        const x = s.vehicle ? s.vehicle.pos.x : s.x, z = s.vehicle ? s.vehicle.pos.z : s.z;
        let d = Math.hypot(h.point.x - x, h.point.z - z) - s.r;
        if (s.body) d = Math.min(d, Math.hypot(h.point.x - s.body.x, h.point.z - s.body.z) - s.body.r);
        if (d < 4 && d < bd) [best, bd] = [s, d];
      }
      return best;
    }
    return null;
  }
  /** Zıpla (yerdeyken). */
  jump() {
    if (this.act || this.drive || this.swimming) return;
    if (!this.hero.grounded && this.coyote <= 0) {
      this.jumpBuf = 0.15; // inmeden hemen önce basıldı: inince zıpla
      return;
    }
    this.doJump();
  }
  private doJump() {
    this.hero.vy = JUMP;
    this.hero.grounded = false;
    this.coyote = 0;
    this.jumpBuf = 0;
    this.squash = -0.12;
    this.emoteKind = null;
  }
  /** Sürükleme: yatay sağa sola, dikey yukarı aşağı bakış. */
  rotateCamera(dx: number, dy = 0) {
    this.camYawGoal -= dx * 0.006;
    this.camPitchGoal = Math.min(0.75, Math.max(-0.28, this.camPitchGoal + dy * 0.004));
    this.lastDrag = this.clock;
  }
  emote(kind: 'wave' | 'dance' | 'clap') {
    if (this.act || this.drive) return;
    this.emoteKind = kind;
    this.emoteUntil = this.clock + (kind === 'dance' ? 2.6 : 1.6);
    if (kind === 'clap') this.fx.burst(this.pos.clone().setY(this.pos.y + 2.8), 14);
    // el sallarken kameraya döner
    if (kind === 'wave') this.heading = Math.atan2(this.camera.position.x - this.pos.x, this.camera.position.z - this.pos.z);
    this.ev.sound.pop();
  }
  /** Yakındaki mekânın etkinliği ya da aracı. */
  activity(id: string) {
    if (this.act || this.drive) return;
    const s = this.live.find((x) => x.id === id);
    if (!s) return;
    this.target = null;
    this.pending = null;
    if (s.use) {
      const u = s.use();
      if (!u) return;
      if (u === 'page') return this.ev.onPage(id);
      if ('msg' in u) {
        if (u.msg) this.ev.onMessage(u.msg);
        this.setNear(null);
        return;
      }
      return this.startAct(s, u);
    }
    if (s.page) return this.ev.onPage(id);
    if (s.vehicle) return this.mount(s);
    if (s.act) this.startAct(s, s.act);
  }
  /** Sürmekte olan etkinliği (salıncak, dönme dolap, balon...) hemen bitir: çocuk hiç beklemede kalmasın. */
  endAct() {
    if (!this.act) return;
    this.act.t = Math.max(this.act.t, this.act.def.dur);
  }

  private startAct(s: SpotDef, def: Activity) {
    this.act = { spot: s, def, t: 0 };
    this.vel.set(0, 0, 0);
    this.hero.vy = 0;
    this.hero.grounded = true;
    this.actor.heading = this.heading;
    def.start?.(this.actor);
    this.ev.onBusy(true);
    this.setNear(null);
    if (def.underwater) this.setUnderwater(true);
  }
  private mount(s: SpotDef) {
    this.drive = s.vehicle!;
    // kamera aracın arkasına geçsin (önünde kalıp binaya girmesin)
    this.camYawGoal = this.camYaw + angDiff(this.drive.heading + Math.PI, this.camYaw);
    this.ev.onDrive(true);
    this.ev.onDone(s.id);
    this.setNear(null);
    this.ev.sound.pop();
  }
  /**
   * Suyun üstündeki en yakın kara parçası (dışa doğru halka halka arar). Uçak denizin üstünde inmek isteyince
   * kullanılır: çocuk hiçbir zaman gökyüzünde kilitli kalmaz.
   */
  private nearestLand(x: number, z: number): [number, number] | null {
    for (let r = 6; r <= WORLD_R * 2; r += 10) {
      let best: [number, number] | null = null, bg = 0.6;
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 24) {
        const px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r;
        if (Math.hypot(px, pz) > WORLD_R) continue;
        const g = this.groundAt(px, pz);
        if (g > bg) [best, bg] = [[px, pz], g];
      }
      if (best) return best;
    }
    return null;
  }

  /** Araçtan in: en yakın karaya ya da aracın yanına (suya). */
  dismount() {
    if (!this.drive) return;
    const v = this.drive;
    if (v.alt && v.alt > 5) {
      // uçak: tekerlekleri yere oturur. Denizin üstündeyse kendiliğinden en yakın karaya iner
      // (küçük oyuncu "İn"e basınca her zaman inebilmeli).
      if (this.groundAt(v.pos.x, v.pos.z) < 0.3) {
        const land = this.nearestLand(v.pos.x, v.pos.z);
        if (!land) {
          this.ev.onMessage('Önce karaya uç, sonra in!');
          return;
        }
        v.pos.x = land[0];
        v.pos.z = land[1];
        this.ev.onMessage('Uçak karaya indi!');
      }
      v.pos.y = this.groundAt(v.pos.x, v.pos.z) + (v.park ?? 0);
      v.model.position.copy(v.pos);
      v.model.rotation.set(0, v.heading, 0);
    }
    v.onLeave?.();
    if (this.realm) {
      // bir dünyada (Mars): aracın soluna, boş bir yere
      const x = v.pos.x + Math.cos(v.heading) * 2.6, z = v.pos.z - Math.sin(v.heading) * 2.6;
      this.pos.set(x, this.groundAt(x, z), z);
      this.unstick();
      this.hero.vy = 0;
      this.hero.grounded = true;
      this.drive = null;
      this.nearQuietUntil = this.clock + 1.2;
      this.setNear(null);
      this.ev.onDrive(false);
      return;
    }
    // aracın bin düğmesinin alanının dışına in
    const spotR = this.spots.find((s) => s.vehicle === v)?.r ?? 0;
    let best: [number, number] | null = null;
    for (let r = Math.max(2, Math.ceil(spotR + 1)); r <= 16 && !best; r += 2) for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
      const x = v.pos.x + Math.cos(a) * r, z = v.pos.z + Math.sin(a) * r;
      if (this.wb.ground(x, z) > 0.1) {
        best = [x, z];
        break;
      }
    }
    let [x, z] = best ?? [v.pos.x + 2, v.pos.z];
    if (v.land || v.fly) {
      // arabanın soluna in
      x = v.pos.x + Math.cos(v.heading) * 2.4;
      z = v.pos.z - Math.sin(v.heading) * 2.4;
      if (this.wb.ground(x, z) < 0.1 && best) [x, z] = best;
    }
    this.pos.set(x, Math.max(-0.55, this.wb.ground(x, z)), z);
    this.hero.vy = 0;
    this.hero.grounded = true;
    this.drive = null;
    this.nearQuietUntil = this.clock + 1.2;
    this.setNear(null);
    this.ev.onDrive(false);
  }

  /** Arabamı çağır: yanıma gelir ve binerim. */
  summonCar(id: string) {
    const def = carDef(id);
    if (!def || this.act || this.realm) return;
    if (this.drive) this.dismount();
    if (this.myCar && this.myCar.id !== id) {
      this.scene.remove(this.myCar.spot.vehicle!.model);
      this.spots.splice(this.spots.indexOf(this.myCar.spot), 1);
      this.myCar = null;
    }
    if (!this.myCar) {
      const model = carModel(id);
      this.scene.add(model);
      const prop = model.userData.prop as THREE.Object3D | undefined;
      let propSpeed = 0;
      const v: Vehicle = {
        model, pos: new THREE.Vector3(), heading: this.heading, speed: def.speed, water: false, seatY: def.seatY,
        land: !def.fly, fly: def.fly, alt: def.alt, park: def.park, bank: def.bank, cam: def.cam,
        seat: model.userData.seat as [number, number, number],
        update: prop
          ? (dt, mag) => {
            propSpeed += ((12 + mag * 26) - propSpeed) * Math.min(1, dt * 2);
            prop.rotation.z += dt * propSpeed;
          }
          : undefined,
        onLeave: prop ? () => (propSpeed = 0) : undefined,
      };
      const spot: SpotDef = { id: 'car', x: 0, z: 0, r: 4, label: `${def.name} ile gez`, vehicle: v };
      this.spots.push(spot);
      this.myCar = { id, spot };
    }
    const v = this.myCar.spot.vehicle!;
    // kahramanın yanında boş bir kara parçası
    let px = this.pos.x + Math.cos(this.heading) * 3, pz = this.pos.z - Math.sin(this.heading) * 3;
    if (!def.fly && this.wb.ground(px, pz) < 0.2) [px, pz] = [this.pos.x, this.pos.z];
    v.pos.set(px, this.carY(v, px, pz), pz);
    v.heading = this.heading;
    v.model.position.copy(v.pos);
    v.model.rotation.set(0, v.heading, 0);
    this.fx.burst(v.pos.clone().setY(v.pos.y + 1.5), 16);
    this.mount(this.myCar.spot);
  }
  get carId() {
    return this.myCar?.id ?? null;
  }
  /** Korna. */
  /** Aracın türü: korna ve motor sesi için ('' motor sesi yok). */
  private vehicleKind(): { horn: number; engine: string } {
    const v = this.drive;
    if (!v) return { horn: 0, engine: '' };
    const car = this.myCar && this.myCar.spot.vehicle === v ? this.myCar.id : '';
    if (car === 'bisiklet') return { horn: 3, engine: 'bike' };
    if (car === 'skuter') return { horn: 5, engine: 'scooter' };
    if (car === 'yaris') return { horn: 0, engine: 'race' };
    if (car === 'unicorn' || car === 'limuzin') return { horn: 4, engine: 'car' };
    if (car === 'ucan') return { horn: 4, engine: 'hover' };
    if (v.fly) return { horn: 4, engine: 'plane' };
    if (v.engine) return { horn: v.fly ? 4 : 1, engine: v.engine };
    if (!v.land) return { horn: 2, engine: 'boat' };
    if (car === 'jip' || car === 'karavan' || car === 'traktor' || car === 'kamyonet' || car === 'otobus') return { horn: 1, engine: 'truck' };
    return { horn: 0, engine: 'car' };
  }
  honk() {
    if (this.drive?.hornFx) return this.ev.sound.fx?.(this.drive.hornFx);
    const k = this.vehicleKind().horn;
    this.ev.sound.fx?.('horn', k);
    // araba kornası: kısa ve uzun ("bip-biiip")
    if (k <= 1) setTimeout(() => this.ev.sound.fx?.('horn', k), 420);
  }
  private carY(v: { fly?: boolean; alt?: number }, x: number, z: number) {
    const g = this.groundAt(x, z);
    return v.fly ? Math.max(g, 0) + (v.alt ?? 2.2) : this.realm ? g : Math.max(g, -0.2);
  }
  /** Zemin: adada arazi, bir dünyada (Mars) dünyanın zemini. */
  private groundAt(x: number, z: number) {
    if (this.realm) {
      const f = this.realm.floor(x, z, 1e4);
      return Number.isFinite(f) ? f : -1e9;
    }
    return this.wb.ground(x, z);
  }
  /** Bir engelin içinde kalındıysa en yakın boş yere çık (eşyanın, aracın içine düşülmesin). */
  private unstick() {
    if (!this.blockedAt(this.pos.x, this.pos.z, this.pos.y)) return;
    for (let r = 0.6; r <= 9; r += 0.6) {
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 10) {
        const x = this.pos.x + Math.cos(a) * r, z = this.pos.z + Math.sin(a) * r;
        const f = this.floorAt(x, z, this.pos.y + 1);
        if (!Number.isFinite(f) || f < -0.5 && !this.realm) continue;
        if (this.blockedAt(x, z, f)) continue;
        this.pos.set(x, f, z);
        return;
      }
    }
  }
  /** Haritadan hızlı gidiş. */
  teleport(x: number, z: number) {
    if (this.act) return;
    if (this.realm) this.leaveRealm();
    if (this.drive) this.dismount();
    this.pos.set(x, this.wb.ground(x, z), z);
    this.hero.vy = 0;
    this.vel.set(0, 0, 0);
    this.target = null;
    this.pending = null;
    if (this.pet) this.petPos.set(x + 1.5, 0, z + 1);
    this.camera.position.set(x + Math.sin(this.camYaw) * 13, this.pos.y + 8, z + Math.cos(this.camYaw) * 13);
  }

  // ----------------------------------------------------------------------------------------------
  // İnşa
  // ----------------------------------------------------------------------------------------------
  setBuildMode(on: boolean) {
    this.building = on;
    this.home.build.setEditing(on);
    if (on) {
      this.target = null;
      this.pending = null;
    }
  }
  setTool(t: Tool) {
    this.tool = t;
  }
  /** Buraya yapı (blok, çiftlik) kurulabilir mi? Kurulamazsa nedeni. */
  canBuildAt(x: number, z: number, farm = false): string | null {
    if (this.wb.ground(x, z) < 0.3 || isWater(x, z)) return 'Suya yapı yapılamaz.';
    if (Math.hypot(x, z) > WORLD_R - 30) return 'Kıyıya bu kadar yakın yapılamaz.';
    if (!this.grid.free(x, z, 0.3)) return 'Burada başka bir şey var.';
    for (const s of this.wb.spots) {
      if (s.vehicle || (farm && /^(field:|pen:|kitchen)/.test(s.id))) continue;
      if (Math.hypot(s.x - x, s.z - z) < Math.max(3.2, s.r + 0.6)) return 'Burası bir oyun yerinin önü; biraz öteye yap.';
    }
    return null;
  }
  /** Çiftlik yapısı kur: alan boş, düz ve karada olmalı. */
  private placeStructAt(k: PlaceKind, x: number, z: number) {
    const r = struct(k).r;
    const g0 = this.wb.ground(x, z);
    for (let i = 0; i <= 8; i++) {
      const a = (i / 8) * Math.PI * 2, rr = i ? r * 0.85 : 0;
      const px = x + Math.cos(a) * rr, pz = z + Math.sin(a) * rr;
      const err = this.canBuildAt(px, pz, true);
      if (err) return this.ev.onMessage(err);
      if (Math.abs(this.wb.ground(px, pz) - g0) > 1.6) return this.ev.onMessage('Burası çok engebeli. Daha düz bir yer seç.');
    }
    if (this.home.build.near(x, z, r)) return this.ev.onMessage('Burada blokların var. Başka bir yer seç.');
    if (!this.home.placeFree(x, z, r)) return this.ev.onMessage('Burada başka bir çiftlik yapın var.');
    const res = this.o.farm.apply((s) => placeStruct(s, k, Math.round(x * 2) / 2, Math.round(z * 2) / 2));
    if (res.err) return this.ev.onMessage(res.err);
    this.home.refresh();
    this.fx.burst(new THREE.Vector3(x, g0 + 2, z), 24);
    this.ev.sound.star(4);
    if (res.msg) this.ev.onMessage(res.msg);
    this.ev.onDone('build');
  }
  get buildMode() {
    return this.building;
  }
  private saveBuild(delta: number) {
    const str = this.home.build.save();
    this.o.farm.apply((s) => placedBlocks(s, str, delta));
  }
  private buildTap() {
    if ('struct' in this.tool) {
      const hit = this.ray.intersectObject(this.land)[0];
      if (!hit || hit.distance > 120) return this.ev.onMessage('Yere dokun.');
      return this.placeStructAt(this.tool.struct, hit.point.x, hit.point.z);
    }
    const h = this.home.build.hit(this.ray, [this.land]);
    if (!h) return this.ev.onMessage('Karada bir yere dokun.');
    const before = this.home.build.save();
    if ('erase' in this.tool) {
      if (!h.remove) {
        // blok yoksa çiftlik yapısını kaldır
        const p = this.ray.intersectObject(this.land)[0]?.point;
        const i = p ? this.home.placeAt(p.x, p.z) : -1;
        if (i < 0) return;
        const res = this.o.farm.apply((s) => removeStruct(s, i));
        if (res.err) return this.ev.onMessage(res.err);
        this.home.refresh();
        this.ev.sound.pop();
        if (res.msg) this.ev.onMessage(res.msg);
        return;
      }
      const b = this.home.build.remove(h.remove);
      if (b) {
        this.undo.push(before);
        this.fx.burst(this.home.build.cellCenter(h.remove), 8, b.color);
        this.ev.sound.pop();
        this.saveBuild(0);
      }
      return;
    }
    if (!h.place) return;
    const c: Cell = h.place;
    const err = this.home.build.place(c, this.tool.block, this.home.build.bodyCells(this.pos.x, this.pos.z, this.pos.y));
    if (err) return this.ev.onMessage(err);
    this.undo.push(before);
    if (this.undo.length > 60) this.undo.shift();
    this.home.build.flash(c);
    this.fx.burst(this.home.build.cellCenter(c), 5, blockById(this.tool.block)?.color);
    this.ev.sound.pop();
    this.saveBuild(1);
    this.ev.onDone('build');
  }
  undoBuild() {
    const prev = this.undo.pop();
    if (prev === undefined) return false;
    this.home.build.load(prev);
    this.saveBuild(0);
    this.ev.sound.pop();
    return true;
  }
  /** Hazır yapı kur: altın düşer, bloklar kahramanın yakınına konur. */
  blueprint(id: string): string {
    const check = buyBlueprint(this.o.farm.get(), id);
    if (check.err) return check.err;
    const before = this.home.build.save();
    // kahramanın önünde, biraz ileride
    const at: [number, number] = [this.pos.x + Math.sin(this.heading) * 9, this.pos.z + Math.cos(this.heading) * 9];
    const n = this.home.build.placeBlueprint(blueprintParts(id), at, this.home.build.bodyCells(this.pos.x, this.pos.z, this.pos.y));
    if (!n) return 'Burada yeterli boş ve düz yer yok. Çayır gibi geniş bir yere git!';
    this.undo.push(before);
    const str = this.home.build.save();
    const r = this.o.farm.apply((s) => {
      const b = buyBlueprint(s, id);
      return b.err ? b : { ...placedBlocks(b.s, str, n), msg: b.msg };
    });
    this.fx.burst(new THREE.Vector3(at[0], this.wb.ground(...at) + 4, at[1]), 30);
    this.ev.sound.star(5);
    this.ev.onDone('build');
    return r.err ?? r.msg ?? '';
  }
  /** Çiftlik durumu React'ta değişti (pazarda alınan hayvan…): görüntüyü yenile. */
  farmChanged() {
    this.home.refresh();
  }
  /** Evin çocuğun verdiği adı: evin önündeki tabelaya yazılır (boşsa "Evim"). */
  setHomeName(name: string) {
    this.wb.homeName = name;
    this.wb.setHomeSign?.(name);
  }
  /** Evim açılınca ada durur (aynı çizici evde kullanılır). */
  get gl() {
    return this.renderer;
  }
  suspend() {
    this.ev.sound.engine?.(-1, '');
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.resizeObs.disconnect();
  }
  resume() {
    if (this.raf) return;
    this.resizeObs.observe(this.canvas);
    this.resize();
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  /** Arkadaşın adasında onun çiftliği ve yapıları gösterilir (null: kendi çiftliğim). */
  setHomeView(bridge: FarmBridge | null, guest: string | null) {
    this.home.setBridge(bridge ?? this.o.farm, guest);
  }
  /** Kendi çiftliğimin paylaşılacak özeti (arkadaşlar görür). */
  homeSnapshot(): string {
    const s: FarmState = this.o.farm.get();
    return JSON.stringify({ b: s.build, f: s.fields.map((f) => [f.c ?? '', f.w ?? 0]), a: s.animals.map((a) => [a.k, a.fed ?? 0]), p: s.places.map((p) => [p.k, p.x, p.z]) });
  }

  // ----------------------------------------------------------------------------------------------
  // Macera kapıları
  // ----------------------------------------------------------------------------------------------
  /** Labirent tohumu (aynı odadaki arkadaşlar aynı labirenti görür). */
  setSeed(seed: number) {
    this.seed = seed >>> 0;
  }
  enterRealm(id: RealmId, back?: { x: number; z: number; h: number }) {
    if (this.realm) return;
    this.realmBack.copy(this.pos);
    this.realmReturn = back ?? null;
    if (this.drive) this.dismount();
    const realm = makeRealm(id, {
      progress: (t) => this.ev.onRealmProgress?.(t),
      msg: (t) => this.ev.onMessage(t),
      finish: (bonus, text) => {
        this.ev.onRealmFinish?.(id, bonus, text);
        this.ev.onDone(id);
      },
      sound: { star: (i) => this.ev.sound.star(i), pop: () => this.ev.sound.pop(), note: (i) => this.ev.sound.note(i), fx: (n, i) => this.ev.sound.fx?.(n, i), whoosh: () => this.ev.sound.whoosh?.() },
      leave: () => this.leaveRealm(),
    }, this.seed);
    this.realm = realm;
    if (this.building) this.setBuildMode(false);
    this.moveActors(realm.scene);
    // arkadaşlar üst üste doğmasın: başlangıç noktası biraz kayar
    this.pos.copy(realm.spawn).add(new THREE.Vector3((Math.random() - 0.5) * 3, 0, (Math.random() - 0.5) * 1.5));
    this.unstick();
    this.heading = realm.spawnH;
    this.camYaw = this.camYawGoal = realm.spawnH + Math.PI;
    this.hero.vy = 0;
    this.hero.grounded = true;
    this.vel.set(0, 0, 0);
    this.target = null;
    this.pending = null;
    this.petPos.copy(this.pos).add(new THREE.Vector3(1.5, 0, 1));
    this.camera.position.set(this.pos.x + Math.sin(this.camYaw) * 13, this.pos.y + 8, this.pos.z + Math.cos(this.camYaw) * 13);
    this.setNear(null);
    if (realm.helmet) this.wearHelmet(true);
    this.ev.onRealm?.({ id, name: realm.name || realmName(id), goal: realm.goal, leave: realm.leave, icon: realm.icon });
  }
  /** Uzay kaskı (Mars). */
  private wearHelmet(on: boolean) {
    if (!on) {
      this.helmet?.removeFromParent();
      return;
    }
    this.helmet ??= spaceHelmet();
    this.avatar.head.add(this.helmet);
  }
  leaveRealm() {
    const r = this.realm;
    if (!r) return;
    if (this.act) {
      this.act = null;
      this.ev.onBusy(false);
    }
    this.realm = null;
    this.wearHelmet(false);
    this.moveActors(this.scene);
    disposeScene(r.scene);
    r.dispose();
    // kapının önüne dön
    const back = this.realmBack, ret = this.realmReturn;
    const [x, z, h] = ret ? [ret.x, ret.z, ret.h] : [back.x + 2.5, back.z, Math.PI / 2];
    this.pos.set(x, this.wb.ground(x, z), z);
    this.heading = h;
    this.hero.vy = 0;
    this.hero.grounded = true;
    this.petPos.copy(this.pos).add(new THREE.Vector3(1.5, 0, 1));
    this.camYaw = this.camYawGoal = h + Math.PI;
    this.camera.position.set(this.pos.x + Math.sin(this.camYaw) * 12, this.pos.y + 8, this.pos.z + Math.cos(this.camYaw) * 12);
    this.setNear(null);
    this.ev.onRealm?.(null);
  }
  get realmId(): RealmId | null {
    return this.realm?.id ?? null;
  }
  private moveActors(to: THREE.Scene) {
    to.add(this.avatar.root, this.shadow);
    if (this.pet) to.add(this.pet);
    for (const r of this.remotes.values()) to.add(r.av.root, r.tag);
  }

  // ----------------------------------------------------------------------------------------------
  // Döngü
  // ----------------------------------------------------------------------------------------------
  private frame = (now: number) => {
    const raw = (now - this.last) / 1000;
    const dt = Math.min(0.05, raw);
    this.last = now;
    this.clock += dt;
    this.coyote -= dt;
    this.jumpBuf -= dt;
    if ((this.cullT -= dt) <= 0) {
      this.cullT = 0.3;
      if (!this.realm) this.cull();
    }
    // kare hızı düşükse çözünürlüğü azalt, yüksekse geri artır (ilk saniyeler gölgelendirici hazırlığı: sayma)
    if (this.clock > 4) {
      this.fpsT += raw;
      this.fpsN++;
      if (this.fpsT > 2) {
        const fps = this.fpsN / this.fpsT;
        const r = fps < 38 ? Math.max(1, this.ratio - 0.25) : fps > 56 ? Math.min(this.maxRatio, this.ratio + 0.25) : this.ratio;
        if (r !== this.ratio) {
          this.ratio = r;
          this.renderer.setPixelRatio(r);
          this.resize();
        }
        this.fpsT = 0;
        this.fpsN = 0;
      }
    }
    if (this.act) this.stepActivity(dt);
    else if (this.drive) this.stepDrive(dt);
    else this.stepWalk(dt);
    if (this.engineOn && !this.drive) {
      this.engineOn = false;
      this.ev.sound.engine?.(-1, '');
    }
    if (this.realm) {
      const out = this.realm.update(dt, this.clock, this.hero);
      if (out) this.leaveRealm();
    } else {
      this.stepWorld(dt);
      // bloklardan yapılan kapılar: yaklaşınca açılır
      this.home.build.stepDoors(this.pos.x, this.pos.z, dt);
    }
    this.draw(dt);
    this.raf = requestAnimationFrame(this.frame);
  };

  private moveDir(): { dir: THREE.Vector3; mag: number } {
    if (this.joy.lengthSq() > 0.01) {
      const f = new THREE.Vector3(-Math.sin(this.camYaw), 0, -Math.cos(this.camYaw));
      const r = new THREE.Vector3(Math.cos(this.camYaw), 0, -Math.sin(this.camYaw));
      const dir = f.multiplyScalar(this.joy.y).add(r.multiplyScalar(this.joy.x));
      return { dir: dir.normalize(), mag: Math.min(1, this.joy.length()) };
    }
    if (this.target) {
      const d = this.target.clone().sub(this.pos).setY(0);
      const l = d.length();
      const sp = this.pending ? this.live.find((s) => s.id === this.pending) : null;
      if (sp ? this.spotDist(sp, this.pos.x, this.pos.z) < 0.8 || l < 0.4 : l < 0.4) {
        this.target = null;
        if (sp) {
          this.pending = null;
          this.activity(sp.id);
        }
        return { dir: d, mag: 0 };
      }
      return { dir: d.normalize(), mag: l > 25 ? 1 : 0.9 };
    }
    return { dir: new THREE.Vector3(), mag: 0 };
  }

  private turnTo(h: number, dt: number, rate = 10) {
    this.heading += angDiff(h, this.heading) * Math.min(1, dt * rate);
  }

  private stepWalk(dt: number) {
    const { dir, mag } = this.moveDir();
    const g = this.realm ? 0 : this.wb.ground(this.pos.x, this.pos.z);
    this.swimming = !this.realm && g < -0.7 && this.pos.y < 0;
    const run = mag > 0.95 && !this.swimming;
    const sp = mag <= 0 ? 0 : (run ? RUN : WALK * mag) * (this.swimming ? 0.55 : 1) * Math.sqrt(this.realm?.heroScale ?? 1);
    // hız yumuşakça hızlanır / yavaşlar (havadayken daha az kontrol)
    const want = dir.clone().multiplyScalar(sp);
    const k = 1 - Math.exp(-dt * (mag > 0 ? (this.hero.grounded ? 10 : 4) : this.hero.grounded ? 14 : 2));
    this.vel.x += (want.x - this.vel.x) * k;
    this.vel.z += (want.z - this.vel.z) * k;
    const v = Math.hypot(this.vel.x, this.vel.z);
    this.speed = v < WALK ? v / WALK : 1 + ((v - WALK) / (RUN - WALK)) * 0.3;
    if (v > 0.05) {
      const next = this.pos.clone().addScaledVector(this.vel, dt);
      if (!this.realm) {
        this.grid.push(next);
        const R = Math.hypot(next.x, next.z);
        if (R > WORLD_R) next.multiplyScalar(WORLD_R / R);
      }
      // duvarlar (bloklar, labirent): eksen eksen dene, duvar boyunca kayar. Bir engelin içinde kalındıysa
      // (ör. eşyanın içine düşüldü) engel yok sayılır ki dışarı yürünebilsin.
      const stuck = this.blockedAt(this.pos.x, this.pos.z, this.pos.y);
      if (stuck || !this.blockedAt(next.x, this.pos.z, this.pos.y)) this.pos.x = next.x;
      else this.vel.x = 0;
      if (stuck || !this.blockedAt(this.pos.x, next.z, this.pos.y)) this.pos.z = next.z;
      else this.vel.z = 0;
      const before = this.heading;
      if (mag > 0) this.turnTo(Math.atan2(dir.x, dir.z), dt, run ? 8 : 11);
      // dönüşte yana yatar
      const turn = angDiff(this.heading, before) / Math.max(dt, 1e-3);
      this.lean += (Math.max(-0.2, Math.min(0.2, -turn * 0.045 * Math.min(1, v / WALK))) - this.lean) * Math.min(1, dt * 8);
      // ilerlerken kamera yavaşça arkaya geçer (geri gelirken değil)
      if (this.clock - this.lastDrag > 1.5 && this.joy.y > -0.3 && mag > 0) this.camYawGoal += angDiff(this.heading + Math.PI, this.camYawGoal) * Math.min(1, dt * 1.2 * Math.min(1, v / WALK));
      // koşarken toz
      if (run && this.hero.grounded && !this.swimming && (this.dustT -= dt) <= 0) {
        this.dustT = 0.12;
        this.fx.burst(this.pos.clone().setY(this.pos.y + 0.15), 1, '#e9dcc4');
      }
    } else this.lean += (0 - this.lean) * Math.min(1, dt * 8);
    // dikey: yerçekimi, zıplama, yokuşlar
    const f = this.floorAt(this.pos.x, this.pos.z, this.pos.y);
    if (this.swimming) {
      this.pos.y += (-0.55 - this.pos.y) * Math.min(1, dt * 14);
      this.hero.vy = 0;
      this.hero.grounded = true;
    } else if (this.hero.grounded && this.hero.vy <= 0 && f > this.pos.y - 0.7 && f < this.pos.y + 0.5) {
      this.pos.y += (f - this.pos.y) * Math.min(1, dt * 14);
    } else {
      this.hero.vy -= GRAVITY * (this.realm?.gravity ?? 1) * dt;
      this.pos.y += this.hero.vy * dt;
      if (this.pos.y <= f && this.hero.vy <= 0) {
        if (this.hero.vy < -14) this.fx.burst(this.pos.clone().setY(f + 0.2), 6, '#ffffff');
        if (this.hero.vy < -8) this.squash = Math.min(0.18, -this.hero.vy * 0.008);
        this.pos.y = f;
        this.hero.vy = 0;
        this.hero.grounded = true;
        if (this.jumpBuf > 0) this.doJump();
      } else {
        if (this.hero.grounded) this.coyote = 0.12; // kenardan düştü: kısa süre hâlâ zıplayabilir
        this.hero.grounded = false;
        // kafa bloğa çarpınca geri düş
        if (this.hero.vy > 0 && this.blockedAt(this.pos.x, this.pos.z, this.pos.y - 0.2)) this.hero.vy = 0;
      }
    }
    if (this.realm) return this.scanNear();
    if (this.swimming) {
      this.swimTime += dt;
      if (this.swimTime > 8 && this.swimTime - dt <= 8) {
        this.ev.onDone('swim');
        this.ev.onMessage('Harika yüzüyorsun!');
      }
      if (mag > 0 && Math.random() < dt * 3) this.sparkles.burst(this.pos.clone().setY(0.1), 2, '#ffffff');
    }
    for (const s of this.stars) {
      if (s.taken) continue;
      if (Math.hypot(s.obj.position.x - this.pos.x, s.obj.position.z - this.pos.z) < 1.5 && Math.abs(s.obj.position.y - this.pos.y - 1.4) < 2.5) {
        s.taken = true;
        s.obj.visible = false;
        this.sparkles.burst(s.obj.position.clone(), 12);
        this.ev.sound.star(this.stars.filter((x) => x.taken).length);
        this.ev.onStar(s.id);
      }
    }
    this.stepMusic();
    this.scanNear();
  }

  /** Adadaki ya da içinde bulunulan dünyadaki mekânlar. */
  private get live(): SpotDef[] {
    return this.realm ? this.realm.spots : this.spots;
  }

  /** En yakın mekân (kendi yarıçapı içinde): eylem düğmesi. */
  private scanNear() {
    let near: SpotDef | null = null, best = Infinity, label = '';
    if (this.clock > this.nearQuietUntil) for (const s of this.live) {
      const d = this.spotDist(s, this.pos.x, this.pos.z);
      if (d >= 1 || d >= best) continue;
      const l = s.dyn ? s.dyn() : s.label;
      if (l === null) continue;
      [near, best, label] = [s, d, l];
    }
    this.setNear(near, label);
  }

  private setNear(s: SpotDef | null, label = '') {
    if (s?.id === this.near?.id && label === this.nearLabel) return;
    this.near = s;
    this.nearLabel = label;
    this.ev.onNear(s ? { id: s.id, pos: new THREE.Vector3(s.x, 0, s.z), r: s.r, label } : null);
  }

  private stepMusic() {
    let on = -1;
    for (const t of this.wb.musicTiles) if (Math.abs(this.pos.x - t.x) < 0.9 && Math.abs(this.pos.z - t.z) < 1.4 && this.hero.grounded) on = t.note;
    if (on === this.musicLast) return;
    this.musicLast = on;
    if (on < 0) return;
    this.ev.sound.note(on);
    const t = this.wb.musicTiles[on];
    const m = t.mesh.material as THREE.MeshToonMaterial;
    m.emissive.set('#555555');
    setTimeout(() => m.emissive.set('#000000'), 260);
    this.sparkles.burst(new THREE.Vector3(t.x, this.pos.y + 0.6, t.z), 4);
    this.musicPlayed.add(on);
    if (this.musicPlayed.size === 6) {
      this.ev.onDone('music');
      this.ev.onMessage('Ne güzel bir şarkı!');
    }
  }

  private stepDrive(dt: number) {
    const v = this.drive!;
    const { dir, mag } = this.moveDir();
    this.engineOn = true;
    this.ev.sound.engine?.(mag, this.vehicleKind().engine);
    v.update?.(dt, mag, this.clock);
    const h0 = v.heading;
    if (mag > 0) {
      v.heading += angDiff(Math.atan2(dir.x, dir.z), v.heading) * Math.min(1, dt * (v.bank ? 1.8 : 3));
      const f = new THREE.Vector3(Math.sin(v.heading), 0, Math.cos(v.heading));
      const next = v.pos.clone().addScaledVector(f, v.speed * mag * dt);
      if (v.land && this.realm) {
        // bir dünyada (Mars): zeminin ve engellerin içinden geçmez
        const ahead = next.clone().addScaledVector(f, 1.6);
        if (this.groundAt(next.x, next.z) > -1e8 && !this.realm.blocked(ahead.x, ahead.z, v.pos.y) && !this.realm.blocked(next.x, next.z, v.pos.y)) v.pos.set(next.x, v.pos.y, next.z);
        for (const w of v.model.children) if (w.name === 'wheel') w.rotation.x += v.speed * mag * dt * 1.6;
      } else if (v.land) {
        // karada: suya girmez, engellerden ve bloklardan geçmez
        this.grid.push(next, 1.3);
        if (this.wb.ground(next.x, next.z) > 0.05 && Math.hypot(next.x, next.z) < WORLD_R && !this.home.build.blocked(next.x, next.z, v.pos.y)) v.pos.set(next.x, v.pos.y, next.z);
        for (const w of v.model.children) if (w.name === 'wheel') w.rotation.x += v.speed * mag * dt * 1.6;
      } else if (v.fly) {
        if (Math.hypot(next.x, next.z) < WORLD_R) v.pos.set(next.x, v.pos.y, next.z);
      } else if ((isWater(next.x, next.z) && this.wb.ground(next.x, next.z) < -0.4) && Math.hypot(next.x, next.z) < WORLD_R) v.pos.copy(next);
      if (Math.random() < dt * 8) this.sparkles.burst(v.pos.clone().addScaledVector(f, -1.5).setY(v.land ? v.pos.y + 0.3 : v.fly ? v.pos.y - 0.2 : 0.2), 2, v.fly ? '#ffd1e8' : '#ffffff');
      if (this.clock - this.lastDrag > 1.2) this.camYawGoal += angDiff(v.heading + Math.PI, this.camYawGoal) * Math.min(1, dt * 1.5);
    }
    if (v.land || v.fly) {
      // yokuşlarda burun yukarı / aşağı
      const f = new THREE.Vector3(Math.sin(v.heading), 0, Math.cos(v.heading));
      const ty = this.carY(v, v.pos.x, v.pos.z) + (v.fly ? Math.sin(this.clock * 2) * 0.25 : 0);
      const climb = ty - v.pos.y;
      // uçak yavaşça kalkar ve alçalır; araba yere hemen oturur
      v.pos.y += climb * Math.min(1, dt * (v.alt && v.alt > 5 ? 0.9 : 10));
      let pitch = v.fly ? 0 : -Math.atan2(this.groundAt(v.pos.x + f.x * 1.5, v.pos.z + f.z * 1.5) - this.groundAt(v.pos.x - f.x * 1.5, v.pos.z - f.z * 1.5), 3);
      if (v.bank) pitch = -Math.max(-0.35, Math.min(0.35, climb * 0.05));
      // dönerken yana yatma (uçak)
      const roll = v.bank ? Math.max(-0.6, Math.min(0.6, (-angDiff(v.heading, h0) / Math.max(dt, 1e-3)) * 0.35)) : 0;
      v.model.position.copy(v.pos);
      v.model.rotation.set(pitch, v.heading, (v.model.rotation.z + (roll - v.model.rotation.z) * Math.min(1, dt * 4)), 'YXZ');
      this.speed = 0;
      if (v.seat) {
        v.model.updateMatrixWorld();
        this.pos.copy(v.model.localToWorld(new THREE.Vector3(...v.seat)));
      } else this.pos.set(v.pos.x, v.pos.y + v.seatY, v.pos.z);
      this.heading = v.heading;
      return;
    }
    this.speed = 0;
    v.pos.y = Math.sin(this.clock * 2 + v.pos.x) * 0.08;
    v.model.position.copy(v.pos);
    const lean = Math.max(-0.2, Math.min(0.2, -angDiff(v.heading, h0) / Math.max(dt, 1e-3) * 0.12));
    v.model.rotation.set(Math.sin(this.clock * 1.7) * 0.03, v.heading, v.model.rotation.z + (lean + Math.sin(this.clock * 1.3) * 0.04 - v.model.rotation.z) * Math.min(1, dt * 4), 'YXZ');
    if (v.seat) {
      v.model.updateMatrixWorld();
      this.pos.copy(v.model.localToWorld(new THREE.Vector3(...v.seat)));
    } else this.pos.set(v.pos.x, v.pos.y + v.seatY, v.pos.z);
    this.heading = v.heading;
  }

  private stepActivity(dt: number) {
    const a = this.act!;
    a.t += dt;
    const u = Math.min(1, a.t / a.def.dur);
    this.actor.heading = this.heading;
    a.def.step(a.t, u, this.actor, dt);
    const hs = this.realm?.heroScale ?? 1;
    if (hs < 1) {
      const p = typeof a.def.pose === 'function' ? a.def.pose(u) : a.def.pose;
      if (p === 'sit' || p === 'drive') this.pos.y += 0.9 * (1 - hs);
    }
    this.heading = this.actor.heading;
    if (u < 1) return;
    const r0 = this.realm;
    const msg = a.def.end?.(this.actor);
    if (this.realm === r0) this.heading = this.actor.heading;
    this.act = null;
    if (a.def.underwater) this.setUnderwater(false);
    this.ev.onBusy(false);
    // etkinlik bir dünyaya girip çıkardıysa (kapı, roket) yeri o ayarladı
    if (this.realm !== r0) {
      if (msg) this.ev.onMessage(msg);
      return;
    }
    if (this.realm) {
      const f = this.realm.floor(this.pos.x, this.pos.z, this.pos.y + 0.5);
      if (Number.isFinite(f)) this.pos.y = Math.max(f, Math.min(this.pos.y, f + 0.4));
      this.unstick();
    } else {
      // etkinlik bitince kahraman yere (ya da suya) iner
      const g = this.wb.ground(this.pos.x, this.pos.z);
      if (Math.abs(this.pos.y - g) > 0.4) {
        if (g < -0.7) this.pos.y = -0.55;
        else this.pos.set(a.spot.x, this.wb.ground(a.spot.x, a.spot.z), a.spot.z);
      }
    }
    if (msg) this.ev.onMessage(msg);
    this.ev.onDone(a.def.quest ?? a.spot.id);
    this.fx.burst(this.pos.clone().setY(this.pos.y + 2), 14);
  }

  private setUnderwater(on: boolean) {
    this.underwater = on;
    const fog = this.scene.fog as THREE.Fog;
    const c = on ? DEEP : SKY;
    (this.scene.background as THREE.Color).copy(c);
    fog.color.copy(c);
    fog.near = on ? 2 : 140;
    fog.far = on ? 40 : 420;
    (this.sea.material as THREE.Material).side = on ? THREE.DoubleSide : THREE.FrontSide;
  }

  private stepWorld(dt: number) {
    this.water.offset.x += dt * 0.02;
    for (const s of this.stars) if (!s.taken) s.obj.rotation.y += dt * 2;
    for (const f of this.wb.ticks) f(dt, this.clock, this.actor);
    this.home.update(dt, this.clock);
    // araçlar: binilmeyenler suda sallanır
    for (const s of this.spots) {
      const v = s.vehicle;
      if (!v || v.land || v.fly || v === this.drive) continue;
      v.pos.y = Math.sin(this.clock * 2 + v.pos.x) * 0.08;
      v.model.position.copy(v.pos);
      v.model.rotation.y = v.heading;
    }
    // dolaşan hayvanlar (yakındakiler)
    const camRight = new THREE.Vector3(Math.cos(this.camYaw), 0, -Math.sin(this.camYaw));
    for (const w of this.wb.wanderers) {
      if (w.pos.distanceToSquared(this.pos) > 160 * 160) continue;
      w.wait -= dt;
      const d = w.target.clone().sub(w.pos).setY(0);
      if (w.wait <= 0 && d.length() < 0.3) {
        w.wait = 1.5 + Math.random() * 4;
        const a = Math.random() * Math.PI * 2, r = Math.random() * w.range;
        w.target.set(w.home[0] + Math.cos(a) * r, 0, w.home[1] + Math.sin(a) * r);
        if (isWater(w.target.x, w.target.z)) w.target.copy(w.pos);
      }
      const moving = w.wait <= 0 && d.length() > 0.3;
      if (moving) {
        d.normalize();
        w.pos.addScaledVector(d, w.speed * dt);
        this.grid.push(w.pos, 0.5);
        w.hop += dt * 10;
        if (w.card) {
          const side = d.dot(camRight);
          if (Math.abs(side) > 0.2) w.facing = side > 0 ? 1 : -1;
        } else w.obj.rotation.y = Math.atan2(d.x, d.z);
      }
      w.obj.position.set(w.pos.x, this.wb.ground(w.pos.x, w.pos.z) + (moving ? Math.abs(Math.sin(w.hop)) * 0.25 : 0), w.pos.z);
      if (w.card) w.obj.scale.x = w.facing;
    }
    // kâğıt kartlar kameraya döner
    const p = new THREE.Vector3();
    for (const c of this.wb.cards) {
      c.getWorldPosition(p);
      c.rotation.y = Math.atan2(this.camera.position.x - p.x, this.camera.position.z - p.z);
    }
    this.sparkles.update(dt);
    this.posTimer -= dt;
    if (this.posTimer <= 0) {
      this.posTimer = 0.25;
      this.ev.onPos(this.pos.x, this.pos.z, this.heading);
    }
  }

  private pose(): Pose {
    if (this.act) {
      const p = this.act.def.pose;
      return typeof p === 'function' ? p(this.act.t / this.act.def.dur) : p;
    }
    if (this.drive) return 'drive';
    if (this.swimming) return 'swim';
    if (!this.hero.grounded) return 'jump';
    if (this.emoteKind && this.clock < this.emoteUntil) return this.emoteKind;
    this.emoteKind = null;
    return this.avatar.hand.getObjectByName('held') ? 'hold' : 'walk';
  }

  private draw(dt: number) {
    const pose = this.pose();
    this.lastPose = pose;
    this.drawRemotes(dt);
    this.avatar.root.position.copy(this.pos);
    this.avatar.root.rotation.y = this.heading;
    this.avatar.root.rotation.z = this.act || this.drive ? 0 : this.lean;
    this.squash += (0 - this.squash) * Math.min(1, dt * 10);
    const hs = this.realm?.heroScale ?? 1;
    this.avatar.root.scale.set(hs * (1 + this.squash * 0.5), hs * (1 - this.squash), hs * (1 + this.squash * 0.5));
    this.avatar.update(dt, this.clock, pose, this.act ? (pose === 'climb' ? 0.8 : 0) : this.speed);
    const g = this.floorAt(this.pos.x, this.pos.z, this.pos.y + 0.1);
    this.shadow.visible = !this.swimming && !this.drive && Number.isFinite(g) && this.pos.y - g < 8 && (this.realm ? true : g > -0.3);
    this.shadow.position.set(this.pos.x, g + 0.06, this.pos.z);
    const sk = 1 / (1 + Math.max(0, this.pos.y - g) * 0.25);
    this.shadow.scale.set(sk, sk, 1);
    // evcil hayvan: biraz arkada, zıplayarak gelir
    if (this.pet) {
      const want = this.act || this.drive
        ? new THREE.Vector3(this.act ? this.act.spot.x : this.pos.x + 2, 0, this.act ? this.act.spot.z : this.pos.z)
        : this.pos.clone().add(new THREE.Vector3(-Math.sin(this.heading) * 1.8 + Math.cos(this.heading) * 1.1, 0, -Math.cos(this.heading) * 1.8 - Math.sin(this.heading) * 1.1));
      const d = want.clone().sub(this.petPos).setY(0);
      const moving = d.length() > 0.5;
      if (d.length() > 40) this.petPos.copy(want);
      else if (moving) {
        this.petPos.addScaledVector(d, Math.min(1, dt * 4));
        this.petHop += dt * 12;
      }
      const pf = this.floorAt(this.petPos.x, this.petPos.z, this.pos.y + 0.5);
      const pg = Number.isFinite(pf) ? Math.max(this.realm ? pf : -0.4, pf) : this.pos.y;
      this.pet.position.set(this.petPos.x, pg + (moving ? Math.abs(Math.sin(this.petHop)) * 0.3 : 0), this.petPos.z);
      this.pet.rotation.y = Math.atan2(this.camera.position.x - this.petPos.x, this.camera.position.z - this.petPos.z);
    }
    // kamera (hız treninde kahramanın arkasından izler)
    if (this.act?.def.follow) this.camYawGoal = this.heading + Math.PI;
    this.camYaw += angDiff(this.camYawGoal, this.camYaw) * Math.min(1, dt * 6);
    const [d0, h0] = this.act?.def.cam ?? (this.drive ? (this.drive.cam ?? [16, 8]) : this.realm ? this.realm.cam : this.building ? [17, 13] : [13, 7.5]);
    // yukarı / aşağı bakış: kamera kahramanın çevresinde yükselir ya da alçalır
    this.camPitch += (this.camPitchGoal - this.camPitch) * Math.min(1, dt * 6);
    const R0 = Math.hypot(d0, h0), e = Math.min(1.35, Math.max(0.08, Math.atan2(h0, d0) + this.camPitch));
    const dist = R0 * Math.cos(e), h = R0 * Math.sin(e);
    const cx = this.pos.x + Math.sin(this.camYaw) * dist, cz = this.pos.z + Math.cos(this.camYaw) * dist;
    let cy = this.pos.y + h;
    if (!this.underwater && !this.realm) cy = Math.max(cy, Math.max(0, this.wb.ground(cx, cz)) + 2);
    const k = Math.min(1, dt * 6);
    this.camera.position.x += (cx - this.camera.position.x) * k;
    this.camera.position.y += (cy - this.camera.position.y) * k;
    this.camera.position.z += (cz - this.camera.position.z) * k;
    // alçaktan bakınca biraz yukarı (gökyüzüne) bakar
    this.camera.lookAt(this.pos.x, this.pos.y + 1.8 + Math.max(0, -this.camPitch) * 9, this.pos.z);
    // güneş kahramanı izler (gölgeler hep yakında net)
    if (this.realm) {
      const sun = this.realm.sun;
      sun.position.set(this.pos.x - 30, this.pos.y + 60, this.pos.z + 26);
      sun.target.position.set(this.pos.x, this.pos.y, this.pos.z);
    }
    // adada güneş (ya da ay) gökte saate göre ilerler; gökyüzü, lambalar
    this.sky.update(dt, this.pos, this.camera, !this.realm, this.underwater);
    // yağmur / kar yalnızca adanın açık havasında görünür (bina içi, Mars, su altı hariç)
    if (this.hava) {
      const gorunur = !this.realm && !this.underwater;
      this.hava.visible = gorunur;
      if (gorunur) this.hava.update(dt, this.pos, this.clock);
    }
    this.realm?.beforeRender?.(this.camera, this.pos);
    this.renderer.render(this.stage, this.camera);
    // fotoğraf modu: kare çizildikten hemen sonra tuval okunur (WebGL tamponu sonra temizlenir)
    if (this.shot) {
      const fn = this.shot;
      this.shot = null;
      this.canvas.toBlob((b) => fn(b), 'image/png');
    }
  }

  /** Bir sonraki karede ekranın fotoğrafını çeker (arayüz çizimin dışında kaldığı için temiz çıkar). */
  private shot: ((b: Blob | null) => void) | null = null;
  photo(): Promise<Blob | null> {
    return new Promise((res) => {
      this.shot = res;
      // oyun duruyorsa (örn. arka planda) bir kare zorla
      if (!this.raf) this.renderer.render(this.stage, this.camera);
    });
  }

  private resize() {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.fov = w < h ? 64 : 52;
    this.camera.updateProjectionMatrix();
  }

  // ----------------------------------------------------------------------------------------------
  // Arkadaşlar (çok oyunculu)
  // ----------------------------------------------------------------------------------------------
  /** Gönderilecek kendi durumum (konum, yön, poz, hangi dünyada). */
  liveState(): Omit<Live, 'n'> {
    // paylaşılan top durumları: son bir dakikada değiştiyse gönderilir
    const b = Date.now() - this.wb.netAt < 60_000 ? JSON.stringify(this.wb.netOut) : '';
    return { x: this.pos.x, z: this.pos.z, y: this.pos.y, h: this.heading, p: this.lastPose, w: this.away ? 'home' : this.realm?.id ?? '', v: this.myCar && this.drive === this.myCar.spot.vehicle ? this.myCar.id : '', b };
  }

  /** Odadaki arkadaşların görünüşü ve canlı durumu (sunucudan geldikçe). */
  setPeers(peers: Record<string, { look?: DollState; live?: Live }>) {
    for (const [pid, r] of this.remotes) {
      if (!peers[pid]?.live || !peers[pid]?.look) {
        r.av.root.parent?.remove(r.av.root);
        r.tag.parent?.remove(r.tag);
        r.car?.parent?.remove(r.car);
        r.av.dispose();
        this.remotes.delete(pid);
      }
    }
    for (const [pid, p] of Object.entries(peers)) {
      if (!p.look || !p.live) continue;
      const lk = JSON.stringify(p.look);
      let r = this.remotes.get(pid);
      if (r && r.look !== lk) {
        r.av.root.parent?.remove(r.av.root);
        r.tag.parent?.remove(r.tag);
        r.car?.parent?.remove(r.car);
        r.av.dispose();
        r = undefined;
      }
      if (!r) {
        const av = new Avatar3D(p.look);
        const tag = nameTag(p.live.n || 'Arkadaşın');
        this.stage.add(av.root, tag);
        const v = new THREE.Vector3(p.live.x, p.live.y ?? this.wb.ground(p.live.x, p.live.z), p.live.z);
        r = { av, tag, look: lk, pos: v.clone(), target: v, h: p.live.h, th: p.live.h, pose: p.live.p as Pose, speed: 0, seen: this.clock, w: p.live.w ?? '', car: null, carId: '' };
        this.remotes.set(pid, r);
      }
      const w = p.live.w ?? '';
      if (w !== r.w) r.pos.set(p.live.x, p.live.y, p.live.z);
      // arkadaşın top hamleleri (futbol, basket): değişen her oyun durumu oyuna verilir
      if (p.live.b && p.live.b !== r.net) {
        r.net = p.live.b;
        try {
          const all = JSON.parse(p.live.b) as Record<string, Record<string, unknown>>;
          for (const [k, d] of Object.entries(all)) {
            const sig = `${k}:${d.s}`;
            if (r.netSeen?.[k] === sig) continue;
            (r.netSeen ??= {})[k] = sig;
            if (w === '') (this.wb.netIn[k] as ((d: unknown, from: string) => void) | undefined)?.(d, pid);
          }
        } catch {
          /* bozuk paket: yok say */
        }
      }
      r.w = w;
      r.target.set(p.live.x, p.live.y ?? this.wb.ground(p.live.x, p.live.z), p.live.z);
      r.th = p.live.h;
      r.pose = (p.live.p as Pose) || 'walk';
      r.seen = this.clock;
      // arkadaşın arabası
      const cid = carDef(p.live.v ?? '') ? p.live.v! : '';
      if (cid !== r.carId) {
        r.car?.parent?.remove(r.car);
        r.car = cid ? carModel(cid) : null;
        if (r.car) this.stage.add(r.car);
        r.carId = cid;
      }
    }
  }

  /** Bir arkadaşın yanına git (odaya katılınca). */
  goToPeer(pid: string) {
    const r = this.remotes.get(pid);
    if (!r) return false;
    if (r.w) return true; // macera dünyasında: adada bekle
    this.teleport(r.target.x + 2, r.target.z + 1.5);
    return true;
  }

  private drawRemotes(dt: number) {
    const here = this.realm?.id ?? '';
    for (const r of this.remotes.values()) {
      const vis = r.w === here;
      r.av.root.visible = r.tag.visible = vis;
      if (!vis) continue;
      const d = r.target.clone().sub(r.pos);
      if (d.length() > 30) r.pos.copy(r.target);
      else r.pos.addScaledVector(d, Math.min(1, dt * 8));
      const v = Math.hypot(d.x, d.z);
      r.speed += (Math.min(1.3, v / 1.2) - r.speed) * Math.min(1, dt * 6);
      r.h += angDiff(r.th, r.h) * Math.min(1, dt * 10);
      r.av.root.position.copy(r.pos);
      r.av.root.rotation.y = r.h;
      r.av.update(dt, this.clock, r.pose, r.pose === 'walk' || r.pose === 'hold' ? r.speed : r.pose === 'climb' ? 0.8 : 0);
      r.tag.position.set(r.pos.x, r.pos.y + 4.1, r.pos.z);
      if (r.car) {
        r.car.visible = vis;
        const st = (r.car.userData.seat as [number, number, number] | undefined) ?? [0, carDef(r.carId)?.seatY ?? 0.8, 0];
        r.car.rotation.y = r.h;
        r.car.position.set(r.pos.x, r.pos.y, r.pos.z).sub(new THREE.Vector3(...st).applyAxisAngle(new THREE.Vector3(0, 1, 0), r.h));
      }
    }
  }

  /** Test/geliştirme: mekânların listesi ve durum. */
  get spotList() {
    return this.spots.map((s) => ({ id: s.id, x: s.vehicle ? s.vehicle.pos.x : s.x, z: s.vehicle ? s.vehicle.pos.z : s.z, label: s.dyn?.() ?? s.label }));
  }
  get busy() {
    return !!this.act;
  }
  /** Test: kahramanın durumu. */
  get heroState() {
    return { x: this.pos.x, y: this.pos.y, z: this.pos.z, grounded: this.hero.grounded, realm: this.realm?.id ?? null };
  }

  dispose() {
    this.ev.sound.engine?.(-1, '');
    cancelAnimationFrame(this.raf);
    this.resizeObs.disconnect();
    this.avatar.dispose();
    this.hava?.dispose();
    for (const r of this.remotes.values()) r.av.dispose();
    if (this.realm) {
      disposeScene(this.realm.scene);
      this.realm.dispose();
    }
    this.home.build.dispose();
    disposeScene(this.scene);
    this.renderer.dispose();
  }
}
