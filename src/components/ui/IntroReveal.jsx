import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export function IntroReveal() {
  const [done, setDone] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setDone(true), 1100)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[50] grid place-items-center bg-[#06060a]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }}
        >
          <motion.div
            initial={{ opacity: 0, y: 8, filter: 'blur(10px)' }}
            animate={{
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
            }}
            className="text-center"
          >
            <div className="font-[Unbounded] text-[12px] tracking-[0.24em] text-white/55">
              SULEYMAN KONCAGUL
            </div>
            <div className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-white/90">
              UX / Experience Designer
            </div>
            <div className="mt-6 h-[2px] w-[240px] overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full w-full bg-gradient-to-r from-violet-500/60 via-sky-400/40 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '0%' }}
                transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

