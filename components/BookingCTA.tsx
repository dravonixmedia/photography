export default function BookingCTA() {
  return (
    <section id="booking" className="relative overflow-hidden bg-ink px-6 py-28 text-center sm:px-10 sm:py-40">
      <div className="grain-overlay" aria-hidden="true" />
      <div className="relative mx-auto flex max-w-3xl flex-col items-center">
        <p className="mb-6 text-[0.65rem] font-medium uppercase tracking-[0.32em] text-paper/50">
          Availability — 2026 season
        </p>
        <p className="text-balance font-display text-4xl font-light italic leading-tight text-paper sm:text-6xl">
          Let&rsquo;s make something worth remembering.
        </p>
        <a
          href="#contact"
          className="mt-10 rounded-full bg-paper px-8 py-4 text-xs font-medium uppercase tracking-[0.2em] text-ink transition hover:bg-paper/85"
        >
          Book a Session
        </a>
      </div>
    </section>
  );
}
