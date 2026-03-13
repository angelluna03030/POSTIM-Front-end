import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Download, ChevronDown, ImagePlus, Type,
  RotateCcw, RotateCw, Smartphone, FlipHorizontal,

} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { DeviceType } from "@/components/DeviceFrame";
import { backgrounds, type BackgroundType } from "@/components/BackgroundPatterns";

// ────────────────────────────────────────────
// Tipos
// ────────────────────────────────────────────
interface TextWidget {
  visible: boolean;
  title: string;
  subtitle: string;
  x: number;
  y: number;
}

interface ControlPanelProps {
  device: DeviceType;
  onDeviceChange: (d: DeviceType) => void;
  onImageUpload: (file: File) => void;
  padding: number;
  onPaddingChange: (v: number) => void;
  background: BackgroundType;
  onBackgroundChange: (b: BackgroundType) => void;
  bgOpacity: number;                    // NUEVO
  onBgOpacityChange: (v: number) => void; // NUEVO
  frameColor: string;
  onFrameColorChange: (c: string) => void;
  shadow: boolean;
  onShadowChange: (s: boolean) => void;
  shadowSoftness: number;
  onShadowSoftnessChange: (v: number) => void;
  onExport: (format: "png" | "jpeg" | "webp") => void; // ACTUALIZADO
  format: string;
  onFormatChange: (f: string) => void;
  exporting: boolean;
  deviceScale: number;
  onDeviceScaleChange: (v: number) => void;
  deviceRotation: number;               // NUEVO
  onDeviceRotationChange: (v: number) => void; // NUEVO
  innerPadding: number;
  onInnerPaddingChange: (v: number) => void;
  borderRadius: number;
  onBorderRadiusChange: (v: number) => void;
  onBgImageUpload: (file: File) => void;
  customBgImage: string | null;
  textWidget: TextWidget;
  onTextWidgetChange: (w: TextWidget) => void;
}

// ────────────────────────────────────────────
// Sub-componentes
// ────────────────────────────────────────────
const SectionHeader = ({ children, open }: { children: React.ReactNode; open: boolean }) => (
  <CollapsibleTrigger className="flex items-center justify-between w-full py-2 group">
    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">
      {children}
    </span>
    <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
      <ChevronDown className="w-4 h-4 text-muted-foreground" />
    </motion.div>
  </CollapsibleTrigger>
);

// Botón de rotación preset
const RotateButton = ({
  label, icon: Icon, onClick,
}: { label: string; icon: React.ElementType; onClick: () => void }) => (
  <button
    onClick={onClick}
    title={label}
    className="flex-1 flex flex-col items-center gap-1 py-2 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-muted-foreground hover:text-foreground"
  >
    <Icon className="w-4 h-4" />
    <span className="text-[10px]">{label}</span>
  </button>
);

// ────────────────────────────────────────────
// Panel principal
// ────────────────────────────────────────────
const ControlPanel = ({
  device, onDeviceChange, onImageUpload,
  padding, onPaddingChange,
  background, onBackgroundChange,
  // bgOpacity, onBgOpacityChange,
  frameColor, onFrameColorChange,
  shadow, onShadowChange,
  shadowSoftness, onShadowSoftnessChange,
  onExport, format, onFormatChange, exporting,
  deviceScale, onDeviceScaleChange,
  deviceRotation, onDeviceRotationChange,
  innerPadding, onInnerPaddingChange,
  borderRadius, onBorderRadiusChange,
  onBgImageUpload, customBgImage,
  textWidget, onTextWidgetChange,
}: ControlPanelProps) => {
  const [openSections, setOpenSections] = useState({
    device: true,
    layout: true,
    style: true,
    widget: false,
    export: true,
  });
  const [exportFileFormat, setExportFileFormat] = useState<"png" | "jpeg" | "webp">("png");

  const toggle = (key: keyof typeof openSections) =>
    setOpenSections((p) => ({ ...p, [key]: !p[key] }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImageUpload(file);
  };

  const handleBgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onBgImageUpload(file);
  };

  // Rotación: snap a múltiplos de 90° o libre
  const snapRotate = (angle: number) => {
    onDeviceRotationChange((deviceRotation + angle + 360) % 360);
  };

  return (
    <div className="flex flex-col gap-3 w-full">

      {/* ── 1. Dispositivo y Screenshot ── */}
      <Collapsible open={openSections.device} onOpenChange={() => toggle("device")}>
        <motion.div
          className="glass-panel rounded-xl p-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0, duration: 0.4 }}
        >
          <SectionHeader open={openSections.device}>1. Dispositivo y Screenshot</SectionHeader>
          <CollapsibleContent>
            <div className="space-y-3 pt-2">
              <Select value={device} onValueChange={(v) => onDeviceChange(v as DeviceType)}>
                <SelectTrigger className="bg-background/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="iphone15">iPhone 15 Pro</SelectItem>
                  <SelectItem value="pixel8">Pixel 8</SelectItem>
                  <SelectItem value="ipad">iPad Pro</SelectItem>
                  <SelectItem value="macbook">MacBook Pro</SelectItem>
                </SelectContent>
              </Select>

              <label className="flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed border-primary/30 rounded-lg p-3 hover:border-primary/60 transition-colors">
                <Upload className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Subir captura</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          </CollapsibleContent>
        </motion.div>
      </Collapsible>

      {/* ── 2. Layout, Márgenes y Rotación ── */}
      <Collapsible open={openSections.layout} onOpenChange={() => toggle("layout")}>
        <motion.div
          className="glass-panel rounded-xl p-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4 }}
        >
          <SectionHeader open={openSections.layout}>2. Layout y Márgenes</SectionHeader>
          <CollapsibleContent>
            <div className="space-y-4 pt-2">

              {/* Escala */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-medium">Escala del dispositivo</span>
                  <span className="text-sm text-muted-foreground">{deviceScale.toFixed(2)}x</span>
                </div>
                <Slider
                  value={[deviceScale * 100]}
                  onValueChange={([v]) => onDeviceScaleChange(v / 100)}
                  min={50} max={120} step={1}
                />
              </div>

              {/* ── ROTACIÓN (nueva sección) ── */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Rotación</span>
                  <span className="text-sm text-muted-foreground font-mono">{deviceRotation}°</span>
                </div>
                {/* Slider de ángulo libre */}
                <Slider
                  value={[deviceRotation]}
                  onValueChange={([v]) => onDeviceRotationChange(v)}
                  min={0} max={360} step={1}
                  className="mb-3"
                />
                {/* Botones de preset */}
                <div className="flex gap-1.5">
                  <RotateButton
                    label="0°"
                    icon={Smartphone}
                    onClick={() => onDeviceRotationChange(0)}
                  />
                  <RotateButton
                    label="-90°"
                    icon={RotateCcw}
                    onClick={() => snapRotate(-90)}
                  />
                  <RotateButton
                    label="+90°"
                    icon={RotateCw}
                    onClick={() => snapRotate(90)}
                  />
                  <RotateButton
                    label="180°"
                    icon={FlipHorizontal}
                    onClick={() => onDeviceRotationChange(180)}
                  />
                </div>
              </div>

              {/* Padding externo */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-medium">Padding externo</span>
                  <span className="text-sm text-muted-foreground">{padding}%</span>
                </div>
                <Slider
                  value={[padding]}
                  onValueChange={([v]) => onPaddingChange(v)}
                  min={0} max={15} step={0.5}
                />
              </div>

              {/* Padding interno */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-medium">Padding interno</span>
                  <span className="text-sm text-muted-foreground">{innerPadding}px</span>
                </div>
                <Slider
                  value={[innerPadding]}
                  onValueChange={([v]) => onInnerPaddingChange(v)}
                  min={0} max={30} step={1}
                />
              </div>

              {/* Border Radius */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-medium">Border Radius</span>
                  <span className="text-sm text-muted-foreground">{borderRadius}px</span>
                </div>
                <Slider
                  value={[borderRadius]}
                  onValueChange={([v]) => onBorderRadiusChange(v)}
                  min={0} max={40} step={1}
                />
              </div>
            </div>
          </CollapsibleContent>
        </motion.div>
      </Collapsible>

      {/* ── 3. Fondo y Estilo ── */}
      <Collapsible open={openSections.style} onOpenChange={() => toggle("style")}>
        <motion.div
          className="glass-panel rounded-xl p-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.4 }}
        >
          <SectionHeader open={openSections.style}>3. Fondo y Estilo</SectionHeader>
          <CollapsibleContent>
            <div className="space-y-4 pt-2">

              {/* Presets de fondo */}
              <div>
                <span className="text-sm font-medium block mb-2">Fondo</span>
                <div className="flex gap-2 flex-wrap">
                  {(Object.keys(backgrounds) as Array<keyof typeof backgrounds>).map((key) => (
                    <button
                      key={key}
                      onClick={() => onBackgroundChange(key)}
                      className={`w-12 h-12 rounded-lg border-2 transition-all ${
                        background === key
                          ? "border-primary scale-105 shadow-soft"
                          : "border-border hover:border-primary/40"
                      }`}
                      style={{ background: backgrounds[key].preview }}
                      title={backgrounds[key].label}
                    />
                  ))}
                  {/* Custom bg */}
                  <label
                    className={`w-12 h-12 rounded-lg border-2 transition-all flex items-center justify-center cursor-pointer ${
                      background === "custom"
                        ? "border-primary scale-105 shadow-soft"
                        : "border-border hover:border-primary/40"
                    }`}
                    style={
                      customBgImage
                        ? { backgroundImage: `url(${customBgImage})`, backgroundSize: "cover" }
                        : { background: "hsl(var(--muted))" }
                    }
                    title="Subir imagen de fondo"
                  >
                    {!customBgImage && <ImagePlus className="w-4 h-4 text-muted-foreground" />}
                    <input type="file" accept="image/*" className="hidden" onChange={handleBgFileChange} />
                  </label>
                </div>
              </div>

              {/* ── OPACIDAD del fondo (nueva) ── */}
              {/* <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-medium">Opacidad del fondo</span>
                  <span className="text-sm text-muted-foreground">{Math.round(bgOpacity * 100)}%</span>
                </div>
                <Slider
                  value={[bgOpacity * 100]}
                  onValueChange={([v]) => onBgOpacityChange(v / 100)}
                  min={10} max={100} step={1}
                />
              </div> */}

              {/* Color del marco */}
              <div>
                <span className="text-sm font-medium block mb-2">Color del marco</span>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={frameColor}
                    onChange={(e) => onFrameColorChange(e.target.value)}
                    className="w-10 h-10 rounded-lg border-2 border-border cursor-pointer p-0.5"
                  />
                  <span className="text-sm text-muted-foreground font-mono">{frameColor}</span>
                </div>
              </div>

              {/* Sombra */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sombra</span>
                <Switch checked={shadow} onCheckedChange={onShadowChange} />
              </div>

              <AnimatePresence>
                {shadow && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm text-muted-foreground">Suavidad</span>
                      <span className="text-sm text-muted-foreground">{shadowSoftness}%</span>
                    </div>
                    <Slider
                      value={[shadowSoftness]}
                      onValueChange={([v]) => onShadowSoftnessChange(v)}
                      min={5} max={100} step={1}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CollapsibleContent>
        </motion.div>
      </Collapsible>

      {/* ── 4. Widget de Texto ── */}
      <Collapsible open={openSections.widget} onOpenChange={() => toggle("widget")}>
        <motion.div
          className="glass-panel rounded-xl p-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.4 }}
        >
          <SectionHeader open={openSections.widget}>4. Widget de Texto</SectionHeader>
          <CollapsibleContent>
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Mostrar widget</span>
                </div>
                <Switch
                  checked={textWidget.visible}
                  onCheckedChange={(v) =>
                    onTextWidgetChange({ ...textWidget, visible: v })
                  }
                />
              </div>

              <AnimatePresence>
                {textWidget.visible && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    {/* Edición inline del título/subtítulo desde el panel */}
                    <input
                      type="text"
                      value={textWidget.title}
                      onChange={(e) =>
                        onTextWidgetChange({ ...textWidget, title: e.target.value })
                      }
                      placeholder="Título..."
                      className="w-full text-sm bg-background/60 border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <input
                      type="text"
                      value={textWidget.subtitle}
                      onChange={(e) =>
                        onTextWidgetChange({ ...textWidget, subtitle: e.target.value })
                      }
                      placeholder="Subtítulo..."
                      className="w-full text-sm bg-background/60 border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <p className="text-xs text-muted-foreground">
                      Arrástralo sobre el mockup para reposicionarlo.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CollapsibleContent>
        </motion.div>
      </Collapsible>

      {/* ── 5. Exportar ── */}
      <Collapsible open={openSections.export} onOpenChange={() => toggle("export")}>
        <motion.div
          className="glass-panel rounded-xl p-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.4 }}
        >
          <SectionHeader open={openSections.export}>5. Exportar</SectionHeader>
          <CollapsibleContent>
            <div className="space-y-3 pt-2">
              {/* Formato del canvas (aspect ratio) */}
              <Select value={format} onValueChange={onFormatChange}>
                <SelectTrigger className="bg-background/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="square">Cuadrado (1:1)</SelectItem>
                  <SelectItem value="portrait">Retrato (4:5)</SelectItem>
                  <SelectItem value="story">Historia (9:16)</SelectItem>
                </SelectContent>
              </Select>

              {/* ── Formato de archivo (nuevo) ── */}
              <div>
                <span className="text-xs text-muted-foreground mb-1.5 block">Formato de archivo</span>
                <div className="flex gap-1.5">
                  {(["png", "jpeg", "webp"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setExportFileFormat(fmt)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        exportFileFormat === fmt
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
                {exportFileFormat === "jpeg" && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    JPEG no soporta transparencia — el fondo siempre será sólido.
                  </p>
                )}
              </div>

              <Button
                onClick={() => onExport(exportFileFormat)}
                disabled={exporting}
                className="w-full gradient-instagram border-0 text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
              >
                <Download className="w-4 h-4 mr-2" />
                {exporting ? "Exportando..." : `Descargar ${exportFileFormat.toUpperCase()}`}
              </Button>
            </div>
          </CollapsibleContent>
        </motion.div>
      </Collapsible>
    </div>
  );
};

export default ControlPanel;