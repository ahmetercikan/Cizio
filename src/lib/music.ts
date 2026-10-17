/**
 * Çizio Adası'nın fon müziği: dosya yok, Web Audio ile çalınır (sfx ile aynı ses zinciri).
 *
 * Elle bestelenmiş dört şarkı: gündüz üç şarkı sırayla çalar (tropik ada / ukuleleli gezinti / neşeli lunapark),
 * gece (cihazın saatine göre) sakin bir ninni. Her şarkının girişi, nakaratı ve kapanışı var; ikinci turda melodiyi
 * başka bir çalgı çalar. Çalgılar sentezle yapılır: steel drum, ukulele tıngırtısı, flüt, marimba, çan, müzik kutusu,
 * arp, yumuşak yastık sesi, bas ve hafif davullar (bas davul, trampet fırçası, zil, çalkalayıcı, konga, el çırpma).
 * Hepsi bir yankı odasından (reverb) ve hafif bir sıkıştırıcıdan geçer, böylece tok ve canlı duyulur.
 * Kısık çalar; adada bir oyuncağa binince (kendi müziği olan) daha da kısılır, uygulama arka plana geçince durur.
 */
import { audioBus } from './sfx';
import { skyAt } from './sky';

const VOL = 0.5;

// ------------------------------------------------------------------------------------------------
// Notalar ve akorlar
// ------------------------------------------------------------------------------------------------
const NAMES: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
/** "F#5" → MIDI numarası. */
function midi(n: string) {
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(n);
  if (!m) return 60;
  return 12 * (Number(m[3]) + 1) + NAMES[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
}
const hz = (m: number) => 440 * 2 ** ((m - 69) / 12);
/** "F#m7" → kök (0-11) ve akor sesleri (kökten yarım ses uzaklıkları). */
function chord(sym: string) {
  const m = /^([A-G])(#|b)?(m(?!aj))?(7|maj7)?$/.exec(sym) ?? ['', 'C'];
  const root = (NAMES[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + 12) % 12;
  const tones = [0, m[3] ? 3 : 4, 7];
  if (m[4] === '7') tones.push(10);
  if (m[4] === 'maj7') tones.push(11);
  return { root, tones };
}
type Chord = ReturnType<typeof chord>;
/** Akorun `lo` üstündeki ilk sesten başlayan sesleri. */
function voicing(c: Chord, lo: number, n = 3) {
  const out: number[] = [];
  let base = lo - ((lo - c.root) % 12 + 12) % 12;
  if (base < lo) base += 12;
  for (let k = 0; out.length < n; k++) {
    const t = c.tones[k % c.tones.length] + 12 * Math.floor(k / c.tones.length);
    out.push(base + t - (base + t >= lo + 14 ? 12 : 0));
  }
  return out.sort((a, b) => a - b);
}

// ------------------------------------------------------------------------------------------------
// Şarkılar
// ------------------------------------------------------------------------------------------------
type Inst = 'steel' | 'flute' | 'marimba' | 'bell' | 'musicbox' | 'pluck';
type Style = 'calypso' | 'folk' | 'bounce' | 'lullaby';
interface Part { chords: string[]; mel: string[] }
interface Song {
  name: string;
  bpm: number;
  /** Ölçüdeki adım (sekizlik) sayısı: 4/4 için 8, 6/8 için 6. */
  per: number;
  swing: number;
  style: Style;
  lead: Inst;
  lead2: Inst;
  A: Part;
  B: Part;
  night?: boolean;
}

const SONGS: Song[] = [
  {
    name: 'Güneşli Ada', bpm: 108, per: 8, swing: 0, style: 'calypso', lead: 'steel', lead2: 'marimba',
    A: {
      chords: ['C', 'F', 'G', 'C', 'Am', 'F', 'G', 'C'],
      mel: [
        'E5 . G5 . C6 - G5 .', 'A5 - G5 F5 E5 . F5 .', 'G5 . D5 . G5 - F5 E5', 'E5 - - - C5 . . .',
        'A4 . C5 . E5 - D5 C5', 'F5 - E5 . D5 . C5 .', 'B4 . D5 . G5 - F5 D5', 'C5 - - - . . . .',
      ],
    },
    B: {
      chords: ['F', 'G', 'Em', 'Am', 'F', 'G', 'C', 'C'],
      mel: [
        'C6 - A5 . F5 . A5 .', 'B5 - G5 . D5 . G5 .', 'G5 . E5 . B4 . E5 G5', 'A5 - - . E5 . A5 .',
        'A5 . C6 . A5 . F5 .', 'G5 . B5 . D6 - B5 .', 'C6 . G5 . E5 . G5 .', 'C6 - - - . . . .',
      ],
    },
  },
  {
    name: 'Orman Gezintisi', bpm: 92, per: 8, swing: 0.16, style: 'folk', lead: 'flute', lead2: 'bell',
    A: {
      chords: ['G', 'Em', 'C', 'D', 'G', 'Em', 'Am D', 'G'],
      mel: [
        'D5 - B4 . D5 . G5 .', 'E5 - D5 . B4 . G4 .', 'E5 . E5 D5 C5 . E5 .', 'D5 - - - A4 . . .',
        'B4 . D5 . G5 - A5 .', 'B5 . A5 . G5 . E5 .', 'C5 . E5 . D5 . F#5 .', 'G5 - - - . . . .',
      ],
    },
    B: {
      chords: ['C', 'D', 'Bm', 'Em', 'C', 'D', 'G', 'G'],
      mel: [
        'E5 . G5 . E5 . C5 .', 'F#5 . A5 . F#5 . D5 .', 'D5 . F#5 . B5 - A5 .', 'G5 - E5 . B4 . . .',
        'C5 . E5 . G5 . C6 .', 'B5 . A5 . F#5 . D5 .', 'G5 . B5 . D6 - B5 .', 'G5 - - - . . . .',
      ],
    },
  },
  {
    name: 'Lunapark', bpm: 124, per: 8, swing: 0, style: 'bounce', lead: 'marimba', lead2: 'bell',
    A: {
      chords: ['F', 'Dm', 'Bb', 'C', 'F', 'Dm', 'Bb C', 'F'],
      mel: [
        'A5 . C6 . A5 F5 . .', 'D5 . F5 . A5 - G5 F5', 'D6 . Bb5 . F5 . D5 .', 'E5 F5 G5 . C6 - . .',
        'A5 . C6 . A5 F5 . .', 'D5 . F5 . A5 - D6 .', 'C6 . Bb5 . A5 . G5 .', 'F5 - - - . . . .',
      ],
    },
    B: {
      chords: ['Bb', 'C', 'Am', 'Dm', 'Gm', 'C', 'F', 'F'],
      mel: [
        'F5 . D5 . F5 . Bb5 .', 'G5 . E5 . G5 . C6 .', 'A5 . E5 . C5 . E5 .', 'F5 - D5 . A4 . D5 .',
        'Bb5 . G5 . D5 . G5 .', 'C6 . Bb5 . A5 . G5 .', 'A5 . C6 . F6 - . .', 'F6 - - - . . . .',
      ],
    },
  },
  {
    name: 'Yıldızlı Gece', bpm: 150, per: 6, swing: 0, style: 'lullaby', lead: 'musicbox', lead2: 'flute', night: true,
    A: {
      chords: ['D', 'Bm', 'G', 'A', 'D', 'Bm', 'Em A', 'D'],
      mel: ['F#5 - E5 D5 - A4', 'B4 - D5 F#5 - .', 'G5 - F#5 E5 - D5', 'E5 - - - - .', 'F#5 - A5 D6 - A5', 'B5 - A5 F#5 - D5', 'E5 - G5 C#5 - E5', 'D5 - - - - .'],
    },
    B: {
      chords: ['G', 'A', 'F#m', 'Bm', 'G', 'A', 'D', 'D'],
      mel: ['B5 - A5 G5 - D5', 'C#6 - B5 A5 - E5', 'A5 - F#5 C#5 - F#5', 'D6 - - B5 - .', 'B5 - G5 D5 - G5', 'A5 - E5 C#5 - A4', 'D5 - F#5 A5 - F#5', 'D5 - - - - .'],
    },
  },
];

/** Bir bölüm: hangi parça, melodi var mı, hangi çalgı, davul gücü (0 yok, 1 hafif, 2 tam). */
interface Sec { part: 'A' | 'B'; mel: boolean; inst: 'lead' | 'lead2'; drums: 0 | 1 | 2; bars?: number; end?: boolean }
const FORM: Sec[] = [
  { part: 'A', mel: false, inst: 'lead', drums: 1, bars: 2 },
  { part: 'A', mel: true, inst: 'lead', drums: 1 },
  { part: 'A', mel: true, inst: 'lead2', drums: 1 },
  { part: 'B', mel: true, inst: 'lead', drums: 2 },
  { part: 'B', mel: true, inst: 'lead2', drums: 2 },
  { part: 'A', mel: true, inst: 'lead', drums: 1 },
  { part: 'A', mel: false, inst: 'lead', drums: 0, bars: 2, end: true },
];

/** Şarkıyı adım adım olaylara açar: her ölçü için akor(lar) ve melodi notaları. */
interface Bar { chords: Chord[]; notes: { step: number; m: number; len: number }[]; sec: Sec; index: number }
function arrange(s: Song): Bar[] {
  const bars: Bar[] = [];
  for (const sec of FORM) {
    const part = s[sec.part];
    const n = sec.bars ?? part.chords.length;
    for (let i = 0; i < n; i++) {
      const bi = sec.end ? part.chords.length - n + i : i;
      const chords = part.chords[bi].split(' ').map(chord);
      const notes: Bar['notes'] = [];
      if (sec.mel) {
        const toks = part.mel[bi].split(/\s+/);
        toks.forEach((t, k) => {
          if (t === '.' || t === '-') return;
          let len = 1;
          while (toks[k + len] === '-') len++;
          notes.push({ step: k, m: midi(t), len });
        });
      }
      bars.push({ chords, notes, sec, index: i });
    }
  }
  return bars;
}

// ------------------------------------------------------------------------------------------------
// Ses zinciri ve çalgılar
// ------------------------------------------------------------------------------------------------
let ctx: AudioContext | null = null;
let bus: GainNode | null = null;
let dry: AudioNode | null = null;
let wet: AudioNode | null = null;
let noiseBuf: AudioBuffer | null = null;
const irs = new WeakMap<AudioContext, AudioBuffer>();

/** Yankı odası: üstel sönen gürültüden yapılmış iki kanallı dürtü yanıtı. */
function impulse(c: AudioContext) {
  let b = irs.get(c);
  if (b) return b;
  const len = Math.floor(c.sampleRate * 2.4);
  b = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2) * (i < 200 ? i / 200 : 1);
  }
  irs.set(c, b);
  return b;
}
function noise() {
  const c = ctx!;
  if (!noiseBuf || noiseBuf.sampleRate !== c.sampleRate) {
    noiseBuf = c.createBuffer(1, Math.floor(c.sampleRate * 1.0), c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  return s;
}
/** Çıkış: kuru ve yankılı kanala, sağ-sol konumla. */
function outp(node: AudioNode, pan = 0, send = 0.25) {
  const c = ctx!;
  const p = c.createStereoPanner();
  p.pan.value = pan;
  node.connect(p);
  p.connect(dry!);
  if (send > 0) {
    const s = c.createGain();
    s.gain.value = send;
    p.connect(s).connect(wet!);
  }
}
function env(g: AudioParam, t: number, peak: number, a: number, d: number, sus = 0, hold = 0, rel = 0.1) {
  g.setValueAtTime(0.0001, t);
  g.linearRampToValueAtTime(peak, t + a);
  if (sus > 0) {
    g.setTargetAtTime(peak * sus, t + a, d / 3);
    g.setValueAtTime(peak * sus, t + a + hold);
    g.exponentialRampToValueAtTime(0.0001, t + a + hold + rel);
  } else g.exponentialRampToValueAtTime(0.0001, t + a + d);
}
function osc(type: OscillatorType, f: number, t: number, stop: number, det = 0) {
  const o = ctx!.createOscillator();
  o.type = type;
  o.frequency.value = f;
  o.detune.value = det;
  o.start(t);
  o.stop(stop);
  return o;
}

const INST: Record<Inst, (m: number, t: number, len: number, v: number, pan: number) => void> = {
  /** Steel drum: parlak, metalik, hafif perde kayması. */
  steel(m, t, len, v, pan) {
    const c = ctx!, f = hz(m), d = Math.max(0.5, len * 0.9);
    const g = c.createGain();
    env(g.gain, t, 0.11 * v, 0.004, d);
    for (const [k, a] of [[1, 1], [2, 0.42], [3.01, 0.16], [4.2, 0.07]] as const) {
      const o = osc('sine', f * k, t, t + d + 0.1);
      o.frequency.setValueAtTime(f * k * 1.012, t);
      o.frequency.exponentialRampToValueAtTime(f * k, t + 0.04);
      const og = c.createGain();
      og.gain.setValueAtTime(a, t);
      if (k > 1) og.gain.exponentialRampToValueAtTime(a * 0.15, t + 0.3);
      o.connect(og).connect(g);
    }
    outp(g, pan, 0.3);
  },
  /** Flüt: yumuşak giriş, nefes sesi, gecikmeli titreşim. */
  flute(m, t, len, v, pan) {
    const c = ctx!, f = hz(m), d = len;
    const g = c.createGain();
    env(g.gain, t, 0.07 * v, 0.06, 0.2, 0.85, Math.max(0.05, d - 0.08), 0.18);
    const stop = t + d + 0.35;
    const o1 = osc('sine', f, t, stop), o2 = osc('triangle', f * 2, t, stop);
    const lfo = osc('sine', 5.2, t, stop), lg = c.createGain();
    lg.gain.setValueAtTime(0, t);
    lg.gain.linearRampToValueAtTime(f * 0.006, t + Math.min(0.5, d));
    lfo.connect(lg);
    lg.connect(o1.frequency);
    lg.connect(o2.frequency);
    const g2 = c.createGain();
    g2.gain.value = 0.12;
    o1.connect(g);
    o2.connect(g2).connect(g);
    const n = noise(), bp = c.createBiquadFilter(), ng = c.createGain();
    bp.type = 'bandpass';
    bp.frequency.value = f * 2;
    bp.Q.value = 1.5;
    env(ng.gain, t, 0.05 * v, 0.03, 0.25);
    n.connect(bp).connect(ng).connect(g);
    n.start(t);
    n.stop(t + 0.4);
    outp(g, pan, 0.35);
  },
  /** Marimba: tahta, kısa ve sıcak. */
  marimba(m, t, len, v, pan) {
    const c = ctx!, f = hz(m), d = Math.min(0.9, 0.35 + len * 0.12);
    const g = c.createGain();
    env(g.gain, t, 0.12 * v, 0.003, d);
    const car = osc('sine', f, t, t + d + 0.05), mod = osc('sine', f * 4, t, t + d + 0.05), mg = c.createGain();
    mg.gain.setValueAtTime(f * 1.3, t);
    mg.gain.exponentialRampToValueAtTime(f * 0.02, t + 0.12);
    mod.connect(mg).connect(car.frequency);
    car.connect(g);
    const o4 = osc('sine', f * 3.9, t, t + 0.15), g4 = c.createGain();
    env(g4.gain, t, 0.025 * v, 0.002, 0.1);
    o4.connect(g4).connect(g);
    outp(g, pan, 0.22);
  },
  /** Çan / glockenspiel: uzun, parlak. */
  bell(m, t, len, v, pan) {
    const c = ctx!, f = hz(m), d = 1.3 + len * 0.1;
    const g = c.createGain();
    env(g.gain, t, 0.05 * v, 0.002, d);
    const car = osc('sine', f, t, t + d + 0.05), mod = osc('sine', f * 3.5, t, t + d + 0.05), mg = c.createGain();
    mg.gain.setValueAtTime(f * 1.6, t);
    mg.gain.exponentialRampToValueAtTime(f * 0.05, t + 0.5);
    mod.connect(mg).connect(car.frequency);
    car.connect(g);
    outp(g, pan, 0.4);
  },
  /** Müzik kutusu: ince, tınlayan. */
  musicbox(m, t, len, v, pan) {
    const c = ctx!, f = hz(m), d = 1.6;
    const g = c.createGain();
    env(g.gain, t, 0.06 * v, 0.002, d);
    const car = osc('sine', f, t, t + d + 0.05), mod = osc('sine', f * 7, t, t + d + 0.05), mg = c.createGain();
    mg.gain.setValueAtTime(f * 0.9, t);
    mg.gain.exponentialRampToValueAtTime(f * 0.01, t + 0.3);
    mod.connect(mg).connect(car.frequency);
    car.connect(g);
    const o2 = osc('sine', f * 2, t, t + 0.8), g2 = c.createGain();
    env(g2.gain, t, 0.015 * v, 0.002, 0.7);
    o2.connect(g2).connect(g);
    void len;
    outp(g, pan, 0.45);
  },
  /** Tel çekme (ukulele / arp sesi): parlak başlayıp kararan süzgeç. */
  pluck(m, t, len, v, pan) {
    const c = ctx!, f = hz(m), d = 0.5 + len * 0.15;
    const g = c.createGain();
    env(g.gain, t, 0.05 * v, 0.003, d);
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.Q.value = 1.2;
    lp.frequency.setValueAtTime(Math.min(9000, f * 8), t);
    lp.frequency.exponentialRampToValueAtTime(Math.max(300, f * 1.2), t + 0.25);
    osc('sawtooth', f, t, t + d + 0.05).connect(lp);
    const sq = osc('triangle', f, t, t + d + 0.05, 7), sg = c.createGain();
    sg.gain.value = 0.6;
    sq.connect(sg).connect(lp);
    lp.connect(g);
    outp(g, pan, 0.25);
  },
};

function pad(c: Chord, t: number, d: number, v = 1) {
  const a = ctx!;
  const lp = a.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 1100;
  lp.Q.value = 0.4;
  const g = a.createGain();
  env(g.gain, t, 0.016 * v, 0.5, 0.4, 0.9, Math.max(0.1, d - 0.5), 0.7);
  for (const m of voicing(c, 55, 3)) for (const det of [-9, 9]) osc('sawtooth', hz(m), t, t + d + 0.8, det).connect(lp);
  lp.connect(g);
  outp(g, 0, 0.5);
}
function bass(m: number, t: number, d: number, v = 1) {
  const a = ctx!, f = hz(m);
  const g = a.createGain();
  env(g.gain, t, 0.15 * v, 0.006, Math.max(0.25, d));
  const lp = a.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(900, t);
  lp.frequency.exponentialRampToValueAtTime(280, t + 0.2);
  osc('sine', f, t, t + d + 0.1).connect(g);
  const tr = osc('triangle', f * 2, t, t + d + 0.1), tg = a.createGain();
  tg.gain.value = 0.25;
  tr.connect(tg).connect(lp).connect(g);
  outp(g, 0, 0.05);
}
/** Akor tıngırtısı (ukulele): aşağı vuruş güçlü, yukarı vuruş hafif. */
function strum(c: Chord, t: number, down: boolean, v = 1) {
  const ns = voicing(c, 60, 4);
  (down ? ns : [...ns].reverse()).forEach((m, i) => INST.pluck(m, t + i * 0.012, 1, (down ? 0.75 : 0.45) * v, -0.25 + i * 0.05));
}

// davullar
function kick(t: number, v = 1) {
  const a = ctx!, o = osc('sine', 140, t, t + 0.35), g = a.createGain();
  o.frequency.setValueAtTime(140, t);
  o.frequency.exponentialRampToValueAtTime(46, t + 0.12);
  env(g.gain, t, 0.32 * v, 0.003, 0.3);
  o.connect(g);
  outp(g, 0, 0);
}
function hit(t: number, f: number, q: number, peak: number, d: number, pan: number, type: BiquadFilterType = 'bandpass', send = 0.15) {
  const a = ctx!, n = noise(), fl = a.createBiquadFilter(), g = a.createGain();
  fl.type = type;
  fl.frequency.value = f;
  fl.Q.value = q;
  env(g.gain, t, peak, 0.002, d);
  n.connect(fl).connect(g);
  n.start(t, Math.random() * 0.5);
  n.stop(t + d + 0.05);
  outp(g, pan, send);
}
const snare = (t: number, v = 1) => {
  hit(t, 1900, 0.7, 0.07 * v, 0.14, 0.05);
  const a = ctx!, o = osc('triangle', 190, t, t + 0.1), g = a.createGain();
  env(g.gain, t, 0.05 * v, 0.002, 0.08);
  o.connect(g);
  outp(g, 0.05, 0.1);
};
const brush = (t: number, v = 1) => hit(t, 2600, 0.5, 0.035 * v, 0.2, 0.1, 'bandpass', 0.2);
const hat = (t: number, v = 1, open = false) => hit(t, 8500, 0.8, 0.028 * v, open ? 0.22 : 0.045, 0.25, 'highpass', 0.05);
const shaker = (t: number, v = 1) => hit(t, 6800, 1, 0.018 * v, 0.07, -0.3, 'highpass', 0.05);
const clap = (t: number, v = 1) => {
  for (const k of [0, 0.011, 0.023]) hit(t + k, 1400, 0.9, 0.05 * v, 0.1, -0.05, 'bandpass', 0.35);
};
function conga(t: number, f: number, v = 1, pan = 0.3) {
  const a = ctx!, o = osc('sine', f * 1.4, t, t + 0.3), g = a.createGain();
  o.frequency.setValueAtTime(f * 1.4, t);
  o.frequency.exponentialRampToValueAtTime(f, t + 0.04);
  env(g.gain, t, 0.11 * v, 0.002, 0.22);
  o.connect(g);
  outp(g, pan, 0.15);
}
const woodblock = (t: number, v = 1) => {
  const a = ctx!, o = osc('sine', 1250, t, t + 0.08), g = a.createGain();
  env(g.gain, t, 0.05 * v, 0.001, 0.06);
  o.connect(g);
  outp(g, -0.4, 0.2);
};

// ------------------------------------------------------------------------------------------------
// Eşlik: her tarz bir ölçüdeki adımları nasıl çalar
// ------------------------------------------------------------------------------------------------
function accompany(song: Song, bar: Bar, s: number, t: number, step: number) {
  const half = song.per / 2;
  const c = bar.chords[bar.chords.length > 1 && s >= half ? 1 : 0];
  const first = s === 0 || (bar.chords.length > 1 && s === half);
  const lvl = bar.sec.drums;
  const root = 36 + c.root + (c.root > 7 ? -12 : 0) + 12; // C3 civarı
  const fifth = root + 7;
  const end = bar.sec.end && bar.index === (bar.sec.bars ?? 8) - 1;
  if (end) {
    // son ölçü: tek bir uzun akor ve bas
    if (s === 0) {
      bass(root, t, step * song.per, 1);
      pad(c, t, step * song.per, 1.2);
      if (song.style === 'lullaby') voicing(c, 62, 4).forEach((m, i) => INST.musicbox(m, t + i * 0.09, 2, 0.7, 0));
      else strum(c, t, true, 1);
      if (song.style !== 'lullaby') kick(t, 0.8);
    }
    return;
  }
  switch (song.style) {
    case 'calypso': {
      if (s === 0) bass(root, t, step * 1.5);
      if (s === 3) bass(root, t, step);
      if (s === 4) bass(fifth, t, step * 1.5);
      if (s === 6) bass(root + 12, t, step);
      if ([0, 2, 3, 5, 6, 7].includes(s)) strum(c, t, s === 0 || s === 2 || s === 6, s === 0 ? 1 : 0.8);
      if (lvl >= 1) {
        if (s === 0 || s === 4) kick(t, 0.8);
        shaker(t, s % 2 ? 1 : 0.6);
        if (s === 3 || s === 7) conga(t, 330, 0.8, 0.35);
        if (s === 6) conga(t, 220, 0.9, 0.35);
      }
      if (lvl >= 2) {
        if (s === 0 || s === 3 || s === 6) woodblock(t, 0.8);
        if (s === 0 && bar.index % 2 === 0) pad(c, t, step * song.per * 2 - 0.1, 0.8);
      }
      break;
    }
    case 'folk': {
      if (s === 0) bass(root, t, step * 2);
      if (s === 4) bass(fifth, t, step * 2);
      if (lvl >= 2 && s === 6) bass(root + 4 - (c.tones[1] === 3 ? 1 : 0), t, step);
      if ([0, 2, 3, 5, 6, 7].includes(s)) strum(c, t, s === 0 || s === 2 || s === 6, s === 0 ? 0.95 : 0.7);
      if (lvl >= 1) {
        if (s === 0) kick(t, 0.6);
        if (s === 2 || s === 6) brush(t, 1);
        if (s % 2) shaker(t, 0.7);
      }
      if (lvl >= 2) {
        // pizzicato karşı ezgi
        if (s % 2 === 1) INST.pluck(voicing(c, 67, 4)[(s >> 1) % 4], t, 1, 0.55, 0.45);
        if (s === 0 && bar.index % 2 === 0) pad(c, t, step * song.per * 2 - 0.1, 0.7);
      }
      break;
    }
    case 'bounce': {
      if (lvl >= 1) bass(root + (s % 2 ? 12 : 0), t, step * 0.9, s % 2 ? 0.6 : 1);
      else if (s === 0 || s === 4) bass(root, t, step * 2);
      const arp = voicing(c, 60, 4);
      if (s % 2 === 0) INST.marimba(arp[[0, 1, 2, 3, 2, 1, 2, 3][s] ?? 0], t, 1, 0.45, 0.4);
      if (first) pad(c, t, step * (bar.chords.length > 1 ? half : song.per) - 0.05, 0.6);
      if (lvl >= 1) {
        if (s % 2 === 0) kick(t, s === 0 ? 0.9 : 0.6);
        if (s === 2 || s === 6) {
          clap(t, 0.9);
          if (lvl >= 2) snare(t, 0.6);
        }
        if (s % 2) hat(t, 0.9, lvl >= 2 && s === 7);
      }
      if (lvl >= 2 && s === 0 && bar.index % 4 === 0) INST.bell(arp[3] + 12, t, 2, 0.5, -0.4);
      break;
    }
    case 'lullaby': {
      if (s === 0) {
        bass(root, t, step * song.per, 0.6);
        pad(c, t, step * song.per - 0.05, 1);
      }
      if (bar.chords.length > 1 && s === half) pad(c, t, step * half - 0.05, 0.8);
      const arp = voicing(c, 50, 4);
      INST.pluck(arp[[0, 1, 2, 3, 2, 1][s] ?? 0] + 12, t, 2, 0.5, -0.2 + s * 0.08);
      if (lvl >= 2 && s === 3 && bar.index % 2 === 1) INST.bell(voicing(c, 79, 3)[bar.index % 3], t, 2, 0.35, 0.5);
      break;
    }
  }
}

// ------------------------------------------------------------------------------------------------
// Zamanlayıcı
// ------------------------------------------------------------------------------------------------
let song: Song | null = null;
let bars: Bar[] = [];
let barI = 0;
let stepI = 0;
let nextT = 0;
let timer: ReturnType<typeof setInterval> | null = null;
let ducked = false;
let wanted = false;
let order: number[] = [];
let dayIdx = 0;

/** Sıradaki şarkı: gece ninni, gündüz üç şarkı karışık sırayla. */
function pick() {
  const night = skyAt(new Date()).day < 0.5;
  if (night) return SONGS.find((s) => s.night)!;
  const day = SONGS.filter((s) => !s.night);
  if (!order.length || dayIdx >= order.length) {
    const last = order[order.length - 1];
    order = day.map((_, i) => i).sort(() => Math.random() - 0.5);
    if (order[0] === last && order.length > 1) order.push(order.shift()!);
    dayIdx = 0;
  }
  return day[order[dayIdx++]];
}
function load() {
  song = pick();
  bars = arrange(song);
  barI = 0;
  stepI = 0;
}

function playStep(t: number) {
  if (!song) return;
  const bar = bars[barI];
  const step = 60 / song.bpm / 2;
  accompany(song, bar, stepI, t, step);
  for (const n of bar.notes) {
    if (n.step !== stepI) continue;
    const inst = song[bar.sec.inst];
    const v = 0.85 + Math.random() * 0.15;
    INST[inst](n.m, t, n.len * step, v, 0.1);
    // ikinci turda melodiyi bir alt oktavdan yumuşak bir eş çalar (dolgun ses)
    if (bar.sec.inst === 'lead2' && song.style !== 'lullaby') INST.pluck(n.m - 12, t, n.len, 0.45, -0.2);
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
    if (!song) load();
    const s = song!;
    const step = 60 / s.bpm / 2;
    const swing = stepI % 2 === 1 ? s.swing * step : 0;
    playStep(nextT + swing);
    nextT += step;
    if (++stepI >= s.per) {
      stepI = 0;
      if (++barI >= bars.length) {
        // şarkı bitti: kısa bir sessizlik, sonra sıradaki
        song = null;
        nextT += 2.2;
      }
    }
  }
}

function begin() {
  if (timer) return;
  const out = audioBus();
  if (!out) return;
  ({ ctx, bus } = out);
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -20;
  comp.ratio.value = 3;
  comp.attack.value = 0.01;
  comp.release.value = 0.25;
  comp.connect(bus);
  dry = comp;
  const rv = ctx.createConvolver();
  rv.buffer = impulse(ctx);
  const rg = ctx.createGain();
  rg.gain.value = 0.55;
  rv.connect(rg).connect(comp);
  wet = rv;
  bus.gain.setValueAtTime(0.0001, ctx.currentTime);
  bus.gain.exponentialRampToValueAtTime(ducked ? VOL * 0.3 : VOL, ctx.currentTime + 2.5);
  nextT = ctx.currentTime + 0.15;
  if (!song) load();
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
  dry = wet = null;
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
    song = null;
  },
  /** Kendi müziği olan bir etkinlikte müziği kısar. */
  duck(on: boolean) {
    ducked = on;
    if (ctx && bus) bus.gain.setTargetAtTime(on ? VOL * 0.3 : VOL, ctx.currentTime, 0.4);
  },
  /** Şu an çalan şarkının adı (test için). */
  get current() {
    return song?.name ?? null;
  },
};

/** Test: şarkıların ölçü ve nota sayıları doğru mu. */
export const __songs = { SONGS, arrange, midi, chord, voicing };
