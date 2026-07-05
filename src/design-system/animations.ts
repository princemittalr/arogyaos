import { Variants } from 'framer-motion';

export const animations = {
  // Page transition animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.25, ease: 'easeInOut' },
  },
  
  slideUp: {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 15 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  // Sidebar transition variants
  sidebar: (): Variants => ({
    open: {
      width: '260px',
      transition: { duration: 0.3, ease: 'easeInOut' },
    },
    closed: {
      width: '72px',
      transition: { duration: 0.3, ease: 'easeInOut' },
    },
  }),

  // Interactive scale animations for premium micro-interactions
  hoverScale: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.1, ease: 'easeInOut' },
  },

  // Dropdown list transition presets
  dropdown: {
    initial: { opacity: 0, scale: 0.95, y: -5 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -5 },
    transition: { duration: 0.15, ease: 'easeOut' },
  },
} as const;
