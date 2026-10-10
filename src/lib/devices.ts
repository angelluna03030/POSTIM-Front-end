export type DeviceType = "iphone15" | "pixel8" | "ipad" | "macbook" | "browser";
export type DeviceStyle = "realistic" | "minimal" | "clay";

export interface DeviceConfig {
  /** Tamaño total del dispositivo en px (incluye base de la MacBook) */
  width: number;
  height: number;
  /** Grosor del bisel */
  bezel: number;
  radius: number;
  label: string;
  /** Tiene cuerpo con grosor en la vista 3D */
  body: boolean;
}

export const deviceConfigs: Record<DeviceType, DeviceConfig> = {
  iphone15: { width: 300, height: 620, bezel: 11, radius: 50, label: "iPhone 15 Pro", body: true },
  pixel8: { width: 290, height: 610, bezel: 10, radius: 40, label: "Pixel 8", body: true },
  ipad: { width: 440, height: 600, bezel: 14, radius: 30, label: "iPad Pro", body: true },
  macbook: { width: 640, height: 412, bezel: 12, radius: 18, label: "MacBook Pro", body: false },
  browser: { width: 640, height: 420, bezel: 0, radius: 14, label: "Navegador", body: false },
};
