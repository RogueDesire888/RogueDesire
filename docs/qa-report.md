# QA report: Task 10

Full-site pass against a local production build (`next build` + `next start`), October 2026.
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
- Reduced motion and JavaScript disabled: no text left hidden on any page. The manifesto opening is a CSS-only fade (runs without JS). The archive's "Opens after the night." line is a hover/focus hint under a visible "Sealed" label.

## Lighthouse

Local production build, Lighthouse 12. SEO shows 69 because the preview guard sends `noindex` off the production domain (`is-crawlable`, expected); with that audit excluded every page scores 100.

| Page | Mobile P / A / BP / SEO | Desktop P / A / BP / SEO | Mobile LCP / TBT |
|---|---|---|---|
| Home | 88 / 100 / 100 / 100* | 99 / 100 / 100 / 100* | 3.8 s / 90 ms |
| Manifesto | 94 / 100 / 100 / 100* | 100 / 100 / 100 / 100* | 3.0 s / 90 ms |
| Chapter 001 | 94 / 100 / 100 / 100* | 100 / 100 / 100 / 100* | 3.0 s / 70 ms |
| Artifacts | 91 / 100 / 100 / 100* | 100 / 100 / 100 / 100* | 3.4 s / 60 ms |
| Circle | 93 / 100 / 100 / 100* | 100 / 100 / 100 / 100* | 3.2 s / 80 ms |

\* excluding the expected preview `noindex`.

Home mobile scored 40 on one cold first run (a single 4.7 s main-thread task) and 88 on three later runs; the task did not reproduce under Playwright with or without WebGL, so it is treated as machine contention.

## Performance hygiene

- JS per page (transfer): about 247 KB on every route (251 KB on Chapter 001). Shared runtime plus gsap/ScrollTrigger.
- Nothing over 500 KB loads before first paint on any page. Heaviest page: `/artifacts` at 888 KB total, from the two charm faces.
- Ten largest assets shipped:

| Size | Asset |
|---|---|
| 238 KB | `/artifacts/ch001-charm-front.webp` |
| 188 KB | `/artifacts/ch001-charm-back.webp` |
| 143 KB | wordmark via `/_next/image` (w=828) |
| 74 KB | hero scene via `/_next/image` (w=1920) |
| 71 KB | JS chunk (React runtime) |
| 53 KB | flyer via `/_next/image` (w=384) |
| 46 KB | JS chunk |
| 44 KB | JS chunk (gsap + ScrollTrigger) |
| 42 KB | Hanken Grotesk woff2 |
| 34 KB | Grenze Gotisch woff2 |

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

## Remaining issues

### Critical
None.

### High
None in the site. Launch blockers that need account logins, already tracked in CLAUDE.md under "Before domain cutover":
- Circle submissions have no storage yet: connect Supabase and run `supabase/migrations/001_circle.sql`.
- `/privacy` does not exist: build it once `legalName` and `contactEmail` are confirmed.

### Medium
- Mobile LCP 3.0 to 3.8 s (home LCP is the wordmark image): add `priority` / `fetchPriority="high"` to the hero wordmark and preload it.
- Charm faces ship at full size (426 KB on `/artifacts`): resize to 2x display width and serve through `next/image` (AVIF/WebP).
- Real Safari on iPhone not yet checked by eye: one manual pass of charm, book, menu blur and rig before cutover.

### Low
- About 61 KB of unused JS per page (ScrollTrigger on pages without pins): dynamic-import ScrollTrigger only where `useMotion` runs.
- 13 KB of legacy JS polyfills: tighten `browserslist` to current evergreen browsers.
- Yearbook has no explicit status label (copy is future tense): add an "In development" line like the Artifacts page.
- Archive "Opens after the night." appears only on hover/focus: acceptable, could show always on touch screens.
