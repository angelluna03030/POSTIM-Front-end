import { motion } from "framer-motion";

const stats = [
  { value: "50+", label: "Plantillas" },
  { value: "6", label: "Dispositivos" },
  { value: "5", label: "Formatos IG" },
  { value: "100%", label: "Gratis" },
];

const StatsSection = () => {
  return (
    <section className="py-16 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl sm:text-4xl font-extrabold gradient-text mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
