import { AtSign, Mail, MapPin, Phone } from "lucide-react";
import { site } from "@/lib/content";

export default function ContactSection() {
  return (
    <section id="contact" className="bg-ink px-6 py-24 sm:px-10 sm:py-32">
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <p className="mb-3 text-[0.65rem] font-medium uppercase tracking-[0.32em] text-paper/50">
            09 — Contact
          </p>
          <h2 className="max-w-md text-balance font-display text-3xl font-light italic text-paper sm:text-5xl">
            Tell me about your story.
          </h2>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-paper/65">
            For bookings, collaborations and press enquiries, reach out directly or fill in the
            form. I typically reply within two business days.
          </p>

          <ul className="mt-10 flex flex-col gap-4 text-sm text-paper/75">
            <li className="flex items-center gap-3">
              <Mail size={16} className="text-paper/45" aria-hidden="true" />
              <a href={`mailto:${site.email}`} className="hover:text-paper">
                {site.email}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={16} className="text-paper/45" aria-hidden="true" />
              <a href={`tel:${site.phone.replace(/[^+\d]/g, "")}`} className="hover:text-paper">
                {site.phone}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <MapPin size={16} className="text-paper/45" aria-hidden="true" />
              <span>{site.location}</span>
            </li>
            <li className="flex items-center gap-3">
              <AtSign size={16} className="text-paper/45" aria-hidden="true" />
              <a
                href={site.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-paper"
              >
                @reyesvisual
              </a>
            </li>
          </ul>
        </div>

        <form
          action={`mailto:${site.email}`}
          method="post"
          encType="text/plain"
          className="flex flex-col gap-6 lg:col-span-6 lg:col-start-7"
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.14em] text-paper/50">
              Name
              <input
                type="text"
                name="name"
                required
                autoComplete="name"
                className="border-b border-line bg-transparent py-2 text-base normal-case tracking-normal text-paper outline-none focus-visible:border-paper"
              />
            </label>
            <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.14em] text-paper/50">
              Email
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                className="border-b border-line bg-transparent py-2 text-base normal-case tracking-normal text-paper outline-none focus-visible:border-paper"
              />
            </label>
          </div>
          <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.14em] text-paper/50">
            Project type
            <input
              type="text"
              name="project_type"
              placeholder="Wedding, fashion, commercial…"
              className="border-b border-line bg-transparent py-2 text-base normal-case tracking-normal text-paper placeholder:text-paper/30 outline-none focus-visible:border-paper"
            />
          </label>
          <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.14em] text-paper/50">
            Message
            <textarea
              name="message"
              required
              rows={4}
              className="resize-none border-b border-line bg-transparent py-2 text-base normal-case tracking-normal text-paper outline-none focus-visible:border-paper"
            />
          </label>
          <button
            type="submit"
            className="mt-2 w-fit rounded-full bg-paper px-7 py-3 text-xs font-medium uppercase tracking-[0.2em] text-ink transition hover:bg-paper/85"
          >
            Send Enquiry
          </button>
        </form>
      </div>
    </section>
  );
}
