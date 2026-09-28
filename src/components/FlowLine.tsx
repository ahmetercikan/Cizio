/**
 * Ekranlar boyunca akan beyaz kalem çizgisi ve koyu gölge alanı (uygulamanın imza görseli).
 * Her ekran farklı bir varyant kullanır; çizgi ekran açılırken kendini çizer.
 */
const VARIANTS: { line: string; shade: string }[] = [
  {
    line: 'M 360 -10 C 420 120, 360 210, 250 230 C 150 248, 60 250, -10 300',
    shade: 'M -10 -10 L 360 -10 C 420 120, 360 210, 250 230 C 150 248, 60 250, -10 300 Z',
  },
  {
    line: 'M 1010 330 C 900 360, 820 470, 800 560 C 785 630, 760 680, 740 710',
    shade: 'M 1010 330 C 900 360, 820 470, 800 560 C 785 630, 760 680, 740 710 L 1010 710 Z',
  },
  {
    line: 'M -10 520 C 140 470, 260 520, 330 600 C 370 650, 380 690, 390 710',
    shade: 'M -10 520 C 140 470, 260 520, 330 600 C 370 650, 380 690, 390 710 L -10 710 Z',
  },
  {
    line: 'M 620 -10 C 600 90, 700 150, 820 150 C 920 150, 980 190, 1010 250',
    shade: 'M 620 -10 C 600 90, 700 150, 820 150 C 920 150, 980 190, 1010 250 L 1010 -10 Z',
  },
];

export function FlowLine({ variant = 0 }: { variant?: number }) {
  const v = VARIANTS[variant % VARIANTS.length];
  return (
    <svg className="flowline" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true" key={variant}>
      <path className="shade" d={v.shade} />
      <path d={v.line} pathLength={1} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
