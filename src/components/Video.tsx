import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check, Play } from "lucide-react";
import SectionHeading from "./SectionHeading";

const VIDEO_URL = "https://www.youtube.com/embed/Yf00MKUfcIY?autoplay=1&rel=0";

const previews = [
  { w: 64, h: 112, ratio: "9:16" },
  { w: 88, h: 88, ratio: "1:1" },
  { w: 72, h: 90, ratio: "4:5" },
];

export const VideoSection = () => {
  const [playing, setPlaying] = useState(false);

  return (
    <section id="ver-tutorial" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-5">
        <SectionHeading
          eyebrow="Demo"
          title="Míralo en acción"
          description="Un mockup listo en menos de 60 segundos. Así de simple."
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative aspect-video overflow-hidden rounded-3xl border border-border bg-zinc-950 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.35)]"
        >
          {playing ? (
            <iframe
              src={VIDEO_URL}
              title="POSTIM, demo"
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="group absolute inset-0 flex flex-col items-center justify-center gap-8 text-white"
              aria-label="Reproducir demo"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(131,58,180,0.35),transparent_55%),radial-gradient(ellipse_at_75%_70%,rgba(225,48,108,0.25),transparent_50%)]" />

              <div className="relative hidden items-end gap-4 sm:flex">
                {previews.map((p) => (
                  <div key={p.ratio} className="flex flex-col items-center gap-2">
                    <div
                      className="rounded-xl border border-white/10 bg-white/[0.06] backdrop-blur"
                      style={{ width: p.w, height: p.h }}
                    />
                    <span className="font-mono text-[10px] text-white/40">{p.ratio}</span>
                  </div>
                ))}
              </div>

              <span className="relative grid h-16 w-16 place-items-center rounded-full bg-white text-zinc-950 shadow-2xl transition-transform duration-300 group-hover:scale-110">
                <Play className="ml-0.5 h-5 w-5 fill-current" />
              </span>

              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/60 to-transparent px-6 pb-5 pt-16 text-left">
                <div>
                  <div className="text-sm font-medium">POSTIM, demo completa</div>
                  <div className="mt-0.5 text-xs text-white/50">0:58 · Crea tu primer mockup</div>
                </div>
              </div>
            </button>
          )}
        </motion.div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
          {["Sin registro", "Gratis para siempre", "Sin marca de agua"].map((t) => (
            <div key={t} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-foreground" strokeWidth={2} />
              {t}
            </div>
          ))}
          <Link to="/mockups" className="text-sm font-medium underline-offset-4 hover:underline">
            Probar ahora →
          </Link>
        </div>
      </div>
    </section>
  );
};
