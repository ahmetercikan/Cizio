/**
 * Şarkı çalar: melodiyi Web Audio ile çalar ve o anki heceyi bildirir.
 *
 * Ses dosyası gerekmez; melodi yumuşak bir marimba/çan karışımıyla sentezlenir. `public/song/<id>.mp3`
 * konulursa onun yerine gerçek kayıt çalar (sözlerin ışıldaması yine buradaki vuruş hesabını kullanır).
 */
import { audioBus } from '../lib/sfx';
import type { Song } from './songs';

const NAMES: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** "F#4" → frekans (Hz). */
export function noteHz(n: string): number {
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(n);
  if (!m) return 440;
  const midi = 12 * (Number(m[3]) + 1) + NAMES[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  return 440 * 2 ** ((midi - 69) / 12);
}

export interface Beat {
  /** Satır ve hece sırası (hece boşsa yalnızca nota çalar). */
  li: number;
  si: number;
  /** Şarkının başından itibaren saniye. */
  at: number;
  dur: number;
  note: string;
}

/** Şarkının bütün notalarını zaman çizgisine serer (satır aralarında bir vuruş nefes). */
export function timeline(s: Song): { beats: Beat[]; total: number } {
  const b = 60 / s.bpm;
  const beats: Beat[] = [];
  let t = 0;
  s.lines.forEach((l, li) => {
    l.syls.forEach((syl, si) => {
      beats.push({ li, si, at: t, dur: syl.beats * b, note: syl.note });
      t += syl.beats * b;
    });
    t += b; // satır arası nefes
  });
  return { beats, total: t };
}

/** Tek nota: yumuşak marimba + üstünde hafif çan. */
function tone(ctx: AudioContext, bus: GainNode, hz: number, at: number, dur: number) {
  const t = ctx.currentTime + at;
  const d = Math.max(0.18, Math.min(1.6, dur * 0.95));
  for (const [type, mul, gain, len] of [['triangle', 1, 0.3, d], ['sine', 2, 0.1, d * 0.6], ['sine', 3.01, 0.04, d * 0.35]] as const) {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = hz * mul;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(g).connect(bus);
    o.start(t);
    o.stop(t + len + 0.05);
  }
}

export interface Playing {
  stop(): void;
}

/**
 * Şarkıyı çalar. `onBeat` her hecede çağrılır (ekranda o hece ışıldar), `onEnd` bitince.
 * Döndürülen nesnenin `stop()`'u çalmayı keser.
 */
export function playSong(s: Song, onBeat: (li: number, si: number) => void, onEnd: () => void): Playing {
  const a = audioBus();
  const { beats, total } = timeline(s);
  let stopped = false;
  const timers: number[] = [];

  if (a) {
    a.bus.gain.value = 0.5;
    for (const b of beats) if (b.note) tone(a.ctx, a.bus, noteHz(b.note), b.at, b.dur);
  }
  // sözlerin ışıldaması (ses açılamasa da çalışır: çocuk yine takip eder)
  for (const b of beats) {
    timers.push(window.setTimeout(() => !stopped && onBeat(b.li, b.si), b.at * 1000));
  }
  timers.push(window.setTimeout(() => {
    if (stopped) return;
    stopped = true;
    onEnd();
  }, (total + 0.4) * 1000));

  return {
    stop() {
      if (stopped) return;
      stopped = true;
      for (const t of timers) window.clearTimeout(t);
      if (a) {
        a.bus.gain.setTargetAtTime(0.0001, a.ctx.currentTime, 0.08);
        window.setTimeout(() => a.bus.disconnect(), 400);
      }
    },
  };
}
