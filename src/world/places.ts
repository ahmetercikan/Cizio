/**
 * Çizio Adası'nın yeni yerleri: Şehir (hastane, okul, market, itfaiye, kütüphane, pastane), Köy, Hayvanat Bahçesi,
 * Havalimanı, Piknik Tepesi ve bölgeleri bağlayan yollar.
 *
 * Her yer kendi yerel düzeninde kurulur: +lz kasabaya (girişe) bakar, +lx sağ taraftır (lunapark gibi).
 */
import * as THREE from 'three';
import { flowers, mesh, outline, toon, tree } from '../play3d/kit';
import { heightAt, ROADS, ROAD_START, ZONES, zone, type Zone } from './layout';
import { ambulanceModel, firetruckModel, planeModel } from './vehicles';
import { house, sign, type Activity, type HouseOpts, type Vehicle, type WorldBuilder } from './zones';
import { fountain, waterSurface } from './water';
import type { InteriorId } from './homestead';
import { buildDowntown } from './city';
import { buildPetPark } from './petpark';

const sm = (u: number) => u * u * (3 - 2 * u);
const clamp01 = (u: number) => Math.min(1, Math.max(0, u));
/** Etkinlik adımında `period` saniyelik bir vuruş bu karede geçildi mi. */
const beat = (t: number, dt: number, period: number, off = 0) => t >= off && Math.floor((t - off) / period) !== Math.floor((t - dt - off) / period);
const pick = <T>(a: T[]) => a[Math.floor(Math.random() * a.length)];

/** Bölgenin yerel düzeni. */
export function frame(b: WorldBuilder, Z: Zone) {
  const len = Math.hypot(Z.x, Z.z), fx = -Z.x / len, fz = -Z.z / len;
  const yaw = Math.atan2(fx, fz);
  const L = (lx: number, lz: number): [number, number] => [Z.x + lx * fz + lz * fx, Z.z - lx * fx + lz * fz];
  const V = (lx: number, y: number, lz: number) => {
    const [x, z] = L(lx, lz);
    return new THREE.Vector3(x, y, z);
  };
  const hAt = (lx: number, lz: number) => b.h(...L(lx, lz));
  /** Yerel noktada, zemin üstünde dünya konumu. */
  const G = (lx: number, lz: number, dy = 0) => V(lx, hAt(lx, lz) + dy, lz);
  const put = <T extends THREE.Object3D>(o: T, lx: number, lz: number, rot = 0, dy = 0): T => b.place(o, ...L(lx, lz), yaw + rot, dy);
  const blk = (lx: number, lz: number, r: number) => b.block(...L(lx, lz), r);
  /** Dikdörtgen engel (yerel w × d), dairelerle. */
  const blkRect = (lx: number, lz: number, w: number, d: number, rot = 0) => {
    const along = w >= d, n = Math.max(1, Math.ceil((along ? w : d) / Math.min(w, d))), r = Math.min(w, d) / 2 + 0.2;
    const c = Math.cos(rot), s = Math.sin(rot);
    for (let i = 0; i < n; i++) {
      const o = ((i + 0.5) / n - 0.5) * ((along ? w : d) - Math.min(w, d));
      const [ox, oz] = along ? [o, 0] : [0, o];
      blk(lx + ox * c + oz * s, lz - ox * s + oz * c, r);
    }
  };
  /** Yerel açı (0 = +lz, π/2 = +lx) → kahraman yönü. */
  const head = (a: number) => yaw + a;
  const spot = (id: string, lx: number, lz: number, r: number, label: string, act: Activity) => {
    const [x, z] = L(lx, lz);
    b.spot({ id, x, z, r, label, act });
  };
  return { yaw, L, V, G, hAt, put, blk, blkRect, head, spot };
}

/** Canvas yazılı levha (yalnızca ön yüz). */
export function board(text: string, bg: string, fg = '#ffffff', w = 6, h = 1.4, font = 600) {
  const c = document.createElement('canvas');
  // Dokunun çözünürlüğü tabelanın gerçek boyuna göre (metrede ~170 piksel), en çok 1024.
  // Sabit 1024 verilince küçük ve uzun levhalar dev doku üretiyordu: müzedeki 26 levha tek başına
  // 200 MB'ı aşıp telefonun ekran kartı belleğini doldurduğu için uygulama çöküyordu.
  const PX = Math.max(96, Math.min(1024, Math.round(w * 170)));
  c.width = PX;
  c.height = Math.max(32, Math.min(1024, Math.round((PX * h) / w)));
  const k = PX / 1024; // çerçeve kalınlıkları da küçülsün
  const x = c.getContext('2d')!;
  x.fillStyle = bg;
  x.beginPath();
  x.roundRect(6 * k, 6 * k, c.width - 12 * k, c.height - 12 * k, c.height * 0.22);
  x.fill();
  x.lineWidth = 12 * k;
  x.strokeStyle = '#3a2b27';
  x.stroke();
  x.fillStyle = fg;
  let size = c.height * 0.62;
  x.font = `${font} ${size}px Fredoka, Nunito, sans-serif`;
  while (x.measureText(text).width > c.width * 0.88 && size > 20 * k) x.font = `${font} ${(size -= 4 * k)}px Fredoka, Nunito, sans-serif`;
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillText(text, c.width / 2, c.height / 2 + size * 0.06);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t }));
}

/**
 * Basit bina: gövde, düz çatı kenarı, ön yüzde (+z) kapı, iki sıra pencere ve tabela.
 * w: genişlik (x), d: derinlik (z), h: yükseklik.
 */
function building(o: { w: number; d: number; h: number; wall: string; trim: string; name: string; signBg: string; floors?: number; door?: string; glow?: string }) {
  const g = new THREE.Group();
  const body = outline(mesh(new THREE.BoxGeometry(o.w, o.h, o.d), toon(o.wall, o.glow ? { emissive: o.glow } : {})), 1.01);
  body.position.y = o.h / 2;
  const roof = outline(mesh(new THREE.BoxGeometry(o.w + 0.6, 0.5, o.d + 0.6), toon(o.trim)), 1.01);
  roof.position.y = o.h + 0.25;
  g.add(body, roof);
  const door = mesh(new THREE.BoxGeometry(2.2, 2.8, 0.2), toon(o.door ?? '#8a5a35'), false);
  door.position.set(0, 1.4, o.d / 2 + 0.05);
  const glass = mesh(new THREE.BoxGeometry(1.6, 1.6, 0.1), toon('#cfeaff', { emissive: '#1a2a33' }), false);
  glass.position.set(0, 1.8, o.d / 2 + 0.16);
  g.add(door, glass);
  const floors = o.floors ?? 2;
  const win = new THREE.BoxGeometry(1.5, 1.3, 0.12);
  const winMat = toon('#cfeaff', { emissive: '#22333d' });
  for (let f = 0; f < floors; f++) {
    const y = 1.9 + f * 2.9;
    if (y + 1 > o.h - 0.4) break;
    for (let x = -o.w / 2 + 2; x <= o.w / 2 - 2; x += 3) {
      if (f === 0 && Math.abs(x) < 2.4) continue;
      const w = mesh(win, winMat, false);
      w.position.set(x, y, o.d / 2 + 0.06);
      g.add(w);
    }
  }
  const sg = board(o.name, o.signBg, '#ffffff', Math.min(o.w - 1, 7.5), 1.5, 700);
  sg.position.set(0, o.h - 0.95, o.d / 2 + 0.08);
  g.add(sg);
  return g;
}

/** Kahramanın elindeki eşya (adada yürürken taşır). */
export function holdItem(a: { hand: THREE.Group }, item: THREE.Object3D) {
  a.hand.getObjectByName('held')?.removeFromParent();
  item.name = 'held';
  a.hand.add(item);
}

export function bench() {
  const g = new THREE.Group();
  const seat = outline(mesh(new THREE.BoxGeometry(2.4, 0.15, 0.7), toon('#b9773f')), 1.04);
  seat.position.y = 0.6;
  const back = mesh(new THREE.BoxGeometry(2.4, 0.6, 0.12), toon('#b9773f'));
  back.position.set(0, 1.0, -0.32);
  g.add(seat, back);
  for (const x of [-1, 1]) {
    const l = mesh(new THREE.BoxGeometry(0.12, 0.6, 0.6), toon('#5b5f6b'), false);
    l.position.set(x, 0.3, 0);
    g.add(l);
  }
  return g;
}

function chicken(color = '#ffffff') {
  const g = new THREE.Group();
  const bd = outline(mesh(new THREE.SphereGeometry(0.32, 10, 8), toon(color)), 1.06);
  bd.position.y = 0.4;
  const hd = mesh(new THREE.SphereGeometry(0.18, 8, 6), toon(color));
  hd.position.set(0, 0.72, 0.2);
  const comb = mesh(new THREE.BoxGeometry(0.06, 0.12, 0.16), toon('#ef4b4b'), false);
  comb.position.set(0, 0.9, 0.2);
  const beak = mesh(new THREE.ConeGeometry(0.06, 0.14, 5), toon('#ffb100'), false);
  beak.rotation.x = Math.PI / 2;
  beak.position.set(0, 0.7, 0.38);
  g.add(bd, hd, comb, beak);
  return g;
}

// ================================================================================================
// Yollar ve sokak lambaları
// ================================================================================================
function buildRoads(b: WorldBuilder) {
  const W = 4.4;
  const pos: number[] = [], edge: number[] = [];
  const lampAt: THREE.Vector3[] = [];
  const zoneNear = (x: number, z: number, r: number) => ZONES.some((zn) => Math.hypot(zn.x - x, zn.z - z) < r);
  const strip = (arr: number[], a: THREE.Vector3[], c: THREE.Vector3[]) => {
    for (let i = 1; i < a.length; i++) arr.push(...a[i - 1].toArray(), ...c[i - 1].toArray(), ...a[i].toArray(), ...a[i].toArray(), ...c[i - 1].toArray(), ...c[i].toArray());
  };
  for (const road of ROADS) {
    let dist = 0;
    for (let i = 1; i < road.length; i++) {
      const [ax, az] = road[i - 1], [bx, bz] = road[i];
      const len = Math.hypot(bx - ax, bz - az), dx = (bx - ax) / len, dz = (bz - az) / len;
      const nx = -dz, nz = dx;
      let L: THREE.Vector3[] = [], R: THREE.Vector3[] = [], EL: THREE.Vector3[] = [], ER: THREE.Vector3[] = [];
      const flush = () => {
        strip(pos, L, R);
        strip(edge, EL, ER);
        L = [];
        R = [];
        EL = [];
        ER = [];
      };
      for (let s = 0; s <= len + 0.01; s += 2) {
        const x = ax + dx * s, z = az + dz * s;
        if (Math.hypot(x, z) < ROAD_START || heightAt(x, z) < 0.35) {
          flush();
          continue;
        }
        const vtx = (o: number, lift: number) => {
          const px = x + nx * o, pz = z + nz * o;
          return new THREE.Vector3(px, Math.max(0, heightAt(px, pz)) + lift, pz);
        };
        L.push(vtx(-W / 2, 0.14));
        R.push(vtx(W / 2, 0.14));
        EL.push(vtx(-W / 2 - 0.5, 0.1));
        ER.push(vtx(W / 2 + 0.5, 0.1));
        // sokak lambası: yolun iki yanında sırayla, bölgelerin içinde değil
        const d = dist + s;
        if (Math.floor(d / 24) !== Math.floor((d - 2) / 24) && !zoneNear(x, z, 36)) {
          const side = Math.floor(d / 24) % 2 ? 1 : -1;
          const lx = x + nx * side * (W / 2 + 1.4), lz = z + nz * side * (W / 2 + 1.4);
          if (heightAt(lx, lz) > 0.5 && b.grid.free(lx, lz, 0.6)) {
            lampAt.push(new THREE.Vector3(lx, heightAt(lx, lz), lz));
            b.block(lx, lz, 0.3);
          }
        }
      }
      flush();
      dist += len;
    }
  }
  const mk = (arr: number[], color: string, off: number) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
    g.computeVertexNormals();
    const m = toon(color);
    m.side = THREE.DoubleSide;
    m.polygonOffset = true;
    m.polygonOffsetFactor = off;
    m.polygonOffsetUnits = off;
    const o = new THREE.Mesh(g, m);
    o.receiveShadow = true;
    o.frustumCulled = false;
    b.scene.add(o);
  };
  mk(edge, '#d6c08f', -1);
  mk(pos, '#ecdcb4', -2);
  // lambalar: iki örnekli çizim (direk ve ışık)
  const m4 = new THREE.Matrix4();
  const pole = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.1, 0.14, 3.6, 6).translate(0, 1.8, 0), toon('#4a4f5c'), lampAt.length);
  const bulb = new THREE.InstancedMesh(new THREE.SphereGeometry(0.38, 10, 8).translate(0, 3.8, 0), toon('#fff3b0', { emissive: '#6a5f20' }), lampAt.length);
  lampAt.forEach((p, i) => {
    b.lamps.push(new THREE.Vector3(p.x, p.y + 3.8, p.z));
    m4.makeTranslation(p.x, p.y, p.z);
    pole.setMatrixAt(i, m4);
    bulb.setMatrixAt(i, m4);
  });
  pole.castShadow = true;
  pole.frustumCulled = bulb.frustumCulled = false;
  b.scene.add(pole, bulb);
}

// ================================================================================================
// Şehir
// ================================================================================================
function buildCity(b: WorldBuilder) {
  const Z = zone('city');
  const F = frame(b, Z);
  const { put, blk, blkRect, G, spot, head } = F;
  b.keepOut.push({ x: Z.x, z: Z.z, r: 46 });

  // ana cadde (kesik çizgili) ve kaldırımlar, ortada meydan
  {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 128;
    const x = c.getContext('2d')!;
    x.fillStyle = '#7d828f';
    x.fillRect(0, 0, 64, 128);
    x.fillStyle = '#ffffff';
    x.fillRect(29, 20, 6, 60);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    for (const [z0, z1] of [[13, 40], [-40, -13]]) {
      const len = z1 - z0, mid = (z0 + z1) / 2;
      const t = tex.clone();
      t.repeat.set(1, len / 6);
      t.needsUpdate = true;
      const road = mesh(new THREE.PlaneGeometry(8, len).rotateX(-Math.PI / 2), toon('#ffffff'), false);
      (road.material as THREE.MeshToonMaterial).map = t;
      road.receiveShadow = true;
      put(road, 0, mid, 0, 0.12);
      for (const sx of [-5.5, 5.5]) {
        const walk = mesh(new THREE.BoxGeometry(3, 0.25, len), toon('#e9e2d6'), false);
        walk.receiveShadow = true;
        put(walk, sx, mid, 0, 0.12);
      }
      // yaya geçidi
      for (let i = -3; i <= 3; i++) {
        const st = mesh(new THREE.PlaneGeometry(0.7, 3).rotateX(-Math.PI / 2), toon('#ffffff'), false);
        put(st, i * 1.1, z0 > 0 ? 15.5 : -15.5, 0, 0.14);
      }
    }
    const plaza = mesh(new THREE.CircleGeometry(13, 40).rotateX(-Math.PI / 2), toon('#efe3cc'), false);
    plaza.receiveShadow = true;
    put(plaza, 0, 0, 0, 0.1);
    const ring = mesh(new THREE.RingGeometry(12.4, 13, 40).rotateX(-Math.PI / 2), toon('#d9c7a6'), false);
    put(ring, 0, 0, 0, 0.13);
    // fıskiye
    const fount = new THREE.Group();
    const pool = outline(mesh(new THREE.CylinderGeometry(4.2, 4.4, 0.8, 28), toon('#c9c3d6')), 1.02);
    pool.position.y = 0.4;
    const col = mesh(new THREE.CylinderGeometry(0.5, 0.7, 2.4, 12), toon('#c9c3d6'));
    col.position.y = 1.6;
    const bowl = outline(mesh(new THREE.CylinderGeometry(1.6, 0.6, 0.6, 18), toon('#c9c3d6')), 1.03);
    bowl.position.y = 2.9;
    // dalgalanan su ve kavis çizerek düşen fıskiye kolları (water.ts)
    const surf = waterSurface({ r: 3.75, color: '#49c4ea', wave: 0.04 });
    surf.group.position.y = 0.89;
    const jets = fountain({ h: 2, arms: 10, r: 3.2, fall: -2.4, color: '#cdf1ff' });
    jets.group.position.y = 3.25;
    fount.add(pool, col, bowl, surf.group, jets.group);
    put(fount, 0, 0);
    blk(0, 0, 4.6);
    const top = G(0, 0, 5.6);
    b.tick((dt, t) => {
      surf.tick(dt, t);
      jets.tick(dt, t);
      if (Math.random() < 0.07) b.sparkles.burst(top, 1, '#cdf1ff');
    });
  }

  // binalar: sol (−lx) hastane, kütüphane, okul; sağ (+lx) market, pastane, itfaiye. Ön yüzleri caddeye bakar.
  const L_ = Math.PI / 2, R_ = -Math.PI / 2;
  const hospital = building({ w: 16, d: 10, h: 9.4, wall: '#ffffff', glow: '#4a4f58', trim: '#5b8def', name: 'HASTANE', signBg: '#5b8def', floors: 3 });
  // çatıda "H" ve yeşil artı
  const hb2 = board('H', '#5b8def', '#ffffff', 2.2, 2.2, 800);
  hb2.position.set(5.5, 10.9, 0.05);
  const hpost = mesh(new THREE.BoxGeometry(0.2, 1.6, 0.2), toon('#5b5f6b'), false);
  hpost.position.set(5.5, 10, -0.1);
  const cross = new THREE.Group();
  for (const [w, h] of [[1.6, 0.5], [0.5, 1.6]]) {
    const p = mesh(new THREE.BoxGeometry(w, h, 0.15), toon('#ef4b4b'), false);
    cross.add(p);
  }
  cross.position.set(-4.5, 7.5, 5.1);
  hospital.add(hb2, hpost, cross);
  hospital.scale.setScalar(1.35); // karaktere göre daha büyük
  put(hospital, -20.75, 20, L_);
  blkRect(-20.75, 20, 13.5, 21.6);

  const library = building({ w: 10, d: 8, h: 6.4, wall: '#f3e2c0', trim: '#a8662e', name: 'KÜTÜPHANE', signBg: '#a8662e', floors: 1 });
  for (const x of [-3.6, -1.8, 1.8, 3.6]) {
    const c = mesh(new THREE.CylinderGeometry(0.3, 0.3, 5.6, 10), toon('#ffffff'));
    c.position.set(x, 2.8, 4.4);
    library.add(c);
  }
  library.scale.setScalar(1.35); // karaktere göre daha büyük
  put(library, -19.4, 0, L_);
  blkRect(-19.4, 0, 10.8, 13.5);

  const school = building({ w: 18, d: 10, h: 8.6, wall: '#ffcf70', trim: '#ef6b4a', name: 'OKUL', signBg: '#ef6b4a', floors: 2 });
  // saat
  const clock = new THREE.Group();
  const face = outline(mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.2, 24), toon('#ffffff')), 1.06);
  face.rotation.x = Math.PI / 2;
  const hand1 = mesh(new THREE.BoxGeometry(0.12, 0.8, 0.05), toon('#3a2b27'), false);
  hand1.position.set(0, 0.35, 0.14);
  const hand2 = mesh(new THREE.BoxGeometry(0.6, 0.12, 0.05), toon('#3a2b27'), false);
  hand2.position.set(0.25, 0, 0.14);
  clock.add(face, hand1, hand2);
  clock.position.set(-5.5, 6.6, 5.1);
  school.add(clock);
  school.scale.setScalar(1.35); // karaktere göre daha büyük
  put(school, -20.75, -21, L_);
  blkRect(-20.75, -21, 13.5, 24.3);
  // bayrak direği
  const flag = new THREE.Group();
  const fp = mesh(new THREE.CylinderGeometry(0.08, 0.1, 8, 6), toon('#cfd4dc'));
  fp.position.y = 4;
  const fl = mesh(new THREE.PlaneGeometry(2.4, 1.5), new THREE.MeshToonMaterial({ color: '#e30a17', side: THREE.DoubleSide }));
  fl.position.set(1.2, 7.1, 0);
  flag.add(fp, fl);
  put(flag, -11, -30);
  blk(-11, -30, 0.3);
  b.tick((_dt, t) => void (fl.rotation.y = Math.sin(t * 2) * 0.25));

  const market = building({ w: 14, d: 10, h: 6.2, wall: '#e8f7e4', trim: '#2bb673', name: 'MARKET', signBg: '#2bb673', floors: 1, door: '#9ad7ff' });
  // tente
  for (let i = 0; i < 7; i++) {
    const s = mesh(new THREE.BoxGeometry(2, 0.12, 2.2), toon(i % 2 ? '#ffffff' : '#2bb673'), false);
    s.position.set(-6 + i * 2, 3.6, 6);
    s.rotation.x = 0.3;
    market.add(s);
  }
  // meyve tezgâhı
  const stand = outline(mesh(new THREE.BoxGeometry(3.4, 1, 1.2), toon('#b9773f')), 1.03);
  stand.position.set(4.4, 0.5, 6.4);
  market.add(stand);
  ['#ef4b4b', '#ffb100', '#7cc760', '#ff8a3d'].forEach((c, i) => {
    for (let k = 0; k < 3; k++) {
      const f = mesh(new THREE.SphereGeometry(0.22, 8, 6), toon(c), false);
      f.position.set(3.1 + i * 0.85, 1.15, 6.1 + k * 0.3);
      market.add(f);
    }
  });
  market.scale.setScalar(1.35); // karaktere göre daha büyük
  put(market, 20.75, 20, R_);
  blkRect(20.75, 20, 13.5, 18.9);

  const bakery = building({ w: 10, d: 8, h: 5.4, wall: '#ffd6e5', trim: '#e9487d', name: 'PASTANE', signBg: '#e9487d', floors: 1 });
  const cake = new THREE.Group();
  for (const [r, y, c] of [[1.1, 0, '#ffffff'], [0.8, 0.55, '#ff8fb1'], [0.5, 1.05, '#ffffff']] as const) {
    const l = outline(mesh(new THREE.CylinderGeometry(r, r, 0.5, 18), toon(c)), 1.05);
    l.position.y = y;
    cake.add(l);
  }
  const cherry = mesh(new THREE.SphereGeometry(0.18, 8, 6), toon('#ef4b4b'), false);
  cherry.position.y = 1.45;
  cake.add(cherry);
  cake.position.set(0, 5.9, 0);
  bakery.add(cake);
  bakery.scale.setScalar(1.35); // karaktere göre daha büyük
  put(bakery, 19.4, 0, R_);
  blkRect(19.4, 0, 10.8, 13.5);
  // pastane masaları (yanlarda)
  for (const tz of [-7.5, 7.5]) {
    const tb = new THREE.Group();
    const top = outline(mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.1, 14), toon('#ffffff')), 1.05);
    top.position.y = 1;
    const leg = mesh(new THREE.CylinderGeometry(0.08, 0.1, 1, 6), toon('#5b5f6b'), false);
    leg.position.y = 0.5;
    const um = outline(mesh(new THREE.ConeGeometry(1.5, 0.7, 12), toon('#ff8fb1')), 1.04);
    um.position.y = 2.7;
    const up = mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.8, 5), toon('#ffffff'), false);
    up.position.y = 1.9;
    tb.add(top, leg, um, up);
    put(tb, 12.5, tz);
    blk(12.5, tz, 0.9);
  }

  const fire = building({ w: 14, d: 10, h: 7.6, wall: '#ef4b4b', trim: '#ffffff', name: 'İTFAİYE', signBg: '#3a2b27', floors: 1, door: '#ffffff' });
  for (const x of [-3.8, 3.8]) {
    const gd = mesh(new THREE.BoxGeometry(3.6, 4, 0.2), toon('#f4f1ea'), false);
    gd.position.set(x, 2, 5.06);
    fire.add(gd);
    for (let k = 0; k < 4; k++) {
      const ln = mesh(new THREE.BoxGeometry(3.6, 0.08, 0.05), toon('#cfc8bd'), false);
      ln.position.set(x, 0.6 + k * 1, 5.18);
      fire.add(ln);
    }
  }
  fire.scale.setScalar(1.35); // karaktere göre daha büyük
  put(fire, 20.75, -21, R_);
  blkRect(20.75, -21, 13.5, 18.9);

  // otobüs durağı, banklar, ağaçlar, trafik ışıkları
  {
    const stop = new THREE.Group();
    const roof = outline(mesh(new THREE.BoxGeometry(4, 0.2, 1.6), toon('#5b8def')), 1.04);
    roof.position.y = 2.6;
    const back = mesh(new THREE.BoxGeometry(4, 2.2, 0.1), toon('#cfeaff', { transparent: true, opacity: 0.6 }), false);
    back.position.set(0, 1.4, -0.7);
    const bs = bench();
    bs.position.z = -0.2;
    const sgn = board('DURAK', '#5b8def', '#ffffff', 1.6, 0.6, 700);
    sgn.position.set(1.6, 3.1, 0.82);
    stop.add(roof, back, bs, sgn);
    put(stop, 8.2, 30, R_);
    blk(8.6, 30, 1.2);
    for (const [lx, lz] of [[-9.8, 9.8], [9.8, -9.8], [-9.8, -9.8]] as const) {
      put(bench(), lx, lz, lx < 0 ? L_ : R_);
      blk(lx, lz, 1);
    }
    for (const lz of [36, 28, -28, -36]) for (const sx of [-7.3, 7.3]) {
      if (lz === 28 && sx > 0) continue;
      const pl = new THREE.Group();
      const box = outline(mesh(new THREE.BoxGeometry(1.2, 0.6, 1.2), toon('#c9c3d6')), 1.04);
      box.position.y = 0.3;
      const t = tree('round', 0.8);
      t.position.y = 0.5;
      pl.add(box, t);
      put(pl, sx, lz);
      blk(sx, lz, 0.8);
    }
    for (const [lx, lz] of [[-4.6, 15.2], [4.6, -15.2]] as const) {
      const tl = new THREE.Group();
      const pole = mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.4, 6), toon('#4a4f5c'));
      pole.position.y = 1.7;
      const bx = outline(mesh(new THREE.BoxGeometry(0.5, 1.4, 0.4), toon('#3a3f4a')), 1.05);
      bx.position.y = 3.6;
      tl.add(pole, bx);
      const lamps = ['#ef4b4b', '#ffd43b', '#4cd964'].map((c, i) => {
        const l = mesh(new THREE.SphereGeometry(0.15, 8, 6), new THREE.MeshBasicMaterial({ color: '#333333' }), false);
        l.position.set(0, 4.05 - i * 0.45, 0.21);
        tl.add(l);
        return [l, new THREE.Color(c)] as const;
      });
      put(tl, lx, lz, lz > 0 ? 0 : Math.PI);
      blk(lx, lz, 0.3);
      b.tick((_dt, t) => {
        const k = Math.floor(t / 3) % 3;
        lamps.forEach(([l, c], i) => (l.material as THREE.MeshBasicMaterial).color.copy(i === 2 - k ? c : new THREE.Color('#333333')));
      });
    }
    b.place(sign('Şehir', '#dcecff'), ...F.L(-6, 40), F.yaw);
  }

  // ---- hastane: muayene ve ambulans
  put(bench(), -12.6, 14.5, L_);
  {
    // gerçek boyutta ambulans: camlı kabin, yüksek arka bölüm, tepe lambaları
    const { model: amb, seat: aseat, beacons: [red, blue] } = ambulanceModel();
    b.scene.add(amb);
    let lights = false;
    b.tick((_dt, t) => {
      const on = lights && Math.floor(t * 4) % 2 === 0;
      (red.material as THREE.MeshBasicMaterial).color.set(on ? '#ff3b3b' : lights ? '#661010' : '#ff3b3b');
      (blue.material as THREE.MeshBasicMaterial).color.set(!on && lights ? '#3b7bff' : lights ? '#10204a' : '#3b7bff');
    });
    // sürülebilir ambulans: joystick ile sür, korna yerine siren
    const av: Vehicle = {
      model: amb, pos: G(-9.6, 22), heading: head(Math.PI), speed: 18, water: false, seatY: 0.4, land: true,
      seat: aseat, cam: [19, 10], hornFx: 'siren', engine: 'truck',
      update: () => void (lights = true),
      onLeave: () => void (lights = false),
    };
    amb.position.copy(av.pos);
    amb.rotation.y = av.heading;
    b.spot({ id: 'ambulance', x: av.pos.x, z: av.pos.z, r: 3.6, label: 'Ambulansı sür', vehicle: av });
  }

  // ---- kütüphane: kitap oku
  {
    put(bench(), -12.4, 3.2, L_);
  }

  // ---- okul: derse gir, basket, seksek
  {
    // basket potası (bahçede)
    const hoop = new THREE.Group();
    const hp = mesh(new THREE.CylinderGeometry(0.1, 0.12, 3.6, 8), toon('#5b5f6b'));
    hp.position.y = 1.8;
    const bb = outline(mesh(new THREE.BoxGeometry(1.8, 1.2, 0.1), toon('#ffffff')), 1.04);
    bb.position.set(0, 3.7, 0.2);
    const rim = mesh(new THREE.TorusGeometry(0.4, 0.05, 6, 16), toon('#ff6b4a'));
    rim.rotation.x = Math.PI / 2;
    rim.position.set(0, 3.3, 0.7);
    hoop.add(hp, bb, rim);
    put(hoop, -7, -34);
    blk(-7, -34, 0.4);
    const ball = outline(mesh(new THREE.SphereGeometry(0.3, 12, 10), toon('#ff8a3d')), 1.06);
    ball.visible = false;
    ball.userData.moving = true;
    b.scene.add(ball);
    const rimW = G(-7, -33.3, 3.3);
    spot('basket', -7, -29.6, 2.2, 'Basket at', {
      dur: 6, pose: (u) => ((u * 3) % 1 < 0.25 ? 'jump' : 'hold'),
      step(t, _u, a, dt) {
        const from = G(-7, -30.2, 2.2);
        a.pos.copy(G(-7, -30.2));
        a.heading = head(Math.PI);
        const k = (t % 2) / 2;
        if (beat(t, dt, 2)) b.sound.kick();
        if (k < 0.45) {
          ball.visible = true;
          ball.position.lerpVectors(from, rimW, k / 0.45);
          ball.position.y += Math.sin((k / 0.45) * Math.PI) * 2.2;
        } else {
          ball.position.set(rimW.x, rimW.y - ((k - 0.45) / 0.55) * 3, rimW.z);
          ball.position.lerp(from, ((k - 0.45) / 0.55) * 0.4);
        }
        if (beat(t, dt, 2, 0.9)) {
          b.sound.fx?.('yay');
          b.sparkles.burst(rimW.clone(), 10);
        }
      },
      end: () => {
        ball.visible = false;
        return 'Üç atış, üç basket! Harika!';
      },
    });
    // seksek
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 512;
    const x = c.getContext('2d')!;
    x.strokeStyle = '#ffffff';
    x.lineWidth = 6;
    x.fillStyle = '#ffffff';
    x.font = '700 40px Fredoka, sans-serif';
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    const cells: [number, number, number][] = [[64, 470, 1], [64, 400, 2], [32, 330, 3], [96, 330, 4], [64, 260, 5], [32, 190, 6], [96, 190, 7], [64, 120, 8]];
    for (const [cx, cy, n] of cells) {
      const w = cx === 64 ? 64 : 60;
      x.strokeRect(cx - w / 2, cy - 32, w, 64);
      x.fillText(String(n), cx, cy);
    }
    const tx = new THREE.CanvasTexture(c);
    tx.colorSpace = THREE.SRGBColorSpace;
    const hop = new THREE.Mesh(new THREE.PlaneGeometry(2, 8).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: tx, transparent: true }));
    put(hop, -9.6, -26, 0, 0.16);
    spot('hopscotch', -9.6, -21.6, 1.8, 'Seksek oyna', {
      dur: 5.6, pose: (u) => ((u * 8) % 1 < 0.5 ? 'jump' : 'idle'),
      step(t, u, a, dt) {
        const i = Math.min(7, Math.floor(u * 8)), f = (u * 8) % 1;
        const [cx, cy] = cells[i];
        // kanvas x → yerel lx, kanvas y (üst = −lz) → yerel lz
        a.pos.copy(G(-9.6 + (cx / 128 - 0.5) * 2, -26 + (cy / 512 - 0.5) * 8, Math.sin(f * Math.PI) * 0.6));
        a.heading = head(Math.PI);
        if (beat(t, dt, 0.7, 0.35)) b.sound.fx?.('step');
      },
      end: () => 'Sekiz kareyi de geçtin!',
    });
  }

  // ---- market: alışveriş

  // ---- pastane: pasta ye
  spot('cafe', 12.5, 3.6, 2, 'Pasta ye', {
    dur: 4, pose: 'sit',
    step(_t, _u, a) {
      a.pos.copy(G(12.5, 6.3));
      a.heading = head(0);
    },
    end(a) {
      const cup = new THREE.Group();
      const base = mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.22, 10), toon('#ff8fb1'), false);
      const top = outline(mesh(new THREE.SphereGeometry(0.2, 10, 8), toon('#fff1c7')), 1.08);
      top.position.y = 0.16;
      cup.add(base, top);
      holdItem(a, cup);
      b.sound.fx?.('yay');
      return 'Çilekli pasta çok lezzetliydi!';
    },
  });

  // ---- binaların kapıları: içeri girilir (src/world/interiors.ts)
  const door = (id: InteriorId, lx: number, lz: number, out: number, label: string) => {
    const sx = lx + Math.sin(out) * 1.6, sz = lz + Math.cos(out) * 1.6;
    const [bx, bz] = F.L(lx + Math.sin(out) * 2.6, lz + Math.cos(out) * 2.6);
    spot(`kapi-${id}`, sx, sz, 1.8, label, {
      dur: 0.8, pose: 'walk',
      step(_t, u, a) {
        a.pos.lerpVectors(G(sx, sz), G(lx, lz), u);
        a.heading = head(out + Math.PI);
      },
      end: () => {
        b.sound.fx?.('step');
        b.enter?.(id, { x: bx, z: bz, h: head(out) });
      },
    });
  };
  door('hastane', -14, 20, Math.PI / 2, 'Hastaneye gir');
  door('kutuphane', -14, 0, Math.PI / 2, 'Kütüphaneye gir');
  door('okul', -14, -21, Math.PI / 2, 'Okula gir');
  door('market', 14, 20, -Math.PI / 2, 'Markete gir');
  door('pastane', 14, 0, -Math.PI / 2, 'Pastaneye gir');
  door('itfaiye', 14, -21, -Math.PI / 2, 'İtfaiyeye gir');

  // ---- itfaiye: yangını söndür
  {
    const tower = new THREE.Group();
    const tb = outline(mesh(new THREE.BoxGeometry(4, 7, 4), toon('#a8a2b8')), 1.02);
    tb.position.y = 3.5;
    const wnd = mesh(new THREE.BoxGeometry(1.6, 1.4, 0.1), toon('#3a2b27'), false);
    wnd.position.set(0, 5, 2.05);
    tower.add(tb, wnd);
    const flames: THREE.Mesh[] = [];
    for (let i = 0; i < 5; i++) {
      const f = mesh(new THREE.ConeGeometry(0.35 + (i % 2) * 0.2, 1.3 + (i % 3) * 0.4, 8), toon(i % 2 ? '#ffb100' : '#ff6b2c', { emissive: '#662200' }), false);
      f.position.set(-0.6 + i * 0.3, 5.9, 2.2);
      tower.add(f);
      flames.push(f);
    }
    put(tower, 13, -34, -Math.PI / 2 - 0.4);
    blkRect(13, -34, 4.6, 4.6);
    let burn = 1;
    let relight = 0;
    b.tick((dt, t) => {
      if (burn < 1 && relight > 0 && (relight -= dt) <= 0) burn = 1;
      flames.forEach((f, i) => {
        const s = burn * (0.8 + Math.sin(t * 9 + i * 1.7) * 0.25);
        f.scale.set(Math.max(0.001, burn), Math.max(0.001, s), Math.max(0.001, burn));
        f.visible = burn > 0.02;
      });
    });
    // gerçek boyutta itfaiye: merdiven, hortum makarası, dolap kapakları, tepe lambaları
    const { model: truck, seat: fseat, beacons: [tred, tblue] } = firetruckModel();
    b.scene.add(truck);
    let tl = false;
    b.tick((_dt, t) => {
      const on = tl && Math.floor(t * 4) % 2 === 0;
      (tred.material as THREE.MeshBasicMaterial).color.set(on ? '#ff3b3b' : '#661010');
      (tblue.material as THREE.MeshBasicMaterial).color.set(tl && !on ? '#3b7bff' : '#10204a');
    });
    const tv: Vehicle = {
      model: truck, pos: G(10.4, -15), heading: head(0.15), speed: 16, water: false, seatY: 0.6, land: true,
      seat: fseat, cam: [20, 10], hornFx: 'siren', engine: 'truck',
      update: () => void (tl = true),
      onLeave: () => void (tl = false),
    };
    truck.position.copy(tv.pos);
    truck.rotation.y = tv.heading;
    b.spot({ id: 'firetruck', x: tv.pos.x, z: tv.pos.z, r: 3.8, label: 'İtfaiye aracını sür', vehicle: tv });
    // yangın: kulenin önünde hortumla söndürülür
    const target = G(12, -32.6, 5.4);
    spot('fire', 9.4, -30.5, 2.6, 'Hortumla yangını söndür', {
      dur: 9, cam: [14, 7], pose: 'hold',
      start: () => {
        burn = 1;
        relight = 0;
      },
      step(t, _u, a, dt) {
        a.heading = Math.atan2(target.x - a.pos.x, target.z - a.pos.z);
        burn = Math.max(0, burn - dt * 0.13);
        if (beat(t, dt, 0.6)) b.sound.fx?.('spray');
        // su kavisi
        const from = a.pos.clone().setY(a.pos.y + 1.6);
        for (let i = 1; i <= 4; i++) {
          if (Math.random() > 0.5) continue;
          const k = i / 4;
          const q = from.clone().lerp(target, k);
          q.y += Math.sin(k * Math.PI) * 1.6;
          b.sparkles.burst(q, 1, '#7cd3ff');
        }
      },
      end() {
        burn = 0;
        relight = 40;
        b.sound.fx?.('yay');
        return 'Yangını söndürdün! Sen gerçek bir itfaiyecisin!';
      },
    });
  }
}

// ================================================================================================
// Köy
// ================================================================================================
function buildVillage(b: WorldBuilder) {
  const Z = zone('village');
  const F = frame(b, Z);
  const { put, blk, blkRect, G, spot, head } = F;
  b.keepOut.push({ x: Z.x, z: Z.z, r: 44 });
  // köy meydanı
  const sq = mesh(new THREE.CircleGeometry(11, 36).rotateX(-Math.PI / 2), toon('#e6cc9a'), false);
  sq.receiveShadow = true;
  put(sq, 0, 0, 0, 0.08);
  const lane = mesh(new THREE.PlaneGeometry(4.4, 24).rotateX(-Math.PI / 2), toon('#e6cc9a'), false);
  put(lane, 0, 22, 0, 0.08);
  b.place(sign('Köy', '#fff1c7'), ...F.L(-5, 33), F.yaw);

  // çınar ve yuvarlak bank
  {
    const g = new THREE.Group();
    const trunk = mesh(new THREE.CylinderGeometry(0.9, 1.3, 6, 12), toon('#8a5a35'));
    trunk.position.y = 3;
    g.add(trunk);
    for (const [x, y, z, r] of [[0, 8, 0, 4.2], [2.6, 7, 1, 3], [-2.6, 7.2, -0.6, 3.2], [0.6, 6.8, -2.6, 3], [-0.8, 6.6, 2.6, 3]]) {
      const c = outline(mesh(new THREE.IcosahedronGeometry(r, 1), toon('#5cb85c')), 1.03);
      c.position.set(x, y, z);
      g.add(c);
    }
    const seat = outline(mesh(new THREE.TorusGeometry(2.4, 0.3, 6, 24), toon('#b9773f')), 1.03);
    seat.rotation.x = Math.PI / 2;
    seat.position.y = 0.65;
    g.add(seat);
    put(g, 0, 0);
    blk(0, 0, 2.7);
    spot('planetree', 0, 4, 2, 'Çınarın gölgesinde dinlen', {
      dur: 7, pose: 'sit', cam: [11, 5],
      step(t, _u, a, dt) {
        a.pos.copy(G(0, 2.5));
        a.heading = head(0);
        if (beat(t, dt, 1.3, 0.5)) b.sound.star(Math.floor(t * 3) % 6);
      },
      end: () => 'Kuşların cıvıltısını dinledin. Ne huzurlu!',
    });
  }

  // kuyu
  {
    const g = new THREE.Group();
    const wall = outline(mesh(new THREE.CylinderGeometry(1.3, 1.4, 1, 16, 1, true), toon('#b9b3c9')), 1.04);
    wall.position.y = 0.5;
    const water = mesh(new THREE.CircleGeometry(1.2, 16).rotateX(-Math.PI / 2), toon('#3fb7dd'), false);
    water.position.y = 0.4;
    g.add(wall, water);
    for (const x of [-1.2, 1.2]) {
      const p = mesh(new THREE.BoxGeometry(0.2, 2.6, 0.2), toon('#8a5a35'));
      p.position.set(x, 1.3, 0);
      g.add(p);
    }
    const roof = outline(mesh(new THREE.ConeGeometry(1.9, 1.2, 4), toon('#c0392b')), 1.03);
    roof.position.y = 3.1;
    roof.rotation.y = Math.PI / 4;
    const crank = mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.6, 8), toon('#8a5a35'));
    crank.rotation.z = Math.PI / 2;
    crank.position.y = 2.2;
    const bucket = outline(mesh(new THREE.CylinderGeometry(0.3, 0.24, 0.4, 10), toon('#a8662e')), 1.06);
    bucket.position.y = 1.6;
    g.add(roof, crank, bucket);
    put(g, 7, 5);
    blk(7, 5, 1.5);
    spot('well', 7, 7.8, 1.8, 'Kuyudan su çek', {
      dur: 5, pose: 'hold', cam: [9, 5],
      step(t, u, a, dt) {
        a.pos.copy(G(7, 7));
        a.heading = head(Math.PI);
        crank.rotation.x = t * 4;
        bucket.position.y = 1.6 - Math.sin(u * Math.PI) * 1.4;
        if (beat(t, dt, 2.5)) b.sound.fx?.('splash');
        if (beat(t, dt, 0.5)) b.sound.fx?.('creak');
      },
      end: () => {
        bucket.position.y = 1.6;
        return 'Buz gibi kuyu suyu! Oh be!';
      },
    });
  }

  // köy evleri (meydana bakar)
  const HC = [['#fff1c7', '#c0392b'], ['#ffd6a5', '#8e5b3a'], ['#e3f2fd', '#c0392b'], ['#fde2e4', '#a8662e'], ['#f1f8e9', '#c0392b'], ['#ffe8cc', '#7b4b2a'], ['#ede7f6', '#c0392b']];
  // her köy evi başka: çatısı, boyu, bacası, panjuru, sundurması ayrı (hepsi birbirine benzemesin)
  const HS: HouseOpts[] = [
    { roofKind: 'besik', chimney: true, shutters: '#c0392b', w: 7, d: 6 },
    { roofKind: 'kirma', porch: true, trim: '#8e5b3a', w: 7.6, d: 6.4 },
    { roofKind: 'piramit', dormer: true, shutters: '#5b8def', w: 6.6, d: 6 },
    { roofKind: 'besik', floors: 2, balcony: true, trim: '#a8662e', w: 7, d: 5.8 },
    { roofKind: 'kemer', chimney: true, trim: '#7b4b2a', w: 6.8, d: 6.2 },
    { roofKind: 'kirma', chimney: true, dormer: true, shutters: '#7b4b2a', w: 7.4, d: 6 },
    { roofKind: 'besik', porch: true, shutters: '#c0392b', trim: '#9b6b43', w: 6.6, d: 5.6 },
  ];
  const angs = [0.55, 1.15, 1.75, 2.35, -0.55, -1.15, -1.75];
  angs.forEach((a, i) => {
    const r = 24, lx = Math.sin(a) * r, lz = Math.cos(a) * r;
    const h = house(HC[i][0], 1.0, HC[i][1], HS[i]);
    put(h, lx, lz, a + Math.PI);
    blk(lx, lz, 4.6);
    // bahçe: çit ve lahanalar
    const gx = Math.sin(a) * (r - 6), gz = Math.cos(a) * (r - 6);
    const garden = new THREE.Group();
    for (let k = 0; k < 3; k++) {
      const cab = mesh(new THREE.SphereGeometry(0.35, 8, 6), toon(k % 2 ? '#7cc760' : '#5aa63f'), false);
      cab.position.set(-1 + k, 0.3, 0);
      cab.scale.y = 0.7;
      garden.add(cab);
    }
    const bed = mesh(new THREE.BoxGeometry(3.4, 0.2, 1.2), toon('#8a5a35'), false);
    bed.position.y = 0.1;
    garden.add(bed);
    put(garden, gx + Math.cos(a) * 2.6, gz - Math.sin(a) * 2.6, a + Math.PI);
  });

  // yel değirmeni
  {
    const g = new THREE.Group();
    const body = outline(mesh(new THREE.CylinderGeometry(1.8, 2.6, 9, 14), toon('#f4f1ea')), 1.02);
    body.position.y = 4.5;
    const roof = outline(mesh(new THREE.ConeGeometry(2.3, 2.6, 14), toon('#a8662e')), 1.03);
    roof.position.y = 10.3;
    const door = mesh(new THREE.BoxGeometry(1.2, 2, 0.2), toon('#8a5a35'), false);
    door.position.set(0, 1, 2.45);
    g.add(body, roof, door);
    const hub = new THREE.Group();
    hub.position.set(0, 8.4, 2.3);
    for (let i = 0; i < 4; i++) {
      const arm = new THREE.Group();
      const bar = mesh(new THREE.BoxGeometry(0.2, 6, 0.15), toon('#8a5a35'));
      bar.position.y = 3;
      const sail = mesh(new THREE.BoxGeometry(1.4, 4.6, 0.06), toon('#fff8e7', { emissive: '#4a4536' }));
      sail.position.set(0.75, 3.4, 0);
      arm.add(bar, sail);
      arm.rotation.z = (i / 4) * Math.PI * 2;
      hub.add(arm);
    }
    const cap = mesh(new THREE.SphereGeometry(0.4, 10, 8), toon('#8a5a35'));
    hub.add(cap);
    g.add(hub);
    put(g, 0, -27);
    blk(0, -27, 2.8);
    let speed = 0.5;
    b.tick((dt) => void (hub.rotation.z -= dt * speed));
    // saman balyaları
    for (const [lx, lz] of [[-6, -24], [-7.5, -26], [6, -25]] as const) {
      const hay = outline(mesh(new THREE.CylinderGeometry(0.9, 0.9, 1.4, 14), toon('#e8c05a')), 1.04);
      hay.rotation.z = Math.PI / 2;
      put(hay, lx, lz, 0.4, 0.9);
      blk(lx, lz, 1);
    }
    spot('windmill', 0, -22, 2.4, 'Değirmende un öğüt', {
      dur: 6, pose: (u) => (u < 0.8 ? 'idle' : 'hold'), cam: [16, 8],
      start: () => void (speed = 3),
      step(t, _u, a, dt) {
        a.pos.copy(G(0, -23));
        a.heading = head(Math.PI);
        if (beat(t, dt, 0.7)) b.sound.fx?.('creak');
        if (beat(t, dt, 1.5)) b.sound.whoosh?.();
      },
      end(a) {
        speed = 0.5;
        const sack = new THREE.Group();
        const s = outline(mesh(new THREE.SphereGeometry(0.4, 10, 8), toon('#f4f1ea')), 1.06);
        s.scale.set(1, 1.2, 0.8);
        s.position.y = -0.2;
        sack.add(s);
        holdItem(a, sack);
        return 'Rüzgâr değirmeni çevirdi, bir çuval un yaptın!';
      },
    });
  }

  // fırın (taş fırın)
  {
    const g = new THREE.Group();
    const base = outline(mesh(new THREE.BoxGeometry(4.4, 1.2, 3.6), toon('#d9c3a5')), 1.03);
    base.position.y = 0.6;
    const dome = outline(mesh(new THREE.SphereGeometry(1.9, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon('#c98a4b')), 1.03);
    dome.position.y = 1.2;
    const mouth = mesh(new THREE.CircleGeometry(0.7, 12, 0, Math.PI), toon('#ff8a3d', { emissive: '#552200' }), false);
    mouth.position.set(0, 1.25, 1.85);
    const chimney = mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.6, 8), toon('#a8662e'));
    chimney.position.set(0.8, 3.2, -0.6);
    g.add(base, dome, mouth, chimney);
    const sgn = board('FIRIN', '#a8662e', '#ffffff', 2.4, 0.7, 700);
    sgn.position.set(0, 2.2, 1.9);
    g.add(sgn);
    put(g, -15, -6, Math.PI / 2 - 0.4);
    blkRect(-15, -6, 4.4, 4.4);
    b.tick(() => {
      if (Math.random() < 0.03) b.sparkles.burst(G(-15, -6, 4.4), 1, '#dddddd');
    });
    spot('bread', -11.4, -4.6, 2, 'Köy ekmeği al', {
      dur: 2, pose: 'hold', step() {},
      end(a) {
        const loaf = outline(mesh(new THREE.CapsuleGeometry(0.22, 0.5, 4, 8), toon('#d9984a')), 1.06);
        loaf.rotation.z = Math.PI / 2;
        holdItem(a, loaf);
        b.sound.fx?.('yay');
        return 'Mis gibi sıcacık köy ekmeği!';
      },
    });
  }

  // kümes ve tavuklar
  {
    const coop = new THREE.Group();
    const cb = outline(mesh(new THREE.BoxGeometry(3, 2, 2.4), toon('#c0392b')), 1.03);
    cb.position.y = 1.3;
    const cr = outline(mesh(new THREE.ConeGeometry(2.4, 1.2, 4), toon('#8e5b3a')), 1.03);
    cr.position.y = 2.9;
    cr.rotation.y = Math.PI / 4;
    for (const [x, z] of [[-1.3, -1], [1.3, -1], [-1.3, 1], [1.3, 1]]) {
      const l = mesh(new THREE.BoxGeometry(0.15, 0.4, 0.15), toon('#5a4636'), false);
      l.position.set(x, 0.2, z);
      coop.add(l);
    }
    coop.add(cb, cr);
    put(coop, 17, -12, -0.6);
    blk(17, -12, 1.8);
    for (let i = 0; i < 6; i++) {
      const c = chicken(i % 3 === 0 ? '#c98a4b' : '#ffffff');
      const [x, z] = F.L(13 + (i % 3) * 1.5, -7 - Math.floor(i / 3) * 1.6);
      b.wander(c, x, z, 4, 1.4, false);
    }
    spot('hens', 12, -4, 2.2, 'Tavuklara yem ver', {
      dur: 5, pose: (u) => ((u * 5) % 1 < 0.3 ? 'wave' : 'hold'), cam: [10, 6],
      step(t, _u, a, dt) {
        a.pos.copy(G(12, -5));
        a.heading = head(Math.PI);
        if (beat(t, dt, 1)) {
          b.sound.fx?.('pop');
          b.sparkles.burst(G(12.5, -7.5, 0.4), 5, '#e8c05a');
        }
      },
      end: () => 'Tavuklar yemlerini yedi: gıt gıt gıdak!',
    });
  }

  // gölet ve ördekler
  {
    const pond = mesh(new THREE.CircleGeometry(4.2, 28).rotateX(-Math.PI / 2), toon('#5ec4e8', { emissive: '#0b2a3a' }), false);
    put(pond, -16, 12, 0, 0.1);
    const rim = mesh(new THREE.RingGeometry(4.2, 4.8, 28).rotateX(-Math.PI / 2), toon('#b9b3c9'), false);
    put(rim, -16, 12, 0, 0.11);
    blk(-16, 12, 4.4);
    const ducks: THREE.Group[] = [];
    for (let i = 0; i < 3; i++) {
      const d = new THREE.Group();
      const bd = outline(mesh(new THREE.SphereGeometry(0.35, 10, 8), toon('#ffd43b')), 1.06);
      bd.scale.set(1, 0.8, 1.3);
      const hd = mesh(new THREE.SphereGeometry(0.2, 8, 6), toon('#ffd43b'));
      hd.position.set(0, 0.35, 0.35);
      const bk = mesh(new THREE.ConeGeometry(0.08, 0.2, 5), toon('#ff8a3d'), false);
      bk.rotation.x = Math.PI / 2;
      bk.position.set(0, 0.32, 0.6);
      d.add(bd, hd, bk);
      d.userData.moving = true;
      b.scene.add(d);
      ducks.push(d);
    }
    const c0 = G(-16, 12, 0.25);
    b.tick((_dt, t) => {
      ducks.forEach((d, i) => {
        const a = t * 0.35 + (i * Math.PI * 2) / 3;
        d.position.set(c0.x + Math.cos(a) * 2.4, c0.y + Math.sin(t * 2 + i) * 0.04, c0.z + Math.sin(a) * 2.4);
        d.rotation.y = -a;
      });
    });
  }
}

// ================================================================================================
// Hayvanat bahçesi
// ================================================================================================
function buildZoo(b: WorldBuilder) {
  const Z = zone('zoo');
  const F = frame(b, Z);
  const { put, blk, G, spot, head } = F;
  b.keepOut.push({ x: Z.x, z: Z.z, r: 46 });
  // giriş kapısı
  {
    const gate = new THREE.Group();
    for (const sx of [-4.5, 4.5]) {
      const p = outline(mesh(new THREE.BoxGeometry(1.2, 6, 1.2), toon('#8a5a35')), 1.03);
      p.position.set(sx, 3, 0);
      const leaf = outline(mesh(new THREE.IcosahedronGeometry(1.2, 0), toon('#5cb85c')), 1.04);
      leaf.position.set(sx, 6.6, 0);
      gate.add(p, leaf);
    }
    const top = board('HAYVANAT BAHÇESİ', '#f08c3a', '#ffffff', 10, 1.8, 700);
    top.position.y = 5.6;
    const back = top.clone();
    back.rotation.y = Math.PI;
    back.position.z = -0.02;
    gate.add(top, back);
    put(gate, 0, 33);
    blk(-4.5, 33, 0.9);
    blk(4.5, 33, 0.9);
  }
  // yuvarlak yol
  const ring = mesh(new THREE.RingGeometry(13, 18, 48).rotateX(-Math.PI / 2), toon('#ecdcb4'), false);
  ring.receiveShadow = true;
  put(ring, 0, 0, 0, 0.09);
  const lane = mesh(new THREE.PlaneGeometry(4.4, 16).rotateX(-Math.PI / 2), toon('#ecdcb4'), false);
  put(lane, 0, 26, 0, 0.09);
  // ortada bilgi direği ve çiçekler
  {
    const kiosk = new THREE.Group();
    const p = mesh(new THREE.CylinderGeometry(0.15, 0.15, 3, 8), toon('#8a5a35'));
    p.position.y = 1.5;
    const m = board('Hayvanlara iyi bak!', '#2bb673', '#ffffff', 3.4, 1, 700);
    m.position.y = 3;
    kiosk.add(p, m);
    put(kiosk, 0, 4);
    const bed = mesh(new THREE.CircleGeometry(6, 24).rotateX(-Math.PI / 2), toon('#7cc760'), false);
    put(bed, 0, 0, 0, 0.06);
    const ring = Array.from({ length: 30 }, (_, i) => {
      const a = (i / 30) * Math.PI * 2;
      return G(Math.sin(a) * 5, Math.cos(a) * 5, 0.06);
    });
    b.scene.add(flowers(ring, ['#ff6b8a', '#ffc83d', '#b98cff']));
    const t = tree('round', 1.4);
    put(t, 0, -1.5);
    blk(0, -1.5, 1.4);
  }
  type PenDef = { key: string; name: string; label: string; size: number; ang: number; ground: string; deco: (g: THREE.Group) => void; food: string; sound: string; facts: string[]; n?: number };
  const pens: PenDef[] = [
    {
      key: 'aslan', name: 'Aslan', label: 'Aslanı besle', size: 3.2, ang: 0.95, ground: '#e6c27a', food: 'et', sound: 'roar',
      deco: (g) => {
        for (const [x, z, r] of [[-2, -2, 1.6], [2.4, -1, 1.2], [0, 2.6, 1]]) {
          const rock = outline(mesh(new THREE.DodecahedronGeometry(r, 0), toon('#b9a88c')), 1.04);
          rock.position.set(x, r * 0.5, z);
          g.add(rock);
        }
      },
      facts: ['Aslan kükredi! Aslanlar günde 20 saat uyurmuş.', 'Aslanın kükremesi 8 kilometreden duyulurmuş!'],
    },
    {
      key: 'fil', name: 'Fil', label: 'Fili besle', size: 4.4, ang: 1.75, ground: '#c9b48a', food: 'muz', sound: 'trumpet',
      deco: (g) => {
        const pool = mesh(new THREE.CircleGeometry(2.4, 20).rotateX(-Math.PI / 2), toon('#5ec4e8'), false);
        pool.position.set(-2, 0.08, -2);
        g.add(pool);
      },
      facts: ['Fil hortumuyla teşekkür etti! Filler hortumlarıyla su içer.', 'Filler kocaman kulaklarıyla serinlermiş!'],
    },
    {
      key: 'zurafa', name: 'Zürafa', label: 'Zürafayı besle', size: 6.4, ang: 2.55, ground: '#d8c690', food: 'yaprak', sound: 'yay',
      deco: (g) => {
        for (const [x, z] of [[-3, -2], [3, -3]]) {
          const tr = new THREE.Group();
          const trunk = mesh(new THREE.CylinderGeometry(0.2, 0.3, 5, 8), toon('#8a5a35'));
          trunk.position.y = 2.5;
          const top = outline(mesh(new THREE.CylinderGeometry(2.2, 1.6, 0.9, 12), toon('#5cb85c')), 1.04);
          top.position.y = 5.3;
          tr.add(trunk, top);
          tr.position.set(x, 0, z);
          g.add(tr);
        }
      },
      facts: ['Zürafa en yüksek yapraklara uzandı! Dili mor renkliymiş.', 'Zürafalar ayakta uyuyabilirmiş!'],
    },
    {
      key: 'panda', name: 'Panda', label: 'Pandayı besle', size: 2.8, ang: -2.55, ground: '#9fd38a', food: 'bambu', sound: 'yay',
      deco: (g) => {
        for (let i = 0; i < 7; i++) {
          const bm = mesh(new THREE.CylinderGeometry(0.12, 0.14, 3 + (i % 3), 6), toon('#7cc760'));
          bm.position.set(-3 + i * 0.5, (3 + (i % 3)) / 2, -3 + (i % 2) * 0.6);
          g.add(bm);
        }
      },
      facts: ['Panda bambuyu çıtır çıtır yedi! Günde 12 saat yemek yerlermiş.', 'Yeni doğan panda bir elma kadar küçükmüş!'],
    },
    {
      key: 'kaplumbaga', name: 'Kaplumbağa', label: 'Kaplumbağayı besle', size: 1.8, ang: -1.75, ground: '#a7d98f', food: 'marul', sound: 'yay', n: 2,
      deco: (g) => {
        const pond = mesh(new THREE.CircleGeometry(2.6, 20).rotateX(-Math.PI / 2), toon('#5ec4e8'), false);
        pond.position.set(1.5, 0.08, -1.5);
        g.add(pond);
      },
      facts: ['Kaplumbağa marulu yavaş yavaş yedi. Kaplumbağalar 100 yıl yaşayabilir!', 'Kaplumbağa evini sırtında taşır!'],
    },
    {
      key: 'penguen', name: 'Penguen', label: 'Penguenleri besle', size: 1.6, ang: -0.95, ground: '#e9f6ff', food: 'balık', sound: 'yay', n: 3,
      deco: (g) => {
        const pool = mesh(new THREE.CircleGeometry(2.8, 20).rotateX(-Math.PI / 2), toon('#4dabf7'), false);
        pool.position.set(-1.4, 0.08, -1.6);
        const ice = outline(mesh(new THREE.BoxGeometry(2, 0.8, 1.6), toon('#ffffff')), 1.04);
        ice.position.set(2.4, 0.4, -2);
        g.add(pool, ice);
      },
      facts: ['Penguenler balığa bayıldı! Penguenler uçamaz ama çok iyi yüzer.', 'Penguenler karnının üstünde buzda kayarmış!'],
    },
  ];
  const R = 26, PR = 7;
  for (const p of pens) {
    const lx = Math.sin(p.ang) * R, lz = Math.cos(p.ang) * R;
    const g = new THREE.Group();
    const floor = mesh(new THREE.CircleGeometry(PR, 28).rotateX(-Math.PI / 2), toon(p.ground), false);
    floor.position.y = 0.07;
    floor.receiveShadow = true;
    g.add(floor);
    const rail = mesh(new THREE.TorusGeometry(PR, 0.09, 6, 48), toon('#8a5a35'), false);
    rail.rotation.x = Math.PI / 2;
    rail.position.y = 1.2;
    const rail2 = rail.clone();
    rail2.position.y = 0.6;
    g.add(rail, rail2);
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      const post = mesh(new THREE.BoxGeometry(0.18, 1.4, 0.18), toon('#8a5a35'), false);
      post.position.set(Math.cos(a) * PR, 0.7, Math.sin(a) * PR);
      g.add(post);
    }
    p.deco(g);
    put(g, lx, lz);
    blk(lx, lz, PR + 0.3);
    // levha (yola bakar)
    const fr = (R - PR - 1.4) / R;
    const sx = lx * fr, sz = lz * fr;
    b.place(sign(p.name, '#fff1c7'), ...F.L(sx + Math.cos(p.ang) * 2, sz - Math.sin(p.ang) * 2), head(p.ang + Math.PI));
    if (b.tex[p.key]) for (let k = 0; k < (p.n ?? 1); k++) {
      const [x, z] = F.L(lx + (k - 0.5) * 1.5, lz + (k % 2) * 1.2);
      b.wander(b.card(p.key, p.size), x, z, PR - 2.6, 0.9);
    }
    const food = () => {
      const fg = new THREE.Group();
      const col = p.food === 'et' ? '#c0392b' : p.food === 'muz' ? '#ffd43b' : p.food === 'balık' ? '#8ecae6' : p.food === 'bambu' ? '#7cc760' : '#5cb85c';
      const f = outline(mesh(p.food === 'muz' || p.food === 'bambu' ? new THREE.CapsuleGeometry(0.1, 0.5, 4, 6) : new THREE.SphereGeometry(0.22, 8, 6), toon(col)), 1.08);
      fg.add(f);
      return fg;
    };
    const thrown = food();
    thrown.visible = false;
    thrown.userData.moving = true;
    b.scene.add(thrown);
    const stand = { lx: sx, lz: sz };
    let fed = false;
    spot(`zoo-${p.key}`, stand.lx, stand.lz, 2.2, p.label, {
      dur: 4.2, pose: (u) => (u < 0.4 ? 'hold' : u < 0.55 ? 'wave' : 'clap'), cam: [12, 7],
      start: (a) => {
        holdItem(a, food());
        fed = false;
      },
      step(_t, u, a) {
        a.pos.copy(G(stand.lx, stand.lz));
        a.heading = head(p.ang);
        if (u > 0.4 && u < 0.75) {
          a.hand.getObjectByName('held')?.removeFromParent();
          thrown.visible = true;
          const k = (u - 0.4) / 0.35;
          thrown.position.lerpVectors(G(stand.lx, stand.lz, 2), G(lx, lz, 0.3), k);
          thrown.position.y += Math.sin(k * Math.PI) * 2;
        } else thrown.visible = false;
        if (u > 0.6 && !fed) {
          fed = true;
          b.sound.fx?.(p.sound);
        }
      },
      end: () => {
        thrown.visible = false;
        b.sparkles.burst(G(lx, lz, 2), 12, '#ff8fb1');
        return pick(p.facts);
      },
    });
  }
  // banklar ve dondurma
  for (const a of [0.5, -0.5, 3.14]) put(bench(), Math.sin(a) * 19, Math.cos(a) * 19, a + Math.PI);
}

// ================================================================================================
// Havalimanı
// ================================================================================================
function buildAirport(b: WorldBuilder) {
  const Z = zone('airport');
  const F = frame(b, Z);
  const { put, blk, blkRect, V } = F;
  b.keepOut.push({ x: Z.x, z: Z.z, r: 54 });
  // pist (+lx boyunca)
  {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 64;
    const x = c.getContext('2d')!;
    x.fillStyle = '#6b707c';
    x.fillRect(0, 0, 256, 64);
    x.fillStyle = '#ffffff';
    x.fillRect(20, 29, 100, 6);
    x.fillRect(0, 2, 256, 3);
    x.fillRect(0, 59, 256, 3);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    t.repeat.set(9, 1);
    const run = new THREE.Mesh(new THREE.PlaneGeometry(90, 11).rotateX(-Math.PI / 2), new THREE.MeshToonMaterial({ map: t }));
    run.receiveShadow = true;
    put(run, 0, -10, 0, 0.12);
    const apron = mesh(new THREE.PlaneGeometry(40, 10).rotateX(-Math.PI / 2), toon('#9aa0ab'), false);
    put(apron, -8, 1, 0, 0.1);
  }
  // terminal
  const term = building({ w: 22, d: 9, h: 6.4, wall: '#dfe7f2', trim: '#5b8def', name: 'HAVALİMANI', signBg: '#5b8def', floors: 1, door: '#9ad7ff' });
  const glass = mesh(new THREE.BoxGeometry(16, 3, 0.1), toon('#9ad7ff', { emissive: '#15303f' }), false);
  glass.position.set(0, 2.4, 4.52);
  term.add(glass);
  put(term, -6, 14, Math.PI);
  blkRect(-6, 14, 22, 9);
  b.place(sign('Havalimanı', '#dcecff'), ...F.L(-2, 30), F.yaw);
  // kule
  {
    const g = new THREE.Group();
    const shaft = outline(mesh(new THREE.CylinderGeometry(1.4, 1.8, 14, 12), toon('#f4f1ea')), 1.02);
    shaft.position.y = 7;
    const cab = outline(mesh(new THREE.CylinderGeometry(3, 2.2, 2.6, 12), toon('#5b8def')), 1.03);
    cab.position.y = 15.2;
    const win = mesh(new THREE.CylinderGeometry(2.9, 2.9, 1.2, 12), toon('#cfeaff', { emissive: '#1a2a33' }), false);
    win.position.y = 15.4;
    const ant = mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 5), toon('#5b5f6b'), false);
    ant.position.y = 17.6;
    const blink = mesh(new THREE.SphereGeometry(0.25, 8, 6), new THREE.MeshBasicMaterial({ color: '#ff3b3b' }), false);
    blink.position.y = 18.9;
    g.add(shaft, cab, win, ant, blink);
    put(g, 18, 14);
    blk(18, 14, 2);
    b.tick((_dt, t) => void (blink.visible = Math.floor(t * 1.5) % 2 === 0));
  }
  // hangar
  {
    // yarım silindir: kemeri yukarıda, ağzı pist tarafına (yerel −z) bakar
    const hg = outline(mesh(new THREE.CylinderGeometry(6, 6, 12, 20, 1, false, -Math.PI / 2, Math.PI).rotateX(-Math.PI / 2), toon('#b8c0cc')), 1.02);
    const door = mesh(new THREE.CircleGeometry(5.4, 20, 0, Math.PI), toon('#4a4f5c'), false);
    door.rotation.y = Math.PI;
    door.position.z = -6.05;
    const g = new THREE.Group();
    g.add(hg, door);
    put(g, 30, 4, Math.PI);
    blkRect(30, 4, 12, 12);
  }
  // rüzgâr tulumu
  {
    const g = new THREE.Group();
    const p = mesh(new THREE.CylinderGeometry(0.07, 0.07, 5, 6), toon('#cfd4dc'));
    p.position.y = 2.5;
    const sock = mesh(new THREE.ConeGeometry(0.45, 2.2, 10, 1, true), toon('#ff8a3d'), false);
    sock.rotation.z = Math.PI / 2;
    sock.position.set(1.1, 4.8, 0);
    g.add(p, sock);
    put(g, -36, 2);
    blk(-36, 2, 0.3);
    b.tick((_dt, t) => void (g.rotation.y = F.yaw + Math.sin(t * 0.7) * 0.4));
  }
  // uçak
  // gerçek boyutta uçak: kanatlar, pencereler, açık kokpit, üç kanatlı pervane, iniş takımı
  const { model: plane, seat: pseat, prop } = planeModel();
  plane.userData.moving = true; // adanın her yerinde uçar: uzak bölge gizlemesine girmez
  b.scene.add(plane);
  let propSpeed = 0;
  b.tick((dt) => void (prop.rotation.z += dt * propSpeed));
  // uçak pistin başında park hâlinde (tekerlekleri yerde)
  const pts = [V(-34, F.hAt(-34, -10) + 1.85, -10)];
  // kullanıcı uçurur: joystick yönü, uçak yükselir, "İn" ile karada iner
  const pv: Vehicle = {
    model: plane, pos: pts[0].clone(), heading: F.head(Math.PI / 2), speed: 32, water: false, seatY: 0.4, fly: true,
    alt: 26, park: 1.85, bank: true, seat: pseat, cam: [26, 10], engine: 'plane',
    update: (_dt, mag) => {
      propSpeed = 18 + mag * 22;
    },
    onLeave: () => {
      propSpeed = 0;
      b.sound.fx?.('thump');
    },
  };
  plane.position.copy(pv.pos);
  plane.rotation.set(0, pv.heading, 0);
  b.spot({ id: 'plane', x: pv.pos.x, z: pv.pos.z, r: 4.2, label: 'Uçağı uçur', vehicle: pv });
}

// ================================================================================================
// Piknik Tepesi
// ================================================================================================
function buildPicnic(b: WorldBuilder) {
  const Z = zone('picnic');
  const F = frame(b, Z);
  const { put, blk, G, spot, head } = F;
  b.keepOut.push({ x: Z.x, z: Z.z, r: 34 });
  b.place(sign('Piknik Tepesi', '#ffe3ee'), ...F.L(-4, 30), F.yaw);
  // çiçek tarlası
  {
    const cols = ['#ff6b8a', '#ffc83d', '#ffffff', '#b98cff', '#ff8a65'];
    const field = Array.from({ length: 260 }, () => {
      const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 9;
      return Object.assign(G(-14 + Math.cos(a) * r, -10 + Math.sin(a) * r, 0.02), { s: 0.8 + Math.random() * 0.5 });
    });
    b.scene.add(flowers(field, cols));
    if (b.tex.kelebek) for (let i = 0; i < 4; i++) {
      const [x, z] = F.L(-14 + (i % 2) * 4, -10 + Math.floor(i / 2) * 4);
      const c = b.card('kelebek', 1.1);
      b.wander(c, x, z, 7, 1.6);
    }
  }
  // piknik örtüleri
  const cloth = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const x = c.getContext('2d')!;
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
      x.fillStyle = (i + j) % 2 ? '#ffffff' : '#ef4b4b';
      x.fillRect(i * 8, j * 8, 8, 8);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.magFilter = THREE.NearestFilter;
    return t;
  })();
  const blankets: [number, number][] = [[6, 4], [14, -6], [4, -14]];
  for (const [lx, lz] of blankets) {
    const bl = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2).rotateX(-Math.PI / 2), new THREE.MeshToonMaterial({ map: cloth }));
    bl.receiveShadow = true;
    put(bl, lx, lz, Math.random(), 0.1);
    const basket = new THREE.Group();
    const bk = outline(mesh(new THREE.BoxGeometry(0.9, 0.6, 0.6), toon('#c98a4b')), 1.05);
    bk.position.y = 0.4;
    const hd = mesh(new THREE.TorusGeometry(0.35, 0.05, 6, 12, Math.PI), toon('#a8662e'), false);
    hd.position.y = 0.7;
    basket.add(bk, hd);
    put(basket, lx + 1, lz - 1);
  }
  spot('picnic', 6, 7, 2.2, 'Piknik yap', {
    dur: 5, pose: 'sit', cam: [9, 5],
    step(t, _u, a, dt) {
      a.pos.copy(G(6, 4.4));
      a.heading = head(0.6);
      if (beat(t, dt, 1.4, 0.5)) b.sound.fx?.('pop');
    },
    end(a) {
      const sand = new THREE.Group();
      const br = outline(mesh(new THREE.BoxGeometry(0.5, 0.18, 0.4), toon('#f3d39b')), 1.08);
      const lettuce = mesh(new THREE.BoxGeometry(0.52, 0.05, 0.42), toon('#7cc760'), false);
      lettuce.position.y = 0.1;
      sand.add(br, lettuce);
      holdItem(a, sand);
      b.sound.fx?.('yay');
      return 'Ağaçların altında nefis bir piknik yaptın!';
    },
  });
  // hamak (iki ağaç arası)
  {
    const t1 = tree('round', 1.4), t2 = tree('round', 1.4);
    put(t1, -8, 12);
    put(t2, 0, 12);
    blk(-8, 12, 0.9);
    blk(0, 12, 0.9);
    const ham = new THREE.Group();
    const net = mesh(new THREE.CylinderGeometry(0.9, 0.9, 6, 14, 1, true, Math.PI, Math.PI).rotateZ(Math.PI / 2), toon('#ffb3c7'), false);
    (net.material as THREE.MeshToonMaterial).side = THREE.DoubleSide;
    net.position.y = 0;
    ham.add(net);
    for (const sx of [-1, 1]) {
      const rope = mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.4, 4), toon('#5a4636'), false);
      rope.position.set(sx * 3.4, 0.5, 0);
      rope.rotation.z = sx * 0.9;
      ham.add(rope);
    }
    put(ham, -4, 12, 0, 1.5);
    let swing = 0;
    b.tick((_dt, t) => void (ham.rotation.z = Math.sin(t * 1.4) * (0.05 + swing)));
    spot('hammock', -4, 9, 2, 'Hamakta dinlen', {
      dur: 7, pose: 'sit', cam: [10, 6],
      start: () => void (swing = 0.12),
      step(t, _u, a, dt) {
        a.pos.copy(G(-4, 12, 0.5));
        a.heading = head(0);
        if (beat(t, dt, 2.2, 1)) b.sound.fx?.('creak');
      },
      end: () => {
        swing = 0;
        return 'Hamakta sallanırken neredeyse uyuyordun!';
      },
    });
  }
  // uçurtma
  {
    const kite = new THREE.Group();
    const shape = new THREE.Shape([new THREE.Vector2(0, 1.2), new THREE.Vector2(0.8, 0), new THREE.Vector2(0, -1.2), new THREE.Vector2(-0.8, 0)]);
    const sail = mesh(new THREE.ShapeGeometry(shape), new THREE.MeshToonMaterial({ color: '#ff6b8a', side: THREE.DoubleSide }), false);
    const cross = mesh(new THREE.BoxGeometry(1.6, 0.06, 0.06), toon('#3a2b27'), false);
    kite.add(sail, cross);
    for (let i = 0; i < 4; i++) {
      const bow = mesh(new THREE.BoxGeometry(0.3, 0.12, 0.05), toon(['#ffc83d', '#5b8def', '#7cc760', '#b98cff'][i]), false);
      bow.position.set(0, -1.5 - i * 0.5, 0);
      kite.add(bow);
    }
    kite.scale.setScalar(1.6);
    kite.visible = false;
    kite.userData.moving = true;
    b.scene.add(kite);
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: '#ffffff' }));
    line.frustumCulled = false;
    line.visible = false;
    line.userData.moving = true;
    b.scene.add(line);
    spot('kite', 26, 14, 2.4, 'Uçurtma uçur', {
      dur: 12, pose: 'hold', cam: [16, 3], follow: true,
      step(t, u, a, dt) {
        a.pos.copy(G(26, 12));
        a.heading = head(Math.PI * 0.9);
        const hgt = 4 + 11 * sm(clamp01(u * 2.5)) - 9 * sm(clamp01((u - 0.82) / 0.18));
        const dist = 3 + 12 * sm(clamp01(u * 2)) - 10 * sm(clamp01((u - 0.82) / 0.18));
        const kp = G(25 + Math.sin(t * 0.8) * 3, 12 - dist, hgt + Math.sin(t * 1.7) * 1.2);
        kite.visible = line.visible = true;
        kite.position.copy(kp);
        kite.lookAt(a.pos);
        kite.rotateZ(Math.sin(t * 2) * 0.3);
        const hand = a.pos.clone().setY(a.pos.y + 1.6);
        (line.geometry as THREE.BufferGeometry).setFromPoints([hand, kp]);
        if (beat(t, dt, 2.5, 1)) b.sound.whoosh?.();
      },
      end: () => {
        kite.visible = line.visible = false;
        b.sound.fx?.('yay');
        return 'Uçurtman bulutlara kadar yükseldi!';
      },
    });
  }
  // piknik masaları
  for (const [lx, lz, r] of [[-2, -4, 0.3], [22, -2, -0.4]] as const) {
    const g = new THREE.Group();
    const top = outline(mesh(new THREE.BoxGeometry(3, 0.15, 1.2), toon('#b9773f')), 1.04);
    top.position.y = 1;
    g.add(top);
    for (const sz of [-1, 1]) {
      const seat = mesh(new THREE.BoxGeometry(3, 0.12, 0.4), toon('#a8662e'));
      seat.position.set(0, 0.55, sz * 1);
      g.add(seat);
      for (const sx of [-1.2, 1.2]) {
        const leg = mesh(new THREE.BoxGeometry(0.12, 1, 0.12), toon('#8a5a35'), false);
        leg.position.set(sx, 0.5, sz * 0.4);
        g.add(leg);
      }
    }
    const jug = mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.45, 10), toon('#ffe066', { transparent: true, opacity: 0.85 }), false);
    jug.position.set(0.6, 1.3, 0);
    g.add(jug);
    put(g, lx, lz, r);
    blk(lx, lz, 1.5);
  }
  // birkaç ağaç
  for (const [lx, lz] of [[18, 4], [-18, 6], [20, -16], [-6, -24], [10, 22]] as const) {
    put(tree('round', 1.2 + Math.random() * 0.5), lx, lz);
    blk(lx, lz, 0.9);
  }
}

/** Yeni yerleri ve yolları kurar (bölgelerden sonra, bitki örtüsünden önce). */
export function buildPlaces(b: WorldBuilder) {
  buildCity(b);
  buildDowntown(b);
  buildPetPark(b);
  buildVillage(b);
  buildZoo(b);
  buildAirport(b);
  buildPicnic(b);
  buildRoads(b);
}
