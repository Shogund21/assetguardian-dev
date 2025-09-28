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

const ensureData = (props: Record<string, any>) => {
  if (props.data === undefined) props.data = {};
  return props;
};

export const G = React.forwardRef<any, any>(({ children, ...rest }, ref) => {
  const sp = ensureData(stripProps(rest));
  return <group ref={ref} {...sp}>{children}</group>;
});
G.displayName = 'G';

export const M = React.forwardRef<any, any>(({ children, ...rest }, ref) => {
  const sp = ensureData(stripProps(rest));
  return <mesh ref={ref} {...sp}>{children}</mesh>;
});
M.displayName = 'M';
export const StdMat: React.FC<any> = ({ children, ...rest }) => {
  const sp = ensureData(stripProps(rest));
  return <meshStandardMaterial {...sp}>{children}</meshStandardMaterial>;
};

export const BasicMat: React.FC<any> = ({ children, ...rest }) => {
  const sp = ensureData(stripProps(rest));
  return <meshBasicMaterial {...sp}>{children}</meshBasicMaterial>;
};

export const BoxGeom: React.FC<any> = ({ children, ...rest }) => {
  const sp = ensureData(stripProps(rest));
  return <boxGeometry {...sp}>{children}</boxGeometry>;
};

export const SphereGeom: React.FC<any> = ({ children, ...rest }) => {
  const sp = ensureData(stripProps(rest));
  return <sphereGeometry {...sp}>{children}</sphereGeometry>;
};

export const CylinderGeom: React.FC<any> = ({ children, ...rest }) => {
  const sp = ensureData(stripProps(rest));
  return <cylinderGeometry {...sp}>{children}</cylinderGeometry>;
};

export const TubeGeom: React.FC<any> = ({ children, ...rest }) => {
  const sp = ensureData(stripProps(rest));
  return <tubeGeometry {...sp}>{children}</tubeGeometry>;
};

// Lights (primitive elements)
export const ALight: React.FC<any> = ({ children, ...rest }) => {
  const sp = ensureData(stripProps(rest));
  return <ambientLight {...sp}>{children}</ambientLight>;
};

export const DLight: React.FC<any> = ({ children, ...rest }) => {
  const sp = ensureData(stripProps(rest));
  return <directionalLight {...sp}>{children}</directionalLight>;
};

// Drei wrappers (forward refs when needed)
export const PCam = React.forwardRef<any, any>(({ children, ...rest }, ref) => {
  const sp = ensureData(stripProps(rest));
  return (
    <DreiPerspectiveCamera ref={ref} {...sp}>
      {children}
    </DreiPerspectiveCamera>
  );
});
PCam.displayName = 'PCam';

export const Controls = React.forwardRef<any, any>(({ children, ...rest }, ref) => {
  const sp = ensureData(stripProps(rest));
  return (
    <DreiOrbitControls ref={ref} {...sp}>
      {children}
    </DreiOrbitControls>
  );
});
Controls.displayName = 'Controls';

export const Env: React.FC<any> = ({ children, ...rest }) => {
  const sp = ensureData(stripProps(rest));
  return <DreiEnvironment {...sp}>{children}</DreiEnvironment>;
};

export const SafeGrid: React.FC<any> = ({ children, ...rest }) => {
  const sp = ensureData(stripProps(rest));
  return <DreiGrid {...sp}>{children}</DreiGrid>;
};
