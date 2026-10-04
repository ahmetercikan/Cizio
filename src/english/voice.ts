/**
 * English Club sesi: cümleleri sırayla okur (önceden üretilmiş doğal ses, yoksa tarayıcının İngilizce sesi).
 * Oyun akışı sese bağlı kalmasın diye her cümlenin bir güvenlik süresi vardır: ses bitmezse ya da hiç
 * çalmazsa akış yine ilerler.
 */
import { preloadLines, speak, stopSpeaking } from '../lib/speech';

let seq = 0;

export function say(lines: string | string[], onEnd?: () => void) {
  const list = (Array.isArray(lines) ? lines : [lines]).filter(Boolean);
  const my = ++seq;
  const next = (i: number) => {
    if (my !== seq) return;
    if (i >= list.length) {
      onEnd?.();
      return;
    }
    let done = false;
    const go = () => {
      if (done || my !== seq) return;
      done = true;
      clearTimeout(timer);
      setTimeout(() => next(i + 1), 260);
    };
    const timer = setTimeout(go, 2200 + list[i].length * 120);
    speak(list[i], { lang: 'en', rate: 0.9, onEnd: go });
  };
  next(0);
}

/** Konuşmayı ve bekleyen sırayı keser. */
export function hush() {
  seq++;
  stopSpeaking();
}

export const preloadEn = (lines: string[]) => preloadLines(lines);
