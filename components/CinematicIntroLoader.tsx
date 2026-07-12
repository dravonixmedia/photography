"use client";

import dynamic from "next/dynamic";

// The cinematic intro is heavy (GSAP + ScrollTrigger + canvas frame decoding)
// and purely decorative, so it's excluded from the server render and mounted
// client-side only. `ssr: false` requires a Client Component boundary, hence
// this thin wrapper around the actual next/dynamic call.
const CinematicIntro = dynamic(() => import("@/components/CinematicIntro"), {
  ssr: false,
});

export default CinematicIntro;
