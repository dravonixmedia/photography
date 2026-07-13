# Reyes Visual — Cinematic Photography Portfolio

A premium, scroll-driven photography/filmmaker portfolio built with Next.js App
Router, TypeScript, Tailwind CSS, GSAP + ScrollTrigger, Lenis and a live
React Three Fiber (Three.js/WebGL) scene. The site opens with an original,
silent, scroll-controlled cinematic intro — a filmmaker emerging from
darkness, raising a camera toward the visitor, travelling through the lens
into the camera's internal technology, then flashing into the real portfolio
site. The intro's visuals are a genuine real-time 3D scene rendered in the
browser (not pre-rendered video or flat images), stylised as abstract
geometric forms rather than an attempt at photoreal characters.

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
  IntroScene3D.tsx            React Three Fiber <Canvas> wrapper (lighting, postprocessing, DPR/quality by device)
  intro-3d/
    Scene.tsx                  Camera rig — one continuous dolly path sampled from `progressRef`
    Figure.tsx                  Stylised humanoid (primitive geometry), walk-in + return beats
    CameraProp.tsx               The "hero" Sony FX3-style camera model, aperture blades, record light
    LensInternals.tsx             Internal glass elements, travelling light beam, sensor
    Particles.tsx                 Dust motes (single Points draw call, ref-driven drift)
    math.ts                        remap/clamp/lerp/easing helpers shared by every 3D component
  CanvasSequence.tsx         Generic progressive-loading image-sequence canvas renderer
                              (kept as an alternative path — see §3 — not used by the current intro)
  IntroLoadingScreen.tsx     Minimal loader shown until the 3D scene's WebGL context is ready
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
  generate-placeholder-assets.mjs   Procedurally renders portfolio placeholder
                                     imagery, plus an optional legacy image-
                                     sequence path for CanvasSequence (see §3)

public/
  images/portfolio/*.jpg
```

Only components that need GSAP, ScrollTrigger, Lenis, R3F/Canvas, browser
APIs or interactivity are Client Components (`"use client"`); every content
section is a Server Component.

## 2. Installation

```bash
npm install
npm run dev       # http://localhost:3000
```

Nothing else to generate — the intro is a live WebGL scene built entirely
from procedural geometry, so there are no frame assets to wait on. Portfolio
photography is still procedurally generated placeholder imagery (see below);
regenerate it any time with:

```bash
node scripts/generate-placeholder-assets.mjs
```

## 3. The 3D intro vs. the image-sequence path

The intro's camera, filmmaker figure and internal-lens visuals are rendered
**live** with React Three Fiber — one continuous WebGL scene, not a sequence
of pre-rendered images. `components/intro-3d/Scene.tsx` owns a single camera
"dolly path" (a small table of position/look-at/FOV keyframes in
`KEYFRAMES`) that's sampled every frame against the current scroll progress;
`Figure`, `CameraProp` and `LensInternals` each compute their own visibility
window and pose from that same progress value. Nothing here needs external
render passes, so there's no asset pipeline to run before the scroll
architecture works.

`CanvasSequence.tsx` (and `scripts/generate-placeholder-assets.mjs`'s frame
generators) are kept in the repo as an **alternative path**, unused by
default: if you'd rather composite real Blender/Cinema 4D/Unreal (or
photographed) footage instead of the live 3D scene, you can swap
`CinematicIntro.tsx`'s `<IntroScene3D />` for the four-`<CanvasSequence>`
approach it replaced — frame folder conventions
(`public/sequences/<name>/<desktop|mobile>/frame_0001.webp …`) and loading
behaviour are unchanged from that design.

## 4. Animation timeline plan

One GSAP master timeline drives the whole intro (`FullCinematicIntro` in
`components/CinematicIntro.tsx`), pinned via a single `ScrollTrigger`
(`scrub: 1`, `pin` on the inner viewport div, `invalidateOnRefresh: true`).
A single tweened proxy value (0–1, eased by the same scrub as everything
else) is written into `sceneProgressRef` every tick — the 3D scene reads
that ref directly in its own `useFrame` loops, so no React state changes
happen per scroll frame. Labels map to percentages of total scroll distance
(≈8400px desktop / 6800px tablet / 4200px mobile):

| Label                 | Range   | What happens |
|-----------------------|---------|--------------|
| `darkness`             | 0%      | Black frame, light beam, dust, distant silhouette |
| `approach`              | 8%      | Filmmaker walks closer, "Every story begins in the dark." |
| `cameraReveal`          | 20–35%  | Camera raised toward viewer, "Until vision finds its frame." |
| `lensZoom`               | 35–50%  | R3F camera dollies toward the rotating, opening lens |
| `insideCamera`            | 50–72%  | R3F camera flies the internal-glass corridor, light beam to sensor, "Technology built to capture emotion." |
| `technicalFeatures`        | 52–70% | 8 feature callouts staggered across this range |
| `cameraReassembly`          | 72–84%  | R3F camera retraces the same corridor backward |
| `lensReturn`                  | 84%+   | Camera body + filmmaker facing viewer, "Captured." |
| `flash`                         | 88%+   | White flash ramps in, then fades across the natural post-pin viewport-height gap into Hero |
| `heroReveal`                      | 100%   | Pin releases; Hero section (a normal, always-crawlable section) takes over |

A second, non-overlapping `ScrollTrigger` (`trigger: sectionRef`, `"bottom
bottom" → "bottom top"`) fades the flash out across exactly the trailing
viewport-height that GSAP's pin-spacer always reserves after a pin releases —
this keeps the cut masked in white instead of briefly showing a frozen last
frame. Reverse-scrolling reverses every scene naturally because it's all one
scrubbed timeline driving one continuous camera path.

## 5. Component responsibilities

See the file map in §1 — `intro-3d/Scene.tsx` owns the camera rig;
`Figure`/`CameraProp`/`LensInternals` each own one part of the story and read
progress independently; `CinematicIntro` owns the GSAP timeline, DOM
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

**Tuning the 3D intro:** camera framing lives in `KEYFRAMES` in
`intro-3d/Scene.tsx`; each character/prop's own motion is in its own
`useFrame` callback (`Figure.tsx`, `CameraProp.tsx`, `LensInternals.tsx`),
using `remap()`/`easeInOut()` from `intro-3d/math.ts` to carve sub-progress
windows out of the single overall 0–1 value.

## Mobile optimisation notes

- `IntroScene3D` reduces DPR (`[1, 1.5]` vs `[1, 2]`), disables shadows and
  postprocessing (bloom/vignette), and `Scene.tsx` reduces the particle count
  on screens under 768px.
- Pin distance is shorter on mobile/tablet (see the `distance` calc in
  `CinematicIntro.tsx`) so the intro doesn't overstay its welcome on a phone.
- Touch scrolling is left native (Lenis `syncTouch: false`) — no added
  smoothing lag on mobile.
- The 3D `<Canvas>` is fully unmounted once the intro finishes (or is
  skipped) to free the WebGL context and stop its render loop; it remounts
  if the visitor scrolls back up into the intro.

## Performance checklist

- [x] Portfolio images use `next/image` with `sizes` hints
- [x] `CinematicIntroLoader` dynamically imports the intro with `ssr:false`
- [x] Below-the-hero sections are plain Server Components (no client JS)
- [x] 3D scene reads scroll progress from a ref inside `useFrame` — no React
      state writes per scroll/render frame
- [x] Single draw call for dust particles (one `Points` object, buffer
      mutated directly)
- [x] DPR clamped, shadows/postprocessing disabled on mobile
- [x] 3D `<Canvas>` unmounts after the intro completes to free the WebGL context
- [x] Animations use transform/opacity/Three.js object mutation, not layout props
- [ ] Run `npm run build && npx next start` and profile with Lighthouse /
      WebPageTest on target devices — no external assets are loaded for the
      intro, but WebGL cost still varies significantly by GPU.

## Accessibility checklist

- [x] `prefers-reduced-motion` fully bypasses the pinned scroll experience
      (`ReducedMotionIntro`: static graphic, immediate headline, "Enter Site") —
      no WebGL canvas is ever mounted on that path
- [x] Visible "Skip Intro" button, keyboard operable, jumps straight to `#hero`
- [x] The 3D canvas has no ARIA role — all narrative text is real DOM text
      (readable regardless of animation/opacity state), never baked into pixels
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
      fallback, mobile viewport, replay-intro flow
- [ ] Cross-browser pass (Safari/iOS WebGL in particular)
- [ ] Real Lighthouse/CrUX pass, including WebGL-capable/incapable device split

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
one on first run). `public/images` is plain static files, so no extra
configuration is needed for a standard Next.js build.
