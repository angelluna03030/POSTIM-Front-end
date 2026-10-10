import type { CSSProperties } from "react";

export type BackgroundCategory = "instagram" | "mesh" | "gradient" | "solid";

export interface BackgroundPreset {
  id: string;
  label: string;
  category: BackgroundCategory;
  css: string;
}

/** "color" = color libre, "custom" = imagen subida; el resto son ids de BACKGROUNDS */
export type BackgroundType = string;

export const BACKGROUND_CATEGORIES: { value: BackgroundCategory; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "mesh", label: "Mesh" },
  { value: "gradient", label: "Gradientes" },
  { value: "solid", label: "Sólidos" },
];

export const BACKGROUNDS: BackgroundPreset[] = [
  // ── Instagram ──
  { id: "gradient-instagram", label: "Instagram clásico", category: "instagram", css: "linear-gradient(135deg, #fcaf45 0%, #e1306c 50%, #833ab4 100%)" },
  { id: "ig-logo", label: "Logo IG", category: "instagram", css: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285aeb 90%)" },
  { id: "ig-sunset", label: "Atardecer", category: "instagram", css: "linear-gradient(160deg, #feda75 0%, #fa7e1e 35%, #d62976 70%, #962fbf 100%)" },
  { id: "ig-reels", label: "Reels", category: "instagram", css: "linear-gradient(200deg, #f58529 0%, #dd2a7b 45%, #8134af 75%, #515bd4 100%)" },
  { id: "ig-story", label: "Story", category: "instagram", css: "linear-gradient(180deg, #ff9a8b 0%, #ff6a88 55%, #ff99ac 100%)" },
  { id: "ig-close-friends", label: "Mejores amigos", category: "instagram", css: "linear-gradient(160deg, #b4f08a 0%, #1fbf4f 55%, #0d8a3a 100%)" },
  { id: "ig-dark", label: "IG oscuro", category: "instagram", css: "radial-gradient(at 20% 0%, rgba(225,48,108,0.55) 0px, transparent 55%), radial-gradient(at 90% 100%, rgba(131,58,180,0.6) 0px, transparent 55%), #0b0b10" },
  { id: "ig-pastel", label: "IG pastel", category: "instagram", css: "linear-gradient(135deg, #ffe0b2 0%, #f8bbd0 50%, #d1c4e9 100%)" },
  { id: "ig-threads", label: "Threads", category: "instagram", css: "linear-gradient(180deg, #1c1c1e 0%, #000 100%)" },
  { id: "ig-live", label: "En vivo", category: "instagram", css: "linear-gradient(135deg, #ff0069 0%, #d300c5 60%, #7638fa 100%)" },

  // ── Mesh ──
  {
    id: "mesh",
    label: "Mesh cálido",
    category: "mesh",
    css: "radial-gradient(at 15% 20%, hsl(340 80% 85%) 0px, transparent 50%), radial-gradient(at 85% 25%, hsl(24 90% 82%) 0px, transparent 50%), radial-gradient(at 50% 90%, hsl(270 60% 85%) 0px, transparent 55%), hsl(30 30% 96%)",
  },
  {
    id: "mesh-aurora",
    label: "Aurora",
    category: "mesh",
    css: "radial-gradient(at 0% 0%, #34d399 0px, transparent 50%), radial-gradient(at 100% 0%, #818cf8 0px, transparent 50%), radial-gradient(at 50% 100%, #f472b6 0px, transparent 55%), #0f172a",
  },
  {
    id: "mesh-cotton",
    label: "Algodón",
    category: "mesh",
    css: "radial-gradient(at 20% 30%, #fbcfe8 0px, transparent 50%), radial-gradient(at 80% 20%, #bae6fd 0px, transparent 50%), radial-gradient(at 60% 90%, #ddd6fe 0px, transparent 55%), #fdf4ff",
  },
  {
    id: "mesh-ocean",
    label: "Océano mesh",
    category: "mesh",
    css: "radial-gradient(at 10% 90%, #22d3ee 0px, transparent 50%), radial-gradient(at 90% 10%, #6366f1 0px, transparent 50%), radial-gradient(at 50% 50%, #a5f3fc 0px, transparent 60%), #e0f2fe",
  },
  {
    id: "mesh-peach",
    label: "Durazno",
    category: "mesh",
    css: "radial-gradient(at 80% 80%, #fb7185 0px, transparent 50%), radial-gradient(at 20% 20%, #fdba74 0px, transparent 55%), #fff7ed",
  },
  {
    id: "mesh-night",
    label: "Noche",
    category: "mesh",
    css: "radial-gradient(at 30% 20%, #7c3aed 0px, transparent 50%), radial-gradient(at 80% 70%, #db2777 0px, transparent 50%), #09090b",
  },

  // ── Gradientes ──
  { id: "gradient-warm", label: "Cálido", category: "gradient", css: "linear-gradient(135deg, #fdf2e9 0%, #f6c9a8 55%, #eec2d1 100%)" },
  { id: "gradient-ocean", label: "Océano", category: "gradient", css: "linear-gradient(160deg, #dbeafe 0%, #93c5fd 50%, #6366f1 100%)" },
  { id: "gradient-mint", label: "Menta", category: "gradient", css: "linear-gradient(160deg, #ecfdf5 0%, #a7f3d0 55%, #5eead4 100%)" },
  { id: "gradient-lavender", label: "Lavanda", category: "gradient", css: "linear-gradient(160deg, #f5f3ff 0%, #c4b5fd 60%, #8b5cf6 100%)" },
  { id: "gradient-lemon", label: "Limón", category: "gradient", css: "linear-gradient(160deg, #fefce8 0%, #fde047 60%, #f59e0b 100%)" },
  { id: "gradient-steel", label: "Acero", category: "gradient", css: "linear-gradient(160deg, #f1f5f9 0%, #cbd5e1 55%, #64748b 100%)" },

  // ── Sólidos ──
  { id: "solid-light", label: "Claro", category: "solid", css: "#f4f4f5" },
  { id: "solid-white", label: "Blanco", category: "solid", css: "#ffffff" },
  { id: "solid-cream", label: "Crema", category: "solid", css: "#f5efe6" },
  { id: "solid-dark", label: "Oscuro", category: "solid", css: "#18181b" },
  { id: "solid-black", label: "Negro", category: "solid", css: "#000000" },
];

export const getBackgroundStyle = (
  bg: BackgroundType,
  options: { customBgImage?: string | null; color?: string } = {},
): CSSProperties => {
  if (bg === "custom" && options.customBgImage) {
    return {
      backgroundImage: `url(${options.customBgImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  if (bg === "color") {
    return { background: options.color ?? "#f4f4f5" };
  }
  const preset = BACKGROUNDS.find((b) => b.id === bg);
  return preset ? { background: preset.css } : { background: "#f4f4f5" };
};

