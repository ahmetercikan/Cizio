/**
 * Önceden üretilmiş ders eskizleri (scripts/build-thumbs.ts → public/thumbs/*.webp).
 * thumbs.json, her dersin resimleri üretilirkenki şekil özetini tutar; ders değişip resim yeniden
 * üretilmezse test (src/lessons/__tests__) uyarır, uygulama da o ders için eski (canlı SVG) yola döner.
 */
import type { Lesson } from '../lessons/types';
import { lineKey } from '../voice/hash';
import index from './thumbs.json';

/** Resim kenarı (piksel). Kartlar telefonda en çok ~350 CSS piksel; 2–3x ekranda yeterli netlik. */
export const THUMB_SIZE = 512;
/** Eskiz görünümü (src/art/sketch.ts) değişirse artırın: tüm resimler yeniden üretilmeli. */
export const THUMB_STYLE = 'v1';

export function lessonThumbHash(l: Lesson): string {
  return lineKey(`${THUMB_STYLE}|${JSON.stringify(l.steps.map((s) => s.shapes))}`);
}

const thumbs = index as Record<string, string>;
const fresh = new Map<string, boolean>();

/** Dersin önceden üretilmiş, güncel resmi var mı? */
export function hasThumb(l: Lesson): boolean {
  let ok = fresh.get(l.id);
  if (ok === undefined) {
    ok = thumbs[l.id] === lessonThumbHash(l);
    fresh.set(l.id, ok);
  }
  return ok;
}
