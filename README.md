# Suleyman Koncagul Portfolio

Personal UX and frontend portfolio for showcasing case studies, interaction design, and frontend implementation work.

Live site:

https://suleymankoncagul.com

## About

This portfolio presents my work as a UX / Frontend student, with a focus on information architecture, accessibility, visual hierarchy, interaction design, and system thinking.

The site is built as a modern React portfolio with project pages, case study content, animated transitions, and responsive layouts.

## Tech Stack

- React
- Vite
- Tailwind CSS
- React Router
- Framer Motion
- GitHub Pages
- GitHub Actions

## Project Structure

```text
src/
├── app/          # App shell and routes
├── components/   # Reusable UI and layout components
├── data/         # Portfolio project data and site content
├── hooks/        # Custom React hooks
├── lib/          # Utility functions
├── pages/        # Main site pages and case study pages
├── styles/       # Global styles and design helpers
└── assets/       # Images and visual assets
```

## UX Focus

This portfolio is designed to communicate both design thinking and implementation ability.

Key focus areas include:

- Clear information architecture
- Recruiter-friendly project navigation
- Accessible focus states and readable hierarchy
- Responsive layouts for desktop and mobile
- Case-study structure that connects research, process, and outcomes
- Motion used to support orientation, not distract from content

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm run preview
```

## Deployment

The site deploys through GitHub Actions to GitHub Pages.

The custom domain is configured with:

```text
public/CNAME
```

Current domain:

```text
suleymankoncagul.com
```

## Content Updates

- Project content lives in `src/data/projects.js`
- Main pages live in `src/pages`
- Reusable sections/components live in `src/components`
- Global design styles live in `src/styles/globals.css`

## Notes

This repository is focused on portfolio presentation, clarity, and maintainability rather than unnecessary complexity.

