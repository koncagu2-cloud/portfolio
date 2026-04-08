import { Outlet } from 'react-router-dom'
import { Navbar } from './ui/Navbar.jsx'
import { Footer } from './ui/Footer.jsx'
import { ScrollProgress } from './ui/ScrollProgress.jsx'

export function SiteLayout() {
  return (
    <div className="relative z-[1]">
      <Navbar />
      <ScrollProgress />
      <main className="mx-auto w-full max-w-6xl px-5 pb-28 pt-28 sm:px-8 sm:pb-36 sm:pt-32">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

