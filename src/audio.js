/**
 * Sound manager — handles song, pen, paper, pop audio.
 * Silently skips any missing files (no console errors).
 * Volumes from DESIGN.md: song 0.35, pen 0.15, paper/pop default 0.5.
 * Mute state persisted in localStorage (try/catch).
 */

const SOUNDS = {
  song: { src: '/audio/song.mp3', volume: 0.35, loop: true },
  pen:  { src: '/audio/pen.mp3',  volume: 0.15, loop: true },
  paper:{ src: '/audio/paper.mp3',volume: 0.5,  loop: false },
  pop:  { src: '/audio/pop.mp3',  volume: 0.5,  loop: false },
};

const instances = {};
let muted = false;
const listeners = new Set();

// Restore mute preference
try {
  const stored = localStorage.getItem('sweetnugget-muted');
  if (stored !== null) muted = stored === 'true';
} catch {
  // localStorage unavailable — ignore
}

function notifyListeners() {
  listeners.forEach((fn) => fn(muted));
}

/**
 * Subscribe to mute changes. Returns an unsubscribe function.
 */
export function onMuteChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  try {
    localStorage.setItem('sweetnugget-muted', String(muted));
  } catch {
    // ignore
  }

  // Apply to all active instances
  Object.values(instances).forEach((audio) => {
    if (audio) audio.muted = muted;
  });

  notifyListeners();
  return muted;
}

/**
 * Play a named sound. Returns the Audio element (or null if file is missing).
 */
export function play(name) {
  const config = SOUNDS[name];
  if (!config) return null;

  // For one-shot sounds, create a new Audio each time
  // For looping sounds (song), reuse the instance
  if (config.loop && instances[name]) {
    const audio = instances[name];
    if (audio.paused) {
      audio.play().catch(() => {});
    }
    return audio;
  }

  const audio = new Audio(config.src);
  audio.volume = config.volume;
  audio.loop = config.loop;
  audio.muted = muted;

  // Silently handle missing files
  audio.addEventListener('error', () => {
    // File doesn't exist or can't load — silently skip
  }, { once: true });

  if (config.loop) {
    instances[name] = audio;
  }

  audio.play().catch(() => {
    // Autoplay blocked or file missing — silently skip
  });

  return audio;
}

/**
 * Stop a named sound.
 */
export function stop(name) {
  const audio = instances[name];
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}

/**
 * Fade the song volume to a target over a duration (ms).
 */
export function fadeSong(targetVolume, duration = 1000) {
  const audio = instances.song;
  if (!audio) return;
  const startVol = audio.volume;
  const diff = targetVolume - startVol;
  const startTime = performance.now();

  const tick = () => {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    audio.volume = Math.max(0, Math.min(1, startVol + diff * progress));
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
