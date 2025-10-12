import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import CoursesSection from "./components/CoursesSection";
import TestimonialsSection from "./components/TestimonialsSection";
import CTASection from "./components/CTASection";
import Footer from "./components/Footer"; // 👈🏽 newly added

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <CoursesSection />
      <TestimonialsSection />
      <CTASection />
      <Footer /> {/* 👈🏽 Footer comes last */}
    </>
  );
}
