/**
 * Kâğıt kukla: Giydir karakteri gövde, iki kol ve iki bacak olarak ayrı kartlardan kurulur; kollar omuzdan, bacaklar
 * kalçadan döner. Yürürken kollar ve bacaklar sallanır, gövde hafifçe sekip yalpalar; el sallama, zıplama, alkış, dans,
 * oturma (salıncak, dönme dolap…), olta tutma ve elde bir şey taşıma pozları vardır.
 */
import * as THREE from 'three';
import type { DollParts } from './textures';

export type Pose = 'idle' | 'walk' | 'wave' | 'jump' | 'clap' | 'dance' | 'sit' | 'fish' | 'hold' | 'cheer';

const VW = 300, VH = 440;

function texOf(c: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export class Puppet {
  /** Kameraya dönen kök (yalnızca dikey eksende). */
  readonly root = new THREE.Group();
  /** Sağa/sola bakış için aynalanan iç grup. */
  private inner = new THREE.Group();
  private body = new THREE.Group();
  private armL = new THREE.Group();
  private armR = new THREE.Group();
  private legL = new THREE.Group();
  private legR = new THREE.Group();
  /** Sağ elde taşınan şey (dondurma, olta) buraya eklenir. */
  readonly hand = new THREE.Group();
  readonly H: number;
  readonly W: number;
  private phase = 0;
  private textures: THREE.Texture[] = [];

  constructor(parts: DollParts, H = 3.2) {
    this.H = H;
    this.W = H * (VW / VH);
    const plane = (c: HTMLCanvasElement) => {
      const t = texOf(c);
      this.textures.push(t);
      return new THREE.Mesh(new THREE.PlaneGeometry(this.W, this.H), new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.06, side: THREE.DoubleSide }));
    };
    const local = (vx: number, vy: number) => new THREE.Vector2((vx / VW - 0.5) * this.W, (1 - vy / VH) * this.H);
    // Bir parçayı dönme noktasına (omuz, kalça) asar: parça kartı tam boy, pivotun tersine kaydırılır
    const hang = (g: THREE.Group, c: HTMLCanvasElement, vx: number, vy: number, z: number) => {
      const p = local(vx, vy);
      g.position.set(p.x, p.y, z);
      const m = plane(c);
      m.position.set(-p.x, this.H / 2 - p.y, 0);
      g.add(m);
      return g;
    };
    const base = plane(parts.base);
    base.position.y = this.H / 2;
    this.body.add(base);
    hang(this.legL, parts.legL, 134, 300, -0.02);
    hang(this.legR, parts.legR, 166, 300, -0.02);
    hang(this.armL, parts.armL, 118, 198, 0.02);
    hang(this.armR, parts.armR, 182, 198, 0.02);
    // Sağ el: kol pivotuna göre el noktası (210,300)
    const s = local(182, 198), h = local(210, 300);
    this.hand.position.set(h.x - s.x, h.y - s.y, 0.03);
    this.armR.add(this.hand);
    this.body.add(this.legL, this.legR, this.armL, this.armR);
    this.inner.add(this.body);
    this.root.add(this.inner);
  }

  /**
   * Her kare: `speed` 0..1 yürüme hızı, `facing` +1 sağ / -1 sol, `yaw` kameraya dönüş açısı.
   */
  update(dt: number, clock: number, pose: Pose, speed: number, facing: number, yaw: number) {
    this.root.rotation.y = yaw;
    this.inner.scale.x = facing;
    const walking = pose === 'walk' && speed > 0.05;
    this.phase += dt * (walking ? 9 + speed * 3 : 0);
    const s = Math.sin(this.phase);
    let aL = 0, aR = 0, lL = 0, lR = 0, bob = 0, tilt = 0, squash = 1;
    switch (pose) {
      case 'walk':
        if (walking) {
          // kollar karşı bacakla birlikte: sol bacak öndeyken sol kol arkada, sağ kol önde
          aL = -0.42 * s;
          aR = 0.42 * s;
          lL = 0.32 * s;
          lR = -0.32 * s;
          bob = Math.abs(Math.cos(this.phase)) * 0.14;
          tilt = 0.05 * s;
        } else {
          aL = 0.04 * Math.sin(clock * 2);
          aR = -0.04 * Math.sin(clock * 2);
          squash = 1 + 0.012 * Math.sin(clock * 2.4);
        }
        break;
      case 'idle':
        aL = 0.04 * Math.sin(clock * 2);
        aR = -0.04 * Math.sin(clock * 2);
        squash = 1 + 0.012 * Math.sin(clock * 2.4);
        break;
      case 'wave':
        aL = 0.05;
        aR = 2.5 + 0.35 * Math.sin(clock * 14);
        break;
      case 'jump':
      case 'cheer':
        aL = -2.5 + 0.15 * Math.sin(clock * 12);
        aR = 2.5 - 0.15 * Math.sin(clock * 12);
        lL = 0.18;
        lR = -0.18;
        break;
      case 'clap': {
        const c = Math.abs(Math.sin(clock * 9));
        aL = 0.9 + 0.5 * c;
        aR = -0.9 - 0.5 * c;
        break;
      }
      case 'dance':
        aL = -2.0 + 0.8 * Math.sin(clock * 7);
        aR = 2.0 + 0.8 * Math.sin(clock * 7 + Math.PI);
        lL = 0.3 * Math.sin(clock * 7);
        lR = 0.3 * Math.sin(clock * 7);
        tilt = 0.12 * Math.sin(clock * 3.5);
        bob = Math.abs(Math.sin(clock * 7)) * 0.2;
        break;
      case 'sit':
        aL = -0.55;
        aR = 0.55;
        lL = -0.35;
        lR = 0.35;
        break;
      case 'fish':
        aL = 0.3;
        aR = 1.5 + 0.05 * Math.sin(clock * 3);
        break;
      case 'hold':
        aR = 1.1;
        if (walking) {
          aL = -0.42 * s;
          lL = 0.32 * s;
          lR = -0.32 * s;
          bob = Math.abs(Math.cos(this.phase)) * 0.14;
        }
        break;
    }
    // yumuşak geçiş (pozlar arası sıçramasın)
    const k = Math.min(1, dt * 14);
    this.armL.rotation.z += (aL - this.armL.rotation.z) * k;
    this.armR.rotation.z += (aR - this.armR.rotation.z) * k;
    this.legL.rotation.z += (lL - this.legL.rotation.z) * k;
    this.legR.rotation.z += (lR - this.legR.rotation.z) * k;
    this.body.position.y = bob;
    this.body.rotation.z = tilt;
    this.body.scale.y = squash;
  }

  dispose() {
    this.textures.forEach((t) => t.dispose());
  }
}

/** Evcil hayvanın kartı: kukla tuvalinden hayvanın bölgesi kesilir (viewBox 4 296 130 124). */
export function petCard(c: HTMLCanvasElement): THREE.Mesh | null {
  const K = c.width / VW;
  const x0 = 4 * K, y0 = 296 * K, w = 130 * K, h = 124 * K;
  const crop = document.createElement('canvas');
  crop.width = Math.round(w);
  crop.height = Math.round(h);
  const ctx = crop.getContext('2d')!;
  ctx.drawImage(c, x0, y0, w, h, 0, 0, crop.width, crop.height);
  const d = ctx.getImageData(0, 0, crop.width, crop.height).data;
  let any = false;
  for (let i = 3; i < d.length; i += 16) if (d[i] > 30) { any = true; break; }
  if (!any) return null;
  const t = texOf(crop);
  const S = 1.5;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(S, S * (h / w)), new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.06, side: THREE.DoubleSide }));
  m.geometry.translate(0, (S * (h / w)) / 2, 0);
  return m;
}
