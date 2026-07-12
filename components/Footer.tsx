import { AtSign } from "lucide-react";
import { navLinks, site } from "@/lib/content";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-ink px-6 py-14 sm:px-10">
      <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-display text-2xl italic text-paper">{site.studio}</p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-paper/55">
            Cinematic photography and visual storytelling, based in San Francisco — available
            worldwide.
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs font-medium uppercase tracking-[0.16em] text-paper/60 hover:text-paper"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex flex-col gap-3 text-sm text-paper/60">
          <a href={`mailto:${site.email}`} className="hover:text-paper">
            {site.email}
          </a>
          <a
            href={site.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-paper"
          >
            <AtSign size={14} aria-hidden="true" />
            Instagram
          </a>
        </div>
      </div>

      <div className="mt-14 flex flex-col-reverse items-start justify-between gap-4 border-t border-line pt-6 text-xs text-paper/40 sm:flex-row sm:items-center">
        <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
        <a href="#hero" className="uppercase tracking-[0.16em] hover:text-paper/70">
          Back to top
        </a>
      </div>
    </footer>
  );
}
