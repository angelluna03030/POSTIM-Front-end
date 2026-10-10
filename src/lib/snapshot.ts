import { getFontEmbedCSS, toCanvas } from "html-to-image";
import { deviceConfigs } from "@/lib/devices";
import { CANVAS_FORMATS, type MockupSettings } from "@/lib/mockup";

export interface SceneSnapshot {
  background: HTMLCanvasElement;
  /** Contenido de la pantalla de cada dispositivo, con su tamaño en px del dispositivo */
  screens: Record<string, { canvas: HTMLCanvasElement; width: number; height: number }>;
  texts: Record<string, { canvas: HTMLCanvasElement; width: number; height: number }>;
}

/** Oculta controles de selección */
export const hideUi = (node: HTMLElement) => !(node instanceof HTMLElement && node.dataset?.ui === "true");

let fontCss: Promise<string> | null = null;
/** El CSS de fuentes embebidas se calcula una sola vez: acelera mucho las exportaciones */
export const getFontCss = (node: HTMLElement) => {
  if (!fontCss) fontCss = getFontEmbedCSS(node).catch(() => "");
  return fontCss;
};

/**
 * Captura por separado el fondo, cada dispositivo y cada texto del lienzo 2D,
 * para reconstruir la escena en 3D con texturas.
 */
export const captureScene = async (root: HTMLElement, settings: MockupSettings): Promise<SceneSnapshot> => {
  const fmt = CANVAS_FORMATS[settings.format];
  const fontEmbedCSS = await getFontCss(root);

  const background = await toCanvas(root, {
    pixelRatio: 1,
    canvasWidth: fmt.width,
    canvasHeight: fmt.height,
    fontEmbedCSS,
    filter: (n) => hideUi(n) && !(n instanceof HTMLElement && n.dataset?.item === "true"),
  });

  const screens: SceneSnapshot["screens"] = {};
  const noGlare = (n: HTMLElement) => hideUi(n) && !(n instanceof HTMLElement && n.dataset?.glare === "true");
  for (const d of settings.devices) {
    // Todos los dispositivos se modelan en 3D: solo hace falta lo que se ve en su pantalla
    const screen = root.querySelector<HTMLElement>(`[data-screen-snap="${d.id}"]`);
    if (!screen) continue;
    const width = screen.offsetWidth;
    const height = screen.offsetHeight;
    screens[d.id] = {
      canvas: await toCanvas(screen, {
        width,
        height,
        pixelRatio: deviceConfigs[d.type].width > 400 ? 2.2 : 3,
        fontEmbedCSS,
        filter: noGlare,
        style: { borderRadius: "0" },
      }),
      width,
      height,
    };
  }

  const texts: SceneSnapshot["texts"] = {};
  const canvasWidth = root.getBoundingClientRect().width || 1;
  for (const t of settings.texts) {
    const el = root.querySelector<HTMLElement>(`[data-text-snap="${t.id}"]`);
    if (!el) continue;
    // El texto se muestra con `zoom`; recuperamos su tamaño natural (base 1080 px)
    const zoom = (canvasWidth / fmt.width) * t.scale;
    const rect = el.getBoundingClientRect();
    // Margen alrededor para que la sombra de la burbuja quepa entera: si se recorta,
    // en 3D aparece un borde cuadrado alrededor del texto
    const SHADOW_PAD = 110;
    const width = Math.ceil(rect.width / zoom) + SHADOW_PAD * 2;
    const height = Math.ceil(rect.height / zoom) + SHADOW_PAD * 2;
    texts[t.id] = {
      canvas: await toCanvas(el, {
        width,
        height,
        pixelRatio: 1.5,
        fontEmbedCSS,
        filter: hideUi,
        style: { padding: `${SHADOW_PAD}px`, boxSizing: "content-box", background: "transparent" },
      }),
      width,
      height,
    };
  }

  return { background, screens, texts };
};
