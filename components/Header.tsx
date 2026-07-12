"use client";

import { AtSign, Menu, RotateCcw, X } from "lucide-react";
import { useEffect, useState, type MouseEvent } from "react";
import { scrollToTarget, useLenisRef } from "@/lib/lenis-context";
import { useIntroProgress } from "@/lib/intro-progress-context";
import { navLinks, site } from "@/lib/content";
import { useIntroSessionGate, useReplayIntro } from "@/hooks/useIntroSession";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export default function Header() {
  const lenisRef = useLenisRef();
  const reducedMotion = useReducedMotion();
  const hasSeenIntro = useIntroSessionGate();
  const { scrolledPastIntro } = useIntroProgress();
  const replayIntro = useReplayIntro();

  // Navigation stays hidden for the duration of the full cinematic intro
  // (reduced-motion and returning-visitor paths skip the intro entirely, so
  // nav is available immediately in those cases).
  const navVisible = reducedMotion || hasSeenIntro || scrolledPastIntro;

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    scrollToTarget(lenisRef.current, href, -20);
    setMenuOpen(false);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-opacity duration-700 ${
        navVisible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="flex items-center justify-between px-6 py-5 sm:px-10">
        <a
          href="#hero"
          onClick={(e) => handleNavClick(e, "#hero")}
          className="font-display text-lg italic tracking-wide text-paper"
        >
          {site.studio}
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-xs font-medium uppercase tracking-[0.18em] text-paper/75 transition hover:text-paper"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-5 md:flex">
          {hasSeenIntro && (
            <button
              type="button"
              onClick={replayIntro}
              className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-paper/60 transition hover:text-paper"
            >
              <RotateCcw size={13} aria-hidden="true" />
              Replay Intro
            </button>
          )}
          <a
            href={site.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Reyes Visual on Instagram"
            className="text-paper/75 transition hover:text-paper"
          >
            <AtSign size={18} />
          </a>
          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, "#contact")}
            className="rounded-full border border-paper/30 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-paper transition hover:border-paper"
          >
            Book a Session
          </a>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="text-paper md:hidden"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div
        id="mobile-nav"
        className={`fixed inset-0 top-0 flex h-screen w-screen flex-col justify-center gap-8 bg-ink px-10 transition-opacity duration-300 md:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={(e) => handleNavClick(e, link.href)}
            className="font-display text-3xl italic text-paper"
          >
            {link.label}
          </a>
        ))}
        <div className="mt-6 flex items-center gap-6">
          <a
            href={site.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Reyes Visual on Instagram"
            className="text-paper/75"
          >
            <AtSign size={20} />
          </a>
          {hasSeenIntro && (
            <button
              type="button"
              onClick={replayIntro}
              className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-paper/70"
            >
              <RotateCcw size={14} aria-hidden="true" />
              Replay Intro
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
