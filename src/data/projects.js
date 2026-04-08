export const projects = [
  {
    slug: 'd2l-redesign',
    title: 'D2L Redesign',
    summary: 'A modernized learning experience with clearer IA, calmer UI, and purposeful motion.',
    role: 'UX / Experience Designer',
    tools: ['Figma', 'User Research', 'Information Architecture', 'Accessibility'],
    tags: ['Product UX', 'IA', 'Design Systems'],
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

