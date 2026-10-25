import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MuteToggle from './components/MuteToggle';
import SparkleTrail from './components/SparkleTrail';
import CursorGlow from './components/CursorGlow';
import { fadeSong } from './audio';

// Font imports (self-hosted via @fontsource)
import '@fontsource/great-vibes/400.css';
import '@fontsource/dancing-script/500.css';
import '@fontsource/nunito/600.css';
import '@fontsource/nunito/700.css';

import './theme.css';

// Lazy-load all scenes — only the active scene is mounted
const Intro      = lazy(() => import('./scenes/Intro'));
const TuffyCards  = lazy(() => import('./scenes/TuffyCards'));
const Letter      = lazy(() => import('./scenes/Letter'));
const YouPage     = lazy(() => import('./scenes/YouPage'));
const Moments     = lazy(() => import('./scenes/Moments'));
const OpenWhen    = lazy(() => import('./scenes/OpenWhen'));
const Finale      = lazy(() => import('./scenes/Finale'));
const MakingOf    = lazy(() => import('./scenes/MakingOf'));
const PomPreview  = lazy(() => import('./scenes/PomPreview'));

const SCENE_ORDER = [
  'Intro',
  'TuffyCards',
  'Letter',
  'YouPage',
  'Moments',
  'OpenWhen',
  'Finale',
  'MakingOf',
];

const SCENE_MAP = {
  Intro,
  TuffyCards,
  Letter,
  YouPage,
  Moments,
  OpenWhen,
  Finale,
  MakingOf,
  pomPreview: PomPreview,
};

function getInitialScene() {
  if (typeof window === 'undefined') return 'Intro';
  // ?scene= URL param takes priority for testing
  const params = new URLSearchParams(window.location.search);
  const requested = params.get('scene');
  if (requested && SCENE_MAP[requested]) return requested;
  // Restore saved progress (try/catch for localStorage)
  try {
    const saved = localStorage.getItem('sweetnugget-scene');
    if (saved && SCENE_MAP[saved]) return saved;
  } catch {
    // ignore
  }
  return 'Intro';
}

/* Smooth animated loading fallback */
function LoadingFallback() {
  return (
    <div
      className="scene"
      style={{
        background: 'linear-gradient(180deg, var(--sky-mist), var(--baby-blue))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        {/* Pulsing gradient circle loader */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--cornflower), var(--periwinkle), var(--powder-cyan))',
            boxShadow: '0 0 30px rgba(110, 155, 255, 0.3)',
          }}
        />
        <span
          className="text-ui"
          style={{
            fontSize: '14px',
            color: 'var(--ocean)',
            fontWeight: 700,
            letterSpacing: '0.04em',
          }}
        >
          Loading...
        </span>
      </motion.div>
    </div>
  );
}

export default function App() {
  const [currentScene, setCurrentScene] = useState(getInitialScene);

  // Save current scene progress to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sweetnugget-scene', currentScene);
    } catch {
      // ignore
    }
  }, [currentScene]);

  const goToScene = useCallback((name) => {
    // Fade song volume down/up between scenes for smooth transition
    fadeSong(0.15, 400);
    setTimeout(() => fadeSong(0.35, 600), 500);

    setCurrentScene(name);
    // Update URL for testing jumps
    const url = new URL(window.location);
    url.searchParams.set('scene', name);
    window.history.replaceState({}, '', url);
    // Scroll to top for scrollable scenes
    window.scrollTo(0, 0);
  }, []);

  const goNext = useCallback(() => {
    const idx = SCENE_ORDER.indexOf(currentScene);
    if (idx < SCENE_ORDER.length - 1) {
      goToScene(SCENE_ORDER[idx + 1]);
    }
  }, [currentScene, goToScene]);

  const SceneComponent = SCENE_MAP[currentScene];

  return (
    <>
      <MuteToggle />
      <SparkleTrail />
      <CursorGlow />

      {/* Persistent Minimal Return to Start Button (visible on all scenes except Intro) */}
      {currentScene !== 'Intro' && (
        <motion.button
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => goToScene('Intro')}
          className="return-to-start-btn"
          title="Return to start"
          aria-label="Return to start"
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </motion.button>
      )}

      <Suspense fallback={<LoadingFallback />}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScene}
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(8px)' }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            style={{ width: '100%', height: '100%' }}
          >
            <SceneComponent onComplete={goNext} goToScene={goToScene} />
          </motion.div>
        </AnimatePresence>
      </Suspense>
    </>
  );
}
