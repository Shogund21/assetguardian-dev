import React, { ReactElement, ReactNode } from 'react';

// Safe sanitizer for React Three Fiber trees: remove any dashed props (e.g. data-*, aria-*)
export function sanitizeNode(node: ReactNode): ReactNode {
  if (Array.isArray(node)) return node.map(sanitizeNode);
  if (!React.isValidElement(node)) return node;

  const el = node as ReactElement<any>;
  const { children, ...rest } = el.props || {};
  const cleanedProps: Record<string, any> = {};

  for (const key in rest) {
    if (!Object.prototype.hasOwnProperty.call(rest, key)) continue;
    const lower = key.toLowerCase();
    // Remove all dashed props to avoid R3F applyProps nested path (e.g., data-lov-id -> obj.data.lov.id)
    if (lower.includes('-')) continue;
    cleanedProps[key] = rest[key];
  }

  const sanitizedChildren = sanitizeNode(children);
  return React.cloneElement(el, cleanedProps, sanitizedChildren);
}

export const Sanitize3D: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <>{sanitizeNode(children)}</>;
};

export default Sanitize3D;
