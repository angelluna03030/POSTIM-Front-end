import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AppWindow,
  ArrowDown,
  ArrowUp,
  Copy,
  Crosshair,
  ImagePlus,
  Laptop,
  MessageCircle,
  MousePointerClick,
  Plus,
  RotateCcw,
  RotateCw,
  SlidersHorizontal,
  Smartphone,
  Tablet,
  Trash2,
  Type,
  Upload,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import type { DeviceStyle, DeviceType } from "@/lib/devices";
import { BACKGROUNDS, BACKGROUND_CATEGORIES, type BackgroundCategory } from "@/lib/backgrounds";
import {
  LAYOUT_PRESETS,
  MAX_DEVICES,
  MAX_TEXTS,
  TEMPLATES,
  TEXT_PRESETS,
  createDevice,
  type DeviceItem,
  type LayoutPreset,
  type MockupSettings,
  type TextItem,
  type TextStyle,
} from "@/lib/mockup";
import { cn } from "@/lib/utils";
import { MiniPhone } from "@/components/landing/MiniDevice";
import ImageEditorDialog from "@/components/ImageEditorDialog";
import { isAdjusted } from "@/lib/image-adjust";

// ────────────────────────────────────────────
// Datos
// ────────────────────────────────────────────
const DEVICES: { value: DeviceType; label: string; icon: React.ElementType }[] = [
  { value: "iphone15", label: "iPhone", icon: Smartphone },
  { value: "pixel8", label: "Pixel", icon: Smartphone },
  { value: "ipad", label: "iPad", icon: Tablet },
  { value: "macbook", label: "MacBook", icon: Laptop },
  { value: "browser", label: "Web", icon: AppWindow },
];

const FRAME_COLORS = [
  { value: "#18181b", label: "Negro" },
  { value: "#f4f4f5", label: "Blanco" },
  { value: "#a1a1aa", label: "Plata" },
  { value: "#bfb5a3", label: "Titanio" },
  { value: "#1e3a5f", label: "Azul" },
];

const TEXT_STYLES: { value: TextStyle; label: string; preview: React.ReactNode }[] = [
  {
    value: "glass",
    label: "Glass iOS",
    preview: <div className="h-4 w-12 rounded-full border border-white/70 bg-white/40 shadow-[inset_0_1px_0_white] backdrop-blur" />,
  },
  {
    value: "notification",
    label: "Notificación",
    preview: (
      <div className="flex h-5 w-14 items-center gap-1 rounded-md border border-white/70 bg-white/45 px-1 backdrop-blur">
        <span className="h-3 w-3 rounded-[3px] gradient-bg" />
        <span className="h-1 flex-1 rounded bg-zinc-700/40" />
      </div>
    ),
  },
  {
    value: "imessage",
    label: "iMessage",
    preview: (
      <div className="flex w-14 flex-col gap-0.5">
        <span className="h-2 w-8 rounded-full bg-zinc-200" />
        <span className="h-2 w-9 self-end rounded-full bg-[#0a84ff]" />
      </div>
    ),
  },
  {
    value: "whatsapp",
    label: "WhatsApp",
    preview: (
      <div className="flex w-14 flex-col gap-0.5">
        <span className="h-2 w-8 rounded-sm bg-white shadow-sm" />
        <span className="h-2 w-9 self-end rounded-sm bg-[#d9fdd3] shadow-sm" />
      </div>
    ),
  },
  {
    value: "igdm",
    label: "DM Instagram",
    preview: (
      <div className="flex w-14 flex-col gap-0.5">
        <span className="h-2 w-8 rounded-full bg-zinc-100" />
        <span className="h-2 w-9 self-end rounded-full bg-[linear-gradient(90deg,#a033ff,#ff5c87,#ff7b3f)]" />
      </div>
    ),
  },
  {
    value: "comment",
    label: "Comentario",
    preview: (
      <div className="flex h-5 w-14 items-center gap-1 rounded-md bg-white px-1 shadow-sm">
        <span className="h-3 w-3 rounded-full bg-[linear-gradient(45deg,#fcaf45,#e1306c,#833ab4)]" />
        <span className="h-1 flex-1 rounded bg-zinc-700/50" />
        <span className="text-[7px] text-red-500">♥</span>
      </div>
    ),
  },
  {
    value: "review",
    label: "Reseña",
    preview: <span className="text-[9px] leading-none tracking-tighter text-[#ff9f0a]">★★★★★</span>,
  },
  {
    value: "pill",
    label: "Etiqueta",
    preview: <div className="h-3.5 w-11 rounded-full border border-white/70 bg-white/50 backdrop-blur" />,
  },
  {
    value: "gradient",
    label: "Gradiente",
    preview: <div className="h-4 w-12 rounded-md bg-[linear-gradient(120deg,#833ab4,#e1306c,#fcaf45)]" />,
  },
  { value: "light", label: "Claro", preview: <div className="h-4 w-12 rounded-md bg-white shadow" /> },
  { value: "dark", label: "Oscuro", preview: <div className="h-4 w-12 rounded-md bg-zinc-900" /> },
];

const STYLE_LABELS: Record<DeviceStyle, string> = { realistic: "Realista", minimal: "Minimal", clay: "Clay" };

const FIELD_LABELS: Record<TextStyle, { label?: string; title: string; subtitle: string }> = {
  glass: { title: "Título", subtitle: "Subtítulo" },
  notification: { label: "Nombre de la app", title: "Título", subtitle: "Mensaje" },
  imessage: { title: "Mensaje enviado (azul)", subtitle: "Mensaje recibido (gris)" },
  whatsapp: { title: "Mensaje enviado (verde)", subtitle: "Mensaje recibido (blanco)" },
  igdm: { title: "Mensaje enviado", subtitle: "Mensaje recibido" },
  comment: { label: "Usuario", title: "Comentario", subtitle: "Tiempo y Me gusta" },
  review: { label: "Autor", title: "Título de la reseña", subtitle: "Texto de la reseña" },
  pill: { title: "Texto de la etiqueta", subtitle: "" },
  gradient: { title: "Título", subtitle: "Subtítulo" },
  light: { title: "Título", subtitle: "Subtítulo" },
  dark: { title: "Título", subtitle: "Subtítulo" },
};

const itemName = (item: DeviceItem | TextItem, settings: MockupSettings) => {
  if (item.kind === "device") {
    const label = DEVICES.find((d) => d.value === item.type)?.label ?? "Dispositivo";
    const same = settings.devices.filter((d) => d.type === item.type);
    return same.length > 1 ? `${label} ${same.indexOf(item) + 1}` : label;
  }
  return item.title || item.subtitle || TEXT_STYLES.find((s) => s.value === item.style)?.label || "Texto";
};

// ────────────────────────────────────────────
// Piezas de UI
// ────────────────────────────────────────────
const Section = ({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) => (
  <section className="border-b border-border px-5 py-5 last:border-b-0">
    <div className="mb-3.5 flex items-center justify-between">
      <h3 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{title}</h3>
      {action}
    </div>
    <div className="space-y-4">{children}</div>
  </section>
);

const Field = ({ label, value, onReset, children }: { label: string; value: string; onReset?: () => void; children: React.ReactNode }) => (
  <div>
    <div className="mb-2.5 flex items-center justify-between text-[13px]">
      <span>{label}</span>
      <button
        type="button"
        title="Doble clic para restablecer"
        onDoubleClick={onReset}
        className="rounded px-1 font-mono text-xs tabular-nums text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        {value}
      </button>
    </div>
    {children}
  </div>
);

function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="grid rounded-lg bg-muted p-0.5" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "h-7 rounded-md text-xs font-medium transition-all",
            value === o.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

const IconButton = ({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    disabled={disabled}
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className={cn(
      "grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-30",
      danger ? "hover:text-destructive" : "hover:text-foreground",
    )}
  >
    {children}
  </button>
);

const swatchClass = (active: boolean) =>
  cn(
    "relative aspect-square w-full rounded-lg ring-offset-2 ring-offset-background transition-all",
    active ? "ring-2 ring-foreground" : "ring-1 ring-black/10 hover:ring-black/25",
  );

const inputClass =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-[13px] outline-none transition-colors focus:border-foreground/40";

// ────────────────────────────────────────────
// Panel
// ────────────────────────────────────────────
export interface ControlPanelProps {
  settings: MockupSettings;
  onChange: (patch: Partial<MockupSettings>) => void;
  onItemChange: (id: string, patch: Partial<DeviceItem> | Partial<TextItem>) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  images: Record<string, string>;
  onImageUpload: (deviceId: string, file: File) => void;
  onImageRemove: (deviceId: string) => void;
  customBgImage: string | null;
  onBgImageUpload: (file: File) => void;
  onAddDevice: () => void;
  onAddText: () => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (id: string, dir: -1 | 1) => void;
  onApplyLayout: (preset: LayoutPreset) => void;
  onApplyTemplate: (id: string) => void;
}

type Tab = "element" | "scene";

const ControlPanel = (props: ControlPanelProps) => {
  const { settings, selectedId } = props;
  const [tab, setTab] = useState<Tab>(selectedId ? "element" : "scene");

  useEffect(() => {
    if (selectedId) setTab("element");
  }, [selectedId]);

  const selected: DeviceItem | TextItem | undefined =
    settings.devices.find((d) => d.id === selectedId) ?? settings.texts.find((t) => t.id === selectedId);

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 px-5 py-3 backdrop-blur">
        <Segmented<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: "element", label: "Elemento" },
            { value: "scene", label: "Escena" },
          ]}
        />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab + (selected?.id ?? "")}
          initial={{ opacity: 0, x: tab === "element" ? -8 : 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {tab === "scene" ? (
            <ScenePanel {...props} />
          ) : !selected ? (
            <EmptySelection {...props} />
          ) : selected.kind === "device" ? (
            <DevicePanel {...props} device={selected} />
          ) : (
            <TextPanel {...props} text={selected} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// ── Sin selección ──
const EmptySelection = ({ settings, onSelect, onAddDevice, onAddText }: ControlPanelProps) => (
  <div className="px-5 py-10 text-center">
    <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-muted">
      <MousePointerClick className="h-5 w-5 text-muted-foreground" />
    </div>
    <p className="text-sm font-medium">Nada seleccionado</p>
    <p className="mx-auto mt-1 max-w-[220px] text-xs text-muted-foreground">Haz clic en un dispositivo o texto del lienzo para editarlo.</p>
    <div className="mt-6 flex flex-col gap-2">
      {settings.devices[0] && (
        <button type="button" onClick={() => onSelect(settings.devices[0].id)} className="h-9 rounded-lg border border-border text-[13px] transition-colors hover:bg-muted">
          Seleccionar el primer dispositivo
        </button>
      )}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={settings.devices.length >= MAX_DEVICES}
          onClick={onAddDevice}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-foreground text-[13px] text-background disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" /> Dispositivo
        </button>
        <button
          type="button"
          disabled={settings.texts.length >= MAX_TEXTS}
          onClick={onAddText}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border text-[13px] hover:bg-muted disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" /> Texto
        </button>
      </div>
    </div>
  </div>
);

// ── Miniatura de plantilla ──
const TemplatePreview = ({ template, background }: { template: (typeof TEMPLATES)[number]; background: string }) => {
  const devices = template.devices.slice(0, 3);
  const n = devices.length;
  const fan = template.layout === "fan";
  const persp = template.layout === "perspective";
  return (
    <div className="relative flex h-24 items-end justify-center overflow-hidden" style={{ background, perspective: 300 }}>
      {devices.map((d, i) => {
        const off = i - (n - 1) / 2;
        if (d.type === "browser") {
          return (
            <div key={i} className="mb-3 h-[52px] w-[82px] overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black/10">
              <div className="flex h-2.5 items-center gap-[2px] bg-zinc-100 px-1">
                <span className="h-1 w-1 rounded-full bg-[#ff5f57]" />
                <span className="h-1 w-1 rounded-full bg-[#febc2e]" />
                <span className="h-1 w-1 rounded-full bg-[#28c840]" />
              </div>
              <div className="h-full" style={{ background: "linear-gradient(160deg,#eef2ff,#a5b4fc)" }} />
            </div>
          );
        }
        const small = template.devices.some((x) => x.type === "browser");
        return (
          <MiniPhone
            key={i}
            variant={i}
            className={cn("shrink-0 transition-transform duration-300 group-hover:-translate-y-1", small ? "-ml-4 mb-2 w-[30px]" : "w-[40px]")}
            style={{
              marginLeft: !small && i > 0 ? (fan ? -12 : 4) : undefined,
              transform: `translateY(${fan ? Math.abs(off) * 6 + 14 : n === 1 ? 10 : 16}px) rotate(${fan ? off * 14 : 0}deg) ${persp ? "rotateY(28deg)" : ""}`,
              zIndex: fan && off === 0 ? 2 : 1,
            }}
          />
        );
      })}
      {template.texts[0] && (
        <span className="absolute bottom-2 left-1/2 h-2.5 w-14 -translate-x-1/2 rounded-full border border-white/70 bg-white/70 shadow-sm backdrop-blur" />
      )}
    </div>
  );
};

// ── Pestaña Escena ──
const ScenePanel = (props: ControlPanelProps) => {
  const {
    settings,
    onChange,
    selectedId,
    onSelect,
    images,
    customBgImage,
    onBgImageUpload,
    onAddDevice,
    onAddText,
    onDuplicate,
    onDelete,
    onReorder,
    onApplyLayout,
    onApplyTemplate,
  } = props;
  const activeCategory = BACKGROUNDS.find((b) => b.id === settings.background)?.category ?? "instagram";
  const [category, setCategory] = useState<BackgroundCategory>(activeCategory);
  // De arriba (frente) hacia abajo (fondo): primero los textos, luego los dispositivos
  const layers: (DeviceItem | TextItem)[] = [...[...settings.texts].reverse(), ...[...settings.devices].reverse()];

  return (
    <>
      <Section title="Plantillas">
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATES.map((t) => {
            const bg = BACKGROUNDS.find((b) => b.id === t.background)?.css ?? "#f4f4f5";
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onApplyTemplate(t.id)}
                className="group overflow-hidden rounded-xl border border-border text-left transition-all hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-sm"
              >
                <TemplatePreview template={t} background={bg} />
                <div className="px-2.5 py-2">
                  <div className="text-[12px] font-medium">{t.label}</div>
                  <div className="truncate text-[10.5px] text-muted-foreground">{t.description}</div>
                </div>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">Tus capturas se mantienen al cambiar de plantilla.</p>
      </Section>

      <Section title="Capas" action={<span className="font-mono text-[11px] text-muted-foreground">{settings.devices.length}/{MAX_DEVICES} disp.</span>}>
        <div className="space-y-1">
          {layers.map((item) => {
            const list: (DeviceItem | TextItem)[] = item.kind === "device" ? settings.devices : settings.texts;
            const idx = list.findIndex((x) => x.id === item.id);
            const Icon =
              item.kind === "device" ? DEVICES.find((d) => d.value === item.type)?.icon ?? Smartphone : item.style === "imessage" ? MessageCircle : Type;
            return (
              <div
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={cn(
                  "group flex cursor-pointer items-center gap-2.5 rounded-lg border px-2 py-1.5 transition-colors",
                  selectedId === item.id ? "border-foreground/20 bg-muted" : "border-transparent hover:bg-muted/60",
                )}
              >
                {item.kind === "device" && images[item.id] ? (
                  <img src={images[item.id]} alt="" className="h-7 w-7 rounded-md object-cover ring-1 ring-black/5" />
                ) : (
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-background ring-1 ring-black/5">
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </span>
                )}
                <span className="min-w-0 flex-1 truncate text-[13px]">{itemName(item, settings)}</span>
                <div className="flex opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
                  <IconButton label="Traer adelante" onClick={() => onReorder(item.id, 1)} disabled={idx === list.length - 1}>
                    <ArrowUp className="h-3.5 w-3.5" />
                  </IconButton>
                  <IconButton label="Enviar atrás" onClick={() => onReorder(item.id, -1)} disabled={idx === 0}>
                    <ArrowDown className="h-3.5 w-3.5" />
                  </IconButton>
                  <IconButton label="Duplicar" onClick={() => onDuplicate(item.id)}>
                    <Copy className="h-3.5 w-3.5" />
                  </IconButton>
                  <IconButton label="Eliminar" onClick={() => onDelete(item.id)} danger>
                    <Trash2 className="h-3.5 w-3.5" />
                  </IconButton>
                </div>
              </div>
            );
          })}
          {layers.length === 0 && <p className="py-2 text-xs text-muted-foreground">El lienzo está vacío.</p>}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={settings.devices.length >= MAX_DEVICES}
            onClick={onAddDevice}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border text-[13px] transition-colors hover:bg-muted disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" /> Dispositivo
          </button>
          <button
            type="button"
            disabled={settings.texts.length >= MAX_TEXTS}
            onClick={onAddText}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border text-[13px] transition-colors hover:bg-muted disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" /> Texto
          </button>
        </div>
      </Section>

      <Section title="Diseño automático">
        <div className="grid grid-cols-5 gap-1.5">
          {LAYOUT_PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              disabled={settings.devices.length === 0}
              onClick={() => onApplyLayout(p.value)}
              className="flex flex-col items-center gap-1.5 rounded-lg border border-border py-2 text-[10px] text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:opacity-40"
            >
              <LayoutIcon preset={p.value} />
              {p.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Reacomoda todos los dispositivos de la escena.</p>
      </Section>

      <Section title="Fondo">
        <div className="flex gap-1 overflow-x-auto">
          {BACKGROUND_CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(c.value)}
              className={cn(
                "h-7 shrink-0 rounded-full px-3 text-xs transition-colors",
                category === c.value ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-5 gap-2">
          {BACKGROUNDS.filter((b) => b.category === category).map((b) => (
            <button
              key={b.id}
              type="button"
              title={b.label}
              aria-label={b.label}
              onClick={() => onChange({ background: b.id })}
              className={swatchClass(settings.background === b.id)}
              style={{ background: b.css }}
            />
          ))}
          <label
            title="Color personalizado"
            className={cn(swatchClass(settings.background === "color"), "cursor-pointer overflow-hidden")}
            style={{
              background:
                settings.background === "color" ? settings.bgColor : "conic-gradient(from 90deg, #f87171, #facc15, #4ade80, #60a5fa, #c084fc, #f87171)",
            }}
          >
            <input
              type="color"
              value={settings.bgColor}
              onChange={(e) => onChange({ background: "color", bgColor: e.target.value })}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </label>
          <label
            title="Subir imagen de fondo"
            className={cn(swatchClass(settings.background === "custom"), "grid cursor-pointer place-items-center bg-muted")}
            style={customBgImage ? { backgroundImage: `url(${customBgImage})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
            onClick={(e) => {
              // Si ya hay imagen y no está activa, el primer clic solo la selecciona
              if (customBgImage && settings.background !== "custom") {
                e.preventDefault();
                onChange({ background: "custom" });
              }
            }}
          >
            {!customBgImage && <ImagePlus className="h-4 w-4 text-muted-foreground" />}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onBgImageUpload(f);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        <Field label="Margen del lienzo" value={`${settings.padding}%`} onReset={() => onChange({ padding: 8 })}>
          <Slider value={[settings.padding]} onValueChange={([v]) => onChange({ padding: v })} min={0} max={25} step={0.5} />
        </Field>
      </Section>

      <Section title="Efectos de fondo">
        <Field label="Grano" value={`${settings.grain}%`} onReset={() => onChange({ grain: 0 })}>
          <Slider value={[settings.grain]} onValueChange={([v]) => onChange({ grain: v })} min={0} max={60} step={1} />
        </Field>
        <Field label="Viñeta" value={`${settings.vignette}%`} onReset={() => onChange({ vignette: 0 })}>
          <Slider value={[settings.vignette]} onValueChange={([v]) => onChange({ vignette: v })} min={0} max={70} step={1} />
        </Field>
        {settings.background === "custom" && (
          <Field label="Desenfoque de la imagen" value={`${settings.bgBlur}px`} onReset={() => onChange({ bgBlur: 0 })}>
            <Slider value={[settings.bgBlur]} onValueChange={([v]) => onChange({ bgBlur: v })} min={0} max={40} step={1} />
          </Field>
        )}
      </Section>
    </>
  );
};

const LayoutIcon = ({ preset }: { preset: LayoutPreset }) => {
  const items: Record<LayoutPreset, React.CSSProperties[]> = {
    row: [{ left: 2 }, { left: 10 }, { left: 18 }],
    stagger: [{ left: 2, top: 3 }, { left: 10, top: 0, height: 18 }, { left: 18, top: 3 }],
    fan: [{ left: 3, transform: "rotate(-18deg)" }, { left: 10, top: 0 }, { left: 17, transform: "rotate(18deg)" }],
    perspective: [{ left: 2, transform: "skewY(-14deg)" }, { left: 10, transform: "skewY(-14deg)" }, { left: 18, transform: "skewY(-14deg)" }],
    cascade: [{ left: 3, top: 0 }, { left: 9, top: 2 }, { left: 15, top: 4 }],
  };
  return (
    <span className="relative block h-[20px] w-[28px]">
      {items[preset].map((s, i) => (
        <span key={i} className="absolute h-4 w-2 rounded-[2px] border border-current bg-background" style={{ top: 2, ...s }} />
      ))}
    </span>
  );
};

// ── Pestaña Elemento: dispositivo ──
const DevicePanel = ({
  device,
  onItemChange,
  images,
  onImageUpload,
  onImageRemove,
  onDuplicate,
  onDelete,
  settings,
}: ControlPanelProps & { device: DeviceItem }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const set = (patch: Partial<DeviceItem>) => onItemChange(device.id, patch);
  const defaults = createDevice();
  const image = images[device.id];
  const customFrame = !FRAME_COLORS.some((c) => c.value === device.frameColor);
  const rotate90 = (delta: number) => set({ rotation: ((((device.rotation + delta + 180) % 360) + 360) % 360) - 180 });

  return (
    <>
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <span className="truncate text-sm font-medium">{itemName(device, settings)}</span>
        <div className="flex">
          <IconButton label="Centrar en el lienzo" onClick={() => set({ x: 50, y: 50 })}>
            <Crosshair className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton label="Duplicar (Ctrl+D)" onClick={() => onDuplicate(device.id)} disabled={settings.devices.length >= MAX_DEVICES}>
            <Copy className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton label="Eliminar (Supr)" onClick={() => onDelete(device.id)} danger>
            <Trash2 className="h-3.5 w-3.5" />
          </IconButton>
        </div>
      </div>

      <Section title="Captura">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onImageUpload(device.id, f);
            e.target.value = "";
          }}
        />
        {image ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-xl border border-border p-2">
              <button type="button" onClick={() => setEditing(true)} className="relative shrink-0" title="Editar imagen">
                <img src={image} alt="" className="h-14 w-14 rounded-lg border border-border object-cover" />
                {isAdjusted(device.adjust) && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-background gradient-bg" />}
              </button>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium">Imagen cargada</div>
                <button type="button" onClick={() => fileRef.current?.click()} className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline">
                  Cambiar
                </button>
              </div>
              <IconButton label="Quitar imagen" onClick={() => onImageRemove(device.id)} danger>
                <Trash2 className="h-4 w-4" />
              </IconButton>
            </div>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-foreground text-[13px] font-medium text-background transition-opacity hover:opacity-90"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" /> Editar imagen
            </button>
            <ImageEditorDialog
              open={editing}
              onOpenChange={setEditing}
              device={device}
              image={image}
              onChange={set}
              onReplace={() => fileRef.current?.click()}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="group flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-foreground/20 px-4 py-6 text-center transition-colors hover:border-foreground/40 hover:bg-muted/50"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-muted transition-transform group-hover:-translate-y-0.5">
              <Upload className="h-4 w-4" />
            </span>
            <span className="text-[13px] font-medium">Subir captura</span>
            <span className="text-xs text-muted-foreground">Arrastra, pega con Ctrl+V o doble clic en el dispositivo</span>
          </button>
        )}
        <Field label="Ajuste de imagen" value={device.imageFit === "cover" ? "Cubrir" : "Contener"}>
          <Segmented
            value={device.imageFit}
            onChange={(imageFit) => set({ imageFit })}
            options={[
              { value: "cover", label: "Cubrir" },
              { value: "contain", label: "Contener" },
            ]}
          />
        </Field>
      </Section>

      <Section title="Dispositivo">
        <Field label="Estilo" value={STYLE_LABELS[device.style]}>
          <Segmented<DeviceStyle>
            value={device.style}
            onChange={(style) => set({ style })}
            options={[
              { value: "realistic", label: "Realista" },
              { value: "minimal", label: "Minimal" },
              { value: "clay", label: "Clay" },
            ]}
          />
        </Field>
        <div className="grid grid-cols-5 gap-1.5">
          {DEVICES.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => set({ type: d.value })}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-lg border py-2.5 text-[11px] transition-all",
                device.type === d.value
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
              )}
            >
              <d.icon className="h-4 w-4" strokeWidth={1.75} />
              {d.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {FRAME_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              title={c.label}
              aria-label={c.label}
              onClick={() => set({ frameColor: c.value })}
              className={cn(swatchClass(device.frameColor === c.value), "h-7 w-7 rounded-full")}
              style={{ background: c.value }}
            />
          ))}
          <label
            title="Color personalizado"
            className={cn(swatchClass(customFrame), "grid h-7 w-7 cursor-pointer place-items-center rounded-full bg-muted")}
            style={customFrame ? { background: device.frameColor } : undefined}
          >
            {!customFrame && <Plus className="h-3.5 w-3.5 text-muted-foreground" />}
            <input
              type="color"
              value={device.frameColor}
              onChange={(e) => set({ frameColor: e.target.value })}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </label>
        </div>

        <div className="flex items-center justify-between text-[13px]">
          <span>Sombra</span>
          <Switch checked={device.shadow} onCheckedChange={(shadow) => set({ shadow })} />
        </div>
        {device.shadow && (
          <Field label="Intensidad de sombra" value={`${device.shadowSoftness}%`} onReset={() => set({ shadowSoftness: defaults.shadowSoftness })}>
            <Slider value={[device.shadowSoftness]} onValueChange={([v]) => set({ shadowSoftness: v })} min={5} max={100} step={1} />
          </Field>
        )}
      </Section>

      <Section title="Transformación">
        <Field label="Tamaño" value={`${Math.round(device.scale * 100)}%`} onReset={() => set({ scale: defaults.scale })}>
          <Slider value={[device.scale * 100]} onValueChange={([v]) => set({ scale: v / 100 })} min={15} max={120} step={1} />
        </Field>
        <Field label="Rotación" value={`${device.rotation}°`} onReset={() => set({ rotation: 0 })}>
          <div className="flex items-center gap-2">
            <IconButton label="Rotar -90°" onClick={() => rotate90(-90)}>
              <RotateCcw className="h-3.5 w-3.5" />
            </IconButton>
            <Slider value={[device.rotation]} onValueChange={([v]) => set({ rotation: v })} min={-180} max={180} step={1} />
            <IconButton label="Rotar +90°" onClick={() => rotate90(90)}>
              <RotateCw className="h-3.5 w-3.5" />
            </IconButton>
          </div>
        </Field>
        <Field label="Inclinación 3D horizontal" value={`${device.tiltY}°`} onReset={() => set({ tiltY: 0 })}>
          <Slider value={[device.tiltY]} onValueChange={([v]) => set({ tiltY: v })} min={-60} max={60} step={1} />
        </Field>
        <Field label="Inclinación 3D vertical" value={`${device.tiltX}°`} onReset={() => set({ tiltX: 0 })}>
          <Slider value={[device.tiltX]} onValueChange={([v]) => set({ tiltX: v })} min={-60} max={60} step={1} />
        </Field>
        <Field label="Relleno de pantalla" value={`${device.innerPadding}px`} onReset={() => set({ innerPadding: 0 })}>
          <Slider value={[device.innerPadding]} onValueChange={([v]) => set({ innerPadding: v })} min={0} max={40} step={1} />
        </Field>
        <Field label="Radio de la captura" value={`${device.borderRadius}px`} onReset={() => set({ borderRadius: 0 })}>
          <Slider value={[device.borderRadius]} onValueChange={([v]) => set({ borderRadius: v })} min={0} max={40} step={1} />
        </Field>
      </Section>
    </>
  );
};

// ── Pestaña Elemento: texto ──
const TextPanel = ({ text, onItemChange, onDuplicate, onDelete, settings }: ControlPanelProps & { text: TextItem }) => {
  const set = (patch: Partial<TextItem>) => onItemChange(text.id, patch);
  const labels = FIELD_LABELS[text.style];

  // Si el texto sigue siendo el de ejemplo, al cambiar de estilo se carga el ejemplo del nuevo estilo
  const changeStyle = (style: TextStyle) => {
    const prev = TEXT_PRESETS[text.style];
    const untouched = prev.title === text.title && prev.subtitle === text.subtitle && prev.label === text.label;
    set(untouched ? { style, ...TEXT_PRESETS[style] } : { style });
  };

  return (
    <>
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <span className="truncate text-sm font-medium">{itemName(text, settings)}</span>
        <div className="flex">
          <IconButton label="Centrar horizontalmente" onClick={() => set({ x: 50 })}>
            <Crosshair className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton label="Duplicar (Ctrl+D)" onClick={() => onDuplicate(text.id)} disabled={settings.texts.length >= MAX_TEXTS}>
            <Copy className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton label="Eliminar (Supr)" onClick={() => onDelete(text.id)} danger>
            <Trash2 className="h-3.5 w-3.5" />
          </IconButton>
        </div>
      </div>

      <Section title="Estilo">
        <div className="grid grid-cols-3 gap-1.5">
          {TEXT_STYLES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => changeStyle(s.value)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-lg border px-1 pb-2 pt-2 text-[11px] transition-all",
                text.style === s.value ? "border-foreground ring-1 ring-foreground" : "border-border text-muted-foreground hover:border-foreground/30",
              )}
            >
              <span className="grid h-9 w-full place-items-center rounded-md bg-[linear-gradient(135deg,#fbcfe8,#c4b5fd)]">{s.preview}</span>
              {s.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Contenido">
        {labels.label && (
          <label className="block space-y-1.5">
            <span className="text-xs text-muted-foreground">{labels.label}</span>
            <input type="text" value={text.label} onChange={(e) => set({ label: e.target.value })} className={inputClass} />
          </label>
        )}
        <label className="block space-y-1.5">
          <span className="text-xs text-muted-foreground">{labels.title}</span>
          <input type="text" value={text.title} onChange={(e) => set({ title: e.target.value })} className={inputClass} />
        </label>
        {labels.subtitle && (
          <label className="block space-y-1.5">
            <span className="text-xs text-muted-foreground">{labels.subtitle}</span>
            <input type="text" value={text.subtitle} onChange={(e) => set({ subtitle: e.target.value })} className={inputClass} />
          </label>
        )}
        <Field label="Tamaño" value={`${Math.round(text.scale * 100)}%`} onReset={() => set({ scale: 1 })}>
          <Slider value={[text.scale * 100]} onValueChange={([v]) => set({ scale: v / 100 })} min={40} max={200} step={1} />
        </Field>
        <p className="text-xs text-muted-foreground">Arrástralo sobre el lienzo para moverlo.</p>
      </Section>
    </>
  );
};

export default ControlPanel;
