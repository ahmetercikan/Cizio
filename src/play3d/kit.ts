/**
 * 3B oyunlar için ortak parçalar: çizgi film (toon) malzemeleri, basit ağaç/bulut/yıldız modelleri ve parıltı efekti.
 * Hepsi kodla, birkaç temel şekilden kurulur (model dosyası yok); düşük çokgen, ucuz telefonlarda akıcı.
 */
import * as THREE from 'three';

let gradient: THREE.DataTexture | null = null;
/** Üç tonlu ışık geçişi: çizgi film görünümü. */
function toonGradient() {
  if (gradient) return gradient;
  const data = new Uint8Array([90, 90, 90, 255, 175, 175, 175, 255, 255, 255, 255, 255]);
  gradient = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  gradient.minFilter = gradient.magFilter = THREE.NearestFilter;
  gradient.needsUpdate = true;
  return gradient;
}

const mats = new Map<string, THREE.MeshToonMaterial>();
export function toon(color: string | number, opts: { emissive?: string; transparent?: boolean; opacity?: number } = {}) {
  const key = `${color}|${opts.emissive ?? ''}|${opts.opacity ?? 1}`;
  let m = mats.get(key);
  if (!m) {
    m = new THREE.MeshToonMaterial({ color, gradientMap: toonGradient(), transparent: opts.transparent, opacity: opts.opacity ?? 1 });
    if (opts.emissive) m.emissive = new THREE.Color(opts.emissive);
    mats.set(key, m);
  }
  return m;
}

export function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, shadow = true) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = shadow;
  m.receiveShadow = true;
  return m;
}

/** Mürekkep kontur: modeli biraz büyütülmüş, ters yüzlü koyu bir kopyayla sarar. */
export function outline(obj: THREE.Mesh, scale = 1.06) {
  const o = new THREE.Mesh(obj.geometry, new THREE.MeshBasicMaterial({ color: 0x3a2b27, side: THREE.BackSide }));
  o.scale.setScalar(scale);
  obj.add(o);
  return obj;
}

// ------------------------------------------------------------------------------------------------
// Modeller
// ------------------------------------------------------------------------------------------------
export function tree(kind: 'round' | 'pine' | 'snow' = 'round', s = 1) {
  const g = new THREE.Group();
  const trunk = mesh(new THREE.CylinderGeometry(0.18 * s, 0.24 * s, 1.2 * s, 7), toon('#9b6b43'));
  trunk.position.y = 0.6 * s;
  g.add(trunk);
  if (kind === 'round') {
    const top = outline(mesh(new THREE.IcosahedronGeometry(0.95 * s, 1), toon('#5cc36b')), 1.04);
    top.position.y = 1.7 * s;
    g.add(top);
  } else {
    for (let i = 0; i < 3; i++) {
      const c = mesh(new THREE.ConeGeometry((1 - i * 0.25) * s, 1.1 * s, 8), toon(kind === 'snow' ? '#e9f6ff' : '#3fa45a'));
      c.position.y = (1.3 + i * 0.6) * s;
      g.add(c);
    }
  }
  return g;
}

export function cloud(s = 1, color = '#ffffff') {
  const g = new THREE.Group();
  const m = toon(color);
  [[0, 0, 0, 1], [0.9, -0.1, 0.1, 0.75], [-0.9, -0.15, 0, 0.7], [0.3, 0.45, -0.1, 0.7]].forEach(([x, y, z, r]) => {
    const b = mesh(new THREE.SphereGeometry(r * s, 12, 10), m, false);
    b.position.set(x * s, y * s, z * s);
    g.add(b);
  });
  return g;
}

let starGeo: THREE.ExtrudeGeometry | null = null;
export function star(color = '#ffc83d') {
  if (!starGeo) {
    const sh = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.22 : 0.5;
      const x = Math.cos(a) * r, y = Math.sin(a) * r;
      if (i) sh.lineTo(x, y);
      else sh.moveTo(x, y);
    }
    starGeo = new THREE.ExtrudeGeometry(sh, { depth: 0.14, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 1 });
    starGeo.center();
  }
  return outline(mesh(starGeo, toon(color, { emissive: '#5a3a00' })), 1.1);
}

export function heart() {
  const sh = new THREE.Shape();
  sh.moveTo(0, -0.45);
  sh.bezierCurveTo(-0.6, -0.05, -0.55, 0.45, 0, 0.25);
  sh.bezierCurveTo(0.55, 0.45, 0.6, -0.05, 0, -0.45);
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.16, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 1 });
  geo.center();
  return outline(mesh(geo, toon('#ff6b8a', { emissive: '#4a0a18' })), 1.1);
}

/** Boyalı tuvalden doku (yol çizgileri, pencereler…). */
export function canvasTexture(w: number, h: number, paint: (ctx: CanvasRenderingContext2D) => void, repeat?: [number, number]) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  paint(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(...repeat);
  }
  t.anisotropy = 4;
  return t;
}

/** Yıldız toplayınca çıkan parıltı: küçük ışık noktaları dağılır ve söner. */
export class Sparkles {
  private pool: { s: THREE.Sprite; v: THREE.Vector3; life: number }[] = [];
  private mat: THREE.SpriteMaterial;
  constructor(private scene: THREE.Scene) {
    const tex = canvasTexture(64, 64, (ctx) => {
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255,255,230,1)');
      g.addColorStop(0.35, 'rgba(255,214,90,0.9)');
      g.addColorStop(1, 'rgba(255,200,61,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 64, 64);
    });
    this.mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  }
  burst(at: THREE.Vector3, n = 10, color?: string) {
    for (let i = 0; i < n; i++) {
      let p = this.pool.find((x) => x.life <= 0);
      if (!p) {
        const s = new THREE.Sprite(this.mat.clone());
        this.scene.add(s);
        p = { s, v: new THREE.Vector3(), life: 0 };
        this.pool.push(p);
      }
      if (color) (p.s.material as THREE.SpriteMaterial).color.set(color);
      else (p.s.material as THREE.SpriteMaterial).color.set('#ffffff');
      p.s.position.copy(at);
      p.v.set((Math.random() - 0.5) * 6, Math.random() * 5 + 1, (Math.random() - 0.5) * 6);
      p.life = 0.6;
      p.s.visible = true;
    }
  }
  update(dt: number) {
    for (const p of this.pool) {
      if (p.life <= 0) continue;
      p.life -= dt;
      p.v.y -= 9 * dt;
      p.s.position.addScaledVector(p.v, dt);
      const k = Math.max(0, p.life / 0.6);
      p.s.scale.setScalar(0.25 + 0.35 * k);
      (p.s.material as THREE.SpriteMaterial).opacity = k;
      if (p.life <= 0) p.s.visible = false;
    }
  }
}

/** Ekran boyutuna uyan, çözünürlüğü telefonu yormayacak kadar sınırlı WebGL çizici. */
export function makeRenderer(canvas: HTMLCanvasElement) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  r.setPixelRatio(Math.min(1.75, window.devicePixelRatio || 1));
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  r.outputColorSpace = THREE.SRGBColorSpace;
  return r;
}

export function disposeScene(scene: THREE.Scene) {
  scene.traverse((o) => {
    const m = o as THREE.Mesh;
    m.geometry?.dispose();
    const mat = m.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
    else mat?.dispose();
  });
  // önbellekteki malzemeler ve şekiller de atıldı: bir sonraki sahne yenilerini kursun
  mats.clear();
  starGeo = null;
}
