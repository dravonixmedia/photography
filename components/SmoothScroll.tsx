"use client";

import Lenis from "lenis";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { LenisContext } from "@/lib/lenis-context";
import { IntroProgressContext } from "@/lib/intro-progress-context";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);
  const [scrolledPastIntro, setScrolledPastIntro] = useState(false);
  const introProgressValue = useMemo(
    () => ({ scrolledPastIntro, setScrolledPastIntro }),
    [scrolledPastIntro]
  );

  useEffect(() => {
    if (reducedMotion) {
      // Respect the OS preference: leave native scrolling untouched.
      return;
    }

    const instance = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1,
      touchMultiplier: 1,
      syncTouch: false,
    });

    lenisRef.current = instance;

    const onScroll = () => ScrollTrigger.update();
    instance.on("scroll", onScroll);

    const tickerCallback = (time: number) => {
      instance.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCallback);
      instance.off("scroll", onScroll);
      instance.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

  return (
    <LenisContext.Provider value={lenisRef}>
      <IntroProgressContext.Provider value={introProgressValue}>
        {children}
      </IntroProgressContext.Provider>
    </LenisContext.Provider>
  );
}
