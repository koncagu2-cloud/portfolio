/**
 * Portfolio projects. Optional `caseStudy` powers the project detail page.
 * Add `heroImage` by importing an asset in this file and assigning it (see d2l example).
 */

export const projects = [
  {
    slug: 'd2l-redesign',
    title: 'D2L Redesign',
    summary:
      'A student-first LMS prototype inspired by D2L/Brightspace: modern IA, dashboard → courses → calendar flows, and a built-in computational-thinking layer for presentation — shipped as a React + TypeScript app.',
    role: 'UX / Experience Designer · interactive prototype',
    tools: [
      'React',
      'TypeScript',
      'Vite',
      'Tailwind CSS',
      'Framer Motion',
      'TanStack Query',
      'Information Architecture',
      'Accessibility',
    ],
    tags: ['Product UX', 'IA', 'Frontend prototype'],
    caseStudy: {
      heroLabel: 'Modern LMS · D2L-inspired prototype',
      overview:
        'This project is a full interactive build (not a static mock): a next-gen LMS concept that responds to real D2L/Brightspace pain points — cluttered surfaces, deep navigation, uneven patterns, and weak mobile posture — while staying ruthlessly student-focused. I implemented it as a React + TypeScript + Vite application with Tailwind and Framer Motion, using a clear app shell (`/app`) so flows feel like a real product: dashboard, course list and course detail, calendar, settings, profile/help, and messaging as a scaffold. A standalone cover route frames the work for critique and gallery-style walkthroughs.',
      problem:
        'Classic LMS experiences often bury the next action, repeat inconsistent UI patterns across areas, and ask students to carry too much cognitive overhead while juggling deadlines. The problem I chased was practical: make “what do I do next?” obvious, keep wayfinding stable as data grows (courses, assignments, events), and design motion and density that help orientation — not decoration. The build also had to reflect accessibility intent: keyboard-friendly structure, readable hierarchy, and contrast-aware defaults — aligned with how I approach product UX.',
      outcome:
        'The outcome is a working prototype with navigable routes and interactive surfaces: personalized dashboard with quick actions and progress, courses with search/filter/sort, a calendar with month logic and event discovery, categorized settings with real state patterns, and a Computational Thinking showcase that ties the UI back to decomposition, pattern recognition, abstraction, and algorithms — documented for gallery-style review. Messages remains a deliberate placeholder; the scope stays honest about what shipped vs. what is next-phase.',
      process: [
        {
          phase: 'Discover',
          text: 'Framed the redesign against legacy LMS weaknesses and student jobs-to-be-done; scoped a student-only product slice (no instructor/admin bloat) and defined success as clarity + flow, not feature count.',
        },
        {
          phase: 'Define',
          text: 'Mapped IA to routes (`/app` shell, courses + course detail, calendar, settings, CT showcase) and separated a cover experience for presentation — so structure and storytelling stay legible.',
        },
        {
          phase: 'Design & build',
          text: 'Implemented UI in componentized React, Tailwind design tokens, and Framer Motion for calm transitions; used TanStack Query and Zustand where appropriate for data and state patterns in the prototype.',
        },
        {
          phase: 'Validate',
          text: 'Stress-tested flows for consistency, added computational-thinking annotations and interactive demos for review, and kept accessibility as a design constraint (focus, hierarchy, contrast) rather than a late checkbox.',
        },
      ],
      solution:
        'The solution pairs a modern student dashboard mental model with a transparent “why this works” layer: UI patterns students expect from contemporary apps (spacing, hierarchy, predictable navigation) plus a Computational Thinking thread that explains how the interface maps to problem decomposition and algorithms — useful for both UX critique and academic presentation. Tradeoffs are visible in the repo: scope stays learner-centric, messaging is stubbed, and performance targets in documentation describe intent for a production system. When this ships publicly, a demo link belongs right beside the case study; until then, the artifact lives as the complete local project you iterated in Cursor.',
      links: [
        {
          label: 'Figma — moodboards, wires & sketches (Team 1)',
          href: 'https://www.figma.com/design/piRHnDp4bwoVkKMo1mHSt7/Team--1',
        },
      ],
    },
  },
  {
    slug: 'pure-michigan-ia-content-audit',
    title: 'Pure Michigan IA / Content Audit',
    summary: 'A content-led restructuring: audit → insights → navigation model → governance-ready taxonomy.',
    role: 'UX / Experience Designer',
    tools: ['Screaming Frog', 'Information Architecture', 'Accessibility', 'Lighthouse'],
    tags: ['Content Strategy', 'IA', 'Audit'],
  },
  {
    slug: 'msu-museum-social-impact',
    title: 'MSU Museum / Social Impact Project',
    summary: 'An inclusive storytelling experience designed for access, clarity, and community outcomes.',
    role: 'UX / Experience Designer',
    tools: ['User Research', 'Prototyping', 'Accessibility', 'Figma'],
    tags: ['Social Impact', 'Storytelling', 'Accessibility'],
  },
  {
    slug: 'personal-portfolio-design',
    title: 'Personal Portfolio Design',
    summary: 'A cinematic editorial identity with motion, hierarchy, and a premium interaction language.',
    role: 'UX / Experience Designer',
    tools: ['React', 'Framer Motion', 'Tailwind', 'HTML/CSS/JS'],
    tags: ['Brand', 'Motion', 'Frontend'],
  },
]

export function getProject(slug) {
  return projects.find((p) => p.slug === slug) ?? null
}
