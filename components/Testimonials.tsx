import { testimonials } from "@/lib/content";

export default function Testimonials() {
  return (
    <section id="testimonials" className="bg-ink-soft px-6 py-24 sm:px-10 sm:py-32">
      <p className="mb-3 text-[0.65rem] font-medium uppercase tracking-[0.32em] text-paper/50">
        06 — Words
      </p>
      <h2 className="max-w-lg text-balance font-display text-3xl font-light italic text-paper sm:text-5xl">
        Client testimonials
      </h2>

      <div className="no-scrollbar mt-16 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 sm:mt-20">
        {testimonials.map((testimonial) => (
          <figure
            key={testimonial.name}
            className="flex w-[85vw] shrink-0 snap-start flex-col justify-between gap-10 border border-line p-8 sm:w-[45vw] sm:p-10 lg:w-[32vw]"
          >
            <blockquote className="text-balance font-display text-xl font-light italic leading-snug text-paper sm:text-2xl">
              &ldquo;{testimonial.quote}&rdquo;
            </blockquote>
            <figcaption>
              <p className="text-sm text-paper">{testimonial.name}</p>
              <p className="text-xs uppercase tracking-[0.14em] text-paper/45">
                {testimonial.role}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
