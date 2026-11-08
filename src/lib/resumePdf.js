/** Client-side PDF from the print pane — no static file URLs (works with GitHub Pages + SPA). */

export function getResumePdfOptions() {
  return {
    margin: [0.45, 0.45, 0.45, 0.45],
    filename: 'Suleyman-Koncagul-Resume.pdf',
    image: { type: 'jpeg', quality: 0.92 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      letterRendering: true,
      scrollX: 0,
      scrollY: 0,
      /** html2canvas can still touch parent styles; avoid oklch from the page theme */
      onclone: (clonedDoc) => {
        const b = clonedDoc.body
        if (b) {
          b.style.background = '#ffffff'
          b.style.backgroundImage = 'none'
        }
      },
    },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    pagebreak: { mode: ['css', 'legacy'] },
  }
}

/**
 * html2canvas is more reliable when the node is in the viewport (not miles off-screen).
 * @param {HTMLElement} element
 * @param {() => Promise<void>} fn
 */
async function withVisibleCapturePane(element, fn) {
  const s = element.style
  const prev = {
    position: s.position,
    left: s.left,
    top: s.top,
    zIndex: s.zIndex,
    opacity: s.opacity,
  }
  s.position = 'fixed'
  s.left = '0'
  s.top = '0'
  s.zIndex = '2147483646'
  s.opacity = '0.01'
  try {
    await fn()
  } finally {
    s.position = prev.position
    s.left = prev.left
    s.top = prev.top
    s.zIndex = prev.zIndex
    s.opacity = prev.opacity
  }
}

/**
 * @param {HTMLElement} element
 */
export async function downloadResumePdf(element) {
  const html2pdf = (await import('html2pdf.js')).default
  const opt = getResumePdfOptions()
  await withVisibleCapturePane(element, () => html2pdf().set(opt).from(element).save())
}

/**
 * @param {HTMLElement} element
 */
export async function openResumePdfInNewTab(element) {
  const html2pdf = (await import('html2pdf.js')).default
  const opt = getResumePdfOptions()
  const blob = await withVisibleCapturePane(element, () =>
    html2pdf().set(opt).from(element).outputPdf('blob'),
  )
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank')
  if (!win) {
    URL.revokeObjectURL(url)
    throw new Error('Popup blocked — allow popups for this site, or use Download PDF.')
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 120_000)
}
