import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { durations, easeOutSoft } from '../../styles/motion.js'
import { staggerContainer } from '../../styles/stagger.js'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js'

const itemFull = {
  hidden: { opacity: 0, y: 12, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: durations.slow, ease: easeOutSoft },
  },
}

const itemReduced = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
}

/** Scroll-triggered stagger parent. Wrap StaggerItem children. */
export function Stagger({
  children,
  className = '',
  stagger = 0.09,
  delayChildren = 0,
  once = true,
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { margin: '0px 0px -12% 0px', once })

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={staggerContainer(stagger, delayChildren)}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
    >
      {children}
    </motion.div>
  )
}

/** One staggered block inside Stagger. */
export function StaggerItem({ children, className = '' }) {
  const reduced = usePrefersReducedMotion()
  return (
    <motion.div variants={reduced ? itemReduced : itemFull} className={className}>
      {children}
    </motion.div>
  )
}
