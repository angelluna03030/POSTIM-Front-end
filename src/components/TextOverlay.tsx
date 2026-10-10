import type { TextItem } from "@/lib/mockup";

/**
 * Elementos de texto sobre el mockup. Todas las medidas están pensadas para un lienzo
 * de 1080 px de ancho; MockupPreview los escala al tamaño real de la vista previa.
 */

// Cristal estilo iOS: translúcido, con brillo en el borde superior y desenfoque del fondo
const glassSurface: React.CSSProperties = {
  background: "linear-gradient(135deg, rgba(255,255,255,0.62) 0%, rgba(255,255,255,0.28) 100%)",
  border: "1.5px solid rgba(255,255,255,0.65)",
  boxShadow:
    "inset 0 2px 1px rgba(255,255,255,0.85), inset 0 -2px 8px rgba(255,255,255,0.18), 0 24px 70px -18px rgba(0,0,0,0.28), 0 2px 6px rgba(0,0,0,0.05)",
  backdropFilter: "blur(36px) saturate(190%)",
  WebkitBackdropFilter: "blur(36px) saturate(190%)",
};

const Glass = ({ item }: { item: TextItem }) => (
  <div style={{ ...glassSurface, borderRadius: 52, padding: "34px 60px" }} className="whitespace-nowrap text-center text-zinc-900">
    {item.title && <div style={{ fontSize: 46, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.15 }}>{item.title}</div>}
    {item.subtitle && <div style={{ fontSize: 28, marginTop: 6, color: "rgba(24,24,27,0.62)" }}>{item.subtitle}</div>}
  </div>
);

const Notification = ({ item }: { item: TextItem }) => (
  <div style={{ ...glassSurface, borderRadius: 50, padding: 30, width: 820 }} className="flex items-start text-zinc-900">
    <div
      className="grid shrink-0 place-items-center text-white"
      style={{
        width: 92,
        height: 92,
        borderRadius: 22,
        marginRight: 26,
        fontSize: 42,
        fontWeight: 700,
        background: "linear-gradient(135deg,#fcaf45,#e1306c 55%,#833ab4)",
        boxShadow: "inset 0 1px 1px rgba(255,255,255,0.4)",
      }}
    >
      {(item.label || "P").trim().charAt(0).toUpperCase()}
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex items-center justify-between" style={{ fontSize: 25, color: "rgba(24,24,27,0.55)", marginBottom: 2 }}>
        <span style={{ fontWeight: 500 }}>{item.label || "App"}</span>
        <span>ahora</span>
      </div>
      {item.title && <div style={{ fontSize: 32, fontWeight: 600, lineHeight: 1.25 }}>{item.title}</div>}
      {item.subtitle && <div style={{ fontSize: 30, lineHeight: 1.3, color: "rgba(24,24,27,0.8)" }}>{item.subtitle}</div>}
    </div>
  </div>
);

const Tail = ({ color, side }: { color: string; side: "left" | "right" }) => (
  <svg
    width="34"
    height="40"
    viewBox="0 0 34 40"
    className="absolute bottom-0"
    style={side === "right" ? { right: -12 } : { left: -12, transform: "scaleX(-1)" }}
  >
    <path d="M0 0 C 2 22, 12 34, 34 40 C 14 40, 4 36, 0 30 Z" fill={color} />
  </svg>
);

const IMessage = ({ item }: { item: TextItem }) => (
  <div className="flex flex-col gap-3" style={{ width: 760, fontSize: 38, lineHeight: 1.3 }}>
    {item.subtitle && (
      <div className="relative self-start" style={{ maxWidth: 600 }}>
        <div style={{ background: "#e9e9eb", color: "#000", padding: "18px 30px", borderRadius: 44 }}>{item.subtitle}</div>
        <Tail color="#e9e9eb" side="left" />
      </div>
    )}
    {item.title && (
      <div className="relative self-end" style={{ maxWidth: 600 }}>
        <div style={{ background: "linear-gradient(180deg,#2a95ff,#0a7cff)", color: "#fff", padding: "18px 30px", borderRadius: 44 }}>{item.title}</div>
        <Tail color="#0a7cff" side="right" />
      </div>
    )}
  </div>
);

const Card = ({ item, dark }: { item: TextItem; dark: boolean }) => (
  <div
    className="whitespace-nowrap text-center"
    style={{
      borderRadius: 44,
      padding: "34px 60px",
      background: dark ? "rgba(9,9,11,0.88)" : "rgba(255,255,255,0.94)",
      color: dark ? "#fff" : "#09090b",
      border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.05)",
      boxShadow: "0 24px 70px -20px rgba(0,0,0,0.35)",
    }}
  >
    {item.title && <div style={{ fontSize: 46, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.15 }}>{item.title}</div>}
    {item.subtitle && <div style={{ fontSize: 28, marginTop: 6, opacity: 0.6 }}>{item.subtitle}</div>}
  </div>
);

const TextOverlay = ({ item }: { item: TextItem }) => {
  switch (item.style) {
    case "glass":
      return <Glass item={item} />;
    case "notification":
      return <Notification item={item} />;
    case "imessage":
      return <IMessage item={item} />;
    case "dark":
      return <Card item={item} dark />;
    default:
      return <Card item={item} dark={false} />;
  }
};

export default TextOverlay;
