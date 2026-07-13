"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { scrollToTarget, useLenisRef } from "@/lib/lenis-context";
import { useIntroProgress } from "@/lib/intro-progress-context";
import { markIntroSeen, readIntroSeen } from "@/hooks/useIntroSession";
import { readReducedMotion } from "@/hooks/useReducedMotion";
import { technicalFeatures } from "@/lib/content";
import FlashTransition from "./FlashTransition";
import IntroLoadingScreen from "./IntroLoadingScreen";
import IntroScene3D from "./IntroScene3D";
import TechnicalFeature from "./TechnicalFeature";

export default function CinematicIntro() {
  // This component is only ever mounted client-side (see
  // CinematicIntroLoader's `ssr: false`), so there's no server-rendered HTML
  // to reconcile against — it's safe to decide which experience to show
  // exactly once, synchronously, on first render, and never reconsider.
  // That matters because later in the session `markIntroSeen()` flips
  // sessionStorage: if this decision were reactive, the resulting re-render
  // would unmount FullCinematicIntro (and its ScrollTrigger pin) out from
  // under the visitor mid-scroll.
  const [{ reducedMotion, hasSeenIntro }] = useState(() => ({
    reducedMotion: readReducedMotion(),
    hasSeenIntro: readIntroSeen(),
  }));

  if (hasSeenIntro) {
    return null;
  }

  if (reducedMotion) {
    return <ReducedMotionIntro />;
  }

  return <FullCinematicIntro />;
}

function StaticCameraGlyph() {
  return (
    <svg
      viewBox="0 0 200 140"
      className="h-28 w-auto text-paper/25 sm:h-36"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      aria-hidden="true"
    >
      <rect x="20" y="35" width="130" height="80" rx="8" />
      <rect x="65" y="18" width="40" height="20" rx="3" />
      <circle cx="80" cy="76" r="34" />
      <circle cx="80" cy="76" r="20" />
      <circle cx="150" cy="52" r="5" />
    </svg>
  );
}

function ReducedMotionIntro() {
  const lenisRef = useLenisRef();

  // Intentionally not marked "seen" on mount: writing sessionStorage here
  // would flip this component's own useIntroSessionGate() snapshot and
  // React would immediately unmount this section in favour of `null` on the
  // very next render (useSyncExternalStore re-validates on every commit).
  // Marking it on the deliberate "Enter Site" click keeps the static
  // fallback stable while it's actually being shown.
  const handleEnter = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    markIntroSeen();
    scrollToTarget(lenisRef.current, "#hero");
  };

  return (
    <section className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-ink">
      <div
        className="absolute inset-0 [background:radial-gradient(60%_50%_at_50%_38%,rgba(245,242,234,0.08),transparent_70%)]"
        aria-hidden="true"
      />
      <div className="grain-overlay" aria-hidden="true" />
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        <StaticCameraGlyph />
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-paper/60">
          Reyes Visual
        </p>
        <p className="max-w-3xl text-balance font-display text-4xl font-light italic text-paper sm:text-6xl">
          Stories seen differently.
        </p>
        <a
          href="#hero"
          onClick={handleEnter}
          className="mt-2 rounded-full border border-paper/40 px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] text-paper transition hover:border-paper hover:bg-paper hover:text-ink focus-visible:outline-2 focus-visible:outline-paper"
        >
          Enter Site
        </a>
      </div>
    </section>
  );
}

function FullCinematicIntro() {
  const lenisRef = useLenisRef();
  const { setScrolledPastIntro } = useIntroProgress();
  const introFinishedRef = useRef(false);

  const sectionRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const sceneProgressRef = useRef(0);

  const headline1Ref = useRef<HTMLParagraphElement | null>(null);
  const headline2Ref = useRef<HTMLParagraphElement | null>(null);
  const headline3Ref = useRef<HTMLParagraphElement | null>(null);
  const techHeadlineRef = useRef<HTMLParagraphElement | null>(null);
  const featureRefs = useRef<Array<HTMLDivElement | null>>([]);
  const flashRef = useRef<HTMLDivElement | null>(null);

  const [isMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  const [sceneReady, setSceneReady] = useState(false);
  const [sceneMounted, setSceneMounted] = useState(true);
  const [skipVisible, setSkipVisible] = useState(true);

  const handleSceneReady = useCallback(() => setSceneReady(true), []);

  useEffect(() => {
    if (!sectionRef.current || !pinRef.current) return;

    const ctx = gsap.context(() => {
      const width = window.innerWidth;
      const distance = width < 768 ? 4200 : width < 1280 ? 6800 : 8400;

      gsap.set(
        [headline1Ref.current, headline2Ref.current, headline3Ref.current, techHeadlineRef.current],
        { autoAlpha: 0, y: 16 }
      );
      gsap.set(featureRefs.current, { autoAlpha: 0, y: 10 });
      gsap.set(flashRef.current, { autoAlpha: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: `+=${distance}`,
          scrub: 1,
          pin: pinRef.current,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const finished = self.progress > 0.995;
            if (finished !== introFinishedRef.current) {
              introFinishedRef.current = finished;
              setScrolledPastIntro(finished);
              setSkipVisible(!finished);
              setSceneMounted(!finished);
              if (finished) markIntroSeen();
            }
          },
        },
      });

      // Single normalised 0–1 value (eased by the same scrub as everything
      // else on this timeline) drives the entire live 3D scene — see
      // intro-3d/Scene.tsx for how it's carved into per-beat sub-progress.
      const sceneProgress = { v: 0 };
      tl.to(
        sceneProgress,
        { v: 1, duration: 100, onUpdate: () => { sceneProgressRef.current = sceneProgress.v; } },
        0
      );

      // ---- Scenes 1–2: darkness -> approach -> camera reveal (0–35) ----
      tl.addLabel("darkness", 0);
      tl.to(headline1Ref.current, { autoAlpha: 1, y: 0, duration: 5 }, 2).to(
        headline1Ref.current,
        { autoAlpha: 0, y: -12, duration: 4 },
        14
      );

      tl.addLabel("approach", 8);
      tl.addLabel("cameraReveal", 20);

      tl.to(headline2Ref.current, { autoAlpha: 1, y: 0, duration: 5 }, 22).to(
        headline2Ref.current,
        { autoAlpha: 0, y: -12, duration: 4 },
        31
      );

      // ---- Scene 3: lens rotation + zoom (35–50) ----
      tl.addLabel("lensZoom", 35);

      // ---- Scene 4: inside the camera + technical features (50–72) ----
      tl.addLabel("insideCamera", 50);

      tl.to(techHeadlineRef.current, { autoAlpha: 1, y: 0, duration: 3 }, 51).to(
        techHeadlineRef.current,
        { autoAlpha: 0, duration: 2 },
        69
      );

      tl.addLabel("technicalFeatures", 52);
      const featureSpan = 18; // labels occupy scroll 52 -> 70
      const step = featureSpan / technicalFeatures.length;
      featureRefs.current.forEach((el, i) => {
        const start = 52 + i * step;
        tl.to(el, { autoAlpha: 1, y: 0, duration: step * 0.5 }, start).to(
          el,
          { autoAlpha: 0, y: -8, duration: step * 0.35 },
          start + step * 0.65
        );
      });

      // ---- Scene 5: reassembly (72–84) — the 3D scene's camera simply
      // retraces the internals corridor in reverse (see Scene.tsx keyframes) ----
      tl.addLabel("cameraReassembly", 72);

      // ---- Scene 5b/6: lens return + flash (84–100) ----
      tl.addLabel("lensReturn", 84);

      tl.to(headline3Ref.current, { autoAlpha: 1, y: 0, duration: 3 }, 86).to(
        headline3Ref.current,
        { autoAlpha: 0, duration: 2 },
        91
      );

      // Ramps to fully opaque and *holds* — it does not fade out inside this
      // timeline. GSAP's pin-spacer always gives the pinned element back its
      // own natural (h-screen) height immediately after the pin releases,
      // so there's exactly one further viewport-height of ordinary,
      // un-scrubbed scrolling before Hero begins. A second ScrollTrigger
      // below — scoped to precisely that trailing viewport-height via
      // "bottom bottom" -> "bottom top" on this same section, i.e. a range
      // that starts exactly where this timeline's pin ends — fades the
      // flash out across it, so the handoff into Hero stays masked in white
      // instead of briefly showing the frozen last frame scrolling past.
      // The two triggers' active ranges never overlap, so they never fight.
      tl.addLabel("flash", 88);
      tl.to(flashRef.current, { autoAlpha: 1, duration: 12, ease: "power2.in" }, 88);

      tl.addLabel("heroReveal", 100);

      gsap.to(flashRef.current, {
        autoAlpha: 0,
        ease: "power1.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "bottom bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [setScrolledPastIntro]);

  useEffect(() => {
    if (!sceneReady) return;
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [sceneReady]);

  const handleSkip = useCallback(() => {
    gsap.set(flashRef.current, { autoAlpha: 0 });
    markIntroSeen();
    setScrolledPastIntro(true);
    introFinishedRef.current = true;
    setSkipVisible(false);
    setSceneMounted(false);
    setSceneReady(true); // dismiss the loader immediately if it was still waiting on the 3D scene

    const heroEl = document.getElementById("hero");
    if (lenisRef.current) {
      lenisRef.current.scrollTo(heroEl ?? window.innerHeight * 10, { immediate: true });
    } else if (heroEl) {
      heroEl.scrollIntoView();
    } else {
      window.scrollTo({ top: window.innerHeight * 10 });
    }
  }, [lenisRef, setScrolledPastIntro]);

  return (
    <section id="cinematic-intro" ref={sectionRef} className="relative">
      <div ref={pinRef} className="relative h-screen w-screen overflow-hidden bg-ink">
        {sceneMounted && (
          <IntroScene3D
            progressRef={sceneProgressRef}
            isMobile={isMobile}
            onReady={handleSceneReady}
          />
        )}

        <div className="grain-overlay" aria-hidden="true" />

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
          <p
            ref={headline1Ref}
            className="max-w-3xl text-balance text-center font-display text-3xl font-light italic text-paper opacity-0 sm:text-5xl"
          >
            Every story begins in the dark.
          </p>
        </div>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
          <p
            ref={headline2Ref}
            className="max-w-3xl text-balance text-center font-display text-3xl font-light italic text-paper opacity-0 sm:text-5xl"
          >
            Until vision finds its frame.
          </p>
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-[13%] flex justify-center px-6">
          <p
            ref={techHeadlineRef}
            className="max-w-xl text-balance text-center text-xs font-medium uppercase tracking-[0.3em] text-paper/70 opacity-0 sm:text-sm"
          >
            Technology built to capture emotion.
          </p>
        </div>

        {technicalFeatures.map((feature, i) => (
          <TechnicalFeature
            key={feature.id}
            ref={(el) => {
              featureRefs.current[i] = el;
            }}
            index={i}
            label={feature.label}
            description={feature.description}
          />
        ))}

        <div className="pointer-events-none absolute inset-0 flex items-end justify-center px-6 pb-[16%]">
          <p
            ref={headline3Ref}
            className="max-w-2xl text-balance text-center font-display text-2xl font-light italic text-paper opacity-0 sm:text-4xl"
          >
            Captured.
          </p>
        </div>

        {skipVisible && (
          <button
            type="button"
            onClick={handleSkip}
            className="absolute bottom-6 right-6 z-50 rounded-full border border-paper/25 bg-ink/40 px-4 py-2 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-paper/80 backdrop-blur-sm transition hover:border-paper/60 hover:text-paper focus-visible:outline-2 focus-visible:outline-paper sm:bottom-8 sm:right-8"
          >
            Skip Intro
          </button>
        )}
      </div>

      <FlashTransition ref={flashRef} />
      <IntroLoadingScreen visible={!sceneReady} />
    </section>
  );
}
