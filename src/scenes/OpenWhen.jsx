import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Paper from '../components/Paper';
import Pomeranian from '../components/Pomeranian';
import LiveWriting from '../components/LiveWriting';
import { openWhen } from '../content';
import { play } from '../audio';
import { useIsDesktop } from '../hooks/useIsDesktop';

export default function OpenWhen({ onComplete }) {
  const isDesktop = useIsDesktop();
  const [activeIdx, setActiveIdx] = useState(null);
  const [openedEnvelopes, setOpenedEnvelopes] = useState([]);

  const handleOpenEnvelope = (idx) => {
    play('paper');
    setActiveIdx(idx);
    if (!openedEnvelopes.includes(idx)) {
      setOpenedEnvelopes((prev) => [...prev, idx]);
    }
  };

  const handleCloseModal = () => {
    setActiveIdx(null);
  };

  const allOpened = openedEnvelopes.length >= openWhen.length;

  return (
    <div
      className="scene safe-area"
      style={{
        position: 'fixed',
        inset: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        background: 'linear-gradient(180deg, #EAF4FF 0%, #D6ECFF 22%, #BFDFFF 48%, #A9B8FF 78%, #7E97F6 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: isDesktop ? '36px 40px' : '20px 16px',
      }}
    >
      {/* ── HEADER & TUFFY ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          marginBottom: '24px',
          width: '100%',
          maxWidth: '840px',
        }}
      >
        <div style={{ width: isDesktop ? 90 : 68, height: isDesktop ? 90 : 68 }}>
          <Pomeranian mood="wave" size={isDesktop ? 90 : 68} />
        </div>

        <div style={{ textAlign: isDesktop ? 'left' : 'center' }}>
          <h2
            className="text-title"
            style={{
              fontSize: isDesktop ? '38px' : '28px',
              color: 'var(--navy)',
              margin: 0,
            }}
          >
            Open When...
          </h2>
          <p
            className="text-ui"
            style={{
              fontSize: '14px',
              color: 'var(--ocean)',
              fontWeight: 700,
              marginTop: '4px',
            }}
          >
            Letters for whenever you need them • {openedEnvelopes.length} / {openWhen.length} read
          </p>
        </div>
      </div>

      {/* ── 5 VINTAGE BLUE ENVELOPES ── */}
      <div
        style={{
          width: '100%',
          maxWidth: '1040px',
          display: 'flex',
          flexDirection: isDesktop ? 'row' : 'column',
          flexWrap: isDesktop ? 'wrap' : 'nowrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: isDesktop ? '20px' : '16px',
          paddingBottom: '40px',
        }}
      >
        {openWhen.map((item, idx) => {
          const isOpened = openedEnvelopes.includes(idx);

          return (
            <motion.div
              key={idx}
              whileHover={{
                scale: 1.06,
                y: -10,
                rotateX: 6,
                transition: { type: 'spring', stiffness: 350, damping: 20 },
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleOpenEnvelope(idx)}
              style={{
                width: isDesktop ? '190px' : '100%',
                maxWidth: isDesktop ? '190px' : '360px',
                height: isDesktop ? '240px' : '110px',
                position: 'relative',
                cursor: 'pointer',
                perspective: '800px',
              }}
            >
              {/* Envelope Body */}
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '16px',
                  background: isOpened ? 'var(--paper)' : 'var(--envelope)',
                  border: '1.5px solid rgba(169, 192, 224, 0.85)',
                  boxShadow:
                    '0 6px 12px rgba(27, 42, 92, 0.08), 0 16px 32px rgba(27, 42, 92, 0.14), 0 32px 64px rgba(15, 27, 61, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'background 0.3s ease, box-shadow 0.3s ease',
                }}
              >
                {/* Flap shape accent */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '35%',
                    background: 'linear-gradient(180deg, var(--envelope-shade) 0%, rgba(169,192,224,0.7) 100%)',
                    clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                    boxShadow: '0 2px 6px rgba(27, 42, 92, 0.12)',
                    opacity: 0.85,
                  }}
                />

                <span
                  style={{
                    fontSize: '22px',
                    marginBottom: '8px',
                    zIndex: 2,
                  }}
                >
                  {isOpened ? '💌' : '✉️'}
                </span>

                <h3
                  className="text-title"
                  style={{
                    fontSize: isDesktop ? '22px' : '20px',
                    color: 'var(--navy)',
                    lineHeight: 1.25,
                    zIndex: 2,
                    margin: 0,
                  }}
                >
                  {item.label}
                </h3>

                <span
                  className="text-ui"
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: 'var(--ocean)',
                    marginTop: '8px',
                    zIndex: 2,
                  }}
                >
                  {isOpened ? '✓ read' : 'tap to open'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── EXPANDED MODAL SHEET WITH LIVE WRITING ── */}
      <AnimatePresence>
        {activeIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              background: 'rgba(15, 27, 61, 0.65)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: isDesktop ? '32px' : '16px',
            }}
          >
            <motion.div
              initial={{ scale: 0.8, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '640px',
                maxHeight: '85vh',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Paper
                deckled={true}
                style={{
                  padding: isDesktop ? '40px 44px' : '28px 20px',
                  borderRadius: '24px',
                  boxShadow: '0 20px 50px rgba(15, 27, 61, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: '85vh',
                  overflow: 'hidden',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--paper-aged)',
                    paddingBottom: '12px',
                    marginBottom: '16px',
                  }}
                >
                  <span
                    className="text-ui"
                    style={{
                      fontSize: '13px',
                      fontWeight: 800,
                      color: 'var(--ocean)',
                      letterSpacing: '0.06em',
                    }}
                  >
                    FOR MILANDI
                  </span>

                  <span className="text-title" style={{ fontSize: '20px', color: 'var(--ocean)' }}>
                    sweetnugget
                  </span>
                </div>

                <h3
                  className="text-title"
                  style={{
                    fontSize: isDesktop ? '34px' : '26px',
                    color: 'var(--navy)',
                    marginBottom: '16px',
                    textAlign: 'center',
                  }}
                >
                  {openWhen[activeIdx].label}
                </h3>

                {/* Live Handwritten Text */}
                <div
                  style={{
                    overflowY: 'auto',
                    flex: 1,
                    paddingRight: '6px',
                    marginBottom: '20px',
                  }}
                >
                  <LiveWriting
                    key={`open-when-${activeIdx}`}
                    text={openWhen[activeIdx].text}
                    className="text-body"
                    style={{
                      fontSize: isDesktop ? '26px' : '22px',
                      lineHeight: 1.6,
                    }}
                  />
                </div>

                {/* Footer Button */}
                <div style={{ textAlign: 'center', borderTop: '1px solid var(--paper-aged)', paddingTop: '14px' }}>
                  <button
                    onClick={handleCloseModal}
                    className="text-ui"
                    style={{
                      padding: '10px 24px',
                      borderRadius: '22px',
                      background: 'linear-gradient(135deg, var(--ocean), var(--navy))',
                      color: 'var(--white)',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(27, 42, 92, 0.25)',
                    }}
                  >
                    Keep in heart 💙
                  </button>
                </div>
              </Paper>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CONTINUE TO FINALE BUTTON ── */}
      {allOpened && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginTop: '20px' }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onComplete}
            className="text-ui"
            style={{
              padding: '14px 32px',
              borderRadius: '28px',
              background: 'linear-gradient(135deg, var(--ocean), var(--midnight))',
              color: 'var(--white)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              fontWeight: 800,
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(15, 27, 61, 0.35)',
            }}
          >
            To the finale ✨ →
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
