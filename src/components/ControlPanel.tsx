import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Download, ChevronDown, ImagePlus, Type } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { DeviceType } from "@/components/DeviceFrame";
import { backgrounds, type BackgroundType } from "@/components/BackgroundPatterns";

interface ControlPanelProps {
  device: DeviceType;
  onDeviceChange: (d: DeviceType) => void;
  onImageUpload: (file: File) => void;
  padding: number;
  onPaddingChange: (v: number) => void;
  background: BackgroundType;
  onBackgroundChange: (b: BackgroundType) => void;
  frameColor: string;
  onFrameColorChange: (c: string) => void;
  shadow: boolean;
  onShadowChange: (s: boolean) => void;
  shadowSoftness: number;
  onShadowSoftnessChange: (v: number) => void;
  onExport: () => void;
  format: string;
  onFormatChange: (f: string) => void;
  exporting: boolean;
  deviceScale: number;
  onDeviceScaleChange: (v: number) => void;
  innerPadding: number;
  onInnerPaddingChange: (v: number) => void;
  borderRadius: number;
  onBorderRadiusChange: (v: number) => void;
  onBgImageUpload: (file: File) => void;
  customBgImage: string | null;
  textWidget: { visible: boolean; title: string; subtitle: string };
  onTextWidgetChange: (w: { visible: boolean; title: string; subtitle: string }) => void;
}

const SectionHeader = ({ children, open }: { children: React.ReactNode; open: boolean }) => (
  <CollapsibleTrigger className="flex items-center justify-between w-full py-2 group">
    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{children}</span>
    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
  </CollapsibleTrigger>
);

const ControlPanel = ({
  device, onDeviceChange, onImageUpload,
  padding, onPaddingChange,
  background, onBackgroundChange,
  frameColor, onFrameColorChange,
  shadow, onShadowChange,
  shadowSoftness, onShadowSoftnessChange,
  onExport, format, onFormatChange, exporting,
  deviceScale, onDeviceScaleChange,
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

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Section 1: Device + Screenshot */}
      <Collapsible open={openSections.device} onOpenChange={() => toggle("device")}>
        <motion.div className="glass-panel rounded-xl p-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0, duration: 0.4 }}>
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

      {/* Section 2: Layout & Margins */}
      <Collapsible open={openSections.layout} onOpenChange={() => toggle("layout")}>
        <motion.div className="glass-panel rounded-xl p-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.4 }}>
          <SectionHeader open={openSections.layout}>2. Layout y Márgenes</SectionHeader>
          <CollapsibleContent>
            <div className="space-y-4 pt-2">
              {/* Device Scale */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-medium">Escala del dispositivo</span>
                  <span className="text-sm text-muted-foreground">{deviceScale.toFixed(2)}x</span>
                </div>
                <Slider value={[deviceScale * 100]} onValueChange={([v]) => onDeviceScaleChange(v / 100)} min={50} max={120} step={1} />
              </div>

              {/* Padding (outer) */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-medium">Padding externo</span>
                  <span className="text-sm text-muted-foreground">{padding}px</span>
                </div>
                <Slider value={[padding]} onValueChange={([v]) => onPaddingChange(v)} min={0} max={120} step={1} />
              </div>

              {/* Inner Padding */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-medium">Padding interno</span>
                  <span className="text-sm text-muted-foreground">{innerPadding}px</span>
                </div>
                <Slider value={[innerPadding]} onValueChange={([v]) => onInnerPaddingChange(v)} min={0} max={30} step={1} />
              </div>

              {/* Border Radius */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-medium">Border Radius</span>
                  <span className="text-sm text-muted-foreground">{borderRadius}px</span>
                </div>
                <Slider value={[borderRadius]} onValueChange={([v]) => onBorderRadiusChange(v)} min={0} max={40} step={1} />
              </div>
            </div>
          </CollapsibleContent>
        </motion.div>
      </Collapsible>

      {/* Section 3: Background & Style */}
      <Collapsible open={openSections.style} onOpenChange={() => toggle("style")}>
        <motion.div className="glass-panel rounded-xl p-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16, duration: 0.4 }}>
          <SectionHeader open={openSections.style}>3. Fondo y Estilo</SectionHeader>
          <CollapsibleContent>
            <div className="space-y-4 pt-2">
              {/* Background presets */}
              <div>
                <span className="text-sm font-medium block mb-2">Fondo</span>
                <div className="flex gap-2 flex-wrap">
                  {(Object.keys(backgrounds) as Array<keyof typeof backgrounds>).map((key) => (
                    <button
                      key={key}
                      onClick={() => onBackgroundChange(key)}
                      className={`w-12 h-12 rounded-lg border-2 transition-all ${
                        background === key ? "border-primary scale-105 shadow-soft" : "border-border hover:border-primary/40"
                      }`}
                      style={{ background: backgrounds[key].preview }}
                      title={backgrounds[key].label}
                    />
                  ))}
                  {/* Custom bg button */}
                  <label
                    className={`w-12 h-12 rounded-lg border-2 transition-all flex items-center justify-center cursor-pointer ${
                      background === "custom" ? "border-primary scale-105 shadow-soft" : "border-border hover:border-primary/40"
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

              {/* Frame Color - full picker */}
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

              {/* Shadow */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sombra</span>
                <Switch checked={shadow} onCheckedChange={onShadowChange} />
              </div>

              <AnimatePresence>
                {shadow && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm text-muted-foreground">Suavidad</span>
                      <span className="text-sm text-muted-foreground">{shadowSoftness}%</span>
                    </div>
                    <Slider value={[shadowSoftness]} onValueChange={([v]) => onShadowSoftnessChange(v)} min={5} max={100} step={1} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CollapsibleContent>
        </motion.div>
      </Collapsible>

      {/* Section 4: Text Widget */}
      <Collapsible open={openSections.widget} onOpenChange={() => toggle("widget")}>
        <motion.div className="glass-panel rounded-xl p-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24, duration: 0.4 }}>
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
                  onCheckedChange={(v) => onTextWidgetChange({ ...textWidget, visible: v })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Actívalo y arrástralo sobre el mockup. Haz clic en el texto para editarlo.
              </p>
            </div>
          </CollapsibleContent>
        </motion.div>
      </Collapsible>

      {/* Section 5: Export */}
      <Collapsible open={openSections.export} onOpenChange={() => toggle("export")}>
        <motion.div className="glass-panel rounded-xl p-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32, duration: 0.4 }}>
          <SectionHeader open={openSections.export}>5. Exportar</SectionHeader>
          <CollapsibleContent>
            <div className="space-y-3 pt-2">
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
              <Button onClick={onExport} disabled={exporting} className="w-full gradient-instagram border-0 text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
                <Download className="w-4 h-4 mr-2" />
                {exporting ? "Exportando..." : "Descargar PNG"}
              </Button>
            </div>
          </CollapsibleContent>
        </motion.div>
      </Collapsible>
    </div>
  );
};

export default ControlPanel;
