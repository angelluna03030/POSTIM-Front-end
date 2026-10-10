// Ruido SVG para el efecto "grano"
const NOISE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

/** Capas de efectos que van encima del fondo y debajo de los dispositivos */
export const BackgroundEffects = ({
  grain,
  vignette,
  blur,
  customBgImage,
  isCustom,
}: {
  grain: number;
  vignette: number;
  blur: number;
  customBgImage: string | null;
  isCustom: boolean;
}) => (
  <>
    {isCustom && customBgImage && blur > 0 && (
      <div
        className="pointer-events-none absolute inset-[-6%]"
        style={{ backgroundImage: `url(${customBgImage})`, backgroundSize: "cover", backgroundPosition: "center", filter: `blur(${blur}px)` }}
      />
    )}
    {vignette > 0 && (
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,${vignette / 100}) 100%)` }}
      />
    )}
    {grain > 0 && (
      <div className="pointer-events-none absolute inset-0 mix-blend-overlay" style={{ backgroundImage: NOISE, opacity: grain / 100 }} />
    )}
  </>
);
