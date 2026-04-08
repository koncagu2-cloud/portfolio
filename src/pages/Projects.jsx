import { Page } from '../components/motion/Page.jsx'
import { Reveal } from '../components/motion/Reveal.jsx'
import { projects } from '../data/projects.js'
import { ProjectCard } from '../components/ui/ProjectCard.jsx'

export function Projects() {
  return (
    <Page>
      <header className="mb-10">
        <Reveal>
          <div className="font-[Unbounded] text-xs tracking-[0.22em] text-white/55">PROJECTS</div>
        </Reveal>
        <Reveal delay={0.06}>
          <h1 className="mt-4 font-[Unbounded] text-3xl tracking-[-0.03em] text-white/92 sm:text-5xl">
            Selected work.
          </h1>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="measure mt-5 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
            Each piece is a story: what was messy, what we tried, what changed. Less polish for its own sake —
            more honesty about tradeoffs and outcomes.
          </p>
        </Reveal>
      </header>

      <section className="grid gap-6 md:grid-cols-2 lg:gap-7">
        {projects.map((p, i) => (
          <Reveal key={p.slug} delay={Math.min(0.06 * i, 0.24)}>
            <ProjectCard project={p} />
          </Reveal>
        ))}
      </section>
    </Page>
  )
}

