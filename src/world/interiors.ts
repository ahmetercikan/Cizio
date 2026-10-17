/**
 * Binaların içi: Okul, Hastane, Market, Kütüphane, Pastane, İtfaiye.
 *
 * Her bina, adadaki kapısından girilen ayrı bir sahnedir (macera dünyaları gibi). Kahraman içeride joystick ile gezer;
 * kameraya bakan duvarlar gizlenir (PK XD gibi), alçak bir süpürgelik kalır. İçeride görevliler (doktor, öğretmen,
 * kasiyer…) ve dokunulacak eşyalar vardır. Kapıdan (ÇIKIŞ) çıkınca adaya, binanın önüne dönülür.
 */
import * as THREE from 'three';
import { mesh, outline, toon } from '../play3d/kit';
import { PRESETS, type DollState } from '../dressup/catalog';
import { Avatar3D, type Pose } from './avatar3d';
import type { InteriorId } from './homestead';
import { board, holdItem } from './places';
import { Realm, type Hero, type RealmEvents } from './realms';
import type { Activity } from './zones';

const H = 5.5; // duvar yüksekliği
const DOOR = 1.7; // kapı boşluğunun yarı genişliği
const R = 0.4; // kahramanın gövde yarıçapı

const sm = (u: number) => u * u * (3 - 2 * u);
const clamp01 = (u: number) => Math.min(1, Math.max(0, u));
const beat = (t: number, dt: number, period: number, off = 0) => t >= off && Math.floor((t - off) / period) !== Math.floor((t - dt - off) / period);
const pick = <T>(a: T[]) => a[Math.floor(Math.random() * a.length)];

/** Kanvas doku (tekrarlı). */
function tex(w: number, h: number, draw: (x: CanvasRenderingContext2D) => void, repeat?: [number, number]) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(...repeat);
  }
  t.anisotropy = 4;
  return t;
}

const FLOORS = {
  wood: (x: CanvasRenderingContext2D) => {
    for (let i = 0; i < 8; i++) {
      x.fillStyle = ['#d8b48a', '#cfa97d', '#ddbb92', '#d2ad83'][i % 4];
      x.fillRect(0, i * 32, 256, 32);
      x.fillStyle = 'rgba(90,60,30,0.25)';
      x.fillRect(0, i * 32, 256, 2);
      x.fillRect(((i * 97) % 200) + 20, i * 32, 2, 32);
    }
  },
  dark: (x: CanvasRenderingContext2D) => {
    for (let i = 0; i < 8; i++) {
      x.fillStyle = ['#a7764f', '#9c6c47', '#ad7c55', '#a07049'][i % 4];
      x.fillRect(0, i * 32, 256, 32);
      x.fillStyle = 'rgba(40,20,10,0.3)';
      x.fillRect(0, i * 32, 256, 2);
      x.fillRect(((i * 83) % 200) + 30, i * 32, 2, 32);
    }
  },
  tile: (x: CanvasRenderingContext2D) => {
    x.fillStyle = '#f2f5f7';
    x.fillRect(0, 0, 256, 256);
    x.strokeStyle = '#cfd8de';
    x.lineWidth = 3;
    for (let i = 0; i <= 4; i++) {
      x.beginPath();
      x.moveTo(i * 64, 0);
      x.lineTo(i * 64, 256);
      x.moveTo(0, i * 64);
      x.lineTo(256, i * 64);
      x.stroke();
    }
  },
  mint: (x: CanvasRenderingContext2D) => {
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      x.fillStyle = (i + j) % 2 ? '#e3f4f1' : '#f6fbfa';
      x.fillRect(i * 64, j * 64, 64, 64);
    }
  },
  checker: (x: CanvasRenderingContext2D) => {
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      x.fillStyle = (i + j) % 2 ? '#f7c6d6' : '#fff6f8';
      x.fillRect(i * 64, j * 64, 64, 64);
    }
  },
  concrete: (x: CanvasRenderingContext2D) => {
    x.fillStyle = '#b9bcc2';
    x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 900; i++) {
      x.fillStyle = `rgba(${Math.random() < 0.5 ? '255,255,255' : '60,60,70'},0.08)`;
      x.fillRect(Math.random() * 256, Math.random() * 256, 3, 3);
    }
    x.strokeStyle = 'rgba(80,80,90,0.35)';
    x.lineWidth = 2;
    x.strokeRect(0, 0, 256, 256);
  },
} as const;

/** Görevli (doktor, öğretmen…): oyuncu karakteriyle aynı 3B kukla, biraz daha büyük. */
function npcDoll(over: Partial<DollState>, i = 0): DollState {
  return { ...PRESETS[i % PRESETS.length], hat: '', hand: '', pet: '', back: '', bg: 'oda', ...over };
}

interface Wall { full: THREE.Group; n: [number, number]; p: [number, number] }
interface Npc { av: Avatar3D; pose: Pose; speed: number }

export class InteriorRealm extends Realm {
  readonly id: InteriorId;
  goal = 'İçeride gez, eşyalara dokun!';
  private W: number;
  private D: number;
  private walls: Wall[] = [];
  private solids: { x: number; z: number; w: number; d: number; top: number }[] = [];
  private decks: { x: number; z: number; w: number; d: number; y: number }[] = [];
  private ticks: ((dt: number, t: number) => void)[] = [];
  private npcs: Npc[] = [];

  constructor(ev: RealmEvents, id: InteriorId) {
    super(ev, '#2f2a3d', [70, 140], 'none');
    this.id = id;
    this.leave = 'Dışarı çık';
    this.heroScale = 0.78;
    this.cam = [9.5, 7.5];
    const size: Record<InteriorId, [number, number]> = { okul: [24, 18], hastane: [24, 18], market: [26, 20], kutuphane: [22, 18], pastane: [20, 16], itfaiye: [26, 20] };
    [this.W, this.D] = size[id];
    const look: Record<InteriorId, [keyof typeof FLOORS, string, string]> = {
      okul: ['wood', '#fff3d6', '#ffb347'],
      hastane: ['mint', '#eef7f7', '#5cc8b8'],
      market: ['tile', '#f7faf5', '#2bb673'],
      kutuphane: ['dark', '#f3e4cc', '#a8662e'],
      pastane: ['checker', '#ffe4ec', '#e9487d'],
      itfaiye: ['concrete', '#c9584a', '#ffc83d'],
    };
    this.room(...look[id]);
    ({ okul: () => this.school(), hastane: () => this.hospital(), market: () => this.market(), kutuphane: () => this.library(), pastane: () => this.bakery(), itfaiye: () => this.fireStation() })[id]();
    this.spawn.set(0, 0, this.D / 2 - 2.6);
    this.spawnH = Math.PI;
    this.checkpoint.copy(this.spawn);
    this.placeExit(0, 0, this.D / 2 + 0.9, 0);
    this.killY = -5;
    // eşyanın gövdesi: hangi yandan gelinirse gelinsin düğme çıkar
    for (const s of this.spots) {
      let best: { x: number; z: number; w: number; d: number } | null = null;
      for (const k of this.solids) {
        const ex = Math.max(0, Math.abs(s.x - k.x) - k.w / 2), ez = Math.max(0, Math.abs(s.z - k.z) - k.d / 2);
        if (Math.hypot(ex, ez) < s.r * 0.8 + 0.4 && (!best || k.w * k.d > best.w * best.d) && k.w * k.d < 60) best = k;
      }
      if (best) s.body = { x: best.x, z: best.z, r: Math.max(best.w, best.d) / 2 * 0.85 };
    }
  }

  // ----------------------------------------------------------------------------------------------
  // Oda
  // ----------------------------------------------------------------------------------------------
  private room(floor: keyof typeof FLOORS, wall: string, accent: string) {
    const { W, D } = this;
    const ft = tex(256, 256, FLOORS[floor], [W / 4, D / 4]);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, D).rotateX(-Math.PI / 2), new THREE.MeshToonMaterial({ map: ft }));
    fl.receiveShadow = true;
    this.scene.add(fl);
    // kapı önü paspası ve dışarıdaki gün ışığı
    const mat = mesh(new THREE.PlaneGeometry(3.4, 1.6).rotateX(-Math.PI / 2), toon('#7a5c48'), false);
    mat.position.set(0, 0.02, D / 2 - 1);
    const out = new THREE.Mesh(new THREE.PlaneGeometry(DOOR * 2, 4.4), new THREE.MeshBasicMaterial({ color: '#dff3ff' }));
    out.position.set(0, 2.2, D / 2 + 1.6);
    out.rotation.y = Math.PI;
    const outFloor = mesh(new THREE.PlaneGeometry(DOOR * 2, 3).rotateX(-Math.PI / 2), toon('#cfe7c2'), false);
    outFloor.position.set(0, 0, D / 2 + 1.5);
    this.scene.add(mat, out, outFloor);
    const wallMat = toon(wall);
    const trim = toon(accent);
    const mk = (len: number, pos: [number, number], rot: number, n: [number, number], door = false) => {
      const full = new THREE.Group();
      const stub = new THREE.Group();
      const seg = (w: number, x: number, h = H, y = h / 2) => {
        const b = mesh(new THREE.BoxGeometry(w, h, 0.3), wallMat);
        b.position.set(x, y, -0.15);
        b.receiveShadow = true;
        full.add(b);
        const s = mesh(new THREE.BoxGeometry(w, 0.55, 0.32), trim, false);
        s.position.set(x, 0.275, -0.14);
        stub.add(s);
        // süpürgelik ve boya şeridi
        const bb = mesh(new THREE.BoxGeometry(w, 0.3, 0.06), trim, false);
        bb.position.set(x, 0.15, 0.03);
        const stripe = mesh(new THREE.BoxGeometry(w, 0.18, 0.04), trim, false);
        stripe.position.set(x, 2.1, 0.02);
        full.add(bb, stripe);
      };
      if (door) {
        const side = (len / 2 - DOOR) / 2;
        seg(len / 2 - DOOR, -(DOOR + side));
        seg(len / 2 - DOOR, DOOR + side);
        const lintel = mesh(new THREE.BoxGeometry(DOOR * 2, H - 4.4, 0.3), wallMat);
        lintel.position.set(0, 4.4 + (H - 4.4) / 2, -0.15);
        full.add(lintel);
        // kapı kasası ve yeşil ÇIKIŞ levhası
        for (const sx of [-DOOR, DOOR]) {
          const jamb = outline(mesh(new THREE.BoxGeometry(0.25, 4.4, 0.4), toon('#8a5a35')), 1.03);
          jamb.position.set(sx, 2.2, 0);
          full.add(jamb);
        }
        const head = outline(mesh(new THREE.BoxGeometry(DOOR * 2 + 0.25, 0.25, 0.4), toon('#8a5a35')), 1.03);
        head.position.set(0, 4.45, 0);
        const exit = board('ÇIKIŞ', '#1f9d55', '#ffffff', 1.8, 0.6, 800);
        exit.position.set(0, 4.95, 0.12);
        full.add(head, exit);
      } else seg(len, 0);
      const g = new THREE.Group();
      g.add(full, stub);
      g.position.set(pos[0], 0, pos[1]);
      g.rotation.y = rot;
      this.scene.add(g);
      this.walls.push({ full, n, p: pos });
      return full;
    };
    this.wallBack = mk(W, [0, -D / 2], 0, [0, -1]);
    mk(W, [0, D / 2], Math.PI, [0, 1], true);
    this.wallLeft = mk(D, [-W / 2, 0], Math.PI / 2, [-1, 0]);
    this.wallRight = mk(D, [W / 2, 0], -Math.PI / 2, [1, 0]);
    // pencereler (yan duvarlarda)
    for (const w of [this.wallLeft, this.wallRight]) for (const a of [-D / 4, D / 4]) this.windowOn(w, a);
  }
  private wallBack!: THREE.Group;
  private wallLeft!: THREE.Group;
  private wallRight!: THREE.Group;

  private windowOn(wall: THREE.Group, along: number, w = 3.2, h = 2.2, y = 3.1) {
    const g = new THREE.Group();
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: '#cdeeff' }));
    const sky = tex(128, 96, (x) => {
      const gr = x.createLinearGradient(0, 0, 0, 96);
      gr.addColorStop(0, '#8fd0ff');
      gr.addColorStop(1, '#e8f7ff');
      x.fillStyle = gr;
      x.fillRect(0, 0, 128, 96);
      x.fillStyle = '#ffffff';
      for (const [cx, cy, r] of [[30, 30, 12], [44, 26, 14], [58, 32, 10], [96, 50, 9], [108, 46, 11]]) {
        x.beginPath();
        x.arc(cx, cy, r, 0, Math.PI * 2);
        x.fill();
      }
      x.fillStyle = '#7cc760';
      x.fillRect(0, 80, 128, 16);
    });
    (glass.material as THREE.MeshBasicMaterial).map = sky;
    (glass.material as THREE.MeshBasicMaterial).color.set('#ffffff');
    glass.position.z = 0.02;
    g.add(glass);
    for (const [bw, bh, x, yy] of [[w + 0.3, 0.18, 0, h / 2], [w + 0.3, 0.18, 0, -h / 2], [0.18, h, -w / 2, 0], [0.18, h, w / 2, 0], [0.1, h, 0, 0], [w, 0.1, 0, 0]] as const) {
      const f = mesh(new THREE.BoxGeometry(bw, bh, 0.12), toon('#ffffff'), false);
      f.position.set(x, yy, 0.06);
      g.add(f);
    }
    const sill = mesh(new THREE.BoxGeometry(w + 0.5, 0.12, 0.35), toon('#ffffff'), false);
    sill.position.set(0, -h / 2 - 0.1, 0.15);
    g.add(sill);
    g.position.set(along, y, 0);
    wall.add(g);
  }

  /** Duvara bir şey as (duvarın yerel ekseninde: along sağa, y yukarı). */
  private hang(wall: THREE.Group, obj: THREE.Object3D, along: number, y: number, out = 0.06) {
    obj.position.set(along, y, out);
    wall.add(obj);
    return obj;
  }

  // ----------------------------------------------------------------------------------------------
  // Yardımcılar
  // ----------------------------------------------------------------------------------------------
  private add<T extends THREE.Object3D>(o: T, x: number, z: number, rot = 0, y = 0): T {
    o.position.set(x, y, z);
    o.rotation.y = rot;
    this.scene.add(o);
    return o;
  }
  private solid(x: number, z: number, w: number, d: number, top = 3) {
    this.solids.push({ x, z, w, d, top });
  }
  private spot(id: string, x: number, z: number, r: number, label: string, act: Activity) {
    this.spots.push({ id, x, z, r, label, act });
  }
  private box(w: number, h: number, d: number, color: string, x = 0, y = h / 2, z = 0, edge = true) {
    const b = edge ? outline(mesh(new THREE.BoxGeometry(w, h, d), toon(color)), 1.02) : mesh(new THREE.BoxGeometry(w, h, d), toon(color));
    b.position.set(x, y, z);
    return b;
  }
  private npc(over: Partial<DollState>, x: number, z: number, h: number, pose: Pose = 'idle', scale = 1.18, preset = 0): Npc {
    const av = new Avatar3D(npcDoll(over, preset));
    av.root.scale.setScalar(scale * 0.8);
    av.root.position.set(x, 0, z);
    av.root.rotation.y = h;
    this.scene.add(av.root);
    const n = { av, pose, speed: 0 };
    this.npcs.push(n);
    this.solid(x, z, 1, 1, 3);
    return n;
  }
  private fx(name: string, i?: number) {
    this.ev.sound.fx?.(name, i);
  }
  private chair(color: string) {
    const g = new THREE.Group();
    g.add(this.box(1, 0.12, 1, color, 0, 0.9, 0));
    g.add(this.box(1, 1, 0.12, color, 0, 1.4, -0.45));
    for (const [x, z] of [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]]) g.add(this.box(0.1, 0.9, 0.1, '#5b5f6b', x, 0.45, z, false));
    return g;
  }
  private table(w: number, d: number, color: string, h = 1.35) {
    const g = new THREE.Group();
    g.add(this.box(w, 0.14, d, color, 0, h, 0));
    for (const [x, z] of [[-w / 2 + 0.15, -d / 2 + 0.15], [w / 2 - 0.15, -d / 2 + 0.15], [-w / 2 + 0.15, d / 2 - 0.15], [w / 2 - 0.15, d / 2 - 0.15]]) g.add(this.box(0.12, h, 0.12, '#6b4a33', x, h / 2, z, false));
    return g;
  }
  private plant(s = 1) {
    const g = new THREE.Group();
    g.add(this.box(0.8 * s, 0.8 * s, 0.8 * s, '#c97b4f', 0, 0.4 * s, 0));
    for (const [x, y, z, r] of [[0, 1.3, 0, 0.6], [0.35, 1.1, 0.2, 0.45], [-0.3, 1.15, -0.2, 0.45], [0, 1.7, 0.1, 0.4]]) {
      const l = outline(mesh(new THREE.IcosahedronGeometry(r * s, 0), toon('#4caf50')), 1.04);
      l.position.set(x * s, y * s, z * s);
      g.add(l);
    }
    return g;
  }
  /** Kitap sırtları dolu raf (tek çizim). */
  private shelf(w: number, h: number, d: number, rows: number, wood: string, fill: (i: number) => string, itemH = 0.7, itemW = 0.18) {
    const g = new THREE.Group();
    g.add(this.box(w, h, 0.12, wood, 0, h / 2, -d / 2 + 0.06));
    for (const sx of [-w / 2, w / 2]) g.add(this.box(0.14, h, d, wood, sx, h / 2, 0));
    const step = h / rows;
    for (let r = 0; r <= rows; r++) g.add(this.box(w, 0.1, d, wood, 0, r * step + 0.05, 0, false));
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const n = Math.floor((w - 0.3) / (itemW + 0.04)) * rows;
    const im = new THREE.InstancedMesh(geo, new THREE.MeshToonMaterial(), n);
    const m4 = new THREE.Matrix4(), c = new THREE.Color();
    let k = 0;
    for (let r = 0; r < rows; r++) {
      let x = -w / 2 + 0.2;
      while (x < w / 2 - 0.2 - itemW && k < n) {
        const hh = itemH * (0.75 + Math.random() * 0.35);
        m4.compose(new THREE.Vector3(x + itemW / 2, r * step + 0.1 + hh / 2, 0.05), new THREE.Quaternion(), new THREE.Vector3(itemW, hh, d * 0.75));
        im.setMatrixAt(k, m4);
        im.setColorAt(k, c.set(fill(k)));
        x += itemW + 0.04;
        k++;
      }
    }
    im.count = k;
    g.add(im);
    return g;
  }

  // ----------------------------------------------------------------------------------------------
  // Okul
  // ----------------------------------------------------------------------------------------------
  private school() {
    const { D } = this;
    // kara tahta (yazı değişir)
    const bc = document.createElement('canvas');
    bc.width = 1024;
    bc.height = 340;
    const bctx = bc.getContext('2d')!;
    const btex = new THREE.CanvasTexture(bc);
    btex.colorSpace = THREE.SRGBColorSpace;
    const writeBoard = (text: string, sub = '', reveal = 1) => {
      bctx.fillStyle = '#2f5d46';
      bctx.fillRect(0, 0, 1024, 340);
      bctx.fillStyle = 'rgba(255,255,255,0.06)';
      for (let i = 0; i < 40; i++) bctx.fillRect(Math.random() * 1024, Math.random() * 340, 80, 3);
      bctx.fillStyle = '#f8f8f0';
      bctx.font = '700 110px "Comic Sans MS", Fredoka, sans-serif';
      bctx.textAlign = 'center';
      bctx.fillText(text.slice(0, Math.ceil(text.length * reveal)), 512, 160);
      bctx.font = '600 56px "Comic Sans MS", Fredoka, sans-serif';
      bctx.fillStyle = '#ffe08a';
      if (reveal >= 1) bctx.fillText(sub, 512, 270);
      btex.needsUpdate = true;
    };
    writeBoard('Merhaba!', 'Çizio Okulu');
    const bg = new THREE.Group();
    const frame = outline(mesh(new THREE.BoxGeometry(10.4, 3.6, 0.2), toon('#8a5a35')), 1.02);
    const surf = new THREE.Mesh(new THREE.PlaneGeometry(10, 3.3), new THREE.MeshBasicMaterial({ map: btex }));
    surf.position.z = 0.11;
    const tray = mesh(new THREE.BoxGeometry(10, 0.12, 0.35), toon('#8a5a35'), false);
    tray.position.set(0, -1.8, 0.2);
    bg.add(frame, surf, tray);
    for (const [x, c] of [[-3, '#ffffff'], [-2.6, '#ffd43b'], [-2.2, '#ff8fb1']] as const) {
      const ch = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.35, 6), toon(c), false);
      ch.rotation.z = Math.PI / 2;
      ch.position.set(x, -1.72, 0.25);
      bg.add(ch);
    }
    this.hang(this.wallBack, bg, 1, 3.1, 0.12);
    // alfabe şeridi ve saat
    const alpha = new THREE.Mesh(new THREE.PlaneGeometry(14, 0.9), new THREE.MeshBasicMaterial({ map: tex(1024, 64, (x) => {
      const L = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ';
      L.split('').forEach((ch, i) => {
        x.fillStyle = ['#ff6b6b', '#ffb347', '#ffd43b', '#69db7c', '#4dabf7', '#9775fa'][i % 6];
        x.fillRect(i * (1024 / L.length), 0, 1024 / L.length - 2, 64);
        x.fillStyle = '#ffffff';
        x.font = '700 44px Fredoka, sans-serif';
        x.textAlign = 'center';
        x.fillText(ch, i * (1024 / L.length) + 1024 / L.length / 2, 48);
      });
    }) }));
    this.hang(this.wallRight, alpha, 0, 4.9, 0.03);
    const clock = new THREE.Group();
    const face = outline(mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.1, 24), toon('#ffffff')), 1.08);
    face.rotation.x = Math.PI / 2;
    const hand = mesh(new THREE.BoxGeometry(0.06, 0.45, 0.03), toon('#3a2b27'), false);
    hand.position.set(0, 0.18, 0.07);
    clock.add(face, hand);
    this.hang(this.wallBack, clock, 8, 4.4, 0.1);
    this.ticks.push((dt) => void (hand.rotation.z -= dt * 0.1));
    // dünya haritası
    const map = new THREE.Mesh(new THREE.PlaneGeometry(4, 2.4), new THREE.MeshBasicMaterial({ map: tex(256, 160, (x) => {
      x.fillStyle = '#9ad7ff';
      x.fillRect(0, 0, 256, 160);
      x.fillStyle = '#7cc760';
      for (const [cx, cy, rx, ry] of [[50, 50, 30, 24], [70, 110, 16, 26], [130, 45, 26, 20], [140, 95, 20, 28], [205, 55, 34, 22], [215, 120, 16, 10]]) {
        x.beginPath();
        x.ellipse(cx, cy, rx, ry, 0.3, 0, Math.PI * 2);
        x.fill();
      }
      x.strokeStyle = '#8a5a35';
      x.lineWidth = 8;
      x.strokeRect(0, 0, 256, 160);
    }) }));
    this.hang(this.wallLeft, map, 0, 3.2, 0.03);
    // öğretmen masası, küre, öğretmen
    const td = this.table(3.4, 1.6, '#b9773f', 1.5);
    td.add(this.box(3.2, 1.2, 0.1, '#a8662e', 0, 0.8, 0.75, false));
    this.add(td, -5.5, -5.6);
    this.solid(-5.5, -5.6, 3.4, 1.6, 1.6);
    const globe = new THREE.Group();
    const ball = outline(mesh(new THREE.SphereGeometry(0.45, 18, 14), new THREE.MeshToonMaterial({ map: tex(128, 64, (x) => {
      x.fillStyle = '#4dabf7';
      x.fillRect(0, 0, 128, 64);
      x.fillStyle = '#7cc760';
      for (const [cx, cy, r] of [[20, 20, 10], [30, 40, 7], [64, 22, 12], [70, 44, 8], [104, 26, 13]]) {
        x.beginPath();
        x.arc(cx, cy, r, 0, Math.PI * 2);
        x.fill();
      }
    }) })), 1.06);
    ball.position.y = 0.75;
    const stand = mesh(new THREE.CylinderGeometry(0.06, 0.25, 0.3, 10), toon('#8a5a35'), false);
    stand.position.y = 0.15;
    globe.add(ball, stand);
    this.add(globe, -6.6, -5.6, 0, 1.57);
    let spin = 0.2;
    this.ticks.push((dt) => {
      ball.rotation.y += dt * spin;
      spin += (0.2 - spin) * Math.min(1, dt * 0.4);
    });
    const teacher = this.npc({ gender: 'kiz', top: 'gomlek', topColor: '#ffffff', bottom: 'uzunetek', bottomColor: '#5b8def', glasses: 'yuvarlak', hair: 'topuz', hairColor: '#5a3420' }, -5.5, -7.3, 0, 'idle', 1.22, 3);
    // sıralar ve sandalyeler (öğrenciler tahtaya bakar)
    const desk = (x: number, z: number) => {
      const t = this.table(2.4, 1.3, '#e8c48f', 1.25);
      t.add(this.box(0.6, 0.06, 0.8, '#ffffff', -0.4, 1.36, 0, false));
      this.add(t, x, z);
      const c = this.chair('#4dabf7');
      this.add(c, x, z + 1.2, Math.PI);
      this.solid(x, z, 2.4, 1.3, 1.3);
    };
    const rowsZ = [-1.6, 1.7, 5];
    const colsX = [-6, 0, 6];
    for (const z of rowsZ) for (const x of colsX) desk(x, z);
    // sınıf arkadaşları
    const kids: [number, number, number][] = [[-6, -1.6, 6], [6, -1.6, 7], [-6, 1.7, 8], [6, 5, 9]];
    for (const [x, z, p] of kids) {
      const k = this.npc({}, x, z + 1.15, Math.PI, 'sit', 1, p);
      this.solids.pop();
      void k;
    }
    // kitaplık, bitkiler, ksilofon köşesi, resim köşesi
    const books = this.shelf(5, 3.4, 0.9, 4, '#b9773f', () => pick(['#ef4b4b', '#4dabf7', '#ffd43b', '#69db7c', '#9775fa', '#ff8a3d']));
    this.add(books, -9, -D / 2 + 0.55);
    this.solid(-9, -D / 2 + 0.55, 5, 0.9, 3.4);
    this.add(this.plant(1.2), 11, -7.8);
    this.add(this.plant(1.2), -11, 7.6);
    this.solid(11, -7.8, 1, 1);
    this.solid(-11, 7.6, 1, 1);
    const xt = this.table(3.2, 1.4, '#ffffff', 1.1);
    const bars: THREE.Mesh[] = [];
    ['#ff6b6b', '#ff9f43', '#ffd43b', '#69db7c', '#38d9a9', '#4dabf7', '#9775fa', '#f783ac'].forEach((c, i) => {
      const b = mesh(new THREE.BoxGeometry(0.28, 0.1, 1.1 - i * 0.06), toon(c), false);
      b.position.set(-1.2 + i * 0.34, 1.22, 0);
      xt.add(b);
      bars.push(b);
    });
    this.add(xt, 9, -5.8);
    this.solid(9, -5.8, 3.2, 1.4, 1.2);
    const easel = new THREE.Group();
    for (const sx of [-0.5, 0.5]) {
      const l = mesh(new THREE.BoxGeometry(0.1, 3, 0.1), toon('#b9773f'), false);
      l.position.set(sx, 1.5, 0);
      l.rotation.z = -sx * 0.15;
      easel.add(l);
    }
    const ac = document.createElement('canvas');
    ac.width = ac.height = 256;
    const actx = ac.getContext('2d')!;
    actx.fillStyle = '#ffffff';
    actx.fillRect(0, 0, 256, 256);
    const atex = new THREE.CanvasTexture(ac);
    atex.colorSpace = THREE.SRGBColorSpace;
    const paper = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), new THREE.MeshBasicMaterial({ map: atex }));
    paper.position.set(0, 2.1, 0.08);
    easel.add(paper);
    this.add(easel, -9, 5, Math.PI / 2 + 0.3);
    this.solid(-9, 5, 1.2, 1.2);

    // ---- etkinlikler
    const LESSONS: [string, string, string][] = [
      ['ELMA = APPLE', 'İngilizce', '"Elma" İngilizcede "apple" demek!'],
      ['2 + 3 = 5', 'Matematik', 'İki elma ile üç elma beş elma eder!'],
      ['KEDİ = CAT', 'İngilizce', '"Kedi" İngilizcede "cat" demek!'],
      ['☀ → 🌱', 'Fen', 'Bitkiler güneş ışığı ve suyla büyür.'],
      ['7 RENK', 'Gökkuşağı', 'Kırmızı, turuncu, sarı, yeşil, mavi, lacivert, mor!'],
      ['10 - 4 = 6', 'Matematik', 'On kalemden dördünü verirsen altı kalır.'],
    ];
    let lesson = 'Aferin sana!', written = false;
    this.spot('okul-ders', 0, 3.1, 1.8, 'Sıraya otur, derse katıl', {
      dur: 8, pose: (u) => (u > 0.85 ? 'cheer' : 'sit'), cam: [7, 5],
      start: () => {
        this.fx('bell');
        teacher.pose = 'wave';
        written = false;
      },
      step: (t, _u, a) => {
        a.pos.set(0, 0, 2.85);
        a.heading = Math.PI;
        if (t > 1.5 && !written) {
          written = true;
          const L = pick(LESSONS);
          writeBoard(L[0], L[1]);
          lesson = L[2];
          teacher.pose = 'hold';
        }
      },
      end: () => {
        teacher.pose = 'idle';
        this.fx('yay');
        return `Öğretmen: ${lesson}`;
      },
    });
    const WORDS = ['ÇİZİO', 'MERHABA', 'ANNE', 'BABA', 'GÜNEŞ', 'OKUL', 'ADA', 'SEVGİ'];
    let word = 'ÇİZİO';
    this.spot('okul-tahta', 2.5, -7.4, 1.8, 'Tahtaya yaz', {
      dur: 5, pose: 'hold', cam: [8, 4.5],
      start: () => void (word = pick(WORDS)),
      step: (t, u, a, dt) => {
        a.pos.set(1 + Math.sin(u * Math.PI) * 2, 0, -7.6);
        a.heading = Math.PI;
        writeBoard(word, 'Ne güzel yazdın!', clamp01(u * 1.3));
        if (beat(t, dt, 0.45)) this.fx('page');
      },
      end: () => {
        this.fx('yay');
        return `Tahtaya "${word}" yazdın!`;
      },
    });
    this.spot('okul-kure', -6.6, -4, 1.6, 'Dünya küresini çevir', {
      dur: 3, pose: 'wave', cam: [7, 4],
      start: () => {
        spin = 9;
        this.fx('whistle');
      },
      step: (_t, _u, a) => {
        a.pos.set(-6.6, 0, -4.2);
        a.heading = Math.PI;
      },
      end: () => pick(['Dünya kocaman ve çoğu deniz!', 'Türkiye iki kıtada: Asya ve Avrupa!', 'Dünya bir günde kendi etrafında bir tur döner.', 'En büyük okyanus Büyük Okyanus!']),
    });
    this.spot('okul-ksilofon', 9, -4.4, 1.7, 'Ksilofon çal', {
      dur: 5, pose: 'hold', cam: [7, 4],
      step: (t, _u, a, dt) => {
        a.pos.set(9, 0, -4.6);
        a.heading = Math.PI;
        if (beat(t, dt, 0.32)) {
          const SONG = [0, 0, 4, 4, 5, 5, 4, -1, 3, 3, 2, 2, 1, 1, 0, -1];
          const n = SONG[Math.floor(t / 0.32) % SONG.length];
          if (n >= 0) {
            this.ev.sound.note?.(n);
            bars[n].position.y = 1.15;
            setTimeout(() => (bars[n].position.y = 1.22), 150);
          }
        }
      },
      end: () => 'Bravo! "Daha dün annemizin" gibi bir şarkı çaldın!',
    });
    const paint = () => {
      actx.fillStyle = '#ffffff';
      actx.fillRect(0, 0, 256, 256);
      const k = Math.floor(Math.random() * 3);
      actx.lineWidth = 8;
      actx.lineCap = 'round';
      if (k === 0) {
        actx.fillStyle = '#ffd43b';
        actx.beginPath();
        actx.arc(190, 60, 34, 0, Math.PI * 2);
        actx.fill();
        actx.fillStyle = '#ff8a3d';
        actx.fillRect(50, 130, 110, 90);
        actx.fillStyle = '#ef4b4b';
        actx.beginPath();
        actx.moveTo(35, 135);
        actx.lineTo(105, 70);
        actx.lineTo(175, 135);
        actx.fill();
      } else if (k === 1) {
        ['#ef4b4b', '#ff9f43', '#ffd43b', '#69db7c', '#4dabf7', '#9775fa'].forEach((c, i) => {
          actx.strokeStyle = c;
          actx.lineWidth = 14;
          actx.beginPath();
          actx.arc(128, 220, 150 - i * 16, Math.PI, 0);
          actx.stroke();
        });
      } else {
        actx.fillStyle = '#69db7c';
        actx.fillRect(0, 200, 256, 56);
        for (const [x, c] of [[60, '#ff6b8a'], [128, '#ffd43b'], [196, '#9775fa']] as const) {
          actx.strokeStyle = '#2f9e44';
          actx.beginPath();
          actx.moveTo(x, 210);
          actx.lineTo(x, 130);
          actx.stroke();
          actx.fillStyle = c;
          for (let p = 0; p < 6; p++) {
            actx.beginPath();
            actx.arc(x + Math.cos((p / 6) * Math.PI * 2) * 18, 120 + Math.sin((p / 6) * Math.PI * 2) * 18, 13, 0, Math.PI * 2);
            actx.fill();
          }
        }
      }
      atex.needsUpdate = true;
    };
    this.spot('okul-resim', -7.3, 5.6, 1.7, 'Resim yap', {
      dur: 4, pose: 'hold', cam: [7, 4],
      step: (t, _u, a, dt) => {
        a.pos.set(-7.4, 0, 5.6);
        a.heading = -Math.PI / 2 - 0.3;
        if (beat(t, dt, 0.7)) this.fx('page');
      },
      end: () => {
        paint();
        this.fx('yay');
        return 'Ne güzel bir resim yaptın! Şövalede asılı kaldı.';
      },
    });
  }

  // ----------------------------------------------------------------------------------------------
  // Hastane
  // ----------------------------------------------------------------------------------------------
  private hospital() {
    const { W, D } = this;
    // resepsiyon
    const desk = new THREE.Group();
    desk.add(this.box(4.4, 1.6, 1.2, '#ffffff', 0, 0.8, 0));
    desk.add(this.box(4.6, 0.12, 1.4, '#5cc8b8', 0, 1.66, 0, false));
    const mon = this.box(0.9, 0.6, 0.1, '#3a3f4a', 0.8, 2.1, -0.2);
    desk.add(mon);
    const sg = board('DANIŞMA', '#5cc8b8', '#ffffff', 2.4, 0.6, 700);
    sg.position.set(0, 1.1, 0.62);
    desk.add(sg);
    this.add(desk, -7, 4.2);
    this.solid(-7, 4.2, 4.4, 1.2, 1.7);
    this.npc({ gender: 'kiz', dress: 'doktor', dressColor: '#9be7de', hair: 'atkuyrugu' }, -7, 2.9, 0, 'idle', 1.15, 1);
    // bekleme sandalyeleri
    for (let i = 0; i < 4; i++) {
      this.add(this.chair('#4dabf7'), 7 + i * 1.3, 6.6, Math.PI);
      this.solid(7 + i * 1.3, 6.6, 1, 1, 1.4);
    }
    // muayene yatağı, perde, doktor
    const bed = new THREE.Group();
    bed.add(this.box(2, 0.9, 4, '#e9ecef', 0, 0.45, 0));
    bed.add(this.box(2, 0.35, 4, '#ffffff', 0, 1.07, 0, false));
    bed.add(this.box(1.6, 0.3, 0.8, '#cfe8ff', 0, 1.35, -1.4, false));
    this.add(bed, -9, -5);
    this.solid(-9, -5, 2, 4, 1.2);
    const rail = mesh(new THREE.TorusGeometry(2.8, 0.05, 6, 24, Math.PI), toon('#c0c6cf'), false);
    rail.rotation.x = -Math.PI / 2;
    rail.position.set(-9, 4.6, -5);
    const curtain = mesh(new THREE.CylinderGeometry(2.8, 2.8, 3.6, 24, 1, true, Math.PI * 1.1, Math.PI * 0.55), new THREE.MeshToonMaterial({ color: '#9be7de', side: THREE.DoubleSide }), false);
    curtain.position.set(-9, 2.8, -5);
    this.scene.add(rail, curtain);
    const doctor = this.npc({ gender: 'erkek', dress: 'doktor', dressColor: '#ffffff', glasses: 'kare', hair: 'kisa', hairColor: '#3a2b27' }, -6.4, -6.6, -Math.PI / 2 + 0.6, 'idle', 1.22, 6);
    // boy cetveli ve tartı
    const ruler = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 4), new THREE.MeshBasicMaterial({ map: tex(64, 288, (x) => {
      ['#ff6b6b', '#ff9f43', '#ffd43b', '#69db7c', '#4dabf7', '#9775fa'].forEach((c, i) => {
        x.fillStyle = c;
        x.fillRect(0, i * 48, 64, 48);
      });
      x.fillStyle = '#ffffff';
      for (let i = 0; i < 24; i++) x.fillRect(0, i * 12, i % 4 === 0 ? 30 : 16, 2);
    }) }));
    this.hang(this.wallBack, ruler, -1.5, 2.1, 0.03);
    const marker = this.box(1.1, 0.08, 0.3, '#3a3f4a', 0, 0, 0, false);
    this.hang(this.wallBack, marker, -1.5, 3.9, 0.2);
    this.add(this.box(1.2, 0.16, 1.2, '#dee2e6', 0, 0.08, 0), -1.5, -8.2);
    // göz tablosu
    const eye = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.2), new THREE.MeshBasicMaterial({ map: tex(160, 220, (x) => {
      x.fillStyle = '#ffffff';
      x.fillRect(0, 0, 160, 220);
      x.fillStyle = '#222';
      x.textAlign = 'center';
      [['E', 60], ['F P', 40], ['T O Z', 30], ['L P E D', 22], ['P E C F D', 16]].forEach(([s, f], i) => {
        x.font = `700 ${f}px Arial, sans-serif`;
        x.fillText(String(s), 80, 50 + i * 40);
      });
      x.strokeStyle = '#5cc8b8';
      x.lineWidth = 6;
      x.strokeRect(0, 0, 160, 220);
    }) }));
    this.hang(this.wallBack, eye, 4, 3, 0.03);
    // röntgen ışık kutusu
    const xc = document.createElement('canvas');
    xc.width = 160;
    xc.height = 220;
    const xctx = xc.getContext('2d')!;
    const xtex = new THREE.CanvasTexture(xc);
    xtex.colorSpace = THREE.SRGBColorSpace;
    const xray = (on: boolean) => {
      xctx.fillStyle = on ? '#0b2236' : '#1d2b38';
      xctx.fillRect(0, 0, 160, 220);
      if (on) {
        xctx.strokeStyle = '#d8f3ff';
        xctx.fillStyle = '#d8f3ff';
        xctx.lineWidth = 7;
        xctx.lineCap = 'round';
        xctx.beginPath();
        xctx.arc(80, 40, 22, 0, Math.PI * 2);
        xctx.stroke();
        xctx.fillRect(70, 52, 20, 6);
        xctx.beginPath();
        xctx.moveTo(80, 64);
        xctx.lineTo(80, 140);
        for (let r = 0; r < 4; r++) {
          xctx.moveTo(56, 76 + r * 12);
          xctx.quadraticCurveTo(80, 70 + r * 12, 104, 76 + r * 12);
        }
        xctx.moveTo(80, 70);
        xctx.lineTo(40, 120);
        xctx.moveTo(80, 70);
        xctx.lineTo(120, 120);
        xctx.moveTo(80, 140);
        xctx.lineTo(60, 205);
        xctx.moveTo(80, 140);
        xctx.lineTo(100, 205);
        xctx.stroke();
      }
      xtex.needsUpdate = true;
    };
    xray(false);
    const xb = new THREE.Group();
    xb.add(this.box(2, 2.7, 0.2, '#e9ecef', 0, 0, -0.1));
    const xs = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 2.4), new THREE.MeshBasicMaterial({ map: xtex }));
    xs.position.z = 0.02;
    xb.add(xs);
    this.hang(this.wallBack, xb, 9, 3, 0.1);
    // ilaç dolabı ve tekerlekli sandalye
    const med = this.shelf(3.6, 3, 0.9, 4, '#ffffff', () => pick(['#ff8fb1', '#4dabf7', '#ffd43b', '#69db7c', '#ffffff']), 0.45, 0.3);
    this.add(med, W / 2 - 0.55, -2, -Math.PI / 2);
    this.solid(W / 2 - 0.55, -2, 0.9, 3.6, 3);
    const wc = new THREE.Group();
    wc.add(this.box(1.2, 0.15, 1.1, '#4dabf7', 0, 0.9, 0));
    wc.add(this.box(1.2, 1.1, 0.12, '#4dabf7', 0, 1.5, -0.5));
    for (const sx of [-0.68, 0.68]) {
      const wh = mesh(new THREE.TorusGeometry(0.6, 0.07, 6, 20), toon('#5b5f6b'), false);
      wh.rotation.y = Math.PI / 2;
      wh.position.set(sx, 0.62, -0.05);
      wc.add(wh);
    }
    this.add(wc, 3, 1.5, Math.PI);
    this.add(this.plant(1.1), -11, 7.8);
    this.add(this.plant(1.1), 11, 7.8);
    void D;

    // ---- etkinlikler
    this.spot('hastane-muayene', -7.3, -3.4, 1.8, 'Muayene ol', {
      dur: 7, pose: 'sit', cam: [7, 4.5],
      start: () => void (doctor.pose = 'hold'),
      step: (t, _u, a, dt) => {
        a.pos.set(-8, 0.25, -4.4);
        a.heading = Math.PI / 2;
        if (t > 1 && t < 6 && beat(t, dt, 1, 1)) this.fx('heart');
      },
      end: (a) => {
        doctor.pose = 'idle';
        this.sparkles.burst(a.pos.clone().setY(a.pos.y + 2.4), 14, '#ff6b8a');
        this.fx('yay');
        return pick(['Doktor: Kalbin pıt pıt atıyor, sapasağlamsın!', 'Doktor: Ciğerlerin tertemiz. Derin bir nefes al!', 'Doktor: Bol su iç, meyve ye; hep böyle sağlıklı kal!']);
      },
    });
    let cm = 120;
    this.spot('hastane-boy', -1.5, -6.6, 1.6, 'Boyunu ölç', {
      dur: 3.5, pose: 'idle', cam: [6, 3.5],
      start: () => void (cm = 110 + Math.floor(Math.random() * 25)),
      step: (_t, u, a) => {
        a.pos.set(-1.5, 0.16, -8.2);
        a.heading = 0;
        marker.position.y = 3.9 - sm(clamp01(u * 1.4)) * 1.6;
      },
      end: () => {
        this.fx('yay');
        return `Boyun ${cm} santim! Kocaman olmuşsun.`;
      },
    });
    this.spot('hastane-goz', 4, -6.2, 1.6, 'Göz testi yap', {
      dur: 4, pose: 'wave', cam: [7, 4],
      step: (t, _u, a, dt) => {
        a.pos.set(4, 0, -5.4);
        a.heading = Math.PI;
        if (beat(t, dt, 0.8)) this.fx('pop');
      },
      end: () => 'E… F, P… T, O, Z! Gözlerin kartal gibi keskin!',
    });
    this.spot('hastane-rontgen', 9, -6.2, 1.6, 'Röntgen çek', {
      dur: 4, pose: 'idle', cam: [7, 4],
      start: () => this.fx('buzz'),
      step: (t, _u, a, dt) => {
        a.pos.set(9, 0, -6.6);
        a.heading = 0;
        xray(t > 1);
        if (beat(t, dt, 0.5, 1)) this.fx('buzz');
      },
      end: () => {
        setTimeout(() => xray(false), 3000);
        return 'Röntgen çekildi: kemiklerin sapasağlam!';
      },
    });
    const wheelPath = new THREE.CatmullRomCurve3([[3, 1.5], [6, -1], [5, -4], [0, -3.5], [-3, -1], [-1, 2.5], [3, 1.5]].map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'centripetal');
    this.spot('hastane-sandalye', 3, 3.3, 1.6, 'Tekerlekli sandalyeye bin', {
      dur: 9, pose: 'sit', cam: [9, 6],
      step: (_t, u, a) => {
        const p = wheelPath.getPointAt(sm(u)), tg = wheelPath.getTangentAt(sm(u));
        wc.position.copy(p);
        wc.rotation.y = Math.atan2(tg.x, tg.z) + Math.PI;
        a.pos.set(p.x, 0.05, p.z);
        a.heading = Math.atan2(tg.x, tg.z);
        wc.children.forEach((c) => (c as THREE.Mesh).geometry.type === 'TorusGeometry' && (c.rotation.x += 0.2));
      },
      end: () => {
        wc.position.set(3, 0, 1.5);
        wc.rotation.y = Math.PI;
        return 'Tekerlekli sandalyeyle hastaneyi turladın!';
      },
    });
    this.spot('hastane-bant', -7, 6.2, 1.6, 'Yara bandı al', {
      dur: 1.6, pose: 'hold', step: (_t, _u, a) => void (a.heading = Math.PI),
      end: (a) => {
        const b = this.box(0.5, 0.18, 0.06, '#ffc9a8', 0, 0, 0.1, false);
        b.add(this.box(0.18, 0.12, 0.08, '#ff8fb1', 0, 0, 0.01, false));
        holdItem(a, b);
        return 'Hemşire: Kalpli yara bandın hazır!';
      },
    });
  }

  // ----------------------------------------------------------------------------------------------
  // Market
  // ----------------------------------------------------------------------------------------------
  private market() {
    const { W, D } = this;
    const PROD = ['#ef4b4b', '#ffd43b', '#4dabf7', '#69db7c', '#ff9f43', '#ffffff', '#9775fa', '#f783ac'];
    // reyonlar (iki yüzlü raflar)
    for (const x of [-6, 0, 6]) {
      for (const side of [0, Math.PI]) {
        const s = this.shelf(8, 3, 0.9, 4, '#e9ecef', () => pick(PROD), 0.55, 0.42);
        this.add(s, x + (side ? -0.46 : 0.46), -2.4, side + Math.PI / 2);
      }
      this.solid(x, -2.4, 1.9, 8, 3);
      const tag = board(['MEYVE SUYU', 'ATIŞTIRMALIK', 'TEMİZLİK'][[-6, 0, 6].indexOf(x)], '#2bb673', '#ffffff', 3, 0.6, 700);
      tag.position.set(x, 3.6, 1.62);
      this.scene.add(tag);
    }
    // buzdolapları (arka duvar)
    for (let i = 0; i < 4; i++) {
      const f = new THREE.Group();
      f.add(this.box(3, 4, 1.1, '#dee2e6', 0, 2, 0));
      const glass = mesh(new THREE.BoxGeometry(2.6, 3.4, 0.05), toon('#cfeaff', { emissive: '#2a4a5a' }), false);
      glass.position.set(0, 2.1, 0.56);
      f.add(glass);
      for (let r = 0; r < 3; r++) for (let k = 0; k < 6; k++) {
        const b = mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.7, 8), toon(PROD[(i * 3 + k + r) % PROD.length]), false);
        b.position.set(-1.05 + k * 0.42, 0.95 + r * 1.1, 0.2);
        f.add(b);
      }
      this.add(f, -9 + i * 3.2, -D / 2 + 0.6);
    }
    this.solid(-4.2, -D / 2 + 0.6, 13, 1.1, 4);
    // meyve sebze tezgâhı
    const crate = (x: number, z: number, color: string, kind: 'ball' | 'long' = 'ball') => {
      const g = new THREE.Group();
      g.add(this.box(1.6, 1, 1.2, '#c98a4b', 0, 0.5, 0));
      for (let i = 0; i < 9; i++) {
        const m = kind === 'ball' ? mesh(new THREE.SphereGeometry(0.2, 8, 6), toon(color), false) : mesh(new THREE.CapsuleGeometry(0.08, 0.4, 4, 6), toon(color), false);
        m.position.set(-0.5 + (i % 3) * 0.5, 1.1, -0.35 + Math.floor(i / 3) * 0.35);
        if (kind === 'long') m.rotation.z = Math.PI / 2;
        g.add(m);
      }
      this.add(g, x, z, 0.2);
      this.solid(x, z, 1.6, 1.2, 1.2);
    };
    crate(8.4, 5, '#ef4b4b');
    crate(10.2, 5, '#ff9f43');
    crate(8.4, 7, '#ffd43b', 'long');
    crate(10.2, 7, '#ff8a3d', 'long');
    const melon = outline(mesh(new THREE.SphereGeometry(0.6, 14, 10), toon('#2f9e44')), 1.04);
    melon.scale.set(1.2, 1, 1);
    this.add(melon, 11.8, 6, 0, 0.6);
    // kasa
    const till = new THREE.Group();
    till.add(this.box(5, 1.4, 1.4, '#ffffff', 0, 0.7, 0));
    const belt = mesh(new THREE.BoxGeometry(3.2, 0.05, 1), toon('#3a3f4a'), false);
    belt.position.set(-0.8, 1.43, 0);
    till.add(belt);
    till.add(this.box(0.9, 0.7, 0.7, '#5b5f6b', 1.8, 1.75, 0));
    const scr = mesh(new THREE.BoxGeometry(0.6, 0.4, 0.05), toon('#9ad7ff', { emissive: '#1a3a4a' }), false);
    scr.position.set(1.8, 2.3, 0.2);
    till.add(scr);
    this.add(till, -8, 5.2, Math.PI / 2);
    this.solid(-8, 5.2, 1.4, 5, 1.5);
    const cashier = this.npc({ gender: 'kiz', top: 'yelek', topColor: '#2bb673', bottom: 'pantolon', bottomColor: '#3a3f4a', hat: 'kep', hatColor: '#2bb673', hair: 'ikikuyruk' }, -9.4, 6, Math.PI / 2, 'idle', 1.15, 2);
    // alışveriş arabaları
    const cartModel = () => {
      const g = new THREE.Group();
      const basket = mesh(new THREE.BoxGeometry(1.1, 0.8, 1.5), new THREE.MeshToonMaterial({ color: '#c0c6cf', transparent: true, opacity: 0.85 }), false);
      basket.position.y = 1.15;
      const frameB = mesh(new THREE.BoxGeometry(1.14, 0.06, 1.54), toon('#e03131'), false);
      frameB.position.y = 1.56;
      const handle = mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.1, 6), toon('#e03131'), false);
      handle.rotation.z = Math.PI / 2;
      handle.position.set(0, 1.75, -0.85);
      g.add(basket, frameB, handle);
      for (const [x, z] of [[-0.45, -0.6], [0.45, -0.6], [-0.45, 0.6], [0.45, 0.6]]) {
        const w = mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 10), toon('#3a3f4a'), false);
        w.rotation.z = Math.PI / 2;
        w.position.set(x, 0.12, z);
        const leg = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 5), toon('#c0c6cf'), false);
        leg.position.set(x, 0.5, z);
        g.add(w, leg);
      }
      return g;
    };
    const myCart = cartModel();
    this.add(myCart, -W / 2 + 1.6, 7.8);
    for (let i = 1; i < 3; i++) this.add(cartModel(), -W / 2 + 1.6, 7.8 - i * 0.6, 0, 0.02 * i);
    this.solid(-W / 2 + 1.6, 7, 1.4, 2.4, 2);
    // dondurma dolabı
    const frz = new THREE.Group();
    frz.add(this.box(3, 1.3, 1.5, '#ffffff', 0, 0.65, 0));
    const lid = mesh(new THREE.BoxGeometry(2.8, 0.06, 1.3), toon('#cfeaff', { transparent: true, opacity: 0.6 }), false);
    lid.position.y = 1.33;
    frz.add(lid);
    for (let i = 0; i < 6; i++) frz.add(this.box(0.6, 0.3, 0.4, PROD[i], -1 + (i % 3) * 1, 1.1, -0.3 + Math.floor(i / 3) * 0.6, false));
    this.add(frz, W / 2 - 1.2, -3, Math.PI / 2);
    this.solid(W / 2 - 1.2, -3, 1.5, 3, 1.4);

    // ---- etkinlikler
    const route = new THREE.CatmullRomCurve3([[-11.2, 7], [-11, 2.4], [-3, 2.2], [-3, -7.2], [3, -7.2], [3, 2.2], [9, 2.2], [9, -7], [9.5, 1], [-5, 3.4], [-6.4, 5.2]].map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'centripetal');
    const goods: THREE.Object3D[] = [];
    this.spot('market-araba', -W / 2 + 2.4, 6, 1.8, 'Alışveriş arabasını it', {
      dur: 16, pose: 'hold', cam: [9, 6], follow: true,
      start: () => {
        goods.forEach((g) => g.removeFromParent());
        goods.length = 0;
      },
      step: (t, u, a, dt) => {
        const s = sm(u), p = route.getPointAt(s), tg = route.getTangentAt(s);
        const h = Math.atan2(tg.x, tg.z);
        a.pos.set(p.x - Math.sin(h) * 0.9, 0, p.z - Math.cos(h) * 0.9);
        a.heading = h;
        myCart.position.set(p.x + Math.sin(h) * 0.4, 0, p.z + Math.cos(h) * 0.4);
        myCart.rotation.y = h;
        if (beat(t, dt, 1.6, 1) && goods.length < 8) {
          const g = this.box(0.35, 0.35, 0.35, pick(PROD), -0.3 + (goods.length % 3) * 0.3, 0.95 + Math.floor(goods.length / 3) * 0.2, -0.3 + (goods.length % 2) * 0.5, false);
          myCart.add(g);
          goods.push(g);
          this.fx('pop');
        }
      },
      end: () => {
        myCart.position.set(-W / 2 + 1.6, 0, 7.8);
        myCart.rotation.y = 0;
        this.fx('cash');
        return `Arabana ${goods.length} ürün doldurdun!`;
      },
    });
    this.spot('market-meyve', 9.3, 3.4, 1.7, 'Meyve seç', {
      dur: 1.8, pose: 'hold', step: (_t, _u, a) => void (a.heading = 0),
      end: (a) => {
        const c = pick(['#ef4b4b', '#ff9f43', '#ffd43b']);
        holdItem(a, outline(mesh(new THREE.SphereGeometry(0.22, 10, 8), toon(c)), 1.08));
        return c === '#ffd43b' ? 'Sapsarı bir limon seçtin!' : c === '#ef4b4b' ? 'Kıpkırmızı bir elma seçtin!' : 'Mis kokulu bir portakal seçtin!';
      },
    });
    const items: THREE.Object3D[] = [];
    this.spot('market-kasa', -6.4, 6.8, 1.7, 'Kasada öde', {
      dur: 5, pose: 'idle', cam: [8, 5],
      start: () => {
        cashier.pose = 'wave';
        for (let i = 0; i < 3; i++) {
          const b = this.box(0.45, 0.45, 0.45, pick(PROD), 0, 0, 0, false);
          this.scene.add(b);
          items.push(b);
        }
      },
      step: (t, _u, a, dt) => {
        a.pos.set(-6.4, 0, 6.6);
        a.heading = -Math.PI / 2;
        items.forEach((b, i) => {
          const k = clamp01((t - i * 1.1) / 1.8);
          b.position.set(-7.9, 1.65, 6.6 - k * 3);
        });
        if (beat(t, dt, 1.1, 1.6)) this.fx('cash');
      },
      end: () => {
        cashier.pose = 'idle';
        items.forEach((b) => b.removeFromParent());
        items.length = 0;
        return pick(['Kasiyer: Toplam 12 lira, teşekkür ederiz!', 'Kasiyer: Poşet ister misin? İyi günler!', 'Kasiyer: Fişiniz burada, yine bekleriz!']);
      },
    });
    this.spot('market-dondurma', W / 2 - 3, -3, 1.6, 'Dondurma al', {
      dur: 1.6, pose: 'hold', step: (_t, _u, a) => void (a.heading = Math.PI / 2),
      end: (a) => {
        const c = new THREE.Group();
        const cone = mesh(new THREE.ConeGeometry(0.16, 0.45, 10), toon('#e2a868'), false);
        cone.rotation.x = Math.PI;
        const top = outline(mesh(new THREE.SphereGeometry(0.2, 10, 8), toon(pick(['#ff8fb1', '#fff1c7', '#9be7de']))), 1.08);
        top.position.y = 0.28;
        c.add(cone, top);
        holdItem(a, c);
        return 'Buz gibi bir dondurma aldın!';
      },
    });
  }

  // ----------------------------------------------------------------------------------------------
  // Kütüphane
  // ----------------------------------------------------------------------------------------------
  private library() {
    const { W, D } = this;
    const BOOK = () => pick(['#b03a2e', '#1f618d', '#196f3d', '#b9770e', '#6c3483', '#2e4053', '#a04000', '#117a65']);
    for (let i = 0; i < 4; i++) {
      const s = this.shelf(4.6, 4.6, 1, 6, '#7b4b2a', BOOK);
      this.add(s, -8 + i * 5.2, -D / 2 + 0.6);
    }
    this.solid(-0.2, -D / 2 + 0.6, 21, 1, 4.6);
    for (const z of [-3, 2]) {
      const s = this.shelf(4.4, 4.6, 1, 6, '#7b4b2a', BOOK);
      this.add(s, -W / 2 + 0.6, z, Math.PI / 2);
      this.solid(-W / 2 + 0.6, z, 1, 4.4, 4.6);
    }
    // okuma masaları ve lambalar
    for (const x of [-1.5, 3.5]) {
      const t = this.table(3.2, 1.8, '#7b4b2a', 1.4);
      const lamp = new THREE.Group();
      lamp.add(this.box(0.1, 0.6, 0.1, '#b9a36b', 0, 0.3, 0, false));
      const shade = mesh(new THREE.CylinderGeometry(0.2, 0.35, 0.3, 10, 1, true), toon('#2f9e44', { emissive: '#103a1a' }), false);
      shade.position.y = 0.65;
      lamp.add(shade);
      lamp.position.set(0.9, 1.47, 0);
      t.add(lamp);
      this.add(t, x, 1);
      this.solid(x, 1, 3.2, 1.8, 1.5);
      for (const sz of [-1.3, 1.3]) this.add(this.chair('#a8662e'), x, 1 + sz, sz < 0 ? 0 : Math.PI);
    }
    // çocuk köşesi: halı, minderler
    const rug = mesh(new THREE.CircleGeometry(3.2, 32).rotateX(-Math.PI / 2), toon('#ffcf6b'), false);
    rug.position.set(-6.5, 0.02, -2.5);
    this.scene.add(rug);
    for (const [x, z, c] of [[-7.6, -1.6, '#ff8fb1'], [-5.2, -1.4, '#4dabf7'], [-6.4, -3.8, '#69db7c']] as const) {
      const bb = outline(mesh(new THREE.SphereGeometry(0.75, 14, 10), toon(c)), 1.04);
      bb.scale.set(1, 0.6, 1);
      this.add(bb, x, z, 0, 0.42);
    }
    // kukla tiyatrosu
    const th = new THREE.Group();
    th.add(this.box(3.4, 2.4, 0.8, '#c0392b', 0, 1.2, 0));
    th.add(this.box(3.6, 0.6, 0.9, '#f1c40f', 0, 4.6, 0));
    for (const sx of [-1.5, 1.5]) th.add(this.box(0.4, 2.2, 0.8, '#c0392b', sx, 3.3, 0));
    const stageBack = mesh(new THREE.PlaneGeometry(2.6, 2), toon('#2c3e50'), false);
    stageBack.position.set(0, 3.3, -0.3);
    th.add(stageBack);
    const puppet = (c: string) => {
      const g = new THREE.Group();
      const b = outline(mesh(new THREE.ConeGeometry(0.4, 0.9, 10), toon(c)), 1.05);
      b.position.y = 0.45;
      const hd = outline(mesh(new THREE.SphereGeometry(0.3, 12, 10), toon('#f6c9a0')), 1.05);
      hd.position.y = 1.1;
      g.add(b, hd);
      return g;
    };
    const p1 = puppet('#9775fa'), p2 = puppet('#ff8a3d');
    p1.position.set(-0.6, 2.3, 0.1);
    p2.position.set(0.6, 2.3, 0.1);
    th.add(p1, p2);
    this.add(th, 7, -5.4, -0.2);
    this.solid(7, -5.4, 3.6, 1, 3);
    // kütüphaneci
    const desk = new THREE.Group();
    desk.add(this.box(3.6, 1.5, 1.2, '#7b4b2a', 0, 0.75, 0));
    const sgn = board('SESSİZ OLALIM', '#2e4053', '#ffffff', 2.6, 0.5, 700);
    sgn.position.set(0, 1.05, 0.62);
    desk.add(sgn);
    this.add(desk, 7, 5, Math.PI);
    this.solid(7, 5, 3.6, 1.2, 1.6);
    const librarian = this.npc({ gender: 'erkek', top: 'kazak', topColor: '#a8662e', bottom: 'pantolon', bottomColor: '#2e4053', glasses: 'kare', hair: 'yan', hairColor: '#8a8a8a' }, 7, 6.4, Math.PI, 'idle', 1.2, 9);
    this.add(this.plant(1.2), W / 2 - 1, -D / 2 + 1.4);

    // ---- etkinlikler
    const STORIES = [
      'Masal: Küçük kaplumbağa yavaş ama hiç pes etmeden yürüdü ve yarışı kazandı!',
      'Masal: Ay Dede her gece çocuklara ışık tuttu, yıldızlar da ona şarkı söyledi.',
      'Masal: Minik bulut ağladı, yağmur oldu; çiçekler ona teşekkür etti.',
      'Kitapta okudun: Ahtapotun üç kalbi varmış!',
      'Kitapta okudun: Bal arıları dans ederek yolu birbirine anlatırmış.',
    ];
    const book = () => outline(mesh(new THREE.BoxGeometry(0.5, 0.65, 0.12), toon(BOOK())), 1.08);
    this.spot('kutuphane-oku', -6.4, -1.4, 1.8, 'Minderde kitap oku', {
      dur: 7, pose: 'sit', cam: [7, 4.5],
      start: (a) => holdItem(a, book()),
      step: (t, _u, a, dt) => {
        a.pos.set(-6.4, -0.3, -3.8);
        a.heading = 0.4;
        if (beat(t, dt, 1.6, 0.8)) this.fx('page');
      },
      end: (a) => {
        a.hand.getObjectByName('held')?.removeFromParent();
        return pick(STORIES);
      },
    });
    this.spot('kutuphane-kukla', 6.4, -2.6, 1.8, 'Kukla gösterisi izle', {
      dur: 8, pose: (u) => (u > 0.85 ? 'clap' : 'sit'), cam: [8, 4],
      step: (t, _u, a, dt) => {
        a.pos.set(6.6, -0.5, -2.2);
        a.heading = Math.PI - 0.2;
        p1.position.y = 2.3 + Math.abs(Math.sin(t * 5)) * 0.4 * (Math.floor(t) % 2 ? 1 : 0.2);
        p2.position.y = 2.3 + Math.abs(Math.sin(t * 5 + 1)) * 0.4 * (Math.floor(t) % 2 ? 0.2 : 1);
        if (beat(t, dt, 0.5)) this.fx('pop');
      },
      end: () => {
        p1.position.y = p2.position.y = 2.3;
        return pick(['Kukla Pıtırcık: "Kitap okumak beni uzaya götürdü!"', 'Kukla Zıpzıp: "En güzel hazine bir masal kitabıdır!"']);
      },
    });
    this.spot('kutuphane-masa', -1.5, 3.2, 1.6, 'Masada ders çalış', {
      dur: 6, pose: 'sit', cam: [7, 4.5],
      start: (a) => holdItem(a, book()),
      step: (t, _u, a, dt) => {
        a.pos.set(-1.5, 0, 2.3);
        a.heading = Math.PI;
        if (beat(t, dt, 2, 1)) this.fx('page');
      },
      end: (a) => {
        a.hand.getObjectByName('held')?.removeFromParent();
        return 'Ders çalıştın; çok akıllısın!';
      },
    });
    this.spot('kutuphane-odunc', 7, 3.4, 1.6, 'Kitap ödünç al', {
      dur: 2.4, pose: 'hold', cam: [7, 4],
      start: () => void (librarian.pose = 'hold'),
      step: (t, _u, a, dt) => {
        a.pos.set(7, 0, 3.5);
        a.heading = 0;
        if (beat(t, dt, 99, 1)) this.fx('thump');
      },
      end: (a) => {
        librarian.pose = 'idle';
        holdItem(a, book());
        return 'Kütüphaneci: Kitabını iki hafta sonra getir. İyi okumalar!';
      },
    });
  }

  // ----------------------------------------------------------------------------------------------
  // Pastane
  // ----------------------------------------------------------------------------------------------
  private bakery() {
    const { D } = this;
    const cake = (s = 1, top = '#ff8fb1') => {
      const g = new THREE.Group();
      g.add(outline(mesh(new THREE.CylinderGeometry(0.6 * s, 0.6 * s, 0.4 * s, 18), toon('#fff1c7')), 1.05).translateY(0.2 * s));
      g.add(mesh(new THREE.CylinderGeometry(0.62 * s, 0.62 * s, 0.1 * s, 18), toon(top), false).translateY(0.42 * s));
      return g;
    };
    // vitrin
    const vit = new THREE.Group();
    vit.add(this.box(9, 1.3, 1.6, '#ffffff', 0, 0.65, 0));
    const glass = mesh(new THREE.BoxGeometry(9, 1.2, 1.5), toon('#e6f7ff', { transparent: true, opacity: 0.35 }), false);
    glass.position.y = 1.9;
    vit.add(glass);
    ['#ff8fb1', '#8b5a2b', '#ffd43b', '#69db7c', '#ffffff', '#9775fa'].forEach((c, i) => {
      const k = cake(0.8, c);
      k.position.set(-3.8 + i * 1.5, 1.32, 0);
      vit.add(k);
    });
    this.add(vit, 0, -1.2);
    this.solid(0, -1.2, 9, 1.6, 2.5);
    // fırınlar ve tezgâh (arka)
    const ovens: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const o = new THREE.Group();
      o.add(this.box(2.4, 2.4, 1.4, '#c0c6cf', 0, 1.2, 0));
      const win = mesh(new THREE.BoxGeometry(1.6, 0.9, 0.05), toon('#ff9f43', { emissive: '#552200' }), false);
      win.position.set(0, 1.3, 0.71);
      o.add(win);
      ovens.push(win);
      o.add(this.box(1.8, 0.1, 0.1, '#5b5f6b', 0, 2, 0.75, false));
      this.add(o, -6 + i * 2.8, -D / 2 + 0.8);
    }
    this.solid(-3.2, -D / 2 + 0.8, 8.4, 1.4, 2.4);
    const sacks = this.box(1.2, 1.2, 0.9, '#f4f1ea', 0, 0.6, 0);
    this.add(sacks, 6.5, -D / 2 + 1);
    this.solid(6.5, -D / 2 + 1, 1.2, 0.9);
    const baker = this.npc({ gender: 'erkek', top: 'gomlek', topColor: '#ffffff', bottom: 'pantolon', bottomColor: '#3a3f4a', hat: 'sef', hatColor: '#ffffff', hair: 'kisa' }, 1.5, -3.3, 0, 'idle', 1.2, 10);
    // kafe masaları
    for (const [x, z] of [[-6, 3.6], [-2, 5]] as const) {
      const t = new THREE.Group();
      t.add(this.box(0.12, 1.3, 0.12, '#5b5f6b', 0, 0.65, 0, false));
      t.add(outline(mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.1, 18), toon('#ffffff')), 1.04).translateY(1.35));
      t.add(mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.25, 10), toon('#e9487d'), false).translateY(1.5));
      this.add(t, x, z);
      this.solid(x, z, 1.6, 1.6, 1.4);
      this.add(this.chair('#ff8fb1'), x, z + 1.3, Math.PI);
    }
    // süsleme masası
    const dt0 = this.table(2.4, 1.6, '#ffffff', 1.3);
    this.add(dt0, 6, 3);
    this.solid(6, 3, 2.4, 1.6, 1.4);
    const deco = cake(1.2, '#ffffff');
    deco.position.set(6, 1.37, 3);
    this.scene.add(deco);
    const toppings: THREE.Object3D[] = [];
    const sgn = board('PASTANE', '#e9487d', '#ffffff', 4, 0.9, 800);
    this.hang(this.wallBack, sgn, 0, 4.4, 0.04);

    // ---- etkinlikler
    this.spot('pastane-susle', 6, 4.7, 1.6, 'Pasta süsle', {
      dur: 6, pose: 'hold', cam: [6, 4],
      start: () => {
        toppings.forEach((t) => t.removeFromParent());
        toppings.length = 0;
      },
      step: (t, _u, a, dt) => {
        a.pos.set(6, 0, 4.3);
        a.heading = Math.PI;
        if (beat(t, dt, 0.6, 0.4) && toppings.length < 9) {
          const k = toppings.length;
          const ang = (k / 8) * Math.PI * 2;
          const obj = k === 8
            ? mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 6), toon('#4dabf7'), false)
            : outline(mesh(new THREE.SphereGeometry(0.12, 8, 6), toon(k % 2 ? '#ef4b4b' : '#ff8fb1')), 1.1);
          obj.position.set(6 + (k === 8 ? 0 : Math.cos(ang) * 0.5), 1.37 + 0.62 + (k === 8 ? 0.25 : 0.06), 3 + (k === 8 ? 0 : Math.sin(ang) * 0.5));
          this.scene.add(obj);
          toppings.push(obj);
          this.fx('pop');
        }
      },
      end: () => {
        this.fx('yay');
        this.sparkles.burst(new THREE.Vector3(6, 2.4, 3), 12, '#ffd1e8');
        return 'Çilekli, mumlu bir doğum günü pastası yaptın!';
      },
    });
    this.spot('pastane-firin', -3.2, -4.8, 1.8, 'Kurabiye pişir', {
      dur: 6, pose: (u) => (u > 0.85 ? 'hold' : 'idle'), cam: [7, 4.5],
      step: (t, u, a, dt) => {
        a.pos.set(-3.2, 0, -5);
        a.heading = Math.PI;
        for (const o of ovens) (o.material as THREE.MeshToonMaterial).emissive.set(u < 0.85 ? new THREE.Color('#552200').lerp(new THREE.Color('#ff7a00'), Math.sin(t * 3) * 0.5 + 0.5) : '#552200');
        if (beat(t, dt, 99, 5)) this.fx('bell');
      },
      end: (a) => {
        holdItem(a, outline(mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.08, 14), toon('#d9984a')), 1.08));
        return 'Ding! Çikolatalı kurabiyelerin pişti!';
      },
    });
    this.spot('pastane-ye', -6, 6.2, 1.6, 'Masada kek ye', {
      dur: 5, pose: 'sit', cam: [7, 4.5],
      step: (_t, _u, a) => {
        a.pos.set(-6, 0, 4.85);
        a.heading = Math.PI;
      },
      end: (a) => {
        const c = new THREE.Group();
        c.add(mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.22, 10), toon('#ff8fb1'), false));
        c.add(outline(mesh(new THREE.SphereGeometry(0.2, 10, 8), toon('#fff1c7')), 1.08).translateY(0.16));
        holdItem(a, c);
        this.fx('yay');
        return 'Nefis bir kek yedin, çay da yanında!';
      },
    });
    this.spot('pastane-al', 0, 0.6, 1.6, 'Vitrinden pasta seç', {
      dur: 2.2, pose: 'hold', cam: [7, 4],
      start: () => void (baker.pose = 'wave'),
      step: (_t, _u, a) => {
        a.pos.set(0, 0, 0.6);
        a.heading = Math.PI;
      },
      end: (a) => {
        baker.pose = 'idle';
        const s = new THREE.Group();
        s.add(outline(mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.25, 3, 1, false, 0, Math.PI / 2), toon('#fff1c7')), 1.08));
        holdItem(a, s);
        return 'Pastacı: Afiyet olsun, çilekli dilimin hazır!';
      },
    });
  }

  // ----------------------------------------------------------------------------------------------
  // İtfaiye
  // ----------------------------------------------------------------------------------------------
  private fireStation() {
    const { W, D } = this;
    // tuğla duvar dokusu
    const brick = tex(256, 128, (x) => {
      x.fillStyle = '#b5523f';
      x.fillRect(0, 0, 256, 128);
      x.strokeStyle = '#e8d8c8';
      x.lineWidth = 3;
      for (let r = 0; r < 8; r++) {
        x.beginPath();
        x.moveTo(0, r * 16);
        x.lineTo(256, r * 16);
        x.stroke();
        for (let c = 0; c < 9; c++) {
          const xx = c * 32 + (r % 2 ? 16 : 0);
          x.beginPath();
          x.moveTo(xx, r * 16);
          x.lineTo(xx, r * 16 + 16);
          x.stroke();
        }
      }
    }, [4, 2]);
    for (const w of this.walls) w.full.children.forEach((c) => {
      const m = c as THREE.Mesh;
      if (m.isMesh && (m.geometry as THREE.BoxGeometry).parameters?.height === H) m.material = new THREE.MeshToonMaterial({ map: brick });
    });
    // sarı çizgiler
    for (const x of [-9, -1]) {
      const l = mesh(new THREE.PlaneGeometry(0.3, 14).rotateX(-Math.PI / 2), toon('#ffd43b'), false);
      l.position.set(x, 0.02, -1);
      this.scene.add(l);
    }
    // itfaiye aracı
    const truck = new THREE.Group();
    truck.add(this.box(3, 2.4, 7, '#e03131', 0, 1.7, -0.6));
    truck.add(this.box(3, 1.6, 2, '#e03131', 0, 3.3, 2));
    const ws = mesh(new THREE.BoxGeometry(2.6, 0.9, 0.08), toon('#cfeaff', { emissive: '#22333d' }), false);
    ws.position.set(0, 3.5, 3.02);
    truck.add(ws);
    truck.add(this.box(1, 0.25, 6, '#c0c6cf', 0, 3.05, -1.2));
    const red = mesh(new THREE.BoxGeometry(0.6, 0.3, 0.4), new THREE.MeshBasicMaterial({ color: '#661010' }), false);
    red.position.set(-0.7, 4.25, 2);
    const blue = mesh(new THREE.BoxGeometry(0.6, 0.3, 0.4), new THREE.MeshBasicMaterial({ color: '#10204a' }), false);
    blue.position.set(0.7, 4.25, 2);
    truck.add(red, blue);
    for (const [x, z] of [[-1.5, -2.6], [1.5, -2.6], [-1.5, 2], [1.5, 2]]) {
      const w = mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.45, 14), toon('#2b2b2b'));
      w.rotation.z = Math.PI / 2;
      w.position.set(x, 0.65, z);
      truck.add(w);
    }
    this.add(truck, -5, -1.4);
    this.solid(-5, -1.4, 3.2, 7.4, 4.2);
    // asma kat, merdiven, direk
    const mx = 8, mz = -6.5, mw = 9, md = 6, my = 3.4;
    const loft = new THREE.Group();
    loft.add(this.box(mw, 0.3, md, '#8d939e', 0, my - 0.15, 0));
    for (const [x, z] of [[-mw / 2 + 0.3, md / 2 - 0.3], [mw / 2 - 0.3, md / 2 - 0.3]]) loft.add(this.box(0.3, my, 0.3, '#5b5f6b', x, my / 2, z));
    const railM = toon('#ffd43b');
    const rail = mesh(new THREE.BoxGeometry(mw - 2.4, 0.12, 0.12), railM, false);
    rail.position.set(1.2, my + 1.1, md / 2);
    loft.add(rail);
    this.add(loft, mx, mz);
    this.decks.push({ x: mx, z: mz, w: mw, d: md, y: my });
    this.solid(mx - mw / 2 + 0.3, mz + md / 2 - 0.3, 0.4, 0.4, 3.3);
    this.solid(mx + mw / 2 - 0.3, mz + md / 2 - 0.3, 0.4, 0.4, 3.3);
    const stairs = new THREE.Group();
    for (let i = 0; i < 8; i++) stairs.add(this.box(1.8, 0.2, 0.6, '#8d939e', 0, (i + 1) * (my / 8) - 0.1, -i * 0.6, false));
    this.add(stairs, W / 2 - 1.3, mz + md / 2 + 4.8);
    this.solid(W / 2 - 1.3, mz + md / 2 + 2.7, 1.8, 4.8, 1.2);
    const pole = mesh(new THREE.CylinderGeometry(0.1, 0.1, my + 2, 10), toon('#e9ecef', { emissive: '#555a60' }), false);
    pole.position.set(mx - mw / 2 + 1.2, (my + 2) / 2, mz + md / 2 + 0.6);
    this.scene.add(pole);
    // mont ve kask askısı
    for (let i = 0; i < 4; i++) {
      const g = new THREE.Group();
      g.add(this.box(1, 1.6, 0.4, '#ffd43b', 0, 2.3, 0));
      g.add(this.box(1.02, 0.12, 0.42, '#c0c6cf', 0, 1.8, 0, false));
      const helm = outline(mesh(new THREE.SphereGeometry(0.42, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon('#e03131')), 1.06);
      helm.position.y = 3.4;
      g.add(helm);
      this.add(g, -W / 2 + 0.6, 2 + i * 1.4, Math.PI / 2);
    }
    this.solid(-W / 2 + 0.6, 4.1, 0.6, 5.6, 3.6);
    // alarm zili
    const bell = outline(mesh(new THREE.SphereGeometry(0.5, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon('#e03131')), 1.06);
    bell.rotation.x = Math.PI / 2;
    this.hang(this.wallBack, bell, -1, 4, 0.3);
    const alarmLamp = mesh(new THREE.SphereGeometry(0.3, 10, 8), new THREE.MeshBasicMaterial({ color: '#661010' }), false);
    this.hang(this.wallBack, alarmLamp, 1, 4.6, 0.3);
    // hortum makarası ve hedef koni
    const reel = new THREE.Group();
    reel.add(outline(mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.5, 16), toon('#e03131')), 1.04).rotateX(Math.PI / 2).translateY(0));
    reel.position.y = 1.2;
    this.add(reel, 5, 7.6);
    const cone = outline(mesh(new THREE.ConeGeometry(0.5, 1.2, 12), toon('#ff8a3d')), 1.05);
    this.add(cone, 10.5, 5, 0, 0.6);
    this.solid(10.5, 5, 1, 1, 1.2);
    const ff = this.npc({ gender: 'erkek', dress: 'yagmurluk', dressColor: '#ffd43b', hat: 'kep', hatColor: '#e03131', hair: 'kisa' }, 1.5, 3, Math.PI, 'idle', 1.22, 7);
    let flash = false;
    this.ticks.push((_dt, t) => {
      const on = flash && Math.floor(t * 4) % 2 === 0;
      (red.material as THREE.MeshBasicMaterial).color.set(on ? '#ff3b3b' : '#661010');
      (blue.material as THREE.MeshBasicMaterial).color.set(flash && !on ? '#3b7bff' : '#10204a');
      (alarmLamp.material as THREE.MeshBasicMaterial).color.set(on ? '#ff3b3b' : '#661010');
    });

    // ---- etkinlikler
    const top = new THREE.Vector3(mx - mw / 2 + 1.2, my, mz + md / 2 - 0.5);
    this.spot('itfaiye-direk', W / 2 - 1.3, mz + md / 2 + 5.6, 1.8, 'Merdivenden çık, direkten kay', {
      dur: 6, pose: (u) => (u < 0.45 ? 'climb' : u < 0.65 ? 'walk' : 'cheer'), cam: [10, 6],
      step: (t, u, a, dt) => {
        const s0 = new THREE.Vector3(W / 2 - 1.3, 0, mz + md / 2 + 5.4), s1 = new THREE.Vector3(W / 2 - 1.3, my, mz + md / 2 - 0.6);
        if (u < 0.45) {
          a.pos.lerpVectors(s0, s1, u / 0.45);
          a.heading = Math.PI;
          if (beat(t, dt, 0.3)) this.fx('step');
        } else if (u < 0.65) {
          a.pos.lerpVectors(s1, top, (u - 0.45) / 0.2);
          a.heading = -Math.PI / 2;
        } else {
          const k = (u - 0.65) / 0.35;
          a.pos.set(top.x, my * (1 - k * k), top.z + 1.1);
          a.heading += 0.2;
          if (beat(t, dt, 99, 6 * 0.65)) {
            this.fx('whistle');
            this.fx('wee');
          }
        }
      },
      end: () => {
        this.fx('thump');
        return 'Vuuuş! Gerçek bir itfaiyeci gibi direkten kaydın!';
      },
    });
    this.spot('itfaiye-alarm', 0, -7.4, 1.8, 'Alarm zilini çal', {
      dur: 4, pose: 'cheer', cam: [8, 5],
      start: () => {
        flash = true;
        ff.pose = 'cheer';
      },
      step: (t, _u, a, dt) => {
        a.pos.set(0, 0, -7.6);
        a.heading = Math.PI;
        bell.rotation.z = Math.sin(t * 40) * 0.2;
        if (beat(t, dt, 0.7)) this.fx('bell');
        if (beat(t, dt, 0.9, 0.3)) this.fx('siren');
      },
      end: () => {
        flash = false;
        ff.pose = 'idle';
        bell.rotation.z = 0;
        return 'Alarm! İtfaiyeciler hazır, hadi göreve!';
      },
    });
    this.spot('itfaiye-arac', -2.6, 1.8, 1.8, 'İtfaiye aracına bin', {
      dur: 6, pose: 'drive', cam: [10, 6],
      start: () => void (flash = true),
      step: (t, _u, a, dt) => {
        a.pos.set(-5.6, 1.9, 1.7);
        a.heading = 0;
        if (beat(t, dt, 0.9)) this.fx('siren');
      },
      end: (a) => {
        flash = false;
        a.pos.set(-2.6, 0, 1.8);
        return 'Direksiyondasın! Siren çalıyor: vıy vıy!';
      },
    });
    this.spot('itfaiye-kask', -W / 2 + 2.2, 3, 1.8, 'İtfaiyeci kaskını al', {
      dur: 1.6, pose: 'hold', step: (_t, _u, a) => void (a.heading = -Math.PI / 2),
      end: (a) => {
        holdItem(a, outline(mesh(new THREE.SphereGeometry(0.32, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon('#e03131')), 1.08));
        return 'Kaskını aldın! Artık minik bir itfaiyecisin.';
      },
    });
    const target = new THREE.Vector3(10.5, 1.4, 5);
    this.spot('itfaiye-hortum', 6.4, 5.6, 1.8, 'Hortumla hedefi vur', {
      dur: 5, pose: 'hold', cam: [9, 5],
      step: (t, _u, a, dt) => {
        a.pos.set(6.4, 0, 5.4);
        a.heading = Math.atan2(target.x - 6.4, target.z - 5.4);
        if (beat(t, dt, 0.6)) this.fx('spray');
        const from = a.pos.clone().setY(1.6);
        for (let i = 1; i <= 4; i++) {
          if (Math.random() > 0.6) continue;
          const s = i / 4;
          const p = from.clone().lerp(target, s);
          p.y += Math.sin(s * Math.PI) * 0.9;
          this.sparkles.burst(p, 1, '#7cd3ff');
        }
        cone.rotation.z = t > 3 ? Math.min(1.3, (t - 3) * 1.5) : 0;
      },
      end: () => {
        setTimeout(() => (cone.rotation.z = 0), 3000);
        this.fx('yay');
        return 'Tam isabet! Koniyi suyla devirdin.';
      },
    });
    void D;
  }

  // ----------------------------------------------------------------------------------------------
  // Fizik, kamera, döngü
  // ----------------------------------------------------------------------------------------------
  floor(x: number, z: number, y: number) {
    for (const d of this.decks) if (Math.abs(x - d.x) < d.w / 2 && Math.abs(z - d.z) < d.d / 2 && y >= d.y - 0.6) return d.y;
    const inRoom = Math.abs(x) < this.W / 2 && z > -this.D / 2 && z < this.D / 2 + 3;
    return inRoom ? 0 : -Infinity;
  }
  blocked(x: number, z: number, y: number) {
    const { W, D } = this;
    if (Math.abs(x) > W / 2 - R || z < -D / 2 + R) return true;
    if (z > D / 2 - R && Math.abs(x) > DOOR - R) return true;
    if (z > D / 2 + 2.4) return true;
    for (const s of this.solids) if (y < s.top - 0.2 && Math.abs(x - s.x) < s.w / 2 + R && Math.abs(z - s.z) < s.d / 2 + R) return true;
    return false;
  }
  /** Kameranın gördüğü yandaki duvarları gizle (alçak süpürgelik kalır). */
  beforeRender(cam: THREE.Camera) {
    for (const w of this.walls) {
      const out = (cam.position.x - w.p[0]) * w.n[0] + (cam.position.z - w.p[1]) * w.n[1];
      w.full.visible = out < -0.5;
    }
  }
  update(dt: number, t: number, hero: Hero) {
    this.tick(dt);
    for (const f of this.ticks) f(dt, t);
    for (const n of this.npcs) n.av.update(dt, t, n.pose, n.speed);
    return super.update(dt, t, hero);
  }
  dispose() {
    for (const n of this.npcs) n.av.dispose();
    super.dispose();
  }
}
