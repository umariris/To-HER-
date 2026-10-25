import React, { useState } from 'react';
import Pomeranian from '../components/Pomeranian';
import Paper from '../components/Paper';

const MOODS = ['idle', 'hop', 'trip', 'shy', 'wave', 'happy'];

export default function PomPreview({ goToScene }) {
  const [currentMood, setCurrentMood] = useState('idle');
  const [showCards, setShowCards] = useState(false);

  return (
    <div
      className="scene safe-area"
      style={{
        position: 'fixed',
        inset: 0,
        overflowY: 'auto',
        background: 'linear-gradient(180deg, var(--sky-mist) 0%, var(--baby-blue) 50%, var(--periwinkle) 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <Paper
        deckled={true}
        style={{
          padding: '32px 40px',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 16px 40px rgba(27, 42, 92, 0.15)',
          maxWidth: '540px',
          width: '100%',
        }}
      >
        <h2 className="text-title" style={{ fontSize: '36px', color: 'var(--navy)', marginBottom: '8px' }}>
          Tuffy Preview
        </h2>

        <p className="text-ui" style={{ fontSize: '14px', color: 'var(--ocean)', marginBottom: '24px', fontWeight: 700 }}>
          Current mood: <span style={{ textTransform: 'uppercase' }}>{currentMood}</span>
        </p>

        <div style={{ width: 220, height: 240, margin: '16px 0' }}>
          <Pomeranian mood={currentMood} size={220} showCards={showCards} />
        </div>

        {/* Buttons for each mood */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginTop: '16px' }}>
          {MOODS.map((m) => (
            <button
              key={m}
              onClick={() => setCurrentMood(m)}
              className="text-ui"
              style={{
                padding: '8px 18px',
                borderRadius: '18px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '14px',
                background: currentMood === m ? 'var(--ocean)' : 'rgba(61, 111, 216, 0.15)',
                color: currentMood === m ? 'var(--white)' : 'var(--navy)',
                boxShadow: currentMood === m ? '0 4px 12px rgba(61,111,216,0.3)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              {m}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '14px', marginTop: '24px' }}>
          <button
            onClick={() => setShowCards((v) => !v)}
            className="text-ui"
            style={{
              padding: '6px 14px',
              borderRadius: '14px',
              background: showCards ? 'var(--navy)' : 'rgba(27, 42, 92, 0.1)',
              color: showCards ? 'white' : 'var(--navy)',
              border: 'none',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Toggle Cards: {showCards ? 'ON' : 'OFF'}
          </button>

          {goToScene && (
            <button
              onClick={() => goToScene('Intro')}
              className="text-ui"
              style={{
                padding: '6px 14px',
                borderRadius: '14px',
                background: 'transparent',
                color: 'var(--ocean)',
                border: '1px solid var(--ocean)',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Go to Intro →
            </button>
          )}
        </div>
      </Paper>
    </div>
  );
}
