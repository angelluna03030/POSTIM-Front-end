export interface TourStep {
  /** Valor del atributo data-tour del elemento a resaltar */
  target: string;
  title: string;
  body: string;
}

export const EDITOR_TOUR: TourStep[] = [
  { target: "canvas", title: "Tu lienzo", body: "Aquí se arma el mockup. Arrastra dispositivos y textos, y haz doble clic en un dispositivo para subir tu captura." },
  { target: "panel", title: "Panel de edición", body: "En «Elemento» ajustas lo seleccionado (estilo realista, minimal o clay, inclinación 3D…). En «Escena» tienes capas, plantillas y fondos." },
  { target: "formats", title: "Formato de Instagram", body: "Cambia entre 1:1, 4:5, 9:16 y 1.91:1. La exportación sale con los píxeles exactos." },
  { target: "add", title: "Más dispositivos y textos", body: "Agrega hasta 6 dispositivos y textos glass estilo iOS, notificaciones o iMessage." },
  { target: "view3d", title: "Vista 3D y video", body: "Pasa a 3D para girar la escena con el mouse y grabar un video con transiciones fluidas." },
  { target: "export", title: "Descarga", body: "Descarga en PNG, JPG o WebP, o cópialo al portapapeles. ¡Listo para publicar!" },
];
