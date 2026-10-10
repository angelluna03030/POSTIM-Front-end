/** Ajustes básicos de la captura dentro de cada dispositivo */
export type ImageFilter = "none" | "bw" | "warm" | "cool" | "vivid" | "fade" | "noir";

export interface ImageAdjust {
  /** 1 = tamaño original, hasta 3 */
  zoom: number;
  /** Desplazamiento en % del tamaño de la imagen */
  x: number;
  y: number;
  rotate: 0 | 90 | 180 | 270;
  flipX: boolean;
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  filter: ImageFilter;
}

export const DEFAULT_ADJUST: ImageAdjust = {
  zoom: 1,
  x: 0,
  y: 0,
  rotate: 0,
  flipX: false,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  filter: "none",
};

export const IMAGE_FILTERS: { value: ImageFilter; label: string; css: string }[] = [
  { value: "none", label: "Original", css: "" },
  { value: "vivid", label: "Vívido", css: "saturate(1.45) contrast(1.08)" },
  { value: "warm", label: "Cálido", css: "sepia(0.22) saturate(1.2) hue-rotate(-8deg)" },
  { value: "cool", label: "Frío", css: "saturate(1.1) hue-rotate(12deg) brightness(1.03)" },
  { value: "fade", label: "Suave", css: "contrast(0.85) brightness(1.08) saturate(0.8)" },
  { value: "bw", label: "B/N", css: "grayscale(1)" },
  { value: "noir", label: "Noir", css: "grayscale(1) contrast(1.35) brightness(0.95)" },
];

export const isAdjusted = (a: ImageAdjust) => JSON.stringify(a) !== JSON.stringify(DEFAULT_ADJUST);

/** CSS que aplica los ajustes a un <img> posicionado absoluto dentro de un contenedor con `container-type: size` */
export const adjustedImageStyle = (a: ImageAdjust, fit: "cover" | "contain"): React.CSSProperties => {
  const sideways = a.rotate === 90 || a.rotate === 270;
  const preset = IMAGE_FILTERS.find((f) => f.value === a.filter)?.css ?? "";
  const filter = [
    a.brightness !== 100 ? `brightness(${a.brightness / 100})` : "",
    a.contrast !== 100 ? `contrast(${a.contrast / 100})` : "",
    a.saturation !== 100 ? `saturate(${a.saturation / 100})` : "",
    a.blur > 0 ? `blur(${a.blur}px)` : "",
    preset,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    position: "absolute",
    left: "50%",
    top: "50%",
    // Rotado 90°, la imagen ocupa el contenedor "acostado"
    width: sideways ? "100cqh" : "100%",
    height: sideways ? "100cqw" : "100%",
    maxWidth: "none",
    objectFit: fit,
    transform: `translate(-50%, -50%) translate(${a.x}%, ${a.y}%) rotate(${a.rotate}deg) scale(${a.zoom}) scaleX(${a.flipX ? -1 : 1})`,
    filter: filter || undefined,
  };
};
