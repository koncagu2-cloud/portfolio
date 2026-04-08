import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './AppRoutes.jsx'
import { CursorGlow } from '../components/ui/CursorGlow.jsx'
import { IntroReveal } from '../components/ui/IntroReveal.jsx'
import { AmbientField } from '../components/ui/AmbientField.jsx'

export default function App() {
  // GitHub Pages SPA fallback: 404.html redirects to /?/<path>
  // Convert that back into a normal pathname once on app load.
  if (typeof window !== 'undefined' && window.location.search.startsWith('?/')) {
    const newPath = window.location.search.slice(1).replace(/&/g, '?')
    const cleanUrl = window.location.pathname.replace(/\/$/, '') + newPath + window.location.hash
    window.history.replaceState(null, '', cleanUrl)
  }

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div className="grain relative min-h-dvh bg-transparent">
        <AmbientField />
        <CursorGlow />
        <IntroReveal />
        <AppRoutes />
      </div>
    </BrowserRouter>
  )
}

