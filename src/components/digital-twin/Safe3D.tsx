import React from 'react';
import { OrbitControls as DreiOrbitControls, Environment as DreiEnvironment, Grid as DreiGrid, PerspectiveCamera as DreiPerspectiveCamera } from '@react-three/drei';

// Utility to strip any dashed or data-* props that confuse R3F applyProps
const stripProps = (props: Record<string, any>) => {
  const cleaned: Record<string, any> = {};
  const removed: string[] = [];
  for (const key in props) {
    if (!Object.prototype.hasOwnProperty.call(props, key)) continue;
    if (key === 'children') continue;
    const lower = key.toLowerCase();
    if (lower.includes('-') || lower.startsWith('data') || lower.startsWith('aria')) {
      removed.push(key);
      continue;
    }
    cleaned[key] = props[key];
  }
  if (removed.length) {
    console.warn('[Safe3D] STRIPPED props:', removed, 'from component props');
  }
  return cleaned;
};

export const G = React.forwardRef<any, any>(({ children, ...rest }, ref) => (
  <group ref={ref} {...stripProps(rest)}>{children}</group>
));
G.displayName = 'G';

export const M = React.forwardRef<any, any>(({ children, ...rest }, ref) => (
  <mesh ref={ref} {...stripProps(rest)}>{children}</mesh>
));
M.displayName = 'M';
export const StdMat: React.FC<any> = ({ children, ...rest }) => (
  <meshStandardMaterial {...stripProps(rest)}>{children}</meshStandardMaterial>
);

export const BasicMat: React.FC<any> = ({ children, ...rest }) => (
  <meshBasicMaterial {...stripProps(rest)}>{children}</meshBasicMaterial>
);

export const BoxGeom: React.FC<any> = ({ children, ...rest }) => (
  <boxGeometry {...stripProps(rest)}>{children}</boxGeometry>
);

export const SphereGeom: React.FC<any> = ({ children, ...rest }) => (
  <sphereGeometry {...stripProps(rest)}>{children}</sphereGeometry>
);

export const CylinderGeom: React.FC<any> = ({ children, ...rest }) => (
  <cylinderGeometry {...stripProps(rest)}>{children}</cylinderGeometry>
);

export const TubeGeom: React.FC<any> = ({ children, ...rest }) => (
  <tubeGeometry {...stripProps(rest)}>{children}</tubeGeometry>
);

// Lights (primitive elements)
export const ALight: React.FC<any> = ({ children, ...rest }) => (
  <ambientLight {...stripProps(rest)}>{children}</ambientLight>
);

export const DLight: React.FC<any> = ({ children, ...rest }) => (
  <directionalLight {...stripProps(rest)}>{children}</directionalLight>
);

// Drei wrappers (forward refs when needed)
export const PCam = React.forwardRef<any, any>(({ children, ...rest }, ref) => (
  <DreiPerspectiveCamera ref={ref} {...stripProps(rest)}>
    {children}
  </DreiPerspectiveCamera>
));
PCam.displayName = 'PCam';

export const Controls = React.forwardRef<any, any>(({ children, ...rest }, ref) => (
  <DreiOrbitControls ref={ref} {...stripProps(rest)}>
    {children}
  </DreiOrbitControls>
));
Controls.displayName = 'Controls';

export const Env: React.FC<any> = ({ children, ...rest }) => (
  <DreiEnvironment {...stripProps(rest)}>{children}</DreiEnvironment>
);

export const SafeGrid: React.FC<any> = ({ children, ...rest }) => (
  <DreiGrid {...stripProps(rest)}>{children}</DreiGrid>
);
