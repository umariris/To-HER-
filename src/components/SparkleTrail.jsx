import { useEffect, useRef } from 'react';
import { useIsDesktop } from '../hooks/useIsDesktop';

/**
 * SparkleTrail — enhanced cursor sparkle trail & click burst engine.
 * Renders up to 55 sparkle particles with multiple blue/cyan/white shades,
 * 4-point star shapes, and responsive burst physics on click.
 */
const SPARKLE_COLORS = [
  [110, 155, 255],   // cornflower
  [159, 227, 245],   // powder-cyan
  [169, 184, 255],   // periwinkle
  [214, 236, 255],   // ice
  [255, 255, 255],   // pure white
  [90, 141, 254],    // bright azure
];

export default function SparkleTrail() {
  const isDesktop = useIsDesktop();
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const mouse = useRef({ x: -100, y: -100 });
  const prevMouse = useRef({ x: -100, y: -100 });
  const raf = useRef(null);

  useEffect(() => {
    if (!isDesktop) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let dpr = window.devicePixelRatio || 1;

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Dynamic trail on cursor movement
    const onMove = (e) => {
      prevMouse.current.x = mouse.current.x;
      prevMouse.current.y = mouse.current.y;
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;

      const dx = mouse.current.x - prevMouse.current.x;
      const dy = mouse.current.y - prevMouse.current.y;
      const speed = Math.sqrt(dx * dx + dy * dy);
      const spawnCount = Math.min(3, Math.max(1, Math.floor(speed / 7)));

      for (let s = 0; s < spawnCount; s++) {
        if (particles.current.length < 55) {
          const color = SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)];
          const isStar = Math.random() > 0.45;
          particles.current.push({
            x: e.clientX + (Math.random() - 0.5) * 8,
            y: e.clientY + (Math.random() - 0.5) * 8,
            size: Math.random() * 5 + 2,
            life: 1,
            decay: 0.016 + Math.random() * 0.012,
            vx: (Math.random() - 0.5) * 2.2,
            vy: (Math.random() - 0.5) * 2.2 - 0.7,
            color,
            isStar,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.1,
          });
        }
      }
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    // Star burst on pointer click across the whole website
    const onPointerDown = (e) => {
      const burstCount = 12;
      for (let i = 0; i < burstCount; i++) {
        const angle = (i / burstCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        const speed = 2.4 + Math.random() * 3.6;
        const color = SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)];
        particles.current.push({
          x: e.clientX,
          y: e.clientY,
          size: Math.random() * 6 + 3,
          life: 1,
          decay: 0.018 + Math.random() * 0.015,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.4,
          color,
          isStar: Math.random() > 0.35,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.2,
        });
      }
    };
    window.addEventListener('pointerdown', onPointerDown, { passive: true });

    const drawStar = (ctx, x, y, r, rot) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
      }
      ctx.stroke();
      ctx.restore();
    };

    const animate = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.current = particles.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.012; // gentle upward drift
        p.life -= p.decay;
        p.rotation += p.rotSpeed;
        if (p.life <= 0) return false;

        const alpha = p.life * 0.85;
        const [r, g, b] = p.color;
        const size = p.size * p.life;

        if (p.isStar) {
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.lineWidth = 1.4;
          drawStar(ctx, p.x, p.y, size * 1.3, p.rotation);
        } else {
          // Glow halo
          ctx.beginPath();
          ctx.arc(p.x, p.y, size * 1.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.2})`;
          ctx.fill();

          // Core circle
          ctx.beginPath();
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.fill();
        }
        return true;
      });
      raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('pointerdown', onPointerDown);
      cancelAnimationFrame(raf.current);
    };
  }, [isDesktop]);

  if (!isDesktop) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9998,
      }}
    />
  );
}
