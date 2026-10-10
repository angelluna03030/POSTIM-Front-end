import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Upload, SlidersHorizontal, Download, ImageIcon, Check } from "lucide-react";
import { Link } from "react-router-dom";
import SectionHeading from "./SectionHeading";
import { MiniPhone } from "./landing/MiniDevice";
import { cn } from "@/lib/utils";

const STEP_MS = 4200;

const steps = [
  { icon: Upload, title: "Sube tu captura", description: "Arrastra, pega con Ctrl+V o selecciona varias imágenes a la vez: cada una cae en su propio dispositivo." },
  { icon: SlidersHorizontal, title: "Dale tu estilo", description: "Elige fondo, diseño, inclinación 3D y añade textos glass. Todo se actualiza en vivo." },
  { icon: Download, title: "Descarga y publica", description: "Exporta a 1080 px exactos o cópialo al portapapeles. Listo para Instagram." },
];

// ── Visuales de cada paso ──
const UploadVisual = () => (
  <div className="relative grid h-full place-items-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="grid h-[70%] w-[72%] place-items-center rounded-3xl border-2 border-dashed border-foreground/15 bg-background/60"
    >
      <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
        <Upload className="h-5 w-5" />
        Suelta tus imágenes
      </div>
    </motion.div>
    {[0, 1, 2].map((k) => (
      <motion.div
        key={k}
        initial={{ x: 180 + k * 30, y: -160, rotate: 18, opacity: 0 }}
        animate={{ x: (k - 1) * 70, y: 0, rotate: (k - 1) * 6, opacity: 1 }}
        transition={{ delay: 0.4 + k * 0.25, type: "spring", stiffness: 90, damping: 14 }}
        className="absolute grid h-24 w-[72px] place-items-center rounded-xl border border-border bg-background shadow-lg"
      >
        <ImageIcon className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
        <span className="absolute bottom-1.5 font-mono text-[9px] text-muted-foreground">captura-{k + 1}</span>
      </motion.div>
    ))}
  </div>
);

const StyleVisual = () => (
  <div className="relative grid h-full place-items-center overflow-hidden">
    <motion.div
      className="absolute inset-0"
      animate={{
        background: [
          "linear-gradient(135deg,#fdf2f8,#fbcfe8)",
          "linear-gradient(135deg,#fcaf45,#e1306c,#833ab4)",
          "linear-gradient(135deg,#dbeafe,#6366f1)",
        ],
      }}
      transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
    />
    <div className="relative flex items-end gap-3" style={{ perspective: 800 }}>
      {[0, 1, 2].map((k) => (
        <motion.div
          key={k}
          initial={{ rotate: 0, y: 0 }}
          animate={{ rotate: (k - 1) * 10, y: k === 1 ? -16 : 0, rotateY: (k - 1) * -18 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 80, damping: 12 }}
        >
          <MiniPhone className="w-[78px]" variant={k} />
        </motion.div>
      ))}
    </div>
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.9 }}
      className="absolute bottom-6 rounded-2xl border border-white/50 bg-white/30 px-5 py-2.5 text-center text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl"
    >
      Tu app, en todas partes
    </motion.div>
    {/* Panel de sliders flotante */}
    <motion.div initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="absolute right-4 top-4 w-36 space-y-2.5 rounded-xl border border-border bg-background/95 p-3 shadow-lg">
      {["Tamaño", "Rotación", "3D"].map((l, k) => (
        <div key={l}>
          <div className="mb-1 text-[10px] text-muted-foreground">{l}</div>
          <div className="h-1 rounded-full bg-border">
            <motion.div className="h-1 rounded-full bg-foreground" initial={{ width: "20%" }} animate={{ width: ["20%", `${55 + k * 15}%`, "40%"] }} transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", delay: k * 0.2 }} />
          </div>
        </div>
      ))}
    </motion.div>
  </div>
);

const DownloadVisual = () => (
  <div className="relative grid h-full place-items-center overflow-hidden">
    {/* Post de Instagram publicado */}
    <motion.div
      initial={{ y: 30, opacity: 0, rotate: -2 }}
      animate={{ y: 0, opacity: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 90, damping: 15 }}
      className="w-[250px] overflow-hidden rounded-2xl border border-border bg-background shadow-[0_30px_60px_-20px_rgba(0,0,0,0.3)]"
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span className="rounded-full p-[2px]" style={{ background: "linear-gradient(45deg,#fcaf45,#e1306c,#833ab4)" }}>
          <span className="grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-zinc-900 text-[9px] font-bold text-white">P</span>
        </span>
        <div className="flex-1 leading-tight">
          <div className="text-[11px] font-semibold">postim.app</div>
          <div className="text-[9px] text-muted-foreground">Patrocinado</div>
        </div>
        <span className="text-xs text-muted-foreground">···</span>
      </div>
      {/* La imagen exportada: 3 celulares sobre gradiente */}
      <div className="relative flex aspect-[4/5] items-center justify-center gap-2 overflow-hidden" style={{ background: "linear-gradient(135deg,#fcaf45,#e1306c 50%,#833ab4)" }}>
        <div className="absolute -left-6 -top-6 h-28 w-28 rounded-full bg-white/30 blur-2xl" />
        {[0, 1, 2].map((k) => (
          <motion.div
            key={k}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: k === 1 ? -6 : 8, opacity: 1, rotate: (k - 1) * 8 }}
            transition={{ delay: 0.25 + k * 0.12, type: "spring", stiffness: 110, damping: 14 }}
            className={k === 1 ? "z-10 w-[74px]" : "w-[62px]"}
          >
            <MiniPhone variant={k + 1} />
          </motion.div>
        ))}
        <motion.div className="absolute inset-0 bg-white" initial={{ opacity: 0 }} animate={{ opacity: [0, 0.7, 0] }} transition={{ delay: 1.1, duration: 0.5 }} />
      </div>
      <div className="flex items-center gap-3 px-3 pb-1 pt-2.5">
        <motion.svg initial={{ scale: 1 }} animate={{ scale: [1, 1.35, 1] }} transition={{ delay: 1.7, duration: 0.4 }} viewBox="0 0 24 24" className="h-5 w-5" fill="#ef4444">
          <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2 0 3.6 1.1 4.4 2.7.2.4.6.4.8 0 .8-1.6 2.4-2.7 4.4-2.7 3.7 0 5.8 3.9 4.3 7.3C18.5 16.4 12 21 12 21z" />
        </motion.svg>
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-4-7.5L21 3l-1 5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinejoin="round" /></svg>
      </div>
      <div className="px-3 pb-3 text-[10px]">
        <span className="font-semibold">2.481 Me gusta</span>
      </div>
    </motion.div>

    <motion.div
      initial={{ x: 30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 1.3, type: "spring" }}
      className="absolute right-5 top-6 flex items-center gap-2 rounded-full border border-border bg-background/95 px-3 py-1.5 text-[11px] font-medium shadow-lg backdrop-blur"
    >
      <span className="grid h-4 w-4 place-items-center rounded-full bg-foreground text-background">
        <Check className="h-2.5 w-2.5" />
      </span>
      1080 × 1350 · PNG
    </motion.div>
    <motion.div
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 1.8, type: "spring" }}
      className="absolute bottom-6 left-5 rounded-2xl border border-white/60 bg-white/70 px-3 py-2 text-[11px] shadow-lg backdrop-blur-xl"
    >
      <div className="font-semibold">¡Publicado! 🎉</div>
      <div className="text-muted-foreground">Ya está en tu feed</div>
    </motion.div>
  </div>
);

const VISUALS = [UploadVisual, StyleVisual, DownloadVisual];

const HowItWorksSection = () => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % steps.length), STEP_MS);
    return () => clearTimeout(t);
  }, [active, paused]);

  const Visual = VISUALS[active];

  return (
    <section id="como-funciona" className="scroll-mt-20 border-y border-border bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Cómo funciona"
          title={
            <>
              De captura a post <span className="gradient-text">en tres pasos</span>
            </>
          }
          description="Sin instalar nada ni crear cuenta. La mayoría de mockups quedan listos en menos de un minuto."
        />

        <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div className="space-y-2">
            {steps.map((step, i) => (
              <button
                key={step.title}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  "relative w-full overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300",
                  i === active ? "border-border bg-background shadow-sm" : "border-transparent hover:bg-background/60",
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition-colors",
                      i === active ? "border-foreground bg-foreground text-background" : "border-border bg-background",
                    )}
                  >
                    <step.icon size={17} strokeWidth={1.75} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
                      <h3 className="text-base font-semibold">{step.title}</h3>
                    </div>
                    <AnimatePresence initial={false}>
                      {i === active && (
                        <motion.p
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden pt-1.5 text-sm leading-relaxed text-muted-foreground"
                        >
                          {step.description}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                {i === active && (
                  <motion.div
                    key={`${active}-${paused}`}
                    className="absolute bottom-0 left-0 h-0.5 gradient-bg"
                    initial={{ width: "0%" }}
                    animate={{ width: paused ? "0%" : "100%" }}
                    transition={{ duration: paused ? 0 : STEP_MS / 1000, ease: "linear" }}
                  />
                )}
              </button>
            ))}
            <Link to="/mockups" className="inline-block px-5 pt-3 text-sm font-medium underline-offset-4 hover:underline">
              Probarlo ahora →
            </Link>
          </div>

          <div className="relative h-[380px] overflow-hidden rounded-3xl border border-border bg-muted/50 bg-dots sm:h-[440px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                className="absolute inset-0"
                initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
                transition={{ duration: 0.45 }}
              >
                <Visual />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
