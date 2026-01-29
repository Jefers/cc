import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleFieldProps {
  count?: number;
  mousePosition: React.MutableRefObject<{ x: number; y: number }>;
}

const ParticleField = ({ count = 150, mousePosition }: ParticleFieldProps) => {
  const meshRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

      velocities[i * 3] = (Math.random() - 0.5) * 0.01;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.005;
    }

    return { positions, velocities };
  }, [count]);

  const lineGeometry = useMemo(() => {
    return new THREE.BufferGeometry();
  }, []);

  const pointsGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(particles.positions, 3));
    return geometry;
  }, [particles.positions]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Update positions with velocity
      positions[i3] += particles.velocities[i3];
      positions[i3 + 1] += particles.velocities[i3 + 1];
      positions[i3 + 2] += particles.velocities[i3 + 2];

      // Mouse interaction
      const mouseX = mousePosition.current.x * 10;
      const mouseY = mousePosition.current.y * 10;
      const dx = positions[i3] - mouseX;
      const dy = positions[i3 + 1] - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 2) {
        const force = (2 - dist) * 0.02;
        positions[i3] += dx * force;
        positions[i3 + 1] += dy * force;
      }

      // Boundary check
      if (Math.abs(positions[i3]) > 10) particles.velocities[i3] *= -1;
      if (Math.abs(positions[i3 + 1]) > 10) particles.velocities[i3 + 1] *= -1;
      if (Math.abs(positions[i3 + 2]) > 5) particles.velocities[i3 + 2] *= -1;

      // Gentle floating motion
      positions[i3 + 1] += Math.sin(time * 0.5 + i * 0.1) * 0.002;
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true;

    // Update connecting lines
    if (linesRef.current) {
      const linePositions: number[] = [];
      const maxDistance = 2.5;
      const maxConnections = 3;

      for (let i = 0; i < count; i++) {
        let connections = 0;
        for (let j = i + 1; j < count && connections < maxConnections; j++) {
          const dx = positions[i * 3] - positions[j * 3];
          const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
          const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < maxDistance) {
            linePositions.push(
              positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
              positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
            );
            connections++;
          }
        }
      }

      lineGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(linePositions, 3)
      );
    }
  });

  return (
    <>
      <points ref={meshRef} geometry={pointsGeometry}>
        <pointsMaterial
          size={0.05}
          color="#F1FF00"
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>
      <lineSegments ref={linesRef} geometry={lineGeometry}>
        <lineBasicMaterial color="#F1FF00" transparent opacity={0.15} />
      </lineSegments>
    </>
  );
};

const ParticleBackground = () => {
  const mousePosition = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: 'linear-gradient(180deg, #0D0D0D 0%, #1A1A1A 50%, #0D0D0D 100%)' }}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 75 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <ParticleField count={120} mousePosition={mousePosition} />
      </Canvas>
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark/50 via-transparent to-dark/80 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#0D0D0D_70%)] pointer-events-none" />
    </div>
  );
};

export default ParticleBackground;
