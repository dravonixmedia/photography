import Image from "next/image";
import { categories } from "@/lib/content";

export default function PhotographyCategories() {
  return (
    <section id="categories" className="bg-ink">
      <div className="px-6 pb-14 pt-24 sm:px-10 sm:pt-32">
        <p className="mb-3 text-[0.65rem] font-medium uppercase tracking-[0.32em] text-paper/50">
          02 — Range
        </p>
        <h2 className="max-w-lg text-balance font-display text-3xl font-light italic text-paper sm:text-5xl">
          Photography categories
        </h2>
      </div>

      <div className="flex flex-col">
        {categories.map((category, i) => (
          <a
            key={category.slug}
            href="#selected-work"
            className="group relative flex h-[52vh] w-full items-center overflow-hidden border-t border-line first:border-t-0 sm:h-[64vh]"
          >
            <Image
              src={category.image}
              alt={`${category.title} photography by Julian Reyes`}
              fill
              sizes="100vw"
              className="object-cover opacity-70 transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-ink/45 transition-colors duration-500 group-hover:bg-ink/30" />
            <div
              className={`relative z-10 flex w-full px-6 sm:px-10 ${
                i % 2 === 1 ? "justify-end text-right" : "justify-start text-left"
              }`}
            >
              <div className="max-w-md">
                <span className="mb-3 block text-[0.65rem] font-medium uppercase tracking-[0.3em] text-paper/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-4xl font-light italic text-paper sm:text-6xl">
                  {category.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-paper/70">
                  {category.description}
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
