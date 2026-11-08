import { useState } from 'react'
import { Page } from '../components/motion/Page.jsx'
import { Reveal } from '../components/motion/Reveal.jsx'
import { motion } from 'framer-motion'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.js'
import { siteContact } from '../data/siteContact.js'

export function Contact() {
  const [status, setStatus] = useState('idle')
  const reducedMotion = usePrefersReducedMotion()

  const onSubmit = (e) => {
    e.preventDefault()
    setStatus('sent')
    window.setTimeout(() => setStatus('idle'), 3500)
  }

  return (
    <Page>
      <header className="mb-10">
        <Reveal>
          <div className="font-[Unbounded] text-xs tracking-[0.22em] text-white/55">CONTACT</div>
        </Reveal>
        <Reveal delay={0.06}>
          <h1 className="mt-4 font-[Unbounded] text-3xl tracking-[-0.03em] text-white/92 sm:text-5xl">
            Say hello — I read every note.
          </h1>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="measure mt-5 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
            Tell me what you’re building, what’s stuck, or what you’re hoping the experience will feel like.
            This form is a placeholder locally — wire it up when you’re ready.
          </p>
        </Reveal>
      </header>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
        <Reveal className="rounded-2xl border border-white/10 bg-black/15 p-7 backdrop-blur-xl">
          <form onSubmit={onSubmit} className="grid gap-4">
            <Field label="Name" name="name" placeholder="Your name" required />
            <Field
              label="Email"
              name="email"
              type="email"
              placeholder={siteContact.email}
              required
            />
            <Field label="Message" name="message" as="textarea" placeholder="Context, timeline, or what a good outcome looks like for you." rows={6} required />

            <button
              type="submit"
              className="mt-2 inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/80 transition hover:bg-white/8 hover:text-white/95"
            >
              Send message
            </button>

            <motion.div
              role="status"
              aria-live="polite"
              initial={false}
              animate={
                status === 'sent' && !reducedMotion
                  ? { opacity: [0, 1, 1, 0], y: [6, 0, 0, -6] }
                  : { opacity: status === 'sent' ? 1 : 0, y: 0 }
              }
              transition={{ duration: 2.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-sm text-white/60"
            >
              Thanks — message queued (demo). Connect a backend or EmailJS when you deploy.
            </motion.div>
          </form>
        </Reveal>

        <Reveal delay={0.08} className="rounded-2xl border border-white/10 bg-black/15 p-7 backdrop-blur-xl">
          <div className="font-[Unbounded] text-xs tracking-[0.22em] text-white/55">Links</div>
          <div className="mt-5 grid gap-3">
            <ContactLink label="Email" value={siteContact.email} href={`mailto:${siteContact.email}`} />
            <ContactLink
              label="GitHub"
              value={siteContact.github.display}
              href={siteContact.github.href}
            />
            {siteContact.linkedinUrl ? (
              <ContactLink
                label="LinkedIn"
                value={siteContact.linkedinUrl.replace(/^https?:\/\/(www\.)?/, '')}
                href={siteContact.linkedinUrl}
              />
            ) : null}
          </div>

          <div className="mt-8 h-px w-full bg-white/10" />

          <div className="measure mt-8 text-sm leading-relaxed text-white/62">
            Curious before you write? Browse projects for how I frame problems — then come back here when it
            feels right.
          </div>
        </Reveal>
      </section>
    </Page>
  )
}

function Field({ label, as, ...props }) {
  const Comp = as ?? 'input'
  return (
    <label className="grid gap-2">
      <span className="text-xs text-white/55">{label}</span>
      <Comp
        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/85 placeholder:text-white/35 shadow-[0_0_0_1px_rgba(255,255,255,.02)] outline-none transition focus:border-white/20"
        {...props}
      />
    </label>
  )
}

function ContactLink({ label, value, href }) {
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noreferrer' : undefined}
      className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/72 transition hover:bg-white/8 hover:text-white/92"
    >
      <span className="text-white/55">{label}</span>
      <span className="inline-flex items-center gap-2">
        <span className="text-white/75">{value}</span>
        <span className="text-white/40 transition group-hover:text-white/70">↗</span>
      </span>
    </a>
  )
}

