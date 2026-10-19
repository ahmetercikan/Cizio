/**
 * Konfeti — yalnızca ilk kutlamada indirilir.
 *
 * Konfeti kütüphanesi küçük ama açılışta gereksiz: çocuk bir şeyi tamamlayana kadar hiç kullanılmıyor.
 * Bu yüzden `kutla()` ilk çağrıldığında yüklenir, sonraki çağrılar aynı kopyayı kullanır.
 */
import type { Options } from 'canvas-confetti';

let yukleniyor: Promise<(o: Options) => void> | null = null;

export function kutla(opts: Options) {
  yukleniyor ??= import('canvas-confetti').then((m) => m.default);
  void yukleniyor.then((fire) => fire({ disableForReducedMotion: true, ...opts })).catch(() => {});
}
