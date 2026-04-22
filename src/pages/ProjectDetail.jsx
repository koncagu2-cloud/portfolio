import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Page } from '../components/motion/Page.jsx'
import { Reveal } from '../components/motion/Reveal.jsx'
import { CaseStudyResearch } from '../components/case-study/CaseStudyResearch.jsx'
import {
  CaseStudyHero,
  CaseStudySection,
  PrototypeCTA,
} from '../components/case-study/CaseStudyPresentation.jsx'
import { CaseStudyTOC, CaseStudyTOCMobile } from '../components/case-study/CaseStudyTOC.jsx'
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

  const tocSections = useMemo(() => {
    if (!project) return []
    const items = []
    items.push({ id: 'case-overview', label: 'Overview' })
    if (cs?.researchBlock) items.push({ id: 'case-research', label: 'Research' })
    getCaseStudySections(project, cs).forEach((section) => {
      items.push({ id: section.id, label: section.navLabel ?? section.eyebrow })
    })
    items.push({ id: 'case-prototype', label: 'Prototype' })
    items.push({ id: 'case-outcome', label: 'Outcome' })
    return items
  }, [project, cs])

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

  const outcome =
    cs?.outcome ??
    'This case study is structured to show the design process, the decisions behind the final direction, and the next improvements I would test with users.'
  const sections = getCaseStudySections(project, cs)

  return (
    <Page>
      <header className="mb-8">
        <Reveal>
          <Link to="/projects" className="text-sm text-white/55 transition hover:text-white/80">
            ← Projects
          </Link>
        </Reveal>
        {project.status === 'draft' ? (
          <Reveal delay={0.04}>
            <p
              className="mt-5 rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm leading-relaxed text-amber-50/95"
              role="status"
            >
              Draft case study — narrative, visuals, and metrics are still being filled in.
            </p>
          </Reveal>
        ) : null}
      </header>

      <div className="lg:flex lg:items-start lg:gap-10 xl:gap-12">
        <aside className="mb-8 hidden shrink-0 lg:sticky lg:top-28 lg:mb-0 lg:block lg:w-56 xl:w-60">
          <CaseStudyTOC sections={tocSections} />
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-8 lg:hidden">
            <CaseStudyTOCMobile sections={tocSections} />
          </div>

          <div className="space-y-14">
            <CaseStudyHero project={project} caseStudy={cs} />
            {cs?.researchBlock ? <CaseStudyResearch block={cs.researchBlock} /> : null}
            {sections.map((section, index) => (
              <CaseStudySection key={section.id} section={section} index={index} />
            ))}
            <PrototypeCTA prototype={cs?.prototype} projectTitle={project.title} />
            <OutcomeSection outcome={outcome} links={cs?.links} />
          </div>
        </div>
      </div>
    </Page>
  )
}

function OutcomeSection({ outcome, links = [] }) {
  return (
    <section id="case-outcome" className="scroll-mt-28 border-t border-white/10 pt-12">
      <Reveal>
        <div className="grid gap-8 rounded-[2rem] border border-white/10 bg-black/[0.18] p-7 backdrop-blur-xl sm:p-9 lg:grid-cols-[0.55fr_0.45fr]">
          <div>
            <p className="font-[Unbounded] text-[11px] tracking-[0.22em] text-white/42">
              OUTCOME / REFLECTION
            </p>
            <h2 className="mt-3 font-[Unbounded] text-2xl tracking-[-0.035em] text-white/92 sm:text-3xl">
              What changed and what I learned
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/62 sm:text-base">{outcome}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
            <p className="font-[Unbounded] text-[10px] tracking-[0.18em] text-white/38">
              RECRUITER NOTES
            </p>
            <ul className="mt-4 grid gap-3 text-sm leading-relaxed text-white/62" role="list">
              <li>Shows process evidence, not only final screens.</li>
              <li>Connects UX decisions to user needs and constraints.</li>
              <li>Keeps the story scannable with visuals and concise writing.</li>
            </ul>

            {links.length ? (
              <div className="mt-6 border-t border-white/10 pt-5">
                <p className="font-[Unbounded] text-[10px] tracking-[0.18em] text-white/38">
                  RELATED LINKS
                </p>
                <ul className="mt-3 grid gap-2 text-sm" role="list">
                  {links.map((link) => (
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
          </div>
        </div>
      </Reveal>
    </section>
  )
}

function getCaseStudySections(project, cs) {
  if (cs?.visualSections?.length) return cs.visualSections

  const processSteps = cs?.process?.length ? cs.process : DEFAULT_PROCESS
  const problem =
    cs?.problem ??
    'The main design challenge was to make the experience easier to understand, easier to navigate, and more useful for the people relying on it.'
  const overview =
    cs?.overview ??
    project.summary ??
    'This case study focuses on turning a broad design problem into a clearer product experience through research, structure, interface decisions, and iteration.'
  const solution =
    cs?.solution ??
    'The final direction emphasizes clearer hierarchy, simpler interactions, and a more intentional visual system that supports the user goal instead of competing with it.'

  return [
    {
      id: 'case-problem',
      navLabel: 'Problem',
      eyebrow: 'PROBLEM / GOAL',
      title: 'Framing the challenge',
      body: overview,
      points: [problem],
      layout: 'single',
      media: [
        {
          label: 'PROBLEM EVIDENCE',
          title: 'Audit notes or pain-point map',
          description: 'Add a screenshot of the original experience, annotated issues, or a short research synthesis board.',
        },
      ],
    },
    {
      id: 'case-insights',
      navLabel: 'Insights',
      eyebrow: 'RESEARCH / INSIGHTS',
      title: 'Evidence before interface decisions',
      body: 'This section should make the project feel grounded by showing how research, review, or observation shaped the direction.',
      points: processSteps.map((step) => `${step.phase}: ${step.text}`),
      layout: 'grid',
      media: [
        {
          label: 'AFFINITY MAP',
          title: 'Themes and patterns',
          description: 'Replace with a research artifact, affinity map, or interview synthesis screenshot.',
        },
        {
          label: 'KEY INSIGHTS',
          title: 'Decision-driving findings',
          description: 'Use this slot for the insights that changed the design direction.',
        },
      ],
    },
    {
      id: 'case-flow',
      navLabel: 'Flow / IA',
      eyebrow: 'INFORMATION ARCHITECTURE',
      title: 'Structure before screens',
      body: 'A strong case study should show how the product is organized before jumping into final visuals.',
      layout: 'grid',
      media: [
        {
          label: 'USER FLOW',
          title: 'Primary path through the experience',
          description: 'Add a user flow, sitemap, or route map that shows how the experience is structured.',
        },
        {
          label: 'IA MODEL',
          title: 'Navigation and content model',
          description: 'Use this space for sitemap, navigation model, or content grouping evidence.',
        },
      ],
    },
    {
      id: 'case-wireframes',
      navLabel: 'Wireframes',
      eyebrow: 'WIREFRAMES / EXPLORATION',
      title: 'Exploring the layout and interaction model',
      body: 'Wireframes make the case study more credible because they show iteration, not just final polish.',
      layout: 'grid',
      media: [
        {
          label: 'LOW-FI SCREEN',
          title: 'Early screen direction',
          description: 'Add a low-fidelity wireframe or sketch that shows early thinking.',
        },
        {
          label: 'ITERATION',
          title: 'What changed and why',
          description: 'Use this slot to compare alternatives or show a design decision.',
        },
      ],
    },
    {
      id: 'case-final-ui',
      navLabel: 'Final UI',
      eyebrow: 'FINAL UI',
      title: 'Final direction and interaction details',
      body: solution,
      layout: 'grid',
      media: [
        {
          label: 'HI-FI SCREEN',
          title: 'Primary final screen',
          description: 'Add the strongest final UI screenshot or mockup.',
        },
        {
          label: 'COMPONENT DETAIL',
          title: 'Interaction or component highlight',
          description: 'Show a key component, state, or interaction that explains the design system thinking.',
        },
      ],
    },
  ]
}
