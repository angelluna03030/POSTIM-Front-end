import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import FormatsSection from "@/components/FormatsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import Testimonials from "@/components/Testimonial";
import { VideoSection } from "@/components/Video";
import { useSeo } from "@/hooks/use-seo";

const Index = () => {
  useSeo({
    title: "POSTIM: Mockups para Instagram gratis, en 3D y video",
    description:
      "Crea mockups para Instagram en segundos: celulares, tablets y laptops con fondos, textos estilo iOS, vista 3D y video. Medidas exactas para feed, stories y reels. Gratis y sin marca de agua.",
    path: "/",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <VideoSection />
        <FormatsSection />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
