import { lazy, Suspense, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, MousePointer2, Play } from "lucide-react";

const HeroScene = lazy(() => import("./three/HeroScene"));

const ease = [0.22, 1, 0.36, 1] as const;
const WORDS = ["tu feed", "tus stories", "tus reels", "tu portafolio"];

const supportsWebGL = () => {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
};

/**
 * Palabra que rota. Ocupa su propia línea con altura fija y todas las palabras
 * se apilan en la misma celda de la grilla, así el resto del título nunca se mueve.
 */
const RotatingWord = () => {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % WORDS.length), 2600);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="grid overflow-hidden pb-[0.12em]" aria-live="polite">
      {/* Reserva la altura de una línea */}
      <span className="invisible col-start-1 row-start-1">{WORDS[0]}</span>
      <AnimatePresence initial={false}>
        <motion.span
          key={WORDS[i]}
          initial={{ y: "105%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-105%", opacity: 0 }}
          transition={{ duration: 0.6, ease }}
          className="gradient-text col-start-1 row-start-1 whitespace-nowrap"
        >
          {WORDS[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

const HeroSection = () => {
  const [webgl] = useState(supportsWebGL);

  return (
    <section className="relative overflow-hidden pt-28 sm:pt-32">
      <div className="pointer-events-none absolute inset-0 bg-dots opacity-60 mask-fade-b" />
      <motion.div
        aria-hidden
        animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.16, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute right-[-10%] top-10 h-[560px] w-[760px] rounded-full gradient-bg blur-[140px]"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-6 px-5 lg:min-h-[640px] lg:grid-cols-[1fr_1.05fr]">
        <div className="text-center lg:text-left">
          <motion.a
            href="#ver-tutorial"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-background/80 py-1 pl-1 pr-3 text-xs text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
          >
            <span className="rounded-full bg-foreground px-2 py-0.5 font-medium text-background">Nuevo</span>
            Vista 3D y exportación en video
            <ArrowRight className="h-3 w-3" />
          </motion.a>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease }}
            className="text-[2.6rem] font-semibold leading-[1.04] tracking-[-0.035em] sm:text-6xl lg:text-[4.1rem]"
          >
            Mockups que hacen brillar <RotatingWord />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease }}
            className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-muted-foreground lg:mx-0"
          >
            Sube tus capturas, combina celulares, tablets y laptops en una sola escena y descarga en la medida
            exacta de Instagram. Sin registro, sin marca de agua.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease }}
            className="mt-9 flex flex-col items-center gap-3 sm:flex-row lg:justify-start sm:justify-center"
          >
            <Link
              to="/mockups"
              className="group relative inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-foreground px-7 text-[15px] font-medium text-background transition-transform active:scale-[0.98] sm:w-auto"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              Crear mockup gratis
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#ver-tutorial"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-7 text-[15px] font-medium transition-colors hover:bg-muted sm:w-auto"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Ver demo
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex items-center justify-center gap-3 lg:justify-start"
          >
            <div className="flex -space-x-2">
              {["#833ab4", "#e1306c", "#f77737", "#fcaf45"].map((c, i) => (
                <div
                  key={c}
                  className="grid h-8 w-8 place-items-center rounded-full border-2 border-background text-[10px] font-semibold text-white"
                  style={{ background: c }}
                >
                  {["VA", "MR", "SL", "CM"][i]}
                </div>
              ))}
            </div>
            <p className="text-left text-xs leading-tight text-muted-foreground">
              <span className="font-medium text-foreground">+10.000 creadores</span>
              <br />
              ya diseñan con POSTIM
            </p>
          </motion.div>
        </div>

        {/* ── Escena 3D ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease }}
          className="relative h-[440px] sm:h-[540px] lg:h-[640px]"
        >
          {webgl ? (
            <Suspense fallback={<div className="absolute inset-0 grid place-items-center"><div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-foreground" /></div>}>
              <HeroScene />
            </Suspense>
          ) : null}
          <div className="pointer-events-none absolute bottom-4 left-1/2 hidden -translate-x-1/2 items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur sm:flex">
            <MousePointer2 className="h-3 w-3" /> Mueve el mouse
          </div>
        </motion.div>
      </div>

    </section>
  );
};

export default HeroSection;
