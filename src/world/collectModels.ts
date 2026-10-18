/**
 * Koleksiyon parçalarının küçük 3B modelleri: müzedeki camekânlarda sergilenir.
 *
 * Her parça birkaç temel şekilden kurulur (küre, koni, silindir) ve yaklaşık 0,8 birimlik bir
 * küpe sığar; camekân modeli olduğu gibi kullanır. Model dosyası yoktur, hepsi kodla çizilir.
 */
import * as THREE from 'three';
import { mesh, outline, toon } from '../play3d/kit';
import type { Collectible, CollectGroup } from './collection';

/** Çizgili (dış hatlı) parça. */
const P = (geo: THREE.BufferGeometry, color: string, ol = 1.07, opts?: { emissive?: string; transparent?: boolean; opacity?: number }) =>
  outline(mesh(geo, toon(color, opts ?? {}), false), ol);
/** Çizgisiz küçük ayrıntı (göz, benek, çizgi). */
const D = (geo: THREE.BufferGeometry, color: string, opts?: { emissive?: string; transparent?: boolean; opacity?: number }) =>
  mesh(geo, toon(color, opts ?? {}), false);

const sphere = (r: number, w = 12, h = 10) => new THREE.SphereGeometry(r, w, h);
const cone = (r: number, h: number, s = 10) => new THREE.ConeGeometry(r, h, s);
const cyl = (rt: number, rb: number, h: number, s = 10) => new THREE.CylinderGeometry(rt, rb, h, s);

/** Koyu göz çifti. `eksen` hangi yöne aynalanacağını söyler (yüzü +z olanlarda x, -x olanlarda z). */
function eyes(g: THREE.Group, x: number, y: number, z: number, r = 0.035, eksen: 'x' | 'z' = 'x') {
  for (const s of [-1, 1]) {
    const e = D(sphere(r, 8, 6), '#2f2634');
    e.position.set(eksen === 'x' ? s * x : x, y, eksen === 'x' ? z : s * z);
    g.add(e);
  }
}

// ------------------------------------------------------------------------------------------------
// Balıklar
// ------------------------------------------------------------------------------------------------
function fish(c: Collectible): THREE.Group {
  const g = new THREE.Group();
  const col = c.color;

  if (c.id === 'vatoz') {
    // vatoz: geniş, yassı kanatlar ve uzun ince kuyruk
    const body = P(sphere(0.34, 16, 10), col, 1.05);
    body.scale.set(1.15, 0.2, 1);
    g.add(body);
    const burun = P(sphere(0.2, 12, 10), col, 1.05);
    burun.scale.set(0.9, 0.3, 1);
    burun.position.set(0, 0, 0.3);
    g.add(burun);
    const kuyruk = P(cyl(0.012, 0.05, 0.56, 7), col, 1.08);
    kuyruk.rotation.x = Math.PI / 2;
    kuyruk.position.set(0, 0.02, -0.56);
    g.add(kuyruk);
    eyes(g, 0.1, 0.07, 0.24, 0.03);
    return g;
  }

  // uzun gövdeliler (yunus, köpek balığı, balina) daha sivri ve iridir
  const uzun = c.id === 'yunus' || c.id === 'kopekbaligi' || c.id === 'balina';
  const body = P(sphere(0.3, 16, 12), col, 1.05);
  body.scale.set(c.id === 'balina' ? 0.6 : 0.46, uzun ? 0.74 : 0.92, uzun ? 1.5 : 1.25);
  g.add(body);

  // burun: gövdeyle kaynaşan sivri uç
  const burun = P(sphere(0.19, 12, 10), col, 1.05);
  burun.scale.set(c.id === 'balina' ? 0.75 : 0.5, 0.6, uzun ? 1.5 : 1);
  burun.position.z = uzun ? 0.38 : 0.28;
  g.add(burun);

  // kuyruk: arkaya doğru açılan yelpaze
  const kuyruk = P(cone(uzun ? 0.3 : 0.26, uzun ? 0.4 : 0.34, 3), col, 1.07);
  kuyruk.rotation.x = Math.PI / 2;
  kuyruk.scale.set(0.11, 1, 1);
  kuyruk.position.z = -(uzun ? 0.56 : 0.46);
  if (uzun) {
    // yunus ve balinanın kuyruğu yatay durur
    kuyruk.rotation.z = Math.PI / 2;
    kuyruk.scale.set(0.11, 1, 0.8);
  }
  g.add(kuyruk);

  // sırt yüzgeci
  const sirt = P(cone(c.id === 'kopekbaligi' ? 0.16 : 0.13, c.id === 'kopekbaligi' ? 0.3 : 0.22, 3), col, 1.07);
  sirt.scale.set(0.1, 1, 1);
  sirt.rotation.x = -0.45;
  sirt.position.set(0, uzun ? 0.2 : 0.26, uzun ? 0.02 : -0.04);
  g.add(sirt);

  // yan yüzgeçler
  for (const s of [-1, 1]) {
    const y = P(cone(0.1, 0.2, 3), col, 1.08);
    y.scale.set(1, 1, 0.26);
    y.rotation.set(0, 0, s * 1.35);
    y.position.set(s * 0.1, -0.04, uzun ? 0.1 : 0.04);
    g.add(y);
  }

  if (c.id === 'palyaco') {
    // beyaz şeritler
    for (const z of [0.14, -0.08]) {
      const sr = D(sphere(0.3, 16, 12), '#ffffff');
      sr.scale.set(0.48, 0.93, 0.13);
      sr.position.set(0, 0, z);
      g.add(sr);
    }
  }
  if (c.id === 'balina') {
    const karin = D(sphere(0.3, 14, 10), '#e9f1f6');
    karin.scale.set(0.45, 0.4, 1.3);
    karin.position.y = -0.1;
    g.add(karin);
    const agiz = D(new THREE.BoxGeometry(0.02, 0.05, 0.5), '#3b6a8c');
    agiz.position.set(0.08, -0.1, 0.3);
    g.add(agiz);
  }
  if (c.id === 'kopekbaligi') {
    const karin = D(sphere(0.3, 14, 10), '#e4e9ef');
    karin.scale.set(0.4, 0.35, 1.35);
    karin.position.y = -0.11;
    g.add(karin);
  }
  eyes(g, uzun ? 0.1 : 0.09, 0.08, uzun ? 0.3 : 0.22, 0.035);
  return g;
}

// ------------------------------------------------------------------------------------------------
// Fosiller
// ------------------------------------------------------------------------------------------------
function fossil(c: Collectible): THREE.Group {
  const g = new THREE.Group();
  const col = c.color;

  if (c.id === 'amonit') {
    // sarmal kabuk: küçülerek dönen boğumlar
    for (let i = 0; i < 14; i++) {
      const a = i * 0.56;
      const r = 0.055 + i * 0.019;
      const d = 0.055 + i * 0.021;
      const s = P(sphere(r, 10, 8), i % 2 ? col : '#9c7b58', 1.06);
      s.scale.set(1, 1, 0.8);
      s.position.set(Math.cos(a) * d, Math.sin(a) * d, 0);
      g.add(s);
    }
    g.rotation.set(0.15, -0.5, 0.2);
    return g;
  }
  if (c.id === 'trilobit') {
    const body = P(sphere(0.3, 14, 10), col, 1.05);
    body.scale.set(0.72, 0.4, 1.1);
    g.add(body);
    const bas = P(sphere(0.2, 12, 8), '#6f5a41', 1.06);
    bas.scale.set(1.05, 0.42, 0.7);
    bas.position.set(0, 0.02, 0.24);
    g.add(bas);
    for (let i = 0; i < 5; i++) {
      const r = D(cyl(0.2 - i * 0.02, 0.2 - i * 0.02, 0.035, 12), '#6f5a41');
      r.rotation.x = Math.PI / 2;
      r.scale.set(0.95, 1, 0.45);
      r.position.set(0, 0.055, 0.08 - i * 0.09);
      g.add(r);
    }
    eyes(g, 0.1, 0.1, 0.26, 0.03);
    return g;
  }
  if (c.id === 'dis') {
    const t = P(cone(0.14, 0.62, 10), col, 1.06);
    t.position.y = 0.04;
    t.rotation.z = 0.12;
    g.add(t);
    const kok = P(cyl(0.13, 0.1, 0.16, 10), '#cbbb9c', 1.06);
    kok.position.y = -0.3;
    g.add(kok);
    // testere kenar
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) {
      const k = D(cone(0.022, 0.05, 4), '#cbbb9c');
      k.rotation.z = s * Math.PI / 2;
      k.position.set(s * (0.1 - i * 0.021), -0.16 + i * 0.13, 0);
      g.add(k);
    }
    return g;
  }
  if (c.id === 'yumurta') {
    const e = P(sphere(0.3, 16, 14), col, 1.05);
    e.scale.set(0.82, 1.1, 0.82);
    g.add(e);
    for (let i = 0; i < 9; i++) {
      const a = i * 2.3, y = -0.2 + (i % 5) * 0.09;
      const d = D(sphere(0.028, 6, 5), '#b08968');
      d.position.set(Math.cos(a) * 0.24, y, Math.sin(a) * 0.24);
      g.add(d);
    }
    return g;
  }
  if (c.id === 'pence') {
    // orak gibi kıvrık pençe
    for (let i = 0; i < 8; i++) {
      const a = -0.5 + i * 0.26;
      const r = 0.075 - i * 0.008;
      const s = P(sphere(r, 10, 8), col, 1.07);
      s.scale.set(0.7, 1, 1);
      s.position.set(Math.sin(a) * 0.3, -Math.cos(a) * 0.3 + 0.16, 0);
      g.add(s);
    }
    const uc = P(cone(0.03, 0.14, 8), '#8d7355', 1.08);
    uc.position.set(Math.sin(1.6) * 0.33, -Math.cos(1.6) * 0.33 + 0.16, 0);
    uc.rotation.z = -1.9;
    g.add(uc);
    const taban = P(cyl(0.1, 0.12, 0.12, 10), '#8d7355', 1.06);
    taban.position.set(-0.14, -0.14, 0);
    taban.rotation.z = 0.5;
    g.add(taban);
    return g;
  }
  // kafatası
  const kafa = P(sphere(0.26, 14, 12), col, 1.05);
  kafa.scale.set(0.8, 0.82, 1);
  kafa.position.z = -0.04;
  g.add(kafa);
  const cene = P(new THREE.BoxGeometry(0.3, 0.14, 0.42), col, 1.05);
  cene.position.set(0, -0.14, 0.2);
  g.add(cene);
  const ust = P(new THREE.BoxGeometry(0.32, 0.16, 0.42), col, 1.05);
  ust.position.set(0, 0.01, 0.2);
  g.add(ust);
  for (const s of [-1, 1]) {
    const goz = D(sphere(0.07, 8, 6), '#4a3f33');
    goz.scale.set(1, 1, 0.6);
    goz.position.set(s * 0.13, 0.08, 0.06);
    g.add(goz);
    const dis = D(cone(0.03, 0.1, 5), '#f7f2e6');
    dis.rotation.x = Math.PI;
    dis.position.set(s * 0.1, -0.08, 0.34);
    g.add(dis);
    const boynuz = P(cone(0.04, 0.16, 7), '#cbbb9c', 1.08);
    boynuz.position.set(s * 0.16, 0.2, -0.02);
    boynuz.rotation.z = -s * 0.5;
    g.add(boynuz);
  }
  return g;
}

// ------------------------------------------------------------------------------------------------
// Deniz kabukları
// ------------------------------------------------------------------------------------------------
function shell(c: Collectible): THREE.Group {
  const g = new THREE.Group();
  const col = c.color;

  if (c.id === 'denizyildizi') {
    const orta = P(sphere(0.14, 12, 10), col, 1.06);
    orta.scale.set(1, 0.5, 1);
    g.add(orta);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const kol = P(cone(0.11, 0.38, 6), col, 1.06);
      kol.scale.set(1, 1, 0.62);
      kol.position.set(Math.cos(a) * 0.2, 0, Math.sin(a) * 0.2);
      kol.rotation.set(Math.PI / 2, 0, -a + Math.PI / 2);
      g.add(kol);
      const ben = D(sphere(0.03, 6, 5), '#ffd9c2');
      ben.position.set(Math.cos(a) * 0.22, 0.06, Math.sin(a) * 0.22);
      g.add(ben);
    }
    g.rotation.x = -0.8;
    return g;
  }
  if (c.id === 'istiridye') {
    // arkadaki menteseden açılan iki kapak
    for (const s of [-1, 1]) {
      const kol = new THREE.Group();
      const kapak = P(sphere(0.3, 16, 10), col, 1.05);
      kapak.scale.set(1, 0.3, 0.92);
      kapak.position.z = 0.24;
      kol.add(kapak);
      for (let i = 0; i < 5; i++) {
        const a = -0.8 + i * 0.4;
        const kab = D(new THREE.BoxGeometry(0.03, 0.02, 0.48), '#cfc3ad');
        kab.position.set(Math.sin(a) * 0.13, s * 0.07, 0.24);
        kab.rotation.y = a;
        kol.add(kab);
      }
      kol.rotation.x = -s * 0.34;
      kol.position.z = -0.2;
      g.add(kol);
    }
    const mentese = P(cyl(0.06, 0.06, 0.34, 8), '#cfc3ad', 1.07);
    mentese.rotation.z = Math.PI / 2;
    mentese.position.z = -0.21;
    g.add(mentese);
    const inci = D(sphere(0.075, 12, 10), '#ffffff', { emissive: '#4a4a4a' });
    inci.position.z = 0.04;
    g.add(inci);
    return g;
  }
  if (c.id === 'salyangoz') {
    for (let i = 0; i < 13; i++) {
      const a = i * 0.72;
      const r = 0.045 + i * 0.016;
      const d = 0.02 + i * 0.019;
      const s = P(sphere(r, 10, 8), i % 2 ? col : '#d8a97a', 1.06);
      s.position.set(Math.cos(a) * d, 0.24 - i * 0.035, Math.sin(a) * d);
      g.add(s);
    }
    return g;
  }
  if (c.id === 'mercan') {
    const govde = P(cyl(0.07, 0.11, 0.26, 8), col, 1.06);
    govde.position.y = -0.22;
    g.add(govde);
    const dal = (x: number, y: number, z: number, rz: number, h: number, r: number) => {
      const d = P(cyl(r * 0.7, r, h, 7), col, 1.07);
      d.position.set(x, y, z);
      d.rotation.set(0, 0, rz);
      g.add(d);
      return d;
    };
    dal(0, -0.02, 0, 0, 0.32, 0.06);
    dal(-0.13, 0.12, 0.04, 0.5, 0.3, 0.05);
    dal(0.13, 0.14, -0.04, -0.55, 0.28, 0.05);
    dal(-0.2, 0.3, 0.02, 0.25, 0.2, 0.035);
    dal(0.2, 0.32, -0.02, -0.2, 0.18, 0.035);
    dal(0.02, 0.28, 0.1, 0.1, 0.22, 0.04);
    for (const [x, y, z] of [[-0.24, 0.4, 0.02], [0.25, 0.42, -0.02], [0.03, 0.4, 0.1]] as const) {
      const t = D(sphere(0.045, 8, 6), '#ffd1e8');
      t.position.set(x, y, z);
      g.add(t);
    }
    return g;
  }
  if (c.id === 'denizati') {
    // kıvrık gövde ve kıvrılan kuyruk
    for (let i = 0; i < 9; i++) {
      const a = -0.3 + i * 0.3;
      const r = 0.085 - i * 0.006;
      const s = P(sphere(r, 10, 8), col, 1.06);
      s.scale.set(0.85, 1, 0.85);
      s.position.set(Math.sin(a) * 0.17 - 0.03, 0.3 - i * 0.07, 0);
      g.add(s);
    }
    for (let i = 0; i < 5; i++) {
      const a = i * 0.9;
      const s = P(sphere(0.045 - i * 0.005, 8, 6), col, 1.07);
      s.position.set(0.1 + Math.sin(a) * 0.08, -0.3 + (1 - Math.cos(a)) * 0.07, 0);
      g.add(s);
    }
    const bas = P(sphere(0.095, 12, 10), col, 1.06);
    bas.scale.set(0.9, 1, 0.9);
    bas.position.set(-0.08, 0.36, 0);
    g.add(bas);
    const burun = P(cyl(0.028, 0.04, 0.2, 8), col, 1.07);
    burun.position.set(-0.16, 0.3, 0);
    burun.rotation.z = 0.9;
    g.add(burun);
    const yele = P(cone(0.05, 0.16, 5), '#b8884f', 1.08);
    yele.position.set(0.06, 0.3, 0);
    yele.rotation.z = -0.6;
    g.add(yele);
    eyes(g, -0.1, 0.4, 0.07, 0.028, 'z');
    return g;
  }
  // inci: istiridye yatağında parlayan küre
  const yatak = P(sphere(0.28, 16, 10), '#e6ddd0', 1.05);
  yatak.scale.set(1, 0.34, 0.95);
  yatak.position.y = -0.16;
  g.add(yatak);
  const ic = D(sphere(0.23, 14, 10), '#fbe7ef');
  ic.scale.set(1, 0.3, 0.95);
  ic.position.y = -0.12;
  g.add(ic);
  const p = P(sphere(0.16, 16, 14), col, 1.04, { emissive: '#6a6a6a' });
  p.position.y = 0.04;
  g.add(p);
  return g;
}

// ------------------------------------------------------------------------------------------------
// Böcekler
// ------------------------------------------------------------------------------------------------
function kanat(color: string, op = 0.65) {
  const w = D(sphere(0.2, 12, 8), color, { transparent: true, opacity: op });
  w.scale.set(1.5, 0.08, 0.85);
  return w;
}

function bug(c: Collectible): THREE.Group {
  const g = new THREE.Group();
  const col = c.color;

  if (c.id === 'ugurbocegi') {
    const kubbe = P(sphere(0.29, 14, 12), col, 1.05);
    kubbe.scale.set(1, 0.72, 1.05);
    g.add(kubbe);
    const cizgi = D(new THREE.BoxGeometry(0.03, 0.2, 0.56), '#2f2634');
    cizgi.position.y = 0.1;
    g.add(cizgi);
    for (const [x, z] of [[-0.14, -0.12], [0.14, -0.12], [-0.17, 0.08], [0.17, 0.08], [-0.08, 0.2], [0.08, 0.2]] as const) {
      const b = D(sphere(0.045, 8, 6), '#2f2634');
      b.position.set(x, 0.17, z);
      g.add(b);
    }
    const bas = P(sphere(0.15, 12, 10), '#2f2634', 1.06);
    bas.scale.set(1, 0.7, 0.8);
    bas.position.set(0, 0.03, 0.26);
    g.add(bas);
    eyes(g, 0.07, 0.08, 0.3, 0.03);
    for (const s of [-1, 1]) {
      const a = D(cyl(0.012, 0.012, 0.16, 5), '#2f2634');
      a.position.set(s * 0.06, 0.14, 0.33);
      a.rotation.set(0.7, 0, -s * 0.5);
      g.add(a);
    }
    return g;
  }
  if (c.id === 'kelebek' || c.id === 'sifonkelebek') {
    const govde = P(cyl(0.035, 0.05, 0.42, 8), '#5b4636', 1.07);
    govde.rotation.x = Math.PI / 2;
    g.add(govde);
    const bas = P(sphere(0.07, 10, 8), '#5b4636', 1.07);
    bas.position.z = 0.24;
    g.add(bas);
    for (const s of [-1, 1]) {
      const ust = D(sphere(0.2, 14, 10), col, { transparent: true, opacity: 0.95 });
      ust.scale.set(1.25, 0.06, 0.95);
      ust.position.set(s * 0.25, 0.04, 0.1);
      ust.rotation.set(0, 0, s * 0.62);
      g.add(ust);
      const alt = D(sphere(0.15, 12, 10), col, { transparent: true, opacity: 0.95 });
      alt.scale.set(1, 0.06, 0.9);
      alt.position.set(s * 0.2, -0.01, -0.18);
      alt.rotation.set(0, 0, s * 0.5);
      g.add(alt);
      // desen
      const ben = D(sphere(0.055, 8, 6), '#ffffff');
      ben.scale.set(1, 0.1, 1);
      ben.position.set(s * 0.3, 0.07, 0.12);
      g.add(ben);
      if (c.id === 'sifonkelebek') {
        const kuyruk = D(cone(0.04, 0.2, 6), col, { transparent: true, opacity: 0.95 });
        kuyruk.position.set(s * 0.2, -0.01, -0.34);
        kuyruk.rotation.set(-Math.PI / 2, 0, 0);
        kuyruk.scale.set(1, 1, 0.25);
        g.add(kuyruk);
      }
      const anten = D(cyl(0.01, 0.01, 0.18, 5), '#5b4636');
      anten.position.set(s * 0.05, 0.08, 0.32);
      anten.rotation.set(0.6, 0, -s * 0.4);
      g.add(anten);
    }
    eyes(g, 0.045, 0.02, 0.27, 0.025);
    g.rotation.x = -0.5;
    return g;
  }
  if (c.id === 'ari') {
    const govde = P(sphere(0.2, 14, 12), col, 1.05);
    govde.scale.set(0.9, 0.9, 1.5);
    g.add(govde);
    for (const z of [0.1, -0.08, -0.24]) {
      const s = D(cyl(0.19, 0.19, 0.07, 14), '#2f2634');
      s.rotation.x = Math.PI / 2;
      s.scale.set(0.95, 1, 0.95);
      s.position.z = z;
      g.add(s);
    }
    const bas = P(sphere(0.14, 12, 10), '#2f2634', 1.06);
    bas.position.z = 0.3;
    g.add(bas);
    const igne = D(cone(0.03, 0.12, 6), '#2f2634');
    igne.rotation.x = Math.PI / 2;
    igne.position.z = -0.4;
    g.add(igne);
    for (const s of [-1, 1]) {
      const k = kanat('#eaf6ff', 0.6);
      k.position.set(s * 0.22, 0.14, 0.02);
      k.rotation.set(0, 0, s * 0.45);
      g.add(k);
      const a = D(cyl(0.01, 0.01, 0.14, 5), '#2f2634');
      a.position.set(s * 0.05, 0.14, 0.36);
      a.rotation.set(0.7, 0, -s * 0.4);
      g.add(a);
    }
    eyes(g, 0.07, 0.04, 0.37, 0.035);
    return g;
  }
  if (c.id === 'yusufcuk') {
    const govde = P(cyl(0.035, 0.055, 0.62, 8), col, 1.06);
    govde.rotation.x = Math.PI / 2;
    govde.position.z = -0.1;
    g.add(govde);
    for (let i = 0; i < 4; i++) {
      const h = D(cyl(0.045, 0.045, 0.05, 8), '#2f8fb0');
      h.rotation.x = Math.PI / 2;
      h.position.z = -0.3 + i * 0.12;
      g.add(h);
    }
    const bas = P(sphere(0.11, 12, 10), col, 1.06);
    bas.position.z = 0.26;
    g.add(bas);
    for (const s of [-1, 1]) {
      const g1 = D(sphere(0.075, 10, 8), '#2f2634');
      g1.position.set(s * 0.06, 0.03, 0.3);
      g.add(g1);
      for (const [z, len] of [[0.08, 1.9], [-0.12, 1.6]] as const) {
        const k = kanat('#e9fbff', 0.5);
        k.scale.set(len, 0.05, 0.42);
        k.position.set(s * 0.3, 0.06, z);
        k.rotation.set(0, 0, s * 0.12);
        g.add(k);
      }
    }
    g.rotation.x = -0.45;
    return g;
  }
  // ateş böceği: koyu gövde, karnı ışıldar
  const govde = P(sphere(0.2, 14, 12), '#4a4332', 1.05);
  govde.scale.set(0.85, 0.8, 1.4);
  g.add(govde);
  const bas = P(sphere(0.13, 12, 10), '#2f2634', 1.06);
  bas.position.z = 0.26;
  g.add(bas);
  const isik = D(sphere(0.14, 12, 10), col, { emissive: '#8fa30a' });
  isik.scale.set(0.9, 0.85, 1.1);
  isik.position.z = -0.24;
  g.add(isik);
  const hale = D(sphere(0.22, 12, 10), col, { transparent: true, opacity: 0.3, emissive: '#6d7d05' });
  hale.position.z = -0.26;
  g.add(hale);
  for (const s of [-1, 1]) {
    const k = kanat('#d9d2bb', 0.55);
    k.scale.set(1.2, 0.06, 0.7);
    k.position.set(s * 0.18, 0.12, -0.02);
    k.rotation.set(0, 0, s * 0.4);
    g.add(k);
  }
  eyes(g, 0.06, 0.04, 0.33, 0.03);
  return g;
}

const BUILDERS: Record<CollectGroup, (c: Collectible) => THREE.Group> = {
  balik: fish,
  fosil: fossil,
  kabuk: shell,
  bocek: bug,
};

/** Parçanın camekânda duracak küçük modeli (yaklaşık 0,8 birim). */
export function collectModel(c: Collectible): THREE.Group {
  return BUILDERS[c.group](c);
}
