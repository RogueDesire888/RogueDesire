#!/usr/bin/env node
// Composes the finished Artifact 001 flyer at a true 5x7: the art full width
// and vertically centered on its own black, dark scrims over its top and
// bottom, the wordmark and "Ascension" / "Chapter 001" overlaid on the scrims,
// all inside a 6% safe margin. Text is drawn as opentype.js paths.
// The source art is large and gitignored: put it at art/ch001-flyer-art.png
// (or pass FLYER_ART=/path/to/art.png).
// Outputs: public/artifacts/ch001-flyer.webp (site) and the full-resolution
// PNG to ~/Desktop/Rogue-Desire-Artifact-001-flyer.png (not committed).
// Usage: node scripts/compose-flyer.mjs
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import opentype from "opentype.js";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const ART = process.env.FLYER_ART ?? path.join(ROOT, "art/ch001-flyer-art.png");
if (!fs.existsSync(ART)) {
  console.error(`Flyer art not found at ${ART}.\nPut the source PNG there (it is gitignored) or run with FLYER_ART=/path/to/art.png.`);
  process.exit(1);
}
const WORDMARK = path.join(ROOT, "public/brand/wordmark.webp");
const GRENZE = path.join(ROOT, "scripts/fonts/GrenzeGotisch[wght].ttf");
const HANKEN = path.join(ROOT, "scripts/fonts/HankenGrotesk[wght].ttf");
const OUT_DIR = path.join(ROOT, "public/artifacts");

const VIOLET = { r: 0x8b, g: 0x2c, b: 0xff };
const WHITE = "#F5F5F7";
const CHROME = "#C8CEDA";
const MARGIN = 0.06;
/**
 * Lays out glyphs directly (cmap + kerning), skipping opentype.js shaping:
 * its shaper cannot apply some substitution lookups in these fonts, and plain
 * Latin titles need none. Variation coordinates still apply per glyph.
 */
function layout(font, text, size, letterSpacing = 0) {
  const scale = size / font.unitsPerEm;
  const out = new opentype.Path();
  const glyphs = [...text].map((c) => font.charToGlyph(c));
  let x = 0;
  glyphs.forEach((g, i) => {
    out.extend(g.getPath(x, 0, size, { ...font.defaultRenderOptions }, font));
    let advance = g.advanceWidth;
    if (i < glyphs.length - 1) advance += font.getKerningValue(g, glyphs[i + 1]);
    x += advance * scale + letterSpacing * size;
  });
  return out;
}

const loadFont = (file, wght) => {
  const font = opentype.parse(fs.readFileSync(file).buffer);
  font.variation?.set({ wght });
  return font;
};

/** Text as a tightly cropped PNG (paths, not system fonts). */
async function textPng(font, text, size, fill, letterSpacing = 0) {
  const p = layout(font, text, size, letterSpacing);
  const b = p.getBoundingBox();
  const pad = 2;
  const w = Math.ceil(b.x2 - b.x1) + pad * 2;
  const h = Math.ceil(b.y2 - b.y1) + pad * 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><g transform="translate(${pad - b.x1} ${pad - b.y1})"><path d="${p.toPathData(2)}" fill="${fill}"/></g></svg>`;
  return { buf: await sharp(Buffer.from(svg)).png().toBuffer(), w, h };
}

/** Text sized so its ink spans `width` px. */
async function textToWidth(font, text, width, fill) {
  const probe = layout(font, text, 100).getBoundingBox();
  return textPng(font, text, (100 * width) / (probe.x2 - probe.x1), fill);
}

/** Violet glow from an image's alpha: blurred, tinted, at `opacity`. */
async function glow(buf, w, h, sigma, opacity) {
  const pad = Math.ceil(sigma * 3);
  const alpha = await sharp(buf)
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()
    .then((b) => sharp(b).extractChannel(3).blur(sigma).linear(opacity, 0).toBuffer());
  const layer = await sharp({ create: { width: w + pad * 2, height: h + pad * 2, channels: 3, background: VIOLET } })
    .joinChannel(alpha)
    .png()
    .toBuffer();
  return { buf: layer, pad };
}

const { width: W, height: artH } = await sharp(ART).metadata();
const H = Math.round((W * 7) / 5); // true 5x7
const artTop = Math.round((H - artH) / 2);
const margin = Math.round(MARGIN * H);
const { data: px } = await sharp(ART).extract({ left: 0, top: 0, width: 1, height: 1 }).raw().toBuffer({ resolveWithObject: true });
const background = { r: px[0], g: px[1], b: px[2], alpha: 1 };
const bg = `rgb(${px[0]},${px[1]},${px[2]})`;

// Elements.
const wordmarkW = Math.round(W * 0.42);
const wordmarkBuf = await sharp(WORDMARK).resize({ width: wordmarkW }).png().toBuffer();
const wordmarkH = (await sharp(wordmarkBuf).metadata()).height;
const title = await textToWidth(loadFont(GRENZE, 600), "Ascension", Math.round(W * 0.8), WHITE);
const chapter = await textPng(loadFont(HANKEN, 400), "Chapter 001", Math.round(W * 0.028), CHROME, 0.3);
const titleGap = Math.round(title.h * 0.18);
const blockH = title.h + titleGap + chapter.h;
const wordmarkTop = margin;
const chapterTop = H - margin - chapter.h;
const titleTop = chapterTop - titleGap - title.h;

// Scrims (black to transparent) over the art: ~22% top and ~28% bottom,
// stretched where needed so they always reach past the type they sit under.
const topScrimEnd = Math.max(artTop + artH * 0.22, wordmarkTop + wordmarkH + 60);
const bottomScrimStart = Math.min(artTop + artH * (1 - 0.28), titleTop - 80);
const scrims = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bg}" stop-opacity="1"/><stop offset="0.55" stop-color="${bg}" stop-opacity="0.82"/><stop offset="1" stop-color="${bg}" stop-opacity="0"/></linearGradient>
    <linearGradient id="b" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${bg}" stop-opacity="1"/><stop offset="0.55" stop-color="${bg}" stop-opacity="0.82"/><stop offset="1" stop-color="${bg}" stop-opacity="0"/></linearGradient>
  </defs>
  <rect x="0" y="0" width="${W}" height="${topScrimEnd}" fill="url(#t)"/>
  <rect x="0" y="${bottomScrimStart}" width="${W}" height="${H - bottomScrimStart}" fill="url(#b)"/>
</svg>`);

const wmGlow = await glow(wordmarkBuf, wordmarkW, wordmarkH, 22, 0.6);
const tightGlow = await glow(title.buf, title.w, title.h, 8, 0.85);
const wideGlow = await glow(title.buf, title.w, title.h, 30, 0.55);
const cx = (w) => Math.round((W - w) / 2);

const composed = await sharp({ create: { width: W, height: H, channels: 4, background } })
  .composite([
    { input: ART, left: 0, top: artTop },
    { input: scrims, left: 0, top: 0 },
    { input: wmGlow.buf, left: cx(wordmarkW) - wmGlow.pad, top: wordmarkTop - wmGlow.pad },
    { input: wordmarkBuf, left: cx(wordmarkW), top: wordmarkTop },
    { input: wideGlow.buf, left: cx(title.w) - wideGlow.pad, top: titleTop - wideGlow.pad },
    { input: tightGlow.buf, left: cx(title.w) - tightGlow.pad, top: titleTop - tightGlow.pad },
    { input: title.buf, left: cx(title.w), top: titleTop },
    { input: chapter.buf, left: cx(chapter.w), top: chapterTop },
  ])
  .png({ compressionLevel: 9 })
  .toBuffer();

fs.mkdirSync(OUT_DIR, { recursive: true });
await sharp(composed).resize({ height: 1400 }).webp({ quality: 86 }).toFile(path.join(OUT_DIR, "ch001-flyer.webp"));
const desktop = path.join(os.homedir(), "Desktop/Rogue-Desire-Artifact-001-flyer.png");
fs.writeFileSync(desktop, composed);

console.log(JSON.stringify({
  canvas: `${W}x${H}`, artTop, margin,
  wordmark: { top: wordmarkTop, bottom: wordmarkTop + wordmarkH, topScrimEnd: Math.round(topScrimEnd) },
  title: { top: titleTop, bottom: chapterTop + chapter.h, limit: H - margin, bottomScrimStart: Math.round(bottomScrimStart), blockH },
  saved: ["public/artifacts/ch001-flyer.webp", desktop],
}, null, 1));
