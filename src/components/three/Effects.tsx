import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { VideoEffect } from "@/lib/mockup";

/**
 * Partículas para los videos (confeti, burbujas, hojas…).
 * Todo es determinista: la posición de cada partícula depende solo del tiempo,
 * así el video renderizado cuadro por cuadro sale idéntico a la vista previa.
 */

const BASE_COUNT: Record<Exclude<VideoEffect, "none">, number> = {
  confetti: 160,
  bubbles: 45,
  leaves: 40,
  hearts: 36,
  sparkles: 60,
  snow: 160,
};

const PALETTES: Record<Exclude<VideoEffect, "none">, string[]> = {
  confetti: ["#fcaf45", "#e1306c", "#833ab4", "#405de6", "#22c55e", "#facc15", "#ffffff"],
  bubbles: ["#ffffff"],
  leaves: ["#f97316", "#ea580c", "#facc15", "#b45309", "#65a30d", "#dc2626"],
  hearts: ["#ff3040", "#ff5c87", "#e1306c", "#ff7b9c"],
  sparkles: ["#fff7d6", "#ffffff", "#ffe08a"],
  snow: ["#ffffff"],
};

/** Generador pseudoaleatorio con semilla (mulberry32) */
const rng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const heartShape = (s: number) => {
  const h = new THREE.Shape();
  h.moveTo(0, -s * 0.9);
  h.bezierCurveTo(-s * 1.4, -s * 0.1, -s * 0.9, s * 0.95, 0, s * 0.35);
  h.bezierCurveTo(s * 0.9, s * 0.95, s * 1.4, -s * 0.1, 0, -s * 0.9);
  return h;
};

const leafShape = (s: number) => {
  const l = new THREE.Shape();
  l.moveTo(0, -s);
  l.quadraticCurveTo(s * 0.75, 0, 0, s);
  l.quadraticCurveTo(-s * 0.75, 0, 0, -s);
  return l;
};

const starShape = (s: number) => {
  const st = new THREE.Shape();
  const pts = 8;
  for (let i = 0; i <= pts; i++) {
    const a = (i / pts) * Math.PI * 2 + Math.PI / 2;
    const r = i % 2 === 0 ? s : s * 0.22;
    if (i === 0) st.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else st.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  return st;
};

/** Burbuja de jabón: centro transparente, borde tornasol y brillos */
let bubbleTex: THREE.CanvasTexture | null = null;
const getBubbleTexture = () => {
  if (bubbleTex) return bubbleTex;
  const S = 256;
  const c = document.createElement("canvas");
  c.width = S;
  c.height = S;
  const ctx = c.getContext("2d")!;
  const cx = S / 2;
  const r = S * 0.46;

  // Película: casi transparente al centro, más visible hacia el borde
  const body = ctx.createRadialGradient(cx, cx, r * 0.15, cx, cx, r);
  body.addColorStop(0, "rgba(255,255,255,0.02)");
  body.addColorStop(0.7, "rgba(255,255,255,0.05)");
  body.addColorStop(0.92, "rgba(255,255,255,0.28)");
  body.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(cx, cx, r, 0, Math.PI * 2);
  ctx.fill();

  // Borde tornasol (anillo con gradiente cónico)
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cx, r, 0, Math.PI * 2);
  ctx.arc(cx, cx, r * 0.84, 0, Math.PI * 2, true);
  ctx.clip("evenodd");
  const film = ctx.createConicGradient(Math.PI * 0.25, cx, cx);
  ["#ff7eb3", "#ffd36e", "#7ef9c6", "#7ab8ff", "#c89bff", "#ff7eb3"].forEach((col, i, a) => film.addColorStop(i / (a.length - 1), col));
  ctx.globalAlpha = 0.42;
  ctx.fillStyle = film;
  ctx.fillRect(0, 0, S, S);
  ctx.restore();

  // Contorno fino
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cx, r - 1, 0, Math.PI * 2);
  ctx.stroke();

  // Brillo principal (arriba a la izquierda) y reflejo pequeño (abajo a la derecha)
  ctx.save();
  ctx.filter = "blur(3px)";
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.translate(cx - r * 0.42, cx - r * 0.45);
  ctx.rotate(-Math.PI / 4);
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.22, r * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.filter = "blur(2px)";
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.beginPath();
  ctx.arc(cx + r * 0.5, cx + r * 0.48, r * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  bubbleTex = new THREE.CanvasTexture(c);
  bubbleTex.colorSpace = THREE.SRGBColorSpace;
  return bubbleTex;
};

const makeGeometry = (kind: Exclude<VideoEffect, "none">, unit: number) => {
  switch (kind) {
    case "confetti":
      return new THREE.PlaneGeometry(unit * 1.2, unit * 0.6);
    case "bubbles":
      return new THREE.PlaneGeometry(unit * 2, unit * 2);
    case "leaves":
      return new THREE.ShapeGeometry(leafShape(unit * 1.4), 8);
    case "hearts":
      return new THREE.ShapeGeometry(heartShape(unit * 1.1), 16);
    case "sparkles":
      return new THREE.ShapeGeometry(starShape(unit * 1.3), 1);
    case "snow":
      return new THREE.CircleGeometry(unit * 0.35, 12);
  }
};

const makeMaterial = (kind: Exclude<VideoEffect, "none">) => {
  switch (kind) {
    case "confetti":
    case "leaves":
      return new THREE.MeshLambertMaterial({ side: THREE.DoubleSide });
    case "bubbles":
      return new THREE.MeshBasicMaterial({ map: getBubbleTexture(), transparent: true, depthWrite: false, toneMapped: false });
    case "sparkles":
      return new THREE.MeshBasicMaterial({ transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
    default:
      return new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.92, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
  }
};

interface Particle {
  x: number;
  y: number;
  a: number;
  b: number;
  c: number;
  speed: number;
  phase: number;
  size: number;
  spin: THREE.Vector3;
}

export type EffectUpdater = (time: number) => void;

interface EffectsProps {
  kind: VideoEffect;
  amount: number;
  /** Semiancho/semialto visibles a la profundidad z */
  halfW: number;
  halfH: number;
  z: number;
  register: (fn: EffectUpdater | null) => void;
}

const Effects = ({ kind, amount, halfW, halfH, z, register }: EffectsProps) => {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const active = kind !== "none" ? kind : null;
  const count = active ? Math.max(4, Math.round(BASE_COUNT[active] * amount)) : 0;
  const unit = halfW * 0.024;

  const geometry = useMemo(() => (active ? makeGeometry(active, unit) : null), [active, unit]);
  const material = useMemo(() => (active ? makeMaterial(active) : null), [active]);
  useEffect(() => () => geometry?.dispose(), [geometry]);
  useEffect(() => () => material?.dispose(), [material]);

  const particles = useMemo<Particle[]>(() => {
    const r = rng(1337 + count);
    return Array.from({ length: count }, () => ({
      x: r() * 2 - 1,
      y: r() * 2 - 1,
      a: r(),
      b: r(),
      c: r(),
      speed: 0.6 + r() * 0.8,
      phase: r() * Math.PI * 2,
      size: 0.55 + r() * 0.9,
      spin: new THREE.Vector3(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1).normalize(),
    }));
  }, [count]);

  // Colores por instancia
  useEffect(() => {
    const m = mesh.current;
    if (!m || !active) return;
    const palette = PALETTES[active];
    const color = new THREE.Color();
    particles.forEach((p, i) => m.setColorAt(i, color.set(palette[Math.floor(p.c * palette.length) % palette.length])));
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [active, particles]);

  useEffect(() => {
    if (!active) {
      register(null);
      return;
    }
    const dummy = new THREE.Object3D();
    const X = halfW;
    const Y = halfH;
    const H2 = Y * 2.4;
    const mod = (v: number, m: number) => ((v % m) + m) % m;

    // Confeti: con rozamiento lineal (k) y gravedad (g) la altura máxima es
    //   h(v) = v/k - (g/k²)·ln(1 + v·k/g)
    // Se busca la velocidad vertical que alcanza la altura deseada (entre ~60 % y ~78 % del cuadro).
    const K = 1.25;
    const G = Y * 2.4;
    const START_Y = -Y * 1.05;
    const apexHeight = (v: number) => v / K - (G / (K * K)) * Math.log(1 + (v * K) / G);
    const velocityFor = (h: number) => {
      let lo = 0;
      let hi = Y * 40;
      for (let n = 0; n < 40; n++) {
        const mid = (lo + hi) / 2;
        if (apexHeight(mid) < h) lo = mid;
        else hi = mid;
      }
      return (lo + hi) / 2;
    };
    const confettiVy = particles.map((p) => {
      const top = 0.6 + p.speed * 0.13; // speed ∈ [0.6, 1.4] → 68 % a 78 % del alto
      const apexY = -Y + 2 * Y * Math.min(0.8, top);
      return velocityFor(apexY - START_Y);
    });

    const update: EffectUpdater = (time) => {
      const m = mesh.current;
      if (!m) return;
      particles.forEach((p, i) => {
        dummy.position.set(0, 0, 0);
        dummy.rotation.set(0, 0, 0);
        let s = p.size;
        let sx = 1;
        let sy = 1;

        switch (active) {
          case "confetti": {
            // Explosión de entrada desde las esquinas inferiores, con gravedad y rozamiento
            const local = time - p.a * 0.35;
            if (local < 0) {
              s = 0;
              break;
            }
            const side = i % 2 === 0 ? -1 : 1;
            const vx = -side * (0.2 + p.b * 0.95) * X * 1.5;
            const vy = confettiVy[i];
            const e = (1 - Math.exp(-K * local)) / K;
            dummy.position.x = side * X * 0.95 + vx * e + Math.sin(local * 7 + p.phase) * Y * 0.02;
            dummy.position.y = START_Y + (vy + G / K) * e - (G / K) * local;
            dummy.rotation.set(p.spin.x * local * 9, p.spin.y * local * 9, p.spin.z * local * 6);
            if (dummy.position.y < -Y * 1.3 && local > 1) s = 0;
            break;
          }
          case "bubbles": {
            // Las grandes suben más lento; se mecen, se deforman un poco y explotan arriba
            const size = 1.2 + p.size * 2.4;
            const rise = Y * (0.42 - size * 0.04) * p.speed;
            const y = -Y * 1.2 + mod((p.y + 1) * Y * 1.2 + time * rise, H2);
            dummy.position.x = p.x * X * 0.95 + Math.sin(time * 1.1 * p.speed + p.phase) * X * 0.07;
            dummy.position.y = y;
            dummy.position.z = (p.b - 0.5) * 0.5;
            const wobble = Math.sin(time * 5 * p.speed + p.phase) * 0.05;
            sx = 1 + wobble;
            sy = 1 - wobble;
            dummy.rotation.z = Math.sin(time * 0.8 + p.phase) * 0.4;
            const popAt = Y * (0.75 + p.c * 0.35);
            const pop = y > popAt ? Math.max(0, 1 - (y - popAt) / (Y * 0.08)) : 1;
            const appear = Math.min(1, (y + Y * 1.2) / (Y * 0.25));
            s = size * pop * appear;
            break;
          }
          case "leaves": {
            dummy.position.x = p.x * X + Math.sin(time * 0.9 + p.phase) * X * 0.16;
            dummy.position.y = Y * 1.2 - mod((p.y + 1) * Y * 1.2 + time * Y * 0.28 * p.speed, H2);
            dummy.rotation.set(time * 1.6 * p.spin.x + p.phase, time * 1.2 * p.spin.y, Math.sin(time * 1.3 + p.phase) * 1.3);
            s = p.size * 1.3;
            break;
          }
          case "hearts": {
            // Suben desde abajo por todo el ancho del cuadro, aparecen creciendo y se desvanecen arriba
            const L = 4;
            const local = mod(time * p.speed + p.a * L, L);
            const grow = Math.min(1, local / 0.4);
            const fade = 1 - Math.max(0, (local - L * 0.75) / (L * 0.25));
            dummy.position.x = p.x * X * 0.92 + Math.sin(local * 2.4 + p.phase) * X * 0.05;
            dummy.position.y = -Y * 1.05 + (local / L) * Y * 2.1;
            dummy.rotation.z = Math.sin(local * 2 + p.phase) * 0.35;
            s = p.size * 1.6 * (1 - Math.pow(1 - grow, 3)) * fade;
            break;
          }
          case "sparkles": {
            dummy.position.set(p.x * X, p.y * Y, 0);
            dummy.rotation.z = time * 0.6 + p.phase;
            s = p.size * 1.4 * Math.pow(Math.max(0, Math.sin(time * 2.2 * p.speed + p.phase)), 3);
            break;
          }
          case "snow": {
            dummy.position.x = p.x * X + Math.sin(time * 0.7 + p.phase) * X * 0.05;
            dummy.position.y = Y * 1.2 - mod((p.y + 1) * Y * 1.2 + time * Y * 0.18 * p.speed, H2);
            dummy.position.z = (p.b - 0.5) * 0.6;
            break;
          }
        }

        dummy.scale.set(Math.max(0.0001, s * sx), Math.max(0.0001, s * sy), Math.max(0.0001, s));
        dummy.updateMatrix();
        m.setMatrixAt(i, dummy.matrix);
      });
      m.instanceMatrix.needsUpdate = true;
    };

    register(update);
    update(0);
    return () => register(null);
  }, [active, particles, halfW, halfH, register]);

  if (!active || !geometry || !material) return null;
  return <instancedMesh key={`${active}-${count}`} ref={mesh} args={[geometry, material, count]} position={[0, 0, z]} frustumCulled={false} renderOrder={5} />;
};

export default Effects;
