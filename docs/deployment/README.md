# Production deployment

The portfolio is published from `main` in `koncagu2-cloud/portfolio` with GitHub Pages Actions. The existing domain is `https://suleymankoncagul.com`; `public/CNAME` keeps that mapping in the Pages artifact. A push to `main` runs checks, creates an indexable Astro static build, and deploys `dist/`.

## Local commands

- Install: `pnpm install --frozen-lockfile`
- Check source: `pnpm run check`
- Validate content/provenance: `pnpm run test:content`
- Review build: `pnpm run build` (non-indexable)
- Release build: `SITE_INDEXABLE=true pnpm run build`
- Production metadata checks: `SITE_INDEXABLE=true pnpm exec playwright test tests/browser/production.spec.ts`
- Preview: `pnpm run preview --host 127.0.0.1 --port 4323 --ignore-lock`

Only the generated `dist/` directory is published by the workflow. The root base path is required for the custom domain. Static deep routes and `404.html` are part of the output.

## Rollback

The live React/Vite site was at `koncagu2-cloud/portfolio` commit `27c378ef9a2c473ce6b04b57ff98dd0501d1b490` before replacement. If the Astro deployment fails acceptance checks, revert the migration commit on `main` so the existing Pages workflow is restored and redeploys the prior site. Do not change DNS for this rollback.

## Host limitations

GitHub Pages provides HTTPS and static files but does not install arbitrary HTTP security, caching or compression headers from repository files. `security-headers.json` and `headers.example` are inert examples, not deployed policy. The site does not rely on them as an authentication or access-control boundary. Verify the published hostname, deep routes, resume download, demos and response codes after each release.

The indexable build includes the homepage and four case studies. D2L and Community Spaces source-material public-use permission was confirmed by the portfolio owner on 2026-11-08. Project records continue to disclose collaborative attribution, prototype limitations and unvalidated outcomes.
