import { motion } from "framer-motion";
import { Upload, Sliders, Download } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Sube tu Diseño",
    description: "Arrastra o selecciona la imagen de tu app o diseño.",
  },
  {
    icon: Sliders,
    step: "02",
    title: "Personaliza",
    description: "Elige dispositivo, fondo, padding y formato de Instagram.",
  },
  {
    icon: Download,
    step: "03",
    title: "Descarga",
    description: "Exporta tu mockup listo para publicar en Instagram.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="cómo-funciona" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
           <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                            <span style={{ width: 20, height: 1, background: "#ddd", display: "block" }} />
                            <span style={{ fontSize: 11, fontWeight: 500, color: "#aaa", letterSpacing: "0.12em", textTransform: "uppercase" }}>Cómo Funciona</span>
                            <span style={{ width: 20, height: 1, background: "#ddd", display: "block" }} />
                        </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Tan Fácil Como{" "}
            <span className="gradient-text">1, 2, 3</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center"
            >
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full gradient-bg opacity-10" />
                <div className="absolute inset-2 rounded-full bg-card border border-border flex items-center justify-center">
                  <step.icon size={28} className="text-instagram-pink" />
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full gradient-bg flex items-center justify-center text-xs font-bold text-primary-foreground">
                  {step.step}
                </span>
              </div>
              <h3 className="text-lg font-bold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
