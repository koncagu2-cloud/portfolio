import { useParams } from 'react-router-dom'
import { Page } from '../components/motion/Page.jsx'
import { StrengthDetailLayout } from '../components/strengths/StrengthDetailLayout.jsx'
import { getStrength } from '../data/strengths.js'
import { NotFound } from './NotFound.jsx'

export function StrengthDetail() {
  const { slug } = useParams()
  const data = slug ? getStrength(slug) : null

  if (!data) {
    return <NotFound />
  }

  return (
    <Page>
      <StrengthDetailLayout {...data} />
    </Page>
  )
}
