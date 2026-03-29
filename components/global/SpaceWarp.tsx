"use client";

import React, { Suspense } from 'react';
import { Canvas } from "@react-three/fiber";
import { SpaceWarpScene } from "./SpaceWarpScene";

export default function SpaceWarp() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none w-full h-full bg-black">
      <Canvas
        camera={{
          fov: 100,
          near: 0.1,
          far: 200,
        }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
            <SpaceWarpScene />
        </Suspense>
      </Canvas>
      {/* VIGNETTE OVERLAY FOR CINEMATIC EFFECT */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.8)_100%)]" />
    </div>
  );
}
