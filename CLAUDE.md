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
- Hanken Grotesk: body and UI. Clean, Swiss, generous spacing, line length under 75ch.
- Syncopate: chapter titles only (ASCENSION, ECLIPSE), uppercase, wide tracking, optional neon glow.
- Wordmark: `public/brand/wordmark.webp` (transparent, trimmed, 2193x1373), rendered only via `components/brand/Wordmark.tsx` for small uses. No placeholder font.

Motion and atmosphere:
- Black void, grain, fog, laser grid, violet glow. Glow is seasoning, not the system.
- One orchestrated moment per page beats scattered effects. No fade-up on every section, no hover animation on every card.
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

- Chapter: code, number, slug, title, line, status (concept | upcoming | past), element, theme, accent, city, venue, date, hours, agePolicy, ticketUrl, frequencies, artifacts, accessibility. Operational fields nullable and hidden when null.
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
- [ ] 3. Navbar + overlay menu, Footer, buttons, section primitives
- [ ] 4. Home
- [ ] 5. Manifesto
- [ ] 6. Chapters index + Chapter 001 with chapter theming
- [ ] 7. Enter the Circle form (UI first, backend when accounts exist)
- [ ] 8. Artifacts, Yearbook, Transmissions, Archive, Collective
- [ ] 9. SEO: metadata, OG images, sitemap, robots, JSON-LD, privacy page, 404
- [ ] 10. QA: links, forms, accessibility, performance, mobile
- [ ] 11. Domain cutover

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

Notes: CSS Modules do not work with the scaffolded Turbopack Tailwind rule in next.config.ts; use plain prefixed CSS files (see src/components/atmosphere/laser-grid.css). Tailwind font utilities: font-sans, font-title. Content imports use the `@content/*` alias; render optional fields only through `isPublic()` from src/lib/content.ts.
