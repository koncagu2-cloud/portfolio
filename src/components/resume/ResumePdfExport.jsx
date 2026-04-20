import { forwardRef } from 'react'
import { ResumeDesign } from './ResumeDesign.jsx'

/** Hidden capture: off-screen but moved into view during html2pdf (see resumePdf.js). */
const captureRoot = {
  position: 'fixed',
  left: 0,
  top: 0,
  zIndex: -1,
  width: '8.5in',
  maxWidth: '100%',
  boxSizing: 'border-box',
  pointerEvents: 'none',
  opacity: 0,
}

const previewRoot = {
  position: 'relative',
  width: '100%',
  maxWidth: '8.5in',
  margin: '0 auto',
  boxSizing: 'border-box',
}

/**
 * Wraps the real resume layout (`ResumeDesign`) for PDF capture / modal preview.
 */
export const ResumePdfDocument = forwardRef(function ResumePdfDocument({ mode = 'capture' }, ref) {
  const isCapture = mode === 'capture'
  const rootStyle = isCapture ? captureRoot : previewRoot

  return (
    <div
      ref={ref}
      data-resume-pdf-export={isCapture ? '' : undefined}
      style={rootStyle}
      aria-hidden={isCapture}
    >
      <ResumeDesign />
    </div>
  )
})

/** @deprecated */
export const ResumePdfExport = ResumePdfDocument
