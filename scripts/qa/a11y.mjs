// axe-core on every page (1440 and 375), keyboard path, and readability with
// reduced motion and with JavaScript disabled. Chromium.
import fs from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";
import { BASE, PAGES, scrollThrough, sleep } from "./common.mjs";

const browser = await chromium.launch();
const out = { axe: [], keyboard: [], reduced: [], noJs: [] };

const unreadable = () => {
  const bad = [];
  const w = document.createTreeWalker(document.querySelector("main"), NodeFilter.SHOW_TEXT);
  let n;
  while ((n = w.nextNode())) {
    if (!n.textContent.trim()) continue;
    const el = n.parentElement;
    if (el.closest('[aria-hidden="true"], .sr-only, dialog:not([open]), [hidden]')) continue;
    let o = 1, blur = false;
    for (let e = el; e; e = e.parentElement) {
      const cs = getComputedStyle(e);
      o *= parseFloat(cs.opacity);
      if (cs.visibility === "hidden" || cs.display === "none") o = 0;
      if (/blur\((?!0px)/.test(cs.filter)) blur = true;
    }
    if (o < 0.9 || blur) bad.push(`${n.textContent.trim().slice(0, 40)} @${o.toFixed(2)}${blur ? " blur" : ""}`);
  }
  return bad;
};

for (const [w, h] of [[1440, 900], [375, 812]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  for (const path of PAGES) {
    const page = await ctx.newPage();
    await page.goto(BASE + path, { waitUntil: "load" });
    await sleep(1500);
    const res = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"]).analyze();
    for (const v of res.violations) {
      out.axe.push({ size: w, path, id: v.id, impact: v.impact, nodes: v.nodes.length, sample: v.nodes[0]?.target?.join(" ") });
    }
    await page.close();
  }
  await ctx.close();
}

// Keyboard-only path: every focusable element reached, with a visible focus indicator.
const kctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
for (const path of ["/", "/manifesto", "/chapters/ascension", "/artifacts", "/circle"]) {
  const page = await kctx.newPage();
  await page.goto(BASE + path, { waitUntil: "load" });
  await sleep(1200);
  const total = await page.evaluate(() =>
    [...document.querySelectorAll('a[href], button:not([disabled]), input:not([type=hidden]), select, textarea, summary, [tabindex]:not([tabindex="-1"])')]
      .filter((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return !e.closest("dialog:not([open]), [inert], #site-menu") && cs.visibility !== "hidden" && (r.width > 0 || r.height > 0); }).length,
  );
  const visited = new Set(); let noRing = []; let wrapped = false;
  for (let i = 0; i < total + 15; i++) {
    await page.keyboard.press("Tab");
    const info = await page.evaluate(() => {
      const a = document.activeElement; if (!a || a === document.body) return null;
      const cs = getComputedStyle(a);
      const ring = cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0 || cs.boxShadow !== "none";
      const id = a.id || `${a.tagName}:${(a.textContent || a.getAttribute("aria-label") || "").trim().slice(0, 30)}`;
      return { id, ring };
    });
    if (!info) { if (visited.size > 3) { wrapped = true; break; } continue; }
    if (visited.has(info.id) && visited.size >= total) { wrapped = true; break; }
    visited.add(info.id);
    if (!info.ring) noRing.push(info.id);
  }
  out.keyboard.push({ path, focusable: total, reached: visited.size, wrapped, noVisibleFocus: [...new Set(noRing)].slice(0, 8) });
  await page.close();
}
await kctx.close();

// Readability with reduced motion and with JavaScript disabled.
for (const [mode, opts] of [["reduced", { reducedMotion: "reduce" }], ["noJs", { javaScriptEnabled: false }]]) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
  for (const path of PAGES) {
    const page = await ctx.newPage();
    await page.goto(BASE + path, { waitUntil: "load" });
    if (mode === "reduced") await scrollThrough(page); else await sleep(800);
    out[mode].push({ path, unreadable: await page.evaluate(unreadable) });
    await page.close();
  }
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${process.env.QA_OUT ?? "."}/a11y.json`, JSON.stringify(out, null, 1));
console.log("a11y done");
