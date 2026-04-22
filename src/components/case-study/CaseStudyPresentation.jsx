import { useState } from 'react'
import { Reveal } from '../motion/Reveal.jsx'
import { publicAsset } from '../../lib/publicAsset.js'
import { ImageLightbox } from './ImageLightbox.jsx'

export function CaseStudyHero({ project, caseStudy }) {
  const heroImage = caseStudy?.heroImage
  const heroLabel = caseStudy?.heroLabel ?? 'CASE STUDY COVER'
  const meta = [
    { label: 'Role', value: project.role },
    { label: 'Timeline', value: caseStudy?.timeline ?? project.year ?? 'In progress' },
    { label: 'Tools', value: project.tools?.slice(0, 4).join(', ') },
  ].filter((item) => item.value)

  return (
    <section id="case-overview" className="scroll-mt-28">
      <Reveal className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/20 shadow-[0_0_120px_-40px_rgba(56,189,248,0.45)] backdrop-blur-xl">
        <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex min-h-[26rem] flex-col justify-between p-7 sm:p-9">
            <div>
              <p className="font-[Unbounded] text-[11px] tracking-[0.22em] text-cyan-200/55">
                UX CASE STUDY
              </p>
              <h1 className="mt-5 font-[Unbounded] text-3xl leading-tight tracking-[-0.04em] text-white/94 sm:text-5xl">
                {project.title}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/66 sm:text-lg">
                {caseStudy?.shortSummary ?? project.summary}
              </p>
            </div>

            <dl className="mt-10 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {meta.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <dt className="font-[Unbounded] text-[10px] tracking-[0.18em] text-white/38">
                    {item.label}
                  </dt>
                  <dd className="mt-2 text-sm leading-relaxed text-white/72">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <CaseStudyVisual
            className="min-h-[24rem] rounded-none border-0 border-l-white/10 lg:border-l"
            image={heroImage}
            label={heroLabel}
            title={caseStudy?.heroVisualTitle ?? 'Main product screen'}
            description={caseStudy?.heroVisualDescription ?? 'Replace this cover slot with a polished mockup, prototype screenshot, or final UI composite.'}
            priority
          />
        </div>
      </Reveal>
    </section>
  )
}

export function CaseStudySection({ section, index = 0 }) {
  const [lightbox, setLightbox] = useState(null)
  const media = section.media ?? []
  const columns =
    section.layout === 'single' || section.layout === 'showcase'
      ? 'grid-cols-1'
      : section.layout === 'grid'
        ? 'sm:grid-cols-2'
        : 'lg:grid-cols-2'

  return (
    <section id={section.id} className="scroll-mt-28 border-t border-white/10 pt-12">
      <Reveal delay={0.04 * index}>
        <div className="grid gap-8 lg:grid-cols-[0.42fr_0.58fr] lg:gap-12">
          <div>
            <p className="font-[Unbounded] text-[11px] tracking-[0.22em] text-white/42">
              {section.eyebrow}
            </p>
            <h2 className="mt-3 font-[Unbounded] text-2xl tracking-[-0.035em] text-white/92 sm:text-3xl">
              {section.title}
            </h2>
            {section.body ? (
              <p className="mt-4 text-sm leading-relaxed text-white/62 sm:text-base">{section.body}</p>
            ) : null}
            {section.points?.length ? (
              <ul className="mt-5 grid gap-2" role="list">
                {section.points.map((point) => (
                  <li
                    key={point}
                    className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm leading-relaxed text-white/64"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className={`grid ${columns} gap-4`}>
            {media.length ? (
              media.map((item, itemIndex) =>
                item.type === 'insight' || !item.file ? (
                  <InsightCard key={`${item.label}-${itemIndex}`} item={item} />
                ) : (
                  <CaseStudyVisual
                    key={`${item.label}-${itemIndex}`}
                    image={item.file}
                    label={item.label}
                    title={item.title}
                    description={item.description}
                    caption={item.caption}
                    variant={section.layout === 'showcase' ? 'showcase' : item.variant}
                    onOpen={() =>
                      setLightbox({ src: publicAsset(item.file), alt: item.alt ?? item.title ?? item.label })
                    }
                  />
                ),
              )
            ) : (
              <InsightCard
                item={{
                  label: 'DESIGN NOTE',
                  title: 'Artifact coming soon',
                  description:
                    'This section is intentionally text-only until there is a strong artifact worth showing.',
                }}
              />
            )}
          </div>
        </div>
      </Reveal>

      <ImageLightbox
        open={lightbox != null}
        onClose={() => setLightbox(null)}
        src={lightbox?.src}
        alt={lightbox?.alt}
      />
    </section>
  )
}

export function PrototypeCTA({ prototype, projectTitle }) {
  const hasLink = Boolean(prototype?.href)

  return (
    <section id="case-prototype" className="scroll-mt-28 border-t border-white/10 pt-12">
      <Reveal>
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.035] to-cyan-400/[0.08] p-7 shadow-[0_0_120px_-50px_rgba(124,58,237,0.7)] sm:p-9">
          <div className="grid gap-8 lg:grid-cols-[0.65fr_0.35fr] lg:items-center">
            <div>
              <p className="font-[Unbounded] text-[11px] tracking-[0.22em] text-cyan-200/55">
                PROTOTYPE
              </p>
              <h2 className="mt-3 font-[Unbounded] text-2xl tracking-[-0.035em] text-white/92 sm:text-3xl">
                {prototype?.title ?? `Explore the ${projectTitle} prototype`}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/62 sm:text-base">
                {prototype?.description ??
                  'This section is reserved for the interactive prototype. Add a Figma, Framer, or live prototype link here so recruiters can move from the story into the actual experience.'}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
              <div className="rounded-2xl border border-dashed border-white/14 bg-white/[0.035] p-5 text-center">
                <p className="font-[Unbounded] text-[10px] tracking-[0.18em] text-white/38">
                  PROTOTYPE ACCESS
                </p>
                {hasLink ? (
                  <a
                    href={prototype.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-cyan-100"
                  >
                    View Prototype
                  </a>
                ) : (
                  <span className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-white/12 bg-white/[0.04] px-5 py-3 text-sm text-white/48">
                    Add prototype link
                  </span>
                )}
                <p className="mt-4 text-xs leading-relaxed text-white/42">
                  {prototype?.note ?? 'Recommended: link directly to the most polished prototype flow.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

function CaseStudyVisual({
  image,
  label,
  title,
  description,
  caption,
  className = '',
  priority = false,
  onOpen,
  variant = 'standard',
}) {
  const src = image ? publicAsset(image) : null
  const Wrapper = onOpen ? 'button' : 'div'
  const isShowcase = variant === 'showcase'

  return (
    <figure
      className={`overflow-hidden rounded-3xl border border-white/10 bg-black/[0.18] shadow-[0_24px_90px_-54px_rgba(56,189,248,0.55)] ${className}`}
    >
      <Wrapper
        type={onOpen ? 'button' : undefined}
        onClick={onOpen}
        className={`group block w-full overflow-hidden bg-[#f7faf8] text-left ${
          onOpen ? 'cursor-zoom-in' : ''
        }`}
      >
        <div className={`relative w-full ${isShowcase ? 'aspect-[16/10]' : 'aspect-[16/9]'}`}>
          {src ? (
            <img
              src={src}
              alt=""
              className="absolute inset-0 h-full w-full object-contain object-top transition duration-300 group-hover:scale-[1.01]"
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
            />
          ) : (
            <PlaceholderGrid />
          )}
        </div>
      </Wrapper>
      <div className="px-5 py-5 sm:px-6">
        <span className="font-[Unbounded] text-[10px] tracking-[0.18em] text-cyan-200/45">
          {label}
        </span>
        <h3 className="mt-2 font-[Unbounded] text-lg tracking-[-0.03em] text-white/90">{title}</h3>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-white/58">{description}</p>
        ) : null}
      </div>
      {caption ? (
        <figcaption className="border-t border-white/10 px-5 py-4 text-xs leading-relaxed text-white/45 sm:px-6">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}

function InsightCard({ item }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
      <span className="font-[Unbounded] text-[10px] tracking-[0.18em] text-cyan-200/45">
        {item.label}
      </span>
      <h3 className="mt-3 font-[Unbounded] text-lg tracking-[-0.03em] text-white/90">{item.title}</h3>
      {item.description ? (
        <p className="mt-3 text-sm leading-relaxed text-white/62">{item.description}</p>
      ) : null}
      {item.points?.length ? (
        <ul className="mt-5 grid gap-2" role="list">
          {item.points.map((point) => (
            <li key={point} className="rounded-xl border border-white/10 bg-black/[0.15] px-4 py-3 text-sm text-white/62">
              {point}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  )
}

function PlaceholderGrid() {
  return (
    <div className="absolute inset-0 opacity-35" aria-hidden>
      <div className="absolute left-6 right-6 top-16 h-14 rounded-2xl border border-emerald-900/20 bg-emerald-900/[0.05]" />
      <div className="absolute left-6 top-36 h-24 w-[42%] rounded-2xl border border-emerald-900/20 bg-emerald-900/[0.05]" />
      <div className="absolute right-6 top-36 h-24 w-[42%] rounded-2xl border border-emerald-900/20 bg-emerald-900/[0.05]" />
      <div className="absolute bottom-20 left-6 right-6 grid grid-cols-4 gap-3">
        <span className="h-12 rounded-xl border border-emerald-900/20 bg-emerald-900/[0.05]" />
        <span className="h-12 rounded-xl border border-emerald-900/20 bg-emerald-900/[0.05]" />
        <span className="h-12 rounded-xl border border-emerald-900/20 bg-emerald-900/[0.05]" />
        <span className="h-12 rounded-xl border border-emerald-900/20 bg-emerald-900/[0.05]" />
      </div>
    </div>
  )
}
