import { useState } from 'react'
import { Reveal } from '../motion/Reveal.jsx'
import { publicAsset } from '../../lib/publicAsset.js'
import { ImageLightbox } from './ImageLightbox.jsx'

/**
 * Research block for case studies. Prefer `gallery` (images in /public) so everyone can view
 * without a Figma account. Optional `embedUrl` only if the file is publicly view-embedded.
 */
export function CaseStudyResearch({ block }) {
  const [lightbox, setLightbox] = useState(null)

  if (!block) return null

  const {
    title,
    intro,
    methods = [],
    gallery = [],
    embedUrl,
    embedTitle = 'Figma — research board',
    embedCaption,
    findings = [],
    quotes = [],
    bridge,
    mediaNote,
  } = block

  const showEmbed = Boolean(embedUrl) && gallery.length === 0

  return (
    <section
      id="case-research"
      className="mb-14 mt-10 scroll-mt-28 space-y-10 border-t border-white/10 pt-12"
      aria-labelledby="case-study-research-heading"
    >
      <Reveal>
        <h2
          id="case-study-research-heading"
          className="font-[Unbounded] text-2xl tracking-[-0.03em] text-white/92 sm:text-3xl"
        >
          {title}
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/62 sm:text-base">{intro}</p>
        {methods.length ? (
          <ul className="mt-5 flex flex-wrap gap-2" role="list">
            {methods.map((m) => (
              <li
                key={m}
                className="rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1.5 text-xs text-white/75"
              >
                {m}
              </li>
            ))}
          </ul>
        ) : null}
      </Reveal>

      {gallery.length ? (
        <Reveal delay={0.06}>
          <div className="space-y-8">
            {gallery.map((item, i) => {
              const src = publicAsset(item.file)
              return (
                <figure
                  key={`${item.file}-${i}`}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-black/25 shadow-[0_0_80px_-24px_rgba(124,58,237,0.35)]"
                >
                  <div className="relative bg-black/40">
                    <button
                      type="button"
                      className="group relative block w-full cursor-zoom-in text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300/80"
                      onClick={() => setLightbox({ src, alt: item.alt || 'Research image' })}
                      aria-label={`Open larger view: ${item.alt || 'Research image'}`}
                    >
                      <img
                        src={src}
                        alt={item.alt}
                        className="max-h-[min(78vh,920px)] w-full object-contain object-top transition duration-300 group-hover:brightness-[1.04]"
                        loading={i === 0 ? 'eager' : 'lazy'}
                        decoding="async"
                      />
                      <span className="pointer-events-none absolute bottom-3 right-3 rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-white/65 opacity-0 transition group-hover:opacity-100">
                        View full
                      </span>
                    </button>
                  </div>
                  {item.caption ? (
                    <figcaption className="border-t border-white/10 px-5 py-4 text-xs leading-relaxed text-white/50 sm:px-6">
                      {item.caption}
                    </figcaption>
                  ) : null}
                </figure>
              )
            })}
            {mediaNote ? (
              <p className="text-xs leading-relaxed text-white/42 sm:text-sm">{mediaNote}</p>
            ) : null}
          </div>
        </Reveal>
      ) : null}

      <ImageLightbox
        open={lightbox != null}
        onClose={() => setLightbox(null)}
        src={lightbox?.src}
        alt={lightbox?.alt}
      />

      {showEmbed ? (
        <Reveal delay={0.06}>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/25 shadow-[0_0_80px_-20px_rgba(124,58,237,0.35)]">
            <div className="relative aspect-[16/10] w-full min-h-[280px] sm:min-h-[360px] lg:min-h-[420px]">
              <iframe
                title={embedTitle}
                src={embedUrl}
                className="absolute inset-0 h-full w-full border-0"
                allowFullScreen
                loading="lazy"
              />
            </div>
            {embedCaption ? (
              <p className="border-t border-white/10 px-5 py-4 text-xs leading-relaxed text-white/50 sm:px-6">
                {embedCaption}
              </p>
            ) : null}
          </div>
        </Reveal>
      ) : null}

      {findings.length ? (
        <div>
          <Reveal delay={0.08}>
            <h3 className="font-[Unbounded] text-xs tracking-[0.22em] text-white/55">What we found</h3>
            <p className="mt-2 max-w-2xl text-sm text-white/45">
              Synthesis from NN/g heuristic worksheets and team notes — before any UI redesign.
            </p>
          </Reveal>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {findings.map((f, i) => (
              <Reveal key={`${f.label}-${f.title}`} delay={0.04 * i}>
                <li className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition duration-300 hover:border-white/[0.14] hover:bg-white/[0.05]">
                  <span className="font-[Unbounded] text-[11px] tracking-[0.14em] text-violet-300/80">
                    {f.label}
                  </span>
                  <span className="mt-2 font-medium text-white/88">{f.title}</span>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-white/58">{f.body}</p>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      ) : null}

      {quotes.length ? (
        <div>
          <Reveal delay={0.06}>
            <h3 className="font-[Unbounded] text-xs tracking-[0.22em] text-white/55">Student voices</h3>
            <p className="mt-2 max-w-2xl text-sm text-white/45">
              Short excerpts from structured interviews — patterns behind the prototype priorities.
            </p>
          </Reveal>
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {quotes.map((q, i) => (
              <Reveal key={i} delay={0.05 * i}>
                <figure className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-6 pl-7 backdrop-blur-sm">
                  <div
                    className="absolute left-0 top-6 bottom-6 w-px rounded-full bg-gradient-to-b from-cyan-400/50 via-violet-400/40 to-transparent"
                    aria-hidden
                  />
                  <blockquote className="text-sm leading-relaxed text-white/72 sm:text-[15px]">
                    “{q.quote}”
                  </blockquote>
                  <figcaption className="mt-4 text-xs text-white/45">{q.attribution}</figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      ) : null}

      {bridge ? (
        <Reveal delay={0.1}>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-5 sm:px-8 sm:py-6">
            <p className="text-sm leading-relaxed text-white/65 sm:text-base">{bridge}</p>
          </div>
        </Reveal>
      ) : null}
    </section>
  )
}
