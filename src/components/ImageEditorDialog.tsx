import { useRef, useState } from "react";
import { FlipHorizontal2, Move, RotateCcw, RotateCw, Undo2, ZoomIn } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { deviceConfigs } from "@/lib/devices";
import { DEFAULT_ADJUST, IMAGE_FILTERS, adjustedImageStyle, type ImageAdjust } from "@/lib/image-adjust";
import type { DeviceItem } from "@/lib/mockup";
import { cn } from "@/lib/utils";

interface ImageEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device: DeviceItem;
  image: string;
  onChange: (patch: Partial<DeviceItem>) => void;
  onReplace: () => void;
}

type Tab = "adjust" | "color" | "filters";

const Row = ({ label, value, onReset, children }: { label: string; value: string; onReset: () => void; children: React.ReactNode }) => (
  <div>
    <div className="mb-2 flex items-center justify-between text-[13px]">
      <span>{label}</span>
      <button type="button" onDoubleClick={onReset} title="Doble clic para restablecer" className="rounded px-1 font-mono text-xs text-muted-foreground hover:bg-muted">
        {value}
      </button>
    </div>
    {children}
  </div>
);

/** Vista previa con la proporción de la pantalla del dispositivo; se arrastra para encuadrar y la rueda hace zoom */
const Preview = ({ device, image, adjust, onAdjust }: { device: DeviceItem; image: string; adjust: ImageAdjust; onAdjust: (p: Partial<ImageAdjust>) => void }) => {
  const cfg = deviceConfigs[device.type];
  const aspect = (cfg.width - cfg.bezel * 2) / (cfg.height - cfg.bezel * 2 - (device.type === "macbook" ? 30 : device.type === "browser" ? 36 : 0));
  const drag = useRef<{ x: number; y: number; ax: number; ay: number; w: number; h: number } | null>(null);

  return (
    <div className="grid h-full min-h-[320px] place-items-center rounded-2xl bg-muted/60 bg-dots p-6">
      <div
        className="relative max-h-[52vh] w-full cursor-grab touch-none overflow-hidden rounded-[18px] bg-white shadow-xl ring-1 ring-black/10 active:cursor-grabbing"
        style={{ aspectRatio: String(aspect), maxWidth: `calc(52vh * ${aspect})`, containerType: "size" }}
        onPointerDown={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          drag.current = { x: e.clientX, y: e.clientY, ax: adjust.x, ay: adjust.y, w: r.width, h: r.height };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const clamp = (v: number) => Math.max(-100, Math.min(100, Math.round(v * 10) / 10));
          onAdjust({ x: clamp(d.ax + ((e.clientX - d.x) / d.w) * 100), y: clamp(d.ay + ((e.clientY - d.y) / d.h) * 100) });
        }}
        onPointerUp={() => (drag.current = null)}
        onWheel={(e) => onAdjust({ zoom: Math.max(1, Math.min(3, Math.round((adjust.zoom - e.deltaY * 0.0015) * 100) / 100)) })}
      >
        <img src={image} alt="" draggable={false} className="select-none" style={adjustedImageStyle(adjust, device.imageFit)} />
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Move className="h-3.5 w-3.5" /> Arrastra para encuadrar · rueda para acercar
      </p>
    </div>
  );
};

const ImageEditorDialog = ({ open, onOpenChange, device, image, onChange, onReplace }: ImageEditorDialogProps) => {
  const [tab, setTab] = useState<Tab>("adjust");
  const a = device.adjust;
  const set = (patch: Partial<ImageAdjust>) => onChange({ adjust: { ...a, ...patch } });
  const rotate = (delta: number) => set({ rotate: ((((a.rotate + delta) % 360) + 360) % 360) as ImageAdjust["rotate"] });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-4 text-left">
          <DialogTitle className="text-base">Editar imagen</DialogTitle>
          <DialogDescription className="text-xs">Los cambios se ven en vivo en el mockup.</DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[78vh] overflow-y-auto md:grid-cols-[1fr_300px]">
          <div className="p-4">
            <Preview device={device} image={image} adjust={a} onAdjust={set} />
          </div>

          <div className="flex flex-col border-t border-border md:border-l md:border-t-0">
            <div className="grid grid-cols-3 gap-0.5 border-b border-border p-3">
              {(
                [
                  ["adjust", "Ajustar"],
                  ["color", "Color"],
                  ["filters", "Filtros"],
                ] as [Tab, string][]
              ).map(([v, l]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setTab(v)}
                  className={cn("h-8 rounded-md text-xs font-medium transition-colors", tab === v ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted")}
                >
                  {l}
                </button>
              ))}
            </div>

            <div className="flex-1 space-y-5 p-5">
              {tab === "adjust" && (
                <>
                  <Row label="Zoom" value={`${Math.round(a.zoom * 100)}%`} onReset={() => set({ zoom: 1, x: 0, y: 0 })}>
                    <div className="flex items-center gap-2">
                      <ZoomIn className="h-3.5 w-3.5 text-muted-foreground" />
                      <Slider value={[a.zoom * 100]} onValueChange={([v]) => set({ zoom: v / 100 })} min={100} max={300} step={1} />
                    </div>
                  </Row>
                  <Row label="Posición horizontal" value={`${Math.round(a.x)}%`} onReset={() => set({ x: 0 })}>
                    <Slider value={[a.x]} onValueChange={([v]) => set({ x: v })} min={-100} max={100} step={0.5} />
                  </Row>
                  <Row label="Posición vertical" value={`${Math.round(a.y)}%`} onReset={() => set({ y: 0 })}>
                    <Slider value={[a.y]} onValueChange={([v]) => set({ y: v })} min={-100} max={100} step={0.5} />
                  </Row>
                  <div>
                    <div className="mb-2 text-[13px]">Orientación</div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button type="button" onClick={() => rotate(-90)} className="flex h-9 items-center justify-center gap-1 rounded-lg border border-border text-xs hover:bg-muted">
                        <RotateCcw className="h-3.5 w-3.5" /> -90°
                      </button>
                      <button type="button" onClick={() => rotate(90)} className="flex h-9 items-center justify-center gap-1 rounded-lg border border-border text-xs hover:bg-muted">
                        <RotateCw className="h-3.5 w-3.5" /> +90°
                      </button>
                      <button
                        type="button"
                        onClick={() => set({ flipX: !a.flipX })}
                        className={cn("flex h-9 items-center justify-center gap-1 rounded-lg border text-xs", a.flipX ? "border-foreground bg-foreground text-background" : "border-border hover:bg-muted")}
                      >
                        <FlipHorizontal2 className="h-3.5 w-3.5" /> Voltear
                      </button>
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 text-[13px]">Ajuste en la pantalla</div>
                    <div className="grid grid-cols-2 rounded-lg bg-muted p-0.5">
                      {(["cover", "contain"] as const).map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => onChange({ imageFit: f })}
                          className={cn("h-7 rounded-md text-xs font-medium", device.imageFit === f ? "bg-background shadow-sm" : "text-muted-foreground")}
                        >
                          {f === "cover" ? "Cubrir" : "Contener"}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {tab === "color" && (
                <>
                  <Row label="Brillo" value={`${a.brightness}%`} onReset={() => set({ brightness: 100 })}>
                    <Slider value={[a.brightness]} onValueChange={([v]) => set({ brightness: v })} min={40} max={160} step={1} />
                  </Row>
                  <Row label="Contraste" value={`${a.contrast}%`} onReset={() => set({ contrast: 100 })}>
                    <Slider value={[a.contrast]} onValueChange={([v]) => set({ contrast: v })} min={40} max={160} step={1} />
                  </Row>
                  <Row label="Saturación" value={`${a.saturation}%`} onReset={() => set({ saturation: 100 })}>
                    <Slider value={[a.saturation]} onValueChange={([v]) => set({ saturation: v })} min={0} max={200} step={1} />
                  </Row>
                  <Row label="Desenfoque" value={`${a.blur}px`} onReset={() => set({ blur: 0 })}>
                    <Slider value={[a.blur]} onValueChange={([v]) => set({ blur: v })} min={0} max={12} step={0.5} />
                  </Row>
                </>
              )}

              {tab === "filters" && (
                <div className="grid grid-cols-3 gap-2">
                  {IMAGE_FILTERS.map((f) => (
                    <button key={f.value} type="button" onClick={() => set({ filter: f.value })} className="group text-center">
                      <div
                        className={cn(
                          "aspect-square overflow-hidden rounded-lg ring-offset-2 transition-all",
                          a.filter === f.value ? "ring-2 ring-foreground" : "ring-1 ring-black/10 group-hover:ring-black/30",
                        )}
                      >
                        <img src={image} alt="" className="h-full w-full object-cover" style={{ filter: f.css || undefined }} />
                      </div>
                      <span className="mt-1 block text-[11px] text-muted-foreground">{f.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-border p-4">
              <button
                type="button"
                onClick={() => onChange({ adjust: DEFAULT_ADJUST })}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Undo2 className="h-3.5 w-3.5" /> Restablecer
              </button>
              <div className="flex gap-2">
                <button type="button" onClick={onReplace} className="h-9 rounded-lg border border-border px-3 text-xs hover:bg-muted">
                  Cambiar imagen
                </button>
                <button type="button" onClick={() => onOpenChange(false)} className="h-9 rounded-lg bg-foreground px-4 text-xs font-medium text-background">
                  Listo
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageEditorDialog;
