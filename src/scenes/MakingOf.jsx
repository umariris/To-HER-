import React from 'react';
import { motion } from 'framer-motion';
import Paper from '../components/Paper';
import Pomeranian from '../components/Pomeranian';
import { makingOf } from '../content';
import { useIsDesktop } from '../hooks/useIsDesktop';

export default function MakingOf({ goToScene }) {
  const isDesktop = useIsDesktop();

  const handleBack = () => {
    if (goToScene) {
      goToScene('Finale');
    }
  };

  return (
    <div
      className="scene safe-area"
      style={{
        position: 'fixed',
        inset: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        background: 'linear-gradient(180deg, var(--midnight) 0%, #1A2E62 50%, var(--navy) 100%)',
        padding: isDesktop ? '40px 48px' : '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          width: '100%',
          maxWidth: '720px',
          marginTop: '20px',
          paddingBottom: '80px',
        }}
      >
        <Paper
          deckled={true}
          style={{
            padding: isDesktop ? '48px 52px' : '32px 24px',
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(15, 27, 61, 0.4)',
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
              marginBottom: '20px',
            }}
          >
            <span
              className="text-ui"
              style={{
                fontSize: '13px',
                fontWeight: 800,
                color: 'var(--ocean)',
                letterSpacing: '0.08em',
              }}
            >
              BEHIND THE SCENES
            </span>
            <span className="text-title" style={{ fontSize: '24px', color: 'var(--ocean)' }}>
              sweetnugget
            </span>
          </div>

          <h2
            className="text-title"
            style={{
              fontSize: isDesktop ? '40px' : '30px',
              color: 'var(--navy)',
              marginBottom: '24px',
              textAlign: 'center',
            }}
          >
            The Making Of
          </h2>

          {/* Text in Dancing Script */}
          {makingOf.split('\n\n').map((para, idx) => (
            <p
              key={idx}
              className="text-body"
              style={{
                fontSize: isDesktop ? '26px' : '22px',
                lineHeight: 1.6,
                marginBottom: '1.4em',
                color: 'var(--ink)',
              }}
            >
              {para}
            </p>
          ))}

          {/* Footer with Tuffy and Back Button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid var(--paper-aged)',
              paddingTop: '20px',
              marginTop: '32px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 60, height: 60 }}>
                <Pomeranian mood="shy" size={60} />
              </div>
              <span className="text-body" style={{ fontSize: '18px', color: 'var(--navy)' }}>
                Built with love 💙
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
                onClick={handleBack}
                className="btn-card-primary shimmer-glow"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5"/>
                  <path d="M12 19l-7-7 7-7"/>
                </svg>
                <span>Back to Finale</span>
              </motion.button>
            </div>
          </div>
        </Paper>
      </motion.div>
    </div>
  );
}
