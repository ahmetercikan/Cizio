/**
 * Ses efektleri — dosya yok, Web Audio ile sentezlenir.
 *
 * Zincir: sesler → ana kazanç → kompresör → hoparlör, ayrıca hafif bir yankı (üretilmiş dürtü yanıtlı
 * konvolüsyon). Tonlar FM sentezi: marimba (yumuşak, tahta) ve çan (parlak, uzun). Seçim sesleri
 * pentatonik gamda sırayla ilerler; art arda seçim yapmak kulağa bir melodi gibi gelir.
 */
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let reverb: GainNode | null = null;
let enabled = true;

export function setSfxEnabled(v: boolean) {
  enabled = v;
}

function ac(): AudioContext | null {
  if (!enabled) return null;
  try {
    if (!ctx) {
      ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16;
      comp.knee.value = 12;
      comp.ratio.value = 4;
      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(comp).connect(ctx.destination);
      // Kısa, parlak bir oda yankısı
      const conv = ctx.createConvolver();
      const len = Math.floor(ctx.sampleRate * 1.1);
      const ir = ctx.createBuffer(2, len, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = ir.getChannelData(ch);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
      }
      conv.buffer = ir;
      reverb = ctx.createGain();
      reverb.gain.value = 0.18;
      reverb.connect(conv).connect(master);
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Çıkış: kuru sinyal ana kanala, bir kısmı yankıya. */
function out(a: AudioContext, node: AudioNode, wet = 1) {
  node.connect(master!);
  if (wet > 0) {
    const s = a.createGain();
    s.gain.value = wet;
    node.connect(s).connect(reverb!);
  }
}

/** FM tonu. ratio: modülatör/taşıyıcı frekans oranı (4 → marimba, 3.5 → çan), index: parlaklık. */
function fm(freq: number, at: number, dur: number, gain: number, ratio: number, index: number, wet = 1) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime + at;
  const car = a.createOscillator();
  const mod = a.createOscillator();
  const modGain = a.createGain();
  const amp = a.createGain();
  car.frequency.setValueAtTime(freq, t);
  mod.frequency.setValueAtTime(freq * ratio, t);
  modGain.gain.setValueAtTime(freq * index, t);
  modGain.gain.exponentialRampToValueAtTime(freq * 0.02, t + Math.min(dur, 0.12));
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(gain, t + 0.006);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  mod.connect(modGain).connect(car.frequency);
  car.connect(amp);
  out(a, amp, wet);
  car.start(t);
  mod.start(t);
  car.stop(t + dur + 0.05);
  mod.stop(t + dur + 0.05);
}

/** Filtrelenmiş gürültü: tık (kısa) ya da vuuş (süpürmeli). */
function noise(at: number, dur: number, gain: number, f0: number, f1 = f0, q = 1.2, wet = 0) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime + at;
  const len = Math.max(1, Math.floor(a.sampleRate * dur));
  const buf = a.createBuffer(1, len, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource();
  src.buffer = buf;
  const bp = a.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = q;
  bp.frequency.setValueAtTime(f0, t);
  bp.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + Math.min(0.02, dur / 3));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(bp).connect(g);
  out(a, g, wet);
  src.start(t);
  src.stop(t + dur + 0.02);
}

/** Tatlı bir su damlası "pop"u: perdesi hızla yükselen sinüs. */
function bubble(at: number, from: number, to: number, gain: number) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime + at;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(from, t);
  o.frequency.exponentialRampToValueAtTime(to, t + 0.07);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
  o.connect(g);
  out(a, g, 0.6);
  o.start(t);
  o.stop(t + 0.16);
}

/** Perdesi kayan osilatör (titreşim ve filtre isteğe bağlı): kaydırak düdüğü, siren, yay sesi… */
function sweep(type: OscillatorType, f0: number, f1: number, at: number, dur: number, gain: number, o: { vib?: number; vibRate?: number; lp?: number; mid?: number; wet?: number } = {}) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime + at;
  const osc = a.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(f0, t);
  if (o.mid) {
    osc.frequency.exponentialRampToValueAtTime(o.mid, t + dur * 0.45);
    osc.frequency.exponentialRampToValueAtTime(f1, t + dur);
  } else osc.frequency.exponentialRampToValueAtTime(f1, t + dur);
  if (o.vib) {
    const lfo = a.createOscillator();
    const lg = a.createGain();
    lfo.frequency.value = o.vibRate ?? 6;
    lg.gain.value = o.vib;
    lfo.connect(lg).connect(osc.frequency);
    lfo.start(t);
    lfo.stop(t + dur + 0.05);
  }
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + Math.min(0.03, dur / 4));
  g.gain.setValueAtTime(gain, t + dur * 0.7);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let node: AudioNode = osc;
  if (o.lp) {
    const f = a.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = o.lp;
    node = osc.connect(f);
  }
  node.connect(g);
  out(a, g, o.wet ?? 0.3);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

/** Müzik ve uzun sesler için ana kanala bağlı bir kazanç (yoksa null: ses kapalı). */
export function audioBus(): { ctx: AudioContext; bus: GainNode } | null {
  const a = ac();
  if (!a) return null;
  const bus = a.createGain();
  bus.connect(master!);
  return { ctx: a, bus };
}

// Ada ve lunapark sesleri: hepsi sentez, dosya yok
const NOTE = (i: number) => 523.25 * 2 ** ([0, 2, 4, 5, 7, 9, 11][((i % 7) + 7) % 7] / 12 + Math.floor(i / 7));
const RIDE: Record<string, (i: number) => void> = {
  /** Zincirli tırmanış: tak tak. */
  clack: () => {
    noise(0, 0.03, 0.12, 2200, 2200, 3);
    fm(180, 0, 0.05, 0.08, 1.5, 2, 0);
  },
  /** Raylarda tekerlek gürültüsü. */
  rumble: () => noise(0, 0.42, 0.13, 180, 260, 0.8),
  /** Çocuk sevinç çığlığı "viiii!" */
  wee: () => {
    sweep('triangle', 620, 760, 0, 1.0, 0.09, { mid: 1150, vib: 25, vibRate: 7, lp: 2400, wet: 0.4 });
    sweep('sine', 1240, 1520, 0, 1.0, 0.04, { mid: 2300, vib: 40, vibRate: 7, wet: 0.4 });
  },
  /** Atlıkarınca orgu (i: notanın sırası). */
  organ: (i) => {
    fm(NOTE(i), 0, 0.3, 0.07, 2, 1.2, 0.5);
    fm(NOTE(i) * 2, 0, 0.25, 0.03, 1, 0.8, 0.5);
  },
  /** Org eşliği: alçak "um". */
  oom: (i) => fm(NOTE(i) / 4, 0, 0.22, 0.08, 1, 1.5, 0.2),
  /** Dönme dolap: müzik kutusu. */
  musicbox: (i) => fm(NOTE(i) * 2, 0, 0.9, 0.06, 3.5, 1.8, 1),
  /** Tahta gıcırtısı (korsan gemisi, salıncak, değirmen). */
  creak: () => sweep('sawtooth', 95, 70, 0, 0.45, 0.04, { vib: 30, vibRate: 23, lp: 900, wet: 0.2 }),
  /** Trambolin: boyiiing. */
  boing: () => sweep('sine', 140, 420, 0, 0.35, 0.14, { vib: 60, vibRate: 18, wet: 0.2 }),
  /** Kaydırak düdüğü (inişte). */
  whistle: () => sweep('sine', 1500, 520, 0, 0.9, 0.07, { vib: 12, vibRate: 6, wet: 0.4 }),
  /** Çarpışan araba: lastik çarpma. */
  bonk: () => {
    sweep('sine', 320, 110, 0, 0.18, 0.18, { wet: 0.1 });
    noise(0, 0.06, 0.1, 400, 400, 1);
  },
  /** Çarpışan araba: elektrik vızıltısı. */
  buzz: () => sweep('sawtooth', 112, 108, 0, 0.5, 0.025, { lp: 500, wet: 0 }),
  /** Serbest düşüş kulesi çıkarken cırcır. */
  ratchet: () => noise(0, 0.02, 0.1, 3200, 3200, 4),
  /** Kalp atışı (tepede beklerken heyecan, hastanede muayene). */
  heart: () => {
    fm(62, 0, 0.12, 0.25, 1, 1, 0);
    fm(58, 0.16, 0.12, 0.18, 1, 1, 0);
  },
  /** Yere iniş: güm. */
  thump: () => {
    fm(70, 0, 0.3, 0.3, 1, 2, 0.2);
    noise(0, 0.2, 0.12, 300, 120, 0.8);
  },
  /** Ambulans / itfaiye sireni. */
  siren: () => {
    sweep('triangle', 960, 960, 0, 0.42, 0.05, { lp: 2500 });
    sweep('triangle', 770, 770, 0.45, 0.42, 0.05, { lp: 2500 });
  },
  /** Okul zili. */
  bell: () => {
    for (let k = 0; k < 6; k++) fm(1568, k * 0.08, 0.5, 0.05, 3.5, 2.4, 0.6);
  },
  /** Kitap sayfası. */
  page: () => noise(0, 0.22, 0.08, 1800, 5000, 0.9, 0.2),
  /** Market kasası: bip bip. */
  cash: () => {
    sweep('square', 1800, 1800, 0, 0.09, 0.03, { lp: 4000, wet: 0 });
    sweep('square', 2400, 2400, 0.14, 0.12, 0.03, { lp: 4000, wet: 0 });
  },
  /** Su fışkırması (itfaiye hortumu, kuyu). */
  spray: () => noise(0, 0.6, 0.1, 2500, 1400, 0.6, 0.2),
  /** Su sıçraması. */
  splash: () => {
    noise(0, 0.35, 0.16, 900, 300, 0.7, 0.3);
    bubble(0.05, 300, 900, 0.12);
  },
  /** Uçak motoru. */
  engine: () => {
    sweep('sawtooth', 92, 96, 0, 0.6, 0.035, { vib: 4, vibRate: 15, lp: 600, wet: 0 });
    noise(0, 0.6, 0.05, 700, 700, 0.5);
  },
  /** Fil borusu. */
  trumpet: () => sweep('sawtooth', 330, 420, 0, 0.9, 0.06, { mid: 620, vib: 18, vibRate: 9, lp: 1800, wet: 0.4 }),
  /** Aslan kükremesi (sevimli). */
  roar: () => {
    noise(0, 0.9, 0.18, 260, 160, 1.5, 0.3);
    sweep('sawtooth', 110, 80, 0, 0.9, 0.05, { vib: 20, vibRate: 30, lp: 500, wet: 0.3 });
  },
  /** Kısa sevinç: üç nota yukarı. */
  yay: () => [0, 2, 4].forEach((k) => fm(NOTE(k + 7), k * 0.09, 0.4, 0.08, 3.5, 1.6, 1)),
  /**
   * Korna (i: 0 araba, 1 jip/karavan, 2 tekne/jet ski düdüğü, 3 bisiklet zili, 4 sihirli araba).
   * Gerçek arabalardaki gibi iki ton (yaklaşık 415 ve 520 Hz) birlikte; kare dalga, yumuşatılmış.
   */
  horn: (i) => {
    if (i === 3) {
      for (const k of [0, 0.16]) {
        fm(2350, k, 0.55, 0.07, 1.47, 3, 0.4);
        fm(3120, k, 0.4, 0.04, 1.47, 2, 0.4);
      }
      return;
    }
    if (i === 4) {
      [0, 4, 7, 11].forEach((s, k) => fm(784 * 2 ** (s / 12), k * 0.07, 0.5, 0.06, 3.5, 1.6, 0.8));
      return;
    }
    const [f1, f2, dur, g, lp] = i === 2 ? [118, 176, 1.3, 0.07, 700] : i === 1 ? [330, 415, 0.42, 0.045, 2000] : [415, 520, 0.36, 0.04, 2600];
    for (const f of [f1, f2]) {
      sweep('square', f, f * 0.99, 0, dur, g, { lp, wet: 0.12 });
      sweep('sawtooth', f * 2, f * 1.98, 0, dur, g * 0.25, { lp, wet: 0 });
    }
  },
  /** Ayak sesi / tahta basamak. */
  step: () => noise(0, 0.05, 0.08, 700, 500, 1.2),
};

/**
 * Sürerken motor uğultusu: kalıcı iki osilatör; perde ve ses hıza göre (level 0..1).
 * kind: 'car' | 'truck' | 'boat' | 'fly' | '' (motor yok: bisiklet ya da araçtan inildi).
 */
let eng: { o1: OscillatorNode; o2: OscillatorNode; lp: BiquadFilterNode; g: GainNode } | null = null;
export function engineSound(level: number, kind: string) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime;
  if (!kind || level < 0) {
    if (eng) eng.g.gain.setTargetAtTime(0, t, 0.12);
    return;
  }
  if (!eng) {
    const o1 = a.createOscillator(), o2 = a.createOscillator(), lp = a.createBiquadFilter(), g = a.createGain();
    o1.type = 'sawtooth';
    o2.type = 'square';
    lp.type = 'lowpass';
    lp.Q.value = 2;
    g.gain.value = 0;
    o1.connect(lp);
    o2.connect(lp);
    lp.connect(g).connect(master!);
    o1.start();
    o2.start();
    eng = { o1, o2, lp, g };
  }
  const base = kind === 'boat' ? 58 : kind === 'fly' ? 110 : kind === 'truck' ? 40 : 50;
  const f = base * (1 + level * 1.1);
  eng.o1.frequency.setTargetAtTime(f, t, 0.12);
  eng.o2.frequency.setTargetAtTime(f * 0.5 + 1.5, t, 0.12);
  eng.lp.frequency.setTargetAtTime((kind === 'fly' ? 1200 : 380) + level * 700, t, 0.12);
  eng.g.gain.setTargetAtTime(0.018 + level * 0.035, t, 0.15);
}

/** Ada sesleri: `name` RIDE tablosundan; i nota sırası gibi isteğe bağlı bir sayı. */
export function rideSound(name: string, i = 0) {
  RIDE[name]?.(i);
}

// C majör pentatonik (C6 D6 E6 G6 A6 C7): seçimler sırayla bu notalarda ilerler
const PENTA = [1046.5, 1174.7, 1318.5, 1568.0, 1760.0, 2093.0];
let step = 0;
let lastSelect = 0;
const nextNote = () => {
  const now = performance.now();
  // Uzun bir aradan sonra gamın başına dön
  if (now - lastSelect > 1500) step = 0;
  lastSelect = now;
  const f = PENTA[step % PENTA.length];
  step = (step + 1 + (step % 3 === 2 ? 1 : 0)) % PENTA.length;
  return f;
};

export const sfx = {
  /** Genel dokunuş / seçim: yumuşak marimba notası + tahta tık. */
  tap: () => {
    const f = nextNote();
    noise(0, 0.012, 0.05, 3200, 3200, 0.8);
    fm(f / 2, 0, 0.22, 0.16, 4, 1.4, 0.4);
  },
  /** Seçim (giydirme vb.): tap ile aynı melodi, biraz daha parlak. */
  select: () => {
    const f = nextNote();
    noise(0, 0.012, 0.05, 3600, 3600, 0.8);
    fm(f / 2, 0, 0.26, 0.17, 4, 1.8, 0.5);
    fm(f, 0.012, 0.18, 0.05, 3.5, 1.2, 0.8);
  },
  /** Sekme değiştirme: kısa, alçak tahta tık. */
  tab: () => {
    noise(0, 0.01, 0.06, 2400, 2400, 1);
    fm(523.25, 0, 0.1, 0.1, 4, 0.9, 0.2);
  },
  /** Giysi giyme: kumaş "vuuş"u ve iki notalık parıltı. */
  wear: () => {
    noise(0, 0.18, 0.09, 700, 4200, 1.4, 0.3);
    const f = nextNote();
    fm(f, 0.06, 0.5, 0.09, 3.5, 2.2, 1);
    fm(f * 1.5, 0.12, 0.6, 0.07, 3.5, 2, 1);
  },
  /** Kabarcık "pop"u (buton, kart açma). */
  pop: () => {
    bubble(0, 380, 1100, 0.2);
    fm(1568, 0.05, 0.35, 0.06, 3.5, 1.5, 1);
  },
  /** Fotoğraf makinesi deklanşörü. */
  shutter: () => {
    noise(0, 0.025, 0.25, 5000, 5000, 0.7);
    noise(0.07, 0.05, 0.18, 2200, 1200, 0.9);
    fm(2093, 0.12, 0.4, 0.05, 3.5, 1.5, 1);
  },
  star: (i = 0) => fm(1318.5 * 2 ** (i / 6), 0, 0.7, 0.14, 3.5, 2.2, 1),
  /** Müzik karoları: Do majör gamın i. notası (0 = Do4), marimba. */
  note: (i: number) => {
    const semis = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16][i % 10];
    fm(523.25 * 2 ** (semis / 12), 0, 0.6, 0.16, 4, 1.6, 0.6);
  },
  /** Lunapark: rüzgâr "vuuuş"u (hız treni inişi, serbest düşüş). */
  whoosh: () => {
    noise(0, 1.1, 0.16, 300, 2400, 1.1, 0.3);
    noise(0.15, 0.9, 0.08, 900, 3600, 2, 0.3);
  },
  /** Topa vuruş: kısa, tok bir tık. */
  kick: () => fm(140, 0, 0.12, 0.2, 1.5, 3, 0.2),
  success: () => [1046.5, 1318.5, 1568, 2093].forEach((f, i) => fm(f, i * 0.08, 0.7, 0.12, 3.5, 2, 1)),
  soft: () => [659.3, 523.25].forEach((f, i) => fm(f, i * 0.12, 0.35, 0.11, 4, 1.2, 0.5)),
  fanfare: () =>
    [523.25, 659.3, 784, 659.3, 784, 1046.5].forEach((f, i) => {
      fm(f, i * 0.11, i === 5 ? 1.2 : 0.35, 0.13, 4, 1.8, 0.8);
      fm(f * 2, i * 0.11 + 0.01, i === 5 ? 1 : 0.25, 0.05, 3.5, 1.5, 1);
    }),
};
