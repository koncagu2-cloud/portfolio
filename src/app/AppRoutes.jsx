import { AnimatePresence } from 'framer-motion'
import { useLocation, Routes, Route } from 'react-router-dom'
import { SiteLayout } from '../components/SiteLayout.jsx'
import { Home } from '../pages/Home.jsx'
import { About } from '../pages/About.jsx'
import { Projects } from '../pages/Projects.jsx'
import { ProjectDetail } from '../pages/ProjectDetail.jsx'
import { Resume } from '../pages/Resume.jsx'
import { Contact } from '../pages/Contact.jsx'
import { NotFound } from '../pages/NotFound.jsx'
import { StrengthDetail } from '../pages/StrengthDetail.jsx'

export function AppRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<SiteLayout />}>
          <Route index element={<Home />} />
          <Route path="about/strengths/:slug" element={<StrengthDetail />} />
          <Route path="about" element={<About />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:slug" element={<ProjectDetail />} />
          <Route path="resume" element={<Resume />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

