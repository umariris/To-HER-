import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Pomeranian from '../components/Pomeranian';
import Paper from '../components/Paper';
import { cards, pupLines } from '../content';
import { play } from '../audio';
import { useIsDesktop } from '../hooks/useIsDesktop';

export default function TuffyCards({ onComplete }) {
  const isDesktop = useIsDesktop();

  // Restore collected card IDs from localStorage
  const [collected, setCollected] = useState(() => {
    try {
      const saved = localStorage.getItem('sweetnugget-collected-cards');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [phase, setPhase] = useState(() => (collected.length > 0 ? 'scattered' : 'trotting'));
  const [tuffyMood, setTuffyMood] = useState(() => (collected.length > 0 ? 'idle' : 'hop'));
  const [speechText, setSpeechText] = useState(pupLines.arrival);
  const [activeCard, setActiveCard] = useState(null);
  const [canCloseCard, setCanCloseCard] = useState(false);
  const [timerProgress, setTimerProgress] = useState(0);
  const [afterEachIdx, setAfterEachIdx] = useState(0);

  // Pre-generate deterministic random rotations and offsets for the 19 cards
  const cardLayout = useMemo(() => {
    return cards.map((c, i) => {
      // Deterministic pseudo-random seed based on id
      const rot = ((c.id * 37) % 17) - 8; // -8 to 8 deg
      const floatDelay = (i * 0.25) % 2;
      return { id: c.id, rot, floatDelay };
    });
  }, []);

  // Sync collected state to localStorage
  const markCardCollected = useCallback((id) => {
    setCollected((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem('sweetnugget-collected-cards', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // Initial sequence: Tuffy trots in -> trips -> cards scatter
  useEffect(() => {
    if (phase !== 'trotting') return;

    const t1 = setTimeout(() => {
      // Tuffy trips
      setPhase('tripped');
      setTuffyMood('trip');
      play('pop');
    }, 2400);

    const t2 = setTimeout(() => {
      // Cards scatter
      setPhase('scattered');
      setTuffyMood('shy');
    }, 3600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [phase]);

  // Progress ring timer when active card opens
  useEffect(() => {
    if (!activeCard) {
      setCanCloseCard(false);
      setTimerProgress(0);
      return;
    }

    play('paper');
    setCanCloseCard(false);
    setTimerProgress(0);

    const startTime = Date.now();
    const duration = 3000; // 3 seconds

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(1, elapsed / duration);
      setTimerProgress(p);

      if (p >= 1) {
        setCanCloseCard(true);
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [activeCard]);

  const handleCardClick = (card) => {
    setActiveCard(card);
  };

  const handleGotIt = () => {
    if (!canCloseCard || !activeCard) return;

    markCardCollected(activeCard.id);
    setActiveCard(null);
    play('paper');

    // Tuffy reaction
    const nextIdx = (afterEachIdx + 1) % pupLines.afterEach.length;
    setAfterEachIdx(nextIdx);

    const isAllDone = collected.length + 1 >= cards.length;
    if (isAllDone) {
      setSpeechText(pupLines.afterLast);
      setTuffyMood('happy');
    } else {
      setSpeechText(pupLines.afterEach[afterEachIdx]);
      setTuffyMood(nextIdx % 2 === 0 ? 'happy' : 'shy');
    }
  };

  const isAllCollected = collected.length >= cards.length;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        background: 'linear-gradient(180deg, #F0F7FF 0%, var(--sky-mist) 25%, var(--baby-blue) 55%, var(--periwinkle) 85%, #9DB4FF 100%)',
        padding: isDesktop ? '32px 48px' : '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* ── INTRO SEQUENCE: Tuffy Trotting In & Tripping ── */}
      {phase !== 'scattered' && (
        <motion.div
          key="trotting-stage"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            setPhase('scattered');
            setTuffyMood('shy');
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(180deg, var(--sky-mist) 0%, var(--baby-blue) 100%)',
            cursor: 'pointer',
            padding: '24px',
          }}
        >
          <motion.div
            initial={{ x: -160, y: 0 }}
            animate={
              phase === 'trotting'
                ? {
                    x: 0,
                    y: [0, -8, 0],
                    transition: {
                      x: { duration: 2.2, ease: 'easeOut' },
                      y: { duration: 0.35, repeat: Infinity, ease: 'easeInOut' },
                    },
                  }
                : { rotate: [0, 20, 35], y: 18, transition: { duration: 0.45 } }
            }
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <Paper
              style={{
                padding: '12px 20px',
                borderRadius: '18px',
                marginBottom: '20px',
                boxShadow: '0 8px 24px rgba(27,42,92,0.12)',
                maxWidth: '380px',
                textAlign: 'center',
              }}
            >
              <p className="text-body" style={{ fontSize: isDesktop ? '22px' : '18px', margin: 0, color: 'var(--navy)' }}>
                {phase === 'trotting'
                  ? 'Wait for me! I brought all your cards... 🐾'
                  : 'Whoa! Oops... I tripped! 🙈'}
              </p>
            </Paper>

            <Pomeranian
              mood={tuffyMood}
              size={isDesktop ? 160 : 120}
              showCards={phase === 'trotting'}
            />
          </motion.div>

          <p className="text-ui" style={{ fontSize: '13px', color: 'var(--ocean)', marginTop: '28px', opacity: 0.75, fontWeight: 700 }}>
            Tap anywhere to scatter cards ✨
          </p>
        </motion.div>
      )}

      {/* ── STICKY TOP BAR: Cute Animated Tuffy Header ── */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          position: 'sticky',
          top: 12,
          zIndex: 40,
          width: '100%',
          maxWidth: '920px',
          display: 'flex',
          flexDirection: isDesktop ? 'row' : 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isDesktop ? '10px 20px' : '10px 14px',
          marginBottom: '24px',
          borderRadius: '28px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.88) 0%, rgba(234, 244, 255, 0.84) 50%, rgba(214, 236, 255, 0.78) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(255, 255, 255, 0.95)',
          boxShadow: 'inset 0 1.5px 2px rgba(255, 255, 255, 0.95), 0 8px 30px rgba(27, 42, 92, 0.08), 0 0 25px rgba(110, 155, 255, 0.12)',
        }}
      >
        {/* Tuffy & Animated Speech Bubble */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: isDesktop ? 96 : 72, height: isDesktop ? 96 : 72, flexShrink: 0, position: 'relative' }}
          >
            <Pomeranian
              mood={tuffyMood}
              size={isDesktop ? 96 : 72}
              showCards={phase === 'trotting'}
            />
          </motion.div>

          <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
            {/* Cute Speech Bubble Tail */}
            <div
              style={{
                position: 'absolute',
                left: '-7px',
                top: '50%',
                transform: 'translateY(-50%) rotate(45deg)',
                width: '12px',
                height: '12px',
                background: '#FFFFFF',
                borderLeft: '1.5px solid rgba(255, 255, 255, 0.95)',
                borderBottom: '1.5px solid rgba(191, 223, 255, 0.35)',
                zIndex: 2,
              }}
            />
            <AnimatePresence mode="wait">
              <motion.div
                key={speechText}
                initial={{ opacity: 0, scale: 0.95, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                style={{
                  position: 'relative',
                  zIndex: 3,
                  padding: isDesktop ? '10px 18px' : '8px 14px',
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 250, 255, 0.95) 100%)',
                  border: '1.5px solid rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 4px 16px rgba(27, 42, 92, 0.08), inset 0 1px 1px #fff',
                  maxWidth: isDesktop ? '520px' : '100%',
                }}
              >
                <p
                  className="text-body"
                  style={{
                    fontSize: isDesktop ? '18px' : '15px',
                    lineHeight: 1.38,
                    margin: 0,
                    color: 'var(--navy)',
                  }}
                >
                  {speechText}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Counter and Letter Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: isDesktop ? 0 : '10px',
            flexShrink: 0,
          }}
        >
          <motion.div
            key={collected.length}
            initial={{ scale: 0.92 }}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="text-ui"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(234, 244, 255, 0.92))',
              border: '1.5px solid rgba(255, 255, 255, 0.95)',
              color: 'var(--ocean)',
              fontSize: '14px',
              fontWeight: 800,
              boxShadow: '0 2px 10px rgba(61, 111, 216, 0.12), inset 0 1px 1px #fff',
            }}
          >
            <motion.span
              animate={{ rotate: [0, -12, 12, -6, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5 }}
              style={{ display: 'inline-block' }}
            >
              🐾
            </motion.span>
            <span>{collected.length} / {cards.length} collected</span>
          </motion.div>

          {isAllCollected && (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.04, 1], opacity: 1 }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              whileHover={{ scale: 1.08, boxShadow: '0 8px 28px rgba(61, 111, 216, 0.45)' }}
              whileTap={{ scale: 0.94 }}
              onClick={onComplete}
              className="text-ui"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, #4A7EF2 0%, var(--ocean) 50%, #2552B5 100%)',
                color: 'var(--white)',
                border: '1.5px solid rgba(255, 255, 255, 0.4)',
                fontWeight: 800,
                fontSize: '15px',
                cursor: 'pointer',
                boxShadow: '0 6px 22px rgba(61, 111, 216, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
              }}
            >
              <motion.span
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              >
                ✉️
              </motion.span>
              <span>Open the letter</span>
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* ── CARD FIELD (Interactive Zoom Grid) ── */}
      <div
        className="tuffy-card-grid"
        style={{
          width: '100%',
          maxWidth: '1080px',
          display: 'grid',
          gridTemplateColumns: isDesktop ? 'repeat(auto-fill, minmax(200px, 1fr))' : 'repeat(2, 1fr)',
          gap: isDesktop ? '26px' : '14px',
          paddingBottom: '80px',
          position: 'relative',
        }}
      >
        {cards.map((card, idx) => {
          const layout = cardLayout[idx];
          const isCollected = collected.includes(card.id);

          return (
            <div
              key={card.id}
              className="tuffy-card-cell"
              style={{
                aspectRatio: '3 / 4',
                position: 'relative',
              }}
            >
              {isCollected ? (
                /* Faded dashed outline where the card was with soft pulse */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 0.65, scale: 1 }}
                  whileHover={{ scale: 1.03, opacity: 0.85 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '18px',
                    border: '2px dashed rgba(61, 111, 216, 0.35)',
                    background: 'rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: `rotate(${layout.rot * 0.7}deg)`,
                    boxShadow: 'inset 0 0 16px rgba(110, 155, 255, 0.08)',
                  }}
                >
                  <motion.span
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-ui"
                    style={{ fontSize: '13px', color: 'var(--ocean)', fontWeight: 800 }}
                  >
                    ✓ No. {card.id}
                  </motion.span>
                  <span className="text-body" style={{ fontSize: '15px', color: 'var(--navy)', opacity: 0.7 }}>
                    in basket 🐾
                  </span>
                </motion.div>
              ) : (
                /* Unopened Vintage Paper Card with Zoom Hover & Click */
                <motion.div
                  className="tuffy-card-item"
                  initial={{ opacity: 0, scale: 0.8, y: 25 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: [0, -9, 0],
                    rotate: [layout.rot - 0.8, layout.rot + 0.8, layout.rot - 0.8],
                    transition: {
                      opacity: { duration: 0.4, delay: (idx % 6) * 0.04 },
                      scale: { duration: 0.4, delay: (idx % 6) * 0.04 },
                      y: {
                        duration: 3 + (idx % 4) * 0.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: layout.floatDelay,
                      },
                      rotate: {
                        duration: 4.5 + (idx % 4) * 0.6,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: layout.floatDelay,
                      },
                    },
                  }}
                  whileHover={{
                    scale: 1.15,
                    y: -18,
                    rotate: 0,
                    zIndex: 35,
                    transition: { duration: 0.26, ease: [0.16, 1, 0.3, 1] },
                  }}
                  whileTap={{
                    scale: 0.92,
                    rotate: layout.rot * 0.2,
                    transition: { duration: 0.1 },
                  }}
                  onClick={() => handleCardClick(card)}
                  style={{
                    transform: `rotate(${layout.rot}deg)`,
                  }}
                >
                  <Paper className="tuffy-card-paper">
                    {/* Washi tape strip on top-left corner */}
                    <div className="tuffy-washi-tape" />

                    {/* Stamped Number & Sparkle */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        zIndex: 4,
                      }}
                    >
                      <span
                        className="text-ui"
                        style={{
                          fontSize: '13px',
                          fontWeight: 800,
                          color: 'var(--ocean)',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          textShadow: '0 1px 1px rgba(255, 255, 255, 0.8)',
                        }}
                      >
                        No. {card.id}
                      </span>
                      <span className="tuffy-card-sparkle">✨</span>
                    </div>

                    {/* Card Title in Great Vibes */}
                    <h3
                      className="text-title"
                      style={{
                        fontSize: isDesktop ? '27px' : '23px',
                        textAlign: 'center',
                        color: 'var(--navy)',
                        margin: 'auto 0',
                        lineHeight: 1.25,
                        textShadow: '0 1px 2px rgba(255,255,255,0.7)',
                      }}
                    >
                      {card.label}
                    </h3>

                    {/* Small hint at bottom */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        zIndex: 4,
                      }}
                    >
                      <span
                        className="text-ui"
                        style={{
                          fontSize: '11px',
                          textAlign: 'center',
                          color: 'var(--ocean)',
                          opacity: 0.8,
                          fontWeight: 800,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}
                      >
                        open letter 💌
                      </span>
                    </div>
                  </Paper>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── EXPANDED FULL-SCREEN CARD MODAL ── */}
      <AnimatePresence>
        {activeCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              background: 'rgba(15, 27, 61, 0.68)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: isDesktop ? '32px' : '16px',
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget && canCloseCard) handleGotIt();
            }}
          >
            <motion.div
              initial={{ scale: 0.72, opacity: 0, y: 50, rotateX: 10, filter: 'blur(10px)' }}
              animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }}
              exit={{ scale: 0.65, opacity: 0, y: -60, rotate: -4, filter: 'blur(8px)' }}
              transition={{
                type: 'spring',
                damping: 24,
                stiffness: 280,
                mass: 0.85,
              }}
              style={{
                width: '100%',
                maxWidth: '680px',
                maxHeight: '88vh',
                borderRadius: '26px',
                background: 'var(--paper)',
                boxShadow: '0 25px 65px -10px rgba(15, 27, 61, 0.55), 0 12px 28px -5px rgba(27, 42, 92, 0.3), inset 0 0 60px rgba(196, 213, 234, 0.4)',
                border: '1.5px solid rgba(255, 255, 255, 0.85)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* Aged blotches overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  background: `
                    radial-gradient(ellipse at 5% 8%, var(--paper-aged) 0%, transparent 50%),
                    radial-gradient(ellipse at 92% 12%, var(--paper-stain) 0%, transparent 45%),
                    radial-gradient(ellipse at 8% 90%, var(--paper-stain) 0%, transparent 40%),
                    radial-gradient(ellipse at 88% 85%, var(--paper-aged) 0%, transparent 50%)
                  `,
                  zIndex: 1,
                }}
              />

              {/* Modal Header */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                style={{
                  padding: isDesktop ? '28px 40px 14px' : '20px 20px 12px',
                  borderBottom: '1px solid var(--paper-aged)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  position: 'relative',
                  zIndex: 5,
                  flexShrink: 0,
                }}
              >
                <span
                  className="text-ui"
                  style={{
                    fontSize: '15px',
                    fontWeight: 800,
                    color: 'var(--ocean)',
                    letterSpacing: '0.08em',
                  }}
                >
                  NO. {activeCard.id} OF 19
                </span>
                <span className="text-title" style={{ fontSize: '24px', color: 'var(--ocean)' }}>
                  sweetnugget
                </span>
              </motion.div>

              {/* Card Title */}
              <motion.h2
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.14, duration: 0.35, ease: 'easeOut' }}
                className="text-title"
                style={{
                  fontSize: isDesktop ? '38px' : '30px',
                  color: 'var(--navy)',
                  padding: isDesktop ? '18px 40px 0' : '14px 20px 0',
                  textAlign: 'center',
                  position: 'relative',
                  zIndex: 5,
                  flexShrink: 0,
                }}
              >
                {activeCard.label}
              </motion.h2>

              {/* Scrollable Text in Dancing Script */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: isDesktop ? '18px 40px 6px' : '14px 20px 6px',
                  position: 'relative',
                  zIndex: 5,
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {activeCard.text.split('\n\n').map((paragraph, pIdx) => (
                  <p
                    key={pIdx}
                    className="text-body"
                    style={{
                      marginBottom: '1.2em',
                      lineHeight: 1.6,
                    }}
                  >
                    {paragraph}
                  </p>
                ))}
              </motion.div>

              {/* Modal Footer with "Got it" Button + Progress Ring */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.26, duration: 0.35 }}
                style={{
                  borderTop: '1px solid var(--paper-aged)',
                  padding: isDesktop ? '14px 40px' : '14px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  position: 'relative',
                  zIndex: 5,
                  flexShrink: 0,
                  background: 'var(--paper)',
                }}
              >
                <span
                  className="text-ui"
                  style={{
                    fontSize: '13px',
                    color: 'var(--navy)',
                    opacity: 0.6,
                  }}
                >
                  {!canCloseCard ? 'Reading... (3s)' : 'Ready to collect'}
                </span>

                <button
                  onClick={handleGotIt}
                  disabled={!canCloseCard}
                  className="text-ui"
                  style={{
                    position: 'relative',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 24px',
                    borderRadius: '24px',
                    background: canCloseCard
                      ? 'linear-gradient(135deg, var(--ocean), var(--navy))'
                      : 'rgba(61, 111, 216, 0.25)',
                    color: canCloseCard ? 'var(--white)' : 'var(--navy)',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '15px',
                    cursor: canCloseCard ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s ease',
                    boxShadow: canCloseCard ? '0 4px 14px rgba(27, 42, 92, 0.25)' : 'none',
                  }}
                >
                  {/* Circular Progress Ring */}
                  <svg width="20" height="20" viewBox="0 0 24 24" style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      fill="none"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="2.5"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      fill="none"
                      stroke={canCloseCard ? '#FFFFFF' : 'var(--ocean)'}
                      strokeWidth="2.5"
                      strokeDasharray={2 * Math.PI * 10}
                      strokeDashoffset={2 * Math.PI * 10 * (1 - timerProgress)}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 0.05s linear' }}
                    />
                  </svg>

                  <span>Got it</span>
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
