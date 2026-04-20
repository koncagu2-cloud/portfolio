import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(() => {
  // GitHub Pages project sites live under "/<repo>/". A custom domain usually serves from "/".
  // We drive this via an env var so the same codebase can deploy to either without edits.
  // Default `/` for custom domain at site root. Set VITE_BASE=/portfolio/ only if you use https://<user>.github.io/<repo>/
  const base = process.env.VITE_BASE ?? '/'
  return {
    base,
    plugins: [react()],
  }
})
