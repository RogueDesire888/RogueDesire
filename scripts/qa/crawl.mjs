// Crawl every internal link from the home page; check external links' rel.
import { chromium } from "playwright";
import { BASE, CTX } from "./common.mjs";

const browser = await chromium.launch();
const page = await browser.newPage(CTX);
const seen = new Map(); // path -> status
const external = new Map(); // href -> rel/target
const queue = ["/"];
const live = new Set();
while (queue.length) {
  const path = queue.shift();
  if (seen.has(path)) continue;
  const res = await page.goto(BASE + path, { waitUntil: "domcontentloaded" });
  const finalPath = new URL(page.url()).pathname;
  seen.set(path, { status: res?.status(), redirectedTo: finalPath !== path ? finalPath : null });
  if (res?.status() !== 200) continue;
  live.add(path);
  const links = await page.$$eval("a[href]", (as) => as.map((a) => ({ href: a.getAttribute("href"), rel: a.getAttribute("rel"), target: a.getAttribute("target") })));
  for (const l of links) {
    if (!l.href || l.href.startsWith("#") || l.href.startsWith("mailto:")) continue;
    const u = new URL(l.href, BASE + path);
    if (u.origin === new URL(BASE).origin) {
      const p = u.pathname;
      if (!seen.has(p) && !queue.includes(p) && !/\.(webp|png|jpg|ico)$/.test(p)) queue.push(p);
      if (/\.(webp|png)$/.test(p) && !seen.has(p)) { const r = await page.request.get(u.href); seen.set(p, { status: r.status(), redirectedTo: null }); }
    } else external.set(u.href, `${l.target ?? "-"} | ${l.rel ?? "-"}`);
  }
}
const bad = [...seen].filter(([, v]) => v.status !== 200 || v.redirectedTo);
console.log(JSON.stringify({ crawled: [...seen.keys()], bad, external: Object.fromEntries(external) }, null, 1));
await browser.close();
