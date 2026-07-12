import { awards } from "@/lib/content";

export default function AwardsPublications() {
  return (
    <section id="awards" className="bg-ink-soft px-6 py-24 sm:px-10 sm:py-32">
      <p className="mb-3 text-[0.65rem] font-medium uppercase tracking-[0.32em] text-paper/50">
        08 — Recognition
      </p>
      <h2 className="max-w-lg text-balance font-display text-3xl font-light italic text-paper sm:text-5xl">
        Awards &amp; publications
      </h2>

      <ul className="mt-14 divide-y divide-line border-y border-line">
        {awards.map((award) => (
          <li
            key={award.title}
            className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:py-6"
          >
            <span className="font-display text-lg italic text-paper sm:text-xl">
              {award.title}
            </span>
            <span className="text-xs uppercase tracking-[0.16em] text-paper/50">
              {award.note} — {award.year}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
