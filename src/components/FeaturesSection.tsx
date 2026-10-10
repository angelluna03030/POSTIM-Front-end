import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, FileImage, Layers, Palette, Rotate3d, Sparkles, Keyboard, Download } from "lucide-react";
import SectionHeading from "./SectionHeading";
import TiltCard from "./landing/TiltCard";
import { MiniPhone, MiniTablet } from "./landing/MiniDevice";

const useCycle = (length: number, ms: number) => {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % length), ms);
    return () => clearInterval(t);
  }, [length, ms]);
  return i;
};

const CardText = ({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) => (
  <div className="relative z-20 p-6 sm:p-7">
    <div className="mb-2 flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
      <h3 className="text-base font-semibold">{title}</h3>
    </div>
    <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{text}</p>
  </div>
);

// ── Visual 1: varios dispositivos que se reacomodan ──
const LAYOUTS = [
  [
    { x: -110, y: 10, r: 0, s: 0.9 },
    { x: 0, y: 0, r: 0, s: 1 },
    { x: 110, y: 10, r: 0, s: 0.9 },
  ],
  [
    { x: -95, y: 18, r: -12, s: 0.88 },
    { x: 0, y: -6, r: 0, s: 1.05 },
    { x: 95, y: 18, r: 12, s: 0.88 },
  ],
  [
    { x: -60, y: 26, r: -6, s: 0.85 },
    { x: 20, y: 6, r: 4, s: 0.95 },
    { x: 100, y: -14, r: 10, s: 1 },
  ],
];

const MultiDeviceVisual = () => {
  const i = useCycle(LAYOUTS.length, 2600);
  return (
    <div className="relative grid h-64 place-items-center overflow-hidden bg-[radial-gradient(ellipse_at_center,#fdf2f8,transparent_70%)] sm:h-72">
      <MiniTablet className="absolute w-[170px] opacity-30 blur-[1px]" />
      {LAYOUTS[i].map((p, k) => (
        <motion.div
          key={k}
          className="absolute w-[100px]"
          animate={{ x: p.x, y: p.y, rotate: p.r, scale: p.s }}
          transition={{ type: "spring", stiffness: 120, damping: 16 }}
          style={{ zIndex: k === 1 ? 3 : 2 }}
        >
          <MiniPhone variant={k} />
        </motion.div>
      ))}
      <div className="absolute bottom-4 flex gap-1.5">
        {LAYOUTS.map((_, k) => (
          <span key={k} className={`h-1.5 rounded-full transition-all duration-500 ${k === i ? "w-5 bg-foreground" : "w-1.5 bg-border"}`} />
        ))}
      </div>
    </div>
  );
};

// ── Visual 2: fondos que cambian ──
const BGS = [
  "radial-gradient(at 20% 20%,#fbcfe8,transparent 55%),radial-gradient(at 80% 30%,#fed7aa,transparent 55%),radial-gradient(at 50% 90%,#ddd6fe,transparent 55%),#fff7ed",
  "linear-gradient(135deg,#fcaf45,#e1306c,#833ab4)",
  "linear-gradient(160deg,#dbeafe,#93c5fd,#6366f1)",
  "linear-gradient(160deg,#ecfdf5,#a7f3d0,#5eead4)",
  "#18181b",
];

const BackgroundsVisual = () => {
  const i = useCycle(BGS.length, 1800);
  return (
    <div className="relative grid h-64 place-items-center overflow-hidden sm:h-72">
      <AnimatePresence initial={false}>
        <motion.div key={i} className="absolute inset-0" style={{ background: BGS[i] }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} />
      </AnimatePresence>
      <MiniPhone className="relative mt-24 w-[150px] drop-shadow-2xl" variant={i} />
      <div className="absolute top-4 z-10 flex gap-1.5 rounded-full border border-white/60 bg-white/70 p-1.5 shadow-sm backdrop-blur">
        {BGS.map((b, k) => (
          <span key={k} className={`h-5 w-5 rounded-full ring-offset-1 transition-all ${k === i ? "ring-2 ring-zinc-900" : "ring-1 ring-black/10"}`} style={{ background: b }} />
        ))}
      </div>
    </div>
  );
};

// ── Visual 3: notificación glass de iOS ──
const GlassVisual = () => {
  const i = useCycle(2, 2600);
  return (
    <div className="relative grid h-64 place-items-center overflow-hidden bg-[linear-gradient(135deg,#fcaf45,#e1306c_50%,#833ab4)] sm:h-72">
      <div className="absolute -left-10 top-6 h-32 w-32 rounded-full bg-white/30 blur-2xl" />
      <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-indigo-400/50 blur-2xl" />
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ y: -40, opacity: 0, scale: 0.92 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -30, opacity: 0, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
          className="relative w-[78%] rounded-[22px] border border-white/50 bg-white/25 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_20px_40px_-10px_rgba(0,0,0,0.25)] backdrop-blur-xl backdrop-saturate-150"
        >
          {i === 0 ? (
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] gradient-bg text-[11px] font-bold text-white">P</div>
              <div className="min-w-0 flex-1 text-white">
                <div className="flex justify-between text-[11px] text-white/80">
                  <span className="font-medium uppercase tracking-wide">Postim</span>
                  <span>ahora</span>
                </div>
                <div className="text-[13px] font-semibold">Tu mockup está listo ✨</div>
                <div className="text-[12px] text-white/85">1080 × 1350 · PNG</div>
              </div>
            </div>
          ) : (
            <div className="text-center text-white">
              <div className="text-[15px] font-semibold">Disponible ya</div>
              <div className="text-[12px] text-white/85">Descárgala gratis en App Store</div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// ── Visual 4: inclinación 3D ──
const TiltVisual = () => (
  <div className="relative grid h-64 place-items-center overflow-hidden bg-muted/40 bg-dots sm:h-72" style={{ perspective: 700 }}>
    <motion.div
      animate={{ rotateY: [-28, 28, -28], rotateX: [10, -6, 10] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      style={{ transformStyle: "preserve-3d" }}
    >
      <MiniPhone className="w-[118px]" variant={1} />
    </motion.div>
  </div>
);

// ── Visual 5: atajos ──
const KEYS = ["Ctrl V", "Ctrl Z", "Ctrl D", "Ctrl S"];
const KeysVisual = () => {
  const i = useCycle(KEYS.length, 1100);
  return (
    <div className="grid h-64 place-items-center bg-muted/40 sm:h-72">
      <div className="grid grid-cols-2 gap-3">
        {KEYS.map((k, n) => (
          <motion.div
            key={k}
            animate={n === i ? { y: 3, boxShadow: "0 1px 0 0 hsl(240 6% 85%)" } : { y: 0, boxShadow: "0 4px 0 0 hsl(240 6% 85%)" }}
            transition={{ duration: 0.15 }}
            className={`grid h-14 w-24 place-items-center rounded-xl border border-border bg-background font-mono text-sm ${n === i ? "text-foreground" : "text-muted-foreground"}`}
          >
            {k}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ── Visual 6: exportación ──
const ExportVisual = () => {
  const i = useCycle(3, 2400);
  const files = ["png", "jpg", "webp"];
  return (
    <div className="grid h-full min-h-[16rem] place-items-center bg-muted/40 p-6">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-background p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-muted">
            <FileImage className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1">
            <AnimatePresence mode="wait">
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="truncate font-mono text-xs">
                postim-portrait-1080x1350.{files[i]}
              </motion.div>
            </AnimatePresence>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <motion.div key={i} className="h-full rounded-full gradient-bg" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 1.6, ease: "easeInOut" }} />
            </div>
          </div>
          <motion.div key={`c${i}`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.6, type: "spring" }} className="grid h-6 w-6 place-items-center rounded-full bg-foreground text-background">
            <Check className="h-3.5 w-3.5" />
          </motion.div>
        </div>
        <div className="mt-4 flex gap-1.5">
          {files.map((f, n) => (
            <span key={f} className={`rounded-md px-2.5 py-1 font-mono text-[11px] uppercase transition-colors ${n === i ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}>
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const FeaturesSection = () => {
  return (
    <section id="caracteristicas" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Características"
          title={
            <>
              Un estudio de diseño,
              <br className="hidden sm:block" /> <span className="gradient-text">sin la curva de aprendizaje</span>
            </>
          }
          description="Combina dispositivos, fondos y textos con estilo iOS en una sola escena. Todo se ve en vivo mientras lo ajustas."
        />

        <div className="grid gap-4 [perspective:1200px] md:grid-cols-3">
          <TiltCard className="md:col-span-2">
            <MultiDeviceVisual />
            <CardText icon={Layers} title="Varios dispositivos, una escena" text="Agrega hasta 6 celulares, tablets o laptops, muévelos con el mouse y aplica diseños como abanico o escalonado." />
          </TiltCard>
          <TiltCard delay={0.08}>
            <BackgroundsVisual />
            <CardText icon={Palette} title="Fondos con un clic" text="Gradientes curados, mesh, colores libres o tu propia imagen." />
          </TiltCard>
          <TiltCard delay={0.05}>
            <GlassVisual />
            <CardText icon={Sparkles} title="Textos glass estilo iOS" text="Notificaciones, burbujas de iMessage y tarjetas de cristal sobre tu mockup." />
          </TiltCard>
          <TiltCard delay={0.1}>
            <TiltVisual />
            <CardText icon={Rotate3d} title="Perspectiva 3D" text="Inclina cada dispositivo en X e Y para escenas con profundidad real." />
          </TiltCard>
          <TiltCard delay={0.15}>
            <KeysVisual />
            <CardText icon={Keyboard} title="Rápido como un pro" text="Pega, deshace, duplica y exporta con atajos de teclado." />
          </TiltCard>
          <TiltCard className="md:col-span-3" delay={0.05}>
            <div className="grid md:grid-cols-2">
              <div className="flex items-center">
                <CardText icon={Download} title="Exporta al píxel" text="1080 px exactos para feed, stories y reels en PNG, JPG o WebP. O cópialo directo al portapapeles y pégalo donde quieras." />
              </div>
              <ExportVisual />
            </div>
          </TiltCard>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
