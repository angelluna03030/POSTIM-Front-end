import { motion } from "framer-motion";
import { Camera, Clapperboard, Film, Loader2, Move3d, Play, RefreshCw, RotateCw, ScanEye, Sparkles, Square, Waves, ZoomIn, MoveHorizontal } from "lucide-react";
import { VIDEO_PRESETS, type VideoPreset, type VideoSettings } from "@/lib/mockup";
import { pickVideoMime } from "@/lib/video";
import { cn } from "@/lib/utils";

const ICONS: Record<VideoPreset, React.ElementType> = {
  intro: Sparkles,
  reveal: ScanEye,
  tour: Clapperboard,
  swing: MoveHorizontal,
  zoom: ZoomIn,
  float: Waves,
  spin: RotateCw,
};

interface VideoPanelProps {
  video: VideoSettings;
  onChange: (v: Partial<VideoSettings>) => void;
  status: "idle" | "preview" | "recording";
  progress: number;
  ready: boolean;
  onPreview: () => void;
  onRecord: () => void;
  onStop: () => void;
  onCapture: () => void;
  onStraighten: () => void;
  onBack: () => void;
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="border-b border-border px-5 py-5 last:border-b-0">
    <h3 className="mb-3.5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{title}</h3>
    <div className="space-y-3">{children}</div>
  </section>
);

const VideoPanel = ({ video, onChange, status, progress, ready, onPreview, onRecord, onStop, onCapture, onStraighten, onBack }: VideoPanelProps) => {
  const busy = status !== "idle";
  const format = pickVideoMime();

  return (
    <div className="flex flex-col">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Move3d className="h-4 w-4" /> Vista 3D
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Arrastra un dispositivo para girarlo en 3D. El fondo se queda fijo. Doble clic para enderezarlo.
        </p>
      </div>

      <Section title="Animación del video">
        <div className="grid grid-cols-2 gap-1.5">
          {VIDEO_PRESETS.map((p) => {
            const Icon = ICONS[p.value];
            const active = video.preset === p.value;
            return (
              <button
                key={p.value}
                type="button"
                disabled={busy}
                onClick={() => onChange({ preset: p.value })}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all disabled:opacity-50",
                  active ? "border-foreground ring-1 ring-foreground" : "border-border hover:border-foreground/30",
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                <span className="text-[13px] font-medium">{p.label}</span>
                <span className="text-[11px] leading-snug text-muted-foreground">{p.description}</span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Duración y fluidez">
        <div className="grid grid-cols-4 rounded-lg bg-muted p-0.5">
          {[3, 5, 8, 12].map((d) => (
            <button
              key={d}
              type="button"
              disabled={busy}
              onClick={() => onChange({ duration: d })}
              className={cn("h-7 rounded-md text-xs font-medium transition-all", video.duration === d ? "bg-background shadow-sm" : "text-muted-foreground")}
            >
              {d}s
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 rounded-lg bg-muted p-0.5">
          {([30, 60] as const).map((f) => (
            <button
              key={f}
              type="button"
              disabled={busy}
              onClick={() => onChange({ fps: f })}
              className={cn("h-7 rounded-md text-xs font-medium transition-all", video.fps === f ? "bg-background shadow-sm" : "text-muted-foreground")}
            >
              {f} fps
            </button>
          ))}
        </div>
      </Section>

      <Section title="Grabar">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={!ready || busy}
            onClick={onPreview}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-border text-[13px] font-medium transition-colors hover:bg-muted disabled:opacity-40"
          >
            <Play className="h-3.5 w-3.5" /> Vista previa
          </button>
          {busy ? (
            <button type="button" onClick={onStop} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-destructive text-[13px] font-medium text-destructive-foreground">
              <Square className="h-3.5 w-3.5 fill-current" /> Detener
            </button>
          ) : (
            <button
              type="button"
              disabled={!ready || !format}
              onClick={onRecord}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-foreground text-[13px] font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              <Film className="h-3.5 w-3.5" /> Grabar video
            </button>
          )}
        </div>

        {busy && (
          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                {status === "recording" ? <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" /> : <Loader2 className="h-3 w-3 animate-spin" />}
                {status === "recording" ? "Renderizando video…" : "Reproduciendo…"}
              </span>
              <span className="font-mono">{Math.round(progress * 100)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <motion.div className="h-full gradient-bg" style={{ width: `${progress * 100}%` }} />
            </div>
          </div>
        )}

        <p className="text-xs leading-relaxed text-muted-foreground">
          {format
            ? typeof VideoEncoder !== "undefined"
              ? "Se renderiza cuadro por cuadro y se descarga en MP4 a la resolución exacta del formato, sin cuadros perdidos."
              : `Se graba en tiempo real en ${format.ext.toUpperCase()}. Mantén esta pestaña visible mientras graba.`
            : "Tu navegador no permite grabar video. Prueba con Chrome, Edge o Safari actualizados."}
        </p>
      </Section>

      <Section title="Dispositivos">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onStraighten}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border text-[13px] transition-colors hover:bg-muted disabled:opacity-40"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Enderezar
          </button>
          <button
            type="button"
            disabled={!ready || busy}
            onClick={onCapture}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border text-[13px] transition-colors hover:bg-muted disabled:opacity-40"
          >
            <Camera className="h-3.5 w-3.5" /> Foto 3D
          </button>
        </div>
        <button type="button" disabled={busy} onClick={onBack} className="w-full text-center text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline disabled:opacity-40">
          Volver al editor 2D
        </button>
      </Section>
    </div>
  );
};

export default VideoPanel;
