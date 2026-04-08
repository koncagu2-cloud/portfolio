import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './AppRoutes.jsx'
import { CursorGlow } from '../components/ui/CursorGlow.jsx'
import { IntroReveal } from '../components/ui/IntroReveal.jsx'
import { AmbientField } from '../components/ui/AmbientField.jsx'

export default function App() {
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

