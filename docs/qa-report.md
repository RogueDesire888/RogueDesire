# QA report: Task 10

Full-site pass against a local production build (`next build` + `next start`), October 2026. Updated after Task 10.1 (polish) and Task 10.2 (tall mobile hero, deferred motion); see the Task 10.2 section for the latest numbers.
Scripts live in `scripts/qa/` (crawl, browser matrix, axe/keyboard/readability, asset sizes, Lighthouse) and can be re-run against any base URL with `QA_BASE` / `QA_OUT`.

## Summary

All targets met. Four issues fixed (one truth leak, one no-JS readability bug, two contrast failures). No Critical or High issues remain open in the site itself; the remaining launch blockers are the account-dependent items already tracked in CLAUDE.md.

| Page | Links | Overflow (3 sizes x 3 engines) | Console / failed requests | Fonts | Images | Pins | Rig | axe | No-JS / reduced motion |
|---|---|---|---|---|---|---|---|---|---|
| `/` | ok | none | none | ok | ok | hold + release | live | 0 | readable |
| `/manifesto` | ok | none | none | ok | ok | hold + release (3) | live | 0 | readable |
| `/chapters` | ok | none | none | ok | ok | n/a | live | 0 | readable |
| `/chapters/ascension` | ok | none | none | ok | ok | hold + release (2) | live | 0 | readable |
| `/circle` | ok | none | none | ok | ok | n/a | live | 0 | readable |
| `/artifacts` | ok | none | none | ok | ok | n/a | live | 0 | readable |
| `/yearbook` | ok | none | none | ok | ok | hold + release (2) | live | 0 | readable |
| `/archive` | ok | none | none | ok | ok | n/a | live | 0 | readable |
| `/transmissions` | ok | none | none | ok | ok | n/a | live | 0 | readable |
| `/transmissions/*` (3) | ok | none | none | ok | ok | n/a | live | 0 | readable |

- Crawl: 13 internal paths from home, no 404s, no unexpected redirects, no links to non-live routes. Instagram links open in a new tab with `rel="noopener noreferrer"`.
- Browser matrix: Chromium, WebKit and Firefox at 375x812, 768x1024 and 1440x900, 108 page loads, zero findings. Grenze Gotisch (display) and Hanken Grotesk (body) loaded everywhere. Pins checked at 768 and 1440 (mobile has no pins by design).
- WebKit: charm spinner (CSS 3D), yearbook book, menu backdrop blur and the rig all ran without errors or overflow. Playwright WebKit is close to Safari but not identical; a real-device Safari look is still worth one pass before cutover.
- Keyboard (Home > Manifesto > Chapter 001 > Artifacts > Circle): every visible control reachable in DOM order (14 / 12 / 13 / 15 / 17 stops), all with a visible focus ring. The menu and the flyer lightbox trap Tab, close on Esc and return focus to their opener.
- Reduced motion and JavaScript disabled: no text left hidden on any page. The manifesto opening is a CSS-only fade (runs without JS). The archive's "Opens after the night." line is a hover/focus hint under a visible "Sealed" label, always shown on touch screens.

## Upgrade 1 re-run (dependencies)

Branch `upgrade/deps`: playwright 1.64.0 to 1.64.1 (plus lockfile refresh), @types/node 20 to 26, ESLint 9 to 10, TypeScript 5.9 to 6.0 (7.0 reverted: no JavaScript API for typescript-eslint). Next, React, Tailwind, gsap, zod and next-mdx-remote were already current.

- Full suite on the branch preview (`rogue-desire-6usdrfwaj`): crawl clean, 108 browser loads with 0 issues, axe 0, keyboard clean, reduced motion and no-JS readable. Gate also passed locally after each update.
- Lighthouse mobile, same-machine A/B against `main` (local production builds, runs interleaved, medians of 3): Home 92 vs 92, Manifesto 93 vs 95, Artifacts 93 vs 92. LCP 3.3 / 2.9 / 3.1 s vs 3.3 / 2.8 / 3.3 s. Accessibility, Best Practices 100; SEO 100 excluding the expected preview noindex.
- On Vercel the branch preview measured 85 / 85 / 87 (84 / 90 / 88 with the Vercel Toolbar blocked) against 89 / 93 / 93 on the current production deployment. First-party JS is byte-identical (256 KB); the gap is the Preview environment (toolbar script, cold caches), not the upgrade.
- npm audit: 5 high before and after (braces, dev-only lint tooling, no fix released); 0 in production dependencies.
- QA harness: `scripts/qa/run-all.mjs` added; the matrix now waits for the deferred rig (WebKit has no requestIdleCallback, so the old fixed 1.2s wait raced it).

## Task 10.2 re-run

Tall mobile hero scene plus deferred motion startup (gsap, ScrollTrigger and the WebGL rig load by dynamic import after first paint; ScrollTrigger only on pages with pins or scrubs).

Lighthouse mobile, 3 runs each (medians):

| Page | Performance | LCP | TBT | CLS | A / BP |
|---|---|---|---|---|---|
| Home | 92 (92 / 90 / 92) | 3.3 s (3.3 / 3.3 / 3.2) | 121 ms | 0 | 100 / 100 |
| Manifesto | 94 (93 / 94 / 94) | 2.9 s (all three) | 142 ms | 0 | 100 / 100 |
| Artifacts | 91 (91 / 92 / 91) | 3.3 s (all three) | 101 ms | 0 | 100 / 100 |

- Home's mobile LCP element is now the tall scene (AVIF, 38 KB at 900w, 64 KB at 1350w), preloaded only for phones; phones never request the desktop scene and desktops never request the mobile one.
- Hero at 375x812 and 390x844: wordmark stands on the horizon under the laser origin, the full spin stays inside the scene (293 and 304px wide), tagline and description fully above the fold (bottom at 772 of 812 and 804 of 844). Desktop hero box, wordmark and tagline positions unchanged at 1440x900.
- JS: gsap core, ScrollTrigger and the rig chunk all load after the load event on every page. ScrollTrigger loads on Home, Manifesto, Chapter 001, Artifacts, Yearbook and Archive (pins or scrubs) and not at all on Chapters, Circle or Transmissions.
- Browser suite: crawl clean; Chromium, WebKit and Firefox at 3 sizes on 12 pages, 0 issues in 108 loads (rig live, pins hold and release); axe 0 violations; keyboard path clean; reduced motion and no-JS readable.
- What remains of mobile LCP is simulated main-thread and network time for the shared framework JS (about 230 KB), not images or motion.

## Lighthouse

Local production build, Lighthouse 12. SEO shows 69 because the preview guard sends `noindex` off the production domain (`is-crawlable`, expected); with that audit excluded every page scores 100.

| Page | Mobile P / A / BP / SEO | Desktop P / A / BP / SEO | Mobile LCP / TBT |
|---|---|---|---|
| Home | 91 / 100 / 100 / 100* | 98 / 100 / 100 / 100* | 3.4 s (median of 3.7, 3.3, 3.4) / 120 ms |
| Manifesto | 92 / 100 / 100 / 100* | 100 / 100 / 100 / 100* | 3.0 s / 160 ms |
| Chapter 001 | 92 / 100 / 100 / 100* | 100 / 100 / 100 / 100* | 3.0 s / 150 ms |
| Artifacts | 90 / 100 / 100 / 100* | 100 / 100 / 100 / 100* | 3.4 s / 130 ms |
| Circle | 98 / 100 / 100 / 100* | 100 / 100 / 100 / 100* | 1.2 s / 170 ms |

\* excluding the expected preview `noindex`.

Home mobile median LCP went from 3.8 s (Task 10) to 3.4 s (Task 10.1): both hero images are preloaded with `fetchPriority="high"`, global CSS is inlined (no render-blocking requests, FCP 0.8 s), and images are served as AVIF (mobile wordmark 103 KB to 26 KB). In Task 10 one cold run scored 40 from machine contention; it did not recur.

## Performance hygiene

- JS per page (transfer): about 247 KB on every route (251 KB on Chapter 001). Shared runtime plus gsap/ScrollTrigger.
- Nothing over 500 KB loads before first paint on any page. Home is down from 620 KB to 480 KB total at 1440.
- Images: AVIF with WebP fallback via `next/image` (negotiated per browser). Device sizes 640, 900, 1200, 1600, 1920, 2560; hero `sizes` are capped on mobile so a 3x phone gets at most the 900px variant.
- Charm faces: 700px-tall variants on phones (70 KB + 43 KB, was 238 KB + 188 KB); 1400px on tablets and desktops.
- Ten largest assets shipped (1440 desktop, first load):

| Size | Asset |
|---|---|
| 238 KB | `/artifacts/ch001-charm-front.webp` (desktop only) |
| 188 KB | `/artifacts/ch001-charm-back.webp` (desktop only) |
| 71 KB | JS chunk (React runtime) |
| 54 KB | `/circle` HTML (inlined CSS) |
| 46 KB | JS chunk |
| 44 KB | JS chunk (gsap + ScrollTrigger) |
| 42 KB | `/` HTML (inlined CSS) |
| 42 KB | Hanken Grotesk woff2 |
| 41 KB | `/chapters/ascension` HTML |
| 40 KB | transmission HTML |

## Truth and brand audit (built HTML, RSC payloads, JS chunks, metadata, JSON-LD)

- No dates, venues, prices, editions, capacities or artists. JSON-LD is Organization only (name, url, logo, Instagram).
- Launch city: was present in a client JS chunk (see fixes). Now absent from all HTML, RSC and `.next/static`.
- No chapter 003 to 005 titles, lines, elements or themes anywhere ("Velocity" hits in JS are gsap's `getVelocity` API).
- No em dashes. No banned words; "blog" appears only in the approved "This is not a blog." line. No straight apostrophes in rendered copy.
- Concepts labelled: Chapters index ("Future realities", "concept"), Artifacts ("Concept", "in development"), home dossier ("Undisclosed").

## Fixes

1. Launch city and other unconfirmed facts moved from `site.ts` into server-only `src/config/facts.ts`; "Greenville, SC" had shipped in a client JS chunk via `site`.
2. `Reveal` hides content only under `@media (scripting: enabled)`, so the home intro line is readable without JavaScript.
3. `ScrubWords` start opacity 0.2 to 0.5: fixes axe serious color-contrast on Manifesto, Chapter 001 and Artifacts.
4. Night arc inactive phases 0.32 to 0.6: fixes axe serious color-contrast on Chapter 001.

Task 10.1:

5. Hero scene and wordmark preloaded with `fetchPriority="high"` (the reflection copy carries it too, because React preloads the first eager `<img>` and dedupes the second).
6. Global CSS inlined (`experimental.inlineCss`): no render-blocking stylesheets.
7. AVIF image format enabled and device sizes tuned; mobile hero images capped at 900px.
8. Charm faces get 700px-tall phone variants via a media query.
9. Yearbook: "Status: in development" under Collector editions.
10. Archive: "Opens after the night." shows on every compartment on touch screens (`hover: none`).

## Remaining issues

### Critical
None.

### High
None in the site. Launch blockers that need account logins, already tracked in CLAUDE.md under "Before domain cutover":
- Circle submissions have no storage yet: connect Supabase and run `supabase/migrations/001_circle.sql`.
- `/privacy` does not exist: build it once `legalName` and `contactEmail` are confirmed.

### Medium
- Mobile LCP is still 3.0 to 3.4 s in Lighthouse's simulated slow 4G; what remains is main-thread time before paint (shared JS), not image bytes. Next step if needed: defer the WebGL rig and gsap setup until after first paint.
- Real Safari on iPhone not yet checked by eye: one manual pass of charm, book, menu blur and rig before cutover.

### Low
- 13 KB of legacy polyfills (`Array.prototype.at`, `Object.hasOwn` and others) come from Next's own framework polyfill module, which ships regardless of browserslist; Next's defaults already target Safari 16.4+. Not removable without patching Next: left as is.
- About 61 KB of unused JS on first load: mostly ScrollTrigger on pages without pins, plus the prefetched `/circle` form chunk (Zod). Fix needs a dynamic import of ScrollTrigger; not a safe one-line change, so deferred.
- Charm faces have no AVIF version (CSS backgrounds bypass `next/image`): add `image-set()` with AVIF if `/artifacts` weight matters on desktop.
