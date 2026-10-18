/**
 * Mevsimler ve hava: adanın her gün aynı görünmemesi için.
 *
 * Mevsim gerçek tarihten gelir (çocuk dışarıda sonbaharsa adada da sonbahardır): yaprakların rengi
 * mevsime göre değişir. Hava ise günün kendisinden hesaplanır — rastgele değil, o gün herkes için aynı
 * ve gün boyunca değişmez. Yağmur ve kar kameranın çevresinde dönen bir kutu içinde yağar; uzaklaşınca
 * damlalar başa sarar, böylece birkaç yüz parçacık bütün adayı kaplamış gibi görünür.
 */
import * as THREE from 'three';
import { dayKey, hashStr } from '../lib/util';

export type Season = 'ilkbahar' | 'yaz' | 'sonbahar' | 'kis';
export type Weather = 'acik' | 'yagmur' | 'kar';

export interface SeasonLook {
  name: string;
  /** Yaprak dökmeyen ağaçların (geniş yapraklı) rengi. */
  leaf: string;
  /** Çimenin hafif tonu (ileride kullanılmak üzere). */
  grass: string;
}

export const SEASONS: Record<Season, SeasonLook> = {
  ilkbahar: { name: 'İlkbahar', leaf: '#7cd36b', grass: '#8fd96f' },
  yaz: { name: 'Yaz', leaf: '#5cc36b', grass: '#7ecb5e' },
  sonbahar: { name: 'Sonbahar', leaf: '#e8a33d', grass: '#a8c25c' },
  kis: { name: 'Kış', leaf: '#cfe3df', grass: '#cfe0d6' },
};

/** Takvime göre mevsim (kuzey yarımküre). */
export function seasonOf(d = new Date()): Season {
  const m = d.getMonth();
  if (m <= 1 || m === 11) return 'kis';
  if (m <= 4) return 'ilkbahar';
  if (m <= 7) return 'yaz';
  return 'sonbahar';
}

/** Günün havası: aynı gün hep aynı. Kışın kar, diğer mevsimlerde ara sıra yağmur. */
export function weatherOf(d = new Date()): Weather {
  const n = hashStr(`${dayKey(d)}|hava`) % 100;
  if (seasonOf(d) === 'kis') return n < 34 ? 'kar' : 'acik';
  return n < 20 ? 'yagmur' : 'acik';
}

export const WEATHER_TEXT: Record<Weather, string> = {
  acik: 'Hava açık',
  yagmur: 'Yağmur yağıyor',
  kar: 'Kar yağıyor',
};

/** Kameranın çevresinde yağan yağmur ya da kar. */
export class Sky {
  readonly kind: Exclude<Weather, 'acik'>;
  private mesh: THREE.InstancedMesh;
  private pos: Float32Array;
  private hiz: Float32Array;
  private faz: Float32Array;
  private m4 = new THREE.Matrix4();
  private q = new THREE.Quaternion();
  private sc = new THREE.Vector3(1, 1, 1);
  private v = new THREE.Vector3();
  /** Kutu ölçüsü: kameranın çevresinde bu kadar geniş ve yüksek yağar. */
  private readonly R = 38;
  private readonly H = 26;

  constructor(scene: THREE.Scene, kind: Exclude<Weather, 'acik'>) {
    this.kind = kind;
    const n = kind === 'yagmur' ? 1100 : 700;
    const geo = kind === 'yagmur'
      ? new THREE.BoxGeometry(0.05, 1.05, 0.05)
      : new THREE.SphereGeometry(0.085, 6, 5);
    const mat = new THREE.MeshBasicMaterial({
      color: kind === 'yagmur' ? '#cfe9ff' : '#ffffff',
      transparent: true,
      opacity: kind === 'yagmur' ? 0.72 : 0.92,
      depthWrite: false,
    });
    this.mesh = new THREE.InstancedMesh(geo, mat, n);
    this.mesh.frustumCulled = false;
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.renderOrder = 5;
    scene.add(this.mesh);
    this.pos = new Float32Array(n * 3);
    this.hiz = new Float32Array(n);
    this.faz = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      this.pos[i * 3] = (Math.random() - 0.5) * this.R * 2;
      this.pos[i * 3 + 1] = Math.random() * this.H;
      this.pos[i * 3 + 2] = (Math.random() - 0.5) * this.R * 2;
      this.hiz[i] = kind === 'yagmur' ? 26 + Math.random() * 10 : 2.4 + Math.random() * 1.8;
      this.faz[i] = Math.random() * Math.PI * 2;
    }
  }

  /** Her kare: damlalar düşer, kutu kameranın (kahramanın) çevresinde kalır. */
  update(dt: number, center: THREE.Vector3, t: number) {
    const n = this.hiz.length;
    for (let i = 0; i < n; i++) {
      let y = this.pos[i * 3 + 1] - this.hiz[i] * dt;
      if (y < -2) {
        y += this.H + 2;
        this.pos[i * 3] = (Math.random() - 0.5) * this.R * 2;
        this.pos[i * 3 + 2] = (Math.random() - 0.5) * this.R * 2;
      }
      this.pos[i * 3 + 1] = y;
      const sway = this.kind === 'kar' ? Math.sin(t * 1.4 + this.faz[i]) * 1.1 : 0;
      this.v.set(center.x + this.pos[i * 3] + sway, center.y + y, center.z + this.pos[i * 3 + 2] + sway * 0.6);
      this.m4.compose(this.v, this.q, this.sc);
      this.mesh.setMatrixAt(i, this.m4);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  set visible(v: boolean) {
    this.mesh.visible = v;
  }

  dispose() {
    this.mesh.removeFromParent();
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
  }
}
