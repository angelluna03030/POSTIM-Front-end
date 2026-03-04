import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, cubicBezier } from "framer-motion";
import { Button } from "./ui/button";

// ── CONSTANTS ─────────────────────────────────
const IG_COLORS = {
  purple: "#833AB4",
  pink: "#E1306C",
  orange: "#F77737",
  yellow: "#FCAF45",
  blue: "#405DE6",
};

const IG_GRADIENT = `linear-gradient(90deg, ${IG_COLORS.purple}, ${IG_COLORS.pink}, ${IG_COLORS.orange}, ${IG_COLORS.yellow})`;

const DEVICE_GLOWS = [
  `radial-gradient(ellipse at 60% 40%, rgba(225,48,108,0.2) 0%, rgba(131,58,180,0.13) 40%, transparent 70%)`,
  `radial-gradient(ellipse at 60% 40%, rgba(64,93,230,0.2) 0%, rgba(131,58,180,0.13) 40%, transparent 70%)`,
  `radial-gradient(ellipse at 60% 40%, rgba(247,119,55,0.18) 0%, rgba(225,48,108,0.1) 40%, transparent 70%)`,
];

const SLIDE_VARIANTS = {
  enter: (d) => ({ opacity: 0, x: d > 0 ? 60 : -60, scale: 0.92 }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.55, ease: cubicBezier(0.32, 0.72, 0, 1) },
  },
  exit: (d) => ({
    opacity: 0,
    x: d > 0 ? -60 : 60,
    scale: 0.92,
    transition: { duration: 0.38, ease: cubicBezier(0.32, 0.72, 0, 1) },
  }),
};

// ── GRADIENT TEXT ──────────────────────────────
function GradientText({ children }) {
  return (
    <span
      style={{
        background: IG_GRADIENT,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      {children}
    </span>
  );
}

// ── SCREEN CONTENT ─────────────────────────────
const screenDotStyles = [
  { width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.4)" },
  { width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.4)" },
  { width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.4)" },
];

function ScreenContent({ grad }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: grad,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: 16,
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.3)",
            flexShrink: 0,
          }}
        />
        <div
          style={{
            height: 7,
            borderRadius: 100,
            background: "rgba(255,255,255,0.3)",
            width: 55,
          }}
        />
        <div style={{ marginLeft: "auto", display: "flex", gap: 3 }}>
          {screenDotStyles.map((s, i) => (
            <div key={i} style={s} />
          ))}
        </div>
      </div>

      {/* Main content area */}
      <div
        style={{
          flex: 1,
          borderRadius: 10,
          background: "rgba(255,255,255,0.13)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          color: "rgba(255,255,255,0.7)",
        }}
        aria-hidden="true"
      >
        ✦
      </div>

      {/* Text lines */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <div
          style={{
            height: 5,
            borderRadius: 100,
            background: "rgba(255,255,255,0.25)",
            width: "100%",
          }}
        />
        <div
          style={{
            height: 5,
            borderRadius: 100,
            background: "rgba(255, 255, 255, 0.17)",
            width: "60%",
          }}
        />
      </div>
    </div>
  );
}

// ── DEVICE MOCKUPS ─────────────────────────────
const phoneScreenGrad = `linear-gradient(145deg, ${IG_COLORS.purple}, ${IG_COLORS.pink}, ${IG_COLORS.orange})`;
const tabletScreenGrad = `linear-gradient(145deg, ${IG_COLORS.blue}, ${IG_COLORS.purple}, ${IG_COLORS.pink})`;
const laptopScreenGrad = `linear-gradient(145deg, ${IG_COLORS.pink}, ${IG_COLORS.orange}, ${IG_COLORS.yellow})`;

const deviceSharedShell: React.CSSProperties = {
  border: "8px solid #111",
  background: "#0a0a0a",
  overflow: "hidden",
  boxShadow:
    "0 40px 80px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.07)",
  position: "relative",
};

function PhoneMockup() {
  return (
    <div
      role="img"
      aria-label="Vista previa en móvil"
      style={{ ...deviceSharedShell, width: 200, height: 400, borderRadius: 36 }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 10,
          left: "50%",
          transform: "translateX(-50%)",
          width: 52,
          height: 14,
          borderRadius: 100,
          background: "#000",
          zIndex: 2,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          margin: 3,
          borderRadius: 30,
          overflow: "hidden",
        }}
      >
        <ScreenContent grad={phoneScreenGrad} />
      </div>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 6,
          left: "50%",
          transform: "translateX(-50%)",
          width: 36,
          height: 4,
          borderRadius: 100,
          background: "rgba(255,255,255,0.2)",
        }}
      />
    </div>
  );
}

function TabletMockup() {
  return (
    <div
      role="img"
      aria-label="Vista previa en tablet"
      style={{
        ...deviceSharedShell,
        width: 320,
        height: 420,
        borderRadius: 24,
        border: "10px solid #111",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 12,
          left: "50%",
          transform: "translateX(-50%)",
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "#1a1a1a",
          zIndex: 2,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          margin: 4,
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        <ScreenContent grad={tabletScreenGrad} />
      </div>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 8,
          left: "50%",
          transform: "translateX(-50%)",
          width: 28,
          height: 28,
          borderRadius: "50%",
          border: "2px solid #2a2a2a",
        }}
      />
    </div>
  );
}

function LaptopMockup() {
  return (
    <div
      role="img"
      aria-label="Vista previa en escritorio"
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <div
        style={{
          width: 380,
          height: 240,
          border: "8px solid #111",
          borderRadius: "16px 16px 0 0",
          background: "#0a0a0a",
          overflow: "hidden",
          boxShadow:
            "0 -10px 40px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.06)",
          position: "relative",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 6,
            left: "50%",
            transform: "translateX(-50%)",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#1f1f1f",
            zIndex: 2,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            margin: "20px 4px 4px",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <ScreenContent grad={laptopScreenGrad} />
        </div>
      </div>
      <div
        aria-hidden="true"
        style={{
          width: 420,
          height: 14,
          background: "linear-gradient(180deg,#1a1a1a,#111)",
          borderRadius: "0 0 4px 4px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
        }}
      />
      <div
        aria-hidden="true"
        style={{ width: 380, height: 2, background: "#0a0a0a", marginTop: 0 }}
      />
      <div
        aria-hidden="true"
        style={{
          width: 100,
          height: 60,
          background: "#141414",
          borderRadius: 8,
          marginTop: 6,
          border: "1px solid #222",
        }}
      />
    </div>
  );
}

// ── DEVICE CONFIG ──────────────────────────────
const DEVICES = [
  { id: "phone", label: "Mobile", icon: "📱", component: PhoneMockup },
  { id: "tablet", label: "Tablet", icon: "🖥", component: TabletMockup },
  { id: "laptop", label: "Desktop", icon: "💻", component: LaptopMockup },
];

// ── APP PREVIEW ────────────────────────────────
function AppPreview({ readyLabel = "Listo para IG" }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  const startInterval = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) => (prev + 1) % DEVICES.length);
    }, 3500);
  }, []);

  useEffect(() => {
    if (!isPaused) startInterval();
    else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [isPaused, startInterval]);

  const goTo = useCallback(
    (i) => {
      setDirection(i > activeIndex ? 1 : -1);
      setActiveIndex(i);
      // Resume auto-cycle after manual selection with a delay
      setIsPaused(true);
      setTimeout(() => setIsPaused(false), 5000);
    },
    [activeIndex]
  );

  const ActiveDevice = DEVICES[activeIndex].component;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
      }}
    >
      {/* Animated glow background */}
      <motion.div
        key={activeIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 24,
          background: DEVICE_GLOWS[activeIndex],
          pointerEvents: "none",
        }}
      />

      {/* Device display area */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: "relative",
          zIndex: 10,
          height: 440,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={activeIndex}
            custom={direction}
            variants={SLIDE_VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <ActiveDevice />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Device label badge (top-left) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`badge-${activeIndex}`}
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.9 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            top: "22%",
            zIndex: 20,
            background: "#fff",
            borderRadius: 16,
            padding: "8px 14px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${IG_COLORS.purple}, ${IG_COLORS.pink})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
            }}
          >
            {DEVICES[activeIndex].icon}
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#444",
              whiteSpace: "nowrap",
            }}
          >
            {DEVICES[activeIndex].label} mockup
          </span>
        </motion.div>
      </AnimatePresence>

      {/* "Listo para IG" floating badge (bottom-right) */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        aria-label={readyLabel}
        style={{
          position: "absolute",
          right: 8,
          bottom: 72,
          zIndex: 20,
          background: "#fff",
          borderRadius: 16,
          padding: "8px 14px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: `linear-gradient(135deg, ${IG_COLORS.pink}, ${IG_COLORS.orange})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
          }}
          aria-hidden="true"
        >
          ✓
        </div>
        <span
          style={{ fontSize: 12, fontWeight: 600, color: "#444", whiteSpace: "nowrap" }}
        >
          {readyLabel}
        </span>
      </motion.div>

      {/* Device selector tabs */}
      <div
        role="tablist"
        aria-label="Seleccionar tipo de dispositivo"
        style={{
          position: "absolute",
          bottom: 8,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 6,
          zIndex: 20,
          background: "rgba(0,0,0,0.05)",
          borderRadius: 100,
          padding: "5px 6px",
          backdropFilter: "blur(8px)",
        }}
      >
        {DEVICES.map((device, i) => (
          <Button
            key={device.id}
            role="tab"
            aria-selected={i === activeIndex}
            aria-label={`Ver mockup ${device.label}`}
            onClick={() => goTo(i)}
            style={{
              position: "relative",
              padding: "6px 14px",
              borderRadius: 100,
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              background: "transparent",
              color: i === activeIndex ? "#fff" : "#888",
              transition: "color 0.3s",
              zIndex: 1,
            }}
          >
            {i === activeIndex && (
              <motion.div
                layoutId="pill"
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 100,
                  background: IG_GRADIENT,
                  zIndex: -1,
                }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            {device.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ─────────────────────────────
export const Formatos = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [visibleSections, setVisibleSections] = useState({});
  const sectionRefs = useRef({});

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection observer for fade-in animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = (entry.target as HTMLElement)?.dataset?.id;
            if (id) setVisibleSections((prev) => ({ ...prev, [id]: true }));
          }
        }),
      { threshold: 0.1, rootMargin: "0px 0px -24px 0px" }
    );

    const currentRefs = sectionRefs.current;
    Object.values(currentRefs).forEach((el) => el && observer.observe(el as HTMLElement));
    return () => {
      Object.values(currentRefs).forEach((el) => el && observer.unobserve(el as HTMLElement) );
      observer.disconnect();
    };
  }, []);

  // Stable ref callback using useCallback
  const setRef = useCallback(
    (id) => (el) => {
      if (el) {
        el.dataset.id = id;
        sectionRefs.current[id] = el;
      }
    },
    []
  );

  // Memoized fade-up style factory
  const fadeUp = useCallback(
    (id, delayMs = 0) => ({
      style: {
        transition: `opacity 0.65s ease ${delayMs}ms, transform 0.65s ease ${delayMs}ms`,
        opacity: visibleSections[id] ? 1 : 0,
        transform: visibleSections[id] ? "translateY(0)" : "translateY(26px)",
      },
    }),
    [visibleSections]
  );

  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "#fff",
        color: "#111",
        overflowX: "hidden",
        minHeight: "100vh",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(${IG_COLORS.purple}, ${IG_COLORS.pink}, ${IG_COLORS.orange});
          border-radius: 4px;
        }

        /* Page load stagger animations */
        .fade-in-1 { animation: fadeInUp 0.7s ease 0.10s both; }
        .fade-in-2 { animation: fadeInUp 0.7s ease 0.25s both; }
        .fade-in-3 { animation: fadeInUp 0.7s ease 0.40s both; }
        .fade-in-4 { animation: fadeInUp 0.7s ease 0.55s both; }
        .fade-in-5 { animation: fadeInUp 0.8s ease 0.70s both; }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* IG CTA button */
        .ig-btn {
          background: linear-gradient(90deg, ${IG_COLORS.purple}, ${IG_COLORS.pink}, ${IG_COLORS.orange});
          background-size: 200%;
          color: #fff;
          border: none;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          border-radius: 100px;
          transition: background-position 0.4s, transform 0.2s, box-shadow 0.2s;
        }
        .ig-btn:hover {
          background-position: 100%;
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(225, 48, 108, 0.4);
        }

        /* Format card */
        .format-card {
          transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
        }
        .format-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.08);
          border-color: transparent;
        }

        /* Step card */
        .step-card {
          transition: background 0.3s, box-shadow 0.3s;
        }
        .step-card:hover {
          background: #ffffff;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
        }

        /* Reduce motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }

        a { text-decoration: none; }
      `}</style>

      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "120px 5% 80px",
          position: "relative",
          overflow: "hidden",
          gap: 40,
        }}
      >
        <div
          className="fade-in-5"
          style={{
            flex: "1 1 300px",
            minHeight: 480,
            position: "relative",
            zIndex: 1,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div style={{ width: "100%", maxWidth: 420, height: 480 }}>
            <AppPreview readyLabel="Listo para IG" />
          </div>
        </div>
      </section>
    </div>
  );
};