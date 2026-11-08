import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { durations, easeCalm, easeOutSoft } from '../../styles/motion.js'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js'

/**
 * @param {object} props
 * @param {boolean} [props.calm] — slower, no blur; for reflective copy
 */
export function Reveal({ children, className = '', delay = 0, once = true, calm = false }) {
  const ref = useRef(null)
  const inView = useInView(ref, { margin: '0px 0px -15% 0px', once })
  const reduced = usePrefersReducedMotion()

  const initial = reduced
    ? { opacity: 0 }
    : calm
      ? { opacity: 0, y: 12 }
      : { opacity: 0, y: 14, filter: 'blur(10px)' }

  const animate = inView
    ? reduced
      ? { opacity: 1, transition: { duration: 0.2, delay } }
      : calm
        ? {
            opacity: 1,
            y: 0,
            transition: {
              duration: durations.breath,
              delay,
              ease: easeCalm,
            },
          }
        : {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: { duration: durations.slow, delay, ease: easeOutSoft },
          }
    : undefined

  return (
    <motion.div ref={ref} className={className} initial={initial} animate={animate}>
      {children}
    </motion.div>
  )
}

