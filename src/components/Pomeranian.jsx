import React, { useState, useEffect, useRef, useId } from 'react';
import { motion } from 'framer-motion';
import { useIsDesktop } from '../hooks/useIsDesktop';

/* ────────────────────────────────────────────
   Framer Motion variants for each group
   ──────────────────────────────────────────── */

const wholeVariants = {
  idle: { y: 0, rotate: 0, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  hop: {
    y: [0, -35, 0],
    transition: { duration: 0.5, times: [0, 0.4, 1], ease: 'easeOut' },
  },
  trip: {
    rotate: [0, -12, 18, -5, 0],
    x: [0, -15, 8, 0],
    transition: { duration: 0.8, times: [0, 0.2, 0.5, 0.8, 1] },
  },
  shy: { y: 0, rotate: 0, x: 0, transition: { duration: 0.4 } },
  wave: { y: 0, rotate: 0, x: 0, transition: { duration: 0.3 } },
  happy: {
    y: [0, -18, 0],
    transition: { duration: 0.35, repeat: 3, repeatType: 'loop' },
  },
};

const shadowVariants = {
  idle: {
    scaleX: [1, 1.05, 1],
    opacity: [0.26, 0.32, 0.26],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
  hop: {
    scale: [1, 0.5, 1],
    opacity: [0.28, 0.08, 0.28],
    transition: { duration: 0.5, times: [0, 0.4, 1], ease: 'easeOut' },
  },
  trip: {
    scaleX: [1, 1.25, 0.85, 1],
    x: [0, -10, 5, 0],
    opacity: [0.28, 0.35, 0.24, 0.28],
    transition: { duration: 0.8, times: [0, 0.2, 0.6, 1] },
  },
  shy: { scaleX: 0.9, opacity: 0.2, transition: { duration: 0.4 } },
  wave: { scaleX: 1, opacity: 0.26, transition: { duration: 0.3 } },
  happy: {
    scale: [1, 0.75, 1],
    opacity: [0.28, 0.15, 0.28],
    transition: { duration: 0.35, repeat: 3 },
  },
};


const bodyVariants = {
  idle: {
    scaleY: [1, 1.03, 1],
    transition: { scaleY: { duration: 3, repeat: Infinity, ease: 'easeInOut' } },
  },
  hop: {
    scaleY: [1, 0.8, 1.15, 0.95, 1],
    transition: { duration: 0.5, times: [0, 0.2, 0.45, 0.7, 1] },
  },
  trip: { scaleY: 1, transition: { duration: 0.3 } },
  shy: { scaleY: 0.95, transition: { duration: 0.4 } },
  wave: { scaleY: 1, transition: { duration: 0.3 } },
  happy: {
    scaleY: [1, 0.92, 1.05, 1],
    transition: { duration: 0.4, repeat: 3 },
  },
};

const tailVariants = {
  idle: {
    rotate: [-8, 8],
    transition: { rotate: { duration: 1.2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' } },
  },
  hop: { rotate: 15, transition: { duration: 0.3 } },
  trip: { rotate: [0, 30], transition: { duration: 0.5 } },
  shy: { rotate: -5, transition: { duration: 0.3 } },
  wave: { rotate: 0, transition: { duration: 0.3 } },
  happy: {
    rotate: [-15, 15],
    transition: { rotate: { duration: 0.25, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' } },
  },
};

const headVariants = {
  idle: { rotate: 0, y: 0, transition: { duration: 0.4 } },
  hop: { y: -3, transition: { duration: 0.3 } },
  trip: { rotate: -8, y: 5, transition: { duration: 0.4 } },
  shy: { rotate: -8, transition: { duration: 0.5 } },
  wave: { rotate: 0, transition: { duration: 0.3 } },
  happy: { y: -2, transition: { duration: 0.3 } },
};

const earLVariants = {
  idle: {
    rotate: [0, -4, 0],
    transition: { rotate: { duration: 4, repeat: Infinity, ease: 'easeInOut' } },
  },
  hop: { rotate: -5, transition: { duration: 0.3 } },
  trip: { rotate: 10, transition: { duration: 0.3 } },
  shy: { rotate: 20, transition: { duration: 0.4 } },
  wave: { rotate: 0, transition: { duration: 0.3 } },
  happy: { rotate: -5, transition: { duration: 0.3 } },
};

const earRVariants = {
  idle: {
    rotate: [0, 4, 0],
    transition: { rotate: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 } },
  },
  hop: { rotate: 5, transition: { duration: 0.3 } },
  trip: { rotate: -10, transition: { duration: 0.3 } },
  shy: { rotate: -20, transition: { duration: 0.4 } },
  wave: { rotate: 0, transition: { duration: 0.3 } },
  happy: { rotate: 5, transition: { duration: 0.3 } },
};

const cheekVariants = {
  idle: { opacity: 0.35, transition: { duration: 0.3 } },
  hop: { opacity: 0.35 },
  trip: { opacity: 0.5, transition: { duration: 0.3 } },
  shy: { opacity: 0.7, transition: { duration: 0.5 } },
  wave: { opacity: 0.4, transition: { duration: 0.3 } },
  happy: { opacity: 0.6, transition: { duration: 0.3 } },
};

const pawLVariants = {
  idle: { rotate: 0, y: 0, transition: { duration: 0.3 } },
  hop: { rotate: 0 },
  trip: { rotate: -15, transition: { duration: 0.3 } },
  shy: { rotate: 0, transition: { duration: 0.3 } },
  wave: {
    rotate: [0, -30, 0, -30, 0],
    y: [0, -8, 0, -8, 0],
    transition: { duration: 1.2, repeat: Infinity },
  },
  happy: { rotate: 0 },
};

const cardStackVariants = {
  idle: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  hop: { opacity: 1, y: -5 },
  trip: { opacity: 0, y: -20, rotate: 15, transition: { duration: 0.4 } },
  shy: { opacity: 0 },
  wave: { opacity: 0 },
  happy: { opacity: 0 },
};

const eyeSpring = { type: 'spring', stiffness: 300, damping: 25 };

/* ────────────────────────────────────────────
   Pomeranian component
   ──────────────────────────────────────────── */

export default function Pomeranian({ mood = 'idle', size = 200, showCards = false }) {
  const isDesktop = useIsDesktop();
  const svgRef = useRef(null);
  const uid = useId().replace(/:/g, '');
  const [blinking, setBlinking] = useState(false);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });

  /* ── Blink every 3-5 s during idle ── */
  useEffect(() => {
    if (mood !== 'idle' && mood !== 'happy') return;
    let timerId;
    const blink = () => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 150);
      timerId = setTimeout(blink, 3000 + Math.random() * 2000);
    };
    timerId = setTimeout(blink, 2000 + Math.random() * 1500);
    return () => clearTimeout(timerId);
  }, [mood]);

  /* ── Eye tracking (desktop only, max 3 px) ── */
  useEffect(() => {
    if (!isDesktop) return;
    const handler = (e) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const sx = rect.width / 200;
      const sy = rect.height / 240;
      const cx = rect.left + 100 * sx;
      const cy = rect.top + 80 * sy;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 1) { setEyeOffset({ x: 0, y: 0 }); return; }
      const s = Math.min(dist / 120, 1);
      setEyeOffset({ x: (dx / dist) * 3 * s, y: (dy / dist) * 3 * s });
    };
    window.addEventListener('mousemove', handler, { passive: true });
    return () => window.removeEventListener('mousemove', handler);
  }, [isDesktop]);

  const g = (name) => `${uid}${name}`;
  const isHappy = mood === 'happy';

  return (
    <motion.svg
      ref={svgRef}
      viewBox="0 0 200 240"
      width={size}
      height={size * 1.2}
      style={{ overflow: 'visible', display: 'block' }}
      aria-label="Tuffy the Pomeranian"
    >
      <defs>
        <radialGradient id={g('head')} cx="50%" cy="42%" r="58%">
          <stop offset="0%" stopColor="#D6ECFF" />
          <stop offset="100%" stopColor="#BFDFFF" />
        </radialGradient>
        <radialGradient id={g('iris')} cx="38%" cy="32%" r="55%">
          <stop offset="0%" stopColor="#8AB8FF" />
          <stop offset="60%" stopColor="#6E9BFF" />
          <stop offset="100%" stopColor="#3D6FD8" />
        </radialGradient>
        <linearGradient id={g('fur')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D6ECFF" />
          <stop offset="100%" stopColor="#BFDFFF" />
        </linearGradient>
        <radialGradient id={g('cheek')} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#9FE3F5" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#9FE3F5" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={g('groundShadow')} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1B2A5C" stopOpacity="0.75" />
          <stop offset="55%" stopColor="#3D6FD8" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#3D6FD8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── GROUND SHADOW (stays grounded on floor, reacts dynamically to mood) ── */}
      <motion.ellipse
        cx="100"
        cy="210"
        rx="46"
        ry="8"
        fill={`url(#${g('groundShadow')})`}
        animate={mood}
        variants={shadowVariants}
        style={{ transformOrigin: '100px 210px' }}
      />

      <motion.g animate={mood} variants={wholeVariants} style={{ transformOrigin: '100px 210px' }}>

        {/* ── TAIL ── */}
        <motion.g variants={tailVariants} style={{ transformOrigin: '132px 158px' }}>
          <ellipse cx="146" cy="148" rx="17" ry="13" fill="#BFDFFF" transform="rotate(-25 146 148)" />
          <ellipse cx="156" cy="133" rx="14" ry="11" fill="#D6ECFF" transform="rotate(-40 156 133)" />
          <ellipse cx="153" cy="119" rx="12" ry="9" fill="#D6ECFF" transform="rotate(-15 153 119)" />
          <ellipse cx="148" cy="109" rx="10" ry="8" fill="#FFFFFF" opacity="0.6" />
          <ellipse cx="144" cy="104" rx="7" ry="6" fill="#FFFFFF" opacity="0.4" />
        </motion.g>

        {/* ── BODY ── */}
        <motion.g variants={bodyVariants} style={{ transformOrigin: '100px 185px' }}>
          <ellipse cx="100" cy="170" rx="38" ry="30" fill={`url(#${g('fur')})`} />
          <ellipse cx="100" cy="176" rx="26" ry="19" fill="#D6ECFF" opacity="0.4" />
        </motion.g>

        {/* ── FEET ── */}
        <g id="footL">
          <ellipse cx="80" cy="202" rx="13" ry="6" fill="#D6ECFF" />
          <ellipse cx="77" cy="204" rx="3.5" ry="2" fill="#A9B8FF" opacity="0.3" />
          <ellipse cx="83" cy="204" rx="3.5" ry="2" fill="#A9B8FF" opacity="0.3" />
        </g>
        <g id="footR">
          <ellipse cx="120" cy="202" rx="13" ry="6" fill="#D6ECFF" />
          <ellipse cx="117" cy="204" rx="3.5" ry="2" fill="#A9B8FF" opacity="0.3" />
          <ellipse cx="123" cy="204" rx="3.5" ry="2" fill="#A9B8FF" opacity="0.3" />
        </g>

        {/* ── RUFF (big scalloped fluffy collar) ── */}
        <g id="ruff">
          <ellipse cx="100" cy="136" rx="54" ry="30" fill="#BFDFFF" />
          {/* Scallop ring */}
          <circle cx="50"  cy="133" r="17" fill="#D6ECFF" />
          <circle cx="63"  cy="118" r="16" fill="#D6ECFF" />
          <circle cx="80"  cy="110" r="17" fill="#D6ECFF" />
          <circle cx="100" cy="107" r="16" fill="#D6ECFF" />
          <circle cx="120" cy="110" r="17" fill="#D6ECFF" />
          <circle cx="137" cy="118" r="16" fill="#D6ECFF" />
          <circle cx="150" cy="133" r="17" fill="#D6ECFF" />
          {/* White tips */}
          <circle cx="46"  cy="129" r="9"  fill="#FFFFFF" opacity="0.45" />
          <circle cx="154" cy="129" r="9"  fill="#FFFFFF" opacity="0.45" />
          <circle cx="70"  cy="108" r="8"  fill="#FFFFFF" opacity="0.35" />
          <circle cx="130" cy="108" r="8"  fill="#FFFFFF" opacity="0.35" />
          <circle cx="100" cy="103" r="8"  fill="#FFFFFF" opacity="0.35" />
          {/* Lower ruff puffs */}
          <circle cx="60"  cy="148" r="13" fill="#D6ECFF" opacity="0.5" />
          <circle cx="140" cy="148" r="13" fill="#D6ECFF" opacity="0.5" />
        </g>

        {/* ── CARD STACK (on back, used by TuffyCards scene) ── */}
        {showCards && (
          <motion.g variants={cardStackVariants} style={{ transformOrigin: '108px 148px' }}>
            <rect x="96"  y="132" width="22" height="28" rx="2" fill="#E9F0F7" stroke="#A9C0E0" strokeWidth="0.8" transform="rotate(-6 107 146)" />
            <rect x="98"  y="129" width="22" height="28" rx="2" fill="#E9F0F7" stroke="#A9C0E0" strokeWidth="0.8" transform="rotate(4 109 143)" />
            <rect x="94"  y="126" width="22" height="28" rx="2" fill="#E9F0F7" stroke="#A9C0E0" strokeWidth="0.8" transform="rotate(-2 105 140)" />
          </motion.g>
        )}

        {/* ── PAWS ── */}
        <motion.g id="pawL" variants={pawLVariants} style={{ transformOrigin: '76px 184px' }}>
          <ellipse cx="76" cy="192" rx="11" ry="7" fill="#D6ECFF" />
          <circle cx="73" cy="194" r="2.5" fill="#A9B8FF" opacity="0.35" />
          <circle cx="79" cy="194" r="2.5" fill="#A9B8FF" opacity="0.35" />
        </motion.g>
        <g id="pawR">
          <ellipse cx="124" cy="192" rx="11" ry="7" fill="#D6ECFF" />
          <circle cx="121" cy="194" r="2.5" fill="#A9B8FF" opacity="0.35" />
          <circle cx="127" cy="194" r="2.5" fill="#A9B8FF" opacity="0.35" />
        </g>

        {/* ── HEAD GROUP (head + ears + face) ── */}
        <motion.g variants={headVariants} style={{ transformOrigin: '100px 110px' }}>

          {/* Head shape */}
          <ellipse cx="100" cy="80" rx="58" ry="50" fill={`url(#${g('head')})`} />
          {/* Fluffy tufts around the head edge */}
          <circle cx="46"  cy="76" r="11" fill="#D6ECFF" />
          <circle cx="50"  cy="60" r="9"  fill="#FFFFFF" opacity="0.35" />
          <circle cx="154" cy="76" r="11" fill="#D6ECFF" />
          <circle cx="150" cy="60" r="9"  fill="#FFFFFF" opacity="0.35" />
          <circle cx="68"  cy="38" r="9"  fill="#D6ECFF" />
          <circle cx="132" cy="38" r="9"  fill="#D6ECFF" />
          <circle cx="100" cy="34" r="10" fill="#FFFFFF" opacity="0.28" />
          <circle cx="88"  cy="36" r="8"  fill="#D6ECFF" />
          <circle cx="112" cy="36" r="8"  fill="#D6ECFF" />
          {/* Forehead fluff */}
          <circle cx="82"  cy="42" r="6" fill="#FFFFFF" opacity="0.2" />
          <circle cx="118" cy="42" r="6" fill="#FFFFFF" opacity="0.2" />

          {/* ── EARS ── */}
          <motion.g id="earL" variants={earLVariants} style={{ transformOrigin: '62px 54px' }}>
            <path d="M62,54 L44,18 L72,44 Z" fill="#BFDFFF" />
            <path d="M60,50 L48,24 L68,44 Z" fill="#A9B8FF" />
            <circle cx="46" cy="20" r="5" fill="#D6ECFF" />
          </motion.g>
          <motion.g id="earR" variants={earRVariants} style={{ transformOrigin: '138px 54px' }}>
            <path d="M138,54 L156,18 L128,44 Z" fill="#BFDFFF" />
            <path d="M140,50 L152,24 L132,44 Z" fill="#A9B8FF" />
            <circle cx="154" cy="20" r="5" fill="#D6ECFF" />
          </motion.g>

          {/* ── CHEEKS ── */}
          <motion.g variants={cheekVariants}>
            <circle cx="56" cy="92" r="11" fill={`url(#${g('cheek')})`} />
            <circle cx="144" cy="92" r="11" fill={`url(#${g('cheek')})`} />
          </motion.g>

          {/* ── EYES (blink wrapper) ── */}
          <motion.g
            animate={{ scaleY: blinking ? 0.05 : 1 }}
            transition={{ duration: blinking ? 0.08 : 0.15 }}
            style={{ transformOrigin: '100px 80px' }}
          >
            {/* Left eye */}
            <g id="eyeL">
              <circle cx="78" cy="78" r="15" fill="#FFFFFF" />
              <circle cx="78" cy="78" r="15" fill="none" stroke="#D6ECFF" strokeWidth="0.8" />
              <motion.g animate={{ x: eyeOffset.x, y: eyeOffset.y }} transition={eyeSpring}>
                <circle cx="78" cy="80" r="12" fill={`url(#${g('iris')})`} />
                <circle cx="78" cy="80" r="12" fill="none" stroke="#3D6FD8" strokeWidth="1.2" />
                <circle cx="78" cy="80" r="5.5" fill="#1B2A5C" />
                <circle cx="74" cy="75" r="4" fill="#FFFFFF" opacity="0.92" />
                <circle cx="83" cy="84" r="2" fill="#FFFFFF" opacity="0.65" />
              </motion.g>
            </g>
            {/* Right eye */}
            <g id="eyeR">
              <circle cx="122" cy="78" r="15" fill="#FFFFFF" />
              <circle cx="122" cy="78" r="15" fill="none" stroke="#D6ECFF" strokeWidth="0.8" />
              <motion.g animate={{ x: eyeOffset.x, y: eyeOffset.y }} transition={eyeSpring}>
                <circle cx="122" cy="80" r="12" fill={`url(#${g('iris')})`} />
                <circle cx="122" cy="80" r="12" fill="none" stroke="#3D6FD8" strokeWidth="1.2" />
                <circle cx="122" cy="80" r="5.5" fill="#1B2A5C" />
                <circle cx="118" cy="75" r="4" fill="#FFFFFF" opacity="0.92" />
                <circle cx="127" cy="84" r="2" fill="#FFFFFF" opacity="0.65" />
              </motion.g>
            </g>
          </motion.g>

          {/* ── NOSE ── */}
          <g id="nose">
            <ellipse cx="100" cy="100" rx="5.5" ry="4" fill="#1B2A5C" />
            <ellipse cx="98.5" cy="99" rx="2.2" ry="1.3" fill="#3D6FD8" opacity="0.3" />
          </g>

          {/* ── MOUTH ── */}
          <g id="mouth">
            {isHappy ? (
              <>
                <path d="M89,105 Q95,118 100,118 Q105,118 111,105" fill="none" stroke="#1B2A5C" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M91,106 Q96,115 100,115 Q104,115 109,106" fill="#0F1B3D" opacity="0.06" />
                <ellipse cx="100" cy="115" rx="5.5" ry="4.5" fill="#9FE3F5" />
              </>
            ) : (
              <>
                <path d="M93,106 Q97,113 100,113 Q103,113 107,106" fill="none" stroke="#1B2A5C" strokeWidth="1.5" strokeLinecap="round" />
                <ellipse cx="100" cy="113" rx="3.8" ry="2.8" fill="#9FE3F5" />
              </>
            )}
          </g>

        </motion.g>
        {/* end head group */}

      </motion.g>
      {/* end whole */}
    </motion.svg>
  );
}
