/**
 * İnşa (Minecraft gibi): adanın her yerine blok konur. Izgara bütün adayı kaplar (1 hücre = 1,5 birim); her sütun
 * bulunduğu yerin zemininden yükselir, böylece yokuşlarda da bloklar yere oturur. Bloklar tek çizimde (InstancedMesh)
 * çizilir; kapı, çiçek, ağaç gibi eşyalar küçük modellerdir. Kahraman blokların üstüne zıplayarak çıkar.
 *
 * Kayıt: "w|" + her blok 6 harf (5 harf hücre numarası, 36 tabanında + 1 harf blok türü; bkz. economy.ts BLOCKS).
 * Eski kayıtlar (yalnızca Çiftliğim arsası, "w|" yok) yüklenirken adaya taşınır.
 */
import * as THREE from 'three';
import { canvasTexture, mesh, outline, toon, toonGradient } from '../play3d/kit';
import { blockByCh, blockById, BLOCKS, type BlockDef } from './economy';
import { HOME } from './layout';

export const CELL = 1.5;
/** Kahramanın çarpışma gövdesi: yarıçap ve boy (boy iki bloktan kısa olmalı: kapıdan geçsin). */
export const BODY_R = 0.45;
export const BODY_H = 2 * 1.5 - 0.15;
/** Kapı bu kadar yaklaşınca açılır. */
const DOOR_NEAR = 2.3;
/** Bir sütunda en çok kaç blok. */
export const NY = 24;
/** Adada en çok kaç blok. */
export const MAX_BLOCKS = 4000;
const OFF = 256, SPAN = 512;

/** Hücre: [x sütunu, sütun içi kat, z sütunu]. */
export type Cell = [number, number, number];
const key = (x: number, y: number, z: number) => ((x + OFF) * SPAN + (z + OFF)) * NY + y;
const cellOf = (k: number): Cell => [Math.floor(k / NY / SPAN) - OFF, k % NY, (Math.floor(k / NY) % SPAN) - OFF];
const colKey = (x: number, z: number) => (x + OFF) * SPAN + (z + OFF);
const okCell = (x: number, y: number, z: number) => Math.abs(x) < OFF && Math.abs(z) < OFF && y >= 0 && y < NY;

/** Eski arsa kaydı (20×20, Çiftliğim'in sağında) → ada hücreleri. */
function decodeLegacy(s: string): Map<number, BlockDef> {
  const m = new Map<number, BlockDef>();
  const x0 = HOME.x + 2, z0 = HOME.z - 15;
  for (let k = 0; k + 4 <= s.length; k += 4) {
    const i = parseInt(s.slice(k, k + 3), 36);
    const b = blockByCh(s[k + 3]);
    if (!b || !Number.isFinite(i)) continue;
    const lx = i % 20, ly = Math.floor(i / 400), lz = Math.floor(i / 20) % 20;
    const cx = Math.floor((x0 + (lx + 0.5) * CELL) / CELL), cz = Math.floor((z0 + (lz + 0.5) * CELL) / CELL);
    if (okCell(cx, ly, cz)) m.set(key(cx, ly, cz), b);
  }
  return m;
}
export function encode(blocks: Map<number, BlockDef>) {
  let out = 'w|';
  for (const [k, b] of blocks) out += k.toString(36).padStart(5, '0') + b.ch;
  return out;
}
export function decode(s: string): Map<number, BlockDef> {
  if (!s) return new Map();
  if (!s.startsWith('w|')) return decodeLegacy(s);
  const m = new Map<number, BlockDef>();
  for (let k = 2; k + 6 <= s.length && m.size < MAX_BLOCKS; k += 6) {
    const i = parseInt(s.slice(k, k + 5), 36);
    const b = blockByCh(s[k + 5]);
    if (b && Number.isFinite(i) && i >= 0) {
      const [x, y, z] = cellOf(i);
      if (okCell(x, y, z)) m.set(i, b);
    }
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
      // kasa (yan direkler ve üst kiriş): boşluğu çerçeveler, geçişi kapatmaz
      const DH = 2 * S;
      for (const sx of [-1, 1]) add(mesh(new THREE.BoxGeometry(0.16, DH, 0.3), toon('#8a5a35')), sx * (S / 2 - 0.08), DH / 2, 0);
      add(mesh(new THREE.BoxGeometry(S, 0.18, 0.3), toon('#8a5a35')), 0, DH - 0.09, 0);
      // kanat: menteşesi solda, yaklaşınca açılır (WorldBlocks.stepDoors)
      const leaf = new THREE.Group();
      leaf.name = 'leaf';
      const w = S - 0.24, h = DH - 0.24;
      const panel = outline(mesh(new THREE.BoxGeometry(w, h, 0.14), toon(b.color)), 1.03);
      panel.position.set(w / 2, h / 2, 0);
      leaf.add(panel);
      for (const y of [0.55, 1.45, 2.35]) {
        const r = mesh(new THREE.BoxGeometry(w * 0.74, 0.08, 0.18), toon('#8a5a35'), false);
        r.position.set(w / 2, y, 0);
        leaf.add(r);
      }
      const knob = mesh(new THREE.SphereGeometry(0.1, 8, 6), toon('#ffc83d'));
      knob.position.set(w - 0.16, 1.45, 0.13);
      leaf.add(knob);
      add(leaf, -w / 2, 0.12, 0);
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
 * Adanın blokları. `ground(x,z)`: zemin yüksekliği; `canBuild(x,z)`: oraya yapı yapılabilir mi (yoksa nedeni).
 */
export class WorldBlocks {
  readonly group = new THREE.Group();
  blocks = new Map<number, BlockDef>();
  /** Hücre → bloğun kök hücresi (çok katlı eşyalar için). */
  private occ = new Map<number, number>();
  /** Sütun → dolu (geçilemez) katlar: çarpışma için hızlı arama. */
  private cols = new Map<number, Set<number>>();
  private bases = new Map<number, number>();
  private meshes: THREE.Object3D[] = [];
  private pickables: THREE.Object3D[] = [];
  private ghost: THREE.Mesh;
  private ghostT: ReturnType<typeof setTimeout> | undefined;
  /** Açılır kapılar (stepDoors). */
  private doors: { leaf: THREE.Object3D; x: number; z: number; at: number; goal: number }[] = [];
  /** Bir kapı açılırken çalınacak ses (ada bağlar). */
  onDoor?: (x: number, z: number) => void;

  constructor(private scene: THREE.Scene, private ground: (x: number, z: number) => number, private canBuild: (x: number, z: number) => string | null) {
    scene.add(this.group);
    this.ghost = new THREE.Mesh(new THREE.BoxGeometry(CELL * 1.02, CELL * 1.02, CELL * 1.02), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.35, depthWrite: false }));
    this.ghost.visible = false;
    scene.add(this.ghost);
  }

  /** Sütunun zemini (sabit: arazi değişmez). */
  base(cx: number, cz: number) {
    const k = colKey(cx, cz);
    let b = this.bases.get(k);
    if (b === undefined) {
      b = Math.round(this.ground((cx + 0.5) * CELL, (cz + 0.5) * CELL) * 10) / 10;
      this.bases.set(k, b);
    }
    return b;
  }
  toCell(x: number, z: number): [number, number] {
    return [Math.floor(x / CELL), Math.floor(z / CELL)];
  }
  cellCenter(c: Cell) {
    return new THREE.Vector3((c[0] + 0.5) * CELL, this.base(c[0], c[2]) + (c[1] + 0.5) * CELL, (c[2] + 0.5) * CELL);
  }
  /** Bu noktanın yakınında blok var mı (yapı yerleştirirken). */
  near(x: number, z: number, r: number) {
    const [a, b] = this.toCell(x - r, z - r), [c, d] = this.toCell(x + r, z + r);
    for (let i = a; i <= c; i++) for (let j = b; j <= d; j++) if (this.hasAny(i, j)) return true;
    return false;
  }
  setEditing(on: boolean) {
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
    this.cols.clear();
    for (const [k, b] of this.blocks) {
      const [x, y, z] = cellOf(k);
      for (let i = 0; i < (b.h ?? 1); i++) {
        if (!okCell(x, y + i, z)) continue;
        this.occ.set(key(x, y + i, z), k);
        const ck = colKey(x, z);
        const set = this.cols.get(ck) ?? new Set<number>();
        if (b.solid) set.add(y + i);
        this.cols.set(ck, set);
      }
    }
  }
  blockAt(x: number, y: number, z: number): BlockDef | undefined {
    const r = this.occ.get(key(x, y, z));
    return r === undefined ? undefined : this.blocks.get(r);
  }
  private hasAny(x: number, z: number) {
    return this.cols.has(colKey(x, z));
  }

  /** Bir blok koyar; olmazsa neden. `body`: kahramanın kapladığı hücreler. */
  place(c: Cell, id: string, body: (c: Cell) => boolean = () => false): string | null {
    const b = blockById(id);
    if (!b) return 'yok';
    if (this.blocks.size >= MAX_BLOCKS) return 'Adanda çok blok var! Bazılarını kaldır.';
    const [x, y, z] = c;
    if (!this.hasAny(x, z)) {
      const err = this.canBuild((x + 0.5) * CELL, (z + 0.5) * CELL);
      if (err) return err;
    }
    for (let k = 0; k < (b.h ?? 1); k++) {
      if (!okCell(x, y + k, z)) return y + k >= NY ? 'Bu kadar yükseğe yapılamaz.' : 'Buraya yapılamaz.';
      if (this.occ.has(key(x, y + k, z))) return 'Orası dolu.';
      if (b.solid && body([x, y + k, z])) return 'Kendi üstüne blok koyamazsın, biraz kenara çekil.';
    }
    this.blocks.set(key(x, y, z), b);
    this.reindex();
    this.rebuild();
    return null;
  }
  remove(c: Cell): BlockDef | null {
    const r = this.occ.get(key(...c));
    if (r === undefined) return null;
    const b = this.blocks.get(r)!;
    this.blocks.delete(r);
    this.reindex();
    this.rebuild();
    return b;
  }

  /** Hazır yapıyı `near` noktasına yakın boş bir yere kurar; kurulan blok sayısı (yer yoksa 0). */
  placeBlueprint(parts: [number, number, number, string][], near: [number, number], body: (c: Cell) => boolean): number {
    if (!parts.length) return 0;
    const [nx, nz] = this.toCell(...near);
    const minX = Math.min(...parts.map((p) => p[0])), maxX = Math.max(...parts.map((p) => p[0]));
    const minZ = Math.min(...parts.map((p) => p[2])), maxZ = Math.max(...parts.map((p) => p[2]));
    const mx = Math.round((minX + maxX) / 2), mz = Math.round((minZ + maxZ) / 2);
    const tryAt = (ox: number, oz: number): Map<number, BlockDef> | null => {
      // yapı, ortasındaki sütunun zemininden yükselir
      const anchor = this.base(ox + mx, oz + mz);
      const out = new Map<number, BlockDef>();
      const checked = new Set<number>();
      for (const [x, y, z, id] of parts) {
        const def = blockById(id)!;
        const cx = ox + x, cz = oz + z;
        if (!checked.has(colKey(cx, cz))) {
          if (this.canBuild((cx + 0.5) * CELL, (cz + 0.5) * CELL)) return null;
          if (Math.abs(this.base(cx, cz) - anchor) > CELL * 1.5) return null;
          checked.add(colKey(cx, cz));
        }
        const yl = Math.max(0, Math.round((anchor + y * CELL - this.base(cx, cz)) / CELL));
        for (let k = 0; k < (def.h ?? 1); k++) {
          const c: Cell = [cx, yl + k, cz];
          if (!okCell(...c) || this.occ.has(key(...c)) || out.has(key(...c)) || body(c)) return null;
        }
        out.set(key(cx, yl, cz), def);
      }
      return out;
    };
    // yakından uzağa (halka halka) boş yer ara
    for (let r = 0; r < 14; r++) for (let dx = -r; dx <= r; dx++) for (let dz = -r; dz <= r; dz++) {
      if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue;
      const got = tryAt(nx + dx - mx, nz + dz - mz);
      if (!got) continue;
      if (this.blocks.size + got.size > MAX_BLOCKS) return 0;
      for (const [k, b] of got) this.blocks.set(k, b);
      this.reindex();
      this.rebuild();
      return got.size;
    }
    return 0;
  }

  // ----------------------------------------------------------------------------------------------
  // Yürüme: zemin ve duvarlar
  // ----------------------------------------------------------------------------------------------
  /** (x,z)'de, y yüksekliğindeki kahramanın basabileceği en yüksek blok üstü (yoksa null). */
  standY(x: number, z: number, y: number): number | null {
    const [cx, cz] = this.toCell(x, z);
    const set = this.cols.get(colKey(cx, cz));
    if (!set?.size) return null;
    const b = this.base(cx, cz);
    let best: number | null = null;
    for (const l of set) {
      const top = b + (l + 1) * CELL;
      if (top <= y + 0.35 && (best === null || top > best)) best = top;
    }
    return best;
  }
  /**
   * Kahramanın gövdesi (ayaktan BODY_H yukarı, BODY_R yarıçap) bir bloğa çarpıyor mu?
   * BODY_H iki bloktan (2 × CELL) kısadır: kapının iki bloklu boşluğundan geçilebilsin.
   */
  blocked(x: number, z: number, y: number) {
    for (const [dx, dz] of [[0, 0], [BODY_R, 0], [-BODY_R, 0], [0, BODY_R], [0, -BODY_R]]) {
      const [cx, cz] = this.toCell(x + dx, z + dz);
      const set = this.cols.get(colKey(cx, cz));
      if (!set?.size) continue;
      const b = this.base(cx, cz);
      const lo = Math.floor((y + 0.36 - b) / CELL), hi = Math.floor((y + BODY_H - b) / CELL);
      for (const l of set) if (l >= lo && l <= hi) return true;
    }
    return false;
  }

  /** Kapılar: kahraman yaklaşınca açılır, uzaklaşınca kapanır (gerçek bir kapı gibi). */
  stepDoors(x: number, z: number, dt: number) {
    for (const d of this.doors) {
      const open = Math.abs(x - d.x) < DOOR_NEAR && Math.abs(z - d.z) < DOOR_NEAR ? 1 : 0;
      if (open !== d.goal) {
        d.goal = open;
        if (open) this.onDoor?.(d.x, d.z);
      }
      if (Math.abs(d.at - d.goal) < 0.002) continue;
      d.at += (d.goal - d.at) * Math.min(1, dt * 7);
      d.leaf.rotation.y = -d.at * 1.9;
    }
  }
  /** Kahramanın kapladığı hücreler (blok konmasın). */
  bodyCells(x: number, z: number, y: number) {
    const set = new Set<number>();
    for (const [dx, dz] of [[0.4, 0.4], [-0.4, 0.4], [0.4, -0.4], [-0.4, -0.4]]) {
      const [cx, cz] = this.toCell(x + dx, z + dz);
      const b = this.base(cx, cz);
      const lo = Math.floor((y - b) / CELL), hi = Math.floor((y + 3 - b) / CELL);
      for (let l = Math.max(0, lo); l <= Math.min(NY - 1, hi); l++) set.add(key(cx, l, cz));
    }
    return (c: Cell) => set.has(key(...c));
  }

  // ----------------------------------------------------------------------------------------------
  // Dokunma: hangi hücreye konur / hangisi kaldırılır (`terrain`: dokunulabilir arazi)
  // ----------------------------------------------------------------------------------------------
  hit(ray: THREE.Raycaster, terrain: THREE.Object3D[]): BuildHit | null {
    const hits = ray.intersectObjects([...this.pickables, ...terrain], true);
    for (const h of hits) {
      if (terrain.includes(h.object)) {
        if (h.distance > 120) return null;
        const [cx, cz] = this.toCell(h.point.x, h.point.z);
        let y = 0;
        while (y < NY && this.occ.has(key(cx, y, cz))) y++;
        return { place: [cx, y, cz] };
      }
      let o: THREE.Object3D | null = h.object;
      let cell: number | undefined;
      if ((o as THREE.InstancedMesh).isInstancedMesh && h.instanceId !== undefined) cell = (o.userData.cells as number[])[h.instanceId];
      else while (o && cell === undefined) { cell = o.userData.cell as number | undefined; o = o.parent; }
      if (cell === undefined) continue;
      const c = cellOf(cell);
      const n = h.face?.normal.clone().transformDirection(h.object.matrixWorld) ?? new THREE.Vector3(0, 1, 0);
      const b = this.blocks.get(cell);
      const ax = Math.abs(n.x) > Math.abs(n.y) && Math.abs(n.x) > Math.abs(n.z) ? [Math.sign(n.x), 0, 0] : Math.abs(n.z) > Math.abs(n.y) ? [0, 0, Math.sign(n.z)] : [0, Math.sign(n.y) || 1, 0];
      if (ax[1] !== 0) return { remove: c, place: [c[0], c[1] + (ax[1] > 0 ? (b?.h ?? 1) : -1), c[2]] };
      // yana: komşu sütunun zeminine göre aynı yükseklik
      const wy = this.cellCenter(c).y;
      const nx = c[0] + ax[0], nz = c[2] + ax[2];
      const yl = Math.max(0, Math.round((wy - this.base(nx, nz) - CELL / 2) / CELL));
      return { remove: c, place: [nx, yl, nz] };
    }
    return null;
  }
  /** Koyulan hücrede kısa bir parıltı kutusu. */
  flash(c: Cell, color = '#ffffff') {
    this.ghost.position.copy(this.cellCenter(c));
    (this.ghost.material as THREE.MeshBasicMaterial).color.set(color);
    this.ghost.visible = true;
    clearTimeout(this.ghostT);
    this.ghostT = setTimeout(() => (this.ghost.visible = false), 220);
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
          for (const x of new Set(([] as THREE.Material[]).concat(mm.material))) x.dispose();
          (mm as THREE.InstancedMesh).dispose();
        }
      });
    }
    this.meshes = [];
    this.pickables = [];
    this.doors = [];
    const groups = new Map<string, number[]>();
    for (const [i, b] of this.blocks) {
      if (b.kind === 'model') continue;
      const k = b.kind === 'cube' && !b.top ? 'cube' : `${b.kind}:${b.id}`;
      const a = groups.get(k);
      if (a) a.push(i);
      else groups.set(k, [i]);
    }
    const geo = new THREE.BoxGeometry(CELL, CELL, CELL);
    const m4 = new THREE.Matrix4();
    const col = new THREE.Color();
    for (const [k, cells] of groups) {
      const first = this.blocks.get(cells[0])!;
      let mat: THREE.Material | THREE.Material[];
      if (k === 'cube') mat = new THREE.MeshToonMaterial({ map: texture(), gradientMap: toonGradient() });
      else if (first.kind === 'glass') mat = new THREE.MeshToonMaterial({ color: first.color, gradientMap: toonGradient(), transparent: true, opacity: 0.5, depthWrite: false });
      else if (first.kind === 'light') mat = new THREE.MeshToonMaterial({ map: texture(), color: first.color, emissive: new THREE.Color(first.color).multiplyScalar(0.55), gradientMap: toonGradient() });
      else {
        const side = new THREE.MeshToonMaterial({ map: texture(), color: first.color, gradientMap: toonGradient() });
        const top = new THREE.MeshToonMaterial({ map: texture(), color: first.top, gradientMap: toonGradient() });
        mat = [side, side, top, side, side, side];
      }
      const im = new THREE.InstancedMesh(k === 'cube' ? geo : geo.clone(), mat, cells.length);
      im.castShadow = first.kind !== 'glass';
      im.receiveShadow = true;
      cells.forEach((ci, n) => {
        m4.makeTranslation(this.cellCenter(cellOf(ci)));
        im.setMatrixAt(n, m4);
        if (k === 'cube') im.setColorAt(n, col.set(this.blocks.get(ci)!.color));
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
      const rot = b.id === 'kapi' ? (link.z && !link.x ? Math.PI / 2 : 0) : 0;
      const o = model(b, rot, link);
      const c = this.cellCenter([x, y, z]);
      o.position.set(c.x, c.y - CELL / 2, c.z);
      const leaf = b.id === 'kapi' ? o.getObjectByName('leaf') : null;
      if (leaf) this.doors.push({ leaf, x: c.x, z: c.z, at: 0, goal: 0 });
      o.userData.cell = i;
      this.group.add(o);
      this.meshes.push(o);
      this.pickables.push(o);
    }
  }

  dispose() {
    clearTimeout(this.ghostT);
    this.scene.remove(this.group, this.ghost);
  }
}

/** Palet sırası: paketlere göre. */
export const paletteFor = (packs: string[]) => BLOCKS.filter((b) => packs.includes(b.pack));
