"use client";

import type Lenis from "lenis";
import { createContext, useContext, useRef, type RefObject } from "react";

// Held as a ref (not React state) — nav links and the Skip Intro button only
// need the current instance at click time, and reading a ref avoids a
// setState-in-effect just to publish the instance once it's constructed.
export const LenisContext = createContext<RefObject<Lenis | null> | null>(null);

export function useLenisRef(): RefObject<Lenis | null> {
  const ctx = useContext(LenisContext);
  const fallback = useRef<Lenis | null>(null);
  return ctx ?? fallback;
}

export function scrollToTarget(lenis: Lenis | null, target: string | HTMLElement, offset = 0) {
  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.4 });
    return;
  }
  const el = typeof target === "string" ? document.querySelector(target) : target;
  el?.scrollIntoView({ behavior: "smooth" });
}
