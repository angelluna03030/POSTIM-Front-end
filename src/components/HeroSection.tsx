import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import DecorativeDots from "./DecorativeDots";
import heroMockup from "@/assets/hero-mockup.png";


const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Floating decorative elements */}
<div className="absolute top-24 left-8 w-3 h-3 rounded-full bg-instagram-purple animate-pulse-dot" />
<div className="absolute top-40 left-32 w-2 h-2 rounded-full bg-instagram-yellow animate-pulse-dot" style={{ animationDelay: "0.5s" }} />
<div className="absolute top-28 right-1/3 w-3 h-3 rounded-full bg-instagram-pink animate-pulse-dot" style={{ animationDelay: "1s" }} />
<div className="absolute top-16 right-16 w-2 h-2 rounded-full bg-instagram-orange animate-pulse-dot" style={{ animationDelay: "0.3s" }} />
<div className="absolute top-1/2 left-6 w-2 h-2 rounded-full bg-instagram-orange animate-pulse-dot" style={{ animationDelay: "0.3s" }} />
<div className="absolute top-1/2 right-20 w-3 h-3 rounded-full bg-instagram-purple animate-pulse-dot" />
<div className="absolute top-2/3 left-1/4 w-2 h-2 rounded-full bg-instagram-yellow animate-pulse-dot" style={{ animationDelay: "0.5s" }} />
<div className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full bg-instagram-pink animate-pulse-dot" style={{ animationDelay: "1s" }} />
<div className="absolute bottom-1/3 right-1/3 w-2 h-2 rounded-full bg-instagram-orange animate-pulse-dot" style={{ animationDelay: "0.3s" }} />
<div className="absolute bottom-40 left-16 w-2 h-2 rounded-full bg-instagram-orange animate-pulse-dot" style={{ animationDelay: "0.3s" }} />
<div className="absolute bottom-24 right-24 w-2 h-2 rounded-full bg-instagram-orange animate-pulse-dot" style={{ animationDelay: "0.3s" }} />
<div className="absolute bottom-16 left-1/2 w-2 h-2 rounded-full bg-instagram-orange animate-pulse-dot" style={{ animationDelay: "0.4s" }} />

      <DecorativeDots className="absolute top-1/2 right-4 opacity-40 hidden lg:grid" />
      <DecorativeDots className="absolute bottom-5 left-4 opacity-30 hidden lg:grid" />

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >

            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ width: 20, height: 1, background: "#ddd", display: "block" }} />
              <span style={{ fontSize: 11, fontWeight: 500, color: "#aaa", letterSpacing: "0.12em", textTransform: "uppercase" }}> Herramienta de Mockups</span>
              <span style={{ width: 20, height: 1, background: "#ddd", display: "block" }} />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Crea Mockups{" "}
              <span className="gradient-text">Perfectos</span> para
              Instagram
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mb-8">
              Genera imágenes profesionales con dispositivos, fondos atractivos y
              medidas exactas para cada formato de Instagram.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="gradient" size="lg" className="rounded-full px-8 gap-2">
                Empezar Gratis <ArrowRight size={18} />
              </Button>
              <a

                href={`#ver-tutorial`}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Button variant="outline" size="lg" className="rounded-full px-8 gap-2">
                  <Play size={16} /> Ver Tutorial
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Right image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative flex justify-center"
          >
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl gradient-bg opacity-10 blur-2xl" />
              <img
                src={heroMockup}
                alt="POSTIM mockup generator preview"
                className="relative w-full max-w-md rounded-2xl animate-float"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
