// news-image-20261120 entrypoint — Node 22, standard library only.
// The front page (entry.png) was drawn at build time from live reporting
// on Friday 20 November 2026. This program checks the image against the
// competition gate, copies it to the grader's output directory, and proves
// the copy matches the repository file byte for byte.
//
// Local run:
//   MAKEFUN_OUTPUT_DIR=/tmp/ni20-out node main.ts

import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';

const src = new URL('./entry.png', import.meta.url);
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const out = path.join(outDir, 'entry.png');
const data = fs.readFileSync(src);
const magic = Buffer.from('89504e470d0a1a0a', 'hex');
const isPng = data.length >= 24 && magic.equals(data.subarray(0, 8));
const whole = data.subarray(data.length - 8, data.length - 4).toString('latin1') === 'IEND';
const w = data.readUInt32BE(16);
const h = data.readUInt32BE(20);
const sizeOk = data.length <= 1048576;
const dimsOk = w <= 1024 && h <= 1024;
const problems = [
  !isPng ? 'not a PNG file' : '',
  !whole ? 'missing IEND chunk' : '',
  !dimsOk ? `image is ${w}x${h}, over 1024x1024` : '',
  !sizeOk ? 'image is over 1 MiB' : '',
].filter(Boolean);
if (problems.length) throw new Error(`entry.png rejected: ${problems.join('; ')}`);
fs.mkdirSync(outDir, { recursive: true });
fs.copyFileSync(src, out);
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
if (hash(src) !== hash(out)) throw new Error('copied entry.png differs from the repository file');
console.log(`entry.png written to ${out} sha256=${hash(out)}`);
