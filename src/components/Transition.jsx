import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Transition wrapper — supports 'fade' and 'zoomBlur' modes.
 * zoomBlur uses layered scale/opacity to fake a blur transition
 * (no live blur filters for performance).
 */

const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.6, ease: 'easeInOut' } },
  exit: { opacity: 0, transition: { duration: 0.4, ease: 'easeInOut' } },
};

const zoomBlurVariants = {
  initial: { opacity: 0, scale: 0.85 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] },
  },
  exit: {
    opacity: 0,
    scale: 1.3,
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
  },
};

const variants = {
  fade: fadeVariants,
  zoomBlur: zoomBlurVariants,
};

export default function Transition({
  children,
  mode = 'fade',
  transitionKey,
  style = {},
}) {
  const v = variants[mode] || fadeVariants;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={transitionKey}
        variants={v}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ width: '100%', height: '100%', ...style }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
