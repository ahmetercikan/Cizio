/**
 * Şehir Merkezi: Çizio Adası'nın gökdelenli, caddeli, kalabalık büyük şehri (kuzeydoğudaki yeni yarımada).
 *
 * Köy ve çiftlik yerinde durur; burası adanın "şehir" tarafı: dönel kavşak, geniş caddeler, yaya geçitleri,
 * trafik ışıkları, AVM, sinema meydanı, otel, ofis kuleleri, apartmanlar ve tepesine çıkılan Çizio Kulesi.
 * Yerel düzen: +lz kasabaya (bölge girişine) bakar, +lx sağ taraftır.
 */
import * as THREE from 'three';
import { canvasTexture, mesh, outline, toon, tree } from '../play3d/kit';
import { zone } from './layout';
import type { InteriorId } from './homestead';
import { frame, board, bench, holdItem } from './places';
import { sign, type WorldBuilder } from './zones';
import { carModel } from './cars';
import { taxiModel } from './vehicles';

const sm = (u: number) => u * u * (3 - 2 * u);
const DARK = '#39404d';

/** Pencere dokusu: gece yanan camlı cephe (map + emissiveMap aynı doku). */
const winTex = new Map<string, THREE.Texture>();
function windows(color: string, glass: string) {
  const k = `${color}|${glass}`;
  let t = winTex.get(k);
  if (!t) {
    t = canvasTexture(128, 128, (x) => {
      x.fillStyle = color;
      x.fillRect(0, 0, 128, 128);
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
        x.fillStyle = glass;
        x.beginPath();
        x.roundRect(c * 32 + 6, r * 32 + 8, 20, 17, 4);
        x.fill();
      }
    });
    winTex.set(k, t);
  }
  return t;
}
/** Gece yanan pencere malzemeleri (b.night ile parlar). */
const litMats: THREE.MeshToonMaterial[] = [];
function facade(color: string, glass: string, w: number, h: number, floor = 3.2) {
  const map = windows(color, glass).clone();
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(Math.max(1, Math.round(w / 3.1)), Math.max(1, Math.round(h / floor)));
  map.needsUpdate = true;
  const m = new THREE.MeshToonMaterial({ map, emissive: new THREE.Color('#ffd98a'), emissiveMap: map, emissiveIntensity: 0 });
  litMats.push(m);
  return m;
}

export interface TowerOpts {
  w: number;
  d: number;
  h: number;
  /** Duvar rengi. */
  wall: string;
  /** Cam rengi. */
  glass?: string;
  /** Zemin katın (giriş) rengi. */
  base?: string;
  name?: string;
  signBg?: string;
  /** Tepede daralan ikinci bölüm. */
  crown?: number;
  /** Çatı anteni. */
  antenna?: boolean;
}

/**
 * Gökdelen / apartman: camlı gövde, geniş giriş katı, çatı korkuluğu, istenirse daralan tepe ve anten.
 * Önü +z'ye bakar (tabela ve kapı o yüzde).
 */
export function tower(o: TowerOpts) {
  const g = new THREE.Group();
  const glass = o.glass ?? '#bfe6ff';
  const baseH = 3.6;
  const body = mesh(new THREE.BoxGeometry(o.w, o.h - baseH, o.d), facade(o.wall, glass, o.w, o.h - baseH), true);
  body.position.y = baseH + (o.h - baseH) / 2;
  g.add(outline(body, 1.004));
  // giriş katı: camlı vitrin ve kapı
  const base = outline(mesh(new THREE.BoxGeometry(o.w + 0.5, baseH, o.d + 0.5), toon(o.base ?? DARK)), 1.006);
  base.position.y = baseH / 2;
  g.add(base);
  const shop = mesh(new THREE.BoxGeometry(o.w - 1.2, 2.3, 0.14), toon(glass, { emissive: '#1d2b34' }), false);
  shop.position.set(0, 1.9, o.d / 2 + 0.3);
  const door = mesh(new THREE.BoxGeometry(2.6, 2.9, 0.18), toon('#e9f4ff', { emissive: '#263845' }), false);
  door.position.set(0, 1.45, o.d / 2 + 0.36);
  const frameBar = mesh(new THREE.BoxGeometry(0.16, 2.9, 0.22), toon(DARK), false);
  frameBar.position.set(0, 1.45, o.d / 2 + 0.44);
  g.add(shop, door, frameBar);
  // çatı: korkuluk ve makine dairesi
  const parapet = outline(mesh(new THREE.BoxGeometry(o.w + 0.8, 0.7, o.d + 0.8), toon(o.base ?? DARK)), 1.004);
  parapet.position.y = o.h + 0.35;
  g.add(parapet);
  let top = o.h + 0.7;
  if (o.crown) {
    const c = outline(mesh(new THREE.BoxGeometry(o.w * 0.62, o.crown, o.d * 0.62), facade(o.wall, glass, o.w * 0.62, o.crown)), 1.006);
    c.position.y = top + o.crown / 2;
    g.add(c);
    const cap = outline(mesh(new THREE.BoxGeometry(o.w * 0.7, 0.5, o.d * 0.7), toon(o.base ?? DARK)), 1.004);
    cap.position.y = top + o.crown + 0.25;
    g.add(cap);
    top += o.crown + 0.5;
  }
  if (o.antenna) {
    const a = mesh(new THREE.CylinderGeometry(0.1, 0.22, 7, 7), toon('#cfd6e2'), false);
    a.position.y = top + 3.5;
    const lamp = mesh(new THREE.SphereGeometry(0.34, 10, 8), new THREE.MeshBasicMaterial({ color: '#ff5555' }), false);
    lamp.position.y = top + 7.2;
    g.add(a, lamp);
  }
  if (o.name) {
    const sg = board(o.name, o.signBg ?? '#5b8def', '#ffffff', Math.min(o.w - 1.4, 9), 1.7, 700);
    sg.position.set(0, baseH + 1.5, o.d / 2 + 0.42);
    g.add(sg);
  }
  g.traverse((x) => {
    if ((x as THREE.Mesh).isMesh) x.castShadow = true;
  });
  return g;
}

/** Asfalt dokusu: ortada kesik şerit. */
function asphalt() {
  return canvasTexture(64, 128, (x) => {
    x.fillStyle = '#6f757f';
    x.fillRect(0, 0, 64, 128);
    x.fillStyle = '#ffe9a8';
    x.fillRect(29, 18, 6, 64);
  });
}

// ================================================================================================
export function buildDowntown(b: WorldBuilder) {
  const Z = zone('downtown');
  const F = frame(b, Z);
  const { put, blk, blkRect, G, L, head, hAt } = F;
  b.keepOut.push({ x: Z.x, z: Z.z, r: 64 });
  const R_ = -Math.PI / 2, L_ = Math.PI / 2;

  // ---------------------------------------------------------------- caddeler, kaldırımlar, kavşak
  const roadMat = (len: number) => {
    const t = asphalt();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1, len / 8);
    t.needsUpdate = true;
    const m = toon('#ffffff').clone() as THREE.MeshToonMaterial;
    m.map = t;
    return m;
  };
  /** Bir cadde: asfalt + iki yanında kaldırım. `along` true ise lz boyunca. */
  const avenue = (along: boolean, from: number, to: number, w = 13) => {
    const len = to - from, mid = (from + to) / 2;
    const road = mesh(new THREE.PlaneGeometry(w, len).rotateX(-Math.PI / 2), roadMat(len), false);
    road.receiveShadow = true;
    put(road, along ? 0 : mid, along ? mid : 0, along ? 0 : Math.PI / 2, 0.1);
    for (const s of [-1, 1]) {
      const walk = mesh(new THREE.BoxGeometry(along ? 4 : len, 0.28, along ? len : 4), toon('#e7e2d6'), false);
      walk.receiveShadow = true;
      put(walk, along ? s * (w / 2 + 2) : mid, along ? mid : s * (w / 2 + 2), 0, 0.1);
    }
  };
  avenue(true, 17, 62);
  avenue(true, -62, -17);
  avenue(false, 17, 60);
  avenue(false, -60, -17);
  // yaya geçitleri
  const zebra = (lx: number, lz: number, rot: number) => {
    for (let i = -5; i <= 5; i++) {
      const st = mesh(new THREE.PlaneGeometry(0.8, 4.4).rotateX(-Math.PI / 2), toon('#ffffff'), false);
      put(st, lx + Math.cos(rot) * i * 1.2, lz - Math.sin(rot) * i * 1.2, rot, 0.14);
    }
  };
  zebra(0, 21, 0);
  zebra(0, -21, 0);
  zebra(21, 0, Math.PI / 2);
  zebra(-21, 0, Math.PI / 2);

  // dönel kavşak: dış halka asfalt, ortada yeşil ada ve anıt
  {
    const ring = mesh(new THREE.RingGeometry(8.5, 17, 48).rotateX(-Math.PI / 2), toon('#6f757f'), false);
    ring.receiveShadow = true;
    put(ring, 0, 0, 0, 0.11);
    const kerb = mesh(new THREE.RingGeometry(8.5, 9.1, 48).rotateX(-Math.PI / 2), toon('#efe9dc'), false);
    put(kerb, 0, 0, 0, 0.16);
    const isle = mesh(new THREE.CircleGeometry(8.5, 40).rotateX(-Math.PI / 2), toon('#8fd16f'), false);
    isle.receiveShadow = true;
    put(isle, 0, 0, 0, 0.13);
    // anıt: üç kademeli kaide ve dönen altın yıldız
    const mon = new THREE.Group();
    for (const [r, y, h] of [[3.2, 0.5, 1], [2.3, 1.5, 1], [1.4, 2.6, 1.2]] as const) {
      const s = outline(mesh(new THREE.CylinderGeometry(r, r + 0.3, h, 20), toon('#dfd8c8')), 1.03);
      s.position.y = y;
      mon.add(s);
    }
    const col = outline(mesh(new THREE.CylinderGeometry(0.55, 0.75, 6, 14), toon('#f2ece0')), 1.03);
    col.position.y = 6.2;
    mon.add(col);
    const globe = outline(mesh(new THREE.IcosahedronGeometry(1.5, 1), toon('#6c7bff', { emissive: '#1b1f55' })), 1.04);
    globe.position.y = 10.4;
    mon.add(globe);
    put(mon, 0, 0);
    blk(0, 0, 4);
    b.tick((dt) => void (globe.rotation.y += dt * 0.5));
    // ada çiçekleri
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const t = tree('round', 0.55 + (i % 3) * 0.12);
      put(t, Math.cos(a) * 6.6, Math.sin(a) * 6.6);
      blk(Math.cos(a) * 6.6, Math.sin(a) * 6.6, 0.7);
    }
  }

  // ---------------------------------------------------------------- sokak donanımı
  const lampPost = (lx: number, lz: number) => {
    const g = new THREE.Group();
    const pole = mesh(new THREE.CylinderGeometry(0.11, 0.15, 6.4, 8), toon('#4c5361'));
    pole.position.y = 3.2;
    const arm = mesh(new THREE.BoxGeometry(1.5, 0.14, 0.14), toon('#4c5361'), false);
    arm.position.set(0.7, 6.3, 0);
    const bulb = mesh(new THREE.SphereGeometry(0.38, 10, 8), toon('#fff6c9', { emissive: '#8a7a20' }), false);
    bulb.position.set(1.4, 6.1, 0);
    g.add(pole, arm, bulb);
    const o = put(g, lx, lz);
    blk(lx, lz, 0.4);
    b.lamps.push(new THREE.Vector3(o.position.x + Math.cos(F.yaw) * 1.4, o.position.y + 6.1, o.position.z - Math.sin(F.yaw) * 1.4));
  };
  for (const d of [24, 34, 44, 54]) for (const s of [-1, 1]) {
    lampPost(s * 9.4, d);
    lampPost(s * 9.4, -d);
    lampPost(d, s * 9.4);
    lampPost(-d, s * 9.4);
  }
  // trafik ışıkları (kavşağın dört ağzı)
  for (const [lx, lz, rot] of [[-8.4, 19, 0], [8.4, -19, Math.PI], [19, 8.4, L_], [-19, -8.4, R_]] as const) {
    const g = new THREE.Group();
    const pole = mesh(new THREE.CylinderGeometry(0.1, 0.12, 4.2, 6), toon('#434a57'));
    pole.position.y = 2.1;
    const bx = outline(mesh(new THREE.BoxGeometry(0.6, 1.7, 0.5), toon('#2f3540')), 1.05);
    bx.position.y = 4.6;
    g.add(pole, bx);
    const lamps = ['#ef4b4b', '#ffd43b', '#4cd964'].map((c, i) => {
      const l = mesh(new THREE.SphereGeometry(0.17, 8, 6), new THREE.MeshBasicMaterial({ color: '#2a2a2a' }), false);
      l.position.set(0, 5.1 - i * 0.5, 0.26);
      g.add(l);
      return [l, new THREE.Color(c)] as const;
    });
    put(g, lx, lz, rot);
    blk(lx, lz, 0.35);
    b.tick((_dt, t) => {
      const k = Math.floor(t / 3) % 3;
      lamps.forEach(([l, c], i) => (l.material as THREE.MeshBasicMaterial).color.copy(i === 2 - k ? c : new THREE.Color('#2a2a2a')));
    });
  }
  // banklar, çöp kutuları, saksılar
  for (const [lx, lz, rot] of [[-9.6, 26, L_], [9.6, 30, R_], [-9.6, -30, L_], [9.6, -26, R_], [26, -9.6, 0], [-30, 9.6, Math.PI]] as const) {
    put(bench(), lx, lz, rot);
    blk(lx, lz, 1);
    const bin = outline(mesh(new THREE.CylinderGeometry(0.42, 0.36, 1, 10), toon('#3f8f6a')), 1.04);
    bin.position.y = 0.5;
    put(bin, lx + Math.sin(rot) * 2.6, lz + Math.cos(rot) * 2.6);
  }
  for (const [lx, lz] of [[-9.6, 38], [9.6, 38], [-9.6, -38], [9.6, -38], [38, 9.6], [38, -9.6], [-38, 9.6], [-38, -9.6]] as const) {
    const pot = new THREE.Group();
    const p = outline(mesh(new THREE.CylinderGeometry(1.1, 0.9, 0.9, 12), toon('#c98a4b')), 1.04);
    p.position.y = 0.45;
    const t = tree('round', 0.95);
    t.position.y = 0.85;
    pot.add(p, t);
    put(pot, lx, lz);
    blk(lx, lz, 1.1);
  }

  // ---------------------------------------------------------------- gökdelenler ve binalar
  /** Binayı koy, engelini kur. */
  const place = (o: THREE.Object3D, lx: number, lz: number, rot: number, w: number, d: number) => {
    put(o, lx, lz, rot);
    blkRect(lx, lz, w + 0.6, d + 0.6, rot);
  };

  // Çizio Kulesi: adanın en yüksek yapısı, tepesine asansörle çıkılır
  const KX = 26, KZ = -30, KH = 58;
  const kule = tower({ w: 15, d: 15, h: KH, wall: '#8ea6c8', glass: '#d7f0ff', base: '#2e3747', name: 'ÇİZİO KULESİ', signBg: '#2e3747', crown: 8, antenna: true });
  place(kule, KX, KZ, 0, 15, 15);
  // seyir terası (tepede, kule grubunun içinde)
  {
    const deck = outline(mesh(new THREE.BoxGeometry(18, 0.6, 18), toon('#2e3747')), 1.01);
    deck.position.y = KH - 5.5;
    const rail = mesh(new THREE.BoxGeometry(18, 1.1, 0.16), toon('#cfe6ff', { transparent: true, opacity: 0.55 }), false);
    for (const [x, z, r] of [[0, 9, 0], [0, -9, 0], [9, 0, Math.PI / 2], [-9, 0, Math.PI / 2]] as const) {
      const w = rail.clone();
      w.position.set(x, KH - 4.6, z);
      w.rotation.y = r;
      kule.add(w);
    }
    kule.add(deck);
    // asansör rayı: ön yüzde camlı şaft
    const shaft = mesh(new THREE.BoxGeometry(3.2, KH - 6, 0.5), toon('#cfe6ff', { transparent: true, opacity: 0.4 }), false);
    shaft.position.set(0, (KH - 6) / 2, 7.9);
    for (const s of [-1, 1]) {
      const rail = mesh(new THREE.BoxGeometry(0.22, KH - 6, 0.6), toon('#2e3747'), false);
      rail.position.set(s * 1.7, (KH - 6) / 2, 7.95);
      kule.add(rail);
    }
    kule.add(shaft);
  }

  // AVM: geniş camlı, tenteli giriş
  const AX = -28, AZ = 26;
  const avm = tower({ w: 26, d: 18, h: 15, wall: '#f6e3c8', glass: '#9fdcf0', base: '#e9487d', name: 'ÇİZİO AVM', signBg: '#e9487d' });
  {
    for (let i = 0; i < 9; i++) {
      const s = mesh(new THREE.BoxGeometry(2.6, 0.14, 3), toon(i % 2 ? '#ffffff' : '#e9487d'), false);
      s.position.set(-10.4 + i * 2.6, 4.6, 10);
      s.rotation.x = 0.28;
      avm.add(s);
    }
    const cart = outline(mesh(new THREE.BoxGeometry(1.1, 0.9, 0.8), toon('#cfd6e2')), 1.05);
    cart.position.set(9, 0.6, 10.4);
    avm.add(cart);
  }
  place(avm, AX, AZ, 0, 26, 18);

  // Sinema
  const SX = -27, SZ = -27;
  const sinema = tower({ w: 20, d: 15, h: 13, wall: '#2b2f44', glass: '#ffd36e', base: '#ffb100', name: 'SİNEMA', signBg: '#ef4b4b' });
  {
    const marquee = outline(mesh(new THREE.BoxGeometry(14, 1.6, 2.4), toon('#ffb100')), 1.03);
    marquee.position.set(0, 5.6, 8.2);
    sinema.add(marquee);
    const bulbs: THREE.Mesh[] = [];
    for (let i = 0; i < 12; i++) {
      const l = mesh(new THREE.SphereGeometry(0.2, 8, 6), new THREE.MeshBasicMaterial({ color: '#fff3c4' }), false);
      l.position.set(-6.6 + i * 1.2, 4.7, 9.3);
      sinema.add(l);
      bulbs.push(l);
    }
    b.tick((_dt, t) => {
      const k = Math.floor(t * 4);
      bulbs.forEach((l, i) => (l.material as THREE.MeshBasicMaterial).color.set((i + k) % 3 ? '#6a5a20' : '#fff3c4'));
    });
  }
  place(sinema, SX, SZ, 0, 20, 15);

  // otel, ofis kulesi, apartmanlar: şehir silueti
  const blocks: [string, number, number, number, number, number, number, string, string, string | undefined][] = [
    // [ad, lx, lz, rot, w, d, h, duvar, cam, tabela]
    ['OTEL ÇİZİO', 30, 28, 0, 16, 14, 26, '#f3d9b0', '#bfe6ff', '#c0392b'],
    ['OFİS', 50, -17, 0, 13, 13, 38, '#9fb6c9', '#d6f2ff', '#2b6cb0'],
    ['', -50, 18, L_, 12, 14, 30, '#f0b7a0', '#cfeaff', undefined],
    ['', -46, -46, 0, 13, 13, 24, '#a9d3b5', '#dff4ff', undefined],
    ['', 46, 46, 0, 12, 12, 22, '#c9b6e8', '#e3f3ff', undefined],
    ['', 18, -52, 0, 14, 13, 44, '#8fa8bd', '#d7f0ff', undefined],
    ['', -18, -52, 0, 12, 12, 34, '#e3c88f', '#cfeaff', undefined],
    ['', 26, 52, Math.PI, 13, 12, 28, '#9ec6e8', '#e8f7ff', undefined],
    ['', -44, 54, Math.PI, 12, 12, 20, '#f0a6b8', '#e8f7ff', undefined],
    ['', 52, 24, R_, 11, 12, 32, '#b8c6a8', '#dff4ff', undefined],
    ['', -52, -22, L_, 11, 12, 36, '#c7bba8', '#dff4ff', undefined],
  ];
  for (const [name, lx, lz, rot, w, d, h, wall, glass, bg] of blocks) {
    const t = tower({ w, d, h, wall, glass, name: name || undefined, signBg: bg, crown: h > 30 ? 5 : 0, antenna: h > 34 });
    place(t, lx, lz, rot, w, d);
  }
  // çatı bahçeleri yerine balkonlar: alçak apartmanlara şerit
  for (const [lx, lz, rot, w] of [[-46, -46, 0, 13], [46, 46, 0, 12], [-44, 54, Math.PI, 12]] as const) {
    for (let f = 1; f <= 4; f++) {
      const bal = mesh(new THREE.BoxGeometry(w - 2, 0.2, 1.2), toon('#ffffff'), false);
      put(bal, lx + Math.sin(rot) * (6.4), lz + Math.cos(rot) * (6.4), rot, 3.6 + f * 4.2);
    }
  }

  // ---------------------------------------------------------------- meydan: caddenin yanında dev ekranlı tören alanı
  const CX = -17.5, CZ = 46;
  {
    const plaza = mesh(new THREE.BoxGeometry(13, 0.3, 20), toon('#efe6d4'), false);
    plaza.receiveShadow = true;
    put(plaza, CX, CZ, 0, 0.1);
    const scr = new THREE.Group();
    for (const s of [-1, 1]) {
      const leg = mesh(new THREE.BoxGeometry(0.7, 6, 0.7), toon('#4c5361'));
      leg.position.set(s * 5, 3, 0);
      scr.add(leg);
    }
    const panelMat = new THREE.MeshBasicMaterial({ color: '#204060' });
    const panel = mesh(new THREE.BoxGeometry(12.4, 7, 0.5), panelMat, false);
    panel.position.set(0, 9.6, 0);
    const edge = outline(mesh(new THREE.BoxGeometry(13.2, 7.8, 0.3), toon('#2f3540')), 1.01);
    edge.position.set(0, 9.6, -0.25);
    scr.add(edge, panel);
    put(scr, CX - 6.4, CZ, L_);
    blkRect(CX - 6.4, CZ, 1.4, 13);
    const cols = ['#ff6b6b', '#ffd43b', '#4cd964', '#4dabf7', '#c86bff'];
    b.tick((_dt, t) => panelMat.color.set(cols[Math.floor(t / 1.6) % cols.length]).multiplyScalar(0.75));
    for (const s of [-1, 1]) {
      put(bench(), CX + 3.6, CZ + s * 5, R_);
      blk(CX + 3.6, CZ + s * 5, 1);
    }
  }

  // ---------------------------------------------------------------- otobüs durağı, otobüs ve taksi
  {
    const stop = new THREE.Group();
    const roof = outline(mesh(new THREE.BoxGeometry(5, 0.22, 2), toon('#6c7bff')), 1.03);
    roof.position.y = 2.8;
    const back = mesh(new THREE.BoxGeometry(5, 2.4, 0.12), toon('#cfeaff', { transparent: true, opacity: 0.6 }), false);
    back.position.set(0, 1.5, -0.9);
    const bs = bench();
    bs.position.z = -0.3;
    const sg = board('DURAK', '#6c7bff', '#ffffff', 1.8, 0.7, 700);
    sg.position.set(2, 3.3, 1.02);
    stop.add(roof, back, bs, sg);
    put(stop, 9.6, 46, R_);
    blk(10, 46, 1.4);
    const bus = carModel('otobus');
    put(bus, 4.6, 46, Math.PI);
    blkRect(4.6, 46, 3.4, 9);
  }

  // ---------------------------------------------------------------- simit arabası
  {
    const cart = new THREE.Group();
    const body = outline(mesh(new THREE.BoxGeometry(2.6, 1.1, 1.5), toon('#ef4b4b')), 1.03);
    body.position.y = 1;
    const glassBox = mesh(new THREE.BoxGeometry(2.3, 1, 1.3), toon('#d9f2ff', { transparent: true, opacity: 0.55 }), false);
    glassBox.position.y = 2.05;
    const roof = outline(mesh(new THREE.BoxGeometry(3, 0.16, 1.9), toon('#ffd43b')), 1.03);
    roof.position.y = 2.65;
    cart.add(body, glassBox, roof);
    for (const s of [-1, 1]) {
      const wl = mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.18, 14), toon('#2b2d33'), false);
      wl.rotation.z = Math.PI / 2;
      wl.position.set(s * 1, 0.42, 0);
      cart.add(wl);
    }
    for (let i = 0; i < 4; i++) {
      const s = mesh(new THREE.TorusGeometry(0.3, 0.11, 8, 16), toon('#c98a4b'), false);
      s.position.set(-0.85 + i * 0.56, 2.05, 0);
      cart.add(s);
    }
    put(cart, -9.6, 30, L_);
    blk(-9.6, 30, 1.4);
    const [sx, sz] = [-7.4, 30];
    b.spot({
      id: 'simit', x: L(sx, sz)[0], z: L(sx, sz)[1], r: 2.4, label: 'Simit al',
      act: {
        dur: 3.2, pose: 'idle',
        step(_t, _u, a) {
          a.heading = head(L_);
        },
        end(a) {
          const s = mesh(new THREE.TorusGeometry(0.22, 0.08, 8, 14), toon('#c98a4b'), false);
          s.rotation.x = Math.PI / 2;
          holdItem(a, s);
          b.sound.fx?.('yay');
          return 'Sıcak simit! Afiyet olsun.';
        },
      },
    });
  }

  // ---------------------------------------------------------------- taksi (sürülür)
  {
    const { model: taxi, seat } = taxiModel();
    b.scene.add(taxi);
    const pos = G(13, 34);
    const v = {
      model: taxi, pos, heading: head(Math.PI), speed: 24, water: false, seatY: 0.75, land: true,
      seat, cam: [19, 9] as [number, number], engine: 'car',
    };
    taxi.position.copy(pos);
    taxi.rotation.set(0, v.heading, 0);
    b.spot({ id: 'taxi', x: pos.x, z: pos.z, r: 3.6, label: 'Taksiyi sür', vehicle: v });
  }

  // ---------------------------------------------------------------- binaların kapıları: içeri girilir
  // (iç mekânlar src/world/interiors.ts: AVM, sinema, otel, ofis ve apartman daireleri)
  {
    const door = (id: InteriorId, key: string, lx: number, lz: number, rot: number, d: number, label: string) => {
      const off = d / 2 + 2.8;
      const [sx, sz] = [lx + Math.sin(rot) * off, lz + Math.cos(rot) * off];
      const [ix, iz] = [lx + Math.sin(rot) * (d / 2 + 0.4), lz + Math.cos(rot) * (d / 2 + 0.4)];
      const [bx, bz] = L(lx + Math.sin(rot) * (off + 1.4), lz + Math.cos(rot) * (off + 1.4));
      F.spot(`kapi-${key}`, sx, sz, 2.6, label, {
        dur: 0.8, pose: 'walk',
        step(_t, u, a) {
          a.pos.lerpVectors(G(sx, sz), G(ix, iz), u);
          a.heading = head(rot + Math.PI);
        },
        end: () => {
          b.sound.fx?.('dooropen');
          b.enter?.(id, { x: bx, z: bz, h: head(rot) });
        },
      });
    };
    door('avm', 'avm', AX, AZ, 0, 18, 'AVM’ye gir');
    door('sinema', 'sinema', SX, SZ, 0, 15, 'Sinemaya gir');
    door('otel', 'otel', 30, 28, 0, 14, 'Otele gir');
    door('ofis', 'ofis', 50, -17, 0, 13, 'Ofise gir');
    door('apartman', 'apartman1', -50, 18, L_, 14, 'Apartmana gir');
    door('apartman', 'apartman2', -46, -46, 0, 13, 'Apartmana gir');
    door('apartman', 'apartman3', 46, 46, 0, 12, 'Apartmana gir');
  }

  // ---------------------------------------------------------------- Çizio Kulesi: asansörle tepeye
  {
    const [dx, dz] = [KX, KZ + 9];
    const cab = new THREE.Group();
    const box = mesh(new THREE.BoxGeometry(2.6, 3, 2.4), toon('#bfe6ff', { transparent: true, opacity: 0.45 }), false);
    box.position.y = 1.5;
    const floorM = outline(mesh(new THREE.BoxGeometry(2.8, 0.18, 2.6), toon('#2e3747')), 1.03);
    const roofM = outline(mesh(new THREE.BoxGeometry(2.8, 0.18, 2.6), toon('#2e3747')), 1.03);
    roofM.position.y = 3;
    cab.add(box, floorM, roofM);
    const cabObj = put(cab, dx, dz - 0.4);
    cab.visible = false;
    const y0 = hAt(dx, dz - 0.4);
    b.spot({
      id: 'kule', x: L(dx, dz)[0], z: L(dx, dz)[1], r: 2.8, label: 'Gökdelenin tepesine çık',
      act: {
        dur: 14, pose: 'idle', quest: 'tower', cam: [26, 9],
        start() {
          cab.visible = true;
          b.sound.fx?.('yay');
        },
        step(_t, u, a) {
          const up = u < 0.32 ? sm(u / 0.32) : u < 0.72 ? 1 : 1 - sm((u - 0.72) / 0.28);
          const y = y0 + up * (KH - 8);
          cabObj.position.y = y;
          a.pos.set(cabObj.position.x, y + 0.2, cabObj.position.z);
          a.heading = head(0) + (u > 0.32 && u < 0.72 ? (u - 0.32) * 5 : 0);
        },
        end() {
          cab.visible = false;
          cabObj.position.y = y0;
          return 'Vay! Bütün ada buradan görünüyor!';
        },
      },
    });
  }

  // ---------------------------------------------------------------- güvercinler ve park
  for (let i = 0; i < 8; i++) {
    const p = new THREE.Group();
    const bd = outline(mesh(new THREE.SphereGeometry(0.22, 8, 6), toon(i % 2 ? '#c9d2de' : '#9aa6b5')), 1.07);
    bd.position.y = 0.28;
    bd.scale.z = 1.3;
    const hd = mesh(new THREE.SphereGeometry(0.13, 8, 6), toon(i % 2 ? '#c9d2de' : '#9aa6b5'), false);
    hd.position.set(0, 0.5, 0.18);
    const bk = mesh(new THREE.ConeGeometry(0.05, 0.12, 5), toon('#ffb100'), false);
    bk.rotation.x = Math.PI / 2;
    bk.position.set(0, 0.48, 0.33);
    p.add(bd, hd, bk);
    const [px, pz] = L(CX + 1, CZ + (i - 4) * 2);
    b.wander(p, px, pz, 7, 1.1, false);
  }
  // küçük park (kavşağın güneybatısı)
  for (const [lx, lz, s] of [[-42, 30, 1.5], [-38, 40, 1.2], [-48, 38, 1.4], [40, -48, 1.3], [48, -40, 1.5], [34, -44, 1.1]] as const) {
    put(tree('round', s), lx, lz);
    blk(lx, lz, 1.1 * s);
  }

  b.place(sign('Şehir Merkezi', '#dfe4ff'), ...L(-7, 63), F.yaw);
  // gece: pencereler yanar
  b.tick(() => {
    const n = b.night();
    for (const m of litMats) m.emissiveIntensity = n * 0.9;
  });
}
