# Reyes Visual — Cinematic Photography Portfolio

A premium, scroll-driven photography/filmmaker portfolio built with Next.js App
Router, TypeScript, Tailwind CSS, GSAP + ScrollTrigger and Lenis. The site
opens with an original, silent, scroll-controlled cinematic intro — a
filmmaker emerging from darkness, raising a camera toward the visitor,
travelling through the lens into the camera's internal technology, then
flashing into the real portfolio site.

## 1. Project structure

```
app/
  layout.tsx          Root layout, fonts, metadata, SmoothScroll provider
  page.tsx             Assembles the whole homepage
  globals.css           Design tokens (Tailwind v4 @theme), grain overlay, resets
  robots.ts / sitemap.ts

components/
  SmoothScroll.tsx           Lenis + GSAP ticker wiring, Lenis/IntroProgress context providers
  CinematicIntroLoader.tsx   Client-only dynamic import boundary (ssr:false) for the intro
  CinematicIntro.tsx         Master GSAP timeline, all 6 intro scenes, skip/reduced-motion branches
  CanvasSequence.tsx         Generic progressive-loading image-sequence canvas renderer
  IntroLoadingScreen.tsx     Minimal loader shown until the first frame is ready
  TechnicalFeature.tsx       Single animated technical-callout label
  FlashTransition.tsx        Fixed full-viewport white flash overlay
  Header.tsx                 Nav, mobile menu, Replay Intro control
  HeroSection.tsx             Full-screen hero with restrained parallax
  SelectedWork.tsx, PhotographyCategories.tsx, AboutPhotographer.tsx,
  CreativePhilosophy.tsx, FeaturedProjects.tsx, Testimonials.tsx,
  BehindTheScenes.tsx, AwardsPublications.tsx, BookingCTA.tsx,
  ContactSection.tsx, Footer.tsx    Editorial content sections (Server Components)

hooks/
  useReducedMotion.ts     prefers-reduced-motion via useSyncExternalStore
  useIntroSession.ts      sessionStorage "seen intro" read/write + replay

lib/
  gsap.ts                    Registers ScrollTrigger once, client-only
  content.ts                  All site copy/data — edit this to rebrand
  lenis-context.tsx           Lenis ref context + scrollToTarget helper
  intro-progress-context.tsx  Shares "has the intro been scrolled past" with Header

scripts/
  generate-placeholder-assets.mjs   Procedurally renders the temporary frame
                                     sequences and portfolio images (see §2)

public/
  sequences/<name>/<desktop|mobile>/frame_0001.webp …
  images/portfolio/*.jpg
```

Only components that need GSAP, ScrollTrigger, Lenis, Canvas, browser APIs or
interactivity are Client Components (`"use client"`); every content section is
a Server Component.

## 2. Installation

```bash
npm install
npm run dev       # http://localhost:3000
```

The repo ships with a full set of **temporary placeholder frames** already
generated (procedural SVG→WebP renders — see §3), so the scroll architecture
runs out of the box before any real footage exists. Regenerate them any time
with:

```bash
node scripts/generate-placeholder-assets.mjs
```

## 3. Image sequence asset structure

```
public/sequences/
  walking/{desktop,mobile}/frame_0001.webp … frame_0028.webp   (darkness → approach → camera reveal, 0–35%)
  lens-zoom/{desktop,mobile}/frame_0001.webp … frame_0022.webp  (lens rotation + zoom, 35–50%)
  camera-internals/{desktop,mobile}/frame_0001.webp … frame_0032.webp
    (played forward 50–72% for "inside the camera", then reversed 72–84% for reassembly — one sequence, reused)
  lens-return/{desktop,mobile}/frame_0001.webp … frame_0022.webp (camera body + filmmaker facing viewer, 84%+)
public/images/portfolio/*.jpg   Portfolio, hero, about and BTS stills
```

Frame filenames are always four-digit sequential (`frame_0001.webp`,
`frame_0002.webp`, …). Desktop frames are rendered 1920×1080, mobile
828×1472-class portrait — `CanvasSequence` picks a folder based on a
767px breakpoint and re-crops every frame with an `object-fit: cover`
calculation, so aspect ratios don't need to match exactly.

**Replacing the placeholders with real renders:** export your Blender/Cinema
4D/Unreal sequence (or photographed sequence) at the same resolution class,
name the frames identically, and drop them into the matching folder —
`CanvasSequence` needs no code changes. `FRAME_COUNTS` in
`components/CinematicIntro.tsx` must match the number of frames you provide
per sequence (spec targets: ~40–60 walking, ~30–50 lens-zoom, ~50–80
camera-internals, ~30–50 lens-return — the shipped placeholders use smaller
counts deliberately, per the brief's "start with ~20 test frames" guidance).

## 4. Animation timeline plan

One GSAP master timeline drives the whole intro (`FullCinematicIntro` in
`components/CinematicIntro.tsx`), pinned via a single `ScrollTrigger`
(`scrub: 1`, `pin` on the inner viewport div, `invalidateOnRefresh: true`).
Labels map to percentages of total scroll distance (≈8400px desktop / 6800px
tablet / 4200px mobile):

| Label                 | Range   | What happens |
|-----------------------|---------|--------------|
| `darkness`             | 0%      | Black frame, light beam, dust, distant silhouette |
| `approach`              | 8%      | Filmmaker walks closer, "Every story begins in the dark." |
| `cameraReveal`          | 20–35%  | Camera raised toward viewer, "Until vision finds its frame." |
| `lensZoom`               | 35–50%  | Viewpoint pushes into the rotating, opening lens |
| `insideCamera`            | 50–72%  | Internal optics, light beam to sensor, "Technology built to capture emotion." |
| `technicalFeatures`        | 52–70% | 8 feature callouts staggered across this range |
| `cameraReassembly`          | 72–84%  | Same internals sequence played in reverse |
| `lensReturn`                  | 84%+   | Camera body + filmmaker facing viewer, "Captured." |
| `flash`                         | 88%+   | White flash ramps in, then fades across the natural post-pin viewport-height gap into Hero |
| `heroReveal`                      | 100%   | Pin releases; Hero section (a normal, always-crawlable section) takes over |

A second, non-overlapping `ScrollTrigger` (`trigger: sectionRef`, `"bottom
bottom" → "bottom top"`) fades the flash out across exactly the trailing
viewport-height that GSAP's pin-spacer always reserves after a pin releases —
this keeps the cut masked in white instead of briefly showing a frozen last
frame. Reverse-scrolling reverses every scene naturally because it's all one
scrubbed timeline.

## 5. Component responsibilities

See the file map in §1 — each component does one job: `CanvasSequence` only
renders frames from refs (no React state per scroll tick); `CinematicIntro`
owns the master timeline and all scene wiring; content sections are static,
image-led, Server Components with no client JS.

---

## Editing content

**Photographer name / studio / copy:** edit `lib/content.ts` — `site`,
`philosophy`, `testimonials`, `awards`, `categories`, `selectedWork`,
`featuredProjects`, `behindTheScenes`, `technicalFeatures` and `navLinks` are
all defined there as plain data, consumed by the section components.

**Replacing portfolio images:** drop new files into `public/images/portfolio/`
and update the `image` paths in `lib/content.ts`. Keep the same aspect ratios
noted in the `PORTFOLIO_SPECS` list inside
`scripts/generate-placeholder-assets.mjs` for the layouts to remain
unclipped, or adjust the `aspect-*` classes in the relevant section
component.

**Adding the rendered cinematic frames:** see §3 above.

## Mobile optimisation notes

- `CanvasSequence` auto-switches to the `mobile/` frame folder under 768px
  and reloads if the viewport crosses that breakpoint (e.g. rotation).
- Pin distance is shorter on mobile/tablet (see the `distance` calc in
  `CinematicIntro.tsx`) so the intro doesn't overstay its welcome on a phone.
- Device pixel ratio is clamped to 2 in `CanvasSequence` to avoid
  oversized canvases on high-DPI phones.
- Touch scrolling is left native (Lenis `syncTouch: false`) — no added
  smoothing lag on mobile.
- Provide genuinely smaller/fewer mobile frames when you swap in real
  footage; the architecture doesn't require equal frame counts per device.

## Performance checklist

- [x] Sequence frames are WebP, separate desktop/mobile sizes
- [x] Portfolio images use `next/image` with `sizes` hints
- [x] `CinematicIntroLoader` dynamically imports the intro with `ssr:false`
- [x] Below-the-hero sections are plain Server Components (no client JS)
- [x] Canvas draws use refs only — no React state writes per scroll frame
- [x] Progressive frame loading: first frame → ±8 neighbours → batched rest
- [x] DPR clamped to 2; single ResizeObserver per canvas
- [x] Animations use transform/opacity (GSAP `autoAlpha`), not layout props
- [ ] Run `npm run build && npx next start` and profile with Lighthouse /
      WebPageTest once real (larger) frame sequences are in place — placeholder
      frames are intentionally tiny (~2.3 MB total) and aren't representative.

## Accessibility checklist

- [x] `prefers-reduced-motion` fully bypasses the pinned scroll experience
      (`ReducedMotionIntro`: static image, immediate headline, "Enter Site")
- [x] Visible "Skip Intro" button, keyboard operable, jumps straight to `#hero`
- [x] Canvas elements are `aria-hidden`; all narrative text is real DOM text
      (readable regardless of animation/opacity state)
- [x] Single `<h1>` lives on the Hero section; intro copy uses `<p>`
- [x] Skip-to-content link, visible focus states, semantic `<header>`/`<main>`/`<footer>`
- [x] Mobile nav is keyboard-dismissible (Escape) and screen-reader labelled
- [x] Scrolling is never trapped — native scroll always works, Skip Intro and
      reduced motion both bypass the pin entirely

## Production testing checklist

- [x] `npx tsc --noEmit` — no type errors
- [x] `npx eslint .` — no errors/warnings
- [x] `npm run build` — production build succeeds
- [x] Manual pass: full intro scroll-through, Skip Intro, reduced-motion
      fallback, mobile viewport, replay-intro flow (see verification notes in
      the PR/commit history)
- [ ] Cross-browser pass (Safari/iOS in particular) once real frame assets
      are in place
- [ ] Real Lighthouse/CrUX pass once production imagery replaces placeholders

## Deployment

**GitHub:** this repo is a standard Next.js App Router project — push to a
branch and open a PR as usual; no special CI config is required beyond
`npm run build`.

**Cloudflare (Pages / Workers via `@opennextjs/cloudflare`):**

```bash
npm install -D @opennextjs/cloudflare wrangler
npx opennextjs-cloudflare build
npx opennextjs-cloudflare deploy
```

Add a `wrangler.jsonc` if one doesn't exist yet (the OpenNext CLI scaffolds
one on first run). Ensure `public/sequences` and `public/images` are
included in the deployed static assets — they're plain files under
`public/`, so no extra configuration is needed for a standard Next.js build.
