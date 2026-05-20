import NavBar from "../components/common/NavBar";
import HeroSection from "../components/landing/HeroSection";
import CoverShowcase from "../components/landing/CoverShowcase";
import ColorSection from "../components/landing/ColorSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import ReviewsSection from "../components/landing/ReviewsSection";

export default function HomePage() {
  return (
    <>
      <NavBar />
      <HeroSection />
      <CoverShowcase />
      <ColorSection />
      <FeaturesSection />
      <ReviewsSection />
    </>
  );
}
