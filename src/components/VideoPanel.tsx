import { useRef } from "react";
import { motion } from "framer-motion";
import { Camera, Music, Trash2, Clapperboard, Film, Loader2, Move3d, Play, RefreshCw, RotateCw, ScanEye, Sparkles, Square, Waves, ZoomIn, MoveHorizontal } from "lucide-react";
import { VIDEO_PRESETS, type VideoPreset, type VideoSettings } from "@/lib/mockup";
import { pickVideoMime } from "@/lib/video";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { formatTime, type AudioOptions, type LoadedAudio } from "@/lib/audio";
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
  audio: LoadedAudio | null;
  audioLoading: boolean;
  audioOptions: AudioOptions;
  onAudioOptions: (o: Partial<AudioOptions>) => void;
  onAudioFile: (file: File) => void;
  onAudioRemove: () => void;
}

/** Onda del audio con la parte que entra en el video resaltada */
const Waveform = ({ audio, start, length }: { audio: LoadedAudio; start: number; length: number }) => {
  const total = audio.buffer.duration;
  const from = start / total;
  const to = Math.min(1, (start + length) / total);
  return (
    <div className="relative flex h-12 items-center gap-[2px] overflow-hidden rounded-lg bg-muted px-2">
      {audio.peaks.map((p, i) => {
        const pos = i / audio.peaks.length;
        const inside = pos >= from && pos <= to;
        return (
          <span
            key={i}
            className={inside ? "flex-1 rounded-full bg-foreground" : "flex-1 rounded-full bg-foreground/20"}
            style={{ height: `${Math.max(8, p * 100)}%` }}
          />
        );
      })}
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="border-b border-border px-5 py-5 last:border-b-0">
    <h3 className="mb-3.5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{title}</h3>
    <div className="space-y-3">{children}</div>
  </section>
);

const VideoPanel = ({
  video,
  onChange,
  status,
  progress,
  ready,
  onPreview,
  onRecord,
  onStop,
  onCapture,
  onStraighten,
  onBack,
  audio,
  audioLoading,
  audioOptions,
  onAudioOptions,
  onAudioFile,
  onAudioRemove,
}: VideoPanelProps) => {
  const busy = status !== "idle";
  const fileRef = useRef<HTMLInputElement>(null);
  const maxStart = audio ? Math.max(0, audio.buffer.duration - (audioOptions.loop ? 0.5 : video.duration)) : 0;
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

      <Section title="Audio">
        <input
          ref={fileRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onAudioFile(f);
            e.target.value = "";
          }}
        />
        {audio ? (
          <>
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg gradient-bg text-white">
                <Music className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium">{audio.name}</div>
                <div className="text-[11px] text-muted-foreground">{formatTime(audio.buffer.duration)} de duración</div>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={onAudioRemove}
                aria-label="Quitar audio"
                className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-destructive disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <Waveform audio={audio} start={audioOptions.start} length={video.duration} />
            <div>
              <div className="mb-2 flex justify-between text-[13px]">
                <span>Empieza en</span>
                <span className="font-mono text-xs text-muted-foreground">{formatTime(audioOptions.start)}</span>
              </div>
              <Slider
                value={[Math.min(audioOptions.start, maxStart)]}
                onValueChange={([v]) => onAudioOptions({ start: v })}
                min={0}
                max={Math.max(0.1, maxStart)}
                step={0.1}
                disabled={busy || maxStart <= 0}
              />
            </div>
            <div>
              <div className="mb-2 flex justify-between text-[13px]">
                <span>Volumen</span>
                <span className="font-mono text-xs text-muted-foreground">{audioOptions.volume}%</span>
              </div>
              <Slider value={[audioOptions.volume]} onValueChange={([v]) => onAudioOptions({ volume: v })} min={0} max={100} step={1} disabled={busy} />
            </div>
            <div className="space-y-2.5 text-[13px]">
              {(
                [
                  ["fadeIn", "Entrada suave (fade in)"],
                  ["fadeOut", "Salida suave (fade out)"],
                  ["loop", "Repetir si es más corto"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <span>{label}</span>
                  <Switch checked={audioOptions[key]} disabled={busy} onCheckedChange={(v) => onAudioOptions({ [key]: v })} />
                </div>
              ))}
            </div>
            <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
              Cambiar audio
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={busy || audioLoading}
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center gap-3 rounded-xl border border-dashed border-foreground/20 p-3 text-left transition-colors hover:border-foreground/40 hover:bg-muted/50 disabled:opacity-50"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted">
              {audioLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Music className="h-4 w-4" />}
            </span>
            <span>
              <span className="block text-[13px] font-medium">{audioLoading ? "Cargando audio…" : "Agregar música o audio"}</span>
              <span className="block text-[11px] text-muted-foreground">MP3, WAV, M4A u OGG</span>
            </span>
          </button>
        )}
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
