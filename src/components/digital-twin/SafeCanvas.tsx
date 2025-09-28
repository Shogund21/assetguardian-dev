import React, { ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';

// Component that strips ALL non-essential props before they reach R3F Canvas
const SafeCanvas: React.FC<{
  children: ReactNode;
  shadows?: boolean;
  className?: string;
  gl?: any;
  dpr?: number[];
}> = ({ children, shadows, className, gl, dpr }) => {
  // Only pass through known, safe props to Canvas
  const safeProps: any = {};
  if (shadows !== undefined) safeProps.shadows = shadows;
  if (className !== undefined) safeProps.className = className;
  if (gl !== undefined) safeProps.gl = gl;
  if (dpr !== undefined) safeProps.dpr = dpr;

  console.warn('[SafeCanvas] Rendering with safe props only:', Object.keys(safeProps));

  return (
    <Canvas {...safeProps}>
      {children}
    </Canvas>
  );
};

export default SafeCanvas;