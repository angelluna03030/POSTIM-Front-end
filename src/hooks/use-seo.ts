import { useEffect } from "react";

export const SITE_URL = "https://postim.vercel.app";

interface SeoOptions {
  title: string;
  description: string;
  /** Ruta canónica, p. ej. "/mockups" */
  path: string;
  /** Para páginas que no deben aparecer en buscadores (404) */
  noindex?: boolean;
}

const setMeta = (attr: "name" | "property", key: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
};

const setLink = (rel: string, href: string, extra?: Record<string, string>) => {
  const selector = `link[rel="${rel}"]` + (extra ? Object.entries(extra).map(([k, v]) => `[${k}="${v}"]`).join("") : "");
  let el = document.head.querySelector<HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    Object.entries(extra ?? {}).forEach(([k, v]) => el!.setAttribute(k, v));
    document.head.appendChild(el);
  }
  el.href = href;
};

/** Título, descripción, canónica y etiquetas sociales por página (la app es una SPA) */
export const useSeo = ({ title, description, path, noindex = false }: SeoOptions) => {
  useEffect(() => {
    const url = SITE_URL + path;
    document.title = title;
    setMeta("name", "description", description);
    setMeta("name", "robots", noindex ? "noindex, follow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setLink("canonical", url);
    setLink("alternate", url, { hreflang: "es" });
    setLink("alternate", url, { hreflang: "x-default" });
  }, [title, description, path, noindex]);
};
