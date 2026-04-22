/**
 * Portfolio projects. Optional `caseStudy` powers the project detail page.
 * Add `heroImage` by importing an asset in this file and assigning it (see d2l example).
 *
 * Fields:
 * - `status`: omit or `'published'` | `'draft'` — drafts sort last and show a label.
 * - `year`: optional string for card meta (e.g. "2026").
 */

const D2L_FIGMA_FILE = 'https://www.figma.com/design/piRHnDp4bwoVkKMo1mHSt7/Team--1'
const d2lFigmaNode = (nodeId) => `${D2L_FIGMA_FILE}?node-id=${nodeId}&m=dev`

export const projects = [
  {
    slug: 'd2l-redesign',
    year: '2025',
    title: 'D2L Redesign',
    summary:
      'A student-first LMS prototype inspired by D2L/Brightspace: modern IA, dashboard → courses → calendar flows, and a built-in computational-thinking layer for presentation — shipped as a React + TypeScript app.',
    role: 'UX / Experience Designer · interactive prototype',
    tools: [
      'Figma',
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
      heroImage: 'case-studies/d2l/final-ui-course-home.svg',
      heroVisualTitle: 'Final student course home',
      heroVisualDescription:
        'A high-fidelity student interface focused on clearer course navigation, announcements, and upcoming content.',
      shortSummary:
        'A student-first LMS redesign that turns research findings into clearer navigation, stronger course planning, and a working React prototype.',
      timeline: 'Fall 2025',
      overview:
        'This project is a full interactive build (not a static mock): a next-gen LMS concept grounded in team research on the live D2L/Brightspace experience — heuristic evaluation (NN/g), structured interview questions, and qualitative synthesis in Figma — then translated into a student-first product. I implemented it as a React + TypeScript + Vite application with Tailwind and Framer Motion, using a clear app shell (`/app`) so flows feel like a real product: dashboard, course list and course detail, calendar, settings, profile/help, and messaging as a scaffold. A standalone cover route frames the work for critique and gallery-style walkthroughs.',
      problem:
        'Classic LMS experiences often bury the next action, repeat inconsistent UI patterns across areas, and ask students to carry too much cognitive overhead while juggling deadlines. Our research surfaced the same friction in the wild: weak “you are here” feedback in the nav, course home layouts that bury the calendar and inflate secondary modules, help that jumps out to generic documentation, and content layouts that force extra clicks and scanning. The design problem became practical: make “what do I do next?” obvious, stabilize wayfinding as courses scale, and ship UI that respects accessibility and recognition over recall.',
      outcome:
        'The outcome is a research-informed working prototype: navigable routes with personalized dashboard, quick actions, course progress, courses with search/filter/sort, a calendar with month logic and event discovery, categorized settings with real state patterns, and a Computational Thinking showcase that ties the UI back to decomposition, pattern recognition, abstraction, and algorithms — documented for gallery-style review. Messages remains a deliberate placeholder; the scope stays honest about what shipped vs. what is next-phase.',
      process: [
        {
          phase: 'Discover',
          text: 'Ran a structured heuristic audit (NN/g worksheets in Figma), team synthesis, and student interview planning — then distilled themes before touching UI: navigation state, hierarchy, help, consistency, and efficiency.',
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
        'The solution pairs research-backed priorities with a modern student dashboard model: predictable shell navigation, a dashboard that foregrounds deadlines and course progress, courses with scannable structure and search, and a calendar aligned with how students plan work — plus a Computational Thinking thread for presentation. The prototype intentionally does not recreate every D2L surface; it demonstrates how IA and UI decisions respond to the issues we documented. Messaging stays stubbed; a public deploy link can sit next to this case study when you ship the build.',
      visualSections: [
        {
          id: 'case-problem',
          navLabel: 'Problem',
          eyebrow: 'PROBLEM / GOAL',
          title: 'Students needed faster orientation',
          body:
            'The core design challenge was not making D2L look newer. It was reducing the work students do just to understand where they are, what needs attention, and where to go next.',
          points: [
            'Make upcoming work and course progress easier to scan.',
            'Keep navigation stable across dashboard, courses, calendar, and settings.',
            'Use accessibility and clear hierarchy as design constraints from the start.',
          ],
          layout: 'single',
          media: [
            {
              file: 'case-studies/d2l/heuristic-evaluation-board.svg',
              label: 'RESEARCH EVIDENCE',
              title: 'Heuristic audit board',
              description:
                'The redesign began with a structured review of visibility, consistency, navigation, and user control issues.',
              caption: 'NN/g heuristic evaluation board used to capture friction before UI redesign.',
            },
          ],
        },
        {
          id: 'case-insights',
          navLabel: 'Insights',
          eyebrow: 'RESEARCH / INSIGHTS',
          title: 'Findings that shaped the prototype',
          body:
            'The research pointed toward a practical student dashboard model: fewer competing regions, clearer active states, and stronger planning support.',
          points: [
            'Students needed better “you are here” feedback.',
            'Course pages buried the most important actions and dates.',
            'Help and recovery needed to feel closer to the task, not like a separate website.',
          ],
          layout: 'grid',
          media: [
            {
              file: 'case-studies/d2l/heuristic-evaluation-board.svg',
              label: 'SYNTHESIS',
              title: 'Patterns from the audit',
              description: 'Grouped usability issues became product priorities for the redesign.',
            },
            {
              label: 'INSIGHT CARDS',
              title: 'Interview themes',
              description:
                'Add a compact visual of student quotes, pain points, or grouped research themes.',
            },
          ],
        },
        {
          id: 'case-flow',
          navLabel: 'Flow / IA',
          eyebrow: 'INFORMATION ARCHITECTURE',
          title: 'A simpler product structure',
          body:
            'I organized the prototype around the routes students would use most often: dashboard, courses, course detail, calendar, settings, and help.',
          layout: 'grid',
          media: [
            {
              file: 'case-studies/d2l/wireframes-and-sketches.svg',
              href: d2lFigmaNode('123-2'),
              label: 'USER FLOW',
              title: 'Dashboard to course action',
              description:
                'The student task flow maps how learners move from opening D2L to selecting a course, finding assignments, uploading a file, and confirming submission.',
            },
            {
              href: d2lFigmaNode('160-2'),
              label: 'IA MODEL',
              title: 'Sketches and early structure',
              description:
                'Moodboards and sketches helped shape the calm, organized visual direction before high-fidelity screens.',
            },
          ],
        },
        {
          id: 'case-wireframes',
          navLabel: 'Wireframes',
          eyebrow: 'WIREFRAMES / EXPLORATION',
          title: 'Structure before polish',
          body:
            'Early wireframes focused on hierarchy: what should be visible first, which actions belong together, and how much context a student needs at each step.',
          layout: 'grid',
          media: [
            {
              file: 'case-studies/d2l/wireframes-and-sketches.svg',
              label: 'WIREFRAMES',
              title: 'Early layout exploration',
              description:
                'Sketches and wireframes helped separate course planning, content discovery, and settings into clearer surfaces.',
            },
            {
              label: 'ITERATION',
              title: 'Hierarchy changes',
              description:
                'Add a before/after frame showing how the layout became easier to scan.',
            },
          ],
        },
        {
          id: 'case-final-ui',
          navLabel: 'Final UI',
          eyebrow: 'FINAL UI',
          title: 'Final student prototype screens',
          body:
            'The final prototype focuses on a realistic student assignment flow: enter a course, review assignment details, add a file, choose the file, and receive a clear confirmation state.',
          layout: 'grid',
          media: [
            {
              file: 'case-studies/d2l/final-ui-course-home.svg',
              href: d2lFigmaNode('354-726'),
              label: 'COURSE HOME',
              title: 'Course landing page',
              description:
                'Announcements and upcoming content sit side by side so students can quickly understand what changed and what needs attention.',
              caption:
                'Final hi-fi course screen from the student prototype. The layout prioritizes course updates and recent assignments.',
            },
            {
              file: 'case-studies/d2l/final-ui-upload-overlay.svg',
              href: d2lFigmaNode('378-486'),
              label: 'UPLOAD OVERLAY',
              title: 'Add file interaction',
              description:
                'The upload modal keeps students in context while giving clear actions: add file, cancel, or submit.',
              caption:
                'The overlay reduces page switching and makes the upload task feel like one focused action.',
            },
            {
              file: 'case-studies/d2l/final-ui-finder.svg',
              href: d2lFigmaNode('376-782'),
              label: 'FILE PICKER',
              title: 'Finder-style file selection',
              description:
                'A simplified finder pattern supports recognition over recall by showing familiar file locations and file names.',
              caption:
                'The file picker models the moment where the student chooses a project file before submitting.',
            },
            {
              file: 'case-studies/d2l/final-ui-confirmation.svg',
              href: d2lFigmaNode('299-763'),
              label: 'CONFIRMATION',
              title: 'Submission success state',
              description:
                'A clear confirmation message closes the loop and reassures the student that the submission was received.',
              caption:
                'The success state improves feedback and reduces uncertainty after submitting coursework.',
            },
          ],
        },
      ],
      prototype: {
        href: d2lFigmaNode('251-114'),
        title: 'View the final student hi-fi prototype',
        description:
          'The Figma prototype shows the final student assignment flow, including the course home, assignment detail, upload overlay, finder-style file selection, and confirmation state.',
        note: 'Opens the Hi-fi Student page in the Team 1 Figma file.',
      },
      researchBlock: {
        title: 'Research & evaluation',
        intro:
          'Before the React prototype, the team captured real friction with D2L using Nielsen Norman heuristic worksheets, cross-reviewed issues and recommendations, and prepared student interview guides. The Figma file became the single source of truth for “what’s broken” and “what good could look like” — so the redesign isn’t styling for its own sake.',
        methods: [
          'NN/g heuristic evaluation',
          'Team synthesis in Figma',
          'Student interview protocol',
          'Qualitative themes → IA',
        ],
        gallery: [
          {
            file: 'case-studies/d2l/heuristic-evaluation-board.svg',
            alt: 'Heuristic evaluation worksheets and team synthesis from the Figma board',
            caption: 'NN/g heuristic board — structured audit before UI exploration.',
          },
          {
            file: 'case-studies/d2l/wireframes-and-sketches.svg',
            alt: 'Wireframes and early sketches for LMS flows',
            caption: 'Wireframes & sketches — structure before high-fidelity UI.',
          },
        ],
        mediaNote:
          'Images are part of the site bundle so anyone can view them. Export frames from Figma as PNG/WebP into public/case-studies/d2l/ (replace these placeholders or add entries in projects.js). Full Figma file: Related →.',
        findings: [
          {
            label: 'Visibility & navigation',
            title: '“You are here” was easy to lose',
            body: 'Primary nav did not always read as active after navigation; combined with sparse page headers on some views, students had to recall where they were. The prototype pushes a persistent shell with clearer active states and calmer hierarchy.',
          },
          {
            label: 'Hierarchy & layout',
            title: 'Course home buried what mattered',
            body: 'Research called out weak section priority (e.g. help vs. calendar visibility), awkward column balance, and confusing overlap between “overview” and “content” mental models. The dashboard and course routes reorganize around tasks and time.',
          },
          {
            label: 'Help & documentation',
            title: 'Help felt off-site and generic',
            body: 'Jumping to institutional help broke context. The direction in research: contextual help, clearer recovery paths, and less reliance on recall — reflected in the prototype’s Help route and calmer empty states (where built).',
          },
          {
            label: 'Consistency & efficiency',
            title: 'Mixed patterns and extra steps',
            body: 'Inconsistent iconography and dense tables (e.g. rubrics) increased scan cost; interviews repeated themes of extra clicks for externals, weak shortcuts, and rigid layouts. Search, filters, and a simpler course mental model address those themes in the build.',
          },
          {
            label: 'Flexibility',
            title: 'Students wanted control within constraints',
            body: 'Notes described limited personalization and unclear “bookmark” value. The prototype focuses on fast paths (dashboard, calendar, course) rather than fake customization — honest scope with room for a future “pin” or layout story.',
          },
          {
            label: 'Recognition vs recall',
            title: 'Dense UI demanded memory',
            body: 'When headers and icons drifted, users relied on memory. The redesign emphasizes typographic hierarchy, fewer competing regions, and motion for orientation — not spectacle.',
          },
        ],
        quotes: [
          {
            quote:
              'I really don’t like the blue grouped content page layout — I can’t find anything… I wish there was a quicklink on the D2L homepage to get to the class syllabus and the professor’s information — that’s the part of class I most often need to look back at.',
            attribution: 'Student interview (selected excerpt)',
          },
          {
            quote:
              'If I’m in the content page and want to go to an outer source on the website, I have to click twice… I would prefer something simple and easy to navigate. The bookmark part feels useless.',
            attribution: 'Student interview (selected excerpt)',
          },
        ],
        bridge:
          'These themes directly shaped the prototype: a student-only shell with a legible dashboard, searchable courses, a calendar that supports planning, and settings grouped by intent — plus the Computational Thinking page to show how structure maps to algorithms in code. The Figma board stays the audit trail; the app is the argument.',
      },
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
    year: '2025',
    title: 'Pure Michigan IA / Content Audit',
    summary: 'A content-led restructuring: audit → insights → navigation model → governance-ready taxonomy.',
    role: 'UX / Experience Designer',
    tools: ['Screaming Frog', 'Information Architecture', 'Accessibility', 'Lighthouse'],
    tags: ['Content Strategy', 'IA', 'Audit'],
  },
  {
    slug: 'msu-museum-social-impact',
    year: '2025',
    title: 'MSU Museum / Social Impact Project',
    summary: 'An inclusive storytelling experience designed for access, clarity, and community outcomes.',
    role: 'UX / Experience Designer',
    tools: ['User Research', 'Prototyping', 'Accessibility', 'Figma'],
    tags: ['Social Impact', 'Storytelling', 'Accessibility'],
  },
  {
    slug: 'personal-portfolio-design',
    year: '2026',
    title: 'Personal Portfolio Design',
    summary: 'A cinematic editorial identity with motion, hierarchy, and a premium interaction language.',
    role: 'UX / Experience Designer',
    tools: ['React', 'Framer Motion', 'Tailwind', 'HTML/CSS/JS'],
    tags: ['Brand', 'Motion', 'Frontend'],
  },
  // —— Add more case studies below (drafts stay at the bottom until you publish) ——
  {
    slug: 'design-system-documentation',
    year: '2026',
    title: 'Design system documentation',
    summary:
      'Component specs, usage guidance, and accessibility notes so product teams ship consistently — full case study coming soon.',
    role: 'UX / Experience Designer',
    tools: ['Figma', 'Documentation', 'Accessibility'],
    tags: ['Design systems', 'Documentation'],
    status: 'draft',
  },
  {
    slug: 'public-service-ia',
    year: '2026',
    title: 'Public-facing service IA',
    summary:
      'Task-led navigation and plain-language content for a civic digital service — research and models in progress.',
    role: 'UX / Experience Designer',
    tools: ['User Research', 'IA', 'Figma'],
    tags: ['IA', 'Content', 'Public sector'],
    status: 'draft',
  },
  {
    slug: 'mobile-onboarding-flow',
    year: '2026',
    title: 'Mobile onboarding flow',
    summary:
      'Reducing time-to-value with progressive disclosure, clear permissions, and calm feedback — case study in progress.',
    role: 'UX / Experience Designer',
    tools: ['Figma', 'Prototyping', 'Usability testing'],
    tags: ['Mobile', 'Onboarding', 'UX'],
    status: 'draft',
  },
  {
    slug: 'analytics-dashboard-ux',
    year: '2026',
    title: 'Analytics dashboard UX',
    summary:
      'Dense data made scannable: hierarchy, filters, and accessible charts for everyday decision-making — write-up in progress.',
    role: 'UX / Experience Designer',
    tools: ['Figma', 'Information Architecture', 'Accessibility'],
    tags: ['Data UX', 'Dashboards', 'Complex UI'],
    status: 'draft',
  },
]

/** Published projects first, then drafts — stable within each group. */
export function getProjectsOrdered() {
  const pub = projects.filter((p) => p.status !== 'draft')
  const draft = projects.filter((p) => p.status === 'draft')
  return [...pub, ...draft]
}

export function getPublishedProjects() {
  return projects.filter((p) => p.status !== 'draft')
}

export function getDraftProjects() {
  return projects.filter((p) => p.status === 'draft')
}

/** Unique tags from published projects, sorted — for /projects filters. */
export function getPublishedProjectTags() {
  const tags = new Set()
  getPublishedProjects().forEach((p) => {
    p.tags?.forEach((t) => tags.add(t))
  })
  return Array.from(tags).sort((a, b) => a.localeCompare(b))
}

export function getProject(slug) {
  return projects.find((p) => p.slug === slug) ?? null
}
