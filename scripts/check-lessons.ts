/**
 * Ders dosyalarını hızlıca denetler (vitest'ten çok daha hafif; src/lessons/__tests__/lessons.test.ts ile aynı kurallar):
 * biçim (adım sayısı, cümle uzunluğu, 0–400 sınırları), doğru iz sürmenin her adımda 3 yıldız alması,
 * boş ya da 60 px kaydırılmış çizimin 3 yıldız almaması, kimlik ve başlık benzersizliği.
 *
 * Kullanım: npx tsx scripts/check-lessons.ts [dersId...]   (kimlik verilmezse hepsi)
 */
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { samplePath } from '../src/engine/pathSampler';
import { scoreStep } from '../src/engine/scoring';
import type { StrokeAction } from '../src/engine/types';
import type { Lesson, Shape } from '../src/lessons/types';

const want = new Set(process.argv.slice(2));
const all: Lesson[] = [];
for (const f of readdirSync('src/lessons/data').filter((f) => f.endsWith('.ts')).sort()) {
  all.push((await import(pathToFileURL(join(process.cwd(), 'src', 'lessons', 'data', f)).href)).default);
}

const trace = (shapes: Shape[], dx = 0): StrokeAction[] =>
  shapes
    .filter((s) => !s.guide)
    .map((s) => ({
      kind: 'stroke',
      tool: 'pencil',
      color: '#000',
      size: 4,
      points: samplePath(s.d, 5).points.map(([x, y], i) => [x + dx + (i % 2 ? 2 : -2), y + dx * 0.8, 0.5] as [number, number, number]),
    }));

const errors: string[] = [];
const err = (l: Lesson, m: string) => errors.push(`${l.id}: ${m}`);

const ids = new Map<string, number>();
const titles = new Map<string, number>();
for (const l of all) {
  ids.set(l.id, (ids.get(l.id) ?? 0) + 1);
  titles.set(l.title, (titles.get(l.title) ?? 0) + 1);
}

for (const l of all) {
  if (want.size && !want.has(l.id)) continue;
  if ((ids.get(l.id) ?? 0) > 1) err(l, 'kimlik başka bir derste de var');
  if ((titles.get(l.title) ?? 0) > 1) err(l, `başlık başka bir derste de var: ${l.title}`);
  if (l.steps.length < 3) err(l, 'en az 3 adım olmalı');
  l.steps.forEach((st, i) => {
    if (st.say.length > 120) err(l, `adım ${i + 1}: cümle ${st.say.length} karakter (en çok 120)`);
    if (!st.shapes.length) err(l, `adım ${i + 1}: şekil yok`);
    for (const s of st.shapes) {
      const { points } = samplePath(s.d);
      if (points.length < 2) err(l, `adım ${i + 1}: "${s.part}" yolu çözülemedi`);
      for (const [x, y] of points) {
        if (x < 0 || x > 400 || y < 0 || y > 400) {
          err(l, `adım ${i + 1}: "${s.part}" 0–400 dışına taşıyor (${x.toFixed(0)},${y.toFixed(0)})`);
          break;
        }
      }
    }
    const context = l.steps.slice(0, i + 1).flatMap((s) => s.shapes);
    const ok = scoreStep(st.shapes, context, trace(st.shapes));
    if (ok.stars !== 3) err(l, `adım ${i + 1}: doğru iz sürme ${ok.stars} yıldız aldı (3 olmalı)`);
    if (!st.shapes.every((s) => s.guide)) {
      if (scoreStep(st.shapes, context, []).stars !== 0) err(l, `adım ${i + 1}: boş çizim 0 yıldız almalı`);
      if (scoreStep(st.shapes, context, trace(st.shapes, 60)).stars >= 3) err(l, `adım ${i + 1}: 60 px kaydırılmış çizim 3 yıldız aldı (şekiller çok büyük/belirsiz)`);
    }
  });
}

const checked = want.size ? [...want].length : all.length;
if (errors.length) {
  console.log(`HATA (${errors.length}):`);
  for (const e of errors) console.log('  ' + e);
  process.exit(1);
}
console.log(`Tamam: ${checked} ders kurallara uyuyor (toplam ${all.length} ders).`);
