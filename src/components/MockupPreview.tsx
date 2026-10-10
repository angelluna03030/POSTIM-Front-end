import { forwardRef, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DeviceFrame } from "@/components/DeviceFrame";
import { deviceConfigs } from "@/lib/devices";
import { BackgroundEffects } from "@/components/BackgroundPatterns";
import { getBackgroundStyle } from "@/lib/backgrounds";
import TextOverlay from "@/components/TextOverlay";
import { CANVAS_FORMATS, type CanvasItem, type DeviceItem, type MockupSettings, type TextItem } from "@/lib/mockup";

interface MockupPreviewProps {
  settings: MockupSettings;
  images: Record<string, string>;
  customBgImage: string | null;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onItemChange: (id: string, patch: Partial<DeviceItem> | Partial<TextItem>) => void;
  onRequestUpload: (deviceId: string) => void;
  /** Capa que cubre el lienzo (la vista 3D) */
  overlay?: React.ReactNode;
}

const useElementSize = (ref: React.RefObject<HTMLElement>) => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Contenedor arrastrable posicionado por su centro en % del lienzo */
const Draggable = ({
  item,
  canvasRef,
  selected,
  onSelect,
  onMove,
  onDoubleClick,
  style,
  children,
}: {
  item: CanvasItem;
  canvasRef: React.RefObject<HTMLDivElement>;
  selected: boolean;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
  onDoubleClick?: () => void;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) => {
  const drag = useRef<{ dx: number; dy: number; moved: boolean } | null>(null);

  const toPercent = (e: React.PointerEvent) => {
    const r = canvasRef.current?.getBoundingClientRect();
    if (!r) return null;
    return { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 };
  };

  return (
    <div
      data-item="true"
      className="absolute touch-none select-none"
      style={{ left: `${item.x}%`, top: `${item.y}%`, transform: "translate(-50%, -50%)", cursor: selected ? "move" : "pointer", ...style }}
      onPointerDown={(e) => {
        e.stopPropagation();
        onSelect();
        const p = toPercent(e);
        if (!p) return;
        drag.current = { dx: p.x - item.x, dy: p.y - item.y, moved: false };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!drag.current) return;
        const p = toPercent(e);
        if (!p) return;
        drag.current.moved = true;
        onMove(clamp(p.x - drag.current.dx, -10, 110), clamp(p.y - drag.current.dy, -10, 110));
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
      onDoubleClick={onDoubleClick}
    >
      {children}
      {selected && (
        <div data-ui="true" className="pointer-events-none absolute -inset-1.5 rounded-lg border-[1.5px] border-sky-500">
          {[
            "-left-1 -top-1",
            "-right-1 -top-1",
            "-left-1 -bottom-1",
            "-right-1 -bottom-1",
          ].map((pos) => (
            <span key={pos} className={`absolute h-2 w-2 rounded-sm border-[1.5px] border-sky-500 bg-white ${pos}`} />
          ))}
        </div>
      )}
    </div>
  );
};

const MockupPreview = forwardRef<HTMLDivElement, MockupPreviewProps>(
  ({ settings, images, customBgImage, selectedId, onSelect, onItemChange, onRequestUpload, overlay }, ref) => {
    const areaRef = useRef<HTMLDivElement>(null);
    const area = useElementSize(areaRef);
    const canvasRef = ref as React.RefObject<HTMLDivElement>;

    const ratio = CANVAS_FORMATS[settings.format];
    const aspect = ratio.width / ratio.height;

    // Lienzo: lo más grande posible dentro del área disponible, respetando la proporción
    let canvasW = area.width;
    let canvasH = canvasW / aspect;
    if (canvasH > area.height) {
      canvasH = area.height;
      canvasW = canvasH * aspect;
    }

    const pad = (settings.padding / 100) * Math.min(canvasW, canvasH);
    const availW = Math.max(0, canvasW - pad * 2);
    const availH = Math.max(0, canvasH - pad * 2);
    const textScale = canvasW / ratio.width;

    return (
      <div ref={areaRef} className="relative flex h-full w-full items-center justify-center">
        {canvasW > 0 && (
          <div
            className="relative overflow-hidden rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.06),0_24px_64px_-24px_rgba(0,0,0,0.25)] ring-1 ring-black/5"
            style={{ width: canvasW, height: canvasH }}
          >
            {/* ── Nodo exportado ── */}
            <div
              ref={ref}
              className="relative h-full w-full overflow-hidden"
              style={getBackgroundStyle(settings.background, { customBgImage, color: settings.bgColor })}
              onPointerDown={() => onSelect(null)}
            >
              <BackgroundEffects
                grain={settings.grain}
                vignette={settings.vignette}
                blur={settings.bgBlur}
                customBgImage={customBgImage}
                isCustom={settings.background === "custom"}
              />
              {settings.devices.map((d, index) => {
                const cfg = deviceConfigs[d.type];
                const fit = Math.min(availW / cfg.width, availH / cfg.height);
                const s = fit * d.scale;
                return (
                  <Draggable
                    key={d.id}
                    item={d}
                    canvasRef={canvasRef}
                    selected={selectedId === d.id}
                    onSelect={() => onSelect(d.id)}
                    onMove={(x, y) => onItemChange(d.id, { x, y })}
                    onDoubleClick={() => onRequestUpload(d.id)}
                    style={{ width: cfg.width * s, height: cfg.height * s, zIndex: index + 1 }}
                  >
                    <motion.div
                      className="absolute left-1/2 top-1/2"
                      style={{ width: cfg.width, height: cfg.height, x: "-50%", y: "-50%", transformPerspective: 1800 }}
                      initial={false}
                      animate={{ scale: s, rotate: d.rotation, rotateX: d.tiltX, rotateY: d.tiltY }}
                      transition={{ type: "spring", stiffness: 260, damping: 30 }}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                          key={d.type}
                          data-device-snap={d.id}
                          initial={{ opacity: 0, y: 24 }}
                          animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}
                          exit={{ opacity: 0, y: -12, transition: { duration: 0.12 } }}
                        >
                          <DeviceFrame
                            device={d.type}
                            image={images[d.id] ?? null}
                            shadow={d.shadow}
                            shadowSoftness={d.shadowSoftness}
                            frameColor={d.frameColor}
                            variant={d.style}
                            adjust={d.adjust}
                            snapId={d.id}
                            innerPadding={d.innerPadding}
                            screenshotBorderRadius={d.borderRadius}
                            imageFit={d.imageFit}
                          />
                        </motion.div>
                      </AnimatePresence>
                    </motion.div>
                  </Draggable>
                );
              })}

              {settings.texts.map((t, index) => (
                <Draggable
                  key={t.id}
                  item={t}
                  canvasRef={canvasRef}
                  selected={selectedId === t.id}
                  onSelect={() => onSelect(t.id)}
                  onMove={(x, y) => onItemChange(t.id, { x, y })}
                  style={{ zIndex: 100 + index }}
                >
                  <div style={{ zoom: textScale * t.scale }}>
                    <div data-text-snap={t.id}>
                      <TextOverlay item={t} />
                    </div>
                  </div>
                </Draggable>
              ))}
            </div>
            {overlay && <div className="absolute inset-0 z-[200]">{overlay}</div>}
          </div>
        )}
      </div>
    );
  },
);

MockupPreview.displayName = "MockupPreview";
export default MockupPreview;
