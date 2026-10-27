import { describe, expect, it } from 'vitest';
import { emptyData, type Profile, type ProfileData } from '../../store/useApp';
import { hashOf, merge, type Cloud, type Snapshot, type SyncMeta } from '../merge';

const prof = (id: string, name = id): Profile => ({ id, name, avatar: 'panda', favoritePath: 'hayvanlar', createdAt: 1 });
const withLessons = (n: number): ProfileData => {
  const d = emptyData();
  for (let i = 0; i < n; i++) d.lessons[`ders${i}`] = { bestStars: 3, completions: 1, lastAt: 1 };
  return d;
};
const settings = {} as Snapshot['settings'];
const local = (profiles: Profile[], data: Record<string, ProfileData>): Snapshot => ({ profiles, data, settings, activeId: profiles[0]?.id });
const cloud = (profiles: Profile[], data: Record<string, ProfileData>, at: Record<string, number> = {}, deleted: string[] = []): Cloud =>
  ({ profiles, data, at, settings, activeId: profiles[0]?.id, deleted });

describe('ilerleme birleştirme', () => {
  it('yeni telefon: hesaptaki profiller cihaza gelir', () => {
    const r = merge(local([], {}), cloud([prof('a')], { a: withLessons(5) }, { a: 100 }), null);
    expect(r.state.profiles.map((p) => p.id)).toEqual(['a']);
    expect(Object.keys(r.state.data.a.lessons)).toHaveLength(5);
    expect(r.pulled).toEqual(['a']);
    expect(r.push).toEqual([]);
  });

  it('cihazda ve hesapta farklı çocuklar: ikisi de kalır', () => {
    const r = merge(local([prof('b')], { b: withLessons(1) }), cloud([prof('a')], { a: withLessons(2) }, { a: 100 }), null);
    expect(r.state.profiles.map((p) => p.id).sort()).toEqual(['a', 'b']);
    expect(r.push).toEqual(['b']);
  });

  it('hesapta değişiklik yoksa cihazdaki yeni ilerleme kalır', () => {
    const old = withLessons(2);
    const meta: SyncMeta = { uid: 'u', hash: { a: hashOf(old) }, at: { a: 100 }, ids: ['a'], deleted: [] };
    const r = merge(local([prof('a')], { a: withLessons(4) }), cloud([prof('a')], { a: old }, { a: 100 }), meta);
    expect(Object.keys(r.state.data.a.lessons)).toHaveLength(4);
    expect(r.push).toEqual(['a']);
  });

  it('cihazda değişiklik yoksa hesaptaki (başka telefonda oynanan) gelir', () => {
    const old = withLessons(2);
    const meta: SyncMeta = { uid: 'u', hash: { a: hashOf(old) }, at: { a: 100 }, ids: ['a'], deleted: [] };
    const r = merge(local([prof('a')], { a: old }), cloud([prof('a')], { a: withLessons(6) }, { a: 200 }), meta);
    expect(Object.keys(r.state.data.a.lessons)).toHaveLength(6);
    expect(r.pulled).toEqual(['a']);
  });

  it('iki tarafta da değiştiyse ilerlemesi çok olan kalır (hiçbiri sessizce kaybolmaz)', () => {
    const meta: SyncMeta = { uid: 'u', hash: { a: 'eski' }, at: { a: 100 }, ids: ['a'], deleted: [] };
    const r1 = merge(local([prof('a')], { a: withLessons(8) }), cloud([prof('a')], { a: withLessons(3) }, { a: 200 }), meta);
    expect(Object.keys(r1.state.data.a.lessons)).toHaveLength(8);
    const r2 = merge(local([prof('a')], { a: withLessons(2) }), cloud([prof('a')], { a: withLessons(9) }, { a: 200 }), meta);
    expect(Object.keys(r2.state.data.a.lessons)).toHaveLength(9);
  });

  it('burada silinen profil hesaba geri dönmez; başka cihazda silinen buradan da kalkar', () => {
    const meta: SyncMeta = { uid: 'u', hash: {}, at: {}, ids: ['a', 'b'], deleted: [] };
    const r = merge(local([prof('a')], { a: withLessons(1) }), cloud([prof('a'), prof('b')], { a: withLessons(1), b: withLessons(1) }, {}, []), meta);
    expect(r.state.profiles.map((p) => p.id)).toEqual(['a']);
    expect(r.deleted).toContain('b');
    const r2 = merge(local([prof('a'), prof('c')], { a: withLessons(1), c: withLessons(1) }), cloud([prof('a')], { a: withLessons(1) }, {}, ['c']), meta);
    expect(r2.state.profiles.map((p) => p.id)).toEqual(['a']);
  });
});
