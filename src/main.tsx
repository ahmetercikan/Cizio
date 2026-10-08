// Eski sürüm kayıtlarını, durum deposu oluşturulmadan önce yeni ada taşı.
import './lib/legacy';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './styles/theme.css';
import './styles/screens.css';
import './styles/english.css';
import './styles/online.css';
import './styles/magic.css';
import './styles/plus.css';

// Çevrimdışı çalışma ve "Ana ekrana ekle" için servis çalışanı; yeni sürüm gelince kendini günceller.
// Android/iOS uygulamasında dosyalar zaten pakette; servis çalışanı yalnızca web'de.
if (!Capacitor.isNativePlatform()) registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
