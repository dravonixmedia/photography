"use client";

import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { Suspense, type MutableRefObject } from "react";
import Scene from "./intro-3d/Scene";

type IntroScene3DProps = {
  progressRef: MutableRefObject<number>;
  isMobile: boolean;
  onReady?: () => void;
};

/**
 * The live WebGL layer for the cinematic intro. A single continuous 3D
 * scene (see intro-3d/Scene.tsx) is driven entirely by `progressRef`, which
 * the GSAP master timeline in CinematicIntro.tsx mutates directly on scroll
 * — no React state changes per scroll frame.
 */
export default function IntroScene3D({ progressRef, isMobile, onReady }: IntroScene3DProps) {
  return (
    <Canvas
      style={{ position: "absolute", inset: 0 }}
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ fov: 32, near: 0.1, far: 60, position: [0, 1.6, 4] }}
      shadows={!isMobile}
      onCreated={() => onReady?.()}
    >
      <color attach="background" args={["#050506"]} />
      <Suspense fallback={null}>
        <Scene progressRef={progressRef} isMobile={isMobile} />
      </Suspense>
      {!isMobile && (
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.35} luminanceThreshold={0.65} luminanceSmoothing={0.25} mipmapBlur />
          <Vignette eskil={false} offset={0.25} darkness={0.9} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
