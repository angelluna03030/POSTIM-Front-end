import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { toPng } from "html-to-image";
import ControlPanel from "@/components/ControlPanel";
import MockupPreview from "@/components/MockupPreview";
import type { DeviceType } from "@/components/DeviceFrame";
import type { BackgroundType } from "@/components/BackgroundPatterns";

const aspectRatios: Record<string, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
};

const Index = () => {
  const [device, setDevice] = useState<DeviceType>("iphone15");
  const [image, setImage] = useState<string | null>(null);
  const [padding, setPadding] = useState(10);
  const [background, setBackground] = useState<BackgroundType>("gradient-warm");
  const [frameColor, setFrameColor] = useState("#1a1a1a");
  const [shadow, setShadow] = useState(true);
  const [shadowSoftness, setShadowSoftness] = useState(100);
  const [format, setFormat] = useState("portrait");
  const [exporting, setExporting] = useState(false);
  const [deviceScale, setDeviceScale] = useState(1);
  const [innerPadding, setInnerPadding] = useState(0);
  const [borderRadius, setBorderRadius] = useState(0);
  const [customBgImage, setCustomBgImage] = useState<string | null>(null);
const [textWidget, setTextWidget] = useState({ visible: false, title: "Contacto", subtitle: "Escríbenos un mensaje", x: 0, y: 0 });

const canvasRef = useRef<HTMLDivElement>(null);

  const previewRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleBgImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setCustomBgImage(e.target?.result as string);
      setBackground("custom");
    };
    reader.readAsDataURL(file);
  }, []);

  const handleExport = useCallback(async () => {
    if (!previewRef.current) return;
    setExporting(true);
    try {
      const ratio = aspectRatios[format];
      const dataUrl = await toPng(previewRef.current, {
        width: ratio.width,
        height: ratio.height,
        pixelRatio: 1,
        cacheBust: true,
        style: {
          width: `${ratio.width}px `,
          height: `${ratio.height}px`,
        },
      });
      const link = document.createElement("a");
      link.download = `postim-mockup-${format}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  }, [format]);

  return (
    <div className="min-h-screen bg-background">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-border/50"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg gradient-instagram flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">P</span>
          </div>
         <a href="/" className="text-2xl font-extrabold gradient-text">
          POSTIM
        </a>
        </div>
        <p className="hidden md:block text-sm text-muted-foreground">
          Crea mockups perfectos para Instagram
        </p>
      </motion.header>

      <main className="flex flex-col lg:flex-row gap-6 p-4 md:p-8 max-w-[1440px] mx-auto" style={{ minHeight: "calc(100vh - 65px)" }}>
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full lg:w-[360px] shrink-0 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 100px)" }}
        >
          <ControlPanel
            device={device}
            onDeviceChange={setDevice}
            onImageUpload={handleImageUpload}
            padding={padding}
            onPaddingChange={setPadding}
            background={background}
            onBackgroundChange={setBackground}
            frameColor={frameColor}
            onFrameColorChange={setFrameColor}
            shadow={shadow}
            onShadowChange={setShadow}
            shadowSoftness={shadowSoftness}
            onShadowSoftnessChange={setShadowSoftness}
            onExport={handleExport}
            format={format}
            onFormatChange={setFormat}
            exporting={exporting}
            deviceScale={deviceScale}
            onDeviceScaleChange={setDeviceScale}
            innerPadding={innerPadding}
            onInnerPaddingChange={setInnerPadding}
            borderRadius={borderRadius}
            onBorderRadiusChange={setBorderRadius}
            onBgImageUpload={handleBgImageUpload}
            customBgImage={customBgImage}
            textWidget={textWidget}
            onTextWidgetChange={setTextWidget} bgOpacity={0} onBgOpacityChange={function (v: number): void {
              throw new Error("Function not implemented.");
            } } deviceRotation={0} onDeviceRotationChange={function (v: number): void {
              throw new Error("Function not implemented.");
            } }          />
        </motion.aside>

        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1 flex items-center justify-center rounded-2xl glass-panel p-6 min-h-[400px] lg:min-h-0"
        >
          <MockupPreview
            ref={previewRef}
            device={device}
            image={image}
            padding={padding}
            background={background}
            frameColor={frameColor}
            shadow={shadow}
            shadowSoftness={shadowSoftness}
            format={format}
            deviceScale={deviceScale}
            innerPadding={innerPadding}
            borderRadius={borderRadius}
            customBgImage={customBgImage}
            textWidget={textWidget}
            onTextWidgetChange={setTextWidget} deviceRotation={0}          />
        </motion.section>
      </main>
    </div>
  );
};

export default Index;
