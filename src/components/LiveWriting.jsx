import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { play, stop } from '../audio';

/**
 * LiveWriting Component
 * Renders handwritten text appearing in real time word-by-word.
 * Unwritten words are hidden via clip-path: inset(0 100% 0 0).
 * Never splits individual letters to preserve cursive font kerning.
 * Tap anywhere on the container to complete instantly.
 */
export default function LiveWriting({
  text = '',
  onComplete,
  className = '',
  style = {},
  speedMultiplier = 1,
}) {
  const containerRef = useRef(null);
  const penRef = useRef(null);
  const [isFinished, setIsFinished] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const [inView, setInView] = useState(false);
  const hasFinishedRef = useRef(false);
  const hasStartedRef = useRef(false);
  const timerRef = useRef(null);

  // Check prefers-reduced-motion
  const prefersReduced = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Parse paragraphs and words
  const parsedData = useMemo(() => {
    const paragraphs = text.split('\n\n');
    let totalWordCount = 0;
    const structure = paragraphs.map((para, pIdx) => {
      const words = para.split(/\s+/).filter(Boolean);
      const items = words.map((word, wIdx) => {
        const item = {
          word,
          globalIndex: totalWordCount,
          isComma: word.includes(','),
          isSentenceEnd: /[.?!]/.test(word),
          isParaEnd: wIdx === words.length - 1 && pIdx < paragraphs.length - 1,
          charCount: word.length,
        };
        totalWordCount++;
        return item;
      });
      return items;
    });

    return { structure, totalWordCount };
  }, [text]);

  const completeInstantly = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsFinished(true);
    setActiveWordIndex(parsedData.totalWordCount);
    stop('pen');
    if (onComplete) onComplete();
  }, [parsedData.totalWordCount, onComplete]);

  // IntersectionObserver to detect when visible
  useEffect(() => {
    if (prefersReduced) {
      completeInstantly();
      return;
    }

    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) setInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, [prefersReduced, completeInstantly]);

  // Stepping word-by-word animation
  useEffect(() => {
    if (prefersReduced || hasFinishedRef.current || !inView) {
      stop('pen');
      return;
    }

    const allWords = parsedData.structure.flat();
    if (allWords.length === 0) return;

    // Start from where we left off if we were paused
    let currentIndex = hasStartedRef.current ? Math.max(0, activeWordIndex) : 0;
    hasStartedRef.current = true;

    // Start pen audio
    play('pen');

    const step = () => {
      if (hasFinishedRef.current) return;
      if (currentIndex >= allWords.length) {
        hasFinishedRef.current = true;
        setIsFinished(true);
        stop('pen');
        if (onComplete) onComplete();
        return;
      }

      const item = allWords[currentIndex];
      setActiveWordIndex(currentIndex);

      // Update pen position without forcing layout reflow on mobile
      if (containerRef.current && penRef.current && window.innerWidth >= 768) {
        const wordEl = containerRef.current.querySelector(`[data-word-idx="${currentIndex}"]`);
        if (wordEl) {
          const x = wordEl.offsetLeft + wordEl.offsetWidth;
          const y = wordEl.offsetTop + wordEl.offsetHeight * 0.7;
          penRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(-15deg)`;
        }
      }

      // Timing calculations (DESIGN.md: 45ms/char, 90ms word, +180ms comma, +420ms period, +800ms para)
      let delay = (item.charCount * 45 + 90) * speedMultiplier;
      if (item.isComma) delay += 180 * speedMultiplier;
      if (item.isSentenceEnd) delay += 420 * speedMultiplier;
      if (item.isParaEnd) delay += 800 * speedMultiplier;

      currentIndex++;
      timerRef.current = setTimeout(step, delay);
    };

    step();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      stop('pen');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, parsedData, prefersReduced, speedMultiplier]);

  // Once finished, clean up DOM to render normal plain text with identical typography
  if (isFinished) {
    return (
      <div
        ref={containerRef}
        className={`live-writing finished ${className}`}
        style={{ ...style, cursor: 'default' }}
      >
        {parsedData.structure.map((paraWords, pIdx) => (
          <p key={pIdx} style={{ marginBottom: '1.2em', lineHeight: 1.55, color: 'var(--navy)' }}>
            {paraWords.map((item) => item.word).join(' ')}
          </p>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`live-writing ${className}`}
      onClick={completeInstantly}
      style={{
        position: 'relative',
        cursor: 'pointer',
        userSelect: 'none',
        ...style,
      }}
      title="Tap anywhere to finish instantly"
    >
      {/* Tiny Quill Pen SVG in --ocean (desktop only) */}
      <div
        ref={penRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 10,
          transition: 'transform 0.08s linear',
          opacity: activeWordIndex >= 0 ? 1 : 0,
          display: typeof window !== 'undefined' && window.innerWidth < 768 ? 'none' : 'block',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ filter: 'drop-shadow(0 2px 3px rgba(61,111,216,0.3))' }}>
          <path
            d="M3 21l3.75-1.5L20.5 5.75a2.121 2.121 0 00-3-3L3.75 16.5 3 21z"
            fill="var(--ocean)"
          />
          <path
            d="M14.5 5.5l4 4"
            stroke="var(--sky-mist)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M3 21l2-0.5-1.5-1.5L3 21z"
            fill="var(--navy)"
          />
        </svg>
      </div>

      {parsedData.structure.map((paraWords, pIdx) => (
        <p key={pIdx} style={{ marginBottom: '1.2em', lineHeight: 1.55 }}>
          {paraWords.map((item) => {
            const isRevealed = item.globalIndex <= activeWordIndex;
            const isRecent = item.globalIndex === activeWordIndex;

            return (
              <span
                key={item.globalIndex}
                data-word-idx={item.globalIndex}
                style={{
                  display: 'inline-block',
                  marginRight: '0.28em',
                  opacity: isRevealed ? 1 : 0,
                  transform: isRevealed ? 'none' : 'translateY(2px)',
                  color: isRecent ? 'var(--ocean)' : 'var(--navy)',
                  transition: 'opacity 0.18s ease-out, transform 0.18s ease-out, color 0.4s ease',
                }}
              >
                {item.word}
              </span>
            );
          })}
        </p>
      ))}
    </div>
  );
}
