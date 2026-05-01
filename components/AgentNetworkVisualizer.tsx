"use client"; // CRITICAL: This fixes the "nothing working" Next.js error

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, QuadraticBezierLine, Sphere } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

type AgentNodeProps = {
  position: [number, number, number];
  color: string;
  size: number;
};

type NetworkNode = {
  id: number;
  pos: [number, number, number];
  color: string;
  size: number;
};

// 1. The Glowing Agent Node
const AgentNode = ({ position, color, size }: AgentNodeProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Make them float slightly
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y =
        position[1] + Math.sin(clock.elapsedTime + position[0]) * 0.2;
    }
  });

  return (
    <Sphere ref={meshRef} position={position} args={[size, 32, 32]}>
      {/* MeshBasicMaterial ignores lighting, making it perfect for glowing neon */}
      <meshBasicMaterial color={color} toneMapped={false} />
    </Sphere>
  );
};

// 2. The Main Scene
const NetworkScene = () => {
  const groupRef = useRef<THREE.Group>(null);

  // Slowly rotate the entire network
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  // Mock Agent Positions (x, y, z)
  const nodes = useMemo<NetworkNode[]>(
    () => [
      { id: 1, pos: [-4, 1, 2], color: "#00F2FE", size: 0.3 }, // Cyan
      { id: 2, pos: [4, -1, -2], color: "#952AFF", size: 0.4 }, // Purple
      { id: 3, pos: [0, 3, 1], color: "#00F2FE", size: 0.2 },
      { id: 4, pos: [-2, -2, -3], color: "#952AFF", size: 0.25 },
      { id: 5, pos: [2, 2, -1], color: "#FFFFFF", size: 0.15 },
    ],
    [],
  );

  return (
    <group ref={groupRef}>
      {/* Render Nodes */}
      {nodes.map((node) => (
        <AgentNode
          key={node.id}
          position={node.pos}
          color={node.color}
          size={node.size}
        />
      ))}

      {/* Render Flowing Connections (Gensyn AXL Links) */}
      <QuadraticBezierLine
        start={nodes[0].pos}
        end={nodes[1].pos}
        mid={[0, 0, 0]}
        color="#00F2FE"
        lineWidth={2}
        dashed
        dashScale={50}
        dashSize={1}
        transparent
        opacity={0.6}
      />
      <QuadraticBezierLine
        start={nodes[0].pos}
        end={nodes[2].pos}
        mid={[-2, 2, 1]}
        color="#00F2FE"
        lineWidth={1}
        transparent
        opacity={0.4}
      />
      <QuadraticBezierLine
        start={nodes[1].pos}
        end={nodes[3].pos}
        mid={[1, -1.5, -2.5]}
        color="#952AFF"
        lineWidth={1.5}
        transparent
        opacity={0.5}
      />
      <QuadraticBezierLine
        start={nodes[2].pos}
        end={nodes[4].pos}
        mid={[1, 2.5, 0]}
        color="#FFFFFF"
        lineWidth={1}
        transparent
        opacity={0.2}
      />
    </group>
  );
};

// 3. The Canvas Wrapper
export default function AgentNetworkVisualizer() {
  return (
    <div className="w-full h-full min-h-125 bg-[#0A0A0B] rounded-xl overflow-hidden relative border border-[#2A2A2E]">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <color attach="background" args={["#0A0A0B"]} />
        <ambientLight intensity={0.5} />

        <NetworkScene />

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          maxDistance={15}
          minDistance={5}
        />

        {/* THE SECRET SAUCE: Post-processing Bloom for the Flew.live Glow */}
        <EffectComposer enableNormalPass={false}>
          <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} />
        </EffectComposer>
      </Canvas>

      {/* Optional Overlay Text to make it look like a SaaS tool */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <h3 className="text-white font-medium text-sm tracking-widest uppercase">
          Live Ocean Network
        </h3>
        <p className="text-gray-400 text-xs mt-1">
          Gensyn AXL Peer-to-Peer Activity
        </p>
      </div>
    </div>
  );
}
