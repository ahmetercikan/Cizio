/**
 * Çizio Adası'nın arazisi: yükseklik haritasından kurulan kara (çimen, kum, kar, toprak renkleri), deniz ve göl suyu,
 * ve tek çizimde (InstancedMesh) dökülen ağaçlar, çiçekler, kayalar. Engeller hızlı arama için ızgaraya konur.
 */
import * as THREE from 'three';
import { canvasTexture, toon } from '../play3d/kit';
import { groundKind, heightAt, isWater, LAND_R, WORLD_R, ZONES } from './layout';

export interface Blocker { x: number; z: number; r: number }

/** Engeller için kaba ızgara (16 birimlik hücreler): yakın engelleri hızlı bulmak için. */
export class BlockGrid {
  private cells = new Map<string, Blocker[]>();
  private key = (x: number, z: number) => `${Math.floor(x / 16)},${Math.floor(z / 16)}`;
  add(b: Blocker) {
    const r = Math.ceil(b.r / 16);
    const cx = Math.floor(b.x / 16), cz = Math.floor(b.z / 16);
    for (let i = -r; i <= r; i++) for (let j = -r; j <= r; j++) {
      const k = `${cx + i},${cz + j}`;
      const a = this.cells.get(k);
      if (a) a.push(b);
      else this.cells.set(k, [b]);
    }
  }
  near(x: number, z: number): Blocker[] {
    return this.cells.get(this.key(x, z)) ?? [];
  }
  /** Daireleri iterek konumu düzeltir. */
  push(p: { x: number; z: number }, r = 0.6) {
    for (const b of this.near(p.x, p.z)) {
      const dx = p.x - b.x, dz = p.z - b.z, d = Math.hypot(dx, dz), min = b.r + r;
      if (d < min) {
        p.x = b.x + (dx / (d || 1)) * min;
        p.z = b.z + (dz / (d || 1)) * min;
      }
    }
  }
  free(x: number, z: number, r: number) {
    return this.near(x, z).every((b) => Math.hypot(b.x - x, b.z - z) > b.r + r);
  }
}

const COL = {
  grass: new THREE.Color('#8fd16f'),
  grass2: new THREE.Color('#7cc760'),
  sand: new THREE.Color('#f3dca2'),
  snow: new THREE.Color('#f4f9ff'),
  dirt: new THREE.Color('#d9a066'),
  under: new THREE.Color('#e6cf90'),
};

/** Ana kara ağı: yükseklik ve renk köşe başına. */
export function buildTerrain(scene: THREE.Scene) {
  const size = (LAND_R + 40) * 2, seg = 230;
  const geo = new THREE.PlaneGeometry(size, size, seg, seg);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const h = heightAt(x, z);
    pos.setY(i, h);
    const k = groundKind(x, z);
    if (h < -0.2) c.copy(COL.under);
    else if (k === 'snow') c.copy(COL.snow);
    else if (k === 'sand') c.copy(COL.sand);
    else if (k === 'dirt') c.copy(COL.dirt).lerp(COL.grass, 0.15);
    else c.copy(COL.grass).lerp(COL.grass2, (Math.sin(x * 0.11) * Math.cos(z * 0.13) + 1) / 2);
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const land = new THREE.Mesh(geo, new THREE.MeshToonMaterial({ vertexColors: true }));
  land.receiveShadow = true;
  scene.add(land);

  // Su: deniz ve göl tek düzlem (y = 0); arazi suyun altına iner
  const water = canvasTexture(128, 128, (ctx) => {
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
  }, [90, 90]);
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), new THREE.MeshToonMaterial({ map: water, transparent: true, opacity: 0.92 }));
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = -0.05;
  sea.receiveShadow = true;
  scene.add(sea);
  // dokunarak yürüme için görünmez zemin (araziyi kabaca izler)
  const pick = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ visible: false }));
  scene.add(pick);
  return { land, sea, water, pick };
}

/** Bölgelerin yakınına bitki dikilmez. */
const nearZone = (x: number, z: number, r: number) => ZONES.some((zn) => Math.hypot(zn.x - x, zn.z - z) < r);

/**
 * Ağaçlar, çiçekler, kayalar: InstancedMesh ile (yüzlerce nesne tek çizim). Ağaçlar engel olarak ızgaraya eklenir.
 * `forest` bölgesinde sık orman.
 */
export function buildVegetation(scene: THREE.Scene, grid: BlockGrid, keepOut: { x: number; z: number; r: number }[]) {
  let seed = 4242;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const forest = ZONES.find((z) => z.id === 'forest')!;
  const okSpot = (x: number, z: number, r: number) =>
    !isWater(x, z) && heightAt(x, z) > 0.8 && Math.hypot(x, z) < LAND_R - 10 && grid.free(x, z, r + 1.2) &&
    keepOut.every((k) => Math.hypot(k.x - x, k.z - z) > k.r + r);

  const trees: { x: number; z: number; s: number; kind: 0 | 1 | 2 }[] = [];
  const tryTree = (x: number, z: number) => {
    if (!okSpot(x, z, 1) || nearZone(x, z, 30) && Math.hypot(x - forest.x, z - forest.z) > 60) return;
    const h = heightAt(x, z);
    const kind: 0 | 1 | 2 = h > 14 ? 2 : rnd() < 0.55 ? 0 : 1;
    trees.push({ x, z, s: 0.9 + rnd() * 0.9, kind });
    grid.add({ x, z, r: 0.9 });
  };
  for (let i = 0; i < 2600 && trees.length < 620; i++) {
    const a = rnd() * Math.PI * 2, r = 20 + Math.sqrt(rnd()) * (LAND_R - 30);
    tryTree(Math.cos(a) * r, Math.sin(a) * r);
  }
  // sık orman
  for (let i = 0; i < 900; i++) {
    const a = rnd() * Math.PI * 2, r = 14 + Math.sqrt(rnd()) * 55;
    const x = forest.x + Math.cos(a) * r, z = forest.z + Math.sin(a) * r;
    if (Math.hypot(x - forest.x, z - forest.z) < 16) continue;
    tryTree(x, z);
  }

  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const sc = new THREE.Vector3();
  const p = new THREE.Vector3();
  const inst = (geo: THREE.BufferGeometry, mat: THREE.Material, list: { x: number; y: number; z: number; s: number; sy?: number }[]) => {
    const m = new THREE.InstancedMesh(geo, mat, list.length);
    list.forEach((it, i) => {
      p.set(it.x, it.y, it.z);
      q.setFromEuler(new THREE.Euler(0, rnd() * Math.PI * 2, 0));
      sc.set(it.s, it.sy ?? it.s, it.s);
      m4.compose(p, q, sc);
      m.setMatrixAt(i, m4);
    });
    m.castShadow = true;
    m.receiveShadow = true;
    scene.add(m);
    return m;
  };
  const trunkGeo = new THREE.CylinderGeometry(0.18, 0.26, 1.3, 7);
  trunkGeo.translate(0, 0.65, 0);
  inst(trunkGeo, toon('#9b6b43'), trees.map((t) => ({ x: t.x, y: heightAt(t.x, t.z), z: t.z, s: t.s })));
  const round = trees.filter((t) => t.kind === 0);
  const crown = new THREE.IcosahedronGeometry(1, 1);
  crown.translate(0, 1.85, 0);
  inst(crown, toon('#5cc36b'), round.map((t) => ({ x: t.x, y: heightAt(t.x, t.z), z: t.z, s: t.s })));
  for (const [kind, color] of [[1, '#3fa45a'], [2, '#e9f6ff']] as const) {
    const pines = trees.filter((t) => t.kind === kind);
    for (let i = 0; i < 3; i++) {
      const cone = new THREE.ConeGeometry(1 - i * 0.25, 1.1, 8);
      cone.translate(0, 1.4 + i * 0.6, 0);
      inst(cone, toon(color), pines.map((t) => ({ x: t.x, y: heightAt(t.x, t.z), z: t.z, s: t.s })));
    }
  }

  // çiçekler (yürünebilir, gölge yok)
  const cols = ['#ff6b8a', '#ffc83d', '#ffffff', '#b98cff', '#ff8a65'];
  for (const col of cols) {
    const list: { x: number; y: number; z: number; s: number }[] = [];
    for (let i = 0; i < 420; i++) {
      const a = rnd() * Math.PI * 2, r = 8 + Math.sqrt(rnd()) * (LAND_R - 20);
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      const h = heightAt(x, z);
      if (h < 1 || h > 14) continue;
      list.push({ x, y: h + 0.2, z, s: 0.8 + rnd() * 0.6 });
    }
    const f = inst(new THREE.SphereGeometry(0.18, 6, 5), toon(col), list);
    f.castShadow = false;
  }
  // kayalar
  const rocks: { x: number; y: number; z: number; s: number; sy: number }[] = [];
  for (let i = 0; i < 400 && rocks.length < 110; i++) {
    const a = rnd() * Math.PI * 2, r = 30 + rnd() * (LAND_R - 25);
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (!okSpot(x, z, 1)) continue;
    const s = 0.6 + rnd() * 1.2;
    rocks.push({ x, y: heightAt(x, z) + 0.2, z, s, sy: s * 0.6 });
    grid.add({ x, z, r: s * 0.9 });
  }
  inst(new THREE.DodecahedronGeometry(1, 0), toon('#b9b3c9'), rocks);
  return { trees: trees.length };
}

/** Uzaktaki bulutlar ve küçük adalar (ufuk). */
export function buildHorizon(scene: THREE.Scene, cloud: (s: number) => THREE.Object3D) {
  for (let i = 0; i < 22; i++) {
    const c = cloud(5 + Math.random() * 6);
    const a = (i / 22) * Math.PI * 2;
    const r = WORLD_R + 120 + Math.random() * 120;
    c.position.set(Math.cos(a) * r, 45 + Math.random() * 30, Math.sin(a) * r);
    scene.add(c);
  }
}
