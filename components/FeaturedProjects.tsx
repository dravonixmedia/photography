import Image from "next/image";
import { featuredProjects } from "@/lib/content";

export default function FeaturedProjects() {
  return (
    <section id="featured-projects" className="bg-ink px-6 py-24 sm:px-10 sm:py-32">
      <p className="mb-3 text-[0.65rem] font-medium uppercase tracking-[0.32em] text-paper/50">
        05 — Case Studies
      </p>
      <h2 className="max-w-lg text-balance font-display text-3xl font-light italic text-paper sm:text-5xl">
        Featured projects
      </h2>

      <div className="mt-16 flex flex-col gap-24 sm:mt-24 sm:gap-32">
        {featuredProjects.map((project, i) => (
          <article
            key={project.title}
            className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10"
          >
            <div
              className={`relative aspect-[16/10] w-full overflow-hidden bg-ink-soft lg:col-span-8 ${
                i % 2 === 1 ? "lg:order-2" : ""
              }`}
            >
              <Image
                src={project.image}
                alt={project.title}
                fill
                sizes="(min-width: 1024px) 65vw, 90vw"
                className="object-cover"
              />
            </div>
            <div className={`lg:col-span-4 ${i % 2 === 1 ? "lg:order-1" : ""}`}>
              <span className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-paper/45">
                {project.year} — {project.tags.join(" · ")}
              </span>
              <h3 className="mt-4 text-balance font-display text-2xl italic text-paper sm:text-3xl">
                {project.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-paper/65">{project.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
