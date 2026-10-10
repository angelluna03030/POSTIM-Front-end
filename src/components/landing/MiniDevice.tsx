import { cn } from "@/lib/utils";

/** Gradientes para las "fotos" de los posts falsos */
const POST_GRADIENTS = [
  "linear-gradient(135deg,#fcaf45 0%,#e1306c 50%,#833ab4 100%)",
  "linear-gradient(160deg,#a5b4fc 0%,#6366f1 55%,#312e81 100%)",
  "linear-gradient(160deg,#fed7aa 0%,#fb923c 50%,#e11d48 100%)",
  "linear-gradient(160deg,#a7f3d0 0%,#14b8a6 55%,#0f766e 100%)",
];

const AVATARS = ["#e1306c", "#6366f1", "#f77737", "#14b8a6"];

/**
 * Pantalla con interfaz tipo Instagram. Todas las medidas usan `cqw`
 * (ancho del contenedor) para escalar con cualquier tamaño de celular.
 */
export const FakeScreen = ({ variant = 0 }: { variant?: number }) => {
  const v = variant % POST_GRADIENTS.length;
  return (
    <div className="flex h-full w-full flex-col bg-white text-zinc-900" style={{ containerType: "inline-size" }}>
      {/* Barra de estado */}
      <div className="flex items-center justify-between font-semibold" style={{ padding: "5cqw 8cqw 2cqw", fontSize: "5.5cqw" }}>
        <span>9:41</span>
        <span className="flex items-center" style={{ gap: "1.5cqw" }}>
          <span className="rounded-[1px] bg-zinc-900" style={{ width: "6cqw", height: "3cqw" }} />
          <span className="rounded-full bg-zinc-900" style={{ width: "3cqw", height: "3cqw" }} />
        </span>
      </div>
      {/* Cabecera del post */}
      <div className="flex items-center" style={{ gap: "3cqw", padding: "3cqw 5cqw" }}>
        <span className="rounded-full p-[1.2cqw]" style={{ background: "linear-gradient(45deg,#fcaf45,#e1306c,#833ab4)" }}>
          <span className="block rounded-full border-white" style={{ width: "9cqw", height: "9cqw", background: AVATARS[v], borderWidth: "1cqw" }} />
        </span>
        <span className="flex-1">
          <span className="block rounded-full bg-zinc-800" style={{ width: "30cqw", height: "3cqw" }} />
          <span className="mt-[1.5cqw] block rounded-full bg-zinc-300" style={{ width: "18cqw", height: "2.4cqw" }} />
        </span>
        <span className="font-bold leading-none text-zinc-500" style={{ fontSize: "7cqw" }}>···</span>
      </div>
      {/* Foto */}
      <div className="relative aspect-[4/5] w-full overflow-hidden" style={{ background: POST_GRADIENTS[v] }}>
        <div className="absolute rounded-full bg-white/30 blur-[4cqw]" style={{ width: "50cqw", height: "50cqw", left: "-10cqw", top: "-8cqw" }} />
        <div className="absolute rounded-[6cqw] border border-white/40 bg-white/20 backdrop-blur-sm" style={{ inset: "auto 10cqw 10cqw 10cqw", height: "16cqw" }} />
      </div>
      {/* Acciones */}
      <div className="flex items-center" style={{ gap: "4cqw", padding: "3.5cqw 5cqw 2cqw" }}>
        <svg viewBox="0 0 24 24" style={{ width: "8cqw", height: "8cqw" }} fill="#ef4444">
          <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2 0 3.6 1.1 4.4 2.7.2.4.6.4.8 0 .8-1.6 2.4-2.7 4.4-2.7 3.7 0 5.8 3.9 4.3 7.3C18.5 16.4 12 21 12 21z" />
        </svg>
        <svg viewBox="0 0 24 24" style={{ width: "7.5cqw", height: "7.5cqw" }} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-4-7.5L21 3l-1 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <svg viewBox="0 0 24 24" style={{ width: "7.5cqw", height: "7.5cqw" }} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinejoin="round" />
        </svg>
        <span className="flex-1" />
        <svg viewBox="0 0 24 24" style={{ width: "7.5cqw", height: "7.5cqw" }} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" strokeLinejoin="round" />
        </svg>
      </div>
      <div style={{ padding: "0 5cqw" }} className="space-y-[1.8cqw]">
        <span className="block rounded-full bg-zinc-800" style={{ width: "36cqw", height: "2.8cqw" }} />
        <span className="block rounded-full bg-zinc-300" style={{ width: "78cqw", height: "2.4cqw" }} />
        <span className="block rounded-full bg-zinc-300" style={{ width: "55cqw", height: "2.4cqw" }} />
      </div>
      {/* Barra inferior */}
      <div className="mt-auto flex items-center justify-around border-t border-zinc-100" style={{ padding: "3cqw 4cqw 6cqw" }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={i === 4 ? "rounded-full" : "rounded-[1.5cqw] border-zinc-800"}
            style={i === 4 ? { width: "6.5cqw", height: "6.5cqw", background: AVATARS[v] } : { width: "6cqw", height: "6cqw", borderWidth: "0.9cqw" }}
          />
        ))}
      </div>
    </div>
  );
};

export const MiniPhone = ({
  className,
  variant = 0,
  children,
  style,
}: {
  className?: string;
  variant?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}) => (
  <div className={cn("relative aspect-[9/19.2]", className)} style={style}>
    {/* Botones laterales */}
    <span className="absolute -left-[1.2%] top-[20%] h-[6%] w-[1.6%] rounded-l-sm bg-zinc-700" />
    <span className="absolute -left-[1.2%] top-[29%] h-[9%] w-[1.6%] rounded-l-sm bg-zinc-700" />
    <span className="absolute -right-[1.2%] top-[26%] h-[13%] w-[1.6%] rounded-r-sm bg-zinc-700" />
    <div
      className="relative h-full w-full rounded-[15%/7.2%] p-[3%] shadow-[0_30px_50px_-20px_rgba(0,0,0,0.45),0_8px_16px_-8px_rgba(0,0,0,0.3)]"
      style={{ background: "linear-gradient(145deg,#3f3f46,#18181b 35%,#09090b)" }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[12.5%/5.9%] bg-white ring-1 ring-black/40">
        {children ?? <FakeScreen variant={variant} />}
        <div className="absolute left-1/2 top-[1.6%] h-[3.6%] w-[30%] -translate-x-1/2 rounded-full bg-black" />
        {/* Reflejo */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.22)_0%,transparent_32%)]" />
      </div>
    </div>
  </div>
);

export const MiniTablet = ({ className, variant = 1 }: { className?: string; variant?: number }) => (
  <div className={cn("relative aspect-[3/4] rounded-[8%/6%] p-[3%] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.35)]", className)} style={{ background: "linear-gradient(145deg,#e4e4e7,#a1a1aa)" }}>
    <div className="h-full w-full overflow-hidden rounded-[5.5%/4%]">
      <FakeScreen variant={variant} />
    </div>
  </div>
);
