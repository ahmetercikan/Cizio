/**
 * Düz renkli, konturlu çizim (avatarlar ve illüstrasyonlar için).
 *
 * Kendi dosyasında: profil avatarları bu küçük parça için ders eskizi çizen ağır
 * `Sketch.tsx` dosyasını (ve onun kalem/zaman çizelgesi takımını) açılışta indirmesin.
 */
import type { Shape } from '../lessons/types';

export function FlatArt({ shapes, stroke = '#1d1740', width = 7, recolor }: {
  shapes: Shape[]; stroke?: string; width?: number; recolor?: (fill: string) => string;
}) {
  return (
    <>
      {shapes.map((s, i) =>
        s.guide ? null : (
          <path key={i} d={s.d} fill={s.fill ? (recolor ? recolor(s.fill) : s.fill) : 'none'} stroke={stroke} strokeWidth={width}
            strokeLinecap="round" strokeLinejoin="round" />
        ),
      )}
    </>
  );
}
