import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { staggerContainer } from '../../animations/variants'

/** Parent container that staggers children using `fadeUp` variants. */
export function StaggerGrid({
  children,
  className,
  as = 'div',
  inView = false,
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'ul'
  inView?: boolean
}) {
  const shared = {
    variants: staggerContainer(0.06),
    className,
    initial: 'hidden',
    ...(inView
      ? { whileInView: 'show', viewport: { once: true, margin: '-60px' } }
      : { animate: 'show' }),
  }
  return as === 'ul' ? (
    <motion.ul {...shared}>{children}</motion.ul>
  ) : (
    <motion.div {...shared}>{children}</motion.div>
  )
}
