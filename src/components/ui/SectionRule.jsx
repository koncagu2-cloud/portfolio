import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { durations, easeOutSoft } from '../../styles/motion.js'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js'

export function SectionRule({ label, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { margin: '0px 0px -10% 0px', once: true })
  const reduced = usePrefersReducedMotion()

  return (
    <div ref={ref} className={`relative my-14 flex items-center gap-6 sm:my-20 ${className}`}>
      <motion.div
        aria-hidden="true"
        className="h-px flex-1 origin-left bg-gradient-to-r from-transparent via-white/25 to-white/10"
        initial={reduced ? false : { scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : { scaleX: reduced ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : durations.slow, ease: easeOutSoft }}
      />
      {label ? (
        <span className="type-label shrink-0 font-[Unbounded] text-[10px] tracking-[0.28em] text-white/40">
          {label}
        </span>
      ) : null}
      <motion.div
        aria-hidden="true"
        className="h-px flex-1 origin-right bg-gradient-to-l from-transparent via-white/25 to-white/10"
        initial={reduced ? false : { scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : { scaleX: reduced ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : durations.slow, delay: reduced ? 0 : 0.1, ease: easeOutSoft }}
      />
    </div>
  )
}
