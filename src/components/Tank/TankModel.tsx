import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group, Mesh, MeshStandardMaterial } from 'three';

interface TankModelProps {
  bodyColor: string;
  accentColor: string;
  trackColor?: string;
  emissiveColor?: string;
  emissiveIntensity?: number;
  isMoving?: boolean;
  isShielded?: boolean;
  level?: number; // 1-4, affects barrel/turret style
}

export function TankModel({
  bodyColor,
  accentColor,
  trackColor = '#1A1A1A',
  emissiveColor,
  emissiveIntensity = 0.3,
  isMoving = false,
  isShielded = false,
  level = 1,
}: TankModelProps) {
  const exhaustRef = useRef<Mesh>(null);
  const shieldRef = useRef<Mesh>(null);
  const trackLRef = useRef<Group>(null);
  const trackRRef = useRef<Group>(null);

  // Barrel length based on level
  const barrelLength = useMemo(() => 0.3 + level * 0.05, [level]);
  const hasDualBarrel = level >= 3;

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Exhaust glow pulse
    if (exhaustRef.current) {
      const mat = exhaustRef.current.material as MeshStandardMaterial;
      mat.emissiveIntensity = isMoving ? 1.5 + Math.sin(t * 20) * 0.5 : 0.3;
    }

    // Shield animation
    if (shieldRef.current && isShielded) {
      shieldRef.current.rotation.y = t * 2;
      const mat = shieldRef.current.material as MeshStandardMaterial;
      mat.opacity = 0.15 + Math.sin(t * 8) * 0.1;
    }

    // Track animation when moving
    if (isMoving) {
      if (trackLRef.current) {
        trackLRef.current.children.forEach((child, i) => {
          child.position.z = ((t * 5 + i * 0.18) % 0.9) - 0.45;
        });
      }
      if (trackRRef.current) {
        trackRRef.current.children.forEach((child, i) => {
          child.position.z = ((t * 5 + i * 0.18) % 0.9) - 0.45;
        });
      }
    }
  });

  return (
    <group>
      {/* === HULL (main body) === */}
      {/* Lower hull - wide base */}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.75, 0.12, 0.85]} />
        <meshStandardMaterial
          color={bodyColor}
          metalness={0.6}
          roughness={0.35}
        />
      </mesh>

      {/* Upper hull - tapered */}
      <mesh position={[0, 0.16, 0.02]}>
        <boxGeometry args={[0.6, 0.1, 0.7]} />
        <meshStandardMaterial
          color={bodyColor}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Hull accent stripe */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.76, 0.02, 0.86]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={emissiveColor || accentColor}
          emissiveIntensity={emissiveIntensity}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Front armor plate (angled) */}
      <mesh position={[0, 0.1, 0.42]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.65, 0.08, 0.1]} />
        <meshStandardMaterial
          color={accentColor}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* === TURRET === */}
      {/* Turret base (octagonal feel) */}
      <mesh position={[0, 0.26, -0.02]}>
        <cylinderGeometry args={[0.22, 0.26, 0.1, 8]} />
        <meshStandardMaterial
          color={bodyColor}
          metalness={0.7}
          roughness={0.25}
        />
      </mesh>

      {/* Turret top dome */}
      <mesh position={[0, 0.32, -0.02]}>
        <sphereGeometry args={[0.18, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color={accentColor}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Turret ring glow */}
      <mesh position={[0, 0.22, -0.02]}>
        <cylinderGeometry args={[0.27, 0.27, 0.02, 16]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={emissiveColor || accentColor}
          emissiveIntensity={emissiveIntensity * 2}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* === BARREL(S) === */}
      {hasDualBarrel ? (
        <>
          {/* Dual barrel - left */}
          <mesh position={[-0.07, 0.27, barrelLength / 2 + 0.15]}>
            <cylinderGeometry args={[0.035, 0.04, barrelLength, 8]} />
            <meshStandardMaterial color="#2A2A2A" metalness={0.9} roughness={0.15} />
          </mesh>
          <mesh position={[-0.07, 0.27, barrelLength + 0.15]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.035, 0.04, barrelLength, 8]} />
            <meshStandardMaterial color="#2A2A2A" metalness={0.9} roughness={0.15} />
          </mesh>
          {/* Dual barrel - right */}
          <mesh position={[0.07, 0.27, barrelLength / 2 + 0.15]}>
            <cylinderGeometry args={[0.035, 0.04, barrelLength, 8]} />
            <meshStandardMaterial color="#2A2A2A" metalness={0.9} roughness={0.15} />
          </mesh>
          <mesh position={[0.07, 0.27, barrelLength + 0.15]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.035, 0.04, barrelLength, 8]} />
            <meshStandardMaterial color="#2A2A2A" metalness={0.9} roughness={0.15} />
          </mesh>
          {/* Muzzle brake */}
          <mesh position={[-0.07, 0.27, barrelLength + 0.18]}>
            <cylinderGeometry args={[0.05, 0.04, 0.04, 8]} />
            <meshStandardMaterial color={accentColor} metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0.07, 0.27, barrelLength + 0.18]}>
            <cylinderGeometry args={[0.05, 0.04, 0.04, 8]} />
            <meshStandardMaterial color={accentColor} metalness={0.9} roughness={0.1} />
          </mesh>
        </>
      ) : (
        <>
          {/* Single barrel */}
          <mesh position={[0, 0.27, barrelLength / 2 + 0.15]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.05, barrelLength, 8]} />
            <meshStandardMaterial color="#2A2A2A" metalness={0.9} roughness={0.15} />
          </mesh>
          {/* Muzzle brake */}
          <mesh position={[0, 0.27, barrelLength + 0.18]}>
            <cylinderGeometry args={[0.06, 0.05, 0.05, 8]} />
            <meshStandardMaterial color={accentColor} metalness={0.9} roughness={0.1} />
          </mesh>
        </>
      )}

      {/* === TRACKS === */}
      {/* Left track housing */}
      <mesh position={[-0.38, 0.07, 0]}>
        <boxGeometry args={[0.12, 0.16, 0.92]} />
        <meshStandardMaterial color={trackColor} metalness={0.4} roughness={0.7} />
      </mesh>
      {/* Left track top guard */}
      <mesh position={[-0.38, 0.16, 0]}>
        <boxGeometry args={[0.14, 0.02, 0.94]} />
        <meshStandardMaterial color={bodyColor} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Left track treads */}
      <group ref={trackLRef}>
        {[...Array(6)].map((_, i) => (
          <mesh key={`tl${i}`} position={[-0.38, 0.07, -0.45 + i * 0.18]}>
            <boxGeometry args={[0.13, 0.17, 0.03]} />
            <meshStandardMaterial color="#333" metalness={0.5} roughness={0.6} />
          </mesh>
        ))}
      </group>

      {/* Right track housing */}
      <mesh position={[0.38, 0.07, 0]}>
        <boxGeometry args={[0.12, 0.16, 0.92]} />
        <meshStandardMaterial color={trackColor} metalness={0.4} roughness={0.7} />
      </mesh>
      {/* Right track top guard */}
      <mesh position={[0.38, 0.16, 0]}>
        <boxGeometry args={[0.14, 0.02, 0.94]} />
        <meshStandardMaterial color={bodyColor} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Right track treads */}
      <group ref={trackRRef}>
        {[...Array(6)].map((_, i) => (
          <mesh key={`tr${i}`} position={[0.38, 0.07, -0.45 + i * 0.18]}>
            <boxGeometry args={[0.13, 0.17, 0.03]} />
            <meshStandardMaterial color="#333" metalness={0.5} roughness={0.6} />
          </mesh>
        ))}
      </group>

      {/* Wheels (visible between treads) */}
      {[-0.38, 0.38].map((xPos) => (
        [-0.35, 0, 0.35].map((zPos, i) => (
          <mesh key={`w${xPos}${i}`} position={[xPos, 0.07, zPos]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.06, 0.06, 0.05, 8]} />
            <meshStandardMaterial color="#444" metalness={0.6} roughness={0.4} />
          </mesh>
        ))
      ))}

      {/* === EXHAUST === */}
      <mesh ref={exhaustRef} position={[0, 0.12, -0.45]}>
        <cylinderGeometry args={[0.04, 0.05, 0.06, 8]} />
        <meshStandardMaterial
          color="#333"
          emissive="#FF4400"
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* === DETAILS === */}
      {/* Antenna */}
      <mesh position={[-0.15, 0.4, -0.1]}>
        <cylinderGeometry args={[0.008, 0.005, 0.2, 4]} />
        <meshStandardMaterial color="#555" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Antenna tip */}
      <mesh position={[-0.15, 0.5, -0.1]}>
        <sphereGeometry args={[0.015, 6, 6]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={emissiveColor || accentColor}
          emissiveIntensity={1}
        />
      </mesh>

      {/* Side armor panels */}
      <mesh position={[-0.3, 0.12, 0.15]}>
        <boxGeometry args={[0.04, 0.08, 0.2]} />
        <meshStandardMaterial color={accentColor} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.3, 0.12, 0.15]}>
        <boxGeometry args={[0.04, 0.08, 0.2]} />
        <meshStandardMaterial color={accentColor} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* === SHIELD EFFECT === */}
      {isShielded && (
        <mesh ref={shieldRef} position={[0, 0.2, 0]}>
          <octahedronGeometry args={[0.6, 1]} />
          <meshStandardMaterial
            color="#00DDFF"
            emissive="#00AAFF"
            emissiveIntensity={1}
            transparent
            opacity={0.2}
            wireframe
          />
        </mesh>
      )}
    </group>
  );
}
