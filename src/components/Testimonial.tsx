import { useEffect, useRef } from "react";
import SectionHeading from "./SectionHeading";

interface Testimonial {
  name: string;
  role: string;
  initials: string;
  grad: string;
  text: string;
}

const TESTIMONIALS: Testimonial[] = [
  { name: "Valentina Arce", role: "UI/UX Designer · Colombia", initials: "VA", grad: "135deg,#833AB4,#E1306C", text: "Antes tardaba 20 min en Figma. Con POSTIM lo hago en 2 y queda mucho mejor. Es mi herramienta número uno." },
  { name: "Mateo Rojas", role: "Freelance Designer · México", initials: "MR", grad: "135deg,#F77737,#FCAF45", text: "El control de padding es increíble. Le doy exactamente el espacio que quiero sin cálculos manuales." },
  { name: "Sofía López", role: "Content Creator · Argentina", initials: "SL", grad: "135deg,#405DE6,#833AB4", text: "Mi grilla nunca se había visto tan profesional. Todo consistente y elegante sin esfuerzo extra." },
  { name: "Carlos Mendez", role: "Brand Designer · Chile", initials: "CM", grad: "135deg,#E1306C,#F77737", text: "Poner tres celulares en una sola imagen me ahorra horas cada semana. POSTIM es indispensable en mi flujo." },
  { name: "Laura Pérez", role: "Social Media · España", initials: "LP", grad: "135deg,#833AB4,#405DE6", text: "Mis clientes no pueden creer lo profesional que se ven los posts. La diferencia es brutal." },
  { name: "Diego Fuentes", role: "Product Designer · Perú", initials: "DF", grad: "135deg,#FCAF45,#F77737", text: "Súper intuitivo desde el primer uso. Los mockups de celular son increíblemente realistas." },
  { name: "Ana Torres", role: "Illustrator · Uruguay", initials: "AT", grad: "135deg,#E1306C,#833AB4", text: "Finalmente una herramienta que entiende al creador. Rápido, bonito y preciso en cada detalle." },
  { name: "Ramón Vidal", role: "UX Lead · Colombia", initials: "RV", grad: "135deg,#405DE6,#E1306C", text: "Uso POSTIM para toda mi presencia en redes. Las notificaciones glass estilo iOS son un detalle genial." },
  { name: "Isabella Gómez", role: "Freelance Marketer · México", initials: "IG", grad: "135deg,#F77737,#E1306C", text: "La calidad de los mockups es impresionante. Mis campañas se ven mucho más profesionales." },
  { name: "Santiago Ruiz", role: "Creative Director · Argentina", initials: "SR", grad: "135deg,#833AB4,#FCAF45", text: "El mejor mockup maker que he probado. Rápido, fácil y con resultados de alta calidad." },
  { name: "Camila Fernández", role: "Content Strategist · Chile", initials: "CF", grad: "135deg,#E1306C,#405DE6", text: "Mis posts nunca se habían visto tan bien. POSTIM es mi secreto para un feed cohesivo y atractivo." },
];

const ROW1 = [...TESTIMONIALS, ...TESTIMONIALS];
const ROW2 = [...TESTIMONIALS.slice(4), ...TESTIMONIALS.slice(0, 4), ...TESTIMONIALS.slice(4), ...TESTIMONIALS.slice(0, 4)];

const Star = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="#FCAF45" aria-hidden>
    <polygon points="6,0 7.5,4.5 12,4.5 8.5,7 9.8,11.5 6,9 2.2,11.5 3.5,7 0,4.5 4.5,4.5" />
  </svg>
);

const handle = (name: string) =>
  "@" +
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, ".");

const Verified = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" aria-label="Verificado">
    <path fill="#3897f0" d="M12 1.5l2.4 1.8 3-.2.9 2.9 2.5 1.7-.9 2.9.9 2.9-2.5 1.7-.9 2.9-3-.2L12 22.5l-2.4-1.8-3 .2-.9-2.9-2.5-1.7.9-2.9-.9-2.9 2.5-1.7.9-2.9 3 .2z" />
    <path d="M8 12.2l2.6 2.6L16.2 9" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TCard = ({ t, index }: { t: Testimonial; index: number }) => (
  <div className="group mx-2 w-[320px] shrink-0 rounded-[24px] bg-zinc-100 p-px transition-all duration-300 hover:-translate-y-1 hover:bg-[linear-gradient(135deg,#833ab4,#e1306c,#f77737,#fcaf45)]">
    <figure className="relative h-full rounded-[23px] bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] transition-shadow duration-300 group-hover:shadow-[0_16px_40px_-12px_rgba(225,48,108,0.25)]">
      {/* Comillas decorativas */}
      <svg viewBox="0 0 32 32" className="absolute right-5 top-5 h-8 w-8 text-zinc-100 transition-colors group-hover:text-pink-100" fill="currentColor" aria-hidden>
        <path d="M9.3 25C5.8 25 3 22.2 3 18.4 3 12.5 7.6 7.6 13.4 7v3.6c-3.2.7-5.4 3-5.8 6 .5-.2 1.1-.3 1.7-.3 3 0 5.3 2.2 5.3 4.9 0 2.6-2.3 3.8-5.3 3.8zm15 0c-3.5 0-6.3-2.8-6.3-6.6 0-5.9 4.6-10.8 10.4-11.4v3.6c-3.2.7-5.4 3-5.8 6 .5-.2 1.1-.3 1.7-.3 3 0 5.3 2.2 5.3 4.9 0 2.6-2.3 3.8-5.3 3.8z" />
      </svg>

      <figcaption className="flex items-center gap-3">
        <span className="rounded-full p-[2px]" style={{ background: "linear-gradient(45deg,#fcaf45,#e1306c,#833ab4)" }}>
          <span
            className="grid h-10 w-10 place-items-center rounded-full border-2 border-white text-[12px] font-bold text-white"
            style={{ background: `linear-gradient(${t.grad})` }}
          >
            {t.initials}
          </span>
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-1 text-[13.5px] font-semibold tracking-tight text-zinc-900">
            <span className="truncate">{t.name}</span>
            {index % 3 !== 2 && <Verified />}
          </div>
          <div className="truncate text-[11.5px] text-zinc-400">{handle(t.name)}</div>
        </div>
      </figcaption>

      <blockquote className="mt-4 text-[14px] leading-relaxed text-zinc-600">{t.text}</blockquote>

      <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4">
        <div className="flex gap-[3px]">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} />
          ))}
        </div>
        <span className="text-[11px] text-zinc-400">{t.role}</span>
      </div>
    </figure>
  </div>
);

/** Carrusel infinito cuya velocidad aumenta al hacer scroll y vuelve suavemente a la base */
const Carousel = ({ items, dir = 1, base = 0.4 }: { items: Testimonial[]; dir?: 1 | -1; base?: number }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pos = useRef(0);
  const speed = useRef(base);
  const hovered = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    const wrap = wrapRef.current;
    if (!track || !wrap) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lastY = window.scrollY;
    let raf = 0;
    let half = track.scrollWidth / 2;
    if (dir < 0) pos.current = half;

    const onScroll = () => {
      const delta = Math.abs(window.scrollY - lastY);
      lastY = window.scrollY;
      const r = wrap.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        speed.current = base + Math.min(delta * 0.2, 7);
      }
    };
    const onResize = () => {
      half = track.scrollWidth / 2;
    };

    const tick = () => {
      // Decae hacia la velocidad base; se frena al pasar el mouse
      const target = hovered.current ? 0 : base;
      speed.current = speed.current * 0.94 + target * 0.06;
      pos.current += speed.current * dir;
      if (pos.current >= half) pos.current -= half;
      if (pos.current < 0) pos.current += half;
      track.style.transform = `translate3d(${-pos.current}px,0,0)`;
      raf = requestAnimationFrame(tick);
    };

    if (!reduced) raf = requestAnimationFrame(tick);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [base, dir]);

  return (
    <div
      ref={wrapRef}
      className="w-full overflow-hidden mask-fade-x"
      onMouseEnter={() => (hovered.current = true)}
      onMouseLeave={() => (hovered.current = false)}
    >
      <div ref={trackRef} className="flex py-2 will-change-transform">
        {items.map((t, i) => (
          <TCard key={i} t={t} index={i} />
        ))}
      </div>
    </div>
  );
};

export default function Testimonials() {
  return (
    <section id="testimonios" className="scroll-mt-20 overflow-hidden bg-white py-20 sm:py-28">
      <SectionHeading
        eyebrow="Testimonios"
        title={
          <>
            Lo que dicen los <span className="gradient-text">creadores</span>
          </>
        }
        description="Más de 10.000 diseñadores y creadores ya usan POSTIM."
        className="px-5"
      />
      <div className="space-y-3">
        <Carousel items={ROW1} dir={1} base={0.45} />
        <Carousel items={ROW2} dir={-1} base={0.35} />
      </div>
    </section>
  );
}
