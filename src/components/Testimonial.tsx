import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
const TESTIMONIALS = [
    { name: "Valentina Arce", role: "UI/UX Designer · Colombia", initials: "VA", grad: "135deg,#833AB4,#E1306C", text: "Antes tardaba 20 min en Figma. Con POSTIM lo hago en 2 y queda mucho mejor. Es mi herramienta número uno." },
    { name: "Mateo Rojas", role: "Freelance Designer · México", initials: "MR", grad: "135deg,#F77737,#FCAF45", text: "El control de padding es increíble. Le doy exactamente el espacio que quiero sin cálculos manuales." },
    { name: "Sofía López", role: "Content Creator · Argentina", initials: "SL", grad: "135deg,#405DE6,#833AB4", text: "Mi grilla nunca se había visto tan profesional. Todo consistente y elegante sin esfuerzo extra." },
    { name: "Carlos Mendez", role: "Brand Designer · Chile", initials: "CM", grad: "135deg,#E1306C,#F77737", text: "La exportación por lote me ahorró horas cada semana. POSTIM es simplemente indispensable para mi flujo." },
    { name: "Laura Pérez", role: "Social Media · España", initials: "LP", grad: "135deg,#833AB4,#405DE6", text: "Mis clientes no pueden creer lo profesional que se ven los posts. La diferencia es brutal." },
    { name: "Diego Fuentes", role: "Product Designer · Perú", initials: "DF", grad: "135deg,#FCAF45,#F77737", text: "Súper intuitivo desde el primer uso. Los mockups de celular son increíblemente realistas." },
    { name: "Ana Torres", role: "Illustrator · Uruguay", initials: "AT", grad: "135deg,#E1306C,#833AB4", text: "Finalmente una herramienta que entiende al creador. Rápido, bonito y preciso en cada detalle." },
    { name: "Ramón Vidal", role: "UX Lead · Colombia", initials: "RV", grad: "135deg,#405DE6,#E1306C", text: "Uso POSTIM para toda mi presencia en redes. Los fondos con gradiente IG son un detalle genial." },
    { name: "Isabella Gómez", role: "Freelance Marketer · México", initials: "IG", grad: "135deg,#F77737,#E1306C", text: "La calidad de los mockups es impresionante. Mis campañas se ven mucho más profesionales." },
    { name: "Santiago Ruiz", role: "Creative Director · Argentina", initials: "SR", grad: "135deg,#833AB4,#FCAF45", text: "El mejor mockup maker que he probado. Rápido, fácil y con resultados de alta calidad." },
    { name: "Camila Fernández", role: "Content Strategist · Chile", initials: "CF", grad: "135deg,#E1306C,#405DE6", text: "Mis posts nunca se habían visto tan bien. POSTIM es mi secreto para un feed cohesivo y atractivo." },

];

const ROW1 = [...TESTIMONIALS, ...TESTIMONIALS];
const ROW2 = [...TESTIMONIALS.slice(4), ...TESTIMONIALS.slice(0, 4), ...TESTIMONIALS.slice(4), ...TESTIMONIALS.slice(0, 4)];

// ── GRADIENT TEXT ──────────────────────────────
function G({ children }) {
    return (
        <span style={{ background: "linear-gradient(90deg,#833AB4,#E1306C,#F77737,#FCAF45)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            {children}
        </span>
    );
}

// ── TESTI CARD ─────────────────────────────────
function TCard({ t }) {
    return (
        <div style={{ flexShrink: 0, width: 288, margin: "0 8px", background: "#fff", border: "1px solid #f0f0f0", borderRadius: 20, padding: "24px", boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
                {[...Array(5)].map((_, i) => (
                    <svg key={i} width="11" height="11" viewBox="0 0 12 12" fill="#FCAF45"><polygon points="6,0 7.5,4.5 12,4.5 8.5,7 9.8,11.5 6,9 2.2,11.5 3.5,7 0,4.5 4.5,4.5" /></svg>
                ))}
            </div>
            <p style={{ fontSize: 13, color: "#666", lineHeight: 1.65, fontWeight: 300, marginBottom: 18 }}>"{t.text}"</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(${t.grad})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0, fontFamily: "'Syne',sans-serif" }}>{t.initials}</div>
                <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#111", fontFamily: "'Syne',sans-serif", letterSpacing: "-0.02em" }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: "#aaa" }}>{t.role}</div>
                </div>
            </div>
        </div>
    );
}

// ── TESTIMONIAL CAROUSEL ───────────────────────
function Carousel({ items, dir = 1, base = 0.4 }) {
    const trackRef = useRef(null);
    const posRef = useRef(0);
    const speedRef = useRef(base);
    const rafRef = useRef(null);
    const sectionRef = useRef(null);

    useEffect(() => {
        let lastY = window.scrollY;
        const onScroll = () => {
            const delta = Math.abs(window.scrollY - lastY);
            lastY = window.scrollY;
            if (sectionRef.current) {
                const r = sectionRef.current.getBoundingClientRect();
                if (r.top < window.innerHeight && r.bottom > 0) {
                    speedRef.current = base + Math.min(delta * 0.2, 7);
                }
            }
        };
        // Smooth decay back to base speed
        const decay = setInterval(() => {
            speedRef.current = speedRef.current * 0.86 + base * 0.14;
        }, 16);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => { window.removeEventListener("scroll", onScroll); clearInterval(decay); };
    }, [base]);

useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Duplicamos los items automáticamente
    const totalWidth = track.scrollWidth / 2;

    const tick = () => {
        posRef.current += speedRef.current * dir;

        if (dir > 0 && posRef.current >= totalWidth) {
            posRef.current -= totalWidth;
        }

        if (dir < 0 && posRef.current <= 0) {
            posRef.current += totalWidth;
        }

        track.style.transform = `translateX(${-posRef.current}px)`;
        rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
}, [dir, items]);
    return (
        <div ref={sectionRef} style={{ overflow: "hidden", width: "100%", WebkitMaskImage: "linear-gradient(90deg,transparent 0%,black 7%,black 93%,transparent 100%)", maskImage: "linear-gradient(90deg,transparent 0%,black 7%,black 93%,transparent 100%)" }}>
            <div ref={trackRef} style={{ display: "flex", padding: "8px 0", willChange: "transform" }}>
                {items.map((t, i) => <TCard key={i} t={t} />)}
            </div>
        </div>
    );
}



// ── VIDEO SECTION ──────────────────────────────

// ── MAIN ───────────────────────────────────────
export default function Testimonials() {

    const [vis, setVis] = useState({});
    const refs = useRef({});

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", fn);
        return () => window.removeEventListener("scroll", fn);
    }, []);

    useEffect(() => {
        const obs = new IntersectionObserver(
            entries => entries.forEach(e => { if (e.isIntersecting) setVis(v => ({ ...v, [(e.target as HTMLElement).dataset.id]: true })); }),
            { threshold: 0.1, rootMargin: "0px 0px -24px 0px" }
        );
        Object.values(refs.current).forEach(el => el && obs.observe(el as HTMLElement));
        return () => obs.disconnect();
    }, []);

    const r = id => el => { if (el) { el.dataset.id = id; refs.current[id] = el; } };
    const fu = (id, d = 0) => ({
        style: { transition: `opacity .65s ease ${d}ms, transform .65s ease ${d}ms`, opacity: vis[id] ? 1 : 0, transform: vis[id] ? "translateY(0)" : "translateY(26px)" }
    });

    const S = { fontFamily: "'Syne',sans-serif" };

    return (
        <div style={{ fontFamily: "'DM Sans',sans-serif", background: "#fff", color: "#111", overflowX: "hidden", minHeight: "100vh" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:linear-gradient(#833AB4,#E1306C,#F77737);border-radius:4px}
        @keyframes bobMain{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
        @keyframes bobBack{0%,100%{transform:rotate(8deg) translateY(0)}50%{transform:rotate(8deg) translateY(-10px)}}
        @keyframes floatBadge{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
        .a1{animation:fadeIn .7s ease .1s both}.a2{animation:fadeIn .7s ease .25s both}
        .a3{animation:fadeIn .7s ease .4s both}.a4{animation:fadeIn .7s ease .55s both}.a5{animation:fadeIn .8s ease .7s both}
        .igbtn{background:linear-gradient(90deg,#833AB4,#E1306C,#F77737);background-size:200%;color:#fff;border:none;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:8px;font-family:'DM Sans',sans-serif;font-weight:500;border-radius:100px;transition:background-position .4s,transform .2s,box-shadow .2s}
        .igbtn:hover{background-position:100%;transform:translateY(-2px);box-shadow:0 10px 30px rgba(225,48,108,0.4)}
        .fc{transition:transform .3s,box-shadow .3s,border-color .3s}
        .fc:hover{transform:translateY(-5px);box-shadow:0 20px 48px rgba(0,0,0,0.08);border-color:transparent}
        .sc{transition:background .3s,box-shadow .3s}
        .sc:hover{background:#ffffff;box-shadow:0 8px 32px rgba(0,0,0,0.06)}
        a{text-decoration:none}
      `}</style>






            {/* VIDEO */}


            {/* TESTIMONIALS */}
            <section style={{ padding: "96px 0", background: "#ffffff", overflow: "hidden" }} id="testimonios">
                <center style={{ display: "block", marginBottom: 48 }}>
                    <div style={{ padding: "0 5%", marginBottom: 52 }} ref={r("th")} {...fu("th")}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-center mb-16 cent"
                            >


                                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16 }} >
                                    <span style={{ width: 20, height: 1, background: "#ddd", display: "block" }} />
                                    <span style={{ fontSize: 11, fontWeight: 500, color: "#aaa", letterSpacing: "0.12em", textTransform: "uppercase" }}>Testimonios</span>
                                    <span style={{ width: 20, height: 1, background: "#ddd", display: "block" }} />
                                </div>

                                <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                                    Lo que dicen los <span className="gradient-text">creadores</span>
                                </h2>
                                <p className="text-muted-foreground max-w-lg mx-auto">
                                    Más de 10,000 diseñadores y creadores ya usan POSTIM.
                                </p>
                            </motion.div>


                        </div>

                    </div>
                </center>
                {/* Row 1 */}
                <div style={{ marginBottom: 12 }}>
                   <Carousel items={ROW1} dir={1} base={0.45} />
        </div>
        {/* Row 2 — opposite direction */}
        <Carousel items={ROW2} dir={-1} base={0.35} />
        

            </section>

        </div>
    );
}

function setScrolled(arg0: boolean) {
    throw new Error("Function not implemented.");
}
