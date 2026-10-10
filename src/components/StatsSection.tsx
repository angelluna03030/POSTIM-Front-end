import { useEffect, useRef } from "react";
import { animate, motion, useInView } from "framer-motion";

const stats = [
  { value: 10000, suffix: "+", label: "Creadores" },
  { value: 6, suffix: "", label: "Dispositivos por escena" },
  { value: 4, suffix: "", label: "Formatos de Instagram" },
  { value: 0, suffix: "", label: "Marcas de agua" },
];

const Counter = ({ to, suffix }: { to: number; suffix: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const controls = animate(0, to, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = Math.round(v).toLocaleString("es-CO") + suffix;
      },
    });
    return () => controls.stop();
  }, [inView, to, suffix]);
  return <span ref={ref}>0{suffix}</span>;
};

const StatsSection = () => {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-border md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="border-border p-6 text-center sm:p-8 [&:nth-child(-n+2)]:border-b [&:nth-child(odd)]:border-r md:border-r md:last:border-r-0 md:[&:nth-child(-n+2)]:border-b-0"
            >
              <div className="text-4xl font-semibold tabular-nums tracking-tight sm:text-5xl">
                <Counter to={stat.value} suffix={stat.suffix} />
              </div>
              <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
