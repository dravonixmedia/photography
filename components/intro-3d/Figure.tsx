"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { remap, easeInOut, clamp01 } from "./math";

type FigureProps = {
  /** Overall intro progress, 0–1, mutated imperatively by the scroll driver. */
  progressRef: MutableRefObject<number>;
};

const INK = "#050506";
const RIM_TINT = "#f5f2ea";

/**
 * A stylised, faceless silhouette — deliberately abstract rather than an
 * attempt at a photoreal rigged character. Built entirely from primitive
 * geometry (capsules + a sphere) so it reads as a genuine 3D form under the
 * scene's rim lighting without needing external character assets.
 */
export default function Figure({ progressRef }: FigureProps) {
  const groupRef = useRef<THREE.Group>(null);
  const upperArmRef = useRef<THREE.Group>(null);
  const cameraMountRef = useRef<THREE.Group>(null);
  const materialsRef = useRef<THREE.Material[]>([]);

  useFrame((state) => {
    const p = progressRef.current;
    const group = groupRef.current;
    if (!group) return;

    // Visible during the walk-in (0–0.38) and the closing lens-return beat
    // (0.80–1) with short crossfades; hidden while the camera/lens carry the
    // story in between.
    const walkOpacity = 1 - remap(p, 0.32, 0.38);
    const returnOpacity = remap(p, 0.8, 0.86);
    const opacity = Math.max(walkOpacity, returnOpacity);
    group.visible = opacity > 0.01;

    if (group.visible) {
      for (const mat of materialsRef.current) {
        (mat as THREE.MeshStandardMaterial).opacity = opacity;
      }
    }

    const inWalk = p <= 0.5;
    const localP = inWalk ? remap(p, 0, 0.38) : remap(p, 0.8, 1);
    const eased = easeInOut(localP);

    const startZ = inWalk ? -22 : -3.4;
    const endZ = inWalk ? -3.4 : -2.6;
    group.position.z = THREE.MathUtils.lerp(startZ, endZ, eased);
    group.position.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.15;

    const scale = THREE.MathUtils.lerp(0.55, 1, eased);
    group.scale.setScalar(scale);

    // Gentle idle sway instead of a literal walk-cycle rig.
    group.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;

    const armRaise = inWalk
      ? clamp01(remap(p, 0.16, 0.34))
      : clamp01(1 - remap(p, 0.92, 1));
    if (upperArmRef.current) {
      upperArmRef.current.rotation.x = THREE.MathUtils.lerp(0.15, -1.55, armRaise);
    }
    if (cameraMountRef.current) {
      cameraMountRef.current.rotation.x = THREE.MathUtils.lerp(0, 1.5, armRaise);
    }
  });

  const registerMaterial = (mat: THREE.Material | null) => {
    if (mat && !materialsRef.current.includes(mat)) materialsRef.current.push(mat);
  };

  return (
    <group ref={groupRef} position={[0.3, 0, -22]}>
      {/* Head */}
      <mesh position={[0, 1.62, 0]} castShadow>
        <sphereGeometry args={[0.15, 24, 24]} />
        <meshStandardMaterial
          ref={registerMaterial}
          color={INK}
          roughness={0.55}
          metalness={0.15}
          transparent
          emissive={RIM_TINT}
          emissiveIntensity={0.02}
        />
      </mesh>

      {/* Torso */}
      <mesh position={[0, 1.18, 0]} castShadow>
        <capsuleGeometry args={[0.17, 0.48, 6, 12]} />
        <meshStandardMaterial
          ref={registerMaterial}
          color={INK}
          roughness={0.6}
          metalness={0.1}
          transparent
        />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.1, 0.42, 0]} castShadow>
        <capsuleGeometry args={[0.095, 0.72, 6, 10]} />
        <meshStandardMaterial ref={registerMaterial} color={INK} roughness={0.65} transparent />
      </mesh>
      <mesh position={[0.1, 0.42, 0]} castShadow>
        <capsuleGeometry args={[0.095, 0.72, 6, 10]} />
        <meshStandardMaterial ref={registerMaterial} color={INK} roughness={0.65} transparent />
      </mesh>

      {/* Relaxed arm */}
      <mesh position={[-0.28, 1.05, 0]} rotation={[0.1, 0, 0.12]} castShadow>
        <capsuleGeometry args={[0.075, 0.5, 6, 10]} />
        <meshStandardMaterial ref={registerMaterial} color={INK} roughness={0.6} transparent />
      </mesh>

      {/* Camera-holding arm: shoulder pivot -> forearm -> camera mount */}
      <group position={[0.3, 1.4, 0]} ref={upperArmRef}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <capsuleGeometry args={[0.08, 0.4, 6, 10]} />
          <meshStandardMaterial ref={registerMaterial} color={INK} roughness={0.6} transparent />
        </mesh>
        <group position={[0, -0.46, 0]} ref={cameraMountRef}>
          <mesh position={[0, -0.16, 0]} castShadow>
            <capsuleGeometry args={[0.07, 0.32, 6, 10]} />
            <meshStandardMaterial ref={registerMaterial} color={INK} roughness={0.6} transparent />
          </mesh>
          {/* Low-detail hand-held silhouette — the detailed hero CameraProp
              (rendered independently in Scene.tsx) grows in over this same
              screen position from ~0.18 onward and reads as the "reveal". */}
          <mesh position={[0, -0.32, 0.05]} castShadow>
            <boxGeometry args={[0.14, 0.09, 0.16]} />
            <meshStandardMaterial ref={registerMaterial} color={INK} roughness={0.4} metalness={0.3} transparent />
          </mesh>
        </group>
      </group>
    </group>
  );
}
