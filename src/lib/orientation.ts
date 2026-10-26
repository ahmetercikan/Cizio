/**
 * Çizio Adası yatay oynanır: ada açılınca ekran yan döner, adadan çıkınca serbest kalır.
 * Telefonda ve tablette (Android, iOS) Capacitor'ın ekran yönü eklentisi; tarayıcıda Screen Orientation API
 * (çoğu tarayıcı yalnızca tam ekranda izin verir; izin vermezse ada dikeyde de çalışır).
 */
import { Capacitor } from '@capacitor/core';

const native = Capacitor.isNativePlatform();
/** Kilit isteği yolda iken sayfadan çıkıldıysa geç gelen kilit geri alınır. */
let want = false;

type WebOrientation = ScreenOrientation & { lock?: (o: string) => Promise<void> };

export async function lockLandscape() {
  want = true;
  try {
    if (native) {
      const { ScreenOrientation } = await import('@capacitor/screen-orientation');
      await ScreenOrientation.lock({ orientation: 'landscape' });
    } else await (screen.orientation as WebOrientation | undefined)?.lock?.('landscape');
  } catch {
    /* desteklemeyen cihaz ya da tarayıcı: dikey kalır, yatay düzen yine çalışır */
  }
  if (!want) void unlockOrientation();
}

export async function unlockOrientation() {
  want = false;
  try {
    if (native) {
      const { ScreenOrientation } = await import('@capacitor/screen-orientation');
      await ScreenOrientation.unlock();
    } else screen.orientation?.unlock?.();
  } catch {
    /* yok say */
  }
}
