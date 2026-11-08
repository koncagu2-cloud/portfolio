# Suleyman Koncagul — UX / Product Design Portfolio

Astro portfolio for **suleymankoncagul.com**. The site pairs an editorial case-study portfolio with the single-page Through My Eyes experience and its four interactive project perspectives.

## Run locally

Use Node 24.22.1 and pnpm 11.25.0:

```sh
pnpm install --frozen-lockfile
pnpm run dev --host 127.0.0.1 --port 4333
```

- Portfolio: `http://127.0.0.1:4333/`
- Through My Eyes: `http://127.0.0.1:4333/experiments/through-my-eyes-live/`

The default local build is a non-indexable review build. A public release build uses `SITE_INDEXABLE=true pnpm run build`.

## Checks

```sh
pnpm run check
pnpm run test:content
pnpm exec playwright test
```

Browser tests start their own preview on port 4322. The test suite includes WebGL-dependent experience checks; software-rendered/headless runs can be slower than normal interactive use.

## Publishing

The `main` branch of the `koncagu2-cloud/portfolio` repository deploys to GitHub Pages through `.github/workflows/deploy.yml`. The custom domain is kept in `public/CNAME`. The workflow runs Astro checks and content validation, builds with indexing enabled, then deploys the generated `dist/` artifact. GitHub Pages serves the static site but does not apply the optional response-header examples in `docs/deployment/`.

The production case studies distinguish collaborative work, independent concepts, prototype behavior, AI assistance, evidence limits and untested outcomes. Publication permission for included D2L and Community Spaces source material was confirmed by the portfolio owner on 2026-11-08.
