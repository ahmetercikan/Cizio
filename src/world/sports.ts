/**
 * Spor alanı: futbol sahası ve basket sahası. Arkadaş adaya gelince ikisi aynı topla oynar.
 *
 * Futbol: büyük kaleler, iki kaleci robot, skor tabelası, "Maç başlat" ile 2 dakikalık maç. Topa yürüyerek
 * dokununca hafif, koşarak dokununca sert vurulur (kaleye doğru biraz yardım eder).
 * Basket: topa dokununca alınır (sektirerek taşınır), potanın önünde "Basket at!" ile atılır; uzaktan atılan üçlük.
 *
 * Arkadaşla oynama: topa en son dokunan oyuncu topun "sahibi"dir; topun yeri, hızı ve skor onun canlı paketiyle
 * (WorldBuilder.netSend) diğerlerine gider, onlar kendi ekranlarında aynı hareketi sürdürür. Gol ve sayıyı yalnızca
 * sahibi sayar, böylece skor herkeste aynı kalır.
 */
import * as THREE from 'three';
import { mesh, outline, toon } from '../play3d/kit';
import { sign, type Actor, type WorldBuilder } from './zones';

export const FOOTBALL = { x: 52, z: 70 };
export const BASKET = { x: 52, z: 102 };
const r2 = (n: number) => Math.round(n * 100) / 100;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** Skor tabelası: tuval dokulu, iki yüzlü, direkli. */
function scoreboard(b: WorldBuilder, x: number, z: number, rot: number, y: number) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 224;
  const g = c.getContext('2d')!;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const grp = new THREE.Group();
  const frame = outline(mesh(new THREE.BoxGeometry(6.4, 2.9, 0.3), toon('#2b2f3a')), 1.03);
  frame.position.y = y;
  grp.add(frame);
  for (const s of [-1, 1]) {
    const face = new THREE.Mesh(new THREE.PlaneGeometry(6, 2.6), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
    face.position.set(0, y, s * 0.16);
    if (s < 0) face.rotation.y = Math.PI;
    grp.add(face);
    const pole = mesh(new THREE.CylinderGeometry(0.14, 0.18, y, 8), toon('#5b5f6b'));
    pole.position.set(s * 2.4, y / 2 - 1, 0);
    grp.add(pole);
  }
  b.place(grp, x, z, rot);
  b.block(x - Math.cos(rot) * 2.4, z + Math.sin(rot) * 2.4, 0.3);
  b.block(x + Math.cos(rot) * 2.4, z - Math.sin(rot) * 2.4, 0.3);
  return {
    draw(fn: (g: CanvasRenderingContext2D, w: number, h: number) => void) {
      g.fillStyle = '#141824';
      g.fillRect(0, 0, c.width, c.height);
      fn(g, c.width, c.height);
      tex.needsUpdate = true;
    },
  };
}

/** Stadyum ışığı: uzun direk, üstte ışık paneli (gece yanar ve sahayı aydınlatır). */
function floodlight(b: WorldBuilder, x: number, z: number, faceX: number, faceZ: number, h = 9) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.16, 0.24, h, 8), toon('#5b5f6b')).translateY(h / 2));
  const head = new THREE.Group();
  head.add(outline(mesh(new THREE.BoxGeometry(2.2, 1.2, 0.3), toon('#3a3f4a')), 1.04));
  for (let i = 0; i < 6; i++) {
    const l = mesh(new THREE.CircleGeometry(0.25, 12), toon('#fff6c9', { emissive: '#665500' }), false);
    l.position.set(-0.7 + (i % 3) * 0.7, i < 3 ? 0.27 : -0.27, 0.16);
    head.add(l);
  }
  head.position.y = h + 0.4;
  head.lookAt(new THREE.Vector3(faceX - x, -3, faceZ - z));
  g.add(head);
  b.place(g, x, z);
  b.block(x, z, 0.35);
  b.lamps.push(new THREE.Vector3(x, b.h(x, z) + h + 0.4, z));
}

/** Sahanın tepesinde geniş ışık: gece stadyum ışıkları sahayı aydınlatır. */
function fieldLight(b: WorldBuilder, x: number, z: number, y: number, reach: number) {
  const l = new THREE.PointLight('#fff1d6', 0, reach, 0.9);
  l.position.set(x, y, z);
  l.userData.moving = true;
  b.scene.add(l);
  b.tick(() => {
    l.intensity = b.night() * 20;
  });
}

/** Kale ağı dokusu (ince beyaz ızgara). */
let netTex: THREE.Texture | null = null;
function netTexture() {
  if (netTex) return netTex;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  g.strokeStyle = 'rgba(255,255,255,0.9)';
  g.lineWidth = 3;
  for (let i = 0; i <= 64; i += 16) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i, 64);
    g.moveTo(0, i);
    g.lineTo(64, i);
    g.stroke();
  }
  netTex = new THREE.CanvasTexture(c);
  netTex.wrapS = netTex.wrapT = THREE.RepeatWrapping;
  return netTex;
}
function netMat(rx: number, ry: number) {
  const t = netTexture().clone();
  t.repeat.set(rx, ry);
  t.needsUpdate = true;
  return new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false, alphaTest: 0.05 });
}

/** Sevimli kaleci robot. */
function keeperModel(color: string) {
  const g = new THREE.Group();
  const body = outline(mesh(new THREE.CapsuleGeometry(0.45, 0.7, 6, 14), toon(color)), 1.05);
  body.position.y = 1.0;
  const head = outline(mesh(new THREE.SphereGeometry(0.42, 16, 12), toon('#f4f6fb')), 1.05);
  head.position.y = 2.05;
  const visor = mesh(new THREE.BoxGeometry(0.55, 0.2, 0.1), toon('#2b2f3a'), false);
  visor.position.set(0, 2.08, 0.37);
  const eyeM = new THREE.MeshBasicMaterial({ color: '#7ff5ff' });
  for (const s of [-0.12, 0.12]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), eyeM);
    e.position.set(s, 2.08, 0.43);
    g.add(e);
  }
  const ant = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.35, 6), toon('#5b5f6b'), false);
  ant.position.y = 2.55;
  const bulb = mesh(new THREE.SphereGeometry(0.08, 8, 6), toon('#ffd43b', { emissive: '#7a6000' }), false);
  bulb.position.y = 2.75;
  const arms = new THREE.Group();
  arms.name = 'arms';
  arms.position.y = 1.35;
  for (const s of [-1, 1]) {
    const arm = mesh(new THREE.CapsuleGeometry(0.12, 0.55, 4, 8), toon(color));
    arm.position.set(s * 0.62, 0.15, 0);
    arm.rotation.z = s * 0.9;
    const glove = outline(mesh(new THREE.SphereGeometry(0.2, 10, 8), toon('#ffd43b')), 1.06);
    glove.position.set(s * 0.95, 0.45, 0.05);
    arms.add(arm, glove);
  }
  g.add(body, head, visor, ant, bulb, arms);
  return g;
}

// ================================================================================================
// Futbol
// ================================================================================================
function buildFootball(b: WorldBuilder) {
  const { x: FX, z: FZ } = FOOTBALL;
  const HL = 15, HW = 9; // sahanın yarı boyu (x) ve yarı eni (z)
  const GW = 2.9, GH = 2.6, GD = 1.8; // kale ağzının yarı genişliği, yüksekliği, derinliği
  const R = 0.42;
  b.keepOut.push({ x: FX, z: FZ, r: 26 });
  const y0 = b.h(FX, FZ);
  // çim: açık ve koyu şeritler
  for (let i = 0; i < 10; i++) {
    const s = mesh(new THREE.PlaneGeometry(3, HW * 2).rotateX(-Math.PI / 2), toon(i % 2 ? '#62b94f' : '#71c75c'), false);
    s.receiveShadow = true;
    b.place(s, FX - HL + 1.5 + i * 3, FZ, 0, 0.05);
  }
  const edge = mesh(new THREE.PlaneGeometry(HL * 2 + 6, HW * 2 + 4).rotateX(-Math.PI / 2), toon('#58a948'), false);
  edge.receiveShadow = true;
  b.place(edge, FX, FZ, 0, 0.03);
  // çizgiler
  const lm = toon('#ffffff');
  const line = (x: number, z: number, w: number, d: number) => b.place(mesh(new THREE.BoxGeometry(w, 0.02, d), lm, false), FX + x, FZ + z, 0, 0.07);
  line(0, -HW, HL * 2, 0.16);
  line(0, HW, HL * 2, 0.16);
  line(-HL, 0, 0.16, HW * 2);
  line(HL, 0, 0.16, HW * 2);
  line(0, 0, 0.16, HW * 2);
  for (const s of [-1, 1]) {
    // ceza sahası ve kale alanı
    line(s * (HL - 4), 0, 0.16, 12);
    line(s * (HL - 2), -6, 4, 0.16);
    line(s * (HL - 2), 6, 4, 0.16);
    line(s * (HL - 1.5), 0, 0.16, 7);
    line(s * (HL - 0.75), -3.5, 1.5, 0.16);
    line(s * (HL - 0.75), 3.5, 1.5, 0.16);
    const spot = mesh(new THREE.CircleGeometry(0.18, 12).rotateX(-Math.PI / 2), lm, false);
    b.place(spot, FX + s * (HL - 3), FZ, 0, 0.08);
  }
  const ring = mesh(new THREE.RingGeometry(2.9, 3.06, 40).rotateX(-Math.PI / 2), lm, false);
  b.place(ring, FX, FZ, 0, 0.08);
  // köşe bayrakları
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const fl = new THREE.Group();
    fl.add(mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 6), toon('#ffffff')).translateY(0.8));
    const flag = mesh(new THREE.PlaneGeometry(0.5, 0.35), new THREE.MeshToonMaterial({ color: '#ffd43b', side: THREE.DoubleSide }), false);
    flag.position.set(0.25, 1.4, 0);
    fl.add(flag);
    b.place(fl, FX + sx * HL, FZ + sz * HW);
  }
  // kaleler (sol: mavi, sağ: kırmızı)
  const nets: THREE.Group[] = [];
  for (const side of [-1, 1]) {
    const col = side < 0 ? '#4d8bff' : '#ff5a5a';
    const goal = new THREE.Group();
    const post = (w: number, h: number, d: number, x: number, y: number, z: number, c = '#ffffff') => {
      const m = outline(mesh(new THREE.BoxGeometry(w, h, d), toon(c)), 1.04);
      m.position.set(x, y, z);
      goal.add(m);
    };
    for (const gz of [-GW, GW]) post(0.22, GH, 0.22, 0, GH / 2, gz);
    post(0.22, 0.22, GW * 2 + 0.22, 0, GH, 0);
    // arkadaki çerçeve (takım rengi)
    for (const gz of [-GW, GW]) post(0.1, GH * 0.8, 0.1, side * GD, GH * 0.4, gz, col);
    post(0.1, 0.1, GW * 2, side * GD, GH * 0.8, 0, col);
    // ağ
    const nb = new THREE.Mesh(new THREE.PlaneGeometry(GW * 2, GH * 0.8), netMat(6, 2.5));
    nb.rotation.y = Math.PI / 2;
    nb.position.set(side * GD, GH * 0.4, 0);
    const top = new THREE.Mesh(new THREE.PlaneGeometry(GD, GW * 2), netMat(2, 6));
    top.rotation.x = -Math.PI / 2;
    top.rotation.z = side * 0.11;
    top.position.set(side * GD / 2, GH * 0.9, 0);
    goal.add(nb, top);
    for (const gz of [-GW, GW]) {
      const sn = new THREE.Mesh(new THREE.PlaneGeometry(GD, GH * 0.9), netMat(2, 2.5));
      sn.position.set(side * GD / 2, GH * 0.45, gz);
      goal.add(sn);
    }
    b.place(goal, FX + side * HL, FZ);
    nets.push(goal);
    for (const gz of [-GW, GW]) b.block(FX + side * HL, FZ + gz, 0.25);
  }
  // reklam panoları (top bunlara çarpıp geri döner)
  const BX = HL + 2.4, BZ = HW + 1.4;
  const pcols = ['#ff6b6b', '#ffd43b', '#4dabf7', '#69db7c', '#ff8fb1', '#9775fa'];
  let pi = 0;
  // panoların içinden geçilmez; sahaya kalelerin yanındaki açıklıktan girilir
  const pano = (w: number, d: number) => {
    const m = outline(mesh(new THREE.BoxGeometry(w, 0.7, d), toon(pcols[pi++ % pcols.length])), 1.03);
    m.userData.foot = { w: Math.max(w, 0.4), d: Math.max(d, 0.4) };
    return m;
  };
  for (let x = -BX + 2; x <= BX - 2; x += 4) for (const s of [-1, 1]) b.place(pano(3.9, 0.18), FX + x, FZ + s * BZ, 0, 0.35);
  for (let z = -BZ + 2; z <= BZ - 2; z += 4) for (const s of [-1, 1]) {
    if (Math.abs(z) < GW + 1) continue;
    b.place(pano(0.18, 3.9), FX + s * BX, FZ + z, 0, 0.35);
  }
  // tribünler
  for (const s of [-1, 1]) {
    for (let r = 0; r < 4; r++) {
      const st = outline(mesh(new THREE.BoxGeometry(26, 0.5, 1.3), toon(['#5b8def', '#ffc83d', '#ff6b4a', '#69db7c'][r])), 1.01);
      b.place(st, FX, FZ + s * (BZ + 1.6 + r * 1.3), 0, 0.25 + r * 0.55);
    }
    for (let x = -12; x <= 12; x += 4) b.block(FX + x, FZ + s * (BZ + 3.5), 2.4);
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) floodlight(b, FX + sx * (BX + 1.5), FZ + sz * (BZ + 1.5), FX, FZ, 10);
  for (const sx of [-1, 1]) fieldLight(b, FX + sx * 8, FZ, y0 + 13, 34);
  // tabela ve skor tabelası
  b.place(sign('Futbol Sahası', '#ffffff'), FX - HL - 4, FZ + HW + 2, -Math.PI / 2);
  const board = scoreboard(b, FX, FZ - BZ - 7.5, 0, 6.2);

  // kaleciler
  const keepers = [-1, 1].map((side) => {
    const m = keeperModel(side < 0 ? '#4d8bff' : '#ff5a5a');
    b.place(m, FX + side * (HL - 0.8), FZ, side < 0 ? Math.PI / 2 : -Math.PI / 2, 0);
    return { side, m, z: 0, dive: 0 };
  });

  // top
  // beyaz top, on iki siyah beşgen yama
  const ball = outline(mesh(new THREE.SphereGeometry(R, 20, 16), toon('#ffffff')), 1.06);
  ball.userData.noTap = true; // top, arkasındaki mekâna dokunmayı engellemesin
  const ico = new THREE.IcosahedronGeometry(1, 0).getAttribute('position');
  const seen = new Set<string>();
  const patch = new THREE.CircleGeometry(R * 0.36, 5);
  const black = toon('#2b2d33');
  for (let i = 0; i < ico.count; i++) {
    const d = new THREE.Vector3().fromBufferAttribute(ico, i).normalize();
    const k = d.toArray().map((n) => n.toFixed(2)).join();
    if (seen.has(k)) continue;
    seen.add(k);
    const m = mesh(patch, black, false);
    m.position.copy(d).multiplyScalar(R * 0.985);
    m.lookAt(d.clone().multiplyScalar(2));
    ball.add(m);
  }
  b.place(ball, FX, FZ, 0, R);
  b.ball = ball;
  const p = ball.position, v = new THREE.Vector3();
  const floor = y0 + R;
  p.y = floor;

  // durum
  let owner = false; // topa en son ben mi dokundum (gol ve skoru ben sayarım)
  let L = 0, Rr = 0; // Mavi takım (sağ kaleye atar) - Kırmızı takım (sol kaleye atar)
  let endAt = 0; // maçın bitiş zamanı (ms), 0: serbest oyun
  let inGoal = 0; // top kalede (hangi kale), tekrar sayılmasın
  let resetIn = 0;
  let sendT = 0;
  let cool = 0;
  let heroSpeed = 0;
  let lastSec = -1;
  const last = new THREE.Vector3(Infinity, 0, 0);
  const auth = () => owner || b.peerCount() === 0;
  const send = () => b.netSend('fb', { x: r2(p.x - FX), y: r2(p.y - y0), z: r2(p.z - FZ), vx: r2(v.x), vy: r2(v.y), vz: r2(v.z), L, R: Rr, e: endAt, g: inGoal });
  const fmt = (ms: number) => {
    const s = Math.max(0, Math.ceil(ms / 1000));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };
  const redraw = () =>
    board.draw((g, w, h) => {
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.font = 'bold 34px Nunito, system-ui, sans-serif';
      g.fillStyle = '#4d8bff';
      g.fillText('MAVİ', w * 0.22, 42);
      g.fillStyle = '#ff5a5a';
      g.fillText('KIRMIZI', w * 0.78, 42);
      g.font = 'bold 110px Nunito, system-ui, sans-serif';
      g.fillStyle = '#ffffff';
      g.fillText(String(L), w * 0.22, 128);
      g.fillText(String(Rr), w * 0.78, 128);
      g.fillStyle = '#ffd43b';
      g.fillText(':', w / 2, 122);
      g.font = 'bold 30px Nunito, system-ui, sans-serif';
      g.fillStyle = endAt ? '#7dff9b' : '#c9d1e3';
      g.fillText(endAt ? `MAÇ  ${fmt(endAt - Date.now())}` : 'SERBEST OYUN', w / 2, h - 30);
    });
  redraw();
  const center = () => {
    p.set(FX, floor + 1.2, FZ);
    v.set(0, 0, 0);
    inGoal = 0;
  };

  b.netIn.fb = (d: Record<string, number>) => {
    p.set(FX + d.x, y0 + d.y, FZ + d.z);
    v.set(d.vx, d.vy, d.vz);
    if (d.L !== L || d.R !== Rr || d.e !== endAt) {
      L = d.L;
      Rr = d.R;
      endAt = d.e;
      redraw();
    }
    inGoal = d.g ?? 0;
    owner = false;
    resetIn = 0;
  };

  const goal = (side: number) => {
    inGoal = side;
    b.sparkles.burst(new THREE.Vector3(FX + side * (HL + 1), y0 + 1.6, FZ), 30);
    b.sparkles.burst(new THREE.Vector3(FX + side * (HL + 1), y0 + 2.4, FZ), 20, side < 0 ? '#4d8bff' : '#ff5a5a');
    b.sound.fx?.('cheer');
    nets[side < 0 ? 0 : 1].userData.shake = 1;
    if (!auth()) {
      resetIn = 4; // sahibinden haber gelmezse kendimiz ortalarız
      return;
    }
    if (side > 0) L++;
    else Rr++;
    redraw();
    send();
    resetIn = 1.8;
    const team = side > 0 ? 'Mavi' : 'Kırmızı';
    b.done(owner ? 'goal' : 'goal-team', `Gooool! ${team} takım. Skor ${L} - ${Rr}`);
  };

  // maç başlat
  b.spot({
    id: 'match', x: FX - 6, z: FZ + HW + 0.6, r: 2.6, label: 'Maç başlat',
    body: { x: FX - 6, z: FZ + HW + 0.6, r: 0.4 },
    dyn: () => (endAt ? 'Yeni maç başlat' : 'Maç başlat'),
    act: {
      dur: 1.2, pose: 'cheer', quest: 'goal-match',
      start: () => {
        L = Rr = 0;
        endAt = Date.now() + 120_000;
        center();
        owner = true;
        redraw();
        send();
        b.sound.fx?.('referee');
      },
      step() {},
      end: () => 'Maç başladı! 2 dakika. Mavi takım kırmızı kaleye, kırmızı takım mavi kaleye atar.',
    },
  });

  b.tick((dt, t, a: Actor) => {
    // uzaktaysak ve top duruyorsa hiçbir şey yapma
    const far = Math.abs(a.pos.x - FX) > 60 || Math.abs(a.pos.z - FZ) > 60;
    if (far && v.lengthSq() < 0.01 && !endAt && resetIn <= 0) {
      last.set(Infinity, 0, 0);
      return;
    }
    heroSpeed = Number.isFinite(last.x) ? Math.hypot(a.pos.x - last.x, a.pos.z - last.z) / Math.max(dt, 1e-3) : 0;
    last.copy(a.pos);
    cool -= dt;
    // maç süresi
    if (endAt) {
      const sec = Math.ceil((endAt - Date.now()) / 1000);
      if (sec !== lastSec) {
        lastSec = sec;
        redraw();
      }
      if (sec <= 0) {
        endAt = 0;
        redraw();
        b.sound.fx?.('referee');
        const res = L === Rr ? `Berabere! ${L} - ${Rr}` : `${L > Rr ? 'Mavi' : 'Kırmızı'} takım kazandı! ${L} - ${Rr}`;
        if (!far) b.done('goal-end', `Maç bitti! ${res}`);
      }
    }
    if (resetIn > 0 && (resetIn -= dt) <= 0) {
      center();
      if (auth()) send();
    }
    // vuruş: topa dokun (yürüyerek hafif, koşarak sert)
    const dx = p.x - a.pos.x, dz = p.z - a.pos.z, dh = Math.hypot(dx, dz);
    if (!inGoal && dh < R + 0.8 && p.y - a.pos.y < 1.7 && cool <= 0) {
      const fwd = new THREE.Vector3(Math.sin(a.heading), 0, Math.cos(a.heading));
      const dir = new THREE.Vector3(dx, 0, dz).normalize().multiplyScalar(0.45).addScaledVector(fwd, 0.55).normalize();
      // kaleye doğru biraz yardım
      const gx = FX + Math.sign(dir.x || 1) * (HL + 0.6);
      const toGoal = new THREE.Vector3(gx - p.x, 0, FZ - p.z).normalize();
      if (dir.dot(toGoal) > 0.7 && Math.abs(gx - p.x) < 18) dir.lerp(toGoal, 0.35).normalize();
      const run = heroSpeed > 11;
      const power = run ? 17 : heroSpeed > 2 ? 10 : 6;
      v.set(dir.x * power, run ? 3.8 : 1.4, dir.z * power);
      p.x = a.pos.x + dir.x * (R + 0.85);
      p.z = a.pos.z + dir.z * (R + 0.85);
      cool = 0.3;
      owner = true;
      send();
      b.sound.kick();
    }
    // fizik (iki alt adım: hızlı top kalecinin içinden geçmesin)
    for (let k = 0; k < 2; k++) {
      const h = dt / 2;
      const px = p.x;
      v.y -= 20 * h;
      p.addScaledVector(v, h);
      if (p.y < floor) {
        p.y = floor;
        v.y = v.y < -2.5 ? -v.y * 0.5 : 0;
      }
      const ground = p.y <= floor + 0.02;
      const drag = Math.pow(ground ? 0.42 : 0.9, h);
      v.x *= drag;
      v.z *= drag;
      const lz = p.z - FZ;
      for (const side of [-1, 1]) {
        const lineX = FX + side * HL;
        const was = side * (px - lineX), now = side * (p.x - lineX);
        if (was <= 0 && now > 0 && Math.abs(lz) < GW - R * 0.3 && p.y < GH - R * 0.5 && !inGoal) goal(side);
        // kalenin içi: ağ topu tutar
        if (inGoal === side && now > 0) {
          if (now > GD - R) {
            p.x = lineX + side * (GD - R);
            v.x *= -0.25;
          }
          if (Math.abs(lz) > GW - R) {
            p.z = FZ + Math.sign(lz) * (GW - R);
            v.z *= -0.3;
          }
          if (p.y > y0 + GH - R) {
            p.y = y0 + GH - R;
            v.y = Math.min(0, v.y);
          }
        } else if (now > 0 && now < GD && Math.abs(lz) < GW + R && p.y < GH + R) {
          // kalenin yan ağından içeri giremez
          if (Math.abs(lz) > GW - 0.2) {
            p.z = FZ + Math.sign(lz) * (GW + R);
            v.z = Math.abs(v.z) * Math.sign(lz) * 0.5;
          }
        }
      }
      // panolar
      if (Math.abs(p.x - FX) > BX - R) {
        p.x = FX + Math.sign(p.x - FX) * (BX - R);
        v.x *= -0.6;
      }
      if (Math.abs(p.z - FZ) > BZ - R) {
        p.z = FZ + Math.sign(p.z - FZ) * (BZ - R);
        v.z *= -0.6;
      }
      // kaleciler
      for (const kp of keepers) {
        const kx = FX + kp.side * (HL - 0.8), kz = FZ + kp.z;
        const ddx = p.x - kx, ddz = p.z - kz, ddy = p.y - (y0 + 1.1);
        if (ddx * ddx + ddz * ddz + ddy * ddy * 0.4 < 1.0 && v.x * kp.side > 0 && !inGoal) {
          v.x = -Math.abs(v.x) * kp.side * 0.55 - kp.side * 3;
          v.z += (Math.random() - 0.5) * 7;
          v.y = 3.5;
          kp.dive = 1;
          b.sound.fx?.('bonk');
          if (auth()) send();
        }
      }
    }
    // kaleciler topu izler (yavaşça; köşeye atılan şut girer)
    for (const kp of keepers) {
      const coming = v.x * kp.side > 1 || Math.abs(p.x - (FX + kp.side * HL)) < 9;
      const want = coming ? clamp(p.z - FZ, -GW + 0.7, GW - 0.7) : 0;
      kp.z += clamp(want - kp.z, -2.3 * dt, 2.3 * dt);
      kp.dive = Math.max(0, kp.dive - dt * 2);
      kp.m.position.set(FX + kp.side * (HL - 0.8), y0 + Math.abs(Math.sin(t * 6)) * 0.08 + kp.dive * 0.4, FZ + kp.z);
      const arms = kp.m.getObjectByName('arms');
      if (arms) arms.rotation.z = Math.sin(t * 5) * 0.12 + kp.dive * 0.6;
    }
    // ağ sallanır
    for (const n of nets) {
      const s = (n.userData.shake as number) ?? 0;
      if (s > 0) {
        n.userData.shake = Math.max(0, s - dt * 1.5);
        n.scale.x = 1 + Math.sin(t * 30) * 0.08 * s;
      }
    }
    // dönme
    ball.rotation.x += v.z * dt * 2;
    ball.rotation.z -= v.x * dt * 2;
    // sahibi top hareket ederken durumu ara ara yollar (herkeste aynı kalsın)
    sendT -= dt;
    if (owner && sendT <= 0 && v.lengthSq() > 0.3) {
      sendT = 0.6;
      send();
    }
  });
}

// ================================================================================================
// Basket
// ================================================================================================
function buildBasket(b: WorldBuilder) {
  const { x: CX, z: CZ } = BASKET;
  const HL = 10, HW = 6;
  const BR = 0.3, RIM_R = 0.5, RIM_H = 3.3, G = 18;
  b.keepOut.push({ x: CX, z: CZ, r: 17 });
  const y0 = b.h(CX, CZ);
  const rimY = y0 + RIM_H;
  // zemin: mavi saha, turuncu boyalı alanlar
  const base = mesh(new THREE.PlaneGeometry(HL * 2 + 4, HW * 2 + 4).rotateX(-Math.PI / 2), toon('#4f7fc0'), false);
  base.receiveShadow = true;
  b.place(base, CX, CZ, 0, 0.04);
  const court = mesh(new THREE.PlaneGeometry(HL * 2, HW * 2).rotateX(-Math.PI / 2), toon('#e9a663'), false);
  court.receiveShadow = true;
  b.place(court, CX, CZ, 0, 0.05);
  const lm = toon('#ffffff');
  const line = (x: number, z: number, w: number, d: number) => b.place(mesh(new THREE.BoxGeometry(w, 0.02, d), lm, false), CX + x, CZ + z, 0, 0.07);
  line(0, -HW, HL * 2, 0.14);
  line(0, HW, HL * 2, 0.14);
  line(-HL, 0, 0.14, HW * 2);
  line(HL, 0, 0.14, HW * 2);
  line(0, 0, 0.14, HW * 2);
  b.place(mesh(new THREE.RingGeometry(1.7, 1.84, 36).rotateX(-Math.PI / 2), lm, false), CX, CZ, 0, 0.07);
  const hoops = [-1, 1].map((side) => {
    const hx = CX + side * (HL - 1.4);
    // boyalı alan ve üçlük çizgisi
    const key = mesh(new THREE.PlaneGeometry(4.2, 3.4).rotateX(-Math.PI / 2), toon('#d9534f'), false);
    b.place(key, CX + side * (HL - 2.1), CZ, 0, 0.06);
    const arc = mesh(new THREE.RingGeometry(5.9, 6.04, 40, 1, side > 0 ? Math.PI / 2 : -Math.PI / 2, Math.PI).rotateX(-Math.PI / 2), lm, false);
    b.place(arc, hx, CZ, 0, 0.07);
    b.place(mesh(new THREE.RingGeometry(1.1, 1.24, 30).rotateX(-Math.PI / 2), lm, false), CX + side * (HL - 4.2), CZ, 0, 0.075);
    // direk, kol, pano, çember ve file
    const g = new THREE.Group();
    const pole = outline(mesh(new THREE.CylinderGeometry(0.16, 0.2, RIM_H + 1.2, 10), toon('#3a3f4a')), 1.04);
    pole.position.set(side * 1.6, (RIM_H + 1.2) / 2, 0);
    const arm = mesh(new THREE.BoxGeometry(1.1, 0.16, 0.16), toon('#3a3f4a'));
    arm.position.set(side * 1.1, RIM_H + 0.6, 0);
    const boardM = outline(mesh(new THREE.BoxGeometry(0.1, 1.3, 2.0), toon('#ffffff')), 1.03);
    boardM.position.set(side * 0.62, RIM_H + 0.5, 0);
    const sq = mesh(new THREE.BoxGeometry(0.02, 0.5, 0.65), toon('#ef4b4b'), false);
    sq.position.set(side * 0.56, RIM_H + 0.3, 0);
    const rim = mesh(new THREE.TorusGeometry(RIM_R, 0.045, 8, 28), toon('#ff6b1a'));
    rim.rotation.x = Math.PI / 2;
    rim.position.set(0, RIM_H, 0);
    const net = new THREE.Mesh(new THREE.CylinderGeometry(RIM_R, RIM_R * 0.65, 0.7, 14, 1, true), netMat(5, 1.5));
    net.position.set(0, RIM_H - 0.35, 0);
    net.name = 'net';
    g.add(pole, arm, boardM, sq, rim, net);
    b.place(g, hx, CZ);
    b.block(hx + side * 1.6, CZ, 0.4);
    return { side, x: hx, net, shake: 0 };
  });
  b.place(sign('Basket Sahası', '#ffffff'), CX - HL - 3, CZ - HW - 1.5, -Math.PI / 2);
  // banklar
  for (const s of [-1, 1]) {
    const bench = outline(mesh(new THREE.BoxGeometry(6, 0.25, 0.7), toon('#c98a4b')), 1.04);
    b.place(bench, CX + s * 5, CZ + HW + 2.2, 0, 0.55);
    b.block(CX + s * 5, CZ + HW + 2.2, 1.6);
  }
  const board = scoreboard(b, CX, CZ - HW - 4, 0, 5.4);
  for (const sx of [-1, 1]) floodlight(b, CX + sx * (HL + 2.5), CZ + HW + 2.5, CX, CZ, 8);
  fieldLight(b, CX, CZ, y0 + 11, 28);

  // top
  const ballMat = toon('#f08a24');
  const ball = outline(mesh(new THREE.SphereGeometry(BR, 18, 14), ballMat), 1.07);
  ball.userData.noTap = true; // taşınan top, arkasındaki mekâna dokunmayı engellemesin
  for (const r of [0, Math.PI / 2]) {
    const seam = mesh(new THREE.TorusGeometry(BR + 0.003, 0.012, 4, 24), toon('#3a2b27'), false);
    seam.rotation.y = r;
    ball.add(seam);
  }
  const eq = mesh(new THREE.TorusGeometry(BR + 0.003, 0.012, 4, 24), toon('#3a2b27'), false);
  eq.rotation.x = Math.PI / 2;
  ball.add(eq);
  b.place(ball, CX, CZ, 0, BR);
  const p = ball.position, v = new THREE.Vector3();
  const floor = y0 + BR;
  p.y = floor;

  // durum
  let holder = ''; // '' boşta, 'me' bende, yoksa topu tutan arkadaşın kimliği
  let owner = false;
  let pts: Record<string, number> = {};
  let shotFrom = 0;
  let scored = false;
  let cool = 0;
  let sendT = 0;
  let dribbleUp = true;
  const auth = () => owner || b.peerCount() === 0;
  const send = () => b.netSend('bb', { x: r2(p.x - CX), y: r2(p.y - y0), z: r2(p.z - CZ), vx: r2(v.x), vy: r2(v.y), vz: r2(v.z), h: holder === 'me' ? 1 : 0, p: pts });
  const redraw = () =>
    board.draw((g, w, h) => {
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.font = 'bold 32px Nunito, system-ui, sans-serif';
      g.fillStyle = '#ffb35a';
      g.fillText('BASKET', w / 2, 34);
      const list = Object.entries(pts).sort((a, c) => c[1] - a[1]).slice(0, 3);
      if (!list.length) {
        g.font = 'bold 30px Nunito, system-ui, sans-serif';
        g.fillStyle = '#c9d1e3';
        g.fillText('Topu al, potaya at!', w / 2, h / 2 + 20);
        return;
      }
      list.forEach(([n, s], i) => {
        const y = 92 + i * 46;
        g.font = 'bold 34px Nunito, system-ui, sans-serif';
        g.textAlign = 'left';
        g.fillStyle = ['#ffd43b', '#ffffff', '#c9d1e3'][i];
        g.fillText(n.slice(0, 12), 40, y);
        g.textAlign = 'right';
        g.fillText(String(s), w - 40, y);
      });
    });
  redraw();

  b.netIn.bb = (d: Record<string, unknown>, from: string) => {
    const held = d.h === 1;
    // top bendeyken, tutmayan birinin eski durumu topu elimden almasın
    if (holder === 'me' && !held) return;
    p.set(CX + (d.x as number), y0 + (d.y as number), CZ + (d.z as number));
    v.set(d.vx as number, d.vy as number, d.vz as number);
    holder = held ? from : '';
    owner = false;
    scored = false;
    pts = (d.p as Record<string, number>) ?? {};
    redraw();
  };

  const take = () => {
    holder = 'me';
    owner = true;
    scored = false;
    v.set(0, 0, 0);
    cool = 0.4;
    send();
    b.sound.pop();
  };
  const shoot = (a: Actor, hp: (typeof hoops)[number]) => {
    const fwd = new THREE.Vector3(Math.sin(a.heading), 0, Math.cos(a.heading));
    const start = a.pos.clone().add(new THREE.Vector3(0, 2.3, 0)).addScaledVector(fwd, 0.4);
    const target = new THREE.Vector3(hp.x, rimY + 0.05, CZ);
    const d = Math.hypot(target.x - start.x, target.z - start.z);
    const chance = d < 3 ? 0.9 : d < 5 ? 0.72 : d < 7 ? 0.55 : 0.4;
    if (Math.random() > chance) {
      // ıska: çemberin kenarına
      const ang = Math.random() * Math.PI * 2;
      target.x += Math.cos(ang) * (RIM_R + 0.05);
      target.z += Math.sin(ang) * (RIM_R + 0.05);
    }
    const T = 0.8 + d * 0.06;
    p.copy(start);
    v.set((target.x - start.x) / T, (target.y - start.y) / T + 0.5 * G * T, (target.z - start.z) / T);
    holder = '';
    owner = true;
    scored = false;
    shotFrom = d;
    cool = 0.8;
    send();
    b.sound.whoosh?.();
  };

  for (const hp of hoops) {
    const sx = hp.x - hp.side * 3.6;
    b.spot({
      id: `basket${hp.side > 0 ? 'R' : 'L'}`, x: sx, z: CZ, r: 5, label: 'Basket at!',
      body: { x: sx, z: CZ, r: 0.3 },
      dyn: () => (holder === 'me' ? 'Basket at!' : holder ? 'Top arkadaşında' : 'Topu al'),
      use: () => {
        if (holder === 'me') {
          let thrown = false;
          return {
            dur: 1.0, pose: (u: number) => (u < 0.55 ? 'jump' : 'cheer'), quest: 'basket',
            step: (_t: number, u: number, a: Actor) => {
              a.heading = Math.atan2(hp.x - a.pos.x, CZ - a.pos.z);
              if (!thrown && u > 0.4) {
                thrown = true;
                shoot(a, hp);
              }
            },
          };
        }
        if (holder) return { msg: 'Top şu an arkadaşında. Yanına git, topa dokunup kap!' };
        take();
        b.sparkles.burst(p.clone(), 10, '#ffb35a');
        return { msg: 'Top sende! Potaya dön ve "Basket at!" de.' };
      },
    });
  }

  b.tick((dt, t, a: Actor) => {
    const far = Math.abs(a.pos.x - CX) > 60 || Math.abs(a.pos.z - CZ) > 60;
    if (far && !holder && v.lengthSq() < 0.01) return;
    cool -= dt;
    const fwd = new THREE.Vector3(Math.sin(a.heading), 0, Math.cos(a.heading));
    if (holder === 'me') {
      // sektirerek taşı
      if (far) {
        holder = '';
        p.set(CX, floor, CZ);
        v.set(0, 0, 0);
        send();
        return;
      }
      const bounce = Math.abs(Math.sin(t * 6));
      p.set(a.pos.x + fwd.x * 0.75 + fwd.z * 0.3, Math.max(a.pos.y, y0) + BR + bounce * 1.0, a.pos.z + fwd.z * 0.75 - fwd.x * 0.3);
      if (bounce < 0.15 && !dribbleUp) {
        dribbleUp = true;
        b.sound.fx?.('bounce');
      } else if (bounce > 0.5) dribbleUp = false;
      ball.rotation.x += dt * 6;
      return;
    }
    if (holder) {
      const pp = b.peerPos(holder);
      if (!pp) {
        holder = '';
      } else {
        const bounce = Math.abs(Math.sin(t * 6));
        p.set(pp.x + 0.7, Math.max(pp.y, y0) + BR + bounce * 1.0, pp.z);
        // arkadaşın elinden kap
        if (Math.hypot(a.pos.x - p.x, a.pos.z - p.z) < 1.0 && cool <= 0) take();
        return;
      }
    }
    // boşta: yerden al
    if (cool <= 0 && Math.hypot(a.pos.x - p.x, a.pos.z - p.z) < 1.1 && p.y - a.pos.y < 2.4) {
      take();
      return;
    }
    // fizik
    for (let k = 0; k < 3; k++) {
      const h = dt / 3;
      const py = p.y;
      v.y -= G * h;
      p.addScaledVector(v, h);
      if (p.y < floor) {
        p.y = floor;
        if (v.y < -1.5) {
          v.y = -v.y * 0.72;
          if (k === 0) b.sound.fx?.('bounce');
        } else v.y = 0;
      }
      const ground = p.y <= floor + 0.02;
      const drag = Math.pow(ground ? 0.55 : 0.97, h);
      v.x *= drag;
      v.z *= drag;
      for (const hp of hoops) {
        // pano
        const bx = hp.x + hp.side * 0.56;
        if (hp.side * (p.x - bx) > -BR && hp.side * (p.x - bx) < 0.3 && Math.abs(p.z - CZ) < 1.0 && p.y > rimY - 0.2 && p.y < rimY + 1.2 && v.x * hp.side > 0) {
          p.x = bx - hp.side * BR;
          v.x = -v.x * 0.55;
          b.sound.fx?.('thump');
        }
        // çember: yukarıdan aşağı geçiş
        if (py >= rimY && p.y < rimY && v.y < 0) {
          const dd = Math.hypot(p.x - hp.x, p.z - CZ);
          if (dd < RIM_R - BR * 0.4 && !scored) {
            scored = true;
            v.x *= 0.15;
            v.z *= 0.15;
            v.y = Math.min(v.y, -2);
            hp.shake = 1;
            b.sound.fx?.('swish');
            b.sparkles.burst(new THREE.Vector3(hp.x, rimY - 0.3, CZ), 22, '#ffb35a');
            if (auth()) {
              const n = b.myName;
              const add = shotFrom > 6 ? 3 : 2;
              pts = { ...pts, [n]: (pts[n] ?? 0) + add };
              redraw();
              send();
              b.done('basket-score', add === 3 ? 'Üçlük! Harika atış!' : 'Basket! +2 sayı');
            }
          } else if (dd < RIM_R + BR) {
            // çembere çarptı: dışarı sek
            const ox = (p.x - hp.x) / (dd || 1), oz = (p.z - CZ) / (dd || 1);
            p.y = rimY + 0.01;
            v.y = Math.abs(v.y) * 0.45;
            v.x = ox * 2.6 + v.x * 0.2;
            v.z = oz * 2.6 + v.z * 0.2;
            b.sound.fx?.('rim');
          }
        }
      }
      // sahanın kenarı
      if (Math.abs(p.x - CX) > HL + 1.6) {
        p.x = CX + Math.sign(p.x - CX) * (HL + 1.6);
        v.x *= -0.6;
      }
      if (Math.abs(p.z - CZ) > HW + 1.6) {
        p.z = CZ + Math.sign(p.z - CZ) * (HW + 1.6);
        v.z *= -0.6;
      }
    }
    ball.rotation.x += v.z * dt * 2.5;
    ball.rotation.z -= v.x * dt * 2.5;
    for (const hp of hoops) {
      if (hp.shake > 0) {
        hp.shake = Math.max(0, hp.shake - dt * 2);
        hp.net.scale.set(1 - hp.shake * 0.15, 1 + Math.sin(t * 25) * 0.1 * hp.shake, 1 - hp.shake * 0.15);
      }
    }
    sendT -= dt;
    if (owner && sendT <= 0 && v.lengthSq() > 0.3) {
      sendT = 0.6;
      send();
    }
  });
}

export function buildSports(b: WorldBuilder) {
  buildFootball(b);
  buildBasket(b);
}
