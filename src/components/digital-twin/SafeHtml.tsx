import React from 'react';
import { Html } from '@react-three/drei';

// Strip any data-* attributes that can break R3F nested prop application
// by introducing dashed props (e.g., data-lov-id)

type HtmlProps = React.ComponentProps<typeof Html>;

export function SafeHtml(props: HtmlProps) {
  const { children, ...rest } = props as any;
  const safe: Record<string, any> = {};
  for (const key in rest) {
    if (Object.prototype.hasOwnProperty.call(rest, key)) {
      if (!key.startsWith('data-')) {
        safe[key] = (rest as any)[key];
      }
    }
  }
  return React.createElement(Html as any, safe, children);
}

export default SafeHtml;
