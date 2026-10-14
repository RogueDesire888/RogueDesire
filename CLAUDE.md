# ROGUE DESIRE: CLAUDE CODE CONTEXT

Read this file at the start of every session. It is the condensed source of truth.
The full brand handoff (docs/handoff.md) is not in the repo. Page copy, manifesto text, and chapter details come from task prompts.

## Project

- Brand: Rogue Desire. Line: "Architects of Temporary Realities."
- What it is: a chapter-based electronic music and nightlife experience brand. Each night is a fully designed world (sound, light, venue, people), the printed flyer is a collectible Artifact, and photos, films, and an annual Yearbook preserve it.
- Launch city: Greenville, SC (not public yet, controlled by `config/site.ts`).
- Separate legal entity. Not affiliated with Vertex Data LLC or any other project. Never reference other projects.
- Instagram: @roguedesireofficial
- Repo: github.com/RogueDesire888/RogueDesire (branch: main). GitHub account: RogueDesire888.
- Hosting: Vercel project `rogue-desire` on account celestialsoundrecords-9938 (team "celestialsoundrecords-9938's projects"). This is the correct dedicated Rogue Desire account. Domain roguedesire.com is on GoDaddy, cutover happens last.

## Stack

- Next.js (App Router) + TypeScript + Tailwind, npm.
- Content as typed files in `content/` validated with Zod. No CMS.
- Forms (later): Supabase + Cloudflare Turnstile + Resend. Do not invent endpoints or keys.
- Analytics: Vercel Analytics only (cookie-free, no cookie banner).

## Working rules

- Do and commit everything you can. Only stop for steps that need a human login (Vercel, Supabase, Resend, Cloudflare, GoDaddy).
- Keep each task under about 20k tokens: no reading node_modules, no unnecessary dependencies.
- Small logical commits, push to main after each task.
- `npm run build` and `npm run lint:brand` must pass before every push.
- Update the Task status section at the bottom of this file at the end of each task.

## Truth rule (non-negotiable)

Never publish an unconfirmed fact. No invented dates, venues, artists, prices, quotes, testimonials, attendance numbers, or archive images. Unconfirmed fields are `null` in content/config and simply do not render. Chapters 002 to 005 are concepts: no dates, no implied bookings, labeled as future realities.

## Vocabulary

| Standard | Rogue Desire |
|---|---|
| Event | Chapter |
| Flyer / print | Artifact |
| Gallery / recap | Archive |
| Blog / news | Transmissions |
| DJ / performer | Frequency |
| Attendees | Witnesses |
| VIP | Inner Circle (never use "VIP") |
| Contact us | Enter the Circle |
| Merch | Wearable Archives |
| Newsletter | Private Transmission |
| Sold out | Archived |

Use plain language for logistics: dates, venue, tickets, age, accessibility, safety, forms, errors.

## Voice

Cinematic, restrained, mysterious, underground luxury. Short lines. Few exclamation points. Let imagery and spacing do the work. Mystery never creates confusion: a first-time visitor must understand this is an electronic music experience brand and how to take the next step.

Banned in public copy: vibes, lit, pull up, turn up, good vibes only, don't miss out, buy now, get your tickets now, shop merch, merch, photo dump, gallery, blog, fans, customers, promo, rave fam. No em dashes anywhere in site copy (use colons or periods: "Chapter 001: Ascension").

Allowed exception: the core line "We do not organize parties." is permitted.

Core lines:
- Architects of Temporary Realities.
- Some moments are too powerful to disappear.
- We do not organize parties. We construct emotional architecture.
- The crowd is not an audience. The crowd is the artwork.
- The night disappears. The object remembers.
- The event ends. The archive begins.
- Enter with curiosity. Leave with a story. Keep the evidence.

CTAs: Enter the Next Chapter, Read the Manifesto, Enter Chapter 001, Enter the Archive, View Artifacts, Explore the Yearbook, Enter the Circle, View Frequencies, Open Transmission.

## Design system

Rule: the wordmark carries the chaos, the layout carries the sophistication.

Wordmark direction: jagged, hand-drawn, brush-like lettering rendered as a glowing neon outline with laser beams and a wireframe grid horizon behind it. The wordmark asset is `public/brand/wordmark.webp`. `components/brand/Wordmark.tsx` is the swap point for small uses (nav, footer); the home hero uses the same asset with its spin treatment.

Tokens (CSS variables in globals.css, mapped into Tailwind):
- --rd-black #030303 (base), --rd-charcoal #0B0B0F (elevated surfaces)
- --rd-white #F5F5F7 (text), --rd-chrome #C8CEDA (secondary text, rules)
- --rd-violet #8B2CFF (primary brand energy), --rd-violet-soft #B879FF (glow)
- Chapter accents, used only inside their chapter: --rd-orange #FF5A1F, --rd-ice #A8E8FF, --rd-green #39FF88, --rd-crimson #8A102A, --rd-gold #F3C15F
- `--accent` and `--accent-glow` default to violet and are overridden per chapter via `[data-chapter="ascension"]` etc. Primary brand color may switch to green later: keep it a one-line change.

Chapter accents:
- 001 Ascension: violet + chrome + white, subtle ice
- 002 Eclipse: black-on-black, silver, deep violet
- 003 Neon Garden: green + violet
- 004 Mirage: gold + chrome
- 005 Velocity: white + chrome + ice

Type:
- Wordmark: image asset (`public/brand/wordmark.webp`, `wordmark-sm.webp`), rendered only via `components/brand/Wordmark.tsx`.
- Grenze Gotisch (display, `font-display`, CSS var --font-display): hero tagline, home statements and headings, chapter titles, future realities, closing lines, manifesto opening/statements/stanzas/signoff, menu overlay links, all section headings. Weight 600 (stanzas 500).
- Hanken Grotesk (body/UI, `font-sans`): paragraphs, buttons, nav links, footer, forms, small labels, the chapter code seal, "Undisclosed" labels, Roman numerals. Line length under 75ch.
- Blackletter rules: never uppercase the display face and never use wide letter-spacing on it. Chapter titles render in title case from content ("Ascension"). Letter-spacing normal or -0.005em at display sizes. Line-height ~1.08 for display statements, ~1.25 for stanza lines. Glow treatments unchanged.
- Use curly apostrophes (U+2019) in copy.

Motion and atmosphere:
- Black void, grain, fog, laser grid, violet glow. Glow is seasoning, not the system.
- Motion kit (gsap + ScrollTrigger, registered once in `src/lib/motion.ts`; use `useMotion(ref, setup)` and `usePrefersReducedMotion()`):
  - One continuous fog room: `Atmosphere` is mounted once in the root layout (one WebGL canvas, always on). Sections set cues with data-cue (hero, lasers, fog, flare, grid, void); the first data-cue on a page is its starting cue; triggers rebuild on route change. Cues only shift beam strength and fog density (eased ~1.2s), plus grid/flare overlays. Mark every text-bearing section with data-fog-cap (fog capped at 25%, beams dimmed to half behind it).
  - Home hero: no rig of its own; the scene image uses mix-blend-mode: screen with a transparent edge mask so the fog room shows through. html stays --rd-black, body transparent.
  - Primitives in `src/components/motion/`: FadeIn, RevealLines (optional glowWords, stagger), ScrubWords, GlitchResolve, LightSweep, NeonIgnite (primitives.tsx); PinnedSwap, PinnedDissolve, BeatWords (pinned.tsx); Atmosphere (data-cue blocks: void, fog, grid, lasers, flare); CursorGlow (site-wide, fine pointer desktop only).
  - Paragraphs only ever get FadeIn (a LightSweep may precede it).
  - Choreography is data: blocks declare `motion` and `cue` (see content/manifesto.ts).
- Motion setup waits for `document.fonts.ready` before creating ScrollTriggers, then refreshes once (`scheduleRefresh`), so pins measure the final face.
- Guardrails (non-negotiable):
  - Server render is the final, readable state. Hidden starting states are set only inside effects, only when motion is allowed. Page is fully readable with JS off and under reduced motion.
  - Real text stays in the DOM. Split text keeps the full string for assistive tech (sr-only) and marks pieces aria-hidden.
  - Animate only transform, opacity, and filter. ScrollTriggers are cleaned up on unmount (gsap.matchMedia revert).
  - No pinning under 768px: the same effect plays as an in-view sequence.
  - No flashes brighter than a soft glow, never more than 3 per second (BeatWords pulses are throttled; NeonIgnite flickers twice).
  - Fixed atmosphere layers sit at z-index -10 between the html background and content; body is transparent for this.
- Pulse engine (`src/lib/pulse.tsx`, PulseProvider in the root layout): one rAF loop writes --beat (per-beat envelope, BPM from `site.bpm`, capped at 180), --bar, --energy (scroll velocity, decays over ~1.5s), --scroll-dir on :root. CSS vars update at ~30Hz and only on 2-decimal changes (each :root write restyles the whole page); JS consumers read live values via `usePulse()`.
- LaserRig (`src/components/atmosphere/LaserRig.tsx`): raw WebGL fragment shader, beams + fbm haze, colors from --accent/--accent-glow, beam count and sweep follow --energy. Used in the home hero (screen blend) and the Atmosphere "lasers" cue. Static LaserGrid fallback (none in the hero, where the scene image is the fallback).
- Fog machine (inside LaserRig, same shader and canvas): domain-warped fbm fog bank, dense low; beams scatter through it (faint core survives clear air). Bursts via `triggerFogBurst(intensity)` in `src/lib/pulse.tsx` (one on load, one every 16 bars, max 2 active). Fine-pointer cursor thins and pushes fog. Fog behind `[data-fog-cap]` elements is capped at 25% density (mark every text-bearing section). Adaptive quality tiers 0 to 3 (octaves, resolution, cursor), step down after 2s under 50fps, up after 10s of headroom; active tier is on the rig as `data-tier`, logged in dev. Atmosphere "fog" cue = same rig with beams low.
- Home is a set: intro (fog, intensity 1) > build (rules, data-cue="build", intensity ramps 0.3 to 1 with scroll) > breath and drop (Chapter 001 dossier, `DropStage`) > breakdown (future realities, fog, intensity 0.15, slow staggered fades) > outro (closing, flare, one gentle burst). Sections use `SetZone` (`src/components/motion/SetZone.tsx`) for intensity and enter bursts.
- Set API (`src/lib/pulse.tsx`): `setIntensity(0..1)` (smoothed multiplier on beams, sweep, fog density, beat amplitude; reset to 1 per route), `triggerDrop()` (three plumes, laser explosion, violet flood; once per page load), `triggerFogBurst(i)`, `msToNextDownbeat()`, `barMs()`, `setAtmosphereCue(cue)`. Rig cues add "build" and "breath".
- The drop (`DropStage`): desktop pins ~160vh; breath = near-void cue, intensity 0, content hidden; drop on the first downbeat at least one bar later (two beats on mobile, no pin, at 40% in view): title slams (scale 1.35 to 1, blur 10px to 0, ~280ms), 4px camera shake decaying over 400ms, then seal, line, description, rows (100ms apart), details, CTA. Scrolling past fires it instantly so content never stays hidden. Mark parts with data-drop and the shake wrapper with data-drop-shake.
- Drop guardrails: once per load; flood max 35% opacity, never repeated within 10s; no white flashes; shake max 4px once. Reduced motion: no pin, no breath, no drop effects, dossier fully revealed and static. JS off: everything readable.
- `scheduleRefresh()` sorts triggers by page position before refreshing, because the layout's Atmosphere can hydrate before a page's pins.
- Beat-reactive CSS: `.rd-text-glow` (display text glow), `.rd-beat-glow` (primary button), hero scene and wordmark brightness/scale in hero.css.
- Marquee (`src/components/motion/Marquee.tsx`): outlined display text band, speed x(1 + energy*4), follows scroll direction, skew up to 6deg.
- Pulse guardrails: no full-screen flashes, no strobing. Beat-driven brightness changes max +/-15%. Never more than 3 pulses per second. Reduced motion: pulse vars fixed at 0, no WebGL (static fallback), marquees static. Pause every loop when the tab is hidden or the element is offscreen. Performance target: 60fps on a modern laptop, 45fps+ under Chrome 4x CPU throttle at 375px.
- Everything respects `prefers-reduced-motion`. Atmosphere layers are aria-hidden and pointer-events none.
- Performance first: CSS/SVG over canvas libraries, lazy-load below-the-fold media.

Avoid: SaaS card grids with identical rounded cards and soft shadows, all-caps eyebrow labels above every heading, middle-dot meta strings, arrows appended to buttons, monospace data labels, rainbow neon, stock rave clichés, generic gradients.

Quality floor: mobile first, no horizontal overflow, visible focus states, semantic landmarks, skip link, alt text, labeled form fields, WCAG AA contrast.

## Information architecture

Primary nav (visible): Manifesto, Chapters, Archive, Artifacts, Enter the Circle.
Full overlay menu: Home, Manifesto, Chapters, Archive, Transmissions, Artifacts, Collective, Yearbook, Enter the Circle.

Routes:
- `/` Home
- `/manifesto` (short manifesto; the long version becomes Transmission 000)
- `/chapters` and `/chapters/ascension`
- `/archive` (designed empty state until Chapter 001 happens; later `/archive/RD-Y1-CH001-ASC`)
- `/transmissions` and `/transmissions/[slug]` (MDX)
- `/artifacts` (later `/artifact/[code]` registry for numbered QR cards)
- `/collective` (real people only, can be hidden until populated)
- `/yearbook`
- `/circle` (Enter the Circle)
- `/privacy`, custom 404

Site phases (`SITE_PHASE` in config/site.ts), following the 8-week rollout: `signal` > `reveal` > `access` > `archive`. Phase gates which sections and CTAs render.

## Content model (Zod, in content/)

- Chapter: code, number, slug, title, line, status (concept | upcoming | past), revealed (boolean; unrevealed chapters never output title, line, element, or theme, use `getConceptListing()`), element, theme, accent, city, venue, date, hours, agePolicy, ticketUrl, frequencies, artifacts, accessibility. Operational fields nullable and hidden when null.
- Frequency: name, role (threshold | activation | peak | afterglow), bio, links, imageApproved.
- Artifact: code, name, chapter, format, edition, status, image.
- Transmission: slug, title, type, date, excerpt, body (MDX), chapter, published.
- Archive item: type, chapter, credit, consentStatus.

Archive code format: `RD-Y1-CH001-ASC`, artifact numbering `RD-Y1-CH001-ASC-CARD-001/300`.

## Open facts (null until confirmed)

Legal entity name, public contact email, city reveal timing, venue, date, hours, capacity, age policy, artists, ticket platform and URL, pricing, form destination, real photography, wordmark SVG.

## Task status

- [x] 1. Scaffold, tokens, fonts, layout shell, placeholder hero, brand linter, Vercel preview
- [x] 2. Content layer: Zod schemas, chapter/artifact/transmission files, null gating
- [x] 3. Navbar + overlay menu, Footer, buttons, section primitives
- [x] 4. Home
- [x] 5. Manifesto
- [x] 6. Chapters index + Chapter 001 with chapter theming
- [x] 7. Enter the Circle form (UI and server action; storage waits on the Task 11 checklist)
- [ ] 8. Artifacts, Yearbook, Transmissions, Archive, Collective
  - [x] 8A. Artifacts and Yearbook
  - [ ] 8B. Transmissions, Archive, Collective
- [ ] 9. SEO: metadata, OG images, sitemap, robots, JSON-LD, privacy page, 404
- [ ] 10. QA: links, forms, accessibility, performance, mobile
- [ ] 11. Domain cutover

Before domain cutover (Task 11). Task 11 must not proceed until every item is checked:
- [ ] Connect Supabase in Vercel (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, Postgres URL in all environments) and run `supabase/migrations/001_circle.sql`.
- [ ] Move Circle rate limiting from memory to the database (count circle_entries by ip_hash in the last hour).
- [ ] Set CIRCLE_FORM_SECRET and CIRCLE_IP_SALT in Vercel for all environments.
- [ ] Build `/privacy` (needs `legalName` and `contactEmail` in `src/config/site.ts`); the Circle form links it automatically once live.

Preview URL (Task 1): https://rogue-desire-rcggp4d4a-celestialsoundrecords-9938s-projects.vercel.app
Vercel project: rogue-desire (team celestialsoundrecords-9938s-projects). Deployments are behind Vercel deployment protection.
Git integration: connected to RogueDesire888/RogueDesire. Every push to main auto-deploys to the Production environment (vercel.app URL only, no custom domain yet).
Latest deployment (Task 2): https://rogue-desire-q52zsbqjz-celestialsoundrecords-9938s-projects.vercel.app
Home hero (src/app/page.tsx + src/components/home/hero.css):
- Hero box (`.rd-hero`): desktop height min(88vh, 1100px), scene object-cover anchored bottom center; mobile aspect-ratio 1.39 with the scene contained (no crop) at the bottom. Top and side edges fade into black; short bottom fade keeps the grid floor visible.
- Wordmark stands on the floor: base at 79% of hero height on desktop (86% mobile), width 46% desktop / 85% mobile, via `--wm-base` and `--wm-width` on `.rd-hero`. Spins rotateY 0 to 360 around its own vertical center inside a 1200px perspective stage; back shows mirrored. Glow pulse (brightness, 6s) on the wordmark only.
- Reflection: flipped, blurred, 15% opacity copy starting at the wordmark base, spinning in sync, faded with a mask, aria-hidden, clipped inside the hero.
- Spin speed: `--spin-duration` (default 14s) in `:root` in globals.css. That is the only place to change it.
- Reduced motion: no spin, no pulse, wordmark static facing forward.
- Source PNGs (3840x1648) are kept out of the repo; WebPs were generated with sharp at max 2560px.

Navigation (Task 3): routes live in `src/config/nav.ts`. Navbar, menu overlay, and footer render only `live: true` routes; set a page live there when it ships (Privacy is in `legalRoutes`). Wordmark sizes: `<Wordmark size="sm" />` uses wordmark-sm.webp (480px) for nav/footer, "lg" the full asset. Buttons: `src/components/ui/Button.tsx` (primary, secondary, text). Stacking: nav z-30, menu overlay z-40, global Grain z-50.

Home (Task 4.1): sections in `src/components/home/HomeSections.tsx` (Intro, Rules, ChapterDossier, FutureRealities, Closing); hero in `Hero.tsx`. Chapter data comes only from `getNextChapter()` / `getConceptChapters()`. CTAs gate on `isLive(href)` from nav.ts. Reveals: `src/components/ui/Reveal.tsx` ("rise" for the Chapter 001 dossier, "fade" with delay for intro line 2). Redaction bars: `src/components/ui/Redaction.tsx`, width seeded from a string so it is stable. Accent overrides for unrevealed chapters are left out of globals.css until reveal so their names never ship; add `[data-chapter="<slug>"]` when a chapter is revealed.

Manifesto (Task 5): text lives in `content/manifesto.ts` as typed blocks (opening, statement, stanza, paragraph, signoff); never edit its words. Page: `src/app/manifesto/page.tsx` maps blocks to motion primitives; `ScrollProgress` is the desktop accent progress line. The Atmosphere lives in the root layout (after main) so its cue triggers are measured after pin spacers exist. Shared styles: `src/components/ui/styles.ts` (container, display). Closing CTA: `src/components/ui/SignalCta.tsx`.

Chapters (Task 6): `/chapters` (Year One index: symbols, Chapter 001 feature, concept listing via `getConceptListing()`) and `/chapters/ascension` (hero, description, meaning BeatWords, element and palette, The night, sound, Artifact 001, style direction marquee, guest code, access). Chapter page content lives on the chapter entry (opening, closingLine, meaning, elements, soundDirection {line, genres}, styleDirection {lines, words}, guestCodeIntro, guestCode, nightArc); never publish times for night phases. `NightArc` (`src/components/chapter/NightArc.tsx`) plays the arc on the atmosphere (intensity 0.2 / 0.5 / 1.0 / 0.3, fog / lasers / lasers / fog, one burst at Peak); desktop pins ~200vh. `Disclosure` (`src/components/chapter/Disclosure.tsx`) is the shared disclosure rows component (home dossier and chapter access). Frequencies carry a `chapter` slug; `getFrequencies(slug, role)`. Unlisted live routes (`unlisted: true` in nav.ts) are linkable via isLive() but not shown in nav, menu, or footer.

Enter the Circle (Task 7): `/circle` is live in nav for review, but entries are not stored yet. Form: `src/components/circle/CircleForm.tsx`; server action `src/app/circle/actions.ts` (Zod, honeypot `website`, signed 2.5s "opened" token, 5 per IP per hour via salted hash, in-memory for now). Storage goes through `getCircleStore()` in `src/lib/circle-store.ts` (Supabase REST, server-only); with no store a valid entry shows "The Circle opens soon." Without JavaScript the action answers with a 303 to `/circle?status=` or `?error=&f=` (codes only, never typed values, links unsigned by decision); with JavaScript it returns inline state. Dev-only preview: `/circle?preview=success`.

Artifacts and Yearbook (Task 8A): `/artifacts` (hero, Artifact 001 card, the objects, closing) and `/yearbook` (3D book, copy with PinnedDissolve, collector editions). `ArtifactCard` (`src/components/objects/ArtifactCard.tsx`) tilts toward the pointer (max 12deg) with a foil layer driven by --rx/--ry/--mx/--my; touch uses device orientation when no permission prompt is needed, otherwise a slow sway; flat under reduced motion. `YearbookBook` renders open on the server (final state); desktop pins ~150vh and scrubs the cover open, mobile opens once at 50% in view. The Artifact 001 section's hero object is `CharmSpinner` (`src/components/artifacts/CharmSpinner.tsx`): CSS 3D charm with front/back WebP faces and 12 masked edge layers (assets in `public/artifacts/`, split and aligned from one source render), auto-spin on --spin-duration, drag with momentum, arrow keys, floor reflection, beat glow; reduced motion shows the front with a "Show back" toggle. Edge layers sit strictly inside the faces (never coplanar). The finished Artifact 001 flyer is generated by `node scripts/compose-flyer.mjs` (source art in `art/`, fonts from google/fonts in `scripts/fonts/`, text drawn as opentype.js paths with manual glyph layout) into `public/artifacts/ch001-flyer.png|webp`; the canvas is extended with the art's own black so the wordmark and title sit in dark bands with 6% margins. The Artifacts page opens it in `FlyerLightbox` (native modal dialog). When processing images with sharp, materialize `extend()` to a buffer before `extract()`: sharp always extracts first. Never show prices, quantities, editions, or release dates for objects until confirmed; artifact status shows as plain language ("in development").

Notes: CSS Modules do not work with the scaffolded Turbopack Tailwind rule in next.config.ts; use plain prefixed CSS files (see src/components/atmosphere/laser-grid.css). Tailwind font utilities: font-sans, font-display (defined with @utility in globals.css). Content imports use the `@content/*` alias; render optional fields only through `isPublic()` from src/lib/content.ts.
