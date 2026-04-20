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

- Résumé layout lives in `src/components/resume/ResumeDesign.jsx` + `src/styles/resume-design.css`; the Resume page generates a PDF in the browser from that layout.
- Update contact links in `src/pages/Contact.jsx`.
- Edit project content in `src/data/projects.js`.

## Deployment (GitHub Pages)

This repo deploys automatically on every push to `main` via `.github/workflows/deploy.yml`.

- **Custom domain (default)**: CI builds with **`VITE_BASE=/`** so **`https://suleymankoncagul.com`** loads correctly.
- **GitHub.io project URL only**: If you need `https://<user>.github.io/<repo>/`, set repository variable **`VITE_BASE`** to **`/<repo>/`** (e.g. `/portfolio/`).

## Custom domain (GitHub Pages + DNS)

1. Point DNS at GitHub (see **`docs/DNS-CLOUDFLARE.md`** for A/AAAA/CNAME records).
2. **GitHub → repo → Settings → Pages → Custom domain** — add **`suleymankoncagul.com`**, wait for **DNS check** ✓, enable **Enforce HTTPS** when ready.
3. **`public/CNAME`** in this repo keeps the domain on deploy; push to `main` so Actions publishes.
4. Optional **`www`**: add **`www.suleymankoncagul.com`** in Pages and a CNAME in DNS, or redirect **www → apex** in your DNS host.

Alternatively, deploy on **Vercel/Netlify** and attach the domain there if you prefer.
