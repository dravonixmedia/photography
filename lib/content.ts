export const site = {
  name: "Julian Reyes",
  studio: "Reyes Visual",
  tagline: "Stories Seen Differently",
  description:
    "Cinematic photography and visual storytelling shaped through light, emotion and perspective. Julian Reyes is a photographer and filmmaker working across weddings, fashion, editorial and commercial projects.",
  url: "https://www.reyesvisual.com",
  email: "studio@reyesvisual.com",
  phone: "+1 (415) 555-0148",
  location: "San Francisco, CA — available worldwide",
  instagram: "https://instagram.com/reyesvisual",
  vimeo: "https://vimeo.com/reyesvisual",
} as const;

export const navLinks = [
  { label: "Work", href: "#selected-work" },
  { label: "Categories", href: "#categories" },
  { label: "About", href: "#about" },
  { label: "Philosophy", href: "#philosophy" },
  { label: "Journal", href: "#behind-the-scenes" },
  { label: "Contact", href: "#contact" },
] as const;

export const technicalFeatures = [
  {
    id: "full-frame",
    label: "Full-Frame Cinematic Imaging",
    description: "A full-frame sensor built for depth, dynamic range and shallow, painterly focus.",
  },
  {
    id: "4k-video",
    label: "Professional 4K Video Capture",
    description: "Broadcast-grade motion footage with rich colour depth for every frame.",
  },
  {
    id: "autofocus",
    label: "Advanced Autofocus Tracking",
    description: "Precise subject tracking that keeps fleeting, emotional moments in perfect focus.",
  },
  {
    id: "stabilisation",
    label: "In-Body Image Stabilisation",
    description: "Steady handheld motion, even in low light or fast-moving environments.",
  },
  {
    id: "colour",
    label: "Cinematic Colour Reproduction",
    description: "Colour science tuned for skin tone accuracy and mood-driven grading.",
  },
  {
    id: "low-light",
    label: "Excellent Low-Light Performance",
    description: "Clean, controlled imagery in the quiet, dim moments that carry the most feeling.",
  },
  {
    id: "audio",
    label: "Professional Audio Integration",
    description: "Studio-grade audio inputs for films where sound matters as much as image.",
  },
  {
    id: "recording",
    label: "Reliable Extended Recording",
    description: "Built for long-form coverage — from vows exchanged to full runway shows.",
  },
] as const;

export const categories = [
  {
    slug: "weddings",
    title: "Weddings",
    description: "Unscripted emotion, quiet vows and the long light of one irreplaceable day.",
    image: "/images/portfolio/weddings-01.jpg",
  },
  {
    slug: "fashion",
    title: "Fashion",
    description: "Movement, texture and silhouette staged for editorial impact.",
    image: "/images/portfolio/fashion-01.jpg",
  },
  {
    slug: "commercial",
    title: "Commercial",
    description: "Brand storytelling built for campaigns that need to hold a room.",
    image: "/images/portfolio/commercial-01.jpg",
  },
  {
    slug: "portraits",
    title: "Portraits",
    description: "Character studies rendered in restrained, deliberate light.",
    image: "/images/portfolio/portraits-01.jpg",
  },
  {
    slug: "editorial",
    title: "Editorial",
    description: "Concept-driven imagery made for the printed page.",
    image: "/images/portfolio/editorial-01.jpg",
  },
  {
    slug: "films",
    title: "Films",
    description: "Short-form visual stories shot with the same eye as the stills.",
    image: "/images/portfolio/films-01.jpg",
  },
] as const;

export const selectedWork = [
  { title: "Low Tide", category: "Editorial", year: "2025", image: "/images/portfolio/editorial-01.jpg", orientation: "landscape" },
  { title: "Vera & Noah", category: "Weddings", year: "2025", image: "/images/portfolio/weddings-01.jpg", orientation: "portrait" },
  { title: "Marbled Light", category: "Fashion", year: "2024", image: "/images/portfolio/fashion-01.jpg", orientation: "portrait" },
  { title: "Field Notes", category: "Commercial", year: "2024", image: "/images/portfolio/commercial-01.jpg", orientation: "landscape" },
  { title: "Quiet Hour", category: "Portraits", year: "2024", image: "/images/portfolio/portraits-02.jpg", orientation: "portrait" },
  { title: "Second Skin", category: "Fashion", year: "2023", image: "/images/portfolio/fashion-02.jpg", orientation: "landscape" },
  { title: "The Long Aisle", category: "Weddings", year: "2023", image: "/images/portfolio/weddings-02.jpg", orientation: "landscape" },
  { title: "Paper Trail", category: "Editorial", year: "2023", image: "/images/portfolio/editorial-02.jpg", orientation: "portrait" },
] as const;

export const featuredProjects = [
  {
    title: "Nightfall — Aurelio S/S26",
    description:
      "A three-day fashion film and stills campaign shot between coastal warehouses and open water, built around the quiet drama of artificial light against dusk.",
    tags: ["Fashion", "Film", "Campaign"],
    image: "/images/portfolio/featured-01.jpg",
    year: "2025",
  },
  {
    title: "Held — A Wedding Film",
    description:
      "A single-day wedding coverage designed around restraint: long lenses, natural light and a refusal to interrupt anything that happened only once.",
    tags: ["Weddings", "Documentary"],
    image: "/images/portfolio/featured-02.jpg",
    year: "2024",
  },
] as const;

export const testimonials = [
  {
    quote:
      "Julian sees the moment before it happens. Every frame from our day feels like it was waiting to be found, not staged.",
    name: "Vera Lindqvist",
    role: "Bride, Vera & Noah",
  },
  {
    quote:
      "The campaign didn't feel like a shoot — it felt like a set. Every image could run full-page without a single crop.",
    name: "Marcus Idris",
    role: "Creative Director, Aurelio",
  },
  {
    quote:
      "Rare to find someone equally fluent in stills and motion. The film and the photographs told the same story in two languages.",
    name: "Priya Chandran",
    role: "Brand Lead, Field Studio",
  },
] as const;

export const behindTheScenes = [
  { image: "/images/portfolio/bts-01.jpg", caption: "Location scouting, coastal warehouse district" },
  { image: "/images/portfolio/bts-02.jpg", caption: "Lighting setup between takes" },
  { image: "/images/portfolio/about-portrait.jpg", caption: "On set, first light" },
] as const;

export const awards = [
  { title: "International Photography Awards", note: "Finalist, Fashion", year: "2025" },
  { title: "PDN Annual", note: "Selected, Wedding Story", year: "2024" },
  { title: "It's Nice That", note: "Featured Photographer", year: "2024" },
  { title: "Kinfolk Weddings", note: "Published Feature", year: "2023" },
  { title: "AI-AP Portfolio", note: "Selected, New Talent", year: "2022" },
] as const;

export const philosophy = {
  statement: "Light first. Story always.",
  paragraphs: [
    "Every project begins the same way — in silence, watching before deciding anything should be photographed at all. The camera only comes up once the light and the moment agree.",
    "I work in restraint. Fewer set-ups, longer observation, and a refusal to manufacture emotion that isn't already in the room. What's real reads as real.",
    "Whether the format is a single portrait or a three-day campaign, the goal is the same: an image that still means something once the context around it is gone.",
  ],
} as const;
