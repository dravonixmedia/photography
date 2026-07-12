import Image from "next/image";
import { site } from "@/lib/content";

const stats = [
  { label: "Years in practice", value: "11" },
  { label: "Countries shot in", value: "18" },
  { label: "Weddings & campaigns", value: "240+" },
];

export default function AboutPhotographer() {
  return (
    <section id="about" className="bg-ink px-6 py-24 sm:px-10 sm:py-32">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-ink-soft lg:col-span-5">
          <Image
            src="/images/portfolio/about-portrait.jpg"
            alt={`Portrait of ${site.name}, photographer and filmmaker`}
            fill
            sizes="(min-width: 1024px) 40vw, 90vw"
            className="object-cover"
          />
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <p className="mb-3 text-[0.65rem] font-medium uppercase tracking-[0.32em] text-paper/50">
            03 — About
          </p>
          <h2 className="max-w-xl text-balance font-display text-3xl font-light italic text-paper sm:text-5xl">
            {site.name}
          </h2>

          <div className="mt-8 flex flex-col gap-5 text-sm leading-relaxed text-paper/70 sm:text-base">
            <p>
              Julian works between stillness and motion — a photographer and filmmaker whose
              practice began in documentary reportage and grew into fashion, editorial and
              commercial storytelling without losing its instinct for the unposed moment.
            </p>
            <p>
              Based in San Francisco and shooting internationally, his work is defined by
              restraint: long observation, deliberate light and a refusal to manufacture what
              isn&apos;t already true in the room.
            </p>
          </div>

          <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-line pt-8">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-[0.6rem] font-medium uppercase tracking-[0.18em] text-paper/45">
                  {stat.label}
                </dt>
                <dd className="mt-2 font-display text-2xl italic text-paper sm:text-3xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
