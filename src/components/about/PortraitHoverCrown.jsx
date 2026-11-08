import { useId, useState } from 'react'
import { motion } from 'framer-motion'
import { easeOutSoft } from '../../styles/motion.js'

/** Matches globals.css --glow / --glow2 (violet + sky) */
function CrownSvg({ className }) {
  const uid = useId()
  const gid = `crown-metal-${uid}`
  const gShine = `crown-shine-${uid}`
  const fid = `crown-soft-${uid}`

  return (
    <svg
      className={className}
      viewBox="0 0 200 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="28" x2="200" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4c1d95" />
          <stop offset="0.22" stopColor="#6d28d9" />
          <stop offset="0.45" stopColor="#7c3aed" />
          <stop offset="0.62" stopColor="#38bdf8" />
          <stop offset="0.82" stopColor="#5b21b6" />
          <stop offset="1" stopColor="#4c1d95" />
        </linearGradient>
        <linearGradient id={gShine} x1="100" y1="0" x2="100" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="rgba(255,255,255,0.45)" />
          <stop offset="0.35" stopColor="rgba(255,255,255,0.08)" />
          <stop offset="1" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <filter id={fid} x="-8%" y="-8%" width="116%" height="116%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Wide band + peaks — spans like a real circlet across the forehead / top of head */}
      <path
        filter={`url(#${fid})`}
        fill={`url(#${gid})`}
        stroke="rgba(255,255,255,0.14)"
        strokeWidth="0.4"
        d="M 0 48 L 0 34 L 8 32 L 20 9 L 32 32 L 44 16 L 54 32 L 68 7 L 80 32 L 92 18 L 100 4 L 108 18 L 120 32 L 132 7 L 144 32 L 156 16 L 166 32 L 180 9 L 192 32 L 200 34 L 200 48 L 0 48 Z"
      />

      {/* Light sweep on metal */}
      <path
        fill={`url(#${gShine})`}
        d="M 0 34 L 8 32 L 20 9 L 32 32 L 44 16 L 54 32 L 68 7 L 80 32 L 92 18 L 100 4 L 108 18 L 120 32 L 132 7 L 144 32 L 156 16 L 166 32 L 180 9 L 192 32 L 200 34 L 200 40 L 0 40 Z"
        opacity="0.55"
      />

      {/* Gem accents — sky + violet */}
      <circle cx="20" cy="22" r="2.2" fill="#38bdf8" opacity="0.95" />
      <circle cx="68" cy="18" r="2" fill="#a78bfa" opacity="0.9" />
      <circle cx="100" cy="10" r="2.8" fill="#e0e7ff" opacity="0.95" />
      <circle cx="132" cy="18" r="2" fill="#a78bfa" opacity="0.9" />
      <circle cx="180" cy="22" r="2.2" fill="#38bdf8" opacity="0.95" />

      {/* Ground shadow under band */}
      <ellipse cx="100" cy="49" rx="88" ry="3.5" fill="rgba(0,0,0,0.28)" />
    </svg>
  )
}

function Sparkle({ className, delay }) {
  return (
    <motion.span
      className={`pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-sky-300/90 shadow-[0_0_12px_rgba(56,189,248,0.85)] ${className}`}
      initial={false}
      animate={{ opacity: [0.25, 1, 0.25], scale: [0.85, 1.2, 0.85] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  )
}

/**
 * Decorative hover: wide palette-matched crown over the portrait.
 */
export function PortraitHoverCrown({ children, reduced, crownPositionClass }) {
  const [on, setOn] = useState(false)
  const active = reduced ? false : on

  return (
    <div
      className="group/portrait relative z-[1]"
      onMouseEnter={() => setOn(true)}
      onMouseLeave={() => setOn(false)}
    >
      {children}

      <motion.div
        className={`pointer-events-none absolute z-[3] flex justify-center ${crownPositionClass}`}
        initial={false}
        animate={
          reduced
            ? { opacity: 0, y: 10, scale: 0.94, rotate: -2 }
            : active
              ? { opacity: 1, y: 0, scale: 1, rotate: 0 }
              : { opacity: 0, y: 12, scale: 0.9, rotate: -3 }
        }
        transition={{ duration: 0.44, ease: easeOutSoft }}
      >
        {/* ~full head width: nearly full image width, capped so it stays on-canvas */}
        <div className="relative w-[min(94%,28rem)] min-w-[13.5rem] max-w-[31rem] sm:w-[min(92%,30rem)] lg:w-[min(90%,32rem)]">
          <CrownSvg className="h-auto w-full drop-shadow-[0_10px_36px_rgba(124,58,237,0.45)]" />
          {!reduced ? (
            <>
              <Sparkle className="left-[8%] top-[18%]" delay={0} />
              <Sparkle className="right-[10%] top-[20%]" delay={0.35} />
              <Sparkle className="left-[48%] top-[4%]" delay={0.7} />
              <Sparkle className="left-[28%] top-[8%]" delay={1.1} />
              <Sparkle className="right-[26%] top-[8%]" delay={1.4} />
            </>
          ) : null}
        </div>
      </motion.div>

      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2] rounded-[inherit] opacity-0"
        initial={false}
        animate={reduced ? { opacity: 0 } : active ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.35 }}
        style={{
          background:
            'radial-gradient(130% 90% at 50% 0%, rgba(124,58,237,0.14), rgba(56,189,248,0.08) 42%, transparent 58%)',
        }}
      />
    </div>
  )
}
