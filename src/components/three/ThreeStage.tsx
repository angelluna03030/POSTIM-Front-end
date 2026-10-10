import { forwardRef, lazy, Suspense, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import type { MockupSettings, VideoEffect } from "@/lib/mockup";
import type { SceneSnapshot } from "@/lib/snapshot";
import type { SceneApi } from "./Scene3D";

const Scene3D = lazy(() => import("./Scene3D"));

const Spinner = ({ label }: { label: string }) => (
  <div className="absolute inset-0 grid place-items-center bg-background/40 backdrop-blur-sm">
    <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium shadow-sm">
      <Loader2 className="h-3.5 w-3.5 animate-spin" /> {label}
    </div>
  </div>
);

/** Contenedor que mide su ancho para que la escena 3D renderice a 1080 px reales */
interface ThreeStageProps {
  settings: MockupSettings;
  snapshot: SceneSnapshot | null;
  loading: boolean;
  onTilt: (id: string, tiltX: number, tiltY: number) => void;
  effect: VideoEffect;
  effectAmount: number;
}

const ThreeStage = forwardRef<SceneApi, ThreeStageProps>(
  ({ settings, snapshot, loading, onTilt, effect, effectAmount }, ref) => {
    const box = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);

    useEffect(() => {
      const el = box.current;
      if (!el) return;
      const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
      ro.observe(el);
      return () => ro.disconnect();
    }, []);

    return (
      <div ref={box} className="relative h-full w-full bg-muted">
        {snapshot && width > 0 && (
          <Suspense fallback={<Spinner label="Cargando motor 3D…" />}>
            <Scene3D ref={ref} settings={settings} snapshot={snapshot} cssWidth={width} onTilt={onTilt} effect={effect} effectAmount={effectAmount} />
          </Suspense>
        )}
        {!snapshot && <Spinner label="Preparando escena 3D…" />}
        {snapshot && loading && (
          <div className="pointer-events-none absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-background/80 shadow-sm backdrop-blur">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          </div>
        )}
      </div>
    );
  },
);
ThreeStage.displayName = "ThreeStage";

export default ThreeStage;
