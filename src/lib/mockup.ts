import { deviceConfigs, type DeviceStyle, type DeviceType } from "@/lib/devices";
import type { BackgroundType } from "@/lib/backgrounds";
import { DEFAULT_ADJUST, type ImageAdjust } from "@/lib/image-adjust";

export type CanvasFormat = "square" | "portrait" | "story" | "landscape";
export type ExportFileFormat = "png" | "jpeg" | "webp";

export const CANVAS_FORMATS: Record<CanvasFormat, { width: number; height: number; label: string; ratio: string }> = {
  square: { width: 1080, height: 1080, label: "Cuadrado", ratio: "1:1" },
  portrait: { width: 1080, height: 1350, label: "Retrato", ratio: "4:5" },
  story: { width: 1080, height: 1920, label: "Historia", ratio: "9:16" },
  landscape: { width: 1080, height: 566, label: "Horizontal", ratio: "1.91:1" },
};

export const MAX_DEVICES = 6;
export const MAX_TEXTS = 6;

export interface DeviceItem {
  id: string;
  kind: "device";
  type: DeviceType;
  /** Nivel de detalle del marco */
  style: DeviceStyle;
  /** Centro del dispositivo en % del lienzo */
  x: number;
  y: number;
  /** Tamaño relativo al máximo que cabe en el lienzo (0.15 - 1.2) */
  scale: number;
  rotation: number;
  /** Inclinación 3D en grados */
  tiltX: number;
  tiltY: number;
  frameColor: string;
  shadow: boolean;
  shadowSoftness: number;
  innerPadding: number;
  borderRadius: number;
  imageFit: "cover" | "contain";
  /** Edición básica de la captura */
  adjust: ImageAdjust;
}

export type TextStyle = "glass" | "notification" | "imessage" | "light" | "dark";

export interface TextItem {
  id: string;
  kind: "text";
  style: TextStyle;
  /** Nombre de app (notificación) */
  label: string;
  title: string;
  subtitle: string;
  x: number;
  y: number;
  scale: number;
}

export type CanvasItem = DeviceItem | TextItem;

export interface MockupSettings {
  format: CanvasFormat;
  background: BackgroundType;
  bgColor: string;
  /** Margen exterior en % del lado menor del lienzo */
  padding: number;
  /** Efectos de fondo (0-100) y desenfoque de imagen propia en px */
  grain: number;
  vignette: number;
  bgBlur: number;
  devices: DeviceItem[];
  texts: TextItem[];
}

export const uid = () => Math.random().toString(36).slice(2, 9);

export const createDevice = (patch: Partial<DeviceItem> = {}): DeviceItem => ({
  id: uid(),
  kind: "device",
  type: "iphone15",
  style: "realistic",
  x: 50,
  y: 50,
  scale: 0.85,
  rotation: 0,
  tiltX: 0,
  tiltY: 0,
  frameColor: "#18181b",
  shadow: true,
  shadowSoftness: 60,
  innerPadding: 0,
  borderRadius: 0,
  imageFit: "cover",
  ...patch,
  adjust: { ...DEFAULT_ADJUST, ...patch.adjust },
});

export const TEXT_PRESETS: Record<TextStyle, Pick<TextItem, "label" | "title" | "subtitle">> = {
  glass: { label: "", title: "Disponible ya", subtitle: "Descárgala gratis en App Store" },
  notification: { label: "Postim", title: "Tu mockup está listo ✨", subtitle: "Toca para verlo en alta calidad" },
  imessage: { label: "", title: "¡Me encanta el diseño! 😍", subtitle: "¿Ya viste la nueva app?" },
  light: { label: "", title: "Disponible ya", subtitle: "Descárgala gratis en App Store" },
  dark: { label: "", title: "Disponible ya", subtitle: "Descárgala gratis en App Store" },
};

export const createText = (style: TextStyle = "glass", patch: Partial<TextItem> = {}): TextItem => ({
  id: uid(),
  kind: "text",
  style,
  ...TEXT_PRESETS[style],
  x: 50,
  y: 86,
  scale: 1,
  ...patch,
});

export const createDefaultSettings = (): MockupSettings => ({
  format: "portrait",
  background: "mesh",
  bgColor: "#f4f4f5",
  padding: 8,
  grain: 0,
  vignette: 0,
  bgBlur: 0,
  devices: [createDevice()],
  texts: [],
});

// ────────────────────────────────────────────
// Diseños automáticos para varios dispositivos
// ────────────────────────────────────────────
export type LayoutPreset = "row" | "stagger" | "fan" | "perspective" | "cascade";

export const LAYOUT_PRESETS: { value: LayoutPreset; label: string }[] = [
  { value: "row", label: "En fila" },
  { value: "stagger", label: "Escalonado" },
  { value: "fan", label: "Abanico" },
  { value: "perspective", label: "3D" },
  { value: "cascade", label: "Cascada" },
];

/** Escala que hace caber `n` dispositivos lado a lado en el lienzo */
const rowScale = (devices: DeviceItem[], settings: MockupSettings) => {
  const { width, height } = CANVAS_FORMATS[settings.format];
  const pad = (settings.padding / 100) * Math.min(width, height);
  const availW = width - pad * 2;
  const availH = height - pad * 2;
  const n = devices.length;
  // Ancho total a escala 1 (cada uno ocupa su ancho al tamaño "fit")
  const totalW = devices.reduce((sum, d) => {
    const c = deviceConfigs[d.type];
    const fit = Math.min(availW / c.width, availH / c.height);
    return sum + c.width * fit;
  }, 0);
  return Math.min(0.9, (availW * (n > 1 ? 0.94 : 0.85)) / totalW);
};

export const applyLayout = (settings: MockupSettings, preset: LayoutPreset): DeviceItem[] => {
  const devices = settings.devices;
  const n = devices.length;
  if (n === 0) return devices;
  const base = rowScale(devices, settings);
  const spread = (i: number) => (n === 1 ? 50 : 50 + (i - (n - 1) / 2) * (80 / Math.max(n, 2)) * (n === 2 ? 1.05 : 1.12));
  const mid = (n - 1) / 2;

  return devices.map((d, i) => {
    const off = i - mid;
    const reset = { tiltX: 0, tiltY: 0, rotation: 0 };
    switch (preset) {
      case "row":
        return { ...d, ...reset, x: spread(i), y: 50, scale: base };
      case "stagger": {
        const center = Math.abs(off) < 0.6;
        return { ...d, ...reset, x: spread(i), y: center ? 47 : 54, scale: base * (center ? 1.12 : 0.92) };
      }
      case "fan":
        return { ...d, ...reset, x: 50 + off * (n > 1 ? 70 / n : 0), y: 52 + Math.abs(off) * 3, rotation: off * (n > 1 ? 24 / n : 0), scale: base * 1.15 };
      case "perspective":
        return { ...d, ...reset, x: spread(i), y: 50 + off * 2, tiltY: 28, tiltX: 6, scale: base * 1.05 };
      case "cascade":
        return { ...d, ...reset, x: 50 + off * (40 / Math.max(n, 2)), y: 50 + off * (30 / Math.max(n, 2)), scale: base * 1.25, rotation: -8 };
    }
  });
};

// ────────────────────────────────────────────
// Plantillas de escena
// ────────────────────────────────────────────
interface TemplateDef {
  id: string;
  label: string;
  description: string;
  format: CanvasFormat;
  background: BackgroundType;
  devices: Partial<DeviceItem>[];
  texts: (Partial<TextItem> & { style: TextStyle })[];
  layout?: LayoutPreset;
  grain?: number;
  vignette?: number;
}

export const TEMPLATES: TemplateDef[] = [
  {
    id: "launch",
    label: "Lanzamiento",
    description: "Un iPhone y título glass",
    format: "portrait",
    background: "gradient-instagram",
    devices: [{ type: "iphone15", y: 45, scale: 0.78 }],
    texts: [{ style: "glass", y: 88 }],
    grain: 18,
  },
  {
    id: "trio",
    label: "Trío en abanico",
    description: "Tres celulares abiertos",
    format: "portrait",
    background: "mesh",
    devices: [{ type: "iphone15" }, { type: "iphone15" }, { type: "iphone15" }],
    texts: [],
    layout: "fan",
  },
  {
    id: "notify",
    label: "Notificación",
    description: "Story con aviso iOS",
    format: "story",
    background: "ig-pastel",
    devices: [{ type: "iphone15", y: 58, scale: 0.8 }],
    texts: [{ style: "notification", y: 15 }],
  },
  {
    id: "chat",
    label: "Chat",
    description: "Celular con iMessage",
    format: "square",
    background: "mesh-cotton",
    devices: [{ type: "iphone15", x: 32, scale: 0.85 }],
    texts: [{ style: "imessage", x: 70, y: 52, scale: 0.55 }],
  },
  {
    id: "web",
    label: "Web + móvil",
    description: "Navegador y celular",
    format: "landscape",
    background: "mesh-ocean",
    devices: [
      { type: "browser", x: 42, y: 50, scale: 0.88 },
      { type: "iphone15", x: 80, y: 56, scale: 0.62 },
    ],
    texts: [],
  },
  {
    id: "iso",
    label: "3D oscuro",
    description: "Perspectiva sobre IG oscuro",
    format: "square",
    background: "ig-dark",
    devices: [{ type: "iphone15" }, { type: "iphone15" }],
    texts: [],
    layout: "perspective",
    vignette: 30,
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Marco blanco sobre crema",
    format: "portrait",
    background: "solid-cream",
    devices: [{ type: "iphone15", style: "minimal", frameColor: "#f4f4f5", scale: 0.8, shadowSoftness: 35 }],
    texts: [],
  },
  {
    id: "clay",
    label: "Clay",
    description: "Dispositivos de arcilla",
    format: "portrait",
    background: "gradient-lavender",
    devices: [
      { type: "iphone15", style: "clay", frameColor: "#ede9fe" },
      { type: "iphone15", style: "clay", frameColor: "#ede9fe" },
    ],
    texts: [],
    layout: "stagger",
  },
];

/** Aplica una plantilla reutilizando los ids actuales (así se conservan las capturas) */
export const applyTemplate = (current: MockupSettings, id: string): MockupSettings => {
  const t = TEMPLATES.find((x) => x.id === id);
  if (!t) return current;
  const devices = t.devices.map((d, i) => createDevice({ ...d, id: current.devices[i]?.id ?? uid(), adjust: current.devices[i]?.adjust }));
  const next: MockupSettings = {
    ...current,
    format: t.format,
    background: t.background,
    grain: t.grain ?? 0,
    vignette: t.vignette ?? 0,
    devices,
    texts: t.texts.map((x) => createText(x.style, x)),
  };
  return t.layout ? { ...next, devices: applyLayout(next, t.layout) } : next;
};

// ────────────────────────────────────────────
// Video
// ────────────────────────────────────────────
export type VideoPreset = "intro" | "reveal" | "tour" | "swing" | "zoom" | "float" | "spin";

export const VIDEO_PRESETS: { value: VideoPreset; label: string; description: string }[] = [
  { value: "intro", label: "Entrada", description: "Suben uno a uno con rebote suave" },
  { value: "reveal", label: "Revelar", description: "Giran de perfil hasta quedar de frente" },
  { value: "tour", label: "Protagonista", description: "Cada uno pasa al frente por turnos" },
  { value: "swing", label: "Vaivén 3D", description: "Balanceo continuo en bucle" },
  { value: "zoom", label: "Acercar", description: "Crecen mientras se enderezan" },
  { value: "float", label: "Flotar", description: "Movimiento suave en bucle" },
  { value: "spin", label: "Giro 360°", description: "Cada dispositivo da una vuelta" },
];

export interface VideoSettings {
  preset: VideoPreset;
  duration: number;
  fps: 30 | 60;
}

// ────────────────────────────────────────────
// Persistencia
// ────────────────────────────────────────────
const STORAGE_KEY = "postim:settings:v3";

export const loadSettings = (): MockupSettings => {
  const defaults = createDefaultSettings();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<MockupSettings>;
    const devices = Array.isArray(parsed.devices) ? parsed.devices.map((d) => createDevice(d)) : defaults.devices;
    const texts = Array.isArray(parsed.texts) ? parsed.texts.map((t) => createText(t.style, t)) : [];
    return {
      ...defaults,
      ...parsed,
      // La imagen de fondo personalizada no se guarda, así que no restauramos ese modo
      background: parsed.background === "custom" ? defaults.background : parsed.background ?? defaults.background,
      devices,
      texts,
    };
  } catch {
    return defaults;
  }
};

export const saveSettings = (settings: MockupSettings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // almacenamiento no disponible (modo privado, cuota llena): se ignora
  }
};

// Preferencias de la interfaz (no forman parte del historial de deshacer)
export interface EditorPrefs {
  fileFormat: ExportFileFormat;
  video: VideoSettings;
  onboarded: boolean;
}

const PREFS_KEY = "postim:prefs:v1";

export const DEFAULT_PREFS: EditorPrefs = {
  fileFormat: "png",
  video: { preset: "intro", duration: 5, fps: 60 },
  onboarded: false,
};

export const loadPrefs = (): EditorPrefs => {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<EditorPrefs>;
    const video = { ...DEFAULT_PREFS.video, ...parsed.video };
    // Animaciones que ya no existen vuelven a la predeterminada
    if (!VIDEO_PRESETS.some((p) => p.value === video.preset)) video.preset = DEFAULT_PREFS.video.preset;
    return { ...DEFAULT_PREFS, ...parsed, video };
  } catch {
    return DEFAULT_PREFS;
  }
};

export const savePrefs = (prefs: EditorPrefs) => {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // ignorado
  }
};

export const readFileAsDataURL = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
