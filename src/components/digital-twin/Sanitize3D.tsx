import React, { ReactElement, ReactNode } from 'react';

// Minimal, safe sanitizer for R3F: strips editor-only props without touching others
export function sanitizeNode(node: ReactNode): ReactNode {
  if (Array.isArray(node)) return node.map(sanitizeNode);
  if (!React.isValidElement(node)) return node;

  const el = node as ReactElement<any>;
  const { children, ...rest } = el.props || {};
  const cleanedProps: Record<string, any> = {};
  for (const key in rest) {
    if (!Object.prototype.hasOwnProperty.call(rest, key)) continue;
    const lower = key.toLowerCase();
    // Drop editor/runtime tracking props only
    if (lower.startsWith('data-') || lower.includes('lov')) continue;
    cleanedProps[key] = rest[key];
  }
  const sanitizedChildren = sanitizeNode(children);
  return React.cloneElement(el, cleanedProps, sanitizedChildren);
}

export const Sanitize3D: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <>{sanitizeNode(children)}</>;
};

export default Sanitize3D;
