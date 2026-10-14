// Shared QA helpers (Playwright). Run against `npm run start -- -p 3001`.
export const BASE = process.env.QA_BASE ?? "http://localhost:3001";
export const PAGES = [
  "/", "/manifesto", "/chapters", "/chapters/ascension", "/circle", "/artifacts", "/yearbook", "/archive",
  "/transmissions", "/transmissions/architects-of-temporary-realities", "/transmissions/the-first-reality-opens",
  "/transmissions/artifact-001-takes-form",
];
export const SIZES = [
  { name: "375", width: 375, height: 812, isMobile: true },
  { name: "768", width: 768, height: 1024, isMobile: false },
  { name: "1440", width: 1440, height: 900, isMobile: false },
];
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/** Scroll the whole page in steps so lazy media load and scroll animations run. */
export async function scrollThrough(page, step = 600, pause = 60) {
  await page.evaluate(async ([step, pause]) => {
    const H = document.documentElement.scrollHeight;
    for (let y = 0; y <= H; y += step) { scrollTo(0, y); await new Promise((r) => setTimeout(r, pause)); }
    scrollTo(0, document.documentElement.scrollHeight);
    await new Promise((r) => setTimeout(r, 1500));
  }, [step, pause]);
}

// Protected Vercel deployments: pass the project's automation bypass secret in
// QA_BYPASS (never commit it). Spread into every browser context.
export const CTX = process.env.QA_BYPASS
  ? { extraHTTPHeaders: { "x-vercel-protection-bypass": process.env.QA_BYPASS, "x-vercel-set-bypass-cookie": "true" } }
  : {};
