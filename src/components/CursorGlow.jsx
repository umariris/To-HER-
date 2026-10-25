import React, { useEffect, useRef } from 'react';
import { useIsDesktop } from '../hooks/useIsDesktop';

/**
 * CursorGlow — Whole-web cursor-sensitive animation engine.
 * 1. Drives global CSS cursor variables (--mouse-norm-x, --mouse-norm-y, etc.)
 * 2. Provides ambient radial glow follower with magnetic expansion on interactive items
 * 3. Fairy pointer ring and pinpoint with smooth physics
 * 4. Dynamic 3D tilt engine on hover for all cards, papers, and interactive surfaces
 */
export default function CursorGlow() {
  const isDesktop = useIsDesktop();
  const glowRef = useRef(null);
  const ringRef = useRef(null);
  const dotRef = useRef(null);
  const rafRef = useRef(null);

  // Position references (avoid React state re-renders for 60fps smoothness)
  const posRef = useRef({ x: -200, y: -200 });
  const ringPosRef = useRef({ x: -200, y: -200 });
  const targetRef = useRef({ x: -200, y: -200 });
  const isHoveringRef = useRef(false);
  const isClickingRef = useRef(false);

  useEffect(() => {
    if (!isDesktop) return;

    const root = document.documentElement;
    let hoveredCard = null;

    const onMove = (e) => {
      targetRef.current.x = e.clientX;
      targetRef.current.y = e.clientY;

      // Check if hovering interactive target
      const target = e.target;
      const isInteractive = target && target.closest('button, a, input, textarea, [role="button"], .cursor-pointer');
      isHoveringRef.current = !!isInteractive;

      // Dynamic 3D tilt calculation for modal cards (never on scrollable paper)
      const card = target ? target.closest('.glass--tilt, .intro__card') : null;
      if (card) {
        if (hoveredCard && hoveredCard !== card) {
          hoveredCard.style.removeProperty('--card-tilt-x');
          hoveredCard.style.removeProperty('--card-tilt-y');
          hoveredCard.style.removeProperty('--card-mouse-x');
          hoveredCard.style.removeProperty('--card-mouse-y');
        }
        hoveredCard = card;
        const rect = card.getBoundingClientRect();
        const cardX = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
        const cardY = (e.clientY - rect.top) / rect.height - 0.5;
        const tiltX = cardY * -12; // deg
        const tiltY = cardX * 12;  // deg
        card.style.setProperty('--card-tilt-x', `${tiltX.toFixed(2)}deg`);
        card.style.setProperty('--card-tilt-y', `${tiltY.toFixed(2)}deg`);
        card.style.setProperty('--card-mouse-x', `${((cardX + 0.5) * 100).toFixed(1)}%`);
        card.style.setProperty('--card-mouse-y', `${((cardY + 0.5) * 100).toFixed(1)}%`);
      } else if (hoveredCard) {
        hoveredCard.style.removeProperty('--card-tilt-x');
        hoveredCard.style.removeProperty('--card-tilt-y');
        hoveredCard.style.removeProperty('--card-mouse-x');
        hoveredCard.style.removeProperty('--card-mouse-y');
        hoveredCard = null;
      }
    };

    const onDown = () => {
      isClickingRef.current = true;
    };

    const onUp = () => {
      isClickingRef.current = false;
    };

    const onLeave = () => {
      targetRef.current.x = -200;
      targetRef.current.y = -200;
      isHoveringRef.current = false;
      if (hoveredCard) {
        hoveredCard.style.removeProperty('--card-tilt-x');
        hoveredCard.style.removeProperty('--card-tilt-y');
        hoveredCard.style.removeProperty('--card-mouse-x');
        hoveredCard.style.removeProperty('--card-mouse-y');
        hoveredCard = null;
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    document.addEventListener('mouseleave', onLeave, { passive: true });

    // 60fps RAF lerp loop
    const animate = () => {
      // Glow follows with soft smooth lerp
      const glowLerp = 0.08;
      posRef.current.x += (targetRef.current.x - posRef.current.x) * glowLerp;
      posRef.current.y += (targetRef.current.y - posRef.current.y) * glowLerp;

      // Fairy ring follows with responsive spring lerp
      const ringLerp = 0.22;
      ringPosRef.current.x += (targetRef.current.x - ringPosRef.current.x) * ringLerp;
      ringPosRef.current.y += (targetRef.current.y - ringPosRef.current.y) * ringLerp;

      // Update global CSS variables for all scenes and components
      const normX = (targetRef.current.x / window.innerWidth - 0.5) * 2; // -1 to +1
      const normY = (targetRef.current.y / window.innerHeight - 0.5) * 2; // -1 to +1
      root.style.setProperty('--mouse-norm-x', normX.toFixed(3));
      root.style.setProperty('--mouse-norm-y', normY.toFixed(3));
      root.style.setProperty('--mouse-px-x', `${targetRef.current.x}px`);
      root.style.setProperty('--mouse-px-y', `${targetRef.current.y}px`);

      if (glowRef.current) {
        const glowScale = isHoveringRef.current ? 1.35 : 1;
        glowRef.current.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0) translate(-50%, -50%) scale(${glowScale})`;
      }

      if (ringRef.current) {
        const ringScale = isHoveringRef.current ? 1.55 : isClickingRef.current ? 0.75 : 1;
        ringRef.current.style.transform = `translate3d(${ringPosRef.current.x}px, ${ringPosRef.current.y}px, 0) translate(-50%, -50%) scale(${ringScale})`;
        ringRef.current.style.borderColor = isHoveringRef.current ? 'rgba(110, 155, 255, 0.95)' : 'rgba(159, 227, 245, 0.7)';
        ringRef.current.style.backgroundColor = isHoveringRef.current ? 'rgba(110, 155, 255, 0.1)' : 'transparent';
      }

      if (dotRef.current) {
        const dotScale = isClickingRef.current ? 0.5 : 1;
        dotRef.current.style.transform = `translate3d(${targetRef.current.x}px, ${targetRef.current.y}px, 0) translate(-50%, -50%) scale(${dotScale})`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(rafRef.current);
      if (hoveredCard) {
        hoveredCard.style.removeProperty('--card-tilt-x');
        hoveredCard.style.removeProperty('--card-tilt-y');
      }
    };
  }, [isDesktop]);

  if (!isDesktop) return null;

  return (
    <>
      {/* ── Ambient Radial Glow Follower ── */}
      <div
        ref={glowRef}
        className="cursor-glow"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(110, 155, 255, 0.18) 0%, rgba(159, 227, 245, 0.08) 45%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 9996,
          willChange: 'transform',
          mixBlendMode: 'screen',
        }}
      />

      {/* ── Floating Fairy Ring ── */}
      <div
        ref={ringRef}
        className="cursor-fairy-ring"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          border: '1.5px solid rgba(159, 227, 245, 0.7)',
          pointerEvents: 'none',
          zIndex: 9997,
          willChange: 'transform, border-color, background-color',
          transition: 'width 0.2s, height 0.2s, border-color 0.2s, background-color 0.2s',
          boxShadow: '0 0 12px rgba(110, 155, 255, 0.25)',
        }}
      />

      {/* ── Precision Fairy Dot ── */}
      <div
        ref={dotRef}
        className="cursor-fairy-dot"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #FFFFFF, var(--cornflower))',
          pointerEvents: 'none',
          zIndex: 9998,
          boxShadow: '0 0 8px rgba(110, 155, 255, 0.9), 0 0 16px rgba(255, 255, 255, 0.8)',
          willChange: 'transform',
        }}
      />
    </>
  );
}
