import React, { useState, useEffect } from 'react';
import { toggleMute, isMuted, onMuteChange } from '../audio';

/**
 * Mute toggle button — always visible, top-right corner.
 * Controls all sounds, remembers choice via localStorage.
 */
export default function MuteToggle() {
  const [muted, setMuted] = useState(isMuted());

  useEffect(() => {
    return onMuteChange(setMuted);
  }, []);

  return (
    <button
      className="mute-toggle glass"
      onClick={() => toggleMute()}
      aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
      title={muted ? 'Unmute' : 'Mute'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
}
