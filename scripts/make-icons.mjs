#!/usr/bin/env node
// App icons from the Artifact 001 charm front, cropped to the idol's crown and
// head, on black. Writes src/app/icon.png (512), apple-icon.png (180), and
// favicon.ico (32 + 16, PNG-in-ICO). Usage: node scripts/make-icons.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const SRC = path.join(ROOT, "public/artifacts/ch001-charm-front.webp");
const APP = path.join(ROOT, "src/app");
const CROP = { left: 131, top: 262, width: 250, height: 250 }; // crown and head
const BLACK = { r: 3, g: 3, b: 3, alpha: 1 };

const icon = (size) =>
  sharp(SRC).extract(CROP).resize(size, size, { kernel: "lanczos3" }).flatten({ background: BLACK }).png({ palette: true, quality: 92, compressionLevel: 9 }).toBuffer();

fs.writeFileSync(path.join(APP, "icon.png"), await icon(512));
fs.writeFileSync(path.join(APP, "apple-icon.png"), await icon(180));

// favicon.ico: ICONDIR + one ICONDIRENTRY per size + embedded PNGs.
// ICO entries must be RGBA PNGs (no palette) for decoders such as Turbopack's.
const rgba = (size) =>
  sharp(SRC).extract(CROP).resize(size, size, { kernel: "lanczos3" }).flatten({ background: BLACK }).ensureAlpha().png().toBuffer();
const pngs = [await rgba(32), await rgba(16)];
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(pngs.length, 4);
let offset = 6 + 16 * pngs.length;
const entries = pngs.map((png, i) => {
  const size = [32, 16][i];
  const e = Buffer.alloc(16);
  e.writeUInt8(size, 0); e.writeUInt8(size, 1); e.writeUInt8(0, 2); e.writeUInt8(0, 3);
  e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6); e.writeUInt32LE(png.length, 8); e.writeUInt32LE(offset, 12);
  offset += png.length;
  return e;
});
fs.writeFileSync(path.join(APP, "favicon.ico"), Buffer.concat([header, ...entries, ...pngs]));
console.log("icons written: icon.png 512, apple-icon.png 180, favicon.ico 32+16");
