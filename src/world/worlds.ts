/**
 * Ada dışındaki bütün dünyaları kurar: macera kapıları (labirent, gökyüzü, şeker), Mars ve binaların içi.
 * (Ayrı modül: dünya sınıfları realms.ts'teki Realm'den türer; döngüsel içe aktarma olmasın.)
 */
import { INTERIORS, type InteriorId, type RealmId } from './homestead';
import { InteriorRealm } from './interiors';
import { MarsRealm } from './mars';
import { CandyRealm, MazeRealm, SkyRealm, type Realm, type RealmEvents } from './realms';
import type { ArtShot } from './textures';

/** Dünyaya dışarıdan verilen veri: müzedeki koleksiyon ve sinemada oynayacak çizimler. */
export interface RealmData {
  /** Müzede sergilenecek, bulunmuş koleksiyon parçaları. */
  museum?: string[];
  /** Sinemada film olarak oynayacak, galeriden gelen çizimler. */
  film?: ArtShot[];
}

export function makeRealm(id: RealmId, ev: RealmEvents, seed: number, data: RealmData = {}): Realm {
  if (id === 'maze') return new MazeRealm(ev, seed);
  if (id === 'sky') return new SkyRealm(ev);
  if (id === 'candy') return new CandyRealm(ev, seed);
  if (id === 'mars') return new MarsRealm(ev);
  if (id in INTERIORS) return new InteriorRealm(ev, id as InteriorId, data);
  return new CandyRealm(ev, seed);
}
