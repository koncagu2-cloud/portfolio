import { Page } from '../components/motion/Page.jsx'
import { Reveal } from '../components/motion/Reveal.jsx'
import { Timeline } from '../components/ui/Timeline.jsx'

const experience = [
  {
    title: 'UX / Experience Designer',
    org: 'Role placeholder — add company/studio',
    time: '2024 — Present',
    details:
      'Designed end-to-end flows, IA, and interaction patterns. Built prototypes to validate structure and motion.',
  },
  {
    title: 'UX Designer',
    org: 'Role placeholder — add company/studio',
    time: '2022 — 2024',
    details:
      'Led research synthesis, wireframes, and accessibility reviews. Collaborated with engineering for implementation.',
  },
]

const education = [
  {
    title: 'Degree / Program',
    org: 'University / School',
    time: 'Year — Year',
    details: 'Add your education details here.',
  },
]

const skillGroups = [
  {
    label: 'Core',
    items: ['UX Design', 'Experience Design', 'Information Architecture', 'Accessibility', 'User Research'],
  },
  {
    label: 'Design',
    items: ['Wireframing', 'Prototyping', 'Figma'],
  },
  {
    label: 'Frontend',
    items: ['React', 'HTML/CSS/JS', 'Lighthouse'],
  },
  {
    label: 'Audit',
    items: ['Screaming Frog'],
  },
]

export function Resume() {
  return (
    <Page>
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
            The short version of where I’ve been — formatted so you can skim fast or read slowly. Swap in your
            real details when you’re ready.
          </p>
        </Reveal>
      </header>

      <section className="grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
        <Reveal className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/15 p-7 backdrop-blur-xl">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-14 -top-14 h-56 w-56 rounded-full bg-violet-500/15 blur-3xl"
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10" />

          <SectionTitle>Experience</SectionTitle>
          <div className="mt-6">
            <Timeline items={experience} />
          </div>
        </Reveal>

        <div className="grid gap-8">
          <Reveal delay={0.06} className="rounded-2xl border border-white/10 bg-black/15 p-7 backdrop-blur-xl">
            <SectionTitle>Profile</SectionTitle>
            <div className="mt-5 grid gap-3 text-sm leading-relaxed text-white/62">
              <p>
                UX / Experience Designer — I care about clear structure, inclusive defaults, and interfaces that
                don’t waste people’s time.
              </p>
              <div className="grid gap-2">
                <KeyRow k="Location" v="Add your location" />
                <KeyRow k="Email" v="suleyman@example.com" />
                <KeyRow k="Portfolio" v="Your domain" />
              </div>
            </div>

            <div className="mt-6 h-px w-full bg-white/10" />

            <a
              href="/resume.pdf"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/6 px-5 py-3 text-sm text-white/85 transition hover:bg-white/10 hover:text-white/96 hover:shadow-[0_0_0_1px_rgba(255,255,255,.06),0_20px_60px_rgba(0,0,0,.45)]"
            >
              Download PDF resume
            </a>
            <div className="mt-2 text-xs text-white/45">Drop your file at `public/resume.pdf` when it’s ready.</div>
          </Reveal>

          <Reveal delay={0.1} className="rounded-2xl border border-white/10 bg-black/15 p-7 backdrop-blur-xl">
            <SectionTitle>Skills</SectionTitle>
            <div className="mt-6 grid gap-5">
              {skillGroups.map((g) => (
                <div key={g.label}>
                  <div className="text-xs text-white/45">{g.label}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {g.items.map((i) => (
                      <span
                        key={i}
                        className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/72"
                      >
                        {i}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.12} className="rounded-2xl border border-white/10 bg-black/15 p-7 backdrop-blur-xl">
            <SectionTitle>Education</SectionTitle>
            <div className="mt-6">
              <Timeline items={education} />
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

function KeyRow({ k, v }) {
  return (
    <div className="flex items-baseline justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="text-xs text-white/50">{k}</div>
      <div className="text-sm text-white/72">{v}</div>
    </div>
  )
}

