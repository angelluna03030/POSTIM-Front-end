import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { ArrayBufferTarget, Muxer } from "mp4-muxer";
import { deviceConfigs } from "@/lib/devices";
import { CANVAS_FORMATS, type DeviceItem, type MockupSettings, type TextItem, type VideoPreset } from "@/lib/mockup";
import type { SceneSnapshot } from "@/lib/snapshot";
import { pickVideoMime } from "@/lib/video";
import { AUDIO_CHANNELS, AUDIO_SAMPLE_RATE, encodeAudioTrack, pickAudioCodec, playAudio, renderAudioTrack, type AudioOptions } from "@/lib/audio";

/**
 * Escena 3D del editor.
 * - Cámara FIJA: el fondo es un plano que llena exactamente el encuadre y nunca se mueve.
 * - Celulares e iPad se modelan en 3D (cuerpo metálico, vidrio, isla, cámaras traseras)
 *   y la pantalla muestra la captura del usuario.
 * - Cada dispositivo recibe una profundidad propia para que al girar no se atraviesen
 *   entre sí ni con el fondo.
 * - El video se renderiza cuadro por cuadro (WebCodecs + MP4): no se pierden cuadros.
 */

export interface SceneAudio {
  buffer: AudioBuffer;
  options: AudioOptions;
}

export interface SceneApi {
  play: (preset: VideoPreset, duration: number, audio?: SceneAudio | null) => Promise<void>;
  record: (opts: {
    preset: VideoPreset;
    duration: number;
    fps: number;
    audio?: SceneAudio | null;
    onProgress?: (p: number) => void;
  }) => Promise<{ blob: Blob; ext: string; audioIncluded: boolean }>;
  capture: () => string;
  stop: () => void;
}

const WORLD_W = 10;
const FOV = 18;
const deg = Math.PI / 180;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number) => {
  const c1 = 1.3;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const lerp = THREE.MathUtils.lerp;

// ────────────────────────────────────────────
// Utilidades de geometría y texturas
// ────────────────────────────────────────────
const roundedShape = (w: number, h: number, r: number, rTop = r) => {
  const x = -w / 2;
  const y = -h / 2;
  const rb = Math.max(0.0001, Math.min(r, w / 2, h / 2));
  const rt = Math.max(0.0001, Math.min(rTop, w / 2, h / 2));
  const s = new THREE.Shape();
  s.moveTo(x + rb, y);
  s.lineTo(x + w - rb, y);
  s.quadraticCurveTo(x + w, y, x + w, y + rb);
  s.lineTo(x + w, y + h - rt);
  s.quadraticCurveTo(x + w, y + h, x + w - rt, y + h);
  s.lineTo(x + rt, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - rt);
  s.lineTo(x, y + rb);
  s.quadraticCurveTo(x, y, x + rb, y);
  return s;
};

/** Plano redondeado con UVs 0-1 (para la pantalla) */
const roundedPlane = (w: number, h: number, r: number, rTop = r) => {
  const g = new THREE.ShapeGeometry(roundedShape(w, h, r, rTop), 32);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / h + 0.5);
  return g;
};

/** Cuerpo extruido con esquinas grandes en XY y un bisel suave en los bordes */
const bodyGeometry = (w: number, h: number, r: number, depth: number) => {
  const bevel = Math.min(depth * 0.4, r * 0.5);
  const core = Math.max(0.0001, depth - bevel * 2);
  const g = new THREE.ExtrudeGeometry(roundedShape(w - bevel * 2, h - bevel * 2, Math.max(0.0001, r - bevel)), {
    depth: core,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 6,
    curveSegments: 32,
  });
  g.translate(0, 0, -core / 2);
  return g;
};

const useCanvasTexture = (canvas: HTMLCanvasElement | undefined) => {
  const tex = useMemo(() => {
    if (!canvas) return null;
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [canvas]);
  useEffect(() => () => tex?.dispose(), [tex]);
  return tex;
};

const shade = (hex: string, amount: number) => {
  const c = new THREE.Color(hex);
  return c.lerp(new THREE.Color(amount > 0 ? "#ffffff" : "#000000"), Math.abs(amount)).getStyle();
};

const isLight = (hex: string) => {
  const c = new THREE.Color(hex);
  return c.r * 0.299 + c.g * 0.587 + c.b * 0.114 > 0.6;
};

const canvasTexture = (c: HTMLCanvasElement) => {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

/** Teclado + trackpad de la MacBook (la parte superior de la textura queda junto a la bisagra) */
const keyboardTexture = (frame: string) => {
  const W = 1024;
  const H = 420;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  const base = shade(frame, 0.04);
  const dark = isLight(frame) ? "#1b1b1e" : shade(frame, -0.6);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);

  // Parlantes (rejilla de puntos) a los lados del teclado
  ctx.fillStyle = shade(frame, -0.28);
  for (const x0 of [34, W - 34 - 66]) {
    for (let y = 28; y < 236; y += 8) {
      for (let x = x0; x < x0 + 66; x += 8) {
        ctx.beginPath();
        ctx.arc(x, y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Hueco del teclado
  const kx = 118;
  const ky = 22;
  const kw = W - kx * 2;
  const kh = 218;
  ctx.fillStyle = shade(frame, -0.12);
  ctx.beginPath();
  ctx.roundRect(kx - 6, ky - 6, kw + 12, kh + 12, 12);
  ctx.fill();

  // Teclas: fila de funciones baja + 5 filas normales
  const cols = 14;
  const gap = 5;
  const keyW = (kw - gap * (cols - 1)) / cols;
  const fnH = 22;
  const rowH = (kh - fnH - gap * 5) / 5;
  const key = (x: number, y: number, w: number, h: number) => {
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 5);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(x + 3, y + 2, w - 6, 2);
  };
  for (let col = 0; col < cols; col++) key(kx + col * (keyW + gap), ky, keyW, fnH);
  for (let r = 0; r < 5; r++) {
    const y = ky + fnH + gap + r * (rowH + gap);
    if (r === 4) {
      // Fila inferior con barra espaciadora ancha
      const small = [1, 1, 1, 1.25];
      let x = kx;
      small.forEach((m) => {
        key(x, y, keyW * m, rowH);
        x += keyW * m + gap;
      });
      const space = kw - (x - kx) - (keyW * 1.25 + gap) - (keyW + gap) * 3;
      key(x, y, space, rowH);
      x += space + gap;
      key(x, y, keyW * 1.25, rowH);
      x += keyW * 1.25 + gap;
      // Flechas
      for (let i = 0; i < 3; i++) {
        key(x, y + rowH / 2 + 1, keyW, rowH / 2 - 1);
        x += keyW + gap;
      }
      key(x - (keyW + gap) * 2, y, keyW, rowH / 2 - 2);
      continue;
    }
    for (let col = 0; col < cols; col++) key(kx + col * (keyW + gap), y, keyW, rowH);
  }

  // Trackpad
  ctx.fillStyle = shade(frame, -0.05);
  ctx.strokeStyle = shade(frame, -0.16);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(W / 2 - 190, 264, 380, 140, 16);
  ctx.fill();
  ctx.stroke();
  return canvasTexture(c);
};

/** Barra superior de la ventana del navegador, con esquinas superiores redondeadas */
const browserBarTexture = (frame: string, style: DeviceItem["style"], radiusPx: number) => {
  const c = document.createElement("canvas");
  c.width = 1280;
  c.height = 72;
  const ctx = c.getContext("2d")!;
  ctx.beginPath();
  ctx.roundRect(0, 0, 1280, 72, [radiusPx * 2, radiusPx * 2, 0, 0]);
  ctx.clip();
  const g = ctx.createLinearGradient(0, 0, 0, 72);
  g.addColorStop(0, style === "realistic" ? shade(frame, 0.1) : frame);
  g.addColorStop(1, frame);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1280, 72);
  const dots = style === "minimal" ? ["rgba(0,0,0,0.15)", "rgba(0,0,0,0.15)", "rgba(0,0,0,0.15)"] : ["#ff5f57", "#febc2e", "#28c840"];
  dots.forEach((d, i) => {
    ctx.fillStyle = d;
    ctx.beginPath();
    ctx.arc(34 + i * 22, 36, 6.5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = isLight(frame) ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.15)";
  ctx.beginPath();
  ctx.roundRect(320, 16, 640, 40, 10);
  ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.06)";
  ctx.fillRect(0, 70, 1280, 2);
  return canvasTexture(c);
};

let shadowTex: THREE.CanvasTexture | null = null;
const getShadowTexture = () => {
  if (shadowTex) return shadowTex;
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  ctx.filter = "blur(26px)";
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.roundRect(60, 50, 136, 156, 28);
  ctx.fill();
  shadowTex = new THREE.CanvasTexture(c);
  return shadowTex;
};

// ────────────────────────────────────────────
// Distribución en el espacio
// ────────────────────────────────────────────
interface DeviceEntry {
  item: DeviceItem;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Unidades de mundo por px del dispositivo */
  k: number;
  /** Radio de giro: cuánto puede "barrer" en profundidad al rotar */
  reach: number;
  z: number;
  /** Compensación de perspectiva: a esa profundidad se ve del mismo tamaño que en 2D */
  f: number;
}

interface Layout {
  W: number;
  H: number;
  dist: number;
  devices: DeviceEntry[];
  texts: { item: TextItem; x: number; y: number; z: number; f: number }[];
}

const computeLayout = (settings: MockupSettings): Layout => {
  const fmt = CANVAS_FORMATS[settings.format];
  const W = WORLD_W;
  const H = (WORLD_W * fmt.height) / fmt.width;
  const pad = (settings.padding / 100) * Math.min(W, H);
  const availW = W - pad * 2;
  const availH = H - pad * 2;
  const dist = H / 2 / Math.tan((FOV / 2) * deg);
  const persp = (z: number) => (dist - z) / dist;

  const devices: DeviceEntry[] = [];
  settings.devices.forEach((d) => {
    const cfg = deviceConfigs[d.type];
    const fit = Math.min(availW / cfg.width, availH / cfg.height);
    const k = fit * d.scale;
    const w = cfg.width * k;
    const h = cfg.height * k;
    const x = (d.x / 100 - 0.5) * W;
    const y = (0.5 - d.y / 100) * H;
    let reach = Math.hypot(w / 2, (h / 2) * Math.max(0.3, Math.abs(Math.sin(d.tiltX * deg))));
    if (d.type === "macbook") reach = Math.max(reach, Math.hypot(w / 2, h * 0.6));
    const footprint = Math.max(w, h) / 2;

    // Lo bastante lejos del fondo para girar sin cortarlo…
    let z = reach + 0.15;
    // …y de cualquier dispositivo anterior que se le cruce por delante o detrás
    for (const prev of devices) {
      const overlap = Math.hypot(prev.x - x, prev.y - y) < Math.max(prev.w, prev.h) / 2 + footprint;
      if (overlap) z = Math.max(z, prev.z + prev.reach + reach + 0.1);
    }
    devices.push({ item: d, x, y, w, h, k, reach, z, f: persp(z) });
  });

  const front = devices.reduce((m, d) => Math.max(m, d.z + d.reach), 0) + 1.6;
  return {
    W,
    H,
    dist,
    devices,
    texts: settings.texts.map((t, i) => {
      const z = front + i * 0.05;
      return { item: t, x: (t.x / 100 - 0.5) * W, y: (0.5 - t.y / 100) * H, z, f: persp(z) };
    }),
  };
};

/** Mismo orden de rotaciones que el CSS del editor 2D */
const baseEuler = (d: DeviceItem) => new THREE.Euler(-d.tiltX * deg, d.tiltY * deg, -d.rotation * deg, "ZXY");

// ────────────────────────────────────────────
// Dispositivos modelados (celulares e iPad)
// ────────────────────────────────────────────
const metalProps = (d: DeviceItem) =>
  d.style === "clay"
    ? { metalness: 0, roughness: 0.85, clearcoat: 0 }
    : d.style === "minimal"
      ? { metalness: 0.2, roughness: 0.5, clearcoat: 0 }
      : { metalness: 0.9, roughness: 0.22, clearcoat: 1 };

/**
 * Lente de cámara trasera. Se dibuja en un marco local donde +z apunta hacia afuera
 * de la parte trasera del teléfono.
 */
const Lens = ({ r, x, y, z, ring }: { r: number; x: number; y: number; z: number; ring: string }) => {
  const h = r * 0.45;
  return (
    <group position={[x, y, z]}>
      {/* Anillo metálico (cilindro orientado hacia afuera) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, h / 2]}>
        <cylinderGeometry args={[r, r * 1.06, h, 48, 1]} />
        <meshPhysicalMaterial color={ring} metalness={1} roughness={0.22} clearcoat={1} />
      </mesh>
      {/* Vidrio oscuro */}
      <mesh position={[0, 0, h + 0.0004]}>
        <circleGeometry args={[r * 0.84, 48]} />
        <meshPhysicalMaterial color="#04050a" roughness={0.04} metalness={0.3} clearcoat={1} />
      </mesh>
      {/* Lente interior con tinte azul */}
      <mesh position={[0, 0, h + 0.0008]}>
        <circleGeometry args={[r * 0.46, 48]} />
        <meshPhysicalMaterial color="#1b2650" roughness={0.08} metalness={0.6} clearcoat={1} />
      </mesh>
      <mesh position={[0, 0, h + 0.0012]}>
        <circleGeometry args={[r * 0.18, 32]} />
        <meshBasicMaterial color="#020205" />
      </mesh>
      {/* Brillo */}
      <mesh position={[-r * 0.28, r * 0.3, h + 0.0016]}>
        <circleGeometry args={[r * 0.11, 24]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
      </mesh>
    </group>
  );
};

const Dot = ({ r, x, y, z, color }: { r: number; x: number; y: number; z: number; color: string }) => (
  <mesh position={[x, y, z]}>
    <circleGeometry args={[r, 32]} />
    <meshPhysicalMaterial color={color} roughness={0.2} clearcoat={1} />
  </mesh>
);

/** Módulo de cámaras del iPhone: cuadrado de vidrio con tres lentes en triángulo, flash y LiDAR */
const IphoneCameras = ({ w, h, depth, frame }: { w: number; h: number; depth: number; frame: string }) => {
  const m = w * 0.43;
  const md = depth * 0.16;
  const geo = useMemo(() => bodyGeometry(m, m, m * 0.24, md), [m, md]);
  const r = m * 0.205;
  const o = m * 0.235;
  const ring = shade(frame, isLight(frame) ? -0.1 : 0.25);
  return (
    // Visto desde atrás queda arriba a la izquierda (en este marco local, x negativa)
    <group position={[-(w / 2 - w * 0.065 - m / 2), h / 2 - w * 0.065 - m / 2, 0]}>
      <mesh geometry={geo} position={[0, 0, md / 2]}>
        <meshPhysicalMaterial attach="material-0" color={shade(frame, -0.06)} roughness={0.12} metalness={0.25} clearcoat={1} />
        <meshPhysicalMaterial attach="material-1" color={shade(frame, -0.1)} roughness={0.2} metalness={0.6} />
      </mesh>
      <Lens r={r} x={-o} y={o} z={md} ring={ring} />
      <Lens r={r} x={-o} y={-o} z={md} ring={ring} />
      <Lens r={r} x={o} y={0} z={md} ring={ring} />
      <Dot r={r * 0.32} x={o} y={o * 1.05} z={md + 0.0005} color="#f5e9c8" />
      <Dot r={r * 0.24} x={o} y={-o * 1.05} z={md + 0.0005} color="#111318" />
    </group>
  );
};

/** Barra de cámaras del Pixel: cápsula negra de lado a lado con dos lentes y flash */
const PixelCameras = ({ w, h, depth }: { w: number; h: number; depth: number }) => {
  const bw = w * 0.9;
  const bh = w * 0.21;
  const bd = depth * 0.22;
  const geo = useMemo(() => bodyGeometry(bw, bh, bh / 2, bd), [bw, bh, bd]);
  const r = bh * 0.33;
  return (
    <group position={[0, h / 2 - w * 0.3, 0]}>
      <mesh geometry={geo} position={[0, 0, bd / 2]}>
        <meshPhysicalMaterial attach="material-0" color="#0b0b0d" roughness={0.1} metalness={0.3} clearcoat={1} />
        <meshPhysicalMaterial attach="material-1" color="#1c1c20" roughness={0.25} metalness={0.7} />
      </mesh>
      {/* Visto desde atrás, las lentes quedan a la izquierda */}
      <Lens r={r} x={-bw * 0.3} y={0} z={bd} ring="#2a2a2e" />
      <Lens r={r} x={-bw * 0.12} y={0} z={bd} ring="#2a2a2e" />
      <Dot r={r * 0.28} x={bw * 0.06} y={0} z={bd + 0.0005} color="#f5e9c8" />
    </group>
  );
};

const PhoneModel = ({ entry, screen }: { entry: DeviceEntry; screen?: SceneSnapshot["screens"][string] }) => {
  const { item, w, h, k } = entry;
  const cfg = deviceConfigs[item.type];
  const isPhone = item.type !== "ipad";
  const depth = isPhone ? w * 0.075 : w * 0.045;
  const radius = cfg.radius * k * (item.style === "clay" ? 1.12 : 1);
  const tex = useCanvasTexture(screen?.canvas);
  const sw = screen ? screen.width * k : w - cfg.bezel * 2 * k;
  const sh = screen ? screen.height * k : h - cfg.bezel * 2 * k;
  const sr = Math.max(0.01, radius - (w - sw) / 2);
  const body = useMemo(() => bodyGeometry(w, h, radius, depth), [w, h, radius, depth]);
  const screenGeo = useMemo(() => roundedPlane(sw, sh, sr), [sw, sh, sr]);
  const backGeo = useMemo(() => roundedPlane(w * 0.97, h * 0.985, radius * 0.97), [w, h, radius]);
  const front = depth / 2;
  const metal = metalProps(item);
  const realistic = item.style === "realistic";
  const capColor = realistic ? "#050506" : item.frameColor;
  const islandW = (item.style === "minimal" ? 72 : 88) * k;
  const islandH = (item.style === "minimal" ? 20 : 26) * k;
  const islandGeo = useMemo(() => roundedPlane(islandW, islandH, islandH / 2), [islandW, islandH]);
  const btn = (topPx: number, hPx: number, side: 1 | -1) => (
    <RoundedBox
      key={`${side}${topPx}`}
      args={[depth * 0.18, hPx * k, depth * 0.45]}
      radius={depth * 0.08}
      position={[side * (w / 2 + depth * 0.04), h / 2 - (topPx + hPx / 2) * k, 0]}
    >
      <meshPhysicalMaterial color={item.frameColor} {...metal} />
    </RoundedBox>
  );

  return (
    <group>
      {/* Cuerpo: tapas (vidrio o color) + laterales metálicos */}
      <mesh geometry={body}>
        <meshPhysicalMaterial attach="material-0" color={capColor} metalness={realistic ? 0.1 : metal.metalness} roughness={realistic ? 0.08 : metal.roughness} clearcoat={realistic ? 1 : 0} />
        <meshPhysicalMaterial attach="material-1" color={item.frameColor} {...metal} />
      </mesh>

      {/* Pantalla */}
      <mesh geometry={screenGeo} position={[0, 0, front + 0.002]}>
        {tex ? <meshBasicMaterial map={tex} toneMapped={false} /> : <meshBasicMaterial color="#f4f4f5" />}
      </mesh>
      {/* Reflejo sutil del vidrio */}
      {item.style !== "clay" && (
        <mesh geometry={screenGeo} position={[0, 0, front + 0.004]}>
          <meshPhysicalMaterial transparent opacity={0.08} color="#ffffff" roughness={0.05} metalness={1} depthWrite={false} />
        </mesh>
      )}

      {/* Isla dinámica / cámara frontal */}
      {item.type === "iphone15" && item.style !== "clay" && (
        <group position={[0, h / 2 - (cfg.bezel + 12) * k - islandH / 2, front + 0.003]}>
          <mesh geometry={islandGeo}>
            <meshBasicMaterial color="#000" />
          </mesh>
          {realistic && (
            <mesh position={[islandW * 0.32, 0, 0.0005]}>
              <circleGeometry args={[islandH * 0.22, 24]} />
              <meshPhysicalMaterial color="#1b2650" roughness={0.1} metalness={0.6} clearcoat={1} />
            </mesh>
          )}
        </group>
      )}
      {item.type === "pixel8" && item.style !== "clay" && (
        <mesh position={[0, h / 2 - (cfg.bezel + 18) * k, front + 0.003]}>
          <circleGeometry args={[6 * k, 24]} />
          <meshBasicMaterial color="#000" />
        </mesh>
      )}

      {/* Botones laterales */}
      {isPhone && item.style !== "clay" && [btn(100, 26, -1), btn(140, 48, -1), btn(196, 48, -1), btn(150, 72, 1)]}

      {/* Parte trasera: tapa de color y cámaras (marco local girado: +z hacia afuera) */}
      <group position={[0, 0, -front - 0.001]} rotation={[0, Math.PI, 0]}>
        <mesh geometry={backGeo}>
          <meshPhysicalMaterial
            color={item.frameColor}
            metalness={item.style === "clay" ? 0 : 0.3}
            roughness={item.style === "clay" ? 0.9 : realistic ? 0.45 : 0.35}
            clearcoat={item.style === "clay" ? 0 : 0.5}
          />
        </mesh>
        {item.type === "iphone15" && <IphoneCameras w={w} h={h} depth={depth} frame={item.frameColor} />}
        {item.type === "pixel8" && <PixelCameras w={w} h={h} depth={depth} />}
        {item.type === "ipad" && (
          <group position={[-(w / 2 - w * 0.09), h / 2 - w * 0.09, 0]}>
            <Lens r={w * 0.03} x={0} y={0} z={0} ring={shade(item.frameColor, -0.15)} />
          </group>
        )}
      </group>
    </group>
  );
};

/** Pantalla con la captura (o un gris si todavía no hay) */
const ScreenMesh = ({ geometry, screen, z }: { geometry: THREE.BufferGeometry; screen?: SceneSnapshot["screens"][string]; z: number }) => {
  const tex = useCanvasTexture(screen?.canvas);
  return (
    <mesh geometry={geometry} position={[0, 0, z]}>
      {tex ? <meshBasicMaterial map={tex} toneMapped={false} /> : <meshBasicMaterial color="#f4f4f5" />}
    </mesh>
  );
};

const MacbookModel = ({ entry, screen }: { entry: DeviceEntry; screen?: SceneSnapshot["screens"][string] }) => {
  const { item, h, k } = entry;
  const cfg = deviceConfigs.macbook;
  const metal = metalProps(item);
  const realistic = item.style === "realistic";
  const clay = item.style === "clay";

  // Tapa (igual que en 2D: más angosta que la base)
  const lidW = (cfg.width - 72) * k;
  const lidH = (cfg.height - 22) * k;
  const lidD = 9 * k;
  const lidR = cfg.radius * k * (clay ? 1.4 : 1);
  const lidY = h / 2 - lidH / 2;
  const hingeY = h / 2 - lidH;
  const bezel = cfg.bezel * k;

  // Pantalla: dentro del bisel, con el margen superior extra de la cámara
  const sw = screen ? screen.width * k : lidW - bezel * 2;
  const sh = screen ? screen.height * k : lidH - bezel * 2 - 4 * k;
  const screenY = h / 2 - (cfg.bezel + 4) * k - sh / 2;

  // Base con teclado, apoyada horizontalmente y saliendo hacia la cámara
  const baseW = lidW * 1.02;
  const baseT = 8 * k;
  const baseD = lidH * 0.62;

  const lidGeo = useMemo(() => bodyGeometry(lidW, lidH, lidR, lidD), [lidW, lidH, lidR, lidD]);
  const screenGeo = useMemo(() => roundedPlane(sw, sh, (clay ? 10 : 4) * k), [sw, sh, clay, k]);
  const backGeo = useMemo(() => roundedPlane(lidW * 0.985, lidH * 0.985, lidR), [lidW, lidH, lidR]);
  const deck = useMemo(() => keyboardTexture(item.frameColor), [item.frameColor]);
  useEffect(() => () => deck.dispose(), [deck]);

  return (
    <group>
      {/* Tapa */}
      <group position={[0, lidY, 0]}>
        <mesh geometry={lidGeo}>
          <meshPhysicalMaterial attach="material-0" color={realistic ? "#050506" : item.frameColor} roughness={realistic ? 0.1 : metal.roughness} metalness={realistic ? 0.1 : metal.metalness} clearcoat={realistic ? 1 : 0} />
          <meshPhysicalMaterial attach="material-1" color={item.frameColor} {...metal} />
        </mesh>
        <mesh geometry={backGeo} position={[0, 0, -lidD / 2 - 0.002]} rotation={[0, Math.PI, 0]}>
          <meshPhysicalMaterial color={item.frameColor} {...metal} />
        </mesh>
        {!clay && (
          <mesh position={[0, lidH / 2 - (cfg.bezel / 2 + 2) * k, lidD / 2 + 0.003]}>
            <circleGeometry args={[2.5 * k, 16]} />
            <meshBasicMaterial color="#1f2937" />
          </mesh>
        )}
      </group>
      <group position={[0, screenY, 0]}>
        <ScreenMesh geometry={screenGeo} screen={screen} z={lidD / 2 + 0.002} />
      </group>

      {/* Base */}
      <RoundedBox
        args={[baseW, baseT, baseD]}
        radius={Math.min(baseT / 2.2, 6 * k)}
        smoothness={4}
        position={[0, hingeY - baseT / 2, baseD / 2 - lidD / 2]}
      >
        <meshPhysicalMaterial color={item.frameColor} {...metal} />
      </RoundedBox>
      <mesh position={[0, hingeY + 0.002, baseD / 2 - lidD / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[baseW * 0.975, baseD * 0.96]} />
        <meshStandardMaterial map={deck} roughness={0.6} metalness={clay ? 0 : 0.3} />
      </mesh>
      {/* Bisagra */}
      <mesh position={[0, hingeY - baseT * 0.1, -lidD / 2 + baseT * 0.2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[baseT * 0.55, baseT * 0.55, lidW * 0.82, 24]} />
        <meshPhysicalMaterial color={shade(item.frameColor, -0.45)} metalness={0.6} roughness={0.35} />
      </mesh>
      {/* Muesca frontal para abrir la tapa */}
      <mesh position={[0, hingeY - baseT * 0.35, baseD - lidD / 2 + 0.002]}>
        <planeGeometry args={[80 * k, baseT * 0.3]} />
        <meshBasicMaterial color={shade(item.frameColor, -0.25)} />
      </mesh>
    </group>
  );
};

const BrowserModel = ({ entry, screen }: { entry: DeviceEntry; screen?: SceneSnapshot["screens"][string] }) => {
  const { item, w, h, k } = entry;
  const cfg = deviceConfigs.browser;
  const clay = item.style === "clay";
  const r = (clay ? 26 : cfg.radius) * k;
  const depth = 10 * k;
  const barH = 36 * k;
  const sw = screen ? screen.width * k : w;
  const sh = screen ? screen.height * k : h - barH;
  const front = depth / 2;

  const body = useMemo(() => bodyGeometry(w, h, r, depth), [w, h, r, depth]);
  const barGeo = useMemo(() => roundedPlane(w, barH, 0.0001, r), [w, barH, r]);
  // La pantalla ocupa el resto: esquinas de abajo redondeadas, de arriba rectas (pegadas a la barra)
  const screenGeo = useMemo(() => roundedPlane(sw, sh, Math.max(0.0001, r - (w - sw) / 2), 0.0001), [sw, sh, r, w]);
  const backGeo = useMemo(() => roundedPlane(w * 0.985, h * 0.985, r), [w, h, r]);
  const bar = useMemo(() => browserBarTexture(item.frameColor, item.style, cfg.radius), [item.frameColor, item.style, cfg.radius]);
  useEffect(() => () => bar.dispose(), [bar]);

  return (
    <group>
      <mesh geometry={body}>
        <meshPhysicalMaterial attach="material-0" color="#ffffff" roughness={0.4} />
        <meshPhysicalMaterial attach="material-1" color={shade(item.frameColor, isLight(item.frameColor) ? -0.12 : 0.1)} roughness={0.35} metalness={0.2} />
      </mesh>
      <mesh geometry={barGeo} position={[0, h / 2 - barH / 2, front + 0.002]}>
        <meshBasicMaterial map={bar} transparent toneMapped={false} />
      </mesh>
      <group position={[0, h / 2 - barH - sh / 2, 0]}>
        <ScreenMesh geometry={screenGeo} screen={screen} z={front + 0.002} />
      </group>
      <mesh geometry={backGeo} position={[0, 0, -front - 0.002]} rotation={[0, Math.PI, 0]}>
        <meshPhysicalMaterial color={item.frameColor} roughness={0.4} metalness={0.2} />
      </mesh>
    </group>
  );
};

interface DeviceProps {
  entry: DeviceEntry;
  snapshot: SceneSnapshot;
  animRef: (g: THREE.Group | null) => void;
  interactive: boolean;
  onTilt: (id: string, tiltX: number, tiltY: number) => void;
}

const Device3D = ({ entry, snapshot, animRef, interactive, onTilt }: DeviceProps) => {
  const { item } = entry;
  const drag = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    document.body.style.cursor = hover && interactive ? "grab" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hover, interactive]);

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    if (!interactive) return;
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, tx: item.tiltX, ty: item.tiltY };
    document.body.style.cursor = "grabbing";
  };
  const onMove = (e: ThreeEvent<PointerEvent>) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    const c = (v: number) => Math.round(Math.max(-60, Math.min(60, v)));
    onTilt(item.id, c(drag.current.tx - dy * 0.35), c(drag.current.ty + dx * 0.35));
  };
  const onUp = (e: ThreeEvent<PointerEvent>) => {
    drag.current = null;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    document.body.style.cursor = hover ? "grab" : "";
  };

  return (
    <group position={[entry.x * entry.f, entry.y * entry.f, entry.z]} scale={entry.f}>
      <group rotation={baseEuler(item)}>
        <group
          ref={animRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerOver={() => setHover(true)}
          onPointerOut={() => setHover(false)}
          onDoubleClick={() => interactive && onTilt(item.id, 0, 0)}
        >
          {item.type === "macbook" ? (
            <MacbookModel entry={entry} screen={snapshot.screens[item.id]} />
          ) : item.type === "browser" ? (
            <BrowserModel entry={entry} screen={snapshot.screens[item.id]} />
          ) : (
            <PhoneModel entry={entry} screen={snapshot.screens[item.id]} />
          )}
        </group>
      </group>
    </group>
  );
};

const Text3D = ({ entry, snap, W, animRef }: { entry: Layout["texts"][number]; snap?: SceneSnapshot["texts"][string]; W: number; animRef: (g: THREE.Group | null) => void }) => {
  const tex = useCanvasTexture(snap?.canvas);
  if (!snap || !tex) return null;
  const s = (W / 1080) * entry.item.scale;
  return (
    <group position={[entry.x * entry.f, entry.y * entry.f, entry.z]} scale={entry.f}>
      <group ref={animRef}>
        <mesh>
          <planeGeometry args={[snap.width * s, snap.height * s]} />
          <meshBasicMaterial map={tex} transparent toneMapped={false} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
};

// ────────────────────────────────────────────
// Director: animaciones, sombras y grabación
// ────────────────────────────────────────────
interface Playback {
  preset: VideoPreset;
  start: number;
  duration: number;
  done: () => void;
  onProgress?: (p: number) => void;
}

interface DirectorProps {
  layout: Layout;
  outSize: { width: number; height: number };
  deviceRefs: React.MutableRefObject<(THREE.Group | null)[]>;
  textRefs: React.MutableRefObject<(THREE.Group | null)[]>;
  shadowRefs: React.MutableRefObject<(THREE.Mesh | null)[]>;
  onPlayingChange: (playing: boolean) => void;
}

/** Cede el hilo sin el freno de setTimeout en pestañas en segundo plano */
const yieldToBrowser = () =>
  new Promise<void>((resolve) => {
    const ch = new MessageChannel();
    ch.port1.onmessage = () => resolve();
    ch.port2.postMessage(null);
  });

const pickAvcCodec = async (width: number, height: number, fps: number) => {
  for (const codec of ["avc1.640033", "avc1.4d0033", "avc1.42003e", "avc1.640028"]) {
    const config: VideoEncoderConfig = { codec, width, height, bitrate: 16_000_000, framerate: fps };
    try {
      const { supported } = await VideoEncoder.isConfigSupported(config);
      if (supported) return config;
    } catch {
      // probar el siguiente
    }
  }
  return null;
};

const Director = forwardRef<SceneApi, DirectorProps>(({ layout, outSize, deviceRefs, textRefs, shadowRefs, onPlayingChange }, ref) => {
  const { camera, gl, scene } = useThree();
  const playback = useRef<Playback | null>(null);
  const liveAudio = useRef<{ stop: () => void } | null>(null);
  const manual = useRef(false);
  const cancelled = useRef(false);
  const tmp = useMemo(() => ({ q: new THREE.Quaternion(), e: new THREE.Euler(), v: new THREE.Vector3() }), []);

  useEffect(() => {
    camera.position.set(0, 0, layout.dist);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, layout.dist]);

  const resetAnim = () => {
    deviceRefs.current.forEach((g) => {
      if (!g) return;
      g.position.set(0, 0, 0);
      g.rotation.set(0, 0, 0);
      g.scale.setScalar(1);
    });
    textRefs.current.forEach((g) => {
      if (!g) return;
      g.position.set(0, 0, 0);
      g.scale.setScalar(1);
    });
  };

  /** Pone la escena en el instante t (0-1) de la animación */
  const applyAnimation = (preset: VideoPreset, t: number) => {
    const { devices, H } = layout;
    const n = devices.length;
    const loop = t * Math.PI * 2;
    resetAnim();

    devices.forEach((dv, i) => {
      const g = deviceRefs.current[i];
      if (!g) return;
      const stagger = n > 1 ? i / n : 0;
      switch (preset) {
        case "intro": {
          const lt = clamp01((t - stagger * 0.35) / 0.45);
          g.position.y = (1 - easeOut(lt)) * -H * 0.85;
          g.rotation.x = (1 - lt) * 0.45;
          g.rotation.y = (1 - lt) * -0.55;
          g.scale.setScalar(lerp(0.75, 1, Math.min(1, easeOutBack(lt))));
          break;
        }
        case "reveal": {
          const lt = easeInOut(clamp01((t - stagger * 0.3) / 0.6));
          g.rotation.y = lerp(-Math.PI / 2.1, 0, lt);
          break;
        }
        case "tour": {
          const seg = 1 / Math.max(1, n);
          const local = clamp01((t - i * seg) / seg);
          const e = easeInOut(Math.sin(local * Math.PI));
          g.position.z = e * 1.2;
          g.position.y = e * dv.h * 0.04;
          g.scale.setScalar(1 + e * 0.1);
          g.rotation.y = Math.sin(local * Math.PI * 2) * 0.25 * e;
          break;
        }
        case "swing":
          g.rotation.y = Math.sin(loop + i * 0.7) * 0.45;
          g.rotation.x = Math.sin(loop * 2 + i) * 0.08;
          break;
        case "zoom": {
          const e = easeInOut(t);
          g.scale.setScalar(lerp(0.82, 1.06, e));
          g.rotation.y = lerp(-0.35, 0, e);
          g.rotation.x = lerp(0.15, 0, e);
          break;
        }
        case "float":
          g.position.y = Math.sin(loop * 2 + i * 1.3) * H * 0.014;
          g.rotation.y = Math.sin(loop + i * 0.9) * 0.16;
          g.rotation.x = Math.cos(loop + i) * 0.05;
          break;
        case "spin":
          g.rotation.y = easeInOut(clamp01((t - stagger * 0.3) / 0.7)) * Math.PI * 2;
          break;
      }
    });

    textRefs.current.forEach((g, i) => {
      if (!g) return;
      if (preset === "intro" || preset === "reveal") {
        g.scale.setScalar(Math.max(0.0001, easeOutBack(clamp01((t - 0.55 - i * 0.08) / 0.3))));
      } else if (preset === "float" || preset === "swing") {
        g.position.y = Math.sin(loop * 2 + i + 2) * H * 0.008;
      }
    });
  };

  /** Las sombras siguen el giro y la altura de cada dispositivo */
  const updateShadows = () => {
    layout.devices.forEach((dv, i) => {
      const s = shadowRefs.current[i];
      const g = deviceRefs.current[i];
      if (!s || !g) return;
      g.getWorldQuaternion(tmp.q);
      tmp.e.setFromQuaternion(tmp.q, "ZXY");
      const facing = Math.abs(Math.cos(tmp.e.y));
      g.getWorldPosition(tmp.v);
      const lift = tmp.v.z - dv.z;
      s.position.set(tmp.v.x / dv.f + Math.sin(tmp.e.y) * dv.w * 0.18, tmp.v.y / dv.f - dv.h * 0.05 - lift * 0.15, 0.02);
      s.rotation.z = tmp.e.z;
      s.scale.set(0.35 + 0.65 * facing, 1, 1);
      (s.material as THREE.MeshBasicMaterial).opacity = (0.16 + dv.item.shadowSoftness / 300) * (1 - Math.min(0.5, lift * 0.4));
    });
  };

  const play = (preset: VideoPreset, duration: number, onProgress?: (p: number) => void) =>
    new Promise<void>((resolve) => {
      onPlayingChange(true);
      playback.current = { preset, start: performance.now(), duration: duration * 1000, done: resolve, onProgress };
    });

  const stop = () => {
    cancelled.current = true;
    liveAudio.current?.stop();
    liveAudio.current = null;
    const p = playback.current;
    playback.current = null;
    resetAnim();
    onPlayingChange(false);
    p?.done();
  };

  /** Exportación cuadro por cuadro a MP4 (WebCodecs) */
  const recordFrames = async (preset: VideoPreset, duration: number, fps: number, audio?: SceneAudio | null, onProgress?: (p: number) => void) => {
    const { width, height } = outSize;
    const config = await pickAvcCodec(width, height, fps);
    if (!config) return null;

    // Audio: se mezcla offline con la duración exacta del video
    const audioCodec = audio ? await pickAudioCodec() : null;
    const audioTrack = audio && audioCodec ? await renderAudioTrack(audio.buffer, audio.options, duration) : null;

    const muxer = new Muxer({
      target: new ArrayBufferTarget(),
      video: { codec: "avc", width, height, frameRate: fps },
      audio: audioTrack && audioCodec ? { codec: audioCodec.muxCodec, numberOfChannels: AUDIO_CHANNELS, sampleRate: AUDIO_SAMPLE_RATE } : undefined,
      fastStart: "in-memory",
    });
    let encodeError: unknown = null;
    const encoder = new VideoEncoder({
      output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
      error: (e) => (encodeError = e),
    });
    encoder.configure(config);

    // Lienzo de salida con el tamaño exacto del formato
    const out = document.createElement("canvas");
    out.width = width;
    out.height = height;
    const ctx = out.getContext("2d")!;
    const total = Math.max(2, Math.round(duration * fps));

    manual.current = true;
    cancelled.current = false;
    onPlayingChange(true);
    try {
      for (let i = 0; i < total; i++) {
        if (cancelled.current || encodeError) break;
        applyAnimation(preset, i / (total - 1));
        updateShadows();
        gl.render(scene, camera);
        ctx.drawImage(gl.domElement, 0, 0, width, height);
        const frame = new VideoFrame(out, { timestamp: Math.round((i * 1e6) / fps), duration: Math.round(1e6 / fps) });
        encoder.encode(frame, { keyFrame: i % (fps * 2) === 0 });
        frame.close();
        onProgress?.((i + 1) / total);
        if (encoder.encodeQueueSize > 6 || i % 4 === 0) await yieldToBrowser();
        while (encoder.encodeQueueSize > 12) await new Promise((r) => setTimeout(r, 4));
      }
      await encoder.flush();
      if (encodeError) throw encodeError;
      if (audioTrack && audioCodec) {
        await encodeAudioTrack(audioTrack, audioCodec.config, (chunk, meta) => muxer.addAudioChunk(chunk, meta));
      }
      muxer.finalize();
      return { blob: new Blob([muxer.target.buffer], { type: "video/mp4" }), ext: "mp4", audioIncluded: !!audioTrack };
    } finally {
      if (encoder.state !== "closed") encoder.close();
      manual.current = false;
      resetAnim();
      onPlayingChange(false);
    }
  };

  /** Respaldo: grabación en tiempo real con MediaRecorder */
  const recordRealtime = async (preset: VideoPreset, duration: number, fps: number, audio?: SceneAudio | null, onProgress?: (p: number) => void) => {
    const format = pickVideoMime();
    if (!format) throw new Error("Tu navegador no permite grabar video");
    resetAnim();
    gl.render(scene, camera);
    const stream = gl.domElement.captureStream(fps);
    let live: ReturnType<typeof playAudio> | null = null;
    if (audio) {
      live = playAudio(audio.buffer, audio.options, duration, (ctx) => {
        const dest = ctx.createMediaStreamDestination();
        dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
        return dest;
      });
    }
    const recorder = new MediaRecorder(stream, { mimeType: format.mime, videoBitsPerSecond: 18_000_000 });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    const finished = new Promise<void>((r) => (recorder.onstop = () => r()));
    recorder.start(100);
    await play(preset, duration, onProgress);
    await new Promise((r) => setTimeout(r, 200));
    recorder.stop();
    await finished;
    stream.getTracks().forEach((t) => t.stop());
    live?.stop();
    stop();
    return { blob: new Blob(chunks, { type: format.mime.split(";")[0] }), ext: format.ext, audioIncluded: !!audio };
  };

  useImperativeHandle(ref, () => ({
    play: (preset, duration, audio) => {
      liveAudio.current?.stop();
      liveAudio.current = audio ? playAudio(audio.buffer, audio.options, duration) : null;
      return play(preset, duration).then(stop);
    },
    record: async ({ preset, duration, fps, audio, onProgress }) => {
      if (typeof VideoEncoder !== "undefined") {
        const result = await recordFrames(preset, duration, fps, audio, onProgress);
        if (result) return result;
      }
      return recordRealtime(preset, duration, fps, audio, onProgress);
    },
    capture: () => {
      resetAnim();
      updateShadows();
      gl.render(scene, camera);
      const out = document.createElement("canvas");
      out.width = outSize.width;
      out.height = outSize.height;
      out.getContext("2d")!.drawImage(gl.domElement, 0, 0, outSize.width, outSize.height);
      return out.toDataURL("image/png");
    },
    stop,
  }));

  useFrame(() => {
    if (manual.current) return;
    const p = playback.current;
    if (p) {
      const t = clamp01((performance.now() - p.start) / p.duration);
      p.onProgress?.(t);
      applyAnimation(p.preset, t);
      if (t >= 1) {
        playback.current = null;
        p.done();
      }
    }
    updateShadows();
  });

  return null;
});
Director.displayName = "Director";

// ────────────────────────────────────────────
// Componente principal
// ────────────────────────────────────────────
interface Scene3DProps {
  settings: MockupSettings;
  snapshot: SceneSnapshot;
  /** Ancho en pantalla: se usa para renderizar a la resolución real del formato */
  cssWidth: number;
  onTilt: (id: string, tiltX: number, tiltY: number) => void;
}

const BackgroundPlane = ({ snapshot, W, H }: { snapshot: SceneSnapshot; W: number; H: number }) => {
  const tex = useCanvasTexture(snapshot.background);
  return (
    <mesh>
      <planeGeometry args={[W, H]} />
      {tex && <meshBasicMaterial map={tex} toneMapped={false} />}
    </mesh>
  );
};

const Scene3D = forwardRef<SceneApi, Scene3DProps>(({ settings, snapshot, cssWidth, onTilt }, ref) => {
  const layout = useMemo(() => computeLayout(settings), [settings]);
  const deviceRefs = useRef<(THREE.Group | null)[]>([]);
  const textRefs = useRef<(THREE.Group | null)[]>([]);
  const shadowRefs = useRef<(THREE.Mesh | null)[]>([]);
  deviceRefs.current.length = layout.devices.length;
  textRefs.current.length = layout.texts.length;
  shadowRefs.current.length = layout.devices.length;
  const [playing, setPlaying] = useState(false);
  const fmt = CANVAS_FORMATS[settings.format];

  return (
    <Canvas
      dpr={cssWidth > 0 ? fmt.width / cssWidth : 2}
      camera={{ fov: FOV, position: [0, 0, layout.dist], near: 0.1, far: 100 }}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 10]} intensity={1.2} />
      <directionalLight position={[-6, -2, 6]} intensity={0.4} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} position={[0, 6, 8]} scale={[14, 4, 1]} />
        <Lightformer form="rect" intensity={1.4} position={[-9, 0, 4]} rotation-y={Math.PI / 2} scale={[10, 5, 1]} />
        <Lightformer form="rect" intensity={1.4} position={[9, 0, 4]} rotation-y={-Math.PI / 2} scale={[10, 5, 1]} />
        <Lightformer form="rect" intensity={0.8} position={[0, -6, 6]} scale={[14, 3, 1]} />
      </Environment>

      <BackgroundPlane snapshot={snapshot} W={layout.W} H={layout.H} />

      {layout.devices.map((entry, i) =>
        entry.item.shadow ? (
          <mesh key={`s-${entry.item.id}`} ref={(m) => (shadowRefs.current[i] = m)} position={[entry.x, entry.y, 0.02]}>
            <planeGeometry args={[entry.w * 1.35, entry.h * 1.2]} />
            <meshBasicMaterial map={getShadowTexture()} transparent depthWrite={false} toneMapped={false} />
          </mesh>
        ) : null,
      )}
      {layout.devices.map((entry, i) => (
        <Device3D
          key={entry.item.id}
          entry={entry}
          snapshot={snapshot}
          animRef={(g) => (deviceRefs.current[i] = g)}
          interactive={!playing}
          onTilt={onTilt}
        />
      ))}
      {layout.texts.map((entry, i) => (
        <Text3D key={entry.item.id} entry={entry} snap={snapshot.texts[entry.item.id]} W={layout.W} animRef={(g) => (textRefs.current[i] = g)} />
      ))}

      <Director
        ref={ref}
        layout={layout}
        outSize={{ width: fmt.width, height: fmt.height }}
        deviceRefs={deviceRefs}
        textRefs={textRefs}
        shadowRefs={shadowRefs}
        onPlayingChange={setPlaying}
      />
    </Canvas>
  );
});
Scene3D.displayName = "Scene3D";

export default Scene3D;
