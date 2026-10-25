import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { passwordLines } from '../content';
import { play } from '../audio';
import { useIsDesktop } from '../hooks/useIsDesktop';
import './Intro.css';

/* ── SVG cloud shapes (blue shades only) ── */
const CloudSVG = ({ width = 220, fill = 'rgba(255,255,255,0.85)' }) => (
  <svg viewBox="0 0 220 80" width={width} height={(80 / 220) * width} fill="none">
    <ellipse cx="70"  cy="52" rx="60" ry="28" fill={fill} />
    <ellipse cx="130" cy="48" rx="50" ry="24" fill={fill} />
    <ellipse cx="100" cy="38" rx="44" ry="26" fill={fill} />
    <ellipse cx="55"  cy="44" rx="36" ry="22" fill={fill} />
    <ellipse cx="150" cy="54" rx="40" ry="20" fill={fill} />
  </svg>
);

/* ── Twinkling 4-point sparkle star SVG ── */
const SparkleSVG = ({ size = 16, color = 'rgba(255,255,255,0.95)' }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
    <path
      d="M12 0 C12 6.6, 6.6 12, 0 12 C6.6 12, 12 17.4, 12 24 C12 17.4, 17.4 12, 24 12 C17.4 12, 12 6.6, 12 0 Z"
      fill={color}
    />
  </svg>
);

/* ── Dreamy floating heart SVG ── */
const HeartSVG = ({ size = 18, fill = 'rgba(191,223,255,0.5)' }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={fill}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

/* ── Cloud data for 3 parallax layers ── */
const cloudData = [
  // Layer 1: back — slow, large, faint
  { layer: 1, top: '8%',   left: '-5%',  w: 320, fill: 'rgba(214,236,255,0.7)',  delay: '0s',   bobDelay: '0s' },
  { layer: 1, top: '28%',  left: '32%',  w: 270, fill: 'rgba(191,223,255,0.6)',  delay: '-20s', bobDelay: '-2s' },
  { layer: 1, top: '56%',  left: '65%',  w: 290, fill: 'rgba(214,236,255,0.5)',  delay: '-40s', bobDelay: '-4s' },
  // Layer 2: mid
  { layer: 2, top: '14%',  left: '18%',  w: 210, fill: 'rgba(255,255,255,0.82)', delay: '0s',   bobDelay: '-1s' },
  { layer: 2, top: '42%',  left: '52%',  w: 190, fill: 'rgba(214,236,255,0.75)', delay: '-15s', bobDelay: '-3s' },
  { layer: 2, top: '68%',  left: '-8%',  w: 230, fill: 'rgba(191,223,255,0.7)',  delay: '-30s', bobDelay: '-5s' },
  // Layer 3: front — fast, small
  { layer: 3, top: '18%',  left: '42%',  w: 145, fill: 'rgba(255,255,255,0.92)', delay: '0s',   bobDelay: '-0.5s' },
  { layer: 3, top: '48%',  left: '8%',   w: 125, fill: 'rgba(255,255,255,0.88)', delay: '-10s', bobDelay: '-2.5s' },
  { layer: 3, top: '78%',  left: '72%',  w: 155, fill: 'rgba(214,236,255,0.85)', delay: '-20s', bobDelay: '-4.5s' },
];

/* ── Twinkling fairy sparkles ── */
const sparkleData = [
  { id: 1,  top: '7%',  left: '11%', size: 18, delay: '0s',   dur: '3.4s', color: 'rgba(255, 255, 255, 0.95)' },
  { id: 2,  top: '15%', left: '25%', size: 13, delay: '1.2s', dur: '4.2s', color: 'rgba(159, 227, 245, 0.9)' },
  { id: 3,  top: '9%',  left: '73%', size: 20, delay: '0.5s', dur: '3.8s', color: 'rgba(214, 236, 255, 0.95)' },
  { id: 4,  top: '18%', left: '91%', size: 15, delay: '2.0s', dur: '4.6s', color: 'rgba(255, 255, 255, 0.9)' },
  { id: 5,  top: '28%', left: '8%',  size: 22, delay: '1.7s', dur: '3.9s', color: 'rgba(169, 184, 255, 0.85)' },
  { id: 6,  top: '38%', left: '19%', size: 12, delay: '2.5s', dur: '4.0s', color: 'rgba(255, 255, 255, 0.85)' },
  { id: 7,  top: '31%', left: '84%', size: 17, delay: '0.8s', dur: '3.5s', color: 'rgba(159, 227, 245, 0.9)' },
  { id: 8,  top: '46%', left: '93%', size: 14, delay: '3.0s', dur: '4.7s', color: 'rgba(214, 236, 255, 0.85)' },
  { id: 9,  top: '63%', left: '6%',  size: 16, delay: '1.1s', dur: '3.8s', color: 'rgba(255, 255, 255, 0.9)' },
  { id: 10, top: '75%', left: '16%', size: 19, delay: '2.3s', dur: '4.4s', color: 'rgba(159, 227, 245, 0.95)' },
  { id: 11, top: '69%', left: '85%', size: 15, delay: '0.3s', dur: '3.6s', color: 'rgba(169, 184, 255, 0.85)' },
  { id: 12, top: '83%', left: '77%', size: 20, delay: '1.8s', dur: '4.5s', color: 'rgba(255, 255, 255, 0.9)' },
  { id: 13, top: '88%', left: '31%', size: 13, delay: '3.2s', dur: '3.6s', color: 'rgba(214, 236, 255, 0.85)' },
  { id: 14, top: '92%', left: '59%', size: 16, delay: '1.5s', dur: '4.1s', color: 'rgba(159, 227, 245, 0.9)' },
  { id: 15, top: '6%',  left: '47%', size: 14, delay: '2.7s', dur: '3.7s', color: 'rgba(255, 255, 255, 0.85)' },
  { id: 16, top: '50%', left: '9%',  size: 18, delay: '0.7s', dur: '4.3s', color: 'rgba(169, 184, 255, 0.9)' },
];

/* ── Dreamy floating pastel hearts ── */
const floatingHeartData = [
  { id: 1, left: '11%', size: 18, dur: 15, delay: 0,  fill: 'rgba(191, 223, 255, 0.55)' },
  { id: 2, left: '23%', size: 14, dur: 18, delay: 5,  fill: 'rgba(169, 184, 255, 0.45)' },
  { id: 3, left: '79%', size: 20, dur: 16, delay: 2,  fill: 'rgba(159, 227, 245, 0.55)' },
  { id: 4, left: '89%', size: 16, dur: 20, delay: 8,  fill: 'rgba(214, 236, 255, 0.5)' },
  { id: 5, left: '5%',  size: 22, dur: 17, delay: 11, fill: 'rgba(180, 210, 255, 0.45)' },
  { id: 6, left: '71%', size: 15, dur: 19, delay: 13, fill: 'rgba(191, 223, 255, 0.5)' },
  { id: 7, left: '36%', size: 17, dur: 21, delay: 4,  fill: 'rgba(159, 227, 245, 0.4)' },
  { id: 8, left: '63%', size: 13, dur: 22, delay: 14, fill: 'rgba(169, 184, 255, 0.45)' },
];

/* ── Floating glowing particles data ── */
const particleData = Array.from({ length: 20 }).map((_, i) => ({
  id: i,
  left: `${(i * 5.1 + 3) % 96}%`,
  size: (i % 3) * 1.5 + 2.5,
  duration: 9 + (i % 7) * 1.8,
  delay: (i % 5) * 1.3,
  opacity: 0.35 + (i % 4) * 0.15,
}));

export default function Intro({ onComplete }) {
  const isDesktop = useIsDesktop();
  const [value, setValue] = useState('');
  const [shaking, setShaking] = useState(false);
  const [message, setMessage] = useState('');
  const [wrongIdx, setWrongIdx] = useState(-1);
  const [phase, setPhase] = useState('waiting'); // waiting | fadein-text | card | success | exit
  const inputRef = useRef(null);
  const sceneRef = useRef(null);

  // After 1.5s show waiting text, after 2.5s show card
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('fadein-text'), 1500);
    const t2 = setTimeout(() => setPhase('card'), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Music starts only after her first tap on the password screen
  useEffect(() => {
    const handleFirstTap = () => {
      play('song');
      window.removeEventListener('pointerdown', handleFirstTap);
    };
    window.addEventListener('pointerdown', handleFirstTap, { once: true });
    return () => {
      window.removeEventListener('pointerdown', handleFirstTap);
    };
  }, []);

  const pickNextWrong = useCallback(() => {
    let next;
    do {
      next = Math.floor(Math.random() * passwordLines.wrong.length);
    } while (next === wrongIdx && passwordLines.wrong.length > 1);
    setWrongIdx(next);
    return passwordLines.wrong[next];
  }, [wrongIdx]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const normalized = value.trim().toLowerCase().replace(/\s+/g, '');
      if (normalized === 'sweetnugget') {
        setMessage(passwordLines.success);
        setPhase('success');
        // Start music
        play('song');
        // Zoom-blur transition after 1.5s
        setTimeout(() => {
          setPhase('exit');
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 500);
        }, 1500);
      } else {
        // Wrong answer — shake and show message
        const wrongMsg = pickNextWrong();
        setMessage(wrongMsg);
        setShaking(true);
        setTimeout(() => setShaking(false), 500);
      }
    },
    [value, onComplete, pickNextWrong]
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit(e);
  };

  const showWaiting = phase === 'fadein-text' || phase === 'card' || phase === 'success';
  const showCard = phase === 'card' || phase === 'success';

  // Lightweight particle and heart counts on mobile for silky smooth 60fps
  const activeParticles = isDesktop ? particleData : particleData.slice(0, 6);
  const activeHearts = isDesktop ? floatingHeartData : floatingHeartData.slice(0, 3);
  const activeSparkles = isDesktop ? sparkleData : sparkleData.slice(0, 6);

  return (
    <div className="scene intro safe-area" ref={sceneRef}>
      {/* ── Background Aurora Light Waves ── */}
      <div className="intro__aurora">
        <div className="intro__aurora-wave intro__aurora-wave--1" />
        <div className="intro__aurora-wave intro__aurora-wave--2" />
      </div>

      {/* ── Shooting Stars / Dream Streaks ── */}
      <div className="intro__shooting-stars">
        <div className="intro__shooting-star intro__shooting-star--1" />
        <div className="intro__shooting-star intro__shooting-star--2" />
      </div>

      {/* ── Gradient Orbs with Parallax Wrappers ── */}
      <div className="intro__orbs">
        <div
          className="intro__orb-wrap"
          style={{ transform: 'translate(calc(var(--mouse-norm-x, 0) * -16px), calc(var(--mouse-norm-y, 0) * -10px))' }}
        >
          <div className="intro__orb intro__orb--1" />
        </div>
        <div
          className="intro__orb-wrap"
          style={{ transform: 'translate(calc(var(--mouse-norm-x, 0) * 14px), calc(var(--mouse-norm-y, 0) * 8px))' }}
        >
          <div className="intro__orb intro__orb--2" />
        </div>
        <div
          className="intro__orb-wrap"
          style={{ transform: 'translate(calc(var(--mouse-norm-x, 0) * -8px), calc(var(--mouse-norm-y, 0) * -6px))' }}
        >
          <div className="intro__orb intro__orb--3" />
        </div>
        <div
          className="intro__orb-wrap"
          style={{ transform: 'translate(calc(var(--mouse-norm-x, 0) * 10px), calc(var(--mouse-norm-y, 0) * -8px))' }}
        >
          <div className="intro__orb intro__orb--4" />
        </div>
      </div>

      {/* ── Floating Luminous Dust & Micro-particles ── */}
      <div className="intro__particles">
        {activeParticles.map((p) => (
          <div
            key={p.id}
            className="intro__particle"
            style={{
              left: p.left,
              bottom: '-12px',
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: `radial-gradient(circle, rgba(169, 215, 255, ${p.opacity}) 0%, rgba(110, 155, 255, ${p.opacity * 0.6}) 50%, transparent 100%)`,
              animation: `particle-rise ${p.duration}s ${p.delay}s linear infinite`,
            }}
          />
        ))}
      </div>

      {/* ── Floating Dreamy Pastel Hearts ── */}
      <div className="intro__hearts">
        {activeHearts.map((h) => (
          <div
            key={h.id}
            className="intro__heart-item"
            style={{
              left: h.left,
              animation: `float-heart-rise ${h.dur}s ${h.delay}s linear infinite`,
            }}
          >
            <div className="intro__heart-sway">
              <HeartSVG size={h.size} fill={h.fill} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Twinkling 4-Point Fairy Stars / Sparkles ── */}
      <div
        className="intro__sparkles"
        style={{
          transform: 'translate(calc(var(--mouse-norm-x, 0) * 12px), calc(var(--mouse-norm-y, 0) * 8px))',
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {activeSparkles.map((s) => (
          <div
            key={s.id}
            className="intro__sparkle"
            style={{
              top: s.top,
              left: s.left,
              animation: `sparkle-twinkle ${s.dur} ${s.delay} ease-in-out infinite`,
            }}
          >
            <SparkleSVG size={s.size} color={s.color} />
          </div>
        ))}
      </div>

      {/* ── 3 Cloud layers with Parallax and Gentle Bobbing ── */}
      <div
        className="intro__clouds"
        style={{
          transform: 'translate(calc(var(--mouse-norm-x, 0) * -10px), calc(var(--mouse-norm-y, 0) * -6px))',
          transition: 'transform 0.15s linear',
        }}
      >
        {cloudData.map((c, i) => (
          <div
            key={i}
            className={`intro__cloud intro__cloud--layer${c.layer}`}
            style={{
              top: c.top,
              left: c.left,
              animationDelay: c.delay,
            }}
          >
            <div
              className="intro__cloud-inner"
              style={{ animationDelay: c.bobDelay }}
            >
              <CloudSVG width={c.w} fill={c.fill} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Perfectly Centered Waiting Text (Full width container above card) ── */}
      <AnimatePresence>
        {showWaiting && (
          <motion.div
            className="intro__waiting-wrap"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <motion.p
              className="intro__waiting"
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              Something is waiting for you
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Password Card Centered in Screen ── */}
      <AnimatePresence>
        {showCard && (
          <motion.div
            className="intro__card-wrap"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            style={{
              transform: isDesktop
                ? 'perspective(1000px) rotateY(calc(var(--mouse-norm-x, 0) * 6deg)) rotateX(calc(var(--mouse-norm-y, 0) * -6deg))'
                : undefined,
              transition: 'transform 0.12s ease-out',
            }}
          >
            {/* Celestial glowing halo rings behind card */}
            <div className="intro__halo-ring intro__halo-ring--1" />
            <div className="intro__halo-ring intro__halo-ring--2" />

            <form
              className={`intro__card glass glass--blur ${shaking ? 'intro__card--shake' : ''}`}
              onSubmit={handleSubmit}
            >
              <h2>{passwordLines.question}</h2>
              <div className="intro__input-group">
                <input
                  ref={inputRef}
                  className="intro__input"
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type here…"
                  autoFocus
                  autoComplete="off"
                  id="password-input"
                />
                <button className="intro__btn" type="submit" id="password-submit">
                  Open
                </button>
              </div>
              <AnimatePresence mode="wait">
                {message && (
                  <motion.p
                    key={message}
                    className="intro__message"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {message}
                  </motion.p>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Zoom-blur Exit Overlay ── */}
      <AnimatePresence>
        {phase === 'exit' && (
          <motion.div
            className="intro__zoom-blur"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
