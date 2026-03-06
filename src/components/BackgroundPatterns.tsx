export type BackgroundType = "gradient-warm" | "gradient-instagram" | "mesh" | "solid-light" | "solid-dark" | "custom";

interface BackgroundConfig {
  label: string;
  style: React.CSSProperties;
  preview: string;
}

export const backgrounds: Record<Exclude<BackgroundType, "custom">, BackgroundConfig> = {
  "gradient-warm": {
    label: "Cálido",
    style: {
      background: "linear-gradient(135deg, hsl(30 30% 95%), hsl(24 50% 85%), hsl(340 30% 88%))",
    },
    preview: "linear-gradient(135deg, #f5ebe0, #e8b89d, #e8c5d0)",
  },
  "gradient-instagram": {
    label: "Instagram",
    style: {
      background: "linear-gradient(135deg, hsl(38 90% 65%), hsl(340 75% 55%), hsl(280 70% 50%))",
    },
    preview: "linear-gradient(135deg, #f0a030, #d94080, #8030c0)",
  },
  mesh: {
    label: "Mesh",
    style: {
      background: `
        radial-gradient(at 20% 20%, hsl(340 70% 80%) 0%, transparent 50%),
        radial-gradient(at 80% 30%, hsl(24 80% 75%) 0%, transparent 50%),
        radial-gradient(at 50% 80%, hsl(280 50% 75%) 0%, transparent 50%),
        hsl(30 20% 95%)
      `,
    },
    preview: "radial-gradient(at 30% 30%, #e8a0c0, #f0c0a0)",
  },
  "solid-light": {
    label: "Claro",
    style: {
      background: "hsl(30 15% 95%)",
    },
    preview: "hsl(30 15% 95%)",
  },
  "solid-dark": {
    label: "Oscuro",
    style: {
      background: "hsl(20 10% 12%)",
    },
    preview: "hsl(20 10% 12%)",
  },
};

export const getBackgroundStyle = (
  bg: BackgroundType,
  customBgImage?: string | null
): React.CSSProperties => {
  if (bg === "custom" && customBgImage) {
    return {
      backgroundImage: `url(${customBgImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  if (bg !== "custom" && backgrounds[bg]) {
    return backgrounds[bg].style;
  }
  return { background: "hsl(30 15% 95%)" };
};
