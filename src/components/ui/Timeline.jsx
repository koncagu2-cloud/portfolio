import { motion } from 'framer-motion'
import { durations, easeOutSoft } from '../../styles/motion.js'

export function Timeline({ items }) {
  return (
    <div className="relative">
      <div aria-hidden="true" className="absolute left-[11px] top-0 h-full w-px bg-white/10" />
      <ul className="grid gap-5">
        {items.map((it, idx) => (
          <motion.li
            key={`${it.title}-${idx}`}
            initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '0px 0px -15% 0px' }}
            transition={{
              duration: durations.slow,
              delay: Math.min(idx * 0.06, 0.24),
              ease: easeOutSoft,
            }}
            className="relative pl-10"
          >
            <div className="absolute left-0 top-1.5 h-[22px] w-[22px] rounded-full border border-white/10 bg-black/40 shadow-[0_0_0_1px_rgba(255,255,255,.03)] backdrop-blur">
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(124,58,237,.32),transparent_58%)]" />
            </div>
            <motion.div
              className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:bg-white/6"
              whileHover={{ y: -2 }}
              transition={{ duration: durations.base, ease: easeOutSoft }}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="text-sm font-semibold tracking-[-0.01em] text-white/88">{it.title}</div>
                <div className="text-xs text-white/45">{it.time}</div>
              </div>
              <div className="mt-1 text-xs text-white/55">{it.org}</div>
              {it.details ? (
                <div className="mt-3 text-sm leading-relaxed text-white/62">{it.details}</div>
              ) : null}
            </motion.div>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}

