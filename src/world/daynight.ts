/**
 * Gece ve gündüz: adadaki saat cihazın gerçek saatini izler (gündüzse gündüz, geceyse gece).
 *
 * Güneşin doğuş ve batış saati mevsime göre değişir (Türkiye için yaklaşık: yazın 05.30-20.30, kışın 07.30-17.30).
 * Gün doğarken ve batarken gökyüzü turuncu-pembeye döner; gece lacivert gökyüzü, yıldızlar ve ay çıkar, sokak
 * lambaları ve ev pencereleri yanar, yakındaki lambalar yere sıcak ışık düşürür. Çocuklar için gece hiç zifiri
 * karanlık olmaz: her şey seçilir, yalnızca serin ve masalsı bir hâl alır.
 */
import * as THREE from 'three';
import { litMaterials } from '../play3d/kit';

import { skyAt, sm, type SkyState } from '../lib/sky';

export { skyAt, type SkyState };

const C = (c: string) => new THREE.Color(c);
const SKY_DAY = C('#bde6f7'), SKY_DUSK = C('#f6ae8f'), SKY_NIGHT = C('#1b2a5c');
const HEMI_DAY = C('#fffaf2'), HEMI_DUSK = C('#ffd9bd'), HEMI_NIGHT = C('#8ea2e8');
const GROUND_DAY = C('#b9d9a0'), GROUND_NIGHT = C('#2c3a5a');
const SUN_DAY = C('#fff4dc'), SUN_DUSK = C('#ffae70'), MOON = C('#b4c6ff');
const LAMP = C('#ffcf6b');

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, 'rgba(255,240,200,1)');
  r.addColorStop(0.25, 'rgba(255,214,140,0.55)');
  r.addColorStop(1, 'rgba(255,200,120,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Gökyüzü, ışıklar, yıldızlar, ay ve lambalar. Ada sahnesine bir kez kurulur, her karede `update` çağrılır. */
export class DayNight {
  state: SkyState = { day: 1, dusk: 0, arc: 0.5 };
  /** Gösterilen (yumuşak geçişli) değerler. */
  private cur: SkyState = { day: 1, dusk: 0, arc: 0.5 };
  private checkT = 0;
  /** Geliştirme/test: saati elle ayarla (null: gerçek saat). */
  forceHour: number | null = null;
  private sky = new THREE.Group();
  private stars: THREE.Points;
  private moon: THREE.Group;
  private sunDisc: THREE.Group;
  private halos: THREE.Points | null = null;
  private pool: THREE.PointLight[] = [];
  /** Gece karakterin yüzü seçilsin diye ona eşlik eden yumuşak ışık. */
  private heroLight = new THREE.PointLight('#ffe2b8', 0, 9, 1.2);
  private lampPos: THREE.Vector3[];
  private glow = litMaterials();
  private glowBase = new Map<THREE.MeshToonMaterial, THREE.Color>();
  private skyColor = SKY_DAY.clone();
  private first = true;

  constructor(private scene: THREE.Scene, private hemi: THREE.HemisphereLight, private sun: THREE.DirectionalLight, private renderer: THREE.WebGLRenderer, lamps: THREE.Vector3[]) {
    this.lampPos = lamps;
    // yıldızlar: kameranın etrafında büyük bir kubbe
    const n = 700, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, e = Math.asin(0.08 + Math.random() * 0.92);
      const r = 420;
      pos.set([Math.cos(a) * Math.cos(e) * r, Math.sin(e) * r, Math.sin(a) * Math.cos(e) * r], i * 3);
      const k = 0.7 + Math.random() * 0.3, warm = Math.random() < 0.3;
      col.set([k, k * (warm ? 0.92 : 0.97), k * (warm ? 0.8 : 1)], i * 3);
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    sg.setAttribute('color', new THREE.BufferAttribute(col, 3));
    this.stars = new THREE.Points(sg, new THREE.PointsMaterial({ size: 2.4, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0, fog: false, depthWrite: false }));
    this.stars.frustumCulled = false;
    const tex = glowTexture();
    const disc = (r: number, color: string, halo: number, haloColor: string) => {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.CircleGeometry(r, 32), new THREE.MeshBasicMaterial({ color, fog: false, transparent: true, depthWrite: false })));
      const h = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: haloColor, fog: false, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      h.scale.setScalar(halo);
      g.add(h);
      return g;
    };
    this.moon = disc(13, '#fff8e1', 70, '#9fb4ff');
    // ayın gölgeli yüzü (hilal görünsün)
    const shadowFace = new THREE.Mesh(new THREE.CircleGeometry(12, 32), new THREE.MeshBasicMaterial({ color: '#1b2a5c', fog: false, transparent: true, depthWrite: false }));
    shadowFace.position.set(5, 3, 0.1);
    this.moon.add(shadowFace);
    this.sunDisc = disc(15, '#fff6d5', 110, '#ffd27a');
    this.sky.add(this.stars, this.moon, this.sunDisc);
    this.sky.renderOrder = -1;
    scene.add(this.sky);
    // lamba haleleri: tek çizimde bütün lambalar
    if (lamps.length) {
      const hp = new Float32Array(lamps.length * 3);
      lamps.forEach((p, i) => hp.set([p.x, p.y, p.z], i * 3));
      const hg = new THREE.BufferGeometry();
      hg.setAttribute('position', new THREE.BufferAttribute(hp, 3));
      this.halos = new THREE.Points(hg, new THREE.PointsMaterial({ map: tex, size: 3.6, sizeAttenuation: true, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, color: '#ffd38a' }));
      this.halos.frustumCulled = false;
      scene.add(this.halos);
    }
    // yakındaki lambalar yere ışık düşürür (hep 4 ışık: sayı değişmez ki gölgelendiriciler yeniden derlenmesin)
    for (let i = 0; i < 4; i++) {
      const l = new THREE.PointLight(LAMP, 0, 15, 1.4);
      l.userData.moving = true;
      this.pool.push(l);
      scene.add(l);
    }
    this.heroLight.userData.moving = true;
    scene.add(this.heroLight);
    for (const m of this.glow) this.glowBase.set(m, m.emissive.clone());
  }

  /** `hero`: kahramanın yeri (ışıklar ve gökyüzü onu izler). `cam`: kamera. `active`: ada görünüyor mu. */
  update(dt: number, hero: THREE.Vector3, cam: THREE.Camera, active: boolean, underwater: boolean) {
    this.checkT -= dt;
    if (this.checkT <= 0) {
      this.checkT = 5;
      const d = new Date();
      if (this.forceHour !== null) d.setHours(Math.floor(this.forceHour), Math.round((this.forceHour % 1) * 60), 0);
      this.state = skyAt(d);
    }
    const k = this.first ? 1 : Math.min(1, dt * 0.8);
    this.first = false;
    this.cur.day += (this.state.day - this.cur.day) * k;
    this.cur.dusk += (this.state.dusk - this.cur.dusk) * k;
    this.cur.arc += (this.state.arc - this.cur.arc) * k;
    if (!active) return;
    const { day, dusk, arc } = this.cur;
    const night = 1 - day;

    // gökyüzü ve sis
    this.skyColor.copy(SKY_NIGHT).lerp(SKY_DAY, day).lerp(SKY_DUSK, dusk * 0.75);
    if (!underwater) {
      (this.scene.background as THREE.Color).copy(this.skyColor);
      (this.scene.fog as THREE.Fog).color.copy(this.skyColor);
    }
    // ışıklar: gece de her şey seçilsin
    this.hemi.color.copy(HEMI_NIGHT).lerp(HEMI_DAY, day).lerp(HEMI_DUSK, dusk * 0.5);
    this.hemi.groundColor.copy(GROUND_NIGHT).lerp(GROUND_DAY, day);
    this.hemi.intensity = 0.75 + 0.45 * day;
    const sunCol = day > 0.5 ? SUN_DAY : MOON;
    this.sun.color.copy(sunCol).lerp(SUN_DUSK, dusk * 0.8);
    this.sun.intensity = day > 0.5 ? 0.6 + 0.9 * day - dusk * 0.3 : 0.25 + 0.3 * night;
    this.renderer.toneMappingExposure = 1.0 + 0.08 * day;

    // güneş / ay gökte doğudan batıya
    const a = Math.PI * (0.08 + 0.84 * arc);
    const dir = new THREE.Vector3(Math.cos(a) * 0.75, Math.max(0.42, Math.sin(a)), 0.45).normalize();
    this.sun.position.copy(hero).addScaledVector(dir, 70);
    this.sun.target.position.copy(hero);
    this.sky.position.copy(cam.position);
    const skyDir = new THREE.Vector3(Math.cos(a) * 0.8, Math.sin(a) * 0.7 + 0.05, 0.5).normalize();
    const disc = day > 0.5 ? this.sunDisc : this.moon;
    const other = disc === this.sunDisc ? this.moon : this.sunDisc;
    disc.visible = true;
    other.visible = false;
    disc.position.copy(skyDir).multiplyScalar(380);
    disc.lookAt(cam.position);
    const discOp = disc === this.sunDisc ? sm(0.5, 0.9, day) : sm(0.5, 0.9, night);
    disc.children.forEach((c) => (((c as THREE.Mesh).material as THREE.Material).opacity = discOp * (c === disc.children[1] ? 0.55 : 1)));
    (this.stars.material as THREE.PointsMaterial).opacity = sm(0.35, 0.95, night) * 0.95;
    this.stars.rotation.y += dt * 0.004;

    const toCam = new THREE.Vector3().subVectors(cam.position, hero).setY(0).normalize();
    this.heroLight.position.copy(hero).addScaledVector(toCam, 2.2).setY(hero.y + 3);
    this.heroLight.intensity = sm(0.3, 0.9, night) * 7;
    // lambalar ve pencereler
    const lit = sm(0.25, 0.75, night + dusk * 0.3);
    for (const [m, base] of this.glowBase) m.emissive.copy(base).lerp(LAMP, lit * 0.85);
    if (this.halos) (this.halos.material as THREE.PointsMaterial).opacity = lit * 0.9;
    if (lit > 0.01 && this.lampPos.length) {
      // en yakın dört lamba
      const near = this.lampPos.map((p) => ({ p, d: p.distanceToSquared(hero) })).sort((x, y) => x.d - y.d).slice(0, this.pool.length);
      this.pool.forEach((l, i) => {
        const n = near[i];
        if (!n || n.d > 45 * 45) {
          l.intensity = 0;
          return;
        }
        l.position.copy(n.p);
        l.intensity = lit * 13;
      });
    } else for (const l of this.pool) l.intensity = 0;
  }

  /** Gecenin koyuluğu (yumuşak geçişli, 0 gündüz, 1 gece). */
  get night() {
    return 1 - this.cur.day;
  }
  /** Şu an gece mi (oyun içi mesajlar için). */
  get isNight() {
    return this.state.day < 0.5;
  }
}
