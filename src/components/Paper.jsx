import React from 'react';

/**
 * Reusable vintage paper component with aged blotches, noise tile,
 * deckled edge and fold creases — pure CSS, no animated filters.
 * When deckled=true, an outer container provides layered drop-shadows
 * so the rough, deckled edges cast physically realistic shadows.
 */
export default function Paper({
  children,
  className = '',
  deckled = false,
  style = {},
  ...props
}) {
  if (deckled) {
    const { margin, position, top, left, right, bottom, zIndex, transform, width, maxWidth, minWidth, height, maxHeight, minHeight, flex, ...innerStyle } = style;
    const outerStyle = {
      margin,
      position,
      top,
      left,
      right,
      bottom,
      zIndex,
      transform,
      width,
      maxWidth,
      minWidth,
      height,
      maxHeight,
      minHeight,
      filter: 'drop-shadow(0 0 1px rgba(255, 255, 255, 0.9)) drop-shadow(0 12px 28px rgba(15, 27, 61, 0.26))',
    };

    return (
      <div className={`paper-deckled-wrap ${className}`} style={outerStyle}>
        <div
          className="paper paper-deckled"
          style={{ width: '100%', height: '100%', ...innerStyle }}
          {...props}
        >
          <div className="paper-folds" />
          {/* Content sits above the pseudo-element overlays (z-index >= 4) */}
          <div style={{ position: 'relative', zIndex: 4, height: '100%' }}>
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`paper ${className}`}
      style={style}
      {...props}
    >
      <div className="paper-folds" />
      {/* Content sits above the pseudo-element overlays (z-index >= 4) */}
      <div style={{ position: 'relative', zIndex: 4, height: '100%' }}>
        {children}
      </div>
    </div>
  );
}

