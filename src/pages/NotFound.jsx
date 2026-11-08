import { Link } from 'react-router-dom'
import { Page } from '../components/motion/Page.jsx'
import { Reveal } from '../components/motion/Reveal.jsx'

export function NotFound() {
  return (
    <Page>
      <div className="py-10">
        <Reveal>
          <h1 className="font-[Unbounded] text-3xl tracking-[-0.02em] text-white/92 sm:text-4xl">
            Page not found
          </h1>
        </Reveal>
        <Reveal delay={0.08} className="mt-4 max-w-xl text-white/65">
          The page you’re looking for doesn’t exist. Let’s bring you back to the editorial flow.
        </Reveal>
        <Reveal delay={0.16} className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/80 transition hover:bg-white/8 hover:text-white/95"
          >
            Return Home
          </Link>
        </Reveal>
      </div>
    </Page>
  )
}

