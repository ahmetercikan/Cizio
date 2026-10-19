/**
 * Açılışta ders verisine ihtiyaç duyan üç küçük şeyi dosyaya yazar:
 *
 *  - `src/lessons/meta.ts`        — her dersin kimliği, adı, yolu, seviyesi (çizim adımları yok)
 *  - `src/components/HomeArt.tsx` — ana sayfadaki iki süs çizimi (kedi, güneş-bulut)
 *  - `src/components/AvatarShapes.ts` — profil avatarlarının çizimleri (12 ders)
 *
 * Neden: ana sayfa, profil seçimi ve kayıt dosyası eskiden sadece bunlar için bütün ders verisini
 * (yarım megabayt) açılışta indiriyordu. Artık ders verisi yalnızca Öğren/Atölye açılınca iniyor.
 *
 * Ders eklendiğinde, çıkarıldığında ya da bir dersin adı/çizimi değiştiğinde: `npm run art`
 * (`npm test` zaten uyuşmazlığı yakalar).
 */
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { samplePath } from '../src/engine/pathSampler';
import type { Lesson, Shape } from '../src/lessons/types';

const SRC = join(import.meta.dirname, '../src');
const AVATAR_LESSONS = ['kedi', 'tavsan', 'panda', 'baykus', 'balik', 'kaplumbaga', 'canavar', 'robot', 'uzayli', 'peri', 'dondurma', 'mantar'];

// Bütün dersler, src/lessons/index.ts ile aynı sırada
const ids = readdirSync(join(SRC, 'lessons/data')).filter((f) => f.endsWith('.ts'));
const all: Lesson[] = (await Promise.all(ids.map((f) => import(join(SRC, 'lessons/data', f)).then((m) => m.default as Lesson))))
  .sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || a.level - b.level || a.title.localeCompare(b.title, 'tr'));
const byId = (id: string) => all.find((l) => l.id === id) ?? (() => { throw new Error('ders yok: ' + id); })();

const q = (s: string) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const shape = (s: Shape) => `{ d: ${q(s.d)}${s.part ? `, part: ${q(s.part)}` : ''}${s.fill ? `, fill: ${q(s.fill)}` : ''}${s.guide ? ', guide: true' : ''} }`;
const flat = (id: string) => byId(id).steps.flatMap((s) => s.shapes);

// ------------------------------------------------------------------------------------------------
// 1) Ders künyeleri
// ------------------------------------------------------------------------------------------------
writeFileSync(
  join(SRC, 'lessons/meta.ts'),
  `/**
 * Derslerin künyesi: kimlik, ad, yol, seviye. Çizim adımları burada yok.
 *
 * Ana sayfa ("… çizim dersi") ve kayıt dosyası (günün görevi) yalnızca bu kadarını kullanıyor;
 * böylece açılışta yarım megabaytlık çizim verisi inmiyor.
 *
 * Bu dosya elle değiştirilmez — \`npm run art\` üretir, \`npm test\` ders listesiyle aynı olduğunu kontrol eder.
 */
import type { LessonMeta } from './types';

export const LESSON_META: LessonMeta[] = [
${all.map((l) => `  { id: ${q(l.id)}, path: ${q(l.path)}, title: ${q(l.title)}, emoji: ${q(l.emoji)}, level: ${l.level}${l.order === undefined ? '' : `, order: ${l.order}`} },`).join('\n')}
];

/** Ana sayfada yazan ders sayısı. */
export const LESSON_COUNT = LESSON_META.length;
`,
  'utf8',
);

// ------------------------------------------------------------------------------------------------
// 2) Ana sayfanın iki süs çizimi
// ------------------------------------------------------------------------------------------------
const cut = (id: string) => {
  const shapes = flat(id).filter((s) => !s.guide);
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const s of shapes)
    for (const [x, y] of samplePath(s.d, 6).points) {
      x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
    }
  // Kare kutu: resim kartın ortasında, kenarlarda çizgi kalınlığı kadar pay (english/Art.tsx ile aynı hesap)
  const size = Math.max(x1 - x0, y1 - y0) + 24;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  return {
    box: `${(cx - size / 2).toFixed(1)} ${(cy - size / 2).toFixed(1)} ${size.toFixed(1)} ${size.toFixed(1)}`,
    list: shapes.map((s) => `  ${shape(s)},`).join('\n'),
    n: shapes.length,
  };
};
const kedi = cut('kedi'), gunes = cut('gunes-bulut');
writeFileSync(
  join(SRC, 'components/HomeArt.tsx'),
  `/**
 * Ana sayfadaki "Çizio Atölyesi" kartının arkasındaki iki çizim: kedi ve güneş-bulut dersleri.
 *
 * Bu dosya elle değiştirilmez — \`npm run art\` üretir (bkz. scripts/bake-art.ts).
 */
import { memo } from 'react';
import { INK } from '../dressup/ink';
import type { Shape } from '../lessons/types';

const sw = { stroke: INK, strokeWidth: 7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

const KEDI_BOX = '${kedi.box}';
const KEDI: Shape[] = [
${kedi.list}
];

const GUNES_BOX = '${gunes.box}';
const GUNES: Shape[] = [
${gunes.list}
];

const Art = ({ box, shapes }: { box: string; shapes: Shape[] }) => (
  <svg viewBox={box} aria-hidden="true">
    {shapes.map((s, i) => (
      <path key={i} d={s.d} fill={s.fill ?? 'none'} {...sw} />
    ))}
  </svg>
);

export const KediArt = memo(() => <Art box={KEDI_BOX} shapes={KEDI} />);
export const GunesArt = memo(() => <Art box={GUNES_BOX} shapes={GUNES} />);
`,
  'utf8',
);

// ------------------------------------------------------------------------------------------------
// 3) Profil avatarlarının çizimleri
// ------------------------------------------------------------------------------------------------
writeFileSync(
  join(SRC, 'components/AvatarShapes.ts'),
  `/**
 * Profil avatarlarının çizimleri — ders çizimlerinin aynısı, buraya yazılmış hâli.
 *
 * Bu dosya elle değiştirilmez — \`npm run art\` üretir (bkz. scripts/bake-art.ts).
 */
import type { Shape } from '../lessons/types';

export const AVATAR_SHAPES: Record<string, Shape[]> = {
${AVATAR_LESSONS.map((id) => `  ${id}: [\n${flat(id).map((s) => `    ${shape(s)},`).join('\n')}\n  ],`).join('\n')}
};
`,
  'utf8',
);

console.log(`yazıldı: meta (${all.length} ders), HomeArt (kedi ${kedi.n}, güneş-bulut ${gunes.n} şekil), AvatarShapes (${AVATAR_LESSONS.length} avatar)`);
