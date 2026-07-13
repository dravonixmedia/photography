# Reyes Visual — Cinematic Photography Portfolio

A premium, scroll-driven photography/filmmaker portfolio built with Next.js
App Router, TypeScript, Tailwind CSS, GSAP + ScrollTrigger and Lenis. The
site opens with a silent, scroll-controlled cinematic intro built from a
real filmed sequence — a filmmaker emerging from darkness, raising a camera
toward the visitor, travelling through the lens into the camera's internal
optics, then a shutter flash that cuts into the real portfolio site.

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
  CanvasSequence.tsx         Progressive-loading image-sequence canvas renderer that
                              plays the intro's 120-frame filmed sequence
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
  generate-placeholder-assets.mjs   Procedurally renders portfolio placeholder imagery

public/
  sequences/opening/<desktop|mobile>/frame_0001.webp … frame_0120.webp
  images/portfolio/*.jpg
```

Only components that need GSAP, ScrollTrigger, Lenis, Canvas, browser APIs
or interactivity are Client Components (`"use client"`); every content
section is a Server Component.

## 2. Installation

```bash
npm install
npm run dev       # http://localhost:3000
```

The intro's frame sequence is already committed under `public/sequences/opening/`,
so nothing needs to be generated before the scroll architecture runs.
Portfolio photography is still procedurally generated placeholder imagery;
regenerate it any time with:

```bash
node scripts/generate-placeholder-assets.mjs
```

## 3. The intro's frame sequence

The intro plays back a single continuous filmed take — walk-in from
darkness, camera raised toward the viewer, a push through the lens into a
rendered internal-optics sequence, the pull back out, and the filmmaker's
own shutter flash — as one 120-frame WebP sequence scrubbed directly by
scroll position via `CanvasSequence`. There's no separate walking/lens-zoom/
internals/lens-return split: because the source is one take, a single
progress value (0–1) maps linearly across all 120 frames, and reversing
scroll naturally reverses playback because it's real footage, not a
mechanical reverse-and-replay trick.

```
public/sequences/opening/
  desktop/frame_0001.webp … frame_0120.webp   1920×1080
  mobile/frame_0001.webp  … frame_0120.webp    960×540
```

**Replacing the footage:** extract your own source video into the same
folder structure and frame-count convention (four-digit sequential
`frame_0001.webp`, …) with:

```bash
ffmpeg -i source.mp4 -vf "fps=8,scale=1920:1080:flags=lanczos" -c:v libwebp -q:v 78 -compression_level 4 public/sequences/opening/desktop/frame_%04d.webp
ffmpeg -i source.mp4 -vf "fps=8,scale=960:540:flags=lanczos"  -c:v libwebp -q:v 68 -compression_level 4 public/sequences/opening/mobile/frame_%04d.webp
```

(`-c:v libwebp`, not the default `libwebp_anim`, is required — otherwise
ffmpeg writes one animated WebP file instead of a numbered sequence.) If
your new footage's beats land at different points in its running time than
this one, retime the label percentages in `CinematicIntro.tsx` (see §4) to
match, and update `FRAME_COUNTS.opening` if the frame count changes.

## 4. Animation timeline plan

One GSAP master timeline drives the whole intro (`FullCinematicIntro` in
`components/CinematicIntro.tsx`), pinned via a single `ScrollTrigger`
(`scrub: 1`, `pin` on the inner viewport div, `invalidateOnRefresh: true`).
A single tweened proxy value (0–1, eased by the same scrub as everything
else) drives `CanvasSequence.setProgress()` directly — no React state
changes happen per scroll frame. Labels map to percentages of total scroll
distance (≈8400px desktop / 6800px tablet / 4200px mobile), chosen to match
where each beat actually lands in the 120-frame sequence:

| Label                 | Range   | What happens |
|-----------------------|---------|--------------|
| `darkness`             | 0%      | Black frame, distant silhouette, "Every story begins in the dark." |
| `approach`              | 8%      | Filmmaker walks closer |
| `cameraReveal`          | 20–35%  | Camera raised toward viewer, "Until vision finds its frame." |
| `lensZoom`               | 35–50%  | Push toward the lens |
| `insideCamera`            | 50–72%  | Internal optics sequence, "Technology built to capture emotion." |
| `technicalFeatures`        | 52–70% | 8 feature callouts staggered across this range |
| `cameraReassembly`          | 72–84%  | Pulling back out of the lens |
| `lensReturn`                  | 84%+   | Camera + filmmaker facing viewer again, "Captured." |
| `flash`                         | 92%+   | DOM white-flash overlay ramps in alongside the footage's own in-camera shutter flash (~95–100% of the sequence), then fades across the natural post-pin viewport-height gap into Hero |
| `heroReveal`                      | 100%   | Pin releases; Hero section (a normal, always-crawlable section) takes over |

A second, non-overlapping `ScrollTrigger` (`trigger: sectionRef`, `"bottom
bottom" → "bottom top"`) fades the flash out across exactly the trailing
viewport-height that GSAP's pin-spacer always reserves after a pin releases —
this keeps the cut masked in white instead of briefly showing a frozen last
frame. Reverse-scrolling reverses the whole sequence naturally because it's
one scrubbed timeline over one continuous take.

## 5. Component responsibilities

See the file map in §1 — `CanvasSequence` only renders frames from refs (no
React state per scroll tick); `CinematicIntro` owns the master timeline, DOM
overlays (headlines, technical callouts, flash) and skip/reduced-motion
branches; content sections are static, image-led, Server Components with no
client JS.

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

**Replacing the intro footage:** see §3 above.

## Mobile optimisation notes

- `CanvasSequence` auto-switches to the `mobile/` frame folder under 768px
  and reloads if the viewport crosses that breakpoint (e.g. rotation).
- Pin distance is shorter on mobile/tablet (see the `distance` calc in
  `CinematicIntro.tsx`) so the intro doesn't overstay its welcome on a phone.
- Device pixel ratio is clamped to 2 in `CanvasSequence` to avoid oversized
  canvases on high-DPI phones.
- Touch scrolling is left native (Lenis `syncTouch: false`) — no added
  smoothing lag on mobile.

## Performance checklist

- [x] Sequence frames are WebP, separate desktop (1920×1080) and mobile (960×540) sizes
- [x] Portfolio images use `next/image` with `sizes` hints
- [x] `CinematicIntroLoader` dynamically imports the intro with `ssr:false`
- [x] Below-the-hero sections are plain Server Components (no client JS)
- [x] Canvas draws use refs only — no React state writes per scroll frame
- [x] Progressive frame loading: first frame → ±8 neighbours → batched rest
- [x] DPR clamped to 2; single ResizeObserver per canvas
- [x] Animations use transform/opacity (GSAP `autoAlpha`), not layout props
- [ ] Run `npm run build && npx next start` and profile with Lighthouse /
      WebPageTest on target devices/connections.

## Accessibility checklist

- [x] `prefers-reduced-motion` fully bypasses the pinned scroll experience
      (`ReducedMotionIntro`: static frame from the sequence, immediate
      headline, "Enter Site")
- [x] Visible "Skip Intro" button, keyboard operable, jumps straight to `#hero`
- [x] Canvas elements are `aria-hidden`; all narrative text is real DOM text
      (readable regardless of animation/opacity state)
- [x] Single `<h1>` lives on the Hero section; intro copy uses `<p>`
- [x] Skip-to-content link, visible focus states, semantic `<header>`/`<main>`/`<footer>`
- [x] Mobile nav is keyboard-dismissible (Escape) and screen-reader labelled
- [x] Scrolling is never trapped — native scroll always works, Skip Intro and
      reduced motion both bypass the pin entirely
- [x] The intro is fully silent — the source footage has no audio track

## Production testing checklist

- [x] `npx tsc --noEmit` — no type errors
- [x] `npx eslint .` — no errors/warnings
- [x] `npm run build` — production build succeeds
- [x] Manual pass: full intro scroll-through (forward and reverse), Skip
      Intro, reduced-motion fallback, mobile viewport, replay-intro flow
- [ ] Cross-browser pass (Safari/iOS in particular)
- [ ] Real Lighthouse/CrUX pass on target devices/connections

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
