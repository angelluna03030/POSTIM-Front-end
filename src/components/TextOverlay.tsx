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

// ── WhatsApp ──
const WaTicks = () => (
  <svg width="34" height="22" viewBox="0 0 16 11" style={{ display: "inline-block", marginLeft: 8, verticalAlign: "-2px" }}>
    <path d="M11.07.65 4.99 6.9 2.4 4.3l-.9.9 3.5 3.5 7-7.1z M15.1.65 9.02 6.9l-.75-.75-.9.9 1.65 1.65 7-7.1z" fill="#53bdeb" />
  </svg>
);

const WhatsApp = ({ item }: { item: TextItem }) => (
  <div className="flex flex-col gap-3" style={{ width: 780, fontSize: 36, lineHeight: 1.35 }}>
    {item.subtitle && (
      <div className="relative self-start" style={{ maxWidth: 620 }}>
        <div style={{ background: "#ffffff", color: "#111b21", padding: "16px 26px 14px", borderRadius: "0 26px 26px 26px", boxShadow: "0 2px 3px rgba(11,20,26,0.13)" }}>
          {item.subtitle}
          <span style={{ fontSize: 22, color: "#667781", marginLeft: 18, whiteSpace: "nowrap" }}>9:41</span>
        </div>
        <svg width="22" height="28" viewBox="0 0 8 13" className="absolute left-[-14px] top-0">
          <path d="M8 0H0l8 10z" fill="#ffffff" />
        </svg>
      </div>
    )}
    {item.title && (
      <div className="relative self-end" style={{ maxWidth: 620 }}>
        <div style={{ background: "#d9fdd3", color: "#111b21", padding: "16px 26px 14px", borderRadius: "26px 0 26px 26px", boxShadow: "0 2px 3px rgba(11,20,26,0.13)" }}>
          {item.title}
          <span style={{ fontSize: 22, color: "#667781", marginLeft: 18, whiteSpace: "nowrap" }}>
            9:42
            <WaTicks />
          </span>
        </div>
        <svg width="22" height="28" viewBox="0 0 8 13" className="absolute right-[-14px] top-0">
          <path d="M0 0h8L0 10z" fill="#d9fdd3" />
        </svg>
      </div>
    )}
  </div>
);

// ── Mensaje directo de Instagram ──
const InstagramDM = ({ item }: { item: TextItem }) => (
  <div className="flex flex-col gap-3" style={{ width: 760, fontSize: 36, lineHeight: 1.3 }}>
    {item.subtitle && (
      <div className="flex items-end self-start" style={{ gap: 14, maxWidth: 640 }}>
        <span
          className="shrink-0 rounded-full"
          style={{ width: 52, height: 52, background: "linear-gradient(135deg,#fcaf45,#e1306c,#833ab4)", border: "4px solid #fff" }}
        />
        <div style={{ background: "#efefef", color: "#000", padding: "18px 30px", borderRadius: 44 }}>{item.subtitle}</div>
      </div>
    )}
    {item.title && (
      <div
        className="self-end"
        style={{ maxWidth: 600, background: "linear-gradient(90deg,#a033ff 0%,#ff5c87 60%,#ff7b3f 100%)", color: "#fff", padding: "18px 30px", borderRadius: 44 }}
      >
        {item.title}
      </div>
    )}
    {item.title && <div style={{ fontSize: 22, color: "rgba(0,0,0,0.45)", alignSelf: "flex-end", marginRight: 12 }}>Visto</div>}
  </div>
);

// ── Comentario de Instagram ──
const Comment = ({ item }: { item: TextItem }) => (
  <div
    className="flex items-start"
    style={{
      width: 820,
      gap: 22,
      padding: "28px 32px",
      borderRadius: 40,
      background: "rgba(255,255,255,0.96)",
      color: "#000",
      boxShadow: "0 24px 70px -20px rgba(0,0,0,0.3)",
    }}
  >
    <span className="shrink-0 rounded-full" style={{ padding: 4, background: "linear-gradient(45deg,#fcaf45,#e1306c,#833ab4)" }}>
      <span
        className="grid place-items-center rounded-full text-white"
        style={{ width: 72, height: 72, border: "4px solid #fff", background: "#6366f1", fontSize: 30, fontWeight: 700 }}
      >
        {(item.label || "U").charAt(0).toUpperCase()}
      </span>
    </span>
    <div className="min-w-0 flex-1" style={{ fontSize: 31, lineHeight: 1.35 }}>
      <span style={{ fontWeight: 700 }}>{item.label || "usuario"}</span>{" "}
      <span>{item.title}</span>
      {item.subtitle && <div style={{ marginTop: 10, fontSize: 24, color: "#737373", fontWeight: 600 }}>{item.subtitle} · Responder</div>}
    </div>
    <svg width="34" height="34" viewBox="0 0 24 24" style={{ marginTop: 10, flexShrink: 0 }}>
      <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2 0 3.6 1.1 4.4 2.7.2.4.6.4.8 0 .8-1.6 2.4-2.7 4.4-2.7 3.7 0 5.8 3.9 4.3 7.3C18.5 16.4 12 21 12 21z" fill="#ff3040" />
    </svg>
  </div>
);

// ── Reseña con estrellas ──
const Review = ({ item }: { item: TextItem }) => (
  <div style={{ ...glassSurface, width: 780, borderRadius: 48, padding: "36px 44px" }} className="text-zinc-900">
    <div className="flex items-center justify-between">
      <div className="flex" style={{ gap: 6 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} width="38" height="38" viewBox="0 0 12 12">
            <polygon points="6,0.4 7.6,4.3 11.8,4.6 8.6,7.3 9.6,11.4 6,9.2 2.4,11.4 3.4,7.3 0.2,4.6 4.4,4.3" fill="#ff9f0a" />
          </svg>
        ))}
      </div>
      <span style={{ fontSize: 24, color: "rgba(24,24,27,0.5)" }}>{item.label || "Usuario"}</span>
    </div>
    {item.title && <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: "-0.02em", marginTop: 18 }}>{item.title}</div>}
    {item.subtitle && <div style={{ fontSize: 30, lineHeight: 1.4, marginTop: 8, color: "rgba(24,24,27,0.72)" }}>{item.subtitle}</div>}
  </div>
);

// ── Etiqueta glass (una línea) ──
const Pill = ({ item }: { item: TextItem }) => (
  <div style={{ ...glassSurface, borderRadius: 999, padding: "22px 46px", fontSize: 38, fontWeight: 600 }} className="whitespace-nowrap text-zinc-900">
    {item.title || item.subtitle}
  </div>
);

// ── Tarjeta con gradiente de Instagram ──
const GradientCard = ({ item }: { item: TextItem }) => (
  <div
    className="relative overflow-hidden whitespace-nowrap text-center text-white"
    style={{
      borderRadius: 48,
      padding: "36px 64px",
      background: "linear-gradient(120deg,#833ab4 0%,#e1306c 50%,#f77737 85%,#fcaf45 100%)",
      boxShadow: "0 24px 70px -18px rgba(225,48,108,0.55), inset 0 2px 1px rgba(255,255,255,0.35)",
    }}
  >
    <div className="absolute rounded-full" style={{ width: 300, height: 300, left: -80, top: -170, background: "rgba(255,255,255,0.22)", filter: "blur(30px)" }} />
    {item.title && <div style={{ position: "relative", fontSize: 48, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15 }}>{item.title}</div>}
    {item.subtitle && <div style={{ position: "relative", fontSize: 28, marginTop: 6, opacity: 0.88 }}>{item.subtitle}</div>}
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
    case "whatsapp":
      return <WhatsApp item={item} />;
    case "igdm":
      return <InstagramDM item={item} />;
    case "comment":
      return <Comment item={item} />;
    case "review":
      return <Review item={item} />;
    case "pill":
      return <Pill item={item} />;
    case "gradient":
      return <GradientCard item={item} />;
    case "dark":
      return <Card item={item} dark />;
    default:
      return <Card item={item} dark={false} />;
  }
};

export default TextOverlay;
