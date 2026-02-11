/**
 * Shared Framer Motion animation variants
 *
 * Reusable across diagnostic and SOW components.
 */

// Stagger children into view
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

// Fade up from below
export const fadeUpItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

// Scale in from slightly smaller
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

// Pulse glow for critical items
export const priorityPulse = {
  initial: { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0)' },
  animate: {
    boxShadow: [
      '0 0 0 0 rgba(239, 68, 68, 0.4)',
      '0 0 0 8px rgba(239, 68, 68, 0)',
    ],
    transition: { duration: 1.5, repeat: Infinity },
  },
};

// Slide in from left
export const slideInLeft = {
  hidden: { x: -30, opacity: 0 },
  show: { x: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
};

// Slide in from right
export const slideInRight = {
  hidden: { x: 30, opacity: 0 },
  show: { x: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
};

// Pop animation for status changes
export const statusPop = {
  initial: { scale: 1 },
  animate: { scale: [1, 1.2, 1], transition: { duration: 0.3 } },
};

// Slide up from bottom (for bars, banners)
export const slideUp = {
  hidden: { y: 40, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { y: 40, opacity: 0, transition: { duration: 0.2 } },
};

// Collapse/expand height
export const collapseExpand = {
  hidden: { height: 0, opacity: 0, overflow: 'hidden' },
  show: { height: 'auto', opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { height: 0, opacity: 0, transition: { duration: 0.2 } },
};

// Card hover effect (used via whileHover)
export const cardHover = {
  y: -2,
  boxShadow: '0 8px 24px rgba(124, 58, 237, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04)',
  transition: { duration: 0.2 },
};

// Check prefers-reduced-motion (safe for SSR)
export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Return empty variants when user prefers reduced motion
export function safeVariants(variants) {
  if (prefersReducedMotion()) {
    return { hidden: {}, show: {}, exit: {} };
  }
  return variants;
}
