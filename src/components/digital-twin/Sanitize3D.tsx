import React, { ReactNode } from 'react';

// Simplified sanitization that doesn't interfere with Three.js properties
export function sanitizeNode(node: ReactNode): ReactNode {
  return node;
}

export const Sanitize3D: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export default Sanitize3D;
