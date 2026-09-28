/**
 * Gerçekçi sarı kurşun kalem (ders "videosunda" çizgiyi çizen kalem).
 * Yerel koordinatlarda uç (0,0)'dadır, gövde +x yönünde uzanır; `angle` ile döndürülür.
 */
export function PencilSprite({ x, y, angle = 58, lifted = false, scale = 1 }: {
  x: number; y: number; angle?: number; lifted?: boolean; scale?: number;
}) {
  const sh = lifted ? { dx: 14, dy: 18, o: 0.12 } : { dx: 5, dy: 8, o: 0.22 };
  const body = 'M9,-2.4 L30,-8.5 L196,-8.5 Q200,-8.5 200,-4 L200,4 Q200,8.5 196,8.5 L30,8.5 L9,2.4 Z';
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} style={{ pointerEvents: 'none' }}>
      {/* gölge (kağıda düşen) */}
      <g transform={`translate(${sh.dx} ${sh.dy}) rotate(${angle})`} opacity={sh.o} filter="url(#pencil-shadow)">
        <path d={`M0,0 ${body.slice(1)}`} fill="#000" />
      </g>
      <g transform={`rotate(${angle})${lifted ? ' translate(-4 -6)' : ''}`}>
        {/* grafit uç */}
        <path d="M0,0 L9.5,-2.6 L9.5,2.6 Z" fill="#3a3a40" />
        {/* açılmış ahşap */}
        <path d="M9,-2.4 L30,-8.5 Q27.5,-5.2 30,-2.8 Q27.5,0 30,2.8 Q27.5,5.2 30,8.5 L9,2.4 Z" fill="#efc592" />
        <path d="M9,-2.4 L30,-8.5 Q27.5,-5.2 30,-2.8 L12,-0.6 Z" fill="#f8dab0" />
        {/* altıgen gövde: üç yüz */}
        <path d="M29,-8.5 L162,-8.5 L162,-3 L29.5,-3 Q27.6,-5.6 29,-8.5 Z" fill="#ffc446" />
        <path d="M29.5,-3 L162,-3 L162,3 L29.5,3 Q27.8,0 29.5,-3 Z" fill="#f7a51b" />
        <path d="M29.5,3 L162,3 L162,8.5 L29,8.5 Q27.6,5.6 29.5,3 Z" fill="#dc8a0b" />
        <path d="M30,-3 L162,-3 M30,3 L162,3" stroke="#c9780a" strokeWidth="0.5" opacity="0.6" />
        {/* metal bilezik */}
        <rect x="162" y="-8.8" width="19" height="17.6" rx="1.5" fill="#c9ccd3" />
        <rect x="162" y="-8.8" width="19" height="4.5" rx="1.5" fill="#e6e8ec" />
        <path d="M166,-8.8 V8.8 M170.5,-8.8 V8.8 M175,-8.8 V8.8" stroke="#9aa0aa" strokeWidth="0.9" />
        {/* silgi */}
        <path d="M181,-8.6 H193 Q199,-8.6 199,-2.6 V2.6 Q199,8.6 193,8.6 H181 Z" fill="#f29aa3" />
        <path d="M181,-8.6 H193 Q199,-8.6 199,-4 H181 Z" fill="#f8bcc2" />
      </g>
    </g>
  );
}

/** <defs> içine bir kez konması gereken kalem gölgesi filtresi. */
export function PencilDefs() {
  return (
    <filter id="pencil-shadow" x="-20%" y="-50%" width="140%" height="200%">
      <feGaussianBlur stdDeviation="3.2" />
    </filter>
  );
}
