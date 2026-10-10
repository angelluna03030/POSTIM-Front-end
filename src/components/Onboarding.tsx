import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, X } from "lucide-react";
import type { TourStep } from "@/lib/tour";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PAD = 8;

const useTargetRect = (target: string | null) => {
  const [rect, setRect] = useState<Rect | null>(null);
  const measure = useCallback(() => {
    if (!target) return setRect(null);
    const el = document.querySelector(`[data-tour="${target}"]`);
    if (!el) return setRect(null);
    el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    const r = el.getBoundingClientRect();
    setRect({ top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 });
  }, [target]);
  useLayoutEffect(() => {
    measure();
    const t = setTimeout(measure, 350);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);
  return rect;
};

/** Bienvenida (primera visita) + recorrido guiado con foco sobre cada zona */
const Onboarding = ({ open, steps, onClose }: { open: boolean; steps: TourStep[]; onClose: () => void }) => {
  const [phase, setPhase] = useState<"welcome" | "tour">("welcome");
  const [index, setIndex] = useState(0);
  const step = phase === "tour" ? steps[index] : null;
  const rect = useTargetRect(open && step ? step.target : null);

  useEffect(() => {
    if (open) {
      setPhase("welcome");
      setIndex(0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (phase !== "tour") return;
      if (e.key === "ArrowRight") setIndex((i) => Math.min(steps.length - 1, i + 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, phase, steps.length, onClose]);

  // Posición de la tarjeta: debajo del objetivo si cabe, si no arriba; nunca fuera de pantalla
  const cardW = 320;
  let cardTop = 0;
  let cardLeft = 0;
  if (rect) {
    const below = rect.top + rect.height + 12;
    cardTop = below + 190 < window.innerHeight ? below : Math.max(12, rect.top - 190 - 12);
    if (rect.height > window.innerHeight * 0.6) cardTop = Math.min(window.innerHeight - 210, rect.top + 24);
    cardLeft = Math.min(window.innerWidth - cardW - 12, Math.max(12, rect.left + rect.width / 2 - cardW / 2));
    if (rect.width > window.innerWidth * 0.5 && rect.height > window.innerHeight * 0.5) cardLeft = Math.max(12, rect.left + 24);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[100]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {phase === "welcome" ? (
            <div className="grid h-full place-items-center bg-black/40 p-4 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
                className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-background shadow-2xl"
              >
                <div className="relative h-36 overflow-hidden gradient-bg">
                  <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/30 blur-2xl" />
                  <div className="absolute inset-0 grid place-items-center">
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="flex items-center gap-2 rounded-2xl border border-white/60 bg-white/30 px-4 py-2.5 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl"
                    >
                      <Sparkles className="h-4 w-4" /> Bienvenido a POSTIM
                    </motion.div>
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-semibold">¿Te mostramos cómo funciona?</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Un recorrido rápido de 6 pasos por el editor: lienzo, panel, formatos, vista 3D y descarga. Toma menos de un minuto.
                  </p>
                  <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button type="button" onClick={onClose} className="h-10 rounded-full px-5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                      Ahora no
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhase("tour")}
                      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90"
                    >
                      Ver tutorial <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-4 text-center text-[11px] text-muted-foreground">Puedes verlo de nuevo cuando quieras con el botón «?» de arriba.</p>
                </div>
              </motion.div>
            </div>
          ) : (
            <>
              {/* Foco: un recuadro transparente con una sombra gigante que oscurece todo lo demás */}
              <motion.div
                className="pointer-events-none absolute rounded-2xl ring-2 ring-white/80"
                initial={false}
                animate={rect ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height, opacity: 1 } : { opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 30 }}
                style={{ boxShadow: "0 0 0 9999px rgba(9,9,11,0.6)" }}
              />
              <div className="absolute inset-0" />

              <AnimatePresence mode="wait">
                {step && rect && (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute rounded-2xl border border-border bg-background p-5 shadow-2xl"
                    style={{ top: cardTop, left: cardLeft, width: cardW }}
                  >
                    <button type="button" onClick={onClose} aria-label="Cerrar tutorial" className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted">
                      <X className="h-4 w-4" />
                    </button>
                    <div className="mb-1 font-mono text-[11px] text-muted-foreground">
                      {index + 1} / {steps.length}
                    </div>
                    <h3 className="text-base font-semibold">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex gap-1">
                        {steps.map((_, i) => (
                          <span key={i} className={`h-1.5 rounded-full transition-all ${i === index ? "w-4 bg-foreground" : "w-1.5 bg-border"}`} />
                        ))}
                      </div>
                      <div className="flex gap-1.5">
                        {index > 0 && (
                          <button type="button" onClick={() => setIndex((i) => i - 1)} aria-label="Anterior" className="grid h-8 w-8 place-items-center rounded-full border border-border hover:bg-muted">
                            <ArrowLeft className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => (index === steps.length - 1 ? onClose() : setIndex((i) => i + 1))}
                          className="inline-flex h-8 items-center gap-1 rounded-full bg-foreground px-3.5 text-xs font-medium text-background"
                        >
                          {index === steps.length - 1 ? "¡Empezar!" : "Siguiente"}
                          {index < steps.length - 1 && <ArrowRight className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Onboarding;
