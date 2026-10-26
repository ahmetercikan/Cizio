/**
 * Platform oyunlarında zıplama yardımı (5-9 yaş için): çocuk bir platforma doğru zıplayınca karakter o platformun
 * üstüne inecek şekilde atılır. Açıyı ve hızı tam tutturmak gerekmez; yalnızca yöne bakmak yeter.
 *
 * Saf hesap (three.js yok): ada motoru (island.ts) kullanır, testler doğrudan çağırır.
 */

/** Üstüne basılabilen yüzey. `w`/`d` tam genişlik/derinlik; yuvarlaksa `w` çaptır. */
export interface Surface {
  x: number;
  y: number;
  z: number;
  w: number;
  d: number;
  round?: boolean;
  /** Kayan platform: `t` saniye sonra nerede olacak. */
  at?(t: number): { x: number; y: number; z: number };
}

export interface JumpPlan {
  /** Kalkış hızları. */
  vy: number;
  vx: number;
  vz: number;
  /** Havada kalma süresi. */
  t: number;
  /** İniş noktası. */
  tx: number;
  ty: number;
  tz: number;
}

export interface JumpLimits {
  /** Normal zıplama hızı. */
  vy: number;
  /** Yardım en çok bu kadar yükseğe atabilir (uzak ya da yüksek platform). */
  maxVy: number;
  /** En yüksek yatay hız. */
  maxH: number;
  /** Bakılan yönle hedef arasındaki en büyük açının kosinüsü (0,7 ≈ 45°). */
  cone?: number;
}

const inside = (s: Surface, x: number, z: number, pad: number) =>
  s.round ? Math.hypot(x - s.x, z - s.z) <= s.w / 2 + pad : Math.abs(x - s.x) <= s.w / 2 + pad && Math.abs(z - s.z) <= s.d / 2 + pad;

/** Yüzeyin kahramana en yakın, kenardan biraz içerideki noktası (kenara değil, sağlam bir yere iner). */
function landingPoint(s: { x: number; z: number; w: number; d: number; round?: boolean }, fx: number, fz: number): [number, number] {
  if (s.round) {
    const r = Math.max(0, s.w / 2 - Math.min(1, s.w * 0.25));
    const dx = fx - s.x, dz = fz - s.z, l = Math.hypot(dx, dz);
    return l <= r || l < 1e-6 ? [s.x, s.z] : [s.x + (dx / l) * r, s.z + (dz / l) * r];
  }
  const ix = Math.max(0, s.w / 2 - Math.min(1, s.w * 0.25)), iz = Math.max(0, s.d / 2 - Math.min(1, s.d * 0.25));
  return [Math.max(s.x - ix, Math.min(s.x + ix, fx)), Math.max(s.z - iz, Math.min(s.z + iz, fz))];
}

/** dy yüksekliğine vy hızıyla atılan cismin inişine kadar geçen süre (yoksa NaN). */
function fallTime(vy: number, dy: number, g: number) {
  const disc = vy * vy - 2 * g * dy;
  return disc < 0 ? NaN : (vy + Math.sqrt(disc)) / g;
}

/**
 * Bakılan yöndeki en uygun platformu seçip oraya inecek atışı hesaplar. Yön yoksa ya da ulaşılabilir platform
 * yoksa null (normal zıplama).
 */
export function planJump(from: { x: number; y: number; z: number }, dir: { x: number; z: number } | null, surfaces: Surface[], g: number, lim: JumpLimits): JumpPlan | null {
  if (!dir) return null;
  const dl = Math.hypot(dir.x, dir.z);
  if (dl < 1e-3) return null;
  const ux = dir.x / dl, uz = dir.z / dl;
  const cone = lim.cone ?? 0.7;
  let best: JumpPlan | null = null, bestScore = Infinity;
  for (const s of surfaces) {
    if (inside(s, from.x, from.z, 0.2) && Math.abs(s.y - from.y) < 0.6) continue; // üstünde durulan
    let pos = { x: s.x, y: s.y, z: s.z };
    let plan: JumpPlan | null = null;
    // kayan platformda inişin olacağı yere göre iki kez düzelt
    for (let k = 0; k < (s.at ? 3 : 1); k++) {
      const [tx, tz] = landingPoint({ ...s, ...pos }, from.x, from.z);
      const vx0 = tx - from.x, vz0 = tz - from.z, L = Math.hypot(vx0, vz0);
      if (L < 0.8) break;
      if ((vx0 * ux + vz0 * uz) / L < cone) break;
      const dy = pos.y - from.y;
      if (dy < -14) break;
      let vy = lim.vy;
      let t = fallTime(vy, dy, g);
      if (Number.isNaN(t)) {
        vy = Math.sqrt(2 * g * (dy + 0.6));
        t = fallTime(vy, dy, g);
      }
      if (L / t > lim.maxH) {
        // uzak: daha yükseğe atıp havada daha uzun kalsın
        const t2 = L / lim.maxH;
        vy = Math.max(vy, (dy + 0.5 * g * t2 * t2) / t2);
        t = fallTime(vy, dy, g);
      }
      if (vy > lim.maxVy || Number.isNaN(t)) break;
      plan = { vy, vx: vx0 / t, vz: vz0 / t, t, tx, ty: pos.y, tz };
      if (!s.at) break;
      pos = s.at(t);
    }
    if (!plan) continue;
    const L = Math.hypot(plan.tx - from.x, plan.tz - from.z);
    const cos = ((plan.tx - from.x) * ux + (plan.tz - from.z) * uz) / L;
    // en yakın ve en dümdüz önde olan; yukarı çıkmak biraz daha zor sayılır
    const score = L * (2.2 - cos) + Math.max(0, plan.ty - from.y) * 0.6;
    if (score < bestScore) [best, bestScore] = [plan, score];
  }
  return best;
}
