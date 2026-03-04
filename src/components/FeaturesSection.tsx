import { motion } from "framer-motion";
import { Smartphone, Monitor, Tablet, Palette, Move, Download } from "lucide-react";
import DecorativeDots from "./DecorativeDots";

const features = [
  {
    icon: Smartphone,
    title: "Mockup de Celular",
    description: "Coloca tu diseño en dispositivos móviles con marcos realistas.",
  },
  {
    icon: Tablet,
    title: "Mockup de Tablet",
    description: "Presenta tus apps en tablets con perspectivas profesionales.",
  },
  {
    icon: Monitor,
    title: "Mockup de PC",
    description: "Muestra sitios web en pantallas de escritorio elegantes.",
  },
  {
    icon: Palette,
    title: "Fondos Personalizados",
    description: "Elige gradientes, colores sólidos o imágenes de fondo.",
  },
  {
    icon: Move,
    title: "Control Total",
    description: "Ajusta padding, margin y posición de tu diseño.",
  },
  {
    icon: Download,
    title: "Exporta Perfecto",
    description: "Descarga en las medidas exactas para feed, reels o stories.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="características" className="relative py-24">
      <DecorativeDots className="absolute top-12 right-8 opacity-30 hidden lg:grid" />
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
     
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                            <span style={{ width: 20, height: 1, background: "#ddd", display: "block" }} />
                            <span style={{ fontSize: 11, fontWeight: 500, color: "#aaa", letterSpacing: "0.12em", textTransform: "uppercase" }}>Características</span>
                            <span style={{ width: 20, height: 1, background: "#ddd", display: "block" }} />
                        </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            ¿Por Qué Elegir{" "}
            <span className="gradient-text">POSTIM</span>?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Todo lo que necesitas para crear mockups profesionales para
            Instagram, sin complicaciones.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group p-6 rounded-2xl border border-border bg-card hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon size={22} className="text-primary-foreground" />
              </div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
