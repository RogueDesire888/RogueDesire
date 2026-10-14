// Hero screenshots at 375x812, 390x844 and 1440x900 with the spin held at 0 and 180 degrees,
// plus wordmark/tagline geometry and which scene file each size downloads.
import { chromium } from "playwright";
const out = process.env.QA_OUT; const b = await chromium.launch();
for (const [w, h, dpr] of [[375, 812, 3], [390, 844, 3], [1440, 900, 1]]) {
  const c = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, isMobile: w < 768, hasTouch: w < 768 });
  const p = await c.newPage(); const imgs = [];
  p.on("response", r => { if (/hero-scene/.test(r.url())) imgs.push(r.url().replace("http://localhost:3001", "").slice(0, 80)); });
  await p.goto("http://localhost:3001/", { waitUntil: "load" }); await new Promise(r => setTimeout(r, 2500));
  for (const deg of [0, 180]) {
    await p.addStyleTag({ content: `.rd-spin{animation:none!important;transform:rotateY(${deg}deg)!important}` });
    await new Promise(r => setTimeout(r, 300));
    await p.screenshot({ path: `${out}/hero-${w}-${deg}.png` });
  }
  const m = await p.evaluate(() => { const q = s => document.querySelector(s)?.getBoundingClientRect(); const t = q(".rd-hero-copy p"); const wm = q(".rd-hero-wordmark"); const hero = q(".rd-hero"); return { hero: [hero.top, hero.height], wordmark: [Math.round(wm.top), Math.round(wm.bottom), Math.round(wm.left), Math.round(wm.right)], taglineTop: Math.round(t.top), taglineBottom: Math.round(document.querySelectorAll(".rd-hero-copy p")[1].getBoundingClientRect().bottom), vh: innerHeight }; });
  console.log(w, h, JSON.stringify(m), [...new Set(imgs)].join(" "));
  await c.close();
}
await b.close();
