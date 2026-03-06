import { forwardRef } from "react";
import { motion } from "framer-motion";
import { DeviceFrame, type DeviceType } from "@/components/DeviceFrame";
import { getBackgroundStyle, type BackgroundType } from "@/components/BackgroundPatterns";
import DraggableTextWidget from "@/components/DraggableTextWidget";

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
  innerPadding: number;
  borderRadius: number;
  customBgImage: string | null;
  textWidget: { visible: boolean; title: string; subtitle: string };
  onTextWidgetChange: (w: { visible: boolean; title: string; subtitle: string }) => void;
}

const aspectRatios: Record<string, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
};

const MockupPreview = forwardRef<HTMLDivElement, MockupPreviewProps>(
  (
    {
      device, image, padding, background, frameColor,
      shadow, shadowSoftness, format, deviceScale, innerPadding,
      borderRadius, customBgImage, textWidget, onTextWidgetChange,
    },
    ref
  ) => {
    const ratio = aspectRatios[format];
    const aspectCss = ratio.width / ratio.height;

    return (
      <div className="flex items-center justify-center w-full h-full">
        <motion.div
          layout
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative overflow-hidden rounded-2xl shadow-elevated"
          style={{
            aspectRatio: `${ratio.width} / ${ratio.height}`,
            maxHeight: "100%",
            maxWidth: "100%",
            width: aspectCss >= 1 ? "auto" : "100%",
            height: aspectCss >= 1 ? "100%" : "auto",
          }}
        >
          {/* Export target */}
          <div
            ref={ref}
            className="relative w-full h-full flex items-center justify-center"
            style={{
              ...getBackgroundStyle(background, customBgImage),
              padding: `${padding}px`,
              aspectRatio: `${ratio.width} / ${ratio.height}`,
            }}
          >
            <motion.div
              key={device}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex items-center justify-center"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                transform: `scale(${deviceScale})`,
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
                className="scale-[0.85] md:scale-100"
              />
            </motion.div>

            {/* Draggable text widget */}
            <DraggableTextWidget
              canvasRef={ref as React.RefObject<HTMLDivElement>}
              title={textWidget.title}
              subtitle={textWidget.subtitle}
              onTitleChange={(t) => onTextWidgetChange({ ...textWidget, title: t })}
              onSubtitleChange={(s) => onTextWidgetChange({ ...textWidget, subtitle: s })}
              visible={textWidget.visible}
            />
          </div>
        </motion.div>
      </div>
    );
  }
);

MockupPreview.displayName = "MockupPreview";

export default MockupPreview;
