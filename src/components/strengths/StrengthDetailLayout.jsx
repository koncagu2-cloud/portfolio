import { Link } from 'react-router-dom'
import { Reveal } from '../motion/Reveal.jsx'
import { Stagger, StaggerItem } from '../motion/Stagger.jsx'
import { SectionRule } from '../ui/SectionRule.jsx'
import { StrengthVisual } from './StrengthVisual.jsx'
/**
 * @param {object} props
 * @param {string} props.title
 * @param {string} props.heroStatement
 * @param {string[]} props.whatItMeans
 * @param {{ title: string, text: string }[]} props.howIApply
 * @param {{ projectTitle: string, projectSlug: string, text: string }[]} props.examples
 * @param {{ quote: string, note?: string }} props.principleQuote
 * @param {'flow'|'layers'|'story'|'stack'} props.visualVariant
 * @param {string} props.closing
 */
export function StrengthDetailLayout({
  title,
  heroStatement,
  whatItMeans,
  howIApply,
  examples,
  principleQuote,
  visualVariant,
  closing,
}) {
  return (
    <article className="pb-8">
      <nav aria-label="Breadcrumb" className="mb-10">
        <Link
          to="/about"
          className="type-body inline-flex items-center gap-2 text-[0.875rem] text-white/58 transition hover:text-white/88 focus-visible:outline focus-visible:outline-offset-4"
        >
          <span aria-hidden="true">←</span>
          Back to About
        </Link>
      </nav>

      <header className="mb-16 max-w-3xl sm:mb-20">
        <Reveal>
          <div className="type-label font-[Unbounded] uppercase">Strength</div>
        </Reveal>
        <Reveal delay={0.04}>
          <h1 className="type-display font-[Unbounded] mt-6 text-[clamp(1.85rem,5vw,3rem)] leading-[1.08]">
            {title}
          </h1>
        </Reveal>
        <Reveal calm delay={0.12} className="mt-8">
          <p className="type-lead measure max-w-2xl">{heroStatement}</p>
        </Reveal>
      </header>

      <section className="mb-20 sm:mb-24" aria-labelledby="what-it-means-heading">
        <Reveal>
          <h2 id="what-it-means-heading" className="type-label font-[Unbounded] text-[0.625rem] uppercase tracking-[0.26em]">
            What it means
          </h2>
        </Reveal>
        <div className="measure mt-8 max-w-2xl space-y-6">
          {whatItMeans.map((p, i) => (
            <Reveal key={i} delay={0.05 * i}>
              <p className="type-body text-[0.9375rem] leading-[1.85]">{p}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mb-20 sm:mb-24" aria-labelledby="how-i-apply-heading">
        <Reveal>
          <h2 id="how-i-apply-heading" className="type-label font-[Unbounded] text-[0.625rem] uppercase tracking-[0.26em]">
            How I apply it
          </h2>
        </Reveal>
        <Stagger className="mt-10 grid max-w-2xl gap-6" stagger={0.1} delayChildren={0.04}>
          {howIApply.map((item) => (
            <StaggerItem key={item.title}>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5">
                <h3 className="text-[0.9375rem] font-semibold tracking-[-0.02em] text-white/88">{item.title}</h3>
                <p className="type-body mt-3 text-[0.875rem] leading-relaxed">{item.text}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="mb-20 sm:mb-24" aria-labelledby="examples-heading">
        <Reveal>
          <h2 id="examples-heading" className="type-label font-[Unbounded] text-[0.625rem] uppercase tracking-[0.26em]">
            Real examples
          </h2>
          <p className="type-body measure mt-4 max-w-xl text-[0.875rem]">
            Where this shows up in work — briefly, honestly, with real project names.
          </p>
        </Reveal>
        <ul className="mt-10 flex max-w-2xl flex-col gap-8 border-l border-white/12 pl-6 sm:pl-8">
          {examples.map((ex) => (
            <Reveal key={ex.projectSlug}>
              <li className="list-none">
                <Link
                  to={`/projects/${ex.projectSlug}`}
                  className="group font-[Unbounded] text-base font-medium tracking-[-0.02em] text-white/90 underline decoration-white/20 underline-offset-[6px] transition hover:text-white hover:decoration-white/45 focus-visible:outline focus-visible:outline-offset-4"
                >
                  {ex.projectTitle}
                  <span className="ml-1 text-white/45 transition group-hover:text-white/70" aria-hidden="true">
                    →
                  </span>
                </Link>
                <p className="type-body mt-3 text-[0.875rem] leading-relaxed">{ex.text}</p>
              </li>
            </Reveal>
          ))}
        </ul>
      </section>

      <aside className="mb-20 sm:mb-28">
        <Reveal calm>
          <blockquote className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-violet-500/[0.12] via-black/20 to-sky-500/[0.08] px-8 py-12 sm:px-12 sm:py-14">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl"
            />
            <p className="relative font-[Unbounded] text-[clamp(1.25rem,3.5vw,1.75rem)] font-medium leading-snug tracking-[-0.03em] text-white/92">
              “{principleQuote.quote}”
            </p>
            {principleQuote.note ? (
              <footer className="relative mt-6">
                <p className="type-body text-[0.8125rem] text-white/52">{principleQuote.note}</p>
              </footer>
            ) : null}
          </blockquote>
        </Reveal>
      </aside>

      <SectionRule label="INSIDE THE WORK" />

      <section className="mb-20 sm:mb-24" aria-label="Visual explanation">
        <StrengthVisual variant={visualVariant} />
      </section>

      <Reveal calm>
        <section className="measure max-w-2xl border-t border-white/10 pt-14" aria-labelledby="closing-heading">
          <h2 id="closing-heading" className="sr-only">
            Closing
          </h2>
          <p className="type-body text-[0.9375rem] leading-[1.9] text-white/70">{closing}</p>
        </section>
      </Reveal>
    </article>
  )
}
