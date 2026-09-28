/**
 * Dosya kaydetme: web'de indirme bağlantısı, Android/iOS uygulamasında paylaşım menüsü
 * (galeriye kaydet, Drive'a yükle, WhatsApp ile gönder vb.). Uygulama içi web görünümünde
 * <a download> çalışmadığı için yerel platformda Capacitor Filesystem + Share kullanılır.
 */
import { Capacitor } from '@capacitor/core';
import { blobToDataUrl } from './gallery';

export const isNative = () => Capacitor.isNativePlatform();

export async function saveFile(blob: Blob, filename: string, title = 'Cizio'): Promise<void> {
  if (!isNative()) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return;
  }
  const [{ Filesystem, Directory }, { Share }] = await Promise.all([import('@capacitor/filesystem'), import('@capacitor/share')]);
  const data = (await blobToDataUrl(blob)).split(',')[1];
  const res = await Filesystem.writeFile({ path: filename, data, directory: Directory.Cache });
  await Share.share({ title, files: [res.uri] });
}
