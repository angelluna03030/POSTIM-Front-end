import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Lightformer, RoundedBox, useTexture } from "@react-three/drei";
import * as THREE from "three";
import heroMockup from "@/assets/hero-mockup.png";

// ────────────────────────────────────────────
// Utilidades de geometría y texturas
// ────────────────────────────────────────────

/** Rectángulo redondeado con UVs normalizadas 0-1 (para pantallas) */
const roundedRectGeometry = (w: number, h: number, r: number) => {
  const shape = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  const geo = new THREE.ShapeGeometry(shape, 24);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, (pos.getX(i) - x) / w, (pos.getY(i) - y) / h);
  }
  return geo;
};

/** Textura dibujada en canvas: interfaz de app simple con gradiente */
const makeAppTexture = (colors: [string, string, string], variant: "feed" | "dashboard") => {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 700;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 512, 700);
  g.addColorStop(0, colors[0]);
  g.addColorStop(0.55, colors[1]);
  g.addColorStop(1, colors[2]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 700);

  const card = (x: number, y: number, w: number, h: number, a = 0.85) => {
    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 22);
    ctx.fill();
  };

  if (variant === "dashboard") {
    card(32, 40, 448, 70, 0.25);
    card(32, 140, 214, 180);
    card(266, 140, 214, 180);
    card(32, 340, 448, 320);
    ctx.fillStyle = colors[1];
    for (let i = 0; i < 7; i++) {
      const h = 60 + ((i * 53) % 170);
      ctx.beginPath();
      ctx.roundRect(70 + i * 56, 620 - h, 30, h, 8);
      ctx.fill();
    }
  } else {
    card(32, 40, 448, 60, 0.25);
    card(32, 124, 448, 380);
    card(32, 524, 448, 140);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};

// ────────────────────────────────────────────
// Dispositivos
// ────────────────────────────────────────────

const Phone = ({ texture }: { texture: THREE.Texture }) => {
  const W = 3;
  const H = 6.2;
  const screen = useMemo(() => roundedRectGeometry(W - 0.22, H - 0.22, 0.36), []);

  // "object-fit: cover" sobre la pantalla
  useMemo(() => {
    const img = texture.image as HTMLImageElement | undefined;
    if (!img?.width) return;
    const screenAspect = (W - 0.22) / (H - 0.22);
    const imgAspect = img.width / img.height;
    if (imgAspect > screenAspect) {
      texture.repeat.set(screenAspect / imgAspect, 1);
      texture.offset.set((1 - screenAspect / imgAspect) / 2, 0);
    } else {
      texture.repeat.set(1, imgAspect / screenAspect);
      texture.offset.set(0, (1 - imgAspect / screenAspect) / 2);
    }
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
  }, [texture]);

  return (
    <group>
      <RoundedBox args={[W, H, 0.34]} radius={0.44} smoothness={8}>
        <meshPhysicalMaterial color="#1c1c1f" metalness={0.75} roughness={0.28} clearcoat={1} clearcoatRoughness={0.15} />
      </RoundedBox>
      <mesh geometry={screen} position={[0, 0, 0.172]}>
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      {/* Dynamic Island */}
      <RoundedBox args={[0.92, 0.27, 0.02]} radius={0.12} position={[0, H / 2 - 0.42, 0.18]}>
        <meshBasicMaterial color="#000" />
      </RoundedBox>
      {/* Botones laterales */}
      <RoundedBox args={[0.06, 0.8, 0.12]} radius={0.03} position={[W / 2 + 0.01, 1.1, 0]}>
        <meshStandardMaterial color="#2a2a2e" metalness={0.8} roughness={0.3} />
      </RoundedBox>
      <RoundedBox args={[0.06, 0.5, 0.12]} radius={0.03} position={[-W / 2 - 0.01, 1.4, 0]}>
        <meshStandardMaterial color="#2a2a2e" metalness={0.8} roughness={0.3} />
      </RoundedBox>
    </group>
  );
};

const Tablet = ({ texture }: { texture: THREE.Texture }) => {
  const W = 4.6;
  const H = 6.2;
  const screen = useMemo(() => roundedRectGeometry(W - 0.34, H - 0.34, 0.22), []);
  return (
    <group>
      <RoundedBox args={[W, H, 0.24]} radius={0.32} smoothness={6}>
        <meshPhysicalMaterial color="#d4d4d8" metalness={0.85} roughness={0.25} clearcoat={0.6} />
      </RoundedBox>
      <mesh geometry={screen} position={[0, 0, 0.122]}>
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
};

// ────────────────────────────────────────────
// Escena
// ────────────────────────────────────────────

const Rig = ({ children }: { children: React.ReactNode }) => {
  const group = useRef<THREE.Group>(null);
  const { size } = useThree();
  const compact = size.width < 640;

  useFrame((state, delta) => {
    if (!group.current) return;
    // Parallax con el mouse + giro suave al hacer scroll
    const scroll = Math.min(1, window.scrollY / 900);
    const targetY = state.pointer.x * 0.35 - 0.25 + scroll * 0.9;
    const targetX = -state.pointer.y * 0.18 + scroll * 0.15;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetY, 4, delta);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetX, 4, delta);
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, -scroll * 1.2, 4, delta);
  });

  return (
    <group ref={group} scale={compact ? 0.78 : 1}>
      {children}
    </group>
  );
};

const Scene = () => {
  const phoneTexture = useTexture(heroMockup);
  const tabletTexture = useMemo(() => makeAppTexture(["#eef2ff", "#a5b4fc", "#6366f1"], "dashboard"), []);
  const postTexture = useMemo(() => makeAppTexture(["#fcaf45", "#e1306c", "#833ab4"], "feed"), []);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 6, 8]} intensity={1.4} />

      <Rig>
        {/* Tablet detrás */}
        <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.6}>
          <group position={[-2.9, 0.5, -2.6]} rotation={[0, 0.45, -0.05]}>
            <Tablet texture={tabletTexture} />
          </group>
        </Float>

        {/* Celular secundario */}
        <Float speed={1.8} rotationIntensity={0.3} floatIntensity={0.8}>
          <group position={[3.1, -0.4, -1.6]} rotation={[0, -0.5, 0.06]} scale={0.82}>
            <Phone texture={postTexture} />
          </group>
        </Float>

        {/* Celular principal */}
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.9}>
          <group position={[0, 0, 0.6]}>
            <Phone texture={phoneTexture} />
          </group>
        </Float>

      </Rig>

      <ContactShadows position={[0, -4.4, 0]} opacity={0.28} scale={18} blur={2.8} far={6} />

      {/* Iluminación de estudio sin descargar HDRs */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} position={[0, 5, 6]} scale={[10, 4, 1]} />
        <Lightformer form="rect" intensity={1.5} color="#fbcfe8" position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={1.5} color="#c7d2fe" position={[6, -1, 2]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} />
        <Lightformer form="circle" intensity={2} position={[0, -6, 3]} scale={4} />
      </Environment>
    </>
  );
};

const HeroScene = () => (
  <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 15], fov: 36 }} gl={{ antialias: true, alpha: true }}>
    <Suspense fallback={null}>
      <Scene />
    </Suspense>
  </Canvas>
);

export default HeroScene;
