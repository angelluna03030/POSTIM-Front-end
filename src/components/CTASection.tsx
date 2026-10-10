import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { MiniPhone } from "./landing/MiniDevice";

const CTASection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yLeft = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const yRight = useTransform(scrollYProgress, [0, 1], [-40, 120]);
  const rot = useTransform(scrollYProgress, [0, 1], [-18, 6]);

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-zinc-950 px-6 py-16 text-center text-white sm:px-12 sm:py-24"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="pointer-events-none absolute -top-60 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full opacity-40 blur-[90px]"
            style={{ background: "conic-gradient(from 0deg,#833ab4,#e1306c,#f77737,#fcaf45,#833ab4)" }}
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:18px_18px]" />

          <motion.div style={{ y: yLeft, rotate: rot }} className="pointer-events-none absolute -left-6 top-10 hidden w-[120px] opacity-80 md:block">
            <MiniPhone variant={0} />
          </motion.div>
          <motion.div style={{ y: yRight }} className="pointer-events-none absolute -right-4 bottom-0 hidden w-[130px] rotate-12 opacity-80 md:block">
            <MiniPhone variant={1} />
          </motion.div>

          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold leading-[1.1] sm:text-5xl">Tu próximo post merece verse así de bien.</h2>
            <p className="mx-auto mt-5 max-w-md text-base text-white/60">Abre el editor y crea tu primer mockup. Es gratis y no necesitas cuenta.</p>
            <Link
              to="/mockups"
              className="group mt-9 inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-[15px] font-medium text-zinc-950 transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              Empezar ahora
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
