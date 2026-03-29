"use client";

import { useFrame } from "@react-three/fiber";
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useAudioStore } from '@/store/useAudioStore';

// === CRITICAL NEXT.JS DEVSERVER MOBILE PATCH ===
// Turbopack's Fast Refresh and Dev Overlay aggressively JSON.stringify React Fiber nodes across mobile bridges.
// Because R3F binds complex WebGL instances (which have circular parent/child references) to React nodes,
// Next.js crashes with "Converting circular structure to JSON" trying to draw the error overlay or perform HMR!
// This transparently blocks JSON.stringify from crawling into WebGL memory.
if (typeof THREE !== 'undefined' && THREE.Object3D) {
  // @ts-ignore
  THREE.Object3D.prototype.toJSON = function() { return { type: 'R3F_WebGL_Node' }; };
  // @ts-ignore
  THREE.EventDispatcher.prototype.toJSON = function() { return { type: 'R3F_Event_Dispatcher' }; };
}

const COUNT = 1000;
const XY_BOUNDS = 50;
const Z_BOUNDS = 30;
const BASE_SPEED = 0.5;
const MAX_SPEED_FACTOR = 4.0;
const MAX_SCALE_FACTOR = 80;
const BASE_CHROMATIC_OFFSET = 0.003;

if (typeof window !== "undefined") {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (args.length > 0 && typeof args[0] === 'string' && args[0].includes('THREE.Clock: This module has been deprecated')) {
      return; // Suppress warning to prevent DevTools from triggering circular JSON serialization over WebSockets
    }
    originalWarn.apply(console, args);
  };
}

export const SpaceWarpScene = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const effectsRef = useRef<any>(null);
  
  // We explicitly DO NOT subscribe to the store here to prevent React from re-rendering the WebGL canvas
  // which causes circular JSON serialization crashes on HMR and Next.js DevTools. We query it directly in useFrame.

  useEffect(() => {
    if (!meshRef.current) return;

    const t = new THREE.Object3D();
    let j = 0;
    for (let i = 0; i < COUNT * 3; i += 3) {
      t.position.x = generatePos();
      t.position.y = generatePos();
      t.position.z = (Math.random() - 0.5) * Z_BOUNDS;
      t.updateMatrix();
      meshRef.current.setMatrixAt(j++, t.matrix);
    }
  }, []);

  const temp = new THREE.Matrix4();
  const tempPos = new THREE.Vector3();
  const tempObject = new THREE.Object3D();
  const tempColor = new THREE.Color();
  const targetVelocity = useRef(BASE_SPEED);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // 1. AUDIO INTERCEPTION
    // Intercept hardware-accelerated CSS variables set by AudioEngine.tsx
    let audioIntensity = 0;
    let audioBass = 0;
    const isPlaying = useAudioStore.getState().isPlaying;
    
    if (isPlaying && typeof window !== 'undefined') {
        const rootStyles = getComputedStyle(document.documentElement);
        audioIntensity = parseFloat(rootStyles.getPropertyValue('--audio-intensity')) || 0;
        audioBass = parseFloat(rootStyles.getPropertyValue('--audio-low')) || 0;
    }
    
    // Smooth transition between base warp speed and bass-injected speed
    const dynamicThrust = BASE_SPEED + (audioIntensity * MAX_SPEED_FACTOR) + (audioBass * 2.0);
    targetVelocity.current = THREE.MathUtils.lerp(targetVelocity.current, dynamicThrust, 0.1);

    const velocity = targetVelocity.current;

    for (let i = 0; i < COUNT; i++) {
      meshRef.current.getMatrixAt(i, temp);

      // update scale based on speed (stretching stars)
      tempObject.scale.set(1, 1, Math.max(1, velocity * (MAX_SCALE_FACTOR * 0.2)));

      // update position
      tempPos.setFromMatrixPosition(temp);
      if (tempPos.z > Z_BOUNDS / 2) {
        tempPos.z = -Z_BOUNDS / 2;
        // randomize XY when reforming behind
        tempPos.x = generatePos();
        tempPos.y = generatePos();
      } else {
        tempPos.z += Math.max(delta, velocity * delta * 20);
      }
      tempObject.position.set(tempPos.x, tempPos.y, tempPos.z);

      // apply transforms
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);

      // update and apply color
      // Map colors closer to fiery orange/red matching the "upside-down cosmic ocean" theme
      const depthRatio = Math.max(0, 1 - (tempPos.z / (-Z_BOUNDS / 2)));
      
      if (tempPos.z > 0) {
        tempColor.setHSL(0.1, 1.0, 0.9); // Fiery white/yellow flash near camera
      } else {
        // Shift hue based on depth and inject fiery orange/red based on audio intensity
        const baseHue = 0.02 + (Math.random() * 0.08); // Red to Orange range
        const hue = baseHue + (audioIntensity * 0.05);
        tempColor.setHSL(hue, 1.0, depthRatio * 0.7 + 0.3); // Keep brightness high
      }
      
      meshRef.current.setColorAt(i, tempColor);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }

    // 2. POST-PROCESSING AUDIO REACTIVITY
    if (!effectsRef.current) return;
    
    // Chromatic aberration intensifies aggressively on bass drops
    const dynamicOffset = BASE_CHROMATIC_OFFSET + (audioBass * 0.05) + (audioIntensity * 0.08);
    effectsRef.current.offset.x = THREE.MathUtils.lerp(effectsRef.current.offset.x, dynamicOffset, 0.1);
    effectsRef.current.offset.y = THREE.MathUtils.lerp(effectsRef.current.offset.y, dynamicOffset, 0.1);
  });

  return (
    <>
      <color args={["#000000"]} attach="background" />
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, COUNT]}
        matrixAutoUpdate
      >
        <sphereGeometry args={[0.02]} /> {/* Slightly smaller stars */}
        <meshBasicMaterial color={[2, 2, 2]} toneMapped={false} />
      </instancedMesh>
      <EffectComposer multisampling={0}>
        <Bloom 
          luminanceThreshold={0.5} 
          luminanceSmoothing={0.9} 
          intensity={1.5} // Base bloom
          mipmapBlur 
        />
        <ChromaticAberration
          ref={effectsRef}
          blendFunction={BlendFunction.ADD}
          offset={[BASE_CHROMATIC_OFFSET, BASE_CHROMATIC_OFFSET] as any}
        />
      </EffectComposer>
    </>
  );
};

function generatePos() {
  return (Math.random() - 0.5) * XY_BOUNDS;
}
