/**
 * Giydir karakterinin 3B hâli: sevimli, büyük kafalı (chibi) bir figür; ten rengi, saç modeli ve rengi, yüz ifadesi,
 * üst / alt / elbise, ayakkabı, şapka, gözlük ve sırt eşyası Giydir'deki seçimden gelir.
 *
 * Gerçek bir insan gibi yürüdüğü yöne döner (sırtı da görünür); yürürken bacaklar ve kollar karşılıklı sallanır,
 * koşarken öne eğilir; yüzer, oturur, dans eder, el sallar, zıplar, alkışlar, olta tutar, araç sürer. Gözler kırpar.
 * Model +z yönüne bakar; `root.rotation.y` yönü verir.
 */
import * as THREE from 'three';
import type { DollState } from '../dressup/catalog';
import { toon } from '../play3d/kit';

export type Pose = 'idle' | 'walk' | 'wave' | 'jump' | 'clap' | 'dance' | 'sit' | 'swim' | 'fish' | 'hold' | 'drive' | 'cheer' | 'dig' | 'climb';

const INK = '#3a2b27';
const LONG_SLEEVE = new Set(['kazak', 'balikci', 'kapsonlu', 'ceket', 'gomlek', 'pijama', 'yagmurluk', 'astronot', 'sovalye', 'ressam', 'doktor']);
const NO_SLEEVE = new Set(['atlet', 'yelek', 'yazlik', 'balerin', 'tulum']);
const PANTS = new Set(['pantolon', 'kot', 'esofman', 'tayt']);
const SHORTS = new Set(['sort', 'kargo']);
const SKIRT_LEN: Record<string, number> = { etek: 0.5, tutu: 0.32, uzunetek: 0.85 };

function capsule(r: number, len: number, mat: THREE.Material, hangDown = true) {
  const g = new THREE.CapsuleGeometry(r, len, 6, 12);
  if (hangDown) g.translate(0, -(len / 2 + r * 0.6), 0);
  const m = new THREE.Mesh(g, mat);
  m.castShadow = true;
  return m;
}
const sph = (r: number, mat: THREE.Material, ws = 16, hs = 12) => {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, ws, hs), mat);
  m.castShadow = true;
  return m;
};

/** Yüz dokusu: göz, ağız, yanak; `closed` kırpılmış gözler. */
function faceCanvas(d: DollState, closed: boolean) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const x = c.getContext('2d')!;
  x.lineCap = 'round';
  x.lineJoin = 'round';
  const eye = (cx: number, cy: number, mode: 'open' | 'closed' | 'heart' | 'happy' | 'wink') => {
    x.fillStyle = INK;
    x.strokeStyle = INK;
    x.lineWidth = 11;
    if (mode === 'closed' || mode === 'wink') {
      x.beginPath();
      x.arc(cx, cy - 8, 26, 0.15 * Math.PI, 0.85 * Math.PI);
      x.stroke();
      return;
    }
    if (mode === 'happy') {
      x.beginPath();
      x.arc(cx, cy + 12, 26, 1.15 * Math.PI, 1.85 * Math.PI);
      x.stroke();
      return;
    }
    if (mode === 'heart') {
      x.fillStyle = '#ef4b6b';
      x.beginPath();
      x.moveTo(cx, cy + 22);
      x.bezierCurveTo(cx - 34, cy, cx - 22, cy - 26, cx, cy - 10);
      x.bezierCurveTo(cx + 22, cy - 26, cx + 34, cy, cx, cy + 22);
      x.fill();
      return;
    }
    x.beginPath();
    x.ellipse(cx, cy, 24, 32, 0, 0, Math.PI * 2);
    x.fill();
    x.fillStyle = '#fff';
    x.beginPath();
    x.arc(cx + 8, cy - 12, 9, 0, Math.PI * 2);
    x.fill();
  };
  const f = d.face;
  const L = 182, R = 330, Y = 112;
  const mode = closed || f === 'uykulu' ? 'closed' : f === 'asik' ? 'heart' : f === 'gulus' ? 'happy' : 'open';
  eye(L, Y, f === 'kirp' && !closed ? 'wink' : mode);
  eye(R, Y, mode);
  // kaşlar
  x.strokeStyle = INK;
  x.lineWidth = 7;
  if (f === 'kararli' || f === 'havali') {
    x.beginPath(); x.moveTo(L - 26, Y - 44); x.lineTo(L + 20, Y - 34); x.stroke();
    x.beginPath(); x.moveTo(R + 26, Y - 44); x.lineTo(R - 20, Y - 34); x.stroke();
  } else if (f === 'saskin') {
    x.beginPath(); x.arc(L, Y - 30, 22, 1.2 * Math.PI, 1.8 * Math.PI); x.stroke();
    x.beginPath(); x.arc(R, Y - 30, 22, 1.2 * Math.PI, 1.8 * Math.PI); x.stroke();
  }
  // yanaklar
  x.fillStyle = f === 'utangac' || f === 'asik' ? 'rgba(255,110,140,0.75)' : 'rgba(255,140,150,0.5)';
  for (const cx of [L - 24, R + 24]) {
    x.beginPath();
    x.ellipse(cx, Y + 46, 26, 15, 0, 0, Math.PI * 2);
    x.fill();
  }
  if (d.freckles) {
    x.fillStyle = 'rgba(150,90,50,0.7)';
    for (const [fx, fy] of [[-14, 30], [0, 40], [14, 30]]) for (const cx of [L - 20, R + 20]) {
      x.beginPath();
      x.arc(cx + fx, Y + fy, 3.5, 0, Math.PI * 2);
      x.fill();
    }
  }
  // ağız
  const M = 256, MY = Y + 62;
  x.strokeStyle = INK;
  x.fillStyle = INK;
  x.lineWidth = 8;
  if (f === 'saskin') {
    x.beginPath(); x.ellipse(M, MY + 6, 14, 18, 0, 0, Math.PI * 2); x.fill();
  } else if (f === 'gulus' || f === 'dil') {
    x.beginPath(); x.arc(M, MY - 8, 38, 0.08 * Math.PI, 0.92 * Math.PI); x.closePath(); x.fill();
    if (f === 'dil') {
      x.fillStyle = '#ff7a8a';
      x.beginPath(); x.ellipse(M + 6, MY + 20, 12, 10, 0, 0, Math.PI * 2); x.fill();
    }
  } else if (f === 'kararli') {
    x.beginPath(); x.moveTo(M - 18, MY + 4); x.lineTo(M + 18, MY + 4); x.stroke();
  } else if (f === 'utangac' || f === 'uykulu') {
    x.beginPath(); x.arc(M, MY - 4, 12, 0.15 * Math.PI, 0.85 * Math.PI); x.stroke();
  } else {
    x.beginPath(); x.arc(M, MY - 14, 32, 0.15 * Math.PI, 0.85 * Math.PI); x.stroke();
  }
  return c;
}

export class Avatar3D {
  readonly root = new THREE.Group();
  /** Gövdenin eğilmesi / yüzerken yatması için. */
  private body = new THREE.Group();
  private torso = new THREE.Group();
  private head = new THREE.Group();
  private armL = new THREE.Group();
  private armR = new THREE.Group();
  private legL = new THREE.Group();
  private legR = new THREE.Group();
  /** Sağ el: taşınan şeyler (dondurma, olta) buraya eklenir. */
  readonly hand = new THREE.Group();
  private faceMat: THREE.MeshBasicMaterial;
  private faceOpen: THREE.CanvasTexture;
  private faceShut: THREE.CanvasTexture;
  private phase = 0;
  private blinkAt = 2;
  private textures: THREE.Texture[] = [];

  constructor(d: DollState) {
    const skin = toon(d.skin);
    const dressed = !!d.dress;
    const topColor = dressed ? d.dressColor : d.topColor;
    const top = toon(topColor);
    const bottomColor = dressed ? d.dressColor : d.bottomColor;
    const bottom = toon(bottomColor);
    const shoes = toon(d.shoesColor);
    const hair = toon(d.hairColor);
    const garment = dressed ? d.dress : d.top;

    // --- bacaklar (kalçadan sallanır) ---
    const pants = !dressed && PANTS.has(d.bottom);
    const shorts = !dressed && SHORTS.has(d.bottom);
    for (const [g, sx] of [[this.legL, -0.19], [this.legR, 0.19]] as const) {
      g.position.set(sx, 1.0, 0);
      if (shorts) {
        const up = capsule(0.17, 0.25, bottom);
        const low = capsule(0.145, 0.42, skin);
        low.position.y = -0.36;
        g.add(up, low);
      } else g.add(capsule(0.155, 0.62, pants ? bottom : skin));
      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.17, 0.42), shoes);
      shoe.geometry.translate(0, 0, 0.06);
      shoe.position.y = -0.9;
      shoe.castShadow = true;
      g.add(shoe);
      this.body.add(g);
    }

    // --- gövde ---
    this.torso.position.y = 1.0;
    const chest = capsule(0.36, 0.42, top, false);
    chest.scale.set(1.12, 1, 0.82);
    chest.position.y = 0.5;
    this.torso.add(chest);
    const hip = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.36, 0.26, 16), pants || shorts ? bottom : dressed ? top : bottom);
    hip.scale.z = 0.82;
    hip.position.y = 0.08;
    hip.castShadow = true;
    this.torso.add(hip);
    const skirtLen = dressed ? (d.dress === 'tulum' || d.dress === 'astronot' || d.dress === 'pijama' ? 0 : d.dress === 'prenses' ? 0.85 : 0.55) : SKIRT_LEN[d.bottom] ?? 0;
    if (skirtLen) {
      const flare = d.bottom === 'tutu' || d.dress === 'balerin' ? 0.78 : d.dress === 'prenses' ? 0.82 : 0.6;
      const sk = new THREE.Mesh(new THREE.CylinderGeometry(0.38, flare, skirtLen, 20, 1, true), d.bottom === 'tutu' || d.dress === 'balerin' ? toon(bottomColor, { transparent: true, opacity: 0.92 }) : bottom);
      (sk.material as THREE.Material).side = THREE.DoubleSide;
      sk.scale.z = 0.85;
      sk.position.y = 0.14 - skirtLen / 2;
      sk.castShadow = true;
      this.torso.add(sk);
    }
    if (dressed && (d.dress === 'tulum' || d.dress === 'pijama' || d.dress === 'astronot')) {
      // tek parça: bacaklar da giysi renginde
      for (const g of [this.legL, this.legR]) (g.children[0] as THREE.Mesh).material = top;
    }
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.2, 10), skin);
    neck.position.y = 1.0;
    this.torso.add(neck);

    // --- kollar (omuzdan) ---
    const sleeve = NO_SLEEVE.has(garment) ? 0 : LONG_SLEEVE.has(garment) ? 1 : 0.4;
    for (const [g, sx] of [[this.armL, -0.47], [this.armR, 0.47]] as const) {
      g.position.set(sx, 0.86, 0);
      g.rotation.z = sx < 0 ? -0.12 : 0.12;
      const arm = capsule(0.11, 0.5, skin);
      g.add(arm);
      if (sleeve > 0) {
        const sl = capsule(0.135, 0.5 * sleeve, top);
        g.add(sl);
      }
      const h = sph(0.13, skin);
      h.position.y = -0.74;
      g.add(h);
      this.torso.add(g);
    }
    this.hand.position.set(0, -0.78, 0.08);
    this.armR.add(this.hand);

    // --- baş ---
    this.head.position.y = 1.62;
    const skull = sph(0.62, skin, 28, 20);
    this.head.add(skull);
    for (const sx of [-0.6, 0.6]) {
      const ear = sph(0.12, skin, 10, 8);
      ear.position.set(sx, -0.02, 0);
      this.head.add(ear);
    }
    this.faceOpen = new THREE.CanvasTexture(faceCanvas(d, false));
    this.faceShut = new THREE.CanvasTexture(faceCanvas(d, true));
    for (const t of [this.faceOpen, this.faceShut]) {
      t.colorSpace = THREE.SRGBColorSpace;
      this.textures.push(t);
    }
    this.faceMat = new THREE.MeshBasicMaterial({ map: this.faceOpen, transparent: true, depthWrite: false });
    const face = new THREE.Mesh(new THREE.SphereGeometry(0.625, 32, 16, Math.PI / 2 - 0.78, 1.56, 1.12, 1.0), this.faceMat);
    face.renderOrder = 2;
    this.head.add(face);
    this.addHair(d, hair);
    if (d.hat) this.addHat(d.hat, toon(d.hatColor));
    if (d.glasses) this.addGlasses(d.glasses);
    if (d.back) this.addBack(d.back, d);
    this.torso.add(this.head);
    this.body.add(this.torso);
    this.root.add(this.body);
  }

  private addHair(d: DollState, m: THREE.Material) {
    const h = d.hair;
    // takke arkaya yatık: önde alın açık kalır (gözlerin üstünde biter), arkada enseye iner
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.67, 28, 16, 0, Math.PI * 2, 0, h === 'kazima' ? Math.PI * 0.46 : Math.PI * 0.6), m);
    cap.position.set(0, 0.02, -0.03);
    cap.rotation.x = -0.5;
    cap.castShadow = true;
    this.head.add(cap);
    const add = (o: THREE.Object3D) => {
      o.castShadow = true;
      this.head.add(o);
    };
    const back = (len: number, wide = 1) => {
      const b = capsule(0.42 * wide, len, m, false);
      b.scale.set(1.15, 1, 0.5);
      b.position.set(0, -0.1 - len / 2, -0.36);
      add(b);
    };
    switch (h) {
      case 'kakul': {
        const bang = sph(0.4, m);
        bang.scale.set(1.3, 0.45, 0.6);
        bang.position.set(0, 0.38, 0.38);
        add(bang);
        break;
      }
      case 'yan': {
        const sw = sph(0.36, m);
        sw.scale.set(1.2, 0.5, 0.7);
        sw.position.set(0.22, 0.4, 0.32);
        sw.rotation.z = -0.4;
        add(sw);
        break;
      }
      case 'dikenli':
        for (let i = 0; i < 7; i++) {
          const a = (i / 7) * Math.PI * 2;
          const sp = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.36, 6), m);
          sp.position.set(Math.cos(a) * 0.3, 0.62, Math.sin(a) * 0.3 - 0.05);
          sp.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5);
          add(sp);
        }
        break;
      case 'kivircik': case 'afro': case 'uzunkivircik': {
        const big = h === 'afro' ? 0.3 : 0.22;
        for (let i = 0; i < 22; i++) {
          const th = Math.random() * Math.PI * 0.62, ph = Math.random() * Math.PI * 2;
          const r = h === 'afro' ? 0.78 : 0.66;
          const s = sph(big + Math.random() * 0.06, m, 10, 8);
          s.position.set(Math.sin(th) * Math.cos(ph) * r, Math.cos(th) * r * 0.95 + 0.05, Math.sin(th) * Math.sin(ph) * r - 0.06);
          if (s.position.z > 0.35 && s.position.y < 0.45) continue;
          add(s);
        }
        if (h === 'uzunkivircik') back(0.7, 1.05);
        break;
      }
      case 'kut': {
        const bob = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.74, 0.65, 24, 1, true, Math.PI * 0.3, Math.PI * 1.4), m);
        (bob.material as THREE.Material).side = THREE.DoubleSide;
        bob.position.set(0, -0.12, -0.02);
        add(bob);
        break;
      }
      case 'uzun': case 'dalgali':
        back(h === 'uzun' ? 0.95 : 0.8, h === 'dalgali' ? 1.1 : 1);
        break;
      case 'atkuyrugu': {
        const tie = sph(0.16, m);
        tie.position.set(0, 0.2, -0.66);
        const tail = capsule(0.17, 0.7, m);
        tail.position.set(0, 0.16, -0.72);
        tail.rotation.x = 0.35;
        add(tie);
        add(tail);
        break;
      }
      case 'ikikuyruk':
        for (const sx of [-0.62, 0.62]) {
          const tail = capsule(0.15, 0.6, m);
          tail.position.set(sx, 0.18, -0.15);
          tail.rotation.z = sx < 0 ? -0.4 : 0.4;
          add(tail);
        }
        break;
      case 'topuz': case 'tepetopuz': {
        const bun = sph(0.28, m);
        bun.position.set(0, h === 'tepetopuz' ? 0.7 : 0.35, h === 'tepetopuz' ? -0.05 : -0.6);
        add(bun);
        break;
      }
      case 'orgu': case 'yanorgu':
        for (let i = 0; i < 6; i++) {
          const b = sph(0.13 - i * 0.008, m, 10, 8);
          b.position.set(h === 'yanorgu' ? 0.45 : 0, 0.05 - i * 0.2, h === 'yanorgu' ? -0.15 : -0.62 - i * 0.02);
          add(b);
        }
        break;
    }
  }

  private addHat(id: string, m: THREE.Material) {
    const add = (o: THREE.Mesh, x = 0, y = 0, z = 0) => {
      o.position.set(x, y, z);
      o.castShadow = true;
      this.head.add(o);
      return o;
    };
    const gold = toon('#ffc83d');
    switch (id) {
      case 'kep': {
        add(new THREE.Mesh(new THREE.SphereGeometry(0.69, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.42), m), 0, 0.06);
        const brim = add(new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.05, 20, 1, false, -Math.PI / 2, Math.PI), m), 0, 0.3, 0.42);
        brim.scale.z = 0.9;
        break;
      }
      case 'hasir': case 'kovboy': {
        add(new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.06, 28), id === 'hasir' ? toon('#e9c46a') : m), 0, 0.42);
        add(new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.62, 0.45, 20), id === 'hasir' ? toon('#e9c46a') : m), 0, 0.64);
        break;
      }
      case 'yunbere': {
        add(new THREE.Mesh(new THREE.SphereGeometry(0.7, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), m), 0, 0.05);
        add(sph(0.18, toon('#ffffff')), 0, 0.78);
        break;
      }
      case 'fiyonk': case 'tokalar': case 'cicek':
        for (const sx of id === 'tokalar' ? [-0.45, 0.45] : [0.4]) {
          if (id === 'fiyonk') {
            for (const s of [-1, 1]) {
              const c = add(new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.34, 8), m), sx + s * 0.16, 0.56, -0.1);
              c.rotation.z = s * Math.PI / 2;
            }
            add(sph(0.08, m), sx, 0.56, -0.1);
          } else add(sph(id === 'cicek' ? 0.18 : 0.1, m), sx, 0.5, 0.2);
        }
        break;
      case 'kulaklik': {
        const band = add(new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.05, 6, 24, Math.PI), m), 0, 0.02);
        band.rotation.z = 0;
        for (const sx of [-0.68, 0.68]) add(new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.12, 14), m), sx, 0).rotation.z = Math.PI / 2;
        break;
      }
      case 'kedikulak':
        for (const sx of [-0.35, 0.35]) add(new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.36, 4), m), sx, 0.68, 0).rotation.z = sx < 0 ? 0.3 : -0.3;
        break;
      case 'anten':
        for (const sx of [-0.25, 0.25]) {
          add(new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.5, 5), toon('#3a2b27')), sx, 0.82, 0);
          add(sph(0.09, m), sx, 1.07, 0);
        }
        break;
      case 'parti': case 'sihirbaz': case 'unicorn': {
        if (id === 'sihirbaz') add(new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.05, 24), m), 0, 0.46);
        const c = add(new THREE.Mesh(new THREE.ConeGeometry(id === 'unicorn' ? 0.1 : 0.34, id === 'sihirbaz' ? 1.1 : 0.7, 16), id === 'unicorn' ? gold : m), 0, id === 'sihirbaz' ? 1.0 : 0.88, id === 'unicorn' ? 0.35 : 0);
        if (id === 'unicorn') c.rotation.x = 0.4;
        break;
      }
      case 'tac': case 'yildiztac': {
        const ring = add(new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.26, 16, 1, true), gold), 0, 0.62);
        (ring.material as THREE.Material).side = THREE.DoubleSide;
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2;
          add(new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 4), gold), Math.cos(a) * 0.4, 0.84, Math.sin(a) * 0.4);
        }
        if (id === 'yildiztac') add(sph(0.12, toon('#ff8fb1')), 0, 0.92, 0.38);
        break;
      }
      case 'korsan': {
        const t = add(new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.75, 0.42, 3), toon('#3a2b27')), 0, 0.66);
        t.rotation.y = Math.PI / 6;
        break;
      }
      case 'sef':
        add(new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.42, 0.45, 16), toon('#ffffff')), 0, 0.68);
        add(sph(0.5, toon('#ffffff')), 0, 1.0).scale.y = 0.6;
        break;
      default:
        add(new THREE.Mesh(new THREE.SphereGeometry(0.69, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.4), m), 0, 0.06);
    }
  }

  private addGlasses(id: string) {
    const frame = toon(id === 'kalp' ? '#ef4b6b' : id === 'yildiz' ? '#ffc83d' : '#3a2b27');
    for (const sx of [-0.2, 0.2]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.03, 6, 16), frame);
      ring.position.set(sx, 0.04, 0.6);
      this.head.add(ring);
      if (id === 'gunes' || id === 'kayak') {
        const lens = new THREE.Mesh(new THREE.CircleGeometry(0.14, 16), toon('#2a2a3a'));
        lens.position.set(sx, 0.04, 0.605);
        this.head.add(lens);
      }
    }
  }

  private addBack(id: string, d: DollState) {
    const add = (o: THREE.Mesh, x: number, y: number, z: number) => {
      o.position.set(x, y, z);
      o.castShadow = true;
      this.torso.add(o);
      return o;
    };
    switch (id) {
      case 'canta': add(new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.7, 0.28), toon('#5b8def')), 0, 0.55, -0.42); break;
      case 'jetpack':
        for (const sx of [-0.18, 0.18]) add(new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.7, 12), toon('#b9c6cc')), sx, 0.55, -0.42);
        break;
      case 'pelerin': {
        const cape = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 1.3), toon(d.dressColor === '#ff6b4a' ? '#5b8def' : '#ff6b4a'));
        (cape.material as THREE.Material).side = THREE.DoubleSide;
        add(cape, 0, 0.25, -0.36).rotation.x = 0.12;
        break;
      }
      case 'kanat': case 'ejderhakanat':
        for (const sx of [-1, 1]) {
          const w = new THREE.Mesh(new THREE.CircleGeometry(0.5, 16), toon(id === 'kanat' ? '#ffffff' : '#2bb673', { transparent: true, opacity: 0.9 }));
          (w.material as THREE.Material).side = THREE.DoubleSide;
          w.scale.set(1, 0.7, 1);
          add(w, sx * 0.5, 0.75, -0.38).rotation.y = sx * 0.6;
        }
        break;
    }
  }

  /** Her kare. `speed` 0..1 (1'in üstü koşu), `t` saat. */
  update(dt: number, t: number, pose: Pose, speed: number) {
    const run = speed > 1.05;
    const moving = speed > 0.05;
    this.phase += dt * (pose === 'swim' ? 5 : moving ? 7 + speed * 4 : 0);
    const s = Math.sin(this.phase);
    let lL = 0, lR = 0, aLx = 0, aRx = 0, aLz = -0.12, aRz = 0.12, bob = 0, lean = 0, twist = 0, lie = 0, headTilt = 0;
    const amp = run ? 0.95 : 0.6;
    switch (pose) {
      case 'walk': case 'hold':
        if (moving) {
          lL = amp * s;
          lR = -amp * s;
          aLx = -amp * 0.9 * s;
          aRx = pose === 'hold' ? -1.1 : amp * 0.9 * s;
          bob = Math.abs(Math.cos(this.phase)) * (run ? 0.16 : 0.08);
          lean = run ? 0.22 : 0.06;
          twist = 0.08 * s;
        } else {
          aLz = -0.12 - 0.03 * Math.sin(t * 2);
          aRz = pose === 'hold' ? 0.12 : 0.12 + 0.03 * Math.sin(t * 2);
          if (pose === 'hold') aRx = -1.1;
          headTilt = 0.04 * Math.sin(t * 0.7);
        }
        break;
      case 'idle':
        aLz = -0.12 - 0.03 * Math.sin(t * 2);
        aRz = 0.12 + 0.03 * Math.sin(t * 2);
        break;
      case 'wave':
        aRz = 2.7 + 0.35 * Math.sin(t * 13);
        break;
      case 'jump': case 'cheer':
        aLz = -2.6 + 0.15 * Math.sin(t * 12);
        aRz = 2.6 - 0.15 * Math.sin(t * 12);
        lL = -0.3;
        lR = -0.3;
        break;
      case 'clap': case 'dig': {
        const c = Math.abs(Math.sin(t * (pose === 'dig' ? 7 : 9)));
        aLx = -1.25;
        aRx = -1.25;
        aLz = 0.35 + 0.35 * c;
        aRz = -0.35 - 0.35 * c;
        if (pose === 'dig') lean = 0.45;
        break;
      }
      case 'dance':
        aLz = -2.2 + 0.7 * Math.sin(t * 7);
        aRz = 2.2 + 0.7 * Math.sin(t * 7 + Math.PI);
        lL = 0.35 * Math.sin(t * 7);
        lR = -0.35 * Math.sin(t * 7);
        bob = Math.abs(Math.sin(t * 7)) * 0.18;
        twist = 0.3 * Math.sin(t * 3.5);
        break;
      case 'sit': case 'drive':
        lL = -1.45;
        lR = -1.45;
        aLx = pose === 'drive' ? -1.1 : -0.5;
        aRx = pose === 'drive' ? -1.1 : -0.5;
        break;
      case 'swim':
        lie = 1.25;
        // serbest stil kulaç: kollar sırayla öne uzanıp geri çekilir
        aLx = -1.6 - 1.5 * Math.sin(this.phase);
        aRx = -1.6 - 1.5 * Math.sin(this.phase + Math.PI);
        aLz = -0.3;
        aRz = 0.3;
        lL = 0.35 * Math.sin(this.phase * 2.5);
        lR = -0.35 * Math.sin(this.phase * 2.5);
        break;
      case 'fish':
        aRx = -1.4;
        aLx = -0.9;
        aLz = 0.3;
        break;
      case 'climb':
        aLz = -2.4 + 0.5 * Math.sin(t * 8);
        aRz = 2.4 - 0.5 * Math.sin(t * 8 + Math.PI);
        lL = -0.6 * Math.max(0, Math.sin(t * 8));
        lR = -0.6 * Math.max(0, -Math.sin(t * 8));
        break;
    }
    const k = Math.min(1, dt * 12);
    const lerp = (o: THREE.Object3D, ax: 'x' | 'z', v: number) => (o.rotation[ax] += (v - o.rotation[ax]) * k);
    lerp(this.legL, 'x', lL);
    lerp(this.legR, 'x', lR);
    lerp(this.armL, 'x', aLx);
    lerp(this.armR, 'x', aRx);
    lerp(this.armL, 'z', aLz);
    lerp(this.armR, 'z', aRz);
    this.body.position.y += (bob + (lie ? 0.4 : 0) - this.body.position.y) * k;
    this.body.rotation.x += (lean + lie - this.body.rotation.x) * k;
    this.torso.rotation.y += (twist - this.torso.rotation.y) * k;
    this.head.rotation.z += (headTilt - this.head.rotation.z) * k;
    this.head.rotation.x = lie ? -0.9 : 0;
    // göz kırpma
    if (t > this.blinkAt) {
      this.faceMat.map = this.faceShut;
      if (t > this.blinkAt + 0.13) {
        this.faceMat.map = this.faceOpen;
        this.blinkAt = t + 2.5 + Math.random() * 3;
      }
    }
  }

  dispose() {
    this.textures.forEach((x) => x.dispose());
  }
}
