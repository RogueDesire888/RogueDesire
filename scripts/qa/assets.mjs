// Bytes shipped per page (first load, 1440, Chromium): JS total, largest assets, first-paint heavy assets.
import fs from "node:fs";
import { chromium } from "playwright";
import { BASE, PAGES, sleep } from "./common.mjs";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const all = new Map();
const perPage = [];
for (const path of PAGES) {
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  const reqs = new Map();
  let loaded = false;
  cdp.on("Network.responseReceived", (e) => reqs.set(e.requestId, { url: e.response.url.replace(BASE, ""), type: e.type, early: !loaded }));
  cdp.on("Network.loadingFinished", (e) => { const r = reqs.get(e.requestId); if (r) r.bytes = e.encodedDataLength; });
  await page.goto(BASE + path, { waitUntil: "load" });
  loaded = true;
  await sleep(2500);
  const list = [...reqs.values()].filter((r) => r.bytes);
  const js = list.filter((r) => r.type === "Script").reduce((s, r) => s + r.bytes, 0);
  perPage.push({ path, jsKB: Math.round(js / 1024), totalKB: Math.round(list.reduce((s, r) => s + r.bytes, 0) / 1024),
    heavyFirstPaint: list.filter((r) => r.early && r.bytes > 500 * 1024).map((r) => `${r.url.split("?")[0]} ${Math.round(r.bytes / 1024)}KB`) });
  for (const r of list) { const k = r.url.split("?")[0].startsWith("/_next/image") ? r.url : r.url.split("?")[0]; all.set(k, Math.max(all.get(k) ?? 0, r.bytes)); }
  await page.close();
}
await browser.close();
const largest = [...all].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([u, b]) => `${Math.round(b / 1024)}KB ${u.slice(0, 110)}`);
fs.writeFileSync(`${process.env.QA_OUT ?? "."}/assets.json`, JSON.stringify({ perPage, largest }, null, 1));
console.log("assets done");
