import React, { ReactElement, ReactNode } from 'react';

export function sanitizeNode(node: ReactNode): ReactNode {
  if (Array.isArray(node)) {
    return node.map(sanitizeNode);
  }
  if (React.isValidElement(node)) {
    const el = node as ReactElement<any>;
    const { children, ...rest } = el.props || {};
    const cleanedProps: Record<string, any> = {};
    for (const key in rest) {
      if (Object.prototype.hasOwnProperty.call(rest, key)) {
        // Drop any dashed props (e.g., data-lov-id) and explicit data-* props
        if (!key.startsWith('data-') && !key.includes('-')) cleanedProps[key] = rest[key];
      }
    }
    const sanitizedChildren = sanitizeNode(children);
    return React.cloneElement(el, cleanedProps, sanitizedChildren);
  }
  return node;
}

export const Sanitize3D: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <>{sanitizeNode(children)}</>;
};

export default Sanitize3D;
