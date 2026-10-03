#!/usr/bin/env node
/**
 * Gera variantes AVIF/WebP/JPEG a partir de assets/img/source/ (hero ← 02-detail, detail ← 01-hero, story, cinema)
 * Requer: npm install (sharp em devDependencies na raiz do projeto)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = path.join(root, 'assets/img/source');
const outDir = path.join(root, 'assets/img');

const SLOTS = [
  {
    source: '02-detail.png',
    variants: [
      { name: 'hero-854', width: 854, height: 1067 },
      { name: 'hero-480', width: 480, height: 600 },
      { name: 'og-image', width: 1200, height: 630, jpegOnly: true }
    ]
  },
  {
    source: '01-hero.png',
    variants: [{ name: 'detail-400', width: 400, height: 500 }]
  },
  {
    source: '04-story.png',
    variants: [
      { name: 'story-1800', width: 1800, height: 1200 },
      { name: 'story-900', width: 900, height: 600 }
    ]
  },
  {
    source: '05-cinema.png',
    variants: [
      { name: 'cinema-1600', width: 1600, height: 1000 },
      { name: 'cinema-800', width: 800, height: 500 }
    ]
  }
];

async function writeVariant(inputPath, { name, width, height, jpegOnly }) {
  const base = sharp(inputPath).rotate().resize(width, height, {
    fit: 'cover',
    position: 'centre'
  });

  const jpegPath = path.join(outDir, `${name}.jpg`);
  await base
    .clone()
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(jpegPath);

  if (jpegOnly) return;

  await base.clone().webp({ quality: 82 }).toFile(path.join(outDir, `${name}.webp`));
  await base.clone().avif({ quality: 50, effort: 4 }).toFile(path.join(outDir, `${name}.avif`));
}

async function main() {
  for (const slot of SLOTS) {
    const inputPath = path.join(sourceDir, slot.source);
    if (!fs.existsSync(inputPath)) {
      console.error('Arquivo ausente:', inputPath);
      process.exit(1);
    }
    for (const variant of slot.variants) {
      await writeVariant(inputPath, variant);
      console.log('OK', variant.name);
    }
  }
  console.log('Imagens do casal geradas em assets/img/');
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
