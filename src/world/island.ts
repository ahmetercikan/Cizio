/**
 * Çizio Adası: büyük, 3B, tek kişilik oyun dünyası (eski adanın ~20 katı).
 *
 * Kahraman Giydir karakterinin 3B hâli (src/world/avatar3d.ts): yürüdüğü yöne döner, koşar, yüzer, araç sürer.
 * Arazi src/world/terrain.ts, bölgeler ve etkinlikler src/world/zones.ts, harita verisi src/world/layout.ts.
 * React tarafı (src/pages/World.tsx) yalnızca girdi verir ve olayları dinler.
 */
import * as THREE from 'three';
import { cloud, disposeScene, makeRenderer, Sparkles, star } from '../play3d/kit';
import { Avatar3D, type Pose } from './avatar3d';
import type { DollState } from '../dressup/catalog';
import { isWater, WORLD_R } from './layout';
import { petCard } from './puppet';
import { BlockGrid, buildHorizon, buildTerrain, buildVegetation } from './terrain';
import { buildZones, starPlaces, WorldBuilder, type Activity, type SpotDef, type Vehicle } from './zones';
import type { Live } from '../online/rt';

/** Adadaki bir arkadaş (çok oyunculu). */
interface Remote { av: Avatar3D; tag: THREE.Sprite; look: string; pos: THREE.Vector3; target: THREE.Vector3; h: number; th: number; pose: Pose; speed: number; seen: number }

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

export interface IslandEvents {
  onNear: (s: Spot | null) => void;
  onStar: (id: string) => void;
  /** Bir görev / etkinlik tamamlandı (görev kimliği). */
  onDone: (quest: string) => void;
  onBusy: (busy: boolean) => void;
  onMessage: (text: string) => void;
  /** Araç sürülüyor mu (İn düğmesi için). */
  onDrive: (driving: boolean) => void;
  /** Konum (küçük harita için, saniyede birkaç kez). */
  onPos: (x: number, z: number, heading: number) => void;
  /** React'ta açılan mekân (ev, galeri, Çizio). */
  onPage: (id: string) => void;
  sound: { star: (i: number) => void; pop: () => void; note: (i: number) => void; kick: () => void };
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
}

const WALK = 8, RUN = 15;
const SKY = new THREE.Color('#a9e4ff');
const DEEP = new THREE.Color('#1f86b8');

const angDiff = (a: number, b: number) => Math.atan2(Math.sin(a - b), Math.cos(a - b));

export class Island {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(52, 1, 0.1, 1200);
  private sun: THREE.DirectionalLight;
  private grid = new BlockGrid();
  private wb: WorldBuilder;
  private avatar: Avatar3D;
  private pet: THREE.Mesh | null = null;
  private petPos = new THREE.Vector3();
  private petHop = 0;
  private shadow: THREE.Mesh;
  private sparkles: Sparkles;
  private pick: THREE.Mesh;
  private sea: THREE.Mesh;
  private water: THREE.Texture;
  private stars: { id: string; obj: THREE.Object3D; taken: boolean }[] = [];
  private spots: SpotDef[];
  // durum
  private raf = 0;
  private last = 0;
  private clock = 0;
  private pos = new THREE.Vector3();
  private heading = 0;
  private target: THREE.Vector3 | null = null;
  private joy = new THREE.Vector2();
  private camYaw = Math.PI;
  private camYawGoal = Math.PI;
  private lastDrag = -10;
  private speed = 0;
  private swimming = false;
  private swimTime = 0;
  private near: SpotDef | null = null;
  private emoteUntil = 0;
  private emoteKind: 'wave' | 'jump' | 'clap' | null = null;
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

  constructor(private canvas: HTMLCanvasElement, private o: IslandOptions, private ev: IslandEvents) {
    this.renderer = makeRenderer(canvas);
    this.scene.background = SKY.clone();
    this.scene.fog = new THREE.Fog(SKY.clone(), 140, 420);
    this.scene.add(new THREE.HemisphereLight('#ffffff', '#7fbf6a', 1.15));
    this.sun = new THREE.DirectionalLight('#fff4dc', 1.5);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.bias = -0.0006;
    this.sun.shadow.normalBias = 0.05;
    Object.assign(this.sun.shadow.camera, { left: -42, right: 42, top: 42, bottom: -42, near: 1, far: 220 });
    this.scene.add(this.sun, this.sun.target);

    const terrain = buildTerrain(this.scene);
    this.pick = terrain.pick;
    this.sea = terrain.sea;
    this.water = terrain.water;
    buildHorizon(this.scene, (s) => cloud(s));
    this.sparkles = new Sparkles(this.scene);

    this.wb = new WorldBuilder(this.scene, this.grid, this.sparkles, o.tex, o.art,
      (quest, msg) => {
        if (quest.startsWith('star:')) {
          this.ev.onStar(quest.slice(5));
          this.ev.sound.star(5);
          return;
        }
        if (msg) this.ev.onMessage(msg);
        this.ev.onDone(quest);
      },
      { note: (i) => this.ev.sound.note(i), kick: () => this.ev.sound.kick(), pop: () => this.ev.sound.pop(), star: (i) => this.ev.sound.star(i) });
    buildZones(this.wb, o.taken);
    buildVegetation(this.scene, this.grid, this.wb.keepOut);
    this.spots = this.wb.spots;
    this.buildStars();

    // Kahraman
    this.avatar = new Avatar3D(o.doll);
    this.scene.add(this.avatar.root);
    this.actor = { pos: this.pos, heading: 0, hand: this.avatar.hand };
    const [sx, sz] = o.start ?? [0, 12];
    this.pos.set(sx, this.ground(sx, sz), sz);
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
  }

  private buildStars() {
    for (const s of starPlaces(this.o.starSeed)) {
      const taken = this.o.taken.includes(s.id);
      const p = { x: s.x, z: s.z };
      this.grid.push(p, 1.2);
      const obj = star();
      obj.scale.setScalar(1.4);
      obj.position.set(p.x, this.ground(p.x, p.z) + 1.4, p.z);
      obj.visible = !taken;
      this.scene.add(obj);
      this.stars.push({ id: s.id, obj, taken });
    }
  }

  /** Zemin (iskele, ada güvertesi dahil). */
  private ground(x: number, z: number) {
    return this.wb.ground(x, z);
  }

  // ----------------------------------------------------------------------------------------------
  // Girdi
  // ----------------------------------------------------------------------------------------------
  setJoystick(x: number, y: number) {
    this.joy.set(x, y);
    if (x || y) this.target = null;
  }
  tapTo(clientX: number, clientY: number) {
    if (this.act || this.drive) return;
    const r = this.canvas.getBoundingClientRect();
    const v = new THREE.Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(v, this.camera);
    const hit = this.ray.intersectObject(this.pick)[0];
    if (hit) this.target = hit.point.clone();
  }
  rotateCamera(dx: number) {
    this.camYawGoal -= dx * 0.006;
    this.lastDrag = this.clock;
  }
  emote(kind: 'wave' | 'jump' | 'clap') {
    if (this.act || this.drive) return;
    this.emoteKind = kind;
    this.emoteUntil = this.clock + (kind === 'jump' ? 0.7 : 1.6);
    if (kind === 'clap') this.sparkles.burst(this.pos.clone().setY(this.pos.y + 2.8), 14);
    // el sallarken kameraya döner
    if (kind === 'wave') this.heading = Math.atan2(this.camera.position.x - this.pos.x, this.camera.position.z - this.pos.z);
    this.ev.sound.pop();
  }
  /** Yakındaki mekânın etkinliği ya da aracı. */
  activity(id: string) {
    if (this.act || this.drive) return;
    const s = this.spots.find((x) => x.id === id);
    if (!s) return;
    if (s.page) return this.ev.onPage(id);
    if (s.vehicle) return this.mount(s);
    if (!s.act) return;
    this.act = { spot: s, def: s.act, t: 0 };
    this.target = null;
    this.actor.heading = this.heading;
    s.act.start?.(this.actor);
    this.ev.onBusy(true);
    this.setNear(null);
    if (s.act.underwater) this.setUnderwater(true);
  }
  private mount(s: SpotDef) {
    this.drive = s.vehicle!;
    this.target = null;
    this.ev.onDrive(true);
    this.ev.onDone(s.id);
    this.setNear(null);
    this.ev.sound.pop();
  }
  /** Araçtan in: en yakın karaya ya da aracın yanına (suya). */
  dismount() {
    if (!this.drive) return;
    const v = this.drive;
    let best: [number, number] | null = null;
    for (let r = 2; r <= 12 && !best; r += 2) for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
      const x = v.pos.x + Math.cos(a) * r, z = v.pos.z + Math.sin(a) * r;
      if (this.ground(x, z) > 0.1) {
        best = [x, z];
        break;
      }
    }
    const [x, z] = best ?? [v.pos.x + 2, v.pos.z];
    this.pos.set(x, Math.max(-0.55, this.ground(x, z)), z);
    this.drive = null;
    this.ev.onDrive(false);
  }
  /** Haritadan hızlı gidiş. */
  teleport(x: number, z: number) {
    if (this.act) return;
    if (this.drive) this.dismount();
    this.pos.set(x, this.ground(x, z), z);
    this.target = null;
    if (this.pet) this.petPos.set(x + 1.5, 0, z + 1);
    this.camera.position.set(x + Math.sin(this.camYaw) * 13, this.pos.y + 8, z + Math.cos(this.camYaw) * 13);
  }

  // ----------------------------------------------------------------------------------------------
  // Döngü
  // ----------------------------------------------------------------------------------------------
  private frame = (now: number) => {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.clock += dt;
    if (this.act) this.stepActivity(dt);
    else if (this.drive) this.stepDrive(dt);
    else this.stepWalk(dt);
    this.stepWorld(dt);
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
      if (l < 0.4) {
        this.target = null;
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
    const g = this.ground(this.pos.x, this.pos.z);
    this.swimming = g < -0.7;
    const run = mag > 0.95 && !this.swimming;
    const sp = mag <= 0 ? 0 : (run ? RUN : WALK * mag) * (this.swimming ? 0.55 : 1);
    this.speed += ((mag > 0 ? (run ? 1.3 : mag) : 0) - this.speed) * Math.min(1, dt * 10);
    if (mag > 0) {
      const next = this.pos.clone().addScaledVector(dir, sp * dt);
      this.grid.push(next);
      const R = Math.hypot(next.x, next.z);
      if (R > WORLD_R) next.multiplyScalar(WORLD_R / R);
      this.pos.x = next.x;
      this.pos.z = next.z;
      this.turnTo(Math.atan2(dir.x, dir.z), dt);
      // ileri giderken kamera yavaşça arkaya döner
      if (this.clock - this.lastDrag > 1.2 && this.joy.y > 0.3) this.camYawGoal += angDiff(this.heading + Math.PI, this.camYawGoal) * Math.min(1, dt * 0.8);
    }
    const ng = this.ground(this.pos.x, this.pos.z);
    this.pos.y += ((this.swimming ? -0.55 : Math.max(ng, -0.7)) - this.pos.y) * Math.min(1, dt * 14);
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
    let near: SpotDef | null = null;
    for (const s of this.spots) {
      const x = s.vehicle ? s.vehicle.pos.x : s.x, z = s.vehicle ? s.vehicle.pos.z : s.z;
      if (Math.hypot(x - this.pos.x, z - this.pos.z) < s.r) near = s;
    }
    this.setNear(near);
  }

  private setNear(s: SpotDef | null) {
    if (s?.id === this.near?.id) return;
    this.near = s;
    this.ev.onNear(s ? { id: s.id, pos: new THREE.Vector3(s.x, 0, s.z), r: s.r, label: s.label } : null);
  }

  private stepMusic() {
    let on = -1;
    for (const t of this.wb.musicTiles) if (Math.abs(this.pos.x - t.x) < 0.9 && Math.abs(this.pos.z - t.z) < 1.4) on = t.note;
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
    if (mag > 0) {
      v.heading += angDiff(Math.atan2(dir.x, dir.z), v.heading) * Math.min(1, dt * 3);
      const f = new THREE.Vector3(Math.sin(v.heading), 0, Math.cos(v.heading));
      const next = v.pos.clone().addScaledVector(f, v.speed * mag * dt);
      if ((!v.water || (isWater(next.x, next.z) && this.ground(next.x, next.z) < -0.4)) && Math.hypot(next.x, next.z) < WORLD_R) v.pos.copy(next);
      if (Math.random() < dt * 8) this.sparkles.burst(v.pos.clone().addScaledVector(f, -1.5).setY(0.2), 2, '#ffffff');
      if (this.clock - this.lastDrag > 1.2) this.camYawGoal += angDiff(v.heading + Math.PI, this.camYawGoal) * Math.min(1, dt * 1.5);
    }
    this.speed = 0;
    this.pos.set(v.pos.x, v.pos.y + v.seatY + Math.sin(this.clock * 3) * 0.05, v.pos.z);
    this.heading = v.heading;
  }

  private stepActivity(dt: number) {
    const a = this.act!;
    a.t += dt;
    const u = Math.min(1, a.t / a.def.dur);
    this.actor.heading = this.heading;
    a.def.step(a.t, u, this.actor, dt);
    this.heading = this.actor.heading;
    if (u < 1) return;
    const msg = a.def.end?.(this.actor);
    this.heading = this.actor.heading;
    this.act = null;
    if (a.def.underwater) this.setUnderwater(false);
    // etkinlik bitince kahraman yere (ya da suya) iner
    const g = this.ground(this.pos.x, this.pos.z);
    if (Math.abs(this.pos.y - g) > 0.4) {
      if (g < -0.7) this.pos.y = -0.55;
      else this.pos.set(a.spot.x, this.ground(a.spot.x, a.spot.z), a.spot.z);
    }
    this.ev.onBusy(false);
    if (msg) this.ev.onMessage(msg);
    this.ev.onDone(a.def.quest ?? a.spot.id);
    this.sparkles.burst(this.pos.clone().setY(this.pos.y + 2), 14);
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
    // araçlar: binilmeyenler suda sallanır
    for (const s of this.spots) {
      const v = s.vehicle;
      if (!v) continue;
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
      w.obj.position.set(w.pos.x, this.ground(w.pos.x, w.pos.z) + (moving ? Math.abs(Math.sin(w.hop)) * 0.25 : 0), w.pos.z);
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
    if (this.emoteKind && this.clock < this.emoteUntil) return this.emoteKind;
    this.emoteKind = null;
    return this.avatar.hand.getObjectByName('held') ? 'hold' : 'walk';
  }

  private draw(dt: number) {
    const pose = this.pose();
    this.lastPose = pose;
    this.drawRemotes(dt);
    let jump = 0;
    if (pose === 'jump' && !this.act) jump = Math.sin(Math.max(0, 1 - (this.emoteUntil - this.clock) / 0.7) * Math.PI) * 1.4;
    this.avatar.root.position.set(this.pos.x, this.pos.y + jump, this.pos.z);
    this.avatar.root.rotation.y = this.heading;
    this.avatar.update(dt, this.clock, pose, this.act ? (pose === 'climb' ? 0.8 : 0) : this.speed);
    const g = this.ground(this.pos.x, this.pos.z);
    this.shadow.visible = !this.swimming && !this.drive && this.pos.y - g < 6 && g > -0.3;
    this.shadow.position.set(this.pos.x, g + 0.06, this.pos.z);
    const sk = 1 / (1 + Math.max(0, this.pos.y + jump - g) * 0.25);
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
      const pg = Math.max(-0.4, this.ground(this.petPos.x, this.petPos.z));
      this.pet.position.set(this.petPos.x, pg + (moving ? Math.abs(Math.sin(this.petHop)) * 0.3 : 0), this.petPos.z);
      this.pet.rotation.y = Math.atan2(this.camera.position.x - this.petPos.x, this.camera.position.z - this.petPos.z);
    }
    // kamera
    this.camYaw += angDiff(this.camYawGoal, this.camYaw) * Math.min(1, dt * 6);
    const [dist, h] = this.act?.def.cam ?? (this.drive ? [16, 8] : [13, 7.5]);
    const cx = this.pos.x + Math.sin(this.camYaw) * dist, cz = this.pos.z + Math.cos(this.camYaw) * dist;
    let cy = this.pos.y + h;
    if (!this.underwater) cy = Math.max(cy, Math.max(0, this.ground(cx, cz)) + 2);
    const k = Math.min(1, dt * 6);
    this.camera.position.x += (cx - this.camera.position.x) * k;
    this.camera.position.y += (cy - this.camera.position.y) * k;
    this.camera.position.z += (cz - this.camera.position.z) * k;
    this.camera.lookAt(this.pos.x, this.pos.y + 1.8, this.pos.z);
    // güneş kahramanı izler (gölgeler hep yakında net)
    this.sun.position.set(this.pos.x - 30, this.pos.y + 60, this.pos.z + 26);
    this.sun.target.position.set(this.pos.x, this.pos.y, this.pos.z);
    this.renderer.render(this.scene, this.camera);
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
  /** Gönderilecek kendi durumum (konum, yön, poz). */
  liveState(): Omit<Live, 'n'> {
    return { x: this.pos.x, z: this.pos.z, y: this.pos.y, h: this.heading, p: this.lastPose };
  }

  /** Odadaki arkadaşların görünüşü ve canlı durumu (sunucudan geldikçe). */
  setPeers(peers: Record<string, { look?: DollState; live?: Live }>) {
    for (const [pid, r] of this.remotes) {
      if (!peers[pid]?.live || !peers[pid]?.look) {
        this.scene.remove(r.av.root, r.tag);
        r.av.dispose();
        this.remotes.delete(pid);
      }
    }
    for (const [pid, p] of Object.entries(peers)) {
      if (!p.look || !p.live) continue;
      const lk = JSON.stringify(p.look);
      let r = this.remotes.get(pid);
      if (r && r.look !== lk) {
        this.scene.remove(r.av.root, r.tag);
        r.av.dispose();
        r = undefined;
      }
      if (!r) {
        const av = new Avatar3D(p.look);
        const tag = nameTag(p.live.n || 'Arkadaşın');
        this.scene.add(av.root, tag);
        const v = new THREE.Vector3(p.live.x, p.live.y ?? this.ground(p.live.x, p.live.z), p.live.z);
        r = { av, tag, look: lk, pos: v.clone(), target: v, h: p.live.h, th: p.live.h, pose: p.live.p as Pose, speed: 0, seen: this.clock };
        this.remotes.set(pid, r);
      }
      r.target.set(p.live.x, p.live.y ?? this.ground(p.live.x, p.live.z), p.live.z);
      r.th = p.live.h;
      r.pose = (p.live.p as Pose) || 'walk';
      r.seen = this.clock;
    }
  }

  /** Bir arkadaşın yanına git (odaya katılınca). */
  goToPeer(pid: string) {
    const r = this.remotes.get(pid);
    if (!r) return false;
    this.teleport(r.target.x + 2, r.target.z + 1.5);
    return true;
  }

  private drawRemotes(dt: number) {
    for (const r of this.remotes.values()) {
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
    }
  }

  /** Test/geliştirme: mekânların listesi ve durum. */
  get spotList() {
    return this.spots.map((s) => ({ id: s.id, x: s.vehicle ? s.vehicle.pos.x : s.x, z: s.vehicle ? s.vehicle.pos.z : s.z, label: s.label }));
  }
  get busy() {
    return !!this.act;
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.resizeObs.disconnect();
    this.avatar.dispose();
    for (const r of this.remotes.values()) r.av.dispose();
    disposeScene(this.scene);
    this.renderer.dispose();
  }
}
