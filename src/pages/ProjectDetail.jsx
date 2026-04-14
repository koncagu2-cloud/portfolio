import { Link, useParams } from 'react-router-dom'
import { Page } from '../components/motion/Page.jsx'
import { Reveal } from '../components/motion/Reveal.jsx'
import { getProject } from '../data/projects.js'

const DEFAULT_PROCESS = [
  { phase: 'Discover', text: 'Research, audit, stakeholder inputs' },
  { phase: 'Define', text: 'IA, flows, information hierarchy' },
  { phase: 'Design', text: 'Prototypes, interaction language, UI system' },
  { phase: 'Validate', text: 'Accessibility checks, iteration loop' },
]

export function ProjectDetail() {
  const { slug } = useParams()
  const project = getProject(slug)
  const cs = project?.caseStudy

  if (!project) {
    return (
      <Page>
        <Reveal>
          <h1 className="font-[Unbounded] text-3xl tracking-[-0.03em] text-white/92 sm:text-5xl">
            Project not found
          </h1>
        </Reveal>
        <Reveal delay={0.08} className="mt-5 text-white/65">
          This case study doesn’t exist yet.
        </Reveal>
        <Reveal delay={0.14} className="mt-8">
          <Link
            to="/projects"
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/80 transition hover:bg-white/8 hover:text-white/95"
          >
            Back to Projects
          </Link>
        </Reveal>
      </Page>
    )
  }

  const overview =
    cs?.overview ??
    'Placeholder overview. This section will describe what the project is, who it serves, and the constraints that shaped the solution.'
  const problem =
    cs?.problem ??
    'Placeholder problem statement with user needs, friction points, and success metrics.'
  const outcome =
    cs?.outcome ??
    'Placeholder outcomes: qualitative impact, measurable improvements, and next steps.'
  const solution =
    cs?.solution ??
    'Placeholder solution narrative. Describe key design decisions, components, and interactions — and why they matter.'
  const processSteps = cs?.process?.length ? cs.process : DEFAULT_PROCESS
  const heroLabel = cs?.heroLabel ?? 'IMAGE PLACEHOLDER'
  const heroImage = cs?.heroImage

  return (
    <Page>
      <header className="mb-10">
        <Reveal>
          <Link to="/projects" className="text-sm text-white/55 transition hover:text-white/80">
            ← Projects
          </Link>
        </Reveal>
        <Reveal delay={0.06}>
          <h1 className="mt-5 font-[Unbounded] text-3xl tracking-[-0.03em] text-white/92 sm:text-5xl">
            {project.title}
          </h1>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
            {project.summary}
          </p>
        </Reveal>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <Reveal className="overflow-hidden rounded-2xl border border-white/10 bg-black/15 backdrop-blur-xl">
          <div className="relative h-56 border-b border-white/10 bg-gradient-to-br from-white/6 to-transparent">
            {heroImage ? (
              <img
                src={heroImage}
                alt=""
                className="absolute inset-0 h-full w-full object-cover object-top"
              />
            ) : null}
            <div className="absolute inset-0 bg-[radial-gradient(700px_260px_at_30%_30%,rgba(124,58,237,.22),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(620px_240px_at_80%_20%,rgba(56,189,248,.14),transparent_60%)]" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent" />
            <div className="absolute left-6 top-6 max-w-[min(100%,20rem)] font-[Unbounded] text-[11px] leading-snug tracking-[0.18em] text-white/55">
              {heroLabel}
            </div>
          </div>
          <div className="p-7">
            <SectionTitle>Overview</SectionTitle>
            <p className="mt-3 text-sm leading-relaxed text-white/62">{overview}</p>

            <div className="mt-7 grid gap-6 sm:grid-cols-2">
              <div>
                <SectionTitle>Problem</SectionTitle>
                <p className="mt-3 text-sm leading-relaxed text-white/62">{problem}</p>
              </div>
              <div>
                <SectionTitle>Outcome</SectionTitle>
                <p className="mt-3 text-sm leading-relaxed text-white/62">{outcome}</p>
              </div>
            </div>

            <div className="mt-7">
              <SectionTitle>Process</SectionTitle>
              <ol className="mt-3 grid gap-2 text-sm text-white/70">
                {processSteps.map((step) => (
                  <li
                    key={step.phase}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <span className="font-[Unbounded] text-[11px] tracking-[0.14em] text-white/45">
                      {step.phase}
                    </span>
                    <span className="mt-1 block text-white/72">{step.text}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08} className="rounded-2xl border border-white/10 bg-black/15 p-7 backdrop-blur-xl">
          <SectionTitle>Role</SectionTitle>
          <p className="mt-3 text-sm text-white/65">{project.role}</p>

          <div className="mt-7">
            <SectionTitle>Tools used</SectionTitle>
            <div className="mt-3 flex flex-wrap gap-2">
              {project.tools.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/72"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {cs?.links?.length ? (
            <div className="mt-8">
              <SectionTitle>Related</SectionTitle>
              <ul className="mt-3 grid gap-2 text-sm">
                {cs.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-white/70 underline decoration-white/20 underline-offset-4 transition hover:text-white/90 hover:decoration-white/40"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-8 h-px w-full bg-white/10" />

          <div className="mt-8">
            <SectionTitle>Solution</SectionTitle>
            <p className="mt-3 text-sm leading-relaxed text-white/62">{solution}</p>
          </div>
        </Reveal>
      </section>
    </Page>
  )
}

function SectionTitle({ children }) {
  return <div className="font-[Unbounded] text-xs tracking-[0.22em] text-white/55">{children}</div>
}
