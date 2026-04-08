import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Page } from '../components/motion/Page.jsx'
import { Reveal } from '../components/motion/Reveal.jsx'
import { Stagger, StaggerItem } from '../components/motion/Stagger.jsx'
import { SectionRule } from '../components/ui/SectionRule.jsx'
import { HeroParallax } from '../components/ui/HeroParallax.jsx'
import { durations, easeOutSoft } from '../styles/motion.js'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.js'

export function Home() {
  const reduced = usePrefersReducedMotion()

  return (
    <Page>
      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black/20 shadow-[0_0_0_1px_rgba(255,255,255,.03)] backdrop-blur-xl">
        <AmbientAccents />

        {/* Standout editorial index — memorable, not noisy */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -right-2 bottom-4 select-none sm:right-6 sm:bottom-8"
          initial={reduced ? false : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: reduced ? 0 : 0.42, duration: reduced ? 0 : durations.slow, ease: easeOutSoft }}
        >
          {reduced ? (
            <div
              className="font-[Unbounded] text-[clamp(4.25rem,14vw,9.5rem)] font-semibold leading-none"
              style={{
                WebkitTextStroke: '1px rgba(255,255,255,0.16)',
                color: 'transparent',
              }}
            >
              01
            </div>
          ) : (
            <motion.span
              className="block bg-gradient-to-br from-white/40 via-violet-200/55 to-sky-300/45 bg-[length:240%_240%] bg-clip-text font-[Unbounded] text-[clamp(4.25rem,14vw,9.5rem)] font-semibold leading-none text-transparent"
              style={{ WebkitTextStroke: '1px rgba(255,255,255,0.08)' }}
              animate={{ backgroundPosition: ['0% 40%', '100% 60%', '0% 40%'] }}
              transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
            >
              01
            </motion.span>
          )}
        </motion.div>

        <HeroParallax className="relative z-[1] px-6 py-16 sm:px-10 sm:py-20">
          <div className="grid items-start gap-12 lg:grid-cols-[1.25fr_.75fr] lg:gap-14">
            <div>
              <Reveal>
                <div className="type-label font-[Unbounded] uppercase">UX / Experience Designer</div>
              </Reveal>

              <Reveal delay={0.05}>
                <div className="relative mt-7">
                  <motion.div
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-x-10 -inset-y-8 rounded-[36px] bg-[radial-gradient(520px_200px_at_28%_18%,rgba(124,58,237,.24),transparent_62%)] opacity-90 blur-2xl"
                    animate={reduced ? undefined : { opacity: [0.78, 0.88, 0.78] }}
                    transition={reduced ? undefined : { duration: 11, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <h1 className="type-display font-[Unbounded] relative text-[clamp(2.35rem,6.5vw,4.1rem)]">
                    Suleyman
                    <span className="mt-1 block font-normal text-white/58 sm:mt-0 sm:font-semibold sm:text-white/72">
                      Koncagul
                    </span>
                  </h1>
                </div>
              </Reveal>

              <Reveal delay={0.12}>
                <p className="type-lead measure mt-8 max-w-xl">
                  I shape digital experiences that feel calm and clear — for people who are busy, distracted,
                  or just trying to get something done. Clarity, accessibility, and honest storytelling matter
                  as much as the visuals.
                </p>
              </Reveal>

              <Stagger className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center" stagger={0.1} delayChildren={0.18}>
                <StaggerItem>
                  <Link
                    to="/projects"
                    className="group inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/7 px-6 py-3.5 text-sm font-medium text-white/90 shadow-[0_0_0_1px_rgba(255,255,255,.04)] transition hover:border-white/16 hover:bg-white/11 hover:text-white/98 hover:shadow-[0_0_0_1px_rgba(255,255,255,.07),0_24px_80px_rgba(0,0,0,.48)]"
                  >
                    <span>See selected work</span>
                    <span className="ml-2 inline-block translate-x-0 opacity-65 transition duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                      →
                    </span>
                  </Link>
                </StaggerItem>
                <StaggerItem>
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-transparent px-6 py-3.5 text-sm font-medium text-white/74 transition hover:border-white/15 hover:bg-white/6 hover:text-white/92"
                  >
                    Say hello
                  </Link>
                </StaggerItem>
              </Stagger>
            </div>

            <Reveal delay={0.12} className="lg:pt-6">
              <motion.div
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/7 to-transparent p-6 shadow-[0_0_0_1px_rgba(255,255,255,.03)]"
                whileHover={reduced ? undefined : { y: -4, transition: { duration: durations.base, ease: easeOutSoft } }}
              >
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
                <div className="type-body text-[0.8125rem] font-medium uppercase tracking-[0.12em] text-white/54">
                  Right now, I’m leaning on
                </div>
                <div className="mt-5 grid gap-2.5 text-sm">
                  <HomePill>Information Architecture</HomePill>
                  <HomePill>Accessibility-first UX</HomePill>
                  <HomePill>Prototyping & interaction</HomePill>
                  <HomePill>Frontend craft (React)</HomePill>
                </div>
                <div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-white/12 to-transparent" />
                <p className="type-body mt-6 text-[0.8125rem]">
                  I like work that earns trust — readable type, predictable motion, interfaces that don’t make
                  people guess.
                </p>
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-500/18 blur-3xl"
                  animate={reduced ? undefined : { scale: [1, 1.08, 1], opacity: [0.45, 0.65, 0.45] }}
                  transition={reduced ? undefined : { duration: 11, repeat: Infinity, ease: 'easeInOut' }}
                />
              </motion.div>
            </Reveal>
          </div>
        </HeroParallax>
      </section>

      <SectionRule label="WHAT MATTERS" />

      <Stagger className="grid gap-7 lg:grid-cols-3 lg:gap-8" stagger={0.12} delayChildren={0.04}>
        <StaggerItem>
          <FeatureCard kicker="FOCUS" title="Clarity first">
            Hierarchy and language before visuals. If someone can’t scan it, it isn’t finished.
          </FeatureCard>
        </StaggerItem>
        <StaggerItem>
          <FeatureCard kicker="SIGNAL" title="Experience over spectacle">
            Interfaces that feel alive — but never at the expense of comprehension or pace.
          </FeatureCard>
        </StaggerItem>
        <StaggerItem>
          <FeatureCard kicker="CRAFT" title="Accessible by intent">
            Contrast, structure, and motion that include people — not as a checkbox, but as a baseline.
          </FeatureCard>
        </StaggerItem>
      </Stagger>

      <Reveal calm delay={0.05} className="mt-16 max-w-xl">
        <p className="type-body text-[0.9375rem] leading-relaxed">
          Designed for clarity, accessibility, and real users. If you want the longer version — how I think,
          what I care about, and the principles I use when tradeoffs get hard —{' '}
          <Link to="/about" className="text-white/80 underline decoration-white/25 underline-offset-[5px] transition hover:text-white/95 hover:decoration-white/45">
            read about my approach
          </Link>
          .
        </p>
      </Reveal>
    </Page>
  )
}

function HomePill({ children }) {
  const reduced = usePrefersReducedMotion()
  return (
    <motion.div
      className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-white/76 shadow-[0_0_0_1px_rgba(255,255,255,.02)]"
      whileHover={
        reduced
          ? undefined
          : {
              y: -1,
              scale: 1.01,
              borderColor: 'rgba(255,255,255,0.18)',
              boxShadow: '0 0 28px rgba(124,58,237,.12)',
              transition: { duration: durations.fast, ease: easeOutSoft },
            }
      }
    >
      {children}
    </motion.div>
  )
}

function FeatureCard({ kicker, title, children }) {
  const reduced = usePrefersReducedMotion()
  return (
    <motion.article
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/15 p-7 backdrop-blur-xl"
      whileHover={
        reduced
          ? undefined
          : { y: -5, transition: { duration: durations.base, ease: easeOutSoft } }
      }
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(700px 240px at 20% 0%, rgba(124,58,237,.14), transparent 55%), radial-gradient(600px 220px at 90% 30%, rgba(56,189,248,.10), transparent 55%)',
        }}
      />
      <div className="relative">
        <div className="type-label font-[Unbounded]">{kicker}</div>
        <h2 className="type-display mt-4 font-[Unbounded] text-xl tracking-[-0.03em] sm:text-2xl">{title}</h2>
        <p className="type-body mt-4">{children}</p>
      </div>
    </motion.article>
  )
}

function AmbientAccents() {
  const reduced = usePrefersReducedMotion()
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: durations.slow, ease: easeOutSoft }}
    >
      <motion.div
        className="absolute -left-24 -top-24 h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle_at_center,rgba(124,58,237,.28),transparent_60%)] blur-3xl"
        animate={reduced ? undefined : { y: [0, 14, 0], x: [0, 10, 0] }}
        transition={reduced ? undefined : { duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-28 -right-24 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,.18),transparent_60%)] blur-3xl"
        animate={reduced ? undefined : { y: [0, -18, 0], x: [0, -12, 0] }}
        transition={reduced ? undefined : { duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute inset-x-0 top-10 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </motion.div>
  )
}
