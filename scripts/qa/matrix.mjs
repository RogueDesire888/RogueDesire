// Browser x size x page matrix. Usage: node scripts/qa/matrix.mjs chromium|webkit|firefox
import fs from "node:fs";
import { chromium, firefox, webkit } from "playwright";
import { BASE, PAGES, SIZES, scrollThrough, sleep, CTX } from "./common.mjs";

const name = process.argv[2] ?? "chromium";
const engine = { chromium, webkit, firefox }[name];
const browser = await engine.launch();
const rows = [];
for (const size of SIZES) {
  const ctx = await browser.newContext({ viewport: { width: size.width, height: size.height }, ...(size.isMobile && name !== "firefox" ? { isMobile: true, hasTouch: true } : {}), ...CTX });
  for (const path of PAGES) {
    const page = await ctx.newPage();
    const errors = [];
    const failed = [];
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 160)); });
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message.slice(0, 160)}`));
    page.on("requestfailed", (r) => { const u = r.url(); if (!u.includes("_rsc=")) failed.push(`${r.failure()?.errorText} ${u.replace(BASE, "")}`.slice(0, 160)); });
    page.on("response", (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url().replace(BASE, "")}`.slice(0, 160)); });
    try {
      await page.goto(BASE + path, { waitUntil: "load", timeout: 45000 });
      // Motion starts after first paint (idle callback, or a 1.2s timer where
      // requestIdleCallback is missing, as in WebKit), so wait for the rig.
      await page.waitForFunction(() => [...document.querySelectorAll(".rd-rig")].some((e) => e.dataset.state === "live"), null, { timeout: 6000 }).catch(() => {});
      await sleep(600);
      await scrollThrough(page);
      const r = await page.evaluate(async () => {
        const fam = (sel) => { const e = document.querySelector(sel); return e ? getComputedStyle(e).fontFamily : null; };
        const loadedFonts = [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family);
        const imgs = [...document.querySelectorAll("img")];
        const broken = imgs.filter((i) => i.complete && i.naturalWidth === 0 && getComputedStyle(i).display !== "none").map((i) => i.currentSrc || i.src);
        const pins = [...document.querySelectorAll(".pin-spacer")];
        const pinResults = [];
        for (const s of pins) {
          const el = s.firstElementChild; const start = s.getBoundingClientRect().top + scrollY; const end = start + s.offsetHeight - el.offsetHeight;
          scrollTo(0, (start + end) / 2); await new Promise((r) => setTimeout(r, 500)); const mid = Math.round(el.getBoundingClientRect().top);
          scrollTo(0, end + 2); await new Promise((r) => setTimeout(r, 400)); const after = Math.round(el.getBoundingClientRect().top);
          pinResults.push(Math.abs(mid) <= 3 && after <= 0 && after >= -8 ? "ok" : `bad(mid ${mid}, after ${after})`);
        }
        return {
          overflowX: document.documentElement.scrollWidth - innerWidth,
          display: fam(".font-display"), body: getComputedStyle(document.body).fontFamily.split(",")[0],
          grenzeLoaded: loadedFonts.some((f) => /grenze/i.test(f)), hankenLoaded: loadedFonts.some((f) => /hanken/i.test(f)),
          images: imgs.length, broken,
          rig: [...document.querySelectorAll(".rd-rig")].map((e) => e.dataset.state).join(","),
          pins: pinResults,
        };
      });
      rows.push({ browser: name, size: size.name, path, ...r, errors, failed });
    } catch (e) {
      rows.push({ browser: name, size: size.name, path, crash: String(e).slice(0, 200), errors, failed });
    }
    await page.close();
  }
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${process.env.QA_OUT ?? "."}/matrix-${name}.json`, JSON.stringify(rows, null, 1));
console.log(name, "done", rows.length);
