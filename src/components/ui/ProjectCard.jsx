import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { durations, easeOutSoft } from '../../styles/motion.js'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js'

export function ProjectCard({ project }) {
  const reduced = usePrefersReducedMotion()
  return (
    <motion.article
      whileHover={reduced ? undefined : { y: -9 }}
      transition={{ duration: durations.base, ease: easeOutSoft }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/15 shadow-[0_0_0_1px_rgba(255,255,255,.03)] backdrop-blur-xl transition-[box-shadow,border-color] duration-500 hover:border-white/16 hover:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_34px_100px_rgba(0,0,0,.58),0_0_80px_rgba(124,58,237,.08)]"
    >
      <Link to={`/projects/${project.slug}`} className="block">
        <div className="relative aspect-[16/9] overflow-hidden border-b border-white/10 bg-gradient-to-br from-white/6 to-transparent">
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(600px_240px_at_40%_40%,rgba(124,58,237,.20),transparent_60%)]"
            initial={{ opacity: 0.7 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: durations.fast }}
          />
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(520px_220px_at_70%_20%,rgba(56,189,248,.14),transparent_60%)]"
            initial={{ opacity: 0.6, scale: 1 }}
            whileHover={{ opacity: 0.95, scale: 1.02 }}
            transition={{ duration: durations.base, ease: easeOutSoft }}
          />
          <motion.div
            aria-hidden="true"
            className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-violet-500/20 blur-2xl"
            whileHover={{ scale: 1.1, opacity: 0.9 }}
            transition={{ duration: durations.base, ease: easeOutSoft }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,.45))]" />
          <div className="absolute left-5 top-5 flex flex-wrap items-center gap-2 font-[Unbounded] text-[11px] tracking-[0.22em] text-white/52">
            <span>CASE STUDY</span>
            {project.year ? (
              <span className="text-white/38">· {project.year}</span>
            ) : null}
          </div>
          {project.status === 'draft' ? (
            <div className="absolute right-5 top-5 rounded-full border border-amber-400/20 bg-amber-500/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-amber-100/90">
              Draft
            </div>
          ) : null}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 opacity-0"
            whileHover={{ opacity: 1 }}
            transition={{ duration: durations.base, ease: easeOutSoft }}
            style={{
              background:
                'radial-gradient(900px 260px at 50% 20%, rgba(255,255,255,.08), transparent 60%)',
            }}
          />
        </div>

        <div className="relative p-6">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold tracking-[-0.025em] text-white/94">{project.title}</h3>
            <span className="mt-1 text-sm text-white/42 transition duration-300 group-hover:translate-x-0.5 group-hover:text-white/78">
              →
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-white/58">{project.summary}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {project.tags?.slice(0, 3).map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/68"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </Link>

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'linear-gradient(90deg, rgba(124,58,237,.18), rgba(56,189,248,.12), rgba(255,255,255,0))',
        }}
      />
    </motion.article>
  )
}

