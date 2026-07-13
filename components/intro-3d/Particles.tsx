"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { mulberry32 } from "./math";

type ParticlesProps = {
  count?: number;
};

/**
 * A slow, atmospheric field of dust motes. Kept as a single Points object
 * (one draw call) and animated by mutating the buffer directly in
 * useFrame — no per-particle React state.
 */
export default function Particles({ count = 260 }: ParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, speeds } = useMemo(() => {
    const rand = mulberry32(1337);
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rand() - 0.5) * 26;
      positions[i * 3 + 1] = (rand() - 0.5) * 14;
      positions[i * 3 + 2] = (rand() - 0.5) * 40 - 6;
      speeds[i] = 0.04 + rand() * 0.08;
    }
    return { positions, speeds };
  }, [count]);

  useFrame((_, delta) => {
    const geom = pointsRef.current?.geometry;
    if (!geom) return;
    const attr = geom.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      const y = attr.getY(i) + speeds[i] * delta;
      attr.setY(i, y > 7 ? -7 : y);
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#f5f2ea"
        size={0.03}
        transparent
        opacity={0.35}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
