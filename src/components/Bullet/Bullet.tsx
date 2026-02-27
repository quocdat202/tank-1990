import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh, MeshStandardMaterial } from 'three';
import type { Bullet as BulletType } from '../../types/game';

interface BulletProps {
  bullet: BulletType;
}

export function BulletMesh({ bullet }: BulletProps) {
  const glowRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (glowRef.current) {
      const t = state.clock.getElapsedTime();
      const mat = glowRef.current.material as MeshStandardMaterial;
      mat.opacity = 0.3 + Math.sin(t * 30) * 0.15;
      glowRef.current.scale.setScalar(1 + Math.sin(t * 25) * 0.2);
    }
  });

  const color = bullet.isPlayerBullet ? '#FFDD44' : '#FF4444';
  const emissive = bullet.isPlayerBullet ? '#FFAA00' : '#FF0000';

  return (
    <group position={[bullet.x, 0.25, bullet.y]}>
      {/* Core */}
      <mesh>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={2}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial
          color={emissive}
          emissive={emissive}
          emissiveIntensity={1}
          transparent
          opacity={0.3}
        />
      </mesh>
      {/* Nearby illumination */}
      <pointLight color={emissive} intensity={0.5} distance={1.5} />
    </group>
  );
}
