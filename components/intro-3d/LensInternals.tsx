"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { remap, clamp01 } from "./math";

type LensInternalsProps = {
  progressRef: MutableRefObject<number>;
};

const ELEMENT_COUNT = 6;
const TUNNEL_START = -3.6;
const TUNNEL_END = -17.5;

/**
 * The stylised "inside the camera" corridor: a series of translucent glass
 * elements receding into depth, a light beam that travels to the sensor,
 * and the sensor itself. The R3F camera dollies straight down this tunnel
 * (see Scene.tsx) — the elements don't need to animate position themselves
 * for the "reassembly" beat to read correctly, since the camera simply
 * retraces the same path in reverse.
 */
export default function LensInternals({ progressRef }: LensInternalsProps) {
  const groupRef = useRef<THREE.Group>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const beamMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const sensorMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const elementRefs = useRef<THREE.Mesh[]>([]);
  const materialsRef = useRef<THREE.Material[]>([]);

  const registerMaterial = (mat: THREE.Material | null) => {
    if (mat && !materialsRef.current.includes(mat)) materialsRef.current.push(mat);
  };

  const elements = useMemo(
    () =>
      Array.from({ length: ELEMENT_COUNT }, (_, i) => {
        const t = i / (ELEMENT_COUNT - 1);
        return {
          z: THREE.MathUtils.lerp(TUNNEL_START, TUNNEL_END + 4, t),
          radius: THREE.MathUtils.lerp(0.95, 0.35, t),
        };
      }),
    []
  );

  useFrame((state) => {
    const p = progressRef.current;
    const group = groupRef.current;
    if (!group) return;

    const opacity = clamp01(remap(p, 0.44, 0.5) - remap(p, 0.8, 0.86));
    group.visible = opacity > 0.01;
    if (!group.visible) return;

    for (const mat of materialsRef.current) {
      (mat as THREE.MeshStandardMaterial).opacity = opacity * 0.4;
    }

    const spin = state.clock.elapsedTime * 0.12;
    elementRefs.current.forEach((el, i) => {
      if (!el) return;
      el.rotation.z = spin * (i % 2 === 0 ? 1 : -1);
    });

    // Beam travels from the lens to the sensor across 0.50–0.70, then fades
    // ("disappears into the sensor") through the reassembly beat.
    const beamReach = remap(p, 0.5, 0.7);
    const beamFade = 1 - remap(p, 0.74, 0.83);
    const totalLength = TUNNEL_END - TUNNEL_START;
    const beamLength = Math.max(0.01, totalLength * beamReach);

    if (beamRef.current) {
      beamRef.current.scale.z = beamLength;
      beamRef.current.position.z = TUNNEL_START - beamLength / 2;
      beamRef.current.visible = beamReach > 0.01;
    }
    if (beamMaterialRef.current) {
      beamMaterialRef.current.emissiveIntensity = 1.4 * beamFade;
      beamMaterialRef.current.opacity = 0.8 * beamFade;
    }
    if (sensorMaterialRef.current) {
      const lit = clamp01(remap(p, 0.66, 0.72) - remap(p, 0.76, 0.84));
      sensorMaterialRef.current.emissiveIntensity = lit * 0.65;
    }
  });

  return (
    <group ref={groupRef} visible={false}>
      {elements.map((el, i) => (
        <mesh
          key={i}
          ref={(m) => {
            if (m) elementRefs.current[i] = m;
          }}
          position={[0.3, 1.25, el.z]}
        >
          <torusGeometry args={[el.radius, 0.02, 8, 40]} />
          <meshStandardMaterial
            ref={registerMaterial}
            color="#e7e5df"
            roughness={0.15}
            metalness={0.4}
            transparent
            opacity={0.4}
          />
        </mesh>
      ))}

      {/* Light beam — opacity/emissive driven independently below, kept out
          of the shared glass-element dimming loop. */}
      <mesh position={[0.3, 1.25, TUNNEL_START]} rotation={[Math.PI / 2, 0, 0]} ref={beamRef}>
        <cylinderGeometry args={[0.012, 0.012, 1, 12]} />
        <meshStandardMaterial
          ref={(m) => {
            beamMaterialRef.current = m;
          }}
          color="#f5f2ea"
          emissive="#f5f2ea"
          emissiveIntensity={0}
          transparent
          opacity={0}
        />
      </mesh>

      {/* Sensor — same, independent emissive control. */}
      <mesh position={[0.3, 1.25, TUNNEL_END]}>
        <planeGeometry args={[0.5, 0.5]} />
        <meshStandardMaterial
          ref={(m) => {
            sensorMaterialRef.current = m;
          }}
          color="#111114"
          emissive="#f5f2ea"
          emissiveIntensity={0}
          roughness={0.4}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
}
