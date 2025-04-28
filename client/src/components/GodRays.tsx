import React, { useRef } from "react";
import * as THREE from "three";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";

// Create a custom shader material
const CustomShaderMaterial = shaderMaterial(
  {
    u_colors: [
      new THREE.Vector4(0.6588, 0.1098, 1, 1),
      new THREE.Vector4(0.3372, 0.3764, 1, 1),
    ],
    u_intensity: 0.946,
    u_rays: 0.053,
    u_reach: 0.222,
    u_time: 0,
    u_mouse: [0, 0],
    u_resolution: [1024, 1024],
  },
  // Vertex Shader
  `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  // Fragment Shader
  `
  uniform vec4 u_colors[2];
  uniform float u_intensity;
  uniform float u_rays;
  uniform float u_reach;
  uniform float u_time;
  uniform vec2 u_mouse;
  uniform vec2 u_resolution;
  
  varying vec2 vUv;

  void main() {
    vec3 color = mix(u_colors[0].xyz, u_colors[1].xyz, vUv.y);
    gl_FragColor = vec4(color, 1.0);
  }
  `
);

// Register the custom shader material
extend({ CustomShaderMaterial });

const TextureMesh = () => {
  const mesh = useRef();

  useFrame((state) => {
    const { clock, mouse, size } = state;
    if (mesh.current) {
      mesh.current.material.uniforms.u_mouse.value = [
        mouse.x / 2 + 0.5,
        mouse.y / 2 + 0.5,
      ];
      mesh.current.material.uniforms.u_time.value = clock.getElapsedTime();
      mesh.current.material.uniforms.u_resolution.value = [
        size.width,
        size.height,
      ];
    }
  });

  return (
    <mesh ref={mesh}>
      <planeBufferGeometry args={[2, 2]} />
      <customShaderMaterial attach="material" />
    </mesh>
  );
};

const ThreeScene = () => {
  return (
    <div>
      <Canvas
        camera={{ position: [0, 0, 1] }}
        style={{ width: "100vw", height: "100vh" }}
      >
        <TextureMesh />
      </Canvas>
    </div>
  );
};

export default ThreeScene;
