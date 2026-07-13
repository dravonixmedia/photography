"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { type MutableRefObject } from "react";
import * as THREE from "three";
import { clamp01, easeInOut, lerp } from "./math";
import Figure from "./Figure";
import CameraProp from "./CameraProp";
import LensInternals from "./LensInternals";
import Particles from "./Particles";

type SceneProps = {
  progressRef: MutableRefObject<number>;
  isMobile: boolean;
};

type CameraKeyframe = {
  p: number;
  pos: [number, number, number];
  look: [number, number, number];
  fov: number;
};

/** One continuous camera path for the whole intro — walk-in, reveal, push
 * into the lens, fly the internal corridor, then pull back out. */
const KEYFRAMES: CameraKeyframe[] = [
  { p: 0.0, pos: [0, 1.6, 4], look: [0.2, 1.4, -6], fov: 32 },
  { p: 0.18, pos: [0, 1.55, 1.8], look: [0.3, 1.3, -3.4], fov: 32 },
  { p: 0.35, pos: [0.32, 1.3, -1.6], look: [0.3, 1.25, -3.2], fov: 30 },
  { p: 0.5, pos: [0.3, 1.25, -3.02], look: [0.3, 1.25, -20], fov: 42 },
  { p: 0.72, pos: [0.3, 1.25, -13], look: [0.3, 1.25, -20], fov: 58 },
  { p: 0.84, pos: [0.3, 1.25, -3.1], look: [0.3, 1.25, -3.4], fov: 30 },
  { p: 1.0, pos: [0, 1.55, 2.2], look: [0.2, 1.35, -2.8], fov: 32 },
];

function sampleCameraPath(p: number, out: { pos: THREE.Vector3; look: THREE.Vector3; fov: number }) {
  const clamped = clamp01(p);
  let a = KEYFRAMES[0];
  let b = KEYFRAMES[KEYFRAMES.length - 1];
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    if (clamped >= KEYFRAMES[i].p && clamped <= KEYFRAMES[i + 1].p) {
      a = KEYFRAMES[i];
      b = KEYFRAMES[i + 1];
      break;
    }
  }
  const span = b.p - a.p;
  const t = span === 0 ? 0 : easeInOut((clamped - a.p) / span);

  out.pos.set(lerp(a.pos[0], b.pos[0], t), lerp(a.pos[1], b.pos[1], t), lerp(a.pos[2], b.pos[2], t));
  out.look.set(lerp(a.look[0], b.look[0], t), lerp(a.look[1], b.look[1], t), lerp(a.look[2], b.look[2], t));
  out.fov = lerp(a.fov, b.fov, t);
}

const scratch = {
  pos: new THREE.Vector3(),
  look: new THREE.Vector3(),
  fov: 32,
};

export default function Scene({ progressRef, isMobile }: SceneProps) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;

  // R3F's documented pattern: the camera Object3D from useThree() is
  // mutated imperatively every frame (position/lookAt/fov) instead of going
  // through React state, which would be both wrong (state doesn't belong to
  // React here) and far too slow for a 60fps render loop.
  // eslint-disable-next-line react-hooks/immutability
  useFrame(() => {
    sampleCameraPath(progressRef.current, scratch);
    camera.position.copy(scratch.pos);
    camera.lookAt(scratch.look);
    if (camera.fov !== scratch.fov) {
      // eslint-disable-next-line react-hooks/immutability
      camera.fov = scratch.fov;
      camera.updateProjectionMatrix();
    }
  });

  return (
    <>
      <fog attach="fog" args={["#050506", 6, 26]} />
      <ambientLight intensity={0.06} />
      <spotLight
        position={[0.5, 6, -6]}
        angle={0.35}
        penumbra={0.7}
        intensity={4.5}
        distance={30}
        color="#f5f2ea"
        castShadow={!isMobile}
      />
      <pointLight position={[0.6, 1.6, 1.5]} intensity={0.35} color="#f5f2ea" distance={8} />
      <pointLight position={[0.3, 1.3, -3]} intensity={0.5} color="#e7e5df" distance={5} />

      <mesh position={[0, -0.02, -8]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 60]} />
        <meshStandardMaterial color="#020203" roughness={0.9} metalness={0} />
      </mesh>

      <Particles count={isMobile ? 90 : 220} />
      <Figure progressRef={progressRef} />
      <CameraProp progressRef={progressRef} />
      <LensInternals progressRef={progressRef} />
    </>
  );
}
