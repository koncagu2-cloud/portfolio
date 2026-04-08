import { useEffect, useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import { durations, easeOutSoft } from '../../styles/motion.js'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js'

const navItems = [
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/resume', label: 'Resume' },
  { to: '/contact', label: 'Contact' },
]

function NavItem({ to, label, onNavigate, enableLayoutGlow = true }) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className="group relative inline-flex items-center rounded-full px-3 py-2 text-sm tracking-wide text-white/65 transition-colors hover:text-white/95"
    >
      {({ isActive }) => (
        <>
          {isActive && enableLayoutGlow ? (
            <motion.span
              layoutId="nav-active-glow"
              className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500/18 via-white/8 to-sky-400/12 shadow-[0_0_28px_rgba(124,58,237,.14)]"
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            />
          ) : null}
          {isActive && !enableLayoutGlow ? (
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500/18 via-white/8 to-sky-400/12 shadow-[0_0_28px_rgba(124,58,237,.14)]" />
          ) : null}
          <span className={`relative z-[1] ${isActive ? 'text-white/96' : ''}`}>{label}</span>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-3 -bottom-0.5 h-px origin-left scale-x-0 bg-gradient-to-r from-violet-400/75 via-sky-300/45 to-transparent transition-transform duration-[480ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
          />
        </>
      )}
    </NavLink>
  )
}

export function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const reduced = usePrefersReducedMotion()
  const { scrollY } = useScroll()

  const shellBg = useTransform(scrollY, [0, 88], ['rgba(11, 11, 18, 0.38)', 'rgba(11, 11, 18, 0.78)'])
  const shellBorder = useTransform(scrollY, [0, 120], ['rgba(255,255,255,0.09)', 'rgba(255,255,255,0.16)'])
  const shellShadow = useTransform(
    scrollY,
    [0, 100],
    ['0 0 0 1px rgba(255,255,255,.03)', '0 26px 90px rgba(0,0,0,.52)'],
  )
  const backdropBlur = useTransform(
    scrollY,
    [0, 120],
    ['blur(14px) saturate(1.12)', 'blur(22px) saturate(1.22)'],
  )

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  return (
    <header className="fixed inset-x-0 top-0 z-[40]">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <motion.div
          className="relative mt-4 flex items-center justify-between rounded-2xl border px-4 py-3"
          style={
            reduced
              ? {
                  backgroundColor: 'rgba(11, 11, 18, 0.62)',
                  borderColor: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(18px) saturate(1.15)',
                  WebkitBackdropFilter: 'blur(18px) saturate(1.15)',
                  boxShadow: '0 0 0 1px rgba(255,255,255,.04), 0 20px 70px rgba(0,0,0,.42)',
                }
              : {
                  backgroundColor: shellBg,
                  borderColor: shellBorder,
                  boxShadow: shellShadow,
                  backdropFilter: backdropBlur,
                  WebkitBackdropFilter: backdropBlur,
                }
          }
        >
          <Link to="/" className="group relative z-[1] inline-flex items-baseline gap-2">
            <span className="font-[Unbounded] text-[13px] tracking-[0.18em] text-white/82 transition group-hover:text-white/96">
              SULEYMAN
            </span>
            <span className="hidden text-[13px] tracking-[0.18em] text-white/40 transition group-hover:text-white/52 sm:inline">
              KONCAGUL
            </span>
          </Link>

          <nav className="relative z-[1] hidden items-center gap-0.5 sm:flex" aria-label="Primary">
            {navItems.map((n) => (
              <NavItem key={n.to} to={n.to} label={n.label} />
            ))}
          </nav>

          <button
            type="button"
            className="relative z-[1] inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 transition hover:bg-white/8 hover:text-white/95 sm:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="font-mono text-xs">{open ? 'CLOSE' : 'MENU'}</span>
          </button>
        </motion.div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: -8, filter: 'blur(10px)' }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8, filter: 'blur(10px)' }}
            transition={{ duration: durations.base, ease: easeOutSoft }}
            className="mx-auto mt-3 w-full max-w-6xl px-5 sm:hidden"
          >
            <div className="rounded-2xl border border-white/10 bg-black/45 p-3 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,.03)]">
              <div className="grid gap-1">
                {navItems.map((n) => (
                  <NavItem
                    key={n.to}
                    to={n.to}
                    label={n.label}
                    onNavigate={() => setOpen(false)}
                    enableLayoutGlow={false}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
