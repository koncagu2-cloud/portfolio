import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js'

const spring = { stiffness: 64, damping: 18, mass: 0.4 }

export function HeroParallax({ children, className = '' }) {
  const ref = useRef(null)
  const reduced = usePrefersReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const xSpring = useSpring(x, spring)
  const ySpring = useSpring(y, spring)

  useEffect(() => {
    if (reduced) return
    const el = ref.current
    if (!el) return

    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      x.set(px * 14)
      y.set(py * 10)
    }

    const onLeave = () => {
      x.set(0)
      y.set(0)
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [reduced, x, y])

  if (reduced) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    )
  }

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ x: xSpring, y: ySpring }} className="will-change-transform">
        {children}
      </motion.div>
    </div>
  )
}
