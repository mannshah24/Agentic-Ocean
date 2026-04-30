"use client";

import { Canvas } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

type AgentNode = {
  id: string;
  position: [number, number, number];
  meritScore: number;
};

type AgentLink = {
  from: string;
  to: string;
};

type AgentNetworkVisualizerProps = {
  agents: AgentNode[];
  links: AgentLink[];
};

const GLOW_BASE = new THREE.Color("#00F2FE");
const GLOW_PEAK = new THREE.Color("#952AFF");

function normalizeMerit(value: number) {
  return Math.min(1, Math.max(0, value / 100));
}

function blendGlowColor(t: number) {
  return GLOW_BASE.clone().lerp(GLOW_PEAK, t * 0.65);
}

function buildArcPoints(start: THREE.Vector3, end: THREE.Vector3) {
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const lift = new THREE.Vector3(0, 1.5 + start.distanceTo(end) * 0.1, 0);
  const control = mid.clone().add(lift);
  const curve = new THREE.QuadraticBezierCurve3(start, control, end);
  return curve.getPoints(48);
}

function AgentSphere({ meritScore, position }: { meritScore: number; position: [number, number, number] }) {
  const intensity = normalizeMerit(meritScore);
  const scale = 0.55 + intensity * 0.7;
  const glow = useMemo(() => blendGlowColor(intensity), [intensity]);

  return (
    <mesh position={position} scale={scale}>
      <sphereGeometry args={[0.6, 32, 32]} />
      <meshStandardMaterial
        color="#0A0A0B"
        emissive={glow}
        emissiveIntensity={1.2 + intensity * 2.4}
        roughness={0.2}
        metalness={0.1}
      />
    </mesh>
  );
}

export default function AgentNetworkVisualizer({ agents, links }: AgentNetworkVisualizerProps) {
  const linkPoints = useMemo(() => {
    const lookup = new Map(agents.map((agent) => [agent.id, agent.position]));

    return links
      .map((link) => {
        const from = lookup.get(link.from);
        const to = lookup.get(link.to);
        if (!from || !to) {
          return null;
        }

        return buildArcPoints(new THREE.Vector3(...from), new THREE.Vector3(...to));
      })
      .filter((points): points is THREE.Vector3[] => Boolean(points));
  }, [agents, links]);

  return (
    <Canvas
      camera={{ position: [0, 2.5, 8], fov: 55 }}
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={["#000000"]} />
      <ambientLight intensity={0.25} />
      <pointLight position={[6, 6, 6]} intensity={1.1} color="#00F2FE" />
      <pointLight position={[-6, -2, -4]} intensity={0.7} color="#952AFF" />

      {agents.map((agent) => (
        <AgentSphere key={agent.id} meritScore={agent.meritScore} position={agent.position} />
      ))}

      {linkPoints.map((points, index) => (
        <Line
          key={`link-${index}`}
          points={points}
          color="#00F2FE"
          lineWidth={1.5}
          transparent
          opacity={0.75}
        />
      ))}

      <OrbitControls enablePan enableZoom enableRotate dampingFactor={0.1} />
    </Canvas>
  );
}
