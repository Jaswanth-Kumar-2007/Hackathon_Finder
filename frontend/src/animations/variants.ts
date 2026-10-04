import type { Variants } from 'framer-motion'

export const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1]

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.18 } },
}

export const staggerContainer = (stagger = 0.06, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
})

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeOut } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.15 } },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4 } },
}

export const overlay: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

export const modalPanel: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: -8 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.22, ease: easeOut } },
  exit: { opacity: 0, scale: 0.98, y: -4, transition: { duration: 0.14 } },
}

export const drawerRight: Variants = {
  hidden: { x: '100%' },
  show: { x: 0, transition: { type: 'tween', duration: 0.3, ease: easeOut } },
  exit: { x: '100%', transition: { type: 'tween', duration: 0.22, ease: 'easeIn' } },
}

export const drawerBottom: Variants = {
  hidden: { y: '100%' },
  show: { y: 0, transition: { type: 'tween', duration: 0.32, ease: easeOut } },
  exit: { y: '100%', transition: { type: 'tween', duration: 0.22, ease: 'easeIn' } },
}
