import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group, Mesh, MeshStandardMaterial } from 'three';

interface ExplosionProps {
  x: number;
  y: number;
  big?: boolean;
}

export function Explosion({ x, y, big = false }: ExplosionProps) {
  const groupRef = useRef<Group>(null);
  const coreRef = useRef<Mesh>(null);
  const ringRef = useRef<Mesh>(null);
  const timeRef = useRef(0);
  const maxTime = big ? 0.7 : 0.45;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    timeRef.current += delta;
    const t = timeRef.current / maxTime;

    // Core fireball - expands then shrinks
    if (coreRef.current) {
      const coreScale = big
        ? (t < 0.4 ? t * 4 : Math.max(0, 1.6 - t * 2))
        : (t < 0.4 ? t * 3 : Math.max(0, 1.2 - t * 1.5));
      coreRef.current.scale.setScalar(coreScale);
      const mat = coreRef.current.material as MeshStandardMaterial;
      mat.opacity = Math.max(0, 1 - t * 0.8);
      // Color shift: white -> yellow -> orange -> red
      if (t < 0.2) mat.emissiveIntensity = 4;
      else if (t < 0.5) mat.emissiveIntensity = 3;
      else mat.emissiveIntensity = 1.5;
    }

    // Shockwave ring - expands outward
    if (ringRef.current) {
      const ringScale = big ? t * 3 : t * 2;
      ringRef.current.scale.set(ringScale, 0.1, ringScale);
      const mat = ringRef.current.material as MeshStandardMaterial;
      mat.opacity = Math.max(0, 0.6 - t);
    }
  });

  return (
    <group ref={groupRef} position={[x, 0.3, y]}>
      {/* Core fireball */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[big ? 0.4 : 0.25, 12, 12]} />
        <meshStandardMaterial
          color="#FFCC00"
          emissive="#FF6600"
          emissiveIntensity={4}
          transparent
          opacity={1}
        />
      </mesh>

      {/* Inner hot core */}
      <mesh scale={0.5}>
        <sphereGeometry args={[big ? 0.3 : 0.15, 8, 8]} />
        <meshStandardMaterial
          color="#FFFFFF"
          emissive="#FFDD88"
          emissiveIntensity={5}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Shockwave ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <ringGeometry args={[0.3, 0.5, 16]} />
        <meshStandardMaterial
          color="#FF8800"
          emissive="#FF4400"
          emissiveIntensity={2}
          transparent
          opacity={0.6}
          side={2}
        />
      </mesh>

      {/* Dynamic light */}
      <pointLight
        color="#FF8800"
        intensity={big ? 3 : 1.5}
        distance={big ? 4 : 2.5}
        decay={2}
      />
    </group>
  );
}
