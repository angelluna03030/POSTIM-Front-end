import { forwardRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, easeIn, cubicBezier, useMotionValue, animate } from "framer-motion";
import { DeviceFrame, type DeviceType } from "@/components/DeviceFrame";
import { getBackgroundStyle, type BackgroundType } from "@/components/BackgroundPatterns";
import DraggableTextWidget from "@/components/DraggableTextWidget";

interface TextWidget {
  visible: boolean;
  title: string;
  subtitle: string;
  // Posición como % del canvas (0-100) — clave para export correcto
  x: number;
  y: number;
}

interface MockupPreviewProps {
  device: DeviceType;
  image: string | null;
  padding: number;
  background: BackgroundType;
  frameColor: string;
  shadow: boolean;
  shadowSoftness: number;
  format: string;
  deviceScale: number;
  deviceRotation: number; // NUEVO: ángulo en grados
  innerPadding: number;
  borderRadius: number;
  customBgImage: string | null;
  textWidget: TextWidget;
  onTextWidgetChange: (w: TextWidget) => void;
}

const ASPECT_RATIOS: Record<string, { width: number; height: number }> = {
  square:   { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1350 },
  story:    { width: 1080, height: 1920 },
};

const deviceVariants = {
  initial: { opacity: 0, scale: 0.88, y: 16, filter: "blur(4px)" },
  animate: {
    opacity: 1, scale: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.45, ease: cubicBezier(0.34, 1.56, 0.64, 1) },
  },
  exit: {
    opacity: 0, scale: 0.92, y: -8, filter: "blur(2px)",
    transition: { duration: 0.2, ease: easeIn },
  },
};

const MockupPreview = forwardRef<HTMLDivElement, MockupPreviewProps>(
  (
    {
      device, image, padding, background, frameColor,
      shadow, shadowSoftness, format, deviceScale, deviceRotation,
      innerPadding, borderRadius, customBgImage, textWidget, onTextWidgetChange,
    },
    ref
  ) => {
    const ratio = ASPECT_RATIOS[format] ?? ASPECT_RATIOS.square;
    const aspectDecimal = ratio.width / ratio.height;
const rotation = useMotionValue(deviceRotation);

useEffect(() => {
  animate(rotation, deviceRotation, {
    duration: 0.4,
    ease: [0.34, 1.56, 0.64, 1],
  });
}, [deviceRotation]);

const scale = useMotionValue(deviceScale);
useEffect(() => {
  animate(scale, deviceScale, { duration: 0.3 });
}, [deviceScale]);
    // Cuando el widget se mueve, guardamos posición como % del canvas
    // Esto garantiza que export y preview sean idénticos
    const handleWidgetMove = useCallback(
      (xPx: number, yPx: number) => {
        const canvas = (ref as React.RefObject<HTMLDivElement>).current;
        if (!canvas) return;
        const { width, height } = canvas.getBoundingClientRect();
        onTextWidgetChange({
          ...textWidget,
          x: Math.max(0, Math.min(100, (xPx / width) * 100)),
          y: Math.max(0, Math.min(100, (yPx / height) * 100)),
        });
      },
      [ref, textWidget, onTextWidgetChange]
    );

    return (
      <div className="flex items-center justify-center w-full h-full">
        <motion.div
          layout
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative overflow-hidden rounded-2xl shadow-elevated"
          style={{
            aspectRatio: `${ratio.width} / ${ratio.height}`,
            width: aspectDecimal >= 1 ? "100%" : undefined,
            height: aspectDecimal < 1 ? "100%" : undefined,
            maxWidth: "100%",
            maxHeight: "100%",
            willChange: "transform",
          }}
        >
          {/* ── Export target ── */}
          <div
            ref={ref}
            className="relative w-full h-full flex items-center justify-center"
            style={{
              ...getBackgroundStyle(background, customBgImage),
              padding: `${padding}%`,
            }}
          >
    <AnimatePresence mode="wait">
<motion.div
  key={device}
  variants={deviceVariants}
  initial="initial"
  animate="animate"
  exit="exit"
  style={{
    rotate: rotation,   // ← Framer lo mezcla correctamente con variants
    scale: scale,
    maxWidth: "100%",
    maxHeight: "100%",
  }}
>
                <DeviceFrame
                  device={device}
                  image={image}
                  shadow={shadow}
                  shadowSoftness={shadowSoftness}
                  frameColor={frameColor}
                  innerPadding={innerPadding}
                  screenshotBorderRadius={borderRadius}
                />
              </motion.div>
            </AnimatePresence>

            {/* 
              Widget posicionado con % absolutos dentro del canvas.
              position: absolute + left/top en % = idéntico en preview y export.
            */}
            {textWidget.visible && (
              <DraggableTextWidget
                canvasRef={ref as React.RefObject<HTMLDivElement>}
                title={textWidget.title}
                subtitle={textWidget.subtitle}
                // Posición inicial desde estado (% del canvas)
                initialX={textWidget.x}
                initialY={textWidget.y}
                onMove={handleWidgetMove}
                onTitleChange={(title) => onTextWidgetChange({ ...textWidget, title })}
                onSubtitleChange={(subtitle) => onTextWidgetChange({ ...textWidget, subtitle })}
                visible={textWidget.visible}
              />
            )}
          </div>
        </motion.div>
      </div>
    );
  }
);

MockupPreview.displayName = "MockupPreview";
export default MockupPreview;