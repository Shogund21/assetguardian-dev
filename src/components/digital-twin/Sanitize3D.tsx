import React, { ReactElement, ReactNode } from 'react';

// Safe sanitizer for React Three Fiber trees: remove any dashed props (e.g. data-*, aria-*)
export function sanitizeNode(node: ReactNode): ReactNode {
  if (Array.isArray(node)) return node.map(sanitizeNode);
  if (!React.isValidElement(node)) return node;

  const el = node as ReactElement<any>;
  const { children, ...rest } = el.props || {};
  const cleanedProps: Record<string, any> = {};
  const removedKeys: string[] = [];

  for (const key in rest) {
    if (!Object.prototype.hasOwnProperty.call(rest, key)) continue;
    const lower = key.toLowerCase();
    // Remove all dashed and accessibility/data props to avoid R3F applyProps nested paths
    if (lower.includes('-') || lower.startsWith('data') || lower.startsWith('aria')) {
      removedKeys.push(key);
      continue;
    }
    cleanedProps[key] = rest[key];
  }

  if (removedKeys.length) {
    try {
      const typeName = typeof el.type === 'string' ? el.type : (el.type as any)?.displayName || (el.type as any)?.name || 'unknown';
      // Log which keys we removed to track the source
      console.warn('[Sanitize3D] REMOVED dashed props from', typeName, ':', removedKeys);
      console.warn('[Sanitize3D] Original props were:', Object.keys(rest));
      console.warn('[Sanitize3D] Cleaned props are:', Object.keys(cleanedProps));
    } catch {}
  }

  const sanitizedChildren = sanitizeNode(children);
  return React.cloneElement(el, cleanedProps, sanitizedChildren);
}

export const Sanitize3D: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <>{sanitizeNode(children)}</>;
};

export default Sanitize3D;
