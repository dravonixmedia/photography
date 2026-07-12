import Image from "next/image";
import { selectedWork } from "@/lib/content";

export default function SelectedWork() {
  return (
    <section id="selected-work" className="bg-ink px-6 py-24 sm:px-10 sm:py-32">
      <div className="mb-16 flex flex-col gap-4 sm:mb-24 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-3 text-[0.65rem] font-medium uppercase tracking-[0.32em] text-paper/50">
            01 — Portfolio
          </p>
          <h2 className="max-w-lg text-balance font-display text-3xl font-light italic text-paper sm:text-5xl">
            Selected work
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-paper/60">
          A running collection of frames chosen not for the moment they document, but for the
          feeling they still carry.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-6">
        {selectedWork.map((work, i) => {
          const spanClass =
            work.orientation === "portrait"
              ? "lg:col-span-2 lg:row-span-2"
              : "lg:col-span-4";
          const aspect = work.orientation === "portrait" ? "aspect-[4/5]" : "aspect-[16/10]";
          const offset = i % 3 === 1 ? "sm:mt-14" : "";

          return (
            <article key={work.title} className={`group ${spanClass} ${offset}`}>
              <div className={`relative w-full overflow-hidden bg-ink-soft ${aspect}`}>
                <Image
                  src={work.image}
                  alt={`${work.title} — ${work.category} photography by Julian Reyes`}
                  fill
                  sizes="(min-width: 1024px) 45vw, 90vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-4">
                <h3 className="font-display text-lg italic text-paper">{work.title}</h3>
                <span className="whitespace-nowrap text-[0.65rem] uppercase tracking-[0.18em] text-paper/45">
                  {work.category} — {work.year}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
