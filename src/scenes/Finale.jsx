import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import Paper from '../components/Paper';
import Pomeranian from '../components/Pomeranian';
import { finale, easterEgg } from '../content';
import { useIsDesktop } from '../hooks/useIsDesktop';

export default function Finale({ onComplete, goToScene }) {
  const isDesktop = useIsDesktop();
  const [moonTaps, setMoonTaps] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const confettiFiredRef = useRef(false);
  const starfieldRef = useRef(null);

  // Confetti burst on arrival (max 120 pieces, DESIGN colors only)
  useEffect(() => {
    if (confettiFiredRef.current) return;
    confettiFiredRef.current = true;

    const timer = setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
        colors: [
          '#EAF4FF',
          '#D6ECFF',
          '#BFDFFF',
          '#9FE3F5',
          '#A9B8FF',
          '#6E9BFF',
          '#3D6FD8',
          '#FFFFFF',
        ],
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Direct GPU transform cursor parallax (no React re-renders)
  useEffect(() => {
    if (!isDesktop) return;
    const handler = (e) => {
      if (!starfieldRef.current) return;
      const offX = (e.clientX / window.innerWidth - 0.5) * -15;
      const offY = (e.clientY / window.innerHeight - 0.5) * -10;
      starfieldRef.current.style.transform = `translate3d(${offX}px, ${offY}px, 0)`;
    };
    window.addEventListener('mousemove', handler, { passive: true });
    return () => window.removeEventListener('mousemove', handler);
  }, [isDesktop]);

  // Twinkling stars (36 on desktop, 16 on mobile for 60fps butter smoothness)
  const starCount = isDesktop ? 36 : 16;
  const stars = useMemo(() => {
    return Array.from({ length: starCount }).map((_, i) => ({
      id: i,
      top: `${(i * 19) % 95}%`,
      left: `${(i * 27) % 96}%`,
      size: (i % 3) + 2,
      delay: (i * 0.3) % 3,
      duration: 2 + (i % 4) * 0.7,
      brightness: 0.6 + (i % 5) * 0.1,
    }));
  }, [starCount]);

  // Shooting star data (pre-computed)
  const shootingStars = useMemo(() => [
    { delay: '3s', top: '15%', duration: '2.5s' },
    { delay: '8s', top: '35%', duration: '2s' },
    { delay: '15s', top: '22%', duration: '3s' },
  ], []);

  const handleMoonClick = () => {
    const next = moonTaps + 1;
    setMoonTaps(next);
    if (next >= 5) {
      setShowEasterEgg(true);
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.35, x: isDesktop ? 0.9 : 0.8 },
        colors: ['#FFFFFF', '#D6ECFF', '#9FE3F5', '#6E9BFF', '#FFD875'],
      });
    }
  };

  const handleOpenMakingOf = () => {
    if (goToScene) {
      goToScene('MakingOf');
    } else if (onComplete) {
      onComplete();
    }
  };

  // Separate paragraphs from last line
  const finaleParts = useMemo(() => {
    const lines = finale.split('\n\n');
    const lastLine = lines[lines.length - 1]; // "I love you, my sweetnugget."
    const paragraphs = lines.slice(0, lines.length - 1);
    return { paragraphs, lastLine };
  }, []);

  return (
    <div
      className="scene safe-area"
      style={{
        position: 'fixed',
        inset: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        background: 'linear-gradient(180deg, #050A18 0%, #0A1429 12%, #0F1B3D 28%, #162B5E 45%, #1B3878 58%, #20438E 70%, #2D5EB8 82%, #3D6FD8 92%, #6E9BFF 100%)',
        padding: isDesktop ? '40px 48px' : '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* ── TWINKLING STARS with cursor parallax ── */}
      <div
        ref={starfieldRef}
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1,
          willChange: 'transform',
        }}
      >
        {stars.map((s) => (
          <div
            key={s.id}
            style={{
              position: 'absolute',
              top: s.top,
              left: s.left,
              width: `${s.size}px`,
              height: `${s.size}px`,
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              boxShadow: `0 0 ${s.size * 3}px rgba(214, 236, 255, ${s.brightness}), 0 0 ${s.size * 6}px rgba(110, 155, 255, ${s.brightness * 0.4})`,
              animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* ── SHOOTING STARS ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 2, overflow: 'hidden' }}>
        {shootingStars.map((ss, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: ss.top,
              left: '-10%',
              width: '120px',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
              borderRadius: '1px',
              animation: `shooting-star ${ss.duration} ${ss.delay} linear infinite`,
              opacity: 0,
              transform: 'rotate(-15deg)',
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes twinkle {
          0% { opacity: 0.2; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes shooting-star {
          0% { transform: translateX(0) rotate(-15deg); opacity: 0; }
          5% { opacity: 1; }
          30% { opacity: 1; }
          50% { transform: translateX(110vw) rotate(-15deg); opacity: 0; }
          100% { transform: translateX(110vw) rotate(-15deg); opacity: 0; }
        }
      `}</style>

      {/* ── LUMINOUS MOON (Easter Egg: Tap 5 times) ── */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        onClick={handleMoonClick}
        className="moon-wrapper moon-breathe"
        style={{
          top: isDesktop ? '26px' : '18px',
          right: isDesktop ? '92px' : '72px',
          width: isDesktop ? '78px' : '62px',
          height: isDesktop ? '78px' : '62px',
        }}
        title="A glowing moon in the night sky... (try tapping it)"
        aria-label="The Moon"
      >
        <svg
          viewBox="-10 -10 120 120"
          width="100%"
          height="100%"
          style={{ overflow: 'visible', display: 'block' }}
        >
          <defs>
            <radialGradient id="moonAtmosphere" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#9FE3F5" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#3D6FD8" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="moonSurface" cx="38%" cy="35%" r="62%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="45%" stopColor="#F0F6FF" />
              <stop offset="78%" stopColor="#D2E5FA" />
              <stop offset="100%" stopColor="#A8CEF8" />
            </radialGradient>
          </defs>

          {/* Outer ethereal halo */}
          <circle cx="50" cy="50" r="54" fill="url(#moonAtmosphere)" />

          {/* Glowing Moon Sphere */}
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="url(#moonSurface)"
            stroke="rgba(255, 255, 255, 0.85)"
            strokeWidth="1"
          />

          {/* Delicate Moon Craters */}
          <circle cx="36" cy="38" r="7.5" fill="#BFD9F8" opacity="0.45" />
          <circle cx="38" cy="39" r="6" fill="#A8CDFA" opacity="0.3" />

          <circle cx="62" cy="54" r="9.5" fill="#BFD9F8" opacity="0.4" />
          <circle cx="63" cy="55" r="7.5" fill="#9EC5F6" opacity="0.25" />

          <circle cx="48" cy="68" r="5.5" fill="#BFD9F8" opacity="0.38" />
          <circle cx="68" cy="36" r="4" fill="#BFD9F8" opacity="0.35" />

          {/* Luminous limb crescent rim */}
          <path
            d="M 22 50 A 44 44 0 0 0 78 78 A 44 44 0 0 1 22 50"
            fill="rgba(255, 255, 255, 0.35)"
          />
        </svg>

        {/* Tap counter hint indicator */}
        {moonTaps > 0 && moonTaps < 5 && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            key={moonTaps}
            style={{
              position: 'absolute',
              bottom: '-22px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(5, 10, 24, 0.85)',
              border: '1px solid rgba(159, 227, 245, 0.5)',
              borderRadius: '10px',
              padding: '2px 8px',
              fontSize: '11px',
              fontWeight: 800,
              color: '#9FE3F5',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
              pointerEvents: 'none',
            }}
          >
            ✨ {moonTaps} / 5
          </motion.div>
        )}
      </motion.div>

      {/* ── ENHANCED EASTER EGG MODAL ── */}
      <AnimatePresence>
        {showEasterEgg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => {
              setShowEasterEgg(false);
              setMoonTaps(0);
            }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(5, 10, 24, 0.68)',
              backdropFilter: 'blur(8px)',
              padding: '20px',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '430px',
                position: 'relative',
              }}
            >
              <Paper
                className="shimmer-glow"
                style={{
                  padding: isDesktop ? '32px 30px' : '26px 20px',
                  borderRadius: '24px',
                  boxShadow: '0 24px 60px rgba(5, 10, 24, 0.7), 0 0 50px rgba(110, 155, 255, 0.3)',
                  border: '2px solid rgba(159, 227, 245, 0.6)',
                  textAlign: 'center',
                  background: 'linear-gradient(180deg, #FFFFFF 0%, #F5FAFF 100%)',
                }}
              >
                {/* Cute Pomeranian Peeking at Top */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                  <motion.div
                    animate={{ rotate: [-2, 2, -2], y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
                    style={{ width: 80, height: 80 }}
                  >
                    <Pomeranian mood="wink" size={80} />
                  </motion.div>
                </div>

                {/* Sparkling Badge */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 14px',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, rgba(234, 244, 255, 0.9), rgba(191, 223, 255, 0.8))',
                    border: '1px solid rgba(61, 111, 216, 0.3)',
                    marginBottom: '14px',
                  }}
                >
                  <span style={{ fontSize: '13px' }}>✨</span>
                  <span
                    className="text-ui"
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: 'var(--ocean)',
                      letterSpacing: '0.8px',
                      textTransform: 'uppercase',
                    }}
                  >
                    Tuffy's Secret Note
                  </span>
                  <span style={{ fontSize: '13px' }}>✨</span>
                </div>

                {/* Secret Note Body */}
                <p
                  className="text-body"
                  style={{
                    fontSize: isDesktop ? '20px' : '18px',
                    lineHeight: 1.5,
                    color: 'var(--navy)',
                    margin: '0 0 22px 0',
                    fontStyle: 'italic',
                    padding: '0 8px',
                  }}
                >
                  "{easterEgg}"
                </p>

                {/* Close Button */}
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    setShowEasterEgg(false);
                    setMoonTaps(0);
                  }}
                  className="btn-card-primary shimmer-glow"
                  style={{
                    padding: '0 28px',
                    height: '44px',
                    fontSize: '15px',
                    margin: '0 auto',
                  }}
                >
                  <span>Got it, Tuffy! 🐾</span>
                </motion.button>
              </Paper>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FINALE VINTAGE PAPER SHEET ── */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        style={{
          width: '100%',
          maxWidth: '720px',
          zIndex: 10,
          marginTop: isDesktop ? '40px' : '60px',
          paddingBottom: '80px',
        }}
      >
        <Paper
          deckled={true}
          style={{
            padding: isDesktop ? '52px 56px' : '36px 24px',
            borderRadius: '26px',
            boxShadow: '0 24px 64px rgba(15, 27, 61, 0.4), 0 0 80px rgba(110, 155, 255, 0.08)',
            position: 'relative',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span
              className="text-ui"
              style={{
                fontSize: '13px',
                fontWeight: 800,
                color: 'var(--ocean)',
                letterSpacing: '0.08em',
              }}
            >
              FINALE • FOR MILANDI
            </span>
          </div>

          {/* Paragraphs */}
          {finaleParts.paragraphs.map((p, pIdx) => (
            <p
              key={pIdx}
              className="text-body"
              style={{
                fontSize: isDesktop ? '28px' : '23px',
                lineHeight: 1.6,
                marginBottom: '1.4em',
                color: 'var(--ink)',
              }}
            >
              {p}
            </p>
          ))}

          {/* Very Large Final Line in Great Vibes */}
          <div
            style={{
              textAlign: 'center',
              marginTop: '40px',
              paddingTop: '28px',
              borderTop: '1px dashed var(--paper-aged)',
            }}
          >
            <motion.p
              className="text-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              style={{
                fontSize: isDesktop ? '54px' : '38px',
                color: 'var(--ocean)',
                lineHeight: 1.25,
                margin: 0,
                textShadow: '0 2px 20px rgba(110, 155, 255, 0.5), 0 0 40px rgba(61, 111, 216, 0.3), 0 0 80px rgba(110, 155, 255, 0.15)',
              }}
            >
              {finaleParts.lastLine}
            </motion.p>
          </div>

          {/* Action Buttons & Tuffy */}
          <div
            style={{
              display: 'flex',
              flexDirection: isDesktop ? 'row' : 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '44px',
              paddingTop: '20px',
              borderTop: '1px solid var(--paper-aged)',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: 70, height: 70 }}>
                <Pomeranian mood="happy" size={70} />
              </div>
              <span className="text-body" style={{ fontSize: '18px', color: 'var(--ocean)' }}>
                Happy Birthday! 🎂💙
              </span>
            </div>

            <div className="card-actions-group">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => goToScene && goToScene('Intro')}
                className="btn-card-secondary"
                title="Restart from beginning"
                aria-label="Return to start"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                </svg>
                <span>Return to start</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleOpenMakingOf}
                className="btn-card-primary shimmer-glow"
              >
                <span>The making of</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"/>
                  <path d="M12 5l7 7-7 7"/>
                </svg>
              </motion.button>
            </div>
          </div>
        </Paper>
      </motion.div>
    </div>
  );
}
