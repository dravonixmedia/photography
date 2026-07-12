"use client";

import { forwardRef } from "react";

/**
 * Full-viewport white flash used to mask the cut from the cinematic intro
 * into the hero section. Rendered as a sibling of the pinned intro viewport
 * (never a descendant) so its `position: fixed` isn't captured by
 * ScrollTrigger's pin containing block.
 */
const FlashTransition = forwardRef<HTMLDivElement>(function FlashTransition(_props, ref) {
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 bg-white opacity-0"
    />
  );
});

export default FlashTransition;
