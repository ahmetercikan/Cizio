/**
 * Su görselleri: dalgalanan havuz yüzeyi ve gerçekten fışkıran fıskiye.
 *
 * Her ikisi de kendi `tick(dt, t)` fonksiyonunu döndürür; kurulduğu yer (kasaba meydanı, köy çeşmesi,
 * AVM havuzu, evin bahçe havuzu) bunu kendi döngüsüne ekler. Oyun çizgi film görünümünde olduğu için
 * su pahalı bir şarkıcı (shader) yerine iki kat kayan dalga dokusu + kıpırdayan köşe noktalarıyla yapılır:
 * ucuzdur, telefonda da akıcı çalışır ve gerçeğe yakın parıldar.
 */
import * as THREE from 'three';
import { canvasTexture, mesh, toon } from '../play3d/kit';

/** Yumuşak dalga deseni (alt kat: suyun kendi rengi). */
function waveTex() {
  return canvasTexture(256, 256, (x) => {
    x.fillStyle = '#ffffff';
    x.fillRect(0, 0, 256, 256);
    x.strokeStyle = 'rgba(190,230,255,0.9)';
    x.lineWidth = 7;
    for (let i = -1; i < 7; i++) {
      x.beginPath();
      for (let k = 0; k <= 256; k += 8) x.lineTo(k, i * 40 + Math.sin(k / 26 + i) * 9 + Math.sin(k / 11) * 3);
      x.stroke();
    }
    x.strokeStyle = 'rgba(255,255,255,0.85)';
    x.lineWidth = 3;
    for (let i = 0; i < 7; i++) {
      x.beginPath();
      for (let k = 0; k <= 256; k += 8) x.lineTo(k, i * 40 + 16 + Math.sin(k / 19 + i * 2) * 7);
      x.stroke();
    }
  }, [1, 1]);
}

/** Güneşin suda kırılan ışıkları (üst kat: ters yöne kayar, pırıl pırıl parlar). */
function shineTex() {
  return canvasTexture(256, 256, (x) => {
    x.fillStyle = '#000000';
    x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 46; i++) {
      const cx = Math.random() * 256, cy = Math.random() * 256, r = 7 + Math.random() * 16;
      const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, 'rgba(255,255,255,0.95)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g;
      x.beginPath();
      x.ellipse(cx, cy, r, r * 0.45, Math.random() * 3, 0, Math.PI * 2);
      x.fill();
    }
  }, [1, 1]);
}

export interface Water {
  group: THREE.Group;
  tick(dt: number, t: number): void;
}

export interface SurfaceOpts {
  /** Daire ise yarıçap, dikdörtgen ise genişlik. */
  r?: number;
  w?: number;
  d?: number;
  color?: string;
  /** Dalga yüksekliği. */
  wave?: number;
  /** Doku kaç kez tekrarlansın (büyük havuzda daha çok). */
  rep?: number;
  speed?: number;
}

/**
 * Dalgalanan, ışıldayan su yüzeyi. Köşe noktaları iki sinüsle kıpırdar, iki doku ters yönde kayar:
 * durgun bir mavi daireden çok daha canlı görünür.
 */
export function waterSurface(o: SurfaceOpts = {}): Water {
  const { r, w = 4, d = 4, color = '#4fc3e8', wave = 0.06, speed = 1 } = o;
  const rep = o.rep ?? Math.max(1, Math.round((r ? r * 2 : Math.max(w, d)) / 4));
  const geo = r
    ? new THREE.CircleGeometry(r, 48).rotateX(-Math.PI / 2)
    : new THREE.PlaneGeometry(w, d, Math.max(8, Math.round(w * 2)), Math.max(8, Math.round(d * 2))).rotateX(-Math.PI / 2);
  const base = waveTex();
  base.repeat.set(rep, rep);
  const skin = shineTex();
  skin.repeat.set(rep * 0.8, rep * 0.8);
  const body = mesh(geo, toon(color, { transparent: true, opacity: 0.93 }), false);
  (body.material as THREE.MeshToonMaterial).map = base;
  const glint = new THREE.Mesh(geo.clone(), new THREE.MeshBasicMaterial({
    map: skin, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  glint.position.y = 0.012;
  const group = new THREE.Group();
  group.add(body, glint);
  // köşe noktalarının başlangıç yükseklikleri (dalga bunların üstüne biner)
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const y0 = new Float32Array(pos.count);
  for (let i = 0; i < pos.count; i++) y0[i] = pos.getY(i);
  const gp = glint.geometry.attributes.position as THREE.BufferAttribute;
  return {
    group,
    tick(_dt, t) {
      const s = t * speed;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), z = pos.getZ(i);
        const y = y0[i] + (Math.sin(x * 1.3 + s * 2.1) + Math.sin(z * 1.7 - s * 1.6)) * wave;
        pos.setY(i, y);
        gp.setY(i, y);
      }
      pos.needsUpdate = true;
      gp.needsUpdate = true;
      base.offset.set(s * 0.035, s * 0.055);
      skin.offset.set(-s * 0.05, s * 0.02);
    },
  };
}

export interface FountainOpts {
  /** Suyun fırladığı yükseklik. */
  h?: number;
  /** Kaç kavisli su kolu. */
  arms?: number;
  /** Kolların düştüğü yarıçap. */
  r?: number;
  color?: string;
  /** Ortadaki sütun da çizilsin mi. */
  column?: boolean;
  /** Suyun düştüğü yüzeyin yüksekliği (fıskiyeye göre; havuz aşağıdaysa eksi). */
  fall?: number;
  /** Damla boyu. */
  drop?: number;
}

/**
 * Fıskiye: ortadan fışkıran ince su sütunu, kavis çizerek suya düşen damla kolları ve düştükleri
 * yerde halka halka yayılan sıçrama. Damlalar tek bir InstancedMesh: yüzlerce damla tek çizim.
 */
export function fountain(o: FountainOpts = {}): Water {
  const { h = 2.6, arms = 7, r = 1.5, color = '#cdf1ff', column = true, fall = 0, drop = 0.075 } = o;
  const group = new THREE.Group();
  const DROPS = arms * 10;
  const dropMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8, depthWrite: false });
  const drops = new THREE.InstancedMesh(new THREE.SphereGeometry(drop, 7, 5), dropMat, DROPS);
  drops.frustumCulled = false;
  drops.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  group.add(drops);
  // ortadaki sütun: yukarı doğru incelen, titreşen su
  let col: THREE.Mesh | null = null;
  if (column) {
    col = mesh(new THREE.CylinderGeometry(0.07, 0.2, h, 12, 1, true), new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false,
    }), false);
    col.position.y = h / 2;
    group.add(col);
    const crown = mesh(new THREE.SphereGeometry(0.22, 12, 8), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.45, depthWrite: false }), false);
    crown.position.y = h;
    group.add(crown);
  }
  // suya düşen damlaların açtığı halkalar (su yüzeyinde)
  const rings = [0, 1, 2].map((i) => {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.5, 28).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({
      color: '#ffffff', transparent: true, opacity: 0, depthWrite: false,
    }));
    m.position.y = fall + 0.03;
    m.userData.off = i / 3;
    group.add(m);
    return m;
  });
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), v = new THREE.Vector3();
  return {
    group,
    tick(_dt, t) {
      // her damla kendi kolunda, kendi gecikmesiyle havalanır, kavis çizer ve suya düşer
      const per = Math.ceil(DROPS / arms);
      for (let i = 0; i < DROPS; i++) {
        const arm = i % arms;
        const a = (arm / arms) * Math.PI * 2 + arm * 0.07;
        const u = (t * 0.8 + Math.floor(i / arms) / per + arm * 0.11) % 1;
        // gerçek atış eğrisi: tepe noktası ortada, suya düştüğü yer `fall`
        const y = 4 * h * 0.26 * u * (1 - u) * 3.85 + fall * u;
        const rr = r * u;
        v.set(Math.cos(a) * rr, y, Math.sin(a) * rr);
        const sx = drop > 0.1 ? 1 : 0.9 + (1 - u) * 0.5;
        // düşerken damla uzar (hız arttıkça), yeni çıkarken yuvarlaktır
        sc.set(sx, sx * (1 + u * 0.8), sx);
        m4.compose(v, q, sc);
        drops.setMatrixAt(i, m4);
      }
      drops.instanceMatrix.needsUpdate = true;
      if (col) col.scale.set(1 + Math.sin(t * 9) * 0.08, 1 + Math.sin(t * 6.3) * 0.05, 1 + Math.cos(t * 8) * 0.08);
      for (const m of rings) {
        const u = (t * 0.75 + (m.userData.off as number)) % 1;
        m.scale.setScalar(0.35 + u * r * 1.9);
        (m.material as THREE.MeshBasicMaterial).opacity = 0.45 * (1 - u) ** 1.6;
      }
    },
  };
}
