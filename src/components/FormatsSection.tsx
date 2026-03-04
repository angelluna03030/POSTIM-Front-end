import { motion } from "framer-motion";
import { Formatos } from "./Formatos";

const formats = [
  { name: "Feed Cuadrado", size: "1080 × 1080", ratio: "1:1", color: "from-instagram-purple to-instagram-pink" },
  { name: "Feed Vertical", size: "1080 × 1350", ratio: "4:5", color: "from-instagram-pink to-instagram-orange" },
  { name: "Stories / Reels", size: "1080 × 1920", ratio: "9:16", color: "from-instagram-orange to-instagram-yellow" },
  { name: "Feed Horizontal", size: "1080 × 566", ratio: "1.91:1", color: "from-instagram-yellow to-instagram-purple" },
];

const FormatsSection = () => {
  return (
    <section id="formatos" className="py-24 ">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
 
          
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                            <span style={{ width: 20, height: 1, background: "#ddd", display: "block" }} />
                            <span style={{ fontSize: 11, fontWeight: 500, color: "#aaa", letterSpacing: "0.12em", textTransform: "uppercase" }}>Formatos</span>
                            <span style={{ width: 20, height: 1, background: "#ddd", display: "block" }} />
                        </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Medidas <span className="gradient-text">Perfectas</span> para Instagram
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Exporta tus mockups en todos los formatos que Instagram necesita.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {formats.map((format, i) => (
            <motion.div
              key={format.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 hover:shadow-xl transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${format.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
              <div className={`w-full aspect-square max-w-[120px] mx-auto mb-4 rounded-xl bg-gradient-to-br ${format.color} opacity-20 flex items-center justify-center`}>
                <span className="text-lg font-bold text-foreground/60">{format.ratio}</span>
              </div>
              <h3 className="text-base font-bold text-center mb-1">{format.name}</h3>
              <p className="text-xs text-muted-foreground text-center">{format.size} px</p>
            </motion.div>
          ))}
        </div>
      </div>
         <Formatos/>
    </section>
  );
};

export default FormatsSection;
