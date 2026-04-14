# Suleyman Koncagul — Portfolio

Modern personal portfolio built with **React + Vite**, **Tailwind CSS**, **Framer Motion**, and **React Router**.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Content updates

- Add your resume PDF at `public/resume.pdf` (the Resume page links to it).
- Update contact links in `src/pages/Contact.jsx`.
- Edit project content in `src/data/projects.js`.

## Deployment (GitHub Pages)

This repo deploys automatically on every push to `main` via `.github/workflows/deploy.yml`.

- **Project URL (default)**: `https://<username>.github.io/<repo>/`
- **Vite base path**: In CI we set `VITE_BASE=/<repo>/` so assets and routes resolve correctly on GitHub Pages.

## Custom domain (when you buy one)

Two common options:

- **Option A (recommended)**: Deploy with **Vercel** (or Netlify) and attach your domain there.
  - Pros: easiest HTTPS + routing + performance.
- **Option B**: Keep **GitHub Pages** and connect the domain in the repo’s GitHub Pages settings.
  - When using a custom domain at the root (e.g. `example.com`), set `VITE_BASE=/` for the build.

To switch the build base for GitHub Actions, update the `Build` step env var in `.github/workflows/deploy.yml`:

```bash
VITE_BASE=/
```
