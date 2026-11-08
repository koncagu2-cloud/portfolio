import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Page } from '../components/motion/Page.jsx'
import { Reveal } from '../components/motion/Reveal.jsx'
import {
  getDraftProjects,
  getPublishedProjectTags,
  getPublishedProjects,
} from '../data/projects.js'
import { ProjectCard } from '../components/ui/ProjectCard.jsx'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.js'
import { easeOutSoft } from '../styles/motion.js'

const FILTER_ALL = 'All'

export function Projects() {
  const reduced = usePrefersReducedMotion()
  const published = getPublishedProjects()
  const drafts = getDraftProjects()
  const tagOptions = getPublishedProjectTags()
  const [filter, setFilter] = useState(FILTER_ALL)

  const filteredPublished = useMemo(() => {
    if (filter === FILTER_ALL) return published
    return published.filter((p) => p.tags?.includes(filter))
  }, [published, filter])

  const list = [...published, ...drafts]

  return (
    <Page>
      <header className="mb-12 sm:mb-14">
        <Reveal>
          <div className="font-[Unbounded] text-xs tracking-[0.22em] text-white/55">PROJECTS</div>
        </Reveal>
        <Reveal delay={0.06}>
          <h1 className="mt-4 font-[Unbounded] text-3xl tracking-[-0.03em] text-white/92 sm:text-5xl">
            Case studies.
          </h1>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="measure mt-5 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
            Each piece is a story: what was messy, what we tried, what changed. More room here as the catalog
            grows — less polish for its own sake, more honesty about tradeoffs and outcomes.
          </p>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mt-4 text-sm text-white/45">
            <span className="text-white/60">{list.length}</span> projects ·{' '}
            <span className="text-white/60">{published.length}</span> published
            {drafts.length ? (
              <>
                {' '}
                · <span className="text-amber-200/70">{drafts.length}</span> in progress
              </>
            ) : null}
          </p>
        </Reveal>

        {tagOptions.length > 0 ? (
          <Reveal delay={0.2}>
            <div
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
              role="region"
              aria-label="Filter published work by focus area"
            >
              <span className="font-[Unbounded] text-[11px] tracking-[0.2em] text-white/40">FILTER</span>
              <div
                role="tablist"
                aria-label="Project categories"
                className="flex flex-wrap gap-2"
              >
                {[
                  FILTER_ALL,
                  ...tagOptions,
                ].map((tag) => {
                  const selected = filter === tag
                  return (
                    <button
                      key={tag}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      id={`project-filter-${tag === FILTER_ALL ? 'all' : tag.replace(/\s+/g, '-').toLowerCase()}`}
                      onClick={() => setFilter(tag)}
                      className={`rounded-full border px-3.5 py-2 text-xs font-medium transition-colors duration-300 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-sky-300/80 ${
                        selected
                          ? 'border-violet-400/40 bg-violet-500/15 text-white/92 shadow-[0_0_24px_rgba(124,58,237,0.12)]'
                          : 'border-white/10 bg-white/[0.04] text-white/55 hover:border-white/16 hover:bg-white/[0.05] hover:text-white/78'
                      }`}
                    >
                      {tag}
                    </button>
                  )
                })}
              </div>
            </div>
          </Reveal>
        ) : null}
      </header>

      <div className="space-y-16 sm:space-y-20">
        <section aria-label="Published case studies">
          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: reduced ? 0 : 0.28, ease: easeOutSoft }}
            >
              {filteredPublished.length === 0 ? (
                <p className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center text-sm text-white/55">
                  No published projects match “{filter}”. Try another filter or view{' '}
                  <button
                    type="button"
                    className="text-white/75 underline decoration-white/25 underline-offset-4 transition hover:text-white/95"
                    onClick={() => setFilter(FILTER_ALL)}
                  >
                    all projects
                  </button>
                  .
                </p>
              ) : (
                <ul className="grid list-none gap-8 sm:gap-9 md:grid-cols-2 xl:grid-cols-3">
                  {filteredPublished.map((p, i) => (
                    <motion.li
                      key={p.slug}
                      layout={!reduced}
                      initial={reduced ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: reduced ? 0 : 0.32,
                        delay: reduced ? 0 : Math.min(0.05 * i, 0.2),
                        ease: easeOutSoft,
                      }}
                    >
                      <ProjectCard project={p} />
                    </motion.li>
                  ))}
                </ul>
              )}
            </motion.div>
          </AnimatePresence>
        </section>

        {drafts.length ? (
          <section aria-label="Case studies in progress" className="border-t border-white/10 pt-14 sm:pt-16">
            <Reveal>
              <h2 className="font-[Unbounded] text-xs tracking-[0.22em] text-white/50">In progress</h2>
              <p className="mt-2 max-w-xl text-sm text-white/45">
                Draft entries — swap in real titles, summaries, and full case study content when ready.
              </p>
            </Reveal>
            <ul className="mt-8 grid list-none gap-8 sm:gap-9 md:grid-cols-2 xl:grid-cols-3">
              {drafts.map((p, i) => (
                <li key={p.slug}>
                  <Reveal delay={Math.min(0.04 * i, 0.2)}>
                    <ProjectCard project={p} />
                  </Reveal>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </Page>
  )
}
