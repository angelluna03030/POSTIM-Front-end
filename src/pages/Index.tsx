import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import StatsSection from "../components/StatsSection";
import FeaturesSection from "../components/FeaturesSection";
import HowItWorksSection from "../components/HowItWorksSection";
import FormatsSection from "../components/FormatsSection";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";
import Testimonials from "@/components/Testimonial";
import { VideoSection } from "@/components/Video";

import { Formatos } from "@/components/Formatos";


const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
            <VideoSection />
      <FormatsSection />
        <Testimonials/>
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
