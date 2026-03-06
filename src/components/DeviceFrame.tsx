import { cn } from "@/lib/utils";

export type DeviceType = "iphone15" | "pixel8" | "ipad" | "macbook";

interface DeviceFrameProps {
  device: DeviceType;
  image: string | null;
  shadow: boolean;
  shadowSoftness: number;
  frameColor: string;
  innerPadding?: number;
  screenshotBorderRadius?: number;
  className?: string;
}

const deviceConfigs: Record<DeviceType, { width: number; height: number; borderRadius: number; label: string }> = {
  iphone15: { width: 280, height: 580, borderRadius: 44, label: "iPhone 15 Pro" },
  pixel8: { width: 270, height: 570, borderRadius: 36, label: "Pixel 8" },
  ipad: { width: 400, height: 540, borderRadius: 24, label: "iPad Pro" },
  macbook: { width: 520, height: 340, borderRadius: 12, label: "MacBook Pro" },
};

const DeviceFrame = ({
  device, image, shadow, shadowSoftness, frameColor,
  innerPadding = 0, screenshotBorderRadius = 0, className,
}: DeviceFrameProps) => {
  const config = deviceConfigs[device];
  const shadowStyle = shadow
    ? { boxShadow: `0 ${shadowSoftness * 0.5}px ${shadowSoftness * 2}px -${shadowSoftness * 0.3}px rgba(0,0,0,0.25)` }
    : {};

  const isMobile = device === "iphone15" || device === "pixel8";

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <div
        className="relative overflow-hidden"
        style={{
          width: config.width,
          height: config.height,
          borderRadius: config.borderRadius,
          border: `${device === "macbook" ? 8 : 10}px solid ${frameColor}`,
          ...shadowStyle,
          background: frameColor,
        }}
      >
        {device === "iphone15" && (
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 z-10"
            style={{
              width: 100,
              height: 28,
              borderRadius: "0 0 18px 18px",
              background: frameColor,
            }}
          />
        )}

        <div
          className="w-full h-full overflow-hidden flex items-center justify-center"
          style={{
            borderRadius: config.borderRadius - (device === "macbook" ? 6 : 8),
            background: image ? "transparent" : "hsl(var(--muted))",
            padding: `${innerPadding}px`,
          }}
        >
          {image ? (
            <img
              src={image}
              alt="Screenshot"
              className="w-full h-full object-cover"
              style={{ borderRadius: screenshotBorderRadius }}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
              </svg>
              <span className="text-xs font-medium">Tu diseño aquí</span>
            </div>
          )}
        </div>

        {device === "macbook" && (
          <div
            className="absolute bottom-0 left-0 right-0 h-3"
            style={{ background: frameColor, borderRadius: "0 0 4px 4px" }}
          />
        )}
      </div>

      {device === "macbook" && (
        <div
          style={{
            width: config.width + 60,
            height: 14,
            background: frameColor,
            borderRadius: "0 0 8px 8px",
            marginTop: -1,
          }}
        />
      )}

      {isMobile && (
        <div
          className="absolute bottom-3 left-1/2 -translate-x-1/2"
          style={{
            width: 100,
            height: 4,
            borderRadius: 2,
            background: "rgba(255,255,255,0.3)",
          }}
        />
      )}
    </div>
  );
};

export { DeviceFrame, deviceConfigs };
