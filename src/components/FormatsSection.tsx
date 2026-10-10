import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import SectionHeading from "./SectionHeading";
import { MiniPhone } from "./landing/MiniDevice";
import { cn } from "@/lib/utils";

const formats = [
  { key: "square", name: "Feed cuadrado", w: 1080, h: 1080, ratio: "1:1", use: "Posts clásicos y carruseles", bg: "linear-gradient(135deg,#fdf2f8,#f9a8d4,#e1306c)" },
  { key: "portrait", name: "Feed vertical", w: 1080, h: 1350, ratio: "4:5", use: "Ocupa más pantalla en el feed", bg: "linear-gradient(135deg,#fff7ed,#fdba74,#f77737)" },
  { key: "story", name: "Stories y Reels", w: 1080, h: 1920, ratio: "9:16", use: "Pantalla completa vertical", bg: "linear-gradient(160deg,#eef2ff,#a5b4fc,#6366f1)" },
  { key: "landscape", name: "Feed horizontal", w: 1080, h: 566, ratio: "1.91:1", use: "Banners y vistas web", bg: "linear-gradient(135deg,#ecfdf5,#6ee7b7,#14b8a6)" },
];


/** Composición de ejemplo dentro de cada formato */
const FormatScene = ({ kind }: { kind: string }) => {
  if (kind === "landscape") {
    return (
      <div className="flex h-full items-center justify-center gap-[5%] pt-[8%]">
        {[0, 1, 2].map((k) => (
          <MiniPhone key={k} variant={k} className={k === 1 ? "h-[100%]" : "h-[88%]"} />
        ))}
      </div>
    );
  }
  if (kind === "square") {
    return (
      <div className="relative h-full">
        <MiniPhone variant={1} className="absolute left-[22%] top-[16%] h-[80%] -rotate-[10deg] opacity-90" />
        <MiniPhone variant={0} className="absolute right-[22%] top-[12%] h-[84%] rotate-[6deg]" />
      </div>
    );
  }
  if (kind === "story") {
    return (
      <div className="relative flex h-full flex-col items-center justify-end">
        <div className="absolute left-[8%] right-[8%] top-[7%] z-10 flex items-center gap-[6%] rounded-[14px] border border-white/60 bg-white/50 p-[5%] shadow-lg backdrop-blur-xl">
          <span className="h-5 w-5 shrink-0 rounded-[6px] gradient-bg" />
          <span className="flex-1 space-y-1">
            <span className="block h-1.5 w-2/3 rounded-full bg-zinc-800/70" />
            <span className="block h-1.5 w-full rounded-full bg-zinc-800/30" />
          </span>
        </div>
        <MiniPhone variant={1} className="h-[74%] translate-y-[6%]" />
      </div>
    );
  }
  return (
    <div className="relative flex h-full flex-col items-center justify-end">
      <MiniPhone variant={2} className="h-[86%] translate-y-[6%]" />
      <div className="absolute bottom-[8%] rounded-full border border-white/60 bg-white/60 px-3 py-1 text-[10px] font-semibold shadow-lg backdrop-blur-xl">
        Disponible ya ✨
      </div>
    </div>
  );
};

const BOX_H = 360;
const BOX_W = 360;

const FormatsSection = () => {
  const [active, setActive] = useState(1);
  const f = formats[active];
  const scale = Math.min(BOX_W / f.w, BOX_H / f.h);
  const w = f.w * scale;
  const h = f.h * scale;

  return (
    <section id="formatos" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Formatos"
          title={
            <>
              Cada formato, <span className="gradient-text">al píxel</span>
            </>
          }
          description="Instagram recorta lo que no encaja. POSTIM exporta en la medida exacta de cada publicación para que nada se pierda."
        />

        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
          {/* Lista */}
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {formats.map((item, i) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "group flex items-center gap-4 rounded-2xl border p-4 text-left transition-all",
                  i === active ? "border-foreground/80 bg-background shadow-sm" : "border-border hover:border-foreground/30",
                )}
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-muted">
                  <div
                    className={cn("rounded-[3px] border-[1.5px] transition-colors", i === active ? "border-foreground" : "border-muted-foreground/50")}
                    style={{ width: (item.w / Math.max(item.w, item.h)) * 26, height: (item.h / Math.max(item.w, item.h)) * 26 }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-sm font-semibold">{item.name}</h3>
                    <span className="font-mono text-xs text-muted-foreground">{item.ratio}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.use}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Vista previa con reglas */}
          <div className="relative grid h-[460px] place-items-center rounded-3xl border border-border bg-muted/40 bg-dots">
            <div className="relative scale-[0.78] sm:scale-100" style={{ width: BOX_W, height: BOX_H }}>
              <div className="absolute inset-0 grid place-items-center">
                <motion.div
                  animate={{ width: w, height: h }}
                  transition={{ type: "spring", stiffness: 140, damping: 20 }}
                  className="relative"
                >
                  {/* Regla superior */}
                  <div className="absolute -top-7 left-0 right-0 flex items-center gap-2">
                    <div className="h-px flex-1 bg-foreground/30" />
                    <motion.span key={`w${f.key}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-mono text-[11px] text-muted-foreground">
                      {f.w}px
                    </motion.span>
                    <div className="h-px flex-1 bg-foreground/30" />
                  </div>
                  {/* Regla lateral */}
                  <div className="absolute -right-12 bottom-0 top-0 flex flex-col items-center gap-2">
                    <div className="w-px flex-1 bg-foreground/30" />
                    <motion.span key={`h${f.key}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-mono text-[11px] text-muted-foreground">
                      {f.h}px
                    </motion.span>
                    <div className="w-px flex-1 bg-foreground/30" />
                  </div>

                  <motion.div
                    className="relative grid h-full w-full place-items-center overflow-hidden rounded-xl shadow-[0_30px_60px_-20px_rgba(0,0,0,0.3)] ring-1 ring-black/5"
                    animate={{ background: f.bg }}
                    transition={{ duration: 0.5 }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={f.key}
                        initial={{ opacity: 0, scale: 0.9, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-0"
                      >
                        <FormatScene kind={f.key} />
                      </motion.div>
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              </div>
            </div>
            <Link
              to="/mockups"
              className="absolute bottom-4 right-4 rounded-full border border-border bg-background px-4 py-1.5 text-xs font-medium shadow-sm transition-colors hover:bg-muted"
            >
              Usar {f.ratio} →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FormatsSection;
