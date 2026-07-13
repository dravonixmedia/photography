"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { remap, clamp01, easeInOut } from "./math";

type CameraPropProps = {
  progressRef: MutableRefObject<number>;
};

const BODY = "#0c0c0e";
const TRIM = "#3a3a3f";
const GLASS = "#050506";

const BLADE_COUNT = 9;

/**
 * The "hero" camera model — a stylised Sony FX3-style body, independent of
 * the Figure so its own transform can carry the "reveal, grow to fill the
 * frame, retreat" choreography without needing exact hand-bone tracking.
 * Visible 0.16–0.52 (reveal through lens approach) and 0.80–1 (return).
 */
export default function CameraProp({ progressRef }: CameraPropProps) {
  const groupRef = useRef<THREE.Group>(null);
  const lensGroupRef = useRef<THREE.Group>(null);
  const bladeRefs = useRef<THREE.Mesh[]>([]);
  const recordLightRef = useRef<THREE.Mesh>(null);
  const materialsRef = useRef<THREE.Material[]>([]);
  const recordMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);

  const registerMaterial = (mat: THREE.Material | null) => {
    if (mat && !materialsRef.current.includes(mat)) materialsRef.current.push(mat);
  };

  const bladeAngles = useMemo(
    () => Array.from({ length: BLADE_COUNT }, (_, i) => (i / BLADE_COUNT) * Math.PI * 2),
    []
  );

  useFrame((state) => {
    const p = progressRef.current;
    const group = groupRef.current;
    if (!group) return;

    const revealOpacity = remap(p, 0.16, 0.22) - remap(p, 0.46, 0.52);
    const returnOpacity = remap(p, 0.8, 0.86);
    const opacity = clamp01(Math.max(revealOpacity, returnOpacity));
    group.visible = opacity > 0.01;
    if (!group.visible) return;

    for (const mat of materialsRef.current) {
      (mat as THREE.MeshStandardMaterial).opacity = opacity;
    }

    // Reveal + approach (0.16–0.50): starts at roughly the same depth as the
    // still-approaching Figure (so it reads as rising from their hand, not
    // teleporting to the lens), then travels to the lens position the R3F
    // camera arrives at by 0.50 (see Scene.tsx's camera keyframe at p=0.5).
    // Return (0.80–1): mirrors that path outward to a held-toward-viewer pose.
    const approachP = easeInOut(remap(p, 0.16, 0.5));
    const returnP = easeInOut(remap(p, 0.8, 1));
    const isReturn = p > 0.6;
    const localP = isReturn ? returnP : approachP;

    const scale = isReturn
      ? THREE.MathUtils.lerp(3.4, 1.35, localP)
      : THREE.MathUtils.lerp(1, 3.4, localP);
    group.scale.setScalar(scale);

    const posY = isReturn ? THREE.MathUtils.lerp(1.28, 1.32, localP) : THREE.MathUtils.lerp(1.2, 1.28, localP);
    const posZ = isReturn ? THREE.MathUtils.lerp(-3.05, -2.6, localP) : THREE.MathUtils.lerp(-13, -3.05, localP);
    group.position.set(0.3, posY, posZ);
    group.rotation.y = Math.PI; // front element faces +Z, toward the viewer/camera

    const rotSpeed = remap(p, 0.35, 0.5) * 0.9;
    if (lensGroupRef.current) {
      lensGroupRef.current.rotation.z = state.clock.elapsedTime * rotSpeed * 0.6;
    }

    const aperture = clamp01(0.15 + remap(p, 0.34, 0.49) * 0.75);
    const radius = THREE.MathUtils.lerp(0.06, 0.1, aperture);
    bladeRefs.current.forEach((blade, i) => {
      if (!blade) return;
      const angle = bladeAngles[i];
      blade.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0.236);
      blade.scale.set(1, THREE.MathUtils.lerp(1, 0.35, aperture), 1);
    });

    if (recordMaterialRef.current) {
      const lit = remap(p, 0.9, 0.97);
      const pulse = 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 6);
      recordMaterialRef.current.emissiveIntensity = lit * (0.6 + pulse * 0.6);
    }
  });

  return (
    <group ref={groupRef} visible={false}>
      {/* Body */}
      <mesh castShadow>
        <boxGeometry args={[0.62, 0.36, 0.34]} />
        <meshStandardMaterial ref={registerMaterial} color={BODY} roughness={0.45} metalness={0.4} transparent />
      </mesh>
      <mesh position={[0, 0.24, -0.02]} castShadow>
        <boxGeometry args={[0.2, 0.08, 0.28]} />
        <meshStandardMaterial ref={registerMaterial} color={BODY} roughness={0.4} metalness={0.4} transparent />
      </mesh>

      {/* Lens barrel */}
      <group ref={lensGroupRef} position={[0, 0, 0.34]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.18, 0.42, 28]} />
          <meshStandardMaterial ref={registerMaterial} color={TRIM} roughness={0.35} metalness={0.6} transparent />
        </mesh>
        <mesh position={[0, 0, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.145, 0.145, 0.02, 28]} />
          <meshStandardMaterial ref={registerMaterial} color={GLASS} roughness={0.25} metalness={0.55} transparent />
        </mesh>
        <mesh position={[0, 0, 0.235]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.06, 0.13, 40]} />
          <meshStandardMaterial
            ref={registerMaterial}
            color="#f5f2ea"
            roughness={0.1}
            metalness={0.3}
            emissive="#f5f2ea"
            emissiveIntensity={0.05}
            transparent
            opacity={0.25}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Aperture blades */}
        {bladeAngles.map((angle, i) => (
          <mesh
            key={i}
            ref={(el) => {
              if (el) bladeRefs.current[i] = el;
            }}
            position={[Math.cos(angle) * 0.1, Math.sin(angle) * 0.1, 0.236]}
            rotation={[0, 0, angle]}
          >
            <planeGeometry args={[0.02, 0.14]} />
            <meshStandardMaterial ref={registerMaterial} color="#050506" roughness={0.5} side={THREE.DoubleSide} transparent />
          </mesh>
        ))}
      </group>

      {/* Viewfinder hump + grip */}
      <mesh position={[-0.16, 0.24, -0.1]} castShadow>
        <boxGeometry args={[0.14, 0.06, 0.14]} />
        <meshStandardMaterial ref={registerMaterial} color={BODY} roughness={0.5} transparent />
      </mesh>
      <mesh position={[-0.29, -0.02, 0]} castShadow>
        <boxGeometry args={[0.1, 0.4, 0.3]} />
        <meshStandardMaterial ref={registerMaterial} color={BODY} roughness={0.5} metalness={0.3} transparent />
      </mesh>

      {/* Record indicator */}
      <mesh position={[0.2, 0.12, -0.18]} ref={recordLightRef}>
        <sphereGeometry args={[0.018, 12, 12]} />
        <meshStandardMaterial
          ref={(m) => {
            registerMaterial(m);
            recordMaterialRef.current = m;
          }}
          color="#c23b2f"
          emissive="#c23b2f"
          emissiveIntensity={0}
          transparent
        />
      </mesh>
    </group>
  );
}
