import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Page } from '../components/motion/Page.jsx'
import { Reveal } from '../components/motion/Reveal.jsx'
import { Stagger, StaggerItem } from '../components/motion/Stagger.jsx'
import { SectionRule } from '../components/ui/SectionRule.jsx'
import { durations, easeOutSoft } from '../styles/motion.js'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.js'
import { strengthSummaries } from '../data/strengths.js'
import portraitImg from '../assets/about-portrait.png'

const skills = [
  'UX Design',
  'Experience Design',
  'Information Architecture',
  'Accessibility',
  'Frontend Development',
  'Wireframing',
  'Prototyping',
  'User Research',
]

const tools = ['Figma', 'React', 'Lighthouse', 'Screaming Frog', 'HTML/CSS/JS']

const designPrinciples = [
  { title: 'Clarity over decoration', body: 'If it doesn’t help someone understand or act, it’s noise.' },
  { title: 'Motion with purpose', body: 'Movement should explain, orient, or soften — never perform.' },
  { title: 'Accessibility as default', body: 'Contrast, structure, and keyboard paths are part of the design, not a checklist pass.' },
  { title: 'Systems before visuals', body: 'Patterns and IA first; aesthetics amplify what already works.' },
  { title: 'Design that respects attention', body: 'Calm interfaces. Fewer demands. Honest hierarchy.' },
]

export function About() {
  const reduced = usePrefersReducedMotion()

  return (
    <Page>
      <header className="mb-[var(--section-y)] relative grid items-start gap-12 lg:grid-cols-[1.1fr_.9fr] lg:gap-16">
        <div className="relative z-[1] max-w-3xl">
          <Stagger stagger={0.07} delayChildren={0}>
            <StaggerItem>
              <div className="type-label font-[Unbounded] uppercase">About</div>
            </StaggerItem>
            <StaggerItem>
              <h1 className="type-display font-[Unbounded] mt-6 text-[clamp(2rem,5.5vw,3.75rem)]">
                A little about how I work — and why.
              </h1>
            </StaggerItem>
            <StaggerItem>
              <div className="type-lead mt-8 max-w-2xl space-y-5">
                <p>
                  I’m Suleyman. I care about the quiet parts of design: the sentence someone reads when they’re
                  tired, the screen someone uses with one hand on the bus, the moment someone realizes they’re
                  in the right place.
                </p>
                <p>
                  I didn’t come to UX for the buzzwords. I stay because good work makes people feel considered —
                  like the product actually knows they exist.
                </p>
              </div>
            </StaggerItem>
          </Stagger>
        </div>

        {/* Atmospheric portrait background (integrated, not framed) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-[-160px] top-[-20px] z-[0] hidden lg:block"
        >
          {/* Base atmosphere (idle) — ensures the right side isn’t flat */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(900px_520px_at_70%_40%,rgba(124,58,237,.10),transparent_62%),radial-gradient(820px_520px_at_86%_30%,rgba(56,189,248,.08),transparent_64%)] opacity-70"
          />

          {/* Layer 2: blurred glow spilling into the page */}
          <div
            aria-hidden="true"
            className="absolute -inset-24 bg-[radial-gradient(520px_420px_at_60%_35%,rgba(56,189,248,.26),transparent_60%),radial-gradient(560px_420px_at_35%_65%,rgba(124,58,237,.28),transparent_62%)] blur-[100px] opacity-90"
          />

          {/* Layer 2c: subtle face highlight boost (keeps the subject readable) */}
          <div
            aria-hidden="true"
            className="absolute -inset-10 bg-[radial-gradient(260px_220px_at_72%_38%,rgba(255,255,255,.14),transparent_62%)] blur-2xl opacity-70"
          />

          {/* Layer 2b: subtle color tint overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(59,130,246,.14)_0%,transparent_58%)] opacity-55" />

          <motion.img
            src={portraitImg}
            alt=""
            loading="lazy"
            decoding="async"
            role="presentation"
            className="absolute right-0 top-[40px] w-[560px] max-w-none select-none rounded-[26px] object-cover opacity-92"
            style={{
              WebkitMaskImage:
                'radial-gradient(74% 74% at 75% 36%, rgba(0,0,0,1) 54%, rgba(0,0,0,0.85) 66%, rgba(0,0,0,0) 92%), linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.15) 28%, rgba(0,0,0,0.75) 56%, rgba(0,0,0,1) 74%, rgba(0,0,0,1) 100%)',
              maskImage:
                'radial-gradient(74% 74% at 75% 36%, rgba(0,0,0,1) 54%, rgba(0,0,0,0.85) 66%, rgba(0,0,0,0) 92%), linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.15) 28%, rgba(0,0,0,0.75) 56%, rgba(0,0,0,1) 74%, rgba(0,0,0,1) 100%)',
              filter: 'brightness(1.06) contrast(1.08) saturate(1.03)',
            }}
            initial={reduced ? undefined : { opacity: 0, x: 28, filter: 'blur(10px)' }}
            animate={
              reduced
                ? { opacity: 0.78 }
                : { opacity: 0.92, x: 0, filter: 'blur(0px)' }
            }
            transition={{
              duration: durations.slow,
              ease: easeOutSoft,
              delay: 0.22,
            }}
          />

        </div>

        {/* Mobile: keep atmosphere but push it lower + fade more */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[-220px] bottom-[-120px] z-[0] lg:hidden"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(760px_520px_at_70%_40%,rgba(124,58,237,.10),transparent_62%),radial-gradient(720px_520px_at_86%_30%,rgba(56,189,248,.08),transparent_64%)] opacity-60"
          />
          <div
            aria-hidden="true"
            className="absolute -inset-24 bg-[radial-gradient(520px_420px_at_60%_35%,rgba(56,189,248,.24),transparent_60%),radial-gradient(520px_420px_at_35%_65%,rgba(124,58,237,.24),transparent_62%)] blur-[100px] opacity-70"
          />
          <div
            aria-hidden="true"
            className="absolute -inset-16 bg-[radial-gradient(220px_190px_at_72%_40%,rgba(255,255,255,.12),transparent_62%)] blur-2xl opacity-65"
          />
          <motion.img
            src={portraitImg}
            alt=""
            role="presentation"
            loading="lazy"
            decoding="async"
            className="absolute right-0 bottom-0 w-[420px] max-w-none select-none rounded-[22px] object-cover opacity-78"
            style={{
              WebkitMaskImage:
                'radial-gradient(74% 74% at 75% 36%, rgba(0,0,0,1) 54%, rgba(0,0,0,0.85) 66%, rgba(0,0,0,0) 92%), linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.75) 58%, rgba(0,0,0,1) 76%, rgba(0,0,0,1) 100%)',
              maskImage:
                'radial-gradient(74% 74% at 75% 36%, rgba(0,0,0,1) 54%, rgba(0,0,0,0.85) 66%, rgba(0,0,0,0) 92%), linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.75) 58%, rgba(0,0,0,1) 76%, rgba(0,0,0,1) 100%)',
              filter: 'brightness(1.05) contrast(1.07) saturate(1.03)',
            }}
            initial={reduced ? undefined : { opacity: 0, x: 24, filter: 'blur(10px)' }}
            animate={
              reduced
                ? { opacity: 0.68 }
                : { opacity: 0.78, x: 0, filter: 'blur(0px)' }
            }
            transition={{
              duration: durations.slow,
              ease: easeOutSoft,
              delay: 0.22,
            }}
          />
        </div>
      </header>

      {/* Reflective — slower, minimal motion */}
      <Reveal calm delay={0.08} className="mb-[var(--section-y)]">
        <div className="measure rounded-[28px] border border-white/10 bg-white/[0.03] px-8 py-10 sm:px-10 sm:py-12">
          <h2 className="type-label font-[Unbounded] text-[0.625rem] uppercase tracking-[0.26em]">
            Why I design
          </h2>
          <p className="type-body mt-6 text-[0.9375rem] leading-[1.85]">
            I design because interfaces mediate so much of life now — and that’s a responsibility. If I can
            reduce friction, clarify a choice, or make someone feel less alone in a flow, that matters. I’m
            not chasing perfection; I’m trying to be fair to real people in real contexts.
          </p>
        </div>
      </Reveal>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_auto_minmax(0,0.9fr)] lg:gap-12 lg:items-start">
        <Reveal className="relative">
          <motion.article
            className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-black/15 p-8 pb-10 shadow-[0_0_0_1px_rgba(255,255,255,.02)] backdrop-blur-xl sm:p-10"
            whileHover={
              reduced
                ? undefined
                : { y: -3, transition: { duration: durations.base, ease: easeOutSoft } }
            }
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              style={{
                background:
                  'radial-gradient(720px 280px at 15% 0%, rgba(124,58,237,.12), transparent 60%)',
              }}
            />
            <h2 className="type-label font-[Unbounded] text-[0.625rem] uppercase tracking-[0.26em]">
              What I care about
            </h2>
            <div className="type-body mt-8 grid max-w-prose gap-6 text-[0.9375rem] leading-[1.85]">
              <p>
                Honest structure. Interfaces that don’t hide their limits. Copy that sounds like a person, not
                a brand deck. And teams that don’t treat accessibility as a line item — because it’s how we
                show respect for users.
              </p>
              <p>
                My process is iterative and a bit obsessive in the details: flows, language, contrast, timing.
                If something feels “off,” I’d rather slow down than ship a polished mistake.
              </p>
            </div>
            <aside className="relative mt-10 border-l-2 border-sky-300/35 pl-6">
              <blockquote className="font-[Unbounded] text-lg font-medium leading-snug tracking-[-0.02em] text-white/82">
                “Good design is quiet confidence: it doesn’t shout — it makes room for you.”
              </blockquote>
              <p className="type-body mt-4 text-[0.8125rem] text-white/48">Something I return to on hard days</p>
            </aside>
          </motion.article>
        </Reveal>

        <div
          aria-hidden="true"
          className="hidden h-full w-px bg-gradient-to-b from-transparent via-white/14 to-transparent lg:block"
        />

        <div className="space-y-8">
          <Reveal delay={0.06}>
            <h2 className="type-label font-[Unbounded] text-[0.625rem] uppercase tracking-[0.26em]">
              Where I shine
            </h2>
          </Reveal>
          <Stagger className="grid gap-4" stagger={0.09} delayChildren={0.06}>
            {strengthSummaries.map((s) => (
              <StaggerItem key={s.slug}>
                <StrengthRow title={s.title} hint={s.hint} to={`/about/strengths/${s.slug}`} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>

      <Reveal calm delay={0.05} className="mt-12">
        <aside className="rounded-2xl border border-sky-400/20 bg-gradient-to-br from-sky-400/8 via-transparent to-violet-500/10 px-6 py-7 sm:px-8">
          <h2 className="type-label font-[Unbounded] text-[0.625rem] uppercase tracking-[0.26em] text-sky-200/90">
            Accessibility, in practice
          </h2>
          <p className="type-body mt-4 max-w-prose text-[0.9375rem] leading-relaxed">
            I design for clarity, accessibility, and real users — not as a bolt-on, but from the first frame.
            Structure, semantics, contrast, and keyboard paths are part of the craft, not a post-launch audit.
          </p>
        </aside>
      </Reveal>

      <SectionRule label="PRINCIPLES" />

      <Reveal calm>
        <div className="measure">
          <h2 className="type-label font-[Unbounded] text-[0.625rem] uppercase tracking-[0.26em]">
            Design principles
          </h2>
          <p className="type-body mt-4 max-w-prose text-[0.9375rem]">
            A short list I actually use — not to sound smart, but to decide when something is done.
          </p>
          <ul className="mt-10 flex flex-col gap-8 border-l border-white/12 pl-6 sm:pl-8">
            {designPrinciples.map((p) => (
              <li key={p.title}>
                <h3 className="text-[0.9375rem] font-semibold tracking-[-0.02em] text-white/88">{p.title}</h3>
                <p className="type-body mt-2 text-[0.875rem] leading-relaxed">{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      <SectionRule label="CAPABILITY" />

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <motion.section
          className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black/12 p-8 backdrop-blur-xl sm:p-10"
          whileHover={
            reduced ? undefined : { y: -2, transition: { duration: durations.base, ease: easeOutSoft } }
          }
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 top-0 h-56 w-56 rounded-full bg-violet-500/12 blur-3xl"
          />
          <h2 className="type-label font-[Unbounded] text-[0.625rem] uppercase tracking-[0.26em]">Skills</h2>
          <Stagger className="mt-8 flex flex-wrap gap-2.5" stagger={0.055} delayChildren={0.02}>
            {skills.map((s) => (
              <StaggerItem key={s}>
                <SkillPill>{s}</SkillPill>
              </StaggerItem>
            ))}
          </Stagger>
        </motion.section>

        <motion.section
          className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-8 backdrop-blur-xl sm:p-10"
          whileHover={
            reduced ? undefined : { y: -2, transition: { duration: durations.base, ease: easeOutSoft } }
          }
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-sky-400/10 blur-3xl"
          />
          <h2 className="type-label font-[Unbounded] text-[0.625rem] uppercase tracking-[0.26em]">Tools</h2>
          <Stagger className="mt-8 flex flex-wrap gap-2.5" stagger={0.06} delayChildren={0.02}>
            {tools.map((t) => (
              <StaggerItem key={t}>
                <SkillPill accent>{t}</SkillPill>
              </StaggerItem>
            ))}
          </Stagger>
        </motion.section>
      </div>
    </Page>
  )
}

function StrengthRow({ title, hint, to }) {
  const reduced = usePrefersReducedMotion()
  return (
    <Link
      to={to}
      className="block rounded-2xl focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-sky-300/90"
      aria-label={`${title}. Open strength page.`}
    >
      <motion.div
        className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 shadow-[0_0_0_1px_rgba(255,255,255,.02)] transition-[box-shadow,border-color,background-color] duration-500 hover:bg-white/[0.055]"
        whileHover={
          reduced
            ? undefined
            : {
                y: -4,
                borderColor: 'rgba(255,255,255,0.18)',
                boxShadow:
                  '0 0 0 1px rgba(255,255,255,.06), 0 26px 90px rgba(0,0,0,.55), 0 0 70px rgba(124,58,237,.10)',
                transition: { duration: durations.fast, ease: easeOutSoft },
              }
        }
        whileTap={reduced ? undefined : { scale: 0.99 }}
      >
        <div className="flex items-start justify-between gap-4">
          <p className="text-[0.9375rem] font-medium leading-snug tracking-[-0.015em] text-white/88">
            {title}
          </p>
          <span className="mt-0.5 inline-flex items-center gap-2 text-white/40">
            <span className="type-label hidden text-[0.6rem] tracking-[0.26em] sm:inline">OPEN</span>
            <span className="text-lg transition duration-500 group-hover:translate-x-1 group-hover:text-white/70">
              →
            </span>
          </span>
        </div>
        <p className="type-body mt-2 text-[0.8125rem] text-white/62">{hint}</p>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          style={{
            background:
              'linear-gradient(105deg, rgba(124,58,237,.12), rgba(56,189,248,.06), transparent 55%)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        />
      </motion.div>
    </Link>
  )
}

function SkillPill({ children, accent }) {
  const reduced = usePrefersReducedMotion()
  return (
    <motion.span
      className={`inline-flex items-center rounded-full border px-3.5 py-2 text-[0.8125rem] font-medium ${
        accent
          ? 'border-sky-400/15 bg-sky-400/5 text-white/78'
          : 'border-white/10 bg-white/5 text-white/74'
      }`}
      whileHover={
        reduced
          ? undefined
          : {
              y: -2,
              scale: 1.01,
              borderColor: accent ? 'rgba(56,189,248,0.28)' : 'rgba(255,255,255,0.16)',
              boxShadow: accent ? '0 0 20px rgba(56,189,248,.1)' : '0 0 20px rgba(124,58,237,.1)',
              transition: { duration: durations.fast, ease: easeOutSoft },
            }
      }
    >
      {children}
    </motion.span>
  )
}
