import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";


function G({ children }) {
  return (
    <span style={{
      background: "linear-gradient(90deg,#833AB4,#E1306C,#F77737,#FCAF45)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    }}>
      {children}
    </span>
  );
}

// Floating particle
function Particle({ x, y, size, delay, duration, grad }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 0.6, 0], scale: [0, 1, 0.5], y: [0, -60, -120] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: "50%",
        background: grad,
        filter: "blur(1px)",
        pointerEvents: "none",
      }}
    />
  );
}

const PARTICLES = [
  { x: 12, y: 70, size: 8, delay: 0, duration: 3.5, grad: "radial-gradient(#833AB4,transparent)" },
  { x: 85, y: 60, size: 6, delay: 0.8, duration: 4.2, grad: "radial-gradient(#E1306C,transparent)" },
  { x: 25, y: 40, size: 10, delay: 1.5, duration: 3.8, grad: "radial-gradient(#F77737,transparent)" },
  { x: 75, y: 75, size: 7, delay: 0.4, duration: 4.5, grad: "radial-gradient(#FCAF45,transparent)" },
  { x: 55, y: 85, size: 5, delay: 2.1, duration: 3.2, grad: "radial-gradient(#833AB4,transparent)" },
  { x: 40, y: 20, size: 9, delay: 1.1, duration: 4.8, grad: "radial-gradient(#E1306C,transparent)" },
  { x: 90, y: 30, size: 6, delay: 0.6, duration: 3.9, grad: "radial-gradient(#F77737,transparent)" },
  { x: 8, y: 30, size: 7, delay: 2.5, duration: 4.1, grad: "radial-gradient(#FCAF45,transparent)" },
];

const NotFound = () => {
  const location = useLocation();
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        .back-btn {
          background: linear-gradient(90deg,#833AB4,#E1306C,#F77737);
          background-size: 200%;
          transition: background-position 0.4s ease, transform 0.2s ease, box-shadow 0.2s ease;
        }
        .back-btn:hover {
          background-position: 100%;
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(225,48,108,0.4);
        }
      `}</style>

      {/* Ambient blobs */}
      <div style={{ position: "absolute", top: "-10%", right: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(225,48,108,0.07), transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(131,58,180,0.07), transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "40%", left: "30%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(247,119,55,0.05), transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />

      {/* Floating particles */}
      {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
        style={{ textAlign: "center", maxWidth: 520, padding: "0 24px", position: "relative", zIndex: 10 }}
      >

        {/* 404 number — big and bold */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
          style={{ position: "relative", marginBottom: 8 }}
        >
          {/* Ghost 404 behind */}
          <div style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 400,
            fontSize: "clamp(9rem, 22vw, 14rem)",
            lineHeight: 1,
            letterSpacing: "-0.06em",
            background: "linear-gradient(90deg,#833AB4,#E1306C,#F77737,#FCAF45)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            userSelect: "none",
            filter: "blur(0px)",
          }}>
            404
          </div>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.32, 0.72, 0, 1] }}
            style={{ height: 3, background: "linear-gradient(90deg,transparent,#833AB4,#E1306C,#F77737,#FCAF45,transparent)", borderRadius: 100, marginTop: -8, transformOrigin: "center" }}
          />
        </motion.div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
          Esta página se perdió en el
          <span className="gradient-text"> feed</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mb-8">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            style={{ fontSize: 15, color: "#aaa", lineHeight: 1.7, fontWeight: 300, marginBottom: 36, maxWidth: 340, margin: "0 auto 36px" }}
          >
            La ruta <code style={{ fontFamily: "monospace", fontSize: 13, background: "#f5f5f5", padding: "2px 8px", borderRadius: 6, color: "#888" }}>{location.pathname}</code> no existe. Puede que haya sido movida o eliminada.
          </motion.p>
        </p>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}
        >
          <a
            href="/"
          >


            <Button variant="gradient" size="lg" className="rounded-full px-8 gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M8 2L3 7L8 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Volver al inicio
            </Button>
          </a>
          <a
            href="/#cómo-funciona"
            style={{ color: "#888", fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: 14, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, border: "1.5px solid #eee", padding: "12px 22px", borderRadius: 100, transition: "border-color 0.2s, color 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#ccc"; e.currentTarget.style.color = "#333"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#eee"; e.currentTarget.style.color = "#888"; }}
          >
            Ver funciones
          </a>
        </motion.div>


        <Footer />
      </motion.div>
    </div>
  );
};

export default NotFound;