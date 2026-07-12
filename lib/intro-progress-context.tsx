"use client";

import { createContext, useContext } from "react";

type IntroProgressContextValue = {
  /** True once the cinematic intro's pinned section has been scrolled past. */
  scrolledPastIntro: boolean;
  setScrolledPastIntro: (value: boolean) => void;
};

export const IntroProgressContext = createContext<IntroProgressContextValue>({
  scrolledPastIntro: false,
  setScrolledPastIntro: () => {},
});

export function useIntroProgress() {
  return useContext(IntroProgressContext);
}
