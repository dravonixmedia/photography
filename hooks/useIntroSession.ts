"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "reyesvisual:intro-seen";

export function readIntroSeen(): boolean {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/** Plain, non-reactive write — safe to call mid-scroll without forcing a re-render. */
export function markIntroSeen() {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // sessionStorage unavailable (private mode / disabled) — safe to ignore.
  }
}

export function clearIntroSeen() {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

function subscribe(onChange: () => void) {
  // Only fires for cross-tab sessionStorage changes; same-tab writes via
  // markIntroSeen() are intentionally not reflected back into an already
  // mounted CinematicIntro (see FullCinematicIntro) to avoid unmounting the
  // pinned scroll section mid-animation.
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function getServerSnapshot() {
  return false;
}

/**
 * Resolves whether the visitor has already sat through (or skipped) the
 * cinematic intro earlier in this browser session.
 */
export function useIntroSessionGate(): boolean {
  return useSyncExternalStore(subscribe, readIntroSeen, getServerSnapshot);
}

export function useReplayIntro() {
  return useCallback(() => {
    clearIntroSeen();
    window.scrollTo({ top: 0, behavior: "auto" });
    window.location.reload();
  }, []);
}
