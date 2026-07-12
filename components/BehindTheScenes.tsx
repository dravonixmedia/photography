import Image from "next/image";
import { behindTheScenes } from "@/lib/content";

export default function BehindTheScenes() {
  return (
    <section id="behind-the-scenes" className="bg-ink px-6 py-24 sm:px-10 sm:py-32">
      <div className="mb-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-3 text-[0.65rem] font-medium uppercase tracking-[0.32em] text-paper/50">
            07 — Journal
          </p>
          <h2 className="max-w-lg text-balance font-display text-3xl font-light italic text-paper sm:text-5xl">
            Behind the scenes
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-paper/60">
          Notes and frames from set — the scouting, the waiting, the light before the light was
          right.
        </p>
      </div>

      <div className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4">
        {behindTheScenes.map((item) => (
          <figure
            key={item.image}
            className="w-[80vw] shrink-0 snap-start sm:w-[50vw] lg:w-[38vw]"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-soft">
              <Image
                src={item.image}
                alt={item.caption}
                fill
                sizes="(min-width: 1024px) 38vw, 80vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-3 text-xs uppercase tracking-[0.14em] text-paper/50">
              {item.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
