import { motion, useScroll, useSpring } from 'framer-motion'

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 })

  return (
    <motion.div
      aria-hidden="true"
      className="fixed left-0 top-0 z-[45] h-[2px] w-full origin-left bg-gradient-to-r from-violet-400/70 via-sky-300/50 to-transparent"
      style={{ scaleX }}
    />
  )
}

