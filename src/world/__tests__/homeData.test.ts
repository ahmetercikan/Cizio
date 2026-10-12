import { describe, expect, it } from 'vitest';
import { canPlace, changePlan, footprint, lot, newHome, path, PLANS, plan, roomAt, useTile, wallAt, walls, ITEMS, item } from '../homeData';

describe('ev planları', () => {
  it('her planda bütün odalara ön kapıdan yürünür', () => {
    for (const P of PLANS) {
      const L = lot(P);
      const h = { ...newHome(), plan: P.id, items: [] };
      const start: [number, number] = [P.front.x + L.hx, P.front.z + L.hz + 1];
      expect(roomAt(P, ...start)).toBe('');
      for (const r of P.rooms) {
        const to: [number, number] = [r.x + L.hx, r.z + L.hz];
        expect(path(h, start, to), `${P.id}/${r.id}`).not.toBeNull();
      }
    }
  });
  it('odalar arasında duvar, kapıda boşluk, aynı adlı odalar arasında duvar yok', () => {
    const P = plan('a');
    const L = lot(P);
    expect(wallAt(P, L.hx + 1, L.hz + 1, 's')).toBe(false); // mutfak-salon kapısı
    expect(wallAt(P, L.hx + 1, L.hz + 2, 'n')).toBe(false); // aynı kapı karşıdan
    expect(wallAt(P, L.hx + 0, L.hz + 1, 's')).toBe(true); // mutfak-salon duvarı
    expect(wallAt(P, L.hx + 2, L.hz + 3, 'e')).toBe(false); // salon-hol (aynı oda)
    expect(wallAt(P, L.hx + 0, L.hz + 0, 'w')).toBe(true); // dış duvar
    expect(wallAt(P, L.hx + 1, L.hz + 5, 's')).toBe(false); // ön kapı
    expect(walls(P).length).toBeGreaterThan(20);
  });
});

describe('yerleştirme', () => {
  it('başlangıç evindeki her eşya kurallara uyuyor', () => {
    const h = newHome();
    h.items.forEach((p, i) => expect(canPlace(h, p, i), `${p.id}@${p.x},${p.z}`).toBeNull());
  });
  it('dolu yere, kapı önüne, bahçe eşyası içeri konmaz', () => {
    const h = newHome();
    const Y = 4;
    expect(canPlace(h, { id: 'koltuk', x: Y + 0, z: Y + 4, r: 0, c: 0 })).toMatch(/dolu/);
    expect(canPlace(h, { id: 'koltuk', x: Y + 1, z: Y + 5, r: 0, c: 0 })).toMatch(/Kapının/);
    expect(canPlace(h, { id: 'trambolin', x: Y + 1, z: Y + 2, r: 0, c: 0 })).toMatch(/bahçe/);
    expect(canPlace(h, { id: 'kanepe', x: 1, z: 1, r: 0, c: 0 })).toMatch(/içeriye/);
    expect(canPlace(h, { id: 'kanepe', x: Y + 2, z: Y + 1, r: 0, c: 0 })).toMatch(/Duvarın|dolu/);
    expect(canPlace(h, { id: 'tablo', x: Y + 1, z: Y + 4, r: 0, c: 0 })).toMatch(/duvar/i);
  });
  it('döndürünce ayak izi değişir', () => {
    expect(footprint({ id: 'kanepe', x: 0, z: 0, r: 0, c: 0 })).toEqual([[0, 0], [1, 0]]);
    expect(footprint({ id: 'kanepe', x: 0, z: 0, r: 1, c: 0 })).toEqual([[0, 0], [0, 1]]);
  });
  it('her eşyanın kullanma karosu bulunur (başlangıç evi)', () => {
    const h = newHome();
    const from: [number, number] = [5, 11];
    h.items.forEach((p, i) => { if (item(p.id)?.use) expect(useTile(h, i, from), p.id).not.toBeNull(); });
  });
  it('büyük eve geçince eşyalar korunur ya da depoya gider', () => {
    const h = changePlan(newHome(), 'c');
    expect(h.items.length + h.stored.length).toBe(newHome().items.length);
    expect(h.plans).toContain('c');
  });
  it('katalogdaki fiyatlar ve boyutlar mantıklı', () => {
    for (const it of ITEMS) {
      expect(it.price).toBeGreaterThan(0);
      expect(it.colors.length).toBeGreaterThan(0);
      expect(it.w * it.d).toBeLessThanOrEqual(6);
    }
  });
});

describe('plan bütünlüğü', () => {
  it('odalar üst üste binmez ve evin içini doldurur', () => {
    for (const P of PLANS) {
      const seen = new Set<string>();
      for (const r of P.rooms) for (let x = r.x; x < r.x + r.w; x++) for (let z = r.z; z < r.z + r.d; z++) {
        const k = `${x},${z}`;
        expect(seen.has(k), `${P.id} ${r.id} ${k}`).toBe(false);
        seen.add(k);
      }
      expect(seen.size).toBe(P.w * P.d);
    }
  });
});

describe('plan değişimi', () => {
  it('eşyalar odalarıyla taşınır', () => {
    for (const id of ['b', 'c']) {
      const h = changePlan(newHome(), id);
      const P = plan(id);
      const where = (eid: string) => { const p = h.items.find((x) => x.id === eid); return p ? roomAt(P, p.x, p.z) : 'depo'; };
      expect(where('kuvet'), id).toMatch(/banyo|depo/);
      expect(where('ocak'), id).toBe('mutfak');
      expect(where('yatak'), id).toBe('yatak');
      expect(where('salincak'), id).toBe('');
      h.items.forEach((p, i) => expect(canPlace(h, p, i), `${id} ${p.id}`).toBeNull());
    }
  });
});
