import { motion } from 'framer-motion'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js'

/** Slow ambient orbs behind content — fixed, pointer-events none */
export function AmbientField() {
  const reduced = usePrefersReducedMotion()

  if (reduced) {
    return (
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-32 top-[20%] h-[min(80vw,520px)] w-[min(80vw,520px)] rounded-full bg-violet-600/10 blur-[100px]" />
        <div className="absolute -right-32 bottom-[10%] h-[min(70vw,480px)] w-[min(70vw,480px)] rounded-full bg-sky-500/8 blur-[100px]" />
      </div>
    )
  }

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <motion.div
        className="absolute -left-32 top-[15%] h-[min(85vw,560px)] w-[min(85vw,560px)] rounded-full bg-[radial-gradient(circle_at_center,rgba(124,58,237,.22),transparent_65%)] blur-[90px]"
        animate={{ x: [0, 22, 0], y: [0, 18, 0], scale: [1, 1.04, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-24 top-[35%] h-[min(70vw,440px)] w-[min(70vw,440px)] rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,.14),transparent_62%)] blur-[85px]"
        animate={{ x: [0, -18, 0], y: [0, 24, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[5%] left-[25%] h-[min(60vw,380px)] w-[min(60vw,380px)] rounded-full bg-[radial-gradient(circle_at_center,rgba(167,139,250,.10),transparent_60%)] blur-[95px]"
        animate={{ opacity: [0.55, 0.85, 0.55] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}
