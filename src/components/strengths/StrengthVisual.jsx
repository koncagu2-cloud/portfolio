import {
  AnimatePresence,
  motion,
  useAnimation,
  useInView,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { durations, easeOutSoft } from '../../styles/motion.js'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js'

/** Subtle interactive / visual block — variant matches strength content `visualVariant` */
export function StrengthVisual({ variant }) {
  const reduced = usePrefersReducedMotion()

  switch (variant) {
    case 'flow':
      return <VisualFlow reduced={reduced} />
    case 'layers':
      return <VisualLayers reduced={reduced} />
    case 'story':
      return <VisualStory reduced={reduced} />
    case 'stack':
      return <VisualStack reduced={reduced} />
    default:
      return null
  }
}

function VisualFlow({ reduced }) {
  const steps = useMemo(
    () => [
      {
        k: 'System',
        d1: 'Model & constraints',
        d2: '→ What exists and what’s possible',
        extra: 'Defines relationships, constraints, and logic',
      },
      {
        k: 'IA',
        d1: 'Paths & taxonomy',
        d2: '→ How people move through it',
        extra: 'Turns structure into paths people can follow',
      },
      {
        k: 'UI',
        d1: 'Interface & craft',
        d2: '→ What users actually feel',
        extra: 'Where clarity is experienced',
      },
    ],
    [],
  )

  const wrapRef = useRef(null)
  const inView = useInView(wrapRef, { once: true, margin: '-12%' })
  const [active, setActive] = useState(-1)
  const travel = useAnimation()
  const pulse = useAnimation()

  useEffect(() => {
    if (!inView || reduced) return

    // Slow, almost invisible pulse across the line (calm continuous motion)
    pulse.start({
      opacity: [0.25, 0.45, 0.25],
      transition: { duration: 8.5, repeat: Infinity, ease: 'easeInOut' },
    })

    // After the three blocks appear (0.0 / 0.28 / 0.56), send a glow traveling across.
    const t = window.setTimeout(() => {
      travel.start({
        x: ['6%', '50%', '94%'],
        opacity: [0, 1, 1, 0],
        transition: {
          duration: 1.6,
          times: [0, 0.12, 0.86, 1],
          ease: easeOutSoft,
        },
      })
    }, 780)

    return () => window.clearTimeout(t)
  }, [inView, reduced, pulse, travel])

  const nudgeFlowForward = () => {
    if (reduced) return
    travel.start({
      x: ['6%', '50%', '94%'],
      opacity: [0, 1, 1, 0],
      transition: { duration: 1.4, times: [0, 0.12, 0.86, 1], ease: easeOutSoft },
    })
  }

  const settleAtUI = () => {
    if (reduced) return
    travel.start({
      x: '94%',
      opacity: 0.65,
      transition: { duration: durations.base, ease: easeOutSoft },
    })
    window.setTimeout(() => {
      travel.start({ opacity: 0, transition: { duration: durations.base, ease: easeOutSoft } })
    }, 700)
  }

  return (
    <section
      ref={wrapRef}
      className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black/20 px-6 py-10 sm:px-10"
      aria-label="How the layers stack: System leads to IA leads to UI"
    >
      <div className="type-label mb-8 font-[Unbounded] text-[0.625rem] uppercase tracking-[0.26em]">
        How the layers stack
      </div>

      {/* Flow line + traveling glow */}
      <div aria-hidden="true" className="relative mb-10 hidden sm:block">
        <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-white/14 to-transparent" />
        <motion.div
          className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-violet-400/0 via-violet-300/18 to-sky-300/0"
          animate={pulse}
        />
        <motion.div
          className="absolute top-1/2 h-[6px] w-[140px] -translate-y-1/2 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,.22),rgba(124,58,237,.20),transparent_70%)] blur-[1px]"
          initial={reduced ? false : { opacity: 0, x: '6%' }}
          animate={travel}
        />
      </div>

      <div className="grid gap-7 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-end sm:gap-6">
        {steps.map((s, i) => {
          const isActive = active === i
          const isDimmed =
            active === -1
              ? false
              : i === active
                ? false
                : active === 0
                  ? i === 2 // hovering System softens UI only
                  : true // hovering IA dims System+UI; hovering UI dims System+IA

          const baseLook =
            i === 0
              ? 'bg-gradient-to-b from-white/[0.05] to-white/[0.03] ring-1 ring-white/8'
              : i === 1
                ? 'bg-white/[0.035] ring-1 ring-white/10 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:22px_22px]'
                : 'bg-white/[0.045] ring-1 ring-white/12'

          return (
            <motion.div key={s.k} className="contents">
              <motion.div
                role="button"
                tabIndex={0}
                aria-pressed="false"
                aria-label={`${s.k} layer`}
                onMouseEnter={() => {
                  setActive(i)
                  if (i === 0) nudgeFlowForward()
                  if (i === 2) settleAtUI()
                }}
                onMouseLeave={() => setActive(-1)}
                onFocus={() => {
                  setActive(i)
                  if (i === 0) nudgeFlowForward()
                  if (i === 2) settleAtUI()
                }}
                onBlur={() => setActive(-1)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                  }
                }}
                className={[
                  'group relative rounded-2xl border border-white/10 px-6 py-6 shadow-[0_0_0_1px_rgba(255,255,255,.02)]',
                  'outline-none focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-300/90 focus-visible:outline-offset-4',
                  'transition-[transform,box-shadow,filter,opacity,border-color] duration-500',
                  baseLook,
                ].join(' ')}
                initial={reduced ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{
                  delay: reduced ? 0 : i === 0 ? 0 : i === 1 ? 0.28 : 0.56,
                  duration: durations.slow,
                  ease: easeOutSoft,
                }}
                animate={
                  reduced
                    ? undefined
                    : {
                        opacity: isDimmed ? 0.55 : 1,
                        filter: isDimmed ? 'blur(1.5px)' : 'blur(0px)',
                      }
                }
                whileHover={
                  reduced
                    ? undefined
                    : {
                        scale: 1.03,
                        y: -4,
                        borderColor: isActive ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.16)',
                        boxShadow: isActive
                          ? '0 0 0 1px rgba(255,255,255,.07), 0 28px 90px rgba(0,0,0,.55), 0 0 70px rgba(124,58,237,.12)'
                          : '0 0 0 1px rgba(255,255,255,.05), 0 22px 70px rgba(0,0,0,.5)',
                        transition: { duration: durations.fast, ease: easeOutSoft },
                      }
                }
              >
                {/* Layer-specific ambient glow */}
                <div
                  aria-hidden="true"
                  className={[
                    'pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full blur-3xl transition-opacity duration-700',
                    i === 0
                      ? 'bg-violet-500/12 opacity-70'
                      : i === 1
                        ? 'bg-white/6 opacity-60'
                        : 'bg-sky-400/10 opacity-60',
                  ].join(' ')}
                  style={{ opacity: isActive ? 1 : 0.55 }}
                />

                <div className="relative">
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="font-[Unbounded] text-lg tracking-[-0.02em] text-white/90">{s.k}</div>
                    {/* Subtle “breathing” arrow indicator on the card itself */}
                    <motion.span
                      aria-hidden="true"
                      className="text-white/35"
                      animate={
                        reduced
                          ? undefined
                          : { x: [0, 2, 0], opacity: [0.5, 0.8, 0.5] }
                      }
                      transition={
                        reduced
                          ? undefined
                          : { duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }
                      }
                    >
                      →
                    </motion.span>
                  </div>

                  <div className="mt-3">
                    <p className="type-body text-[0.8125rem] text-white/72">{s.d1}</p>
                    <p className="type-body mt-1 text-[0.8125rem] text-white/55">{s.d2}</p>
                  </div>

                  <AnimatePresence initial={false}>
                    {active === i ? (
                      <motion.p
                        className="mt-4 text-[0.8125rem] leading-relaxed text-white/76"
                        initial={reduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
                        animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                        exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
                        transition={{ duration: durations.base, ease: easeOutSoft }}
                      >
                        {s.extra}
                      </motion.p>
                    ) : null}
                  </AnimatePresence>
                </div>
              </motion.div>

              {i < steps.length - 1 ? (
                <motion.div
                  aria-hidden="true"
                  className="hidden items-center justify-center sm:flex"
                  initial={reduced ? false : { opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: reduced ? 0 : i === 0 ? 0.2 : 0.42,
                    duration: durations.base,
                    ease: easeOutSoft,
                  }}
                >
                  <motion.div
                    className="relative h-10 w-16"
                    animate={reduced ? undefined : { x: [0, 3, 0] }}
                    transition={reduced ? undefined : { duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-white/18" />
                    <div className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-r border-t border-white/25" />
                  </motion.div>
                </motion.div>
              ) : null}
            </motion.div>
          )
        })}
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 left-1/2 h-40 w-[min(90%,480px)] -translate-x-1/2 rounded-full bg-violet-500/12 blur-3xl"
      />
    </section>
  )
}

function VisualLayers({ reduced }) {
  const [mode, setMode] = useState('accessible')
  const layers = [
    { id: 'structure', t: 'Structure', b: 'Semantics & landmarks' },
    { id: 'focus', t: 'Focus', b: 'Keyboard + visible states' },
    { id: 'motion', t: 'Motion', b: 'Purpose, not spectacle' },
    { id: 'check', t: 'Check', b: 'Contrast & real content' },
  ]

  const isAccessible = mode === 'accessible'

  return (
    <section
      className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent px-6 py-10 sm:px-10"
      aria-label="Accessibility as layers"
    >
      <div className="type-label mb-6 font-[Unbounded] text-[0.625rem] uppercase tracking-[0.26em]">
        Accessibility as layers
      </div>

      {/* Mode toggle */}
      <div className="mb-8 inline-flex rounded-full border border-white/12 bg-black/40 p-0.5 text-xs text-white/70 shadow-[0_0_0_1px_rgba(255,255,255,.03)]">
        <button
          type="button"
          onClick={() => setMode('accessible')}
          className={[
            'relative flex-1 rounded-full px-3.5 py-2',
            'transition-[background-color,color,transform] duration-300',
            isAccessible ? 'bg-white/90 text-black shadow-[0_10px_30px_rgba(0,0,0,.35)]' : 'bg-transparent text-white/70',
          ].join(' ')}
          aria-pressed={isAccessible}
        >
          <span className="font-medium">Accessible</span>
        </button>
        <button
          type="button"
          onClick={() => setMode('inaccessible')}
          className={[
            'relative flex-1 rounded-full px-3.5 py-2',
            'transition-[background-color,color,transform] duration-300',
            !isAccessible ? 'bg-white/8 text-white/85' : 'bg-transparent text-white/55',
          ].join(' ')}
          aria-pressed={!isAccessible}
        >
          <span className="font-medium">Inaccessible</span>
        </button>
      </div>

      <div
        aria-hidden="true"
        className="mb-6 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent"
      />

      <div className="relative mx-auto max-w-lg space-y-5">
        {layers.map((L, i) => (
          <motion.section
            key={L.id}
            aria-label={L.t}
            className={[
              'group rounded-2xl border px-5 py-4 shadow-[0_0_0_1px_rgba(255,255,255,.03)] transition-[transform,box-shadow,border-color,background-color] duration-400',
              isAccessible
                ? 'border-white/14 bg-black/35'
                : 'border-white/6 bg-black/55',
            ].join(' ')}
            initial={reduced ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{
              delay: reduced ? 0 : i * 0.08,
              duration: durations.base,
              ease: easeOutSoft,
            }}
            whileHover={
              reduced
                ? undefined
                : {
                    scale: 1.02,
                    y: -2,
                    borderColor: 'rgba(255,255,255,0.2)',
                    boxShadow: isAccessible
                      ? '0 18px 55px rgba(0,0,0,.55)'
                      : '0 12px 40px rgba(0,0,0,.6)',
                  }
            }
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-white/88">{L.t}</div>
                <div className="type-body mt-1 text-[0.8125rem]">
                  {L.b}
                  {L.id === 'structure' && (
                    <span className="block text-[0.78rem] text-white/55">
                      → Gives assistive tech something real to work with
                    </span>
                  )}
                  {L.id === 'focus' && (
                    <span className="block text-[0.78rem] text-white/55">
                      → Lets keyboard users see where they are
                    </span>
                  )}
                  {L.id === 'motion' && (
                    <span className="block text-[0.78rem] text-white/55">
                      → Explains change without demanding attention
                    </span>
                  )}
                  {L.id === 'check' && (
                    <span className="block text-[0.78rem] text-white/55">
                      → Confirms real content stays readable
                    </span>
                  )}
                </div>
              </div>
              <div className="text-[0.7rem] text-white/45">
                {L.id === 'structure' && (isAccessible ? 'Readable' : 'Harder to parse')}
                {L.id === 'focus' && (isAccessible ? 'Clear focus' : 'Lost focus')}
                {L.id === 'motion' && (isAccessible ? 'Calm' : 'Jittery')}
                {L.id === 'check' && (isAccessible ? 'Comfortable' : 'Strained')}
              </div>
            </div>

            {L.id === 'structure' && (
              <StructureDemo accessible={isAccessible} />
            )}
            {L.id === 'focus' && (
              <FocusDemo accessible={isAccessible} />
            )}
            {L.id === 'motion' && (
              <MotionDemo accessible={isAccessible} reduced={reduced} />
            )}
            {L.id === 'check' && (
              <CheckDemo accessible={isAccessible} />
            )}
          </motion.section>
        ))}
      </div>
    </section>
  )
}

function VisualStory({ reduced }) {
  const beats = useMemo(
    () => [
      {
        n: '01',
        t: 'Problem',
        d: 'Stakes & constraints',
        e: '→ What made this situation complex',
        hover: 'What made this hard',
        tone: 'from-black/35 via-black/25 to-black/10',
      },
      {
        n: '02',
        t: 'Process',
        d: 'Decisions & tradeoffs',
        e: '→ How we navigated uncertainty',
        hover: 'How decisions were made',
        tone: 'from-white/[0.045] via-black/15 to-transparent',
      },
      {
        n: '03',
        t: 'Outcome',
        d: 'What changed',
        e: '→ What actually improved',
        hover: 'What actually changed',
        tone: 'from-white/[0.06] via-black/15 to-transparent',
      },
      {
        n: '04',
        t: 'Reflection',
        d: 'What stayed open',
        e: '→ What we’d do differently',
        hover: 'What stayed unresolved',
        tone: 'from-white/[0.04] via-black/10 to-transparent',
      },
    ],
    [],
  )

  const wrapRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ['start 80%', 'end 35%'],
  })
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.3 })

  const [activeFromScroll, setActiveFromScroll] = useState(0)
  const [activeOverride, setActiveOverride] = useState(null)

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (reduced) return
    // Four segments: [0..1) -> index 0..3
    const idx = Math.max(0, Math.min(3, Math.floor(v * 4)))
    setActiveFromScroll(idx)
  })

  const active = activeOverride ?? activeFromScroll

  return (
    <section
      ref={wrapRef}
      className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black/20 px-6 py-10 sm:px-10"
      aria-label="Case study rhythm: problem, process, outcome, reflection"
    >
      <div className="type-label mb-8 font-[Unbounded] text-[0.625rem] uppercase tracking-[0.26em]">
        Case study rhythm
      </div>

      {/* Progress indicator */}
      <div className="relative mb-9">
        <div aria-hidden="true" className="h-px w-full bg-white/10" />
        <motion.div
          aria-hidden="true"
          className="absolute left-0 top-1/2 h-px w-full origin-left -translate-y-1/2 bg-gradient-to-r from-violet-400/60 via-sky-300/40 to-transparent"
          style={{ scaleX: reduced ? 0.65 : progress }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute top-1/2 h-[6px] w-[140px] -translate-y-1/2 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,.20),rgba(56,189,248,.18),transparent_70%)] blur-[1px]"
          style={{
            left: reduced ? '65%' : progress,
            translateX: '-50%',
          }}
        />
      </div>

      <ul className="relative grid list-none gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
        {beats.map((b, i) => {
          const isActive = active === i
          const isInactive = active !== i
          const isReflection = i === 3
          const slowDown = isReflection && isActive

          return (
            <motion.li
              key={b.t}
              className="relative"
              initial={reduced ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{
                delay: reduced ? 0 : i * 0.1,
                duration: durations.slow,
                ease: easeOutSoft,
              }}
            >
              <motion.button
                type="button"
                onMouseEnter={() => setActiveOverride(i)}
                onMouseLeave={() => setActiveOverride(null)}
                onFocus={() => setActiveOverride(i)}
                onBlur={() => setActiveOverride(null)}
                className={[
                  'group w-full rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left',
                  'outline-none focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-300/90 focus-visible:outline-offset-4',
                  'transition-[transform,box-shadow,filter,opacity,border-color,background-color] duration-500',
                ].join(' ')}
                animate={
                  reduced
                    ? undefined
                    : {
                        scale: isActive ? 1.03 : 1,
                        opacity: isInactive ? 0.62 : 1,
                        filter: isInactive ? 'blur(0.4px)' : 'blur(0px)',
                        borderColor: isActive ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.10)',
                        backgroundColor: isActive ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
                        boxShadow: isActive
                          ? '0 0 0 1px rgba(255,255,255,.06), 0 24px 80px rgba(0,0,0,.55), 0 0 70px rgba(124,58,237,.10)'
                          : '0 0 0 1px rgba(255,255,255,.02)',
                        transition: {
                          duration: slowDown ? durations.breath : durations.base,
                          ease: easeOutSoft,
                        },
                      }
                }
                whileHover={
                  reduced
                    ? undefined
                    : {
                        y: -4,
                        boxShadow:
                          '0 0 0 1px rgba(255,255,255,.07), 0 26px 90px rgba(0,0,0,.58), 0 0 80px rgba(56,189,248,.10)',
                        transition: { duration: durations.fast, ease: easeOutSoft },
                      }
                }
              >
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b ${b.tone} opacity-80`}
                />

                <div className="relative">
                  <motion.span
                    className="inline-flex font-[Unbounded] text-[0.65rem] tracking-[0.2em] text-white/55"
                    initial={reduced ? false : { opacity: 0, y: 6 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: reduced ? 0 : 0.08 + i * 0.08,
                      duration: durations.base,
                      ease: easeOutSoft,
                    }}
                  >
                    {b.n}
                  </motion.span>

                  <div className="mt-2 font-[Unbounded] text-base text-white/90">{b.t}</div>

                  <div className="mt-2">
                    <p className="type-body text-[0.8125rem] text-white/74">{b.d}</p>
                    <p className="type-body mt-1 text-[0.8125rem] text-white/55">{b.e}</p>
                  </div>

                  <AnimatePresence initial={false}>
                    {activeOverride === i ? (
                      <motion.p
                        className="mt-4 text-[0.8125rem] text-white/78"
                        initial={reduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
                        animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                        exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
                        transition={{ duration: durations.base, ease: easeOutSoft }}
                      >
                        {b.hover}
                      </motion.p>
                    ) : null}
                  </AnimatePresence>
                </div>
              </motion.button>
            </motion.li>
          )
        })}
      </ul>
    </section>
  )
}

function VisualStack({ reduced }) {
  const [mode, setMode] = useState('polished')
  const polished = mode === 'polished'

  const cards = useMemo(
    () => [
      { t: 'Intent', d: 'Flows & states', hintGood: 'Clear state', hintBad: 'Confusing state' },
      { t: 'Interactive', d: 'Motion & feedback', hintGood: 'Feels responsive', hintBad: 'Feels off' },
      { t: 'Craft', d: 'Edge cases & performance', hintGood: 'Graceful', hintBad: 'Cramped' },
    ],
    [],
  )

  return (
    <div
      className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black/25 px-6 py-10 sm:px-10"
      role="img"
      aria-label="Stacked cards showing prototype depth from intent to craft"
    >
      <div className="type-label mb-8 font-[Unbounded] text-[0.625rem] uppercase tracking-[0.26em]">
        Fidelity with intention
      </div>
      {/* Polished / Unpolished toggle */}
      <div className="mb-10 flex justify-center">
        <div className="inline-flex rounded-full border border-white/12 bg-black/45 p-0.5 text-xs shadow-[0_0_0_1px_rgba(255,255,255,.03)]">
          <button
            type="button"
            onClick={() => setMode('polished')}
            aria-pressed={polished}
            className={[
              'rounded-full px-4 py-2 font-medium transition-[background-color,color] duration-300',
              polished ? 'bg-white/92 text-black' : 'text-white/70 hover:text-white/85',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300/95 focus-visible:outline-offset-4',
            ].join(' ')}
          >
            Polished
          </button>
          <button
            type="button"
            onClick={() => setMode('unpolished')}
            aria-pressed={!polished}
            className={[
              'rounded-full px-4 py-2 font-medium transition-[background-color,color] duration-300',
              !polished ? 'bg-white/8 text-white/90' : 'text-white/55 hover:text-white/80',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300/95 focus-visible:outline-offset-4',
            ].join(' ')}
          >
            Unpolished
          </button>
        </div>
      </div>

      <div className="mx-auto flex max-w-lg flex-col items-center gap-8 pb-2">
        {cards.map((c, i) => (
          <motion.section
            key={c.t}
            className="relative w-full rounded-[28px] border border-white/10 bg-black/55 px-6 py-6 shadow-[0_24px_80px_rgba(0,0,0,.45)] backdrop-blur-md"
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ delay: reduced ? 0 : 0.1 + i * 0.12, duration: durations.slow, ease: easeOutSoft }}
            whileHover={
              reduced
                ? undefined
                : {
                    y: -3,
                    scale: 1.02,
                    borderColor: 'rgba(255,255,255,0.16)',
                    boxShadow: '0 0 0 1px rgba(255,255,255,.06), 0 34px 110px rgba(0,0,0,.6)',
                    transition: { duration: durations.base, ease: easeOutSoft },
                  }
            }
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[28px] bg-[radial-gradient(800px_220px_at_20%_0%,rgba(124,58,237,.10),transparent_60%)] opacity-70"
            />

            <div className="relative flex items-start justify-between gap-4">
              <div>
                <div className="font-[Unbounded] text-sm text-white/90">{c.t}</div>
                <p className="type-body mt-2 text-[0.8125rem] text-white/70">{c.d}</p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[0.7rem] text-white/65">
                {polished ? c.hintGood : c.hintBad}
              </span>
            </div>

            {c.t === 'Intent' ? (
              <IntentFlowDemo polished={polished} reduced={reduced} />
            ) : c.t === 'Interactive' ? (
              <InteractiveDemo polished={polished} reduced={reduced} />
            ) : (
              <CraftDemo polished={polished} reduced={reduced} />
            )}
          </motion.section>
        ))}
      </div>
    </div>
  )
}

function IntentFlowDemo({ polished, reduced }) {
  const [step, setStep] = useState(1)
  const next = () => setStep((s) => (s >= 3 ? 1 : s + 1))
  const prev = () => setStep((s) => (s <= 1 ? 3 : s - 1))

  const stepLabels = {
    1: { title: 'Step 1', body: 'Choose a path' },
    2: { title: 'Step 2', body: 'Confirm details' },
    3: { title: 'Step 3', body: 'Complete' },
  }

  return (
    <div className="relative mt-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[0.75rem] text-white/55">
          {polished ? 'Clear state change' : 'State changes, but feels abrupt'}
        </div>
        <div className="text-[0.75rem] text-white/45">Current: {step}/3</div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
        {polished && !reduced ? (
          <AnimatePresence mode="popLayout">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(6px)' }}
              transition={{ duration: durations.base, ease: easeOutSoft }}
            >
              <div className="font-[Unbounded] text-sm text-white/90">{stepLabels[step].title}</div>
              <p className="type-body mt-2 text-[0.8125rem] text-white/70">{stepLabels[step].body}</p>
              <div className="mt-3 h-px w-full bg-white/10" />
              <div className="mt-3 flex items-center gap-2">
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[0.7rem] text-white/65">
                  Flow
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[0.7rem] text-white/65">
                  States
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div>
            <div className="font-[Unbounded] text-sm text-white/85">{stepLabels[step].title}</div>
            <p className="mt-2 text-[0.78rem] leading-snug text-white/58">{stepLabels[step].body}</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={prev}
          className={[
            'rounded-full border px-3 py-2 text-[0.75rem] text-white/75',
            polished ? 'border-white/12 bg-white/6 hover:bg-white/9' : 'border-white/8 bg-white/3 hover:bg-white/5',
            'transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300/95 focus-visible:outline-offset-4',
          ].join(' ')}
        >
          Back
        </button>
        <button
          type="button"
          onClick={next}
          className={[
            'rounded-full border px-3 py-2 text-[0.75rem] text-white/85',
            polished
              ? 'border-white/14 bg-gradient-to-r from-violet-500/20 via-white/8 to-sky-400/14 hover:bg-white/10'
              : 'border-white/8 bg-white/4 hover:bg-white/6',
            'transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300/95 focus-visible:outline-offset-4',
          ].join(' ')}
        >
          Next
        </button>
      </div>
    </div>
  )
}

function InteractiveDemo({ polished, reduced }) {
  const [pressed, setPressed] = useState(false)

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
        <div className="mb-3 text-[0.75rem] text-white/55">{polished ? 'Feels responsive' : 'Feels off'}</div>
        <motion.button
          type="button"
          onClick={() => {
            setPressed(true)
            window.setTimeout(() => setPressed(false), 220)
          }}
          className={[
            'w-full rounded-xl border px-4 py-3 text-sm font-medium',
            polished
              ? 'border-white/14 bg-white/8 text-white/90'
              : 'border-white/10 bg-white/4 text-white/75',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300/95 focus-visible:outline-offset-4',
          ].join(' ')}
          whileHover={
            !polished || reduced
              ? undefined
              : {
                  y: -2,
                  boxShadow: '0 0 28px rgba(124,58,237,.12)',
                  transition: { duration: durations.fast, ease: easeOutSoft },
                }
          }
          whileTap={
            reduced
              ? undefined
              : polished
                ? { scale: 0.98, transition: { duration: durations.fast } }
                : { scale: 1, transition: { duration: 0 } }
          }
          animate={
            pressed && polished && !reduced
              ? { scale: 0.985, transition: { duration: durations.fast } }
              : undefined
          }
        >
          {polished ? 'Press me' : 'Click'}
        </motion.button>
        <div className="mt-3 text-[0.75rem] text-white/45">
          {polished ? 'Hover, press, release — feedback stays calm.' : 'No real feedback — hard to trust.'}
        </div>
      </div>

      <motion.div
        className="rounded-2xl border border-white/10 bg-black/45 p-4"
        whileHover={
          !polished || reduced
            ? undefined
            : { y: -3, transition: { duration: durations.base, ease: easeOutSoft } }
        }
      >
        <div className="mb-3 text-[0.75rem] text-white/55">Card interaction</div>
        <motion.div
          className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-4"
          whileHover={
            !polished || reduced
              ? undefined
              : {
                  boxShadow: '0 18px 60px rgba(0,0,0,.55)',
                  borderColor: 'rgba(255,255,255,0.18)',
                  transition: { duration: durations.base, ease: easeOutSoft },
                }
          }
        >
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0"
            animate={polished && !reduced ? { opacity: [0.25, 0.45, 0.25] } : { opacity: 0 }}
            transition={polished && !reduced ? { duration: 6.5, repeat: Infinity, ease: 'easeInOut' } : { duration: 0 }}
            style={{
              background:
                'radial-gradient(600px 220px at 20% 0%, rgba(124,58,237,.18), transparent 55%), radial-gradient(520px 200px at 90% 40%, rgba(56,189,248,.10), transparent 55%)',
            }}
          />
          <div className="relative">
            <div className="font-[Unbounded] text-sm text-white/88">Hover depth</div>
            <p className="type-body mt-2 text-[0.8125rem] text-white/65">
              {polished ? 'Shadow shifts, glow breathes, nothing shouts.' : 'Flat card. Interaction feels dead.'}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

function CraftDemo({ polished, reduced }) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), polished ? 900 : 1200)
    return () => window.clearTimeout(t)
  }, [polished])

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-black/45 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="text-[0.75rem] text-white/55">
          {polished ? 'Graceful loading + long content' : 'Awkward loading + cramped content'}
        </div>
        <button
          type="button"
          onClick={() => setLoading(true)}
          className={[
            'rounded-full border px-3 py-1.5 text-[0.7rem] text-white/70',
            polished ? 'border-white/12 bg-white/6 hover:bg-white/9' : 'border-white/8 bg-white/4 hover:bg-white/6',
            'transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300/95 focus-visible:outline-offset-4',
          ].join(' ')}
        >
          Reload
        </button>
      </div>

      <div className={polished ? 'mt-4 grid gap-3' : 'mt-3 grid gap-2'}>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: polished ? durations.base : durations.fast, ease: easeOutSoft }}
            >
              <div className="mb-2 text-[0.75rem] text-white/55">Loading…</div>
              <div className="space-y-2">
                <div className="h-2 w-[55%] rounded-full bg-white/12" />
                <div className="h-2 w-[78%] rounded-full bg-white/10" />
                <div className="h-2 w-[62%] rounded-full bg-white/9" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              className={[
                'rounded-xl border border-white/10 bg-white/[0.03]',
                polished ? 'p-4' : 'p-3',
              ].join(' ')}
              initial={reduced ? false : { opacity: 0, y: polished ? 8 : 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: polished ? durations.base : durations.fast,
                ease: easeOutSoft,
              }}
            >
              <div className="font-[Unbounded] text-sm text-white/88">
                {polished ? 'Empty state handled' : 'Empty state (kind of)'}
              </div>
              <p className={polished ? 'type-body mt-2 text-[0.8125rem] text-white/70' : 'mt-2 text-[0.78rem] leading-tight text-white/55'}>
                {polished
                  ? 'If there’s nothing to show yet, the layout still feels intentional — no broken gaps.'
                  : 'If nothing loads, the layout feels cramped and uncertain.'}
              </p>

              <div className="mt-4 rounded-lg border border-white/10 bg-black/40 px-3 py-2">
                <div className="text-[0.7rem] text-white/45">{polished ? 'Long content:' : 'Long content (tight):'}</div>
                <div
                  className={[
                    polished ? 'mt-1 text-[0.78rem] leading-relaxed text-white/70' : 'mt-1 text-[0.78rem] leading-tight text-white/52',
                    polished ? 'break-words' : 'truncate',
                  ].join(' ')}
                  title="This is intentionally long to test overflow behavior."
                >
                  A very long title or message that should not break the layout when it wraps across multiple lines on smaller screens.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function StructureDemo({ accessible }) {
  return (
    <div className="mt-4 space-y-1.5" aria-hidden="true">
      <div
        className={[
          'h-2.5 w-24 rounded-full',
          accessible ? 'bg-white/85' : 'bg-white/55',
        ].join(' ')}
      />
      <div
        className={[
          'h-[1px] w-full',
          accessible ? 'bg-white/18' : 'bg-white/8',
        ].join(' ')}
      />
      <div className="space-y-1.5 pt-1">
        <div
          className={[
            'h-2 w-[68%] rounded-full',
            accessible ? 'bg-white/70' : 'bg-white/45',
          ].join(' ')}
        />
        <div
          className={[
            'h-2 w-[54%] rounded-full',
            accessible ? 'bg-white/60' : 'bg-white/40',
          ].join(' ')}
        />
        <div
          className={[
            'h-2 w-[80%] rounded-full',
            accessible ? 'bg-white/55' : 'bg-white/35',
          ].join(' ')}
        />
      </div>
    </div>
  )
}

function FocusDemo({ accessible }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2" aria-hidden="true">
      <button
        type="button"
        className={[
          'rounded-full px-3 py-1.5 text-[0.75rem] transition-colors',
          accessible
            ? 'border border-sky-300/40 bg-sky-500/15 text-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300/95 focus-visible:outline-offset-4'
            : 'border border-white/12 bg-white/5 text-white/65 focus-visible:outline-none',
        ].join(' ')}
      >
        Demo one
      </button>
      <button
        type="button"
        className={[
          'rounded-full px-3 py-1.5 text-[0.75rem] transition-colors',
          accessible
            ? 'border border-sky-300/40 bg-sky-500/15 text-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300/95 focus-visible:outline-offset-4'
            : 'border border-white/12 bg-white/5 text-white/65 focus-visible:outline-none',
        ].join(' ')}
      >
        Demo two
      </button>
    </div>
  )
}

function MotionDemo({ accessible, reduced }) {
  const variant = accessible ? 'accessible' : 'inaccessible'
  const base = {
    initial: { opacity: 1, y: 0 },
    animate: reduced
      ? { opacity: 1, y: 0 }
      : accessible
        ? { y: [0, -4, 0] }
        : { y: [0, -8, 4, 0] },
  }
  const transition = reduced
    ? { duration: 0 }
    : accessible
      ? { duration: 5.2, repeat: Infinity, ease: 'easeInOut' }
      : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }

  return (
    <motion.div
      aria-hidden="true"
      className="mt-4 inline-flex items-center rounded-2xl border border-white/12 bg-black/50 px-4 py-3 text-[0.75rem]"
      variants={{ [variant]: base }}
      initial={variant}
      animate={variant}
      transition={transition}
    >
      <div className="mr-3 h-6 w-10 overflow-hidden rounded-md bg-black/40">
        <motion.div
          className="h-full w-[130%] bg-gradient-to-br from-violet-500/40 via-sky-400/30 to-transparent"
          animate={
            reduced
              ? undefined
              : accessible
                ? { x: ['-10%', '0%', '-10%'] }
                : { x: ['-20%', '10%', '-20%'] }
          }
          transition={transition}
        />
      </div>
      <span className="text-white/75">{accessible ? 'Calm card motion' : 'Slightly jumpy motion'}</span>
    </motion.div>
  )
}

function CheckDemo({ accessible }) {
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2" aria-hidden="true">
      <div className="rounded-xl border border-white/14 bg-black/40 px-4 py-3">
        <div className="mb-2 text-[0.75rem] font-semibold text-white/80">Accessible</div>
        <p className="type-body text-[0.8125rem] leading-relaxed text-white/80">
          Body text with comfortable contrast and line height — easy to read without leaning in.
        </p>
      </div>
      <div className="rounded-xl border border-white/6 bg-black/70 px-4 py-2">
        <div className="mb-1 text-[0.75rem] font-semibold text-white/65">Harder to read</div>
        <p className="text-[0.78rem] leading-tight text-white/55">
          Slightly lower contrast and tighter spacing. Still visible, but more work for the eyes.
        </p>
      </div>
    </div>
  )
}
