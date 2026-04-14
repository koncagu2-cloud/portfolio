import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(() => {
  // GitHub Pages project sites live under "/<repo>/". A custom domain usually serves from "/".
  // We drive this via an env var so the same codebase can deploy to either without edits.
  const base = process.env.VITE_BASE ?? '/portfolio/'

  return {
    base,
    plugins: [react()],
  }
})
