import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Paper from '../components/Paper';
import Glass from '../components/Glass';
import { moments } from '../content';
import { play } from '../audio';
import { useIsDesktop } from '../hooks/useIsDesktop';

export default function Moments({ onComplete }) {
  const isDesktop = useIsDesktop();
  const [openedIndices, setOpenedIndices] = useState([]);
  const [activeNoteIdx, setActiveNoteIdx] = useState(null);
  const sceneRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  // Cursor-responsive parallax for bubbles
  useEffect(() => {
    if (!isDesktop) return;
    const handler = (e) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener('mousemove', handler, { passive: true });
    return () => window.removeEventListener('mousemove', handler);
  }, [isDesktop]);

  // Bubble positions distributed pleasingly across the screen
  const bubblePositions = useMemo(() => {
    return [
      { top: '18%', left: isDesktop ? '18%' : '14%', size: 76 },
      { top: '22%', left: isDesktop ? '52%' : '60%', size: 84 },
      { top: '15%', left: isDesktop ? '80%' : '76%', size: 72 },
      { top: '42%', left: isDesktop ? '12%' : '10%', size: 88 },
      { top: '48%', left: isDesktop ? '78%' : '68%', size: 80 },
      { top: '65%', left: isDesktop ? '28%' : '18%', size: 74 },
      { top: '70%', left: isDesktop ? '58%' : '56%', size: 90 },
      { top: '78%', left: isDesktop ? '82%' : '78%', size: 70 },
    ];
  }, [isDesktop]);

  const handleBubbleClick = (idx) => {
    play('pop');
    setActiveNoteIdx(idx);
    if (!openedIndices.includes(idx)) {
      setOpenedIndices((prev) => [...prev, idx]);
    }
  };

  const handleCloseNote = () => {
    play('paper');
    setActiveNoteIdx(null);
  };

  const allOpened = openedIndices.length >= moments.length;

  // Compute cursor-responsive offsets
  const cursorOffsetX = isDesktop ? (mousePos.x - 0.5) * 12 : 0;
  const cursorOffsetY = isDesktop ? (mousePos.y - 0.5) * 8 : 0;

  return (
    <div
      className="scene safe-area"
      ref={sceneRef}
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #EAF4FF 0%, #D0E8FF 15%, #BFDFFF 30%, #6E9BFF 55%, #3D6FD8 72%, #1B3B82 88%, #0F1B3D 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      {/* Aurora shimmer background */}
      <div className="aurora-bg" />

      {/* Gradient orbs */}
      <div
        className="gradient-orb gradient-orb--1"
        style={{ top: '10%', left: '5%', transform: `translate(${cursorOffsetX * -1.5}px, ${cursorOffsetY * -1.5}px)` }}
      />
      <div
        className="gradient-orb gradient-orb--2"
        style={{ top: '60%', right: '5%', transform: `translate(${cursorOffsetX * 1.2}px, ${cursorOffsetY * 1.2}px)` }}
      />

      {/* ── HEADER ── */}
      <div
        style={{
          position: 'absolute',
          top: '24px',
          textAlign: 'center',
          zIndex: 20,
        }}
      >
        <h2
          className="text-title gradient-text"
          style={{
            fontSize: isDesktop ? '42px' : '30px',
            marginBottom: '4px',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Little Moments
        </h2>
        <p
          className="text-ui"
          style={{
            fontSize: '14px',
            color: 'var(--ice)',
            fontWeight: 700,
          }}
        >
          Tap the floating bubbles • {openedIndices.length} / {moments.length} found
        </p>
      </div>

      {/* ── FLOATING BUBBLES FIELD ── */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {moments.map((_, idx) => {
          const pos = bubblePositions[idx];
          const isOpened = openedIndices.includes(idx);

          // Cursor-responsive offset per bubble (different multipliers for depth illusion)
          const depthFactor = 0.5 + (idx % 3) * 0.3;
          const bx = cursorOffsetX * depthFactor * (idx % 2 === 0 ? 1 : -1);
          const by = cursorOffsetY * depthFactor * (idx % 2 === 0 ? -1 : 1);

          if (isOpened && activeNoteIdx !== idx) {
            // Shrinks into a twinkling star in the sky
            return (
              <motion.div
                key={`star-${idx}`}
                initial={{ scale: 0.2, opacity: 0 }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.7, 1, 0.7],
                  transition: { duration: 2 + (idx % 3) * 0.5, repeat: Infinity, ease: 'easeInOut' },
                }}
                onClick={() => handleBubbleClick(idx)}
                style={{
                  position: 'absolute',
                  top: pos.top,
                  left: pos.left,
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10,
                  transform: `translate(${bx}px, ${by}px)`,
                  transition: 'transform 0.15s linear',
                }}
                title="Tap to re-read note"
              >
                <span style={{ fontSize: '20px', filter: 'drop-shadow(0 0 8px #FFFFFF) drop-shadow(0 0 16px rgba(110, 155, 255, 0.5))' }}>⭐</span>
              </motion.div>
            );
          }

          return (
            <motion.div
              key={`bubble-${idx}`}
              animate={{
                y: [0, -14, 0],
                x: [0, (idx % 2 === 0 ? 8 : -8), 0],
                transition: {
                  duration: 3.5 + (idx % 3) * 0.6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: (idx * 0.4) % 2,
                },
              }}
              whileHover={{
                scale: 1.25,
                filter: 'drop-shadow(0 0 24px rgba(159, 227, 245, 0.9)) drop-shadow(0 14px 28px rgba(27, 42, 92, 0.35))',
                transition: { duration: 0.2 },
              }}
              whileTap={{ scale: 0.88 }}
              onClick={() => handleBubbleClick(idx)}
              style={{
                position: 'absolute',
                top: pos.top,
                left: pos.left,
                width: `${pos.size}px`,
                height: `${pos.size}px`,
                cursor: 'pointer',
                zIndex: 15,
                transform: `translate(${bx}px, ${by}px)`,
                transition: 'transform 0.15s linear',
              }}
            >
              {/* Glass Bubble with 3D Spherical Iridescence */}
              <Glass
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow:
                    '0 12px 32px rgba(27, 42, 92, 0.25), 0 4px 12px rgba(61, 111, 216, 0.3), inset -4px -4px 14px rgba(61, 111, 216, 0.4), inset 3px 3px 12px rgba(255, 255, 255, 0.95), 0 0 20px rgba(110, 155, 255, 0.15)',
                  background:
                    'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.94) 0%, rgba(214,236,255,0.45) 28%, rgba(159,227,245,0.22) 55%, rgba(61,111,216,0.38) 100%)',
                  border: '1.5px solid rgba(255, 255, 255, 0.92)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Specular Highlight Glint */}
                <div
                  style={{
                    position: 'absolute',
                    top: '18%',
                    left: '24%',
                    width: '28%',
                    height: '20%',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.96)',
                    transform: 'rotate(-35deg)',
                    filter: 'blur(0.8px)',
                    pointerEvents: 'none',
                  }}
                />
                {/* Secondary highlight */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '22%',
                    right: '20%',
                    width: '16%',
                    height: '10%',
                    borderRadius: '50%',
                    background: 'rgba(159, 227, 245, 0.6)',
                    transform: 'rotate(15deg)',
                    filter: 'blur(1px)',
                    pointerEvents: 'none',
                  }}
                />
                <span style={{ fontSize: isDesktop ? '22px' : '18px', filter: 'drop-shadow(0 1px 2px rgba(61,111,216,0.4))' }}>🫧</span>
              </Glass>
            </motion.div>
          );
        })}
      </div>

      {/* ── ACTIVE NOTE POPUP ── */}
      <AnimatePresence>
        {activeNoteIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseNote}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              background: 'rgba(15, 27, 61, 0.6)',
              backdropFilter: 'blur(16px) saturate(1.3)',
              WebkitBackdropFilter: 'blur(16px) saturate(1.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -6, opacity: 0, y: 30 }}
              animate={{ scale: 1, rotate: 0, opacity: 1, y: 0 }}
              exit={{ scale: 0.6, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '460px',
              }}
            >
              <Paper
                deckled={true}
                style={{
                  padding: isDesktop ? '36px 32px' : '28px 22px',
                  borderRadius: '20px',
                  boxShadow: '0 16px 44px rgba(15, 27, 61, 0.35), 0 0 60px rgba(110, 155, 255, 0.1)',
                  textAlign: 'center',
                }}
              >
                <div style={{ marginBottom: '14px' }}>
                  <span
                    className="text-ui"
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: 'var(--ocean)',
                      letterSpacing: '0.08em',
                    }}
                  >
                    MOMENT • {activeNoteIdx + 1} OF 8
                  </span>
                </div>

                <p
                  className="text-body"
                  style={{
                    fontSize: isDesktop ? '28px' : '23px',
                    lineHeight: 1.55,
                    color: 'var(--navy)',
                    margin: '18px 0',
                  }}
                >
                  "{moments[activeNoteIdx]}"
                </p>

                <button
                  onClick={handleCloseNote}
                  className="text-ui btn-premium"
                  style={{
                    marginTop: '12px',
                    padding: '10px 24px',
                    borderRadius: '22px',
                    fontSize: '14px',
                  }}
                >
                  Release to star ✨
                </button>
              </Paper>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CONTINUE BUTTON (When all 8 are opened) ── */}
      {allOpened && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'absolute',
            bottom: '32px',
            zIndex: 30,
          }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onComplete}
            className="text-ui btn-premium shimmer-glow"
            style={{
              padding: '14px 32px',
              borderRadius: '28px',
              background: 'linear-gradient(135deg, var(--ocean) 0%, #2552B5 50%, var(--midnight) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              fontSize: '16px',
            }}
          >
            Open When letters →
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
