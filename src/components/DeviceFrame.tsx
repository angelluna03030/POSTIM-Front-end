import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { deviceConfigs, type DeviceStyle, type DeviceType } from "@/lib/devices";
import { DEFAULT_ADJUST, adjustedImageStyle, type ImageAdjust } from "@/lib/image-adjust";

export type { DeviceStyle, DeviceType };

interface DeviceFrameProps {
  device: DeviceType;
  image: string | null;
  shadow: boolean;
  shadowSoftness: number;
  frameColor: string;
  variant?: DeviceStyle;
  innerPadding?: number;
  screenshotBorderRadius?: number;
  imageFit?: "cover" | "contain";
  adjust?: ImageAdjust;
  /** Marca la pantalla para poder capturarla sola (vista 3D) */
  snapId?: string;
  className?: string;
}

/** Mezcla un color hex con blanco (amount > 0) o negro (amount < 0) */
const shade = (hex: string, amount: number) => {
  const m = hex.replace("#", "").match(/.{2}/g);
  if (!m) return hex;
  const target = amount > 0 ? 255 : 0;
  const a = Math.abs(amount);
  const [r, g, b] = m.map((x) => Math.round(parseInt(x, 16) * (1 - a) + target * a));
  return `rgb(${r},${g},${b})`;
};

const buildShadow = (softness: number, variant: DeviceStyle) => {
  const k = variant === "minimal" ? 0.6 : 1;
  return `0 ${Math.round(softness * 0.35 * k)}px ${Math.round(softness * 1.2 * k)}px -${Math.round(softness * 0.15)}px rgba(0,0,0,${(0.16 + softness / 500) * k}), 0 2px 6px rgba(0,0,0,${0.08 * k})`;
};

const frameBackground = (color: string, variant: DeviceStyle) => {
  if (variant === "realistic") return `linear-gradient(145deg, ${shade(color, 0.22)} 0%, ${color} 28%, ${shade(color, -0.18)} 70%, ${shade(color, 0.08)} 100%)`;
  return color;
};

const frameInset = (variant: DeviceStyle) => {
  if (variant === "realistic") return "inset 0 0 0 1.5px rgba(255,255,255,0.14), inset 0 1.5px 1px rgba(255,255,255,0.28), inset 0 -2px 3px rgba(0,0,0,0.25)";
  if (variant === "clay") return "inset -8px -10px 18px rgba(0,0,0,0.16), inset 8px 8px 16px rgba(255,255,255,0.32)";
  return "";
};

const Screen = ({
  image,
  innerPadding,
  radius,
  screenshotBorderRadius,
  imageFit,
  glare,
  adjust,
  snapId,
}: {
  image: string | null;
  innerPadding: number;
  radius: number;
  screenshotBorderRadius: number;
  imageFit: "cover" | "contain";
  glare: boolean;
  adjust: ImageAdjust;
  snapId?: string;
}) => (
  <div
    data-screen-snap={snapId}
    className="relative h-full w-full overflow-hidden"
    style={{ borderRadius: radius, background: image ? "#fff" : "#f4f4f5", padding: innerPadding }}
  >
    {image ? (
      <div className="relative h-full w-full overflow-hidden" style={{ containerType: "size", borderRadius: screenshotBorderRadius }}>
        <img src={image} alt="Captura" draggable={false} className="select-none" style={adjustedImageStyle(adjust, imageFit)} />
      </div>
    ) : (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-zinc-400">
        <ImageIcon className="h-8 w-8" strokeWidth={1.25} />
        <span className="text-xs font-medium">Tu diseño aquí</span>
        <span className="text-[10px]">Doble clic para subir</span>
      </div>
    )}
    {glare && (
      <div
        data-glare="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.04)_30%,transparent_31%)]"
      />
    )}
  </div>
);

const SideButton = ({ side, top, height, color }: { side: "left" | "right"; top: number; height: number; color: string }) => (
  <div
    className="absolute w-[3px]"
    style={{
      [side]: -3,
      top,
      height,
      background: `linear-gradient(${side === "left" ? "90deg" : "270deg"}, ${shade(color, -0.25)}, ${shade(color, 0.15)})`,
      borderRadius: side === "left" ? "3px 0 0 3px" : "0 3px 3px 0",
    }}
  />
);

const DeviceFrame = ({
  device,
  image,
  shadow,
  shadowSoftness,
  frameColor,
  variant = "realistic",
  innerPadding = 0,
  screenshotBorderRadius = 0,
  imageFit = "cover",
  adjust = DEFAULT_ADJUST,
  snapId,
  className,
}: DeviceFrameProps) => {
  const config = deviceConfigs[device];
  const boxShadow = shadow ? buildShadow(shadowSoftness, variant) : undefined;
  const realistic = variant === "realistic";
  const screenProps = { image, innerPadding, screenshotBorderRadius, imageFit, glare: realistic, adjust, snapId };
  const bezelFactor = variant === "minimal" ? 0.6 : variant === "clay" ? 1.5 : 1;

  if (device === "macbook") {
    const lidHeight = config.height - 22;
    const bezel = config.bezel * bezelFactor;
    return (
      <div className={cn("relative flex flex-col items-center", className)} style={{ width: config.width, height: config.height }}>
        <div
          className="relative"
          style={{
            width: config.width - 72,
            height: lidHeight,
            padding: bezel,
            paddingTop: bezel + 4,
            borderRadius: variant === "clay" ? config.radius * 1.4 : config.radius,
            background: variant === "clay" ? frameColor : realistic ? `linear-gradient(180deg, ${shade(frameColor, 0.08)}, ${frameColor})` : frameColor,
            boxShadow: [boxShadow, frameInset(variant)].filter(Boolean).join(", ") || undefined,
          }}
        >
          {variant !== "minimal" && <div className="absolute left-1/2 top-1.5 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/15" />}
          <Screen {...screenProps} radius={variant === "clay" ? 10 : 4} />
        </div>
        <div
          style={{
            width: config.width,
            height: 14,
            background: realistic
              ? `linear-gradient(to bottom, ${shade(frameColor, 0.3)}, ${frameColor} 40%, ${shade(frameColor, -0.25)})`
              : frameColor,
            borderRadius: variant === "clay" ? "6px 6px 18px 18px" : "2px 2px 14px 14px",
            boxShadow: [boxShadow, variant === "clay" ? "inset 0 -4px 8px rgba(0,0,0,0.15)" : ""].filter(Boolean).join(", ") || undefined,
          }}
          className="relative"
        >
          <div className="absolute left-1/2 top-0 h-1.5 w-20 -translate-x-1/2 rounded-b-md bg-black/20" />
        </div>
      </div>
    );
  }

  if (device === "browser") {
    const minimal = variant === "minimal";
    return (
      <div
        className={cn("relative flex flex-col overflow-hidden", minimal ? "border border-black/5" : "border border-black/10", className)}
        style={{
          width: config.width,
          height: config.height,
          borderRadius: variant === "clay" ? 26 : config.radius,
          background: "#fff",
          boxShadow: [boxShadow, variant === "clay" ? "inset 0 0 0 6px " + frameColor : ""].filter(Boolean).join(", ") || undefined,
          padding: variant === "clay" ? 6 : 0,
        }}
      >
        <div
          className="flex h-9 shrink-0 items-center gap-1.5 px-3.5"
          style={{ background: realistic ? `linear-gradient(180deg, ${shade(frameColor, 0.1)}, ${frameColor})` : frameColor }}
        >
          {minimal ? (
            [0, 1, 2].map((k) => <span key={k} className="h-2.5 w-2.5 rounded-full bg-black/15" />)
          ) : (
            <>
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            </>
          )}
          <div className="mx-auto h-5 w-1/2 rounded-md bg-white/15" />
        </div>
        <div className="min-h-0 flex-1 overflow-hidden" style={{ borderRadius: variant === "clay" ? "0 0 20px 20px" : 0 }}>
          <Screen {...screenProps} radius={0} />
        </div>
      </div>
    );
  }

  const isPhone = device === "iphone15" || device === "pixel8";
  const bezel = config.bezel * bezelFactor;
  const radius = variant === "clay" ? config.radius * 1.12 : config.radius;

  return (
    <div
      className={cn("relative", className)}
      style={{
        width: config.width,
        height: config.height,
        padding: bezel,
        borderRadius: radius,
        background: frameBackground(frameColor, variant),
        boxShadow: [boxShadow, frameInset(variant)].filter(Boolean).join(", ") || undefined,
      }}
    >
      {/* Bisel interior negro (solo realista) */}
      {realistic ? (
        <div className="h-full w-full bg-black p-[3px]" style={{ borderRadius: radius - bezel + 3 }}>
          <Screen {...screenProps} radius={radius - bezel} />
        </div>
      ) : (
        <Screen {...screenProps} radius={Math.max(4, radius - bezel)} />
      )}

      {device === "iphone15" && variant !== "clay" && (
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-full bg-black"
          style={{ top: bezel + 12, height: variant === "minimal" ? 20 : 26, width: variant === "minimal" ? 72 : 88 }}
        >
          {realistic && <span className="absolute right-[14px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_35%,#3b4a7a,#0b0b12_70%)]" />}
        </div>
      )}
      {device === "pixel8" && variant !== "clay" && (
        <div className="absolute left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-black ring-2 ring-black/20" style={{ top: bezel + 12 }} />
      )}
      {device === "ipad" && variant !== "minimal" && (
        <div className="absolute left-1/2 top-[5px] h-1 w-1 -translate-x-1/2 rounded-full bg-white/20" />
      )}
      {isPhone && realistic && (
        <>
          <SideButton side="left" top={100} height={26} color={frameColor} />
          <SideButton side="left" top={140} height={48} color={frameColor} />
          <SideButton side="left" top={196} height={48} color={frameColor} />
          <SideButton side="right" top={150} height={72} color={frameColor} />
        </>
      )}
    </div>
  );
};

export { DeviceFrame };
