// Full browser QA suite with a pass/fail summary: crawl, 3-engine matrix,
// axe + keyboard + reduced motion + no-JS. Exit code 1 on any failure.
// Usage: QA_BASE=<url> QA_OUT=<dir> node scripts/qa/run-all.mjs
import { spawn } from "node:child_process";
import fs from "node:fs";

const out = process.env.QA_OUT ?? "qa-out";
fs.mkdirSync(out, { recursive: true });
const env = { ...process.env, QA_OUT: out };
const run = (script, args = []) =>
  new Promise((resolve, reject) => {
    const p = spawn("node", [`scripts/qa/${script}`, ...args], { env, stdio: ["ignore", "pipe", "inherit"] });
    let text = "";
    p.stdout.on("data", (d) => (text += d));
    p.on("exit", (code) => (code === 0 ? resolve(text) : reject(new Error(`${script} ${args} exited ${code}`))));
  });

const fails = [];
const crawl = JSON.parse(await run("crawl.mjs"));
if (crawl.bad.length) fails.push(`crawl: ${JSON.stringify(crawl.bad)}`);
for (const [href, rel] of Object.entries(crawl.external)) if (!rel.includes("noopener noreferrer")) fails.push(`external rel: ${href}`);

await Promise.all(["chromium", "webkit", "firefox"].map((e) => run("matrix.mjs", [e])));
for (const e of ["chromium", "webkit", "firefox"]) {
  for (const x of JSON.parse(fs.readFileSync(`${out}/matrix-${e}.json`))) {
    const i = [];
    if (x.overflowX) i.push("overflow");
    if (!x.grenzeLoaded || !x.hankenLoaded) i.push("fonts");
    if (x.brokenImages?.length) i.push(`images ${x.brokenImages}`);
    if (x.consoleErrors?.length) i.push(`console ${JSON.stringify(x.consoleErrors).slice(0, 160)}`);
    if (x.failedRequests?.length) i.push(`requests ${JSON.stringify(x.failedRequests).slice(0, 160)}`);
    if (x.pins?.some?.((p) => p !== "ok")) i.push(`pins ${JSON.stringify(x.pins)}`);
    if (x.rig !== "live") i.push(`rig ${x.rig}`);
    if (i.length) fails.push(`${e} ${x.size} ${x.path}: ${i.join(" | ")}`);
  }
}

await run("a11y.mjs");
const a = JSON.parse(fs.readFileSync(`${out}/a11y.json`));
for (const v of a.axe) fails.push(`axe ${v.size} ${v.path}: ${v.id} (${v.impact})`);
for (const k of a.keyboard) if (k.noVisibleFocus.length || k.reached < 5) fails.push(`keyboard ${k.path}: ${JSON.stringify(k)}`);
// Known non-failures: JSON-LD script text, the CSS-only manifesto fade sampled
// mid-animation, and the archive hover hint on desktop.
const known = (t) => t.startsWith("{") || t.startsWith("We are architects") || t.startsWith("Opens after the night");
for (const m of ["reduced", "noJs"]) for (const p of a[m]) { const u = p.unreadable.filter((t) => !known(t)); if (u.length) fails.push(`${m} ${p.path}: ${u.slice(0, 3).join(" ;; ")}`); }

const summary = { base: process.env.QA_BASE ?? "http://localhost:3001", pass: fails.length === 0, matrixLoads: 108, fails };
fs.writeFileSync(`${out}/summary.json`, JSON.stringify(summary, null, 1));
console.log(JSON.stringify(summary, null, 1));
process.exit(fails.length ? 1 : 0);
