/**
 * Arabalar: altınla (ya da özel paketle) alınır, adada sürülür. Hepsinin üstü açık, karakter görünsün.
 * Modeller `vehicles.ts`te: gerçek boyutta, camlı, farlı, jantlı. Tekerlekler 'wheel' adlıdır (dönerler).
 */
import * as THREE from 'three';
import { carModel as detailed } from './vehicles';

export { CARS, car, type CarDef } from './carsData';

/**
 * Arabanın modeli (önü +z); sürücü koltuğu `userData.seat`te (karakterin kökü, aracın kendi
 * ekseninde), varsa pervane `userData.prop`ta (sürerken döner).
 */
export function carModel(id: string): THREE.Group {
  const { model, seat, prop } = detailed(id);
  model.userData.seat = seat;
  if (prop) model.userData.prop = prop;
  return model;
}
