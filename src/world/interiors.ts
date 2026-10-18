/**
 * Binaların içi: Okul, Hastane, Market, Kütüphane, Pastane, İtfaiye ve Şehir Merkezi'nin binaları
 * (AVM, Sinema, Otel, Ofis, Apartman).
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
import type { RealmData } from './worlds';
import { byGroup, caseLine, emptyCaseLine, GROUPS, item as parca, TOTAL, type Collectible, type CollectGroup } from './collection';
import { collectModel } from './collectModels';
import { fountain, waterSurface } from './water';
import { FILM_MAX, FILM_MIN, filmLength, filmScenes, filmTheme, sceneAt, type FilmScene } from '../story/film';
import type { ArtShot } from './textures';
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
  // AVM ve otel: cilalı mermer kareler
  marble: (x: CanvasRenderingContext2D) => {
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      x.fillStyle = (i + j) % 2 ? '#ece5d6' : '#fbf8f2';
      x.fillRect(i * 128, j * 128, 128, 128);
    }
    x.strokeStyle = 'rgba(150,140,120,0.4)';
    x.lineWidth = 2;
    x.strokeRect(1, 1, 254, 254);
    x.beginPath();
    x.moveTo(128, 0);
    x.lineTo(128, 256);
    x.moveTo(0, 128);
    x.lineTo(256, 128);
    x.stroke();
    x.strokeStyle = 'rgba(160,150,135,0.22)';
    x.lineWidth = 1.5;
    for (let i = 0; i < 7; i++) {
      const y0 = ((i * 97) % 256);
      x.beginPath();
      x.moveTo(0, y0);
      x.bezierCurveTo(70, y0 + 18, 150, y0 - 22, 256, y0 + 9);
      x.stroke();
    }
  },
  // sinema: kırmızı halı
  red: (x: CanvasRenderingContext2D) => {
    x.fillStyle = '#7d2233';
    x.fillRect(0, 0, 256, 256);
    x.fillStyle = 'rgba(255,214,150,0.16)';
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      x.beginPath();
      x.arc(i * 64 + 32, j * 64 + 32, 11, 0, Math.PI * 2);
      x.fill();
    }
    x.fillStyle = 'rgba(0,0,0,0.12)';
    for (let i = 0; i < 400; i++) x.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
  },
  // ofis: gri halı kareler
  grey: (x: CanvasRenderingContext2D) => {
    x.fillStyle = '#9aa2af';
    x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 900; i++) {
      x.fillStyle = `rgba(${Math.random() < 0.5 ? '255,255,255' : '70,76,88'},0.08)`;
      x.fillRect(Math.random() * 256, Math.random() * 256, 3, 3);
    }
    x.strokeStyle = 'rgba(120,128,140,0.45)';
    x.lineWidth = 2;
    for (let i = 0; i <= 2; i++) {
      x.beginPath();
      x.moveTo(i * 128, 0);
      x.lineTo(i * 128, 256);
      x.moveTo(0, i * 128);
      x.lineTo(256, i * 128);
      x.stroke();
    }
  },
} as const;

/** İki rengin arası (perdenin arka planı masalın rengini alır). */
const blend = (a: string, b: string, k: number) => new THREE.Color(a).lerp(new THREE.Color(b), k).getStyle();

/** Yuvarlak köşeli dikdörtgen yolu (altyazı şeridi, resim çerçevesi). */
function roundRect(cx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  cx.beginPath();
  cx.moveTo(x + r, y);
  cx.arcTo(x + w, y, x + w, y + h, r);
  cx.arcTo(x + w, y + h, x, y + h, r);
  cx.arcTo(x, y + h, x, y, r);
  cx.arcTo(x, y, x + w, y, r);
  cx.closePath();
}

/** Cümleyi verilen genişliğe sığacak satırlara böler. */
function wrapLines(cx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const out: string[] = [];
  let cur = '';
  for (const w of text.split(' ')) {
    const t = cur ? `${cur} ${w}` : w;
    if (cur && cx.measureText(t).width > maxW) {
      out.push(cur);
      cur = w;
    } else cur = t;
  }
  if (cur) out.push(cur);
  return out;
}

/** Perdedeki bir çizim: beyaz çerçeve, hafif gölge, istenirse eğik. */
function drawShot(cx: CanvasRenderingContext2D, img: HTMLCanvasElement, x: number, y: number, maxW: number, maxH: number, rot = 0) {
  const k = Math.min(maxW / img.width, maxH / img.height);
  const w = img.width * k, h = img.height * k;
  cx.save();
  cx.translate(x, y);
  cx.rotate(rot);
  cx.shadowColor = 'rgba(0,0,0,0.4)';
  cx.shadowBlur = 14;
  cx.shadowOffsetY = 5;
  cx.fillStyle = '#ffffff';
  roundRect(cx, -w / 2 - 7, -h / 2 - 7, w + 14, h + 14, 9);
  cx.fill();
  cx.shadowColor = 'transparent';
  cx.drawImage(img, -w / 2, -h / 2, w, h);
  cx.restore();
}

/** Nokta dizisi üstünde yürüyüş: u (0..1) → konum ve bakış yönü. */
function along(pts: [number, number, number][], u: number) {
  const n = pts.length - 1;
  const f = Math.max(0, Math.min(0.9999, u)) * n;
  const i = Math.floor(f), k = f - i;
  const [ax, ay, az] = pts[i], [bx, by, bz] = pts[i + 1];
  return { pos: new THREE.Vector3(ax + (bx - ax) * k, ay + (by - ay) * k, az + (bz - az) * k), heading: Math.atan2(bx - ax, bz - az) };
}

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
  /** Duvar yüksekliği (AVM ve sinema daha ferah). */
  private wallH = H;
  private walls: Wall[] = [];
  private solids: { x: number; z: number; w: number; d: number; top: number }[] = [];
  private decks: { x: number; z: number; w: number; d: number; y: number }[] = [];
  private ticks: ((dt: number, t: number) => void)[] = [];
  private npcs: Npc[] = [];
  /** Müzede sergilenecek, bulunmuş koleksiyon parçaları. */
  private found: string[] = [];
  /** Sinemada film olarak oynayacak çizimler. */
  private film: ArtShot[] = [];

  constructor(ev: RealmEvents, id: InteriorId, data: RealmData = {}) {
    super(ev, '#2f2a3d', [70, 140], 'none');
    this.id = id;
    this.found = data.museum ?? [];
    this.film = data.film ?? [];
    this.leave = 'Dışarı çık';
    this.heroScale = 0.78;
    this.cam = [9.5, 7.5];
    const size: Record<InteriorId, [number, number]> = {
      okul: [24, 18], hastane: [24, 18], market: [26, 20], kutuphane: [22, 18], pastane: [20, 16], itfaiye: [26, 20],
      avm: [34, 26], sinema: [26, 22], otel: [28, 20], ofis: [24, 18], apartman: [22, 16], muze: [30, 24],
    };
    [this.W, this.D] = size[id];
    this.wallH = id === 'avm' ? 10.5 : id === 'sinema' ? 7.6 : id === 'otel' ? 7 : id === 'muze' ? 8 : H;
    const look: Record<InteriorId, [keyof typeof FLOORS, string, string]> = {
      okul: ['wood', '#fff3d6', '#ffb347'],
      hastane: ['mint', '#eef7f7', '#5cc8b8'],
      market: ['tile', '#f7faf5', '#2bb673'],
      kutuphane: ['dark', '#f3e4cc', '#a8662e'],
      pastane: ['checker', '#ffe4ec', '#e9487d'],
      itfaiye: ['concrete', '#c9584a', '#ffc83d'],
      avm: ['marble', '#fdf3e3', '#e9487d'],
      sinema: ['red', '#3a2740', '#ffb100'],
      otel: ['marble', '#f6ecd8', '#c0392b'],
      ofis: ['grey', '#eef3f8', '#2b6cb0'],
      apartman: ['wood', '#fff1e0', '#f08a5d'],
      muze: ['marble', '#f4efe3', '#8a5a35'],
    };
    this.room(...look[id]);
    ({
      okul: () => this.school(), hastane: () => this.hospital(), market: () => this.market(), kutuphane: () => this.library(),
      pastane: () => this.bakery(), itfaiye: () => this.fireStation(), avm: () => this.mall(), sinema: () => this.cinema(),
      otel: () => this.hotel(), ofis: () => this.office(), apartman: () => this.flat(), muze: () => this.museum(),
    })[id]();
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
      const seg = (w: number, x: number, h = this.wallH, y = h / 2) => {
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
        const lintel = mesh(new THREE.BoxGeometry(DOOR * 2, this.wallH - 4.4, 0.3), wallMat);
        lintel.position.set(0, 4.4 + (this.wallH - 4.4) / 2, -0.15);
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
  // AVM: iki katlı, vitrinli, yürüyen merdivenli alışveriş merkezi
  // ----------------------------------------------------------------------------------------------
  private mall() {
    const { W, D } = this;
    const GY = 4.8; // galerinin (üst kat) yüksekliği
    /** Camlı dükkân vitrini: duvara yaslanır, üstünde tabelası vardır. */
    const shop = (name: string, color: string, x: number, z: number, rot = 0, y = 0, w = 9) => {
      const g = new THREE.Group();
      g.add(this.box(w, 4, 0.5, color, 0, 2, 0));
      const glass = mesh(new THREE.BoxGeometry(w - 1.4, 2.6, 0.16), toon('#d9f2ff', { transparent: true, opacity: 0.45 }), false);
      glass.position.set(0, 1.5, 0.33);
      const sg = board(name, color, '#ffffff', w - 2.6, 0.95, 800);
      sg.position.set(0, 3.3, 0.38);
      g.add(glass, sg);
      this.add(g, x, z, rot, y);
      if (y === 0) this.solid(x, z, rot ? 1.2 : w, rot ? w : 1.2, 4);
    };
    shop('OYUNCAKÇI', '#ff8a3d', -11, -D / 2 + 0.6);
    shop('KİTAPÇI', '#4dabf7', 0, -D / 2 + 0.6);
    shop('KIYAFET', '#e9487d', 11, -D / 2 + 0.6);
    shop('AYAKKABI', '#7c5cff', -W / 2 + 0.6, -2, Math.PI / 2, 0, 8);

    // ---- galeri (üst kat): arka ve sağ taraf, cam korkuluklu
    const slab = (x: number, z: number, w: number, d: number) => {
      const g = new THREE.Group();
      g.add(this.box(w, 0.4, d, '#e4ddcd', 0, GY - 0.2, 0));
      this.add(g, x, z);
    };
    slab(0, -D / 2 + 2.6, W - 1, 5.2);
    slab(W / 2 - 3, -1, 6, 11);
    const railing = (x: number, z: number, len: number, rot: number) => {
      const g = new THREE.Group();
      const glass = mesh(new THREE.BoxGeometry(len, 1.1, 0.12), toon('#cfeaff', { transparent: true, opacity: 0.4 }), false);
      glass.position.y = GY + 0.55;
      const top = this.box(len, 0.14, 0.24, '#b0bac8', 0, GY + 1.15, 0, false);
      g.add(glass, top);
      this.add(g, x, z, rot);
    };
    railing(-6, -D / 2 + 5.1, 21, 0);
    railing(W / 2 - 6, -1, 11, Math.PI / 2);
    // galeriyi taşıyan sütunlar
    for (const [cx, cz] of [[-15, -D / 2 + 4.8], [-5, -D / 2 + 4.8], [5, -D / 2 + 4.8], [W / 2 - 6, -5.6], [W / 2 - 6, 3.4]] as const) {
      const col = outline(mesh(new THREE.CylinderGeometry(0.4, 0.5, GY, 12), toon('#efe6d4')), 1.04);
      col.position.y = GY / 2;
      this.add(col, cx, cz);
      this.solid(cx, cz, 1, 1, GY);
    }
    // üst kattaki dükkânlar
    shop('KAFE', '#f6a623', -9, -D / 2 + 0.6, 0, GY, 8);
    shop('SPOR', '#3fa45a', 7, -D / 2 + 0.6, 0, GY, 8);
    for (const [bx, bz] of [[-2, -D / 2 + 3.4], [2.6, -D / 2 + 3.4]] as const) {
      const t = this.table(1.6, 1.4, '#ffffff', 1.1);
      this.add(t, bx, bz, 0, GY);
    }

    // ---- yürüyen merdiven (sağ taraf): aşağıdan galeriye
    const ESC = { x: W / 2 - 3, z: 7, len: Math.hypot(6, GY) };
    {
      const g = new THREE.Group();
      const ang = Math.atan2(GY, 6);
      const ramp = new THREE.Group();
      ramp.add(this.box(3.2, 0.4, ESC.len, '#8d939e', 0, 0, 0));
      for (let i = 0; i < 9; i++) ramp.add(this.box(2.8, 0.16, 0.5, '#c0c6cf', 0, 0.26, ESC.len / 2 - 0.6 - i * (ESC.len - 1.2) / 8, false));
      for (const s of [-1, 1]) ramp.add(this.box(0.22, 1, 0.22, '#2f3540', s * 1.7, 0.75, 0, false));
      const rail = this.box(0.26, 0.22, ESC.len, '#2f3540', 0, 0, 0, false);
      for (const s of [-1, 1]) {
        const r = rail.clone();
        r.position.set(s * 1.7, 1.25, 0);
        ramp.add(r);
      }
      ramp.rotation.x = ang;
      ramp.position.y = GY / 2;
      g.add(ramp);
      this.add(g, ESC.x, ESC.z);
      this.solid(ESC.x, ESC.z, 3.8, 6.6, 1.4);
      const sg = board('ÜST KAT', '#5b8def', '#ffffff', 2.6, 0.7, 700);
      sg.position.set(0, 2.4, 0);
      this.add(sg, ESC.x, ESC.z + 3.6);
    }

    // ---- ortadaki havuz ve oturma yerleri
    {
      const pool = new THREE.Group();
      pool.add(outline(mesh(new THREE.CylinderGeometry(3, 3.2, 0.9, 24), toon('#dfd8c8')), 1.03).translateY(0.45));
      // dalgalanan su ve fışkıran fıskiye (water.ts)
      const surf = waterSurface({ r: 2.7, color: '#49c4ea', wave: 0.04 });
      surf.group.position.y = 0.99;
      const jets = fountain({ h: 2.2, arms: 9, r: 2.3, color: '#cdf1ff' });
      jets.group.position.y = 0.98;
      pool.add(surf.group, jets.group);
      this.add(pool, 0, 2);
      this.solid(0, 2, 6.4, 6.4, 1.1);
      this.ticks.push((dt, t) => {
        surf.tick(dt, t);
        jets.tick(dt, t);
        if (Math.floor(t * 2) !== Math.floor((t - 0.016) * 2)) this.sparkles.burst(new THREE.Vector3((Math.random() - 0.5) * 2, 2.6, 2 + (Math.random() - 0.5) * 2), 2, '#bfe9ff');
      });
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + 0.4;
        const bx = Math.cos(a) * 5.2, bz = 2 + Math.sin(a) * 5.2;
        const stool = new THREE.Group();
        stool.add(outline(mesh(new THREE.BoxGeometry(2.6, 0.26, 1.1), toon('#b9773f')), 1.04).translateY(0.62));
        for (const sx of [-1, 1]) stool.add(this.box(0.22, 0.5, 0.9, '#8d939e', sx * 1.05, 0.25, 0, false));
        this.add(stool, bx, bz, -a);
        this.solid(bx, bz, 2.8, 1.4, 0.6);
      }
      for (const [px, pz] of [[-6.4, 8], [6.4, 8], [-13, 7]] as const) {
        this.add(this.plant(1.3), px, pz);
        this.solid(px, pz, 1.2, 1.2, 1.2);
      }
    }

    // ---- dondurma standı
    {
      const g = new THREE.Group();
      g.add(this.box(3, 1.3, 1.6, '#ffffff', 0, 0.65, 0));
      g.add(this.box(3.4, 0.2, 2, '#4dc3e8', 0, 2.5, 0));
      for (const s of [-1, 1]) g.add(this.box(0.14, 1.2, 0.14, '#4dc3e8', s * 1.5, 1.9, 0, false));
      ['#ff8fb1', '#fff1c7', '#8b5a2b'].forEach((c, i) => {
        const k = outline(mesh(new THREE.SphereGeometry(0.3, 10, 8), toon(c)), 1.08);
        k.position.set(-0.8 + i * 0.8, 1.5, 0.2);
        g.add(k);
      });
      const sg = board('DONDURMA', '#4dc3e8', '#ffffff', 2.4, 0.6, 700);
      sg.position.set(0, 2.9, 0);
      g.add(sg);
      this.add(g, 7, 8.6, Math.PI);
      this.solid(7, 8.6, 3.4, 2, 2.6);
    }

    const kasiyer = this.npc({ gender: 'kiz', top: 'tisort', topColor: '#ff8a3d', bottom: 'etek', bottomColor: '#3a3f4a', hair: 'atkuyrugu' }, -11, -D / 2 + 2.4, 0, 'idle', 1.2, 3);
    this.npc({ gender: 'erkek', top: 'gomlek', topColor: '#4dabf7', bottom: 'pantolon', bottomColor: '#2b2f44', hair: 'kisa' }, 11, -D / 2 + 2.4, 0.3, 'idle', 1.2, 6);
    const sgn = board('ÇİZİO AVM', '#e9487d', '#ffffff', 7, 1.2, 800);
    this.hang(this.wallRight, sgn, 6, 6.6, 0.05);

    // ---- etkinlikler
    this.spot('avm-oyuncak', -11, -D / 2 + 4.6, 2.2, 'Oyuncakçıdan alışveriş yap', {
      dur: 5, pose: 'walk', quest: 'mall', cam: [9, 5],
      start: () => void (kasiyer.pose = 'wave'),
      step: (_t, u, a) => {
        const p = along([[-11, 0, -D / 2 + 4.6], [-11, 0, -D / 2 + 3.4], [-11, 0, -D / 2 + 3.4], [-11, 0, -D / 2 + 4.6]], u);
        a.pos.copy(p.pos);
        a.heading = u < 0.6 ? Math.PI : 0;
      },
      end: (a) => {
        kasiyer.pose = 'idle';
        const bag = new THREE.Group();
        bag.add(outline(mesh(new THREE.BoxGeometry(0.45, 0.5, 0.25), toon('#e9487d')), 1.05));
        const hd = mesh(new THREE.TorusGeometry(0.14, 0.03, 6, 12), toon('#ffffff'), false);
        hd.position.y = 0.3;
        bag.add(hd);
        holdItem(a, bag);
        this.fx('yay');
        this.sparkles.burst(new THREE.Vector3(-11, 2, -D / 2 + 4), 12, '#ffd1e8');
        return 'AVM’den oyuncak aldın! Torban elinde.';
      },
    });
    this.spot('avm-merdiven', ESC.x - 2.4, ESC.z + 2, 2.2, 'Yürüyen merdivenle üst kata çık', {
      dur: 13, pose: 'idle', cam: [15, 8],
      start: () => this.fx('whoosh'),
      step: (_t, u, a) => {
        const p = along([
          [ESC.x, 0, ESC.z + 3.4], [ESC.x, 0, ESC.z + 3], [ESC.x, GY, ESC.z - 3], [ESC.x, GY, -D / 2 + 4.6],
          [-6, GY, -D / 2 + 3.6], [ESC.x, GY, -D / 2 + 4.6], [ESC.x, GY, ESC.z - 3], [ESC.x, 0, ESC.z + 3], [ESC.x, 0, ESC.z + 3.6],
        ], u);
        a.pos.copy(p.pos);
        a.heading = p.heading;
      },
      end: () => {
        this.fx('yay');
        return 'Üst katı gezdin: kafe, spor mağazası ve koca bir manzara!';
      },
    });
    this.spot('avm-dondurma', 7, 6.4, 2, 'Dondurma al', {
      dur: 3.4, pose: 'idle', cam: [8, 4.6],
      step: (_t, _u, a) => {
        a.pos.set(7, 0, 6.6);
        a.heading = 0;
      },
      end: (a) => {
        const c = new THREE.Group();
        c.add(mesh(new THREE.ConeGeometry(0.16, 0.5, 10), toon('#d9984a'), false).rotateX(Math.PI));
        c.add(outline(mesh(new THREE.SphereGeometry(0.2, 10, 8), toon('#ff8fb1')), 1.08).translateY(0.3));
        holdItem(a, c);
        this.fx('yay');
        return 'Çilekli dondurma! Külahı elinde.';
      },
    });
    this.spot('avm-havuz', 0, 7, 2, 'Havuza para at, dilek tut', {
      dur: 4, pose: 'hold', cam: [9, 5],
      step: (t, u, a, dt) => {
        a.pos.set(0, 0, 6);
        a.heading = Math.PI;
        if (beat(t, dt, 1.2, 0.6)) {
          this.fx('pop');
          this.sparkles.burst(new THREE.Vector3(0, 1.6 + u, 3.4), 8, '#ffe9a8');
        }
      },
      end: () => {
        this.fx('yay');
        return 'Dilek tuttun! Havuza attığın para şıpladı.';
      },
    });
  }
  // ----------------------------------------------------------------------------------------------
  // Sinema: dev perde, kırmızı koltuk sıraları, patlamış mısır büfesi
  // ----------------------------------------------------------------------------------------------
  private cinema() {
    const { D } = this;
    // ---- perde: çocuğun kendi çizimlerinden kurulan film (yeterli resim yoksa minik bir çizgi film)
    const FW = 640, FH = 284, LEAD = 1.6, OUTRO = 2.4;
    const cv = document.createElement('canvas');
    cv.width = FW;
    cv.height = FH;
    const cx = cv.getContext('2d')!;
    const filmTex = new THREE.CanvasTexture(cv);
    filmTex.colorSpace = THREE.SRGBColorSpace;
    const theme = filmTheme();
    const imgs = this.film.slice(0, FILM_MAX).map((a) => a.canvas);
    const scenes: FilmScene[] = imgs.length >= FILM_MIN ? filmScenes(this.film, theme) : [];
    const idleSub = scenes.length ? `bugün: ${theme.title}` : 'film birazdan başlıyor';
    let shown = -1;

    /** Kapalı perde / başlık kartı. */
    const cardPaint = (sub: string) => {
      const g = cx.createLinearGradient(0, 0, 0, FH);
      g.addColorStop(0, '#121a2b');
      g.addColorStop(1, '#1f2b46');
      cx.fillStyle = g;
      cx.fillRect(0, 0, FW, FH);
      cx.textAlign = 'center';
      cx.fillStyle = '#ffd43b';
      cx.font = '700 46px Fredoka, Nunito, sans-serif';
      cx.fillText('ÇİZİO SİNEMA', FW / 2, FH / 2 - 2);
      cx.fillStyle = '#cfeaff';
      cx.font = '500 21px Fredoka, Nunito, sans-serif';
      cx.fillText(sub, FW / 2, FH / 2 + 38);
      filmTex.needsUpdate = true;
    };

    /** Filmin sonu. */
    const endCard = () => {
      cx.fillStyle = '#121a2b';
      cx.fillRect(0, 0, FW, FH);
      cx.textAlign = 'center';
      cx.fillStyle = '#ffd43b';
      cx.font = '700 58px Fredoka, Nunito, sans-serif';
      cx.fillText('SON', FW / 2, FH / 2 + 8);
      cx.fillStyle = '#cfeaff';
      cx.font = '500 20px Fredoka, Nunito, sans-serif';
      cx.fillText('bütün resimleri sen çizdin', FW / 2, FH / 2 + 46);
      filmTex.needsUpdate = true;
    };

    /** Sahnenin arka planı: masalın renginde gökyüzü, akan bulutlar ve tepeler. */
    const backdrop = (t: number) => {
      const g = cx.createLinearGradient(0, 0, 0, FH);
      g.addColorStop(0, blend(theme.color, '#101a30', 0.6));
      g.addColorStop(1, blend(theme.color, '#ffffff', 0.5));
      cx.fillStyle = g;
      cx.fillRect(0, 0, FW, FH);
      cx.globalAlpha = 0.45;
      cx.fillStyle = blend(theme.color, '#ffffff', 0.8);
      cx.beginPath();
      cx.arc(FW - 96, 52, 30, 0, Math.PI * 2);
      cx.fill();
      cx.globalAlpha = 0.26;
      cx.fillStyle = '#ffffff';
      for (let k = 0; k < 4; k++) {
        const bx = ((k * 190 + t * (9 + k * 3)) % (FW + 180)) - 90;
        const by = 32 + ((k * 53) % 66);
        for (const [dx, dy, r] of [[0, 0, 17], [20, -6, 13], [-20, 3, 11]] as const) {
          cx.beginPath();
          cx.arc(bx + dx, by + dy, r, 0, Math.PI * 2);
          cx.fill();
        }
      }
      cx.globalAlpha = 1;
      for (const [k, yy] of [[0, 166], [1, 188]] as const) {
        cx.fillStyle = k ? theme.color : blend(theme.color, '#ffffff', 0.38);
        cx.beginPath();
        cx.moveTo(0, FH);
        for (let x = 0; x <= FW; x += 20) cx.lineTo(x, yy + Math.sin(x / 90 + t * 0.12 + k * 2) * 13);
        cx.lineTo(FW, FH);
        cx.closePath();
        cx.fill();
      }
    };

    /** Bir sahne: masalın rengi, yavaşça yakınlaşan çizim ve altyazı. */
    const scenePaint = (i: number, t: number) => {
      const sc = scenes[i];
      const u = clamp01((t - sc.at) / sc.dur);
      backdrop(t);
      const py = 90;
      if (sc.art === 'all') {
        const n = imgs.length;
        imgs.forEach((img, k) => {
          const off = (k - (n - 1) / 2) * (n > 2 ? 170 : 196);
          drawShot(cx, img, FW / 2 + off, py + Math.sin(t * 1.4 + k) * 5, 152, 152, (k - (n - 1) / 2) * 0.09);
        });
      } else {
        const img = imgs[Math.min(sc.art, imgs.length - 1)];
        // yavaş yakınlaşma ve hafif kayma: duran resim bile film gibi görünsün
        const z = 1 + sm(u) * 0.14;
        drawShot(cx, img, FW / 2 + Math.sin(t * 0.45) * 9, py, 190 * z, 150 * z);
      }
      const fade = clamp01((t - sc.at) / 0.4);
      let size = 21, lines: string[] = [];
      for (const sz of [21, 19, 17, 15]) {
        size = sz;
        cx.font = `600 ${sz}px Fredoka, Nunito, sans-serif`;
        lines = wrapLines(cx, sc.text, FW - 76);
        if (lines.length <= 3) break;
      }
      const lh = size + 7;
      const bh = lines.length * lh + 16;
      const by = FH - bh - 10;
      cx.globalAlpha = 0.5 * fade;
      cx.fillStyle = '#0b1026';
      roundRect(cx, 28, by, FW - 56, bh, 13);
      cx.fill();
      cx.globalAlpha = fade;
      cx.fillStyle = '#ffffff';
      cx.textAlign = 'center';
      lines.forEach((ln, k) => cx.fillText(ln, FW / 2, by + 16 + k * lh + size * 0.28));
      cx.globalAlpha = 1;
      filmTex.needsUpdate = true;
    };

    /** Yeterli çizim yoksa oynayan minik çizgi film. */
    const cartoon = (t: number) => {
      const g = cx.createLinearGradient(0, 0, 0, FH);
      g.addColorStop(0, '#5fb8ff');
      g.addColorStop(1, '#d7f0ff');
      cx.fillStyle = g;
      cx.fillRect(0, 0, FW, FH);
      cx.save();
      cx.scale(FW / 256, FH / 144);
      cx.fillStyle = '#ffe066';
      cx.beginPath();
      cx.arc(214, 30, 16, 0, Math.PI * 2);
      cx.fill();
      cx.fillStyle = '#ffffff';
      for (let i = 0; i < 3; i++) {
        const bx = ((t * 14 + i * 95) % 300) - 30;
        for (const [dx, dy, r] of [[0, 0, 13], [14, -4, 10], [-14, 2, 9]] as const) {
          cx.beginPath();
          cx.arc(bx + dx, 34 + i * 9 + dy, r, 0, Math.PI * 2);
          cx.fill();
        }
      }
      cx.fillStyle = '#6cc24a';
      cx.beginPath();
      cx.moveTo(0, 120);
      for (let i = 0; i <= 256; i += 16) cx.lineTo(i, 112 + Math.sin(i / 26 + t) * 5);
      cx.lineTo(256, 144);
      cx.lineTo(0, 144);
      cx.fill();
      // zıplayan top ve roket
      const bxp = 40 + ((t * 38) % 190);
      cx.fillStyle = '#ef4b4b';
      cx.beginPath();
      cx.arc(bxp, 104 - Math.abs(Math.sin(t * 3)) * 34, 9, 0, Math.PI * 2);
      cx.fill();
      const rx = ((t * 52) % 320) - 40;
      cx.save();
      cx.translate(rx, 58);
      cx.fillStyle = '#f1f3f5';
      cx.beginPath();
      cx.ellipse(0, 0, 18, 7, 0, 0, Math.PI * 2);
      cx.fill();
      cx.fillStyle = '#ff8a3d';
      cx.beginPath();
      cx.moveTo(-18, 0);
      cx.lineTo(-30 - Math.sin(t * 22) * 5, 0);
      cx.lineTo(-18, 5);
      cx.fill();
      cx.restore();
      cx.restore();
      filmTex.needsUpdate = true;
    };
    cardPaint(idleSub);
    const screen = new THREE.Group();
    // perde: çerçevenin önünde durur (içine gömülürse ekran kapkara görünür)
    const panel = mesh(new THREE.PlaneGeometry(15.4, 6.8), new THREE.MeshBasicMaterial({ map: filmTex }), false);
    panel.position.set(0, 3.9, 0.42);
    screen.add(this.box(16.6, 7.8, 0.6, '#15121c', 0, 3.9, 0));
    screen.add(panel);
    this.add(screen, 0, -D / 2 + 0.4);
    this.solid(0, -D / 2 + 0.4, 16.6, 1.2, 6);
    for (const s of [-1, 1]) {
      const curt = outline(mesh(new THREE.BoxGeometry(2.2, 7.6, 0.7), toon('#8e1b32')), 1.03);
      curt.position.y = 3.8;
      this.add(curt, s * 9.4, -D / 2 + 1);
    }

    // ---- koltuk sıraları
    const seat = (color: string) => {
      const g = new THREE.Group();
      g.add(this.box(1.5, 0.3, 1.2, color, 0, 0.95, 0));
      g.add(this.box(1.5, 1.5, 0.3, color, 0, 1.6, -0.6));
      for (const s of [-1, 1]) g.add(this.box(0.2, 0.5, 1.2, '#2f2234', s * 0.75, 1.15, 0, false));
      g.add(this.box(1.1, 0.8, 0.8, '#2f2234', 0, 0.4, 0, false));
      return g;
    };
    for (let r = 0; r < 3; r++) for (let i = -2; i <= 2; i++) {
      this.add(seat(['#c0392b', '#a93226', '#922b21'][r]), i * 2.4, -2 + r * 3.4, Math.PI);
    }
    for (let r = 0; r < 3; r++) this.solid(0, -2 + r * 3.4, 11.6, 1.6, 1.8);

    // ---- büfe ve afişler
    {
      const g = new THREE.Group();
      g.add(this.box(5.6, 1.4, 1.8, '#ffb100', 0, 0.7, 0));
      g.add(this.box(6, 0.2, 2.2, '#ffffff', 0, 1.5, 0, false));
      const pop = new THREE.Group();
      pop.add(this.box(1.4, 1.8, 1.2, '#e03131', 0, 0.9, 0));
      const glass = mesh(new THREE.BoxGeometry(1.2, 1.2, 1), toon('#fff6c9', { transparent: true, opacity: 0.6 }), false);
      glass.position.y = 2.3;
      pop.add(glass);
      pop.position.set(-1.8, 1.6, -0.2);
      g.add(pop);
      for (let i = 0; i < 3; i++) {
        const cup = outline(mesh(new THREE.CylinderGeometry(0.26, 0.2, 0.7, 12), toon('#ffffff')), 1.06);
        cup.position.set(0.6 + i * 0.7, 1.95, 0.2);
        g.add(cup);
        const corn = outline(mesh(new THREE.SphereGeometry(0.26, 8, 6), toon('#fff1c7')), 1.08);
        corn.position.set(0.6 + i * 0.7, 2.35, 0.2);
        g.add(corn);
      }
      const sg = board('BÜFE', '#e03131', '#ffffff', 2.2, 0.7, 700);
      sg.position.set(2, 2.9, 0.3);
      g.add(sg);
      this.add(g, 10, D / 2 - 3.4, Math.PI);
      this.solid(10, D / 2 - 3.4, 6, 2.4, 2);
    }
    const bufeci = this.npc({ gender: 'erkek', top: 'tisort', topColor: '#e03131', bottom: 'pantolon', bottomColor: '#2f2234', hat: 'kep', hatColor: '#ffb100', hair: 'kisa' }, 10, D / 2 - 1.8, Math.PI, 'idle', 1.2, 4);
    for (const [wall, at, title, color] of [[this.wallLeft, -8, 'UZAY MACERASI', '#4dabf7'], [this.wallLeft, 1.5, 'KÜÇÜK EJDERHA', '#3fa45a'], [this.wallRight, -8, 'DENİZ ALTINDA', '#4dc3e8'], [this.wallRight, 1.5, 'ORMANIN ŞARKISI', '#f6a623']] as const) {
      const p = board(title, color, '#ffffff', 2.6, 3.4, 600);
      const fr = this.box(3, 3.8, 0.16, '#ffd43b', 0, 0, 0);
      fr.position.set(at, 3.4, 0.02);
      wall.add(fr);
      this.hang(wall, p, at, 3.4, 0.12);
    }
    // ---- ışıklar (film başlayınca kısılır)
    const hemi = this.scene.children.find((c) => (c as THREE.HemisphereLight).isHemisphereLight) as THREE.HemisphereLight | undefined;
    const h0 = hemi?.intensity ?? 1.2, s0 = this.sun.intensity;
    let playing = false;
    let cur = -1;
    // çizgi film kendi kendine döner; çizimlerden kurulan film karesini etkinliğin kendisi çizer
    this.ticks.push((_dt, t) => {
      if (!playing || scenes.length) return;
      const k = Math.floor(t * 8);
      if (k !== shown) {
        shown = k;
        cartoon(t);
      }
    });

    // ---- etkinlikler
    this.spot('sinema-bilet', 8.4, D / 2 - 5.6, 2, 'Bilet al', {
      dur: 3, pose: 'idle', cam: [8, 4.6],
      start: () => void (bufeci.pose = 'wave'),
      step: (_t, _u, a) => {
        a.pos.set(8.4, 0, D / 2 - 5.6);
        a.heading = 0;
      },
      end: (a) => {
        bufeci.pose = 'idle';
        const tk = mesh(new THREE.BoxGeometry(0.5, 0.3, 0.03), toon('#ffd43b'), false);
        holdItem(a, tk);
        this.fx('pop');
        return 'Biletin hazır! Şimdi koltuğuna geç.';
      },
    });
    this.spot('sinema-misir', 11.4, D / 2 - 5.6, 2, 'Patlamış mısır al', {
      dur: 3.4, pose: 'idle', cam: [8, 4.6],
      step: (t, _u, a, dt) => {
        a.pos.set(11.4, 0, D / 2 - 5.6);
        a.heading = 0;
        if (beat(t, dt, 0.5)) this.sparkles.burst(new THREE.Vector3(8.2, 3.6, D / 2 - 3.6), 3, '#fff1c7');
      },
      end: (a) => {
        const c = new THREE.Group();
        c.add(outline(mesh(new THREE.CylinderGeometry(0.26, 0.2, 0.6, 12), toon('#ffffff')), 1.06));
        c.add(outline(mesh(new THREE.SphereGeometry(0.24, 8, 6), toon('#fff1c7')), 1.08).translateY(0.34));
        holdItem(a, c);
        this.fx('yay');
        return 'Kocaman bir patlamış mısır! Mis gibi kokuyor.';
      },
    });
    this.spot('sinema-izle', 0, 7.2, 2.4, scenes.length ? 'Koltuğa otur, kendi filmini izle' : 'Koltuğa otur, filmi izle', {
      dur: scenes.length ? LEAD + filmLength(scenes) + OUTRO : 12,
      pose: 'sit', quest: 'cinema', cam: [13, 5.5],
      start: () => {
        playing = true;
        shown = -1;
        cur = -1;
        if (hemi) hemi.intensity = 0.32;
        this.sun.intensity = 0.2;
        this.fx('yay');
      },
      step: (t, _u, a) => {
        a.pos.set(0, 0.5, 1.9);
        a.heading = Math.PI;
        a.pos.y += Math.sin(t * 2) * 0.02;
        if (!scenes.length) return;
        const k = Math.floor(t * 22);
        if (k === shown) return;
        shown = k;
        const ft = t - LEAD;
        if (ft < 0) {
          // açılış: perdede masalın adı
          if (cur !== -2) {
            cur = -2;
            cardPaint(theme.title);
          }
          return;
        }
        const i = sceneAt(scenes, ft);
        if (i < 0) return endCard();
        if (i !== cur) {
          cur = i;
          this.ev.say?.(scenes[i].text);
        }
        scenePaint(i, ft);
      },
      end: () => {
        playing = false;
        this.ev.hush?.();
        if (hemi) hemi.intensity = h0;
        this.sun.intensity = s0;
        cardPaint(idleSub);
        this.fx('yay');
        this.sparkles.burst(new THREE.Vector3(0, 3, 0), 16, '#ffd43b');
        return scenes.length
          ? `Film bitti! “${theme.title}” masalında senin çizimlerin oynadı.`
          : 'Film bitti! Daha çok resim çizersen sinemada kendi filmin oynar.';
      },
    });
  }
  // ----------------------------------------------------------------------------------------------
  // Otel: resepsiyon, oturma grubu, kahvaltı köşesi ve çalışan asansör
  // ----------------------------------------------------------------------------------------------
  private hotel() {
    const { W, D } = this;
    // ---- resepsiyon
    {
      const g = new THREE.Group();
      g.add(this.box(9, 1.5, 2, '#8a5a35', 0, 0.75, 0));
      g.add(this.box(9.6, 0.22, 2.4, '#f6ecd8', 0, 1.6, 0, false));
      const pc = this.box(1.2, 0.8, 0.12, '#2f3540', 2.6, 2.1, -0.3);
      const scr = mesh(new THREE.BoxGeometry(1, 0.6, 0.04), toon('#9fe6ff', { emissive: '#204a5a' }), false);
      scr.position.set(2.6, 2.1, -0.22);
      const bell = outline(mesh(new THREE.SphereGeometry(0.22, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon('#ffd43b')), 1.07);
      bell.position.set(-2.8, 1.72, 0.5);
      g.add(pc, scr, bell);
      this.add(g, -7, -D / 2 + 3.4);
      this.solid(-7, -D / 2 + 3.4, 9.6, 2.4, 1.8);
    }
    // anahtar dolabı ve tabela
    {
      const kb = new THREE.Group();
      kb.add(this.box(6, 3, 0.3, '#6b4a33', 0, 0, 0));
      for (let r = 0; r < 3; r++) for (let c = 0; c < 8; c++) {
        const k = mesh(new THREE.BoxGeometry(0.12, 0.34, 0.06), toon(['#ffd43b', '#c0c6cf', '#ff8a3d'][(r + c) % 3]), false);
        k.position.set(-2.6 + c * 0.75, 1 - r * 0.9, 0.18);
        kb.add(k);
      }
      this.hang(this.wallBack, kb, -7, 3.6, 0.2);
      this.hang(this.wallBack, board('OTEL ÇİZİO', '#c0392b', '#ffffff', 6, 1.1, 800), 3, 5.6, 0.06);
    }
    const resepsiyonist = this.npc({ gender: 'kiz', top: 'gomlek', topColor: '#ffffff', bottom: 'etek', bottomColor: '#c0392b', hair: 'kut' }, -7, -D / 2 + 1.6, 0, 'idle', 1.2, 2);

    // ---- asansör (arka duvarın sağında, kapıları açılıp kapanır)
    const EX = 9, EZ = -D / 2 + 1.8;
    const doors: THREE.Object3D[] = [];
    {
      const g = new THREE.Group();
      // kabin: arka, yan ve tavan panelleri (ön tarafı kapılar kapatır, içerisi görünür)
      g.add(this.box(5.2, 4.6, 0.4, '#c3b79f', 0, 2.3, -1.6));
      for (const s of [-1, 1]) g.add(this.box(0.4, 4.6, 3.6, '#c3b79f', s * 2.4, 2.3, 0));
      g.add(this.box(5.2, 0.4, 3.8, '#c3b79f', 0, 4.4, 0, false));
      const mirror = mesh(new THREE.BoxGeometry(3.4, 3, 0.08), toon('#dff1ff', { emissive: '#3a4a55' }), false);
      mirror.position.set(0, 2.2, -1.36);
      const floorPad = this.box(4.4, 0.12, 3.2, '#8a5a35', 0, 0.06, 0, false);
      const lamp = mesh(new THREE.BoxGeometry(2.6, 0.12, 1.6), new THREE.MeshBasicMaterial({ color: '#fff3c4' }), false);
      lamp.position.set(0, 4.16, 0);
      g.add(mirror, floorPad, lamp);
      for (const s of [-1, 1]) {
        const dr = outline(mesh(new THREE.BoxGeometry(1.8, 3.8, 0.22), toon('#cfa63d')), 1.03);
        dr.position.set(s * 0.9, 1.9, 1.5);
        g.add(dr);
        doors.push(dr);
      }
      const ind = mesh(new THREE.BoxGeometry(1.2, 0.4, 0.1), toon('#2f3540', { emissive: '#ffb100' }), false);
      ind.position.set(0, 4.2, 1.6);
      g.add(ind);
      this.add(g, EX, EZ);
      this.solid(EX, EZ, 5.6, 4, 4.6);
    }
    const setDoors = (open: number) => {
      doors[0].position.x = -0.9 - open * 0.85;
      doors[1].position.x = 0.9 + open * 0.85;
    };

    // ---- oturma grubu ve halı
    {
      const rug = mesh(new THREE.CylinderGeometry(5, 5, 0.06, 32), toon('#b03a4a'), false);
      this.add(rug, 6, 2, 0, 0.04);
      const sofa = (w: number) => {
        const g = new THREE.Group();
        g.add(this.box(w, 0.6, 2, '#2f6f5e', 0, 0.55, 0));
        g.add(this.box(w, 1.2, 0.5, '#2f6f5e', 0, 1.2, -0.85));
        for (const s of [-1, 1]) g.add(this.box(0.4, 0.9, 2, '#27604f', s * (w / 2 - 0.2), 1, 0));
        for (let i = 0; i < Math.round(w / 2); i++) g.add(this.box(1.1, 0.3, 1.1, '#f6ecd8', -w / 2 + 1.1 + i * 2, 0.95, 0.2, false));
        return g;
      };
      this.add(sofa(5), 6, 5.4, Math.PI);
      this.solid(6, 5.4, 5.4, 2.4, 1.2);
      this.add(sofa(3.4), 2.4, 2, Math.PI / 2);
      this.solid(2.4, 2, 2.4, 3.6, 1.2);
      this.add(sofa(3.4), 9.6, 2, -Math.PI / 2);
      this.solid(9.6, 2, 2.4, 3.6, 1.2);
      const ct = this.table(2.6, 1.6, '#8a5a35', 1);
      this.add(ct, 6, 2);
      this.solid(6, 2, 2.6, 1.6, 1.1);
      const vase = outline(mesh(new THREE.CylinderGeometry(0.22, 0.3, 0.7, 12), toon('#4dabf7')), 1.06);
      vase.position.set(6, 1.35, 2);
      this.scene.add(vase);
    }
    // avize
    {
      const ch = new THREE.Group();
      ch.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 6), toon('#cfa63d'), false).translateY(0.6));
      const ring = mesh(new THREE.TorusGeometry(1.2, 0.09, 8, 24), toon('#cfa63d'), false);
      ring.rotation.x = Math.PI / 2;
      ch.add(ring);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const l = mesh(new THREE.SphereGeometry(0.22, 10, 8), new THREE.MeshBasicMaterial({ color: '#fff3c4' }), false);
        l.position.set(Math.cos(a) * 1.2, -0.2, Math.sin(a) * 1.2);
        ch.add(l);
      }
      this.add(ch, 2, 0, 0, 5.6);
    }
    // ---- kahvaltı köşesi
    {
      const g = new THREE.Group();
      g.add(this.box(6, 1.1, 1.6, '#f6ecd8', 0, 0.55, 0));
      g.add(this.box(6.2, 0.16, 1.8, '#c0c6cf', 0, 1.2, 0, false));
      const tray = (c: string, x: number) => {
        const t = this.box(1.3, 0.2, 1, c, x, 1.4, 0, false);
        g.add(t);
      };
      tray('#d9984a', -1.9);
      tray('#ffd43b', -0.3);
      tray('#ff8fb1', 1.3);
      for (let i = 0; i < 5; i++) {
        const cr = outline(mesh(new THREE.TorusGeometry(0.18, 0.08, 7, 12, Math.PI), toon('#e0a95c')), 1.08);
        cr.position.set(-2.2 + i * 0.4, 1.55, 0.1);
        cr.rotation.x = Math.PI / 2;
        g.add(cr);
      }
      const urn = outline(mesh(new THREE.CylinderGeometry(0.4, 0.4, 1, 12), toon('#c0c6cf')), 1.05);
      urn.position.set(2.4, 1.7, 0);
      g.add(urn);
      this.add(g, -W / 2 + 1.6, 3, Math.PI / 2);
      this.solid(-W / 2 + 1.6, 3, 2, 6.2, 1.4);
      const t = this.table(2.2, 1.6, '#8a5a35', 1.2);
      this.add(t, -8.6, 5.4);
      this.solid(-8.6, 5.4, 2.2, 1.6, 1.3);
      this.add(this.chair('#2f6f5e'), -8.6, 7, Math.PI);
      this.solid(-8.6, 7, 1, 1, 1.4);
    }
    // bavul arabası ve palmiyeler
    {
      const cart = new THREE.Group();
      cart.add(this.box(2.4, 0.2, 1.4, '#cfa63d', 0, 0.5, 0));
      for (const s of [-1, 1]) cart.add(this.box(0.12, 2.2, 0.12, '#cfa63d', s * 1.1, 1.2, -0.6, false));
      cart.add(this.box(2.4, 0.12, 0.12, '#cfa63d', 0, 2.3, -0.6, false));
      cart.add(this.box(1.6, 0.9, 1, '#8a5a35', -0.3, 1, 0));
      cart.add(this.box(1.1, 0.7, 0.8, '#c0392b', 0.6, 1.9, 0));
      for (const [x, z] of [[-1, -0.5], [1, -0.5], [-1, 0.5], [1, 0.5]] as const) {
        const w = mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.12, 10), toon('#2b2d33'), false);
        w.rotation.z = Math.PI / 2;
        w.position.set(x, 0.22, z);
        cart.add(w);
      }
      this.add(cart, 11, 6.6, -0.4);
      this.solid(11, 6.6, 2.6, 1.8, 1.2);
    }
    for (const [px, pz] of [[-11.6, -2], [12, -3.4]] as const) {
      this.add(this.plant(1.6), px, pz);
      this.solid(px, pz, 1.4, 1.4, 1.4);
    }

    // ---- etkinlikler
    this.spot('otel-kayit', -7, -D / 2 + 6.2, 2.2, 'Resepsiyonda kayıt ol', {
      dur: 4, pose: 'idle', cam: [9, 5],
      start: () => void (resepsiyonist.pose = 'wave'),
      step: (t, _u, a, dt) => {
        a.pos.set(-7, 0, -D / 2 + 5.4);
        a.heading = Math.PI;
        if (beat(t, dt, 99, 1.4)) this.fx('bell');
      },
      end: (a) => {
        resepsiyonist.pose = 'idle';
        const key = new THREE.Group();
        key.add(mesh(new THREE.BoxGeometry(0.1, 0.5, 0.05), toon('#ffd43b'), false));
        key.add(outline(mesh(new THREE.TorusGeometry(0.13, 0.04, 6, 12), toon('#ffd43b')), 1.08).translateY(0.3));
        holdItem(a, key);
        this.fx('yay');
        return 'Oda anahtarın hazır: 302 numara!';
      },
    });
    this.spot('otel-asansor', EX, EZ + 4.6, 2.2, 'Asansörle odana çık', {
      dur: 11, pose: 'walk', cam: [11, 6],
      start: () => {
        this.fx('dooropen');
        setDoors(1);
      },
      step: (_t, u, a) => {
        const p = along([[EX, 0, EZ + 4.4], [EX, 0, EZ + 0.4], [EX, 0, EZ + 0.4], [EX, 0, EZ + 0.4], [EX, 0, EZ + 4.4]], u);
        a.pos.copy(p.pos);
        a.heading = u < 0.25 ? Math.PI : u > 0.78 ? 0 : Math.PI;
        // 0.28–0.72 arası kapılar kapalı: asansör yukarı çıkar, sonra geri iner
        const closed = u > 0.26 && u < 0.76;
        setDoors(closed ? 0 : 1);
      },
      end: () => {
        setDoors(0);
        this.fx('bell');
        return 'Odana çıktın: yataklar yumuşak, pencereden bütün şehir görünüyor!';
      },
    });
    this.spot('otel-dinlen', 6, 8.4, 2.2, 'Koltukta dinlen', {
      dur: 5, pose: 'sit', cam: [9, 5],
      step: (_t, _u, a) => {
        a.pos.set(6, 0.45, 5.6);
        a.heading = 0;
      },
      end: () => {
        this.fx('yay');
        return 'Kocaman koltukta biraz dinlendin.';
      },
    });
    this.spot('otel-kahvalti', -8.6, 8.6, 2.2, 'Kahvaltı et', {
      dur: 5, pose: 'sit', cam: [8, 4.6],
      step: (t, _u, a, dt) => {
        a.pos.set(-8.6, 0.45, 6.9);
        a.heading = Math.PI;
        if (beat(t, dt, 1.4, 0.7)) this.fx('pop');
      },
      end: (a) => {
        const c = outline(mesh(new THREE.TorusGeometry(0.2, 0.09, 7, 12, Math.PI), toon('#e0a95c')), 1.08);
        c.rotation.x = Math.PI / 2;
        holdItem(a, c);
        this.fx('yay');
        return 'Açık büfe kahvaltı! Kruvasan ve portakal suyu.';
      },
    });
  }
  // ----------------------------------------------------------------------------------------------
  // Ofis: çalışma masaları, toplantı köşesi, fotokopi ve su sebili
  // ----------------------------------------------------------------------------------------------
  private office() {
    const { W, D } = this;
    const screens: THREE.MeshToonMaterial[] = [];
    /** Bilgisayarlı çalışma masası. */
    const desk = (x: number, z: number, rot: number, color: string) => {
      const g = new THREE.Group();
      g.add(this.box(3.4, 0.16, 1.8, '#e9e2d4', 0, 1.25, 0));
      for (const [sx, sz] of [[-1.5, -0.7], [1.5, -0.7], [-1.5, 0.7], [1.5, 0.7]] as const) g.add(this.box(0.14, 1.25, 0.14, '#8d939e', sx, 0.62, sz, false));
      const stand = this.box(0.3, 0.5, 0.3, '#5b5f6b', 0, 1.6, -0.5, false);
      const sm2 = toon('#9fe6ff', { emissive: '#1d4a5a' }) as THREE.MeshToonMaterial;
      const scr = mesh(new THREE.BoxGeometry(1.6, 1, 0.1), sm2, false);
      scr.position.set(0, 2.3, -0.5);
      screens.push(sm2);
      const kb = this.box(1.2, 0.08, 0.45, '#cfd6e2', 0, 1.37, 0.25, false);
      const mug = outline(mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.3, 10), toon(color)), 1.07);
      mug.position.set(1.2, 1.48, 0.3);
      g.add(this.box(1.8, 0.9, 0.12, '#2f3540', 0, 2.3, -0.56), scr, stand, kb, mug);
      this.add(g, x, z, rot);
      this.solid(x, z, rot ? 2 : 3.6, rot ? 3.6 : 2, 1.4);
      const [sx, sz] = [x + Math.sin(rot) * 1.6, z + Math.cos(rot) * 1.6];
      this.add(this.chair(color), sx, sz, rot + Math.PI);
      this.solid(sx, sz, 1.1, 1.1, 1.4);
    };
    desk(-7, -5.4, 0, '#ef4b4b');
    desk(-7, -0.4, 0, '#4dabf7');
    desk(7, -5.4, 0, '#3fa45a');
    desk(7, -0.4, 0, '#f6a623');
    this.ticks.push((_dt, t) => {
      screens.forEach((m, i) => m.emissive.setHSL(0.55, 0.5, 0.18 + Math.sin(t * 2 + i * 1.3) * 0.06));
    });

    // ---- toplantı köşesi ve beyaz tahta
    {
      const t = this.table(4.4, 2.2, '#b9773f', 1.3);
      this.add(t, -5.5, 5);
      this.solid(-5.5, 5, 4.4, 2.2, 1.4);
      for (const [cx, cz, r] of [[-7.2, 6.8, Math.PI], [-3.8, 6.8, Math.PI], [-7.2, 3.2, 0], [-3.8, 3.2, 0]] as const) {
        this.add(this.chair('#2b6cb0'), cx, cz, r);
        this.solid(cx, cz, 1.1, 1.1, 1.4);
      }
      const wb = new THREE.Group();
      wb.add(this.box(6, 3.2, 0.16, '#ffffff', 0, 0, 0));
      wb.add(this.box(6.3, 3.5, 0.1, '#5b5f6b', 0, 0, -0.08));
      for (const [bx, by, bw, c] of [[-1.6, 0.8, 2, '#2b6cb0'], [0.6, 0.5, 1.4, '#ef4b4b'], [-1, -0.4, 3, '#3fa45a']] as const) {
        const ln = mesh(new THREE.BoxGeometry(bw, 0.16, 0.04), toon(c), false);
        ln.position.set(bx, by, 0.1);
        wb.add(ln);
      }
      this.hang(this.wallLeft, wb, -5, 3, 0.12);
    }
    // ---- dolaplar, fotokopi, su sebili, bitkiler
    {
      for (let i = 0; i < 3; i++) {
        const c = new THREE.Group();
        c.add(this.box(1.6, 2.4, 1, '#8d939e', 0, 1.2, 0));
        for (let r = 0; r < 3; r++) c.add(this.box(1.4, 0.1, 0.06, '#5b5f6b', 0, 0.6 + r * 0.7, 0.53, false));
        this.add(c, -2.6 + i * 1.8, -D / 2 + 0.8);
      }
      this.solid(0.2, -D / 2 + 0.8, 5.6, 1.1, 2.4);
      const copier = new THREE.Group();
      copier.add(this.box(2, 1.8, 1.4, '#cfd6e2', 0, 0.9, 0));
      copier.add(this.box(2.1, 0.2, 1.5, '#5b5f6b', 0, 1.9, 0, false));
      const tray = this.box(1.4, 0.1, 0.8, '#ffffff', 0, 1.1, 0.8, false);
      copier.add(tray);
      this.add(copier, W / 2 - 1.8, 2.6, -Math.PI / 2);
      this.solid(W / 2 - 1.8, 2.6, 1.8, 2.2, 2);
      const cooler = new THREE.Group();
      cooler.add(this.box(1, 1.4, 1, '#eef3f8', 0, 0.7, 0));
      const jug = mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.1, 14), toon('#9fe6ff', { transparent: true, opacity: 0.7 }), false);
      jug.position.y = 2;
      cooler.add(jug);
      this.add(cooler, W / 2 - 1.6, 7, 0);
      this.solid(W / 2 - 1.6, 7, 1.2, 1.2, 2);
      for (const [px, pz] of [[-W / 2 + 1.6, -6.6], [W / 2 - 1.6, -7]] as const) {
        this.add(this.plant(1.4), px, pz);
        this.solid(px, pz, 1.2, 1.2, 1.3);
      }
      this.hang(this.wallBack, board('ÇİZİO OFİS', '#2b6cb0', '#ffffff', 5, 1, 800), -7, 4.4, 0.06);
    }
    const kolega = this.npc({ gender: 'erkek', top: 'gomlek', topColor: '#cfe7ff', bottom: 'pantolon', bottomColor: '#2f3540', glasses: 'yuvarlak', hair: 'kisa' }, 3.6, 2.4, Math.PI, 'idle', 1.2, 5);

    // ---- etkinlikler
    this.spot('ofis-bilgisayar', -7, 1.6, 2, 'Bilgisayarda çalış', {
      dur: 6, pose: 'sit', cam: [8, 5],
      step: (t, _u, a, dt) => {
        a.pos.set(-7, 0.45, 1.2);
        a.heading = Math.PI;
        if (beat(t, dt, 0.32)) this.fx('clack');
        for (const m of screens) m.emissive.setHSL((t * 0.2) % 1, 0.6, 0.26);
      },
      end: () => {
        this.fx('yay');
        this.sparkles.burst(new THREE.Vector3(-7, 2.6, -0.9), 12, '#9fe6ff');
        return 'Bilgisayarda Çizio için kocaman bir resim çizdin!';
      },
    });
    this.spot('ofis-sunum', -9.6, 5, 2.2, 'Beyaz tahtada sunum yap', {
      dur: 6.5, pose: 'hold', cam: [10, 5],
      start: () => void (kolega.pose = 'wave'),
      step: (t, _u, a, dt) => {
        a.pos.set(-W / 2 + 2.2, 0, 4.8);
        a.heading = -Math.PI / 2;
        if (beat(t, dt, 0.8)) {
          this.fx('pop');
          this.sparkles.burst(new THREE.Vector3(-W / 2 + 0.6, 3 + Math.sin(t) * 0.6, 5), 4, '#4dabf7');
        }
      },
      end: () => {
        kolega.pose = 'idle';
        this.fx('yay');
        return 'Sunumun harikaydı, herkes alkışladı!';
      },
    });
    this.spot('ofis-fotokopi', W / 2 - 4.4, 2.6, 2, 'Fotokopi çek', {
      dur: 4.4, pose: 'idle', cam: [8, 4.6],
      step: (t, _u, a, dt) => {
        a.pos.set(W / 2 - 4, 0, 2.6);
        a.heading = Math.PI / 2;
        if (beat(t, dt, 0.7, 0.4)) {
          this.fx('page');
          this.sparkles.burst(new THREE.Vector3(W / 2 - 2.4, 1.6, 2.6), 3, '#ffffff');
        }
      },
      end: (a) => {
        const paper = mesh(new THREE.BoxGeometry(0.5, 0.02, 0.7), toon('#ffffff'), false);
        holdItem(a, paper);
        this.fx('yay');
        return 'Fotokopin çıktı! Çizimin bir kopyası daha var.';
      },
    });
    this.spot('ofis-su', W / 2 - 3.8, 7, 2, 'Sebilden su iç', {
      dur: 3.4, pose: 'idle', cam: [7, 4.4],
      step: (_t, _u, a) => {
        a.pos.set(W / 2 - 3.4, 0, 7);
        a.heading = Math.PI / 2;
      },
      end: (a) => {
        const cup = outline(mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.26, 10), toon('#eaf6ff')), 1.07);
        holdItem(a, cup);
        this.fx('pop');
        return 'Buz gibi su içtin, şimdi iş başına!';
      },
    });
  }
  // ----------------------------------------------------------------------------------------------
  // Apartman dairesi: oturma odası, mutfak köşesi, yatak ve komşu
  // ----------------------------------------------------------------------------------------------
  private flat() {
    const { W, D } = this;
    // ---- oturma odası: halı, koltuk, sehpa, televizyon
    const rug = mesh(new THREE.PlaneGeometry(7, 5).rotateX(-Math.PI / 2), toon('#d98b74'), false);
    this.add(rug, -5, -3, 0, 0.03);
    {
      const sofa = new THREE.Group();
      sofa.add(this.box(4.4, 0.6, 1.8, '#5b8def', 0, 0.55, 0));
      sofa.add(this.box(4.4, 1.2, 0.45, '#5b8def', 0, 1.2, -0.75));
      for (const s of [-1, 1]) sofa.add(this.box(0.4, 0.9, 1.8, '#4a76cc', s * 2, 1, 0));
      for (const s of [-1, 1]) sofa.add(this.box(0.9, 0.28, 0.9, '#ffd43b', s * 1.1, 0.95, 0.2, false));
      this.add(sofa, -5, -1.2, 0);
      this.solid(-5, -1.2, 4.8, 2.2, 1.2);
      const ct = this.table(2.2, 1.1, '#b9773f', 0.9);
      this.add(ct, -5, -3.4);
      this.solid(-5, -3.4, 2.2, 1.1, 1);
      const bowl = outline(mesh(new THREE.SphereGeometry(0.3, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon('#ff8fb1')), 1.07);
      bowl.rotation.x = Math.PI;
      bowl.position.set(-5, 1.15, -3.4);
      this.scene.add(bowl);
    }
    // televizyon (arka duvarda, ekranı oynar)
    const tvMat = toon('#204060', { emissive: '#12304a' }) as THREE.MeshToonMaterial;
    {
      const g = new THREE.Group();
      g.add(this.box(4, 0.9, 1.1, '#8a5a35', 0, 0.45, 0));
      g.add(this.box(0.3, 0.9, 0.3, '#2f3540', 0, 1.35, 0, false));
      g.add(this.box(4.4, 2.5, 0.22, '#2f3540', 0, 3, 0));
      const scr = mesh(new THREE.BoxGeometry(4, 2.1, 0.08), tvMat, false);
      scr.position.set(0, 3, 0.16);
      g.add(scr);
      this.add(g, -5, -D / 2 + 0.9);
      this.solid(-5, -D / 2 + 0.9, 4.4, 1.3, 1.1);
    }
    const cols = ['#2b6cb0', '#3fa45a', '#c0392b', '#f6a623', '#7c5cff'];
    let tvOn = false;
    this.ticks.push((_dt, t) => {
      tvMat.emissive.set(tvOn ? cols[Math.floor(t * 1.5) % cols.length] : '#12304a');
    });
    // kitaplık ve saksı
    {
      const sh = this.shelf(3.4, 3, 0.9, 3, '#8a5a35', (i) => ['#ef4b4b', '#4dabf7', '#3fa45a', '#ffd43b', '#c86bff'][i % 5], 0.65, 0.2);
      this.add(sh, -W / 2 + 0.8, -1, Math.PI / 2);
      this.solid(-W / 2 + 0.8, -1, 1.1, 3.4, 3);
      this.add(this.plant(1.2), -W / 2 + 1.2, 1.8);
      this.solid(-W / 2 + 1.2, 1.8, 1.1, 1.1, 1.2);
      const lamp = new THREE.Group();
      lamp.add(this.box(0.5, 0.12, 0.5, '#5b5f6b', 0, 0.06, 0, false));
      lamp.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 8), toon('#5b5f6b'), false).translateY(1.2));
      const shade = mesh(new THREE.CylinderGeometry(0.5, 0.7, 0.8, 14), toon('#fff1c7', { emissive: '#8a7a20' }), false);
      shade.position.y = 2.7;
      lamp.add(shade);
      this.add(lamp, -8, -4.6);
      this.solid(-8, -4.6, 0.8, 0.8, 0.8);
    }

    // ---- mutfak köşesi (sağ arka)
    {
      const k = new THREE.Group();
      k.add(this.box(8, 1.5, 1.4, '#eef3f8', 0, 0.75, 0));
      k.add(this.box(8.2, 0.18, 1.6, '#b9773f', 0, 1.6, 0, false));
      // evye
      const sink = mesh(new THREE.BoxGeometry(1.4, 0.3, 1, 1), toon('#c0c6cf'), false);
      sink.position.set(-2.4, 1.55, 0);
      const tap = mesh(new THREE.TorusGeometry(0.22, 0.05, 6, 12, Math.PI), toon('#c0c6cf'), false);
      tap.position.set(-2.4, 1.9, -0.4);
      k.add(sink, tap);
      // ocak ve tencere
      for (let i = 0; i < 4; i++) {
        const o = mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.05, 14), toon('#2f3540'), false);
        o.position.set(1.4 + (i % 2) * 0.8, 1.72, -0.35 + Math.floor(i / 2) * 0.7);
        k.add(o);
      }
      const pot = outline(mesh(new THREE.CylinderGeometry(0.42, 0.38, 0.5, 14), toon('#ef4b4b')), 1.05);
      pot.position.set(1.4, 1.95, -0.35);
      k.add(pot);
      // üst dolaplar
      k.add(this.box(7.6, 1.6, 0.8, '#dce6ef', 0, 3.4, -0.3));
      this.add(k, 5, -D / 2 + 0.9);
      this.solid(5, -D / 2 + 0.9, 8.2, 1.8, 1.7);
      // buzdolabı
      const fr = new THREE.Group();
      fr.add(this.box(1.8, 4, 1.6, '#f1f3f5', 0, 2, 0));
      fr.add(this.box(1.84, 0.1, 1.64, '#cfd6e2', 0, 2.6, 0, false));
      for (const y of [1.6, 3.1]) fr.add(this.box(0.1, 0.5, 0.1, '#8d939e', 0.7, y, 0.84, false));
      this.add(fr, W / 2 - 1.2, -D / 2 + 2.8);
      this.solid(W / 2 - 1.2, -D / 2 + 2.8, 1.9, 1.7, 4);
      // yemek masası
      const t = this.table(2.6, 1.6, '#b9773f', 1.25);
      this.add(t, 5, -1.4);
      this.solid(5, -1.4, 2.6, 1.6, 1.3);
      for (const [cx, cz, r] of [[5, -3, 0], [5, 0.2, Math.PI]] as const) {
        this.add(this.chair('#f6a623'), cx, cz, r);
        this.solid(cx, cz, 1.1, 1.1, 1.4);
      }
    }

    // ---- yatak köşesi (sağ ön)
    {
      const bed = new THREE.Group();
      bed.add(this.box(3, 0.7, 4.4, '#8a5a35', 0, 0.5, 0));
      bed.add(this.box(2.8, 0.45, 4.2, '#eaf0f6', 0, 1.05, 0, false));
      bed.add(this.box(3.1, 1.5, 0.3, '#6b4a33', 0, 0.9, -2.2));
      bed.add(this.box(2.6, 0.3, 0.9, '#ffffff', 0, 1.38, -1.5, false));
      bed.add(this.box(2.8, 0.26, 2.6, '#5b8def', 0, 1.36, 0.7, false));
      this.add(bed, W / 2 - 2.6, 2.8);
      this.solid(W / 2 - 2.6, 2.8, 3.2, 4.6, 1.4);
      const ns = new THREE.Group();
      ns.add(this.box(1, 1.1, 1, '#8a5a35', 0, 0.55, 0));
      const sl = mesh(new THREE.SphereGeometry(0.26, 10, 8), toon('#fff1c7', { emissive: '#8a7a20' }), false);
      sl.position.y = 1.4;
      ns.add(sl);
      this.add(ns, W / 2 - 2.6, -0.7);
      this.solid(W / 2 - 2.6, -0.7, 1.1, 1.1, 1.2);
      // gardırop
      const wd = new THREE.Group();
      wd.add(this.box(1.2, 3.4, 2.4, '#a9764f', 0, 1.7, 0));
      for (const z of [-0.7, 0.7]) wd.add(this.box(0.1, 0.4, 0.1, '#ffd43b', 0.64, 1.8, z, false));
      this.add(wd, W / 2 - 0.9, 6.6);
      this.solid(W / 2 - 0.9, 6.6, 1.3, 2.4, 3.4);
    }
    const komsu = this.npc({ gender: 'kiz', dress: 'yazlik', dressColor: '#f783ac', hair: 'dalgali' }, -9.4, 5.6, 0.7, 'idle', 1.2, 8);
    this.hang(this.wallBack, board('EVİNE HOŞ GELDİN', '#f08a5d', '#ffffff', 5.5, 1, 700), 0, 4.6, 0.06);

    // ---- etkinlikler
    this.spot('apartman-tv', -5, 0.9, 2.2, 'Koltukta televizyon izle', {
      dur: 7, pose: 'sit', cam: [9, 5],
      start: () => {
        tvOn = true;
        this.fx('pop');
      },
      step: (_t, _u, a) => {
        a.pos.set(-5, 0.5, -1.1);
        a.heading = Math.PI;
      },
      end: () => {
        tvOn = false;
        this.fx('yay');
        return 'Çizgi film çok komikti! Kanepede kahkaha attın.';
      },
    });
    this.spot('apartman-mutfak', 6.4, -4.6, 2, 'Mutfakta yemek pişir', {
      dur: 6.5, pose: 'hold', cam: [9, 5],
      step: (t, _u, a, dt) => {
        a.pos.set(6.4, 0, -D / 2 + 2.6);
        a.heading = Math.PI;
        if (beat(t, dt, 0.8)) {
          this.fx('clack');
          this.sparkles.burst(new THREE.Vector3(6.4, 2.6, -D / 2 + 1.2), 4, '#ffd1a8');
        }
      },
      end: (a) => {
        const plate = new THREE.Group();
        plate.add(outline(mesh(new THREE.CylinderGeometry(0.34, 0.3, 0.08, 16), toon('#ffffff')), 1.05));
        plate.add(outline(mesh(new THREE.SphereGeometry(0.17, 10, 8), toon('#ef4b4b')), 1.08).translateY(0.1));
        holdItem(a, plate);
        this.fx('yay');
        return 'Makarna hazır! Mis gibi kokuyor.';
      },
    });
    this.spot('apartman-yemek', 2.8, -1.4, 1.8, 'Masada yemek ye', {
      dur: 5, pose: 'sit', cam: [8, 4.6],
      step: (_t, _u, a) => {
        a.pos.set(5, 0.45, 0.1);
        a.heading = Math.PI;
      },
      end: () => {
        this.fx('yay');
        return 'Afiyet olsun! Tabağını tertemiz bitirdin.';
      },
    });
    this.spot('apartman-yatak', W / 2 - 5.4, 2.8, 2, 'Yatakta zıpla', {
      dur: 5, pose: 'jump', cam: [9, 5],
      step: (t, _u, a, dt) => {
        a.pos.set(W / 2 - 2.6, 1.3 + Math.abs(Math.sin(t * 3.4)) * 1.1, 2.8);
        a.heading = -Math.PI / 2;
        if (beat(t, dt, Math.PI / 3.4)) this.fx('boing');
      },
      end: () => {
        this.fx('yay');
        this.sparkles.burst(new THREE.Vector3(W / 2 - 2.6, 2.4, 2.8), 12, '#cfe7ff');
        return 'Yatakta zıpladın! (Anneye söylemek yok.)';
      },
    });
    this.spot('apartman-komsu', -9.4, 3.6, 2, 'Komşuya merhaba de', {
      dur: 3.4, pose: 'wave', cam: [7, 4.4],
      start: () => void (komsu.pose = 'wave'),
      step: (_t, _u, a) => {
        a.pos.set(-9.4, 0, 3.8);
        a.heading = 0;
      },
      end: () => {
        komsu.pose = 'idle';
        this.fx('yay');
        return 'Komşun: Hoş geldin! Kurabiye ister misin?';
      },
    });
  }

  // ----------------------------------------------------------------------------------------------
  // Müze: bulunan balıklar, fosiller, kabuklar ve böcekler camekânlarda sergilenir
  // ----------------------------------------------------------------------------------------------
  private museum() {
    const { W, D } = this;

    /** Kaideli, camlı sergi dolabı. İçindeki parça bulunduysa renkli, bulunmadıysa soru işareti. */
    const kutu = (c: Collectible, x: number, z: number, rot: number) => {
      const bulundu = this.found.includes(c.id);
      const g = new THREE.Group();
      // kaide
      g.add(this.box(1.5, 1.15, 1.2, '#cfc3ad', 0, 0.58, 0));
      g.add(this.box(1.68, 0.14, 1.36, '#b8aa90', 0, 1.2, 0, false));
      // cam fanus
      const cam = mesh(new THREE.BoxGeometry(1.3, 1.4, 1.05), toon(bulundu ? '#dff1ff' : '#e6e0d4', { transparent: true, opacity: bulundu ? 0.3 : 0.45 }), false);
      cam.position.y = 2;
      g.add(cam);
      for (const sx of [-0.65, 0.65]) g.add(this.box(0.07, 1.4, 0.07, '#9c8e78', sx, 2, 0.5, false));
      // içindeki parça: balığın, fosilin, kabuğun ya da böceğin kendi modeli (src/world/collectModels.ts)
      if (bulundu) {
        const model = collectModel(c);
        // modeli camekâna sığacak kadar küçült ve ortala (dönerken cama değmesin)
        const kt = new THREE.Box3().setFromObject(model);
        const boy = kt.getSize(new THREE.Vector3());
        const orta = kt.getCenter(new THREE.Vector3());
        model.position.sub(orta);
        const yatay = Math.max(0.01, Math.hypot(boy.x, boy.z) / 2);
        const donen = new THREE.Group();
        donen.add(model);
        const p = new THREE.Group();
        p.add(donen);
        p.scale.setScalar(Math.min(1.6, 0.46 / yatay, 0.62 / Math.max(0.01, boy.y)));
        // hafif öne eğik durur: yassı parçalar (deniz yıldızı, kelebek) da seçilsin
        p.rotation.x = 0.3;
        p.position.y = 1.78;
        g.add(p);
        this.ticks.push((_dt, t) => {
          donen.rotation.y = t * 0.7;
          p.position.y = 1.78 + Math.sin(t * 1.6 + x) * 0.05;
        });
      } else {
        const q = board('?', '#d8cfbb', '#8a7b63', 0.5, 0.6, 800);
        q.position.set(0, 1.85, 0.03);
        g.add(q);
      }
      // ad levhası
      const ad = board(bulundu ? c.name : '???', bulundu ? '#8a5a35' : '#b8aa90', '#ffffff', 1.5, 0.4, 700);
      ad.position.set(0, 1.3, 0.62);
      ad.rotation.x = -0.5;
      g.add(ad);
      this.add(g, x, z, rot);
      this.solid(x, z, 1.8, 1.5, 2.6);

      this.spot(`muze-${c.id}`, x + Math.sin(rot) * 2.1, z + Math.cos(rot) * 2.1, 1.7, bulundu ? c.name : 'Boş camekân', {
        dur: 3, pose: 'idle', cam: [7, 4.4],
        step: (_t, _u, a) => {
          a.pos.set(x + Math.sin(rot) * 1.9, 0, z + Math.cos(rot) * 1.9);
          a.heading = rot + Math.PI;
        },
        end: () => {
          if (!bulundu) return emptyCaseLine(parca(c.id)?.group ?? 'balik');
          this.fx('pop');
          this.sparkles.burst(new THREE.Vector3(x, 2.2, z), 8, c.color);
          return caseLine(parca(c.id)!);
        },
      });
    };

    // ---- salonlar: balıklar arka duvarda, fosiller solda, kabuklar sağda, böcekler ortada
    const balik = byGroup('balik');
    const fosil = byGroup('fosil');
    const kabuk = byGroup('kabuk');
    const bocek = byGroup('bocek');
    balik.forEach((c, i) => kutu(c, -W / 2 + 3.4 + i * 3.4, -D / 2 + 2.2, 0));
    fosil.forEach((c, i) => kutu(c, -W / 2 + 2.2, -D / 2 + 6.5 + i * 2.5, Math.PI / 2));
    kabuk.forEach((c, i) => kutu(c, W / 2 - 2.2, -D / 2 + 6.5 + i * 2.5, -Math.PI / 2));
    // böcekler: ortadaki adanın iki yanında
    bocek.forEach((c, i) => kutu(c, -3.4 + (i % 3) * 3.4, 2.4 + Math.floor(i / 3) * 3.2, Math.PI));

    // ---- salon tabelaları
    const tabela = (g: CollectGroup, wall: THREE.Group, along: number) => {
      const t = board(GROUPS[g].name, GROUPS[g].color, '#ffffff', 4.2, 0.9, 700);
      this.hang(wall, t, along, 5.4, 0.05);
    };
    tabela('balik', this.wallBack, 0);
    tabela('fosil', this.wallLeft, 0);
    tabela('kabuk', this.wallRight, 0);

    // ---- ortadaki dinozor iskeleti (müzenin baş eseri)
    {
      const g = new THREE.Group();
      g.add(this.box(6.4, 0.4, 3.6, '#cfc3ad', 0, 0.2, 0));
      const omur = new THREE.Group();
      for (let i = 0; i < 9; i++) {
        const k = outline(mesh(new THREE.SphereGeometry(0.38 - i * 0.016, 10, 8), toon('#efe7d6')), 1.06);
        k.position.set(-2.5 + i * 0.63, 2.3 + Math.sin(i * 0.4) * 0.22, 0);
        omur.add(k);
        if (i > 1 && i < 7) {
          for (const s of [-1, 1]) {
            const kaburga = mesh(new THREE.TorusGeometry(0.72, 0.075, 6, 16, Math.PI), toon('#efe7d6'), false);
            kaburga.rotation.set(Math.PI / 2, 0, s * Math.PI / 2);
            kaburga.position.set(k.position.x, k.position.y - 0.15, 0);
            omur.add(kaburga);
          }
        }
      }
      const kafa = outline(mesh(new THREE.BoxGeometry(1.3, 0.78, 0.6), toon('#efe7d6')), 1.05);
      kafa.position.set(-3.5, 2.6, 0);
      const cene = outline(mesh(new THREE.BoxGeometry(1.05, 0.26, 0.5), toon('#efe7d6')), 1.05);
      cene.position.set(-3.42, 2.14, 0);
      // göz çukuru ve dişler
      for (const sz of [-0.31, 0.31]) {
        const goz = mesh(new THREE.BoxGeometry(0.26, 0.26, 0.06), toon('#6b5f4c'), false);
        goz.position.set(-3.75, 2.72, sz);
        kafa.add(goz.clone().translateX(3.75).translateY(-2.72).translateZ(-sz));
      }
      const kuyruk = new THREE.Group();
      for (let i = 0; i < 5; i++) {
        const k = outline(mesh(new THREE.SphereGeometry(0.25 - i * 0.035, 8, 6), toon('#efe7d6')), 1.07);
        k.position.set(3.1 + i * 0.5, 2.3 - i * 0.2, 0);
        kuyruk.add(k);
      }
      for (const sx of [-1.4, 1.4]) for (const sz of [-0.5, 0.5]) {
        const bacak = mesh(new THREE.CylinderGeometry(0.15, 0.12, 2, 7), toon('#efe7d6'), false);
        bacak.position.set(sx, 1.2, sz);
        g.add(bacak);
      }
      g.add(omur, kafa, cene, kuyruk);
      this.add(g, 0, -1.6);
      this.solid(0, -1.6, 6.8, 3.8, 2.8);
      this.ticks.push((_dt, t) => {
        kafa.rotation.z = Math.sin(t * 0.6) * 0.05;
      });
      this.spot('muze-dino', 0, 1.1, 2, 'Dev iskelete bak', {
        dur: 4, pose: 'clap', cam: [11, 6],
        step: (_t, _u, a) => {
          a.pos.set(0, 0, 1.2);
          a.heading = Math.PI;
        },
        end: () => {
          this.fx('yay');
          return 'Bu iskelet milyonlarca yıl önce yaşamış bir dinozora ait. Kemikler taşa dönüşünce fosil olur!';
        },
      });
    }

    // ---- küratör ve bilgi panosu
    const kurator = this.npc(
      { gender: 'kiz', top: 'gomlek', topColor: '#ffffff', bottom: 'etek', bottomColor: '#8a5a35', glasses: 'kare', hair: 'kut' },
      W / 2 - 3.2, D / 2 - 4.2, -2.2, 'idle', 1.2, 2,
    );
    {
      const pano = new THREE.Group();
      pano.add(this.box(4.4, 2.6, 0.2, '#f7f2e6', 0, 1.9, 0));
      pano.add(this.box(4.7, 0.2, 0.3, '#8a5a35', 0, 3.3, 0, false));
      for (const sx of [-1.9, 1.9]) pano.add(this.box(0.16, 1.9, 0.16, '#8a5a35', sx, 0.95, 0, false));
      const basl = board('Koleksiyonun', '#8a5a35', '#ffffff', 3.4, 0.6, 700);
      basl.position.set(0, 2.7, 0.12);
      pano.add(basl);
      const yazi = board(`${this.found.length} / ${TOTAL}`, '#f7f2e6', '#8a5a35', 3.2, 1.3, 800);
      yazi.position.set(0, 1.7, 0.12);
      pano.add(yazi);
      this.add(pano, -W / 2 + 3.4, D / 2 - 3.4, 0.6);
      this.solid(-W / 2 + 3.4, D / 2 - 3.4, 2.4, 1, 3);
    }

    this.spot('muze-kurator', W / 2 - 3.2, D / 2 - 6.4, 2, 'Küratörle konuş', {
      dur: 3.4, pose: 'wave', cam: [8, 4.6],
      start: () => void (kurator.pose = 'wave'),
      step: (_t, _u, a) => {
        a.pos.set(W / 2 - 3.2, 0, D / 2 - 6.2);
        a.heading = 0;
      },
      end: () => {
        kurator.pose = 'idle';
        const n = this.found.length;
        if (n >= TOTAL) return 'Küratör: Bütün koleksiyonu tamamladın! Müzemizin en büyük kâşifi sensin!';
        if (!n) return 'Küratör: Hoş geldin! Camekânlar şimdilik boş. Adada balık tut, fosil kaz, kabuk topla, böcek ara!';
        return `Küratör: ${n} parçan var, ${TOTAL - n} tane daha bulursan koleksiyon tamamlanır. Hadi bakalım!`;
      },
    });

    // ---- bilgi levhaları (duvarlarda)
    const levha = (wall: THREE.Group, along: number, metin: string, renk: string) => {
      const l = board(metin, renk, '#ffffff', 3.4, 0.7, 600);
      this.hang(wall, l, along, 3.6, 0.05);
    };
    levha(this.wallBack, -9.5, 'Balıklar iskelede bulunur', '#3f7fe0');
    levha(this.wallBack, 9.5, 'Dinozorlar taşa dönüşür', '#c4874f');
    levha(this.wallLeft, -7.5, 'Fosiller vadide kazılır', '#c4874f');
    levha(this.wallRight, -7.5, 'Kabuklar denizin altında', '#e9a3b8');

    // ---- banklar ve saksılar
    for (const [bx, bz] of [[-6.5, 6.5], [6.5, 6.5]] as const) {
      const b = new THREE.Group();
      b.add(this.box(2.6, 0.18, 0.9, '#b9773f', 0, 0.62, 0));
      for (const sx of [-1, 1]) b.add(this.box(0.2, 0.6, 0.8, '#9c6a3a', sx * 1.1, 0.3, 0, false));
      this.add(b, bx, bz);
      this.solid(bx, bz, 2.8, 1.1, 0.7);
    }
    for (const [px, pz] of [[-W / 2 + 1.6, D / 2 - 1.8], [W / 2 - 1.6, D / 2 - 1.8]] as const) {
      this.add(this.plant(1.5), px, pz);
      this.solid(px, pz, 1.3, 1.3, 1.4);
    }
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
