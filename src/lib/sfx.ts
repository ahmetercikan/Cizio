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
      // Oda yankısı: önce birkaç erken yansıma (duvarlar), sonra tizleri sönerek dağılan kuyruk.
      // Sesleri "kuru" olmaktan çıkarıp gerçek bir mekânda çalınıyormuş gibi yapan şey budur.
      const conv = ctx.createConvolver();
      const len = Math.floor(ctx.sampleRate * 1.8);
      const ir = ctx.createBuffer(2, len, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = ir.getChannelData(ch);
        let lp = 0;
        for (let i = 0; i < len; i++) {
          const t = i / ctx.sampleRate;
          lp += (Math.random() * 2 - 1 - lp) * 0.38;
          d[i] = lp * Math.exp(-t * 4.2) * (1 - Math.exp(-t * 90));
        }
        for (const [ms, g] of [[11, 0.45], [19, 0.34], [29, 0.26], [43, 0.18]]) {
          d[Math.floor((ctx.sampleRate * ms) / 1000)] += g * (ch ? -1 : 1);
        }
      }
      conv.buffer = ir;
      reverb = ctx.createGain();
      reverb.gain.value = 0.2;
      reverb.connect(conv).connect(master);
    }
    // kullanıcı dokunmadan önce ses bağlamı askıdadır; açılamazsa sessiz devam edilir
    if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
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

// ================================================================================================
// Hazır ses kayıtları (public/sfx)
//
// Kornadan altın şıngırtısına kadar bazı sesler gerçek kayıtlardır: sentezle elde edilemeyecek
// kadar doğal duyulurlar. Dosyalar ilk kullanıldıklarında indirilip çözülür; henüz hazır
// değillerse (ya da indirilemezse) sentezlenmiş karşılığı çalar, yani ses hiçbir zaman kesilmez.
// ================================================================================================
const SFX_URL = (name: string) => new URL(`sfx/${name}.mp3`, document.baseURI).href;
const buffers = new Map<string, AudioBuffer>();
const loading = new Set<string>();
const failed = new Set<string>();

/** Kaydı indir ve çöz (bir kez); sonraki çağrılar hazır tamponu kullanır. */
function loadSample(a: AudioContext, name: string) {
  if (buffers.has(name) || loading.has(name) || failed.has(name)) return;
  loading.add(name);
  void fetch(SFX_URL(name))
    .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
    .then((b) => a.decodeAudioData(b))
    .then((buf) => buffers.set(name, buf))
    .catch(() => failed.add(name))
    .finally(() => loading.delete(name));
}

/** Oyun açılırken sık kullanılan kayıtları sessizce hazırla. */
export function preloadSfx(names: string[]) {
  const a = ac();
  if (!a) return;
  for (const n of names) loadSample(a, n);
}

/**
 * Kaydı çal. Hazır değilse false döner (çağıran sentezlenmiş sesi çalar).
 * `rate` perdeyi/hızı, `dur` en çok kaç saniye çalacağını belirler.
 */
function playSample(name: string, gain: number, o: { rate?: number; dur?: number; wet?: number; at?: number } = {}) {
  const a = ac();
  if (!a) return false;
  const buf = buffers.get(name);
  if (!buf) {
    loadSample(a, name);
    return false;
  }
  const t = a.currentTime + (o.at ?? 0);
  const src = a.createBufferSource();
  src.buffer = buf;
  src.playbackRate.value = o.rate ?? 1;
  const g = a.createGain();
  g.gain.value = gain;
  const dur = Math.min(buf.duration / (o.rate ?? 1), o.dur ?? 1e3);
  // sonunu yumuşat (erken kesilince tık olmasın)
  if (dur < buf.duration / (o.rate ?? 1)) {
    g.gain.setValueAtTime(gain, t + Math.max(0, dur - 0.12));
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
  }
  src.connect(g);
  out(a, g, o.wet ?? 0.12);
  src.start(t);
  src.stop(t + dur + 0.05);
  return true;
}

// ================================================================================================
// Ödül sesleri
//
// Zil, arp ve madeni para seslerinin "gerçek" duyulmasının sırrı, tek bir osilatör yerine doğadaki
// gibi davranmaları: zilin üst sesleri notanın tam katları değildir ve hızlı söner, telin sesi ise
// kısa bir gürültünün tel boyunca yankılanmasıyla doğar (Karplus-Strong). Ödül anları bunları
// katman katman üst üste bindirir: önce bir kabarış, sonra tok bir vuruş, sonra arpej ve en sonda
// yankıda dağılan parıltı.
// ================================================================================================

/** Çan/çıngırak: üst sesleri notanın tam katı değil, bu yüzden metalik ve canlı duyulur. */
function bell(freq: number, at: number, dur: number, gain: number, wet = 1, metal = 1) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime + at;
  // oran, ses payı, sönme payı
  const parts: [number, number, number][] = [[1, 1, 1], [2.01, 0.55, 0.7], [2.76, 0.42, 0.5], [5.4, 0.2, 0.3], [8.93, 0.1, 0.2]];
  for (const [r, amp, dec] of parts) {
    const f = freq * (1 + (r - 1) * metal);
    if (f > 16000) continue;
    const o = a.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(f, t);
    // metalin ilk anındaki hafif perde düşüşü
    o.frequency.exponentialRampToValueAtTime(f * 0.997, t + dur * dec);
    const g = a.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain * amp, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur * dec);
    o.connect(g);
    out(a, g, wet);
    o.start(t);
    o.stop(t + dur * dec + 0.05);
  }
}

/**
 * Tel sesi (arp/gitar): Karplus-Strong. Kısa bir gürültü patlaması, telin boyu kadar uzun bir
 * halkada döner; her turda komşu örneklerin ortalaması alınır, böylece tiz sesler önce söner —
 * tam da gerçek bir telin yaptığı gibi. Dalga JavaScript'te üretilir (geri besleme döngüsü yerine):
 * her perdede kararlıdır ve ses patlaması olmaz.
 */
const plucks = new Map<string, AudioBuffer>();
function pluckBuffer(a: AudioContext, freq: number, dur: number, bright: number) {
  const key = `${Math.round(freq)}|${dur.toFixed(2)}|${bright.toFixed(2)}|${a.sampleRate}`;
  let buf = plucks.get(key);
  if (buf) return buf;
  const sr = a.sampleRate;
  const n = Math.max(2, Math.round(sr / freq));
  const total = Math.max(sr * 0.05, Math.floor(sr * dur));
  buf = a.createBuffer(1, total, sr);
  const d = buf.getChannelData(0);
  const line = new Float32Array(n);
  // patlama her seferinde aynı olsun (ses seviyesi tahmin edilebilir kalsın)
  let seed = (Math.round(freq) * 2654435761) >>> 0;
  for (let i = 0; i < n; i++) {
    seed = (Math.imul(seed ^ (seed >>> 15), 2246822507) + 1) >>> 0;
    line[i] = (seed / 2147483648) - 1;
  }
  // tel ne kadar donuk çalınırsa üst sesler o kadar çabuk söner
  const smooth = 0.5 + 0.18 * (1 - bright);
  // temel ses dur saniyede duyulmaz olur
  const decay = Math.min(0.9995, 0.001 ** (1 / Math.max(1, freq * dur)));
  let p = 0;
  for (let i = 0; i < total; i++) {
    const v = line[p];
    d[i] = v;
    line[p] = (v * smooth + line[(p + 1) % n] * (1 - smooth)) * decay;
    p = (p + 1) % n;
  }
  // kuyruğu yumuşat (tık olmasın)
  const f = Math.min(total, Math.floor(sr * 0.03));
  for (let i = 0; i < f; i++) d[total - 1 - i] *= i / f;
  if (plucks.size > 48) plucks.clear();
  plucks.set(key, buf);
  return buf;
}

function pluck(freq: number, at: number, dur: number, gain: number, bright = 1, wet = 0.5) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime + at;
  const src = a.createBufferSource();
  src.buffer = pluckBuffer(a, freq, dur, bright);
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.004);
  src.connect(g);
  out(a, g, wet);
  src.start(t);
  src.stop(t + dur + 0.1);
}

/** Madeni para: yere düşen bozuk para gibi kısa, metalik, tiz bir çıngırtı. */
function coin(at: number, pitch: number, gain: number) {
  bell(2300 * pitch, at, 0.42, gain * 0.5, 0.7, 1.35);
  bell(3450 * pitch, at + 0.012, 0.3, gain * 0.3, 0.7, 1.2);
  noise(at, 0.012, gain * 0.5, 6000, 4200, 1.2, 0.2);
}

/** Tok vuruş: ödül penceresi açılırken "dum". */
function boom(at: number, gain: number) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime + at;
  const o = a.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(42, t + 0.3);
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
  o.connect(g);
  out(a, g, 0.2);
  o.start(t);
  o.stop(t + 0.5);
  noise(at, 0.09, gain * 0.35, 220, 90, 0.8, 0.15);
}

/** Kabarış: ödülden hemen önce yükselen "şşşuuu". */
function riser(at: number, dur: number, gain: number) {
  noise(at, dur, gain, 400, 5200, 0.9, 0.35);
  sweep('triangle', 300, 1600, at, dur, gain * 0.25, { lp: 3000, wet: 0.3 });
}

/** Parıltı: yankıda dağılan rastgele tiz çıngıraklar (ödülün kuyruğu). */
function sparkle(at: number, n: number, gain: number) {
  const SC = [0, 2, 4, 7, 9, 12, 14, 16, 19];
  for (let i = 0; i < n; i++) {
    const s = SC[Math.floor(Math.random() * SC.length)];
    bell(1046.5 * 2 ** (s / 12), at + i * 0.075 + Math.random() * 0.05, 1.1, gain * (0.5 + Math.random() * 0.5), 1);
  }
}

/** Yükselen arpej: ödül sesinin iskeleti (tel + çıngırak birlikte). */
function arpeggio(root: number, steps: number[], at: number, step: number, gain: number) {
  steps.forEach((s, i) => {
    const f = root * 2 ** (s / 12);
    pluck(f, at + i * step, 1.0, gain, 1, 0.5);
    bell(f * 2, at + i * step, 0.7, gain * 0.35, 1);
  });
}

/** Müzik ve uzun sesler için ana kanala bağlı bir kazanç (yoksa null: ses kapalı). */
export function audioBus(): { ctx: AudioContext; bus: GainNode } | null {
  const a = ac();
  if (!a) return null;
  const bus = a.createGain();
  bus.connect(master!);
  return { ctx: a, bus };
}

// ================================================================================================
// Gerçek araç sesleri
//
// Oyuncak gibi duyulan basit osilatörler yerine gerçek bir motorun nasıl ses çıkardığı taklit edilir:
//   1) Ateşleme dizisi: silindirler sırayla patlar → saniyede f kez tekrar eden sivri bir darbe.
//      `pulseWave` ile aynı fazda onlarca harmonik toplanır; kulağa "brrum" gelir, "bzzz" değil.
//   2) Yarım devir uğultusu: krank frekansında (f/2) alçak gümbürtü.
//   3) Egzoz hırıltısı: gürültü, ateşleme hızında kırpılır (AM) → her patlamada "pat pat".
//   4) Sürekli hava: emme/rüzgâr/lastik/su gürültüsü, gaza göre kabarır.
//   5) Hepsi hafif doygunluktan (tanh), gazla açılan rezonanslı bir alçak geçirenden ve
//      gövde/egzoz rezonansından geçer.
// Perde vitesli araçlarda her viteste başa döner; bırakınca devir yavaş düşer.
// ================================================================================================
const waves = new Map<string, PeriodicWave>();
/** Önbellekli dalga biçimi (her çağrıda yeniden üretmemek için). */
function wave(key: string, make: () => PeriodicWave) {
  let w = waves.get(key);
  if (!w) {
    w = make();
    waves.set(key, w);
  }
  return w;
}

/**
 * Darbe dizisi: n harmonik aynı fazda → periyodik sivri tepeler (bir patlama, bir "tak").
 * q büyüdükçe üst harmonikler çabuk söner (tepe yumuşar), tilt alçakları öne çıkarır.
 */
function pulseWave(a: AudioContext, n: number, q: number, tilt = 0.5) {
  const re = new Float32Array(n + 1), im = new Float32Array(n + 1);
  for (let k = 1; k <= n; k++) im[k] = (Math.exp((-q * (k - 1)) / n) / k ** tilt) * (1 - 0.25 * (k % 2));
  return a.createPeriodicWave(re, im);
}

/** Korna/siren tonu: pirinç gibi, tek sayılı harmonikleri güçlü. */
function brassWave(a: AudioContext, n: number, odd: number) {
  const re = new Float32Array(n + 1), im = new Float32Array(n + 1);
  for (let k = 1; k <= n; k++) im[k] = (1 / k ** 1.05) * (k % 2 ? 1 : odd) * Math.exp(-k / (n * 0.8));
  return a.createPeriodicWave(re, im);
}

/** Döngülü pembe gürültü: rüzgâr, lastik, su, egzoz havası (beyaz gürültüden daha doğal). */
let noiseBuf: AudioBuffer | null = null;
function noiseLoop(a: AudioContext) {
  if (noiseBuf && noiseBuf.sampleRate === a.sampleRate) return noiseBuf;
  const len = Math.floor(a.sampleRate * 2);
  const b = a.createBuffer(1, len, a.sampleRate);
  const d = b.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    b0 = 0.997 * b0 + w * 0.0993;
    b1 = 0.963 * b1 + w * 0.2965;
    b2 = 0.57 * b2 + w * 1.0527;
    d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.2;
  }
  // döngü dikişini yumuşat: baş, kuyruğa karıştırılır
  const f = Math.floor(a.sampleRate * 0.03);
  for (let i = 0; i < f; i++) {
    const k = i / f;
    d[i] = d[i] * k + d[len - f + i] * (1 - k);
  }
  noiseBuf = b;
  return b;
}

/** Yumuşak doygunluk: motora "sertlik", kornaya pirinç tadı verir. */
const SAT = new Float32Array(1024);
for (let i = 0; i < SAT.length; i++) SAT[i] = Math.tanh((i / 511.5 - 1) * 2.4) / Math.tanh(2.4);

/** Döngülü gürültü kaynağı. */
function noiseSrc(a: AudioContext) {
  const s = a.createBufferSource();
  s.buffer = noiseLoop(a);
  s.loop = true;
  return s;
}

/** Kısa motor patlaması: uzaktan duyulan bir araç, roketin ateşlenmesi, rover. */
function motorBurst(f: number, dur: number, gain: number, lp: number) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime;
  const o = a.createOscillator();
  o.setPeriodicWave(wave('burst', () => pulseWave(a, 26, 2.2, 0.55)));
  o.frequency.setValueAtTime(f * 0.78, t);
  o.frequency.linearRampToValueAtTime(f, t + dur * 0.45);
  o.frequency.linearRampToValueAtTime(f * 0.86, t + dur);
  const lpf = a.createBiquadFilter();
  lpf.type = 'lowpass';
  lpf.frequency.value = lp;
  lpf.Q.value = 1.6;
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.05);
  g.gain.setValueAtTime(gain, t + dur * 0.6);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(lpf).connect(g);
  out(a, g, 0.12);
  o.start(t);
  o.stop(t + dur + 0.05);
  noise(0, dur * 0.9, gain * 0.45, 320, 220, 0.8, 0.1);
}

/**
 * Roket kalkışı: gerçek bir fırlatma gibi. Üç katman üst üste biner —
 * yanma gürültüsü (alçaktan kabaran geniş bir uğultu), motorun derin gümbürtüsü ve
 * hızlanınca ortaya çıkan ıslıklı akış. Roket yükseldikçe ses hem kısılır hem boğuklaşır (uzaklaşma).
 */
function rocketRoar(dur: number, gain = 0.38) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime;
  const end = t + dur;
  // 1) yanma gürültüsü: alçak geçiren süzgeçten geçen geniş gürültü
  const src = noiseSrc(a);
  const lp = a.createBiquadFilter();
  lp.type = 'lowpass';
  lp.Q.value = 0.9;
  lp.frequency.setValueAtTime(260, t);
  lp.frequency.linearRampToValueAtTime(1500, t + dur * 0.3);
  lp.frequency.linearRampToValueAtTime(420, end);
  const hp = a.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 45;
  const shake = a.createBiquadFilter(); // gövde titreşimi
  shake.type = 'peaking';
  shake.frequency.value = 95;
  shake.Q.value = 1.1;
  shake.gain.value = 9;
  const ng = a.createGain();
  ng.gain.setValueAtTime(0.0001, t);
  ng.gain.exponentialRampToValueAtTime(gain, t + 0.35);
  ng.gain.setValueAtTime(gain, t + dur * 0.55);
  ng.gain.exponentialRampToValueAtTime(gain * 0.22, end - 0.3);
  ng.gain.exponentialRampToValueAtTime(0.0001, end);
  src.connect(hp).connect(shake).connect(lp).connect(ng);
  out(a, ng, 0.45);
  src.start(t);
  src.stop(end + 0.05);
  // 2) motorun derin gümbürtüsü
  const o = a.createOscillator();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(34, t);
  o.frequency.linearRampToValueAtTime(52, t + dur * 0.35);
  o.frequency.linearRampToValueAtTime(28, end);
  const olp = a.createBiquadFilter();
  olp.type = 'lowpass';
  olp.frequency.value = 180;
  const og = a.createGain();
  og.gain.setValueAtTime(0.0001, t);
  og.gain.exponentialRampToValueAtTime(gain * 0.6, t + 0.3);
  og.gain.setValueAtTime(gain * 0.6, t + dur * 0.5);
  og.gain.exponentialRampToValueAtTime(0.0001, end);
  o.connect(olp).connect(og);
  out(a, og, 0.3);
  o.start(t);
  o.stop(end + 0.05);
  // 3) ıslıklı akış: kalkıştan sonra yükselip uzaklaşır
  const air = noiseSrc(a);
  const bp = a.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 0.8;
  bp.frequency.setValueAtTime(900, t);
  bp.frequency.exponentialRampToValueAtTime(2600, t + dur * 0.45);
  bp.frequency.exponentialRampToValueAtTime(700, end);
  const ag = a.createGain();
  ag.gain.setValueAtTime(0.0001, t);
  ag.gain.exponentialRampToValueAtTime(gain * 0.3, t + dur * 0.3);
  ag.gain.exponentialRampToValueAtTime(0.0001, end);
  air.connect(bp).connect(ag);
  out(a, ag, 0.5);
  air.start(t);
  air.stop(end + 0.05);
}

/**
 * Korna tonu: gerçek klakson gibi. Perde atakta aşağıdan yakalanır (membran hızlanır), gövde
 * rezonansı metalik tadı verir, bırakınca perde hafif düşer.
 */
function hornTone(f: number, at: number, dur: number, gain: number, bright: number, lp: number, wet = 0.14) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime + at;
  const o = a.createOscillator();
  o.setPeriodicWave(wave(`horn${bright}`, () => brassWave(a, 16, bright)));
  o.frequency.setValueAtTime(f * 0.88, t);
  o.frequency.exponentialRampToValueAtTime(f, t + 0.04);
  o.frequency.setValueAtTime(f, t + Math.max(0.06, dur - 0.07));
  o.frequency.exponentialRampToValueAtTime(f * 0.93, t + dur);
  const sh = a.createWaveShaper();
  sh.curve = SAT;
  const lpf = a.createBiquadFilter();
  lpf.type = 'lowpass';
  lpf.frequency.value = lp;
  lpf.Q.value = 0.9;
  const body = a.createBiquadFilter();
  body.type = 'peaking';
  body.frequency.value = f * 4.2;
  body.Q.value = 2.2;
  body.gain.value = 7;
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.018);
  g.gain.setValueAtTime(gain, t + Math.max(0.05, dur - 0.06));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.02);
  o.connect(sh).connect(lpf).connect(body).connect(g);
  out(a, g, wet);
  o.start(t);
  o.stop(t + dur + 0.06);
  // membranın ilk "çat"ı
  noise(at, 0.02, gain * 0.5, f * 6, f * 3, 1.4, 0.05);
}

/** Siren: perdesi sürekli inip çıkan ağlamalı ton (ambulans, itfaiye). */
function sirenWail(f0: number, f1: number, turns: number, half: number, gain: number) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime;
  const dur = turns * half * 2;
  const o = a.createOscillator();
  o.setPeriodicWave(wave('siren', () => brassWave(a, 10, 0.5)));
  o.frequency.setValueAtTime(f0, t);
  for (let i = 0; i < turns; i++) {
    o.frequency.exponentialRampToValueAtTime(f1, t + half * (2 * i + 1));
    o.frequency.exponentialRampToValueAtTime(f0, t + half * (2 * i + 2));
  }
  const bp = a.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 1400;
  bp.Q.value = 0.8;
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.05);
  g.gain.setValueAtTime(gain, t + dur - 0.12);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(bp).connect(g);
  out(a, g, 0.3);
  o.start(t);
  o.stop(t + dur + 0.05);
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
  /** Ambulans / itfaiye sireni: gerçek kayıt (yoksa inip çıkan sentez ağlama). */
  siren: () => {
    if (!playSample('siren', 0.32, { dur: 2.6 })) sirenWail(620, 1480, 2, 0.42, 0.055);
  },
  /** Tahta kapının açılması (bloklardan yapılan kapılar). */
  dooropen: () => {
    if (!playSample('door', 0.45)) sweep('sawtooth', 95, 70, 0, 0.45, 0.04, { vib: 30, vibRate: 23, lp: 900, wet: 0.2 });
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
  spray: () => {
    noise(0, 0.7, 0.085, 1800, 3400, 0.5, 0.25);
    noise(0.02, 0.65, 0.05, 520, 900, 0.7, 0.2);
  },
  /** Su sıçraması: önce "tap", sonra köpük. */
  splash: () => {
    noise(0, 0.07, 0.2, 1200, 600, 0.9, 0.2);
    noise(0.04, 0.5, 0.11, 2600, 700, 0.5, 0.35);
    bubble(0.06, 280, 820, 0.09);
    bubble(0.14, 420, 1100, 0.06);
  },
  /** Uzaktan bir motor: kısa patlama (rover, geçen araç). */
  engine: () => motorBurst(34, 0.55, 0.05, 900),
  /** Roket ateşlemesi: fitil tutuşur, sonra gümbürtü başlar. */
  ignite: () => {
    noise(0, 0.5, 0.14, 1200, 320, 0.7, 0.3);
    fm(60, 0.02, 0.5, 0.3, 1, 2.4, 0.2);
  },
  /** Roket kalkışı (Mars'a gidiş ve dönüş): varsa gerçek kayıt, yoksa sentez gümbürtü. */
  rocket: (i = 0) => {
    const dur = i || 7;
    if (!playSample('rocket', 0.55, { dur, wet: 0.3 })) rocketRoar(dur);
  },
  /** Fil borusu. */
  trumpet: () => sweep('sawtooth', 330, 420, 0, 0.9, 0.06, { mid: 620, vib: 18, vibRate: 9, lp: 1800, wet: 0.4 }),
  /** Aslan kükremesi (sevimli). */
  roar: () => {
    noise(0, 0.9, 0.18, 260, 160, 1.5, 0.3);
    sweep('sawtooth', 110, 80, 0, 0.9, 0.05, { vib: 20, vibRate: 30, lp: 500, wet: 0.3 });
  },
  /** Hakem düdüğü: iki kısa öttürme. */
  referee: () => {
    sweep('sine', 2700, 2650, 0, 0.16, 0.06, { vib: 90, vibRate: 38, wet: 0.2 });
    sweep('sine', 2700, 2600, 0.22, 0.45, 0.06, { vib: 90, vibRate: 38, wet: 0.3 });
  },
  /** Tribün sevinci: kabaran kalabalık sesi ve "yeey". */
  cheer: () => {
    noise(0, 1.4, 0.12, 900, 1600, 0.6, 0.4);
    noise(0.1, 1.1, 0.06, 2600, 3200, 0.8, 0.4);
    [0, 2, 4, 7].forEach((k, i) => bell(NOTE(k + 7), 0.15 + i * 0.07, 0.8, 0.045, 0.8));
  },
  /** Basket filesi: fışş. */
  swish: () => noise(0, 0.32, 0.12, 3800, 1800, 0.7, 0.3),
  /** Top sektirme: tok güm. */
  bounce: () => {
    fm(95, 0, 0.12, 0.16, 1, 1.4, 0.05);
    noise(0, 0.04, 0.05, 600, 400, 1);
  },
  /** Çembere çarpma: çınn. */
  rim: () => {
    fm(520, 0, 0.5, 0.07, 2.76, 3, 0.4);
    fm(1310, 0, 0.35, 0.04, 1.41, 2, 0.4);
  },
  /** Kısa sevinç: üç nota yukarı (çıngırak ve tel birlikte). */
  yay: () => [0, 2, 4].forEach((k, i) => {
    bell(NOTE(k + 7), i * 0.09, 0.8, 0.07, 1);
    pluck(NOTE(k + 7) / 2, i * 0.09, 0.6, 0.05, 1, 0.5);
  }),
  /**
   * Korna (i: 0 araba, 1 kamyon/jip, 2 tekne/vapur düdüğü, 3 bisiklet zili, 4 sihirli araba, 5 skuter).
   * Gerçek klaksonlar iki tonlu: araba 420/510 Hz, kamyon havalı korna 185/245 Hz, vapur 95/125 Hz.
   */
  horn: (i) => {
    // araba ve kamyon kornası gerçek kayıt; perdesi araca göre değişir
    if (i === 0 && playSample('horn', 0.26, { dur: 1.1 })) return;
    if (i === 1 && playSample('horn', 0.28, { rate: 0.62, dur: 1.4 })) return;
    if (i === 5 && playSample('horn', 0.2, { rate: 1.45, dur: 0.8 })) return;
    if (i === 3) {
      // bisiklet zili: çan gibi uyumsuz harmonikler, iki vuruş
      for (const k of [0, 0.15]) {
        fm(2240, k, 0.75, 0.055, 2.76, 3.2, 0.5);
        fm(3380, k, 0.45, 0.03, 1.41, 2.4, 0.5);
        noise(k, 0.012, 0.05, 5200, 5200, 1.2, 0.2);
      }
      return;
    }
    if (i === 4) {
      [0, 4, 7, 11].forEach((s, k) => fm(784 * 2 ** (s / 12), k * 0.07, 0.5, 0.06, 3.5, 1.6, 0.8));
      return;
    }
    const [f1, f2, dur, g, bright, lp, wet] = i === 5
      ? [560, 690, 0.3, 0.035, 0.45, 3400, 0.12]
      : i === 2
      ? [95, 125, 1.5, 0.055, 0.85, 620, 0.42]
      : i === 1
        ? [185, 245, 0.55, 0.05, 0.7, 1900, 0.2]
        : [420, 510, 0.42, 0.045, 0.55, 2900, 0.14];
    hornTone(f1, 0, dur, g, bright, lp, wet);
    hornTone(f2, 0.005, dur, g * 0.85, bright, lp, wet);
  },
  /** Ayak sesi / tahta basamak. */
  step: () => noise(0, 0.05, 0.08, 700, 500, 1.2),
};

/**
 * Sürülen aracın motoru: katmanlı, gerçeğe yakın. `level` gaz (0..1; eksi: motoru sustur),
 * `kind` araç türü ('car' | 'truck' | 'boat' | 'plane' | 'hover' | 'bike'; boşsa ses yok).
 */
interface EngineProfile {
  /** Ateşleme (pervane/zincir) frekansı: rölanti → tam gaz. */
  f0: number;
  f1: number;
  /** Katman seviyeleri: ateşleme tonu, alçak uğultu, egzoz hırıltısı, hava gürültüsü. */
  tone: number;
  sub: number;
  rasp: number;
  air: number;
  /** Hava gürültüsünün gazla artan payı (uçakta neredeyse hepsi). */
  airGas: number;
  /** Ateşleme dalgası: harmonik sayısı ve sönümü. */
  harm: number;
  q: number;
  /** Egzoz hırıltısının ve hava gürültüsünün bandı. */
  raspF: number;
  raspQ: number;
  airF: number;
  airQ: number;
  /** Alçak geçiren: rölantide kapalı, gazda açılır. */
  lp0: number;
  lp1: number;
  /** Gövde/egzoz rezonansı. */
  bodyF: number;
  bodyQ: number;
  bodyDb: number;
  /** Vites sayısı: perde her viteste rölantiye döner (1: tek vites). */
  gears: number;
  /** Ana ses seviyesi. */
  drive: number;
  /** Rölanti titremesi. */
  wob: number;
}

const ENGINES: Record<string, EngineProfile> = {
  // benzinli 4 silindir: rölanti ~800 d/d (27 Hz ateşleme), tam gaz ~5000 d/d (165 Hz)
  car: { f0: 27, f1: 158, tone: 0.5, sub: 0.42, rasp: 0.5, air: 0.22, airGas: 0.8, harm: 24, q: 2.1, raspF: 430, raspQ: 1.1, airF: 950, airQ: 0.7, lp0: 440, lp1: 2700, bodyF: 165, bodyQ: 1.2, bodyDb: 8, gears: 3, drive: 0.05, wob: 1 },
  // tek silindirli küçük motor (skuter): ince, vınlayan, tek vites (CVT)
  scooter: { f0: 36, f1: 215, tone: 0.5, sub: 0.3, rasp: 0.45, air: 0.2, airGas: 0.8, harm: 16, q: 2.7, raspF: 800, raspQ: 1.2, airF: 1400, airQ: 0.7, lp0: 700, lp1: 3400, bodyF: 320, bodyQ: 1.3, bodyDb: 7, gears: 1, drive: 0.042, wob: 0.8 },
  // yarış arabası: yüksek devir, beş vites, çığlık gibi
  race: { f0: 40, f1: 330, tone: 0.55, sub: 0.35, rasp: 0.6, air: 0.3, airGas: 0.85, harm: 20, q: 2.4, raspF: 700, raspQ: 1, airF: 1600, airQ: 0.6, lp0: 700, lp1: 4200, bodyF: 220, bodyQ: 1.2, bodyDb: 7, gears: 5, drive: 0.05, wob: 0.7 },
  // dizel kamyon/jip: alçak, tok, hırıltılı
  truck: { f0: 18, f1: 74, tone: 0.55, sub: 0.6, rasp: 0.8, air: 0.2, airGas: 0.7, harm: 32, q: 1.3, raspF: 250, raspQ: 1.3, airF: 600, airQ: 0.6, lp0: 280, lp1: 1600, bodyF: 110, bodyQ: 1.4, bodyDb: 9, gears: 4, drive: 0.055, wob: 1.4 },
  // tekne: ağır tek silindir "pat pat" ve su sesi
  boat: { f0: 11, f1: 44, tone: 0.5, sub: 0.7, rasp: 0.6, air: 0.45, airGas: 0.65, harm: 28, q: 1.1, raspF: 190, raspQ: 1.2, airF: 1900, airQ: 0.5, lp0: 240, lp1: 1000, bodyF: 90, bodyQ: 1.5, bodyDb: 8, gears: 1, drive: 0.05, wob: 1.2 },
  // uçak: pervane çırpması (kanat geçiş frekansı) + güçlü hava akışı
  plane: { f0: 46, f1: 108, tone: 0.6, sub: 0.3, rasp: 0.85, air: 0.8, airGas: 0.55, harm: 18, q: 2.8, raspF: 900, raspQ: 0.9, airF: 2100, airQ: 0.4, lp0: 1300, lp1: 4400, bodyF: 260, bodyQ: 1, bodyDb: 6, gears: 1, drive: 0.055, wob: 0.6 },
  // uçan araba / tabak: elektrikli uğultu, patlama yok
  hover: { f0: 58, f1: 132, tone: 0.55, sub: 0.45, rasp: 0, air: 0.5, airGas: 0.6, harm: 7, q: 5.5, raspF: 1200, raspQ: 1, airF: 2800, airQ: 0.5, lp0: 1400, lp1: 4800, bodyF: 320, bodyQ: 2, bodyDb: 5, gears: 1, drive: 0.045, wob: 0.4 },
  // bisiklet: motor yok; zincir/boşluk dişlisi tıkırtısı ve rüzgâr
  bike: { f0: 4, f1: 26, tone: 0, sub: 0, rasp: 2.6, air: 1.6, airGas: 0.9, harm: 40, q: 0.8, raspF: 2600, raspQ: 3, airF: 650, airQ: 0.5, lp0: 3000, lp1: 5200, bodyF: 1800, bodyQ: 1, bodyDb: 3, gears: 1, drive: 0.06, wob: 0.3 },
};

/**
 * Vitesli araçta devir: perde her viteste rölantinin biraz üstünden yeniden yükselir, böylece
 * gerçek bir arabada olduğu gibi "vın… vın… vıııın" duyulur. Tek viteste (tekne, uçak) gaz neyse o.
 */
export function engineRev(gears: number, level: number) {
  const L = Math.min(1, Math.max(0, level));
  if (gears <= 1) return L;
  const seg = Math.min(0.9999, L) * gears;
  return 0.34 + 0.66 * (seg - Math.floor(seg));
}

/**
 * Araç türünün gerçek motor kaydı: döngüye alınır, gaz arttıkça hızlı (yani tiz) çalar.
 * Gerçek motor kaydı sentezden çok daha inandırıcıdır; dosya yoksa sentez motoru devreye girer.
 */
const ENGINE_SAMPLE: Record<string, { file: string; r0: number; r1: number; gain: number; lp0: number; lp1: number }> = {
  car: { file: 'engine-car', r0: 0.85, r1: 2.1, gain: 0.5, lp0: 900, lp1: 6000 },
  truck: { file: 'engine-car', r0: 0.52, r1: 1.2, gain: 0.55, lp0: 600, lp1: 3200 },
  race: { file: 'engine-car', r0: 1.0, r1: 2.9, gain: 0.5, lp0: 1200, lp1: 9000 },
  scooter: { file: 'engine-car', r0: 1.5, r1: 3.2, gain: 0.34, lp0: 1400, lp1: 9000 },
  boat: { file: 'engine-car', r0: 0.42, r1: 0.78, gain: 0.5, lp0: 380, lp1: 1500 },
  plane: { file: 'engine-plane', r0: 0.8, r1: 1.4, gain: 0.5, lp0: 1800, lp1: 9000 },
};

interface Engine {
  kind: string;
  /** Yumuşatılmış gaz (motor devri hemen değişmez). */
  lvl: number;
  t: number;
  /** Sentez motoru katmanları (kayıt kullanılıyorsa yok). */
  osc?: OscillatorNode;
  sub?: OscillatorNode;
  am?: OscillatorNode;
  air?: GainNode;
  airF?: BiquadFilterNode;
  rasp?: GainNode;
  /** Gerçek kayıt kullanılıyorsa: çalma hızı ve ayarları. */
  rate?: AudioParam;
  smp?: { r0: number; r1: number; lp0: number; lp1: number; gain: number };
  lp: BiquadFilterNode;
  g: GainNode;
  srcs: { stop(t: number): void }[];
}

/** Gerçek motor kaydıyla çalan motor (kayıt hazır değilse null). */
function buildSampleEngine(a: AudioContext, kind: string): Engine | null {
  const def = ENGINE_SAMPLE[kind];
  if (!def) return null;
  const buf = buffers.get(def.file);
  if (!buf) {
    loadSample(a, def.file);
    return null;
  }
  const t = a.currentTime;
  const g = a.createGain();
  g.gain.value = 0;
  const lp = a.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = def.lp0;
  lp.Q.value = 0.8;
  const src = a.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  // kaydın baş ve son anlarında sessizlik olabilir: ortasından döngü
  src.loopStart = Math.min(0.15, buf.duration * 0.05);
  src.loopEnd = Math.max(src.loopStart + 0.2, buf.duration - 0.08);
  src.playbackRate.value = def.r0;
  src.connect(lp).connect(g).connect(master!);
  const wet = a.createGain();
  wet.gain.value = 0.08;
  g.connect(wet).connect(reverb!);
  src.start(t);
  return { kind, lvl: 0, t, rate: src.playbackRate, smp: def, lp, g, srcs: [src] };
}
let eng: Engine | null = null;

function buildEngine(a: AudioContext, kind: string, p: EngineProfile): Engine {
  const t = a.currentTime;
  const g = a.createGain();
  g.gain.value = 0;
  const body = a.createBiquadFilter();
  body.type = 'peaking';
  body.frequency.value = p.bodyF;
  body.Q.value = p.bodyQ;
  body.gain.value = p.bodyDb;
  const lp = a.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = p.lp0;
  lp.Q.value = 1.8;
  const sh = a.createWaveShaper();
  sh.curve = SAT;
  sh.connect(lp).connect(body).connect(g).connect(master!);
  // dışarıda olmanın ferahlığı: azıcık yankı
  const wet = a.createGain();
  wet.gain.value = 0.1;
  g.connect(wet).connect(reverb!);

  // 1) ateşleme tonu
  const osc = a.createOscillator();
  osc.setPeriodicWave(wave(`eng${kind}`, () => pulseWave(a, p.harm, p.q)));
  osc.frequency.value = p.f0;
  const oscG = a.createGain();
  oscG.gain.value = p.tone;
  osc.connect(oscG).connect(sh);
  // 2) krank uğultusu (yarım frekans)
  const sub = a.createOscillator();
  sub.type = 'triangle';
  sub.frequency.value = p.f0 / 2;
  const subG = a.createGain();
  subG.gain.value = p.sub;
  sub.connect(subG).connect(sh);
  // 3) egzoz hırıltısı: gürültü, ateşleme hızında kırpılır
  const am = a.createOscillator();
  am.setPeriodicWave(wave('am', () => pulseWave(a, 14, 1.2, 0.8)));
  am.frequency.value = p.f0;
  const amDepth = a.createGain();
  amDepth.gain.value = 0.55;
  const amGate = a.createGain();
  amGate.gain.value = 0.45;
  am.connect(amDepth).connect(amGate.gain);
  const raspSrc = noiseSrc(a);
  const raspF = a.createBiquadFilter();
  raspF.type = 'bandpass';
  raspF.frequency.value = p.raspF;
  raspF.Q.value = p.raspQ;
  const rasp = a.createGain();
  rasp.gain.value = 0;
  raspSrc.connect(raspF).connect(amGate).connect(rasp).connect(sh);
  // 4) sürekli hava: emme, rüzgâr, lastik, su
  const airSrc = noiseSrc(a);
  const airF = a.createBiquadFilter();
  airF.type = 'bandpass';
  airF.frequency.value = p.airF;
  airF.Q.value = p.airQ;
  const air = a.createGain();
  air.gain.value = 0;
  airSrc.connect(airF).connect(air).connect(sh);

  osc.start(t);
  sub.start(t);
  am.start(t);
  raspSrc.start(t);
  airSrc.start(t);
  return { kind, lvl: 0, t, osc, sub, am, air, airF, rasp, lp, g, srcs: [osc, sub, am, raspSrc, airSrc] };
}

/** Motoru sustur ve bırak (araçtan inildi ya da araç değişti). */
function stopEngine(a: AudioContext) {
  if (!eng) return;
  const t = a.currentTime;
  eng.g.gain.cancelScheduledValues(t);
  eng.g.gain.setTargetAtTime(0, t, 0.05);
  for (const s of eng.srcs) s.stop(t + 0.3);
  eng = null;
}

export function engineSound(level: number, kind: string) {
  const a = ac();
  if (!a) return;
  const k = kind === 'fly' ? 'plane' : kind;
  const p = ENGINES[k];
  if (!p || level < 0) {
    if (eng) stopEngine(a);
    return;
  }
  if (eng && eng.kind !== k) stopEngine(a);
  // önce gerçek kayıt; indirilmediyse sentez motoru
  if (!eng) eng = buildSampleEngine(a, k) ?? buildEngine(a, k, p);
  const t = a.currentTime;
  const dt = Math.min(0.25, Math.max(0, t - eng.t));
  eng.t = t;
  // gaz: çabuk açılır, yavaş düşer (devir hemen inmez)
  const target = Math.min(1, Math.max(0, level));
  eng.lvl += (target - eng.lvl) * Math.min(1, dt * (target > eng.lvl ? 3.4 : 1.7));
  const L = eng.lvl;
  const rev = engineRev(p.gears, L);
  // rölantide motor hafif titrer (gazda düzelir)
  const wob = 1 + (Math.random() - 0.5) * 0.07 * p.wob * (1 - 0.8 * L);
  if (eng.rate && eng.smp) {
    // gerçek kayıt: devir arttıkça daha hızlı çalar
    const d = eng.smp;
    eng.rate.setTargetAtTime((d.r0 + (d.r1 - d.r0) * rev) * wob, t, 0.06);
    eng.lp.frequency.setTargetAtTime(d.lp0 + (d.lp1 - d.lp0) * L, t, 0.09);
    eng.g.gain.setTargetAtTime(d.gain * (0.5 + 0.5 * L) * 0.14, t, 0.1);
    return;
  }
  const f = (p.f0 + (p.f1 - p.f0) * rev) * wob;
  eng.osc!.frequency.setTargetAtTime(f, t, 0.05);
  eng.sub!.frequency.setTargetAtTime(f / 2, t, 0.05);
  eng.am!.frequency.setTargetAtTime(f, t, 0.05);
  eng.lp.frequency.setTargetAtTime(p.lp0 + (p.lp1 - p.lp0) * L, t, 0.09);
  eng.airF!.frequency.setTargetAtTime(p.airF * (0.8 + 0.45 * L), t, 0.12);
  eng.air!.gain.setTargetAtTime(p.air * (1 - p.airGas + p.airGas * L), t, 0.12);
  eng.rasp!.gain.setTargetAtTime(p.rasp * (0.45 + 0.55 * L), t, 0.1);
  eng.g.gain.setTargetAtTime(p.drive * (0.45 + 0.55 * L), t, 0.1);
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
  /** Genel dokunuş / seçim: gerçek bir düğme tıkı (yoksa yumuşak marimba notası). */
  tap: () => {
    if (playSample('tap', 0.5)) return;
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
    if (playSample('pop', 0.5)) return;
    bubble(0, 380, 1100, 0.2);
    fm(1568, 0.05, 0.35, 0.06, 3.5, 1.5, 1);
  },
  /** Fotoğraf makinesi deklanşörü. */
  shutter: () => {
    noise(0, 0.025, 0.25, 5000, 5000, 0.7);
    noise(0.07, 0.05, 0.18, 2200, 1200, 0.9);
    fm(2093, 0.12, 0.4, 0.05, 3.5, 1.5, 1);
  },
  /** Yıldız/puan: her seferinde bir üst basamakta çalan kristal çıngırak. */
  star: (i = 0) => {
    const f = 1046.5 * 2 ** ([0, 2, 4, 7, 9, 12][i % 6] / 12);
    bell(f, 0, 0.9, 0.11, 1);
    pluck(f / 2, 0, 0.5, 0.05, 1, 0.5);
  },
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
  /**
   * Başarı (oyun bitti, sipariş tamam): kısa, yukarı çıkan kutlama stingi.
   * (Eski `win.mp3` örneği tizden pese iniyordu: çocuk kazandığında kaybetmiş gibi duyuluyordu, kaldırıldı.)
   */
  success: () => {
    riser(0, 0.26, 0.05);
    // do–mi–sol–do: hep yukarı çıkan neşeli dörtlü
    arpeggio(523.25, [0, 4, 7, 12], 0.16, 0.09, 0.11);
    for (const s of [12, 16, 19]) bell(523.25 * 2 ** (s / 12), 0.52, 1.5, 0.05, 1);
    sparkle(0.6, 6, 0.032);
  },
  /** Küçük olumsuzluk / nazik uyarı: iki inen yumuşak nota. */
  soft: () => [659.3, 523.25].forEach((f, i) => {
    pluck(f, i * 0.12, 0.5, 0.09, 0.5, 0.4);
    bell(f * 2, i * 0.12, 0.4, 0.025, 0.6);
  }),
  /** Büyük ödül (hediye, sandık, seviye): parıltılı kutlama. */
  fanfare: () => {
    // örneğin sonundaki boğuk uğultu kesilsin: yalnızca parlak kutlama bölümü çalar
    if (playSample('reward', 0.5, { dur: 1.6 })) return;
    riser(0, 0.3, 0.05);
    boom(0.26, 0.2);
    arpeggio(523.25, [0, 4, 7, 12, 16], 0.28, 0.09, 0.075);
    // son akor: notalar birlikte, uzun çınlasın
    for (const s of [12, 16, 19, 24]) {
      pluck(523.25 * 2 ** (s / 12), 0.74, 1.8, 0.05, 1, 0.7);
      bell(523.25 * 2 ** (s / 12), 0.74, 2.2, 0.03, 1);
    }
    sparkle(0.9, 7, 0.028);
  },
  /** Altın dökülmesi: sayı büyüdükçe daha çok para çıngırdar. */
  coins: (n = 5) => {
    const k = Math.max(2, Math.min(5, Math.round(n / 2)));
    for (let i = 0; i < k; i++) {
      const at = i * 0.085, rate = 0.92 + Math.random() * 0.22;
      if (!playSample('coin', 0.38, { at, rate })) coin(at, rate, 0.085);
    }
  },
  /** Hazine sandığı açıldı. */
  chest: () => {
    if (!playSample('chest', 0.55)) sfx.fanfare();
    setTimeout(() => sfx.coins(8), 500);
  },
  /** Ödül penceresi: şenlik sesi ve ardından altınlar. */
  reward: (coinsN = 5) => {
    sfx.fanfare();
    setTimeout(() => sfx.coins(coinsN), 620);
  },
};
