/**
 * Arabalar: altınla (ya da özel paketle) alınır, adada sürülür. Hepsinin üstü açık, karakter görünsün.
 * Modeller `vehicles.ts`te: gerçek boyutta, camlı, farlı, jantlı. Tekerlekler 'wheel' adlıdır (dönerler).
 */
import * as THREE from 'three';
import { carModel as detailed } from './vehicles';

export { CARS, car, type CarDef } from './carsData';

/** Arabanın modeli (önü +z); sürücü koltuğu `userData.seat`te (karakterin kökü, aracın kendi ekseninde). */
export function carModel(id: string): THREE.Group {
  const { model, seat } = detailed(id);
  model.userData.seat = seat;
  return model;
}
