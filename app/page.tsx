import AboutPhotographer from "@/components/AboutPhotographer";
import AwardsPublications from "@/components/AwardsPublications";
import BehindTheScenes from "@/components/BehindTheScenes";
import BookingCTA from "@/components/BookingCTA";
import CinematicIntro from "@/components/CinematicIntroLoader";
import ContactSection from "@/components/ContactSection";
import CreativePhilosophy from "@/components/CreativePhilosophy";
import FeaturedProjects from "@/components/FeaturedProjects";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import PhotographyCategories from "@/components/PhotographyCategories";
import SelectedWork from "@/components/SelectedWork";
import Testimonials from "@/components/Testimonials";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main-content">
        <CinematicIntro />
        <HeroSection />
        <SelectedWork />
        <PhotographyCategories />
        <AboutPhotographer />
        <CreativePhilosophy />
        <FeaturedProjects />
        <Testimonials />
        <BehindTheScenes />
        <AwardsPublications />
        <BookingCTA />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
