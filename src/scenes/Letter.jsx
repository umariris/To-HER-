import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import Paper from '../components/Paper';
import Pomeranian from '../components/Pomeranian';
import LiveWriting from '../components/LiveWriting';
import { letterFrame, wishes } from '../content';
import { play } from '../audio';
import { useIsDesktop } from '../hooks/useIsDesktop';

export default function Letter({ onComplete }) {
  const isDesktop = useIsDesktop();
  const [openStep, setOpenStep] = useState('closed'); // closed | cracking | opening | sliding | unfolded
  const [currentPage, setCurrentPage] = useState(0);
  const [pageDirection, setPageDirection] = useState(1); // 1 = next, -1 = prev
  const [writingDone, setWritingDone] = useState(false);

  // Background romantic light motes
  const sparkles = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      left: `${(i * 17) % 92 + 4}%`,
      top: `${(i * 23) % 88 + 6}%`,
      size: (i % 3) + 3,
      delay: i * 0.35,
      duration: 3.5 + (i % 3) * 1.2,
    }));
  }, []);

  const handleOpenEnvelope = useCallback(() => {
    if (openStep !== 'closed') return;
    play('paper');
    setOpenStep('cracking');

    // Stardust burst on breaking wax seal
    confetti({
      particleCount: 35,
      spread: 70,
      origin: { y: 0.5, x: 0.5 },
      colors: ['#FFFFFF', '#D6ECFF', '#7CA7FF', '#3D6FD8', '#BFDFFF'],
    });

    setTimeout(() => {
      setOpenStep('opening');
      setTimeout(() => {
        setOpenStep('unfolded');
      }, 420);
    }, 320);
  }, [openStep]);

  const totalPages = wishes.length; // 5 chapters

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setPageDirection(1);
      setCurrentPage((prev) => prev + 1);
      setWritingDone(false);
      play('paper');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (onComplete) onComplete();
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setPageDirection(-1);
      setCurrentPage((prev) => prev - 1);
      setWritingDone(true);
      play('paper');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isOpen = openStep === 'unfolded';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        background: 'radial-gradient(ellipse at 50% 40%, #EAF4FF 0%, #D6ECFF 30%, #BFDFFF 65%, #A4C2F4 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: isOpen ? 'flex-start' : 'center',
        padding: isDesktop ? '32px' : '16px',
      }}
    >
      {/* ── BACKGROUND FLOATING LIGHT MOTES ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {sparkles.map((sp) => (
          <div
            key={sp.id}
            style={{
              position: 'absolute',
              top: sp.top,
              left: sp.left,
              width: `${sp.size}px`,
              height: `${sp.size}px`,
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 0 8px rgba(110, 155, 255, 0.7), 0 0 16px rgba(255, 255, 255, 0.8)',
              animation: `float-pulse ${sp.duration}s ease-in-out ${sp.delay}s infinite`,
              opacity: 0.65,
            }}
          />
        ))}
      </div>

      <AnimatePresence>
        {!isOpen ? (
          /* ── CLOSED ENVELOPE ON DESK ── */
          <motion.div
            key="envelope"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{
              perspective: '1200px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <p
              className="text-title"
              style={{
                fontSize: isDesktop ? '32px' : '26px',
                color: 'var(--navy)',
                marginBottom: '20px',
                textAlign: 'center',
              }}
            >
              A handwritten letter for you
            </p>

            {/* Envelope Container & Desk Shadow */}
            <div style={{ position: 'relative', width: isDesktop ? '540px' : '330px', height: isDesktop ? '340px' : '220px' }}>
              {/* Desk Contact Shadow */}
              <div
                style={{
                  position: 'absolute',
                  bottom: -18,
                  left: '6%',
                  right: '6%',
                  height: 32,
                  background: 'radial-gradient(ellipse at center, rgba(15, 27, 61, 0.42) 0%, rgba(27, 42, 92, 0.18) 50%, transparent 75%)',
                  filter: 'blur(8px)',
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              />

              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  background: 'var(--envelope)',
                  borderRadius: '16px',
                  boxShadow: '0 10px 20px -5px rgba(27, 42, 92, 0.2), 0 25px 60px -10px rgba(15, 27, 61, 0.32), inset 0 1px 2px rgba(255, 255, 255, 0.8), inset 0 -2px 6px rgba(27, 42, 92, 0.12)',
                  border: '1.5px solid rgba(255, 255, 255, 0.7)',
                  overflow: 'visible',
                  zIndex: 2,
                }}
              >
                {/* Postage Stamp with Pomeranian Face */}
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    width: isDesktop ? '72px' : '52px',
                    height: isDesktop ? '86px' : '62px',
                    background: 'var(--sky-mist)',
                    border: '2px dashed var(--ocean)',
                    borderRadius: '4px',
                    padding: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 3px 8px rgba(27, 42, 92, 0.18)',
                    zIndex: 5,
                  }}
                >
                  <div style={{ width: '80%', height: '70%', overflow: 'hidden' }}>
                    <Pomeranian mood="happy" size={isDesktop ? 50 : 36} />
                  </div>
                  <span
                    className="text-ui"
                    style={{
                      fontSize: isDesktop ? '9px' : '7px',
                      fontWeight: 800,
                      color: 'var(--ocean)',
                      marginTop: '2px',
                      letterSpacing: '0.04em',
                    }}
                  >
                    FOR MILANDI
                  </span>
                </div>

                {/* Postmark "NOV 4" */}
                <div
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: isDesktop ? '96px' : '74px',
                    width: isDesktop ? '56px' : '42px',
                    height: isDesktop ? '56px' : '42px',
                    borderRadius: '50%',
                    border: '1.5px solid rgba(61, 111, 216, 0.6)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: 'rotate(-15deg)',
                    pointerEvents: 'none',
                    filter: 'drop-shadow(0 1px 2px rgba(61, 111, 216, 0.2))',
                    zIndex: 5,
                  }}
                >
                  <span className="text-ui" style={{ fontSize: isDesktop ? '9px' : '7px', color: 'var(--ocean)', fontWeight: 800 }}>
                    JAIPUR
                  </span>
                  <span className="text-ui" style={{ fontSize: isDesktop ? '11px' : '8px', color: 'var(--ocean)', fontWeight: 900 }}>
                    NOV 4
                  </span>
                </div>

                {/* Handwritten Address in Great Vibes */}
                <div
                  style={{
                    position: 'absolute',
                    left: isDesktop ? '40px' : '24px',
                    bottom: isDesktop ? '36px' : '20px',
                    zIndex: 5,
                  }}
                >
                  <p
                    className="text-title"
                    style={{
                      fontSize: isDesktop ? '34px' : '24px',
                      color: 'var(--navy)',
                      lineHeight: 1.2,
                      margin: 0,
                      textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)',
                    }}
                  >
                    {letterFrame.envelope.to}
                  </p>
                  <p
                    className="text-title"
                    style={{
                      fontSize: isDesktop ? '24px' : '18px',
                      color: 'var(--ocean)',
                      marginTop: '4px',
                      margin: 0,
                      textShadow: '0 1px 2px rgba(255, 255, 255, 0.6)',
                    }}
                  >
                    {letterFrame.envelope.from}
                  </p>
                </div>

                {/* Fold Lines on Envelope Front */}
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 540 340"
                  style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4 }}
                >
                  <path
                    d="M0,0 L270,180 L540,0"
                    fill="none"
                    stroke="rgba(169, 192, 224, 0.8)"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M0,340 L220,150"
                    fill="none"
                    stroke="rgba(169, 192, 224, 0.6)"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M540,340 L320,150"
                    fill="none"
                    stroke="rgba(169, 192, 224, 0.6)"
                    strokeWidth="1.2"
                  />
                </svg>

                {/* 3D Envelope Flap */}
                <motion.div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '52%',
                    background: 'linear-gradient(180deg, var(--envelope-shade) 0%, #9cb5db 100%)',
                    clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                    transformOrigin: 'top center',
                    zIndex: 15,
                    backfaceVisibility: 'hidden',
                    boxShadow: '0 6px 12px rgba(27, 42, 92, 0.15)',
                  }}
                  animate={{
                    rotateX: openStep === 'opening' || openStep === 'sliding' || openStep === 'unfolded' ? -179 : 0,
                  }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                />

                {/* Folded Letter Sliding Out in 3 Folds */}
                {(openStep === 'sliding' || openStep === 'opening') && (
                  <motion.div
                    initial={{ y: 0, opacity: 0.9, scaleY: 0.6 }}
                    animate={{ y: -120, opacity: 1, scaleY: 1 }}
                    transition={{ duration: 0.55, ease: 'easeOut' }}
                    style={{
                      position: 'absolute',
                      top: '10%',
                      left: '8%',
                      right: '8%',
                      height: '80%',
                      background: 'var(--paper)',
                      borderRadius: '10px',
                      boxShadow: '0 12px 36px rgba(15, 27, 61, 0.28)',
                      zIndex: 12,
                      border: '1px solid var(--paper-aged)',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {/* 3 fold simulation stripes */}
                    <div style={{ flex: 1, borderBottom: '1px dashed rgba(27,42,92,0.15)', background: 'linear-gradient(180deg, rgba(255,255,255,0.4), transparent)' }} />
                    <div style={{ flex: 1, borderBottom: '1px dashed rgba(27,42,92,0.15)', background: 'linear-gradient(180deg, transparent, rgba(211,224,239,0.3))' }} />
                    <div style={{ flex: 1, background: 'linear-gradient(180deg, rgba(255,255,255,0.3), transparent)' }} />
                  </motion.div>
                )}

                {/* 3D Wax Seal with Heart Button centered directly on flap clasp/bind */}
                <div
                  style={{
                    position: 'absolute',
                    top: '52%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 20,
                  }}
                >
                  <motion.button
                    whileHover={openStep === 'closed' ? { scale: 1.1, filter: 'drop-shadow(0 10px 24px rgba(27,42,92,0.5))' } : {}}
                    whileTap={openStep === 'closed' ? { scale: 0.92 } : {}}
                    onClick={handleOpenEnvelope}
                    animate={
                      openStep === 'cracking'
                        ? { scale: [1, 1.3, 0], rotate: [0, 8, -8, 0], opacity: [1, 1, 0] }
                        : openStep !== 'closed'
                        ? { scale: 0, opacity: 0 }
                        : { scale: 1, opacity: 1 }
                    }
                    transition={{ duration: 0.35 }}
                    style={{
                      width: isDesktop ? '72px' : '56px',
                      height: isDesktop ? '72px' : '56px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle at 35% 32%, #7CA7FF 0%, #3D6FD8 55%, #1B2A5C 100%)',
                      border: '2px solid rgba(255, 255, 255, 0.85)',
                      boxShadow: '0 8px 24px rgba(27, 42, 92, 0.45), 0 2px 6px rgba(61, 111, 216, 0.3), inset 0 2.5px 3px rgba(255, 255, 255, 0.6), inset 0 -3px 5px rgba(15, 27, 61, 0.5)',
                      cursor: openStep === 'closed' ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title={letterFrame.envelope.sealHint}
                  >
                    <svg
                      width={isDesktop ? 30 : 22}
                      height={isDesktop ? 30 : 22}
                      viewBox="0 0 24 24"
                      fill="#FFFFFF"
                      style={{ filter: 'drop-shadow(0 1px 2px rgba(15,27,61,0.5))' }}
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            </div>

            <p
              className="text-ui"
              style={{
                fontSize: '14px',
                color: 'var(--ocean)',
                marginTop: '18px',
                fontWeight: 700,
                letterSpacing: '0.04em',
              }}
            >
              {letterFrame.envelope.sealHint}
            </p>
          </motion.div>
        ) : (
          /* ── UNFOLDED LETTER FULL VIEW ── */
          <motion.div
            key="letter"
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
            style={{
              width: '100%',
              maxWidth: '740px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              marginTop: isDesktop ? '32px' : '16px',
              marginBottom: isDesktop ? '60px' : '40px',
              paddingBottom: '20px',
            }}
          >
            <Paper
              deckled={true}
              style={{
                width: '100%',
                borderRadius: '26px',
                padding: isDesktop ? '52px 58px' : '36px 24px',
                boxShadow: '0 24px 64px rgba(15, 27, 61, 0.22)',
                position: 'relative',
              }}
            >
              {/* Top Header: Ribbon Progress & Date */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid var(--paper-aged)',
                  paddingBottom: '14px',
                  marginBottom: '20px',
                }}
              >
                {/* Ribbon 'Page n of 5' + scaleX bar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span
                    className="text-ui"
                    style={{
                      fontSize: '13px',
                      fontWeight: 800,
                      color: 'var(--ocean)',
                      letterSpacing: '0.05em',
                    }}
                  >
                    PAGE {currentPage + 1} OF {totalPages}
                  </span>
                  <div
                    style={{
                      width: '110px',
                      height: '4px',
                      background: 'rgba(61, 111, 216, 0.2)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        background: 'var(--ocean)',
                        transformOrigin: 'left',
                        transform: `scaleX(${(currentPage + 1) / totalPages})`,
                        transition: 'transform 0.4s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Date Top Right */}
                <span
                  className="text-ui"
                  style={{
                    fontSize: isDesktop ? '14px' : '12px',
                    color: 'var(--ocean)',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                  }}
                >
                  {letterFrame.date}
                </span>
              </div>

              {/* Salutation (Page 1 only) */}
              {currentPage === 0 && (
                <p
                  className="text-title"
                  style={{
                    fontSize: isDesktop ? '34px' : '28px',
                    color: 'var(--navy)',
                    marginBottom: '18px',
                  }}
                >
                  {letterFrame.salutation}
                </p>
              )}

              {/* Animated Page Content with smooth page turn transition */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`page-content-${currentPage}`}
                  initial={{ opacity: 0, x: pageDirection * 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: pageDirection * -24 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Chapter Title in Great Vibes */}
                  <h2
                    className="text-title"
                    style={{
                      fontSize: isDesktop ? '36px' : '28px',
                      color: 'var(--ocean)',
                      marginBottom: '16px',
                      textAlign: 'left',
                    }}
                  >
                    {wishes[currentPage].title}
                  </h2>

                  {/* Live Writing handwritten body */}
                  <div style={{ minHeight: isDesktop ? '200px' : '160px' }}>
                    <LiveWriting
                      key={`letter-page-${currentPage}`}
                      text={wishes[currentPage].text}
                      onComplete={() => setWritingDone(true)}
                      className="text-body"
                      style={{
                        fontSize: isDesktop ? '27px' : '23px',
                        lineHeight: 1.6,
                      }}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Last Page Signatures & P.S. */}
              {currentPage === totalPages - 1 && (
                <div
                  style={{
                    marginTop: '32px',
                    paddingTop: '20px',
                    borderTop: '1px dashed var(--paper-aged)',
                  }}
                >
                  <p className="text-body" style={{ margin: 0, color: 'var(--navy)', opacity: 0.9 }}>
                    {letterFrame.closing}
                  </p>
                  <p
                    className="text-title"
                    style={{
                      fontSize: isDesktop ? '38px' : '30px',
                      color: 'var(--navy)',
                      marginTop: '8px',
                      marginBottom: '20px',
                    }}
                  >
                    {letterFrame.signature}
                  </p>

                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: 'rgba(214, 236, 255, 0.45)',
                      borderLeft: '3px solid var(--ocean)',
                    }}
                  >
                    <p
                      className="text-body"
                      style={{
                        fontSize: isDesktop ? '22px' : '19px',
                        margin: 0,
                        color: 'var(--navy)',
                      }}
                    >
                      <strong>P.S.</strong> {letterFrame.ps}
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Controls */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '32px',
                  borderTop: '1px solid var(--paper-aged)',
                  paddingTop: '20px',
                  gap: '12px',
                }}
              >
                <motion.button
                  whileHover={currentPage > 0 ? { scale: 1.04 } : {}}
                  whileTap={currentPage > 0 ? { scale: 0.96 } : {}}
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  className="btn-card-secondary"
                  style={{
                    opacity: currentPage === 0 ? 0.35 : 1,
                    cursor: currentPage === 0 ? 'default' : 'pointer',
                    pointerEvents: currentPage === 0 ? 'none' : 'auto',
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5"/>
                    <path d="M12 19l-7-7 7-7"/>
                  </svg>
                  <span>Previous</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleNextPage}
                  className="btn-card-primary shimmer-glow"
                >
                  <span>{currentPage < totalPages - 1 ? 'Turn page' : 'Continue to You'}</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"/>
                    <path d="M12 5l7 7-7 7"/>
                  </svg>
                </motion.button>
              </div>
            </Paper>

            {/* Tuffy Peeking in Corner */}
            <div
              style={{
                position: 'absolute',
                bottom: -10,
                right: isDesktop ? -20 : -10,
                width: isDesktop ? 120 : 80,
                height: isDesktop ? 120 : 80,
                zIndex: 30,
                pointerEvents: 'none',
              }}
            >
              <Pomeranian mood={currentPage === totalPages - 1 ? 'happy' : 'wave'} size={isDesktop ? 120 : 80} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
