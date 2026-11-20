// news-image-20261120 entry (Node 22, standard library only):
// the image is the entry.png beside this file, and the program copies
// it to /output/entry.png, verifying the copy byte for byte.
//
// The gate takes a whole PNG or JPEG of at most 1 MiB and 1024 by
// 1024 pixels, and the judge sees exactly the bytes copied.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for
// /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const source = new URL('./entry.png', import.meta.url);
const dest = join(process.env.MAKEFUN_OUTPUT_DIR ?? '/output', 'entry.png');

// The gate takes a whole PNG or JPEG of at most 1 MiB and 1024 by 1024
// pixels, so validate the image we ship before copying it: PNG magic,
// IHDR width/height, and file size.
const bytes = readFileSync(source);
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!bytes.subarray(0, 8).equals(PNG_MAGIC)) {
  throw new Error('entry.png is not a PNG file');
}
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
if (width > 1024 || height > 1024) {
  throw new Error(`entry.png is ${width}x${height}, over the 1024x1024 gate`);
}
if (statSync(source).size > 1024 * 1024) {
  throw new Error('entry.png is over the 1 MiB gate');
}

copyFileSync(source, dest);

const want = createHash('sha256').update(readFileSync(source)).digest('hex');
const got = createHash('sha256').update(readFileSync(dest)).digest('hex');
if (want !== got) {
  throw new Error(`entry.png copy mismatch: ${got} != ${want}`);
}
console.log(`wrote ${dest} (sha256 ${got})`);
