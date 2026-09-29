import type { CapacitorConfig } from '@capacitor/cli';

/** Android (ve ileride iOS) paketi: web uygulaması dist/ klasöründen yerel uygulamaya sarılır. */
const config: CapacitorConfig = {
  appId: 'com.ahmetercikan.cizio',
  appName: 'Çizio',
  webDir: 'dist',
  backgroundColor: '#fff7ea',
  android: {
    // Çocuk uygulaması: http içerik, hata ayıklama ve üçüncü taraf gezinme yok.
    allowMixedContent: false,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
