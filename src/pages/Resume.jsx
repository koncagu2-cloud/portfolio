import { useCallback, useEffect, useRef, useState } from 'react'
import { Page } from '../components/motion/Page.jsx'
import { Reveal } from '../components/motion/Reveal.jsx'
import { Timeline } from '../components/ui/Timeline.jsx'
import { ResumePdfDocument } from '../components/resume/ResumePdfExport.jsx'
import { downloadResumePdf, openResumePdfInNewTab } from '../lib/resumePdf.js'

const experienceBullets = [
  'Studied fulfillment and operations workflows in a high-volume environment; identified usability issues affecting speed and accuracy.',
  'Mapped user flows and clarified internal dashboard navigation patterns to make frequent tasks easier to find and complete.',
  'Partnered with cross-functional stakeholders to translate findings into actionable UX recommendations and clearer UI structure.',
]

const education = [
  {
    title: 'Michigan State University',
    org: 'B.A. Experience Architecture (Expected)',
    time: 'May 2026',
    details: 'Graduation expected May 2026 — human-centered design, IA, and accessible digital experiences.',
  },
]

const skillPills = [
  'User Research',
  'Usability Testing',
  'Information Architecture',
  'User Flows',
  'Wireframing',
  'Prototyping',
  'Interaction Design',
  'Accessibility (WCAG)',
  'Design Systems',
  'Figma',
  'FigJam',
  'Adobe CC',
  'HTML/CSS',
  'JavaScript',
]

const projects = [
  {
    name: 'D2L Learning Platform Redesign',
    tag: 'UX / Product Design',
    bullets: [
      'Led end-to-end redesign of a complex LMS; analyzed behavior, mapped journeys, and restructured navigation using IA.',
      'Reduced cognitive load by simplifying assignment and content workflows; improved wayfinding across high-information screens.',
      'Built wireframes and high-fidelity prototypes in Figma; created reusable components and clear specs for handoff.',
    ],
  },
  {
    name: 'MSU Arts Website Redesign',
    tag: 'Accessibility & UX',
    bullets: [
      'Audited accessibility and navigation; redesigned structure with WCAG-aligned considerations to improve readability and flow.',
      'Improved content hierarchy and page organization to reduce friction and increase findability on a content-driven site.',
    ],
  },
  {
    name: 'Data Visualization Dashboard',
    tag: 'UX + Interactive Systems',
    bullets: [
      'Designed dashboard patterns for exploring complex datasets; emphasized hierarchy, filtering, and progressive disclosure.',
      'Prototyped core interaction models to support quick scanning plus deeper drill-down when needed.',
    ],
  },
]

const communityBullets = [
  'Conducted interviews and surveys; synthesized insights into opportunity areas and experience recommendations.',
  'Developed concepts focused on accessibility, inclusivity, and engagement.',
]

export function Resume() {
  const pdfRef = useRef(null)
  const [pdfBusy, setPdfBusy] = useState(false)
  const [pdfError, setPdfError] = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  useEffect(() => {
    if (!previewOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') setPreviewOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [previewOpen])

  const runPdf = useCallback(async (fn) => {
    const el = pdfRef.current
    if (!el) return
    setPdfError(null)
    setPdfBusy(true)
    try {
      await fn(el)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not create PDF.'
      setPdfError(msg)
    } finally {
      setPdfBusy(false)
    }
  }, [])

  return (
    <Page>
      <ResumePdfDocument ref={pdfRef} mode="capture" />

      {previewOpen ? (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6"
          role="presentation"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-[920px] flex-col rounded-2xl border border-white/12 bg-[#0b0b12] p-4 shadow-2xl sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="resume-preview-heading"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 id="resume-preview-heading" className="font-[Unbounded] text-xs tracking-[0.22em] text-white/55">
                  PDF PREVIEW
                </h2>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-white/50">
                  Same layout as download — letter size, print-ready.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white/95"
              >
                Close
              </button>
            </div>

            <div className="mt-4 min-h-0 flex-1 overflow-y-auto overflow-x-hidden rounded-xl border border-white/8 bg-black/25 p-3 sm:p-4">
              <ResumePdfDocument mode="preview" />
            </div>

            <div className="mt-4 flex shrink-0 flex-wrap gap-3 border-t border-white/10 pt-4">
              <button
                type="button"
                disabled={pdfBusy}
                onClick={() => {
                  void runPdf(downloadResumePdf)
                  setPreviewOpen(false)
                }}
                className="inline-flex items-center justify-center rounded-xl border border-white/12 bg-white/10 px-5 py-3 text-sm font-medium text-white/92 transition hover:bg-white/14 disabled:cursor-wait disabled:opacity-60"
              >
                {pdfBusy ? 'Creating PDF…' : 'Download PDF'}
              </button>
              <button
                type="button"
                disabled={pdfBusy}
                onClick={() => void runPdf(openResumePdfInNewTab)}
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/75 transition hover:bg-white/8 hover:text-white/90 disabled:cursor-wait disabled:opacity-60"
              >
                Open PDF in new tab
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <header className="mb-10">
        <Reveal>
          <div className="font-[Unbounded] text-xs tracking-[0.22em] text-white/55">RESUME</div>
        </Reveal>
        <Reveal delay={0.06}>
          <h1 className="mt-4 font-[Unbounded] text-3xl tracking-[-0.03em] text-white/92 sm:text-5xl">
            Experience, designed.
          </h1>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="measure mt-5 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
            Skim highlights below, or open the print-ready PDF when you need a file for applications.
          </p>
        </Reveal>
      </header>

      <div className="mb-8 flex flex-wrap items-start gap-3">
        <Reveal>
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center justify-center rounded-xl border border-violet-400/25 bg-violet-500/12 px-5 py-3 text-sm font-medium text-white/92 transition hover:bg-violet-500/18 hover:text-white"
          >
            Preview PDF
          </button>
        </Reveal>
        <Reveal delay={0.04}>
          <button
            type="button"
            disabled={pdfBusy}
            onClick={() => runPdf(downloadResumePdf)}
            className="inline-flex items-center justify-center rounded-xl border border-white/12 bg-white/8 px-5 py-3 text-sm font-medium text-white/90 transition hover:bg-white/12 hover:text-white disabled:cursor-wait disabled:opacity-60"
          >
            {pdfBusy ? 'Creating PDF…' : 'Download PDF'}
          </button>
        </Reveal>
        <Reveal delay={0.08}>
          <button
            type="button"
            disabled={pdfBusy}
            onClick={() => runPdf(openResumePdfInNewTab)}
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/75 transition hover:bg-white/8 hover:text-white/92 disabled:cursor-wait disabled:opacity-60"
          >
            Open PDF in new tab
          </button>
        </Reveal>
      </div>
      {pdfError ? (
        <p className="mb-6 text-sm text-amber-200/90" role="alert">
          {pdfError}
        </p>
      ) : null}

      <section className="grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
        <div className="grid gap-8">
          <Reveal className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/15 p-7 backdrop-blur-xl">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-14 -top-14 h-56 w-56 rounded-full bg-violet-500/15 blur-3xl"
            />
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10" />

            <SectionTitle>Experience</SectionTitle>
            <div className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="text-sm font-semibold tracking-[-0.01em] text-white/88">UX / Operations Intern</div>
                <div className="text-xs text-white/45">Jun 2023 – Aug 2024</div>
              </div>
              <div className="text-xs text-white/55">Getir Storehouse • Çanakkale, Turkey</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-white/62">
                {experienceBullets.map((line) => (
                  <li key={line.slice(0, 48)}>{line}</li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="rounded-2xl border border-white/10 bg-black/15 p-7 backdrop-blur-xl">
            <SectionTitle>Selected projects</SectionTitle>
            <div className="mt-6 grid gap-8">
              {projects.map((p) => (
                <div key={p.name}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-sm font-semibold tracking-[-0.01em] text-white/88">{p.name}</h3>
                    <span className="text-xs text-white/45">{p.tag}</span>
                  </div>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-white/62">
                    {p.bullets.map((b) => (
                      <li key={b.slice(0, 40)}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="grid gap-8">
          <Reveal delay={0.06} className="rounded-2xl border border-white/10 bg-black/15 p-7 backdrop-blur-xl">
            <SectionTitle>Profile</SectionTitle>
            <div className="mt-5 grid gap-4 text-sm leading-relaxed text-white/62">
              <p>
                UX/UI + Experience Designer focused on simplifying complex, high-information workflows into clear, usable
                interfaces. Strengths in information architecture, interaction design, accessibility, and Figma handoff
                with reusable components (web + product surfaces).
              </p>
              <div className="grid gap-2">
                <KeyRow k="Location" v="East Lansing, MI" />
                <KeyRow k="Email" v="koncagu2@msu.edu" href="mailto:koncagu2@msu.edu" />
                <KeyRow k="LinkedIn" v="Profile" href="https://www.linkedin.com/in/" />
                <KeyRow k="Portfolio" v="suleymankoncagul.com" href="https://suleymankoncagul.com" />
                <KeyRow k="GitHub" v="koncagu2-cloud" href="https://github.com/koncagu2-cloud" />
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="rounded-2xl border border-white/10 bg-black/15 p-7 backdrop-blur-xl">
            <SectionTitle>Education</SectionTitle>
            <div className="mt-6">
              <Timeline items={education} />
            </div>
          </Reveal>

          <Reveal delay={0.1} className="rounded-2xl border border-white/10 bg-black/15 p-7 backdrop-blur-xl">
            <SectionTitle>Skills</SectionTitle>
            <div className="mt-6 flex flex-wrap gap-2">
              {skillPills.map((i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/72"
                >
                  {i}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/48">
              Strong interest in AI-driven products and simplifying complex, data-rich systems.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="rounded-2xl border border-white/10 bg-black/15 p-7 backdrop-blur-xl">
            <SectionTitle>Languages</SectionTitle>
            <p className="mt-4 text-sm leading-relaxed text-white/65">
              Turkish (Native) • English (Professional) • German (Basic)
            </p>
          </Reveal>

          <Reveal delay={0.12} className="rounded-2xl border border-white/10 bg-black/15 p-7 backdrop-blur-xl">
            <SectionTitle>Community space UX research</SectionTitle>
            <div className="mt-4 space-y-1">
              <div className="text-xs text-white/50">Human-Centered Design</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-white/62">
                {communityBullets.map((line) => (
                  <li key={line.slice(0, 40)}>{line}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>
    </Page>
  )
}

function SectionTitle({ children }) {
  return <div className="font-[Unbounded] text-xs tracking-[0.22em] text-white/55">{children}</div>
}

function KeyRow({ k, v, href }) {
  const inner = href ? (
    <a
      href={href}
      className="text-sm text-sky-300/90 underline decoration-sky-400/30 underline-offset-2 transition hover:text-sky-200/95 hover:decoration-sky-300/50"
    >
      {v}
    </a>
  ) : (
    <div className="text-sm text-white/72">{v}</div>
  )
  return (
    <div className="flex items-baseline justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="text-xs text-white/50">{k}</div>
      {inner}
    </div>
  )
}
