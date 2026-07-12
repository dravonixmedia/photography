import { philosophy } from "@/lib/content";

export default function CreativePhilosophy() {
  return (
    <section
      id="philosophy"
      className="relative bg-ink-soft px-6 py-24 sm:px-10 sm:py-32"
    >
      <div className="grain-overlay" aria-hidden="true" />
      <div className="relative mx-auto max-w-4xl">
        <p className="mb-8 text-[0.65rem] font-medium uppercase tracking-[0.32em] text-paper/50">
          04 — Philosophy
        </p>
        <p className="text-balance font-display text-3xl font-light italic leading-tight text-paper sm:text-6xl">
          {philosophy.statement}
        </p>

        <div className="mt-14 grid grid-cols-1 gap-8 border-t border-line pt-10 sm:grid-cols-3">
          {philosophy.paragraphs.map((paragraph, i) => (
            <p key={i} className="text-sm leading-relaxed text-paper/65">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
