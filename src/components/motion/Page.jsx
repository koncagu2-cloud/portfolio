import { motion } from 'framer-motion'
import { durations, easeOutSoft } from '../../styles/motion.js'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js'

const variantsFull = {
  initial: { opacity: 0, y: 10, scale: 0.996, filter: 'blur(8px)' },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: durations.slow, ease: easeOutSoft },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.998,
    filter: 'blur(8px)',
    transition: { duration: durations.base, ease: easeOutSoft },
  },
}

const variantsReduced = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

export function Page({ children }) {
  const reduced = usePrefersReducedMotion()
  return (
    <motion.section variants={reduced ? variantsReduced : variantsFull} initial="initial" animate="enter" exit="exit">
      {children}
    </motion.section>
  )
}

