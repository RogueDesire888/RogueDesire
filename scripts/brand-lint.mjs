#!/usr/bin/env node
// Brand linter: fails on banned vocabulary, "[Fill in]" placeholders, and em dashes.
// Add `brand-lint-ignore` anywhere on a line to skip it.
import fs from "node:fs";
import path from "node:path";

const ROOTS = ["src", "content"];
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".css", ".md", ".mdx", ".json"]);

const BANNED = [
  "good vibes only",
  "vibes",
  "lit",
  "pull up",
  "turn up",
  "don't miss out",
  "buy now",
  "get your tickets now",
  "shop merch",
  "merch",
  "photo dump",
  "gallery",
  "blog",
  "fans",
  "customers",
  "promo",
  "rave fam",
  "vip",
];

const ALLOWED_PHRASES = [/we do not organize parties/gi];

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const rules = [
  ...BANNED.map((word) => ({
    label: `banned word "${word}"`,
    re: new RegExp(
      `(?<![\\p{L}\\p{N}_])${escape(word).replace(/'/g, "['’]").replace(/ /g, "\\s+")}(?![\\p{L}\\p{N}_])`,
      "iu",
    ),
  })),
  { label: 'placeholder "[Fill in]"', re: /\[fill in\]/i },
  { label: "em dash (U+2014)", re: /—/ },
];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (EXTENSIONS.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

const violations = [];
for (const file of ROOTS.flatMap((root) => walk(root))) {
  const lines = fs.readFileSync(file, "utf8").split("\n");
  lines.forEach((raw, i) => {
    if (raw.includes("brand-lint-ignore")) return;
    const line = ALLOWED_PHRASES.reduce((acc, re) => acc.replace(re, ""), raw);
    for (const { label, re } of rules) {
      if (re.test(line)) violations.push(`${file}:${i + 1}: ${label}`);
    }
  });
}

if (violations.length > 0) {
  console.error(violations.join("\n"));
  console.error(`\nbrand-lint: ${violations.length} violation(s).`);
  process.exit(1);
}
console.log("brand-lint: clean.");
