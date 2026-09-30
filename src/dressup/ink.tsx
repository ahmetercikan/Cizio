/** Giydirme çizimlerinin ortak araçları: mürekkep konturu, kalın uzuv çizgisi, gövde yolları, renk tonu. */
export const INK = '#3a2b27';
export const SW = 3.5;
export const o = { stroke: INK, strokeWidth: SW, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

export const ARM_L = 'M118,198 C104,226 96,256 90,296';
export const ARM_R = 'M182,198 C196,226 204,256 210,296';
export const LEG_L = 'M134,300 L130,392';
export const LEG_R = 'M166,300 L170,392';
export const TORSO = 'M112,196 C112,186 122,180 134,180 H166 C178,180 188,186 188,196 L192,300 C192,306 186,310 180,310 H120 C114,310 108,306 108,300 Z';
export const TOP = 'M110,196 C110,184 121,178 134,178 H166 C179,178 190,184 190,196 L194,302 C194,308 188,312 182,312 H118 C112,312 106,308 106,302 Z';
export const BODICE = 'M113,196 C113,186 122,181 134,181 H166 C178,181 187,186 187,196 L189,292 H111 Z';

/** Kontürlü kalın çizgi (kol, bacak, kol giysisi). `dash` verilirse yalnızca baştaki o uzunluk çizilir. */
export function Limb({ d, c, w, dash }: { d: string; c: string; w: number; dash?: number }) {
  const da = dash ? `${dash} 999` : undefined;
  const cap = dash ? 'butt' : 'round';
  return (
    <>
      <path d={d} fill="none" stroke={INK} strokeWidth={w + 2 * SW} strokeLinecap={cap} strokeDasharray={da} />
      <path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinecap={cap} strokeDasharray={da} />
    </>
  );
}

export const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
};

