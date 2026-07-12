"use client";

import { AtSign } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, type MouseEvent } from "react";
import { gsap } from "@/lib/gsap";
import { scrollToTarget, useLenisRef } from "@/lib/lenis-context";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { site } from "@/lib/content";

export default function HeroSection() {
  const lenisRef = useLenisRef();
  const reducedMotion = useReducedMotion();
  const imageRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (reducedMotion || !sectionRef.current || !imageRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(imageRef.current, {
        yPercent: 12,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  const handleScrollTo = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    scrollToTarget(lenisRef.current, href, -20);
  };

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative flex h-screen w-full items-end overflow-hidden bg-ink"
    >
      <div ref={imageRef} className="absolute inset-0 scale-110">
        <Image
          src="/images/portfolio/hero-featured.jpg"
          alt="Featured cinematic photography by Julian Reyes"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-ink/60" />
        <div className="absolute inset-0 bg-ink/10" />
      </div>
      <div className="grain-overlay" aria-hidden="true" />

      <div className="relative z-10 flex w-full flex-col gap-10 px-6 pb-16 sm:px-10 sm:pb-20 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="mb-4 text-[0.65rem] font-medium uppercase tracking-[0.32em] text-paper/60">
            {site.studio} — Photographer &amp; Filmmaker
          </p>
          <h1 className="text-balance font-display text-5xl font-light italic leading-[1.05] text-paper sm:text-7xl">
            Stories seen differently.
          </h1>
          <p className="mt-6 max-w-md text-balance text-sm leading-relaxed text-paper/70 sm:text-base">
            Cinematic photography and visual storytelling shaped through light, emotion and
            perspective.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#selected-work"
              onClick={(e) => handleScrollTo(e, "#selected-work")}
              className="rounded-full bg-paper px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] text-ink transition hover:bg-paper/85"
            >
              View Portfolio
            </a>
            <a
              href="#contact"
              onClick={(e) => handleScrollTo(e, "#contact")}
              className="rounded-full border border-paper/40 px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] text-paper transition hover:border-paper"
            >
              Book a Session
            </a>
          </div>
        </div>

        <div className="flex items-center gap-6 lg:flex-col lg:items-end lg:gap-4">
          <a
            href={site.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-paper/70 transition hover:text-paper"
          >
            <AtSign size={16} aria-hidden="true" />
            Instagram
          </a>
          <a
            href="#selected-work"
            onClick={(e) => handleScrollTo(e, "#selected-work")}
            className="flex flex-col items-center gap-2 text-[0.6rem] font-medium uppercase tracking-[0.28em] text-paper/50 transition hover:text-paper/80"
          >
            <span className="hidden lg:block">Scroll</span>
            <span className="h-10 w-px animate-pulse bg-paper/40" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
