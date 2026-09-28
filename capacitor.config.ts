import type { CapacitorConfig } from '@capacitor/cli';

/** Android (ve ileride iOS) paketi: web uygulaması dist/ klasöründen yerel uygulamaya sarılır. */
const config: CapacitorConfig = {
  appId: 'com.ahmetercikan.cizio',
  appName: 'Cizio',
  webDir: 'dist',
  backgroundColor: '#4629d6',
  android: {
    // Çocuk uygulaması: http içerik, hata ayıklama ve üçüncü taraf gezinme yok.
    allowMixedContent: false,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
