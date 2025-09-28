import React from 'react';

// Utility to strip any dashed or data-* props that confuse R3F applyProps
const stripProps = (props: Record<string, any>) => {
  const cleaned: Record<string, any> = {};
  for (const key in props) {
    if (!Object.prototype.hasOwnProperty.call(props, key)) continue;
    if (key === 'children') continue;
    const lower = key.toLowerCase();
    if (lower.includes('-') || lower.startsWith('data-')) continue;
    cleaned[key] = props[key];
  }
  return cleaned;
};

export const G: React.FC<any> = ({ children, ...rest }) => (
  <group {...stripProps(rest)}>{children}</group>
);

export const M: React.FC<any> = ({ children, ...rest }) => (
  <mesh {...stripProps(rest)}>{children}</mesh>
);

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
