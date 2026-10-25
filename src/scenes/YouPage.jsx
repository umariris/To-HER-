import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Paper from '../components/Paper';
import Pomeranian from '../components/Pomeranian';
import { youPage } from '../content';
import { play } from '../audio';
import { useIsDesktop } from '../hooks/useIsDesktop';

export default function YouPage({ onComplete }) {
  const isDesktop = useIsDesktop();
  const scrollContainerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [sparklePlayed, setSparklePlayed] = useState(false);

  // Track scroll position to update Cheek Meter
  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll <= 0) return;
    const p = Math.min(1, Math.max(0, el.scrollTop / maxScroll));
    setScrollProgress(p);

    if (p >= 0.98 && !sparklePlayed) {
      setSparklePlayed(true);
      play('pop');
    }
  };

  // Cheek meter labels
  let meterLabel = 'Calm ☁️';
  let tuffyMood = 'idle';
  if (scrollProgress > 0.85) {
    meterLabel = 'Off the charts! 🥰🚀';
    tuffyMood = 'happy';
  } else if (scrollProgress > 0.6) {
    meterLabel = 'Blushing 💖';
    tuffyMood = 'shy';
  } else if (scrollProgress > 0.35) {
    meterLabel = 'Glowing ✨';
    tuffyMood = 'hop';
  } else if (scrollProgress > 0.15) {
    meterLabel = 'Warm 🌸';
    tuffyMood = 'idle';
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #EAF4FF 0%, #D6ECFF 25%, #BFDFFF 50%, #A9B8FF 75%, #8B9CF7 100%)',
      }}
    >
      {/* ── BACKGROUND CLOUD PARALLAX LAYER ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          transform: `translateY(-${scrollProgress * 60}px)`,
          transition: 'transform 0.1s linear',
          opacity: 0.5,
        }}
      >
        <svg viewBox="0 0 1000 1200" width="100%" height="100%" preserveAspectRatio="none">
          <ellipse cx="150" cy="200" rx="200" ry="80" fill="rgba(255,255,255,0.7)" />
          <ellipse cx="850" cy="450" rx="220" ry="90" fill="rgba(214,236,255,0.6)" />
          <ellipse cx="200" cy="750" rx="240" ry="100" fill="rgba(255,255,255,0.6)" />
          <ellipse cx="800" cy="1000" rx="250" ry="110" fill="rgba(214,236,255,0.7)" />
        </svg>
      </div>

      {/* ── FIXED TOP CHEEK METER PILL ── */}
      <div
        style={{
          position: 'fixed',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 18px',
          borderRadius: '30px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(234, 244, 255, 0.92))',
          border: '1px solid rgba(255, 255, 255, 0.9)',
          boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.6), 0 8px 24px rgba(61, 111, 216, 0.15)',
        }}
      >
        <span className="text-ui" style={{ fontSize: '13px', fontWeight: 800, color: 'var(--navy)' }}>
          Cheek meter:
        </span>

        {/* Progress Bar Container */}
        <div
          style={{
            width: isDesktop ? '140px' : '90px',
            height: '10px',
            borderRadius: '5px',
            background: 'var(--sky-mist)',
            overflow: 'hidden',
            border: '1px solid rgba(61, 111, 216, 0.2)',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, var(--powder-cyan), var(--cornflower), var(--ocean))',
              transformOrigin: 'left',
              transform: `scaleX(${Math.max(0.05, scrollProgress)})`,
              transition: 'transform 0.1s linear',
            }}
          />
        </div>

        <span
          className="text-ui"
          style={{
            fontSize: '13px',
            fontWeight: 800,
            color: 'var(--ocean)',
            minWidth: '90px',
          }}
        >
          {meterLabel}
        </span>
      </div>

      {/* ── FIXED BOTTOM-CORNER TUFFY ── */}
      <div
        style={{
          position: 'fixed',
          bottom: '12px',
          right: '12px',
          width: isDesktop ? 120 : 80,
          height: isDesktop ? 120 : 80,
          zIndex: 40,
          pointerEvents: 'none',
        }}
      >
        <Pomeranian mood={tuffyMood} size={isDesktop ? 120 : 80} />
      </div>

      {/* ── SCROLL-SNAP PANELS CONTAINER ── */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        style={{
          width: '100%',
          height: '100%',
          overflowY: 'auto',
          scrollSnapType: 'y mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {youPage.map((panel, idx) => (
          <section
            key={idx}
            style={{
              width: '100%',
              minHeight: '100dvh',
              scrollSnapAlign: 'start',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: isDesktop ? '60px 24px' : '80px 16px 40px',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{
                width: '100%',
                maxWidth: '680px',
              }}
            >
              <Paper
                deckled={true}
                style={{
                  padding: isDesktop ? '48px 52px' : '32px 24px',
                  borderRadius: '24px',
                  boxShadow: '0 16px 40px rgba(27, 42, 92, 0.15)',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--paper-aged)',
                    paddingBottom: '12px',
                    marginBottom: '20px',
                  }}
                >
                  <span
                    className="text-ui"
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: 'var(--ocean)',
                      letterSpacing: '0.08em',
                    }}
                  >
                    YOU • {idx + 1} OF 6
                  </span>
                  <span style={{ fontSize: '14px' }}>✨</span>
                </div>

                <h2
                  className="text-title"
                  style={{
                    fontSize: isDesktop ? '42px' : '32px',
                    color: 'var(--navy)',
                    marginBottom: '18px',
                    lineHeight: 1.2,
                  }}
                >
                  {panel.title}
                </h2>

                <p
                  className="text-body"
                  style={{
                    fontSize: isDesktop ? '26px' : '22px',
                    lineHeight: 1.6,
                    color: 'var(--ink)',
                  }}
                >
                  {panel.text}
                </p>

                {/* Final Panel Button */}
                {idx === youPage.length - 1 && (
                  <div style={{ marginTop: '32px', textAlign: 'center' }}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onComplete}
                      className="text-ui"
                      style={{
                        padding: '12px 28px',
                        borderRadius: '24px',
                        background: 'linear-gradient(135deg, var(--ocean), var(--navy))',
                        color: 'var(--white)',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: '16px',
                        cursor: 'pointer',
                        boxShadow: '0 6px 18px rgba(27, 42, 92, 0.25)',
                      }}
                    >
                      Little Moments →
                    </motion.button>
                  </div>
                )}
              </Paper>
            </motion.div>
          </section>
        ))}
      </div>
    </div>
  );
}
