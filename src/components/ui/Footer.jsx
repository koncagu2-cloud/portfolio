import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { siteContact } from '../../data/siteContact.js'

export function Footer() {
  return (
    <footer className="relative z-[1] border-t border-white/10 bg-black/10">
      <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="font-[Unbounded] text-xs tracking-[0.22em] text-white/55">
              SULEYMAN KONCAGUL
            </div>
            <div className="measure max-w-md text-sm leading-relaxed text-white/62">
              A small corner of the internet — built slowly, with care for readability and calm interaction.
            </div>
          </div>

          <div className="flex flex-col items-start gap-4 sm:items-end">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/70">
              <FooterLink to="/projects" label="Projects" />
              <FooterLink to="/resume" label="Resume" />
              <FooterLink to="/contact" label="Contact" />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <a
                href={`mailto:${siteContact.email}`}
                className="text-white/55 transition hover:text-white/85"
              >
                {siteContact.email}
              </a>
              <span className="hidden text-white/25 sm:inline" aria-hidden>
                ·
              </span>
              <a
                href={siteContact.github.href}
                target="_blank"
                rel="noreferrer noopener"
                className="text-white/55 transition hover:text-white/85"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Suleyman Koncagul</span>
          <span className="text-white/40">Built with React, Vite, Tailwind, Framer Motion.</span>
        </div>
      </div>

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(600px_200px_at_50%_100%,rgba(124,58,237,.16),transparent_60%)]"
        animate={{ opacity: [0.5, 0.68, 0.5] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
    </footer>
  )
}

function FooterLink({ to, label }) {
  return (
    <Link
      to={to}
      className="group relative inline-flex items-center rounded-full px-2 py-1 text-white/65 transition hover:text-white/90"
    >
      <span>{label}</span>
      <span className="pointer-events-none absolute inset-x-2 -bottom-0.5 h-px origin-left scale-x-0 bg-gradient-to-r from-violet-400/65 via-sky-300/45 to-transparent transition-transform duration-300 group-hover:scale-x-100" />
    </Link>
  )
}

