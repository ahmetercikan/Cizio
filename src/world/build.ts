/**
 * İnşa alanı (Minecraft gibi): arsadaki blok ızgarası. Bloklar tek çizimde (InstancedMesh) çizilir; kapı, çiçek, ağaç
 * gibi eşyalar küçük modellerdir. Kahraman blokların üstüne zıplayarak çıkar, duvarlardan geçemez.
 *
 * Kayıt: her blok 4 harf (3 harf hücre numarası, 36 tabanında + 1 harf blok türü; bkz. economy.ts BLOCKS).
 */
import * as THREE from 'three';
import { canvasTexture, mesh, outline, toon, toonGradient } from '../play3d/kit';
import { blockByCh, blockById, BLOCKS, type BlockDef } from './economy';

export const CELL = 1.5;
export const NX = 20, NZ = 20, NY = 12;
/** Bir kayıtta en çok kaç blok. */
export const MAX_BLOCKS = 2500;

export type Cell = [number, number, number];
const idx = (x: number, y: number, z: number) => x + z * NX + y * NX * NZ;
const cellOf = (i: number): Cell => [i % NX, Math.floor(i / (NX * NZ)), Math.floor(i / NX) % NZ];
const inBounds = (x: number, y: number, z: number) => x >= 0 && x < NX && z >= 0 && z < NZ && y >= 0 && y < NY;

export function encode(blocks: Map<number, BlockDef>) {
  let out = '';
  for (const [i, b] of blocks) out += i.toString(36).padStart(3, '0') + b.ch;
  return out;
}
export function decode(s: string): Map<number, BlockDef> {
  const m = new Map<number, BlockDef>();
  for (let k = 0; k + 4 <= s.length && m.size < MAX_BLOCKS; k += 4) {
    const i = parseInt(s.slice(k, k + 3), 36);
    const b = blockByCh(s[k + 3]);
    if (b && Number.isFinite(i) && i >= 0 && i < NX * NY * NZ) m.set(i, b);
  }
  return m;
}

/** Hazır yapıların blokları: [x, y, z, blok]. (0,0) köşesinden; alanın ortasına yerleştirilir. */
export function blueprint(id: string): [number, number, number, string][] {
  const out: [number, number, number, string][] = [];
  const put = (x: number, y: number, z: number, b: string) => out.push([x, y, z, b]);
  if (id === 'ev') {
    for (let y = 0; y < 3; y++) for (let x = 0; x < 6; x++) for (let z = 0; z < 5; z++) {
      const edge = x === 0 || x === 5 || z === 0 || z === 4;
      if (!edge) continue;
      if (z === 4 && x === 2 && y < 2) { if (y === 0) put(x, y, z, 'kapi'); continue; }
      if (y === 1 && ((z === 4 && x === 4) || (x === 0 && z === 2) || (x === 5 && z === 2))) { put(x, y, z, 'cam'); continue; }
      put(x, y, z, x === 0 || x === 5 ? 'kutuk' : 'ahsap');
    }
    // çatı: kenarlardan ortaya yükselir; ön ve arka duvarda üçgen alın
    const rh = (x: number) => 3 + Math.min(x + 1, 6 - x, 2);
    for (let x = -1; x < 7; x++) for (let z = -1; z < 6; z++) put(x, rh(x), z, 'cati');
    for (let x = 0; x < 6; x++) for (let z = 0; z < 5; z++) {
      if (!(x === 0 || x === 5 || z === 0 || z === 4)) continue;
      for (let y = 3; y < rh(x); y++) put(x, y, z, 'ahsap');
    }
    put(-1, 0, 6, 'cicek');
    put(6, 0, 6, 'cicek');
  } else if (id === 'kule') {
    for (let y = 0; y < 7; y++) for (let x = 0; x < 3; x++) for (let z = 0; z < 3; z++) {
      const edge = x !== 1 || z !== 1;
      if (y < 6 && !edge) continue;
      if (y === 0 && x === 1 && z === 2) { put(x, y, z, 'kapi'); continue; }
      if (y === 1 && x === 1 && z === 2) continue;
      put(x, y, z, y === 6 ? 'tas' : y % 3 === 2 && x === 1 ? 'cam' : 'tastugla');
    }
    for (const [x, z] of [[0, 0], [2, 0], [0, 2], [2, 2]]) put(x, 7, z, 'tastugla');
  } else if (id === 'kopru') {
    const cols = ['kirmizi', 'turuncu', 'sari', 'yesil', 'mavi', 'mor'];
    for (let x = 0; x < 12; x++) {
      const y = Math.round(3 * Math.sin((x / 11) * Math.PI));
      for (let z = 0; z < 3; z++) put(x, y, z, cols[Math.floor((x / 12) * cols.length)]);
    }
  } else if (id === 'havuz') {
    for (let x = 0; x < 8; x++) for (let z = 0; z < 8; z++) {
      const edge = x === 0 || x === 7 || z === 0 || z === 7;
      put(x, 0, z, edge ? 'tas' : 'buz');
      if (edge && (x + z) % 3 === 0) put(x, 1, z, 'cicek');
    }
    put(-2, 0, 3, 'fidan');
    put(9, 0, 3, 'fidan');
    put(3, 0, -2, 'bank');
  }
  return out;
}

/** Blokların ince çizgili dokusu (renk her bloğa ayrı verilir). */
let blockTex: THREE.Texture | null = null;
function texture() {
  if (blockTex) return blockTex;
  blockTex = canvasTexture(64, 64, (c) => {
    c.fillStyle = '#ffffff';
    c.fillRect(0, 0, 64, 64);
    for (let i = 0; i < 90; i++) {
      c.fillStyle = `rgba(0,0,0,${0.03 + Math.random() * 0.05})`;
      c.fillRect(Math.floor(Math.random() * 16) * 4, Math.floor(Math.random() * 16) * 4, 4, 4);
    }
    c.strokeStyle = 'rgba(58,43,39,0.45)';
    c.lineWidth = 4;
    c.strokeRect(2, 2, 60, 60);
  });
  blockTex.magFilter = THREE.NearestFilter;
  return blockTex;
}

// ------------------------------------------------------------------------------------------------
// Eşya modelleri (bir hücreye sığar; yüksekliği h hücre)
// ------------------------------------------------------------------------------------------------
function model(b: BlockDef, rotY: number, link: { x: boolean; z: boolean }): THREE.Object3D {
  const g = new THREE.Group();
  const S = CELL;
  const add = (o: THREE.Object3D, x: number, y: number, z: number) => { o.position.set(x, y, z); g.add(o); return o; };
  switch (b.id) {
    case 'kapi': {
      add(outline(mesh(new THREE.BoxGeometry(S, 2 * S - 0.1, 0.18), toon(b.color)), 1.04), 0, S - 0.05, 0);
      for (const y of [0.6, 1.5, 2.4]) add(mesh(new THREE.BoxGeometry(S * 0.8, 0.08, 0.2), toon('#8a5a35'), false), 0, y, 0);
      add(mesh(new THREE.SphereGeometry(0.1, 8, 6), toon('#ffc83d')), S * 0.32, 1.45, 0.14);
      break;
    }
    case 'cicek': {
      const cols = ['#ff6b8a', '#ffd43b', '#9775fa', '#4dabf7'];
      for (let i = 0; i < 4; i++) {
        const x = (i % 2 ? 0.3 : -0.3), z = (i < 2 ? 0.3 : -0.3);
        add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 4), toon('#4caf50'), false), x, 0.35, z);
        add(mesh(new THREE.SphereGeometry(0.18, 8, 6), toon(cols[i])), x, 0.75, z);
      }
      break;
    }
    case 'fidan': {
      add(mesh(new THREE.CylinderGeometry(0.2, 0.26, 1.6, 7), toon('#8a5a35')), 0, 0.8, 0);
      add(outline(mesh(new THREE.IcosahedronGeometry(1.0, 1), toon('#5cc36b')), 1.04), 0, 2.2, 0);
      break;
    }
    case 'cit': {
      add(mesh(new THREE.BoxGeometry(0.22, 1.2, 0.22), toon(b.color)), 0, 0.6, 0);
      for (const y of [0.45, 0.95]) {
        if (link.x) add(mesh(new THREE.BoxGeometry(S, 0.12, 0.1), toon(b.color), false), 0, y, 0);
        if (link.z) add(mesh(new THREE.BoxGeometry(0.1, 0.12, S), toon(b.color), false), 0, y, 0);
        if (!link.x && !link.z) add(mesh(new THREE.BoxGeometry(S * 0.8, 0.12, 0.1), toon(b.color), false), 0, y, 0);
      }
      break;
    }
    case 'bank': {
      add(outline(mesh(new THREE.BoxGeometry(S * 0.95, 0.12, 0.6), toon(b.color)), 1.04), 0, 0.55, 0.05);
      add(mesh(new THREE.BoxGeometry(S * 0.95, 0.5, 0.1), toon(b.color)), 0, 0.9, -0.3);
      for (const x of [-0.55, 0.55]) add(mesh(new THREE.BoxGeometry(0.1, 0.55, 0.5), toon('#5b5f6b')), x, 0.27, 0.05);
      break;
    }
    case 'fener': {
      add(mesh(new THREE.CylinderGeometry(0.1, 0.14, 2.6, 8), toon(b.color)), 0, 1.3, 0);
      add(mesh(new THREE.SphereGeometry(0.34, 12, 10), toon('#fff6c9', { emissive: '#aa8800' })), 0, 2.8, 0);
      break;
    }
    case 'masa': {
      add(outline(mesh(new THREE.BoxGeometry(S * 0.95, 0.14, S * 0.95), toon(b.color)), 1.03), 0, 0.85, 0);
      for (const [x, z] of [[-0.55, -0.55], [0.55, -0.55], [-0.55, 0.55], [0.55, 0.55]]) add(mesh(new THREE.BoxGeometry(0.12, 0.8, 0.12), toon('#8a5a35')), x, 0.4, z);
      break;
    }
    case 'sandalye': {
      add(outline(mesh(new THREE.BoxGeometry(0.8, 0.1, 0.8), toon(b.color)), 1.04), 0, 0.5, 0);
      add(mesh(new THREE.BoxGeometry(0.8, 0.8, 0.1), toon(b.color)), 0, 0.9, -0.35);
      for (const [x, z] of [[-0.33, -0.33], [0.33, -0.33], [-0.33, 0.33], [0.33, 0.33]]) add(mesh(new THREE.BoxGeometry(0.08, 0.5, 0.08), toon('#8a5a35')), x, 0.25, z);
      break;
    }
    case 'yatak': {
      add(outline(mesh(new THREE.BoxGeometry(S * 0.95, 0.45, S * 0.95), toon('#ffffff')), 1.03), 0, 0.35, 0);
      add(mesh(new THREE.BoxGeometry(S * 0.96, 0.12, S * 0.6), toon(b.color)), 0, 0.62, 0.2);
      add(mesh(new THREE.BoxGeometry(S * 0.6, 0.18, 0.4), toon('#fff1c7')), 0, 0.66, -0.45);
      break;
    }
    case 'kitaplik': {
      add(outline(mesh(new THREE.BoxGeometry(S * 0.95, 2 * S - 0.1, 0.6), toon(b.color)), 1.03), 0, S - 0.05, -0.4);
      const cols = ['#ef4b4b', '#4dabf7', '#ffd43b', '#69db7c', '#9775fa'];
      for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) add(mesh(new THREE.BoxGeometry(0.16, 0.55, 0.4), toon(cols[(r + i) % cols.length]), false), -0.5 + i * 0.2, 0.5 + r * 0.9, -0.15);
      break;
    }
    case 'kardanadam': {
      add(outline(mesh(new THREE.SphereGeometry(0.7, 14, 12), toon('#ffffff')), 1.04), 0, 0.7, 0);
      add(outline(mesh(new THREE.SphereGeometry(0.5, 14, 12), toon('#ffffff')), 1.04), 0, 1.75, 0);
      add(outline(mesh(new THREE.SphereGeometry(0.36, 14, 12), toon('#ffffff')), 1.04), 0, 2.5, 0);
      const nose = add(mesh(new THREE.ConeGeometry(0.08, 0.4, 8), toon('#ff8a3d')), 0, 2.5, 0.48);
      nose.rotation.x = Math.PI / 2;
      for (const x of [-0.12, 0.12]) add(mesh(new THREE.SphereGeometry(0.05, 6, 6), toon('#3a2b27')), x, 2.62, 0.32);
      break;
    }
    default:
      add(mesh(new THREE.BoxGeometry(S, S, S), toon(b.color)), 0, S / 2, 0);
  }
  g.rotation.y = rotY;
  return g;
}

export interface BuildHit { place?: Cell; remove?: Cell }

/**
 * Arsadaki inşa alanı. `x0, z0`: ızgaranın köşesi, `y0`: zemin yüksekliği.
 */
export class BuildArea {
  readonly group = new THREE.Group();
  blocks = new Map<number, BlockDef>();
  /** Hücre → bloğun kök hücresi (çok katlı eşyalar için). */
  private occ = new Map<number, number>();
  private meshes: THREE.Object3D[] = [];
  private pickables: THREE.Object3D[] = [];
  private gridFloor: THREE.Mesh;
  private ghost: THREE.Mesh;

  constructor(private scene: THREE.Scene, readonly x0: number, readonly z0: number, readonly y0: number) {
    scene.add(this.group);
    // inşa modunda görünen ızgara zemin (her zaman dokunulabilir)
    const tex = canvasTexture(64, 64, (c) => {
      c.fillStyle = 'rgba(255,255,255,0.0)';
      c.clearRect(0, 0, 64, 64);
      c.strokeStyle = 'rgba(255,255,255,0.75)';
      c.lineWidth = 3;
      c.strokeRect(1, 1, 62, 62);
    }, [NX, NZ]);
    this.gridFloor = new THREE.Mesh(new THREE.PlaneGeometry(NX * CELL, NZ * CELL), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    this.gridFloor.rotation.x = -Math.PI / 2;
    this.gridFloor.position.set(x0 + (NX * CELL) / 2, y0 + 0.04, z0 + (NZ * CELL) / 2);
    this.gridFloor.visible = false;
    scene.add(this.gridFloor);
    this.ghost = new THREE.Mesh(new THREE.BoxGeometry(CELL * 1.02, CELL * 1.02, CELL * 1.02), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.35, depthWrite: false }));
    this.ghost.visible = false;
    scene.add(this.ghost);
  }

  get center(): [number, number] {
    return [this.x0 + (NX * CELL) / 2, this.z0 + (NZ * CELL) / 2];
  }
  inside(x: number, z: number, pad = 0) {
    return x >= this.x0 - pad && x < this.x0 + NX * CELL + pad && z >= this.z0 - pad && z < this.z0 + NZ * CELL + pad;
  }
  setEditing(on: boolean) {
    this.gridFloor.visible = on;
    if (!on) this.ghost.visible = false;
  }

  load(s: string) {
    this.blocks = decode(s);
    this.reindex();
    this.rebuild();
  }
  save() {
    return encode(this.blocks);
  }
  private reindex() {
    this.occ.clear();
    for (const [i, b] of this.blocks) {
      const [x, y, z] = cellOf(i);
      for (let k = 0; k < (b.h ?? 1); k++) if (inBounds(x, y + k, z)) this.occ.set(idx(x, y + k, z), i);
    }
  }
  blockAt(x: number, y: number, z: number): BlockDef | undefined {
    if (!inBounds(x, y, z)) return undefined;
    const r = this.occ.get(idx(x, y, z));
    return r === undefined ? undefined : this.blocks.get(r);
  }
  private solidAt(x: number, y: number, z: number) {
    return !!this.blockAt(x, y, z)?.solid;
  }

  /** Bir blok koyar; olmazsa neden. `body`: kahramanın kapladığı hücreler (içine blok konmaz). */
  place(c: Cell, id: string, body: (c: Cell) => boolean = () => false): string | null {
    const b = blockById(id);
    if (!b) return 'yok';
    if (this.blocks.size >= MAX_BLOCKS) return 'Arsan doldu! Bazı blokları kaldır.';
    const [x, y, z] = c;
    for (let k = 0; k < (b.h ?? 1); k++) {
      if (!inBounds(x, y + k, z)) return y + k >= NY ? 'Bu kadar yükseğe yapılamaz.' : 'Arsanın dışına yapılamaz.';
      if (this.occ.has(idx(x, y + k, z))) return 'Orası dolu.';
      if (b.solid && body([x, y + k, z])) return 'Kendi üstüne blok koyamazsın, biraz kenara çekil.';
    }
    this.blocks.set(idx(x, y, z), b);
    this.reindex();
    this.rebuild();
    return null;
  }
  remove(c: Cell): BlockDef | null {
    const r = this.occ.get(idx(...c));
    if (r === undefined) return null;
    const b = this.blocks.get(r)!;
    this.blocks.delete(r);
    this.reindex();
    this.rebuild();
    return b;
  }
  /** Hazır yapıyı boş bir yere kurar; kurulan blok sayısı (yer yoksa 0). */
  placeBlueprint(id: string, near: [number, number], body: (c: Cell) => boolean): number {
    const parts = blueprint(id);
    if (!parts.length) return 0;
    const minX = Math.min(...parts.map((p) => p[0])), maxX = Math.max(...parts.map((p) => p[0]));
    const minZ = Math.min(...parts.map((p) => p[2])), maxZ = Math.max(...parts.map((p) => p[2]));
    const [nx, nz] = this.toCell(...near);
    const fits = (ox: number, oz: number) => parts.every(([x, y, z, b]) => {
      const def = blockById(b)!;
      for (let k = 0; k < (def.h ?? 1); k++) {
        const c: Cell = [ox + x, y + k, oz + z];
        if (!inBounds(...c) || this.occ.has(idx(...c)) || body(c)) return false;
      }
      return true;
    });
    // yakından uzağa boş yer ara
    const cands: [number, number, number][] = [];
    for (let ox = -minX; ox + maxX < NX; ox++) for (let oz = -minZ; oz + maxZ < NZ; oz++) cands.push([ox, oz, Math.hypot(ox + (maxX + minX) / 2 - nx, oz + (maxZ + minZ) / 2 - nz)]);
    cands.sort((a, b) => a[2] - b[2]);
    const at = cands.find(([ox, oz]) => fits(ox, oz));
    if (!at) return 0;
    for (const [x, y, z, b] of parts) this.blocks.set(idx(at[0] + x, y, at[1] + z), blockById(b)!);
    this.reindex();
    this.rebuild();
    return parts.length;
  }

  toCell(x: number, z: number): [number, number] {
    return [Math.floor((x - this.x0) / CELL), Math.floor((z - this.z0) / CELL)];
  }

  // ----------------------------------------------------------------------------------------------
  // Yürüme: zemin ve duvarlar
  // ----------------------------------------------------------------------------------------------
  /** (x,z)'de, y yüksekliğindeki kahramanın basabileceği en yüksek blok üstü (yoksa null). */
  standY(x: number, z: number, y: number): number | null {
    if (!this.inside(x, z)) return null;
    const [cx, cz] = this.toCell(x, z);
    let best: number | null = null;
    for (let l = 0; l < NY; l++) {
      if (!this.solidAt(cx, l, cz)) continue;
      const top = this.y0 + (l + 1) * CELL;
      if (top <= y + 0.35) best = top;
    }
    return best;
  }
  /** Kahramanın gövdesi (y'den 3.1 birim yukarı, 0.45 yarıçap) bir bloğa çarpıyor mu? */
  blocked(x: number, z: number, y: number) {
    if (!this.inside(x, z, 0.5)) return false;
    const lo = Math.floor((y + 0.36 - this.y0) / CELL), hi = Math.floor((y + 3.1 - this.y0) / CELL);
    for (const [dx, dz] of [[0, 0], [0.45, 0], [-0.45, 0], [0, 0.45], [0, -0.45]]) {
      const [cx, cz] = this.toCell(x + dx, z + dz);
      for (let l = Math.max(0, lo); l <= Math.min(NY - 1, hi); l++) if (this.solidAt(cx, l, cz)) return true;
    }
    return false;
  }
  /** Kahramanın kapladığı hücreler (blok konmasın). */
  bodyCells(x: number, z: number, y: number) {
    const set = new Set<number>();
    const lo = Math.floor((y - this.y0) / CELL), hi = Math.floor((y + 3 - this.y0) / CELL);
    for (const [dx, dz] of [[0.4, 0.4], [-0.4, 0.4], [0.4, -0.4], [-0.4, -0.4]]) {
      const [cx, cz] = this.toCell(x + dx, z + dz);
      for (let l = Math.max(0, lo); l <= hi; l++) if (inBounds(cx, l, cz)) set.add(idx(cx, l, cz));
    }
    return (c: Cell) => set.has(idx(...c));
  }

  // ----------------------------------------------------------------------------------------------
  // Dokunma: hangi hücreye konur / hangisi kaldırılır
  // ----------------------------------------------------------------------------------------------
  hit(ray: THREE.Raycaster): BuildHit | null {
    const hits = ray.intersectObjects([...this.pickables, this.gridFloor], true);
    for (const h of hits) {
      let o: THREE.Object3D | null = h.object;
      if (o === this.gridFloor) {
        const [cx, cz] = this.toCell(h.point.x, h.point.z);
        if (!inBounds(cx, 0, cz)) return null;
        return { place: [cx, 0, cz] };
      }
      let cell: number | undefined;
      if ((o as THREE.InstancedMesh).isInstancedMesh && h.instanceId !== undefined) cell = (o.userData.cells as number[])[h.instanceId];
      else while (o && cell === undefined) { cell = o.userData.cell as number | undefined; o = o.parent; }
      if (cell === undefined) continue;
      const c = cellOf(cell);
      const n = h.face?.normal.clone().transformDirection(h.object.matrixWorld) ?? new THREE.Vector3(0, 1, 0);
      const b = this.blocks.get(cell);
      // modellerde (kapı, çiçek…) hep üstüne / yanına: en büyük eksen
      const ax = Math.abs(n.x) > Math.abs(n.y) && Math.abs(n.x) > Math.abs(n.z) ? [Math.sign(n.x), 0, 0] : Math.abs(n.z) > Math.abs(n.y) ? [0, 0, Math.sign(n.z)] : [0, Math.sign(n.y) || 1, 0];
      const up = ax[1] > 0 ? (b?.h ?? 1) : 1;
      return { remove: c, place: [c[0] + ax[0], c[1] + (ax[1] > 0 ? up : ax[1]), c[2] + ax[2]] };
    }
    return null;
  }
  /** Koyulacak hücrede kısa bir parıltı kutusu. */
  flash(c: Cell, color = '#ffffff') {
    this.ghost.position.set(this.x0 + (c[0] + 0.5) * CELL, this.y0 + (c[1] + 0.5) * CELL, this.z0 + (c[2] + 0.5) * CELL);
    (this.ghost.material as THREE.MeshBasicMaterial).color.set(color);
    this.ghost.visible = true;
    clearTimeout(this.ghostT);
    this.ghostT = setTimeout(() => (this.ghost.visible = false), 220);
  }
  private ghostT: ReturnType<typeof setTimeout> | undefined;
  cellCenter(c: Cell) {
    return new THREE.Vector3(this.x0 + (c[0] + 0.5) * CELL, this.y0 + (c[1] + 0.5) * CELL, this.z0 + (c[2] + 0.5) * CELL);
  }

  // ----------------------------------------------------------------------------------------------
  // Çizim
  // ----------------------------------------------------------------------------------------------
  private rebuild() {
    for (const m of this.meshes) {
      this.group.remove(m);
      m.traverse((o) => {
        const mm = o as THREE.Mesh;
        if ((mm as THREE.InstancedMesh).isInstancedMesh) {
          mm.geometry.dispose();
          for (const m of new Set(([] as THREE.Material[]).concat(mm.material))) m.dispose();
          (mm as THREE.InstancedMesh).dispose();
        }
      });
    }
    this.meshes = [];
    this.pickables = [];
    const groups = new Map<string, number[]>();
    for (const [i, b] of this.blocks) {
      if (b.kind === 'model') continue;
      const key = b.kind === 'cube' && !b.top ? 'cube' : `${b.kind}:${b.id}`;
      const a = groups.get(key);
      if (a) a.push(i);
      else groups.set(key, [i]);
    }
    const geo = new THREE.BoxGeometry(CELL, CELL, CELL);
    const m4 = new THREE.Matrix4();
    const col = new THREE.Color();
    for (const [key, cells] of groups) {
      const first = this.blocks.get(cells[0])!;
      let mat: THREE.Material | THREE.Material[];
      if (key === 'cube') mat = new THREE.MeshToonMaterial({ map: texture(), gradientMap: toonGradient() });
      else if (first.kind === 'glass') mat = new THREE.MeshToonMaterial({ color: first.color, gradientMap: toonGradient(), transparent: true, opacity: 0.5, depthWrite: false });
      else if (first.kind === 'light') mat = new THREE.MeshToonMaterial({ map: texture(), color: first.color, emissive: new THREE.Color(first.color).multiplyScalar(0.55), gradientMap: toonGradient() });
      else {
        const side = new THREE.MeshToonMaterial({ map: texture(), color: first.color, gradientMap: toonGradient() });
        const top = new THREE.MeshToonMaterial({ map: texture(), color: first.top, gradientMap: toonGradient() });
        mat = [side, side, top, side, side, side];
      }
      const im = new THREE.InstancedMesh(key === 'cube' ? geo : geo.clone(), mat, cells.length);
      im.castShadow = first.kind !== 'glass';
      im.receiveShadow = true;
      cells.forEach((ci, k) => {
        const [x, y, z] = cellOf(ci);
        m4.makeTranslation(this.x0 + (x + 0.5) * CELL, this.y0 + (y + 0.5) * CELL, this.z0 + (z + 0.5) * CELL);
        im.setMatrixAt(k, m4);
        if (key === 'cube') im.setColorAt(k, col.set(this.blocks.get(ci)!.color));
      });
      im.userData.cells = cells;
      im.computeBoundingSphere();
      this.group.add(im);
      this.meshes.push(im);
      this.pickables.push(im);
    }
    for (const [i, b] of this.blocks) {
      if (b.kind !== 'model') continue;
      const [x, y, z] = cellOf(i);
      const isLink = (dx: number, dz: number) => {
        const n = this.blockAt(x + dx, y, z + dz);
        return !!n && (n.id === b.id || n.kind !== 'model');
      };
      const link = { x: isLink(1, 0) || isLink(-1, 0), z: isLink(0, 1) || isLink(0, -1) };
      // kapı duvara göre döner; diğerleri arsanın ortasına bakar
      const rot = b.id === 'kapi' || b.id === 'cit' ? (link.z && !link.x && b.id === 'kapi' ? Math.PI / 2 : 0) : 0;
      const o = model(b, rot, link);
      o.position.set(this.x0 + (x + 0.5) * CELL, this.y0 + y * CELL, this.z0 + (z + 0.5) * CELL);
      o.userData.cell = i;
      this.group.add(o);
      this.meshes.push(o);
      this.pickables.push(o);
    }
  }

  dispose() {
    clearTimeout(this.ghostT);
    this.scene.remove(this.group, this.gridFloor, this.ghost);
  }
}

/** Palet sırası: paketlere göre. */
export const paletteFor = (packs: string[]) => BLOCKS.filter((b) => packs.includes(b.pack));
