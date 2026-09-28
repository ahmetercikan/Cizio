/** Uygulama ikonlarını Kalemo maskotundan üretir: npm run icons */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { Mascot } from '../src/components/Mascot';

(globalThis as unknown as { React: typeof React }).React = React;

function iconSvg(size: number, maskable: boolean) {
  const pad = maskable ? size * 0.2 : size * 0.1;
  const inner = renderToStaticMarkup(<Mascot size={size - pad * 2} mood="happy" />).replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  const r = maskable ? 0 : size * 0.22;
  const mh = ((size - pad * 2) * 170) / 140;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8f74ff"/><stop offset="1" stop-color="#6a4cf0"/></linearGradient></defs>
  <rect width="${size}" height="${size}" rx="${r}" fill="url(#g)"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * (maskable ? 0.3 : 0.38)}" fill="#fff8ef" opacity="0.18"/>
  <g transform="translate(${pad + (size - pad * 2) * 0.08},${(size - mh) / 2}) scale(0.84)">${inner}</g>
</svg>`;
}

await sharp(Buffer.from(iconSvg(192, false))).png().toFile('public/icons/icon-192.png');
await sharp(Buffer.from(iconSvg(512, false))).png().toFile('public/icons/icon-512.png');
await sharp(Buffer.from(iconSvg(512, true))).png().toFile('public/icons/icon-maskable-512.png');
writeFileSync('public/favicon.svg', iconSvg(64, false));
console.log('ikonlar üretildi');
