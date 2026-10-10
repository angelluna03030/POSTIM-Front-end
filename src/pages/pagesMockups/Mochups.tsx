import Index from "./Index";
import { useSeo } from "@/hooks/use-seo";

export const Mochups = () => {
  useSeo({
    title: "Editor de mockups para Instagram | POSTIM",
    description:
      "Sube tu captura y crea un mockup con iPhone, Pixel, iPad, MacBook o navegador. Plantillas, fondos de Instagram, vista 3D y exportación en PNG, JPG, WebP o video MP4.",
    path: "/mockups",
  });
  return <Index />;
};
