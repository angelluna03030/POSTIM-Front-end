import { motion } from "framer-motion";
import { useRef, useState } from "react";

export const VideoSection = () => {
    const [playing, setPlaying] = useState(false);

    const toggle = () => {
        setPlaying(true);
    };
    return (
        <section style={{ padding: "96px 0", background: "#fff" }} id="ver-tutorial">
            <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px" }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: 48 }}>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16 cent"
                    >

                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                            <span style={{ width: 20, height: 1, background: "#ddd", display: "block" }} />
                            <span style={{ fontSize: 11, fontWeight: 500, color: "#aaa", letterSpacing: "0.12em", textTransform: "uppercase" }}>Demo</span>
                            <span style={{ width: 20, height: 1, background: "#ddd", display: "block" }} />
                        </div>

                        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                            Míralo en <span className="gradient-text">acción</span>
                        </h2>
                        <p className="text-muted-foreground max-w-lg mx-auto">
                            Un mockup listo en menos de 60 segundos — así de simple.
                        </p>
                    </motion.div>
                    <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(2rem,4vw,3rem)", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 12 }}>
                        <span style={{ background: "linear-gradient(90deg,#833AB4,#E1306C,#F77737)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}></span>
                    </h2>
                    <p style={{ color: "#aaa", fontSize: 15, maxWidth: 340, margin: "0 auto", fontWeight: 300 }}>

                    </p>
                </div>

                {/* Video wrapper */}
                <div
                    onClick={toggle}
                    style={{ position: "relative", borderRadius: 28, overflow: "hidden", cursor: "pointer", aspectRatio: "16/9", background: "linear-gradient(135deg,#080808 0%,#18082a 55%,#080808 100%)", boxShadow: "0 32px 96px rgba(0,0,0,0.18)" }}
                >
                    {/* Ambient glow */}
                    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse at 35% 50%, rgba(131,58,180,0.32) 0%, transparent 55%), radial-gradient(ellipse at 78% 25%, rgba(225,48,108,0.22) 0%, transparent 48%)" }} />

                    {/* Real video — replace src with your URL */}
                    {playing && (
                        <iframe
                            src="https://www.youtube.com/embed/Yf00MKUfcIY?autoplay=1&rel=0"
                            title="POSTIM Demo"
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                            style={{
                                position: "absolute",
                                inset: 0,
                                width: "100%",
                                height: "100%",
                                border: "none",
                            }}
                        />
                    )}

                    {/* Thumbnail (visible when not playing) */}
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, opacity: playing ? 0 : 1, transition: "opacity .4s ease", pointerEvents: playing ? "none" : "auto" }}>
                        {/* 3 format previews */}
                        <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
                            {[
                                { w: 72, h: 128, g: "145deg,#833AB4,#E1306C,#F77737" },
                                { w: 96, h: 96, g: "145deg,#405DE6,#833AB4,#E1306C" },
                                { w: 72, h: 108, g: "145deg,#E1306C,#F77737,#FCAF45" },
                            ].map((f, i) => (
                                <div key={i} style={{ width: f.w, height: f.h, borderRadius: 14, background: `linear-gradient(${f.g})`, border: "2px solid rgba(255,255,255,0.1)", boxShadow: "0 16px 40px rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.5)", fontSize: 22 }}>✦</div>
                            ))}
                        </div>
                        <div style={{ display: "flex", gap: 10 }}>
                            {["9:16", "1:1", "4:5"].map(f => (
                                <span key={f} style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 100, padding: "4px 12px" }}>{f}</span>
                            ))}
                        </div>
                    </div>
                    {!playing && (
                        <>
                            {/* Play/Pause button */}
                            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.2)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.3)", transition: "transform .25s ease", transform: playing ? "scale(0.88)" : "scale(1)" }}>
                                    {playing
                                        ? <div style={{ display: "flex", gap: 5 }}><div style={{ width: 5, height: 22, background: "#fff", borderRadius: 3 }} /><div style={{ width: 5, height: 22, background: "#fff", borderRadius: 3 }} /></div>
                                        : <svg width="18" height="22" viewBox="0 0 18 22" fill="white" style={{ marginLeft: 3 }}><path d="M0 0 L18 11 L0 22 Z" /></svg>
                                    }
                                </div>
                            </div>
                        </>
                    )}

                    {!playing && (
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 28px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)" }}>

                            <div>
                                <div style={{ color: "#fff", fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: "-0.02em" }}>POSTIM — Demo completo</div>
                                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 3 }}>0:58 min · Crea tu primer mockup</div>
                            </div>


                            <a href="/mockups" onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(90deg,#833AB4,#E1306C,#F77737)", color: "#fff", fontSize: 13, fontWeight: 500, padding: "10px 20px", borderRadius: 100, textDecoration: "none", whiteSpace: "nowrap" }}>
                                Probar gratis →
                            </a>
                        </div>
                    )}
                </div>

                {/* Trust row */}
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "12px 28px", marginTop: 28 }}>
                    {["Sin registro para el demo", "Gratis para siempre", "Sin marca de agua"].map((t, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "#bbb" }}>
                            <div style={{ width: 16, height: 16, borderRadius: "50%", background: "linear-gradient(135deg,#833AB4,#E1306C)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </div>
                            {t}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
