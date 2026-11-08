/** Short cards on About — links to full strength pages */
export const strengthSummaries = [
  {
    slug: 'system-thinking-ia-ui',
    title: 'System thinking → IA → UI',
    hint: 'From the model to the screen — without losing the thread.',
  },
  {
    slug: 'accessible-interaction-design',
    title: 'Accessible interaction design',
    hint: 'Motion, focus, and structure that include people by default.',
  },
  {
    slug: 'story-driven-case-studies',
    title: 'Story-driven case studies',
    hint: 'Honest narratives: constraints, decisions, outcomes.',
  },
  {
    slug: 'frontend-polish-for-prototypes',
    title: 'Frontend polish for prototypes',
    hint: 'Enough real interaction to judge the thing — not just the slide.',
  },
]

const contents = {
  'system-thinking-ia-ui': {
    slug: 'system-thinking-ia-ui',
    title: 'System thinking → IA → UI',
    heroStatement:
      'I start with how things connect — then shape navigation and interface so the product still makes sense six months later.',
    whatItMeans: [
      '“System thinking” means naming the relationships: users, tasks, content types, and constraints. Information architecture turns that into paths people can follow. UI is the last mile — where clarity and calm either hold — or break.',
      'If you skip the first two and jump to screens, you get pretty patterns that don’t survive reality. I’d rather ship something boringly coherent than something excitingly fragile.',
    ],
    howIApply: [
      {
        title: 'Map before mockups',
        text: 'Models, flows, and labels first — so we’re arguing about the right problem, not the prettiest frame.',
      },
      {
        title: 'IA as a contract',
        text: 'Navigation and taxonomy are promises. I try to make them honest: what’s primary, what’s secondary, what’s optional.',
      },
      {
        title: 'UI that reflects structure',
        text: 'Components inherit hierarchy from IA — spacing, emphasis, and patterns reinforce where you are and what’s next.',
      },
    ],
    examples: [
      {
        projectTitle: 'D2L Redesign',
        projectSlug: 'd2l-redesign',
        text: 'Learning products live or die on course structure and task paths. This work centered on clearer IA and calmer UI so students could find work without fighting the chrome — shipped as a student-first interactive prototype.',
      },
      {
        projectTitle: 'Pure Michigan IA / Content Audit',
        projectSlug: 'pure-michigan-ia-content-audit',
        text: 'A classic system→IA problem: content had grown faster than the nav model. The audit surfaced patterns; the IA work turned them into a sustainable map instead of a patchwork of links.',
      },
      {
        projectTitle: 'MSU Museum / Social Impact Project',
        projectSlug: 'msu-museum-social-impact',
        text: 'Story-heavy experiences need a scaffold: what story comes first, what’s supporting, and how people move between threads — before visuals try to carry the weight alone.',
      },
    ],
    principleQuote: {
      quote: 'Structure is a form of kindness — it tells people where they are.',
      note: 'When IA is honest, the UI doesn’t have to shout.',
    },
    visualVariant: 'flow',
    closing:
      'If this resonates, you’re probably building something that has to last. That’s the kind of work I like — fewer hero pixels, more coherent systems.',
  },

  'accessible-interaction-design': {
    slug: 'accessible-interaction-design',
    title: 'Accessible interaction design',
    heroStatement:
      'Accessibility isn’t a checklist at the end — it’s how motion, focus, and hierarchy feel for real bodies and real attention spans.',
    whatItMeans: [
      'Interaction design isn’t only what happens on click. It’s tab order, focus visibility, timing, error recovery, and whether someone using magnification or voice control can still complete the task.',
      'I aim for interfaces that feel premium without excluding people — contrast and semantics aren’t “extra”; they’re part of the craft.',
    ],
    howIApply: [
      {
        title: 'Early semantics & structure',
        text: 'Headings, landmarks, and predictable patterns — so assistive tech has something solid to work with.',
      },
      {
        title: 'Motion with guardrails',
        text: 'Purposeful transitions; respect for reduced motion; no essential information only in animation.',
      },
      {
        title: 'Validation in practice',
        text: 'Keyboard runs, contrast checks, and realistic content — not idealized mock data that hides problems.',
      },
    ],
    examples: [
      {
        projectTitle: 'D2L Redesign',
        projectSlug: 'd2l-redesign',
        text: 'Learning flows carry cognitive load. Accessible interaction here means calmer states, clearer focus, and patterns that scale across dense screens.',
      },
      {
        projectTitle: 'Pure Michigan IA / Content Audit',
        projectSlug: 'pure-michigan-ia-content-audit',
        text: 'Audits surface where readability and structure fail real content. Fixing IA and labels is often the first accessibility win — before components change.',
      },
      {
        projectTitle: 'MSU Museum / Social Impact Project',
        projectSlug: 'msu-museum-social-impact',
        text: 'Inclusive storytelling means multiple modalities: readable type, flexible layouts, and interactions that don’t assume one perfect device or ability.',
      },
    ],
    principleQuote: {
      quote: 'If only some people can feel the “premium,” it isn’t premium — it’s private.',
    },
    visualVariant: 'layers',
    closing:
      'I’m still learning every day — standards evolve, and so do people’s needs. What stays constant is designing like someone’s trust is on the line. Because it is.',
  },

  'story-driven-case-studies': {
    slug: 'story-driven-case-studies',
    title: 'Story-driven case studies',
    heroStatement:
      'A case study should read like a good edit: what mattered, what was messy, what you’d do differently — not a victory lap with stock photos.',
    whatItMeans: [
      'Stories create memory. When I write about work, I want you to understand the stakes: who it was for, what was ambiguous, and how we decided — not just what shipped.',
      'That means showing tradeoffs. The best portfolios don’t pretend every project was perfect; they show judgment.',
    ],
    howIApply: [
      {
        title: 'Problem before pixels',
        text: 'Context and constraints first — so the solution has something to stand on.',
      },
      {
        title: 'Process as evidence',
        text: 'Sketches, IA shifts, research snippets — enough to prove the thinking, not drown the reader.',
      },
      {
        title: 'Outcomes with humility',
        text: 'What changed, what we learned, what’s still open — honesty builds trust faster than polish.',
      },
    ],
    examples: [
      {
        projectTitle: 'D2L Redesign',
        projectSlug: 'd2l-redesign',
        text: 'A product story: student workload and deadlines against noisy UI, and how IA plus UI craft made the experience easier to learn — not just prettier — including a computational-thinking thread for presentation.',
      },
      {
        projectTitle: 'Pure Michigan IA / Content Audit',
        projectSlug: 'pure-michigan-ia-content-audit',
        text: 'A content story: messy reality surfaced by audit, then a narrative about turning insight into navigation and governance — the boring stuff that saves teams.',
      },
      {
        projectTitle: 'MSU Museum / Social Impact Project',
        projectSlug: 'msu-museum-social-impact',
        text: 'A mission story: who the experience serves, how inclusion shaped decisions, and what “impact” meant beyond the brief.',
      },
    ],
    principleQuote: {
      quote: 'People remember the struggle and the choice — not the drop shadow.',
    },
    visualVariant: 'story',
    closing:
      'If you read one of my case studies and feel the weight of the work, that’s success. If you only notice the layout, I’ve still got more to write.',
  },

  'frontend-polish-for-prototypes': {
    slug: 'frontend-polish-for-prototypes',
    title: 'Frontend polish for prototypes',
    heroStatement:
      'Sometimes the only way to know if something works is to make it feel real — lightweight engineering in service of judgment, not ego.',
    whatItMeans: [
      '“Polish” here isn’t decoration. It’s timing, feedback, responsive behavior, and states — the stuff that turns a concept into something you can trust with your time.',
      'I use frontend craft to close the gap between “looks fine in Figma” and “feels right in the hand.”',
    ],
    howIApply: [
      {
        title: 'Prototype the uncomfortable bits',
        text: 'Long forms, edge cases, empty states — where products usually break first.',
      },
      {
        title: 'Shared language with engineering',
        text: 'Components and constraints that translate — fewer surprises at handoff.',
      },
      {
        title: 'Performance as part of UX',
        text: 'Light bundles, sane animation, readable structure — fast enough to feel respectful.',
      },
    ],
    examples: [
      {
        projectTitle: 'D2L Redesign',
        projectSlug: 'd2l-redesign',
        text: 'Complex flows benefit from interactive prototypes — where hierarchy and motion can be felt, not only pictured.',
      },
      {
        projectTitle: 'MSU Museum / Social Impact Project',
        projectSlug: 'msu-museum-social-impact',
        text: 'Story-led experiences need pacing. Frontend polish helps test rhythm: what loads when, what moves, what stays still.',
      },
      {
        projectTitle: 'Personal Portfolio Design',
        projectSlug: 'personal-portfolio-design',
        text: 'This site: editorial layout + motion + accessibility constraints — a sandbox for how I want work to feel end-to-end.',
      },
    ],
    principleQuote: {
      quote: 'Prototype fidelity should match the decision — not the designer’s ego.',
      note: 'Enough truth to choose; not so much that you’re shipping the prototype.',
    },
    visualVariant: 'stack',
    closing:
      'I like teams where design and build share custody of the experience. If that’s you, we’ll probably get along.',
  },
}

export function getStrength(slug) {
  return contents[slug] ?? null
}

export function getStrengthSlugs() {
  return Object.keys(contents)
}
