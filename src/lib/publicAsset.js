/** Resolve a path under Vite `public/` for use in <img src>. */
export function publicAsset(path) {
  const clean = String(path).replace(/^\//, '')
  const base = import.meta.env.BASE_URL
  return base.endsWith('/') ? `${base}${clean}` : `${base}/${clean}`
}
