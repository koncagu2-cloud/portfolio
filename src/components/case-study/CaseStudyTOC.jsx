import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

/**
 * Sticky anchor nav for long case studies. Uses native #hash + scroll-margin for nav offset.
 */
export function CaseStudyTOC({ sections, className = '' }) {
  const [active, setActive] = useState(sections[0]?.id ?? '')

  useEffect(() => {
    if (sections.length === 0) return undefined
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean)
    if (els.length === 0) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target?.id) {
          setActive(visible[0].target.id)
        }
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.1, 0.25, 0.5] },
    )

    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [sections])

  if (sections.length === 0) return null

  return (
    <nav
      className={`${className}`}
      aria-label="On this page"
    >
      <div className="font-[Unbounded] text-[10px] tracking-[0.22em] text-white/40">ON THIS PAGE</div>
      <ul className="mt-4 flex flex-col gap-1 border-l border-white/10 pl-3">
        {sections.map((s) => {
          const isActive = active === s.id
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className={`group relative block py-1.5 text-sm transition-colors ${
                  isActive ? 'text-white/90' : 'text-white/45 hover:text-white/75'
                }`}
                onClick={() => setActive(s.id)}
              >
                {isActive ? (
                  <motion.span
                    layoutId="case-toc-active"
                    className="absolute -left-3 top-1/2 h-[calc(100%-4px)] w-px -translate-y-1/2 bg-gradient-to-b from-violet-400/80 to-sky-400/60"
                    transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                  />
                ) : null}
                <span className="pl-2">{s.label}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/** Horizontal pills for small screens */
export function CaseStudyTOCMobile({ sections, className = '' }) {
  if (sections.length === 0) return null
  return (
    <div
      className={`flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
      role="navigation"
      aria-label="On this page"
    >
      {sections.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/65 transition hover:border-white/16 hover:bg-white/[0.06] hover:text-white/88"
        >
          {s.label}
        </a>
      ))}
    </div>
  )
}
