import React from 'react';
import { Canvas } from '@react-three/fiber';

// Minimal test component to isolate the R3F issue
export const DigitalTwinTest: React.FC = () => {
  console.warn('[DigitalTwinTest] Rendering minimal R3F test...');

  return (
    <div className="h-full w-full bg-background rounded-lg overflow-hidden border">
      <Canvas className="h-full w-full">
        <ambientLight intensity={0.4} />
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      </Canvas>
    </div>
  );
};