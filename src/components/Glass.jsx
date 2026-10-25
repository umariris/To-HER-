import React from 'react';

/**
 * Glass panel component — premium frosted glass with gradients, 
 * refraction edge glow, and transparency.
 * Use `blur` prop to enable real backdrop-filter (only for password card).
 */
export default function Glass({
  children,
  blur = false,
  glow = false,
  className = '',
  style = {},
  ...props
}) {
  return (
    <div
      className={`glass ${blur ? 'glass--blur' : ''} ${glow ? 'glow-breathe' : ''} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}
