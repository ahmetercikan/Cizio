/**
 * Müzik Odası'nın çalgıları: hepsi Web Audio ile sentezlenir, ses dosyası gerekmez.
 *
 * Her çalgının kendi rengi (tını) vardır: piyano tok ve yumuşak, ksilofon çıngıraklı, gitar tırmalanmış,
 * flüt yumuşak hava, davul perdesiz vuruş. Notalar do–re–mi–fa–sol–la–si–do dizisidir; çocuk hangi tuşa
 * dokunursa o notayı duyar, yanlış nota yoktur.
 */
import { audioBus } from './sfx';

export type InstrumentId = 'piyano' | 'ksilofon' | 'gitar' | 'flut' | 'davul';

export interface Instrument {
  id: InstrumentId;
  name: string;
  /** Tuş rengi dizisi için ana renk. */
  color: string;
  /** Çalgının adı söylenirken geçen kısa tanıtım. */
  hint: string;
}

export const INSTRUMENTS: Instrument[] = [
  { id: 'piyano', name: 'Piyano', color: '#5b8def', hint: 'Tuşlara dokun, piyano çalsın!' },
  { id: 'ksilofon', name: 'Ksilofon', color: '#ef4b4b', hint: 'Renkli çubuklara vur!' },
  { id: 'gitar', name: 'Gitar', color: '#e8a33d', hint: 'Tellere dokun, gitar tınlasın!' },
  { id: 'flut', name: 'Flüt', color: '#2bb673', hint: 'Üfle gitsin, flüt öter!' },
  { id: 'davul', name: 'Davul', color: '#9b6bff', hint: 'Vur bakalım, ritim tut!' },
];

export const instrument = (id: string) => INSTRUMENTS.find((i) => i.id === id);

/** Do majör dizisi (iki oktav yetecek kadar). */
export const SCALE = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si', 'Do'];
const STEPS = [0, 2, 4, 5, 7, 9, 11, 12];
/** Nota sırası (0-7) → frekans. */
export const noteHz = (i: number, octave = 0) => 261.63 * 2 ** ((STEPS[Math.max(0, Math.min(7, i))] + octave * 12) / 12);

/** Davulun beş vuruşu (perdesiz). */
export const DRUMS = ['Bas', 'Trampet', 'Tom', 'Zil', 'Çan'];

/** Bir notayı çalar. Ses açılamazsa sessizce geçer (oyun yine çalışır). */
export function play(inst: InstrumentId, i: number, when = 0) {
  const a = audioBus();
  if (!a) return;
  const { ctx, bus } = a;
  const t = ctx.currentTime + when;
  bus.gain.value = 0.55;
  const son = (d: number) => window.setTimeout(() => bus.disconnect(), (when + d) * 1000 + 400);

  if (inst === 'davul') {
    vur(ctx, bus, i, t);
    son(0.9);
    return;
  }
  const hz = noteHz(i);
  const tone = (type: OscillatorType, mul: number, gain: number, dur: number, detune = 0) => {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = hz * mul;
    o.detune.value = detune;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + (inst === 'flut' ? 0.09 : 0.012));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(bus);
    o.start(t);
    o.stop(t + dur + 0.05);
  };
  if (inst === 'piyano') {
    tone('triangle', 1, 0.34, 1.5);
    tone('sine', 2, 0.1, 0.9);
    tone('sine', 3.01, 0.035, 0.5);
    son(1.6);
  } else if (inst === 'ksilofon') {
    tone('sine', 1, 0.32, 0.7);
    tone('sine', 4.02, 0.12, 0.35);
    tone('sine', 9.1, 0.05, 0.18);
    son(0.8);
  } else if (inst === 'gitar') {
    tone('sawtooth', 1, 0.2, 1.3);
    tone('triangle', 2, 0.09, 0.8);
    tone('sawtooth', 1, 0.08, 1.1, 8);
    son(1.4);
  } else {
    // flüt: yumuşak, hafif titreşimli
    tone('sine', 1, 0.3, 1.1);
    tone('sine', 2, 0.05, 0.8);
    son(1.2);
  }
}

/** Davul vuruşu: perdesiz, gürültü ve tok vuruş karışımı. */
function vur(ctx: AudioContext, bus: GainNode, i: number, t: number) {
  const nz = (dur: number, gain: number, hp: number) => {
    const n = ctx.createBufferSource();
    const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let k = 0; k < d.length; k++) d[k] = (Math.random() * 2 - 1) * (1 - k / d.length);
    n.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = hp;
    const g = ctx.createGain();
    g.gain.value = gain;
    n.connect(f).connect(g).connect(bus);
    n.start(t);
  };
  const tok = (f0: number, f1: number, dur: number, gain: number) => {
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(bus);
    o.start(t);
    o.stop(t + dur + 0.05);
  };
  if (i === 0) tok(150, 45, 0.3, 0.6);
  else if (i === 1) { tok(220, 150, 0.12, 0.25); nz(0.2, 0.3, 1200); }
  else if (i === 2) tok(300, 120, 0.25, 0.4);
  else if (i === 3) nz(0.5, 0.18, 5000);
  else nz(0.8, 0.12, 2600);
}

/** Ezgi tekrarlama oyunu için rastgele dizi (ardışık aynı nota olmaz). */
export function tune(len: number, notes = 5, rnd = Math.random): number[] {
  const out: number[] = [];
  while (out.length < len) {
    const n = Math.floor(rnd() * notes);
    if (out[out.length - 1] !== n) out.push(n);
  }
  return out;
}

/** Hazır küçük ezgiler (çocuğun tanıdığı): nota sırası (0=Do). */
export const SONGLETS: { name: string; notes: number[] }[] = [
  { name: 'Do Re Mi', notes: [0, 1, 2, 3, 4, 5, 6, 7] },
  { name: 'Parla Parla', notes: [0, 0, 4, 4, 5, 5, 4] },
  { name: 'Mary’nin Kuzusu', notes: [2, 1, 0, 1, 2, 2, 2] },
  { name: 'Çek Kürekleri', notes: [0, 0, 0, 1, 2] },
  { name: 'Mutlu Yıllar', notes: [0, 0, 1, 0, 3, 2] },
];

export const MUSIC_LINES: string[] = [...new Set([
  ...INSTRUMENTS.map((i) => i.hint),
  'Müzik Odası’na hoş geldin! Hangi çalgıyı çalalım?',
  'Şimdi dinle, sonra aynısını çal!',
  'Harika! Kulağın çok iyi!',
  'Olsun, bir daha dinleyelim.',
  'Bütün ezgiyi doğru çaldın! Sen küçük bir müzisyensin!',
])];
