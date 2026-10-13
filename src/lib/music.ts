/**
 * Çizio Adası'nın fon müziği: dosya yok, Web Audio ile çalınır (sfx ile aynı ses zinciri).
 *
 * 16 ölçülük neşeli, sakin bir şarkı (Do majör, dakikada 100 vuruş): A A' B A'' bölümleri, yumuşak akor
 * yastığı, alçak bas, ince marimba melodisi ve hafif çalkalayıcı. Melodi sabit bir tohumdan üretilir, böylece her
 * çalışta aynı şarkı duyulur; ikinci turda melodi bir oktav yukarıda çan sesiyle çalar. Kısık çalar, adada bir
 * oyuncağa binince (kendi müziği olan) daha da kısılır, uygulama arka plana geçince durur.
 */
import { audioBus } from './sfx';

const BPM = 100;
const STEP = 60 / BPM / 2; // sekizlik
const VOL = 0.55;

// akorlar (Do majör gamında derece: 0 = Do)
const CHORDS: Record<string, number[]> = { C: [0, 2, 4], Am: [5, 7, 9], F: [3, 5, 7], G: [4, 6, 8], Em: [2, 4, 6], Dm: [1, 3, 5] };
const SONG = ['C', 'Am', 'F', 'G', 'C', 'Am', 'F', 'G', 'F', 'G', 'Em', 'Am', 'Dm', 'G', 'C', 'C'];
const SCALE = [0, 2, 4, 5, 7, 9, 11];
const freq = (deg: number, oct = 0) => 261.63 * 2 ** ((SCALE[((deg % 7) + 7) % 7] + 12 * (Math.floor(deg / 7) + oct)) / 12);

/** Melodi: ölçü başına 8 sekizlik, -1 = sus. */
function compose(): number[][] {
  let seed = 20240611;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const RHYTHMS = [
    [1, 0, 1, 0, 1, 1, 1, 0],
    [1, 0, 0, 1, 1, 0, 1, 0],
    [1, 1, 1, 0, 1, 0, 0, 0],
    [1, 0, 1, 1, 1, 0, 1, 0],
  ];
  const bar = (chord: string, prev: number, last: boolean) => {
    const tones = CHORDS[chord].flatMap((d) => [d + 7, d + 14]).filter((d) => d >= 7 && d <= 16);
    const r = last ? [1, 0, 1, 0, 1, 0, 0, 0] : RHYTHMS[Math.floor(rnd() * RHYTHMS.length)];
    let cur = prev;
    return r.map((on, i) => {
      if (!on) return -1;
      if (i % 4 === 0 || last) {
        // güçlü vuruş: en yakın akor sesi
        cur = tones.reduce((b, d) => (Math.abs(d - cur) < Math.abs(b - cur) ? d : b), tones[0]);
      } else cur = Math.min(16, Math.max(7, cur + (rnd() < 0.5 ? -1 : 1) * (rnd() < 0.75 ? 1 : 2)));
      return cur;
    });
  };
  const A: number[][] = [];
  let p = 11;
  for (let i = 0; i < 4; i++) {
    A.push(bar(SONG[i], p, false));
    p = A[i].filter((d) => d >= 0).pop() ?? p;
  }
  const A2 = A.map((b) => [...b]);
  A2[3] = bar('G', p, true);
  const B: number[][] = [];
  for (let i = 8; i < 12; i++) {
    B.push(bar(SONG[i], p, false));
    p = B[i - 8].filter((d) => d >= 0).pop() ?? p;
  }
  const C: number[][] = [bar('Dm', p, false), bar('G', p, false), [7, -1, 9, -1, 11, -1, 14, -1], [14, -1, -1, -1, -1, -1, -1, -1]];
  return [...A, ...A2, ...B, ...C];
}

let melody: number[][] | null = null;
let bus: GainNode | null = null;
let ctx: AudioContext | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let step = 0;
let nextT = 0;
let ducked = false;
let wanted = false;
let noiseBuf: AudioBuffer | null = null;

function env(g: GainNode, t: number, peak: number, attack: number, dur: number) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
}

/** Marimba / çan: FM tonu. */
function note(f: number, t: number, dur: number, peak: number, ratio: number, index: number) {
  const c = ctx!, car = c.createOscillator(), mod = c.createOscillator(), mg = c.createGain(), g = c.createGain();
  car.frequency.value = f;
  mod.frequency.value = f * ratio;
  mg.gain.setValueAtTime(f * index, t);
  mg.gain.exponentialRampToValueAtTime(f * 0.05, t + 0.15);
  mod.connect(mg).connect(car.frequency);
  env(g, t, peak, 0.008, dur);
  car.connect(g).connect(bus!);
  car.start(t);
  mod.start(t);
  car.stop(t + dur + 0.05);
  mod.stop(t + dur + 0.05);
}

function pad(degs: number[], t: number, dur: number) {
  const c = ctx!;
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 900;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.022, t + 0.5);
  g.gain.setValueAtTime(0.022, t + dur - 0.4);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.2);
  lp.connect(g).connect(bus!);
  for (const d of degs) {
    for (const det of [-4, 4]) {
      const o = c.createOscillator();
      o.type = 'triangle';
      o.frequency.value = freq(d);
      o.detune.value = det;
      o.connect(lp);
      o.start(t);
      o.stop(t + dur + 0.3);
    }
  }
}

function bass(deg: number, t: number) {
  const c = ctx!, o = c.createOscillator(), g = c.createGain();
  o.type = 'sine';
  o.frequency.value = freq(deg, -2);
  env(g, t, 0.09, 0.01, 0.55);
  o.connect(g).connect(bus!);
  o.start(t);
  o.stop(t + 0.6);
}

function shaker(t: number, peak: number) {
  const c = ctx!;
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, Math.floor(c.sampleRate * 0.2), c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource(), hp = c.createBiquadFilter(), g = c.createGain();
  s.buffer = noiseBuf;
  hp.type = 'highpass';
  hp.frequency.value = 6500;
  env(g, t, peak, 0.005, 0.07);
  s.connect(hp).connect(g).connect(bus!);
  s.start(t);
  s.stop(t + 0.1);
}

function play(i: number, t: number) {
  const bars = SONG.length, round = Math.floor(i / (bars * 8)) % 2;
  const b = Math.floor(i / 8) % bars, s = i % 8;
  const chord = CHORDS[SONG[b]];
  if (s === 0) {
    pad(chord, t, STEP * 8);
    bass(chord[0], t);
  }
  if (s === 4) bass(chord[0] + (b % 2 ? 4 : 0), t);
  if (s % 2 === 1) shaker(t, s === 3 || s === 7 ? 0.018 : 0.01);
  const m = melody![b][s];
  if (m >= 0) {
    if (round === 0) note(freq(m), t, 0.5, 0.05, 4, 1.2); // marimba
    else note(freq(m, 1), t, 0.9, 0.028, 3.5, 1.6); // çan, bir oktav yukarı
  }
}

function tick() {
  if (!ctx || !bus) return;
  if (ctx.state !== 'running') {
    nextT = ctx.currentTime + 0.1;
    return;
  }
  if (nextT < ctx.currentTime) nextT = ctx.currentTime + 0.05;
  while (nextT < ctx.currentTime + 0.3) {
    play(step++, nextT);
    nextT += STEP;
  }
}

function begin() {
  if (timer) return;
  const out = audioBus();
  if (!out) return;
  ({ ctx, bus } = out);
  melody ??= compose();
  bus.gain.setValueAtTime(0.0001, ctx.currentTime);
  bus.gain.exponentialRampToValueAtTime(ducked ? VOL * 0.3 : VOL, ctx.currentTime + 2.5);
  nextT = ctx.currentTime + 0.1;
  timer = setInterval(tick, 60);
}

function end() {
  if (timer) clearInterval(timer);
  timer = null;
  if (ctx && bus) {
    const b = bus;
    b.gain.cancelScheduledValues(ctx.currentTime);
    b.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.15);
    setTimeout(() => b.disconnect(), 800);
  }
  bus = null;
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) end();
    else if (wanted) begin();
  });
}

export const music = {
  /** Çalmaya başlar (ses kapalıysa sessiz kalır). */
  start() {
    wanted = true;
    if (!document.hidden) begin();
  },
  stop() {
    wanted = false;
    end();
  },
  /** Kendi müziği olan bir etkinlikte müziği kısar. */
  duck(on: boolean) {
    ducked = on;
    if (ctx && bus) bus.gain.setTargetAtTime(on ? VOL * 0.3 : VOL, ctx.currentTime, 0.4);
  },
};
