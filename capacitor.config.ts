import type { CapacitorConfig } from '@capacitor/cli';

/** Android ve iOS paketi: web uygulaması dist/ klasöründen yerel uygulamaya sarılır (iOS adımları: IOS.md). */
const config: CapacitorConfig = {
  appId: 'com.ahmetercikan.cizio',
  appName: 'Çizio',
  webDir: 'dist',
  backgroundColor: '#cfeee6',
  android: {
    // Çocuk uygulaması: http içerik, hata ayıklama ve üçüncü taraf gezinme yok.
    allowMixedContent: false,
    webContentsDebuggingEnabled: false,
  },
  ios: {
    // Çentik ve ev çubuğu boşlukları CSS'teki env(safe-area-inset-*) ile ayarlanır.
    contentInset: 'never',
    backgroundColor: '#cfeee6',
    webContentsDebuggingEnabled: false,
  },
};

export default config;
