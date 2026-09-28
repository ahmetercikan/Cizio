/**
 * Derslerin adım adım görünümünü PNG olarak üretir (içerik kontrolü için).
 * Kullanım: npx tsx scripts/render-lessons.ts [dersId...]
 * Çıktı: .render/<dersId>.png
 */
import sharp from 'sharp';
import { mkdirSync, readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import type { Lesson } from '../src/lessons/types';

const CELL = 260;
const out = '.render';
mkdirSync(out, { recursive: true });

function cell(lesson: Lesson, upto: number, colored: boolean): string {
  let g = '';
  lesson.steps.forEach((step, i) => {
    if (i > upto) return;
    for (const s of step.shapes) {
      const current = i === upto && !colored;
      const stroke = s.guide ? '#9ab' : current ? '#ff5a36' : '#333';
      const dash = s.guide ? 'stroke-dasharray="8 8"' : '';
      const fill = colored && s.fill ? s.fill : 'none';
      g += `<path d="${s.d}" fill="${fill}" stroke="${stroke}" stroke-width="${s.guide ? 3 : 6}" stroke-linecap="round" stroke-linejoin="round" ${dash}/>`;
    }
  });
  return g;
}

async function render(lesson: Lesson) {
  const n = lesson.steps.length + 1;
  const cols = Math.min(n, 4);
  const rows = Math.ceil(n / cols);
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cols * CELL}" height="${rows * (CELL + 30)}"><rect width="100%" height="100%" fill="#fff"/>`;
  for (let i = 0; i < n; i++) {
    const x = (i % cols) * CELL;
    const y = Math.floor(i / cols) * (CELL + 30);
    const colored = i === lesson.steps.length;
    const upto = colored ? lesson.steps.length - 1 : i;
    svg += `<g transform="translate(${x},${y})"><rect x="4" y="4" width="${CELL - 8}" height="${CELL - 8}" fill="#fafafa" stroke="#ddd"/>`;
    svg += `<svg x="10" y="10" width="${CELL - 20}" height="${CELL - 20}" viewBox="0 0 400 400">${cell(lesson, upto, colored)}</svg>`;
    svg += `<text x="10" y="${CELL + 18}" font-size="14" font-family="sans-serif">${colored ? 'Boyalı' : `Adım ${i + 1}`}</text></g>`;
  }
  svg += '</svg>';
  await sharp(Buffer.from(svg)).png().toFile(`${out}/${lesson.id}.png`);
  console.log(`${out}/${lesson.id}.png`);
}

const ids = process.argv.slice(2);
const lessons: Lesson[] = [];
for (const f of readdirSync('src/lessons/data').filter((f) => f.endsWith('.ts'))) {
  lessons.push((await import(pathToFileURL(`src/lessons/data/${f}`).href)).default);
}
for (const l of lessons.filter((l) => ids.length === 0 || ids.includes(l.id))) await render(l);
